# Iteration 10: Job Status Tracking + Status History Audit

## Objective
Add a full status-management workflow so captured jobs can move through application stages and retain an auditable status history visible from job detail.

## Scope Decisions (Locked)
- Replace previous role statuses with: `open`, `submitted`, `interviewing`, `rejected`
- New captures start as `open`
- Status changes are recorded as immutable history entries
- Status updates remain endpoint-driven (`PATCH /api/jobs/{id}/status`)
- Job detail includes full status history timeline

## Implementation Checklist

### 1. Status Domain Update (Backend + Frontend Contracts)
- [x] Replace old status enum values in backend schemas with `open`, `submitted`, `interviewing`, `rejected`
- [x] Replace old status union values in frontend API types with same set
- [x] Update any dependent tests and fixtures using old values (`active/applied/archived`)

### 2. Persistence for Status Change Audit
- [x] Add `RoleStatusChange` model (`role_id`, `from_status`, `to_status`, `changed_at`)
- [x] Register model in backend model exports so table creation includes it
- [x] Ensure no-op status updates do not create audit rows

### 3. Capture Defaults + API Behavior
- [x] Change new role default status to `open` in model/service capture pipeline
- [x] Update `PATCH /api/jobs/{role_id}/status` to persist status change audit rows
- [x] Keep endpoint response shape stable for list refresh behavior

### 4. Job Detail Status History
- [x] Add status history schema type to job schemas
- [x] Include `status_history` in `GET /api/jobs/{id}` response
- [x] Return history in chronological order for user readability

### 5. Jobs UI Status Controls + History Display
- [x] Add status update control in Job Detail modal
- [x] Call new frontend API method to patch status
- [x] Refresh job detail + list after successful update
- [x] Display status history entries in Job Detail modal

### 6. Tests + Verification
- [x] Add/adjust backend tests for new statuses and status history behavior
- [x] Add frontend API test for `updateJobStatus`
- [x] Add Jobs page test for status update + rendered history
- [x] Run targeted backend and frontend test suites successfully

## Acceptance Criteria
- [x] A captured job starts in `open` status
- [x] User can change status to `submitted`, `interviewing`, or `rejected`
- [x] Each real status transition is persisted with timestamped history
- [x] Job detail shows full status history timeline
- [x] Backend + frontend targeted tests pass with updated status model
