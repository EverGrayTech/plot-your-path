"""Pydantic schemas package."""

from backend.schemas.company import Company, CompanyBase, CompanyCreate
from backend.schemas.job import (
    ApplicationArtifactType,
    ApplicationMaterial,
    ApplicationMaterialQARequest,
    FitAnalysis,
    FitRecommendation,
    JobDetail,
    JobListItem,
    JobScrapeRequest,
    JobScrapeResponse,
    RequirementLevel,
    RoleStatus,
    RoleStatusChange,
    SalaryInfo,
)
from backend.schemas.skill import Skill, SkillBase, SkillCategory, SkillCreate

__all__ = [
    "Company",
    "CompanyBase",
    "CompanyCreate",
    "ApplicationArtifactType",
    "ApplicationMaterial",
    "ApplicationMaterialQARequest",
    "FitAnalysis",
    "FitRecommendation",
    "JobDetail",
    "JobListItem",
    "JobScrapeRequest",
    "JobScrapeResponse",
    "RequirementLevel",
    "RoleStatusChange",
    "RoleStatus",
    "SalaryInfo",
    "Skill",
    "SkillBase",
    "SkillCategory",
    "SkillCreate",
]
