# Plan: EverGray Design System Foundation

## Overview

Adopt the EverGray Tech design system as the visual source of truth for Plot Your Path. This phase establishes token consumption, global styling, shared UI primitives, and a clear rule that foundational visual values come from the design system rather than local hardcoded values.

This plan should come before broader UX redesign work so later changes are built on the intended visual foundation from the start.

## Prerequisites

- `.plans/27-local-first-ux-design-system-roadmap.md`

## Upstream Design System References

The following design system docs should be treated as the authoritative source during implementation:

- **Consumption Guide** (`docs/consumption-guide.md`) — package installation, import paths, what must vs. must not come from the design system, exception handling, and Next.js integration examples.
- **Application Shell and Navigation** (`docs/application-shell-and-navigation.md`) — shell regions, navigation states, hierarchy rules, and token quick reference for shell implementation.
- **Forms and Action Controls** (`docs/forms-and-action-controls.md`) — control patterns, action variants, form support text, density/spacing, and variant naming recommendations.
- **Overlays and Feedback States** (`docs/overlays-and-feedback-states.md`) — modal, popover, and toast patterns; feedback state treatments; structured message anatomy.

## Goals

1. Consume the EverGray design system via the `@evergraytech/design-system` npm package.
2. Replace the current ad hoc inline styling baseline with app-wide token-driven styling.
3. Establish a small set of reusable UI primitives aligned with the upstream pattern guidance.
4. Audit and reduce hardcoded foundational visual values in the frontend.
5. Document how this repository should consume future design system updates.

## Technical Design

### 1. Token Consumption Strategy

The design system publishes `@evergraytech/design-system` as an npm package with three output files:
- `dist/variables.css` — CSS custom properties for styling.
- `dist/tokens.json` — flat JSON export for programmatic access in JS/TS.
- `dist/logo.svg` — brand logo asset.

Refactor direction:
- Install `@evergraytech/design-system` as a dependency via pnpm.
- Import `dist/variables.css` globally in the Next.js root layout (`app/layout.tsx`), following the consumption guide's Next.js example.
- Create a `globals.css` file that uses the imported CSS variables for baseline styling.
- Prefer CSS variables for styling. Use JSON token access only where values are needed in component logic, computed styles, or SSR contexts.

### 2. Global Visual Baseline

Observed issues:
- The root layout currently uses inline styles.
- There is no clear global styling layer for canvas, typography, spacing, or navigation surfaces.

Refactor direction:
- Create a `globals.css` that establishes the app-wide visual baseline using design tokens:
  - `body` background: `--color-neutral-canvas`
  - `body` text: `--color-text-primary`
  - `body` font: `--typography-family-sans`
  - Standard link, heading, and list reset treatments using token values.
- Move typography, canvas, spacing, and basic layout rules into this global stylesheet.
- Remove inline styles from root layout in favor of the global stylesheet and token-driven CSS.
- The visual baseline should reflect the "operational expression" from the design system: quiet, operational, precise, and restrained.

### 3. Shared UI Primitives

Observed issues:
- Inputs, buttons, modal surfaces, and content sections do not yet share a consistent visual language.

Refactor direction:
- Introduce a minimal set of shared primitives or style patterns aligned with the upstream guidance docs. The design system now provides specific structure, state definitions, and token mappings for each:
  - **Buttons**: Primary (`--color-accent-solid` background), secondary (outline), tertiary/quiet (text-only), destructive variants — per the forms-and-action-controls guidance, Section 2.1. Use the recommended variant names: `primary`, `secondary`, `tertiary`, `destructive`.
  - **Inputs and textareas**: `--color-neutral-surface` background, `--color-border-edge` border, focus ring via `--color-border-focus` — per forms guidance, Sections 1.3–1.4.
  - **Select triggers**: Same visual baseline as text input with trailing chevron — per forms guidance, Section 1.5.
  - **Cards/panels**: `--color-neutral-surface` background with `--color-border-edge` border and `--radii-md` radius for contained panels — per data-dense-workspace guidance, Section 1.1 (grouped metadata block).
  - **Labels and helper text**: Labels above controls at `--typography-size-sm`/`--typography-weight-medium`, helper text below at `--typography-size-xs`/`--color-text-tertiary` — per forms guidance, Sections 3.1–3.2.
  - **Status/feedback blocks**: Inline validation, success/error/warning message patterns following forms guidance Section 3 and overlays guidance Section 2.
  - **Modal surfaces**: `--color-neutral-elevated` background, `--color-border-edge` border, `--radii-lg` radius, backdrop at `rgba(0,0,0,0.5)` — per overlays guidance, Section 1.1.
- Apply control sizing tiers from forms guidance Section 4.1: default height `36px`–`40px`, compact `32px`.
- Keep the primitive set intentionally small so it supports later UX work without prematurely building a full component library inside this repo.

### 4. Hardcoded Value Audit

Refactor direction:
- Identify and replace hardcoded colors, spacing, radii, typography, and transition values where they overlap with the design system.
- Per the consumption guide: values for colors, typography, spacing, radii, motion, semantic states, and accent must come from the design system. Do not redefine these locally.
- Layout composition, component-internal dimensions, app-specific breakpoints, content-driven spacing adjustments, and z-index layering remain local decisions.
- For any value that does not exist in the token set: check if an existing token fits, request upstream if not, and document temporary local overrides with `/* TODO: upstream to design system */` comments.

### 5. Consumption Rules for Future Work

The consumption guide already defines the authoritative rules. This step ensures they are referenced and reinforced locally.

Refactor direction:
- Add a brief note in project documentation (e.g., `docs/development.md`) pointing to the design system consumption guide as the source of truth for styling decisions.
- Summarize the key rules locally for quick reference:
  - Token categories that must come from the design system (colors, typography, spacing, radii, motion, semantic states, accent).
  - Categories that remain local decisions (layout, component dimensions, breakpoints, z-index).
  - Exception handling: check for existing token → request upstream → document local override.
  - Update flow: bump `@evergraytech/design-system` version, review changelog, rebuild.

## Implementation Steps

### 1. Connect the design system
- [ ] Install `@evergraytech/design-system` via pnpm.
- [ ] Import `dist/variables.css` in the Next.js root layout.

### 2. Establish app-wide styling
- [ ] Create `globals.css` using CSS variables for canvas, typography, spacing, and text defaults.
- [ ] Replace root inline layout styling with the token-driven global styles.
- [ ] Define default surface, navigation chrome, and workspace container rules per the app shell guidance.

### 3. Create shared UI building blocks
- [ ] Implement button variants (primary, secondary, tertiary, destructive) following the forms-and-action-controls guidance.
- [ ] Implement input/textarea/select styling and state treatments per the forms guidance.
- [ ] Implement card/panel and modal surface patterns per the data-dense and overlays guidance.
- [ ] Implement label, helper text, and validation message patterns per the forms guidance.
- [ ] Apply the shared styling approach to the highest-traffic existing components first.

### 4. Audit and clean up duplicated values
- [ ] Remove or reduce hardcoded foundational visual values across the frontend.
- [ ] Document any temporary local overrides with `/* TODO: upstream to design system */` comments.

### 5. Verify and document
- [ ] Add or update tests where styling structure affects rendered semantics.
- [ ] Add a design system consumption reference to `docs/development.md` pointing to the upstream consumption guide.

## Affected Areas

- `package.json` (new `@evergraytech/design-system` dependency)
- `src/frontend/app/layout.tsx` (CSS import, inline style removal)
- new `globals.css` or equivalent global frontend styles
- shared frontend components under `src/frontend/components/`
- frontend tests under `tests/frontend/`
- `docs/development.md` (consumption reference)

## Success Criteria

- [ ] The frontend imports and uses the `@evergraytech/design-system` package outputs via `dist/variables.css` and `dist/tokens.json`.
- [ ] The application no longer depends on inline root styling for its visual baseline.
- [ ] Foundational colors, spacing, radii, typography, and motion values come from design tokens.
- [ ] Forms, modal surfaces, and primary actions share a cohesive visual language consistent with the upstream guidance docs.
- [ ] Future UX work can reuse this foundation without another visual reset.
- [ ] Temporary local overrides are documented and tracked for upstream resolution.
