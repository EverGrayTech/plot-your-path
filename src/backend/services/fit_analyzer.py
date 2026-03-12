"""Role fit-analysis generation service."""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Any

from sqlalchemy.orm import Session

from backend.models.role import Role
from backend.models.role_fit_analysis import RoleFitAnalysis
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill
from backend.schemas.ai_settings import OperationFamily
from backend.schemas.career_evidence import EvidenceQuery
from backend.schemas.job import FitRecommendation
from backend.services.ai_settings import AISettingsService
from backend.services.career_evidence import CareerEvidenceService
from backend.services.llm_service import LLMError, LLMService
from backend.utils.async_utils import run_async_task

FIT_ANALYSIS_VERSION = "fit-v1"


class FitAnalysisService:
    """Generate deterministic role fit analysis and persist history."""

    def __init__(self, db: Session, llm_service: LLMService | None = None) -> None:
        """Initialize fit analysis service."""
        self.db = db
        self.llm_service = llm_service or LLMService(
            config=AISettingsService(db).build_llm_config(OperationFamily.FIT_ANALYSIS)
        )

    def _build_rationale_prompt(
        self,
        adjacent_preferred_skills: list[str],
        adjacent_required_skills: list[str],
        role: Role,
        covered_preferred_skills: list[str],
        covered_required_skills: list[str],
        confidence_label: str,
        fallback_used: bool,
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
            f"Confidence: {confidence_label}\n"
            f"Fallback used: {'yes' if fallback_used else 'no'}\n"
            f"Recommendation: {recommendation.value}\n"
            f"Covered required skills: {', '.join(covered_required_skills) or 'none'}\n"
            f"Adjacent required skills: {', '.join(adjacent_required_skills) or 'none'}\n"
            f"Missing required skills: {', '.join(missing_required_skills) or 'none'}\n"
            f"Covered preferred skills: {', '.join(covered_preferred_skills) or 'none'}\n"
            f"Adjacent preferred skills: {', '.join(adjacent_preferred_skills) or 'none'}\n"
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
        adjacent_preferred_count: int,
        adjacent_required_count: int,
        covered_preferred_count: int,
        covered_required_count: int,
        preferred_count: int,
        required_count: int,
    ) -> int:
        """Compute deterministic fit score from required/preferred coverage."""
        if required_count == 0 and preferred_count == 0:
            return 0

        required_ratio = (
            (covered_required_count + (adjacent_required_count * 0.5)) / required_count
            if required_count
            else 1.0
        )
        preferred_ratio = (
            (covered_preferred_count + (adjacent_preferred_count * 0.35)) / preferred_count
            if preferred_count
            else 0.0
        )

        score = round((required_ratio * 80) + (preferred_ratio * 20))
        return max(0, min(100, score))

    @staticmethod
    def _determine_recommendation(
        adjacent_required_count: int,
        covered_required_count: int,
        fit_score: int,
        required_count: int,
    ) -> FitRecommendation:
        """Map score and required-coverage to recommendation tier."""
        effective_required = covered_required_count + (adjacent_required_count * 0.5)
        if required_count > 0 and (effective_required / required_count) < 0.5:
            return FitRecommendation.NO_GO
        if fit_score >= 75:
            return FitRecommendation.GO
        if fit_score >= 45:
            return FitRecommendation.MAYBE
        return FitRecommendation.NO_GO

    @staticmethod
    def _build_skill_aliases(skill: str) -> set[str]:
        """Build normalized aliases for a skill phrase."""
        normalized = skill.strip().lower()
        aliases = {normalized}
        condensed = re.sub(r"[^a-z0-9+#]+", "", normalized)
        if condensed:
            aliases.add(condensed)
        if condensed.endswith("sql"):
            aliases.add(condensed.removesuffix("sql"))
        if condensed.endswith("js"):
            aliases.add(condensed.removesuffix("js"))
        return {alias for alias in aliases if alias}

    @staticmethod
    def _confidence_label(
        *,
        adjacent_matches: int,
        direct_matches: int,
        fallback_used: bool,
        missing_required_count: int,
    ) -> str:
        """Classify confidence for visible decision-quality signaling."""
        if fallback_used:
            return "low"
        if missing_required_count > 0 or adjacent_matches > 0:
            return "medium"
        if direct_matches > 0:
            return "high"
        return "low"

    @staticmethod
    def _evidence_keywords(item: Any) -> set[str]:
        """Collect normalized keywords/tags associated with one evidence item."""
        keywords: set[str] = set()
        for tag in list(getattr(item, "tags", []) or []):
            cleaned = str(tag).strip().lower()
            if cleaned:
                keywords.add(cleaned)

        enrichment = dict(getattr(item, "resume_enrichment", {}) or {})
        raw_keywords = str(enrichment.get("keywords", ""))
        for keyword in raw_keywords.split(","):
            cleaned = keyword.strip().lower()
            if cleaned:
                keywords.add(cleaned)
        return keywords

    @staticmethod
    def _evidence_tokens(text: str) -> set[str]:
        """Tokenize free text into normalized evidence tokens."""
        return {
            token.lower() for token in re.findall(r"[a-z0-9+#]+", text.lower()) if token.strip()
        }

    @classmethod
    def _match_skill_to_evidence(cls, evidence_items: list[Any], skill: str) -> str:
        """Classify a skill as direct, adjacent, or missing against evidence items."""
        aliases = cls._build_skill_aliases(skill)
        skill_tokens = cls._evidence_tokens(skill)
        direct_found = False
        adjacent_found = False

        for item in evidence_items:
            body = str(getattr(item, "body", "") or "")
            body_lower = body.lower()
            tokens = cls._evidence_tokens(body)
            keywords = cls._evidence_keywords(item)
            searchable_terms = tokens | keywords

            if any(alias in body_lower for alias in aliases if len(alias) > 2):
                direct_found = True
                break
            if aliases & searchable_terms:
                direct_found = True
                break
            if skill_tokens and skill_tokens.issubset(searchable_terms):
                direct_found = True
                break

            for alias in aliases:
                for term in searchable_terms:
                    similarity = SequenceMatcher(None, alias, term).ratio()
                    if similarity >= 0.78:
                        adjacent_found = True
                        break
                if adjacent_found:
                    break

        if direct_found:
            return "direct"
        if adjacent_found:
            return "adjacent"
        return "missing"

    @classmethod
    def _extract_profile_evidence(
        cls,
        evidence_items: list[Any],
        preferred_skills: list[str],
        required_skills: list[str],
    ) -> tuple[list[str], list[str], list[str], list[str], list[str], list[str]]:
        """Split required/preferred skills into direct, adjacent, and missing buckets."""
        covered_required: list[str] = []
        adjacent_required: list[str] = []
        missing_required: list[str] = []
        covered_preferred: list[str] = []
        adjacent_preferred: list[str] = []
        missing_preferred: list[str] = []

        for skill in required_skills:
            match = cls._match_skill_to_evidence(evidence_items, skill)
            if match == "direct":
                covered_required.append(skill)
            elif match == "adjacent":
                adjacent_required.append(skill)
            else:
                missing_required.append(skill)

        for skill in preferred_skills:
            match = cls._match_skill_to_evidence(evidence_items, skill)
            if match == "direct":
                covered_preferred.append(skill)
            elif match == "adjacent":
                adjacent_preferred.append(skill)
            else:
                missing_preferred.append(skill)

        return (
            covered_required,
            adjacent_required,
            missing_required,
            covered_preferred,
            adjacent_preferred,
            missing_preferred,
        )

    @staticmethod
    def _build_rationale_citations(evidence_items: list[Any]) -> list[dict[str, Any]]:
        """Build lightweight rationale citations from retrieved evidence items."""
        citations: list[dict[str, Any]] = []
        for index, item in enumerate(evidence_items[:3]):
            snippet_reference = item.body.strip().splitlines()[0][:220] if item.body else ""
            citations.append(
                {
                    "source_type": item.source_type,
                    "source_id": item.id,
                    "source_record_id": item.source_record_id,
                    "source_key": item.source_key,
                    "snippet_reference": snippet_reference,
                    "confidence": round(max(0.45, 0.9 - (index * 0.15)), 2),
                }
            )
        return citations

    @staticmethod
    def _extract_unsupported_claims(rationale: str) -> list[str]:
        """Identify potentially unsupported claims for visible flagging."""
        claims: list[str] = []
        normalized = rationale.lower()
        if "expert" in normalized or "world-class" in normalized:
            claims.append("Rationale contains strong claim language that may need verification.")
        return claims

    def _load_profile_evidence(self, preferred_skills: list[str], required_skills: list[str]):
        """Load ranked profile evidence used for fit analysis and citations."""
        evidence_service = CareerEvidenceService(self.db)
        return evidence_service.retrieve(
            EvidenceQuery(
                skills=sorted(set(preferred_skills + required_skills)), min_results=3, limit=8
            )
        )

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

        evidence_result = self._load_profile_evidence(preferred_skills, required_skills)
        (
            covered_required,
            adjacent_required,
            missing_required,
            covered_preferred,
            adjacent_preferred,
            missing_preferred,
        ) = self._extract_profile_evidence(
            list(evidence_result.items), preferred_skills, required_skills
        )

        fit_score = self._compute_fit_score(
            adjacent_preferred_count=len(adjacent_preferred),
            adjacent_required_count=len(adjacent_required),
            covered_preferred_count=len(covered_preferred),
            covered_required_count=len(covered_required),
            preferred_count=len(preferred_skills),
            required_count=len(required_skills),
        )
        recommendation = self._determine_recommendation(
            adjacent_required_count=len(adjacent_required),
            covered_required_count=len(covered_required),
            fit_score=fit_score,
            required_count=len(required_skills),
        )
        fallback_used = evidence_result.fallback_used
        confidence_label = self._confidence_label(
            adjacent_matches=len(adjacent_required) + len(adjacent_preferred),
            direct_matches=len(covered_required) + len(covered_preferred),
            fallback_used=fallback_used,
            missing_required_count=len(missing_required),
        )

        fallback_rationale = (
            f"{recommendation.value.upper()} based on {fit_score}% fit. "
            f"Direct evidence covers {len(covered_required)}/{len(required_skills)} required and "
            f"{len(covered_preferred)}/{len(preferred_skills)} preferred skills. "
            f"Adjacent evidence supports {len(adjacent_required)} required and "
            f"{len(adjacent_preferred)} preferred skills."
        )
        try:
            rationale_prompt = self._build_rationale_prompt(
                adjacent_preferred_skills=adjacent_preferred,
                adjacent_required_skills=adjacent_required,
                role=role,
                covered_preferred_skills=covered_preferred,
                covered_required_skills=covered_required,
                confidence_label=confidence_label,
                fallback_used=fallback_used,
                fit_score=fit_score,
                missing_preferred_skills=missing_preferred,
                missing_required_skills=missing_required,
                recommendation=recommendation,
            )
            llm_rationale = self._clean_llm_rationale(
                run_async_task(self.llm_service.complete(rationale_prompt))
            )
            rationale = llm_rationale or fallback_rationale
        except LLMError:
            rationale = fallback_rationale
            fallback_used = True
            confidence_label = self._confidence_label(
                adjacent_matches=len(adjacent_required) + len(adjacent_preferred),
                direct_matches=len(covered_required) + len(covered_preferred),
                fallback_used=True,
                missing_required_count=len(missing_required),
            )

        unsupported_claims = self._extract_unsupported_claims(rationale)
        if evidence_result.fallback_used:
            unsupported_claims.append(
                "Fit analysis used fallback evidence retrieval because matching evidence was sparse."
            )
        if adjacent_required:
            unsupported_claims.append(
                "Some required skills are supported only by adjacent evidence rather than direct matches."
            )

        analysis = RoleFitAnalysis(
            role_id=role_id,
            fit_score=fit_score,
            recommendation=recommendation.value,
            covered_required_skills=covered_required,
            adjacent_required_skills=adjacent_required,
            missing_required_skills=missing_required,
            covered_preferred_skills=covered_preferred,
            adjacent_preferred_skills=adjacent_preferred,
            missing_preferred_skills=missing_preferred,
            rationale=rationale,
            rationale_citations=self._build_rationale_citations(evidence_result.items),
            unsupported_claims=unsupported_claims,
            fallback_used=fallback_used,
            confidence_label=confidence_label,
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
