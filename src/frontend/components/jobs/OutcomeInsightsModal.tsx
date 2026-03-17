import React from "react";

import type { OutcomeInsights, OutcomeTuningSuggestions } from "../../lib/dataModels";
import { toPercent } from "../../lib/jobsPageUtils";
import { Modal } from "../Modal";

interface OutcomeInsightsModalProps {
  error: string | null;
  insights: OutcomeInsights | null;
  loading: boolean;
  onClose: () => void;
  tuningSuggestions: OutcomeTuningSuggestions | null;
}

export function OutcomeInsightsModal({
  error,
  insights,
  loading,
  onClose,
  tuningSuggestions,
}: OutcomeInsightsModalProps) {
  return (
    <Modal onClose={onClose} title="Outcome Insights">
      {loading ? <p>Loading outcome insights...</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {insights ? (
        <>
          <p>
            <strong>Confidence:</strong> {insights.confidence_message}
          </p>
          <p>
            <strong>Total events:</strong> {insights.total_events} • <strong>Roles:</strong>{" "}
            {insights.total_roles_with_outcomes}
          </p>

          <h4>Conversion by Fit Band</h4>
          <ul>
            {insights.conversion_by_fit_band.map((row) => (
              <li key={`fit-${row.segment}`}>
                {row.segment}: {row.hires}/{row.attempts} ({toPercent(row.conversion_rate)})
              </li>
            ))}
          </ul>

          <h4>Conversion by Desirability Band</h4>
          <ul>
            {insights.conversion_by_desirability_band.map((row) => (
              <li key={`des-${row.segment}`}>
                {row.segment}: {row.hires}/{row.attempts} ({toPercent(row.conversion_rate)})
              </li>
            ))}
          </ul>

          <h4>Conversion by Model Family</h4>
          <ul>
            {insights.conversion_by_model_family.map((row) => (
              <li key={`model-${row.segment}`}>
                {row.segment}: {row.hires}/{row.attempts} ({toPercent(row.conversion_rate)})
              </li>
            ))}
          </ul>

          <h4>Manual Tuning Suggestions</h4>
          <p>{tuningSuggestions?.confidence_message}</p>
          <ul>
            {(tuningSuggestions?.suggestions ?? []).map((suggestion) => (
              <li key={`${suggestion.recommendation}-${suggestion.reversible_action}`}>
                <p>
                  <strong>{suggestion.recommendation}</strong>
                </p>
                <p>{suggestion.rationale}</p>
                <p>
                  <em>Reversible action:</em> {suggestion.reversible_action}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Modal>
  );
}
