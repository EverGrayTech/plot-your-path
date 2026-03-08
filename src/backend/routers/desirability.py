"""Desirability API router for factor settings management."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.desirability import (
    DesirabilityFactor,
    DesirabilityFactorCreate,
    DesirabilityFactorReorderRequest,
    DesirabilityFactorUpdate,
)
from backend.services.desirability_scorer import DesirabilityScoringService

router = APIRouter()


@router.get("/desirability/factors", response_model=list[DesirabilityFactor])
def list_desirability_factors(
    db: Annotated[Session, Depends(get_db)],
) -> list[DesirabilityFactor]:
    """List desirability factors in display order."""
    return DesirabilityScoringService(db).get_factors()


@router.post("/desirability/factors", response_model=DesirabilityFactor)
def create_desirability_factor(
    payload: DesirabilityFactorCreate,
    db: Annotated[Session, Depends(get_db)],
) -> DesirabilityFactor:
    """Create a new desirability factor."""
    service = DesirabilityScoringService(db)
    try:
        return service.create_factor(
            display_order=payload.display_order,
            is_active=payload.is_active,
            name=payload.name,
            prompt=payload.prompt,
            weight=payload.weight,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.patch("/desirability/factors/{factor_id}", response_model=DesirabilityFactor)
def update_desirability_factor(
    factor_id: int,
    payload: DesirabilityFactorUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> DesirabilityFactor:
    """Update one desirability factor."""
    service = DesirabilityScoringService(db)
    try:
        return service.update_factor(
            factor_id=factor_id,
            display_order=payload.display_order,
            is_active=payload.is_active,
            name=payload.name,
            prompt=payload.prompt,
            weight=payload.weight,
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/desirability/factors/reorder", response_model=list[DesirabilityFactor])
def reorder_desirability_factors(
    payload: DesirabilityFactorReorderRequest,
    db: Annotated[Session, Depends(get_db)],
) -> list[DesirabilityFactor]:
    """Apply full display order for desirability factors."""
    service = DesirabilityScoringService(db)
    try:
        return service.reorder_factors(payload.factor_ids)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.delete("/desirability/factors/{factor_id}", status_code=204)
def delete_desirability_factor(
    factor_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    """Delete a desirability factor."""
    service = DesirabilityScoringService(db)
    try:
        service.delete_factor(factor_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
