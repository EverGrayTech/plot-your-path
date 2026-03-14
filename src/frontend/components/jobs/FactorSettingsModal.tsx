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

      <ul className="list-unstyled">
        {factors.map((factor, index) => (
          <li key={factor.id}>
            <div className="card mb-sm">
              <p>
                <strong>{factor.name}</strong>
              </p>
              <label className="form-label">
                Prompt
                <textarea
                  className="form-textarea"
                  defaultValue={factor.prompt}
                  onBlur={(event) => {
                    if (event.target.value !== factor.prompt) {
                      onUpdateFactor(factor.id, "prompt", event.target.value);
                    }
                  }}
                  rows={2}
                />
              </label>
              <label className="form-label mt-sm">
                Weight
                <input
                  className="form-input"
                  defaultValue={factor.weight}
                  min={0}
                  onBlur={(event) =>
                    onUpdateFactor(factor.id, "weight", Number(event.target.value))
                  }
                  step={0.01}
                  type="number"
                />
              </label>
              <label className="form-checkbox-label mt-sm">
                <input
                  checked={factor.is_active}
                  onChange={(event) => onUpdateFactor(factor.id, "is_active", event.target.checked)}
                  type="checkbox"
                />
                Active
              </label>
              <div className="flex-row mt-md">
                <button
                  className="btn btn-tertiary btn-compact"
                  disabled={index === 0}
                  onClick={() => onMoveFactor(factor.id, -1)}
                  type="button"
                >
                  Move up
                </button>
                <button
                  className="btn btn-tertiary btn-compact"
                  disabled={index === factors.length - 1}
                  onClick={() => onMoveFactor(factor.id, 1)}
                  type="button"
                >
                  Move down
                </button>
                <button
                  className="btn btn-destructive btn-compact"
                  onClick={() => onDeleteFactor(factor.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <h4 className="mt-lg">Add factor</h4>
      <div className="form-grid">
        <label className="form-label">
          Name
          <input
            className="form-input"
            onChange={(event) => onSetNewFactorName(event.target.value)}
            value={newFactorName}
          />
        </label>
        <label className="form-label">
          Prompt
          <textarea
            className="form-textarea"
            onChange={(event) => onSetNewFactorPrompt(event.target.value)}
            rows={3}
            value={newFactorPrompt}
          />
        </label>
        <label className="form-label">
          Weight
          <input
            className="form-input"
            min={0}
            onChange={(event) => onSetNewFactorWeight(event.target.value)}
            step={0.01}
            type="number"
            value={newFactorWeight}
          />
        </label>
        <div>
          <button className="btn btn-primary" onClick={onAddFactor} type="button">
            Add factor
          </button>
        </div>
      </div>
    </Modal>
  );
}
