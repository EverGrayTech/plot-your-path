import React from "react";

import type { SkillDetail } from "../../lib/dataModels";
import { Modal } from "../Modal";

interface SkillDetailModalProps {
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onOpenRole: (roleId: number) => void;
  skill: SkillDetail | null;
}

export function SkillDetailModal({
  error,
  loading,
  onClose,
  onOpenRole,
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
          <p>Used in {skill.usage_count} captured roles.</p>

          <h4>Referenced roles</h4>
          <ul>
            {skill.roles.map((role) => (
              <li key={role.id}>
                <button className="link-btn" onClick={() => onOpenRole(role.id)} type="button">
                  {role.title} — {role.company}
                </button>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </Modal>
  );
}
