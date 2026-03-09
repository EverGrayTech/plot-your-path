# Plan: Profile Foundation + Resume Tuning (Raw Experience Path)

## Objective
Begin transition from document-only context to a native profile foundation that still supports `resume.md` fallback, and use it to generate role-targeted resume tuning guidance.

## Customer Value
- Improves application quality with role-specific resume optimization
- Starts building durable, reusable career context beyond one-off chats
- Keeps migration low-friction by preserving current resume file workflow

## Scope Decisions (Locked)
- Maintain `resume.md` compatibility as fallback source
- Depend on shared minimal career evidence interface rather than introducing a second parallel profile schema
- Resume tuning output is guidance + suggested edits, not destructive auto-overwrite of base resume
- This iteration does not yet implement full timeline/work-journal ingestion

## Prerequisites
- `13-application-fit-analysis.md`
- `18-career-evidence.md`

## Implementation Checklist

### 1. Profile Data Foundation
- [x] Add resume-specific enrichment fields that extend (not replace) career evidence records
- [x] Add import/sync path from `resume.md` into career evidence-backed profile views
- [x] Track provenance so generated suggestions can reference source context

### 2. Resume Tuning Engine
- [x] Add endpoint/service to generate role-targeted resume tuning suggestions
- [x] Produce structured output: keep/remove/emphasize bullets, missing keywords, summary tweaks
- [x] Include confidence/rationale notes tied to role requirements and fit analysis

### 3. Frontend Workflow
- [x] Add “Resume Tuning” action in Job Detail/Application Materials area
- [x] Display suggested edits in reviewable sections (not auto-applied)
- [x] Add copy/export affordance for revised draft content

### 4. Tests + Verification
- [x] Add backend tests for resume import fallback behavior and tuning outputs
- [x] Add frontend tests for tuning generation and suggestion rendering
- [x] Verify compatibility with fit-analysis + application-materials flow

## Acceptance Criteria
- [x] User can generate role-specific resume tuning suggestions in-app
- [x] App can operate from structured profile data or `resume.md` fallback
- [x] Suggestions are reviewable, explainable, and non-destructive
