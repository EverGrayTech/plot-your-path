# Plan: Data Portability and Windows Release Readiness

## Overview

Finish the path from "works on a developer machine" to "safe and understandable for non-technical users." This phase adds the surrounding product and operational capabilities that make a packaged local-first app practical to hand off: first-run guidance, data visibility, backup/export, restore/reset behavior, and a repeatable release checklist.

This is the final shared-product phase because it depends on both a simplified user experience and a stable desktop runtime foundation.

It now also formally absorbs the remaining release-readiness follow-up from Plan 31, but with a narrower execution boundary. The original cross-platform scope was too broad for one implementation pass because native packaging validation is operationally different on each OS and depends on machine access.

This plan therefore covers:

- shared onboarding, trust, and data-portability work that applies across platforms
- shared release checklist and smoke-test design
- native Windows packaging validation and blocker capture, since Windows is the platform available for direct validation right now

This plan does **not** try to fully validate every desktop platform in one pass. Native macOS validation and Linux-specific distribution follow-up move into dedicated follow-on plans so platform blockers can be tracked independently.

Priority framing for the split:

- Windows and macOS matter first for tester handoff
- Windows goes first because it is the platform currently available for native validation
- Linux remains important, but is lower priority and already has a known AppImage-specific blocker that should not hold up shared UX and data-portability work

## Prerequisites

- `.plans/30-core-workflow-usability-simplification.md`
- `.plans/31-desktop-runtime-foundation.md`

## Upstream Design System References

The following design system docs are relevant to onboarding, data control, and feedback surfaces in this plan:

- **Overlays and Feedback States** (`docs/overlays-and-feedback-states.md`) — empty state patterns for first-run surfaces, toast notifications for data operations, modal confirmation dialogs for destructive actions (backup, reset, delete), structured message anatomy for recovery guidance, and the inline-vs-modal decision framework.
- **Application Shell and Navigation** (`docs/application-shell-and-navigation.md`) — the lightweight secondary shell pattern (top bar only, centered content, back-navigation) is suitable for onboarding flows, settings, and single-purpose data management surfaces.
- **Forms and Action Controls** (`docs/forms-and-action-controls.md`) — destructive action variant (error-outlined, then filled-destructive for confirmation) for reset/delete flows. Form patterns for any data import or configuration surfaces.
- **Status, Priority, and Decision Signals** (`docs/status-priority-and-decision-signals.md`) — informational badges for data status (e.g., "Last backup: Mar 12") and subtle state indicators for local data health.

## Goals

1. Make first-run use understandable for non-technical users.
2. Give users explicit control over their local data.
3. Provide safe backup, export, restore, and reset paths.
4. Improve release readiness with packaging, smoke-test, and handoff checklists.
5. Validate the Windows tester handoff flow on a native machine.
6. Reduce support burden by making failure states and recovery paths clearer.

## Technical Design

### 1. First-Run and Empty-State Guidance

Observed issues:
- Even with desktop packaging, a first-time user may not understand what to do first.

Refactor direction:
- Add a lightweight first-run orientation path. Consider using the lightweight secondary shell pattern (top bar only, centered content) for any initial setup or welcome flow — per app shell guidance Section 5.3.
- Use the upstream empty state pattern for first-run surfaces: centered factual message (`--typography-size-base`, `--typography-weight-medium`), optional supporting message (`--typography-size-sm`, `--color-text-secondary`), and a clear action button directing the user toward the first meaningful action — per overlays guidance Section 2.1 and data-dense guidance Section 5.6.
- Keep the tone aligned with the product's assistive, calm positioning. Follow the upstream message tone rules: plain, direct, no exclamation marks, no casual or celebratory language — per overlays guidance Section 4.3.

### 2. Local Data Transparency

Refactor direction:
- Make it clear that data is stored locally.
- Provide understandable access to where data lives and what kinds of records are stored.
- Consider a data-status section within a settings or data-management surface using the grouped metadata block pattern (keys in `--color-text-secondary`, values in `--color-text-primary`) for data location, record counts, and last-backup timestamp — per data-dense guidance Section 1.1.
- Use neutral text badges or informational indicators for data health status (e.g., "Last export: Mar 12") — per status signals guidance Section 1.1.
- Avoid exposing raw technical detail unless the user chooses to inspect it.

### 3. Backup, Export, Restore, and Reset

Refactor direction:
- Define a supported backup/export format for the local workspace.
- Add restore/import behavior where appropriate.
- Provide a reset path for users who want to start fresh without manually deleting files.
- Use modal confirmation dialogs for destructive actions (reset, delete all data). The confirmation should use the `destructive-filled` button variant (`--color-semantic-error-foreground` background, `--color-text-inverse` text) for the final confirm action, with a `tertiary` cancel — per forms guidance Section 2.1 and overlays guidance Section 1.1.
- Use toast notifications for successful data operations ("Backup created", "Data exported") that auto-dismiss after 4–5 seconds — per overlays guidance Section 1.1.
- For import/restore flows, use inline progress feedback (progress bar with `--color-accent-solid-muted` fill) and structured error messaging if the import fails (title + description + recovery guidance) — per overlays guidance Sections 2.3 and 4.

### 4. Release and Support Readiness

Refactor direction:
- Define a release checklist for packaging, smoke testing, and versioned handoff.
- Document the user installation and update experience.
- Capture the minimum troubleshooting information needed when a user reports an issue.

Observed packaging follow-up from Plan 31:
- Linux desktop builds now compile and bundle successfully for `.deb` and `.rpm` outputs.
- Linux AppImage packaging still fails with a `linuxdeploy` blocker and needs explicit follow-up rather than being treated as a generic runtime failure.
- macOS and Windows packaging flows have not yet been validated on native build machines.
- Tauri packaging now depends on explicit desktop icon assets, correct shell startup typing, direct Node-based CLI resolution, and generated-file exclusions in repository linting.

Additional release-hardening direction:
- Treat release readiness as an artifact matrix, not a single pass/fail check. Validate each supported platform and installer format independently.
- Use this plan to define the shared matrix and complete the Windows row first.
- Defer native macOS validation to a dedicated follow-up plan because it requires access to a native macOS machine.
- Defer Linux distribution validation and the AppImage `linuxdeploy` blocker to a dedicated follow-up plan because Linux is lower priority and already has a known packaging-specific issue.
- Add smoke-test expectations for each packaged artifact, including backend launch, healthcheck availability, local data-root creation, and clean first-run behavior.
- Record platform-specific prerequisites and blockers explicitly so future release attempts do not repeat known failures.

### 5. Platform sequencing and scope control

Refactor direction:
- Keep shared product behavior together when the implementation should remain consistent across platforms.
- Split native packaging validation where OS-specific prerequisites, installer behavior, signing rules, or distribution blockers materially change the work.
- Avoid making shared UX and data-safety improvements wait on lower-confidence packaging work for platforms that are not currently testable.
- Capture deferred platforms in dedicated plans rather than leaving them implied inside a single broad checklist.

### 6. Quality and Trust Signals

Refactor direction:
- Make failure states, offline limitations, and local-environment dependencies easier to understand.
- Use the upstream error page pattern for catastrophic desktop failures (backend launch failure, data corruption): centered icon (`--color-semantic-error-foreground`), title, description, and recovery action — per overlays guidance Section 2.6.
- Use warning banners for non-blocking issues (e.g., "AI features unavailable — no API key configured") — per overlays guidance Section 2.5.
- Ensure the product communicates what it can and cannot do in a packaged user context. Follow the upstream prominence spectrum: match feedback prominence to severity — per overlays guidance Section 3.1.

## Implementation Steps

### 1. Improve first-run guidance
- [x] Add lightweight onboarding or guided empty-state support for first-time users using the upstream empty state and secondary shell patterns.
- [x] Ensure the first meaningful action is obvious.

### 2. Add data control surfaces
- [x] Expose local-data visibility in a user-appropriate way using grouped metadata blocks.
- [x] Add backup/export and reset capabilities with appropriate confirmation and feedback patterns.

### 3. Define recovery paths
- [x] Add restore or import behavior where it improves user safety with progress and error feedback.
- [x] Make destructive or irreversible actions explicit using modal confirmation with destructive-filled button variants.

### 4. Prepare release workflows
- [x] Document packaging, smoke testing, and handoff procedures.
- [x] Define the minimum release checklist for future user drops.
- [x] Define a platform-by-platform smoke-test matrix covering backend startup, frontend connectivity, healthcheck response, local data-root creation, and first-run clarity.
- [x] Record explicit deferred-status notes and prerequisites for macOS and Linux follow-up validation.

### 5. Validate Windows packaging and handoff
- [ ] Validate Windows packaging on a native Windows machine and record installer, runtime, or signing blockers.
- [ ] Run through the packaged Windows first-run flow from a non-technical perspective.
- [ ] Close the largest Windows tester-handoff gaps in clarity, recovery, and trust before distribution.

## Follow-on Plans

- **Plan 33 — macOS Dektop Release**: native macOS packaging validation, runtime verification, installer expectations, and signing/notarization blocker tracking.
- **Plan XX — Linux Release**: `.deb` / `.rpm` distribution validation, AppImage `linuxdeploy` follow-up, and Linux-specific installer/runtime guidance.

## Affected Areas

- desktop-facing frontend surfaces for onboarding and settings
- local data handling and export/reset flows
- release documentation and user handoff materials
- packaging and smoke-test workflows
- Windows-specific desktop artifact validation and blocker tracking
- deferred macOS and Linux release-plan sequencing

## Success Criteria

- [x] A non-technical user can understand how to start using the app.
- [x] Local data ownership and storage are communicated clearly.
- [x] Backup/export and reset workflows exist and are understandable.
- [x] Destructive data actions use modal confirmation with the upstream destructive-filled pattern.
- [x] Feedback states for data operations (success, error, progress) follow the upstream patterns.
- [x] Release handoff is supported by a repeatable checklist.
- [x] The supported packaging matrix is documented by platform and artifact type, including explicit pass/fail/blocker/deferred notes.
- [ ] Windows packaging has native validation notes sufficient for a tester drop.
- [x] macOS and Linux follow-up work is moved into explicit plans with clear prerequisites and blocker framing.
- [ ] The packaged app feels safe enough to share outside the development context on the validated Windows path.
