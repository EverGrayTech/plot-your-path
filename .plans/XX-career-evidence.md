# Iteration XX: Career Evidence Foundation (Minimal Shared Interface)

## Objective
Create a minimal, generic career-evidence interface that can ingest resume-derived content and future journal entries without locking the product into an over-modeled schema.

## Customer Value
- Reduces duplicate data modeling across resume tuning and work journal plans
- Improves reuse of evidence for fit, application materials, and interview prep
- Keeps future migration path open while delivering value now

## Scope Decisions (Locked)
- Keep schema intentionally minimal and source-agnostic
- Support source types: `resume`, `journal`, `manual`
- Focus on retrieval-ready evidence units (not full resume/work-history modeling)
- Do not attempt full “perfect profile graph” in this iteration

## Implementation Checklist

### 1. Shared Evidence Contract
- [ ] Define minimal evidence entity: source, text/body, tags, timeframe, provenance metadata
- [ ] Define stable retrieval interface for downstream prompt builders
- [ ] Add version/provenance markers to support future re-ingestion

### 2. Ingestion Adapters (Minimal)
- [ ] Add adapter for `resume.md` import into evidence units
- [ ] Add adapter interface for journal entries to map into same evidence contract
- [ ] Keep adapters idempotent and safe to re-run

### 3. Retrieval Utilities
- [ ] Add utility methods to fetch evidence by skills/tags/timeframe/relevance
- [ ] Add deterministic fallback behavior when evidence is sparse

### 4. Tests + Verification
- [ ] Add tests for evidence model validation and adapter idempotency
- [ ] Add tests for retrieval/filter behavior across mixed source types

## Acceptance Criteria
- [ ] Resume and journal content can be represented through one shared minimal evidence interface
- [ ] Downstream plans can depend on this interface without bespoke source handling
- [ ] Schema remains intentionally lightweight and extensible
