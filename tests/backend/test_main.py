"""Tests for FastAPI app startup behavior."""

from __future__ import annotations

from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.main import app


def test_app_startup_does_not_create_tables_implicitly() -> None:
    """Serving startup should not mutate schema automatically."""

    with patch("backend.database.Base.metadata.create_all") as create_all_mock:
        with TestClient(app):
            pass

    create_all_mock.assert_not_called()
