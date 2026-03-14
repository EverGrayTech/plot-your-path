# Plan: Linux Desktop Packaging Follow-up

## Overview

Complete the remaining Linux-specific release-readiness work after the shared product hardening and Windows tester validation are in place.

Linux is intentionally split into its own plan because the remaining work is mostly distribution-specific rather than shared-product behavior. The main open issue is the AppImage `linuxdeploy` failure, and Linux is currently lower priority than Windows and macOS for tester distribution.

## Prerequisites

- `.plans/32-data-portability-windows-release.md`
- access to the target Linux validation environment(s)

## Goals

1. Validate Linux distribution artifacts end-to-end.
2. Resolve or intentionally defer the AppImage `linuxdeploy` blocker.
3. Document Linux-specific prerequisites, install behavior, and troubleshooting guidance.
4. Decide what Linux artifact support is required for the initial tester release.

## Technical Design

### 1. Artifact-by-artifact validation

Refactor direction:
- Validate `.deb` and `.rpm` artifacts independently rather than treating Linux as one outcome.
- Confirm install, launch, local data-root creation, and uninstall behavior for each supported package format.
- Separate runtime issues from bundling-tool failures.

### 2. AppImage blocker handling

Refactor direction:
- Investigate the `linuxdeploy` failure as a Linux-specific packaging problem.
- Decide whether AppImage is required for the first Linux release or should remain an explicit deferred item.
- Record the rationale so future release attempts inherit the decision instead of rediscovering it.

### 3. Linux handoff guidance

Refactor direction:
- Document prerequisite packages, supported distribution assumptions, and minimum troubleshooting steps.
- Keep Linux support claims narrower than the evidence actually gathered.

## Implementation Steps

### 1. Validate current Linux artifacts
- [ ] Validate `.deb` install, launch, smoke-test behavior, and uninstall.
- [ ] Validate `.rpm` install, launch, smoke-test behavior, and uninstall.

### 2. Address AppImage readiness
- [ ] Investigate the AppImage `linuxdeploy` blocker.
- [ ] Either resolve AppImage packaging or explicitly defer it with release guidance.

### 3. Finalize Linux release guidance
- [ ] Document supported artifact expectations and known Linux limitations.
- [ ] Define the minimum Linux tester-handoff checklist.

## Affected Areas

- Linux packaging workflow documentation
- Linux-specific release blocker tracking
- tester handoff guidance for Linux distribution artifacts

## Success Criteria

- [ ] Linux artifact support is documented per package type.
- [ ] The AppImage blocker is either resolved or intentionally deferred with clear guidance.
- [ ] Linux release expectations match the validation evidence actually gathered.
