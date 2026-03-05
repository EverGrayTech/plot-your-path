"""Service-level tests for JobCaptureService orchestration."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base
from backend.models.company import Company
from backend.models.role import Role
from backend.services.job_capture import JobCapturePersistenceError, JobCaptureService


@pytest.fixture
def db_session():
    """Create an isolated in-memory DB session for service tests."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
        engine.dispose()


@pytest.mark.asyncio
async def test_capture_from_url_persists_canonical_paths(db_session):
    """URL capture stores canonical data-root-relative paths and links skills."""
    service = JobCaptureService(db_session)

    mock_scraper = MagicMock()
    mock_scraper.scrape = AsyncMock(return_value="<html><body>job</body></html>")
    mock_scraper.extract_text_from_html.return_value = "raw job text"

    mock_llm = MagicMock()
    mock_llm.denoise_job_posting = AsyncMock(return_value="# Job Markdown")
    mock_llm.extract_job_data = AsyncMock(
        return_value={
            "company": "Acme",
            "title": "Backend Engineer",
            "team_division": "Platform",
            "salary_min": 120000,
            "salary_max": 150000,
            "salary_currency": "USD",
            "required_skills": ["Python", "FastAPI"],
            "preferred_skills": ["Docker"],
        }
    )

    with (
        patch("backend.services.job_capture.ScraperService", return_value=mock_scraper),
        patch("backend.services.job_capture.LLMService", return_value=mock_llm),
    ):
        result = await service.capture_from_url("https://example.com/jobs/123")

    assert result.status == "success"

    role = db_session.query(Role).filter(Role.id == result.role_id).one()
    assert role.raw_html_path.startswith("jobs/raw/")
    assert role.cleaned_md_path.startswith("jobs/cleaned/")
    assert not role.raw_html_path.startswith("data/")
    assert not role.cleaned_md_path.startswith("data/")


@pytest.mark.asyncio
async def test_capture_from_clipboard_sets_clipboard_sentinel(db_session):
    """Clipboard capture stores sentinel raw path and canonical cleaned path."""
    service = JobCaptureService(db_session)

    mock_llm = MagicMock()
    mock_llm.denoise_job_posting = AsyncMock(return_value="# Clipboard Markdown")
    mock_llm.extract_job_data = AsyncMock(
        return_value={
            "company": "ClipCo",
            "title": "Platform Engineer",
            "team_division": None,
            "salary_min": None,
            "salary_max": None,
            "salary_currency": "USD",
            "required_skills": ["Python"],
            "preferred_skills": [],
        }
    )

    with patch("backend.services.job_capture.LLMService", return_value=mock_llm):
        result = await service.capture_from_clipboard_text(
            "https://linkedin.com/jobs/view/1", "copied posting text"
        )

    assert result.status == "success"

    role = db_session.query(Role).filter(Role.id == result.role_id).one()
    assert role.raw_html_path == "clipboard"
    assert role.cleaned_md_path.startswith("jobs/cleaned/")


@pytest.mark.asyncio
async def test_capture_from_url_rolls_back_on_persistence_failure(db_session):
    """Persistence failures rollback inserts and surface as JobCapturePersistenceError."""
    service = JobCaptureService(db_session)

    mock_scraper = MagicMock()
    mock_scraper.scrape = AsyncMock(return_value="<html><body>job</body></html>")
    mock_scraper.extract_text_from_html.return_value = "raw job text"

    mock_llm = MagicMock()
    mock_llm.denoise_job_posting = AsyncMock(return_value="# Broken Save")
    mock_llm.extract_job_data = AsyncMock(
        return_value={
            "company": "BrokenCo",
            "title": "Failing Role",
            "team_division": None,
            "salary_min": None,
            "salary_max": None,
            "salary_currency": "USD",
            "required_skills": ["Python"],
            "preferred_skills": [],
        }
    )

    with (
        patch("backend.services.job_capture.ScraperService", return_value=mock_scraper),
        patch("backend.services.job_capture.LLMService", return_value=mock_llm),
        patch(
            "backend.services.job_capture.save_file",
            side_effect=OSError("disk write failed"),
        ),
    ):
        with pytest.raises(JobCapturePersistenceError):
            await service.capture_from_url("https://example.com/jobs/fail")

    assert db_session.query(Company).count() == 0
    assert db_session.query(Role).count() == 0


@pytest.mark.asyncio
async def test_capture_from_url_duplicate_returns_existing(db_session):
    """Existing URL short-circuits to already_exists result."""
    company = Company(name="DupCo", slug="dupco")
    db_session.add(company)
    db_session.flush()
    role = Role(
        company_id=company.id,
        title="Existing Role",
        url="https://example.com/jobs/dup",
        raw_html_path="jobs/raw/dupco/1.html",
        cleaned_md_path="jobs/cleaned/dupco/1.md",
        status="active",
    )
    db_session.add(role)
    db_session.commit()

    service = JobCaptureService(db_session)
    result = await service.capture_from_url("https://example.com/jobs/dup")

    assert result.status == "already_exists"
    assert result.role_id == role.id
