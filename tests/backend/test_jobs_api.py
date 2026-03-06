"""Integration tests for the Jobs API endpoints."""

from __future__ import annotations

from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.database import Base, get_db
from backend.main import app
from backend.models.company import Company
from backend.models.role import Role
from backend.models.role_skill import RoleSkill
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
        status="active",
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

    db.add(RoleSkill(role_id=sample_role.id, skill_id=python_skill.id, requirement_level="required"))
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
        assert job["status"] == "active"
        assert "$120,000 - $180,000 USD" in job["salary_range"]

    def test_list_no_salary_returns_none(self, db, client, sample_company):
        """Jobs without salary info return null salary_range."""
        role = Role(
            company_id=sample_company.id,
            title="Intern",
            url="https://example.com/intern",
            raw_html_path="data/jobs/raw/acme-corp/2.html",
            cleaned_md_path="data/jobs/cleaned/acme-corp/2.md",
            status="active",
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
            status="active",
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
            status="active",
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
            status="active",
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
        assert "Python" in data["skills"]["required"]
        assert "TypeScript" in data["skills"]["preferred"]
        assert data["salary"]["min"] == 120000
        assert data["salary"]["max"] == 180000

    def test_get_job_with_file(self, client, db, sample_role, sample_skills):
        """Returns Markdown content when the cleaned file exists on disk."""
        with patch("backend.routers.jobs.file_exists", return_value=True), \
             patch("backend.routers.jobs.load_file", return_value="# Backend Engineer\n\nGreat role!"):
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
        response = client.patch("/api/jobs/999/status", json={"status": "applied"})
        assert response.status_code == 404

    def test_update_status_success(self, client, sample_role):
        """Status is updated and new value returned in response."""
        response = client.patch(
            f"/api/jobs/{sample_role.id}/status", json={"status": "applied"}
        )
        assert response.status_code == 200
        assert response.json()["status"] == "applied"

    def test_update_status_invalid_value(self, client, sample_role):
        """Invalid status value returns 422 validation error."""
        response = client.patch(
            f"/api/jobs/{sample_role.id}/status", json={"status": "invalid_status"}
        )
        assert response.status_code == 422

    def test_update_status_all_valid_values(self, client, sample_role):
        """All valid status values are accepted."""
        for status in ("active", "applied", "rejected", "archived"):
            response = client.patch(
                f"/api/jobs/{sample_role.id}/status", json={"status": status}
            )
            assert response.status_code == 200
            assert response.json()["status"] == status


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

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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
        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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
        mock_service.capture_from_url = AsyncMock(
            side_effect=JobCaptureScrapingError("blocked")
        )

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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
        mock_service.capture_from_url = AsyncMock(
            side_effect=JobCaptureLLMError("timeout")
        )

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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
        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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
        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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

        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
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
        with patch("backend.routers.jobs.JobCaptureService", return_value=mock_service):
            response = client.post(
                "/api/jobs/scrape",
                json={"url": "https://greenhouse.io/jobs/slug-collision"},
            )

        assert response.status_code == 200
        assert response.json()["company"] == "TechCo"
