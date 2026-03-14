# Plan: App Shell and Navigation Refresh

## Overview

Refocus the top-level product structure around the documented core journey: capture opportunities, evaluate fit, pursue deliberately, and learn over time. The current shell is minimal and functional, but it does not yet guide a user through the intended product flow or present the product as a calm, coherent workspace.

This phase should reshape the global structure of the experience before deep workflow-specific UX changes are made.

## Prerequisites

- `.plans/28-design-system-foundation.md`

## Upstream Design System References

The following design system docs should be treated as the authoritative source for shell and navigation decisions:

- **Application Shell and Navigation** (`docs/application-shell-and-navigation.md`) — defines all shell regions (top app bar, side navigation, page header, section headers, workspace container, utility areas), navigation state behavior, three-tier hierarchy rules, responsive posture, and two reference shell patterns with token mappings.

Key upstream patterns to adopt:
- **Primary workspace shell**: Top app bar + side navigation + page header + workspace container. This is the default pattern for workflow-oriented EverGray applications.
- **Lightweight secondary shell**: Top app bar only, no side nav, back-navigation, centered content. For settings, onboarding, and single-purpose flows.
- **Navigation states**: Default, hover, focus, selected/active (with `--color-accent-solid` indicator bar), and disabled — all with specific token mappings.
- **Three-tier hierarchy**: Tier 1 (primary workflows) in main navigation, Tier 2 (supporting utilities) in top bar or secondary nav section, Tier 3 (admin/low-frequency) grouped at bottom of side nav or behind account menu.
- **Responsive posture**: Side nav collapse (expanded → icon-only → off-canvas overlay), top bar simplification, page header adaptation.

## Goals

1. Replace the bare-bones app shell with the primary workspace shell pattern from the design system.
2. Rework top-level navigation so it reflects the product's primary use cases using the upstream three-tier hierarchy.
3. Introduce a meaningful default entry experience instead of redirecting immediately to the jobs page.
4. Improve orientation, discoverability, and progressive disclosure for advanced workflows.
5. Establish a shell that can later be packaged cleanly for desktop use.

## Technical Design

### 1. Reframe the Entry Experience

Observed issues:
- The root route redirects immediately to `/jobs`.
- New users receive no orientation, overview, or clear starting point.

Refactor direction:
- Introduce a real home or workspace landing view.
- Use that entry point to explain the product's immediate value and surface likely next actions.
- Keep the first-run experience lightweight rather than instructional overload.
- The landing view should use the workspace container (`--color-neutral-canvas` background, `--spacing-xl` to `--spacing-2xl` padding) as the content surface — not wrapped in a card.

### 2. Adopt the Primary Workspace Shell

Refactor direction:
- Implement the primary workspace shell pattern: top app bar (`--color-neutral-chrome`) + side navigation (`--color-neutral-chrome`) + page header + workspace container (`--color-neutral-canvas`).
- **Top app bar**: Product identity (logo from `dist/logo.svg` or wordmark) left-aligned, utility controls right-aligned. Height `48px`–`56px`. Bottom edge `--color-border-edge`.
- **Side navigation**: Primary workflow links with full navigation state behavior (default at `--color-text-secondary`, hover at `--color-text-primary` with `--color-neutral-surface` background, active with accent indicator bar). Width `220px`–`260px` expanded, `48px`–`64px` collapsed.
- **Page headers**: Page title at `--typography-size-lg`/`--typography-weight-semibold`, page-level actions right-aligned. Primary action uses accent treatment.
- **Section headers**: `--typography-size-base` to `--typography-size-md`, `--typography-weight-medium`, with `--spacing-xl` above and `--spacing-md` below for grouping.

### 3. Clarify Navigation Hierarchy

Observed issues:
- The current navigation exposes only Jobs and Skills.
- Important operational or support flows are distributed across the jobs page rather than expressed in the shell.

Refactor direction:
- Map navigation items to the upstream three-tier hierarchy:
  - **Tier 1 (primary workflows)**: The core product sections — always visible in the side navigation with full state spectrum. These are the main sections the product journey maps to.
  - **Tier 2 (supporting utilities)**: Search, filtering, and supporting controls — accessible from the top app bar or secondary navigation section. Use `--color-text-secondary` and smaller icon sizes.
  - **Tier 3 (admin/low-frequency)**: AI settings, configuration, help — grouped at the bottom of the side navigation, separated by a `--color-border-divider` divider from primary items. Use `--color-text-tertiary`, visually quietest.
- Avoid adding more top-level destinations than the product can currently support well.
- Do not use the brand gradient, large typography, or atmospheric effects in the shell — per the upstream guidance on preventing marketing emphasis in application shells.

### 4. Reduce Global Clutter

Observed issues:
- Important controls are discoverable only after opening the jobs page.
- Advanced actions compete visually with common actions.

Refactor direction:
- Separate frequent user actions from low-frequency configuration actions per the three-tier hierarchy.
- Page-level actions go in the page header (right-aligned, primary action uses accent). Section-level actions go inline with section headers (ghost/icon buttons). Background utilities go in toolbars or the top app bar (icon-only with tooltips).
- Use the app shell to create stronger hierarchy between primary workflows and supporting utilities.

### 5. Build a Stable, Reusable Workspace Shell

Refactor direction:
- Implement the workspace container as an open canvas (`--color-neutral-canvas`) — not wrapped in a visible card or container. Content within the workspace uses `--color-neutral-surface` panels when grouping or elevation is needed.
- Implement responsive behavior following the upstream posture:
  - Side nav collapses from expanded → icon-only (tooltips on hover) → off-canvas overlay (hamburger toggle in top bar, slides from left with `--motion-duration-normal`/`--motion-easing-out`).
  - Top bar: labels condense to icon-only, low-priority utilities move to overflow menu, wordmark may shorten to logo mark.
  - Page header: long titles truncate, breadcrumbs collapse, secondary actions move to overflow.
- Keep the shell simple enough to work equally well in browser and desktop contexts.
- Consider providing the lightweight secondary shell pattern for settings or onboarding pages.

## Implementation Steps

### 1. Define the shell structure
- [ ] Map product sections to the three-tier navigation hierarchy.
- [ ] Define what the landing route should communicate and enable.
- [ ] Decide which pages use the primary workspace shell and which (if any) use the lightweight secondary shell.

### 2. Implement the primary workspace shell
- [ ] Build the top app bar with product identity and utility controls per app shell guidance Section 1.1.
- [ ] Build the side navigation with full state treatments per app shell guidance Section 1.2 and Section 2.
- [ ] Build the page header pattern per app shell guidance Section 1.3.
- [ ] Establish the workspace container as the primary content area per app shell guidance Section 1.5.

### 3. Implement navigation hierarchy and state
- [ ] Apply the three-tier action hierarchy (primary, supporting, admin/utility) per app shell guidance Section 3.
- [ ] Implement navigation state behavior (default, hover, focus, selected, disabled) with the specified tokens.
- [ ] Separate utility navigation at the bottom of the side nav from primary workflow navigation.

### 4. Add responsive behavior
- [ ] Implement side navigation collapse (expanded → icon-only → off-canvas) per app shell guidance Section 4.1.
- [ ] Implement top bar simplification per app shell guidance Section 4.2.
- [ ] Implement page header adaptation per app shell guidance Section 4.3.

### 5. Update pages and validate
- [ ] Create the landing/home view replacing the current redirect.
- [ ] Align the jobs and skills entry points with the new shell structure.
- [ ] Add or update frontend tests for navigation, entry behavior, and major shell states.
- [ ] Verify the resulting structure matches product-overview principles.

## Affected Areas

- `src/frontend/app/layout.tsx`
- `src/frontend/app/page.tsx`
- `src/frontend/app/jobs/page.tsx`
- `src/frontend/app/skills/page.tsx`
- new shell/navigation components under `src/frontend/components/`
- frontend tests under `tests/frontend/`

## Success Criteria

- [ ] The app uses the primary workspace shell pattern with top app bar, side navigation, page header, and workspace container.
- [ ] The app has a real entry experience instead of a redirect-only root route.
- [ ] Navigation reflects the core user journey through the three-tier hierarchy.
- [ ] Navigation states (default, hover, focus, selected, disabled) match the upstream token mappings.
- [ ] Primary actions and advanced settings are separated across the appropriate hierarchy tiers.
- [ ] The shell feels calm, deliberate, and reusable across pages.
- [ ] Responsive behavior follows the upstream collapse and simplification patterns.
- [ ] The global structure is stable enough to support both workflow redesign and desktop packaging.
