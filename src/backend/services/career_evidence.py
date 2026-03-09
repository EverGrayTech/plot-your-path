"""Career evidence ingestion and retrieval service."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date
from hashlib import sha256
from pathlib import Path

from sqlalchemy import or_
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models.career_evidence import CareerEvidence
from backend.schemas.career_evidence import (
    EvidenceQuery,
    EvidenceRetrievalResult,
    EvidenceSourceType,
    EvidenceUnit,
    JournalEvidenceEntry,
)
from backend.utils.file_storage import file_exists, load_file

EVIDENCE_SCHEMA_VERSION = "evidence-v1"
RESUME_ADAPTER_VERSION = "resume-adapter-v1"
JOURNAL_ADAPTER_VERSION = "journal-adapter-v1"
MANUAL_ADAPTER_VERSION = "manual-adapter-v1"


@dataclass(frozen=True)
class _RankedEvidence:
    item: CareerEvidence
    score: int


class CareerEvidenceService:
    """Ingest source content into shared evidence units and retrieve relevant context."""

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def _content_hash(body: str) -> str:
        normalized = " ".join(body.lower().split())
        return sha256(normalized.encode("utf-8")).hexdigest()

    @staticmethod
    def _normalize_tags(tags: list[str]) -> list[str]:
        seen: set[str] = set()
        normalized: list[str] = []
        for tag in tags:
            cleaned = tag.strip().lower()
            if not cleaned or cleaned in seen:
                continue
            seen.add(cleaned)
            normalized.append(cleaned)
        return normalized

    @staticmethod
    def _split_resume_sections(markdown: str) -> list[str]:
        sections: list[str] = []
        current: list[str] = []

        for line in markdown.splitlines():
            if line.strip().startswith("#") and current:
                chunk = "\n".join(current).strip()
                if chunk:
                    sections.append(chunk)
                current = [line]
                continue
            current.append(line)

        tail = "\n".join(current).strip()
        if tail:
            sections.append(tail)

        return sections

    @staticmethod
    def _build_resume_enrichment(section: str, section_index: int) -> dict[str, str | int | bool]:
        lines = [line.strip() for line in section.splitlines() if line.strip()]
        heading = ""
        if lines and lines[0].startswith("#"):
            heading = lines[0].lstrip("#").strip()

        bullet_count = sum(1 for line in lines if line.startswith(("-", "*")))
        keyword_matches = re.findall(r"[A-Za-z][A-Za-z0-9+.#-]{2,}", section)
        keyword_candidates = [match.lower() for match in keyword_matches]
        seen: set[str] = set()
        keywords: list[str] = []
        for keyword in keyword_candidates:
            if keyword in seen:
                continue
            seen.add(keyword)
            keywords.append(keyword)
            if len(keywords) >= 12:
                break

        return {
            "section_heading": heading,
            "section_index": section_index,
            "bullet_count": bullet_count,
            "has_heading": bool(heading),
            "keywords": ",".join(keywords),
        }

    @staticmethod
    def _to_unit(evidence: CareerEvidence) -> EvidenceUnit:
        return EvidenceUnit(
            id=evidence.id,
            source_type=evidence.source_type,
            source_record_id=evidence.source_record_id,
            source_key=evidence.source_key,
            body=evidence.body,
            tags=list(evidence.tags or []),
            timeframe_start=evidence.timeframe_start,
            timeframe_end=evidence.timeframe_end,
            provenance=dict(evidence.provenance or {}),
            resume_enrichment=dict(evidence.resume_enrichment or {}),
            schema_version=evidence.schema_version,
            content_hash=evidence.content_hash,
            created_at=evidence.created_at,
            updated_at=evidence.updated_at,
        )

    def _detect_resume_source(self, resume_markdown: str | None) -> tuple[str, str]:
        if resume_markdown is not None:
            return resume_markdown, "inline"

        profile_path = settings.candidate_profile_path
        if file_exists(profile_path):
            return load_file(profile_path), profile_path

        fallback_resume_path = str(Path(settings.data_root) / "resume.md")
        if file_exists(fallback_resume_path):
            return load_file(fallback_resume_path), fallback_resume_path

        return "", "missing"

    def _build_relevance_score(self, evidence: CareerEvidence, query: EvidenceQuery) -> int:
        score = 0
        body_lower = evidence.body.lower()
        tags_lower = {tag.lower() for tag in evidence.tags or []}

        for skill in query.skills:
            if skill.lower() in body_lower:
                score += 3

        for tag in query.tags:
            if tag.lower() in tags_lower:
                score += 4

        if query.query_text:
            query_lower = query.query_text.lower().strip()
            if query_lower and query_lower in body_lower:
                score += 2

        return score

    def _load_resume_markdown(self, resume_markdown: str | None) -> str:
        if resume_markdown is not None:
            return resume_markdown

        profile_path = settings.candidate_profile_path
        if file_exists(profile_path):
            return load_file(profile_path)

        fallback_resume_path = str(Path(settings.data_root) / "resume.md")
        if file_exists(fallback_resume_path):
            return load_file(fallback_resume_path)

        return ""

    def _upsert_evidence(
        self,
        *,
        body: str,
        provenance: dict[str, str | int | float | bool | None],
        resume_enrichment: dict[str, str | int | float | bool | None],
        source_key: str,
        source_record_id: str | None,
        source_type: EvidenceSourceType,
        tags: list[str],
        timeframe_end: date | None,
        timeframe_start: date | None,
    ) -> CareerEvidence:
        content_hash = self._content_hash(body)
        cleaned_tags = self._normalize_tags(tags)
        row = self.db.query(CareerEvidence).filter(CareerEvidence.source_key == source_key).first()

        if row is None:
            row = CareerEvidence(
                source_type=source_type.value,
                source_record_id=source_record_id,
                source_key=source_key,
                body=body,
                tags=cleaned_tags,
                timeframe_start=timeframe_start,
                timeframe_end=timeframe_end,
                provenance=provenance,
                resume_enrichment=resume_enrichment,
                schema_version=EVIDENCE_SCHEMA_VERSION,
                content_hash=content_hash,
            )
            self.db.add(row)
            self.db.flush()
            return row

        row.source_type = source_type.value
        row.source_record_id = source_record_id
        row.body = body
        row.tags = cleaned_tags
        row.timeframe_start = timeframe_start
        row.timeframe_end = timeframe_end
        row.provenance = provenance
        row.resume_enrichment = resume_enrichment
        row.schema_version = EVIDENCE_SCHEMA_VERSION
        row.content_hash = content_hash
        self.db.flush()
        return row

    def ingest_journal_entries(self, entries: list[JournalEvidenceEntry]) -> list[CareerEvidence]:
        """Map journal entries to the shared evidence contract (idempotent by record id)."""
        persisted: list[CareerEvidence] = []
        for entry in entries:
            source_key = f"{EvidenceSourceType.JOURNAL.value}:{entry.source_record_id}"
            provenance = {
                "adapter_version": JOURNAL_ADAPTER_VERSION,
                **dict(entry.provenance),
            }
            row = self._upsert_evidence(
                body=entry.body.strip(),
                provenance=provenance,
                source_key=source_key,
                source_record_id=entry.source_record_id,
                source_type=EvidenceSourceType.JOURNAL,
                tags=entry.tags,
                timeframe_end=entry.timeframe_end,
                timeframe_start=entry.timeframe_start,
                resume_enrichment={},
            )
            persisted.append(row)

        self.db.commit()
        for row in persisted:
            self.db.refresh(row)
        return persisted

    def ingest_manual_evidence(
        self,
        *,
        body: str,
        source_record_id: str,
        tags: list[str] | None = None,
        timeframe_end: date | None = None,
        timeframe_start: date | None = None,
    ) -> CareerEvidence:
        """Store manually-entered evidence in the shared contract."""
        source_key = f"{EvidenceSourceType.MANUAL.value}:{source_record_id}"
        row = self._upsert_evidence(
            body=body.strip(),
            provenance={"adapter_version": MANUAL_ADAPTER_VERSION},
            source_key=source_key,
            source_record_id=source_record_id,
            source_type=EvidenceSourceType.MANUAL,
            tags=tags or [],
            timeframe_end=timeframe_end,
            timeframe_start=timeframe_start,
            resume_enrichment={},
        )
        self.db.commit()
        self.db.refresh(row)
        return row

    def ingest_resume_markdown(
        self,
        *,
        resume_markdown: str | None = None,
        source_record_id: str = "resume.md",
    ) -> list[CareerEvidence]:
        """Map resume markdown into evidence units (idempotent by section key)."""
        raw = self._load_resume_markdown(resume_markdown).strip()
        if not raw:
            return []

        sections = self._split_resume_sections(raw)
        persisted: list[CareerEvidence] = []
        for index, section in enumerate(sections):
            body = section.strip()
            if not body:
                continue

            source_key = f"{EvidenceSourceType.RESUME.value}:{source_record_id}:section:{index:03d}"
            row = self._upsert_evidence(
                body=body,
                provenance={
                    "adapter_version": RESUME_ADAPTER_VERSION,
                    "section_index": index,
                    "source_record_id": source_record_id,
                },
                source_key=source_key,
                source_record_id=source_record_id,
                source_type=EvidenceSourceType.RESUME,
                tags=[],
                timeframe_end=None,
                timeframe_start=None,
                resume_enrichment=self._build_resume_enrichment(body, index),
            )
            persisted.append(row)

        self.db.commit()
        for row in persisted:
            self.db.refresh(row)
        return persisted

    def sync_resume_profile(
        self,
        *,
        resume_markdown: str | None = None,
        source_record_id: str = "resume.md",
    ) -> tuple[list[CareerEvidence], str]:
        """Sync resume source into evidence store and return records plus source used."""
        raw, source_used = self._detect_resume_source(resume_markdown)
        if not raw.strip():
            return [], source_used
        rows = self.ingest_resume_markdown(
            resume_markdown=raw,
            source_record_id=source_record_id,
        )
        return rows, source_used

    def load_context_text(self, query: EvidenceQuery) -> str:
        """Return concatenated evidence text for downstream prompt builders."""
        result = self.retrieve(query)
        if not result.items:
            resume_rows = self.ingest_resume_markdown()
            if resume_rows:
                result = self.retrieve(query)

        snippets = [item.body.strip() for item in result.items if item.body.strip()]
        return "\n\n".join(snippets)

    def retrieve(self, query: EvidenceQuery) -> EvidenceRetrievalResult:
        """Retrieve evidence by tags/skills/timeframe/relevance with deterministic fallback."""
        statement = self.db.query(CareerEvidence)

        if query.source_types:
            statement = statement.filter(
                CareerEvidence.source_type.in_([source.value for source in query.source_types])
            )

        if query.timeframe_start is not None:
            statement = statement.filter(
                or_(
                    CareerEvidence.timeframe_end.is_(None),
                    CareerEvidence.timeframe_end >= query.timeframe_start,
                )
            )

        if query.timeframe_end is not None:
            statement = statement.filter(
                or_(
                    CareerEvidence.timeframe_start.is_(None),
                    CareerEvidence.timeframe_start <= query.timeframe_end,
                )
            )

        rows = statement.order_by(CareerEvidence.updated_at.desc(), CareerEvidence.id.desc()).all()

        ranked = [
            _RankedEvidence(item=row, score=self._build_relevance_score(row, query)) for row in rows
        ]

        has_relevance_query = bool(query.skills or query.tags or query.query_text)
        if has_relevance_query:
            selected_ranked = [item for item in ranked if item.score > 0]
        else:
            selected_ranked = ranked
        selected_ranked = sorted(
            selected_ranked,
            key=lambda item: (item.score, item.item.updated_at, item.item.id),
            reverse=True,
        )

        selected = [entry.item for entry in selected_ranked[: query.limit]]
        fallback_used = False

        if len(selected) < min(query.min_results, query.limit):
            fallback_used = True
            selected_ids = {row.id for row in selected}
            for candidate in rows:
                if candidate.id in selected_ids:
                    continue
                selected.append(candidate)
                selected_ids.add(candidate.id)
                if len(selected) >= min(query.min_results, query.limit):
                    break

        selected = selected[: query.limit]
        return EvidenceRetrievalResult(
            items=[self._to_unit(item) for item in selected],
            fallback_used=fallback_used,
        )
