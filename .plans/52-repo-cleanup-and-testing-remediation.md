# Plan: Repo Cleanup and Testing Remediation

## Overview

Finish the post-refactor cleanup by removing remaining transition-era cruft, correcting mismatches between implementation and documentation, and bringing the test suite back into alignment with the active browser-local MVP.

This phase should make the codebase feel coherent again after the heavy architecture pivot rather than merely functional.

## Prerequisites

- `.plans/51-web-architecture-restructure-and-final-dead-code-pass.md`

## Goals

1. Remove or isolate remaining transition-era patterns that no longer belong in the active browser-local product path.
2. Correct implementation contracts that currently disagree with docs or UI messaging.
3. Strengthen persistence boundaries and testing so future cleanup work is safer and easier.

## Technical Design

### 1. Portability contract alignment

Refactor direction:
- Align export/import behavior, filenames, accepted file types, and UI messaging with the actual portability format.
- Either implement the documented zip-based archive flow or deliberately simplify docs and UI to the current JSON-based behavior.

### 2. Browser-local persistence boundary cleanup

Refactor direction:
- Stop mixing primary job records with generated artifacts and shadow analysis records in shared stores.
- Use explicit store boundaries so domain records, derived outputs, and workflow records are easier to reason about and test.

### 3. Transition-era surface area reduction

Refactor direction:
- Simplify active types, components, and copy that still model archived desktop or transition runtime modes as if they are active product states.
- Remove or isolate temporary compatibility paths such as URL capture unless they are still explicitly required.

### 4. Naming and service-boundary cleanup

Refactor direction:
- Reduce reliance on compatibility aliases and transport-era naming that no longer reflects the browser-local architecture.
- Prefer names that describe current behavior, especially around local AI settings and frontend service usage.

### 5. Testing remediation and enforcement

Refactor direction:
- Repair brittle or stale tests against the current implementation.
- Update test coverage and configuration so documented testing standards are actually enforced.

## Implementation Steps

### 1. Align portability behavior with the documented product contract
- [x] Resolve the mismatch between zip-based portability messaging and JSON-based export/import implementation.
- [x] Make file extensions, import acceptance rules, and restore logic match the supported archive format.
- [x] Add or update tests for export/import round-trips and portability format expectations.

### 2. Normalize browser-local persistence boundaries
- [x] Separate generated artifacts and shadow analysis records from the `jobs` store.
- [x] Use dedicated browser-local stores for fit analyses, desirability scores, and generated materials where appropriate.
- [x] Ensure workspace summary counts and export payloads reflect clear domain boundaries.
- [x] Add migration handling if existing browser-local data could be affected.

### 3. Remove or isolate transition-era active surface area
- [x] Simplify `DataPortabilitySummary` and related UI away from archived runtime branches that are no longer real active modes.
- [x] Decide whether URL capture remains supported and either remove it or clearly isolate it as temporary compatibility.
- [x] Remove transition-era runtime copy from active UI where it no longer serves a supported workflow.

### 4. Clean up naming and compatibility layers
- [x] Audit and reduce imports that still depend on `src/lib/api.ts` as a compatibility alias.
- [x] Rename or reframe `api_key_env` and similar backend-era terminology to match browser-local token storage behavior.
- [x] Simplify service and type names that still reflect transport-era assumptions.

### 5. Repair and harden testing
- [x] Fix failing tests that no longer reflect current browser-local behavior, including the jobs-page outcome flow.
- [x] Remove invalid Jest-oriented test invocation assumptions from active workflows and docs.
- [x] Add coverage thresholds to `vitest.config.ts` so the documented 90% line-coverage standard is enforced.
- [x] Add focused tests for persistence boundaries, portability behavior, and migration-sensitive cases.

## Affected Areas

- browser-local portability and workspace management
- frontend data models and service boundaries
- IndexedDB/local persistence layout
- jobs capture and data-management UI
- frontend test suite and Vitest configuration

## Success Criteria
- [x] Active runtime behavior matches the documented browser-local MVP contract.
- [x] Archived desktop/transition concerns are removed from active user-facing flows unless explicitly required.
- [x] Browser-local persistence boundaries are clear and no longer mix unrelated record types in unsafe ways.
- [x] Tests pass through the supported Vitest workflow and coverage standards are enforced in config.
- [x] Remaining cleanup debt is explicit, narrow, and no longer hidden behind transitional abstractions.
