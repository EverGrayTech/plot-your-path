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
- [ ] Extend job detail response to include skill IDs with display names and requirement levels
- [ ] Add `GET /api/skills/{skill_id}` detail endpoint with referenced job summaries
- [ ] Ensure referenced jobs include `id`, `company`, `title`, `status`, `created_at`

### 2) Backend Tests for Cross-Link Data
- [ ] Add tests confirming job detail includes linkable skill IDs
- [ ] Add tests confirming skill detail includes linked job summaries
- [ ] Add tests for not-found behavior on skill detail endpoint

### 3) Job Modal → Skill Modal Wiring
- [ ] Render required/preferred skills as clickable items in job detail modal
- [ ] Clicking a skill opens the corresponding skill detail modal
- [ ] Maintain simple context switch behavior (close previous/open next)

### 4) Skill Modal → Job Modal Wiring
- [ ] Render referenced job list in skill detail modal as clickable items
- [ ] Clicking a job opens that job’s detail modal
- [ ] Preserve smooth transitions without route complexity

### 5) Interaction and UX Polish
- [ ] Add loading states for modal-to-modal context switches
- [ ] Add resilient empty states (no skills, no linked jobs)
- [ ] Confirm close behavior is intuitive from either side

### 6) Frontend Tests for Cross-Navigation
- [ ] Add tests for clicking skill in job modal opens skill modal
- [ ] Add tests for clicking job in skill modal opens job modal
- [ ] Add tests for required vs preferred skill link behavior

## Acceptance Criteria
- [ ] User can navigate job → skill from any listed required/preferred skill
- [ ] User can navigate skill → job from any listed referenced job
- [ ] Modal flow remains stable, minimal, and understandable
