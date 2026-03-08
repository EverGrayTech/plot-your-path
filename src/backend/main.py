"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import Base, engine
from backend.routers import desirability, jobs, skills


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Ensure all known SQLAlchemy tables exist for the current database."""
    # Import models so SQLAlchemy metadata is fully populated before create_all.
    import backend.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Plot Your Path API",
    description="Backend API for job capture and career tracking",
    version="0.1.0",
    lifespan=lifespan,
)


# CORS middleware to allow the frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", settings.next_public_api_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(jobs.router, prefix="/api")
app.include_router(skills.router, prefix="/api")
app.include_router(desirability.router, prefix="/api")
