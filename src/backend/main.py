"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import is_desktop_runtime_enabled, settings
from backend.routers import ai_settings, desirability, jobs, skills, system


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Load application metadata needed during runtime startup."""
    # Import models so SQLAlchemy metadata is populated for explicit init/migration commands.
    import backend.models  # noqa: F401

    yield


app = FastAPI(
    title="Plot Your Path API",
    description="Backend API for job capture and career tracking",
    version="0.1.0",
    lifespan=lifespan,
)


def _allowed_origin_pattern() -> str:
    """Return the CORS origin regex for browser and packaged runtimes."""
    return (
        r"^(https?://(localhost|127\.0\.0\.1)(:\d+)?|"
        r"tauri://localhost|https?://tauri\.localhost)$"
    )


# CORS middleware to allow the frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=_allowed_origin_pattern(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def healthcheck() -> dict[str, object]:
    """Return runtime status for launch orchestration and troubleshooting."""
    return {
        "status": "ok",
        "desktop_runtime": is_desktop_runtime_enabled(),
        "data_root": settings.data_root,
        "backend_port": settings.backend_port,
    }


# Mount routers
app.include_router(jobs.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(desirability.router, prefix="/api")
app.include_router(ai_settings.router, prefix="/api")
app.include_router(system.router, prefix="/api")
