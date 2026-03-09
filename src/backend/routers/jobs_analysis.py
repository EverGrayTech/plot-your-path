"""Analysis, scoring, and profile-sync routes for jobs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.routers.jobs_common import ResumeProfileSyncRequest
from backend.routers.jobs_http import to_http_exception
from backend.schemas.desirability import DesirabilityScore
from backend.schemas.job import FitAnalysis, ResumeProfileSyncResult
from backend.services.career_evidence import CareerEvidenceService
from backend.services.desirability_scorer import DesirabilityScoringService
from backend.services.fit_analyzer import FitAnalysisService
from backend.services.job_presenters import to_desirability_score_schema, to_fit_analysis_schema

router = APIRouter()


@router.post("/jobs/{role_id}/desirability-score", response_model=DesirabilityScore)
async def score_job_desirability(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
    force_refresh: bool = False,
) -> DesirabilityScore:
    """Generate or fetch a desirability score for a role."""
    try:
        score = await run_in_threadpool(
            DesirabilityScoringService(db).generate_for_role,
            role_id,
            force_refresh=force_refresh,
        )
        return to_desirability_score_schema(score)
    except Exception as exc:
        raise to_http_exception(
            exc,
            default_message="Failed to generate desirability score",
            not_found_exceptions=(LookupError, ValueError),
        ) from exc


@router.post("/jobs/{role_id}/desirability-score/refresh", response_model=DesirabilityScore)
async def refresh_job_desirability(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> DesirabilityScore:
    """Force recomputation of desirability score for a role."""
    return await score_job_desirability(role_id, db, force_refresh=True)


@router.post("/jobs/{role_id}/fit-analysis", response_model=FitAnalysis)
async def analyze_job_fit(role_id: int, db: Annotated[Session, Depends(get_db)]) -> FitAnalysis:
    """Generate and persist a deterministic fit analysis record for a role."""
    try:
        analysis = await run_in_threadpool(FitAnalysisService(db).generate_for_role, role_id)
        return to_fit_analysis_schema(analysis)
    except Exception as exc:
        raise to_http_exception(
            exc,
            default_message="Failed to generate fit analysis",
            not_found_exceptions=(LookupError, ValueError),
        ) from exc


@router.post("/jobs/profile/sync-resume", response_model=ResumeProfileSyncResult)
def sync_resume_profile(
    payload: ResumeProfileSyncRequest,
    db: Annotated[Session, Depends(get_db)],
) -> ResumeProfileSyncResult:
    """Sync resume markdown into shared career evidence profile foundation."""
    rows, source_used = CareerEvidenceService(db).sync_resume_profile(
        resume_markdown=payload.resume_markdown,
        source_record_id=payload.source_record_id,
    )
    return ResumeProfileSyncResult(
        ingested_count=len(rows),
        source_record_id=payload.source_record_id,
        source_used=source_used,
    )
