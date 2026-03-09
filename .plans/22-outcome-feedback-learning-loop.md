# Plan: Outcome Feedback Learning Loop

## Objective
Capture downstream outcomes (screen/reject/interview/offer) and tie them back to generated artifacts, prompts, and model settings to support iterative system improvement.

## Customer Value
- Enables evidence-based improvement of recommendations and outputs
- Helps identify what actually increases interview/offer conversion
- Prevents static prompt/model drift over time

## Scope Decisions (Locked)
- Track key outcome events per role/application lifecycle
- Link outcomes to fit/desirability signals and generated artifact versions
- Start with analytics/reporting insights, not automatic self-modifying prompts
- Keep implementation local-first and privacy-preserving

## Prerequisites
- `10-job-status-tracking.md`
- `14-application-materials.md`
- `17-application-ops-tracking.md`

## Implementation Checklist

### 1. Outcome Data Capture
- [x] Add outcome event model (event type, timestamp, role linkage, optional notes)
- [x] Add API/UI hooks to log important milestones and rejection/offer outcomes
- [x] Add linkage fields to associated fit scores and generated artifact versions

### 2. Insight Layer
- [x] Add basic reporting queries for conversion by fit band/desirability band/model family
- [x] Add dashboard summaries for “what seems to work” trends
- [x] Add confidence/insufficient-data messaging to avoid false certainty

### 3. Manual Tuning Support
- [x] Add settings suggestions panel (non-automatic) for prompt/model adjustments based on outcomes
- [x] Keep all recommendations explainable and reversible by user

### 4. Tests + Verification
- [x] Add backend tests for outcome linkage and aggregation integrity
- [x] Add frontend tests for logging outcomes and viewing trend summaries

## Acceptance Criteria
- [x] User can log downstream hiring outcomes in-app
- [x] App surfaces actionable trend insights tied to fit/materials/settings context
- [x] User can use insights to manually improve prompts/models over time
