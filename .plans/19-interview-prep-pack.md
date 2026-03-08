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
- `18-career-evidence.md`

## Implementation Checklist

### 1. Data + API
- [x] Add interview-prep artifact type/version metadata linked to role
- [x] Add generation endpoint(s) for question set, talking points, and story drafts
- [x] Add retrieval/list endpoints for prior prep versions

### 2. Prompt + Output Contracts
- [x] Define strict output schema for prep pack sections
- [x] Ground prompts in role requirements, fit signal, and available evidence
- [x] Add safeguards against unsupported claims by requiring evidence-backed phrasing

### 3. Frontend Workflow
- [x] Add “Interview Prep” section under role/application workspace
- [x] Render prep pack in editable sections with copy/export actions
- [x] Add quick-regenerate per section (questions / talking points / STAR drafts)

### 4. Tests + Verification
- [x] Add backend tests for generation contract validity and version retrieval
- [x] Add frontend tests for prep pack rendering and regenerate interactions

## Acceptance Criteria
- [x] User can generate role-specific interview prep pack in-app
- [x] Prep assets are editable, persisted, and exportable
- [x] Generated statements are grounded in available role/evidence context
