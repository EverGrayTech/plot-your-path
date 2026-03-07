# Iteration XX: Outcome Feedback Learning Loop

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
- `10-job-status-tracking-iteration.md`
- `14-application-materials-mvp.md`
- `XX-application-ops-tracking.md`

## Implementation Checklist

### 1. Outcome Data Capture
- [ ] Add outcome event model (event type, timestamp, role linkage, optional notes)
- [ ] Add API/UI hooks to log important milestones and rejection/offer outcomes
- [ ] Add linkage fields to associated fit scores and generated artifact versions

### 2. Insight Layer
- [ ] Add basic reporting queries for conversion by fit band/desirability band/model family
- [ ] Add dashboard summaries for “what seems to work” trends
- [ ] Add confidence/insufficient-data messaging to avoid false certainty

### 3. Manual Tuning Support
- [ ] Add settings suggestions panel (non-automatic) for prompt/model adjustments based on outcomes
- [ ] Keep all recommendations explainable and reversible by user

### 4. Tests + Verification
- [ ] Add backend tests for outcome linkage and aggregation integrity
- [ ] Add frontend tests for logging outcomes and viewing trend summaries

## Acceptance Criteria
- [ ] User can log downstream hiring outcomes in-app
- [ ] App surfaces actionable trend insights tied to fit/materials/settings context
- [ ] User can use insights to manually improve prompts/models over time
