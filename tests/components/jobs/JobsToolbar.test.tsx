import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { JobsToolbar } from "../../../src/components/jobs/JobsToolbar";

describe("JobsToolbar", () => {
  it("wires search, sort, filter, and action callbacks", () => {
    const onOpenAISettings = vi.fn();
    const onOpenCapture = vi.fn();
    const onOpenFactorSettings = vi.fn();
    const onOpenOutcomeInsights = vi.fn();
    const onOpenPipeline = vi.fn();
    const setDesirabilityFilter = vi.fn();
    const setRecommendationFilter = vi.fn();
    const setSearch = vi.fn();
    const setSortMode = vi.fn();

    render(
      <JobsToolbar
        desirabilityFilter="all"
        onOpenAISettings={onOpenAISettings}
        onOpenCapture={onOpenCapture}
        onOpenFactorSettings={onOpenFactorSettings}
        onOpenOutcomeInsights={onOpenOutcomeInsights}
        onOpenPipeline={onOpenPipeline}
        recommendationFilter="all"
        search=""
        setDesirabilityFilter={setDesirabilityFilter}
        setRecommendationFilter={setRecommendationFilter}
        setSearch={setSearch}
        setSortMode={setSortMode}
        smartSortDescription="Smart Sort default"
        sortMode="newest"
      />,
    );

    fireEvent.change(screen.getByLabelText("Search jobs"), {
      target: { value: "beta" },
    });
    fireEvent.change(screen.getByLabelText("Sort jobs"), {
      target: { value: "company_az" },
    });
    fireEvent.change(screen.getByLabelText("Recommendation"), {
      target: { value: "go" },
    });
    fireEvent.change(screen.getByLabelText("Desirability"), {
      target: { value: "scored" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Job" }));
    fireEvent.click(screen.getByRole("button", { name: "Pipeline" }));
    fireEvent.click(screen.getByRole("button", { name: "Outcome Insights" }));
    fireEvent.click(screen.getByRole("button", { name: "Factor Settings" }));
    fireEvent.click(screen.getByRole("button", { name: "AI Settings" }));

    expect(setSearch).toHaveBeenCalledWith("beta");
    expect(setSortMode).toHaveBeenCalledWith("company_az");
    expect(setRecommendationFilter).toHaveBeenCalledWith("go");
    expect(setDesirabilityFilter).toHaveBeenCalledWith("scored");
    expect(onOpenCapture).toHaveBeenCalledTimes(1);
    expect(onOpenPipeline).toHaveBeenCalledTimes(1);
    expect(onOpenOutcomeInsights).toHaveBeenCalledTimes(1);
    expect(onOpenFactorSettings).toHaveBeenCalledTimes(1);
    expect(onOpenAISettings).toHaveBeenCalledTimes(1);
  });
});
