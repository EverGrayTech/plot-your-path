import React from "react";

import type { JobListItem } from "../../lib/api";
import { interviewStageLabel, recommendationLabel } from "../../lib/jobsPageUtils";

interface JobsListProps {
  captureNotice: string | null;
  jobs: JobListItem[];
  listError: string | null;
  loadingJobs: boolean;
  onSelectJob: (jobId: number) => void;
}

export function JobsList({
  captureNotice,
  jobs,
  listError,
  loadingJobs,
  onSelectJob,
}: JobsListProps) {
  return (
    <>
      {captureNotice ? <output aria-live="polite">{captureNotice}</output> : null}
      {loadingJobs ? <p>Loading jobs...</p> : null}
      {listError ? <p role="alert">{listError}</p> : null}

      {!loadingJobs && !listError ? (
        <ul className="list-unstyled">
          {jobs.map((job) => (
            <li key={job.id}>
              <button className="list-item-btn" onClick={() => onSelectJob(job.id)} type="button">
                <strong>{job.title}</strong> — {job.company}
                <br />
                <small>
                  {job.salary_range ?? "No salary"} • {job.status} • {job.skills_count} skills •{" "}
                  {recommendationLabel(job.fit_recommendation)}
                  {job.fit_score !== null ? ` (${job.fit_score}%)` : ""}
                  {" • "}
                  Desirability:{" "}
                  {job.desirability_score !== null
                    ? job.desirability_score.toFixed(2)
                    : "Not scored"}
                  {" • Stage: "}
                  {interviewStageLabel(job.current_interview_stage)}
                  {job.needs_attention ? " • Needs attention" : ""}
                </small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
