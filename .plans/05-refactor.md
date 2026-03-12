# Plan: Pre-Phase Refactor & Debt Cleanup

## Overview

A code review against `docs/system-spec.md`, the existing implementation plans, and current backend code found several **high-impact debt items** that should be addressed before continuing toward later phases (frontend build-out, scoring engine, and agent orchestration).

The objective is to reduce divergence risk, enforce backend async/IO standards, and stabilize persistence behavior.

## Technical Design

### Key Findings (What should be fixed now)

## 1. Pipeline duplication across API and CLI (High)

The job-capture pipeline is duplicated in:
- `src/backend/routers/jobs.py` (`scrape_job`)
- `capture.py` (`main`)

Both perform similar steps (dedupe → scrape/clip → LLM denoise/extract → company/role upsert → file writes → skills link), but implementation details already diverge. This increases bug risk and maintenance cost.

**Refactor direction:** create a single orchestrator service (e.g., `JobCaptureService`) used by both API and CLI.

## 2. Blocking I/O in async route (High)

`POST /api/jobs/scrape` is async but performs blocking work directly:
- synchronous SQLAlchemy session operations
- file writes via `save_file`

This violates the backend rule: *never perform blocking I/O in async routes*.

**Refactor direction:** keep route thin and delegate blocking pipeline to a worker thread (`run_in_threadpool`) or convert route to sync endpoint while keeping async-only external calls isolated.

## 3. Inconsistent path persistence format (High)

Path storage differs by execution path:
- API stores relative paths (`data/jobs/...`)
- CLI stores absolute paths (returned from `save_file`)

`file_storage` currently supports both, but mixed DB values reduce portability and complicate downstream logic.

**Refactor direction:** define one canonical format in DB (recommended: data-root-relative paths like `jobs/raw/...`), and normalize all reads/writes to that format.

## 4. Skill linking can violate unique constraint (Medium)

`RoleSkill` has unique `(role_id, skill_id)`, but `link_skills_to_role` can attempt duplicate inserts when:
- skill repeats in a list
- same skill appears in required and preferred lists

This can trigger integrity errors in realistic LLM output.

**Refactor direction:** normalize + dedupe before insert, and define precedence rule (`required` overrides `preferred`).

## 5. Error handling and transaction boundaries are inconsistent (Medium)

- API path has no explicit rollback around all persistence steps.
- CLI has broad `except Exception` + re-raise behavior that can produce noisy tracebacks without cleanup guarantees.

**Refactor direction:** centralize transaction handling in orchestration service; use explicit domain exceptions and consistent user/API error mapping.

## Goals

1. Single, reusable capture pipeline shared by CLI and API.
2. Async-route compliance with non-blocking behavior expectations.
3. Canonical DB path format for persisted files.
4. Robust skill linking with duplicate-safe logic.
5. Consistent error taxonomy and transaction handling.

### Proposed Architecture Changes

### New service
- `src/backend/services/job_capture.py`
  - `capture_from_url(...)`
  - `capture_from_clipboard_text(...)`
  - shared internals for:
    - deduplication
    - scrape/text intake
    - LLM processing
    - persistence + file writes
    - skill linking

### Router changes
- `src/backend/routers/jobs.py`
  - route becomes orchestration wrapper only
  - maps service exceptions to HTTP responses
  - removes inline persistence logic

### CLI changes
- `capture.py`
  - retains CLI UX, argument parsing, clipboard read
  - delegates business flow to `JobCaptureService`
  - prints result object returned by service

### Persistence consistency
- `src/backend/utils/file_storage.py`
  - formalize canonical stored path format
  - explicit `to_storage_path()` / `to_absolute_path()` helpers

### Skill linking hardening
- `src/backend/services/skill_extractor.py`
  - dedupe and precedence handling before inserts
  - avoid unique-constraint collisions deterministically

## Implementation Steps

### 1. Introduce capture domain result/exception types**
  - [x] Define typed result object and domain exceptions for expected failure modes.

### 2. Extract shared pipeline into `JobCaptureService`**
  - [x] Move duplicated API/CLI logic into service with clear method boundaries.

### 3. Refactor API route to thin adapter**
  - [x] Keep async route non-blocking by offloading blocking operations appropriately.

### 4. Refactor CLI to consume service**
  - [x] Preserve current flags and output behavior while removing persistence duplication.

### 5. Normalize file path strategy**
  - [x] Migrate both code paths to one persisted path format.
  - [x] Add compatibility read path for legacy records.

### 6. Harden skill linking**
  - [x] Deduplicate skills and enforce deterministic requirement-level precedence.

### 7. Strengthen tests**
  - [x] Add service-focused tests for end-to-end pipeline behavior.
  - [x] Add regression tests for:
    - [x] duplicate skills in same payload
    - [x] required/preferred overlap
    - [x] path format consistency between API and CLI
    - [x] rollback behavior on mid-pipeline failure

## Affected Files

- `src/backend/services/job_capture.py` (new)
- `src/backend/routers/jobs.py`
- `capture.py`
- `src/backend/services/skill_extractor.py`
- `src/backend/utils/file_storage.py`
- `tests/backend/test_jobs_api.py`
- `tests/backend/test_skill_extractor.py`
- `tests/backend/test_capture_cli.py` (new)
- `tests/backend/test_job_capture_service.py` (new)

## Success Criteria

- [x] API and CLI both use one shared capture service.
- [x] No blocking file/DB work occurs directly inside async route body.
- [x] Stored file paths are canonical and consistent across ingestion paths.
- [x] Duplicate/overlapping skills no longer raise integrity errors.
- [x] Existing tests pass and new regression coverage is added for refactor targets.
