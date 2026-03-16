# Plan: Browser-Local Jobs and Skills Migration

## Overview

Migrate core jobs and skills persistence from backend APIs to browser-local repositories.

This phase should make the primary browsing and detail views work from local storage for captured roles and extracted skills.

## Prerequisites

- `.plans/41-browser-local-storage-foundation.md`

## Goals

1. Move jobs/opportunities and skills to browser-local persistence.
2. Replace backend-backed browsing/detail flows for jobs and skills.
3. Preserve current user-visible behavior while removing backend CRUD dependence.

## Technical Design

### 1. Jobs domain migration

Refactor direction:
- Store job list/detail data locally.
- Replace list/detail/status retrieval flows with local repositories.

### 2. Skills domain migration

Refactor direction:
- Store skills and job-skill references locally.
- Replace skills list/detail/navigation flows with local repositories.

### 3. Capture persistence integration

Refactor direction:
- Ensure job capture writes durable job/skill records into browser-local storage.
- Preserve local-first UX and current success/error patterns.

## Implementation Steps

### 1. Migrate jobs persistence
- [x] Replace local job list/detail reads with browser-local repositories.
- [x] Replace job status and related non-AI job updates with browser-local persistence.

### 2. Migrate skills persistence
- [x] Replace skill list/detail flows with browser-local repositories.
- [x] Preserve cross-navigation between jobs and skills using local data.

### 3. Validate workflow parity
- [x] Ensure job capture persists locally and makes new roles visible immediately.
- [x] Add/update frontend tests for jobs and skills on browser-local data.

## Affected Areas

- jobs board and detail flows
- skills page/detail flows
- job capture persistence path
- local jobs/skills repositories

## Success Criteria

- [x] Jobs and skills workflows no longer require backend CRUD endpoints.
- [x] Captured roles and extracted skills persist locally in the browser.
- [x] Job/skill browsing behavior remains stable for users.
