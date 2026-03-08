# Plan: Skill Standardization + Consolidation

## Objective
Reduce duplicate/near-duplicate skills by applying deterministic canonicalization during ingest and consolidating existing records in the database.

Canonical skill policy:
- Prefer compact, common labels where unambiguous (`AI`, `Agile`, `SQL`, etc.)
- Normalize typo, casing, and punctuation variants to a single canonical value

## Scope Decisions (Locked)
- Skill normalization remains rule-based and deterministic for this iteration
- Canonicalization is applied in two places:
  - ingest path (new extracted skills)
  - one-time DB consolidation (existing `skills` + `role_skills` links)
- Existing DB comparison is canonical-name based (reuse existing canonical skills when present)
- No semantic fuzzy merge in this pass; uncertain mappings should remain unmerged

## Implementation Checklist

### 1. Canonicalization Rules Expansion
- [x] Extend skill normalization rules beyond casing (aliases, typos, hyphenation)
- [x] Add explicit mappings for high-noise variants (Agile/AI/Full-stack/Hiring families)
- [x] Keep mapping table easy to audit and extend

### 2. Ingest Path Standardization
- [x] Ensure extracted required/preferred skills are canonicalized before persistence
- [x] Preserve required-over-preferred precedence when the same canonical skill appears in both lists
- [x] Prevent duplicate skill creation via canonical-name lookup

### 3. Existing Data Consolidation Script
- [x] Add script mode to normalize all existing `skills.name` values
- [x] Merge duplicate canonical skills by re-pointing `role_skills.skill_id`
- [x] Resolve post-merge duplicate links per role (prefer `required` over `preferred`)
- [x] Remove orphaned/merged duplicate skills safely
- [x] Provide `--dry-run` and `--apply` execution modes with summary counts

### 4. Test Coverage
- [x] Add unit tests for new canonical mappings and typo corrections
- [x] Add tests for duplicate link resolution after skill merges
- [x] Add script/integration test for safe consolidation transaction behavior

### 5. Operational Verification
- [x] Run dry-run and inspect proposed merges before mutation
- [x] Apply consolidation and verify skills API list/detail behavior remains correct
- [x] Capture verification queries/commands for future periodic cleanup runs

Verification commands run:
- `uv run python -m backend.scripts.standardize_skills` → `Skills merged: 7` (pre-apply)
- `uv run python -m backend.scripts.standardize_skills --apply` → `Skills merged: 7`
- `uv run python -m backend.scripts.standardize_skills` → `Skills merged: 0` (post-apply confirmation)

## Acceptance Criteria
- [x] New captures store canonicalized skills with reduced variant drift
- [x] Existing skill dictionary is consolidated without losing role-to-skill coverage
- [x] Required/preferred precedence is preserved after consolidation
- [x] Tests cover key alias/merge paths and pass
