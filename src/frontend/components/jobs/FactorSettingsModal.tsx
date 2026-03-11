import React from "react";

import type { DesirabilityFactor } from "../../lib/api";
import { Modal } from "../Modal";

interface FactorSettingsModalProps {
  error: string | null;
  factors: DesirabilityFactor[];
  loading: boolean;
  newFactorName: string;
  newFactorPrompt: string;
  newFactorWeight: string;
  onAddFactor: () => void;
  onClose: () => void;
  onDeleteFactor: (factorId: number) => void;
  onMoveFactor: (factorId: number, direction: -1 | 1) => void;
  onSetNewFactorName: (value: string) => void;
  onSetNewFactorPrompt: (value: string) => void;
  onSetNewFactorWeight: (value: string) => void;
  onUpdateFactor: (
    factorId: number,
    field: "is_active" | "prompt" | "weight",
    value: boolean | number | string,
  ) => void;
}

export function FactorSettingsModal({
  error,
  factors,
  loading,
  newFactorName,
  newFactorPrompt,
  newFactorWeight,
  onAddFactor,
  onClose,
  onDeleteFactor,
  onMoveFactor,
  onSetNewFactorName,
  onSetNewFactorPrompt,
  onSetNewFactorWeight,
  onUpdateFactor,
}: FactorSettingsModalProps) {
  return (
    <Modal onClose={onClose} title="Desirability Factor Settings">
      {loading ? <p>Loading factors...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {factors.map((factor, index) => (
          <li
            key={factor.id}
            style={{ border: "1px solid #ddd", marginBottom: "0.5rem", padding: "0.5rem" }}
          >
            <p>
              <strong>{factor.name}</strong>
            </p>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Prompt
              <textarea
                defaultValue={factor.prompt}
                onBlur={(event) => {
                  if (event.target.value !== factor.prompt) {
                    onUpdateFactor(factor.id, "prompt", event.target.value);
                  }
                }}
                rows={2}
              />
            </label>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Weight
              <input
                defaultValue={factor.weight}
                min={0}
                onBlur={(event) => onUpdateFactor(factor.id, "weight", Number(event.target.value))}
                step={0.01}
                type="number"
              />
            </label>
            <label>
              <input
                checked={factor.is_active}
                onChange={(event) => onUpdateFactor(factor.id, "is_active", event.target.checked)}
                type="checkbox"
              />{" "}
              Active
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button
                disabled={index === 0}
                onClick={() => onMoveFactor(factor.id, -1)}
                type="button"
              >
                Move up
              </button>
              <button
                disabled={index === factors.length - 1}
                onClick={() => onMoveFactor(factor.id, 1)}
                type="button"
              >
                Move down
              </button>
              <button onClick={() => onDeleteFactor(factor.id)} type="button">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <h4>Add factor</h4>
      <label style={{ display: "grid", gap: "0.25rem" }}>
        Name
        <input onChange={(event) => onSetNewFactorName(event.target.value)} value={newFactorName} />
      </label>
      <label style={{ display: "grid", gap: "0.25rem" }}>
        Prompt
        <textarea
          onChange={(event) => onSetNewFactorPrompt(event.target.value)}
          rows={3}
          value={newFactorPrompt}
        />
      </label>
      <label style={{ display: "grid", gap: "0.25rem" }}>
        Weight
        <input
          min={0}
          onChange={(event) => onSetNewFactorWeight(event.target.value)}
          step={0.01}
          type="number"
          value={newFactorWeight}
        />
      </label>
      <button onClick={onAddFactor} type="button">
        Add factor
      </button>
    </Modal>
  );
}
