"""Application material and prep-pack routes for jobs."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.application_material import ApplicationMaterial as ApplicationMaterialModel
from backend.routers.jobs_http import to_http_exception
from backend.schemas.job import (
    ApplicationMaterial,
    ApplicationMaterialQARequest,
    InterviewPrepPack,
    InterviewPrepPackEditRequest,
    InterviewPrepPackRegenerateRequest,
    InterviewPrepSectionKey,
    ResumeTuningSuggestion,
)
from backend.services.application_materials import ApplicationMaterialsService
from backend.services.job_presenters import (
    to_application_material_schema,
    to_interview_prep_pack_schema,
    to_resume_tuning_schema,
)

router = APIRouter()


@router.post(
    "/jobs/{role_id}/application-materials/cover-letter",
    response_model=ApplicationMaterial,
)
async def generate_cover_letter(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationMaterial:
    """Generate and persist a cover-letter draft for a role."""
    try:
        material = await run_in_threadpool(
            ApplicationMaterialsService(db).generate_cover_letter, role_id
        )
        return to_application_material_schema(material)
    except Exception as exc:
        raise to_http_exception(exc, default_message="Failed to generate cover letter") from exc


@router.post(
    "/jobs/{role_id}/application-materials/question-answers",
    response_model=ApplicationMaterial,
)
async def generate_question_answers(
    role_id: int,
    payload: ApplicationMaterialQARequest,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationMaterial:
    """Generate and persist Q&A draft answers for a role."""
    try:
        material = await run_in_threadpool(
            ApplicationMaterialsService(db).generate_question_answers,
            payload.questions,
            role_id,
        )
        return to_application_material_schema(material)
    except Exception as exc:
        raise to_http_exception(exc, default_message="Failed to generate question answers") from exc


@router.get("/jobs/{role_id}/application-materials", response_model=list[ApplicationMaterial])
def list_application_materials(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[ApplicationMaterial]:
    """List saved application materials for a role."""
    try:
        materials = ApplicationMaterialsService(db).list_for_role(role_id)
        return [to_application_material_schema(item) for item in materials]
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.get(
    "/jobs/{role_id}/application-materials/{material_id}",
    response_model=ApplicationMaterial,
)
def get_application_material(
    role_id: int,
    material_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ApplicationMaterial:
    """Get a specific saved application material version for a role."""
    try:
        row = (
            db.query(ApplicationMaterialModel)
            .filter(ApplicationMaterialModel.id == material_id)
            .filter(ApplicationMaterialModel.role_id == role_id)
            .first()
        )
        if row is None:
            raise LookupError("Application material not found")
        return to_application_material_schema(row)
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.post("/jobs/{role_id}/interview-prep-pack", response_model=InterviewPrepPack)
async def generate_interview_prep_pack(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewPrepPack:
    """Generate and persist interview prep pack for a role."""
    try:
        material = await run_in_threadpool(
            ApplicationMaterialsService(db).generate_interview_prep_pack,
            role_id,
        )
        return to_interview_prep_pack_schema(material)
    except Exception as exc:
        raise to_http_exception(
            exc, default_message="Failed to generate interview prep pack"
        ) from exc


@router.get("/jobs/{role_id}/interview-prep-pack", response_model=list[InterviewPrepPack])
def list_interview_prep_packs(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[InterviewPrepPack]:
    """List saved interview prep pack versions for a role."""
    try:
        materials = ApplicationMaterialsService(db).list_interview_prep_packs(role_id)
        return [to_interview_prep_pack_schema(item) for item in materials]
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.get("/jobs/{role_id}/interview-prep-pack/{material_id}", response_model=InterviewPrepPack)
def get_interview_prep_pack(
    role_id: int,
    material_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewPrepPack:
    """Get a specific interview prep pack version for a role."""
    try:
        material = ApplicationMaterialsService(db).get_interview_prep_pack(material_id, role_id)
        return to_interview_prep_pack_schema(material)
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.post(
    "/jobs/{role_id}/interview-prep-pack/regenerate",
    response_model=InterviewPrepPack,
)
async def regenerate_interview_prep_section(
    role_id: int,
    payload: InterviewPrepPackRegenerateRequest,
    db: Annotated[Session, Depends(get_db)],
) -> InterviewPrepPack:
    """Regenerate one section and persist as a new interview prep pack version."""
    try:
        material = await run_in_threadpool(
            ApplicationMaterialsService(db).regenerate_interview_prep_section,
            role_id,
            payload.section,
        )
        return to_interview_prep_pack_schema(material)
    except Exception as exc:
        raise to_http_exception(
            exc,
            default_message="Failed to regenerate interview prep section",
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
    sections = {
        InterviewPrepSectionKey.LIKELY_QUESTIONS.value: payload.sections.likely_questions,
        InterviewPrepSectionKey.TALKING_POINTS.value: payload.sections.talking_points,
        InterviewPrepSectionKey.STAR_STORIES.value: payload.sections.star_stories,
    }
    try:
        material = ApplicationMaterialsService(db).update_interview_prep_pack(
            material_id,
            role_id,
            sections,
        )
        return to_interview_prep_pack_schema(material)
    except Exception as exc:
        raise to_http_exception(
            exc, default_message="Failed to update interview prep pack"
        ) from exc


@router.post("/jobs/{role_id}/resume-tuning", response_model=ResumeTuningSuggestion)
async def generate_resume_tuning(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ResumeTuningSuggestion:
    """Generate and persist resume tuning suggestions for a role."""
    try:
        material = await run_in_threadpool(
            ApplicationMaterialsService(db).generate_resume_tuning_suggestion,
            role_id,
        )
        return to_resume_tuning_schema(material)
    except Exception as exc:
        raise to_http_exception(
            exc,
            default_message="Failed to generate resume tuning suggestions",
        ) from exc


@router.get("/jobs/{role_id}/resume-tuning", response_model=list[ResumeTuningSuggestion])
def list_resume_tuning(
    role_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[ResumeTuningSuggestion]:
    """List saved resume tuning suggestion versions for a role."""
    try:
        materials = ApplicationMaterialsService(db).list_resume_tuning_suggestions(role_id)
        return [to_resume_tuning_schema(item) for item in materials]
    except Exception as exc:
        raise to_http_exception(exc) from exc


@router.get("/jobs/{role_id}/resume-tuning/{material_id}", response_model=ResumeTuningSuggestion)
def get_resume_tuning(
    role_id: int,
    material_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> ResumeTuningSuggestion:
    """Get a specific resume tuning suggestion version for a role."""
    try:
        material = ApplicationMaterialsService(db).get_resume_tuning_suggestion(
            material_id, role_id
        )
        return to_resume_tuning_schema(material)
    except Exception as exc:
        raise to_http_exception(exc) from exc
