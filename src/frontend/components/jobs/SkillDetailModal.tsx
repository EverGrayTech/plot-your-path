import React from "react";

import type { SkillDetail } from "../../lib/api";
import { Modal } from "../Modal";

interface SkillDetailModalProps {
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onOpenJob: (jobId: number) => void;
  skill: SkillDetail | null;
}

export function SkillDetailModal({
  error,
  loading,
  onClose,
  onOpenJob,
  skill,
}: SkillDetailModalProps) {
  return (
    <Modal onClose={onClose} title="Skill Detail">
      {loading ? <p>Loading skill details...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      {skill ? (
        <article>
          <h3>{skill.name}</h3>
          <p>Category: {skill.category ?? "Uncategorized"}</p>
          <p>Used in {skill.usage_count} captured jobs.</p>

          <h4>Referenced jobs</h4>
          <ul>
            {skill.jobs.map((job) => (
              <li key={job.id}>
                <button
                  onClick={() => onOpenJob(job.id)}
                  style={{ textAlign: "left" }}
                  type="button"
                >
                  {job.title} — {job.company}
                </button>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </Modal>
  );
}
