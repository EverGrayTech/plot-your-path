"""Career evidence schemas and retrieval contracts."""

from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class EvidenceSourceType(StrEnum):
    """Supported source types for evidence ingestion."""

    JOURNAL = "journal"
    MANUAL = "manual"
    RESUME = "resume"


class JournalEvidenceEntry(BaseModel):
    """Minimal journal entry payload that maps to shared evidence units."""

    source_record_id: str
    body: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)
    timeframe_start: date | None = None
    timeframe_end: date | None = None
    provenance: dict[str, str | int | float | bool | None] = Field(default_factory=dict)


class EvidenceQuery(BaseModel):
    """Stable retrieval query interface used by downstream prompt builders."""

    model_config = ConfigDict(extra="forbid")

    skills: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    query_text: str | None = None
    timeframe_start: date | None = None
    timeframe_end: date | None = None
    source_types: list[EvidenceSourceType] = Field(default_factory=list)
    limit: int = Field(default=10, ge=1, le=50)
    min_results: int = Field(default=3, ge=1, le=50)


class EvidenceUnit(BaseModel):
    """Shared minimal evidence representation for application/fit workflows."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    source_type: EvidenceSourceType
    source_record_id: str | None
    source_key: str
    body: str
    tags: list[str]
    timeframe_start: date | None
    timeframe_end: date | None
    provenance: dict[str, str | int | float | bool | None]
    resume_enrichment: dict[str, str | int | float | bool | None]
    schema_version: str
    content_hash: str
    created_at: datetime
    updated_at: datetime


class EvidenceRetrievalResult(BaseModel):
    """Retrieval output plus deterministic fallback metadata."""

    items: list[EvidenceUnit]
    fallback_used: bool
