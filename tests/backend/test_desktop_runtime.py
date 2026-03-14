"""Tests for packaged desktop backend startup."""

from unittest.mock import patch

from backend.desktop_runtime import run


def test_run_prepares_storage_before_launch() -> None:
    """Desktop launcher creates the data root, initializes the DB, and starts uvicorn."""
    with (
        patch("backend.desktop_runtime.ensure_data_root_exists") as ensure_mock,
        patch("backend.desktop_runtime.init_database") as init_db_mock,
        patch("backend.desktop_runtime.uvicorn.run") as uvicorn_run_mock,
    ):
        run()

    ensure_mock.assert_called_once_with()
    init_db_mock.assert_called_once_with()
    uvicorn_run_mock.assert_called_once()
