# Plot Your Path — Desktop Runtime Foundation

See also: [Development Workflows](./development.md#desktop-runtime-workflows), [System Specification](./system-spec.md#local-first-by-default), [README](../README.md#documentation-map)

## Purpose

This document defines the desktop runtime foundation for Plot Your Path.

It explains how the Tauri shell, exported frontend, and packaged backend work together so future contributors can evolve onboarding, release hardening, backup flows, and troubleshooting without re-deriving the runtime model.

## Packaging decision

The desktop foundation uses **Tauri 2** as the desktop shell.

That choice fits the current architecture because it allows the project to:

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

When troubleshooting startup failures, prefer explicit shell and backend logs over silent retries.
