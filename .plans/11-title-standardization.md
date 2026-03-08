# Plan: Job Title Standardization

## Objective
Reduce title variation by standardizing role titles into a consistent structure while preserving meaningful distinctions.

Canonical title shape:
- `Rank — Department`

## Scope Decisions (Locked)
- Title normalization is deterministic and rule-based (no fuzzy/LLM rewrite at persistence time)
- Rank is canonicalized to full-form titles where mapped (e.g., `VP` → `Vice President`)
- Department text are preserved semantically and only whitespace/punctuation-normalized
- Normalization is applied in two places:
  - ingest path (new captures)
  - one-time database backfill for existing `roles.title`
- If parsing confidence is low, preserve original title text to avoid destructive rewrites

## Implementation Checklist

### 1. Shared Normalization Utilities
- [x] Add a backend normalization module with job-title parsing helpers
- [x] Define rank alias map and canonical rank outputs
- [x] Add safe fallback behavior for unknown or ambiguous title formats

### 2. Ingest Path Standardization
- [x] Apply title normalization inside `JobCaptureService` before creating `Role`
- [x] Keep output format consistent across all captures (`Rank — Department`)
- [x] Ensure existing role dedupe behavior by URL remains unchanged

### 3. Existing Data Backfill
- [x] Add a script entrypoint to standardize existing `roles.title` values
- [x] Support `--dry-run` summary and `--apply` mutation mode
- [x] Log changed titles and counts for auditability

### 4. Test Coverage
- [x] Add title-normalizer unit tests for rank alias expansion and separator handling
- [x] Add service-level test proving ingest persists normalized title
- [x] Add backfill test for deterministic updates and fallback behavior

### 5. Operational Verification
- [x] Run dry-run against current DB and review sample transformations
- [x] Run apply mode and verify title consistency in jobs list/detail API responses
- [x] Document post-run validation queries in this plan and/or script output

Verification commands run:
- `uv run python -m backend.scripts.standardize_titles` → `Roles changed: 17` (pre-apply)
- `uv run python -m backend.scripts.standardize_titles --apply` → `Roles changed: 17`
- `uv run python -m backend.scripts.standardize_titles` → `Roles changed: 0` (post-apply confirmation)

## Acceptance Criteria
- [x] New captures persist standardized titles with canonical rank ordering/format
- [x] Existing DB role titles are standardized using the same ruleset
- [x] No meaningful department information is lost during standardization
- [x] Tests cover representative title variants and pass
