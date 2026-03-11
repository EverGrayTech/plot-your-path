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

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {aiSettings.map((setting) => (
          <li
            key={setting.operation_family}
            style={{ border: "1px solid #ddd", marginBottom: "0.75rem", padding: "0.75rem" }}
          >
            <p style={{ marginTop: 0 }}>
              <strong>{setting.operation_family}</strong>
            </p>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Provider
              <input
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
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Model
              <input
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
            <label style={{ display: "grid", gap: "0.25rem" }}>
              API key env
              <input
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
            <p>Runtime token: {setting.token_masked ?? "Not set"}</p>
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Update runtime token
              <input
                onChange={(event) =>
                  onTokenInputChange(setting.operation_family, event.target.value)
                }
                placeholder="Paste token"
                type="password"
                value={tokenInputs[setting.operation_family] ?? ""}
              />
            </label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button onClick={() => onUpdateToken(setting.operation_family)} type="button">
                Save Token
              </button>
              <button onClick={() => onClearToken(setting.operation_family)} type="button">
                Clear Token
              </button>
              <button onClick={() => onHealthcheck(setting.operation_family)} type="button">
                Test Config
              </button>
            </div>
            {healthByFamily[setting.operation_family] ? (
              <p>{healthByFamily[setting.operation_family]}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
