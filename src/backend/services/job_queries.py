"""Query/read services for job list, detail, and pipeline views."""

from __future__ import annotations

from collections.abc import Callable
from datetime import timedelta
from typing import TypeVar

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.application_ops import ApplicationOps as ApplicationOpsModel
from backend.models.company import Company
from backend.models.desirability_score_result import DesirabilityScoreResult
from backend.models.interview_stage_event import InterviewStageEvent as InterviewStageEventModel
from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.models.role_skill import RoleSkill
from backend.models.role_status_change import RoleStatusChange as RoleStatusChangeModel
from backend.schemas.company import Company as CompanySchema
from backend.schemas.job import (
    InterviewStage,
    JobDetail,
    JobListItem,
    PipelineCounters,
    PipelineItem,
    PipelineResponse,
    RoleStatus,
    SalaryInfo,
)
from backend.services.job_presenters import (
    application_ops_attention,
    build_salary_range,
    load_markdown_content,
    to_application_ops_schema,
    to_desirability_score_schema,
    to_fit_analysis_schema,
    to_interview_stage_timeline_schema,
    to_status_history_schema,
)
from backend.services.skill_extractor import SkillExtractorService
from backend.utils.time import utc_now_naive

T = TypeVar("T")


class JobQueryService:
    """Centralized read/query service for job-focused endpoints."""

    def __init__(self, db: Session) -> None:
        """Initialize the query service."""
        self.db = db

    @staticmethod
    def _first_by_key(rows: list[T], key_getter: Callable[[T], int]) -> dict[int, T]:
        """Return first row per key from a pre-sorted row list."""
        result: dict[int, T] = {}
        for row in rows:
            key = key_getter(row)
            if key not in result:
                result[key] = row
        return result

    def _application_ops_by_role_ids(
        self,
        role_ids: list[int],
    ) -> dict[int, ApplicationOpsModel]:
        """Load application ops rows for a role set."""
        if not role_ids:
            return {}
        rows = (
            self.db.query(ApplicationOpsModel)
            .filter(ApplicationOpsModel.role_id.in_(role_ids))
            .all()
        )
        return {row.role_id: row for row in rows}

    def _current_interview_stage_by_role_ids(
        self,
        role_ids: list[int],
    ) -> dict[int, InterviewStage | None]:
        """Load latest interview stage per role."""
        if not role_ids:
            return {}

        rows = (
            self.db.query(InterviewStageEventModel)
            .filter(InterviewStageEventModel.role_id.in_(role_ids))
            .order_by(
                InterviewStageEventModel.role_id.asc(),
                InterviewStageEventModel.occurred_at.desc(),
                InterviewStageEventModel.id.desc(),
            )
            .all()
        )
        latest_rows = self._first_by_key(rows, lambda row: row.role_id)
        return {role_id: InterviewStage(row.stage) for role_id, row in latest_rows.items()}

    def _latest_desirability_by_company_ids(
        self,
        company_ids: list[int],
    ) -> dict[int, DesirabilityScoreResult]:
        """Load latest desirability score per company."""
        if not company_ids:
            return {}

        rows = (
            self.db.query(DesirabilityScoreResult)
            .filter(DesirabilityScoreResult.company_id.in_(company_ids))
            .order_by(
                DesirabilityScoreResult.company_id.asc(),
                DesirabilityScoreResult.created_at.desc(),
                DesirabilityScoreResult.id.desc(),
            )
            .all()
        )
        return self._first_by_key(rows, lambda row: row.company_id)

    def _latest_desirability_for_role(self, role_id: int) -> DesirabilityScoreResult | None:
        """Load the latest desirability score for one role."""
        return (
            self.db.query(DesirabilityScoreResult)
            .filter(DesirabilityScoreResult.role_id == role_id)
            .order_by(
                DesirabilityScoreResult.created_at.desc(),
                DesirabilityScoreResult.id.desc(),
            )
            .first()
        )

    def _latest_fit_analysis(self, role_id: int) -> RoleFitAnalysis | None:
        """Load the latest fit analysis for one role."""
        return (
            self.db.query(RoleFitAnalysis)
            .filter(RoleFitAnalysis.role_id == role_id)
            .order_by(RoleFitAnalysis.created_at.desc(), RoleFitAnalysis.id.desc())
            .first()
        )

    def _latest_fit_by_role_ids(self, role_ids: list[int]) -> dict[int, RoleFitAnalysis]:
        """Load latest fit analysis per role."""
        if not role_ids:
            return {}

        rows = (
            self.db.query(RoleFitAnalysis)
            .filter(RoleFitAnalysis.role_id.in_(role_ids))
            .order_by(
                RoleFitAnalysis.role_id.asc(),
                RoleFitAnalysis.created_at.desc(),
                RoleFitAnalysis.id.desc(),
            )
            .all()
        )
        return self._first_by_key(rows, lambda row: row.role_id)

    def _role_with_company_or_404(self, role_id: int) -> tuple[Role, Company]:
        """Load role and company or raise a not-found error."""
        row = (
            self.db.query(Role, Company)
            .join(Company, Role.company_id == Company.id)
            .filter(Role.id == role_id)
            .first()
        )
        if row is None:
            raise LookupError("Job not found")
        return row

    def _skills_count_by_role_ids(self, role_ids: list[int]) -> dict[int, int]:
        """Load aggregated skill counts per role."""
        if not role_ids:
            return {}

        rows = (
            self.db.query(RoleSkill.role_id, func.count(RoleSkill.id))
            .filter(RoleSkill.role_id.in_(role_ids))
            .group_by(RoleSkill.role_id)
            .all()
        )
        return dict(rows)

    def _status_history(self, role_id: int) -> list[RoleStatusChangeModel]:
        """Load status history rows for one role."""
        return (
            self.db.query(RoleStatusChangeModel)
            .filter(RoleStatusChangeModel.role_id == role_id)
            .order_by(RoleStatusChangeModel.changed_at.asc(), RoleStatusChangeModel.id.asc())
            .all()
        )

    def get_interview_stage_timeline(self, role_id: int) -> list[InterviewStageEventModel]:
        """Load interview stage timeline rows for one role."""
        return (
            self.db.query(InterviewStageEventModel)
            .filter(InterviewStageEventModel.role_id == role_id)
            .order_by(InterviewStageEventModel.occurred_at.asc(), InterviewStageEventModel.id.asc())
            .all()
        )

    def get_job_detail(self, role_id: int) -> JobDetail:
        """Build the detailed read model for a single role."""
        role, company = self._role_with_company_or_404(role_id)
        application_ops = (
            self.db.query(ApplicationOpsModel)
            .filter(ApplicationOpsModel.role_id == role_id)
            .first()
        )
        latest_desirability = self._latest_desirability_for_role(role_id)
        latest_fit = self._latest_fit_analysis(role_id)
        now = utc_now_naive()

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
            skills=SkillExtractorService(self.db).get_skills_for_role(role_id),
            description_md=load_markdown_content(role.cleaned_md_path),
            created_at=role.created_at,
            status=RoleStatus(role.status),
            status_history=to_status_history_schema(self._status_history(role_id)),
            application_ops=(
                to_application_ops_schema(role.id, application_ops, now=now)
                if application_ops is not None
                else None
            ),
            interview_stage_timeline=to_interview_stage_timeline_schema(
                self.get_interview_stage_timeline(role_id)
            ),
            latest_fit_analysis=(to_fit_analysis_schema(latest_fit) if latest_fit else None),
            latest_desirability_score=(
                to_desirability_score_schema(latest_desirability) if latest_desirability else None
            ),
        )

    def get_job_list_item(self, role_id: int) -> JobListItem:
        """Build the list-item read model for a single role."""
        role, company = self._role_with_company_or_404(role_id)
        application_ops = (
            self.db.query(ApplicationOpsModel)
            .filter(ApplicationOpsModel.role_id == role_id)
            .first()
        )
        latest_fit = self._latest_fit_analysis(role_id)
        now = utc_now_naive()
        needs_attention, _ = application_ops_attention(application_ops, now=now)

        latest_desirability = (
            self.db.query(DesirabilityScoreResult)
            .filter(DesirabilityScoreResult.company_id == company.id)
            .order_by(
                DesirabilityScoreResult.created_at.desc(),
                DesirabilityScoreResult.id.desc(),
            )
            .first()
        )
        skills_count = (
            self.db.query(func.count(RoleSkill.id)).filter(RoleSkill.role_id == role_id).scalar()
            or 0
        )

        return JobListItem(
            id=role.id,
            company=company.name,
            title=role.title,
            salary_range=build_salary_range(role),
            created_at=role.created_at,
            skills_count=skills_count,
            status=RoleStatus(role.status),
            fit_score=latest_fit.fit_score if latest_fit else None,
            fit_recommendation=latest_fit.recommendation if latest_fit else None,
            desirability_score=latest_desirability.total_score if latest_desirability else None,
            current_interview_stage=self._current_interview_stage_by_role_ids([role_id]).get(
                role_id
            ),
            deadline_at=application_ops.deadline_at if application_ops else None,
            next_action_at=application_ops.next_action_at if application_ops else None,
            needs_attention=needs_attention,
        )

    def get_job_list_items(self) -> list[JobListItem]:
        """Build the job listing read model."""
        rows = (
            self.db.query(Role, Company)
            .join(Company, Role.company_id == Company.id)
            .order_by(Role.created_at.desc())
            .all()
        )
        role_ids = [role.id for role, _ in rows]
        company_ids = [company.id for _, company in rows]
        application_ops_by_role = self._application_ops_by_role_ids(role_ids)
        current_stage_by_role = self._current_interview_stage_by_role_ids(role_ids)
        latest_desirability_by_company = self._latest_desirability_by_company_ids(company_ids)
        latest_fit_by_role = self._latest_fit_by_role_ids(role_ids)
        skills_count_by_role = self._skills_count_by_role_ids(role_ids)
        now = utc_now_naive()

        items: list[JobListItem] = []
        for role, company in rows:
            application_ops = application_ops_by_role.get(role.id)
            needs_attention, _ = application_ops_attention(application_ops, now=now)
            latest_fit = latest_fit_by_role.get(role.id)
            latest_desirability = latest_desirability_by_company.get(company.id)

            items.append(
                JobListItem(
                    id=role.id,
                    company=company.name,
                    title=role.title,
                    salary_range=build_salary_range(role),
                    created_at=role.created_at,
                    skills_count=skills_count_by_role.get(role.id, 0),
                    status=RoleStatus(role.status),
                    fit_score=latest_fit.fit_score if latest_fit else None,
                    fit_recommendation=latest_fit.recommendation if latest_fit else None,
                    desirability_score=(
                        latest_desirability.total_score if latest_desirability else None
                    ),
                    current_interview_stage=current_stage_by_role.get(role.id),
                    deadline_at=application_ops.deadline_at if application_ops else None,
                    next_action_at=application_ops.next_action_at if application_ops else None,
                    needs_attention=needs_attention,
                )
            )

        return items

    def get_pipeline_response(
        self,
        *,
        overdue_only: bool = False,
        recently_updated: bool = False,
        this_week_deadlines: bool = False,
    ) -> PipelineResponse:
        """Build the pipeline read model with filters and counters."""
        now = utc_now_naive()
        recently_cutoff = now - timedelta(days=3)
        week_end = now + timedelta(days=7)

        rows = (
            self.db.query(Role, Company, ApplicationOpsModel)
            .join(Company, Role.company_id == Company.id)
            .outerjoin(ApplicationOpsModel, ApplicationOpsModel.role_id == Role.id)
            .order_by(Role.created_at.desc())
            .all()
        )
        current_stage_by_role = self._current_interview_stage_by_role_ids(
            [role.id for role, _, _ in rows]
        )

        items: list[PipelineItem] = []
        for role, company, application_ops in rows:
            current_stage = current_stage_by_role.get(role.id)
            needs_attention, reasons = application_ops_attention(application_ops, now=now)
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

        return PipelineResponse(
            counters=PipelineCounters(
                needs_follow_up=sum(
                    1 for item in items if "Missing next action" in item.attention_reasons
                ),
                overdue_actions=sum(
                    1 for item in items if "Overdue next action" in item.attention_reasons
                ),
                upcoming_deadlines=sum(
                    1
                    for item in items
                    if item.deadline_at is not None and now <= item.deadline_at <= week_end
                ),
            ),
            items=items,
        )
