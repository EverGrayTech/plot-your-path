"""Role fit-analysis generation service."""

from __future__ import annotations

import asyncio
from pathlib import Path

from sqlalchemy.orm import Session

from backend.config import settings
from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill
from backend.schemas.ai_settings import OperationFamily
from backend.schemas.job import FitRecommendation
from backend.services.ai_settings import AISettingsService
from backend.services.llm_service import LLMService
from backend.utils.file_storage import file_exists, load_file

FIT_ANALYSIS_VERSION = "fit-v1"


class FitAnalysisService:
    """Generate deterministic role fit analysis and persist history."""

    def __init__(self, db: Session, llm_service: LLMService | None = None) -> None:
        """Initialize fit analysis service."""
        self.db = db
        self.llm_service = llm_service or LLMService(
            config=AISettingsService(db).build_llm_config(OperationFamily.APPLICATION_GENERATION)
        )

    def _build_rationale_prompt(
        self,
        role: Role,
        covered_preferred_skills: list[str],
        covered_required_skills: list[str],
        fit_score: int,
        missing_preferred_skills: list[str],
        missing_required_skills: list[str],
        recommendation: FitRecommendation,
    ) -> str:
        """Build concise rationale prompt from deterministic scoring output."""
        return (
            "You are generating a concise, actionable role-fit rationale.\n"
            "Use only the provided deterministic analysis; do not invent skills.\n"
            "Write 2-3 sentences, <= 80 words, plain text, no bullets.\n\n"
            f"Role title: {role.title}\n"
            f"Fit score: {fit_score}/100\n"
            f"Recommendation: {recommendation.value}\n"
            f"Covered required skills: {', '.join(covered_required_skills) or 'none'}\n"
            f"Missing required skills: {', '.join(missing_required_skills) or 'none'}\n"
            f"Covered preferred skills: {', '.join(covered_preferred_skills) or 'none'}\n"
            f"Missing preferred skills: {', '.join(missing_preferred_skills) or 'none'}\n"
        )

    @staticmethod
    def _clean_llm_rationale(text: str) -> str:
        """Normalize LLM rationale into a safe plain-text sentence block."""
        cleaned = " ".join(text.replace("\n", " ").split()).strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`").strip()
        return cleaned

    @staticmethod
    def _compute_fit_score(
        covered_preferred_count: int,
        covered_required_count: int,
        preferred_count: int,
        required_count: int,
    ) -> int:
        """Compute deterministic fit score from required/preferred coverage."""
        if required_count == 0 and preferred_count == 0:
            return 0

        required_ratio = covered_required_count / required_count if required_count else 1.0
        preferred_ratio = covered_preferred_count / preferred_count if preferred_count else 0.0

        score = round((required_ratio * 80) + (preferred_ratio * 20))
        return max(0, min(100, score))

    @staticmethod
    def _determine_recommendation(
        covered_required_count: int,
        fit_score: int,
        required_count: int,
    ) -> FitRecommendation:
        """Map score and required-coverage to recommendation tier."""
        if required_count > 0 and (covered_required_count / required_count) < 0.5:
            return FitRecommendation.NO_GO
        if fit_score >= 75:
            return FitRecommendation.GO
        if fit_score >= 45:
            return FitRecommendation.MAYBE
        return FitRecommendation.NO_GO

    @staticmethod
    def _extract_profile_evidence(
        profile_text: str,
        preferred_skills: list[str],
        required_skills: list[str],
    ) -> tuple[list[str], list[str], list[str], list[str]]:
        """Split required/preferred skills into covered and missing buckets."""
        profile_lower = profile_text.lower()

        covered_required = [skill for skill in required_skills if skill.lower() in profile_lower]
        missing_required = [
            skill for skill in required_skills if skill.lower() not in profile_lower
        ]
        covered_preferred = [skill for skill in preferred_skills if skill.lower() in profile_lower]
        missing_preferred = [
            skill for skill in preferred_skills if skill.lower() not in profile_lower
        ]

        return covered_required, missing_required, covered_preferred, missing_preferred

    def _load_profile_text(self) -> str:
        """Load profile source text for matching (resume fallback supported)."""
        candidate_profile_path = settings.candidate_profile_path
        if file_exists(candidate_profile_path):
            return load_file(candidate_profile_path)

        fallback_resume_path = str(Path(settings.data_root) / "resume.md")
        if file_exists(fallback_resume_path):
            return load_file(fallback_resume_path)
        return ""

    def generate_for_role(self, role_id: int) -> RoleFitAnalysis:
        """Generate and persist a new fit analysis record for a role."""
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if role is None:
            raise ValueError("Job not found")

        role_skill_rows = (
            self.db.query(RoleSkill, Skill)
            .join(Skill, RoleSkill.skill_id == Skill.id)
            .filter(RoleSkill.role_id == role_id)
            .all()
        )

        required_skills = sorted(
            [
                skill.name
                for role_skill, skill in role_skill_rows
                if role_skill.requirement_level == "required"
            ]
        )
        preferred_skills = sorted(
            [
                skill.name
                for role_skill, skill in role_skill_rows
                if role_skill.requirement_level == "preferred"
            ]
        )

        profile_text = self._load_profile_text()
        (
            covered_required,
            missing_required,
            covered_preferred,
            missing_preferred,
        ) = self._extract_profile_evidence(profile_text, preferred_skills, required_skills)

        fit_score = self._compute_fit_score(
            covered_preferred_count=len(covered_preferred),
            covered_required_count=len(covered_required),
            preferred_count=len(preferred_skills),
            required_count=len(required_skills),
        )
        recommendation = self._determine_recommendation(
            covered_required_count=len(covered_required),
            fit_score=fit_score,
            required_count=len(required_skills),
        )

        fallback_rationale = (
            f"{recommendation.value.upper()} based on {fit_score}% fit. "
            f"Covered {len(covered_required)}/{len(required_skills)} required and "
            f"{len(covered_preferred)}/{len(preferred_skills)} preferred skills."
        )
        try:
            rationale_prompt = self._build_rationale_prompt(
                role=role,
                covered_preferred_skills=covered_preferred,
                covered_required_skills=covered_required,
                fit_score=fit_score,
                missing_preferred_skills=missing_preferred,
                missing_required_skills=missing_required,
                recommendation=recommendation,
            )
            llm_rationale = self._clean_llm_rationale(
                asyncio.run(self.llm_service.complete(rationale_prompt))
            )
            rationale = llm_rationale or fallback_rationale
        except Exception:
            rationale = fallback_rationale

        analysis = RoleFitAnalysis(
            role_id=role_id,
            fit_score=fit_score,
            recommendation=recommendation.value,
            covered_required_skills=covered_required,
            missing_required_skills=missing_required,
            covered_preferred_skills=covered_preferred,
            missing_preferred_skills=missing_preferred,
            rationale=rationale,
            provider=self.llm_service.config.provider,
            model=self.llm_service.config.model,
            version=FIT_ANALYSIS_VERSION,
        )
        self.db.add(analysis)
        self.db.commit()
        self.db.refresh(analysis)
        return analysis

    def get_latest_for_role(self, role_id: int) -> RoleFitAnalysis | None:
        """Fetch latest fit analysis record for a role if present."""
        return (
            self.db.query(RoleFitAnalysis)
            .filter(RoleFitAnalysis.role_id == role_id)
            .order_by(RoleFitAnalysis.created_at.desc(), RoleFitAnalysis.id.desc())
            .first()
        )
