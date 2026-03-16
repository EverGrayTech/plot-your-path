# Plan: Browser-Local Data API Cutover

## Overview

Cut over the non-AI frontend data layer from backend CRUD/data-portability APIs to the new browser-local repositories and services.

This phase consolidates the earlier migrations into an explicit architectural cutover for non-AI data behavior.

## Prerequisites

- `.plans/42-browser-local-jobs-and-skills-migration.md`
- `.plans/43-browser-local-application-ops-and-outcomes-migration.md`
- `.plans/44-browser-local-portability-and-workspace-management.md`

## Goals

1. Remove active non-AI frontend dependency on backend persistence APIs.
2. Replace data-oriented `api.ts` usage with local service/repository interfaces.
3. Prove that core non-AI MVP workflows are browser-local in implementation, not just positioning.

## Technical Design

### 1. Data-layer cutover

Refactor direction:
- Route non-AI data flows through local services/repositories.
- Leave only genuinely still-needed AI/backend interactions in place, if any.

### 2. Compatibility cleanup

Refactor direction:
- Remove obsolete non-AI API helpers, parsing, and backend assumptions once cutover completes.
- Keep the frontend surface stable while changing underlying dependencies.

### 3. Verification

Refactor direction:
- Validate that jobs, skills, workflow records, and workspace management operate without backend persistence APIs.

## Implementation Steps

### 1. Replace non-AI API usage
- [ ] Migrate hooks/components off backend CRUD/data-portability API helpers.
- [ ] Remove obsolete non-AI API helpers from `src/frontend/lib/api.ts` where appropriate.

### 2. Verify parity
- [ ] Run and update tests covering jobs, skills, ops, outcomes, and data management flows.
- [ ] Confirm no active non-AI workflow depends on backend persistence endpoints.

### 3. Record remaining backend dependence
- [ ] Document what backend dependence remains after non-AI cutover, if any.
- [ ] Keep the remaining scope narrow and explicit for later plans.

## Affected Areas

- `src/frontend/lib/api.ts`
- jobs and skills hooks/components
- data management panel
- tests covering non-AI workflows

## Success Criteria

- [ ] Core non-AI MVP workflows no longer depend on backend persistence APIs.
- [ ] Remaining backend dependence, if any, is explicitly limited to later phases.
- [ ] The codebase reflects the browser-local data architecture for non-AI behavior.
