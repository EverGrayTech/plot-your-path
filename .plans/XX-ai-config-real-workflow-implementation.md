# Plan: ai-config real workflow implementation

## Overview

Implement real ai-config-backed workflow behavior for Plot Your Path where phase 63 removed fake browser-local generation. This phase should replace explicit unavailable states with real invocation and mapping logic, one workflow at a time, while preserving the browser-hosted local-first deployment model and keeping provenance honest and traceable.

## Prerequisites

- `.plans/63-ai-config-prune-and-workflow-cutover.md`
- `.plans/62-ai-config-invocation-workflow-cutover.md`

## Goals

1. Reintroduce user-facing AI workflows only through real ai-config-backed invocation paths.
2. Map real responses into existing domain models without reintroducing fabricated fallback content.
3. Restore workflow functionality incrementally so each consumer moves from explicit unavailability to real behavior in a controlled way.
4. Keep provenance, provider/model metadata, and persisted outputs truthful to actual runtime behavior.

## Non-negotiable rule

No workflow may return fabricated success content as a substitute for a missing implementation. If a workflow is not yet implemented in this phase, it must remain explicitly unavailable.

## Technical Design

### 1. Implement workflow-by-workflow, not as one opaque cutover

Refactor direction:
- Reintroduce fit analysis, desirability scoring, application materials, interview prep generation/regeneration, resume tuning, and resume/profile sync deliberately and independently.
- Preserve explicit unavailable behavior for workflows not yet cut over.
- Avoid partial “mostly real” flows that silently blend real and placeholder behavior.

### 2. Route through ai-config invocation boundaries

Refactor direction:
- Use the ai-config invocation layer established in prior phases as the only path for real AI generation.
- Keep operation-family routing aligned to the correct workflow category.
- Make provider/model/runtime metadata reflect the actual invocation path used.

### 3. Map real responses into app domain models

Refactor direction:
- Convert ai-config responses into `FitAnalysis`, `DesirabilityScore`, `ApplicationMaterial`, `InterviewPrepPack`, and `ResumeTuningSuggestion` shapes without changing the consumer contracts unnecessarily.
- Preserve durable persistence/listing/update seams where they are still useful for the app.
- Ensure persisted records only contain data derived from actual runtime output or valid user edits.

### 4. Keep failures explicit during incremental rollout

Refactor direction:
- For each workflow not yet implemented, keep the honest unavailable error from phase 63.
- Update UI and state flows only when a workflow is truly ready.
- Prefer small, testable cutovers over broad replacement.

## Implementation Steps

### 1. Confirm workflow cutover order and scope
- [ ] Choose the implementation order for fit analysis, desirability scoring, application materials, interview prep, resume tuning, and resume/profile sync.
- [ ] Confirm the ai-config operation-family mapping for each workflow.
- [ ] Identify any workflows that should remain unavailable until a later phase.

### 2. Implement real fit/desirability workflows
- [ ] Replace explicit unavailable behavior for fit analysis with real ai-config invocation and domain mapping.
- [ ] Replace explicit unavailable behavior for desirability scoring/refresh with real ai-config invocation and domain mapping.
- [ ] Persist only truthful runtime outputs and metadata.

### 3. Implement real application/interview drafting workflows
- [ ] Replace explicit unavailable behavior for cover letter and application Q&A generation with real ai-config invocation and mapping.
- [ ] Replace explicit unavailable behavior for interview prep pack generation and regeneration with real ai-config invocation and mapping.
- [ ] Preserve manual edit/update semantics without reintroducing pseudo-generation helpers.

### 4. Implement real resume-related workflows
- [ ] Decide whether resume/profile sync belongs in this AI workflow phase or should remain a separate ingestion concern.
- [ ] Replace explicit unavailable behavior for resume tuning with real ai-config invocation and mapping if in scope.
- [ ] Keep resume-related provenance and persistence truthful to real runtime behavior.

### 5. Update callers and tests for real cutovers
- [ ] Update workflow consumers under `src/lib/` and `src/components/` as each workflow moves from unavailable to real behavior.
- [ ] Add or update tests for successful real invocation paths and honest failure behavior for workflows still not implemented.
- [ ] Validate that no cutover reintroduces fake/templated fallback output.

### 6. Validate the real implementation phase
- [ ] Run repository formatting.
- [ ] Run focused tests for all workflows cut over in this phase.
- [ ] Confirm remaining unavailable workflows still fail explicitly and implemented workflows use only real runtime-backed results.

## Affected Areas

- `.plans/64-ai-config-real-workflow-implementation.md`
- `src/lib/localAi.ts`
- ai-config invocation and mapping utilities under `src/lib/`
- AI workflow consumers under `src/components/` and `src/lib/`
- related tests under `tests/lib/`, `tests/components/`, and `tests/app/`

## Success Criteria

- [ ] At least one previously pruned workflow is restored through real ai-config-backed logic.
- [ ] No restored workflow relies on fabricated placeholder output.
- [ ] Persisted workflow outputs and metadata reflect actual runtime behavior.
- [ ] Workflows not yet restored remain explicitly unavailable.
- [ ] Formatting and focused regression checks pass for the real-implementation phase.
