"""CLI-level tests for capture.py delegation behavior."""

from __future__ import annotations

import importlib.util
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from pathlib import Path

import pytest


def _load_capture_module():
    """Load capture.py as a module for tests without relying on import path."""
    repo_root = Path(__file__).resolve().parents[2]
    capture_path = repo_root / "capture.py"
    spec = importlib.util.spec_from_file_location("capture_module", capture_path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


capture = _load_capture_module()


@pytest.mark.asyncio
async def test_capture_cli_url_mode_delegates_to_service(tmp_path, monkeypatch):
    """Default mode should call capture_from_url on JobCaptureService."""
    monkeypatch.setattr("sys.argv", ["capture.py", "https://example.com/jobs/123"])

    fake_result = SimpleNamespace(
        status="success",
        role_id=1,
        company="Acme",
        title="Backend Engineer",
        skills_extracted=3,
        processing_time_seconds=0.1,
    )

    fake_service = MagicMock()
    fake_service.capture_from_url = AsyncMock(return_value=fake_result)

    fake_db = MagicMock()

    with (
        patch("backend.config.settings.data_root", str(tmp_path)),
        patch("backend.config.settings.database_url", f"sqlite:///{tmp_path}/test.db"),
        patch("backend.database.Base.metadata.create_all"),
        patch("backend.database.SessionLocal", return_value=fake_db),
        patch("backend.services.job_capture.JobCaptureService", return_value=fake_service),
    ):
        await capture.main()

    fake_service.capture_from_url.assert_awaited_once_with("https://example.com/jobs/123")
    fake_db.close.assert_called_once()


@pytest.mark.asyncio
async def test_capture_cli_clip_mode_delegates_to_service(tmp_path, monkeypatch):
    """--clip mode should read clipboard and call capture_from_clipboard_text."""
    monkeypatch.setattr(
        "sys.argv",
        ["capture.py", "--clip", "https://www.linkedin.com/jobs/view/99999"],
    )

    fake_result = SimpleNamespace(
        status="success",
        role_id=2,
        company="ClipCo",
        title="Platform Engineer",
        skills_extracted=2,
        processing_time_seconds=0.1,
    )

    fake_service = MagicMock()
    fake_service.capture_from_url = AsyncMock()
    fake_service.capture_from_clipboard_text = AsyncMock(return_value=fake_result)

    fake_db = MagicMock()

    with (
        patch.object(capture, "read_clipboard", return_value="copied job text"),
        patch("backend.config.settings.data_root", str(tmp_path)),
        patch("backend.config.settings.database_url", f"sqlite:///{tmp_path}/test.db"),
        patch("backend.database.Base.metadata.create_all"),
        patch("backend.database.SessionLocal", return_value=fake_db),
        patch("backend.services.job_capture.JobCaptureService", return_value=fake_service),
    ):
        await capture.main()

    fake_service.capture_from_url.assert_not_called()
    fake_service.capture_from_clipboard_text.assert_awaited_once_with(
        "https://www.linkedin.com/jobs/view/99999",
        "copied job text",
    )
    fake_db.close.assert_called_once()
