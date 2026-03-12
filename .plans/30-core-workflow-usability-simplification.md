# Plan: Core Workflow Usability Simplification

## Overview

Simplify the primary user workflow so the product feels more like a deliberate career workspace and less like a collection of powerful but loosely grouped capabilities. This phase focuses on the highest-value day-to-day experience: bringing in a role, understanding whether it matters, and acting on it without unnecessary friction.

The emphasis is not feature expansion. It is workflow clarity, hierarchy, copy, and interaction simplification.

## Prerequisites

- `.plans/28-design-system-foundation.md`
- `.plans/29-app-shell-and-navigation-refresh.md`

## Goals

1. Streamline the jobs experience around the core decisions users need to make.
2. Reduce cognitive load in the toolbar, list view, and role detail workflows.
3. Improve the capture flow so it feels reliable, guided, and forgiving.
4. Make status, next actions, and outcome-related information easier to scan.
5. Improve empty, loading, success, and error states so the product feels more confident and pleasant.

## Technical Design

### 1. Focus the Jobs Workspace on the Core Loop

Observed issues:
- The jobs experience exposes many adjacent capabilities at once.
- Important user decisions can get buried under secondary controls and modal entry points.

Refactor direction:
- Re-center the page around a smaller set of primary actions:
  - capture a role
  - review and prioritize roles
  - inspect one role deeply
  - take the next meaningful action
- Use progressive disclosure for advanced analysis and configuration-heavy features.

### 2. Simplify Capture and Early Evaluation

Observed issues:
- The capture flow is functional but visually bare.
- Fallback and progress states are useful, but they can feel mechanical rather than reassuring.

Refactor direction:
- Improve the capture interaction hierarchy, instructions, and completion feedback.
- Make error and fallback states feel intentional and recoverable.
- Keep the capture path fast for users who just want to add a role and move on.

### 3. Improve List Scannability and Prioritization

Refactor direction:
- Revisit how roles are summarized in the list and which metadata earns prominence.
- Make fit, desirability, status, and next-step signals easier to compare at a glance.
- Ensure sorting and filtering support decision-making rather than visual noise.

### 4. Reduce Detail-View Overload

Observed issues:
- The detail experience currently aggregates many workflows and can feel dense.

Refactor direction:
- Reorganize the detail experience into clearer sections with stronger hierarchy.
- Distinguish core decision content from optional AI-assisted or advanced support areas.
- Make cross-links to skills, materials, interview prep, and outcomes feel intentional rather than crowded.

### 5. Raise the Quality of Feedback States

Refactor direction:
- Improve empty states, loading states, confirmations, and recoverable errors across the core workflow.
- Use consistent tone and interaction patterns so the product feels trustworthy and calm.

## Implementation Steps

### 1. Reassess the primary jobs workflow
- [ ] Define the smallest coherent “capture -> evaluate -> act” path the page should optimize for.
- [ ] Identify controls and views that should become secondary or contextual.

### 2. Redesign the capture and list experience
- [ ] Update the capture flow hierarchy and interaction feedback.
- [ ] Improve list summaries, prioritization cues, and scan patterns.

### 3. Rework the role-detail experience
- [ ] Reorganize the detail view around clear sections and action hierarchy.
- [ ] Reduce the apparent complexity of advanced workflows without removing them.

### 4. Normalize product feedback states
- [ ] Improve empty, loading, success, and error treatments across the workflow.
- [ ] Align user-facing copy with the product’s calm, analytical tone.

### 5. Verify usability and regression coverage
- [ ] Update component and page-level tests for revised workflows.
- [ ] Confirm the redesigned flow still preserves the existing product capabilities.

## Affected Areas

- `src/frontend/components/CaptureJobForm.tsx`
- `src/frontend/components/JobsPageClient.tsx`
- `src/frontend/components/jobs/`
- supporting frontend utilities under `src/frontend/lib/`
- frontend tests under `tests/frontend/`

## Success Criteria

- [ ] A new user can understand the primary jobs workflow quickly.
- [ ] Capture, evaluation, and next-action flows feel more guided and less cluttered.
- [ ] List and detail views communicate priority more clearly.
- [ ] Advanced capabilities remain available but no longer dominate the default experience.
- [ ] Feedback states feel deliberate, reassuring, and visually cohesive.
