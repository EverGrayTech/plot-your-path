"""System- and runtime-level schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class DataImportRequest(BaseModel):
    """Base64-encoded backup payload for workspace restore."""

    archive_base64: str = Field(min_length=1)


class DataOperationResult(BaseModel):
    """Result payload for data portability actions."""

    completed_at: datetime
    message: str


class DataPortabilitySummary(BaseModel):
    """User-facing summary of local data ownership and backup state."""

    data_root: str
    database_path: str
    desktop_runtime: bool
    has_resume: bool
    jobs_count: int
    last_export_at: datetime | None = None
    last_import_at: datetime | None = None
    last_reset_at: datetime | None = None
    skills_count: int
