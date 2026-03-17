# Plan: Retire Transport-Era API Abstractions

## Overview

Remove the obsolete HTTP/transport-era abstractions once consumers have been migrated.

This phase should clean up `api.ts`, network error scaffolding, and configuration assumptions that no longer belong in the local-first web architecture.

## Prerequisites

- `.plans/48-migrate-frontend-consumers-off-api-for-data-workflows.md`

## Goals

1. Remove obsolete transport-era abstractions from the frontend.
2. Eliminate local-server assumptions that no longer serve the architecture.
3. Make the remaining frontend surface consistent with the web-local model.

## Technical Design

### 1. API helper retirement

Refactor direction:
- Remove unused endpoint-oriented helpers from `api.ts`.
- Keep only genuinely still-needed abstractions during transition, if any.

### 2. Config cleanup

Refactor direction:
- Remove environment/config assumptions tied only to local HTTP service usage.
- Collapse obsolete parsing and transport-specific error machinery when no longer needed.

### 3. Verification and documentation

Refactor direction:
- Confirm the frontend no longer depends structurally on server-first assumptions.
- Document any intentionally remaining transport boundaries explicitly.

## Implementation Steps

### 1. Remove obsolete transport helpers
- [x] Remove unused endpoint-oriented helpers and API plumbing.
- [x] Keep any intentionally remaining transport boundaries narrow and explicit.

### 2. Remove obsolete config assumptions
- [x] Remove `NEXT_PUBLIC_API_URL` and related local-server assumptions if no longer needed.
- [x] Remove obsolete parsing and transport-error scaffolding where safe.

### 3. Validate final frontend dependency state
- [x] Verify active frontend code no longer structurally depends on backend HTTP APIs.
- [x] Update docs/tests to reflect the new frontend architecture.

## Affected Areas

- `src/lib/api.ts`
- frontend env/config assumptions
- transport-era shared helpers and tests

## Success Criteria

- [x] The frontend no longer carries obsolete transport-era abstractions.
- [x] Remaining transport assumptions, if any, are explicit and minimal.
- [x] The frontend architecture matches the browser-local product direction.
