# Plan: ai-config provenance and regression hardening

## Overview

Finish the ai-config migration by preserving trustworthy invocation provenance on real generated outputs, removing remaining stale test assumptions after the prune/cutover phase, and validating that the final architecture remains compatible with the app's browser-hosted static-export deployment model.

## Prerequisites

- `.plans/62-ai-config-invocation-workflow-cutover.md`
- `.plans/63-ai-config-prune-and-workflow-cutover.md`

## Goals

1. Persist trustworthy invocation provenance from ai-config results on real generated analyses and artifacts.
2. Remove stale test assumptions that remain after fake local generation has been pruned.
3. Validate the final ai-config migration against static-export and client-rendered constraints.
4. Leave the repository with coherent test coverage around the completed settings and invocation model.

## Technical Design

### 1. Preserve invocation provenance honestly

Refactor direction:
- Persist canonical invocation metadata such as provider and model from ai-config results wherever generated outputs record AI origin.
- Include additional metadata such as execution path, labels, or normalized usage only where product-useful and stable.
- Prefer persisting the invocation result envelope directly where practical rather than re-deriving provenance from config state after execution.
- Build provenance persistence on top of real workflow outputs, not fake local stand-ins.

### 2. Retire stale prototype assumptions in tests

Refactor direction:
- Remove tests that only validate old modal-based settings, deprecated token healthchecks, or other prototype assumptions no longer relevant after the prune/cutover.
- Replace them with coverage for packaged settings integration, provenance mapping, category-aware invocation, structured failure handling, and final user-facing workflow behavior.

### 3. Validate the final deployment posture

Refactor direction:
- Confirm the final ai-config integration remains client-rendered and safe for static export.
- Ensure no server-only assumptions or legacy runtime expectations are reintroduced during cleanup.
- Confirm final assumptions remain aligned with ai-config's current gateway-mediated hosted and BYOK execution posture and any optional advisory model discovery behavior adopted by the app.

## Implementation Steps

### 1. Add the plan and inventory provenance touchpoints
- [ ] Identify where real generated analyses and artifacts persist AI-origin metadata.

### 2. Preserve ai-config invocation metadata on outputs
- [ ] Update output persistence to store canonical ai-config invocation provenance fields where applicable.
- [ ] Ensure user-visible generated-output context remains honest about what produced the result.
- [ ] Prefer storing invocation-returned metadata directly rather than re-reading config state after generation.

### 3. Realign tests around the final architecture
- [ ] Remove obsolete tests tied to prototype settings and pre-cutover assumptions.
- [ ] Add or update tests covering provenance mapping, packaged settings integration, and final structured invocation behavior.

### 4. Run final validation
- [ ] Run repository formatting.
- [ ] Run the full test suite.
- [ ] Validate the final architecture against current static-export and browser-hosted constraints.
- [ ] Validate that any adopted advisory model discovery behavior remains advisory-only and does not change invocation correctness assumptions.

## Affected Areas

- `.plans/64-ai-config-provenance-and-regression-hardening.md`
- generated-output persistence code under `src/lib/`
- related UI surfaces under `src/components/`
- tests under `tests/app/`, `tests/components/`, and `tests/lib/`

## Success Criteria

- [ ] Real generated analyses and artifacts persist trustworthy invocation provenance from ai-config results.
- [ ] Obsolete prototype assumptions are removed from the test suite.
- [ ] The final ai-config migration remains compatible with client-rendered static export deployment.
- [ ] Final provenance and validation assumptions remain aligned with ai-config's current invocation and model-discovery posture.
- [ ] Repository formatting and the full test suite pass.
