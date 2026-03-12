"""Desirability-related API schemas."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class DesirabilityScoreScope(StrEnum):
    """Canonical scope for desirability score caching and reuse."""

    COMPANY = "company"


class DesirabilityFactorBase(BaseModel):
    """Shared editable fields for desirability factor configuration."""

    name: str = Field(min_length=1)
    prompt: str = Field(min_length=1)
    weight: float = Field(ge=0.0, le=1.0)
    is_active: bool = True
    display_order: int = Field(ge=0)


class DesirabilityFactorCreate(DesirabilityFactorBase):
    """Payload to create a desirability factor."""


class DesirabilityFactorUpdate(BaseModel):
    """Payload to update one or more factor fields."""

    name: str | None = Field(default=None, min_length=1)
    prompt: str | None = Field(default=None, min_length=1)
    weight: float | None = Field(default=None, ge=0.0, le=1.0)
    is_active: bool | None = None
    display_order: int | None = Field(default=None, ge=0)


class DesirabilityFactor(DesirabilityFactorBase):
    """Desirability factor configuration returned by API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class DesirabilityFactorReorderRequest(BaseModel):
    """Payload for applying a full factor order."""

    factor_ids: list[int]


class DesirabilityFactorScore(BaseModel):
    """Per-factor scoring trace for a desirability result."""

    factor_id: int
    factor_name: str
    weight: float
    score: int = Field(ge=1, le=10)
    reasoning: str
    fallback_used: bool = False


class DesirabilityScore(BaseModel):
    """Persisted desirability score payload."""

    id: int
    company_id: int
    role_id: int
    total_score: float = Field(ge=1.0, le=10.0)
    factor_breakdown: list[DesirabilityFactorScore]
    score_scope: DesirabilityScoreScope = DesirabilityScoreScope.COMPANY
    fallback_used: bool = False
    cache_expires_at: datetime
    is_stale: bool
    provider: str
    model: str
    version: str
    created_at: datetime
