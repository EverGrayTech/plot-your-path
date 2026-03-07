# Iteration 12: Skill Standardization + Consolidation

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
- [ ] Extend skill normalization rules beyond casing (aliases, typos, hyphenation)
- [ ] Add explicit mappings for high-noise variants (Agile/AI/Full-stack/Hiring families)
- [ ] Keep mapping table easy to audit and extend

### 2. Ingest Path Standardization
- [ ] Ensure extracted required/preferred skills are canonicalized before persistence
- [ ] Preserve required-over-preferred precedence when the same canonical skill appears in both lists
- [ ] Prevent duplicate skill creation via canonical-name lookup

### 3. Existing Data Consolidation Script
- [ ] Add script mode to normalize all existing `skills.name` values
- [ ] Merge duplicate canonical skills by re-pointing `role_skills.skill_id`
- [ ] Resolve post-merge duplicate links per role (prefer `required` over `preferred`)
- [ ] Remove orphaned/merged duplicate skills safely
- [ ] Provide `--dry-run` and `--apply` execution modes with summary counts

### 4. Test Coverage
- [ ] Add unit tests for new canonical mappings and typo corrections
- [ ] Add tests for duplicate link resolution after skill merges
- [ ] Add script/integration test for safe consolidation transaction behavior

### 5. Operational Verification
- [ ] Run dry-run and inspect proposed merges before mutation
- [ ] Apply consolidation and verify skills API list/detail behavior remains correct
- [ ] Capture verification queries/commands for future periodic cleanup runs

## Acceptance Criteria
- [ ] New captures store canonicalized skills with reduced variant drift
- [ ] Existing skill dictionary is consolidated without losing role-to-skill coverage
- [ ] Required/preferred precedence is preserved after consolidation
- [ ] Tests cover key alias/merge paths and pass
