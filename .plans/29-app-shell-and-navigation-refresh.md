# Plan: App Shell and Navigation Refresh

## Overview

Refocus the top-level product structure around the documented core journey: capture opportunities, evaluate fit, pursue deliberately, and learn over time. The current shell is minimal and functional, but it does not yet guide a user through the intended product flow or present the product as a calm, coherent workspace.

This phase should reshape the global structure of the experience before deep workflow-specific UX changes are made.

## Prerequisites

- `.plans/28-design-system-foundation.md`

## Goals

1. Replace the bare-bones app shell with a clearer workspace structure.
2. Rework top-level navigation so it reflects the product’s primary use cases.
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
- Use that entry point to explain the product’s immediate value and surface likely next actions.
- Keep the first-run experience lightweight rather than instructional overload.

### 2. Clarify Primary Navigation

Observed issues:
- The current navigation exposes only Jobs and Skills.
- Important operational or support flows are distributed across the jobs page rather than expressed in the shell.

Refactor direction:
- Define primary navigation around the product’s core loop and current scope.
- Decide what belongs in global navigation, what belongs in page-local controls, and what should move into secondary settings areas.
- Avoid adding more top-level destinations than the product can currently support well.

### 3. Reduce Global Clutter

Observed issues:
- Important controls are discoverable only after opening the jobs page.
- Advanced actions compete visually with common actions.

Refactor direction:
- Separate frequent user actions from low-frequency configuration actions.
- Use the app shell to create stronger hierarchy between primary workflows and supporting utilities.

### 4. Build a Stable, Reusable Workspace Shell

Refactor direction:
- Establish shared shell patterns for page framing, section headers, content width, navigation state, and page-level actions.
- Keep the shell simple enough to work equally well in browser and desktop contexts.

## Implementation Steps

### 1. Define the shell structure
- [ ] Define the intended top-level destinations and their roles.
- [ ] Define what the landing route should communicate and enable.

### 2. Rework global navigation and layout
- [ ] Replace the current minimal navigation with a clearer app shell.
- [ ] Add consistent page framing and section hierarchy.

### 3. Separate primary and secondary actions
- [ ] Move advanced or administrative controls out of the most prominent shell positions where appropriate.
- [ ] Preserve discoverability without overwhelming the default view.

### 4. Update supporting pages
- [ ] Align the jobs and skills entry points with the new shell structure.
- [ ] Ensure the shell supports future desktop packaging requirements.

### 5. Validate the new flow
- [ ] Add or update frontend tests for navigation, entry behavior, and major shell states.
- [ ] Verify the resulting structure matches product-overview principles.

## Affected Areas

- `src/frontend/app/layout.tsx`
- `src/frontend/app/page.tsx`
- `src/frontend/app/jobs/page.tsx`
- `src/frontend/app/skills/page.tsx`
- shared shell/navigation components under `src/frontend/components/`
- frontend tests under `tests/frontend/`

## Success Criteria

- [ ] The app has a real entry experience instead of a redirect-only root route.
- [ ] Navigation reflects the core user journey more clearly.
- [ ] Primary actions and advanced settings are no longer competing at the same visual level.
- [ ] The shell feels calm, deliberate, and reusable across pages.
- [ ] The global structure is stable enough to support both workflow redesign and desktop packaging.
