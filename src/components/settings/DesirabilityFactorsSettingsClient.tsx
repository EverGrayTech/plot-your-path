"use client";

import React from "react";

import { useRolesFeatureModals } from "../../lib/useRolesFeatureModals";
import {
  DesirabilityField,
  DesirabilitySection,
  DesirabilitySettingsError,
  DesirabilitySettingsSurface,
  createFactorSummary,
} from "./desirabilityFactorsSurfaceParts";

export function DesirabilityFactorsSettingsClient() {
  const {
    factors,
    factorsError,
    factorsLoading,
    handleAddFactor,
    handleDeleteFactor,
    handleUpdateFactor,
    newFactorName,
    newFactorPrompt,
    newFactorWeight,
    setNewFactorName,
    setNewFactorPrompt,
    setNewFactorWeight,
    loadFactors,
  } = useRolesFeatureModals();

  const [showAddFactor, setShowAddFactor] = React.useState(false);

  React.useEffect(() => {
    void loadFactors();
  }, [loadFactors]);

  return (
    <DesirabilitySettingsSurface
      description="Manage the factors that shape role desirability scoring and ordering."
      title="Desirability Factors"
    >
      {factorsError ? <DesirabilitySettingsError message={factorsError} /> : null}

      {factorsLoading ? (
        <p className="eg-ai-config-settings-description">Loading desirability factors…</p>
      ) : null}

      {!factorsLoading && factors.length === 0 ? (
        <section className="eg-ai-config-section eg-ai-config-route-section">
          <div className="eg-ai-config-route-summary-copy">
            <span className="eg-ai-config-route-summary-title">No factors configured</span>
            <span className="eg-ai-config-route-summary-separator">—</span>
            <span className="eg-ai-config-route-summary-description">
              Add a factor to start shaping desirability scoring.
            </span>
          </div>
        </section>
      ) : null}

      {!factorsLoading
        ? factors.map((factor) => (
            <DesirabilitySection
              description={createFactorSummary(factor.weight, factor.is_active, factor.prompt)}
              enabled={factor.is_active}
              key={factor.id}
              onToggleEnabled={(checked) =>
                void handleUpdateFactor(factor.id, "is_active", checked)
              }
              sectionType="desirability-factor"
              title={factor.name}
            >
              <div>
                <DesirabilityField field="prompt" label="Prompt">
                  <textarea
                    className="eg-ai-config-control"
                    defaultValue={factor.prompt}
                    onBlur={(event) =>
                      void handleUpdateFactor(factor.id, "prompt", event.currentTarget.value)
                    }
                    rows={4}
                  />
                </DesirabilityField>

                <DesirabilityField field="weight" label="Weight">
                  <input
                    className="eg-ai-config-control"
                    defaultValue={String(factor.weight)}
                    onBlur={(event) =>
                      void handleUpdateFactor(factor.id, "weight", event.currentTarget.value)
                    }
                    step="0.01"
                    type="number"
                  />
                </DesirabilityField>

                <div className="eg-ai-config-actions">
                  <button
                    className="eg-ai-config-button eg-ai-config-button-secondary"
                    onClick={() => void handleDeleteFactor(factor.id)}
                    type="button"
                  >
                    Delete factor
                  </button>
                </div>
              </div>
            </DesirabilitySection>
          ))
        : null}

      <DesirabilitySection
        description="Create a new desirability factor and place it at the end of the ordering."
        open={showAddFactor}
        sectionType="desirability-factor-add"
        title="Add Factor"
      >
        <div>
          <DesirabilityField field="name" label="Name">
            <input
              className="eg-ai-config-control"
              onChange={(event) => setNewFactorName(event.currentTarget.value)}
              value={newFactorName}
            />
          </DesirabilityField>

          <DesirabilityField field="weight" label="Weight">
            <input
              className="eg-ai-config-control"
              onChange={(event) => setNewFactorWeight(event.currentTarget.value)}
              step="0.01"
              type="number"
              value={newFactorWeight}
            />
          </DesirabilityField>

          <DesirabilityField field="prompt" label="Prompt">
            <textarea
              className="eg-ai-config-control"
              onChange={(event) => setNewFactorPrompt(event.currentTarget.value)}
              rows={4}
              value={newFactorPrompt}
            />
          </DesirabilityField>

          <div className="eg-ai-config-actions">
            <button
              className="eg-ai-config-button"
              onClick={() => void handleAddFactor()}
              type="button"
            >
              Add factor
            </button>
          </div>
        </div>
      </DesirabilitySection>
    </DesirabilitySettingsSurface>
  );
}
