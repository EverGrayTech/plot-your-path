"""Jobs API router aggregation module."""

from fastapi import APIRouter

from backend.routers.jobs_analysis import CareerEvidenceService, FitAnalysisService
from backend.routers.jobs_analysis import router as analysis_router
from backend.routers.jobs_application_ops import router as application_ops_router
from backend.routers.jobs_capture import router as capture_router
from backend.routers.jobs_materials import router as materials_router
from backend.routers.jobs_outcomes import router as outcomes_router
from backend.routers.jobs_read import router as read_router
from backend.services.application_materials import ApplicationMaterialsService
from backend.services.job_capture import JobCaptureService
from backend.services.job_presenters import file_exists, load_file

router = APIRouter()
router.include_router(read_router)
router.include_router(application_ops_router)
router.include_router(outcomes_router)
router.include_router(analysis_router)
router.include_router(materials_router)
router.include_router(capture_router)

__all__ = [
    "ApplicationMaterialsService",
    "CareerEvidenceService",
    "FitAnalysisService",
    "JobCaptureService",
    "file_exists",
    "load_file",
    "router",
]
