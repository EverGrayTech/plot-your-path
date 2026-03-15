"""System and runtime support routes."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.routers.jobs_http import to_http_exception
from backend.schemas.system import DataImportRequest, DataOperationResult, DataPortabilitySummary
from backend.services.data_portability import DataPortabilityService

router = APIRouter()


@router.get("/system/data-portability", response_model=DataPortabilitySummary)
def get_data_portability_summary(
    db: Annotated[Session, Depends(get_db)],
) -> DataPortabilitySummary:
    """Describe where local data lives and what the workspace contains."""
    try:
        return DataPortabilityService(db).get_summary()
    except Exception as exc:
        raise to_http_exception(exc, default_message="Failed to load local data summary") from exc


@router.get("/system/data-portability/export")
def export_data_archive(db: Annotated[Session, Depends(get_db)]) -> Response:
    """Download a portable zip archive of the current workspace."""
    try:
        archive_bytes, filename = DataPortabilityService(db).export_archive()
        return Response(
            content=archive_bytes,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        raise to_http_exception(exc, default_message="Failed to create backup archive") from exc


@router.post("/system/data-portability/import", response_model=DataOperationResult)
def import_data_archive(
    payload: DataImportRequest,
    db: Annotated[Session, Depends(get_db)],
) -> DataOperationResult:
    """Restore the local workspace from an exported backup archive."""
    try:
        return DataPortabilityService(db).import_archive(payload.archive_base64)
    except Exception as exc:
        raise to_http_exception(exc, default_message="Failed to restore backup") from exc


@router.post("/system/data-portability/reset", response_model=DataOperationResult)
def reset_data_workspace(db: Annotated[Session, Depends(get_db)]) -> DataOperationResult:
    """Reset the local workspace to a blank state."""
    try:
        return DataPortabilityService(db).reset_workspace()
    except Exception as exc:
        raise to_http_exception(exc, default_message="Failed to reset local data") from exc
