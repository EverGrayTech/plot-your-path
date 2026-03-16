# Plan: Browser-Local Application Ops and Outcomes Migration

## Overview

Migrate application workflow records from backend APIs to browser-local persistence.

This includes application ops, interview stages, pipeline-related state, and outcome-event tracking.

## Prerequisites

- `.plans/42-browser-local-jobs-and-skills-migration.md`

## Goals

1. Move application workflow state into browser-local storage.
2. Replace backend-backed operational updates and timeline records.
3. Preserve workflow usefulness without backend persistence.

## Technical Design

### 1. Application ops migration

Refactor direction:
- Store application ops fields locally.
- Replace ops save and next-action update flows with local persistence.

### 2. Interview and outcome record migration

Refactor direction:
- Store interview stage events and outcome events locally.
- Replace timeline/event logging with browser-local repositories.

### 3. Derived workflow views

Refactor direction:
- Rebuild pipeline and related summaries against local data where feasible.
- If some derived views require separate shaping, implement them in TypeScript over the local model.

## Implementation Steps

### 1. Migrate application ops
- [x] Replace application ops read/write flows with browser-local persistence.
- [x] Preserve next-action and attention-related behavior locally.

### 2. Migrate interview stages and outcomes
- [x] Replace interview stage timeline storage with browser-local persistence.
- [x] Replace outcome event logging and retrieval with browser-local persistence.

### 3. Rebuild derived workflow views
- [x] Replace pipeline-related backend dependencies with local derived queries.
- [x] Add/update tests for application-ops and outcomes flows.

## Affected Areas

- job detail workflow state
- pipeline-related views
- interview stage and outcome event flows
- local application workflow repositories

## Success Criteria

- [x] Application tracking workflows no longer require backend persistence.
- [x] Interview stages, next actions, and outcome events persist locally.
- [x] Pipeline-style derived views work from browser-local data.
