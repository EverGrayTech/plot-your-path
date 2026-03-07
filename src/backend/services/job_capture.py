"""Shared job-capture orchestration service used by API and CLI."""

from __future__ import annotations

import time
from dataclasses import dataclass

from sqlalchemy.orm import Session

from backend.config import LLMConfig, ScrapingConfig, llm_config, scraping_config
from backend.models.company import Company
from backend.models.role import Role
from backend.models.role_skill import RoleSkill
from backend.services.llm_service import LLMError, LLMService
from backend.services.scraper import ScraperError, ScraperService
from backend.services.skill_extractor import SkillExtractorService
from backend.services.title_normalizer import normalize_job_title
from backend.utils.file_storage import save_file
from backend.utils.slug import create_slug


class JobCaptureError(Exception):
    """Base error for job-capture orchestration failures."""


class JobCaptureLLMError(JobCaptureError):
    """Raised when an LLM operation fails."""


class JobCapturePersistenceError(JobCaptureError):
    """Raised when DB/file persistence fails."""


class JobCaptureScrapingError(JobCaptureError):
    """Raised when scraping fails."""


@dataclass(slots=True)
class JobCaptureResult:
    """Normalized result object for API and CLI callers."""

    company: str
    processing_time_seconds: float
    role_id: int
    skills_extracted: int
    status: str
    title: str


class JobCaptureService:
    """Orchestrates URL/clipboard capture through scrape → LLM → persistence."""

    def __init__(
        self,
        db: Session,
        llm_cfg: LLMConfig | None = None,
        scraping_cfg: ScrapingConfig | None = None,
    ) -> None:
        self.db = db
        self.llm_cfg = llm_cfg or llm_config
        self.scraping_cfg = scraping_cfg or scraping_config

    async def capture_from_url(self, url: str) -> JobCaptureResult:
        """Capture a job by scraping the URL first."""
        start = time.time()
        existing = self._find_existing(url, start)
        if existing:
            return existing

        scraper = ScraperService(config=self.scraping_cfg)
        try:
            html = await scraper.scrape(url)
        except (ScraperError, ValueError) as exc:
            raise JobCaptureScrapingError(str(exc)) from exc

        raw_text = scraper.extract_text_from_html(html)
        return await self._capture(
            url=url,
            raw_html=html,
            raw_source="scrape",
            raw_text=raw_text,
            start=start,
        )

    async def capture_from_clipboard_text(self, url: str, clipboard_text: str) -> JobCaptureResult:
        """Capture a job using copied clipboard text (scraper bypass)."""
        start = time.time()
        existing = self._find_existing(url, start)
        if existing:
            return existing

        return await self._capture(
            url=url,
            raw_html=None,
            raw_source="clipboard",
            raw_text=clipboard_text,
            start=start,
        )

    async def _capture(
        self,
        *,
        raw_source: str,
        raw_text: str,
        start: float,
        url: str,
        raw_html: str | None,
    ) -> JobCaptureResult:
        llm = LLMService(config=self.llm_cfg)

        try:
            markdown = await llm.denoise_job_posting(raw_text)
            job_data = await llm.extract_job_data(markdown)
        except LLMError as exc:
            raise JobCaptureLLMError(str(exc)) from exc

        try:
            company_name = (
                job_data.get("company") or "Unknown Company"
            ).strip() or "Unknown Company"
            company = self.db.query(Company).filter(Company.name.ilike(company_name)).first()
            if not company:
                slug = create_slug(company_name)
                if self.db.query(Company).filter(Company.slug == slug).first():
                    slug = f"{slug}-{int(time.time())}"
                company = Company(name=company_name, slug=slug)
                self.db.add(company)
                self.db.flush()

            raw_title = (job_data.get("title") or "Unknown Title").strip() or "Unknown Title"
            title = normalize_job_title(raw_title)
            role = Role(
                company_id=company.id,
                title=title,
                team_division=job_data.get("team_division"),
                salary_min=job_data.get("salary_min"),
                salary_max=job_data.get("salary_max"),
                salary_currency=job_data.get("salary_currency") or "USD",
                url=url,
                raw_html_path="pending",
                cleaned_md_path="pending",
                status="open",
            )
            self.db.add(role)
            self.db.flush()

            if raw_source == "clipboard":
                role.raw_html_path = "clipboard"
            else:
                assert raw_html is not None, "raw_html is required for non-clipboard sources"
                role.raw_html_path = save_file(raw_html, f"jobs/raw/{company.slug}/{role.id}.html")

            role.cleaned_md_path = save_file(markdown, f"jobs/cleaned/{company.slug}/{role.id}.md")

            extractor = SkillExtractorService(self.db)
            required_skills: list[str] = job_data.get("required_skills") or []
            preferred_skills: list[str] = job_data.get("preferred_skills") or []
            skills_count = extractor.link_skills_to_role(role.id, required_skills, preferred_skills)

            self.db.commit()
            return JobCaptureResult(
                company=company.name,
                processing_time_seconds=round(time.time() - start, 3),
                role_id=role.id,
                skills_extracted=skills_count,
                status="success",
                title=title,
            )
        except Exception as exc:
            self.db.rollback()
            raise JobCapturePersistenceError(str(exc)) from exc

    def _find_existing(self, url: str, start: float) -> JobCaptureResult | None:
        existing_role = self.db.query(Role).filter(Role.url == url).first()
        if not existing_role:
            return None

        company = self.db.query(Company).filter(Company.id == existing_role.company_id).first()
        skills_count = (
            self.db.query(RoleSkill).filter(RoleSkill.role_id == existing_role.id).count()
        )
        return JobCaptureResult(
            company=company.name if company else "Unknown",
            processing_time_seconds=round(time.time() - start, 3),
            role_id=existing_role.id,
            skills_extracted=skills_count,
            status="already_exists",
            title=existing_role.title,
        )
