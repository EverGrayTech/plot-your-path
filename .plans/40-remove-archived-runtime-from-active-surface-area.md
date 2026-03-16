# Plan: Remove Archived Runtime From Active Surface Area

## Overview

Remove the remaining active-surface references that make the archived backend/desktop path feel current.

This phase should focus on codepaths, UI, docs, and tooling entry points that still expose the retired architecture as if it were part of the active MVP.

## Prerequisites

- `.plans/39-legacy-dependency-audit-and-cut-line.md`

## Goals

1. Ensure the active app surface reflects only the browser-local MVP path.
2. Remove contributor ambiguity about how to run and develop the app.
3. Leave archived context available only where intentionally preserved.

## Technical Design

### 1. Product and contributor entry points

Refactor direction:
- Remove legacy runtime references from active README, settings, development docs, and default scripts.
- Keep archived references out of the default onboarding path.

### 2. Build and run defaults

Refactor direction:
- Make web-app workflows the only default local development path.
- Archive or relocate legacy commands so they are no longer implied defaults.

### 3. Test and QA surface

Refactor direction:
- Update or remove tests that still validate the retired runtime as an active expectation.

## Implementation Steps

### 1. Clean active docs and scripts
- [ ] Update active docs so browser-local web development is the only default path.
- [ ] Remove or relocate legacy runtime commands from active package/script entry points where appropriate.

### 2. Clean active UI and messaging
- [ ] Remove remaining active-surface wording that implies the desktop/backend path is current.
- [ ] Ensure archived context is clearly labeled and isolated.

### 3. Clean active test expectations
- [ ] Remove or rewrite tests that still assume the retired runtime is an active default.
- [ ] Keep only tests relevant to the active web architecture.

## Affected Areas

- README and development docs
- package scripts and tooling docs
- settings/help/status UI
- frontend and repo-level tests

## Success Criteria

- [ ] A new contributor sees only the browser-local web path as the active architecture.
- [ ] Legacy runtime materials no longer appear in active product or repo surfaces by default.
- [ ] Active tests and scripts align with the intended MVP architecture.
