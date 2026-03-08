# Plan: Skills View for Captured Skill Analysis

## Objective
Provide a dedicated `/skills` view focused on exploring extracted skills and usage frequency, with simple search/sort and modal detail behavior.

## Scope Decisions (Locked)
- Separate page at `/skills`
- Minimal controls: one search box + one sort dropdown
- Filtering/sorting remains client-side
- Skills sort options: `Most Used`, `Least Used`, `Name A→Z`
- Skill details open in a simple modal from list row click

## Implementation Checklist

### 1. Backend Skill Summary API
- [x] Add `GET /api/skills` endpoint returning skill summaries
- [x] Include at minimum: `id`, `name`, `category`, `usage_count`
- [x] Keep response slim and compatible with MVP UI

### 2. Backend Skill API Tests
- [x] Add backend tests for empty skill list behavior
- [x] Add backend tests for populated responses with accurate usage counts
- [x] Validate stable ordering or document client-side sort ownership

### 3. Skills Page Foundation
- [x] Create `src/frontend/app/skills/page.tsx`
- [x] Add page heading and shared search input
- [x] Add sort dropdown: `Most Used`, `Least Used`, `Name A→Z`
- [x] Load skills from `GET /api/skills`

### 4. Client-Side Filter/Sort Behavior
- [x] Implement client-side text filtering on skill name
- [x] Implement client-side sort modes from dropdown
- [x] Keep logic straightforward and maintainable

### 5. Skill Detail Modal (Initial)
- [x] Open modal on row click
- [x] Display skill metadata and usage summary
- [x] Prepare modal content area for referenced jobs list (wired fully in Iteration 09)

### 6. Frontend Tests
- [x] Add tests for `/skills` page render and data load
- [x] Add tests for client-side search/sort behavior
- [x] Add tests for opening/closing skill detail modal

## Acceptance Criteria
- [x] `/skills` page is reachable from nav and loads captured skills
- [x] Search and selected sort options behave correctly client-side
- [x] Skill detail modal opens from row interaction
