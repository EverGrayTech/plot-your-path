"""Tests for shared career-evidence ingestion and retrieval service."""

from __future__ import annotations

from datetime import date
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.database import Base
from backend.models.career_evidence import CareerEvidence
from backend.schemas.career_evidence import EvidenceQuery, EvidenceSourceType, JournalEvidenceEntry
from backend.services.career_evidence import CareerEvidenceService


def _session() -> Session:
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def test_ingest_resume_markdown_is_idempotent_by_section_key() -> None:
    """Re-ingesting the same resume sections should update in place, not duplicate."""
    session = _session()
    service = CareerEvidenceService(session)

    try:
        first = service.ingest_resume_markdown(
            resume_markdown="# Experience\nBuilt Python APIs\n\n# Projects\nCreated tools"
        )
        second = service.ingest_resume_markdown(
            resume_markdown="# Experience\nBuilt Python and FastAPI APIs\n\n# Projects\nCreated tools"
        )

        rows = session.query(CareerEvidence).order_by(CareerEvidence.source_key.asc()).all()
        assert len(first) == 2
        assert len(second) == 2
        assert len(rows) == 2
        assert rows[0].body.startswith("# Experience")
        assert "FastAPI" in rows[0].body
        assert rows[0].provenance["adapter_version"] == "resume-adapter-v1"
        enrichment = dict(rows[0].resume_enrichment or {})
        assert enrichment.get("has_heading") is True
        assert "fastapi" in str(enrichment.get("keywords", ""))
    finally:
        session.close()


def test_ingest_journal_entries_is_idempotent_by_source_record_id() -> None:
    """Journal adapter should upsert by source record id for safe re-runs."""
    session = _session()
    service = CareerEvidenceService(session)

    try:
        service.ingest_journal_entries(
            [
                JournalEvidenceEntry(
                    source_record_id="2026-03-01",
                    body="Implemented CI improvements",
                    tags=["Delivery", "CI"],
                    timeframe_start=date(2026, 3, 1),
                    timeframe_end=date(2026, 3, 1),
                )
            ]
        )
        service.ingest_journal_entries(
            [
                JournalEvidenceEntry(
                    source_record_id="2026-03-01",
                    body="Implemented CI and quality gate improvements",
                    tags=["delivery", "quality"],
                    timeframe_start=date(2026, 3, 1),
                    timeframe_end=date(2026, 3, 1),
                )
            ]
        )

        rows = session.query(CareerEvidence).all()
        assert len(rows) == 1
        assert rows[0].source_type == EvidenceSourceType.JOURNAL.value
        assert "quality gate" in rows[0].body
        assert rows[0].tags == ["delivery", "quality"]
    finally:
        session.close()


def test_retrieve_filters_mixed_sources_and_applies_sparse_fallback() -> None:
    """Retrieval should support source filters and deterministic sparse fallback."""
    session = _session()
    service = CareerEvidenceService(session)

    try:
        service.ingest_resume_markdown(
            resume_markdown="# Summary\nPython engineer with API design experience"
        )
        service.ingest_journal_entries(
            [
                JournalEvidenceEntry(
                    source_record_id="journal-1",
                    body="Led accessibility initiative with WCAG remediation",
                    tags=["accessibility", "frontend"],
                    timeframe_start=date(2025, 6, 1),
                    timeframe_end=date(2025, 6, 30),
                )
            ]
        )
        service.ingest_manual_evidence(
            source_record_id="manual-1",
            body="Mentored two engineers on testing strategy",
            tags=["leadership"],
        )

        filtered = service.retrieve(
            EvidenceQuery(
                tags=["accessibility"],
                source_types=[EvidenceSourceType.JOURNAL],
                limit=5,
                min_results=1,
            )
        )
        assert len(filtered.items) == 1
        assert filtered.items[0].source_type == EvidenceSourceType.JOURNAL
        assert filtered.fallback_used is False

        sparse = service.retrieve(EvidenceQuery(skills=["kubernetes"], limit=3, min_results=2))
        assert len(sparse.items) >= 2
        assert sparse.fallback_used is True
    finally:
        session.close()


def test_load_context_text_bootstraps_from_resume_when_store_is_empty() -> None:
    """Context loader should auto-ingest resume source when evidence store is empty."""
    session = _session()
    service = CareerEvidenceService(session)

    try:
        with (
            patch("backend.services.career_evidence.file_exists", return_value=True),
            patch(
                "backend.services.career_evidence.load_file",
                return_value="# Experience\nBuilt FastAPI services",
            ),
        ):
            context = service.load_context_text(EvidenceQuery(limit=3, min_results=1))

        assert "FastAPI" in context
        assert session.query(CareerEvidence).count() == 1
    finally:
        session.close()


def test_sync_resume_profile_reports_source_used() -> None:
    """Sync helper should report detected source path and ingested section count."""
    session = _session()
    service = CareerEvidenceService(session)

    try:
        with (
            patch("backend.services.career_evidence.file_exists", side_effect=[True, False]),
            patch(
                "backend.services.career_evidence.load_file",
                return_value="# Summary\nPlatform engineer",
            ),
        ):
            rows, source_used = service.sync_resume_profile()

        assert source_used
        assert len(rows) == 1
        assert rows[0].source_type == EvidenceSourceType.RESUME.value
    finally:
        session.close()
