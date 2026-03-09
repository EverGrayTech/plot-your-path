"""Read/list/detail routes for jobs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.routers.jobs_http import to_http_exception
from backend.schemas.job import JobDetail, JobListItem, PipelineResponse
from backend.services.job_queries import JobQueryService

router = APIRouter()


@router.get("/jobs", response_model=list[JobListItem])
def list_jobs(db: Annotated[Session, Depends(get_db)]) -> list[JobListItem]:
    """List all captured job postings."""
    return JobQueryService(db).get_job_list_items()


@router.get("/jobs/pipeline", response_model=PipelineResponse)
def list_jobs_pipeline(
    db: Annotated[Session, Depends(get_db)],
    overdue_only: bool = False,
    this_week_deadlines: bool = False,
    recently_updated: bool = False,
) -> PipelineResponse:
    """List operational pipeline view with urgency filters and counters."""
    return JobQueryService(db).get_pipeline_response(
        overdue_only=overdue_only,
        recently_updated=recently_updated,
        this_week_deadlines=this_week_deadlines,
    )


@router.get("/jobs/{role_id}", response_model=JobDetail)
def get_job(role_id: int, db: Annotated[Session, Depends(get_db)]) -> JobDetail:
    """Get detailed information for a specific job posting."""
    try:
        return JobQueryService(db).get_job_detail(role_id)
    except Exception as exc:
        raise to_http_exception(exc, default_message="Failed to load job detail") from exc
