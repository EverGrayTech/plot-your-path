# Iteration 17: Work Journal Foundation (Continuous Experience Capture)

## Objective
Lay the groundwork for ongoing work-journal capture so future application materials and profile context are built from contemporaneous evidence, not memory reconstruction.

## Customer Value
- Reduces loss of achievements between job searches
- Improves quality of STAR stories and future application outputs
- Creates durable long-term career memory inside the app

## Scope Decisions (Locked)
- Start with lightweight manual journal entries (no external integrations)
- Journal entries support tags for skill, project, impact, and timeframe
- Retrieval is simple list/search/filter in this iteration
- No automatic STAR conversion yet (prepared for next phase)

## Prerequisites
- `XX-career-evidence-foundation.md`

## Implementation Checklist

### 1. Data Model + APIs
- [ ] Add journal-entry persistence model with timestamps and tag metadata
- [ ] Add CRUD endpoints for creating, updating, listing, and deleting entries
- [ ] Add basic full-text search/filter support across title/body/tags
- [ ] Map saved journal entries into shared career evidence interface

### 2. Frontend Journal UX
- [ ] Add `/journal` primary page accessible from global nav
- [ ] Add quick-add entry form and editable entry list
- [ ] Add filters for date range and tags

### 3. Context Reuse Hooks
- [ ] Add backend utility to fetch relevant journal entries for downstream AI prompts
- [ ] Add non-breaking integration point for future STAR/material generation workflows

### 4. Tests + Verification
- [ ] Add backend tests for journal CRUD and filter/search behavior
- [ ] Add frontend tests for journal create/edit/filter flows
- [ ] Verify no regressions in existing jobs/skills/application workflows

## Acceptance Criteria
- [ ] User can log and manage work-journal entries in-app
- [ ] Entries are searchable/filterable and persist across sessions
- [ ] Journal data is available for future AI-assisted storytelling features
