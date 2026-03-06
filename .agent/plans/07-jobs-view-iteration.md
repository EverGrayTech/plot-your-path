# Iteration 07: Jobs View as Primary Workflow

## Objective
Establish `/jobs` as the primary landing workflow, move job capture into a modal launched from this page, and provide slim client-side search/sort controls.

## Scope Decisions (Locked)
- `/` redirects to `/jobs`
- Global header navigation includes `Jobs` and `Skills`
- Capture flow is modal-based from a large primary “Add Job” button on `/jobs`
- Filtering/sorting stays client-side for MVP
- Jobs sort options: `Newest`, `Oldest`, `Company A→Z`

## Implementation Checklist

### 1) Routing and Navigation Shell
- [ ] Add global nav in `src/frontend/app/layout.tsx` with links to `/jobs` and `/skills`
- [ ] Update `src/frontend/app/page.tsx` to redirect to `/jobs`
- [ ] Ensure navigation is visible and stable across pages

### 2) Jobs Page Foundation
- [ ] Create `src/frontend/app/jobs/page.tsx`
- [ ] Add page heading and large primary `Add Job` button
- [ ] Add a shared search input for company/title matching
- [ ] Add sort dropdown with: `Newest`, `Oldest`, `Company A→Z`
- [ ] Fetch jobs from existing `GET /api/jobs` endpoint

### 3) Client-Side Filter/Sort Behavior
- [ ] Implement search filtering over loaded jobs list (client-side)
- [ ] Implement sort modes over loaded jobs list (client-side)
- [ ] Keep implementation simple and easy to evolve

### 4) Capture Modal Integration
- [ ] Create a lightweight reusable modal component for current frontend patterns
- [ ] Render existing `CaptureJobForm` inside modal from `/jobs`
- [ ] Preserve fallback-text flow and existing error/success messages
- [ ] On successful capture, close modal and refresh jobs list

### 5) Job Detail Modal (Initial)
- [ ] Enable row click to open a job detail modal
- [ ] Fetch job detail from `GET /api/jobs/{id}`
- [ ] Display title, company, status, salary, original URL
- [ ] Display required and preferred skills sections

### 6) Tests
- [ ] Add/adjust frontend tests for `/` redirect behavior
- [ ] Add frontend tests for `/jobs` rendering and search/sort controls
- [ ] Add frontend tests for opening/closing capture modal and refresh-on-success behavior

## Acceptance Criteria
- [ ] Visiting `/` lands user on `/jobs`
- [ ] `/jobs` is usable without extra setup and includes Add Job modal flow
- [ ] Search and sort work client-side
- [ ] Job detail modal opens from list rows
