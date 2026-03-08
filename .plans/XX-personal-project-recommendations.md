# Plan: Personal Project Recommendations (Skill Gap Closure)

## Objective
Recommend practical, portfolio-friendly projects that close high-value skill gaps aligned with target roles and career pathways.

## Customer Value
- Converts abstract skill gaps into concrete next actions
- Improves readiness for future applications/interviews
- Builds demonstrable portfolio evidence tied to goals

## Scope Decisions (Locked)
- Project recommendations are generated from skill-gap and career-path signals
- Output includes effort estimate, expected impact, and portfolio relevance
- Recommendations are editable/savable to a simple project backlog
- No full project-management suite in this iteration (lightweight tracking only)

## Prerequisites
- `13-application-fit-analysis.md`
- `XX-career-path-exploration.md`

## Implementation Checklist

### 1. Data Model + Contracts
- [ ] Add recommended-project entity with linked source gaps/targets
- [ ] Define schema for project brief, target skills, effort, milestones, and impact estimate
- [ ] Add backlog state fields (`suggested`, `selected`, `in_progress`, `completed`)

### 2. Recommendation Engine
- [ ] Implement ranking logic that balances gap severity, desirability alignment, and effort
- [ ] Generate 3–5 differentiated project ideas per request with rationale
- [ ] Support regeneration with variation while preserving prior saved items
- [ ] Consume pathway context from career-path scenarios instead of duplicating transition inference logic

### 3. Frontend Workflow
- [ ] Add “Projects” section/page listing recommended and saved project ideas
- [ ] Add actions to accept, edit, and track status of selected projects
- [ ] Add simple milestone/progress notes per selected project

### 4. Tests + Verification
- [ ] Add backend tests for recommendation ranking and persistence behavior
- [ ] Add frontend tests for recommendation display and backlog status transitions
- [ ] Verify integration with skill-gap and career-path data sources

## Acceptance Criteria
- [ ] User can generate and save targeted project recommendations
- [ ] Recommendations are clearly linked to specific skill/career goals
- [ ] User can track lightweight progress on selected projects
