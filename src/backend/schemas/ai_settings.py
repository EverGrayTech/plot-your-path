"""Schemas for AI model/token settings."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class OperationFamily(StrEnum):
    """Supported AI operation families."""

    JOB_PARSING = "job_parsing"
    DESIRABILITY_SCORING = "desirability_scoring"
    APPLICATION_GENERATION = "application_generation"
    FIT_ANALYSIS = "fit_analysis"


class AISetting(BaseModel):
    """Persisted AI setting state for one operation family."""

    operation_family: OperationFamily
    provider: str
    model: str
    api_key_env: str
    base_url: str | None
    temperature: float
    max_tokens: int
    has_runtime_token: bool
    token_masked: str | None
    created_at: datetime
    updated_at: datetime


class AISettingUpdate(BaseModel):
    """Editable provider/model configuration."""

    provider: str | None = None
    model: str | None = None
    api_key_env: str | None = None
    base_url: str | None = None
    temperature: float | None = Field(default=None, ge=0.0, le=2.0)
    max_tokens: int | None = Field(default=None, ge=64, le=32768)


class AISettingTokenUpdate(BaseModel):
    """Runtime token update payload."""

    token: str


class AISettingTokenClearResponse(BaseModel):
    """Token clear response payload."""

    operation_family: OperationFamily
    has_runtime_token: bool


class AISettingHealth(BaseModel):
    """Health response for operation-family LLM configuration."""

    operation_family: OperationFamily
    ok: bool
    detail: str
