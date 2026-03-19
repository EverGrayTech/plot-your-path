import React from "react";

import type { RoleListItem } from "../../lib/dataModels";
import { interviewStageLabel, recommendationLabel } from "../../lib/rolesPageUtils";

interface RolesListProps {
  captureNotice: string | null;
  roles: RoleListItem[];
  listError: string | null;
  loadingRoles: boolean;
  onOpenCapture?: () => void;
  onSelectRole: (roleId: number) => void;
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

export function RolesList({
  captureNotice,
  roles,
  listError,
  loadingRoles,
  onOpenCapture,
  onSelectRole,
}: RolesListProps) {
  return (
    <>
      {captureNotice ? (
        <div className="toast-container">
          <output className="toast toast-success">{captureNotice}</output>
        </div>
      ) : null}

      {loadingRoles ? (
        <div className="spinner-center" aria-label="Loading roles">
          <span className="spinner" />
        </div>
      ) : null}

      {listError ? (
        <div className="alert alert-error" role="alert">
          {listError}
        </div>
      ) : null}

      {!loadingRoles && !listError && roles.length === 0 ? (
        <div className="empty-state card">
          <p className="empty-state-title">No roles captured yet</p>
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

      {!loadingRoles && !listError && roles.length > 0 ? (
        <ul className="list-unstyled">
          {roles.map((role) => {
            const pColor = priorityColor(role.desirability_score);
            return (
              <li key={role.id}>
                <button className="role-row" onClick={() => onSelectRole(role.id)} type="button">
                  {pColor ? (
                    <span className="role-row-priority" style={{ backgroundColor: pColor }} />
                  ) : null}

                  <span className="role-row-identity">
                    {role.title}
                    <span className="role-row-company"> — {role.company}</span>
                  </span>

                  <span className="role-row-signals">
                    <span className={statusBadgeClass(role.status)}>{role.status}</span>
                    <span className={recommendationBadgeClass(role.fit_recommendation)}>
                      {recommendationLabel(role.fit_recommendation)}
                    </span>
                    {role.needs_attention ? (
                      <span className="badge badge-warning">Needs attention</span>
                    ) : null}
                  </span>

                  <span className="role-row-signals">
                    <span className="role-row-meta">
                      {role.fit_score !== null ? `Fit ${role.fit_score}%` : "No fit score"}
                    </span>
                    <span className="role-row-meta">
                      Desirability:{" "}
                      {role.desirability_score !== null ? role.desirability_score.toFixed(1) : "—"}
                    </span>
                    <span className="role-row-meta">
                      Stage: {interviewStageLabel(role.current_interview_stage)}
                    </span>
                  </span>

                  <span className="role-row-signals">
                    <span className="role-row-secondary">{role.skills_count} skills</span>
                    <span className="role-row-secondary">{role.salary_range ?? "No salary"}</span>
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
