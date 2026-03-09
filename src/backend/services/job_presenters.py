"""Presentation helpers for job-related API responses."""

from __future__ import annotations

from datetime import datetime

from backend.models.application_material import ApplicationMaterial as ApplicationMaterialModel
from backend.models.application_ops import ApplicationOps as ApplicationOpsModel
from backend.models.desirability_score_result import DesirabilityScoreResult
from backend.models.interview_stage_event import InterviewStageEvent as InterviewStageEventModel
from backend.models.outcome_event import OutcomeEvent as OutcomeEventModel
from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.models.role_status_change import RoleStatusChange as RoleStatusChangeModel
from backend.schemas.desirability import DesirabilityScore
from backend.schemas.job import (
    ApplicationMaterial,
    ApplicationOps,
    FitAnalysis,
    InterviewPrepPack,
    InterviewPrepPackSections,
    InterviewPrepSectionKey,
    InterviewStage,
    InterviewStageEvent,
    OutcomeEvent,
    OutcomeEventType,
    ResumeTuningSections,
    ResumeTuningSuggestion,
    RoleStatus,
    RoleStatusChange,
)
from backend.utils.file_storage import file_exists, load_file


def application_ops_attention(
    application_ops: ApplicationOpsModel | None,
    *,
    now: datetime,
) -> tuple[bool, list[str]]:
    """Compute whether a role needs attention based on ops metadata."""
    if application_ops is None:
        return True, ["No application ops metadata"]

    reasons: list[str] = []
    if application_ops.next_action_at is None:
        reasons.append("Missing next action")
    elif application_ops.next_action_at < now:
        reasons.append("Overdue next action")

    if application_ops.deadline_at is not None and application_ops.deadline_at < now:
        reasons.append("Deadline passed")

    return len(reasons) > 0, reasons


def build_salary_range(role: Role) -> str | None:
    """Build a human-readable salary range string from a role record."""
    if not role.salary_min and not role.salary_max:
        return None

    currency = role.salary_currency or "USD"
    symbol = "$" if currency == "USD" else ""
    if role.salary_min and role.salary_max:
        return f"{symbol}{role.salary_min:,} - {symbol}{role.salary_max:,} {currency}"
    if role.salary_min:
        return f"{symbol}{role.salary_min:,}+ {currency}"
    return f"Up to {symbol}{role.salary_max:,} {currency}"


def load_markdown_content(path: str | None) -> str:
    """Load Markdown content from disk with a graceful empty fallback."""
    if not path or not file_exists(path):
        return ""
    return load_file(path)


def to_application_material_schema(material: ApplicationMaterialModel) -> ApplicationMaterial:
    """Convert ORM application-material row to response schema."""
    return ApplicationMaterial(
        id=material.id,
        role_id=material.role_id,
        artifact_type=material.artifact_type,
        version=material.version,
        content=load_markdown_content(material.content_path),
        questions=list(material.questions or []) or None,
        section_traceability=list(getattr(material, "section_traceability", []) or []),
        unsupported_claims=list(getattr(material, "unsupported_claims", []) or []),
        provider=material.provider,
        model=material.model,
        prompt_version=material.prompt_version,
        created_at=material.created_at,
    )


def to_application_ops_schema(
    role_id: int,
    application_ops: ApplicationOpsModel,
    *,
    now: datetime,
) -> ApplicationOps:
    """Convert ORM application-ops row to response schema with attention signals."""
    needs_attention, reasons = application_ops_attention(application_ops, now=now)
    return ApplicationOps(
        role_id=role_id,
        applied_at=application_ops.applied_at,
        deadline_at=application_ops.deadline_at,
        source=application_ops.source,
        recruiter_contact=application_ops.recruiter_contact,
        notes=application_ops.notes,
        next_action_at=application_ops.next_action_at,
        needs_attention=needs_attention,
        attention_reasons=reasons,
        created_at=application_ops.created_at,
        updated_at=application_ops.updated_at,
    )


def to_desirability_score_schema(score: DesirabilityScoreResult) -> DesirabilityScore:
    """Convert ORM desirability row to response schema."""
    return DesirabilityScore(
        id=score.id,
        company_id=score.company_id,
        role_id=score.role_id,
        total_score=score.total_score,
        factor_breakdown=list(score.factor_breakdown or []),
        provider=score.provider,
        model=score.model,
        version=score.version,
        created_at=score.created_at,
    )


def to_fit_analysis_schema(analysis: RoleFitAnalysis) -> FitAnalysis:
    """Convert ORM fit-analysis row to response schema."""
    return FitAnalysis(
        id=analysis.id,
        role_id=analysis.role_id,
        fit_score=analysis.fit_score,
        recommendation=analysis.recommendation,
        covered_required_skills=list(analysis.covered_required_skills or []),
        missing_required_skills=list(analysis.missing_required_skills or []),
        covered_preferred_skills=list(analysis.covered_preferred_skills or []),
        missing_preferred_skills=list(analysis.missing_preferred_skills or []),
        rationale=analysis.rationale,
        rationale_citations=list(analysis.rationale_citations or []),
        unsupported_claims=list(analysis.unsupported_claims or []),
        provider=analysis.provider,
        model=analysis.model,
        version=analysis.version,
        created_at=analysis.created_at,
    )


def to_interview_prep_pack_schema(material: ApplicationMaterialModel) -> InterviewPrepPack:
    """Convert ORM interview-prep row to response schema."""
    sections = material.sections or {}
    return InterviewPrepPack(
        id=material.id,
        role_id=material.role_id,
        artifact_type=material.artifact_type,
        version=material.version,
        sections=InterviewPrepPackSections(
            likely_questions=list(sections.get(InterviewPrepSectionKey.LIKELY_QUESTIONS.value, [])),
            talking_points=list(sections.get(InterviewPrepSectionKey.TALKING_POINTS.value, [])),
            star_stories=list(sections.get(InterviewPrepSectionKey.STAR_STORIES.value, [])),
        ),
        provider=material.provider,
        model=material.model,
        prompt_version=material.prompt_version,
        section_traceability=list(getattr(material, "section_traceability", []) or []),
        unsupported_claims=list(getattr(material, "unsupported_claims", []) or []),
        created_at=material.created_at,
    )


def to_interview_stage_event_schema(row: InterviewStageEventModel) -> InterviewStageEvent:
    """Convert ORM interview-stage row to API schema."""
    return InterviewStageEvent(
        id=row.id,
        role_id=row.role_id,
        stage=InterviewStage(row.stage),
        notes=row.notes,
        occurred_at=row.occurred_at,
        created_at=row.created_at,
    )


def to_interview_stage_timeline_schema(
    rows: list[InterviewStageEventModel],
) -> list[InterviewStageEvent]:
    """Convert interview-stage rows to API timeline schema."""
    return [to_interview_stage_event_schema(row) for row in rows]


def to_outcome_event_schema(row: OutcomeEventModel) -> OutcomeEvent:
    """Convert ORM outcome-event row to API schema."""
    return OutcomeEvent(
        application_material_id=row.application_material_id,
        created_at=row.created_at,
        desirability_score_id=row.desirability_score_id,
        event_type=OutcomeEventType(row.event_type),
        fit_analysis_id=row.fit_analysis_id,
        id=row.id,
        model=row.model,
        model_family=row.model_family,
        notes=row.notes,
        occurred_at=row.occurred_at,
        prompt_version=row.prompt_version,
        role_id=row.role_id,
    )


def to_resume_tuning_schema(material: ApplicationMaterialModel) -> ResumeTuningSuggestion:
    """Convert ORM resume-tuning row to response schema."""
    sections = material.sections or {}
    return ResumeTuningSuggestion(
        id=material.id,
        role_id=material.role_id,
        artifact_type=material.artifact_type,
        version=material.version,
        sections=ResumeTuningSections(
            keep_bullets=list(sections.get("keep_bullets", [])),
            remove_bullets=list(sections.get("remove_bullets", [])),
            emphasize_bullets=list(sections.get("emphasize_bullets", [])),
            missing_keywords=list(sections.get("missing_keywords", [])),
            summary_tweaks=list(sections.get("summary_tweaks", [])),
            confidence_notes=list(sections.get("confidence_notes", [])),
        ),
        provider=material.provider,
        model=material.model,
        prompt_version=material.prompt_version,
        section_traceability=list(getattr(material, "section_traceability", []) or []),
        unsupported_claims=list(getattr(material, "unsupported_claims", []) or []),
        created_at=material.created_at,
    )


def to_status_history_schema(rows: list[RoleStatusChangeModel]) -> list[RoleStatusChange]:
    """Convert ORM status-change rows to API schema."""
    return [
        RoleStatusChange(
            from_status=RoleStatus(row.from_status) if row.from_status else None,
            to_status=RoleStatus(row.to_status),
            changed_at=row.changed_at,
        )
        for row in rows
    ]
