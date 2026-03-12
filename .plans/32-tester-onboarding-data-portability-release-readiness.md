# Plan: Tester Onboarding, Data Portability, and Release Readiness

## Overview

Finish the path from “works on a developer machine” to “safe and understandable for non-technical users.” This phase adds the surrounding product and operational capabilities that make a packaged local-first app practical to hand off: first-run guidance, data visibility, backup/export, restore/reset behavior, and a repeatable release checklist.

This is the final phase because it depends on both a simplified user experience and a stable desktop runtime foundation.

## Prerequisites

- `.plans/30-core-workflow-usability-simplification.md`
- `.plans/31-desktop-runtime-foundation.md`

## Goals

1. Make first-run use understandable for non-technical users.
2. Give users explicit control over their local data.
3. Provide safe backup, export, restore, and reset paths.
4. Improve release readiness with packaging, smoke-test, and handoff checklists.
5. Reduce support burden by making failure states and recovery paths clearer.

## Technical Design

### 1. First-Run and Empty-State Guidance

Observed issues:
- Even with desktop packaging, a first-time user may not understand what to do first.

Refactor direction:
- Add a lightweight first-run orientation path.
- Use empty states and contextual guidance to direct the user toward the first meaningful action.
- Keep the tone aligned with the product’s assistive, calm positioning.

### 2. Local Data Transparency

Refactor direction:
- Make it clear that data is stored locally.
- Provide understandable access to where data lives and what kinds of records are stored.
- Avoid exposing raw technical detail unless the user chooses to inspect it.

### 3. Backup, Export, Restore, and Reset

Refactor direction:
- Define a supported backup/export format for the local workspace.
- Add restore/import behavior where appropriate.
- Provide a reset path for users who want to start fresh without manually deleting files.
- Ensure destructive actions are explicit and recoverable where possible.

### 4. Release and Support Readiness

Refactor direction:
- Define a release checklist for packaging, smoke testing, and versioned handoff.
- Document the user installation and update experience.
- Capture the minimum troubleshooting information needed when a user reports an issue.

### 5. Quality and Trust Signals

Refactor direction:
- Make failure states, offline limitations, and local-environment dependencies easier to understand.
- Ensure the product communicates what it can and cannot do in a packaged user context.

## Implementation Steps

### 1. Improve first-run guidance
- [ ] Add lightweight onboarding or guided empty-state support for first-time users.
- [ ] Ensure the first meaningful action is obvious.

### 2. Add data control surfaces
- [ ] Expose local-data visibility in a user-appropriate way.
- [ ] Add backup/export and reset capabilities.

### 3. Define recovery paths
- [ ] Add restore or import behavior where it improves user safety.
- [ ] Make destructive or irreversible actions explicit.

### 4. Prepare release workflows
- [ ] Document packaging, smoke testing, and handoff procedures.
- [ ] Define the minimum release checklist for future user drops.

### 5. Validate the user experience
- [ ] Run through the packaged first-run flow from a non-technical perspective.
- [ ] Close the largest gaps in clarity, recovery, and trust before distribution.

## Affected Areas

- desktop-facing frontend surfaces for onboarding and settings
- local data handling and export/reset flows
- release documentation and user handoff materials
- packaging and smoke-test workflows

## Success Criteria

- [ ] A non-technical user can understand how to start using the app.
- [ ] Local data ownership and storage are communicated clearly.
- [ ] Backup/export and reset workflows exist and are understandable.
- [ ] Release handoff is supported by a repeatable checklist.
- [ ] The packaged app feels safe enough to share outside the development context.
