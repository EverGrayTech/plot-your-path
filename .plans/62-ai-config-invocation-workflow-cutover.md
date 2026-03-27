# Plan: ai-config invocation workflow cutover

## Overview

Cut Plot Your Path's AI workflows over from browser-local pseudo-generation to category-aware ai-config invocation. This phase should replace fake local generation paths with real configured invocation, keep prompt construction and response mapping app-owned where appropriate, and surface structured invocation failures directly instead of falling back silently.

## Prerequisites

- `.plans/59-ai-config-settings-foundation.md`
- `.plans/61-ai-config-service-and-persistence-cutover.md`

## Goals

1. Remove browser-local pseudo-generation behavior from AI-assisted workflows.
2. Invoke configured AI routes through ai-config using operation-category keys aligned with existing workflow families.
3. Keep app-specific prompt construction and response-to-domain-model mapping in Plot Your Path.
4. Surface structured invocation failures honestly instead of silently generating local fallback output.

## Technical Design

### 1. Replace pseudo-generation with ai-config invocation

Refactor direction:
- Retire local fake generation paths for fit analysis, desirability scoring, application materials, interview prep, and resume tuning.
- Introduce app-local workflow adapters that call the current configured route through ai-config.
- Pass the aligned category key for each workflow family rather than reproducing provider/model routing locally.
- Treat both hosted default and BYOK execution as ai-config-managed gateway invocation rather than separate host-managed transport paths.

### 2. Keep app-specific domain shaping local

Refactor direction:
- Keep prompt construction in Plot Your Path where the product's domain logic is app-specific.
- Keep response parsing and transformation into domain records local to the app.
- Avoid turning ai-config into a prompt-orchestration or workflow-ownership layer.

### 3. Replace silent fallback with structured failure handling

Refactor direction:
- Use ai-config's structured invocation error contract directly.
- Surface invocation failure clearly in the UI and state flows.
- Do not silently substitute heuristic or template output when invocation fails.
- Account for current normalized gateway-mediated failure modes, including configuration, authentication, network, provider, hosted invocation, and BYOK invocation failures.

## Implementation Steps

### 1. Add the plan and inventory invocation touchpoints
- [ ] Identify all current local pseudo-generation entry points and the workflow category each should map to.

### 2. Introduce category-aware invocation adapters
- [ ] Add app-local adapters that build workflow-specific prompts or request payloads.
- [ ] Route workflow invocation through ai-config using the aligned operation-category key.
- [ ] Preserve app-specific response parsing into existing domain model shapes where still appropriate.
- [ ] Align invocation adapters with ai-config's current gateway-mediated hosted and BYOK request posture instead of inventing host-owned provider transports.

### 3. Remove pseudo-generation behavior
- [ ] Remove browser-local heuristic or template fallback generation paths for affected workflows.
- [ ] Update user-visible and developer-facing failure handling to reflect structured invocation errors instead of silent fallback behavior.
- [ ] Ensure failure handling covers current gateway-mediated BYOK invocation failures without rebuilding provider-specific normalization locally.

### 4. Validate workflow regression safety
- [ ] Update or add tests for category-aware invocation behavior.
- [ ] Update or add tests for structured invocation failure handling.
- [ ] Run repository formatting.
- [ ] Run focused tests for affected AI workflow behavior.

## Affected Areas

- `.plans/62-ai-config-invocation-workflow-cutover.md`
- `src/lib/localAi.ts`
- AI workflow consumers under `src/lib/` and `src/components/`
- related tests under `tests/lib/` and `tests/components/`

## Success Criteria

- [ ] Browser-local pseudo-generation paths are removed for the targeted AI workflows.
- [ ] AI workflows invoke ai-config using aligned operation-category keys.
- [ ] Prompt construction and domain-model mapping remain app-owned where product-specific.
- [ ] Invocation failures surface through structured error handling rather than silent fallback.
- [ ] Invocation integration reflects ai-config's current gateway-mediated hosted and BYOK execution model.
- [ ] Related tests and formatting checks pass.
