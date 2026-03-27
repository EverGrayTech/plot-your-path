# Plan: ai-config prune and workflow cutover

## Overview

Remove all fake browser-local AI behavior from Plot Your Path and cut workflow consumers over to honest runtime behavior. This phase should delete placeholder generation logic, stop persisting fake generated artifacts, and replace current local pseudo-success with either real ai-config-backed implementations or explicit user-visible failure states.

## Prerequisites

- `.plans/62-ai-config-invocation-workflow-cutover.md`

## Goals

1. Remove every fake, templated, heuristic, or placeholder AI output path from user-facing workflows.
2. Keep only the structural seams that remain useful: workflow boundaries, domain return shapes, persistence/update semantics, and category mapping.
3. Replace fake success behavior with either real ai-config-backed logic or explicit "not implemented / unavailable" failure states.
4. Migrate workflow consumers need-by-need so no real user can rely on canned AI output.

## Non-negotiable rule

No placeholder AI output may be shown to users or persisted as if it were real generated content. When real workflow logic is absent, the app must fail explicitly and surface that state honestly.

## Technical Design

### 1. Prune fake local generation to the bones

Refactor direction:
- Remove canned strings, heuristic scores, template sections, fake provider/model/version labels, and any other fabricated output values.
- Remove `fallback_used: true` behaviors that currently hide missing implementation behind fake success.
- Delete any storage writes that persist fake generated analyses or artifacts.

### 2. Preserve only useful structural seams

Refactor direction:
- Retain workflow function boundaries where they still define useful contracts for the rest of the app.
- Retain domain-model mapping points, artifact version/update behavior, and listing/persistence seams where still valid.
- Keep ai-config category routing aligned with workflow families.
- Avoid leaving behind pseudo-generation helpers that imply the app can still “fake” AI output.

### 3. Replace fake success with honest runtime behavior

Refactor direction:
- For workflows with real prompt/response logic ready to implement, route through ai-config invocation and map results into app domain models.
- For workflows not yet reimplemented, throw explicit structured errors that the UI can surface honestly.
- Ensure the UI and state flows treat unimplemented AI workflows as warnings/failures, not silent degradation into canned output.

### 4. Cut over workflow consumers need-by-need

Refactor direction:
- Migrate fit analysis, desirability scoring, application materials, interview prep generation/regeneration, and resume tuning individually rather than as one opaque replacement.
- Evaluate resume/profile sync separately to determine whether it belongs in AI generation cutover or another ingestion-focused lane.
- Update consumer hooks, services, and components so each workflow either uses real logic or surfaces explicit unavailability.

## Implementation Steps

### 1. Inventory fake local AI behavior and caller dependencies
- [ ] Create this plan file in `.plans/` using current repository conventions.
- [ ] Inventory all fake output paths in `src/lib/localAi.ts` and any related helper code.
- [ ] Identify which UI/service consumers currently depend on fake success behavior.

### 2. Remove placeholder generation internals
- [ ] Delete canned/heuristic/template output values for fit analysis, desirability scoring, cover letters, application Q&A, interview prep, and resume tuning.
- [ ] Remove fake provenance/provider/model/version labels that only existed to support pseudo-generation.
- [ ] Stop persisting fabricated generated artifacts or analyses.

### 3. Rewire workflows to honest runtime outcomes
- [ ] Replace fake success paths with real ai-config-backed implementations where prompt/response contracts are defined.
- [ ] For remaining workflows, return explicit structured errors instead of fake generated content.
- [ ] Update user-visible state flows so missing workflow implementations surface clearly.

### 4. Update callers and tests around the prune/cutover
- [ ] Update workflow consumers under `src/lib/` and `src/components/` to handle real invocation results or explicit failures.
- [ ] Remove tests that encode fake local-generation success assumptions.
- [ ] Add or update tests for explicit failure behavior and any real workflow cutovers completed in this phase.

### 5. Validate the honest cutover
- [ ] Run repository formatting.
- [ ] Run focused tests for all affected workflow consumers.
- [ ] Confirm no user-facing AI workflow still returns or persists fake placeholder content.

## Affected Areas

- `.plans/63-ai-config-prune-and-workflow-cutover.md`
- `src/lib/localAi.ts`
- AI workflow consumers under `src/lib/` and `src/components/`
- related tests under `tests/lib/`, `tests/components/`, and `tests/app/`

## Success Criteria

- [ ] No fake/templated/heuristic AI output remains user-visible or persisted as generated content.
- [ ] Workflow consumers either use real ai-config-backed logic or fail explicitly and honestly.
- [ ] Fake local provenance values tied to pseudo-generation are removed.
- [ ] Stale tests that depended on fake local-generation success are removed or rewritten.
- [ ] Formatting and focused regression checks pass for the prune/cutover phase.
