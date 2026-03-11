import React from "react";

import type { InterviewStage, PipelineCounters, PipelineItem } from "../../lib/api";
import { interviewStageLabel } from "../../lib/jobsPageUtils";
import { Modal } from "../Modal";

type StageFilter = "all" | InterviewStage;

interface PipelineModalProps {
  counters: PipelineCounters;
  error: string | null;
  items: PipelineItem[];
  loading: boolean;
  onClose: () => void;
  onOpenJob: (roleId: number) => void;
  pipelineOverdueOnly: boolean;
  pipelineRecentlyUpdated: boolean;
  pipelineStageFilter: StageFilter;
  pipelineWeekDeadlines: boolean;
  setPipelineOverdueOnly: (value: boolean) => void;
  setPipelineRecentlyUpdated: (value: boolean) => void;
  setPipelineStageFilter: (value: StageFilter) => void;
  setPipelineWeekDeadlines: (value: boolean) => void;
}

export function PipelineModal({
  counters,
  error,
  items,
  loading,
  onClose,
  onOpenJob,
  pipelineOverdueOnly,
  pipelineRecentlyUpdated,
  pipelineStageFilter,
  pipelineWeekDeadlines,
  setPipelineOverdueOnly,
  setPipelineRecentlyUpdated,
  setPipelineStageFilter,
  setPipelineWeekDeadlines,
}: PipelineModalProps) {
  return (
    <Modal onClose={onClose} title="Application Pipeline">
      <p>
        <strong>Needs follow-up:</strong> {counters.needs_follow_up} • <strong>Overdue:</strong>{" "}
        {counters.overdue_actions} • <strong>Deadlines (7d):</strong> {counters.upcoming_deadlines}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
        <label>
          <input
            checked={pipelineOverdueOnly}
            onChange={(event) => setPipelineOverdueOnly(event.target.checked)}
            type="checkbox"
          />{" "}
          Overdue actions
        </label>
        <label>
          <input
            checked={pipelineWeekDeadlines}
            onChange={(event) => setPipelineWeekDeadlines(event.target.checked)}
            type="checkbox"
          />{" "}
          This-week deadlines
        </label>
        <label>
          <input
            checked={pipelineRecentlyUpdated}
            onChange={(event) => setPipelineRecentlyUpdated(event.target.checked)}
            type="checkbox"
          />{" "}
          Recently updated
        </label>
        <label>
          Stage
          <select
            onChange={(event) => setPipelineStageFilter(event.target.value as StageFilter)}
            value={pipelineStageFilter}
          >
            <option value="all">All</option>
            <option value="applied">Applied</option>
            <option value="recruiter_screen">Recruiter Screen</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="technical">Technical</option>
            <option value="onsite">Onsite</option>
            <option value="offer">Offer</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </div>
      {loading ? <p>Loading pipeline...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!loading && !error ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {items
            .filter(
              (item) =>
                pipelineStageFilter === "all" || item.interview_stage === pipelineStageFilter,
            )
            .map((item) => (
              <li
                key={item.role_id}
                style={{ border: "1px solid #ddd", marginBottom: "0.5rem", padding: "0.5rem" }}
              >
                <button
                  onClick={() => onOpenJob(item.role_id)}
                  style={{ textAlign: "left", width: "100%" }}
                  type="button"
                >
                  <strong>{item.title}</strong> — {item.company}
                  <br />
                  <small>
                    {interviewStageLabel(item.interview_stage)} • next action:{" "}
                    {item.next_action_at ? new Date(item.next_action_at).toLocaleString() : "None"}{" "}
                    • deadline:{" "}
                    {item.deadline_at ? new Date(item.deadline_at).toLocaleString() : "None"}
                    {item.needs_attention ? ` • ${item.attention_reasons.join(", ")}` : ""}
                  </small>
                </button>
              </li>
            ))}
        </ul>
      ) : null}
    </Modal>
  );
}
