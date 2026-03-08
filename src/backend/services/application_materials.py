"""Application materials generation and persistence service."""

from __future__ import annotations

import asyncio
import json
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.application_material import ApplicationMaterial
from backend.models.role import Role
from backend.models.role_skill import RoleSkill
from backend.models.skill import Skill
from backend.schemas.ai_settings import OperationFamily
from backend.schemas.career_evidence import EvidenceQuery
from backend.schemas.job import ApplicationArtifactType, InterviewPrepSectionKey
from backend.services.ai_settings import AISettingsService
from backend.services.career_evidence import CareerEvidenceService
from backend.services.fit_analyzer import FitAnalysisService
from backend.services.llm_service import LLMService
from backend.utils.file_storage import save_file

COVER_LETTER_PROMPT_VERSION = "cover-letter-v1"
INTERVIEW_PREP_PROMPT_VERSION = "interview-prep-pack-v1"
QA_PROMPT_VERSION = "application-qa-v1"


class ApplicationMaterialsService:
    """Generate and retrieve versioned application materials for roles."""

    def __init__(self, db: Session, llm_service: LLMService | None = None) -> None:
        self.db = db
        self.llm_service = llm_service or LLMService(
            config=AISettingsService(db).build_llm_config(OperationFamily.APPLICATION_GENERATION)
        )

    def _build_cover_letter_prompt(self, fit_rationale: str, profile_text: str, role: Role) -> str:
        return (
            "Write a concise, tailored cover letter draft for this role.\n"
            "Output plain text only. 220-320 words.\n"
            "Use role context and fit rationale. Avoid inventing achievements.\n\n"
            f"Role title: {role.title}\n"
            f"Role team/division: {role.team_division or 'N/A'}\n"
            f"Role URL: {role.url}\n"
            f"Fit rationale: {fit_rationale}\n\n"
            "Candidate profile excerpt:\n"
            f"{profile_text[:6000]}"
        )

    def _build_qa_prompt(
        self,
        fit_rationale: str,
        profile_text: str,
        questions: list[str],
        role: Role,
    ) -> str:
        numbered_questions = "\n".join(
            f"{index + 1}. {question}" for index, question in enumerate(questions)
        )
        return (
            "Draft concise answers for the listed job application questions.\n"
            "Output plain text only in this format for each item:\n"
            "Q: <original question>\nA: <answer>\n"
            "Do not skip questions. Do not invent facts.\n\n"
            f"Role title: {role.title}\n"
            f"Role team/division: {role.team_division or 'N/A'}\n"
            f"Role URL: {role.url}\n"
            f"Fit rationale: {fit_rationale}\n\n"
            "Candidate profile excerpt:\n"
            f"{profile_text[:6000]}\n\n"
            "Questions:\n"
            f"{numbered_questions}"
        )

    def _build_interview_prep_prompt(
        self,
        fit_rationale: str,
        profile_text: str,
        role: Role,
        required_skills: list[str],
        preferred_skills: list[str],
    ) -> str:
        required = ", ".join(required_skills) if required_skills else "None listed"
        preferred = ", ".join(preferred_skills) if preferred_skills else "None listed"
        return (
            "Create an interview prep pack as strict JSON only.\n"
            "Use evidence-backed phrasing and avoid unsupported claims.\n"
            "If evidence is weak, say 'Based on available evidence'.\n"
            "Return this exact schema:\n"
            "{\n"
            '  "likely_questions": ["..."],\n'
            '  "talking_points": ["..."],\n'
            '  "star_stories": ["..."]\n'
            "}\n"
            "Each section must contain 4-8 concise bullet-style strings.\n"
            "Likely questions should include behavioral + role-specific items.\n"
            "Talking points should align to role needs and fit context.\n"
            "STAR stories should be draft-ready prompts grounded in known evidence only.\n\n"
            f"Role title: {role.title}\n"
            f"Role team/division: {role.team_division or 'N/A'}\n"
            f"Role URL: {role.url}\n"
            f"Required skills: {required}\n"
            f"Preferred skills: {preferred}\n"
            f"Fit rationale: {fit_rationale}\n\n"
            "Candidate profile excerpt:\n"
            f"{profile_text[:6000]}"
        )

    def _build_interview_prep_regenerate_prompt(
        self,
        fit_rationale: str,
        profile_text: str,
        role: Role,
        required_skills: list[str],
        preferred_skills: list[str],
        section: InterviewPrepSectionKey,
        existing_sections: dict[str, list[str]],
    ) -> str:
        required = ", ".join(required_skills) if required_skills else "None listed"
        preferred = ", ".join(preferred_skills) if preferred_skills else "None listed"
        existing = json.dumps(existing_sections, ensure_ascii=False)
        return (
            "Regenerate one interview prep section as strict JSON only.\n"
            "Use evidence-backed phrasing and avoid unsupported claims.\n"
            "If evidence is weak, say 'Based on available evidence'.\n"
            f"Regenerate section key: {section.value}\n"
            "Return exact schema:"
            ' {"items": ["..."]} with 4-8 concise strings.\n'
            "Do not return markdown.\n\n"
            f"Role title: {role.title}\n"
            f"Role team/division: {role.team_division or 'N/A'}\n"
            f"Required skills: {required}\n"
            f"Preferred skills: {preferred}\n"
            f"Fit rationale: {fit_rationale}\n\n"
            "Existing prep pack sections (for continuity):\n"
            f"{existing}\n\n"
            "Candidate profile excerpt:\n"
            f"{profile_text[:6000]}"
        )

    @staticmethod
    def _fallback_cover_letter(role: Role, fit_rationale: str) -> str:
        """Build deterministic fallback cover-letter draft when LLM is unavailable."""
        return (
            "Dear Hiring Team,\n\n"
            f"I am excited to apply for the {role.title} role"
            f"{f' on the {role.team_division} team' if role.team_division else ''}. "
            "My background aligns with the needs of this position, and I am motivated by the "
            "opportunity to contribute meaningful results quickly.\n\n"
            f"From my fit analysis: {fit_rationale} "
            "I bring a practical, collaborative approach and focus on delivering high-quality "
            "work while continuing to close any identified gaps through deliberate learning.\n\n"
            "Thank you for your consideration. I would welcome the opportunity to discuss how I can "
            "support your team.\n\n"
            "Sincerely,\n"
            "Candidate"
        )

    @staticmethod
    def _fallback_question_answers(questions: list[str], role: Role, fit_rationale: str) -> str:
        """Build deterministic fallback Q&A draft set when LLM is unavailable."""
        blocks: list[str] = []
        for question in questions:
            blocks.append(
                "\n".join(
                    [
                        f"Q: {question}",
                        (
                            "A: I am interested in this role because it aligns with my strengths and growth goals. "
                            f"For the {role.title} position, my current fit summary is: {fit_rationale} "
                            "I would contribute focused execution, clear communication, and ownership while "
                            "continuing to deepen expertise in areas where additional depth would benefit the team."
                        ),
                    ]
                )
            )
        return "\n\n".join(blocks)

    @staticmethod
    def _fallback_interview_prep_sections(
        fit_rationale: str,
        required_skills: list[str],
        preferred_skills: list[str],
        role: Role,
    ) -> dict[str, list[str]]:
        primary_skills = required_skills[:3] or [role.title]
        secondary_skills = preferred_skills[:3] or required_skills[:2]
        likely_questions = [
            f"What motivated you to apply for the {role.title} role?",
            "Tell us about a time you delivered results under ambiguity.",
            f"How have you applied {primary_skills[0]} in production settings?",
            "Describe a challenging stakeholder alignment situation and how you handled it.",
            "Which role requirements are strongest for you today, and what are you still building?",
        ]
        talking_points = [
            f"Role-fit anchor: {fit_rationale}",
            f"Core strengths to emphasize: {', '.join(primary_skills)}",
            (
                "Based on available evidence, highlight a repeatable delivery pattern: "
                "scope clearly, communicate early, and close loops with measurable outcomes."
            ),
            (
                "Address growth gaps directly with a current upskilling plan tied to "
                "job-relevant outcomes."
            ),
            (
                f"Bridge to preferred skills where relevant: {', '.join(secondary_skills)}"
                if secondary_skills
                else "Bridge to adjacent capabilities and learning velocity where relevant."
            ),
        ]
        star_stories = [
            "STAR draft: A high-impact project where you improved execution speed or quality.",
            "STAR draft: A cross-functional collaboration where you resolved conflicting priorities.",
            "STAR draft: A setback/recovery example that shows learning agility and ownership.",
            "STAR draft: A mentoring or leadership moment with measurable positive outcomes.",
        ]
        return {
            InterviewPrepSectionKey.LIKELY_QUESTIONS.value: likely_questions,
            InterviewPrepSectionKey.TALKING_POINTS.value: talking_points,
            InterviewPrepSectionKey.STAR_STORIES.value: star_stories,
        }

    @staticmethod
    def _clean_output(output: str) -> str:
        text = output.strip()
        if text.startswith("```"):
            text = text.removeprefix("```").removesuffix("```").strip()
        return text

    @staticmethod
    def _coerce_section_list(value: Any, section_name: str) -> list[str]:
        if not isinstance(value, list):
            raise ValueError(f"{section_name} must be a list")
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        if not cleaned:
            raise ValueError(f"{section_name} cannot be empty")
        return cleaned

    @staticmethod
    def _parse_interview_prep_items(output: str) -> list[str]:
        data = json.loads(output)
        if not isinstance(data, dict):
            raise ValueError("Regenerated interview prep section must be a JSON object")
        return ApplicationMaterialsService._coerce_section_list(data.get("items"), "items")

    @staticmethod
    def _parse_interview_prep_sections(output: str) -> dict[str, list[str]]:
        data = json.loads(output)
        if not isinstance(data, dict):
            raise ValueError("Interview prep pack output must be a JSON object")
        return {
            InterviewPrepSectionKey.LIKELY_QUESTIONS.value: ApplicationMaterialsService._coerce_section_list(
                data.get(InterviewPrepSectionKey.LIKELY_QUESTIONS.value),
                InterviewPrepSectionKey.LIKELY_QUESTIONS.value,
            ),
            InterviewPrepSectionKey.TALKING_POINTS.value: ApplicationMaterialsService._coerce_section_list(
                data.get(InterviewPrepSectionKey.TALKING_POINTS.value),
                InterviewPrepSectionKey.TALKING_POINTS.value,
            ),
            InterviewPrepSectionKey.STAR_STORIES.value: ApplicationMaterialsService._coerce_section_list(
                data.get(InterviewPrepSectionKey.STAR_STORIES.value),
                InterviewPrepSectionKey.STAR_STORIES.value,
            ),
        }

    @staticmethod
    def _render_interview_prep_markdown(sections: dict[str, list[str]]) -> str:
        blocks: list[str] = ["# Interview Prep Pack"]
        labels = {
            InterviewPrepSectionKey.LIKELY_QUESTIONS.value: "Likely Questions",
            InterviewPrepSectionKey.TALKING_POINTS.value: "Talking Points",
            InterviewPrepSectionKey.STAR_STORIES.value: "STAR Story Draft Suggestions",
        }
        for key in (
            InterviewPrepSectionKey.LIKELY_QUESTIONS.value,
            InterviewPrepSectionKey.TALKING_POINTS.value,
            InterviewPrepSectionKey.STAR_STORIES.value,
        ):
            blocks.append(f"\n## {labels[key]}")
            for item in sections.get(key, []):
                blocks.append(f"- {item}")
        return "\n".join(blocks).strip() + "\n"

    @staticmethod
    def _build_content_path(
        artifact_type: ApplicationArtifactType,
        role_id: int,
        version: int,
    ) -> str:
        filename = f"{artifact_type.value}-v{version}.md"
        return f"applications/{role_id}/{filename}"

    def _load_role_skills(self, role_id: int) -> tuple[list[str], list[str]]:
        rows = (
            self.db.query(RoleSkill.requirement_level, Skill.name)
            .join(Skill, Skill.id == RoleSkill.skill_id)
            .filter(RoleSkill.role_id == role_id)
            .order_by(Skill.name.asc())
            .all()
        )
        required: list[str] = []
        preferred: list[str] = []
        for level, skill_name in rows:
            if level == "required":
                required.append(skill_name)
            else:
                preferred.append(skill_name)
        return required, preferred

    def _get_fit_rationale(self, role_id: int) -> str:
        latest_fit = FitAnalysisService(self.db).get_latest_for_role(role_id)
        if latest_fit is None:
            latest_fit = FitAnalysisService(self.db).generate_for_role(role_id)
        return latest_fit.rationale

    def _load_profile_text(self) -> str:
        evidence_service = CareerEvidenceService(self.db)
        profile_text = evidence_service.load_context_text(
            EvidenceQuery(limit=8, min_results=3)
        ).strip()
        if profile_text:
            return profile_text
        raise ValueError("Candidate profile source is missing or empty")

    def _next_version(self, artifact_type: ApplicationArtifactType, role_id: int) -> int:
        latest_version = (
            self.db.query(func.max(ApplicationMaterial.version))
            .filter(ApplicationMaterial.role_id == role_id)
            .filter(ApplicationMaterial.artifact_type == artifact_type.value)
            .scalar()
        )
        return (latest_version or 0) + 1

    def _persist_material(
        self,
        artifact_type: ApplicationArtifactType,
        content: str,
        prompt_version: str,
        role_id: int,
        questions: list[str] | None,
        sections: dict[str, list[str]] | None,
        version: int,
    ) -> ApplicationMaterial:
        path = self._build_content_path(artifact_type, role_id, version)
        stored_path = save_file(content, path)

        material = ApplicationMaterial(
            role_id=role_id,
            artifact_type=artifact_type.value,
            version=version,
            content_path=stored_path,
            questions=questions,
            sections=sections,
            provider=self.llm_service.config.provider,
            model=self.llm_service.config.model,
            prompt_version=prompt_version,
        )
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def _latest_interview_prep_pack(self, role_id: int) -> ApplicationMaterial | None:
        return (
            self.db.query(ApplicationMaterial)
            .filter(ApplicationMaterial.role_id == role_id)
            .filter(
                ApplicationMaterial.artifact_type
                == ApplicationArtifactType.INTERVIEW_PREP_PACK.value
            )
            .order_by(ApplicationMaterial.version.desc(), ApplicationMaterial.id.desc())
            .first()
        )

    def _require_role(self, role_id: int) -> Role:
        role = self.db.query(Role).filter(Role.id == role_id).first()
        if role is None:
            raise LookupError("Job not found")
        return role

    def generate_cover_letter(self, role_id: int) -> ApplicationMaterial:
        role = self._require_role(role_id)
        fit_rationale = self._get_fit_rationale(role_id)
        profile_text = self._load_profile_text()
        version = self._next_version(ApplicationArtifactType.COVER_LETTER, role_id)

        prompt = self._build_cover_letter_prompt(fit_rationale, profile_text, role)
        output = ""
        try:
            output = self._clean_output(asyncio.run(self.llm_service.complete(prompt)))
        except Exception:
            output = ""
        if not output:
            output = self._fallback_cover_letter(role, fit_rationale)

        return self._persist_material(
            artifact_type=ApplicationArtifactType.COVER_LETTER,
            content=output,
            prompt_version=COVER_LETTER_PROMPT_VERSION,
            role_id=role_id,
            questions=None,
            sections=None,
            version=version,
        )

    def generate_question_answers(self, questions: list[str], role_id: int) -> ApplicationMaterial:
        role = self._require_role(role_id)
        cleaned_questions = [question.strip() for question in questions if question.strip()]
        if not cleaned_questions:
            raise ValueError("Question list must contain at least one non-empty question")

        fit_rationale = self._get_fit_rationale(role_id)
        profile_text = self._load_profile_text()
        version = self._next_version(ApplicationArtifactType.APPLICATION_QA, role_id)

        prompt = self._build_qa_prompt(fit_rationale, profile_text, cleaned_questions, role)
        output = ""
        try:
            output = self._clean_output(asyncio.run(self.llm_service.complete(prompt)))
        except Exception:
            output = ""
        if not output:
            output = self._fallback_question_answers(cleaned_questions, role, fit_rationale)

        return self._persist_material(
            artifact_type=ApplicationArtifactType.APPLICATION_QA,
            content=output,
            prompt_version=QA_PROMPT_VERSION,
            role_id=role_id,
            questions=cleaned_questions,
            sections=None,
            version=version,
        )

    def generate_interview_prep_pack(self, role_id: int) -> ApplicationMaterial:
        role = self._require_role(role_id)
        fit_rationale = self._get_fit_rationale(role_id)
        profile_text = self._load_profile_text()
        required_skills, preferred_skills = self._load_role_skills(role_id)
        version = self._next_version(ApplicationArtifactType.INTERVIEW_PREP_PACK, role_id)

        prompt = self._build_interview_prep_prompt(
            fit_rationale,
            profile_text,
            role,
            required_skills,
            preferred_skills,
        )

        sections: dict[str, list[str]] | None = None
        try:
            output = self._clean_output(asyncio.run(self.llm_service.complete(prompt)))
            sections = self._parse_interview_prep_sections(output)
        except Exception:
            sections = None

        if not sections:
            sections = self._fallback_interview_prep_sections(
                fit_rationale,
                required_skills,
                preferred_skills,
                role,
            )

        return self._persist_material(
            artifact_type=ApplicationArtifactType.INTERVIEW_PREP_PACK,
            content=self._render_interview_prep_markdown(sections),
            prompt_version=INTERVIEW_PREP_PROMPT_VERSION,
            role_id=role_id,
            questions=None,
            sections=sections,
            version=version,
        )

    def get_interview_prep_pack(self, material_id: int, role_id: int) -> ApplicationMaterial:
        self._require_role(role_id)
        material = (
            self.db.query(ApplicationMaterial)
            .filter(ApplicationMaterial.id == material_id)
            .filter(ApplicationMaterial.role_id == role_id)
            .filter(
                ApplicationMaterial.artifact_type
                == ApplicationArtifactType.INTERVIEW_PREP_PACK.value
            )
            .first()
        )
        if material is None:
            raise LookupError("Interview prep pack not found")
        return material

    def list_interview_prep_packs(self, role_id: int) -> list[ApplicationMaterial]:
        self._require_role(role_id)
        return (
            self.db.query(ApplicationMaterial)
            .filter(ApplicationMaterial.role_id == role_id)
            .filter(
                ApplicationMaterial.artifact_type
                == ApplicationArtifactType.INTERVIEW_PREP_PACK.value
            )
            .order_by(ApplicationMaterial.version.desc(), ApplicationMaterial.id.desc())
            .all()
        )

    def regenerate_interview_prep_section(
        self,
        role_id: int,
        section: InterviewPrepSectionKey,
    ) -> ApplicationMaterial:
        role = self._require_role(role_id)
        latest_pack = self._latest_interview_prep_pack(role_id)
        if latest_pack is None:
            latest_pack = self.generate_interview_prep_pack(role_id)

        existing_sections = {
            InterviewPrepSectionKey.LIKELY_QUESTIONS.value: list(
                (latest_pack.sections or {}).get(InterviewPrepSectionKey.LIKELY_QUESTIONS.value, [])
            ),
            InterviewPrepSectionKey.TALKING_POINTS.value: list(
                (latest_pack.sections or {}).get(InterviewPrepSectionKey.TALKING_POINTS.value, [])
            ),
            InterviewPrepSectionKey.STAR_STORIES.value: list(
                (latest_pack.sections or {}).get(InterviewPrepSectionKey.STAR_STORIES.value, [])
            ),
        }
        fit_rationale = self._get_fit_rationale(role_id)
        profile_text = self._load_profile_text()
        required_skills, preferred_skills = self._load_role_skills(role_id)
        prompt = self._build_interview_prep_regenerate_prompt(
            fit_rationale,
            profile_text,
            role,
            required_skills,
            preferred_skills,
            section,
            existing_sections,
        )

        regenerated_items: list[str] | None = None
        try:
            output = self._clean_output(asyncio.run(self.llm_service.complete(prompt)))
            regenerated_items = self._parse_interview_prep_items(output)
        except Exception:
            regenerated_items = None

        if not regenerated_items:
            fallback = self._fallback_interview_prep_sections(
                fit_rationale,
                required_skills,
                preferred_skills,
                role,
            )
            regenerated_items = fallback[section.value]

        next_sections = dict(existing_sections)
        next_sections[section.value] = regenerated_items
        version = self._next_version(ApplicationArtifactType.INTERVIEW_PREP_PACK, role_id)
        return self._persist_material(
            artifact_type=ApplicationArtifactType.INTERVIEW_PREP_PACK,
            content=self._render_interview_prep_markdown(next_sections),
            prompt_version=INTERVIEW_PREP_PROMPT_VERSION,
            role_id=role_id,
            questions=None,
            sections=next_sections,
            version=version,
        )

    def update_interview_prep_pack(
        self,
        material_id: int,
        role_id: int,
        sections: dict[str, list[str]],
    ) -> ApplicationMaterial:
        material = self.get_interview_prep_pack(material_id, role_id)
        material.sections = sections
        material.content_path = save_file(
            self._render_interview_prep_markdown(sections),
            material.content_path,
        )
        self.db.commit()
        self.db.refresh(material)
        return material

    def list_for_role(self, role_id: int) -> list[ApplicationMaterial]:
        self._require_role(role_id)
        return (
            self.db.query(ApplicationMaterial)
            .filter(ApplicationMaterial.role_id == role_id)
            .order_by(
                ApplicationMaterial.artifact_type.asc(),
                ApplicationMaterial.version.desc(),
                ApplicationMaterial.id.desc(),
            )
            .all()
        )
