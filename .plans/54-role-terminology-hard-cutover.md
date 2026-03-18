# Plan: Role Terminology Hard Cutover

## Overview

Replace `job` terminology across the active product with `role` terminology so the product consistently reflects its intended positioning.

This phase is a hard, backward-incompatible cutover. It updates the user experience, shared domain language, source code naming, routes, storage identifiers, and test coverage to treat `role` as the primary concept throughout the browser-local MVP.

## Prerequisites

- `.plans/52-repo-cleanup-and-testing-remediation.md`

## Goals

1. Make the product’s user-facing language consistently describe opportunities as roles rather than jobs.
2. Rename source-level types, modules, services, hooks, routes, and state so the codebase reflects the same domain language.
3. Replace browser-local storage, config, and identifier names that still encode `job` terminology.
4. Leave the repository in a coherent, fully tested state with no active `job` terminology remaining except where intentionally retained as external/reference language.

## Technical Design

### 1. Documentation and UX terminology alignment

Refactor direction:

- Update product docs, README, navigation, page copy, component copy, modal labels, and helper text to use `role` terminology.
- Prefer phrasing that sounds intentional and user-respectful rather than mechanically replacing words.

### 2. Source naming and module-boundary alignment

Refactor direction:

- Rename types, functions, hooks, components, files, directories, and routes that currently encode `job` or `jobs`.
- Align service boundaries and state names with the new `role` terminology so product language and implementation language match.

### 3. Browser-local persistence and config cutover

Refactor direction:

- Rename browser-local store names, exported/imported field names, counters, IDs, and AI operation-family identifiers that still use `job` terminology.
- Make the cutover directly without compatibility aliases or fallback reads.

### 4. Testing and verification alignment

Refactor direction:

- Update tests, fixtures, mocks, and assertions to reflect renamed modules, routes, services, and copy.
- Use repo-wide search and standard validation commands to ensure the old terminology is removed from active surfaces.

## Implementation Steps

### 1. Align product and documentation language

- [ ] Update `README.md` and `docs/` to describe finding and evaluating roles rather than jobs.
- [ ] Update app copy, labels, headings, and navigation to use `role` terminology consistently.
- [ ] Rephrase any remaining user-facing strings so they read naturally after the terminology shift.

### 2. Rename active source symbols and module boundaries

- [ ] Rename `job`/`jobs` types, interfaces, functions, variables, hooks, and services to `role`/`roles` equivalents.
- [ ] Rename files and directories whose names encode `job` terminology.
- [ ] Change the primary route from `/jobs` to `/roles` and update internal navigation accordingly.

### 3. Cut over browser-local storage and config identifiers

- [ ] Rename browser-local store names and serialized field names that use `job` terminology.
- [ ] Rename counters, record references, and ID prefixes such as `jobs_count` or `job_` to role-based equivalents.
- [ ] Rename AI/config identifiers such as `job_parsing` where they are part of the active browser-local system.

### 4. Update and verify tests

- [ ] Rename and update tests that mirror renamed modules, components, and routes.
- [ ] Update fixtures, service mocks, and expectations to use `role` terminology.
- [ ] Run formatting, the full test suite, and a final repository search to confirm the hard cutover is complete.

## Affected Areas

- `README.md`
- `docs/`
- `src/app/`
- `src/components/`
- `src/lib/`
- `tests/`
- browser-local storage and portability schema surfaces

## Success Criteria

- [ ] User-facing product copy consistently uses `role` terminology across docs and UI.
- [ ] Source code names, module boundaries, and routes reflect `role`/`roles` rather than `job`/`jobs`.
- [ ] Browser-local persistence and config identifiers no longer use active `job` terminology.
- [ ] Tests, mocks, and fixtures pass with the renamed terminology and routes.
- [ ] A final repository search confirms no unintended active `job` terminology remains.
