"""Desktop runtime launcher for packaged local execution."""

from __future__ import annotations

import os

import uvicorn

from backend.config import ensure_data_root_exists, settings
from backend.init_db import init_database


def run() -> None:
    """Start the packaged backend after preparing local storage."""
    ensure_data_root_exists()
    init_database()

    uvicorn.run(
        "backend.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        log_level=os.getenv("PYP_BACKEND_LOG_LEVEL", "info"),
        reload=False,
    )


if __name__ == "__main__":
    run()
