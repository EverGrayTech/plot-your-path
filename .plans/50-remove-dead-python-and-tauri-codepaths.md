# Plan: Remove Dead Python and Tauri Codepaths

## Overview

Delete legacy implementation areas that the audit has confirmed are no longer needed for the active MVP path.

This phase is for actual removal, not conceptual retirement. Anything kept should have a current reason to exist.

## Prerequisites

- `.plans/39-legacy-dependency-audit-and-cut-line.md`
- `.plans/40-remove-archived-runtime-from-active-surface-area.md`
- `.plans/45-browser-local-data-api-cutover.md`
- `.plans/46-browser-local-ai-workflow-replacement.md`
- `.plans/47-frontend-service-boundary-foundation.md`
- `.plans/48-migrate-frontend-consumers-off-api-for-data-workflows.md`
- `.plans/49-retire-transport-era-api-abstractions.md`

## Goals

1. Remove dead backend and desktop implementation code.
2. Reduce repository weight and maintenance cost.
3. Preserve only intentional archived context, not executable baggage.

## Technical Design

### 1. Code deletion

Refactor direction:
- Remove legacy source trees, scripts, and configs that are no longer part of the active architecture.
- Prefer deletion over indefinite dormancy.

### 2. Archive boundary

Refactor direction:
- Keep only minimal non-executable historical context where needed for traceability.
- Avoid preserving large inactive implementation trees under the guise of “archive” unless they are genuinely useful.

### 3. Cleanup validation

Refactor direction:
- Ensure builds, tests, and docs no longer reference removed areas.

## Implementation Steps

### 1. Remove dead code and config
- [ ] Remove dead Python/backend code confirmed unused by the audit.
- [ ] Remove dead Tauri/desktop code confirmed unused by the audit.
- [ ] Remove obsolete config, lockfiles, and build helpers tied only to removed paths.

### 2. Preserve intentional archive context
- [ ] Keep only the minimal archived docs/materials needed for historical traceability.
- [ ] Move any remaining reference-only material into clearly archived locations if needed.

### 3. Validate repository health
- [ ] Ensure active builds, tests, and docs pass without removed runtime baggage.
- [ ] Confirm there are no dangling imports, scripts, or references to deleted areas.

## Affected Areas

- `src/backend/`
- `src-tauri/`
- Python/Tauri-related config and lockfiles
- legacy build scripts
- tests tied to removed runtime behavior

## Success Criteria

- [ ] Dead backend/Tauri implementation code is removed.
- [ ] The repository no longer carries executable legacy runtime baggage.
- [ ] The active project can be understood without mentally filtering old architecture.
