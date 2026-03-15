# Windows Release Readiness

See also: [Desktop Runtime Foundation](./desktop-runtime.md), [Development Workflows](./development.md#desktop-runtime-workflows)

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

On the Windows machine used for validation, confirm:

1. `pnpm install`
2. `uv sync --extra dev`
3. Rust toolchain with `cargo` on `PATH`
4. the Tauri 2 Windows prerequisites required for packaging

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
