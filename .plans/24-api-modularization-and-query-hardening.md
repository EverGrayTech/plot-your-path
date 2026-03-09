# Plan: API Modularization & Query Hardening

## Overview

Break apart the oversized jobs API surface into maintainable modules and removes inefficient query patterns from list/detail workflows. The current `jobs.py` router mixes multiple bounded contexts: capture, listing, detail rendering, status history, application ops, interview stages, outcome feedback, fit analysis, desirability scoring triggers, and application materials.

This plan should follow backend correctness/reliability work so the modularization is built on stable execution and persistence rules.

---

## Why This Is Second

- The current router has grown into a high-churn integration surface with mixed responsibilities.
- Query composition is repeated inline and includes likely N+1-style access patterns for list and pipeline views.
- Response mapping logic is embedded directly in routing code, making behavior hard to reuse or test in isolation.
- A modular API shape will make later frontend simplification much easier because interfaces and ownership become clearer.

---

## Goals

1. Split the jobs API into smaller, cohesive routing modules without breaking public endpoints.
2. Centralize query construction and response shaping for list/detail workflows.
3. Reduce repeated per-row queries in high-read endpoints.
4. Standardize exception-to-HTTP mapping across feature areas.
5. Make endpoint behavior easier to test independently of router wiring.

---

## Technical Design

### 1. Router Boundary Realignment

Refactor direction:
- Keep outward URL structure stable where possible.
- Split internal ownership by capability, for example:
  - job capture
  - job list/detail queries
  - status + application ops
  - interview/outcome tracking
  - application materials
  - analysis/scoring triggers
- Keep each router thin and focused on HTTP concerns only.

### 2. Query Service / Read Model Layer

Observed issues:
- Job list and pipeline responses assemble related data with repeated database lookups inside loops.
- View-model shaping logic is mixed directly into endpoint functions.

Refactor direction:
- Introduce dedicated query/read services for list, pipeline, and detail views.
- Use eager loading and aggregate queries where appropriate to reduce repeated database work.
- Centralize projection into explicit response assemblers or presenter helpers.

### 3. Schema Mapping Cleanup

Observed issues:
- The router owns many `_to_*` helpers that are not really routing concerns.

Refactor direction:
- Move mapping logic into a dedicated presentation/serialization layer close to the read models.
- Reuse shared transformation rules across endpoints that surface the same entities.

### 4. Error Mapping Standardization

Observed issues:
- Similar endpoint families repeat nearly identical `try/except` HTTP mapping patterns.

Refactor direction:
- Introduce a clearer contract for service-layer exceptions.
- Reduce repetitive HTTP mapping code through focused helpers or shared adapters.
- Preserve explicitness while removing copy/paste repetition.

---

## Implementation Steps

### 1. Decompose routing surface
- [x] Define new internal router/module boundaries.
- [x] Move route groups into cohesive files while preserving endpoint behavior.

### 2. Extract read/query services
- [x] Introduce dedicated query logic for jobs list, job detail, and pipeline views.
- [x] Replace loop-driven repeated queries with consolidated read patterns.

### 3. Extract schema/presentation mapping
- [x] Move route-local transformation helpers into shared presentation modules.
- [x] Keep HTTP handlers focused on dependency wiring and response return.

### 4. Standardize HTTP error handling
- [x] Replace repetitive endpoint-local exception mapping with shared patterns.
- [x] Ensure status codes remain product-appropriate and testable.

### 5. Verify endpoint compatibility
- [x] Preserve current response contracts unless an intentional API change is separately approved.
- [x] Update and extend tests to confirm parity.

---

## Affected Areas

- `src/backend/routers/jobs.py`
- new router/query/presentation modules under `src/backend/routers/` and/or `src/backend/services/`
- related schemas and tests for jobs, outcomes, materials, and pipeline views

---

## Success Criteria

- [x] The current jobs API is split into smaller, cohesive routing modules.
- [x] List/detail/pipeline endpoints avoid repeated per-row database lookups where practical.
- [x] Response-shaping logic is reusable and testable outside route handlers.
- [x] Error mapping is more consistent and less repetitive.
- [x] Existing endpoint contracts remain stable unless explicitly approved otherwise.
