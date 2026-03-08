"""Job-related Pydantic schemas."""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, HttpUrl

from backend.schemas.company import Company
from backend.schemas.desirability import DesirabilityScore


class RoleStatus(StrEnum):
    """Role status enumeration."""

    OPEN = "open"
    SUBMITTED = "submitted"
    INTERVIEWING = "interviewing"
    REJECTED = "rejected"


class InterviewStage(StrEnum):
    """Interview stage progression enumeration."""

    APPLIED = "applied"
    RECRUITER_SCREEN = "recruiter_screen"
    HIRING_MANAGER = "hiring_manager"
    TECHNICAL = "technical"
    ONSITE = "onsite"
    OFFER = "offer"
    CLOSED = "closed"


class RoleStatusChange(BaseModel):
    """Audit entry for a role status transition."""

    from_status: RoleStatus | None
    to_status: RoleStatus
    changed_at: datetime


class InterviewStageEvent(BaseModel):
    """Interview stage timeline event for a role."""

    id: int
    role_id: int
    stage: InterviewStage
    notes: str | None
    occurred_at: datetime
    created_at: datetime


class InterviewStageEventCreate(BaseModel):
    """Payload for creating an interview stage event."""

    stage: InterviewStage
    notes: str | None = None
    occurred_at: datetime


class ApplicationOps(BaseModel):
    """Operational application tracking metadata for a role."""

    role_id: int
    applied_at: datetime | None
    deadline_at: datetime | None
    source: str | None
    recruiter_contact: str | None
    notes: str | None
    next_action_at: datetime | None
    needs_attention: bool
    attention_reasons: list[str]
    created_at: datetime
    updated_at: datetime


class ApplicationOpsUpdate(BaseModel):
    """Payload for creating or updating role application ops details."""

    applied_at: datetime | None = None
    deadline_at: datetime | None = None
    source: str | None = None
    recruiter_contact: str | None = None
    notes: str | None = None
    next_action_at: datetime | None = None


class PipelineCounters(BaseModel):
    """Dashboard counters for pipeline attention signals."""

    needs_follow_up: int
    overdue_actions: int
    upcoming_deadlines: int


class PipelineItem(BaseModel):
    """Pipeline row model for operational workflow tracking."""

    role_id: int
    company: str
    title: str
    status: RoleStatus
    interview_stage: InterviewStage | None
    next_action_at: datetime | None
    deadline_at: datetime | None
    needs_attention: bool
    attention_reasons: list[str]
    updated_at: datetime


class PipelineResponse(BaseModel):
    """Pipeline listing payload with rows and dashboard counters."""

    counters: PipelineCounters
    items: list[PipelineItem]


class RequirementLevel(StrEnum):
    """Skill requirement level enumeration."""

    REQUIRED = "required"
    PREFERRED = "preferred"


class FitRecommendation(StrEnum):
    """Fit recommendation level."""

    GO = "go"
    MAYBE = "maybe"
    NO_GO = "no-go"


class ApplicationArtifactType(StrEnum):
    """Supported generated application artifact types."""

    APPLICATION_QA = "application_qa"
    COVER_LETTER = "cover_letter"
    INTERVIEW_PREP_PACK = "interview_prep_pack"


class InterviewPrepSectionKey(StrEnum):
    """Interview prep pack section keys."""

    LIKELY_QUESTIONS = "likely_questions"
    STAR_STORIES = "star_stories"
    TALKING_POINTS = "talking_points"


class InterviewPrepPackSections(BaseModel):
    """Editable section payload for an interview prep pack."""

    likely_questions: list[str]
    talking_points: list[str]
    star_stories: list[str]


class InterviewPrepPack(BaseModel):
    """Generated interview prep pack payload."""

    id: int
    role_id: int
    artifact_type: ApplicationArtifactType
    version: int
    sections: InterviewPrepPackSections
    provider: str
    model: str
    prompt_version: str
    created_at: datetime


class InterviewPrepPackEditRequest(BaseModel):
    """Request payload for editing interview prep pack sections."""

    sections: InterviewPrepPackSections


class InterviewPrepPackRegenerateRequest(BaseModel):
    """Request payload for regenerating one interview prep section."""

    section: InterviewPrepSectionKey


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


class ApplicationMaterialQARequest(BaseModel):
    """Request payload for generating application Q&A draft."""

    questions: list[str]


class ApplicationMaterial(BaseModel):
    """Generated application material payload."""

    id: int
    role_id: int
    artifact_type: ApplicationArtifactType
    version: int
    content: str
    questions: list[str] | None
    provider: str
    model: str
    prompt_version: str
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
    desirability_score: float | None = None
    current_interview_stage: InterviewStage | None = None
    deadline_at: datetime | None = None
    next_action_at: datetime | None = None
    needs_attention: bool = False


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
    application_ops: ApplicationOps | None = None
    interview_stage_timeline: list[InterviewStageEvent] = []
    latest_fit_analysis: FitAnalysis | None = None
    latest_desirability_score: DesirabilityScore | None = None
