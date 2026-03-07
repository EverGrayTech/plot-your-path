# Iteration 19: Career Path Exploration (What-If Planning)

## Objective
Enable forward-looking career planning by suggesting plausible next-role pathways with visible trade-offs in desirability, compensation trajectory, and skill-gap effort.

## Customer Value
- Turns the app from reactive job tracker into proactive career planner
- Helps compare multiple long-term paths before committing effort
- Connects current profile to realistic transition options

## Scope Decisions (Locked)
- Start with role-transition suggestions derived from captured roles, profile, and configurable targets
- Present pathway as short ordered steps (current → bridge role(s) → target)
- Show trade-offs per step: skill gaps, desirability estimate, and compensation band signal
- No external labor-market API dependency required for MVP (allow static/heuristic sources)

## Prerequisites
- `13-application-fit-analysis.md`
- `XX-desirability-scoring-and-settings-foundation.md`
- `XX-career-evidence-foundation.md`

## Implementation Checklist

### 1. Data + Domain Foundation
- [ ] Add path scenario entity to persist generated transition plans and assumptions
- [ ] Define schema for pathway steps, required skills, timeline estimate, and confidence
- [ ] Add optional user-entered target roles/preferences input contract

### 2. Path Generation Engine
- [ ] Implement rule-assisted path generator (profile + role graph + heuristics)
- [ ] Add what-if parameter support (time horizon, desired domain, risk tolerance)
- [ ] Produce ranked candidate pathways with rationale and trade-offs

### 3. Frontend Planning UX
- [ ] Add career-path exploration page/section with scenario creation flow
- [ ] Render ranked pathways with expandable step details
- [ ] Add compare view for two or more pathways side-by-side

### 4. Tests + Verification
- [ ] Add backend tests for path generation determinism and filtering logic
- [ ] Add frontend tests for scenario input, ranking display, and compare interaction
- [ ] Verify integration with desirability and skill-gap data sources

## Acceptance Criteria
- [ ] User can generate and review multiple plausible career pathways
- [ ] Each pathway includes step-by-step gap/benefit trade-off visibility
- [ ] Scenarios persist and can be revisited/compared over time
