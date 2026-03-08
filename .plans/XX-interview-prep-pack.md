# Plan: Interview Prep Pack

## Objective
Deliver a dedicated interview-preparation workflow with role-targeted talking points, likely question coverage, and reusable story drafts.

## Customer Value
- Improves interview conversion quality (high-priority outcome)
- Turns captured job context into actionable prep assets
- Reduces last-minute interview prep stress

## Scope Decisions (Locked)
- Generates interview-prep assets per role on demand
- Includes three outputs:
  - likely question set (behavioral + role-specific)
  - talking points / key themes
  - STAR-style story draft suggestions
- Human review/edit remains primary
- Mock-interview simulation is out of scope for this iteration

## Prerequisites
- `14-application-materials.md`
- `XX-career-evidence.md`

## Implementation Checklist

### 1. Data + API
- [ ] Add interview-prep artifact type/version metadata linked to role
- [ ] Add generation endpoint(s) for question set, talking points, and story drafts
- [ ] Add retrieval/list endpoints for prior prep versions

### 2. Prompt + Output Contracts
- [ ] Define strict output schema for prep pack sections
- [ ] Ground prompts in role requirements, fit signal, and available evidence
- [ ] Add safeguards against unsupported claims by requiring evidence-backed phrasing

### 3. Frontend Workflow
- [ ] Add “Interview Prep” section under role/application workspace
- [ ] Render prep pack in editable sections with copy/export actions
- [ ] Add quick-regenerate per section (questions / talking points / STAR drafts)

### 4. Tests + Verification
- [ ] Add backend tests for generation contract validity and version retrieval
- [ ] Add frontend tests for prep pack rendering and regenerate interactions

## Acceptance Criteria
- [ ] User can generate role-specific interview prep pack in-app
- [ ] Prep assets are editable, persisted, and exportable
- [ ] Generated statements are grounded in available role/evidence context
