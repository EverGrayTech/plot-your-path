"""Capture/scrape routes for jobs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.job import JobScrapeRequest, JobScrapeResponse
from backend.services.job_capture import (
    JobCaptureLLMError,
    JobCapturePersistenceError,
    JobCaptureScrapingError,
    JobCaptureService,
)
from backend.utils.async_utils import run_async_task

router = APIRouter()


@router.post("/jobs/scrape", response_model=JobScrapeResponse)
async def scrape_job(
    request: JobScrapeRequest,
    db: Annotated[Session, Depends(get_db)],
) -> JobScrapeResponse:
    """Scrape a job posting URL and persist all extracted data."""
    url = str(request.url)
    fallback_text = request.fallback_text.strip() if request.fallback_text else None
    service = JobCaptureService(db)
    try:
        if fallback_text:
            result = await run_in_threadpool(
                run_async_task,
                service.capture_from_clipboard_text(url, fallback_text),
            )
        else:
            result = await run_in_threadpool(run_async_task, service.capture_from_url(url))
    except JobCaptureScrapingError as exc:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "FALLBACK_TEXT_REQUIRED",
                "message": f"Unable to scrape this URL. Paste the job text and resubmit. ({exc})",
            },
        ) from exc
    except JobCaptureLLMError as exc:
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {exc}") from exc
    except JobCapturePersistenceError as exc:
        raise HTTPException(status_code=500, detail=f"Persistence failed: {exc}") from exc

    return JobScrapeResponse(
        status=result.status,
        role_id=result.role_id,
        company=result.company,
        title=result.title,
        skills_extracted=result.skills_extracted,
        processing_time_seconds=result.processing_time_seconds,
    )
