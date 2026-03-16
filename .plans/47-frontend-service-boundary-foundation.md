# Plan: Frontend Service Boundary Foundation

## Overview

Establish the service-boundary structure that will replace `api.ts` as the core architectural interface for the frontend.

This phase should create the target dependency shape before feature-by-feature cutover begins.

## Prerequisites

- `.plans/45-browser-local-data-api-cutover.md`
- `.plans/46-browser-local-ai-workflow-replacement.md`

## Goals

1. Define architecture-aligned frontend service and repository boundaries.
2. Separate domain/service interfaces from transport-era API helpers.
3. Create a stable target for later hook/component migration.

## Technical Design

### 1. Boundary definition

Refactor direction:
- Introduce local service/repository interfaces organized by domain.
- Prefer domain-oriented boundaries over endpoint-oriented helpers.

### 2. Composition and dependency management

Refactor direction:
- Centralize how hooks/components obtain their data/services.
- Avoid spreading direct storage/provider wiring throughout the UI.

### 3. Transitional coexistence

Refactor direction:
- Allow the new service boundary to coexist temporarily with `api.ts` while later phases migrate consumers.
- Keep migration incremental and testable.

## Implementation Steps

### 1. Define the new service structure
- [ ] Create frontend service/repository modules aligned to the web-local architecture.
- [ ] Introduce the shared interfaces/hooks needed for later consumer migration.

### 2. Centralize dependency wiring
- [ ] Add a coherent composition layer for frontend services.
- [ ] Keep direct transport/storage/provider setup out of feature components.

### 3. Prepare migration
- [ ] Document which current `api.ts` responsibilities map to which new services.
- [ ] Ensure the structure supports incremental consumer cutover.

## Affected Areas

- frontend service/repository modules
- hooks/shared dependency boundaries
- transitional architecture documentation/comments

## Success Criteria

- [ ] The frontend has a clear target service architecture.
- [ ] Later migrations can move consumers incrementally without redesigning boundaries.
- [ ] `api.ts` is no longer the only obvious architectural interface.
