"""Configuration management for the application."""

import json
import os
import sys
from pathlib import Path
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def default_data_root() -> str:
    """Return the default data root for the current runtime mode."""
    if is_desktop_runtime_enabled():
        if os.name == "nt":
            local_app_data = os.getenv("LOCALAPPDATA")
            base_path = (
                Path(local_app_data) if local_app_data else Path.home() / "AppData" / "Local"
            )
            return str(base_path / "Plot Your Path")

        if sys.platform == "darwin":
            return str(Path.home() / "Library" / "Application Support" / "Plot Your Path")

        xdg_data_home = os.getenv("XDG_DATA_HOME")
        base_path = Path(xdg_data_home) if xdg_data_home else Path.home() / ".local" / "share"
        return str(base_path / "plot-your-path")

    return str(Path("~/Documents/plot_your_path").expanduser())


def default_backend_host() -> str:
    """Return the backend host for the current runtime mode."""
    if is_desktop_runtime_enabled():
        return "127.0.0.1"
    return "0.0.0.0"


def default_backend_port() -> int:
    """Return the backend port for the current runtime mode."""
    if is_desktop_runtime_enabled():
        return 8765
    return 8000


def ensure_data_root_exists(data_root: str | None = None) -> Path:
    """Create the configured data root when it does not already exist."""
    target = Path(data_root or settings.data_root)
    target.mkdir(parents=True, exist_ok=True)
    return target


def is_desktop_runtime_enabled() -> bool:
    """Return whether the backend is running under the packaged desktop shell."""
    value = os.getenv("PYP_DESKTOP_RUNTIME", "")
    return value.strip().lower() in {"1", "true", "yes", "on"}


def resolve_resource_path(filepath: str) -> Path:
    """Resolve a project resource path for source and bundled runtimes."""
    path = Path(filepath)
    if path.is_absolute():
        return path

    bundle_root = getattr(sys, "_MEIPASS", None)
    if bundle_root is not None:
        return Path(bundle_root) / path

    return Path(__file__).resolve().parents[2] / path


class LLMConfig(BaseSettings):
    """LLM provider configuration."""

    provider: Literal["openai", "anthropic", "ollama", "openrouter"] = "openai"
    model: str = "gpt-4o"
    api_key_env: str = "OPENAI_API_KEY"
    base_url: str | None = None
    temperature: float = 0.1
    max_tokens: int = 4000

    @classmethod
    def from_file(cls, filepath: str = "config/llm.json") -> "LLMConfig":
        """
        Load LLM configuration from JSON file.

        Args:
            filepath: Path to the configuration file

        Returns:
            LLMConfig instance
        """
        resolved_path = resolve_resource_path(filepath)
        with resolved_path.open(encoding="utf-8") as f:
            data = json.load(f)
        return cls(**data)

    def get_api_key(self) -> str:
        """
        Get the API key from environment variable.

        Returns:
            API key string

        Raises:
            ValueError: If API key environment variable is not set
        """
        api_key = os.getenv(self.api_key_env)
        if not api_key:
            raise ValueError(
                f"API key not found. Please set {self.api_key_env} environment variable."
            )
        return api_key


class ScrapingConfig(BaseSettings):
    """Web scraping configuration."""

    timeout_seconds: int = 30
    retry_attempts: int = 3
    user_agent: str = "Mozilla/5.0 (compatible; PlotYourPath/1.0)"
    rate_limit_delay_seconds: int = 2
    min_content_chars: int = 500

    @classmethod
    def from_file(cls, filepath: str = "config/scraping.json") -> "ScrapingConfig":
        """
        Load scraping configuration from JSON file.

        Args:
            filepath: Path to the configuration file

        Returns:
            ScrapingConfig instance
        """
        resolved_path = resolve_resource_path(filepath)
        with resolved_path.open(encoding="utf-8") as f:
            data = json.load(f)
        return cls(**data)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Data root — all job files and the SQLite DB live here (outside the repo)
    data_root: str = Field(default_factory=default_data_root)

    # Database — auto-derived from data_root if not explicitly set
    database_url: str | None = Field(default=None)

    # Candidate profile source used for role-fit analysis (relative to data_root by default)
    candidate_profile_path: str = Field(default="resume.md")

    # Backend Server
    backend_host: str = Field(default_factory=default_backend_host)
    backend_port: int = Field(default_factory=default_backend_port)

    # Frontend
    next_public_api_url: str | None = Field(default=None)

    # API Keys (optional, loaded from env)
    openai_api_key: str | None = Field(default=None)
    anthropic_api_key: str | None = Field(default=None)
    openrouter_api_key: str | None = Field(default=None)

    @model_validator(mode="after")
    def derive_paths(self) -> "Settings":
        """Expand data_root and derive database_url if not explicitly set."""
        # Expand ~ and resolve to absolute path
        self.data_root = str(Path(self.data_root).expanduser().resolve())
        # Derive database_url from data_root when not explicitly configured
        if self.database_url is None:
            self.database_url = f"sqlite:///{self.data_root}/plot_your_path.db"
        if self.next_public_api_url is None:
            if is_desktop_runtime_enabled():
                self.next_public_api_url = f"http://127.0.0.1:{self.backend_port}"
            else:
                self.next_public_api_url = f"http://localhost:{self.backend_port}"
        return self


# Global settings instance
settings = Settings()

# Load configurations
llm_config = LLMConfig.from_file()
scraping_config = ScrapingConfig.from_file()
