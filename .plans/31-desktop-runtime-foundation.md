# Plan: Desktop Runtime Foundation

## Overview

Make Plot Your Path easy for non-technical users to run locally by packaging it as a local-first desktop application. The default direction is to use Tauri so the app can ship as a lightweight desktop shell around the existing frontend and backend, while keeping data on the user’s machine.

This phase is about runtime architecture and packaging foundations, not final onboarding polish.

## Prerequisites

- `.plans/28-design-system-foundation.md`
- `.plans/29-app-shell-and-navigation-refresh.md`

## Upstream Design System Context

While the desktop runtime plan is primarily about packaging and process architecture, it benefits from the design system foundation in two ways:

- **Shell stability**: The application shell structure is now defined by the upstream design system guidance (`docs/application-shell-and-navigation.md`), meaning the windowed shell dimensions, chrome regions, and responsive behavior have a predictable structure. The primary workspace shell pattern (top bar + side nav + workspace container) provides a known layout to package.
- **Lightweight secondary shell**: The design system defines a simpler shell pattern (top bar only, no side nav, centered content) that can support lightweight desktop-specific surfaces like first-run setup or configuration, if needed before Plan 32 is implemented.

No additional design system adoption work is required for this plan beyond what Plans 28 and 29 already establish.

## Goals

1. Validate and establish the desktop packaging approach for the app.
2. Package the frontend and backend into a user-friendly local runtime.
3. Preserve local-first data handling with predictable on-device storage.
4. Simplify local startup so non-technical users do not need to run separate services manually.
5. Keep the runtime architecture transparent and maintainable for future releases.

## Technical Design

### 1. Desktop Packaging Direction

Observed issues:
- The current development flow expects a user to run backend and frontend processes separately.
- That workflow is too fragile and technical for casual users.

Refactor direction:
- Use Tauri as the preferred packaging path unless the validation work reveals a blocker.
- Document the final decision clearly if an alternative desktop wrapper is chosen instead.

### 2. Process Model and Startup Orchestration

Refactor direction:
- Define how the desktop shell launches and supervises the backend.
- Ensure the frontend can reliably communicate with the packaged backend without developer-only assumptions.
- Avoid making users reason about ports, terminals, or environment setup during normal use.

### 3. Local Data Path Strategy

Observed issues:
- The app is already local-first, but packaged user usage needs a clearer, more stable data-root story.

Refactor direction:
- Define the packaged app’s default data location.
- Ensure database and file-backed artifacts live under an app-owned local directory.
- Keep data handling transparent enough that export, backup, and reset flows can be added cleanly later.

### 4. Development and Build Workflows

Refactor direction:
- Add a repeatable local developer workflow for running the desktop app.
- Define how production builds package frontend assets, backend runtime requirements, and app metadata.
- Keep the packaging workflow compatible with the repository’s existing pnpm and uv tooling expectations.

### 5. Error Visibility and Recoverability

Refactor direction:
- Ensure startup failures, backend launch problems, and environment mismatches are visible in a way that supports user troubleshooting.
- Prefer explicit failure handling over silent launch failures.

## Implementation Steps

### 1. Validate the desktop approach
- [ ] Confirm Tauri is suitable for packaging the current Next.js and FastAPI architecture.
- [ ] Document the chosen runtime model and its constraints.

### 2. Establish packaged runtime behavior
- [ ] Implement frontend and backend startup orchestration for desktop use.
- [ ] Ensure local API communication works cleanly in packaged and development desktop flows.

### 3. Define local storage behavior
- [ ] Set and document the packaged app data-root strategy.
- [ ] Ensure packaged runtime paths behave predictably across supported environments.

### 4. Add build and packaging workflows
- [ ] Introduce the required desktop build configuration and scripts.
- [ ] Verify local developer and release build workflows are repeatable.

### 5. Test and document the foundation
- [ ] Add validation for the packaged startup path where practical.
- [ ] Document how the desktop runtime works for future contributors.

## Affected Areas

- frontend app shell and runtime configuration
- backend startup/configuration surfaces
- repository build and packaging configuration
- new desktop-runtime files and metadata
- local developer documentation and future release docs

## Success Criteria

- [ ] A non-technical user no longer needs to run separate frontend and backend processes manually.
- [ ] The packaged app preserves the project’s local-first data model.
- [ ] Backend startup and frontend connectivity are reliable in desktop mode.
- [ ] The repository has a documented and repeatable desktop build path.
- [ ] The packaging foundation is strong enough for user onboarding and release hardening work.
