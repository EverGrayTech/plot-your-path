# Plan: Clipboard Capture — `capture.py --clip`

## Overview

When a job posting lives only on LinkedIn (or any other gated/auth-walled site), the scraper
can't help — but the user already has the page open in their browser to decide they want to
apply. This plan adds a `--clip` flag to `capture.py` that reads the job description **directly
from the system clipboard**, skipping the scraper entirely while preserving the full LLM
de-noise → extract → persist pipeline.

**User flow:**
1. Open the LinkedIn job posting in your browser.
2. Select all text on the page (`Ctrl+A`) and copy it (`Ctrl+C`).
3. Run: `uv run python capture.py --clip "https://www.linkedin.com/jobs/view/99999"`
4. Done. No terminal paste, no quotes, no escaping.

The URL is still recorded as-is (deduplication, source reference) but the scraper is bypassed.

---

## Goals

| # | Goal | Outcome |
|---|------|---------|
| 1 | Add `--clip` flag to `capture.py` | Reads clipboard instead of scraping |
| 2 | Cross-platform clipboard support | Works on Linux (X11/Wayland/WSL), macOS, Windows |
| 3 | LinkedIn URLs allowed in clip mode | UNSUPPORTED_DOMAINS check bypassed for `--clip` |
| 4 | Validate clipboard is non-empty | Clear error if clipboard is empty or unreadable |
| 5 | No new required dependency for common platforms | `pyperclip` added as optional extra; graceful fallback to `xclip`/`pbpaste` if missing |

---

## Technical Design

### Architecture Design

### New invocation modes

```
# Scrape from URL (existing, unchanged)
uv run python capture.py <url>

# Read from clipboard (new)
uv run python capture.py --clip <url>
```

`<url>` is always required as the canonical identifier. `--clip` just controls the *source* of
the raw text — the URL is stored in the DB and used for deduplication as normal.

### Clipboard reading strategy

`pyperclip` is a small, pure-Python cross-platform clipboard library. It handles:
- **Linux (X11)**: `xclip` or `xsel` (must be installed at OS level)
- **Linux (Wayland)**: `wl-clipboard` (`wl-paste`)
- **WSL**: bridges to Windows clipboard via `clip.exe` / `powershell.exe`
- **macOS**: `pbpaste`
- **Windows**: native win32 API

If `pyperclip` is not installed, the code falls back to shelling out to `xclip -o -selection
clipboard` (Linux) or `pbpaste` (macOS) with a clear error if neither works.

### Pipeline change in `--clip` mode

```
Normal mode:                         Clip mode:
  URL → scrape() → raw HTML            URL (recorded only)
      → extract_text_from_html()       clipboard text (raw)
      → denoise_job_posting()     →    denoise_job_posting()
      → extract_job_data()             → extract_job_data()
      → persist                        → persist
```

The LLM de-noise step still runs on clipboard text — LinkedIn page copy is messy
(navigation chrome, sidebar widgets, etc.) and the LLM cleans it the same way it cleans HTML.

The `raw_html_path` column is set to `"clipboard"` (a sentinel string) instead of a file path.
No raw file is written since there is no HTML.  The cleaned Markdown is still saved as normal.

---

### Affected Files

| File | Change Type | Change |
|------|-------------|---------|
| `capture.py` | Modify | Add `--clip` flag via `argparse`; add `read_clipboard()` helper; conditionally bypass scraper and LinkedIn domain check |
| `pyproject.toml` | Modify | Add `pyperclip` to a new `clipboard` optional extra |
| `.env.example` | No change | — |

> No backend source files change — this is purely a CLI UX concern.

---

## Implementation Steps

### 1. Update `pyproject.toml`**

Add `pyperclip` as a `clipboard` optional extra:

```toml
[project.optional-dependencies]
browser   = ["playwright>=1.48.0"]
clipboard = ["pyperclip>=1.8.0"]
dev       = [...]
```

Install with: `uv sync --extra clipboard`

### 2. Add `read_clipboard()` to `capture.py`**

### 3. Update `main()` in `capture.py`**

Replace bare `sys.argv` parsing with `argparse`.

In clip mode:
  - [x] Skip the `UNSUPPORTED_DOMAINS` check (linkedin.com is fine as a URL record)
  - [x] Call `read_clipboard()` to get `raw_text`
  - [x] Pass `raw_text` directly to `llm.denoise_job_posting()` (skipping `ScraperService`)
  - [x] Set `role.raw_html_path = "clipboard"` (sentinel — no file written)
  - [x] Print a `📋 Clipboard mode` banner so the user sees the switch

### 4. Smoke test**

```bash
# 1. Open a LinkedIn job page, Ctrl+A, Ctrl+C
# 2. Run:
uv run python capture.py --clip "https://www.linkedin.com/jobs/view/12345"
# Expected: skips scraper, runs LLM, persists to DB, prints summary
```

### 5. Commit**

```
feat(capture): add --clip flag for clipboard-based job capture

Allows capturing jobs from LinkedIn (and any other gated site) without
scraping. The user copies the full page text in their browser, then runs
`capture.py --clip <url>`. The LLM de-noise and extraction pipeline runs
on the clipboard text; the URL is recorded for deduplication as normal.

- capture.py: argparse, read_clipboard() helper, clip-mode bypass
- pyproject.toml: pyperclip added as optional [clipboard] extra
```

---

## Out of Scope

- Automatic browser clipboard interception
- Any changes to the FastAPI router or backend services
- Tests (clipboard is a system I/O boundary; manual smoke test is sufficient for MVP)

---

## Success Criteria

- [x] `uv run python capture.py --clip "https://www.linkedin.com/jobs/view/99999"` runs end-to-end after copying a LinkedIn job page
- [x] DB row is created with the LinkedIn URL as `role.url`
- [x] `raw_html_path` is set to `"clipboard"` (no file written for raw HTML)
- [x] Cleaned Markdown is saved to `~/Documents/plot_your_path/jobs/cleaned/`
- [x] `uv run python capture.py <url>` (no `--clip`) behaves exactly as before
- [x] Empty clipboard prints a human-readable error with install tips
- [x] Works in WSL (via `pyperclip`'s Windows clipboard bridge or `xclip` if X server running)
