import React, { useState } from "react";

import type {
  ApplicationMaterial,
  InterviewPrepPack,
  InterviewPrepSectionKey,
  InterviewStage,
  OutcomeEvent,
  OutcomeEventType,
  ResumeTuningSuggestion,
  RoleDetail,
  RoleStatus,
} from "../../lib/dataModels";
import {
  interviewStageLabel,
  outcomeEventLabel,
  recommendationLabel,
} from "../../lib/rolesPageUtils";
import { Modal } from "../Modal";
import { TraceabilityBlock } from "./TraceabilityBlock";

interface RoleDetailModalProps {
  analyzingFit: boolean;
  applicationMaterials: ApplicationMaterial[];
  detailError: string | null;
  desirabilityError: string | null;
  editingLikelyQuestions: string;
  editingStarStories: string;
  editingTalkingPoints: string;
  fitError: string | null;
  generatingCoverLetter: boolean;
  generatingInterviewPrep: boolean;
  generatingQA: boolean;
  generatingResumeTuning: boolean;
  interviewPrepError: string | null;
  interviewPrepLoading: boolean;
  interviewPrepPacks: InterviewPrepPack[];
  role: RoleDetail | null;
  loadingDetail: boolean;
  loadingMaterials: boolean;
  materialsError: string | null;
  newOutcomeNotes: string;
  newOutcomeOccurredAt: string;
  newOutcomeType: OutcomeEventType;
  newStage: InterviewStage;
  onAddStage: () => void;
  onAnalyzeFit: () => void;
  onClose: () => void;
  onCopyInterviewPrep: (pack: InterviewPrepPack) => void;
  onCopyResumeTuning: (suggestion: ResumeTuningSuggestion) => void;
  onEditLikelyQuestions: (value: string) => void;
  onEditStarStories: (value: string) => void;
  onEditTalkingPoints: (value: string) => void;
  onExportInterviewPrep: (pack: InterviewPrepPack) => void;
  onExportResumeTuning: (suggestion: ResumeTuningSuggestion) => void;
  onGenerateCoverLetter: () => void;
  onGenerateInterviewPrep: () => void;
  onGenerateQA: () => void;
  onGenerateResumeTuning: () => void;
  onLogOutcome: () => void;
  onOpenSkill: (skillId: number) => void;
  onRegenerateInterviewPrepSection: (section: InterviewPrepSectionKey) => void;
  onSaveInterviewPrepEdits: () => void;
  onSaveOps: () => void;
  onScoreDesirability: (forceRefresh: boolean) => void;
  onSetMaterialId: (value: number) => void;
  onSetNewOutcomeNotes: (value: string) => void;
  onSetNewOutcomeOccurredAt: (value: string) => void;
  onSetNewOutcomeType: (value: OutcomeEventType) => void;
  onSetNewStage: (value: InterviewStage) => void;
  onSetNextAction: (daysFromNow: number) => void;
  onSetOpsAppliedAt: (value: string) => void;
  onSetOpsDeadlineAt: (value: string) => void;
  onSetOpsNextActionAt: (value: string) => void;
  onSetOpsNotes: (value: string) => void;
  onSetOpsRecruiterContact: (value: string) => void;
  onSetOpsSource: (value: string) => void;
  onSetQaQuestionsInput: (value: string) => void;
  onSetSelectedInterviewPrepId: (value: number) => void;
  onSetSelectedResumeTuningId: (value: number) => void;
  onSetStageNotes: (value: string) => void;
  onSetStageOccurredAt: (value: string) => void;
  onSetStatus: (status: RoleStatus) => void;
  onSyncResumeProfile: () => void;
  opsAppliedAt: string;
  opsDeadlineAt: string;
  opsError: string | null;
  opsNextActionAt: string;
  opsNotes: string;
  opsRecruiterContact: string;
  opsSaving: boolean;
  opsSource: string;
  outcomeEvents: OutcomeEvent[];
  outcomesError: string | null;
  outcomesLoading: boolean;
  qaQuestionsInput: string;
  regeneratingSection: InterviewPrepSectionKey | null;
  resumeSyncNotice: string | null;
  resumeTuningError: string | null;
  resumeTuningLoading: boolean;
  resumeTuningSuggestions: ResumeTuningSuggestion[];
  savingInterviewPrep: boolean;
  savingOutcome: boolean;
  scoringDesirability: boolean;
  selectedInterviewPrepId: number | null;
  selectedMaterialId: number | null;
  selectedResumeTuningId: number | null;
  stageNotes: string;
  stageOccurredAt: string;
  stageSaving: boolean;
  statusError: string | null;
  syncingResumeProfile: boolean;
  updatingStatus: boolean;
}

function materialLabel(material: ApplicationMaterial): string {
  if (material.artifact_type === "cover_letter") {
    return "Cover letter";
  }
  if (material.artifact_type === "application_qa") {
    return "Application Q&A";
  }
  return material.artifact_type;
}

export function RoleDetailModal({
  analyzingFit,
  applicationMaterials,
  detailError,
  desirabilityError,
  editingLikelyQuestions,
  editingStarStories,
  editingTalkingPoints,
  fitError,
  generatingCoverLetter,
  generatingInterviewPrep,
  generatingQA,
  generatingResumeTuning,
  interviewPrepError,
  interviewPrepLoading,
  interviewPrepPacks,
  role,
  loadingDetail,
  loadingMaterials,
  materialsError,
  newOutcomeNotes,
  newOutcomeOccurredAt,
  newOutcomeType,
  newStage,
  onAddStage,
  onAnalyzeFit,
  onClose,
  onCopyInterviewPrep,
  onCopyResumeTuning,
  onEditLikelyQuestions,
  onEditStarStories,
  onEditTalkingPoints,
  onExportInterviewPrep,
  onExportResumeTuning,
  onGenerateCoverLetter,
  onGenerateInterviewPrep,
  onGenerateQA,
  onGenerateResumeTuning,
  onLogOutcome,
  onOpenSkill,
  onRegenerateInterviewPrepSection,
  onSaveInterviewPrepEdits,
  onSaveOps,
  onScoreDesirability,
  onSetMaterialId,
  onSetNewOutcomeNotes,
  onSetNewOutcomeOccurredAt,
  onSetNewOutcomeType,
  onSetNewStage,
  onSetNextAction,
  onSetOpsAppliedAt,
  onSetOpsDeadlineAt,
  onSetOpsNextActionAt,
  onSetOpsNotes,
  onSetOpsRecruiterContact,
  onSetOpsSource,
  onSetQaQuestionsInput,
  onSetSelectedInterviewPrepId,
  onSetSelectedResumeTuningId,
  onSetStageNotes,
  onSetStageOccurredAt,
  onSetStatus,
  onSyncResumeProfile,
  opsAppliedAt,
  opsDeadlineAt,
  opsError,
  opsNextActionAt,
  opsNotes,
  opsRecruiterContact,
  opsSaving,
  opsSource,
  outcomeEvents,
  outcomesError,
  outcomesLoading,
  qaQuestionsInput,
  regeneratingSection,
  resumeSyncNotice,
  resumeTuningError,
  resumeTuningLoading,
  resumeTuningSuggestions,
  savingInterviewPrep,
  savingOutcome,
  scoringDesirability,
  selectedInterviewPrepId,
  selectedMaterialId,
  selectedResumeTuningId,
  stageNotes,
  stageOccurredAt,
  stageSaving,
  statusError,
  syncingResumeProfile,
  updatingStatus,
}: RoleDetailModalProps) {
  const selectedMaterial =
    applicationMaterials.find((item) => item.id === selectedMaterialId) ?? null;
  const selectedInterviewPrepPack =
    interviewPrepPacks.find((item) => item.id === selectedInterviewPrepId) ?? null;
  const selectedResumeTuning =
    resumeTuningSuggestions.find((item) => item.id === selectedResumeTuningId) ?? null;
  const adjacentFitEvidence = role?.latest_fit_analysis
    ? [
        ...(role.latest_fit_analysis.adjacent_required_skills ?? []),
        ...(role.latest_fit_analysis.adjacent_preferred_skills ?? []),
      ]
    : [];

  return (
    <Modal onClose={onClose} title="Role Detail">
      {loadingDetail ? <p>Loading role details...</p> : null}
      {detailError ? <p role="alert">{detailError}</p> : null}

      {role ? (
        <article>
          <h3>{role.title}</h3>
          <p>
            <strong>{role.company.name}</strong>
          </p>
          <p>Status: {role.status}</p>
          <label className="form-label mb-md">
            Update status
            <select
              className="form-select"
              disabled={updatingStatus}
              onChange={(event) => onSetStatus(event.target.value as RoleStatus)}
              value={role.status}
            >
              <option value="open">Open</option>
              <option value="submitted">Submitted</option>
              <option value="interviewing">Interviewing</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
          {statusError ? <p role="alert">{statusError}</p> : null}
          {fitError ? <p role="alert">{fitError}</p> : null}
          {desirabilityError ? <p role="alert">{desirabilityError}</p> : null}
          <p>
            Salary: {role.salary.min ?? "?"} - {role.salary.max ?? "?"} {role.salary.currency}
          </p>

          <section>
            <h4>Application Ops</h4>
            {role.application_ops?.needs_attention ? (
              <p>
                <strong>Needs attention:</strong>{" "}
                {role.application_ops.attention_reasons.join(", ") || "Missing next action"}
              </p>
            ) : (
              <p>No urgent follow-up flags.</p>
            )}
            {opsError ? <p role="alert">{opsError}</p> : null}
            <div className="form-grid-2col">
              <label className="form-label">
                Applied at
                <input
                  className="form-input"
                  onChange={(event) => onSetOpsAppliedAt(event.target.value)}
                  type="datetime-local"
                  value={opsAppliedAt}
                />
              </label>
              <label className="form-label">
                Deadline
                <input
                  className="form-input"
                  onChange={(event) => onSetOpsDeadlineAt(event.target.value)}
                  type="datetime-local"
                  value={opsDeadlineAt}
                />
              </label>
              <label className="form-label">
                Source
                <input
                  className="form-input"
                  onChange={(event) => onSetOpsSource(event.target.value)}
                  value={opsSource}
                />
              </label>
              <label className="form-label">
                Recruiter / Contact
                <input
                  className="form-input"
                  onChange={(event) => onSetOpsRecruiterContact(event.target.value)}
                  value={opsRecruiterContact}
                />
              </label>
              <label className="form-label full-width">
                Notes
                <textarea
                  className="form-textarea"
                  onChange={(event) => onSetOpsNotes(event.target.value)}
                  rows={3}
                  value={opsNotes}
                />
              </label>
              <label className="form-label full-width">
                Next action date
                <input
                  className="form-input"
                  onChange={(event) => onSetOpsNextActionAt(event.target.value)}
                  type="datetime-local"
                  value={opsNextActionAt}
                />
              </label>
            </div>
            <div className="flex-row mt-md">
              <button
                className="btn btn-primary"
                disabled={opsSaving}
                onClick={onSaveOps}
                type="button"
              >
                {opsSaving ? "Saving..." : "Save Ops"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onSetNextAction(1)}
                type="button"
              >
                Next Action +1 day
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onSetNextAction(3)}
                type="button"
              >
                Next Action +3 days
              </button>
            </div>

            <h5 className="mt-lg mb-sm">Interview stage timeline</h5>
            {(role.interview_stage_timeline ?? []).length ? (
              <ul>
                {(role.interview_stage_timeline ?? []).map((entry) => (
                  <li key={entry.id}>
                    {interviewStageLabel(entry.stage)} —{" "}
                    {new Date(entry.occurred_at).toLocaleString()}
                    {entry.notes ? ` (${entry.notes})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No interview stage updates yet.</p>
            )}
            <div className="form-grid-2col">
              <label className="form-label">
                Add stage
                <select
                  className="form-select"
                  onChange={(event) => onSetNewStage(event.target.value as InterviewStage)}
                  value={newStage}
                >
                  <option value="applied">Applied</option>
                  <option value="recruiter_screen">Recruiter Screen</option>
                  <option value="hiring_manager">Hiring Manager</option>
                  <option value="technical">Technical</option>
                  <option value="onsite">Onsite</option>
                  <option value="offer">Offer</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="form-label">
                Occurred at
                <input
                  className="form-input"
                  onChange={(event) => onSetStageOccurredAt(event.target.value)}
                  type="datetime-local"
                  value={stageOccurredAt}
                />
              </label>
              <label className="form-label full-width">
                Stage notes
                <textarea
                  className="form-textarea"
                  onChange={(event) => onSetStageNotes(event.target.value)}
                  rows={2}
                  value={stageNotes}
                />
              </label>
            </div>
            <button
              className="btn btn-secondary mt-sm"
              disabled={stageSaving}
              onClick={onAddStage}
              type="button"
            >
              {stageSaving ? "Adding stage..." : "Add Stage Event"}
            </button>
          </section>

          <section>
            <h4>Fit analysis</h4>
            <p className="form-helper">
              Run fit analysis using your pasted role content and current resume/profile inputs.
              Results are saved as analysis records, but future runs may vary because AI output is
              assistive rather than deterministic.
            </p>
            <button
              className="btn btn-primary"
              disabled={analyzingFit}
              onClick={onAnalyzeFit}
              type="button"
            >
              {analyzingFit ? "Analyzing..." : "Analyze Fit"}
            </button>
            {role.latest_fit_analysis ? (
              <div className="card mt-md">
                <p>
                  <strong>Recommendation:</strong>{" "}
                  {recommendationLabel(role.latest_fit_analysis.recommendation)}
                </p>
                <p>
                  <strong>Fit score:</strong> {role.latest_fit_analysis.fit_score}%
                </p>
                <p>
                  <strong>Confidence:</strong> {role.latest_fit_analysis.confidence_label ?? "high"}
                </p>
                <p>
                  <strong>Strengths:</strong>{" "}
                  {role.latest_fit_analysis.covered_required_skills.concat(
                    role.latest_fit_analysis.covered_preferred_skills,
                  ).length
                    ? role.latest_fit_analysis.covered_required_skills
                        .concat(role.latest_fit_analysis.covered_preferred_skills)
                        .join(", ")
                    : "None identified"}
                </p>
                {adjacentFitEvidence.length ? (
                  <p>
                    <strong>Adjacent evidence:</strong> {adjacentFitEvidence.join(", ")}
                  </p>
                ) : null}
                <p>
                  <strong>Gaps:</strong>{" "}
                  {role.latest_fit_analysis.missing_required_skills.concat(
                    role.latest_fit_analysis.missing_preferred_skills,
                  ).length
                    ? role.latest_fit_analysis.missing_required_skills
                        .concat(role.latest_fit_analysis.missing_preferred_skills)
                        .join(", ")
                    : "No explicit gaps"}
                </p>
                <p>
                  <strong>Rationale:</strong> {role.latest_fit_analysis.rationale}
                </p>
                {role.latest_fit_analysis.rationale_citations?.length ? (
                  <div>
                    <strong>Evidence references:</strong>
                    <ul>
                      {role.latest_fit_analysis.rationale_citations.map((citation) => (
                        <li key={`${citation.source_key}-${citation.snippet_reference}`}>
                          [{citation.source_type}]{" "}
                          {citation.source_record_id ?? citation.source_key}
                          {citation.snippet_reference ? ` — ${citation.snippet_reference}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {role.latest_fit_analysis.unsupported_claims?.length ? (
                  <p>
                    <strong>Unsupported claim flags:</strong>{" "}
                    {role.latest_fit_analysis.unsupported_claims.join("; ")}
                  </p>
                ) : null}
                <p>
                  <small>
                    Generated {new Date(role.latest_fit_analysis.created_at).toLocaleString()} with{" "}
                    {role.latest_fit_analysis.provider}/{role.latest_fit_analysis.model}
                  </small>
                </p>
              </div>
            ) : (
              <p>No fit analysis generated yet.</p>
            )}
          </section>

          <section>
            <h4>Desirability score</h4>
            <div className="flex-row">
              <button
                className="btn btn-primary"
                disabled={scoringDesirability}
                onClick={() => onScoreDesirability(false)}
                type="button"
              >
                {scoringDesirability ? "Scoring..." : "Score Desirability"}
              </button>
              <button
                className="btn btn-secondary"
                disabled={scoringDesirability}
                onClick={() => onScoreDesirability(true)}
                type="button"
              >
                Refresh Score
              </button>
            </div>
            {role.latest_desirability_score ? (
              <div className="card mt-md">
                <p>
                  <strong>Total:</strong> {role.latest_desirability_score.total_score.toFixed(2)} /
                  10
                </p>
                <p>
                  <strong>Scope:</strong> {role.latest_desirability_score.score_scope} ·{" "}
                  <strong>Status:</strong>{" "}
                  {role.latest_desirability_score.is_stale ? "Stale" : "Fresh"}
                </p>
                <p>
                  <strong>Cached until:</strong>{" "}
                  {new Date(role.latest_desirability_score.cache_expires_at).toLocaleString()}
                </p>
                <ul>
                  {role.latest_desirability_score.factor_breakdown.map((factor) => (
                    <li key={factor.factor_id}>
                      <strong>{factor.factor_name}</strong> — score {factor.score}/10, weight{" "}
                      {(factor.weight * 100).toFixed(1)}% — {factor.reasoning}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No desirability score generated yet.</p>
            )}
          </section>

          <section>
            <h4>Outcome Feedback</h4>
            {outcomesLoading ? <p>Loading outcomes...</p> : null}
            {outcomesError ? <p role="alert">{outcomesError}</p> : null}
            <div className="form-grid-2col">
              <label className="form-label">
                Outcome type
                <select
                  className="form-select"
                  onChange={(event) => onSetNewOutcomeType(event.target.value as OutcomeEventType)}
                  value={newOutcomeType}
                >
                  <option value="screen">Screen</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label className="form-label">
                Occurred at
                <input
                  className="form-input"
                  onChange={(event) => onSetNewOutcomeOccurredAt(event.target.value)}
                  type="datetime-local"
                  value={newOutcomeOccurredAt}
                />
              </label>
              <label className="form-label full-width">
                Outcome notes
                <textarea
                  className="form-textarea"
                  onChange={(event) => onSetNewOutcomeNotes(event.target.value)}
                  rows={2}
                  value={newOutcomeNotes}
                />
              </label>
            </div>
            <button
              className="btn btn-secondary mt-sm"
              disabled={savingOutcome}
              onClick={onLogOutcome}
              type="button"
            >
              {savingOutcome ? "Logging outcome..." : "Log Outcome Event"}
            </button>
            {outcomeEvents.length ? (
              <ul>
                {outcomeEvents.map((event) => (
                  <li key={event.id}>
                    {outcomeEventLabel(event.event_type)} —{" "}
                    {new Date(event.occurred_at).toLocaleString()}
                    {event.notes ? ` (${event.notes})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No outcomes logged yet.</p>
            )}
          </section>

          <section>
            <h4>Application Materials</h4>
            <p className="form-helper">
              Cover letters are treated as durable saved outputs. Question-answer drafts are useful
              working assistance and may be regenerated as needed.
            </p>
            <div className="form-grid">
              <button
                className="btn btn-primary"
                disabled={generatingCoverLetter}
                onClick={onGenerateCoverLetter}
                type="button"
              >
                {generatingCoverLetter ? "Generating cover letter..." : "Generate Cover Letter"}
              </button>

              <label className="form-label" htmlFor="application-questions">
                Application questions (one per line)
                <textarea
                  className="form-textarea"
                  id="application-questions"
                  onChange={(event) => onSetQaQuestionsInput(event.target.value)}
                  placeholder="Why are you interested in this role?"
                  rows={4}
                  value={qaQuestionsInput}
                />
              </label>
              <button
                className="btn btn-secondary"
                disabled={generatingQA}
                onClick={onGenerateQA}
                type="button"
              >
                {generatingQA ? "Generating Q&A..." : "Generate Q&A Drafts"}
              </button>
            </div>

            {loadingMaterials ? <p>Loading application materials...</p> : null}
            {materialsError ? <p role="alert">{materialsError}</p> : null}

            {applicationMaterials.length ? (
              <>
                <label className="form-label mt-md" htmlFor="material-version">
                  Saved drafts
                  <select
                    className="form-select"
                    id="material-version"
                    onChange={(event) => onSetMaterialId(Number(event.target.value))}
                    value={selectedMaterialId ?? ""}
                  >
                    {applicationMaterials.map((material) => (
                      <option key={material.id} value={material.id}>
                        {materialLabel(material)} v{material.version} (
                        {new Date(material.created_at).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </label>

                {selectedMaterial ? (
                  <article className="card mt-md">
                    <p>
                      <strong>Type:</strong> {materialLabel(selectedMaterial)}
                    </p>
                    <p>
                      <strong>Version:</strong> {selectedMaterial.version}
                    </p>
                    <p>
                      <strong>Generated with:</strong> {selectedMaterial.provider}/
                      {selectedMaterial.model}
                    </p>
                    <pre>{selectedMaterial.content}</pre>
                    <TraceabilityBlock
                      traceability={selectedMaterial.section_traceability}
                      unsupportedClaims={selectedMaterial.unsupported_claims}
                    />
                  </article>
                ) : null}
              </>
            ) : (
              <p>No application materials generated yet.</p>
            )}
          </section>

          <section>
            <h4>Interview Prep</h4>
            <button
              className="btn btn-primary"
              disabled={generatingInterviewPrep}
              onClick={onGenerateInterviewPrep}
              type="button"
            >
              {generatingInterviewPrep ? "Generating prep pack..." : "Generate Interview Prep Pack"}
            </button>

            {interviewPrepLoading ? <p>Loading interview prep packs...</p> : null}
            {interviewPrepError ? <p role="alert">{interviewPrepError}</p> : null}

            {interviewPrepPacks.length ? (
              <>
                <label className="form-label mt-md" htmlFor="interview-prep-version">
                  Saved prep versions
                  <select
                    className="form-select"
                    id="interview-prep-version"
                    onChange={(event) => onSetSelectedInterviewPrepId(Number(event.target.value))}
                    value={selectedInterviewPrepId ?? ""}
                  >
                    {interviewPrepPacks.map((pack) => (
                      <option key={pack.id} value={pack.id}>
                        Interview prep v{pack.version} ({new Date(pack.created_at).toLocaleString()}
                        )
                      </option>
                    ))}
                  </select>
                </label>

                {selectedInterviewPrepPack ? (
                  <div className="card mt-md">
                    <p>
                      <strong>Generated with:</strong> {selectedInterviewPrepPack.provider}/
                      {selectedInterviewPrepPack.model}
                    </p>
                    <div className="form-grid">
                      <label className="form-label">
                        Likely questions (one per line)
                        <textarea
                          className="form-textarea"
                          onChange={(event) => onEditLikelyQuestions(event.target.value)}
                          rows={6}
                          value={editingLikelyQuestions}
                        />
                      </label>
                      <button
                        className="btn btn-secondary"
                        disabled={regeneratingSection === "likely_questions"}
                        onClick={() => onRegenerateInterviewPrepSection("likely_questions")}
                        type="button"
                      >
                        {regeneratingSection === "likely_questions"
                          ? "Regenerating questions..."
                          : "Regenerate Questions"}
                      </button>

                      <label className="form-label">
                        Talking points (one per line)
                        <textarea
                          className="form-textarea"
                          onChange={(event) => onEditTalkingPoints(event.target.value)}
                          rows={6}
                          value={editingTalkingPoints}
                        />
                      </label>
                      <button
                        className="btn btn-secondary"
                        disabled={regeneratingSection === "talking_points"}
                        onClick={() => onRegenerateInterviewPrepSection("talking_points")}
                        type="button"
                      >
                        {regeneratingSection === "talking_points"
                          ? "Regenerating talking points..."
                          : "Regenerate Talking Points"}
                      </button>

                      <label className="form-label">
                        STAR story drafts (one per line)
                        <textarea
                          className="form-textarea"
                          onChange={(event) => onEditStarStories(event.target.value)}
                          rows={6}
                          value={editingStarStories}
                        />
                      </label>
                      <button
                        className="btn btn-secondary"
                        disabled={regeneratingSection === "star_stories"}
                        onClick={() => onRegenerateInterviewPrepSection("star_stories")}
                        type="button"
                      >
                        {regeneratingSection === "star_stories"
                          ? "Regenerating STAR drafts..."
                          : "Regenerate STAR Drafts"}
                      </button>
                    </div>
                    <TraceabilityBlock
                      traceability={selectedInterviewPrepPack.section_traceability}
                      unsupportedClaims={selectedInterviewPrepPack.unsupported_claims}
                    />

                    <div className="flex-row mt-md">
                      <button
                        className="btn btn-primary"
                        disabled={savingInterviewPrep}
                        onClick={onSaveInterviewPrepEdits}
                        type="button"
                      >
                        {savingInterviewPrep ? "Saving..." : "Save Interview Prep Edits"}
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onCopyInterviewPrep(selectedInterviewPrepPack)}
                        type="button"
                      >
                        Copy Prep Pack
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onExportInterviewPrep(selectedInterviewPrepPack)}
                        type="button"
                      >
                        Export Prep Pack
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <p>No interview prep packs generated yet.</p>
            )}
          </section>

          <section>
            <h4>Resume Tuning</h4>
            <p className="form-helper">
              For MVP, resume/profile work is driven by pasted text and locally configured AI
              settings rather than file-upload parsing.
            </p>
            <div className="flex-row mb-md">
              <button
                className="btn btn-secondary"
                disabled={syncingResumeProfile}
                onClick={onSyncResumeProfile}
                type="button"
              >
                {syncingResumeProfile ? "Syncing profile..." : "Sync Resume Profile"}
              </button>
              <button
                className="btn btn-primary"
                disabled={generatingResumeTuning}
                onClick={onGenerateResumeTuning}
                type="button"
              >
                {generatingResumeTuning ? "Generating tuning..." : "Generate Resume Tuning"}
              </button>
            </div>
            {resumeSyncNotice ? <p>{resumeSyncNotice}</p> : null}
            {resumeTuningLoading ? <p>Loading resume tuning suggestions...</p> : null}
            {resumeTuningError ? <p role="alert">{resumeTuningError}</p> : null}

            {resumeTuningSuggestions.length ? (
              <>
                <label className="form-label mt-md" htmlFor="resume-tuning-version">
                  Saved resume tuning versions
                  <select
                    className="form-select"
                    id="resume-tuning-version"
                    onChange={(event) => onSetSelectedResumeTuningId(Number(event.target.value))}
                    value={selectedResumeTuningId ?? ""}
                  >
                    {resumeTuningSuggestions.map((suggestion) => (
                      <option key={suggestion.id} value={suggestion.id}>
                        Resume tuning v{suggestion.version} (
                        {new Date(suggestion.created_at).toLocaleString()})
                      </option>
                    ))}
                  </select>
                </label>

                {selectedResumeTuning ? (
                  <div className="card mt-md">
                    <p>
                      <strong>Generated with:</strong> {selectedResumeTuning.provider}/
                      {selectedResumeTuning.model}
                    </p>
                    {[
                      ["Keep Bullets", selectedResumeTuning.sections.keep_bullets],
                      [
                        "Remove / Deprioritize Bullets",
                        selectedResumeTuning.sections.remove_bullets,
                      ],
                      ["Emphasize Bullets", selectedResumeTuning.sections.emphasize_bullets],
                      ["Missing Keywords", selectedResumeTuning.sections.missing_keywords],
                      ["Summary Tweaks", selectedResumeTuning.sections.summary_tweaks],
                      [
                        "Confidence / Rationale Notes",
                        selectedResumeTuning.sections.confidence_notes,
                      ],
                    ].map(([title, items]) => (
                      <div key={title as string}>
                        <h5 className="mb-sm">{title}</h5>
                        <ul>
                          {(items as string[]).map((item) => (
                            <li key={`${title}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <TraceabilityBlock
                      traceability={selectedResumeTuning.section_traceability}
                      unsupportedClaims={selectedResumeTuning.unsupported_claims}
                    />
                    <div className="flex-row mt-md">
                      <button
                        className="btn btn-secondary"
                        onClick={() => onCopyResumeTuning(selectedResumeTuning)}
                        type="button"
                      >
                        Copy Tuning Suggestions
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onExportResumeTuning(selectedResumeTuning)}
                        type="button"
                      >
                        Export Tuning Suggestions
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <p>No resume tuning suggestions generated yet.</p>
            )}
          </section>

          <h4>Status history</h4>
          {role.status_history.length ? (
            <ul>
              {role.status_history.map((entry, index) => (
                <li key={`${entry.changed_at}-${entry.to_status}-${index}`}>
                  {entry.from_status ?? "none"} → {entry.to_status} (
                  {new Date(entry.changed_at).toLocaleString()})
                </li>
              ))}
            </ul>
          ) : (
            <p>No status changes yet.</p>
          )}
          <p>
            <a href={role.url} rel="noreferrer" target="_blank">
              View original posting
            </a>
          </p>

          <h4>Required skills</h4>
          <ul>
            {role.skills.required.map((skill) => (
              <li key={`required-${skill.id}`}>
                <button className="link-btn" onClick={() => onOpenSkill(skill.id)} type="button">
                  {skill.name}
                </button>
              </li>
            ))}
          </ul>

          <h4>Preferred skills</h4>
          <ul>
            {role.skills.preferred.map((skill) => (
              <li key={`preferred-${skill.id}`}>
                <button className="link-btn" onClick={() => onOpenSkill(skill.id)} type="button">
                  {skill.name}
                </button>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </Modal>
  );
}
