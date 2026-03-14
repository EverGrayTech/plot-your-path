"""Tests for FastAPI app startup behavior."""

from __future__ import annotations

import importlib
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

import backend.config as config_module
import backend.main as main_module
from backend.main import app


def test_app_startup_does_not_create_tables_implicitly() -> None:
    """Serving startup should not mutate schema automatically."""

    with patch("backend.database.Base.metadata.create_all") as create_all_mock:
        with TestClient(app):
            pass

    create_all_mock.assert_not_called()


def test_healthcheck_reports_runtime_metadata() -> None:
    """Healthcheck exposes runtime diagnostics needed by the desktop shell."""

    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["desktop_runtime"] is False
    assert payload["backend_port"] == 8000
    assert payload["data_root"]


def test_healthcheck_reports_desktop_runtime_when_enabled(monkeypatch) -> None:
    """Desktop runtime flag is reflected in health output."""
    expected_data_root = str(Path.home() / ".local" / "share" / "plot-your-path")
    monkeypatch.setenv("PYP_DESKTOP_RUNTIME", "true")
    monkeypatch.setenv("DATA_ROOT", expected_data_root)
    monkeypatch.setenv("BACKEND_HOST", "127.0.0.1")
    monkeypatch.setenv("BACKEND_PORT", "8765")
    monkeypatch.setenv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:8765")

    importlib.reload(config_module)
    reloaded_module = importlib.reload(main_module)

    try:
        with TestClient(reloaded_module.app) as client:
            response = client.get("/api/health")

        assert response.status_code == 200
        payload = response.json()
        assert payload["desktop_runtime"] is True
        assert payload["backend_port"] == 8765
        assert payload["data_root"] == expected_data_root
    finally:
        monkeypatch.delenv("PYP_DESKTOP_RUNTIME", raising=False)
        importlib.reload(config_module)
        importlib.reload(main_module)
