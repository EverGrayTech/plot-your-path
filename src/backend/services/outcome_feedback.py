"""Outcome feedback service for downstream conversion insights and manual tuning hints."""

from __future__ import annotations

from collections import defaultdict

from sqlalchemy.orm import Session

from backend.models.application_material import ApplicationMaterial
from backend.models.desirability_score_result import DesirabilityScoreResult
from backend.models.outcome_event import OutcomeEvent
from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.schemas.job import OutcomeConversionRow, OutcomeEventCreate, TuningSuggestion


class OutcomeFeedbackService:
    """Persist and aggregate hiring outcome feedback signals."""

    def __init__(self, db: Session) -> None:
        """Initialize service with DB session."""
        self.db = db

    @staticmethod
    def _confidence_message(total_events: int) -> str:
        """Return confidence guidance based on sample size."""
        if total_events < 5:
            return (
                "Insufficient data: fewer than 5 outcomes logged. Treat trends as directional only."
            )
        if total_events < 15:
            return "Low confidence: early signal only. Keep logging outcomes before making major changes."
        return (
            "Moderate confidence: trends are useful, but continue validating with fresh outcomes."
        )

    @staticmethod
    def _fit_band(score: int | None) -> str:
        """Map fit score to coarse band for conversion reporting."""
        if score is None:
            return "unknown"
        if score < 40:
            return "0-39"
        if score < 70:
            return "40-69"
        return "70-100"

    @staticmethod
    def _model_family(model_family: str | None, model: str | None) -> str:
        """Resolve model family using explicit field, then model-name heuristic."""
        if model_family:
            return model_family
        candidate = (model or "").lower()
        if "gpt" in candidate or "o1" in candidate or "o3" in candidate:
            return "openai"
        if "claude" in candidate:
            return "anthropic"
        if candidate:
            return "other"
        return "unknown"

    @staticmethod
    def _score_band(score: float | None) -> str:
        """Map desirability score to coarse band for conversion reporting."""
        if score is None:
            return "unknown"
        if score < 4:
            return "0.0-3.9"
        if score < 7:
            return "4.0-6.9"
        return "7.0-10.0"

    def _conversion_rows(self, grouped: dict[str, dict[str, int]]) -> list[OutcomeConversionRow]:
        """Convert grouped counters into API rows sorted by segment label."""
        rows: list[OutcomeConversionRow] = []
        for segment in sorted(grouped.keys()):
            attempts = grouped[segment]["attempts"]
            hires = grouped[segment]["hires"]
            rows.append(
                OutcomeConversionRow(
                    attempts=attempts,
                    conversion_rate=(hires / attempts) if attempts else None,
                    hires=hires,
                    segment=segment,
                )
            )
        return rows

    def _linked_desirability_score(self, row: OutcomeEvent) -> float | None:
        """Fetch desirability total score linked directly or via latest role score."""
        if row.desirability_score_id:
            score = (
                self.db.query(DesirabilityScoreResult)
                .filter(DesirabilityScoreResult.id == row.desirability_score_id)
                .first()
            )
            if score is not None:
                return score.total_score

        latest = (
            self.db.query(DesirabilityScoreResult)
            .filter(DesirabilityScoreResult.role_id == row.role_id)
            .order_by(DesirabilityScoreResult.created_at.desc(), DesirabilityScoreResult.id.desc())
            .first()
        )
        return latest.total_score if latest else None

    def _linked_fit_score(self, row: OutcomeEvent) -> int | None:
        """Fetch fit score linked directly or via latest role fit analysis."""
        if row.fit_analysis_id:
            fit = (
                self.db.query(RoleFitAnalysis)
                .filter(RoleFitAnalysis.id == row.fit_analysis_id)
                .first()
            )
            if fit is not None:
                return fit.fit_score

        latest = (
            self.db.query(RoleFitAnalysis)
            .filter(RoleFitAnalysis.role_id == row.role_id)
            .order_by(RoleFitAnalysis.created_at.desc(), RoleFitAnalysis.id.desc())
            .first()
        )
        return latest.fit_score if latest else None

    def _validate_links(self, payload: OutcomeEventCreate, role_id: int) -> None:
        """Validate optional linked records belong to the same role when supplied."""
        if payload.application_material_id is not None:
            material = (
                self.db.query(ApplicationMaterial)
                .filter(ApplicationMaterial.id == payload.application_material_id)
                .first()
            )
            if material is None or material.role_id != role_id:
                raise ValueError("Application material link is invalid for this role")

        if payload.fit_analysis_id is not None:
            fit = (
                self.db.query(RoleFitAnalysis)
                .filter(RoleFitAnalysis.id == payload.fit_analysis_id)
                .first()
            )
            if fit is None or fit.role_id != role_id:
                raise ValueError("Fit analysis link is invalid for this role")

        if payload.desirability_score_id is not None:
            desirability = (
                self.db.query(DesirabilityScoreResult)
                .filter(DesirabilityScoreResult.id == payload.desirability_score_id)
                .first()
            )
            if desirability is None or desirability.role_id != role_id:
                raise ValueError("Desirability score link is invalid for this role")

    def create_event(self, payload: OutcomeEventCreate, role_id: int) -> OutcomeEvent:
        """Create outcome event and enrich model/prompt metadata from linked records."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if role is None:
            raise LookupError("Job not found")

        self._validate_links(payload, role_id)

        model = None
        model_family = None
        prompt_version = None

        if payload.application_material_id is not None:
            material = (
                self.db.query(ApplicationMaterial)
                .filter(ApplicationMaterial.id == payload.application_material_id)
                .first()
            )
            if material is not None:
                model = material.model
                model_family = material.provider
                prompt_version = material.prompt_version

        if model is None and payload.fit_analysis_id is not None:
            fit = (
                self.db.query(RoleFitAnalysis)
                .filter(RoleFitAnalysis.id == payload.fit_analysis_id)
                .first()
            )
            if fit is not None:
                model = fit.model
                model_family = fit.provider
                prompt_version = fit.version

        if model is None and payload.desirability_score_id is not None:
            desirability = (
                self.db.query(DesirabilityScoreResult)
                .filter(DesirabilityScoreResult.id == payload.desirability_score_id)
                .first()
            )
            if desirability is not None:
                model = desirability.model
                model_family = desirability.provider
                prompt_version = desirability.version

        row = OutcomeEvent(
            application_material_id=payload.application_material_id,
            desirability_score_id=payload.desirability_score_id,
            event_type=payload.event_type.value,
            fit_analysis_id=payload.fit_analysis_id,
            model=model,
            model_family=model_family,
            notes=payload.notes.strip() if payload.notes else None,
            occurred_at=payload.occurred_at,
            prompt_version=prompt_version,
            role_id=role_id,
        )
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def get_insights(
        self,
    ) -> tuple[
        str,
        list[OutcomeConversionRow],
        list[OutcomeConversionRow],
        list[OutcomeConversionRow],
        int,
        int,
    ]:
        """Aggregate conversion by fit band, desirability band, and model family."""
        rows = self.db.query(OutcomeEvent).order_by(OutcomeEvent.occurred_at.desc()).all()
        grouped_fit: dict[str, dict[str, int]] = defaultdict(lambda: {"attempts": 0, "hires": 0})
        grouped_desirability: dict[str, dict[str, int]] = defaultdict(
            lambda: {"attempts": 0, "hires": 0}
        )
        grouped_model: dict[str, dict[str, int]] = defaultdict(lambda: {"attempts": 0, "hires": 0})

        roles_with_outcomes = {row.role_id for row in rows}
        for row in rows:
            is_hire = row.event_type == "offer"

            fit_band = self._fit_band(self._linked_fit_score(row))
            grouped_fit[fit_band]["attempts"] += 1
            grouped_fit[fit_band]["hires"] += 1 if is_hire else 0

            desirability_band = self._score_band(self._linked_desirability_score(row))
            grouped_desirability[desirability_band]["attempts"] += 1
            grouped_desirability[desirability_band]["hires"] += 1 if is_hire else 0

            model_family = self._model_family(row.model_family, row.model)
            grouped_model[model_family]["attempts"] += 1
            grouped_model[model_family]["hires"] += 1 if is_hire else 0

        return (
            self._confidence_message(len(rows)),
            self._conversion_rows(grouped_fit),
            self._conversion_rows(grouped_desirability),
            self._conversion_rows(grouped_model),
            len(rows),
            len(roles_with_outcomes),
        )

    def get_tuning_suggestions(self) -> tuple[str, list[TuningSuggestion]]:
        """Build explainable, reversible suggestions from model-family conversion deltas."""
        (
            confidence_message,
            _,
            _,
            conversion_by_model_family,
            total_events,
            _,
        ) = self.get_insights()

        if total_events < 5:
            return (
                confidence_message,
                [
                    TuningSuggestion(
                        recommendation="Keep current prompt/model settings unchanged for now.",
                        rationale="Not enough outcomes yet to distinguish signal from noise.",
                        reversible_action="Continue logging outcomes until at least 5 events are captured.",
                    )
                ],
            )

        eligible = [row for row in conversion_by_model_family if row.attempts >= 2]
        if len(eligible) < 2:
            return (
                confidence_message,
                [
                    TuningSuggestion(
                        recommendation="Run a small manual A/B model trial.",
                        rationale="Current outcomes do not have enough multi-model coverage.",
                        reversible_action="Route next 3-5 generations to a second model family and compare outcomes.",
                    )
                ],
            )

        best = max(eligible, key=lambda row: row.conversion_rate or 0)
        worst = min(eligible, key=lambda row: row.conversion_rate or 0)
        suggestions = [
            TuningSuggestion(
                recommendation=(
                    f"Prefer {best.segment} for new application materials when practical."
                ),
                rationale=(
                    f"Observed offer conversion is {(best.conversion_rate or 0) * 100:.1f}% for "
                    f"{best.segment} vs {(worst.conversion_rate or 0) * 100:.1f}% for {worst.segment}."
                ),
                reversible_action="Switch one operation family at a time and re-check insights after 5 additional outcomes.",
            )
        ]
        return confidence_message, suggestions

    def list_events_for_role(self, role_id: int) -> list[OutcomeEvent]:
        """List outcome events for a specific role in descending event time."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if role is None:
            raise LookupError("Job not found")

        return (
            self.db.query(OutcomeEvent)
            .filter(OutcomeEvent.role_id == role_id)
            .order_by(OutcomeEvent.occurred_at.desc(), OutcomeEvent.id.desc())
            .all()
        )
