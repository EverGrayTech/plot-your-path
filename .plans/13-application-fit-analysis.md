# Iteration 13: In-App Role Fit (Skill Match) Analysis MVP

## Objective
Replace the external chat step for initial role triage by adding a native, repeatable in-app role-fit workflow for each captured job.

## Customer Value (Why This Phase First)
- Immediate: keeps the “should I apply?” decision inside the app
- Faster prioritization across open roles
- Creates reusable analysis artifacts for later cover-letter and Q&A generation

## Scope Decisions (Locked)
- Fit and skill match are the same concept in this product (single canonical fit signal)
- Analysis is generated per role on demand from Job Detail
- Output includes deterministic fit score + recommendation (`go` / `maybe` / `no-go`) and concise rationale
- Uses existing `resume.md` (or equivalent configured file) as the short-term candidate profile source
- Stores analysis history with timestamp so reruns are auditable
- No auto-reanalysis background jobs in this iteration

## Prerequisites
- Existing canonicalized `Role_Skills` data from completed iterations (`11`, `12`)
- If profile data is unavailable, use `resume.md` fallback input

## Implementation Checklist

### 1. Data Model + Contracts
- [ ] Add persisted fit-analysis entity linked to `role_id`
- [ ] Define API response schema for fit score, covered/missing skills, recommendation, and rationale
- [ ] Include metadata fields: provider/model used, created timestamp, and version marker

### 2. Backend Generation Flow
- [ ] Add endpoint to generate fit analysis for a role
- [ ] Implement deterministic required/preferred skill matching against profile/resume evidence
- [ ] Build prompt assembly only for concise rationale/explanation layer (not core scoring math)
- [ ] Validate/normalize output into strict response shape
- [ ] Persist generated result and return latest record

### 3. Job Detail UI Integration
- [ ] Add “Analyze Fit” action in Job Detail modal/page
- [ ] Render latest fit analysis in a clear section (summary, strengths, gaps, recommendation)
- [ ] Show loading/error/retry states with readable messaging

### 4. List-Level Prioritization Signal
- [ ] Surface latest recommendation badge on Jobs list rows where available
- [ ] Add basic recommendation filter (`All`, `Go`, `Maybe`, `No-Go`, `Not analyzed`)
- [ ] Expose fit score field for future smart-sort composition with desirability
- [ ] Keep existing search/sort behavior intact

### 5. Tests + Verification
- [ ] Add backend tests for generation success, invalid role, and malformed model output handling
- [ ] Add frontend tests for analyze action, rendering states, and recommendation filter behavior
/mnt- [ ] Verify no regression in existing jobs/skills flows

## Acceptance Criteria
- [ ] User can generate and view fit analysis for any captured job in-app
- [ ] Analysis output is structured and includes fit score + recommendation + rationale
- [ ] Jobs list can be filtered by recommendation state
- [ ] Results persist and are visible after app restart
