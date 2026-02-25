#!/usr/bin/env python3
"""
capture.py — CLI for ingesting a job posting into Plot Your Path.

Runs the full pipeline (scrape → LLM de-noise → LLM extract → persist) without
requiring the FastAPI server to be running.  All data is written to DATA_ROOT
(configured in .env, defaults to ~/Documents/plot_your_path).

Usage:
    # Scrape directly from a URL (Greenhouse, Lever, Workday, etc.)
    uv run python capture.py <job-url>

    # Read from clipboard — for LinkedIn or any gated site.
    # Open the job page, Ctrl+A, Ctrl+C, then:
    uv run python capture.py --clip <job-url>

Examples:
    uv run python capture.py "https://boards.greenhouse.io/example/jobs/12345"
    uv run python capture.py --clip "https://www.linkedin.com/jobs/view/99999"
"""

from __future__ import annotations

import argparse
import asyncio
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

# Ensure the src/ directory is on the path so backend imports resolve correctly
# when running this script directly from the repo root.
_SRC = os.path.join(os.path.dirname(__file__), "src")
if _SRC not in sys.path:
    sys.path.insert(0, _SRC)


def read_clipboard() -> str:
    """
    Read text from the system clipboard.

    Tries pyperclip first (cross-platform; handles WSL, Wayland, macOS, Windows).
    Falls back to shelling out to xclip, wl-paste, or pbpaste if pyperclip is
    not installed.

    Returns:
        Clipboard text as a string.

    Raises:
        SystemExit: If the clipboard is empty or no clipboard tool is available.
    """
    text = ""

    # Attempt 1: pyperclip (optional extra — uv sync --extra clipboard)
    try:
        import pyperclip  # type: ignore[import]

        text = pyperclip.paste() or ""
    except ImportError:
        pass
    except Exception:
        pass  # pyperclip may raise on headless systems with no display

    # Attempt 2: system clipboard commands
    if not text:
        if shutil.which("xclip"):
            result = subprocess.run(
                ["xclip", "-o", "-selection", "clipboard"],
                capture_output=True,
                text=True,
            )
            text = result.stdout
        elif shutil.which("wl-paste"):
            result = subprocess.run(["wl-paste"], capture_output=True, text=True)
            text = result.stdout
        elif shutil.which("pbpaste"):
            result = subprocess.run(["pbpaste"], capture_output=True, text=True)
            text = result.stdout

    if not text or not text.strip():
        print(
            "❌  Clipboard is empty or unreadable.\n"
            "\n"
            "    Make sure you copied the full job page first (Ctrl+A → Ctrl+C).\n"
            "\n"
            "    If your clipboard tool is missing, install one:\n"
            "      pyperclip (recommended):  uv sync --extra clipboard\n"
            "      Linux X11:                sudo apt install xclip\n"
            "      Linux Wayland:            sudo apt install wl-clipboard",
            file=sys.stderr,
        )
        sys.exit(1)

    return text.strip()


async def main() -> None:  # noqa: C901
    parser = argparse.ArgumentParser(
        prog="capture",
        description="Capture a job posting into Plot Your Path.",
    )
    parser.add_argument(
        "url",
        help="Canonical job posting URL — always required (used for deduplication and records)",
    )
    parser.add_argument(
        "--clip",
        action="store_true",
        help=(
            "Read job text from the clipboard instead of scraping the URL. "
            "Use for LinkedIn or any gated/auth-walled site: open the job page, "
            "Ctrl+A, Ctrl+C, then run this command."
        ),
    )
    args = parser.parse_args()
    url = args.url.strip()
    clip_mode: bool = args.clip
    start = time.time()

    # ------------------------------------------------------------------ imports
    # Deferred so the sys.path manipulation above takes effect first.
    from backend.config import llm_config, scraping_config, settings
    from backend.database import Base, SessionLocal, engine
    from backend.models.company import Company
    from backend.models.role import Role
    from backend.models.role_skill import RoleSkill
    from backend.services.llm_service import LLMError, LLMService
    from backend.services.scraper import ScraperError, ScraperService
    from backend.services.skill_extractor import SkillExtractorService
    from backend.utils.file_storage import save_file
    from backend.utils.slug import create_slug

    # -------------------------------------------- bootstrap data directory + DB
    data_root = Path(settings.data_root)
    print(f"📁  Data root : {data_root}")
    print(f"🗄️   Database  : {settings.database_url}")
    if clip_mode:
        print("📋  Mode      : clipboard (scraper bypassed)")
    print()

    data_root.mkdir(parents=True, exist_ok=True)
    (data_root / "jobs" / "raw").mkdir(parents=True, exist_ok=True)
    (data_root / "jobs" / "cleaned").mkdir(parents=True, exist_ok=True)

    # Create tables if they don't exist yet (idempotent)
    Base.metadata.create_all(bind=engine)

    # --------------------------------------------------------------- open session
    db = SessionLocal()
    try:
        # ------------------------------------------------- deduplication check
        existing = db.query(Role).filter(Role.url == url).first()
        if existing:
            company = db.query(Company).filter(Company.id == existing.company_id).first()
            company_label = company.name if company else "Unknown Company"
            skills_count = db.query(RoleSkill).filter(RoleSkill.role_id == existing.id).count()
            print(f"⚠️   Already captured: [{existing.id}] {company_label} — {existing.title}")
            print(f"    Skills: {skills_count}  |  Role ID: {existing.id}")
            return

        # ------------------------------------------------- step 1: acquire text
        if clip_mode:
            print("📋  Reading clipboard …")
            raw_text = read_clipboard()
            print(f"    ✓ Read {len(raw_text):,} chars from clipboard")
            raw_html_sentinel = "clipboard"  # No HTML file will be written
        else:
            print(f"🌐  Scraping  : {url}")
            scraper = ScraperService(config=scraping_config)
            try:
                html = await scraper.scrape(url)
            except (ScraperError, ValueError) as exc:
                print(f"❌  Scraping failed: {exc}", file=sys.stderr)
                sys.exit(1)

            raw_text = scraper.extract_text_from_html(html)
            print(f"    ✓ Scraped {len(html):,} bytes of HTML")

        # ------------------------------------------------- step 2: LLM de-noise
        print("🤖  De-noising with LLM …")
        llm = LLMService(config=llm_config)
        try:
            markdown = await llm.denoise_job_posting(raw_text)
        except LLMError as exc:
            print(f"❌  LLM de-noising failed: {exc}", file=sys.stderr)
            sys.exit(1)
        print(f"    ✓ Cleaned to {len(markdown):,} chars of Markdown")

        # ----------------------------------------- step 3: LLM extract structure
        print("🔍  Extracting job data and skills …")
        try:
            job_data = await llm.extract_job_data(markdown)
        except LLMError as exc:
            print(f"❌  LLM extraction failed: {exc}", file=sys.stderr)
            sys.exit(1)

        # ------------------------------------------------- step 4: upsert company
        company_name = (job_data.get("company") or "Unknown Company").strip() or "Unknown Company"
        company = db.query(Company).filter(Company.name.ilike(company_name)).first()
        if not company:
            slug = create_slug(company_name)
            if db.query(Company).filter(Company.slug == slug).first():
                slug = f"{slug}-{int(time.time())}"
            company = Company(name=company_name, slug=slug)
            db.add(company)
            db.flush()
            print(f"    ✓ New company  : {company.name} (slug: {company.slug})")
        else:
            print(f"    ✓ Company found: {company.name}")

        # -------------------------------------------------- step 5: create role
        title = (job_data.get("title") or "Unknown Title").strip() or "Unknown Title"
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
            status="active",
        )
        db.add(role)
        db.flush()  # Obtain role.id before building file paths

        # --------------------------------------- step 6: save files, update paths
        if clip_mode:
            # No raw HTML to save — record the sentinel so callers know the source
            role.raw_html_path = raw_html_sentinel  # type: ignore[assignment]
            print(f"    ✓ Raw source : clipboard (no HTML file)")
        else:
            raw_abs = save_file(html, f"data/jobs/raw/{company.slug}/{role.id}.html")
            role.raw_html_path = raw_abs  # type: ignore[assignment]
            print(f"    ✓ Raw HTML   → {raw_abs}")

        cleaned_abs = save_file(markdown, f"data/jobs/cleaned/{company.slug}/{role.id}.md")
        role.cleaned_md_path = cleaned_abs  # type: ignore[assignment]
        print(f"    ✓ Markdown   → {cleaned_abs}")

        # --------------------------------------------------- step 7: link skills
        extractor = SkillExtractorService(db)
        required_skills: list[str] = job_data.get("required_skills") or []
        preferred_skills: list[str] = job_data.get("preferred_skills") or []
        skills_count = extractor.link_skills_to_role(role.id, required_skills, preferred_skills)  # type: ignore[arg-type]

        db.commit()

        # ---------------------------------------------------------------- summary
        elapsed = round(time.time() - start, 1)
        print()
        print("✅  Capture complete!")
        print(f"    Company  : {company.name}")
        print(f"    Title    : {title}")
        print(f"    Role ID  : {role.id}")
        print(f"    Skills   : {skills_count} extracted ({len(required_skills)} required, {len(preferred_skills)} preferred)")
        print(f"    Time     : {elapsed}s")

    except Exception as exc:
        db.rollback()
        print(f"❌  Unexpected error: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
