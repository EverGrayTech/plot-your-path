"""Outcome and learning-loop routes for jobs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.routers.jobs_http import to_http_exception
from backend.schemas.job import (
    OutcomeEvent,
    OutcomeEventCreate,
    OutcomeInsights,
    OutcomeTuningSuggestions,
)
from backend.services.job_presenters import to_outcome_event_schema
from backend.services.outcome_feedback import OutcomeFeedbackService

router = APIRouter()


@router.get("/jobs/{role_id}/outcomes", response_model=list[OutcomeEvent])
def list_outcome_events(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[OutcomeEvent]:
    """List downstream outcome events for a role."""
    try:
        rows = OutcomeFeedbackService(db).list_events_for_role(role_id)
        return [to_outcome_event_schema(row) for row in rows]
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.post("/jobs/{role_id}/outcomes", response_model=OutcomeEvent)
def create_outcome_event(
    role_id: int,
    payload: OutcomeEventCreate,
    db: Annotated[Session, Depends(get_db)],
) -> OutcomeEvent:
    """Create downstream outcome event linked to role/application context."""
    try:
        row = OutcomeFeedbackService(db).create_event(payload, role_id)
        return to_outcome_event_schema(row)
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.get("/outcomes/insights", response_model=OutcomeInsights)
def get_outcome_insights(db: Annotated[Session, Depends(get_db)]) -> OutcomeInsights:
    """Get aggregate conversion insights for fit/desirability/model dimensions."""
    service = OutcomeFeedbackService(db)
    (
        confidence_message,
        conversion_by_fit_band,
        conversion_by_desirability_band,
        conversion_by_model_family,
        total_events,
        total_roles_with_outcomes,
    ) = service.get_insights()
    return OutcomeInsights(
        confidence_message=confidence_message,
        conversion_by_desirability_band=conversion_by_desirability_band,
        conversion_by_fit_band=conversion_by_fit_band,
        conversion_by_model_family=conversion_by_model_family,
        total_events=total_events,
        total_roles_with_outcomes=total_roles_with_outcomes,
    )


@router.get("/outcomes/tuning-suggestions", response_model=OutcomeTuningSuggestions)
def get_outcome_tuning_suggestions(
    db: Annotated[Session, Depends(get_db)],
) -> OutcomeTuningSuggestions:
    """Get explainable, manual tuning suggestions from logged outcomes."""
    confidence_message, suggestions = OutcomeFeedbackService(db).get_tuning_suggestions()
    return OutcomeTuningSuggestions(
        confidence_message=confidence_message,
        suggestions=suggestions,
    )
