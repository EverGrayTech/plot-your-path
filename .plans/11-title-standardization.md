# Iteration 11: Job Title Standardization

## Objective
Reduce title variation by standardizing role titles into a consistent structure while preserving meaningful distinctions.

Canonical title shape:
- `Rank, Department`
- `Rank, Department — Focus` (when focus exists)

## Scope Decisions (Locked)
- Title normalization is deterministic and rule-based (no fuzzy/LLM rewrite at persistence time)
- Rank is canonicalized to full-form titles where mapped (e.g., `VP` → `Vice President`)
- Department and optional focus text are preserved semantically and only whitespace/punctuation-normalized
- Normalization is applied in two places:
  - ingest path (new captures)
  - one-time database backfill for existing `roles.title`
- If parsing confidence is low, preserve original title text to avoid destructive rewrites

## Implementation Checklist

### 1. Shared Normalization Utilities
- [ ] Add a backend normalization module with job-title parsing helpers
- [ ] Define rank alias map and canonical rank outputs
- [ ] Add safe fallback behavior for unknown or ambiguous title formats

### 2. Ingest Path Standardization
- [ ] Apply title normalization inside `JobCaptureService` before creating `Role`
- [ ] Keep output format consistent across all captures (`Rank, Department — Focus`)
- [ ] Ensure existing role dedupe behavior by URL remains unchanged

### 3. Existing Data Backfill
- [ ] Add a script entrypoint to standardize existing `roles.title` values
- [ ] Support `--dry-run` summary and `--apply` mutation mode
- [ ] Log changed titles and counts for auditability

### 4. Test Coverage
- [ ] Add title-normalizer unit tests for rank alias expansion and separator handling
- [ ] Add service-level test proving ingest persists normalized title
- [ ] Add backfill test for deterministic updates and fallback behavior

### 5. Operational Verification
- [ ] Run dry-run against current DB and review sample transformations
- [ ] Run apply mode and verify title consistency in jobs list/detail API responses
- [ ] Document post-run validation queries in this plan and/or script output

## Acceptance Criteria
- [ ] New captures persist standardized titles with canonical rank ordering/format
- [ ] Existing DB role titles are standardized using the same ruleset
- [ ] No meaningful department/focus information is lost during standardization
- [ ] Tests cover representative title variants and pass
