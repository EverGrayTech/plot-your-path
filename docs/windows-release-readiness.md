# Windows Release Readiness

See also: [Desktop Runtime Foundation](./desktop-runtime.md), [Development Workflows](./development.md#legacy-desktop-runtime-workflows)

> Archived direction note: this document reflects the earlier Windows desktop packaging path and is no longer the preferred MVP direction.

## Purpose

This document defines the Windows-focused release and tester-handoff checklist for Plot Your Path.

It is intentionally narrower than the broader desktop runtime documentation. Its goal is to make Windows packaging, smoke testing, and issue reporting repeatable without pretending that native macOS or Linux validation has already happened.

## Scope

This checklist covers:

- packaged desktop preparation and build commands
- Windows installer/runtime smoke-test expectations
- minimum information to capture when a Windows tester reports a problem
- explicit deferred status for macOS and Linux follow-up

## Platform matrix

| Platform | Priority | Status | Notes |
| --- | --- | --- | --- |
| Windows | current | primary tester-handoff path | validate installer, first run, backend startup, data-root creation, backup/export, restore, and reset |
| macOS | near-term | deferred to Plan 33 | requires a native macOS machine plus signing/notarization review |
| Linux | later | deferred / unscheduled follow-up | `.deb` and `.rpm` builds exist, but AppImage still has a `linuxdeploy` blocker |

## Build prerequisites

A native Windows machine is required to build Windows desktop artifacts.  
WSL may be used for development, but Windows installers must be built from a native Windows environment.

### 1. Install Node.js

Install the Node LTS runtime using `winget`:

```powershell
winget install OpenJS.NodeJS.LTS

node -v
npm -v
```

### 2. Install PNPM

Install `pnpm` globally:

```powershell
npm install -g pnpm

pnpm -v
```

### 3. Install Rust toolchain

Install Rust via `rustup`:

```powershell
winget install Rustlang.Rustup

cargo -V
rustc -V
```

### 4. Install Microsoft C++ build tools

Install the Visual Studio build tools required for Tauri:

```powershell
winget install Microsoft.VisualStudio.2022.BuildTools
```

During installation select the workload: `Desktop development with C++`

This installs the MSVC toolchain required to compile the Tauri desktop runtime.

### 5. Set up Development Environment
The development environment is set up using [Development Workflows](./development.md#set-up-development-environment)

## Build commands

Run from the repository root:

```bash
pnpm desktop:prepare
pnpm desktop:build
```

Capture:

- whether backend packaging completed
- whether the Tauri Windows bundle completed
- what artifact(s) were produced
- any signing, installer, or antivirus friction

## Delivery mechanism

Tester and pre-release desktop builds are distributed through **GitHub Releases** for this repository.

### Current distribution channel

Use GitHub Releases as the canonical source for downloadable Windows build artifacts during validation. This keeps each tester build tied to a specific version, release note, and artifact set.

### Release contents

Each release should include:

- the packaged Windows installer (ie `PlotYourPath_<version>_x64-setup.exe`) produced by `pnpm desktop:build`
- the exact version/tag used for the build
- short release notes describing what changed
- any known issues or tester caveats
- basic install/run notes if the build is intended for non-technical testers

### Release workflow

For each candidate tester build:

1. build the desktop artifacts locally
2. complete the Windows smoke test
3. create or update the corresponding GitHub Release
4. upload the tested artifact(s)
5. verify the uploaded asset names are clear and versioned consistently
6. share the GitHub Release URL with testers

### Naming guidance

Use consistent company and product naming across artifacts, release titles, and release notes.

Recommended conventions:

- company name: **EverGray Tech**
- product name: **Plot Your Path**
- repository/release asset names: use stable, machine-friendly naming
- user-facing release titles: use clear product-version naming such as **Plot Your Path v0.1.0**

Artifact names should be predictable, versioned, and easy for a non-technical tester to identify.

### Delivery validation

Before sharing a release, confirm:

- the GitHub Release exists for the intended version
- the correct artifact(s) are attached
- the artifact names match the tested build
- the release notes identify the build clearly
- the shared download link points to the GitHub Release, not a local or temporary file path

## Windows smoke-test matrix

Use this matrix for each candidate tester build.

| Check | Expected result | Notes to record |
| --- | --- | --- |
| Installer / packaged app launch | app opens without requiring terminal work | note artifact type and any SmartScreen or permission prompts |
| Backend startup | packaged backend launches automatically | if it fails, capture app logs and any visible error state |
| Frontend connectivity | app UI loads data without API connection errors | verify the desktop shell reaches the local backend |
| Healthcheck | `http://127.0.0.1:8765/api/health` responds while app is open | record payload if troubleshooting is needed |
| Local data-root creation | `%LOCALAPPDATA%\Plot Your Path` is created | confirm database file and workspace folders appear |
| First-run clarity | a first-time user can find the first meaningful action | confirm Jobs empty state and home guidance are understandable |
| Backup export | backup downloads successfully | note filename and whether the file opens as a zip archive |
| Backup restore | importing a valid backup restores roles and related data | verify restore messaging and resulting counts |
| Reset workflow | reset requires confirmation and returns to a blank workspace | confirm destructive confirmation and post-reset state |

## Minimum tester-handoff checklist

Before sharing a Windows build, confirm:

- packaged app launches on a native Windows machine
- first-run guidance is understandable without developer help
- local data location is visible in Settings
- backup export works
- restore works from a known-good backup file
- reset works and recreates an empty workspace
- any remaining blocker is written down with reproduction notes

## Troubleshooting notes to collect

When a tester reports a Windows issue, capture at minimum:

1. app version or build label
2. installer or artifact type used
3. exact point of failure: install, launch, first run, backup, restore, reset
4. whether `%LOCALAPPDATA%\Plot Your Path` exists and what files appeared there
5. whether `http://127.0.0.1:8765/api/health` responds while the app is open
6. screenshots or copied text of any visible error state

## Deferred follow-up

- macOS validation remains in Plan 33 because it needs a native macOS machine and platform-specific release policy review
- Linux validation remains deferred because tester priority is lower and the AppImage `linuxdeploy` blocker is still unresolved
