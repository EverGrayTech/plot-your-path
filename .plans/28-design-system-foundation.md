# Plan: EverGray Design System Foundation

## Overview

Adopt the EverGray Tech design system as the visual source of truth for Plot Your Path. This phase establishes token consumption, global styling, shared UI primitives, and a clear rule that foundational visual values come from the design system rather than local hardcoded values.

This plan should come before broader UX redesign work so later changes are built on the intended visual foundation from the start.

## Prerequisites

- `.plans/27-local-first-ux-design-system-roadmap.md`

## Goals

1. Consume EverGray design tokens in the frontend application.
2. Replace the current ad hoc inline styling baseline with app-wide token-driven styling.
3. Establish a small set of reusable UI primitives aligned with the design system.
4. Audit and reduce hardcoded foundational visual values in the frontend.
5. Document how this repository should consume future design system updates.

## Technical Design

### 1. Token Consumption Strategy

Refactor direction:
- Add the design system as a dependency or approved local reference.
- Import the generated CSS variables globally in the Next.js app.
- Prefer CSS variables for styling and use JSON token access only where values are needed in logic.

### 2. Global Visual Baseline

Observed issues:
- The root layout currently uses inline styles.
- There is no clear global styling layer for canvas, typography, spacing, or navigation surfaces.

Refactor direction:
- Create a global stylesheet and app-level visual baseline using design tokens.
- Move typography, canvas, spacing, and basic layout rules into reusable styles.
- Ensure the baseline reflects the “operational expression” described by the design system.

### 3. Shared UI Primitives

Observed issues:
- Inputs, buttons, modal surfaces, and content sections do not yet share a consistent visual language.

Refactor direction:
- Introduce a minimal set of shared primitives or style patterns for:
  - buttons
  - inputs and textareas
  - cards/panels
  - labels and helper text
  - status/feedback blocks
  - modal surfaces
- Keep the primitive set intentionally small so it supports later UX work without prematurely building a full component library inside this repo.

### 4. Hardcoded Value Audit

Refactor direction:
- Identify and replace hardcoded colors, spacing, radii, typography, and transition values where they overlap with the design system.
- Leave product-specific layout choices local, but document any short-term exceptions that still need upstream design system support.

### 5. Consumption Rules for Future Work

Refactor direction:
- Document where token usage is required.
- Define how exceptions should be tracked.
- Ensure future plans build on this foundation rather than reintroducing duplicated styling constants.

## Implementation Steps

### 1. Connect the design system
- [ ] Add the approved design-system dependency or local consumption path.
- [ ] Import global token outputs into the frontend app.

### 2. Establish app-wide styling
- [ ] Replace root inline layout styling with token-driven global styles.
- [ ] Define the default canvas, typography, spacing, and navigation surface rules.

### 3. Create shared UI building blocks
- [ ] Standardize the visual treatment of forms, buttons, cards, and modals.
- [ ] Apply the shared styling approach to the highest-traffic existing components first.

### 4. Audit and clean up duplicated values
- [ ] Remove or reduce hardcoded foundational visual values across the frontend.
- [ ] Document temporary exceptions that require upstream design-system additions.

### 5. Verify and document
- [ ] Add or update tests where styling structure affects rendered semantics.
- [ ] Document the ongoing consumption rules for future frontend work.

## Affected Areas

- `package.json`
- `src/frontend/app/layout.tsx`
- new or updated global frontend styles
- shared frontend components under `src/frontend/components/`
- frontend tests under `tests/frontend/`
- documentation references where design-system consumption should be explained

## Success Criteria

- [ ] The frontend imports and uses the EverGray design-system outputs.
- [ ] The application no longer depends on inline root styling for its visual baseline.
- [ ] Foundational colors, spacing, radii, typography, and motion values come from design tokens.
- [ ] Forms, modal surfaces, and primary actions share a cohesive visual language.
- [ ] Future UX work can reuse this foundation without another visual reset.
