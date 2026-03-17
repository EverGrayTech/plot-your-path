import React from "react";

import type { JobListItem } from "../../lib/dataModels";
import { interviewStageLabel, recommendationLabel } from "../../lib/jobsPageUtils";

interface JobsListProps {
  captureNotice: string | null;
  jobs: JobListItem[];
  listError: string | null;
  loadingJobs: boolean;
  onOpenCapture?: () => void;
  onSelectJob: (jobId: number) => void;
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "submitted":
    case "interviewing":
      return "badge badge-success";
    case "rejected":
      return "badge badge-error";
    default:
      return "badge badge-neutral";
  }
}

function recommendationBadgeClass(rec: string | null): string {
  if (rec === "go") return "badge badge-success";
  if (rec === "maybe") return "badge badge-warning";
  if (rec === "no-go") return "badge badge-error";
  return "badge badge-neutral";
}

function priorityColor(score: number | null): string | undefined {
  if (score === null) return undefined;
  if (score >= 7.5) return "var(--color-semantic-success-foreground)";
  if (score >= 5) return "var(--color-semantic-warning-foreground)";
  if (score >= 2.5) return "var(--color-text-secondary)";
  return "var(--color-text-tertiary)";
}

export function JobsList({
  captureNotice,
  jobs,
  listError,
  loadingJobs,
  onOpenCapture,
  onSelectJob,
}: JobsListProps) {
  return (
    <>
      {captureNotice ? (
        <div className="toast-container">
          <output className="toast toast-success">{captureNotice}</output>
        </div>
      ) : null}

      {loadingJobs ? (
        <div className="spinner-center" aria-label="Loading jobs">
          <span className="spinner" />
        </div>
      ) : null}

      {listError ? (
        <div className="alert alert-error" role="alert">
          {listError}
        </div>
      ) : null}

      {!loadingJobs && !listError && jobs.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-state-title">No jobs captured yet</p>
          <p className="empty-state-description">
            Capture your first role to start tracking opportunities, fit signals, and follow-up work
            in one place.
          </p>
          {onOpenCapture ? (
            <button className="btn btn-primary" onClick={onOpenCapture} type="button">
              Capture your first role
            </button>
          ) : null}
        </div>
      ) : null}

      {!loadingJobs && !listError && jobs.length > 0 ? (
        <ul className="list-unstyled">
          {jobs.map((job) => {
            const pColor = priorityColor(job.desirability_score);
            return (
              <li key={job.id}>
                <button className="job-row" onClick={() => onSelectJob(job.id)} type="button">
                  {pColor ? (
                    <span className="job-row-priority" style={{ backgroundColor: pColor }} />
                  ) : null}

                  <span className="job-row-identity">
                    {job.title}
                    <span className="job-row-company"> — {job.company}</span>
                  </span>

                  <span className="job-row-signals">
                    <span className={statusBadgeClass(job.status)}>{job.status}</span>
                    <span className={recommendationBadgeClass(job.fit_recommendation)}>
                      {recommendationLabel(job.fit_recommendation)}
                    </span>
                    {job.needs_attention ? (
                      <span className="badge badge-warning">Needs attention</span>
                    ) : null}
                  </span>

                  <span className="job-row-signals">
                    <span className="job-row-meta">
                      {job.fit_score !== null ? `Fit ${job.fit_score}%` : "No fit score"}
                    </span>
                    <span className="job-row-meta">
                      Desirability:{" "}
                      {job.desirability_score !== null ? job.desirability_score.toFixed(1) : "—"}
                    </span>
                    <span className="job-row-meta">
                      Stage: {interviewStageLabel(job.current_interview_stage)}
                    </span>
                  </span>

                  <span className="job-row-signals">
                    <span className="job-row-secondary">{job.skills_count} skills</span>
                    <span className="job-row-secondary">{job.salary_range ?? "No salary"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );
}
