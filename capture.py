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
    from backend.config import settings
    from backend.database import Base, SessionLocal, engine
    from backend.services.job_capture import (
        JobCaptureLLMError,
        JobCapturePersistenceError,
        JobCaptureScrapingError,
        JobCaptureService,
    )

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
        service = JobCaptureService(db)
        try:
            if clip_mode:
                print("📋  Reading clipboard …")
                raw_text = read_clipboard()
                print(f"    ✓ Read {len(raw_text):,} chars from clipboard")
                result = await service.capture_from_clipboard_text(url, raw_text)
            else:
                print(f"🌐  Scraping  : {url}")
                result = await service.capture_from_url(url)
        except JobCaptureScrapingError as exc:
            print(f"❌  Scraping failed: {exc}", file=sys.stderr)
            sys.exit(1)
        except JobCaptureLLMError as exc:
            print(f"❌  LLM processing failed: {exc}", file=sys.stderr)
            sys.exit(1)
        except JobCapturePersistenceError as exc:
            print(f"❌  Persistence failed: {exc}", file=sys.stderr)
            sys.exit(1)

        # ---------------------------------------------------------------- summary
        elapsed = round(time.time() - start, 1)
        print()
        if result.status == "already_exists":
            print("⚠️   Already captured")
        else:
            print("✅  Capture complete!")
        print(f"    Company  : {result.company}")
        print(f"    Title    : {result.title}")
        print(f"    Role ID  : {result.role_id}")
        print(f"    Skills   : {result.skills_extracted} extracted")
        print(f"    Time     : {elapsed}s")

    except Exception as exc:
        db.rollback()
        print(f"❌  Unexpected error: {exc}", file=sys.stderr)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
