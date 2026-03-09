"""Shared request models and helpers for jobs routers."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.models.role import Role
from backend.schemas.job import RoleStatus


class NextActionUpdate(BaseModel):
    """Payload for updating only next-action datetime."""

    next_action_at: datetime | None


class ResumeProfileSyncRequest(BaseModel):
    """Optional payload to sync resume content into profile evidence store."""

    resume_markdown: str | None = None
    source_record_id: str = "resume.md"


class StatusUpdate(BaseModel):
    """Schema for updating a job's status."""

    status: RoleStatus


def require_role(role_id: int, db: Session) -> Role:
    """Load a role or raise a service-layer not-found error."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise LookupError("Job not found")
    return role
