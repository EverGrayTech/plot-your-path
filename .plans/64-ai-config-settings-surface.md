# Plan: ai-config settings surface

## Overview

Cleanup settings-surface that was previously tangled together with the broader real workflow restoration work:

1. settings-surface migration and cleanup, and
2. alignment with the updated `ai-config` direct-consumption model.

The settings work has already begun in this repo: desirability factor management was migrated out of the Roles page into Settings, but the first pass reused modal-oriented UI that does not match the current app shape. In parallel, AI Configuration still relies on a local wrapper component that duplicated structure and messaging that should now be consumed directly from `ai-config`.

This plan therefore tracks:
- what has already been completed in the Roles → Settings migration,
- what remains to align the Settings UI with the current app structure, and
- how Plot Your Path should now consume `ai-config` directly based on the updated `ai-config` consumption guide.

## Prerequisites

- `.plans/63-ai-config-prune-and-workflow-cutover.md`
- `.plans/62-ai-config-invocation-workflow-cutover.md`

## Goals

1. Preserve the completed migration of desirability factor management from Roles into Settings.
2. Reset the Desirability Factors page to a minimal, stable, ai-config-aligned settings surface skeleton.
3. Diagnose and remove the technical issue causing the Desirability Factors page to stall the browser/runtime.
4. Keep AI Configuration on direct `ai-config` package consumption while using it as the structural reference for Settings UX.
5. Keep this plan scoped to settings-surface work so it does not duplicate the separate real-workflow implementation plan.

## Completed in this phase already

### Roles → Settings migration completed
- Desirability factor management entry was removed from the Roles page.
- Roles page copy was updated to direct users to **Settings → Desirability Factors**.
- The Desirability Factors route was turned into the canonical location for factor management.
- Related Roles and Settings tests were updated to reflect that migration.

### Server/client boundary cleanup completed
- The Desirability Factors route was corrected so the route page remains server-safe.
- Client-only factor-management behavior was moved into a dedicated client component.
- Validation and tests were updated for the server/client split.

These completed items should remain part of the plan history and must not be undone.

## Non-negotiable rule

In the same spirit, no settings surface should rely on misleading modal framing, duplicated wrapper abstractions, or app-owned configuration messaging when the intended product direction is a direct package-owned or inline settings experience.

## Technical Design

### 1. Preserve migration, replace temporary UI shape

Refactor direction:
- Keep Desirability Factors under Settings; do not reintroduce factor settings into Roles.
- Treat the current inline card/button implementation as another intermediate cutover, not the desired end-state.
- Replace it with a minimal dedicated settings surface built for the Settings area.
- Prefer stripping unstable UI down to the bones over preserving a richer but misleading or fragile surface.

### 2. Desirability Factors should mirror ai-config-style categorized settings UX

Refactor direction:
- Route-level page owns the main page heading and page description.
- The settings component should render directly as inline settings content, not as a modal overlay or modal-without-overlay.
- Structure should follow the current `ai-config` settings rhythm as closely as practical:
  - a compact settings header,
  - native `<details>/<summary>` settings sections,
  - scan-friendly summary text,
  - expanded bodies containing controls.
- Each desirability factor becomes an expandable settings section.
- The factor header should expose at least:
  - factor name,
  - factor weight,
  - active/inactive status.
- Collapsed headers should be scan-friendly, similar to `ai-config`’s route/category summaries.
- Expanded content may start intentionally minimal while the surface is stabilized.
- “Add Factor” should be its own expandable section and should be **collapsed by default**.
- Use the least surprising expand/collapse behavior; multiple open sections is acceptable as long as headers expose the key scanning values, especially weight.

### 3. Stabilize the Desirability Factors runtime before rebuilding richer UX

Refactor direction:
- Treat browser-stall or hot-reload lockup behavior as a first-class defect in this phase.
- Eliminate any runaway render/fetch loop before layering on richer UI.
- Prefer stable effect dependencies and explicit reload triggers over render-time function churn.
- If needed, temporarily reduce interactivity so the page remains responsive while the final settings UX is rebuilt.

### 4. AI settings should now adopt direct ai-config consumption

Refactor direction:
- `src/components/settings/AISettingsPanel.tsx` is no longer a desired end-state and should be removed.
- Plot Your Path should consume `ai-config` settings directly from the route using the package’s React surface.
- App-specific setup/configuration-required messaging should be removed from this app and owned by `ai-config`.
- Avoid duplicating page-level headings/descriptions inside local wrapper cards.
- Align app usage with the updated `ai-config` consumption guide and categorized settings UI model.

## Implementation Steps

### 1. Lock in the completed Roles → Settings cutover
- [x] Remove the Desirability Factor Settings action from the Roles page.
- [x] Point Roles users to **Settings → Desirability Factors**.
- [x] Make the Desirability Factors route the canonical factor-management location.
- [x] Update tests to reflect the migration.

### 2. Correct Desirability Factors route structure
- [x] Keep the route page server-safe.
- [x] Move client-only logic into a dedicated client component.
- [x] Validate the server/client boundary fix.

### 3. Reset and stabilize the Desirability Factors settings surface
- [x] Diagnose the browser-stall / red Next.js indicator issue on the Desirability Factors page.
- [x] Remove any render-loop or unstable effect behavior from the Desirability Factors client path.
- [x] Strip the current card/button implementation down to a minimal, stable settings skeleton if needed.
- [x] Rebuild factor sections using native `<details>/<summary>` interactions.
- [x] Show factor weight in the summary/header so users can scan relative weighting without expanding each section.
- [x] Show active/inactive state in the summary/header.
- [x] Render “Add Factor” as its own expandable section, collapsed by default.
- [x] Update tests to cover the reset skeleton and details/summary-based interaction model.

### 4. Adopt direct ai-config settings consumption
- [x] Remove `src/components/settings/AISettingsPanel.tsx`.
- [x] Update the AI settings route to consume `ai-config` directly from the package-provided React surface.
- [x] Remove app-owned setup/configuration-required messaging now owned by `ai-config`.
- [x] Keep route-level page structure minimal: page heading, page description, direct `ai-config` settings UI.
- [x] Update tests to reflect direct package consumption rather than wrapper-panel rendering.

### 5. Validate each cutover stage
- [x] Run repository formatting.
- [x] Run focused tests for settings-surface changes.
- [x] Confirm no cutover reintroduces misleading UI structure or unnecessary local wrapper abstractions.
- [x] Confirm the Desirability Factors page no longer stalls the browser/runtime.

## Affected Areas

- `.plans/64-ai-config-settings-surface.md`
- `src/app/settings/ai/page.tsx`
- `src/app/settings/desirability/page.tsx`
- `src/components/settings/DesirabilityFactorsSettingsClient.tsx`
- related tests under `tests/app/`, `tests/components/settings/`, and `tests/components/`

## Success Criteria

- [x] Desirability factor management is no longer accessed from the Roles page.
- [x] Desirability factor management lives under Settings.
- [x] The Desirability Factors route respects the server/client boundary.
- [x] Desirability Factors no longer stalls the browser/runtime.
- [x] Desirability Factors uses a minimal, stable settings-surface skeleton aligned with AI Configuration.
- [x] Desirability Factors uses native expandable settings sections instead of button/card pseudo-sections.
- [x] Factor weight is visible in section headers for easy scanning.
- [x] Add Factor is presented as a collapsed-by-default inline section.
- [x] Plot Your Path consumes `ai-config` directly for AI settings without `src/components/settings/AISettingsPanel.tsx`.
- [x] App-owned AI setup/configuration messaging has been removed in favor of package-owned `ai-config` messaging.
