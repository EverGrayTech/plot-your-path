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
- [x] Define citation model linking output section → evidence record(s)
- [x] Add storage fields for source type, source id, snippet reference, and confidence
- [x] Add API response shape that returns output with attached citations

### 2. Prompt/Generation Integration
- [x] Update generation prompts/contracts to request evidence-linked assertions
- [x] Add post-processing to validate or drop uncited claims
- [x] Store trace metadata alongside artifact versions

### 3. UX for Transparency
- [x] Add UI affordance to inspect citations per generated section
- [x] Add “unsupported claim” flagging/annotation behavior
- [x] Keep interface lightweight and non-intrusive

### 4. Tests + Verification
- [x] Add backend tests for citation persistence and invalid-claim handling
- [x] Add frontend tests for citation display and section-level inspection

## Acceptance Criteria
- [x] Generated outputs include inspectable evidence references
- [x] Unsupported claims are minimized and visibly flagged when present
- [x] Users can quickly trace and verify key generated statements
