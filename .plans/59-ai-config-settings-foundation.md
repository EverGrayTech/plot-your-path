# Plan: ai-config settings foundation

## Overview

Establish `@evergraytech/ai-config` as Plot Your Path's source of truth for AI configuration by integrating the shared React settings experience into the Settings page and defining the app's category-aware configuration contract. This phase should introduce the package cleanly within the app's browser-hosted, local-first, static-export-compatible architecture without yet removing all downstream prototype generation code.

## Prerequisites

- `.plans/53-github-pages-static-deployment.md`
- `.plans/58-metadata-driven-app-library-preparation.md`

## Goals

1. Add `@evergraytech/ai-config` to the app in a way that remains compatible with client-rendered Next.js usage and GitHub Pages static export.
2. Define a Plot Your Path `AIConfigAppDefinition` that uses operation categories aligned with the current workflow families.
3. Replace the placeholder AI settings section on the Settings page with the shared `AIConfigPanel` experience.
4. Preserve Plot Your Path trust-model and local-credential messaging around the packaged settings UI.
5. Establish a small app-local integration boundary so ai-config setup details do not spread throughout the codebase.

## Technical Design

### 1. Define the app-owned ai-config contract

Refactor direction:
- Create a dedicated local integration module for Plot Your Path's ai-config setup.
- Define `defaultMode`, BYOK provider support, and `operationCategories` there.
- Treat hosted default execution and BYOK execution as gateway-mediated through the package rather than host-owned direct provider routing.
- Keep category keys aligned with the existing workflow families:
  - `role_parsing`
  - `fit_analysis`
  - `desirability_scoring`
  - `application_generation`
- Avoid scattering package-specific config definitions across unrelated feature files.
- Consider whether advisory model discovery should be enabled for supported providers so the shared settings UI can surface fresher model lists without changing execution behavior.

### 2. Use the shared React settings surface on the Settings page

Refactor direction:
- Render `AIConfigProvider` and `AIConfigPanel` from a client-owned Settings-page integration.
- Keep host-owned headings and trust-model copy around the panel.
- Treat the package panel as the complete supported settings UI rather than rebuilding provider, model, credential, or generation controls locally.

### 3. Preserve deployment and runtime constraints

Refactor direction:
- Keep ai-config usage client-rendered only.
- Do not depend on persisted AI settings during server render or static generation.
- Ensure the integration remains safe for the repository's static export flow.
- Keep the app's package integration aligned with ai-config's gateway-mediated invocation posture so Settings-page setup does not imply direct browser-side provider orchestration owned by this repo.

## Implementation Steps

### 1. Add the plan and define the ai-config integration boundary
- [ ] Add an app-local ai-config integration module that owns Plot Your Path's package setup.
- [ ] Define the initial `AIConfigAppDefinition` for this app, including aligned operation categories.
- [ ] Decide whether provider-aware advisory model discovery should be enabled for any supported providers in the initial integration phase.

### 2. Add package consumption to the frontend
- [ ] Add `@evergraytech/ai-config` to the repo dependencies.
- [ ] Import the package base stylesheet through the appropriate client-rendered app boundary.
- [ ] Ensure the new dependency posture remains consistent with current frontend architecture and static export constraints.
- [ ] Ensure the initial integration assumptions match ai-config's current gateway-mediated hosted and BYOK execution posture.

### 3. Replace the Settings-page placeholder AI section
- [ ] Add a client-owned Settings-page integration component for ai-config.
- [ ] Render `AIConfigProvider` and `AIConfigPanel` on the Settings page.
- [ ] Preserve local-first trust-model and credential-storage copy around the packaged panel.
- [ ] Remove obsolete placeholder-only Settings-page AI configuration text once the shared panel is in place.
- [ ] Avoid reimplementing piecemeal settings controls locally when the packaged panel already provides the validated UI/UX.

### 4. Validate baseline integration behavior
- [ ] Add or update tests covering Settings-page ai-config rendering.
- [ ] Validate that the Settings page still renders correctly in the app's current browser-hosted model.
- [ ] Run repository formatting.
- [ ] Run focused tests for the Settings page and surrounding shell behavior.

## Affected Areas

- `.plans/59-ai-config-settings-foundation.md`
- `package.json`
- ai-config integration module(s) under `src/`
- `src/app/settings/page.tsx`
- related Settings-page tests

## Success Criteria

- [ ] Plot Your Path defines a single app-local ai-config integration boundary.
- [ ] The Settings page uses `@evergraytech/ai-config/react` for AI configuration.
- [ ] Plot Your Path uses the packaged `AIConfigPanel` as the supported settings UI rather than rebuilding equivalent controls locally.
- [ ] Operation categories are defined with keys aligned to current workflow families.
- [ ] Trust-model and browser-local credential messaging remain present around the packaged UI.
- [ ] The initial plan assumptions match ai-config's current gateway-mediated execution model.
- [ ] The integration remains client-rendered and static-export-safe.
- [ ] Relevant tests and formatting checks pass.
