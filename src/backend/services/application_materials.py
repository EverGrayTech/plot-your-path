"""Application materials generation and persistence service."""

from __future__ import annotations

import asyncio
from pathlib import Path

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models.application_material import ApplicationMaterial
from backend.models.role import Role
from backend.schemas.ai_settings import OperationFamily
from backend.schemas.job import ApplicationArtifactType
from backend.services.ai_settings import AISettingsService
from backend.services.fit_analyzer import FitAnalysisService
from backend.services.llm_service import LLMService
from backend.utils.file_storage import file_exists, load_file, save_file

COVER_LETTER_PROMPT_VERSION = "cover-letter-v1"
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
    def _clean_output(output: str) -> str:
        text = output.strip()
        if text.startswith("```"):
            text = text.removeprefix("```").removesuffix("```").strip()
        return text

    @staticmethod
    def _build_content_path(
        artifact_type: ApplicationArtifactType,
        role_id: int,
        version: int,
    ) -> str:
        filename = f"{artifact_type.value}-v{version}.md"
        return f"applications/{role_id}/{filename}"

    def _get_fit_rationale(self, role_id: int) -> str:
        latest_fit = FitAnalysisService(self.db).get_latest_for_role(role_id)
        if latest_fit is None:
            latest_fit = FitAnalysisService(self.db).generate_for_role(role_id)
        return latest_fit.rationale

    def _load_profile_text(self) -> str:
        profile_path = settings.candidate_profile_path
        if file_exists(profile_path):
            content = load_file(profile_path).strip()
            if content:
                return content

        fallback_resume_path = str(Path(settings.data_root) / "resume.md")
        if file_exists(fallback_resume_path):
            content = load_file(fallback_resume_path).strip()
            if content:
                return content

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
            provider=self.llm_service.config.provider,
            model=self.llm_service.config.model,
            prompt_version=prompt_version,
        )
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

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
            version=version,
        )

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
