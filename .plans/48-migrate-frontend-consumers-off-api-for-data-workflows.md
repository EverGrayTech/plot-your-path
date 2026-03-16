# Plan: Migrate Frontend Consumers Off API for Data Workflows

## Overview

Migrate frontend hooks and components for non-AI workflows off `api.ts` and onto the new service boundaries.

This phase focuses on consumer cutover for jobs, skills, workflow state, and portability behavior.

## Prerequisites

- `.plans/47-frontend-service-boundary-foundation.md`

## Goals

1. Remove consumer-level dependence on `api.ts` for non-AI workflows.
2. Move hooks/components to domain-oriented local services.
3. Keep UI behavior stable during the cutover.

## Technical Design

### 1. Hook migration

Refactor direction:
- Migrate hooks to use the new service/repository interfaces.
- Consumer migration for `useJobDetailState.ts`, `useJobsFeatureModals.ts`, and related UI hooks/components.
- Keep UI-state logic separate from persistence/transport concerns.

### 2. Component migration

Refactor direction:
- Update components that still import endpoint-oriented helpers directly.
- Prefer service-backed actions over direct API calls.

### 3. Verification

Refactor direction:
- Keep consumer migration incremental and covered by frontend tests.

## Implementation Steps

### 1. Migrate hooks
- [ ] Move jobs/skills/data-management hooks off `api.ts` for non-AI flows.
- [ ] Remove direct non-AI endpoint assumptions from hook logic.

### 2. Migrate components
- [ ] Move feature components off direct non-AI `api.ts` imports where applicable.
- [ ] Ensure consumer behavior remains stable through the new services.

### 3. Validate parity
- [ ] Update/run frontend tests for migrated non-AI consumer flows.
- [ ] Confirm active non-AI consumers no longer depend on endpoint helpers.

## Affected Areas

- `src/frontend/lib/useJobsBoard.ts`
- `src/frontend/lib/useJobDetailState.ts`
- `src/frontend/components/SkillsPageClient.tsx`
- data-management and other non-AI consumer flows

## Success Criteria

- [ ] Non-AI hooks/components no longer depend directly on `api.ts`.
- [ ] UI logic depends on local service boundaries instead of endpoint helpers.
- [ ] Tests cover the consumer cutover successfully.
