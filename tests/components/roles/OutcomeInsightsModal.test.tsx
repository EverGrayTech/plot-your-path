import { render, screen } from "@testing-library/react";
import React from "react";

import { OutcomeInsightsModal } from "../../../src/components/roles/OutcomeInsightsModal";

describe("OutcomeInsightsModal", () => {
  it("renders loading and error states", () => {
    render(
      <OutcomeInsightsModal
        error="Insights unavailable"
        insights={null}
        loading
        onClose={vi.fn()}
        tuningSuggestions={null}
      />,
    );

    expect(screen.getByText(/Loading outcome insights/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Insights unavailable");
  });

  it("renders insights data and tuning suggestions", () => {
    render(
      <OutcomeInsightsModal
        error={null}
        insights={{
          confidence_message: "Moderate confidence.",
          conversion_by_fit_band: [
            { segment: "70-100", attempts: 2, hires: 1, conversion_rate: 0.5 },
          ],
          conversion_by_desirability_band: [
            { segment: "7.0-10.0", attempts: 2, hires: 1, conversion_rate: 0.5 },
          ],
          conversion_by_model_family: [
            { segment: "openai", attempts: 2, hires: 1, conversion_rate: 0.5 },
          ],
          total_events: 2,
          total_roles_with_outcomes: 1,
        }}
        loading={false}
        onClose={vi.fn()}
        tuningSuggestions={{
          confidence_message: "Low confidence: early signal only.",
          suggestions: [
            {
              recommendation: "Prefer openai for new drafts.",
              rationale: "Current conversion appears stronger.",
              reversible_action: "Re-check after 5 additional events.",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText(/Moderate confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/70-100: 1\/2 \(50.0%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Prefer openai for new drafts/i)).toBeInTheDocument();
  });
});
