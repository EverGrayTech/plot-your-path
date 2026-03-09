"""Application operations, interview stages, and status routes for jobs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.application_ops import ApplicationOps as ApplicationOpsModel
from backend.models.interview_stage_event import InterviewStageEvent as InterviewStageEventModel
from backend.models.role_status_change import RoleStatusChange as RoleStatusChangeModel
from backend.routers.jobs_common import NextActionUpdate, StatusUpdate, require_role
from backend.routers.jobs_http import to_http_exception
from backend.schemas.job import (
    ApplicationOps,
    ApplicationOpsUpdate,
    InterviewStageEvent,
    InterviewStageEventCreate,
    JobListItem,
)
from backend.services.job_presenters import (
    to_application_ops_schema,
    to_interview_stage_event_schema,
    to_interview_stage_timeline_schema,
)
from backend.services.job_queries import JobQueryService
from backend.utils.time import normalize_utc_naive, utc_now_naive

router = APIRouter()


@router.get("/jobs/{role_id}/application-ops", response_model=ApplicationOps)
def get_application_ops(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationOps:
    """Get application-ops metadata for a role."""
    try:
        require_role(role_id, db)
        row = db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role_id).first()
        if row is None:
            raise LookupError("Application ops not found")
        return to_application_ops_schema(role_id, row, now=utc_now_naive())
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.put("/jobs/{role_id}/application-ops", response_model=ApplicationOps)
def upsert_application_ops(
    role_id: int,
    payload: ApplicationOpsUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationOps:
    """Create or update application-ops metadata for a role."""
    try:
        require_role(role_id, db)
        row = db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role_id).first()
        if row is None:
            row = ApplicationOpsModel(role_id=role_id)
            db.add(row)

        row.applied_at = normalize_utc_naive(payload.applied_at)
        row.deadline_at = normalize_utc_naive(payload.deadline_at)
        row.source = payload.source.strip() if payload.source else None
        row.recruiter_contact = (
            payload.recruiter_contact.strip() if payload.recruiter_contact else None
        )
        row.notes = payload.notes.strip() if payload.notes else None
        row.next_action_at = normalize_utc_naive(payload.next_action_at)

        db.commit()
        db.refresh(row)
        return to_application_ops_schema(role_id, row, now=utc_now_naive())
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.patch("/jobs/{role_id}/application-ops/next-action", response_model=ApplicationOps)
def update_next_action(
    role_id: int,
    payload: NextActionUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationOps:
    """Update only next-action datetime for a role."""
    try:
        require_role(role_id, db)
        row = db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role_id).first()
        if row is None:
            row = ApplicationOpsModel(role_id=role_id)
            db.add(row)

        row.next_action_at = normalize_utc_naive(payload.next_action_at)
        db.commit()
        db.refresh(row)
        return to_application_ops_schema(role_id, row, now=utc_now_naive())
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.get("/jobs/{role_id}/interview-stages", response_model=list[InterviewStageEvent])
def list_interview_stages(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[InterviewStageEvent]:
    """List interview-stage timeline entries for a role."""
    try:
        require_role(role_id, db)
        return to_interview_stage_timeline_schema(
            JobQueryService(db).get_interview_stage_timeline(role_id)
        )
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.post("/jobs/{role_id}/interview-stages", response_model=InterviewStageEvent)
def create_interview_stage_event(
    role_id: int,
    payload: InterviewStageEventCreate,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewStageEvent:
    """Append interview-stage event to role timeline."""
    try:
        require_role(role_id, db)
        row = InterviewStageEventModel(
            role_id=role_id,
            stage=payload.stage.value,
            notes=payload.notes.strip() if payload.notes else None,
            occurred_at=normalize_utc_naive(payload.occurred_at),
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return to_interview_stage_event_schema(row)
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.patch("/jobs/{role_id}/status", response_model=JobListItem)
def update_job_status(
    role_id: int,
    status_update: StatusUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> JobListItem:
    """Update the status of a job posting."""
    try:
        role = require_role(role_id, db)
        previous_status = role.status
        role.status = status_update.status.value

        if previous_status != role.status:
            db.add(
                RoleStatusChangeModel(
                    role_id=role.id,
                    from_status=previous_status,
                    to_status=role.status,
                )
            )

        db.commit()
        db.refresh(role)
        return JobQueryService(db).get_job_list_item(role_id)
    except Exception as exc:
        raise to_http_exception(exc) from exc
