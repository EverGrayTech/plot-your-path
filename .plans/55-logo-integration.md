# Plan: Logo Integration

## Overview

Introduce Plot Your Path application identity into the app shell while preserving the EverGray Tech parent-brand hierarchy defined by the design system. The shell should make the product identity clear, provide a quiet path back to the EverGray Tech company site, and avoid turning operational chrome into a marketing surface.

## Prerequisites

- `.plans/29-app-shell-and-navigation-refresh.md`
- `C:/Users/RoseA/Repos/design-system/docs/application-logo-usage.md`

## Upstream Design System References

The following upstream guidance should be treated as authoritative for this phase:

- **Application Logo Usage Guidance** (`C:/Users/RoseA/Repos/design-system/docs/application-logo-usage.md`) defines the product-vs-company identity hierarchy, preferred shell placement, responsive simplification, and interaction posture for company/app logo coexistence.
- **Consumption Guide / component export** (`C:/Users/RoseA/Repos/design-system/docs/consumption-guide.md`) the EverGray Tech logo component exported from the package root is the canonical product-facing integration for React and Next.js applications.

Key upstream patterns to adopt:
- **App identity leads**: Plot Your Path remains the primary product identifier in the shell.
- **Company identity supports**: EverGray Tech appears as a quieter linked brand anchor back to the company page.
- **Shell-owned identity**: Brand marks stay in shell chrome only, not repeated in workspace content.
- **Responsive restraint**: Preserve app recognition first, simplify company expression before the shell becomes crowded.

## Goals

1. Add Plot Your Path branding to the app shell as the primary product identity.
2. Add a quieter EverGray Tech logo link that returns users to the company site using the design-system asset.
3. Keep scale, spacing, and interaction styling aligned with the existing shell and design-system guidance.
4. Verify the branded shell with focused frontend tests.

## Technical Design

### 1. Stabilize asset sourcing

- Plot Your Path logo is in `public/` so it can be loaded predictably by the Next.js app shell.
- Source the EverGray Tech mark from the published design-system component export.
- Preserve accessible alt text and predictable labeling for both identities.

### 2. Clarify shell identity hierarchy

Refactor direction:
- Keep the Plot Your Path logo and product name together as the main shell identity cluster.
- Present the EverGray Tech logo as a quieter supporting link to `https://evergraytech.com`.
- Separate the two identities with spacing and scale so the product identity clearly answers `where am I` while the company link answers `who is this from`.

### 3. Keep interaction posture restrained

Refactor direction:
- Preserve subtle hover and focus states consistent with the existing app shell.
- Avoid button-like emphasis, glow, or promotional treatments around either logo.
- Ensure responsive behavior simplifies without causing brand crowding in narrow layouts.

### 4. Validate shell behavior

Refactor direction:
- Update shell tests to verify the Plot Your Path logo is present and that the EverGray Tech company anchor points to the company site.
- Keep test assertions focused on structure, accessibility, and navigation behavior rather than visual implementation details.

## Implementation Steps

### 1. Align the plan and asset strategy
- [x] Review existing `.plans/` structure and upstream logo guidance.
- [x] Identify current deviations from plan format and design-system asset usage.
- [x] Rewrite this plan to match repository planning conventions.

### 2. Implement shell identity updates
- [x] Update the shell identity cluster to show the app logo and name as the primary identifier.
- [x] Replace any custom EverGray asset usage with the design-system-provided company logo asset.

### 3. Refine styling and behavior
- [x] Adjust shell spacing and styling so the company logo remains visually subordinate.
- [x] Keep mobile behavior calm and uncluttered as shell width decreases.
- [x] Ensure accessible labels make the two destinations unambiguous.

### 4. Validate and document completion
- [x] Run formatter for the repository.
- [x] Run focused shell/frontend tests covering the updated navigation.
- [x] Mark this plan complete after validation passes.

## Affected Areas

- `.plans/55-logo-integration.md`
- `public/logo.svg`
- `src/components/shell/AppShell.tsx`
- `src/app/globals.css`
- `tests/components/shell/AppShell.test.tsx`

## Success Criteria

- [x] Plot Your Path is shown in the shell as the primary product identity.
- [x] The EverGray Tech logo links back to the company site as a quiet supporting brand anchor.
- [x] The EverGray Tech logo source comes from the design system rather than a locally reinvented asset.
- [x] The shell styling preserves clear hierarchy and avoids marketing-style emphasis.
- [x] Formatter and relevant frontend tests pass.
