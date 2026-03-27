# Plan: ai-config settings surface retirement

## Overview

Retire Plot Your Path's prototype AI settings surface after the shared ai-config Settings-page experience is in place. This phase should remove the redundant Roles-page AI settings entry point, modal, and related frontend plumbing so the app has a single clear AI configuration location.

## Prerequisites

- `.plans/59-ai-config-settings-foundation.md`

## Goals

1. Remove the old modal-based AI settings surface from the Roles experience.
2. Eliminate redundant frontend state and wiring that only exists to support the retired settings modal.
3. Ensure the app consistently directs users to the Settings page for AI configuration.
4. Reduce confusion by consolidating AI configuration UX into one supported surface.

## Technical Design

### 1. Remove the Roles-page settings entry path

Refactor direction:
- Remove toolbar affordances and modal triggers that expose the retired AI settings flow.
- Keep adjacent Roles-toolbar behaviors intact.
- Ensure no stale affordances imply that settings still live inside role workflows.

### 2. Retire obsolete modal and state plumbing

Refactor direction:
- Remove `AISettingsModal` and related modal state management.
- Remove local handlers, token-input plumbing, and loading/error state that only existed for the prototype settings CRUD flow.
- Keep surrounding feature state clean rather than leaving dead compatibility layers in place.

### 3. Align user guidance

Refactor direction:
- Update copy or navigation cues so AI configuration is clearly a Settings-page concern.
- Avoid duplicate or contradictory help text about where provider/model settings live.

## Implementation Steps

### 1. Add the plan and identify obsolete settings entry points
- [ ] Identify the Roles-page toolbar, modal, and hook/state surfaces that exist only for the retired AI settings flow.

### 2. Remove the retired Roles-page settings UX
- [ ] Remove the Roles toolbar AI settings action.
- [ ] Remove `AISettingsModal` from the rendered Roles experience.
- [ ] Remove associated props, open/close handlers, and token-input wiring from Roles-related components and hooks.

### 3. Align copy and navigation expectations
- [ ] Update relevant copy so users are directed to the Settings page for AI configuration.
- [ ] Ensure no stale explanatory text references the removed modal path.

### 4. Validate frontend regression safety
- [ ] Update or remove tests tied exclusively to the retired modal-based settings flow.
- [ ] Add or update tests covering the absence of the old Roles-page settings affordance where appropriate.
- [ ] Run repository formatting.
- [ ] Run focused tests for Roles-page and Settings-page behavior.

## Affected Areas

- `.plans/60-ai-config-settings-surface-retirement.md`
- `src/components/roles/AISettingsModal.tsx`
- Roles-related components and hooks under `src/components/` and `src/lib/`
- related Roles-page tests

## Success Criteria

- [ ] The Roles experience no longer exposes the old AI settings entry point.
- [ ] `AISettingsModal` and its supporting state plumbing are removed.
- [ ] AI configuration is clearly presented as a Settings-page concern.
- [ ] Related tests and formatting checks pass.
