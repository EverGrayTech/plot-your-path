# Plan: Application Materials MVP (Cover Letter + Application Q&A)

## Objective
Replace the external chat workflow for application writing by generating role-tailored cover letters and application-question answers directly in-app.

## Customer Value (Why This Phase Next)
- Completes the core “analyze → apply” loop in one tool
- Reduces context switching and copy/paste errors
- Produces reusable drafts that can be quickly edited before submission

## Scope Decisions (Locked)
- Generation is role-specific and initiated on demand
- Supports two artifact types in this iteration:
  - Cover letter draft
  - Application Q&A draft set (paste-in questions)
- Uses latest fit analysis + resume placeholder as grounding context
- Stores versioned drafts per role and artifact type
- Human-in-the-loop editing remains primary; no one-click auto-submit
- Interview prep workflows are explicitly out of scope (covered in dedicated backlog plan)

## Prerequisites
- `13-application-fit-analysis.md` for canonical fit signal and rationale context
- Captured/cleaned job artifacts and role metadata from completed core iterations

## Implementation Checklist

### 1. Data Model + Storage
- [x] Add application-material entity linked to role with artifact type + version metadata
- [x] Store generated artifacts under deterministic file paths in `data/applications/{role_id}/`
- [x] Persist DB metadata for retrieval, filtering, and audit

### 2. Backend APIs
- [x] Add endpoint to generate cover-letter draft for a role
- [x] Add endpoint to generate Q&A drafts from user-provided question list
- [x] Add endpoint(s) to list/get saved artifact versions per role
- [x] Add validation for missing prerequisites (no fit analysis, missing profile source, empty question set)

### 3. Prompt + Response Contracts
- [x] Define strict structured output contract per artifact type
- [x] Build prompt templates grounded in role details + fit-analysis findings
- [x] Enforce safe fallbacks if model output is malformed/partial

### 4. Frontend Workflow
- [x] Add “Application Materials” section in Job Detail
- [x] Add generate actions for cover letter and Q&A with clear loading/error states
- [x] Add editable draft viewer with copy/export affordances
- [x] Add version selector for previously generated drafts
- [x] Keep extension points ready for future interview-prep pack integration

### 5. Tests + Verification
- [x] Add backend tests for generation, persistence, retrieval, and validation failures
- [x] Add frontend tests for generate flows, draft rendering, and version switching
- [x] Run regression verification for existing jobs/skills/fit-analysis flows

## Acceptance Criteria
- [x] User can generate role-specific cover letter draft in-app
- [x] User can generate draft answers for pasted application questions
- [x] Generated artifacts persist with retrievable version history
- [x] Workflow is usable end-to-end without external chat tooling
