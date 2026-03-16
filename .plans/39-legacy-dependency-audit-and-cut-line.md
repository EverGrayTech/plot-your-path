# Plan: Legacy Dependency Audit and Cut Line

## Overview

Establish the exact boundary between the active browser-local MVP architecture and the remaining legacy backend/desktop implementation.

This phase is intentionally investigative first. It should produce a reliable removal map before major deletion work begins.

## Prerequisites

- `.plans/34-web-local-first-foundation.md`
- `.plans/35-client-storage-and-portability-foundation.md`
- `.plans/36-ai-workflows-browser-mvp.md`
- `.plans/37-core-mvp-browser-workflows.md`
- `.plans/38-local-first-trust-and-legacy-retirement.md`

## Goals

1. Identify all active dependencies on the legacy Python/backend and desktop-runtime path.
2. Determine which legacy code is still required, transitional, or dead.
3. Create a safe cut line for removal work in later phases.

## Technical Design

### 1. Runtime dependency inventory

Refactor direction:
- Inventory frontend calls, build scripts, docs, and test assumptions that still depend on backend-era architecture.
- Distinguish between current runtime requirements and historical residue.

### 2. Repository classification

Refactor direction:
- Classify legacy surfaces into:
  - required for active MVP
  - temporary transitional support
  - archived reference only
  - dead/removable

### 3. Removal readiness

Refactor direction:
- Record blockers for deleting legacy areas.
- Convert unknowns into explicit follow-up investigation tasks if needed.

## Implementation Steps

### 1. Audit active dependencies
- [ ] Audit frontend runtime/API assumptions that still require backend-era services.
- [ ] Audit scripts, config, and test flows that still assume desktop/backend execution.

### 2. Classify legacy surfaces
- [ ] Produce a clear keep / transition / archive / remove classification across legacy directories and docs.
- [ ] Identify any hidden dependencies that must be refactored before removal.

### 3. Define the cut line
- [ ] Document the exact removal boundary for later cleanup phases.
- [ ] Create follow-up issues/plans for any speculative or blocked removals.

## Affected Areas

- `src/backend/`
- `src-tauri/`
- desktop/build scripts
- docs and contributor guidance
- tests referencing retired runtime assumptions

## Success Criteria

- [ ] The repository has a documented legacy dependency map.
- [ ] It is clear which legacy areas can be removed immediately versus later.
- [ ] Later removal phases can proceed without guesswork.
