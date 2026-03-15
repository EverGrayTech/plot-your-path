# Plot Your Path — Development Workflows

See also: [README](../README.md), [Product Overview](./product-overview.md#in-scope), [System Specification](./system-spec.md#roadmap-framing)

## Purpose

This document covers the practical workflows for running and testing the project locally.

For product intent and architectural direction, start with [Product Overview → In scope](./product-overview.md#in-scope) and [System Specification → Roadmap framing](./system-spec.md#roadmap-framing).

## Run the app locally

These steps assume development from the repository root.

### 1. Install dependencies

```bash
# Python / backend
uv sync

# Node / frontend
pnpm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

The default local URLs are:

- backend API: `http://localhost:8000`
- frontend app: `http://localhost:3000`

### 3. Start the backend

```bash
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start the frontend

```bash
pnpm dev src/frontend --hostname 0.0.0.0 --port 3000
```

The frontend lives in `src/frontend`, so the app directory must be passed when running from the repository root.

### 5. Open the app

Open:

- `http://localhost:3000`

If localhost forwarding is unavailable in your environment, determine the machine IP and open the app with that address instead.

```bash
hostname -I
```

## Run tests

This project includes backend and frontend tests.

### Backend tests

Install dev dependencies if needed:

```bash
uv sync --extra dev
```

Run all backend tests:

```bash
uv run pytest tests/backend
```

Run backend tests with coverage:

```bash
uv run pytest --cov=src/backend --cov-report=term-missing --cov-report=html tests/backend
```

### Frontend tests

Run all frontend tests:

```bash
pnpm test
```

Run frontend tests with coverage:

```bash
pnpm test:coverage
```

Run a single frontend test file:

```bash
pnpm vitest run tests/frontend/app/jobs.page.test.tsx
```

## Desktop runtime workflows

The desktop runtime packages the existing frontend and backend into a local Tauri shell.

### Prerequisites

```bash
uv sync --extra dev
pnpm install
```

You also need a Rust toolchain with `cargo` available on your `PATH` for Tauri development and release builds.

On Linux, desktop backend packaging also requires:

- `objdump`, which is typically provided by the `binutils` package
- a system C toolchain with `cc` available on `PATH` such as `gcc`, `clang`, or the Debian/Ubuntu `build-essential` package set

### Run the desktop app in development mode

```bash
pnpm desktop:dev
```

This starts the desktop-oriented backend runtime, starts the frontend dev server on `127.0.0.1:3000`, and launches the Tauri shell.

### Prepare packaged desktop assets

```bash
pnpm desktop:prepare
```

This builds:

- a packaged backend binary with PyInstaller
- a static frontend export for the desktop shell

If this step fails on Linux with an `objdump` error, install `binutils` first.

If this step fails on Linux with a `cc` or linker error, install a system C toolchain first.

If Linux release builds produce `.deb` and `.rpm` bundles but fail during the AppImage stage with a `linuxdeploy` error, treat that as a separate packaging blocker rather than a frontend/backend runtime failure.

### Build the desktop application

```bash
pnpm desktop:build
```

For runtime architecture details, data-root behavior, and packaging constraints, see [Desktop Runtime Foundation](./desktop-runtime.md).

For the Windows tester-handoff checklist and smoke-test matrix, see [Windows Release Readiness](./windows-release-readiness.md).

## Design system consumption

The frontend uses the `@evergraytech/design-system` npm package as the source of truth for foundational visual values. The upstream consumption guide defines the full rules; here is a quick reference:

### What must come from the design system

Colors, typography, spacing, radii, motion, semantic states, and accent values. These are consumed via CSS custom properties imported from `@evergraytech/design-system/dist/variables.css` in `src/frontend/app/globals.css`.

### What remains local

Layout composition, component-internal dimensions, app-specific breakpoints, content-driven spacing adjustments, and z-index layering.

### Exception handling

If a value does not exist in the token set: check if an existing token fits, request upstream if not, and document a temporary local override with a `/* TODO: upstream to design system */` comment.

### Update flow

Bump `@evergraytech/design-system` version in `package.json`, review changelog, rebuild.

## Documentation use during development

When making non-trivial changes:

1. use the [Product Overview](./product-overview.md) to check product intent and scope
2. use the [Concept Model](./concept-model.md) to keep terminology consistent
3. use the [System Specification](./system-spec.md) to preserve architectural guardrails

If implementation direction starts to drift from these docs, resolve it deliberately rather than letting the project evolve by accident.
