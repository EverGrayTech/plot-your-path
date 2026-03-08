# Plan: Evidence Traceability for AI Outputs

## Objective
Make generated content auditable by showing which source evidence informed each major output segment (fit rationale, cover letter claims, Q&A answers, interview prep statements).

## Customer Value
- Increases trust in generated content
- Speeds editing by showing where claims came from
- Reduces risk of fabricated/unsupported statements

## Scope Decisions (Locked)
- Traceability is metadata-first (citations/links to evidence snippets)
- Applies to AI-generated outputs across fit, application materials, and interview prep
- Uses lightweight citation granularity (section/paragraph-level) in MVP
- Does not require full semantic provenance graph initially

## Prerequisites
- `14-application-materials.md`
- `18-career-evidence.md`

## Implementation Checklist

### 1. Provenance Data Contract
- [ ] Define citation model linking output section → evidence record(s)
- [ ] Add storage fields for source type, source id, snippet reference, and confidence
- [ ] Add API response shape that returns output with attached citations

### 2. Prompt/Generation Integration
- [ ] Update generation prompts/contracts to request evidence-linked assertions
- [ ] Add post-processing to validate or drop uncited claims
- [ ] Store trace metadata alongside artifact versions

### 3. UX for Transparency
- [ ] Add UI affordance to inspect citations per generated section
- [ ] Add “unsupported claim” flagging/annotation behavior
- [ ] Keep interface lightweight and non-intrusive

### 4. Tests + Verification
- [ ] Add backend tests for citation persistence and invalid-claim handling
- [ ] Add frontend tests for citation display and section-level inspection

## Acceptance Criteria
- [ ] Generated outputs include inspectable evidence references
- [ ] Unsupported claims are minimized and visibly flagged when present
- [ ] Users can quickly trace and verify key generated statements
