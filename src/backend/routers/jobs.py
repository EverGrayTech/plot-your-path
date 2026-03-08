"""Jobs API router - scrape, list, detail, and status update endpoints."""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.application_material import ApplicationMaterial as ApplicationMaterialModel
from backend.models.application_ops import ApplicationOps as ApplicationOpsModel
from backend.models.company import Company
from backend.models.desirability_score_result import DesirabilityScoreResult
from backend.models.interview_stage_event import InterviewStageEvent as InterviewStageEventModel
from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.models.role_skill import RoleSkill
from backend.models.role_status_change import RoleStatusChange as RoleStatusChangeModel
from backend.schemas.company import Company as CompanySchema
from backend.schemas.desirability import DesirabilityScore
from backend.schemas.job import (
    ApplicationMaterial,
    ApplicationMaterialQARequest,
    ApplicationOps,
    ApplicationOpsUpdate,
    FitAnalysis,
    InterviewPrepPack,
    InterviewPrepPackEditRequest,
    InterviewPrepPackRegenerateRequest,
    InterviewPrepPackSections,
    InterviewPrepSectionKey,
    InterviewStage,
    InterviewStageEvent,
    InterviewStageEventCreate,
    JobDetail,
    JobListItem,
    JobScrapeRequest,
    JobScrapeResponse,
    PipelineCounters,
    PipelineItem,
    PipelineResponse,
    RoleStatus,
    RoleStatusChange,
    SalaryInfo,
)
from backend.services.application_materials import ApplicationMaterialsService
from backend.services.desirability_scorer import DesirabilityScoringService
from backend.services.fit_analyzer import FitAnalysisService
from backend.services.job_capture import (
    JobCaptureLLMError,
    JobCapturePersistenceError,
    JobCaptureScrapingError,
    JobCaptureService,
)
from backend.services.skill_extractor import SkillExtractorService
from backend.utils.file_storage import file_exists, load_file

router = APIRouter()


class StatusUpdate(BaseModel):
    """Schema for updating a job's status."""

    status: RoleStatus


class NextActionUpdate(BaseModel):
    """Payload for updating only next-action datetime."""

    next_action_at: datetime | None


def _application_ops_attention(
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


def _build_salary_range(role: Role) -> str | None:
    """
    Build a human-readable salary range string from a Role record.

    Args:
        role: Role ORM instance

    Returns:
        Formatted salary string, or None if no salary info is present
    """
    if not role.salary_min and not role.salary_max:
        return None
    currency = role.salary_currency or "USD"
    symbol = "$" if currency == "USD" else ""
    if role.salary_min and role.salary_max:
        return f"{symbol}{role.salary_min:,} - {symbol}{role.salary_max:,} {currency}"
    elif role.salary_min:
        return f"{symbol}{role.salary_min:,}+ {currency}"
    else:
        return f"Up to {symbol}{role.salary_max:,} {currency}"


def _build_status_history(role_id: int, db: Session) -> list[RoleStatusChange]:
    """Build status history in chronological order for a role."""
    rows = (
        db.query(RoleStatusChangeModel)
        .filter(RoleStatusChangeModel.role_id == role_id)
        .order_by(RoleStatusChangeModel.changed_at.asc(), RoleStatusChangeModel.id.asc())
        .all()
    )

    return [
        RoleStatusChange(
            from_status=RoleStatus(row.from_status) if row.from_status else None,
            to_status=RoleStatus(row.to_status),
            changed_at=row.changed_at,
        )
        for row in rows
    ]


def _build_interview_stage_timeline(role_id: int, db: Session) -> list[InterviewStageEvent]:
    """Build interview stage timeline in chronological order for a role."""
    rows = (
        db.query(InterviewStageEventModel)
        .filter(InterviewStageEventModel.role_id == role_id)
        .order_by(InterviewStageEventModel.occurred_at.asc(), InterviewStageEventModel.id.asc())
        .all()
    )
    return [
        InterviewStageEvent(
            id=row.id,
            role_id=row.role_id,
            stage=InterviewStage(row.stage),
            notes=row.notes,
            occurred_at=row.occurred_at,
            created_at=row.created_at,
        )
        for row in rows
    ]


def _current_interview_stage(role_id: int, db: Session) -> InterviewStage | None:
    """Fetch latest interview stage for a role."""
    row = (
        db.query(InterviewStageEventModel)
        .filter(InterviewStageEventModel.role_id == role_id)
        .order_by(InterviewStageEventModel.occurred_at.desc(), InterviewStageEventModel.id.desc())
        .first()
    )
    if row is None:
        return None
    return InterviewStage(row.stage)


def _to_application_ops_schema(
    role_id: int,
    application_ops: ApplicationOpsModel,
    *,
    now: datetime,
) -> ApplicationOps:
    """Convert ORM application-ops row to response schema with attention signals."""
    needs_attention, reasons = _application_ops_attention(application_ops, now=now)
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


def _to_fit_analysis_schema(analysis: RoleFitAnalysis) -> FitAnalysis:
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
        provider=analysis.provider,
        model=analysis.model,
        version=analysis.version,
        created_at=analysis.created_at,
    )


def _to_application_material_schema(material: ApplicationMaterialModel) -> ApplicationMaterial:
    """Convert ORM application-material row to response schema."""
    content = load_file(material.content_path) if file_exists(material.content_path) else ""
    return ApplicationMaterial(
        id=material.id,
        role_id=material.role_id,
        artifact_type=material.artifact_type,
        version=material.version,
        content=content,
        questions=list(material.questions or []) or None,
        provider=material.provider,
        model=material.model,
        prompt_version=material.prompt_version,
        created_at=material.created_at,
    )


def _to_interview_prep_pack_schema(material: ApplicationMaterialModel) -> InterviewPrepPack:
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
        created_at=material.created_at,
    )


def _to_desirability_score_schema(score: DesirabilityScoreResult) -> DesirabilityScore:
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


def _role_or_404(role_id: int, db: Session) -> Role:
    """Fetch role or raise 404."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return role


@router.get("/jobs", response_model=list[JobListItem])
def list_jobs(db: Annotated[Session, Depends(get_db)]) -> list[JobListItem]:
    """
    List all captured job postings.

    Returns:
        List of job summaries ordered by most recently captured.
    """
    rows = (
        db.query(Role, Company)
        .join(Company, Role.company_id == Company.id)
        .order_by(Role.created_at.desc())
        .all()
    )

    result: list[JobListItem] = []
    now = datetime.now(UTC).replace(tzinfo=None)
    for role, company in rows:
        application_ops = (
            db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role.id).first()
        )
        needs_attention, _ = _application_ops_attention(application_ops, now=now)
        skills_count = db.query(RoleSkill).filter(RoleSkill.role_id == role.id).count()
        latest_fit = (
            db.query(RoleFitAnalysis)
            .filter(RoleFitAnalysis.role_id == role.id)
            .order_by(RoleFitAnalysis.created_at.desc(), RoleFitAnalysis.id.desc())
            .first()
        )
        latest_desirability = (
            db.query(DesirabilityScoreResult)
            .filter(DesirabilityScoreResult.company_id == company.id)
            .order_by(DesirabilityScoreResult.created_at.desc(), DesirabilityScoreResult.id.desc())
            .first()
        )
        result.append(
            JobListItem(
                id=role.id,
                company=company.name,
                title=role.title,
                salary_range=_build_salary_range(role),
                created_at=role.created_at,
                skills_count=skills_count,
                status=RoleStatus(role.status),
                fit_score=latest_fit.fit_score if latest_fit else None,
                fit_recommendation=latest_fit.recommendation if latest_fit else None,
                desirability_score=(
                    latest_desirability.total_score if latest_desirability else None
                ),
                current_interview_stage=_current_interview_stage(role.id, db),
                deadline_at=application_ops.deadline_at if application_ops else None,
                next_action_at=application_ops.next_action_at if application_ops else None,
                needs_attention=needs_attention,
            )
        )
    return result


@router.get("/jobs/pipeline", response_model=PipelineResponse)
def list_jobs_pipeline(
    db: Annotated[Session, Depends(get_db)],
    overdue_only: bool = False,
    this_week_deadlines: bool = False,
    recently_updated: bool = False,
) -> PipelineResponse:
    """List operational pipeline view with urgency filters and counters."""
    now = datetime.now(UTC).replace(tzinfo=None)
    week_end = now + timedelta(days=7)
    recently_cutoff = now - timedelta(days=3)

    rows = (
        db.query(Role, Company, ApplicationOpsModel)
        .join(Company, Role.company_id == Company.id)
        .outerjoin(ApplicationOpsModel, ApplicationOpsModel.role_id == Role.id)
        .order_by(Role.created_at.desc())
        .all()
    )

    items: list[PipelineItem] = []
    for role, company, application_ops in rows:
        needs_attention, reasons = _application_ops_attention(application_ops, now=now)
        current_stage = _current_interview_stage(role.id, db)
        updated_at = application_ops.updated_at if application_ops else role.created_at
        next_action_at = application_ops.next_action_at if application_ops else None
        deadline_at = application_ops.deadline_at if application_ops else None

        if overdue_only and (next_action_at is None or next_action_at >= now):
            continue
        if this_week_deadlines and (
            deadline_at is None or deadline_at < now or deadline_at > week_end
        ):
            continue
        if recently_updated and updated_at < recently_cutoff:
            continue

        items.append(
            PipelineItem(
                role_id=role.id,
                company=company.name,
                title=role.title,
                status=RoleStatus(role.status),
                interview_stage=current_stage,
                next_action_at=next_action_at,
                deadline_at=deadline_at,
                needs_attention=needs_attention,
                attention_reasons=reasons,
                updated_at=updated_at,
            )
        )

    counters = PipelineCounters(
        needs_follow_up=sum(1 for item in items if "Missing next action" in item.attention_reasons),
        overdue_actions=sum(1 for item in items if "Overdue next action" in item.attention_reasons),
        upcoming_deadlines=sum(
            1
            for item in items
            if item.deadline_at is not None and now <= item.deadline_at <= week_end
        ),
    )
    return PipelineResponse(counters=counters, items=items)


@router.get("/jobs/{role_id}", response_model=JobDetail)
def get_job(role_id: int, db: Annotated[Session, Depends(get_db)]) -> JobDetail:
    """
    Get detailed information for a specific job posting.

    Args:
        role_id: The numeric ID of the role.

    Returns:
        Full job detail including skills and Markdown description.

    Raises:
        HTTPException 404: If the job is not found.
    """
    role = _role_or_404(role_id, db)

    company = db.query(Company).filter(Company.id == role.company_id).first()

    # Load cleaned Markdown from disk (graceful fallback)
    description_md = ""
    if role.cleaned_md_path and file_exists(role.cleaned_md_path):
        description_md = load_file(role.cleaned_md_path)

    # Fetch associated skills
    extractor = SkillExtractorService(db)
    skills = extractor.get_skills_for_role(role_id)
    latest_fit = FitAnalysisService(db).get_latest_for_role(role_id)
    latest_desirability = DesirabilityScoringService(db).get_latest_for_role(role_id)
    application_ops = (
        db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role_id).first()
    )
    now = datetime.now(UTC).replace(tzinfo=None)

    return JobDetail(
        id=role.id,
        company=CompanySchema.model_validate(company),
        title=role.title,
        team_division=role.team_division,
        salary=SalaryInfo(
            min=role.salary_min,
            max=role.salary_max,
            currency=role.salary_currency or "USD",
        ),
        url=role.url,
        skills=skills,
        description_md=description_md,
        created_at=role.created_at,
        status=RoleStatus(role.status),
        status_history=_build_status_history(role.id, db),
        application_ops=(
            _to_application_ops_schema(role.id, application_ops, now=now)
            if application_ops
            else None
        ),
        interview_stage_timeline=_build_interview_stage_timeline(role.id, db),
        latest_fit_analysis=_to_fit_analysis_schema(latest_fit) if latest_fit else None,
        latest_desirability_score=(
            _to_desirability_score_schema(latest_desirability) if latest_desirability else None
        ),
    )


@router.get("/jobs/{role_id}/application-ops", response_model=ApplicationOps)
def get_application_ops(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationOps:
    """Get application-ops metadata for a role."""
    _role_or_404(role_id, db)
    row = db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Application ops not found")
    now = datetime.now(UTC).replace(tzinfo=None)
    return _to_application_ops_schema(role_id, row, now=now)


@router.put("/jobs/{role_id}/application-ops", response_model=ApplicationOps)
def upsert_application_ops(
    role_id: int,
    payload: ApplicationOpsUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationOps:
    """Create or update application-ops metadata for a role."""
    _role_or_404(role_id, db)
    row = db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role_id).first()
    if row is None:
        row = ApplicationOpsModel(role_id=role_id)
        db.add(row)

    row.applied_at = payload.applied_at
    row.deadline_at = payload.deadline_at
    row.source = payload.source.strip() if payload.source else None
    row.recruiter_contact = payload.recruiter_contact.strip() if payload.recruiter_contact else None
    row.notes = payload.notes.strip() if payload.notes else None
    row.next_action_at = payload.next_action_at

    db.commit()
    db.refresh(row)
    now = datetime.now(UTC).replace(tzinfo=None)
    return _to_application_ops_schema(role_id, row, now=now)


@router.patch("/jobs/{role_id}/application-ops/next-action", response_model=ApplicationOps)
def update_next_action(
    role_id: int,
    payload: NextActionUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationOps:
    """Update only next-action datetime for a role."""
    _role_or_404(role_id, db)
    row = db.query(ApplicationOpsModel).filter(ApplicationOpsModel.role_id == role_id).first()
    if row is None:
        row = ApplicationOpsModel(role_id=role_id)
        db.add(row)
    row.next_action_at = payload.next_action_at

    db.commit()
    db.refresh(row)
    now = datetime.now(UTC).replace(tzinfo=None)
    return _to_application_ops_schema(role_id, row, now=now)


@router.get("/jobs/{role_id}/interview-stages", response_model=list[InterviewStageEvent])
def list_interview_stages(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[InterviewStageEvent]:
    """List interview-stage timeline entries for a role."""
    _role_or_404(role_id, db)
    return _build_interview_stage_timeline(role_id, db)


@router.post("/jobs/{role_id}/interview-stages", response_model=InterviewStageEvent)
def create_interview_stage_event(
    role_id: int,
    payload: InterviewStageEventCreate,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewStageEvent:
    """Append interview-stage event to role timeline."""
    _role_or_404(role_id, db)
    row = InterviewStageEventModel(
        role_id=role_id,
        stage=payload.stage.value,
        notes=payload.notes.strip() if payload.notes else None,
        occurred_at=payload.occurred_at,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return InterviewStageEvent(
        id=row.id,
        role_id=row.role_id,
        stage=InterviewStage(row.stage),
        notes=row.notes,
        occurred_at=row.occurred_at,
        created_at=row.created_at,
    )


@router.post("/jobs/{role_id}/desirability-score", response_model=DesirabilityScore)
def score_job_desirability(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
    force_refresh: bool = False,
) -> DesirabilityScore:
    """Generate (or fetch cached) desirability score for a role."""
    service = DesirabilityScoringService(db)
    try:
        score = service.generate_for_role(role_id, force_refresh=force_refresh)
        return _to_desirability_score_schema(score)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to generate desirability score: {exc}",
        ) from exc


@router.post("/jobs/{role_id}/desirability-score/refresh", response_model=DesirabilityScore)
def refresh_job_desirability(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> DesirabilityScore:
    """Force recomputation of desirability score for a role."""
    service = DesirabilityScoringService(db)
    try:
        score = service.generate_for_role(role_id, force_refresh=True)
        return _to_desirability_score_schema(score)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to refresh desirability score: {exc}",
        ) from exc


@router.post("/jobs/{role_id}/fit-analysis", response_model=FitAnalysis)
def analyze_job_fit(role_id: int, db: Annotated[Session, Depends(get_db)]) -> FitAnalysis:
    """
    Generate and persist a deterministic fit analysis record for a role.

    Args:
        role_id: The numeric ID of the role.

    Returns:
        Newly persisted fit analysis payload.

    Raises:
        HTTPException 404: If the role does not exist.
        HTTPException 422: If analysis output cannot be normalized.
    """
    service = FitAnalysisService(db)
    try:
        analysis = service.generate_for_role(role_id)
        return _to_fit_analysis_schema(analysis)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422, detail=f"Failed to generate fit analysis: {exc}"
        ) from exc


@router.post(
    "/jobs/{role_id}/application-materials/cover-letter", response_model=ApplicationMaterial
)
def generate_cover_letter(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationMaterial:
    """Generate and persist a cover-letter draft for a role."""
    service = ApplicationMaterialsService(db)
    try:
        material = service.generate_cover_letter(role_id)
        return _to_application_material_schema(material)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422, detail=f"Failed to generate cover letter: {exc}"
        ) from exc


@router.post(
    "/jobs/{role_id}/application-materials/question-answers", response_model=ApplicationMaterial
)
def generate_question_answers(
    role_id: int,
    payload: ApplicationMaterialQARequest,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationMaterial:
    """Generate and persist Q&A draft answers for a role."""
    service = ApplicationMaterialsService(db)
    try:
        material = service.generate_question_answers(payload.questions, role_id)
        return _to_application_material_schema(material)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422, detail=f"Failed to generate question answers: {exc}"
        ) from exc


@router.get("/jobs/{role_id}/application-materials", response_model=list[ApplicationMaterial])
def list_application_materials(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[ApplicationMaterial]:
    """List saved application materials for a role."""
    service = ApplicationMaterialsService(db)
    try:
        materials = service.list_for_role(role_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return [_to_application_material_schema(item) for item in materials]


@router.post("/jobs/{role_id}/interview-prep-pack", response_model=InterviewPrepPack)
def generate_interview_prep_pack(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewPrepPack:
    """Generate and persist interview prep pack for a role."""
    service = ApplicationMaterialsService(db)
    try:
        material = service.generate_interview_prep_pack(role_id)
        return _to_interview_prep_pack_schema(material)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to generate interview prep pack: {exc}",
        ) from exc


@router.get("/jobs/{role_id}/interview-prep-pack", response_model=list[InterviewPrepPack])
def list_interview_prep_packs(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[InterviewPrepPack]:
    """List saved interview prep pack versions for a role."""
    service = ApplicationMaterialsService(db)
    try:
        materials = service.list_interview_prep_packs(role_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return [_to_interview_prep_pack_schema(item) for item in materials]


@router.get("/jobs/{role_id}/interview-prep-pack/{material_id}", response_model=InterviewPrepPack)
def get_interview_prep_pack(
    role_id: int,
    material_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewPrepPack:
    """Get a specific interview prep pack version for a role."""
    service = ApplicationMaterialsService(db)
    try:
        material = service.get_interview_prep_pack(material_id, role_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return _to_interview_prep_pack_schema(material)


@router.post(
    "/jobs/{role_id}/interview-prep-pack/regenerate",
    response_model=InterviewPrepPack,
)
def regenerate_interview_prep_section(
    role_id: int,
    payload: InterviewPrepPackRegenerateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewPrepPack:
    """Regenerate one section and persist as a new interview prep pack version."""
    service = ApplicationMaterialsService(db)
    try:
        material = service.regenerate_interview_prep_section(role_id, payload.section)
        return _to_interview_prep_pack_schema(material)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to regenerate interview prep section: {exc}",
        ) from exc


@router.put(
    "/jobs/{role_id}/interview-prep-pack/{material_id}",
    response_model=InterviewPrepPack,
)
def update_interview_prep_pack(
    role_id: int,
    material_id: int,
    payload: InterviewPrepPackEditRequest,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewPrepPack:
    """Edit and persist interview prep pack sections in-place."""
    service = ApplicationMaterialsService(db)
    sections = {
        InterviewPrepSectionKey.LIKELY_QUESTIONS.value: payload.sections.likely_questions,
        InterviewPrepSectionKey.TALKING_POINTS.value: payload.sections.talking_points,
        InterviewPrepSectionKey.STAR_STORIES.value: payload.sections.star_stories,
    }
    try:
        material = service.update_interview_prep_pack(material_id, role_id, sections)
        return _to_interview_prep_pack_schema(material)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to update interview prep pack: {exc}",
        ) from exc


@router.get(
    "/jobs/{role_id}/application-materials/{material_id}", response_model=ApplicationMaterial
)
def get_application_material(
    role_id: int,
    material_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationMaterial:
    """Get a specific saved application material version for a role."""
    material = (
        db.query(ApplicationMaterialModel)
        .filter(ApplicationMaterialModel.id == material_id)
        .filter(ApplicationMaterialModel.role_id == role_id)
        .first()
    )
    if material is None:
        raise HTTPException(status_code=404, detail="Application material not found")
    return _to_application_material_schema(material)


@router.patch("/jobs/{role_id}/status", response_model=JobListItem)
def update_job_status(
    role_id: int,
    status_update: StatusUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> JobListItem:
    """
    Update the status of a job posting.

    Args:
        role_id: The numeric ID of the role.
        status_update: New status value.

    Returns:
        Updated job summary.

    Raises:
        HTTPException 404: If the job is not found.
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Job not found")

    previous_status = role.status
    role.status = status_update.status.value

    if previous_status != role.status:
        db.add(
            RoleStatusChangeModel(
                role_id=role.id,
                from_status=previous_status,
                to_status=role.status,
            )
        )

    db.commit()
    db.refresh(role)

    company = db.query(Company).filter(Company.id == role.company_id).first()
    skills_count = db.query(RoleSkill).filter(RoleSkill.role_id == role.id).count()

    return JobListItem(
        id=role.id,
        company=company.name,
        title=role.title,
        salary_range=_build_salary_range(role),
        created_at=role.created_at,
        skills_count=skills_count,
        status=RoleStatus(role.status),
        fit_score=None,
        fit_recommendation=None,
    )


@router.post("/jobs/scrape", response_model=JobScrapeResponse)
def scrape_job(
    request: JobScrapeRequest,
    db: Annotated[Session, Depends(get_db)],
) -> JobScrapeResponse:
    """
    Scrape a job posting URL and persist all extracted data.

    Pipeline:
        1. Validate URL and check for duplicates
        2. Scrape raw HTML
        3. LLM de-noise HTML → clean Markdown
        4. LLM extract structured job data + skills
        5. Upsert Company record
        6. Create Role record with file paths
        7. Save HTML and Markdown to disk
        8. Link extracted skills via Role_Skills

    Args:
        request: Scrape request containing the job posting URL.

    Returns:
        Scrape result including role ID, company, title, and skill count.

    Raises:
        HTTPException 422: If the URL cannot be scraped or data cannot be processed.
        HTTPException 500: If an unexpected internal error occurs.
    """
    url = str(request.url)
    fallback_text = request.fallback_text.strip() if request.fallback_text else None
    service = JobCaptureService(db)
    try:
        if fallback_text:
            result = asyncio.run(service.capture_from_clipboard_text(url, fallback_text))
        else:
            result = asyncio.run(service.capture_from_url(url))
    except JobCaptureScrapingError as exc:
        raise HTTPException(
            status_code=422,
            detail={
                "code": "FALLBACK_TEXT_REQUIRED",
                "message": f"Unable to scrape this URL. Paste the job text and resubmit. ({exc})",
            },
        ) from exc
    except JobCaptureLLMError as exc:
        raise HTTPException(status_code=500, detail=f"LLM processing failed: {exc}") from exc
    except JobCapturePersistenceError as exc:
        raise HTTPException(status_code=500, detail=f"Persistence failed: {exc}") from exc

    return JobScrapeResponse(
        status=result.status,
        role_id=result.role_id,
        company=result.company,
        title=result.title,
        skills_extracted=result.skills_extracted,
        processing_time_seconds=result.processing_time_seconds,
    )
