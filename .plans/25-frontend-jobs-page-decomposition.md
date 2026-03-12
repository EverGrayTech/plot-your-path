# Plan: Frontend Jobs Experience Decomposition

## Overview

Decompose the current jobs client experience into smaller hooks, components, and modal-specific feature modules. `JobsPageClient.tsx` currently owns a very large amount of state, orchestration logic, modal behavior, data loading, and rendering concerns in one place. That makes change risk high and local reasoning difficult.

This plan should follow backend stabilization and API modularization so the frontend can be refactored against a cleaner and more stable interface surface.

## Why This Is Third

- The current client component is acting as a feature shell, controller, and full UI implementation all at once.
- Many concerns are interleaved: jobs list, detail modal, application ops, fit analysis, desirability, outcomes, application materials, interview prep, resume tuning, AI settings, factor settings, skill detail, and pipeline views.
- Smaller frontend modules will reduce cognitive load and make future feature work safer.

## Goals

1. Break `JobsPageClient` into smaller, feature-scoped components.
2. Move data-loading and mutation orchestration into focused hooks.
3. Reduce duplicated async/error/loading state handling patterns.
4. Keep current UI behavior and endpoint contracts intact during the refactor.
5. Improve testability at the feature-section level.

## Technical Design

### 1. Feature-Sliced UI Structure

Refactor direction:
- Decompose by user-facing concern rather than by arbitrary JSX chunk size.
- Candidate slices include:
  - jobs toolbar + filter/sort controls
  - jobs list
  - job detail modal shell
  - application ops section
  - fit analysis section
  - desirability section
  - outcome feedback section
  - application materials section
  - interview prep section
  - resume tuning section
  - factor settings modal
  - AI settings modal
  - pipeline modal
  - skill detail modal

### 2. Hook-Based Orchestration

Observed issues:
- The component repeats fetch / loading / error / refresh patterns for many feature areas.
- The selected role drives multiple related queries and reset behaviors in one file.

Refactor direction:
- Introduce focused hooks for data domains and modal workflows.
- Keep hooks responsible for state orchestration and API interaction.
- Keep presentational components primarily responsible for rendering and user input.

### 3. Shared UI/State Utilities

Observed issues:
- Several formatting, export, traceability, and selection-reset behaviors are embedded directly in the page component.

Refactor direction:
- Extract shared UI utilities and formatting helpers into reusable modules.
- Normalize common async action patterns where appropriate.

### 4. Progressive Server/Client Boundary Review

Refactor direction:
- Re-evaluate which parts truly need to be client components.
- Preserve Next.js server-component defaults where possible, while keeping interactive sections client-side.
- Avoid introducing manual memoization patterns prohibited by project rules.

## Implementation Steps

### 1. Establish component boundaries
- [x] Define the new jobs-page component structure and ownership map.
- [x] Extract purely presentational sections first.

### 2. Extract domain hooks
- [x] Move jobs loading/filter/sort state into focused hooks.
- [x] Move selected-job detail workflows into separate hooks.
- [x] Move modal-specific data orchestration into feature hooks.

### 3. Extract utilities
- [x] Move formatting/export/traceability helpers into shared modules.
- [x] Remove non-UI logic from page-level render files.

### 4. Simplify page shell
- [x] Keep the top-level client page as a coordinator rather than the entire application surface.
- [x] Ensure state resets and cross-modal navigation remain explicit and understandable.

### 5. Testing
- [x] Add or update feature-level tests for extracted sections/hooks.
- [x] Preserve page-level integration coverage for core flows.

## Affected Areas

- `src/frontend/components/JobsPageClient.tsx`
- new component/hook files under `src/frontend/components/` and `src/frontend/lib/`
- related frontend tests under `tests/frontend/`

## Success Criteria

- [x] `JobsPageClient.tsx` is reduced to a manageable orchestration shell.
- [x] Feature sections own their own rendering concerns.
- [x] Data loading and mutation logic are moved into focused hooks/utilities.
- [x] Existing jobs workflows continue to work without user-visible regression.
- [x] Frontend tests cover extracted feature slices with clearer ownership.
