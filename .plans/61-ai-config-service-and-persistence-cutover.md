# Plan: ai-config service and persistence cutover

## Overview

Replace Plot Your Path's prototype AI settings persistence and service abstractions with ai-config ownership. This phase should remove app-owned provider/model/token persistence and healthcheck behavior, leaving only the thinnest legitimate integration boundary needed by host code.

## Prerequisites

- `.plans/59-ai-config-settings-foundation.md`
- `.plans/60-ai-config-settings-surface-retirement.md`

## Goals

1. Remove app-owned AI settings persistence from the current local browser storage implementation.
2. Eliminate token CRUD and healthcheck behaviors that are superseded by ai-config.
3. Simplify or remove service abstractions that only exist for the old settings implementation.
4. Keep any remaining ai-config access narrow, intentional, and local to legitimate host integration boundaries.

## Technical Design

### 1. Retire prototype AI settings persistence

Refactor direction:
- Remove the AI settings record persistence behavior currently embedded in `src/lib/localAi.ts`.
- Stop storing provider, model, token label, and runtime-token state in app-owned local persistence.
- Treat ai-config as the persistence owner for those concerns.

### 2. Remove obsolete settings service surfaces

Refactor direction:
- Simplify or remove `AISettingsService` methods that only supported list/update/token/healthcheck flows.
- Remove any API re-exports whose sole purpose was the prototype settings surface.
- Avoid replacing removed settings CRUD with another bespoke compatibility abstraction.
- Remove any stale assumptions that BYOK provider calls are routed directly by host-owned provider clients rather than through ai-config's current gateway-mediated request path.

### 3. Keep only necessary host integration seams

Refactor direction:
- Retain only the smallest app-local seam needed to read ai-config state or manager behavior where feature code genuinely needs it.
- Prefer package-owned state, actions, and routing rather than host reimplementation.
- If model discovery is enabled in the app, keep discovery triggering and cached-model reads within this narrow seam rather than scattering them across feature surfaces.
- Do not use this seam as justification for rebuilding any portion of the packaged settings UI outside `AIConfigPanel`.

## Implementation Steps

### 1. Add the plan and inventory obsolete settings persistence code
- [ ] Identify app-owned AI settings persistence, token CRUD, and healthcheck surfaces that are superseded by ai-config.

### 2. Remove prototype persistence and service code
- [ ] Remove AI settings persistence fields and flows from `src/lib/localAi.ts`.
- [ ] Remove prototype token update, token clear, and healthcheck logic.
- [ ] Simplify or remove the `AISettingsService` interface and related service wiring as appropriate.
- [ ] Remove obsolete API exports that only exist for the retired settings implementation.
- [ ] Remove stale service assumptions about host-owned direct BYOK provider routing if any still exist in the codebase.

### 3. Preserve only legitimate host integration boundaries
- [ ] Add or refine a narrow app-local ai-config access seam if downstream feature code still needs one.
- [ ] Ensure remaining integrations do not recreate package-owned settings CRUD behavior.
- [ ] If advisory model discovery is used, ensure it is exposed through the same narrow integration seam rather than bespoke feature-specific helpers.
- [ ] Ensure any remaining seam is limited to non-UI integration concerns rather than piecemeal settings-panel reimplementation.

### 4. Validate service-boundary regression safety
- [ ] Update or remove tests tied exclusively to the old settings persistence and healthcheck implementation.
- [ ] Add or update tests for any remaining integration seam introduced in this phase.
- [ ] Run repository formatting.
- [ ] Run focused tests for affected service and settings behavior.

## Affected Areas

- `.plans/61-ai-config-service-and-persistence-cutover.md`
- `src/lib/localAi.ts`
- `src/lib/api.ts`
- `src/lib/services/types.ts`
- `src/lib/services/index.ts`
- related tests under `tests/lib/` and `tests/components/`

## Success Criteria

- [ ] Plot Your Path no longer persists AI settings through app-owned prototype storage code.
- [ ] Prototype token CRUD and healthcheck flows are removed.
- [ ] Obsolete settings service abstractions are simplified or removed.
- [ ] Any remaining ai-config integration seam is narrow and intentional.
- [ ] Any remaining ai-config integration seam is limited to non-UI concerns and does not duplicate packaged settings controls.
- [ ] Related tests and formatting checks pass.
