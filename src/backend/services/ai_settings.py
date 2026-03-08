"""AI provider/model/token settings service."""

from __future__ import annotations

import os

from sqlalchemy.orm import Session

from backend.config import LLMConfig, llm_config
from backend.models.ai_operation_setting import AIOperationSetting
from backend.schemas.ai_settings import AISettingHealth, OperationFamily
from backend.services.llm_service import LLMService

SUPPORTED_PROVIDERS = {"openai", "anthropic", "ollama", "openrouter"}
MODEL_PREFIX_BY_PROVIDER = {
    "openai": ("gpt", "o"),
    "anthropic": ("claude",),
    "openrouter": (),
    "ollama": (),
}
DEFAULTS_BY_FAMILY: dict[OperationFamily, dict[str, object]] = {
    OperationFamily.JOB_PARSING: {
        "provider": llm_config.provider,
        "model": llm_config.model,
        "api_key_env": llm_config.api_key_env,
        "base_url": llm_config.base_url,
        "temperature": llm_config.temperature,
        "max_tokens": llm_config.max_tokens,
    },
    OperationFamily.DESIRABILITY_SCORING: {
        "provider": llm_config.provider,
        "model": llm_config.model,
        "api_key_env": llm_config.api_key_env,
        "base_url": llm_config.base_url,
        "temperature": llm_config.temperature,
        "max_tokens": llm_config.max_tokens,
    },
    OperationFamily.APPLICATION_GENERATION: {
        "provider": llm_config.provider,
        "model": llm_config.model,
        "api_key_env": llm_config.api_key_env,
        "base_url": llm_config.base_url,
        "temperature": llm_config.temperature,
        "max_tokens": llm_config.max_tokens,
    },
}

_RUNTIME_TOKENS: dict[OperationFamily, str] = {}


class AISettingsService:
    """Read/update persisted AI settings per operation family."""

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def _mask_token(token_last4: str | None) -> str | None:
        if not token_last4:
            return None
        return f"••••••••{token_last4}"

    @staticmethod
    def _validate_provider(provider: str) -> None:
        if provider not in SUPPORTED_PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider}")

    @staticmethod
    def _validate_provider_model(provider: str, model: str) -> None:
        cleaned = model.strip().lower()
        if not cleaned:
            raise ValueError("Model cannot be empty")

        prefixes = MODEL_PREFIX_BY_PROVIDER.get(provider, ())
        if prefixes and not cleaned.startswith(prefixes):
            raise ValueError(f"Model '{model}' is not supported for provider '{provider}'")

    def _ensure_defaults(self) -> None:
        existing = {
            row.operation_family for row in self.db.query(AIOperationSetting.operation_family).all()
        }
        changed = False
        for family, defaults in DEFAULTS_BY_FAMILY.items():
            if family.value in existing:
                continue
            self.db.add(
                AIOperationSetting(
                    operation_family=family.value,
                    provider=str(defaults["provider"]),
                    model=str(defaults["model"]),
                    api_key_env=str(defaults["api_key_env"]),
                    base_url=str(defaults["base_url"]) if defaults["base_url"] else None,
                    temperature=float(defaults["temperature"]),
                    max_tokens=int(defaults["max_tokens"]),
                    has_runtime_token=False,
                    token_last4=None,
                )
            )
            changed = True
        if changed:
            self.db.commit()

    def list_settings(self) -> list[AIOperationSetting]:
        self._ensure_defaults()
        return (
            self.db.query(AIOperationSetting)
            .order_by(AIOperationSetting.operation_family.asc())
            .all()
        )

    def get_setting(self, family: OperationFamily) -> AIOperationSetting:
        self._ensure_defaults()
        row = (
            self.db.query(AIOperationSetting)
            .filter(AIOperationSetting.operation_family == family.value)
            .first()
        )
        if row is None:
            raise LookupError("Operation family settings not found")
        return row

    def update_setting(
        self,
        family: OperationFamily,
        provider: str | None = None,
        model: str | None = None,
        api_key_env: str | None = None,
        base_url: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> AIOperationSetting:
        row = self.get_setting(family)

        if provider is not None:
            self._validate_provider(provider)
            row.provider = provider
        if model is not None:
            row.model = model.strip()
        self._validate_provider_model(row.provider, row.model)
        if api_key_env is not None:
            row.api_key_env = api_key_env.strip()
        if base_url is not None:
            row.base_url = base_url.strip() or None
        if temperature is not None:
            row.temperature = temperature
        if max_tokens is not None:
            row.max_tokens = max_tokens

        self.db.commit()
        self.db.refresh(row)
        return row

    def set_runtime_token(self, family: OperationFamily, token: str) -> AIOperationSetting:
        row = self.get_setting(family)
        cleaned = token.strip()
        if not cleaned:
            raise ValueError("Token cannot be empty")
        _RUNTIME_TOKENS[family] = cleaned
        row.has_runtime_token = True
        row.token_last4 = cleaned[-4:] if len(cleaned) >= 4 else cleaned
        self.db.commit()
        self.db.refresh(row)
        return row

    def clear_runtime_token(self, family: OperationFamily) -> AIOperationSetting:
        row = self.get_setting(family)
        _RUNTIME_TOKENS.pop(family, None)
        row.has_runtime_token = False
        row.token_last4 = None
        self.db.commit()
        self.db.refresh(row)
        return row

    def build_llm_config(self, family: OperationFamily) -> LLMConfig:
        row = self.get_setting(family)
        api_key_env = row.api_key_env
        runtime_token = _RUNTIME_TOKENS.get(family)
        if runtime_token:
            env_name = f"PLOT_YOUR_PATH_{family.value.upper()}_TOKEN"
            os.environ[env_name] = runtime_token
            api_key_env = env_name

        return LLMConfig(
            provider=row.provider,
            model=row.model,
            api_key_env=api_key_env,
            base_url=row.base_url,
            temperature=row.temperature,
            max_tokens=row.max_tokens,
        )

    def healthcheck(self, family: OperationFamily) -> AISettingHealth:
        config = self.build_llm_config(family)
        try:
            response = LLMService(config=config)
            _ = response
            config.get_api_key() if config.provider != "ollama" else None
            return AISettingHealth(
                operation_family=family, ok=True, detail="Configuration looks valid"
            )
        except Exception as exc:
            return AISettingHealth(operation_family=family, ok=False, detail=str(exc))

    def token_masked(self, row: AIOperationSetting) -> str | None:
        return self._mask_token(row.token_last4)
