# Iteration 08: Skills View for Captured Skill Analysis

## Objective
Provide a dedicated `/skills` view focused on exploring extracted skills and usage frequency, with simple search/sort and modal detail behavior.

## Scope Decisions (Locked)
- Separate page at `/skills`
- Minimal controls: one search box + one sort dropdown
- Filtering/sorting remains client-side
- Skills sort options: `Most Used`, `Least Used`, `Name A→Z`
- Skill details open in a simple modal from list row click

## Implementation Checklist

### 1) Backend Skill Summary API
- [ ] Add `GET /api/skills` endpoint returning skill summaries
- [ ] Include at minimum: `id`, `name`, `category`, `usage_count`
- [ ] Keep response slim and compatible with MVP UI

### 2) Backend Skill API Tests
- [ ] Add backend tests for empty skill list behavior
- [ ] Add backend tests for populated responses with accurate usage counts
- [ ] Validate stable ordering or document client-side sort ownership

### 3) Skills Page Foundation
- [ ] Create `src/frontend/app/skills/page.tsx`
- [ ] Add page heading and shared search input
- [ ] Add sort dropdown: `Most Used`, `Least Used`, `Name A→Z`
- [ ] Load skills from `GET /api/skills`

### 4) Client-Side Filter/Sort Behavior
- [ ] Implement client-side text filtering on skill name
- [ ] Implement client-side sort modes from dropdown
- [ ] Keep logic straightforward and maintainable

### 5) Skill Detail Modal (Initial)
- [ ] Open modal on row click
- [ ] Display skill metadata and usage summary
- [ ] Prepare modal content area for referenced jobs list (wired fully in Iteration 09)

### 6) Frontend Tests
- [ ] Add tests for `/skills` page render and data load
- [ ] Add tests for client-side search/sort behavior
- [ ] Add tests for opening/closing skill detail modal

## Acceptance Criteria
- [ ] `/skills` page is reachable from nav and loads captured skills
- [ ] Search and selected sort options behave correctly client-side
- [ ] Skill detail modal opens from row interaction
