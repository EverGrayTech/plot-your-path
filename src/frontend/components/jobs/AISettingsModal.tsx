import React from "react";

import type { AISetting, OperationFamily } from "../../lib/api";
import { Modal } from "../Modal";

interface AISettingsModalProps {
  aiSettings: AISetting[];
  error: string | null;
  healthByFamily: Partial<Record<OperationFamily, string>>;
  loading: boolean;
  onClearToken: (family: OperationFamily) => void;
  onClose: () => void;
  onHealthcheck: (family: OperationFamily) => void;
  onTokenInputChange: (family: OperationFamily, value: string) => void;
  onUpdateConfig: (
    family: OperationFamily,
    payload: { api_key_env?: string; model?: string; provider?: string },
  ) => void;
  onUpdateToken: (family: OperationFamily) => void;
  tokenInputs: Record<OperationFamily, string>;
}

export function AISettingsModal({
  aiSettings,
  error,
  healthByFamily,
  loading,
  onClearToken,
  onClose,
  onHealthcheck,
  onTokenInputChange,
  onUpdateConfig,
  onUpdateToken,
  tokenInputs,
}: AISettingsModalProps) {
  return (
    <Modal onClose={onClose} title="AI Settings">
      {loading ? <p>Loading AI settings...</p> : null}
      {error ? <p role="alert">{error}</p> : null}

      <ul className="list-unstyled">
        {aiSettings.map((setting) => (
          <li key={setting.operation_family}>
            <div className="card mb-md">
              <p>
                <strong>{setting.operation_family}</strong>
              </p>
              <label className="form-label">
                Provider
                <input
                  className="form-input"
                  defaultValue={setting.provider}
                  onBlur={(event) => {
                    if (event.target.value !== setting.provider) {
                      onUpdateConfig(setting.operation_family, {
                        provider: event.target.value,
                      });
                    }
                  }}
                />
              </label>
              <label className="form-label mt-sm">
                Model
                <input
                  className="form-input"
                  defaultValue={setting.model}
                  onBlur={(event) => {
                    if (event.target.value !== setting.model) {
                      onUpdateConfig(setting.operation_family, {
                        model: event.target.value,
                      });
                    }
                  }}
                />
              </label>
              <label className="form-label mt-sm">
                API key env
                <input
                  className="form-input"
                  defaultValue={setting.api_key_env}
                  onBlur={(event) => {
                    if (event.target.value !== setting.api_key_env) {
                      onUpdateConfig(setting.operation_family, {
                        api_key_env: event.target.value,
                      });
                    }
                  }}
                />
              </label>
              <p className="mt-sm">Runtime token: {setting.token_masked ?? "Not set"}</p>
              <label className="form-label">
                Update runtime token
                <input
                  className="form-input"
                  onChange={(event) =>
                    onTokenInputChange(setting.operation_family, event.target.value)
                  }
                  placeholder="Paste token"
                  type="password"
                  value={tokenInputs[setting.operation_family] ?? ""}
                />
              </label>
              <div className="flex-row mt-md">
                <button
                  className="btn btn-primary btn-compact"
                  onClick={() => onUpdateToken(setting.operation_family)}
                  type="button"
                >
                  Save Token
                </button>
                <button
                  className="btn btn-secondary btn-compact"
                  onClick={() => onClearToken(setting.operation_family)}
                  type="button"
                >
                  Clear Token
                </button>
                <button
                  className="btn btn-secondary btn-compact"
                  onClick={() => onHealthcheck(setting.operation_family)}
                  type="button"
                >
                  Test Config
                </button>
              </div>
              {healthByFamily[setting.operation_family] ? (
                <p className="mt-sm">{healthByFamily[setting.operation_family]}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
