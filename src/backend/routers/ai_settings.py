"""AI settings API router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.schemas.ai_settings import (
    AISetting,
    AISettingHealth,
    AISettingTokenClearResponse,
    AISettingTokenUpdate,
    AISettingUpdate,
    OperationFamily,
)
from backend.services.ai_settings import AISettingsService

router = APIRouter()


def _to_schema(service: AISettingsService, row) -> AISetting:
    return AISetting(
        operation_family=OperationFamily(row.operation_family),
        provider=row.provider,
        model=row.model,
        api_key_env=row.api_key_env,
        base_url=row.base_url,
        temperature=row.temperature,
        max_tokens=row.max_tokens,
        has_runtime_token=row.has_runtime_token,
        token_masked=service.token_masked(row),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


@router.get("/ai-settings", response_model=list[AISetting])
def list_ai_settings(db: Annotated[Session, Depends(get_db)]) -> list[AISetting]:
    service = AISettingsService(db)
    return [_to_schema(service, row) for row in service.list_settings()]


@router.patch("/ai-settings/{operation_family}", response_model=AISetting)
def update_ai_setting(
    operation_family: OperationFamily,
    payload: AISettingUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> AISetting:
    service = AISettingsService(db)
    try:
        updated = service.update_setting(
            operation_family,
            provider=payload.provider,
            model=payload.model,
            api_key_env=payload.api_key_env,
            base_url=payload.base_url,
            temperature=payload.temperature,
            max_tokens=payload.max_tokens,
        )
    except (LookupError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return _to_schema(service, updated)


@router.put("/ai-settings/{operation_family}/token", response_model=AISetting)
def set_ai_token(
    operation_family: OperationFamily,
    payload: AISettingTokenUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> AISetting:
    service = AISettingsService(db)
    try:
        updated = service.set_runtime_token(operation_family, payload.token)
    except (LookupError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return _to_schema(service, updated)


@router.delete(
    "/ai-settings/{operation_family}/token",
    response_model=AISettingTokenClearResponse,
)
def clear_ai_token(
    operation_family: OperationFamily,
    db: Annotated[Session, Depends(get_db)],
) -> AISettingTokenClearResponse:
    service = AISettingsService(db)
    try:
        updated = service.clear_runtime_token(operation_family)
    except LookupError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return AISettingTokenClearResponse(
        operation_family=operation_family,
        has_runtime_token=updated.has_runtime_token,
    )


@router.get("/ai-settings/{operation_family}/health", response_model=AISettingHealth)
def ai_setting_healthcheck(
    operation_family: OperationFamily,
    db: Annotated[Session, Depends(get_db)],
) -> AISettingHealth:
    return AISettingsService(db).healthcheck(operation_family)
