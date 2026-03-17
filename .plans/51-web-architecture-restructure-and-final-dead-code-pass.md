# Plan: Web Architecture Restructure and Final Dead Code Pass

## Overview

Finish the transition by restructuring the repository around the active web application and performing a final dead-code and naming cleanup pass.

This phase should happen after legacy removal so the remaining structure reflects what the product actually is.

## Prerequisites

- `.plans/50-remove-dead-python-and-tauri-codepaths.md`

## Goals

1. Make the repository structure feel native to the web app architecture.
2. Remove transitional naming, abstractions, and compatibility scaffolding that no longer make sense.
3. End with a clean, coherent, maintainable project layout.

## Technical Design

### 1. Repository structure

Refactor direction:
- Reorganize directories, scripts, and docs around the active web product.
- Prefer obvious structure over compatibility with retired layouts.

### 2. Transitional abstraction cleanup

Refactor direction:
- Rename or simplify modules whose shape still reflects the backend/desktop transition.
- Remove unused abstractions left behind after legacy deletion.

### 3. Final dead-code verification

Refactor direction:
- Run a final pass for unreachable code, stale types, obsolete API contracts, and unused utilities.
- If some areas remain too uncertain, convert them into narrow investigation tasks rather than preserving vague baggage.

## Implementation Steps

### 1. Restructure around the active web app
- [x] Reorganize project structure so the active web architecture is obvious.
- [x] Align docs, scripts, and naming with the final web-local product shape.

### 2. Remove transitional abstractions
- [x] Simplify modules, types, and utilities that only existed to bridge old and new architectures.
- [x] Remove stale compatibility layers and obsolete API-era naming where appropriate.

### 3. Final cleanup pass
- [x] Run a final dead-code audit across the remaining codebase.
- [x] Resolve confirmed dead code and record any remaining narrow investigations explicitly.

## Affected Areas

- frontend source structure
- shared types/utilities
- docs and script organization
- remaining transition-era naming

## Success Criteria
- [x] The repository is clearly organized around the web app as the sole active product.
- [x] Confirmed dead code and transitional scaffolding are removed.
- [x] Any remaining uncertainties are small, explicit, and intentionally tracked.
