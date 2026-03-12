# Plan: Domain Logic Hardening

## Overview

Harden the product logic behind fit analysis, desirability scoring, and related domain semantics. The implementation is feature-rich, but several areas rely on assumptions that are acceptable for an MVP yet too weak for trustworthy decision support. In particular, fit matching is currently based on simple substring checks, desirability scoring blurs company-level and role-level semantics, and some AI/runtime configuration choices leak across domains in ways that can become misleading.

This plan should follow the infrastructure and modularization work so business rules can be improved without being entangled with transport and orchestration concerns.

## Why This Is Fourth

- The earlier plans reduce architectural friction first.
- Once the system is structurally safer, this plan improves trustworthiness of the product’s actual recommendations and explanations.
- These changes are more likely to affect user-facing behavior and therefore benefit from a cleaner implementation surface.

## Goals

1. Improve the correctness of fit-analysis matching and rationale generation inputs.
2. Clarify desirability score semantics and caching scope.
3. Align AI operation-family usage with actual domain responsibilities.
4. Tighten domain invariants around result meaning, provenance, and recomputation.
5. Expand tests beyond happy-path coverage into decision-quality edge cases.

## Technical Design

### 1. Fit Analysis Semantics

Observed issues:
- Skill coverage is currently inferred by raw substring checks against concatenated profile text.
- This can create false positives, false negatives, and weak explanations.

Refactor direction:
- Base fit matching on normalized skill/evidence units rather than broad text containment alone.
- Introduce clearer rules for direct evidence, adjacent evidence, and missing evidence.
- Ensure rationale output accurately reflects what is and is not supported.

### 2. Desirability Score Scope & Meaning

Observed issues:
- Scores are stored with both company and role linkage, but retrieval behavior effectively treats them as company-level cached values.
- This creates ambiguity about whether a score is role-specific, company-specific, or a snapshot reused across roles.

Refactor direction:
- Decide and document whether desirability is fundamentally company-scoped, role-scoped, or a hybrid snapshot model.
- Align persistence, refresh behavior, and read APIs to that decision.
- Make staleness/recompute semantics explicit.

### 3. Operation Family & Model Semantics

Observed issues:
- Some domain workflows appear to reuse AI operation families opportunistically rather than semantically.

Refactor direction:
- Ensure each AI-backed workflow is routed through the correct operational configuration.
- Add missing operation families only if the domain distinction is meaningful and maintainable.

### 4. Fallback Integrity Rules

Observed issues:
- Deterministic fallbacks exist, but the product does not always clearly distinguish fallback-derived outputs from model-derived outputs in decision-critical paths.

Refactor direction:
- Define which workflows may fall back automatically.
- Define which workflows must surface degraded-confidence output explicitly.
- Preserve user trust by making fallback provenance visible where it materially affects interpretation.

### 5. Domain-Level Validation Coverage

Refactor direction:
- Add tests for ambiguous skill matches, overlapping evidence, no-evidence cases, company-vs-role score reuse, and degraded/fallback outputs.
- Focus on behavioral integrity rather than only code coverage percentage.

## Implementation Steps

### 1. Fit logic review
- [x] Define the target matching semantics for required and preferred skills.
- [x] Replace substring-only heuristics with more structured evidence matching rules.
- [x] Revisit recommendation thresholds if improved matching changes score distribution.

### 2. Desirability semantics review
- [x] Decide the canonical scope of desirability scores.
- [x] Align persistence, retrieval, refresh, and UI labeling with that scope.

### 3. AI operation-family alignment
- [x] Review all AI-backed workflows against current operation-family usage.
- [x] Introduce clearer configuration boundaries only where justified.

### 4. Fallback transparency
- [x] Define which workflows allow silent fallback and which require explicit degraded-state visibility.
- [x] Surface provenance and confidence appropriately in persisted results and APIs.

### 5. Domain-focused testing
- [x] Add regression tests for matching edge cases and scoring semantics.
- [x] Add tests for fallback provenance and stale-score behavior.

## Affected Areas

- `src/backend/services/fit_analyzer.py`
- `src/backend/services/desirability_scorer.py`
- `src/backend/services/application_materials.py`
- related AI settings/config wiring, schemas, and tests
- selected frontend displays that describe confidence, provenance, and score meaning

## Success Criteria

- [x] Fit analysis is based on stronger evidence semantics than raw substring matching alone.
- [x] Desirability score meaning and cache scope are explicit and consistent.
- [x] AI configuration families align with actual workflow responsibilities.
- [x] Fallback-generated outputs are handled with clearer provenance rules.
- [x] Tests validate decision-quality edge cases, not just happy-path persistence.
