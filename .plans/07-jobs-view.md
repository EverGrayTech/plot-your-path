# Plan: Jobs View as Primary Workflow

## Objective
Establish `/jobs` as the primary landing workflow, move job capture into a modal launched from this page, and provide slim client-side search/sort controls.

## Scope Decisions (Locked)
- `/` redirects to `/jobs`
- Global header navigation includes `Jobs` and `Skills`
- Capture flow is modal-based from a large primary “Add Job” button on `/jobs`
- Filtering/sorting stays client-side for MVP
- Jobs sort options: `Newest`, `Oldest`, `Company A→Z`

## Implementation Checklist

### 1. Routing and Navigation Shell
- [x] Add global nav in `src/frontend/app/layout.tsx` with links to `/jobs` and `/skills`
- [x] Update `src/frontend/app/page.tsx` to redirect to `/jobs`
- [x] Ensure navigation is visible and stable across pages

### 2. Jobs Page Foundation
- [x] Create `src/frontend/app/jobs/page.tsx`
- [x] Add page heading and large primary `Add Job` button
- [x] Add a shared search input for company/title matching
- [x] Add sort dropdown with: `Newest`, `Oldest`, `Company A→Z`
- [x] Fetch jobs from existing `GET /api/jobs` endpoint

### 3. Client-Side Filter/Sort Behavior
- [x] Implement search filtering over loaded jobs list (client-side)
- [x] Implement sort modes over loaded jobs list (client-side)
- [x] Keep implementation simple and easy to evolve

### 4. Capture Modal Integration
- [x] Create a lightweight reusable modal component for current frontend patterns
- [x] Render existing `CaptureJobForm` inside modal from `/jobs`
- [x] Preserve fallback-text flow and existing error/success messages
- [x] On successful capture, close modal and refresh jobs list

### 5. Job Detail Modal (Initial)
- [x] Enable row click to open a job detail modal
- [x] Fetch job detail from `GET /api/jobs/{id}`
- [x] Display title, company, status, salary, original URL
- [x] Display required and preferred skills sections

### 6. Tests
- [x] Add/adjust frontend tests for `/` redirect behavior
- [x] Add frontend tests for `/jobs` rendering and search/sort controls
- [x] Add frontend tests for opening/closing capture modal and refresh-on-success behavior

## Acceptance Criteria
- [x] Visiting `/` lands user on `/jobs`
- [x] `/jobs` is usable without extra setup and includes Add Job modal flow
- [x] Search and sort work client-side
- [x] Job detail modal opens from list rows
