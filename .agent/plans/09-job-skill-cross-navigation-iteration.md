# Iteration 09: Bidirectional Job ↔ Skill Navigation

## Objective
Connect the Jobs and Skills workflows by enabling modal-based bidirectional navigation:
- Job detail → required/preferred skill links
- Skill detail → referencing jobs links

## Scope Decisions (Locked)
- Navigation remains modal-based for MVP (no dedicated detail routes)
- Cross-navigation must support both required and preferred skill references
- Keep response contracts slim and focused on linkable metadata

## Implementation Checklist

### 1) Backend Contract Updates for Linkable Entities
- [x] Extend job detail response to include skill IDs with display names and requirement levels
- [x] Add `GET /api/skills/{skill_id}` detail endpoint with referenced job summaries
- [x] Ensure referenced jobs include `id`, `company`, `title`, `status`, `created_at`

### 2) Backend Tests for Cross-Link Data
- [x] Add tests confirming job detail includes linkable skill IDs
- [x] Add tests confirming skill detail includes linked job summaries
- [x] Add tests for not-found behavior on skill detail endpoint

### 3) Job Modal → Skill Modal Wiring
- [x] Render required/preferred skills as clickable items in job detail modal
- [x] Clicking a skill opens the corresponding skill detail modal
- [x] Maintain simple context switch behavior (close previous/open next)

### 4) Skill Modal → Job Modal Wiring
- [x] Render referenced job list in skill detail modal as clickable items
- [x] Clicking a job opens that job’s detail modal
- [x] Preserve smooth transitions without route complexity

### 5) Interaction and UX Polish
- [x] Add loading states for modal-to-modal context switches
- [x] Add resilient empty states (no skills, no linked jobs)
- [x] Confirm close behavior is intuitive from either side

### 6) Frontend Tests for Cross-Navigation
- [x] Add tests for clicking skill in job modal opens skill modal
- [x] Add tests for clicking job in skill modal opens job modal
- [x] Add tests for required vs preferred skill link behavior

## Acceptance Criteria
- [x] User can navigate job → skill from any listed required/preferred skill
- [x] User can navigate skill → job from any listed referenced job
- [x] Modal flow remains stable, minimal, and understandable
