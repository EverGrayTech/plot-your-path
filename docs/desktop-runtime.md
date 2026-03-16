# Plot Your Path — Desktop Runtime Foundation (Archived Direction)

See also: [Development Workflows](./development.md#desktop-runtime-workflows), [Windows Release Readiness](./windows-release-readiness.md), [System Specification](./system-spec.md#local-first-by-default), [README](../README.md#documentation-map)

## Purpose

This document records the earlier desktop runtime foundation for Plot Your Path.

It explains how the Tauri shell, exported frontend, and packaged backend were intended to work together during the previous desktop-packaging phase.

This is now archived architectural context rather than the preferred MVP direction. The active MVP direction is a browser-hosted local-first web application with a TypeScript-centered architecture and browser-local persistence.

## Packaging decision

At the time this document was written, the desktop foundation used **Tauri 2** as the desktop shell.

That choice fit the architecture at that time because it allowed the project to:

- keep the existing React and Next.js frontend
- keep the FastAPI backend as a local HTTP service
- package both into a single local application experience
- preserve a local-first data model with predictable file ownership

## Runtime model

The packaged app uses a split runtime inside one desktop experience.

### Frontend

- the frontend is built as a static export for desktop packaging
- Tauri loads the exported frontend assets from the packaged application bundle
- desktop builds point the frontend at the packaged backend on `http://127.0.0.1:8765`

### Backend

- the backend is packaged as a standalone binary with PyInstaller
- the Tauri shell launches that backend automatically on app startup
- the backend exposes a local HTTP API and a lightweight `/api/health` endpoint for startup verification and troubleshooting

### Why the backend remains HTTP-based

Keeping the backend as an explicit local HTTP service preserves the existing boundary between UI and application logic. That keeps the runtime architecture transparent, reduces application-specific coupling inside the desktop shell, and lets future contributors validate the same backend behavior in browser-based and packaged flows.

## Local data strategy

Packaged desktop builds use an app-owned local data root by default.

### Default data roots

- Linux: `$XDG_DATA_HOME/plot-your-path` or `~/.local/share/plot-your-path`
- macOS: `~/Library/Application Support/Plot Your Path`
- Windows: `%LOCALAPPDATA%\Plot Your Path`

### What lives there

- the SQLite database
- captured job files
- generated local artifacts that already rely on the backend file-storage helpers

This keeps user data outside the application bundle and separate from the repository checkout.

## Development workflows

### Desktop development

Use:

```bash
pnpm desktop:dev
```

That workflow:

1. starts the backend in desktop mode with `PYP_DESKTOP_RUNTIME=true`
2. starts the frontend dev server on `http://127.0.0.1:3000`
3. opens the Tauri shell against that dev server

### Desktop build preparation

Use:

```bash
pnpm desktop:prepare
```

That workflow:

1. packages the backend binary with PyInstaller
2. copies the backend binary into `src-tauri/resources`
3. builds a static frontend export into `dist-desktop`

### Desktop release builds

Use:

```bash
pnpm desktop:build
```

This runs the Tauri production build after the desktop assets and backend binary are prepared.

## Tooling prerequisites

Desktop packaging adds a few contributor requirements beyond the browser-only workflow.

- `pnpm install`
- `uv sync --extra dev`
- Rust toolchain with `cargo` available on `PATH`
- platform-specific Tauri system dependencies as required by Tauri 2
- on Linux, `objdump` available via the `binutils` package for PyInstaller analysis
- on Linux, a system C toolchain with `cc` available on `PATH` for Rust/Tauri linking

## Current constraints

This phase establishes packaging and runtime behavior, but it does **not** yet provide:

- first-run onboarding
- backup/export/reset UI
- signed installers or release notarization
- desktop-specific crash reporting
- richer startup diagnostics surfaced directly in the UI

Those remain follow-on hardening work.

## Troubleshooting notes

If a desktop build fails to start correctly, check these first:

1. the packaged backend binary exists under `src-tauri/resources`
2. the backend healthcheck responds at `http://127.0.0.1:8765/api/health`
3. desktop mode is using the expected local data root
4. Rust and Tauri prerequisites are installed on the build machine
5. on Linux, the `binutils` package is installed so `objdump` is available
6. on Linux, a system C toolchain is installed so `cc` is available for Rust linking

When troubleshooting startup failures, prefer explicit shell and backend logs over silent retries.

## Deferred follow-up validation status

The desktop foundation follow-up validation produced these outcomes:

- repository formatting and linting completed successfully
- backend automated tests passed (`223 passed`)
- frontend automated tests passed (`10` test files, `37` tests)
- backend coverage for the current suite is still `81%`, so broader backend coverage improvement remains separate follow-up work
- backend tests emitted `ResourceWarning` notices about unclosed SQLite connections during fit-analysis API coverage; those warnings should be addressed in a later hardening pass

### Linux validation findings

- `pnpm desktop:prepare` completed successfully on Linux and produced both the packaged backend binary at `src-tauri/resources/plot-your-path-backend` and the static frontend export in `dist-desktop`
- the desktop runner now resolves the Tauri CLI entrypoint directly through Node so desktop workflows do not depend on a platform-created `node_modules/.bin/tauri` shim being executable
- Linux release validation also uncovered and resolved two Tauri build issues: the desktop shell now returns the setup callback with the correct Rust result type, and the repository now includes explicit desktop icon assets plus bundle icon configuration
- `pnpm desktop:build` now completes the backend packaging step, frontend export step, Rust desktop binary compilation step, and Linux `.deb` / `.rpm` bundling step on this machine
- Linux AppImage bundling still fails in this environment with Tauri reporting `failed to run linuxdeploy`, so AppImage packaging remains an open Linux-specific release blocker even though other Linux bundle artifacts are produced successfully
- `objdump` remains a Linux prerequisite for packaged desktop builds because PyInstaller analysis depends on the `binutils` package

### Remaining follow-up scope

- diagnose or work around the remaining Linux AppImage `linuxdeploy` bundling failure
- release packaging still needs validation on macOS and Windows
- richer startup diagnostics and first-run onboarding guidance remain intentionally deferred to Plan 32
