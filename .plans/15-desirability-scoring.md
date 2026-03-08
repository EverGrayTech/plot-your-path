# Plan: Desirability Scoring Foundation

## Objective
Introduce first-class desirability scoring so role/company prioritization is visible, explainable, and composable with fit.

## Customer Value
- Makes “what to apply to first” explicit and sortable
- Keeps desirability as a separate signal from fit/skill match
- Enables a future “smart sort” that combines fit + desirability

## Scope Decisions (Locked)
- Initial desirability factors are seeded from system defaults
- Factor definitions/prompts/weights are user-editable
- Dynamic add/remove of factors is supported in a constrained MVP form (no advanced formula language)
- Scores are shown with traceable breakdown (factor scores + weighted total)
- Token/model settings and cost controls are explicitly out of scope here (see dedicated plans)

## Prerequisites
- `13-application-fit-analysis.md` (canonical fit signal)

## Implementation Checklist

### 1. Data + Config Model
- [ ] Add scoring-config persistence for factor name, prompt, weight, active flag, and ordering
- [ ] Add score-result persistence for company/role with per-factor breakdown + total

### 2. Backend Scoring Pipeline
- [ ] Add endpoint/service to compute desirability score from active factors
- [ ] Implement deterministic weighted-total calculation with validation on weight ranges
- [ ] Persist reasoning snippets/traces per factor for transparency
- [ ] Add refresh/recompute action for stale scores

### 3. Factor Settings APIs
- [ ] Add CRUD endpoints for desirability factors and weights

### 4. Frontend: Prioritization + Factor Settings UX
- [ ] Add desirability column/sort/filter on Jobs list and company/job detail displays
- [ ] Add settings dialog/page for factor management (edit/add/remove/reorder)
- [ ] Show score breakdown and factor rationale in detail view
- [ ] Add optional Smart Sort (`fit + desirability`) with documented weighting defaults

### 5. Tests + Verification
- [ ] Add backend tests for scoring math and factor CRUD behavior
- [ ] Add frontend tests for settings flows and desirability sort/filter behavior
- [ ] Verify backward compatibility when no scores/settings are configured yet

## Acceptance Criteria
- [ ] User can view desirability score and factor breakdown for scored jobs
- [ ] User can edit factor prompts/weights and trigger recomputation
- [ ] User can optionally use Smart Sort to rank roles by fit + desirability
- [ ] Jobs can be prioritized using desirability in-app
