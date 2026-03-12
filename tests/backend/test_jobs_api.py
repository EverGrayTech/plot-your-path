"""Integration tests for the Jobs API endpoints."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app
from backend.models.application_material import ApplicationMaterial
from backend.models.application_ops import ApplicationOps
from backend.models.company import Company
from backend.models.desirability_factor_config import DesirabilityFactorConfig
from backend.models.desirability_score_result import DesirabilityScoreResult
from backend.models.interview_stage_event import InterviewStageEvent
from backend.models.outcome_event import OutcomeEvent
from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.models.role_skill import RoleSkill
from backend.models.role_status_change import RoleStatusChange
from backend.models.skill import Skill

# ---------------------------------------------------------------------------
# In-memory SQLite test database (shared via StaticPool)
# ---------------------------------------------------------------------------
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Dependency override that uses the test in-memory database."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def setup_db():
    """Create and tear down tables around each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """TestClient with the DB dependency overridden."""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def db():
    """SQLAlchemy session for pre-populating test data."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def sample_company(db):
    """Create a Company record in the test DB."""
    company = Company(name="Acme Corp", slug="acme-corp")
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@pytest.fixture
def sample_role(db, sample_company):
    """Create a Role record linked to sample_company."""
    role = Role(
        company_id=sample_company.id,
        title="Software Engineer",
        team_division="Platform",
        salary_min=120000,
        salary_max=180000,
        salary_currency="USD",
        url="https://greenhouse.io/jobs/12345",
        raw_html_path="data/jobs/raw/acme-corp/1.html",
        cleaned_md_path="data/jobs/cleaned/acme-corp/1.md",
        status="open",
    )
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@pytest.fixture
def sample_skills(db, sample_role):
    """Create Skill and RoleSkill records linked to sample_role."""
    python_skill = Skill(name="Python", category="language")
    db.add(python_skill)
    db.flush()

    ts_skill = Skill(name="TypeScript", category="language")
    db.add(ts_skill)
    db.flush()

    db.add(
        RoleSkill(role_id=sample_role.id, skill_id=python_skill.id, requirement_level="required")
    )
    db.add(RoleSkill(role_id=sample_role.id, skill_id=ts_skill.id, requirement_level="preferred"))
    db.commit()
    return [python_skill, ts_skill]


# ---------------------------------------------------------------------------
# Helper: canonical LLM job data response
# ---------------------------------------------------------------------------

SAMPLE_JOB_DATA = {
    "title": "Backend Engineer",
    "company": "TechCo",
    "team_division": "Infrastructure",
    "salary_min": 130000,
    "salary_max": 170000,
    "salary_currency": "USD",
    "required_skills": ["Python", "FastAPI", "Docker"],
    "preferred_skills": ["Kubernetes", "Go"],
}


# ---------------------------------------------------------------------------
# Tests: GET /api/jobs
# ---------------------------------------------------------------------------


class TestListJobs:
    """Tests for GET /api/jobs."""

    def test_list_empty(self, client):
        """Empty list returned when no jobs have been captured."""
        response = client.get("/api/jobs")
        assert response.status_code == 200
        assert response.json() == []

    def test_list_returns_jobs(self, client, sample_role, sample_company, sample_skills):
        """Jobs list includes captured roles with correct fields."""
        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        job = data[0]
        assert job["id"] == sample_role.id
        assert job["company"] == "Acme Corp"
        assert job["title"] == "Software Engineer"
        assert job["skills_count"] == 2
        assert job["status"] == "open"
        assert job["fit_score"] is None
        assert job["fit_recommendation"] is None
        assert job["desirability_score"] is None
        assert job["current_interview_stage"] is None
        assert job["deadline_at"] is None
        assert job["next_action_at"] is None
        assert job["needs_attention"] is True
        assert "$120,000 - $180,000 USD" in job["salary_range"]

    def test_list_includes_latest_fit_signal(self, client, db, sample_role, sample_skills):
        db.add(
            RoleFitAnalysis(
                role_id=sample_role.id,
                fit_score=82,
                recommendation="go",
                covered_required_skills=["Python"],
                missing_required_skills=[],
                covered_preferred_skills=[],
                missing_preferred_skills=["TypeScript"],
                rationale="Strong role fit.",
                provider="openai",
                model="gpt-4o",
                version="fit-v1",
            )
        )
        db.commit()

        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert data[0]["fit_score"] == 82
        assert data[0]["fit_recommendation"] == "go"
        assert data[0]["desirability_score"] is None

    def test_list_includes_latest_desirability_signal(self, client, db, sample_role, sample_skills):
        db.add(
            DesirabilityScoreResult(
                company_id=sample_role.company_id,
                role_id=sample_role.id,
                total_score=7.4,
                factor_breakdown=[
                    {
                        "factor_id": 1,
                        "factor_name": "Culture",
                        "weight": 1.0,
                        "score": 7,
                        "reasoning": "Strong team satisfaction indicators.",
                    }
                ],
                provider="openai",
                model="gpt-4o",
                version="desirability-v1",
            )
        )
        db.commit()

        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert data[0]["desirability_score"] == pytest.approx(7.4)

    def test_list_no_salary_returns_none(self, db, client, sample_company):
        """Jobs without salary info return null salary_range."""
        role = Role(
            company_id=sample_company.id,
            title="Intern",
            url="https://example.com/intern",
            raw_html_path="data/jobs/raw/acme-corp/2.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/2.md",
            status="open",
        )
        db.add(role)
        db.commit()

        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        intern = next(j for j in data if j["title"] == "Intern")
        assert intern["salary_range"] is None

    def test_list_salary_min_only(self, db, client, sample_company):
        """Roles with only salary_min show a 'X+' range string."""
        role = Role(
            company_id=sample_company.id,
            title="Senior Dev",
            salary_min=150000,
            salary_currency="USD",
            url="https://example.com/senior",
            raw_html_path="data/jobs/raw/acme-corp/3.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/3.md",
            status="open",
        )
        db.add(role)
        db.commit()

        response = client.get("/api/jobs")
        data = response.json()
        senior = next(j for j in data if j["title"] == "Senior Dev")
        assert "$150,000+" in senior["salary_range"]

    def test_list_salary_max_only(self, db, client, sample_company):
        """Roles with only salary_max show an 'Up to X' range string."""
        role = Role(
            company_id=sample_company.id,
            title="Junior Dev",
            salary_max=90000,
            salary_currency="USD",
            url="https://example.com/junior",
            raw_html_path="data/jobs/raw/acme-corp/4.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/4.md",
            status="open",
        )
        db.add(role)
        db.commit()

        response = client.get("/api/jobs")
        data = response.json()
        junior = next(j for j in data if j["title"] == "Junior Dev")
        assert "Up to $90,000" in junior["salary_range"]

    def test_list_non_usd_currency(self, db, client, sample_company):
        """Non-USD currency shows currency code without dollar sign."""
        role = Role(
            company_id=sample_company.id,
            title="EU Engineer",
            salary_min=80000,
            salary_max=100000,
            salary_currency="EUR",
            url="https://example.com/eu",
            raw_html_path="data/jobs/raw/acme-corp/5.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/5.md",
            status="open",
        )
        db.add(role)
        db.commit()

        response = client.get("/api/jobs")
        data = response.json()
        eu = next(j for j in data if j["title"] == "EU Engineer")
        assert "EUR" in eu["salary_range"]
        assert "$" not in eu["salary_range"]


# ---------------------------------------------------------------------------
# Tests: GET /api/jobs/{id}
# ---------------------------------------------------------------------------


class TestGetJob:
    """Tests for GET /api/jobs/{role_id}."""

    def test_get_not_found(self, client):
        """Returns 404 when role does not exist."""
        response = client.get("/api/jobs/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Job not found"

    def test_get_job_no_file(self, client, sample_role, sample_skills):
        """Returns 200 with empty description when Markdown file is missing."""
        response = client.get(f"/api/jobs/{sample_role.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_role.id
        assert data["title"] == "Software Engineer"
        assert data["company"]["name"] == "Acme Corp"
        assert data["description_md"] == ""
        required_names = {item["name"] for item in data["skills"]["required"]}
        preferred_names = {item["name"] for item in data["skills"]["preferred"]}
        assert "Python" in required_names
        assert "TypeScript" in preferred_names
        assert data["salary"]["min"] == 120000
        assert data["salary"]["max"] == 180000
        assert data["status_history"] == []
        assert data["application_ops"] is None
        assert data["interview_stage_timeline"] == []
        assert data["latest_fit_analysis"] is None
        assert data["latest_desirability_score"] is None

    def test_get_job_includes_latest_fit_analysis(self, client, db, sample_role, sample_skills):
        db.add(
            RoleFitAnalysis(
                role_id=sample_role.id,
                fit_score=55,
                recommendation="maybe",
                covered_required_skills=["Python"],
                adjacent_required_skills=["PySpark"],
                missing_required_skills=[],
                covered_preferred_skills=[],
                adjacent_preferred_skills=["JavaScript"],
                missing_preferred_skills=["TypeScript"],
                rationale="Potential fit with minor gaps.",
                fallback_used=True,
                confidence_label="medium",
                provider="openai",
                model="gpt-4o",
                version="fit-v1",
            )
        )
        db.commit()

        response = client.get(f"/api/jobs/{sample_role.id}")
        assert response.status_code == 200
        analysis = response.json()["latest_fit_analysis"]
        assert analysis is not None
        assert analysis["fit_score"] == 55
        assert analysis["recommendation"] == "maybe"
        assert analysis["adjacent_required_skills"] == ["PySpark"]
        assert analysis["adjacent_preferred_skills"] == ["JavaScript"]
        assert analysis["fallback_used"] is True
        assert analysis["confidence_label"] == "medium"

    def test_get_job_includes_latest_desirability(self, client, db, sample_role, sample_skills):
        db.add(
            DesirabilityScoreResult(
                company_id=sample_role.company_id,
                role_id=sample_role.id,
                total_score=6.9,
                factor_breakdown=[
                    {
                        "factor_id": 1,
                        "factor_name": "Culture",
                        "weight": 0.5,
                        "score": 7,
                        "reasoning": "Positive culture evidence.",
                        "fallback_used": False,
                    },
                    {
                        "factor_id": 2,
                        "factor_name": "Reputation",
                        "weight": 0.5,
                        "score": 6,
                        "reasoning": "Solid but mixed external brand signals.",
                        "fallback_used": True,
                    },
                ],
                score_scope="company",
                fallback_used=True,
                cache_expires_at=datetime.now(UTC).replace(tzinfo=None) + timedelta(days=7),
                provider="openai",
                model="gpt-4o",
                version="desirability-v1",
            )
        )
        db.commit()

        response = client.get(f"/api/jobs/{sample_role.id}")
        assert response.status_code == 200
        payload = response.json()["latest_desirability_score"]
        assert payload is not None
        assert payload["total_score"] == pytest.approx(6.9)
        assert len(payload["factor_breakdown"]) == 2
        assert payload["score_scope"] == "company"
        assert payload["fallback_used"] is True
        assert payload["is_stale"] is False
        assert payload["factor_breakdown"][1]["fallback_used"] is True

    def test_get_job_includes_status_history(self, client, db, sample_role):
        db.add(
            RoleStatusChange(
                role_id=sample_role.id,
                from_status="open",
                to_status="submitted",
            )
        )
        db.add(
            RoleStatusChange(
                role_id=sample_role.id,
                from_status="submitted",
                to_status="interviewing",
            )
        )
        db.commit()

        response = client.get(f"/api/jobs/{sample_role.id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data["status_history"]) == 2
        assert data["status_history"][0]["from_status"] == "open"
        assert data["status_history"][0]["to_status"] == "submitted"
        assert data["status_history"][1]["from_status"] == "submitted"
        assert data["status_history"][1]["to_status"] == "interviewing"

    def test_get_job_with_file(self, client, db, sample_role, sample_skills):
        """Returns Markdown content when the cleaned file exists on disk."""
        with (
            patch("backend.services.job_presenters.file_exists", return_value=True),
            patch(
                "backend.services.job_presenters.load_file",
                return_value="# Backend Engineer\n\nGreat role!",
            ),
        ):
            response = client.get(f"/api/jobs/{sample_role.id}")

        assert response.status_code == 200
        assert response.json()["description_md"] == "# Backend Engineer\n\nGreat role!"

    def test_get_job_team_division(self, client, sample_role):
        """Team division is included in detail response."""
        response = client.get(f"/api/jobs/{sample_role.id}")
        assert response.status_code == 200
        assert response.json()["team_division"] == "Platform"


# ---------------------------------------------------------------------------
# Tests: PATCH /api/jobs/{id}/status
# ---------------------------------------------------------------------------


class TestUpdateJobStatus:
    """Tests for PATCH /api/jobs/{role_id}/status."""

    def test_update_status_not_found(self, client):
        """Returns 404 when role does not exist."""
        response = client.patch("/api/jobs/999/status", json={"status": "submitted"})
        assert response.status_code == 404

    def test_update_status_success(self, client, sample_role):
        """Status is updated and new value returned in response."""
        response = client.patch(f"/api/jobs/{sample_role.id}/status", json={"status": "submitted"})
        assert response.status_code == 200
        assert response.json()["status"] == "submitted"
        assert response.json()["fit_score"] is None
        assert response.json()["fit_recommendation"] is None

    def test_update_status_records_change(self, client, db, sample_role):
        response = client.patch(f"/api/jobs/{sample_role.id}/status", json={"status": "submitted"})
        assert response.status_code == 200

        events = (
            db.query(RoleStatusChange)
            .filter(RoleStatusChange.role_id == sample_role.id)
            .order_by(RoleStatusChange.id.asc())
            .all()
        )
        assert len(events) == 1
        assert events[0].from_status == "open"
        assert events[0].to_status == "submitted"

    def test_update_status_noop_does_not_record_change(self, client, db, sample_role):
        response = client.patch(f"/api/jobs/{sample_role.id}/status", json={"status": "open"})
        assert response.status_code == 200

        events = db.query(RoleStatusChange).filter(RoleStatusChange.role_id == sample_role.id).all()
        assert events == []

    def test_update_status_invalid_value(self, client, sample_role):
        """Invalid status value returns 422 validation error."""
        response = client.patch(
            f"/api/jobs/{sample_role.id}/status", json={"status": "invalid_status"}
        )
        assert response.status_code == 422

    def test_update_status_all_valid_values(self, client, sample_role):
        """All valid status values are accepted."""
        for status in ("open", "submitted", "interviewing", "rejected"):
            response = client.patch(f"/api/jobs/{sample_role.id}/status", json={"status": status})
            assert response.status_code == 200
            assert response.json()["status"] == status


class TestApplicationOps:
    """Tests for application-ops and interview-stage endpoints."""

    def test_upsert_and_get_application_ops(self, client, sample_role):
        payload = {
            "applied_at": "2099-03-01T09:00:00",
            "deadline_at": "2099-03-10T17:00:00",
            "source": "LinkedIn",
            "recruiter_contact": "recruiter@example.com",
            "notes": "Initial submission completed.",
            "next_action_at": "2099-03-15T09:00:00",
        }
        put_response = client.put(f"/api/jobs/{sample_role.id}/application-ops", json=payload)
        assert put_response.status_code == 200
        put_data = put_response.json()
        assert put_data["role_id"] == sample_role.id
        assert put_data["source"] == "LinkedIn"
        assert put_data["needs_attention"] is False

        get_response = client.get(f"/api/jobs/{sample_role.id}/application-ops")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["recruiter_contact"] == "recruiter@example.com"
        assert get_data["notes"] == "Initial submission completed."

    def test_application_ops_normalizes_offset_datetimes_to_naive_utc(self, client, sample_role):
        response = client.put(
            f"/api/jobs/{sample_role.id}/application-ops",
            json={
                "applied_at": "2099-03-01T09:00:00-05:00",
                "deadline_at": "2099-03-10T17:00:00+02:00",
                "next_action_at": "2099-03-15T09:00:00Z",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["applied_at"].startswith("2099-03-01T14:00:00")
        assert data["deadline_at"].startswith("2099-03-10T15:00:00")
        assert data["next_action_at"].startswith("2099-03-15T09:00:00")

    def test_update_next_action_creates_ops_if_missing(self, client, sample_role):
        response = client.patch(
            f"/api/jobs/{sample_role.id}/application-ops/next-action",
            json={"next_action_at": "2099-03-07T10:00:00"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["next_action_at"].startswith("2099-03-07T10:00:00")
        assert data["needs_attention"] is False

    def test_application_ops_404_for_missing_role(self, client):
        response = client.put("/api/jobs/999/application-ops", json={"source": "Referral"})
        assert response.status_code == 404
        assert response.json()["detail"] == "Job not found"

    def test_create_and_list_interview_stage_events(self, client, sample_role):
        create_response = client.post(
            f"/api/jobs/{sample_role.id}/interview-stages",
            json={
                "stage": "recruiter_screen",
                "notes": "30 minute intro call",
                "occurred_at": "2026-03-04T15:00:00",
            },
        )
        assert create_response.status_code == 200
        created = create_response.json()
        assert created["stage"] == "recruiter_screen"
        assert created["notes"] == "30 minute intro call"

        list_response = client.get(f"/api/jobs/{sample_role.id}/interview-stages")
        assert list_response.status_code == 200
        listed = list_response.json()
        assert len(listed) == 1
        assert listed[0]["stage"] == "recruiter_screen"

    def test_interview_stage_normalizes_offset_timestamp_to_naive_utc(self, client, sample_role):
        response = client.post(
            f"/api/jobs/{sample_role.id}/interview-stages",
            json={
                "stage": "recruiter_screen",
                "notes": "timezone check",
                "occurred_at": "2026-03-04T15:00:00-05:00",
            },
        )

        assert response.status_code == 200
        assert response.json()["occurred_at"].startswith("2026-03-04T20:00:00")

    def test_pipeline_view_filters_and_counters(self, client, db, sample_company, sample_role):
        role_two = Role(
            company_id=sample_company.id,
            title="Platform Engineer",
            team_division="Core",
            salary_min=140000,
            salary_max=190000,
            salary_currency="USD",
            url="https://example.com/platform-role",
            raw_html_path="data/jobs/raw/acme-corp/22.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/22.md",
            status="submitted",
        )
        db.add(role_two)
        db.flush()

        db.add(
            ApplicationOps(
                role_id=sample_role.id,
                source="LinkedIn",
                next_action_at=datetime(2000, 1, 1, 9, 0, 0),
                deadline_at=datetime(2000, 1, 3, 17, 0, 0),
            )
        )
        db.add(
            ApplicationOps(
                role_id=role_two.id,
                source="Referral",
                next_action_at=None,
                deadline_at=None,
            )
        )
        db.add(
            InterviewStageEvent(
                role_id=sample_role.id,
                stage="technical",
                notes="Panel scheduled",
                occurred_at=datetime(2026, 3, 2, 10, 0, 0),
            )
        )
        db.commit()

        response = client.get("/api/jobs/pipeline")
        assert response.status_code == 200
        payload = response.json()
        assert len(payload["items"]) == 2
        assert payload["counters"]["overdue_actions"] >= 1
        assert payload["counters"]["needs_follow_up"] >= 1

        overdue_only = client.get("/api/jobs/pipeline?overdue_only=true")
        assert overdue_only.status_code == 200
        overdue_payload = overdue_only.json()
        assert len(overdue_payload["items"]) >= 1
        assert all(item["next_action_at"] is not None for item in overdue_payload["items"])

    def test_create_and_list_outcome_events_with_linkage(self, client, db, sample_role):
        fit = RoleFitAnalysis(
            role_id=sample_role.id,
            fit_score=88,
            recommendation="go",
            covered_required_skills=["Python"],
            missing_required_skills=[],
            covered_preferred_skills=["FastAPI"],
            missing_preferred_skills=[],
            rationale="Strong fit and relevant profile evidence.",
            provider="openai",
            model="gpt-4o",
            version="fit-v1",
        )
        db.add(fit)
        db.flush()

        desirability = DesirabilityScoreResult(
            company_id=sample_role.company_id,
            role_id=sample_role.id,
            total_score=7.8,
            factor_breakdown=[],
            provider="openai",
            model="gpt-4o",
            version="desirability-v1",
        )
        db.add(desirability)
        db.flush()

        material = ApplicationMaterial(
            role_id=sample_role.id,
            artifact_type="cover_letter",
            version=1,
            content_path=f"applications/{sample_role.id}/cover_letter-v1.md",
            questions=None,
            provider="openai",
            model="gpt-4o",
            prompt_version="cover-letter-v1",
        )
        db.add(material)
        db.commit()
        db.refresh(fit)
        db.refresh(desirability)
        db.refresh(material)

        create_response = client.post(
            f"/api/jobs/{sample_role.id}/outcomes",
            json={
                "event_type": "offer",
                "occurred_at": "2026-03-09T17:00:00",
                "notes": "Received verbal offer",
                "fit_analysis_id": fit.id,
                "desirability_score_id": desirability.id,
                "application_material_id": material.id,
            },
        )
        assert create_response.status_code == 200
        created = create_response.json()
        assert created["event_type"] == "offer"
        assert created["fit_analysis_id"] == fit.id
        assert created["desirability_score_id"] == desirability.id
        assert created["application_material_id"] == material.id
        assert created["model_family"] == "openai"
        assert created["model"] == "gpt-4o"
        assert created["prompt_version"] == "cover-letter-v1"

        list_response = client.get(f"/api/jobs/{sample_role.id}/outcomes")
        assert list_response.status_code == 200
        listed = list_response.json()
        assert len(listed) == 1
        assert listed[0]["event_type"] == "offer"
        assert listed[0]["notes"] == "Received verbal offer"

    def test_outcome_event_normalizes_offset_timestamp_to_naive_utc(self, client, db, sample_role):
        response = client.post(
            f"/api/jobs/{sample_role.id}/outcomes",
            json={
                "event_type": "screen",
                "occurred_at": "2026-03-09T17:00:00-05:00",
                "notes": "Timezone normalized",
            },
        )

        assert response.status_code == 200
        assert response.json()["occurred_at"].startswith("2026-03-09T22:00:00")

    def test_outcome_event_rejects_cross_role_linkage(
        self, client, db, sample_company, sample_role
    ):
        other_role = Role(
            company_id=sample_company.id,
            title="Different Role",
            team_division="Platform",
            salary_min=110000,
            salary_max=130000,
            salary_currency="USD",
            url="https://example.com/other-role",
            raw_html_path="data/jobs/raw/acme-corp/other-role.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/other-role.md",
            status="open",
        )
        db.add(other_role)
        db.flush()

        material = ApplicationMaterial(
            role_id=other_role.id,
            artifact_type="cover_letter",
            version=1,
            content_path=f"applications/{other_role.id}/cover_letter-v1.md",
            questions=None,
            provider="openai",
            model="gpt-4o",
            prompt_version="cover-letter-v1",
        )
        db.add(material)
        db.commit()

        response = client.post(
            f"/api/jobs/{sample_role.id}/outcomes",
            json={
                "event_type": "screen",
                "occurred_at": "2026-03-08T09:30:00",
                "application_material_id": material.id,
            },
        )
        assert response.status_code == 422
        assert "invalid for this role" in response.json()["detail"]

    def test_outcome_insights_and_tuning_suggestions(self, client, db, sample_role):
        db.add(
            RoleFitAnalysis(
                role_id=sample_role.id,
                fit_score=85,
                recommendation="go",
                covered_required_skills=["Python"],
                missing_required_skills=[],
                covered_preferred_skills=["FastAPI"],
                missing_preferred_skills=[],
                rationale="Strong fit.",
                provider="openai",
                model="gpt-4o",
                version="fit-v1",
            )
        )
        db.add(
            DesirabilityScoreResult(
                company_id=sample_role.company_id,
                role_id=sample_role.id,
                total_score=8.2,
                factor_breakdown=[],
                provider="openai",
                model="gpt-4o",
                version="desirability-v1",
            )
        )
        db.add_all(
            [
                OutcomeEvent(
                    role_id=sample_role.id,
                    event_type="screen",
                    occurred_at=datetime(2026, 3, 8, 10, 0, 0),
                    model_family="openai",
                    model="gpt-4o",
                    prompt_version="cover-letter-v1",
                ),
                OutcomeEvent(
                    role_id=sample_role.id,
                    event_type="offer",
                    occurred_at=datetime(2026, 3, 9, 12, 0, 0),
                    model_family="openai",
                    model="gpt-4o",
                    prompt_version="cover-letter-v1",
                ),
                OutcomeEvent(
                    role_id=sample_role.id,
                    event_type="rejected",
                    occurred_at=datetime(2026, 3, 10, 12, 0, 0),
                    model_family="anthropic",
                    model="claude-3-5-sonnet",
                    prompt_version="cover-letter-v1",
                ),
                OutcomeEvent(
                    role_id=sample_role.id,
                    event_type="offer",
                    occurred_at=datetime(2026, 3, 11, 12, 0, 0),
                    model_family="openai",
                    model="gpt-4o",
                    prompt_version="cover-letter-v1",
                ),
                OutcomeEvent(
                    role_id=sample_role.id,
                    event_type="rejected",
                    occurred_at=datetime(2026, 3, 12, 12, 0, 0),
                    model_family="anthropic",
                    model="claude-3-5-sonnet",
                    prompt_version="cover-letter-v1",
                ),
            ]
        )
        db.commit()

        insights_response = client.get("/api/outcomes/insights")
        assert insights_response.status_code == 200
        insights = insights_response.json()
        assert insights["total_events"] == 5
        assert insights["total_roles_with_outcomes"] == 1
        assert len(insights["conversion_by_fit_band"]) >= 1
        assert len(insights["conversion_by_desirability_band"]) >= 1
        assert len(insights["conversion_by_model_family"]) >= 2

        tuning_response = client.get("/api/outcomes/tuning-suggestions")
        assert tuning_response.status_code == 200
        tuning = tuning_response.json()
        assert tuning["confidence_message"]
        assert len(tuning["suggestions"]) >= 1
        assert tuning["suggestions"][0]["recommendation"]
        assert tuning["suggestions"][0]["reversible_action"]


class TestFitAnalysis:
    """Tests for POST /api/jobs/{role_id}/fit-analysis."""

    def test_fit_analysis_invalid_role_returns_404(self, client):
        response = client.post("/api/jobs/999/fit-analysis")
        assert response.status_code == 404
        assert response.json()["detail"] == "Job not found"

    def test_fit_analysis_generation_success(self, client, sample_role, sample_skills):
        response = client.post(f"/api/jobs/{sample_role.id}/fit-analysis")
        assert response.status_code == 200
        data = response.json()
        assert data["role_id"] == sample_role.id
        assert data["version"] == "fit-v1"
        assert data["recommendation"] in {"go", "maybe", "no-go"}
        assert isinstance(data["covered_required_skills"], list)
        assert isinstance(data["missing_required_skills"], list)

    def test_fit_analysis_includes_traceability_fields(self, client, sample_role, sample_skills):
        traced = SimpleNamespace(
            id=42,
            role_id=sample_role.id,
            fit_score=81,
            recommendation="go",
            covered_required_skills=["Python"],
            adjacent_required_skills=["PySpark"],
            missing_required_skills=[],
            covered_preferred_skills=["FastAPI"],
            adjacent_preferred_skills=["TypeScript"],
            missing_preferred_skills=[],
            rationale="Strong fit.",
            rationale_citations=[
                {
                    "source_type": "career_evidence",
                    "source_id": 10,
                    "source_record_id": "resume.md",
                    "source_key": "experience.delivery",
                    "snippet_reference": "Built API platform",
                    "confidence": 0.92,
                }
            ],
            unsupported_claims=["No direct Kubernetes ownership evidence"],
            fallback_used=True,
            confidence_label="medium",
            provider="openai",
            model="gpt-4o",
            version="fit-v1",
            created_at=datetime.now(UTC),
        )
        with patch(
            "backend.routers.jobs_analysis.FitAnalysisService.generate_for_role",
            return_value=traced,
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/fit-analysis")

        assert response.status_code == 200
        data = response.json()
        assert len(data["rationale_citations"]) == 1
        assert data["rationale_citations"][0]["source_record_id"] == "resume.md"
        assert data["unsupported_claims"] == ["No direct Kubernetes ownership evidence"]
        assert data["adjacent_required_skills"] == ["PySpark"]
        assert data["adjacent_preferred_skills"] == ["TypeScript"]
        assert data["fallback_used"] is True
        assert data["confidence_label"] == "medium"

    def test_fit_analysis_malformed_model_output_returns_422(
        self, client, sample_role, sample_skills
    ):
        with patch(
            "backend.routers.jobs_analysis.FitAnalysisService.generate_for_role",
            side_effect=RuntimeError("malformed model output"),
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/fit-analysis")

        assert response.status_code == 422
        assert "Failed to generate fit analysis" in response.json()["detail"]


class TestDesirabilityScoring:
    """Tests for desirability score generation endpoints."""

    def test_score_desirability_success(self, client, db, sample_role):
        db.add(
            DesirabilityFactorConfig(
                name="Culture",
                prompt="Evaluate culture.",
                weight=1.0,
                is_active=True,
                display_order=0,
            )
        )
        db.commit()

        with patch(
            "backend.services.desirability_scorer.DesirabilityScoringService._score_factor_async",
            new=AsyncMock(return_value=(8, "Great culture signal.", False)),
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/desirability-score")

        assert response.status_code == 200
        data = response.json()
        assert data["role_id"] == sample_role.id
        assert data["total_score"] == pytest.approx(8.0)
        assert data["version"] == "desirability-v1"
        assert data["score_scope"] == "company"
        assert data["fallback_used"] is False
        assert data["is_stale"] is False

    def test_refresh_desirability_recomputes(self, client, db, sample_role):
        db.add(
            DesirabilityFactorConfig(
                name="Culture",
                prompt="Evaluate culture.",
                weight=1.0,
                is_active=True,
                display_order=0,
            )
        )
        db.add(
            DesirabilityScoreResult(
                company_id=sample_role.company_id,
                role_id=sample_role.id,
                total_score=2.0,
                factor_breakdown=[
                    {
                        "factor_id": 1,
                        "factor_name": "Culture",
                        "weight": 1.0,
                        "score": 2,
                        "reasoning": "Old score.",
                    }
                ],
                provider="openai",
                model="gpt-4o",
                version="desirability-v1",
            )
        )
        db.commit()

        with patch(
            "backend.services.desirability_scorer.DesirabilityScoringService._score_factor_async",
            new=AsyncMock(return_value=(9, "Refreshed score.", False)),
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/desirability-score/refresh")

        assert response.status_code == 200
        assert response.json()["total_score"] == pytest.approx(9.0)

    def test_desirability_is_shared_across_roles_in_same_company(self, client, db, sample_role):
        second_role = Role(
            company_id=sample_role.company_id,
            title="Staff Engineer",
            team_division="Platform",
            salary_min=180000,
            salary_max=230000,
            salary_currency="USD",
            url="https://greenhouse.io/jobs/99999",
            raw_html_path="data/jobs/raw/acme-corp/99999.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/99999.md",
            status="open",
        )
        db.add(second_role)
        db.add(
            DesirabilityFactorConfig(
                name="Culture",
                prompt="Evaluate culture.",
                weight=1.0,
                is_active=True,
                display_order=0,
            )
        )
        db.commit()
        db.refresh(second_role)

        with patch(
            "backend.services.desirability_scorer.DesirabilityScoringService._score_factor_async",
            new=AsyncMock(return_value=(7, "Shared company signal.", False)),
        ):
            first = client.post(f"/api/jobs/{sample_role.id}/desirability-score")
        assert first.status_code == 200

        second = client.post(f"/api/jobs/{second_role.id}/desirability-score")
        assert second.status_code == 200
        assert second.json()["id"] == first.json()["id"]
        assert second.json()["total_score"] == pytest.approx(first.json()["total_score"])


class TestApplicationMaterials:
    """Tests for application materials endpoints."""

    def _material_result(self, role_id: int, *, artifact_type: str, version: int = 1):
        created = datetime.now(UTC)
        return SimpleNamespace(
            id=101,
            role_id=role_id,
            artifact_type=artifact_type,
            version=version,
            content_path=f"applications/{role_id}/{artifact_type}-v{version}.md",
            questions=["Why this role?"] if artifact_type == "application_qa" else None,
            provider="openai",
            model="gpt-4o",
            prompt_version="prompt-v1",
            created_at=created,
        )

    def test_generate_cover_letter_success(self, client, sample_role):
        fake_material = self._material_result(sample_role.id, artifact_type="cover_letter")
        fake_material.fallback_used = True

        with (
            patch(
                "backend.routers.jobs_materials.ApplicationMaterialsService.generate_cover_letter",
                return_value=fake_material,
            ),
            patch("backend.services.job_presenters.file_exists", return_value=True),
            patch(
                "backend.services.job_presenters.load_file", return_value="Dear hiring manager..."
            ),
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/application-materials/cover-letter")

        assert response.status_code == 200
        data = response.json()
        assert data["artifact_type"] == "cover_letter"
        assert data["content"] == "Dear hiring manager..."
        assert data["fallback_used"] is True

    def test_generate_cover_letter_includes_traceability_fields(self, client, sample_role):
        fake_material = self._material_result(sample_role.id, artifact_type="cover_letter")
        fake_material.section_traceability = [
            {
                "section_key": "intro",
                "citations": [
                    {
                        "source_type": "career_evidence",
                        "source_id": 7,
                        "source_record_id": "resume.md",
                        "source_key": "experience.platform",
                        "snippet_reference": "Scaled job ingestion pipeline",
                        "confidence": 0.88,
                    }
                ],
                "unsupported_claims": [],
            }
        ]
        fake_material.unsupported_claims = ["Leadership scope not fully evidenced"]
        fake_material.fallback_used = False

        with (
            patch(
                "backend.routers.jobs_materials.ApplicationMaterialsService.generate_cover_letter",
                return_value=fake_material,
            ),
            patch("backend.services.job_presenters.file_exists", return_value=True),
            patch(
                "backend.services.job_presenters.load_file", return_value="Dear hiring manager..."
            ),
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/application-materials/cover-letter")

        assert response.status_code == 200
        data = response.json()
        assert data["section_traceability"][0]["section_key"] == "intro"
        assert data["unsupported_claims"] == ["Leadership scope not fully evidenced"]
        assert data["fallback_used"] is False

    def test_generate_cover_letter_validation_failure(self, client, sample_role):
        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.generate_cover_letter",
            side_effect=ValueError(
                "Fit analysis is required before generating application materials"
            ),
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/application-materials/cover-letter")

        assert response.status_code == 422
        assert "Fit analysis is required" in response.json()["detail"]

    def test_generate_question_answers_success(self, client, sample_role):
        fake_material = self._material_result(sample_role.id, artifact_type="application_qa")

        with (
            patch(
                "backend.routers.jobs_materials.ApplicationMaterialsService.generate_question_answers",
                return_value=fake_material,
            ),
            patch("backend.services.job_presenters.file_exists", return_value=True),
            patch("backend.services.job_presenters.load_file", return_value="Q: Why?\nA: Because."),
        ):
            response = client.post(
                f"/api/jobs/{sample_role.id}/application-materials/question-answers",
                json={"questions": ["Why this role?"]},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["artifact_type"] == "application_qa"
        assert data["questions"] == ["Why this role?"]

    def test_generate_question_answers_empty_set_returns_422(self, client, sample_role):
        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.generate_question_answers",
            side_effect=ValueError("Question list must contain at least one non-empty question"),
        ):
            response = client.post(
                f"/api/jobs/{sample_role.id}/application-materials/question-answers",
                json={"questions": []},
            )

        assert response.status_code == 422
        assert "Question list" in response.json()["detail"]

    def test_list_materials_returns_saved_versions(self, client, sample_role, db):
        created = ApplicationMaterial(
            role_id=sample_role.id,
            artifact_type="cover_letter",
            version=1,
            content_path=f"applications/{sample_role.id}/cover_letter-v1.md",
            questions=None,
            provider="openai",
            model="gpt-4o",
            prompt_version="cover-letter-v1",
        )
        db.add(created)
        db.commit()

        with (
            patch("backend.services.job_presenters.file_exists", return_value=True),
            patch(
                "backend.services.job_presenters.load_file", return_value="Generated cover letter"
            ),
        ):
            response = client.get(f"/api/jobs/{sample_role.id}/application-materials")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["artifact_type"] == "cover_letter"
        assert data[0]["content"] == "Generated cover letter"

    def test_get_material_not_found_returns_404(self, client, sample_role):
        response = client.get(f"/api/jobs/{sample_role.id}/application-materials/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "Application material not found"

    def test_generate_interview_prep_pack_success(self, client, sample_role):
        fake_material = SimpleNamespace(
            id=201,
            role_id=sample_role.id,
            artifact_type="interview_prep_pack",
            version=1,
            content_path=f"applications/{sample_role.id}/interview_prep_pack-v1.md",
            sections={
                "likely_questions": ["Why this role?"],
                "talking_points": ["Evidence-based fit summary"],
                "star_stories": ["STAR draft about delivery"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="interview-prep-pack-v1",
            fallback_used=True,
            created_at=datetime.now(UTC),
        )

        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.generate_interview_prep_pack",
            return_value=fake_material,
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/interview-prep-pack")

        assert response.status_code == 200
        payload = response.json()
        assert payload["artifact_type"] == "interview_prep_pack"
        assert payload["sections"]["likely_questions"] == ["Why this role?"]
        assert payload["fallback_used"] is True

    def test_list_interview_prep_pack_versions(self, client, sample_role):
        v2 = SimpleNamespace(
            id=302,
            role_id=sample_role.id,
            artifact_type="interview_prep_pack",
            version=2,
            content_path=f"applications/{sample_role.id}/interview_prep_pack-v2.md",
            sections={
                "likely_questions": ["Q2"],
                "talking_points": ["T2"],
                "star_stories": ["S2"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="interview-prep-pack-v1",
            created_at=datetime.now(UTC),
        )
        v1 = SimpleNamespace(
            id=301,
            role_id=sample_role.id,
            artifact_type="interview_prep_pack",
            version=1,
            content_path=f"applications/{sample_role.id}/interview_prep_pack-v1.md",
            sections={
                "likely_questions": ["Q1"],
                "talking_points": ["T1"],
                "star_stories": ["S1"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="interview-prep-pack-v1",
            created_at=datetime.now(UTC),
        )

        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.list_interview_prep_packs",
            return_value=[v2, v1],
        ):
            response = client.get(f"/api/jobs/{sample_role.id}/interview-prep-pack")

        assert response.status_code == 200
        payload = response.json()
        assert [item["version"] for item in payload] == [2, 1]

    def test_regenerate_interview_prep_section_success(self, client, sample_role):
        fake_material = SimpleNamespace(
            id=401,
            role_id=sample_role.id,
            artifact_type="interview_prep_pack",
            version=3,
            content_path=f"applications/{sample_role.id}/interview_prep_pack-v3.md",
            sections={
                "likely_questions": ["New question"],
                "talking_points": ["Talking point"],
                "star_stories": ["STAR"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="interview-prep-pack-v1",
            created_at=datetime.now(UTC),
        )

        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.regenerate_interview_prep_section",
            return_value=fake_material,
        ) as regenerate_mock:
            response = client.post(
                f"/api/jobs/{sample_role.id}/interview-prep-pack/regenerate",
                json={"section": "likely_questions"},
            )

        assert response.status_code == 200
        regenerate_mock.assert_called_once()
        assert response.json()["version"] == 3

    def test_update_interview_prep_pack_success(self, client, sample_role):
        fake_material = SimpleNamespace(
            id=501,
            role_id=sample_role.id,
            artifact_type="interview_prep_pack",
            version=2,
            content_path=f"applications/{sample_role.id}/interview_prep_pack-v2.md",
            sections={
                "likely_questions": ["Updated question"],
                "talking_points": ["Updated talking point"],
                "star_stories": ["Updated STAR"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="interview-prep-pack-v1",
            created_at=datetime.now(UTC),
        )

        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.update_interview_prep_pack",
            return_value=fake_material,
        ) as update_mock:
            response = client.put(
                f"/api/jobs/{sample_role.id}/interview-prep-pack/501",
                json={
                    "sections": {
                        "likely_questions": ["Updated question"],
                        "talking_points": ["Updated talking point"],
                        "star_stories": ["Updated STAR"],
                    }
                },
            )

        assert response.status_code == 200
        update_mock.assert_called_once()
        assert response.json()["sections"]["talking_points"] == ["Updated talking point"]

    def test_sync_resume_profile_endpoint(self, client):
        with patch(
            "backend.routers.jobs_analysis.CareerEvidenceService.sync_resume_profile",
            return_value=([], "resume.md"),
        ) as sync_mock:
            response = client.post("/api/jobs/profile/sync-resume", json={})

        assert response.status_code == 200
        payload = response.json()
        assert payload["ingested_count"] == 0
        assert payload["source_record_id"] == "resume.md"
        assert payload["source_used"] == "resume.md"
        sync_mock.assert_called_once()

    def test_generate_resume_tuning_success(self, client, sample_role):
        fake_material = SimpleNamespace(
            id=601,
            role_id=sample_role.id,
            artifact_type="resume_tuning",
            version=1,
            content_path=f"applications/{sample_role.id}/resume_tuning-v1.md",
            sections={
                "keep_bullets": ["Keep measurable impact bullet"],
                "remove_bullets": ["Remove generic responsibility bullet"],
                "emphasize_bullets": ["Emphasize API scale outcomes"],
                "missing_keywords": ["fastapi", "observability"],
                "summary_tweaks": ["Lead with platform impact in summary"],
                "confidence_notes": ["High confidence for required skill alignment"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="resume-tuning-v1",
            fallback_used=True,
            created_at=datetime.now(UTC),
        )

        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.generate_resume_tuning_suggestion",
            return_value=fake_material,
        ):
            response = client.post(f"/api/jobs/{sample_role.id}/resume-tuning")

        assert response.status_code == 200
        payload = response.json()
        assert payload["artifact_type"] == "resume_tuning"
        assert payload["sections"]["missing_keywords"] == ["fastapi", "observability"]
        assert payload["fallback_used"] is True

    def test_list_resume_tuning_versions(self, client, sample_role):
        v2 = SimpleNamespace(
            id=702,
            role_id=sample_role.id,
            artifact_type="resume_tuning",
            version=2,
            content_path=f"applications/{sample_role.id}/resume_tuning-v2.md",
            sections={
                "keep_bullets": ["Keep v2"],
                "remove_bullets": ["Remove v2"],
                "emphasize_bullets": ["Emphasize v2"],
                "missing_keywords": ["keyword-v2"],
                "summary_tweaks": ["Summary v2"],
                "confidence_notes": ["Confidence v2"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="resume-tuning-v1",
            created_at=datetime.now(UTC),
        )
        v1 = SimpleNamespace(
            id=701,
            role_id=sample_role.id,
            artifact_type="resume_tuning",
            version=1,
            content_path=f"applications/{sample_role.id}/resume_tuning-v1.md",
            sections={
                "keep_bullets": ["Keep v1"],
                "remove_bullets": ["Remove v1"],
                "emphasize_bullets": ["Emphasize v1"],
                "missing_keywords": ["keyword-v1"],
                "summary_tweaks": ["Summary v1"],
                "confidence_notes": ["Confidence v1"],
            },
            provider="openai",
            model="gpt-4o",
            prompt_version="resume-tuning-v1",
            created_at=datetime.now(UTC),
        )

        with patch(
            "backend.routers.jobs_materials.ApplicationMaterialsService.list_resume_tuning_suggestions",
            return_value=[v2, v1],
        ):
            response = client.get(f"/api/jobs/{sample_role.id}/resume-tuning")

        assert response.status_code == 200
        payload = response.json()
        assert [item["version"] for item in payload] == [2, 1]


# ---------------------------------------------------------------------------
# Tests: POST /api/jobs/scrape
# ---------------------------------------------------------------------------


class TestScrapeJob:
    """Tests for POST /api/jobs/scrape."""

    def _capture_result(
        self,
        *,
        status: str = "success",
        role_id: int = 1,
        company: str = "TechCo",
        title: str = "Backend Engineer",
        skills_extracted: int = 5,
        processing_time_seconds: float = 0.123,
    ):
        """Build a fake JobCaptureService result object."""
        return SimpleNamespace(
            status=status,
            role_id=role_id,
            company=company,
            title=title,
            skills_extracted=skills_extracted,
            processing_time_seconds=processing_time_seconds,
        )

    def test_scrape_successful(self, client):
        """Router returns mapped success response from JobCaptureService."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(return_value=self._capture_result())

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/99999"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["company"] == "TechCo"
        assert data["title"] == "Backend Engineer"
        assert data["skills_extracted"] == 5  # 3 required + 2 preferred
        assert data["role_id"] >= 1
        assert data["processing_time_seconds"] >= 0

    def test_scrape_duplicate_url(self, client, sample_role):
        """already_exists status from service is propagated."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(
            return_value=self._capture_result(
                status="already_exists",
                role_id=sample_role.id,
                company="Acme Corp",
                title=sample_role.title,
                skills_extracted=2,
            )
        )
        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/12345"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "already_exists"
        assert data["role_id"] == sample_role.id

    def test_scrape_invalid_url(self, client):
        """Pydantic rejects malformed URLs with 422."""
        response = client.post(
            "/api/jobs/scrape",
            json={"url": "not-a-valid-url"},
        )
        assert response.status_code == 422

    def test_scrape_scraper_error_returns_422(self, client):
        """JobCaptureScrapingError from service raises HTTP 422."""
        from backend.services.job_capture import JobCaptureScrapingError

        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(side_effect=JobCaptureScrapingError("blocked"))

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://blocked.example.com/job/1"},
            )

        assert response.status_code == 422
        detail = response.json()["detail"]
        assert detail["code"] == "FALLBACK_TEXT_REQUIRED"
        assert "Unable to scrape this URL" in detail["message"]

    def test_scrape_with_fallback_text_uses_clipboard_path(self, client):
        """Router uses clipboard capture path when fallback_text is provided."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock()
        mock_service.capture_from_clipboard_text = AsyncMock(
            return_value=self._capture_result(status="success")
        )

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={
                    "url": "https://blocked.example.com/job/1",
                    "fallback_text": "Pasted job description text",
                },
            )

        assert response.status_code == 200
        mock_service.capture_from_url.assert_not_awaited()
        mock_service.capture_from_clipboard_text.assert_awaited_once_with(
            "https://blocked.example.com/job/1",
            "Pasted job description text",
        )

    def test_scrape_llm_denoise_error_returns_500(self, client):
        """JobCaptureLLMError during processing raises HTTP 500."""
        from backend.services.job_capture import JobCaptureLLMError

        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(side_effect=JobCaptureLLMError("timeout"))

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/77777"},
            )

        assert response.status_code == 500
        assert "LLM processing failed" in response.json()["detail"]

    def test_scrape_llm_extraction_error_returns_500(self, client):
        """JobCapturePersistenceError raises HTTP 500."""
        from backend.services.job_capture import JobCapturePersistenceError

        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(
            side_effect=JobCapturePersistenceError("db write failed")
        )

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/88888"},
            )

        assert response.status_code == 500
        assert "Persistence failed" in response.json()["detail"]

    def test_scrape_service_called_with_url(self, client):
        """Router passes URL through to service capture_from_url."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(return_value=self._capture_result())
        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/new-acme-job"},
            )

        assert response.status_code == 200
        mock_service.capture_from_url.assert_awaited_once_with(
            "https://greenhouse.io/jobs/new-acme-job"
        )

    def test_scrape_empty_skills(self, client):
        """Router propagates skills_extracted=0 from service."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(
            return_value=self._capture_result(skills_extracted=0)
        )

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/no-skills"},
            )

        assert response.status_code == 200
        assert response.json()["skills_extracted"] == 0

    def test_scrape_slug_collision_resolved(self, client):
        """Router returns success for service-generated slug collision scenarios."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(
            return_value=self._capture_result(company="NewCo")
        )
        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/slug-test"},
            )

        assert response.status_code == 200
        assert response.json()["company"] == "NewCo"

    def test_scrape_missing_company_defaults_to_unknown(self, client):
        """Unknown company fallback from service is returned by router."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(
            return_value=self._capture_result(company="Unknown Company")
        )

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/unknown-co"},
            )

        assert response.status_code == 200
        assert response.json()["company"] == "Unknown Company"

    def test_scrape_saves_files(self, client):
        """Router remains a thin adapter and delegates all work to service."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(return_value=self._capture_result())

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/file-test"},
            )

        assert response.status_code == 200
        mock_service.capture_from_url.assert_awaited_once()

    def test_scrape_no_salary_info(self, client):
        """Router response shape remains stable for jobs with no salary data."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(return_value=self._capture_result())

        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/no-salary"},
            )

        assert response.status_code == 200
        assert response.json()["status"] == "success"

    def test_scrape_true_slug_collision(self, client):
        """Router returns service-computed company details for slug-collision paths."""
        mock_service = MagicMock()
        mock_service.capture_from_url = AsyncMock(
            return_value=self._capture_result(company="TechCo")
        )
        with patch("backend.routers.jobs_capture.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/slug-collision"},
            )

        assert response.status_code == 200
        assert response.json()["company"] == "TechCo"
