# Plan: macOS Desktop Release
## Overview

Validate the packaged desktop app on a native macOS machine and turn the current unknowns into explicit pass, fail, or blocked outcomes.

This work is intentionally separated from the shared onboarding and data-portability plan because macOS packaging, runtime permissions, and release expectations introduce platform-specific requirements that cannot be fully assessed from Windows or WSL.

## Prerequisites

- `.plans/32-data-portability-windows-release.md`
- access to a native macOS build and test machine

## Goals

1. Validate macOS packaging on a native machine.
2. Confirm packaged runtime behavior for first run, backend startup, and local data-root creation.
3. Record signing, notarization, installer, or permission blockers explicitly.
4. Produce a macOS-specific handoff and troubleshooting checklist.

## Technical Design

### 1. Native build validation

Refactor direction:
- Run the existing desktop build flow on macOS rather than assuming Linux or Windows success generalizes.
- Validate the produced macOS artifact type and installation path.
- Treat missing signing or notarization support as a release-readiness concern, not just a packaging footnote.

### 2. Runtime verification

Refactor direction:
- Verify backend launch, frontend connectivity, healthcheck response, and first-run clarity in the packaged macOS app.
- Confirm the expected local data location and user-visible behavior around local storage.
- Record any macOS-specific permission prompts or launch restrictions.

### 3. Support and release notes

Refactor direction:
- Document the minimum user-facing install and troubleshooting guidance needed for tester handoff.
- Distinguish between blockers for local testing and blockers for wider distribution.

## Implementation Steps

### 1. Validate packaging
- [ ] Build the packaged macOS artifact on a native machine.
- [ ] Record packaging output, prerequisites, and any immediate build blockers.

### 2. Validate runtime behavior
- [ ] Run the packaged app through first launch and smoke-test expectations.
- [ ] Verify local data-root creation, backend health, and frontend connectivity.

### 3. Document macOS release blockers
- [ ] Record signing, notarization, installer, or runtime restrictions.
- [ ] Define the minimum acceptable macOS tester-handoff checklist.

## Affected Areas

- desktop packaging workflow documentation
- macOS-specific tester handoff guidance
- platform-specific release blocker tracking

## Success Criteria

- [ ] macOS packaging has a documented native validation result.
- [ ] macOS runtime smoke tests have explicit pass/fail/blocker notes.
- [ ] macOS-specific release blockers are clear enough to plan the next hardening step.
