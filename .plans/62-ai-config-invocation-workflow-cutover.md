# Plan: ai-config invocation foundation

## Overview

Establish Plot Your Path's shared ai-config invocation foundation: one shared manager instance, gateway-backed hosted/BYOK invocation wiring, category-aware routing support, and settings integration that uses the package-owned configuration surface.

## Prerequisites

- `.plans/59-ai-config-settings-foundation.md`
- `.plans/61-ai-config-service-and-persistence-cutover.md`

## Goals

1. Establish a shared ai-config-backed invocation seam for Plot Your Path.
2. Invoke configured AI routes through ai-config using operation-category keys aligned with existing workflow families.
3. Wire hosted and BYOK execution through the documented gateway posture.
4. Surface structured invocation failures honestly at the shared invocation seam.

## Technical Design

### 1. Establish the shared invocation seam

Refactor direction:
- Introduce app-local workflow adapters that call the current configured route through ai-config.
- Pass the aligned category key for each workflow family rather than reproducing provider/model routing locally.
- Treat both hosted default and BYOK execution as ai-config-managed gateway invocation rather than separate host-managed transport paths.
- Leave workflow-by-workflow replacement of fake local generation to a follow-on cutover phase.

### 2. Replace silent fallback with structured failure handling

Refactor direction:
- Use ai-config's structured invocation error contract directly.
- Surface invocation failure clearly in the UI and state flows.
- Apply this failure-handling contract to the new shared invocation seam.
- Account for current normalized gateway-mediated failure modes, including configuration, authentication, network, provider, hosted invocation, and BYOK invocation failures.

## Implementation Steps

### 1. Add the plan and inventory invocation touchpoints
- [x] Identify all current local pseudo-generation entry points and the workflow category each should map to.

### 2. Introduce category-aware invocation adapters
- [x] Add app-local adapters that build workflow-specific prompts or request payloads.
- [x] Route workflow invocation through ai-config using the aligned operation-category key.
- [x] Align invocation adapters with ai-config's current gateway-mediated hosted and BYOK request posture instead of inventing host-owned provider transports.
- [x] Add gateway configuration support using `NEXT_PUBLIC_AI_GATEWAY_BASE_URL` and `NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID`.

### 3. Shared invocation seam failure handling
- [x] Update any new shared invocation seam failure handling to reflect structured invocation errors instead of inventing new provider-specific normalization.
- [x] Ensure the new invocation seam covers current gateway-mediated BYOK invocation failures without rebuilding provider-specific normalization locally.

### 4. Validate workflow regression safety
- [x] Update or add tests for category-aware invocation adapter behavior.
- [x] Update or add tests for shared invocation seam failure handling.
- [x] Run repository formatting.
- [x] Run focused tests for affected AI workflow behavior.

## Affected Areas

- `.plans/62-ai-config-invocation-workflow-cutover.md`
- shared ai-config wiring under `src/lib/` and `src/components/`
- related tests under `tests/lib/` and `tests/components/`

## Success Criteria

- [x] Plot Your Path defines a shared ai-config-backed invocation adapter boundary using aligned operation-category keys.
- [x] The invocation adapter supports gateway configuration through `NEXT_PUBLIC_AI_GATEWAY_BASE_URL` and `NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID`.
- [x] Shared invocation failures surface through structured error handling rather than new provider-specific normalization.
- [x] Invocation integration reflects ai-config's current gateway-mediated hosted and BYOK execution model.
- [x] Workflow-by-workflow replacement of fake local generation is explicitly deferred to a follow-on prune/cutover phase.
- [x] Related tests and formatting checks pass.
