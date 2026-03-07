"""Job-related Pydantic schemas."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, HttpUrl

from backend.schemas.company import Company


class RoleStatus(StrEnum):
    """Role status enumeration."""

    OPEN = "open"
    SUBMITTED = "submitted"
    INTERVIEWING = "interviewing"
    REJECTED = "rejected"


class RoleStatusChange(BaseModel):
    """Audit entry for a role status transition."""

    from_status: RoleStatus | None
    to_status: RoleStatus
    changed_at: datetime


class RequirementLevel(StrEnum):
    """Skill requirement level enumeration."""

    REQUIRED = "required"
    PREFERRED = "preferred"


class FitRecommendation(StrEnum):
    """Fit recommendation level."""

    GO = "go"
    MAYBE = "maybe"
    NO_GO = "no-go"


class FitAnalysis(BaseModel):
    """Generated and persisted role-fit analysis payload."""

    id: int
    role_id: int
    fit_score: int
    recommendation: FitRecommendation
    covered_required_skills: list[str]
    missing_required_skills: list[str]
    covered_preferred_skills: list[str]
    missing_preferred_skills: list[str]
    rationale: str
    provider: str
    model: str
    version: str
    created_at: datetime


class JobScrapeRequest(BaseModel):
    """Schema for job scraping request."""

    url: HttpUrl
    fallback_text: str | None = None


class JobScrapeResponse(BaseModel):
    """Schema for job scraping response."""

    status: str
    role_id: int
    company: str
    title: str
    skills_extracted: int
    processing_time_seconds: float


class SalaryInfo(BaseModel):
    """Salary information schema."""

    min: int | None
    max: int | None
    currency: str


class JobListItem(BaseModel):
    """Schema for job list item (summary view)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    company: str
    title: str
    salary_range: str | None
    created_at: datetime
    skills_count: int
    status: RoleStatus
    fit_score: int | None = None
    fit_recommendation: FitRecommendation | None = None


class JobSkillItem(BaseModel):
    """Skill item linked to a job with requirement level context."""

    id: int
    name: str
    requirement_level: RequirementLevel


class JobSkills(BaseModel):
    """Grouped required and preferred skills for a job."""

    required: list[JobSkillItem]
    preferred: list[JobSkillItem]


class JobDetail(BaseModel):
    """Schema for detailed job view."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    company: Company
    title: str
    team_division: str | None
    salary: SalaryInfo
    url: str
    skills: JobSkills
    description_md: str
    created_at: datetime
    status: RoleStatus
    status_history: list[RoleStatusChange]
    latest_fit_analysis: FitAnalysis | None = None
