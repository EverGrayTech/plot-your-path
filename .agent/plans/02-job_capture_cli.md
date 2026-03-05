# Plan: Job Capture MVF (Minimum Viable Feature)

## Overview

The backend pipeline is **already fully implemented** (Phases 1–9 of the original plan are complete). The only gaps between "code that works in tests" and "real data being captured" are:

1. **LLM provider** — the service only supports OpenAI/Anthropic/Ollama, not OpenRouter.
2. **Data location** — paths are relative to the repo; real data should live outside it.
3. **Invocation** — no way to trigger the pipeline without running the FastAPI server.

This plan closes those three gaps with minimum scope: no server, no frontend, no tests beyond smoke-testing.

---

## Goals

| # | Goal | Outcome |
|---|------|---------|
| 1 | Add OpenRouter support to LLM service | One API key, one provider for development |
| 2 | Make data root externally configurable | Real data lands in `~/Documents/plot_your_path/` |
| 3 | Create `capture.py` CLI script | `uv run python capture.py <url>` works end-to-end |
| 4 | Bootstrap the external data directory | DB initialized, folders created, `.env` in place |

---

## Technical Design

### Affected Files

| File | Change Type | Purpose |
|------|-------------|---------|
| `src/backend/config.py` | Modify | Add `data_root`, `base_url` (OpenRouter), derive `database_url` |
| `src/backend/services/llm_service.py` | Modify | Pass `base_url` to `AsyncOpenAI` client for OpenRouter |
| `src/backend/utils/file_storage.py` | Modify | Resolve paths relative to configurable `DATA_ROOT` |
| `config/llm.json` | Modify | Add `provider: "openrouter"`, `base_url`, and model |
| `.env.example` | Modify | Document `OPENROUTER_API_KEY` and `DATA_ROOT` |
| `.env` | Create | Actual secrets + `DATA_ROOT=~/Documents/plot_your_path` |
| `capture.py` | Create | CLI entry point (repo root) |

### New File: `capture.py` (repo root)

A standalone script that mirrors the `scrape_job()` router function but runs directly — no HTTP server required. It:
- Accepts a URL as a CLI argument (`sys.argv[1]`)
- Creates a database session directly
- Calls `ScraperService` → `LLMService` → `SkillExtractorService` in sequence
- Prints progress and a final summary to stdout
- Writes data to `~/Documents/plot_your_path/`

```
Usage: uv run python capture.py <job-url>
```

---

### Configuration Design

### `DATA_ROOT` Environment Variable

All data paths are derived from a single root:

```
DATA_ROOT=~/Documents/plot_your_path

→ database:   $DATA_ROOT/plot_your_path.db
→ raw HTML:   $DATA_ROOT/jobs/raw/{company_slug}/{role_id}.html
→ cleaned MD: $DATA_ROOT/jobs/cleaned/{company_slug}/{role_id}.md
```

`settings.database_url` will be auto-derived from `DATA_ROOT` if not explicitly set.

### OpenRouter LLM Config (`config/llm.json`)

OpenRouter is OpenAI-compatible; the OpenAI SDK's `AsyncOpenAI` accepts a `base_url` parameter. No new dependency is required.

```json
{
  "provider": "openrouter",
  "base_url": "https://openrouter.ai/api/v1",
  "api_key_env": "OPENROUTER_API_KEY",
  "model": "anthropic/claude-3-5-sonnet",
  "temperature": 0.1,
  "max_tokens": 4000
}
```

The `LLMConfig` gains an optional `base_url: str | None = None` field. When `provider == "openrouter"`, `_call_openai()` is reused with the overridden base URL.

### `.env` (actual, gitignored)

```dotenv
# LLM
OPENROUTER_API_KEY=sk-or-...

# Data location (absolute path, no trailing slash)
DATA_ROOT=/home/rosea/Documents/plot_your_path
```

> Note: `.env` already appears in `.gitignore` via the project template.

---

## Implementation Steps

- [x] **Step 1 — Git branch**
```
git checkout -b feature/mvf-job-capture-cli
```

- [x] **Step 2 — Update `config.py`**
  - [x] Add `data_root: str` field to `Settings`, expanding `~` to absolute path
  - [x] Derive `database_url` from `data_root` when not explicitly set
  - [x] Add `base_url: str | None = None` to `LLMConfig`

- [x] **Step 3 — Update `llm_service.py`**
  - [x] In `_call_openai()`, pass `base_url=self.config.base_url` to `AsyncOpenAI(...)` when set
  - [x] In `complete()`, treat `provider == "openrouter"` as an alias for `"openai"`

- [x] **Step 4 — Update `file_storage.py`**
  - [x] Read `DATA_ROOT` from `settings` (not hardcoded `data/`)
  - [x] `save_file()` and `load_file()` resolve paths relative to the configured data root when given a relative path

- [x] **Step 5 — Update `config/llm.json`**
  - [x] Set provider, base_url, api_key_env, and a default model for OpenRouter

- [x] **Step 6 — Update `.env.example`**
  - [x] Add `OPENROUTER_API_KEY`, `DATA_ROOT` with documentation comments

- [x] **Step 7 — Create `.env`**
  - [x] Set `OPENROUTER_API_KEY` and `DATA_ROOT=/home/rosea/Documents/plot_your_path`
  - [x] `.env` is gitignored; this stays local

- [x] **Step 8 — Create `capture.py`**
  - [x] Standalone async script at repo root
  - [x] Mirrors the `scrape_job()` router function directly (no HTTP layer)
  - [x] Prints step-by-step progress
  - [x] Reports final: company, title, role_id, skills_count, elapsed time

- [x] **Step 9 — Bootstrap external data directory**
  - [x] Create `~/Documents/plot_your_path/jobs/raw/` and `.../jobs/cleaned/`
  - [x] Run `uv run python src/backend/init_db.py` to initialize the SQLite DB at the configured path

- [x] **Step 10 — Smoke test**
  - [x] Run: `uv run python capture.py <a real job url>`
  - [x] Verify: DB has a new row, files appear in `~/Documents/plot_your_path/jobs/`

- [x] **Step 11 — Commit**
```
feat(capture): add MVF CLI, OpenRouter support, and external data root
```

---

## Out of Scope

- Frontend (Next.js app) — all of phases 10–16 from the original plan
- E2E tests
- Alembic migrations
- Company scoring engine
- Any polish beyond making the CLI work reliably

---

## Success Criteria

- [x] `uv run python capture.py <linkedin-or-greenhouse-url>` completes without error
- [x] `~/Documents/plot_your_path/plot_your_path.db` contains a Company and Role row
- [x] `~/Documents/plot_your_path/jobs/raw/` contains the scraped HTML file
- [x] `~/Documents/plot_your_path/jobs/cleaned/` contains the LLM-cleaned Markdown
- [x] Running the same URL a second time returns `already_exists` (deduplication works)
- [x] No data files exist inside the repo after a successful capture
