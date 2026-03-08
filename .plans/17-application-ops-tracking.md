# Plan: Application Ops Tracking (Pipeline Management)

## Objective
Add a dedicated application-operations workflow so active job hunt execution (deadlines, follow-ups, contacts, interview stages) is managed inside the app.

## Customer Value
- Increases day-to-day job hunt throughput
- Reduces missed deadlines and follow-up gaps
- Keeps execution context linked to each role record

## Scope Decisions (Locked)
- This is workflow tracking, not content generation
- Supports core operational fields: applied date, deadline, source, recruiter/contact, notes, next action date
- Supports interview stage progression beyond coarse role status
- Includes reminders as in-app indicators first (no external notifications integration)

## Prerequisites
- `10-job-status-tracking.md`

## Implementation Checklist

### 1. Data + API Foundation
- [x] Add application-ops entity linked to role for operational metadata
- [x] Add interview-stage timeline model with timestamps and notes
- [x] Add CRUD endpoints for ops details, next actions, and stage updates

### 2. Operational Views
- [x] Add “Application Ops” section in Job Detail
- [x] Add pipeline list/table view grouped by stage and next-action urgency
- [x] Add filters for overdue actions, this-week deadlines, and recently updated roles

### 3. Reminder/Attention Signals
- [x] Add computed “needs attention” indicators for overdue or missing next actions
- [x] Add lightweight dashboard counters for follow-ups and upcoming deadlines

### 4. Tests + Verification
- [x] Add backend tests for ops CRUD and stage timeline behavior
- [x] Add frontend tests for pipeline filtering and attention-state rendering

## Acceptance Criteria
- [x] User can track role-specific deadlines, contacts, and next actions
- [x] User can manage interview-stage progression with notes
- [x] App clearly surfaces what needs attention during active application cycles
