"""Desirability factor management and scoring service."""

from __future__ import annotations

import hashlib
import json
from typing import Any, cast

from sqlalchemy.orm import Session

from backend.models.company import Company
from backend.models.desirability_factor_config import DesirabilityFactorConfig
from backend.models.desirability_score_result import DesirabilityScoreResult
from backend.models.role import Role
from backend.schemas.ai_settings import OperationFamily
from backend.services.ai_settings import AISettingsService
from backend.services.llm_service import LLMError, LLMService
from backend.utils.async_utils import run_async_task

DESIRABILITY_VERSION = "desirability-v1"

DEFAULT_FACTORS: list[dict[str, object]] = [
    {
        "name": "Culture",
        "prompt": "Evaluate public employee sentiment and culture indicators for this company.",
        "weight": 0.16,
    },
    {
        "name": "Notoriety",
        "prompt": "Evaluate market visibility, brand recognition, and category influence.",
        "weight": 0.1,
    },
    {
        "name": "Progressiveness",
        "prompt": "Evaluate DEI signals, policy inclusiveness, and modern people practices.",
        "weight": 0.1,
    },
    {
        "name": "Inventiveness",
        "prompt": "Evaluate innovation signals such as patents, R&D, and technical novelty.",
        "weight": 0.12,
    },
    {
        "name": "Social Impact",
        "prompt": "Evaluate positive societal impact and responsible business alignment.",
        "weight": 0.12,
    },
    {
        "name": "Wow-Factor",
        "prompt": "Evaluate excitement, category-defining ambition, and compelling product narrative.",
        "weight": 0.12,
    },
    {
        "name": "Reputation",
        "prompt": "Evaluate trustworthiness, ethics history, and external reputation signals.",
        "weight": 0.14,
    },
    {
        "name": "Comp/Growth",
        "prompt": "Evaluate compensation competitiveness and growth trajectory opportunities.",
        "weight": 0.14,
    },
]


class DesirabilityScoringService:
    """Service for desirability factor CRUD and score generation."""

    def __init__(self, db: Session, llm_service: LLMService | None = None) -> None:
        self.db = db
        self.llm_service = llm_service or LLMService(
            config=AISettingsService(db).build_llm_config(OperationFamily.DESIRABILITY_SCORING)
        )

    @staticmethod
    def _normalize_weights(factors: list[DesirabilityFactorConfig]) -> list[float]:
        if not factors:
            raise ValueError("No active desirability factors configured")

        for factor in factors:
            weight = float(cast(Any, factor.weight))
            if weight < 0 or weight > 1:
                raise ValueError("Factor weights must be between 0.0 and 1.0")

        total = sum(float(cast(Any, factor.weight)) for factor in factors)
        if total <= 0:
            raise ValueError("Sum of active factor weights must be greater than zero")

        return [float(cast(Any, factor.weight)) / total for factor in factors]

    @staticmethod
    def _build_fallback_factor_score(company: Company, factor: DesirabilityFactorConfig) -> int:
        seed = f"{company.slug}:{factor.name}:{factor.prompt}"
        digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
        return (int(digest[:8], 16) % 10) + 1

    @staticmethod
    def _clean_reasoning(text: str) -> str:
        return " ".join(text.replace("\n", " ").split()).strip()

    @staticmethod
    def _score_prompt(company: Company, factor: DesirabilityFactorConfig) -> str:
        return (
            "You are a desirability scoring analyst. Return compact JSON only.\n"
            'Output schema: {"score": integer 1-10, "reasoning": string <= 160 chars}.\n'
            "Ground reasoning in general professional heuristics. Do not use markdown.\n\n"
            f"Company: {company.name}\n"
            f"Company website: {company.website or 'unknown'}\n"
            f"Factor: {factor.name}\n"
            f"Factor instructions: {factor.prompt}\n"
        )

    async def _score_factor_async(
        self,
        company: Company,
        factor: DesirabilityFactorConfig,
    ) -> tuple[int, str]:
        fallback_score = self._build_fallback_factor_score(company, factor)
        fallback_reasoning = (
            f"Fallback heuristic score for {factor.name} due to unavailable model response."
        )

        try:
            raw = await self.llm_service.complete(self._score_prompt(company, factor))
            text = raw.strip()
            if text.startswith("```"):
                text = text.strip("`").replace("json", "", 1).strip()

            payload = json.loads(text)
            score = int(payload["score"])
            if score < 1 or score > 10:
                raise ValueError("score outside bounds")
            reasoning = self._clean_reasoning(str(payload.get("reasoning", "")))
            if not reasoning:
                reasoning = fallback_reasoning
            return score, reasoning
        except (json.JSONDecodeError, KeyError, LLMError, TypeError, ValueError):
            return fallback_score, fallback_reasoning

    def create_factor(
        self,
        display_order: int,
        is_active: bool,
        name: str,
        prompt: str,
        weight: float,
    ) -> DesirabilityFactorConfig:
        existing = (
            self.db.query(DesirabilityFactorConfig)
            .filter(DesirabilityFactorConfig.name == name)
            .first()
        )
        if existing:
            raise ValueError("Factor name already exists")

        factor = DesirabilityFactorConfig(
            display_order=display_order,
            is_active=is_active,
            name=name.strip(),
            prompt=prompt.strip(),
            weight=weight,
        )
        self.db.add(factor)
        self.db.commit()
        self.db.refresh(factor)
        return factor

    def delete_factor(self, factor_id: int) -> None:
        factor = (
            self.db.query(DesirabilityFactorConfig)
            .filter(DesirabilityFactorConfig.id == factor_id)
            .first()
        )
        if factor is None:
            raise LookupError("Desirability factor not found")
        self.db.delete(factor)
        self.db.commit()

    def ensure_default_factors(self) -> None:
        existing_count = self.db.query(DesirabilityFactorConfig).count()
        if existing_count > 0:
            return

        for index, raw in enumerate(DEFAULT_FACTORS):
            self.db.add(
                DesirabilityFactorConfig(
                    display_order=index,
                    is_active=True,
                    name=str(raw["name"]),
                    prompt=str(raw["prompt"]),
                    weight=float(raw["weight"]),
                )
            )
        self.db.commit()

    def generate_for_role(
        self, role_id: int, *, force_refresh: bool = False
    ) -> DesirabilityScoreResult:
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if role is None:
            raise ValueError("Job not found")

        self.ensure_default_factors()

        if not force_refresh:
            latest = self.get_latest_for_company(int(cast(Any, role.company_id)))
            if latest is not None:
                return latest

        company = (
            self.db.query(Company).filter(Company.id == int(cast(Any, role.company_id))).first()
        )
        if company is None:
            raise ValueError("Company not found for role")

        factors = (
            self.db.query(DesirabilityFactorConfig)
            .filter(DesirabilityFactorConfig.is_active.is_(True))
            .order_by(
                DesirabilityFactorConfig.display_order.asc(),
                DesirabilityFactorConfig.id.asc(),
            )
            .all()
        )
        normalized_weights = self._normalize_weights(factors)

        scores = [run_async_task(self._score_factor_async(company, factor)) for factor in factors]

        breakdown: list[dict[str, object]] = []
        weighted_total = 0.0
        for index, factor in enumerate(factors):
            factor_score, reasoning = scores[index]
            normalized_weight = normalized_weights[index]
            weighted_total += factor_score * normalized_weight
            breakdown.append(
                {
                    "factor_id": factor.id,
                    "factor_name": factor.name,
                    "weight": round(normalized_weight, 6),
                    "score": factor_score,
                    "reasoning": reasoning,
                }
            )

        result = DesirabilityScoreResult(
            company_id=company.id,
            role_id=role_id,
            total_score=round(weighted_total, 2),
            factor_breakdown=breakdown,
            provider=self.llm_service.config.provider,
            model=self.llm_service.config.model,
            version=DESIRABILITY_VERSION,
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def get_factors(self) -> list[DesirabilityFactorConfig]:
        self.ensure_default_factors()
        return (
            self.db.query(DesirabilityFactorConfig)
            .order_by(
                DesirabilityFactorConfig.display_order.asc(),
                DesirabilityFactorConfig.id.asc(),
            )
            .all()
        )

    def get_latest_for_company(self, company_id: int) -> DesirabilityScoreResult | None:
        return (
            self.db.query(DesirabilityScoreResult)
            .filter(DesirabilityScoreResult.company_id == company_id)
            .order_by(DesirabilityScoreResult.created_at.desc(), DesirabilityScoreResult.id.desc())
            .first()
        )

    def get_latest_for_role(self, role_id: int) -> DesirabilityScoreResult | None:
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if role is None:
            return None
        return self.get_latest_for_company(int(cast(Any, role.company_id)))

    def reorder_factors(self, factor_ids: list[int]) -> list[DesirabilityFactorConfig]:
        factors = self.get_factors()
        by_id = {int(cast(Any, factor.id)): factor for factor in factors}
        if set(factor_ids) != set(by_id.keys()):
            raise ValueError("factor_ids must include each existing factor exactly once")

        for index, factor_id in enumerate(factor_ids):
            cast(Any, by_id[factor_id]).display_order = index

        self.db.commit()
        return self.get_factors()

    def update_factor(
        self,
        factor_id: int,
        display_order: int | None = None,
        is_active: bool | None = None,
        name: str | None = None,
        prompt: str | None = None,
        weight: float | None = None,
    ) -> DesirabilityFactorConfig:
        factor = (
            self.db.query(DesirabilityFactorConfig)
            .filter(DesirabilityFactorConfig.id == factor_id)
            .first()
        )
        if factor is None:
            raise LookupError("Desirability factor not found")

        if name is not None and name.strip() != factor.name:
            duplicate = (
                self.db.query(DesirabilityFactorConfig)
                .filter(DesirabilityFactorConfig.name == name.strip())
                .filter(DesirabilityFactorConfig.id != factor.id)
                .first()
            )
            if duplicate:
                raise ValueError("Factor name already exists")
            cast(Any, factor).name = name.strip()
        if prompt is not None:
            cast(Any, factor).prompt = prompt.strip()
        if weight is not None:
            cast(Any, factor).weight = weight
        if is_active is not None:
            cast(Any, factor).is_active = is_active
        if display_order is not None:
            cast(Any, factor).display_order = display_order

        self.db.commit()
        self.db.refresh(factor)
        return factor
