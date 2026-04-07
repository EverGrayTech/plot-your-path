import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { RolesToolbar } from "../../../src/components/roles/RolesToolbar";

describe("RolesToolbar", () => {
  it("wires search, sort, filter, and action callbacks", () => {
    const onOpenCapture = vi.fn();
    const onOpenOutcomeInsights = vi.fn();
    const onOpenPipeline = vi.fn();
    const setDesirabilityFilter = vi.fn();
    const setRecommendationFilter = vi.fn();
    const setSearch = vi.fn();
    const setSortMode = vi.fn();

    render(
      <RolesToolbar
        desirabilityFilter="all"
        onOpenCapture={onOpenCapture}
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

    fireEvent.change(screen.getByLabelText("Search roles"), {
      target: { value: "beta" },
    });
    fireEvent.change(screen.getByLabelText("Sort roles"), {
      target: { value: "company_az" },
    });
    fireEvent.change(screen.getByLabelText("Recommendation"), {
      target: { value: "go" },
    });
    fireEvent.change(screen.getByLabelText("Desirability"), {
      target: { value: "scored" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Role" }));
    fireEvent.click(screen.getByRole("button", { name: "Pipeline" }));
    fireEvent.click(screen.getByRole("button", { name: "Outcome Insights" }));

    expect(setSearch).toHaveBeenCalledWith("beta");
    expect(setSortMode).toHaveBeenCalledWith("company_az");
    expect(setRecommendationFilter).toHaveBeenCalledWith("go");
    expect(setDesirabilityFilter).toHaveBeenCalledWith("scored");
    expect(onOpenCapture).toHaveBeenCalledTimes(1);
    expect(onOpenPipeline).toHaveBeenCalledTimes(1);
    expect(onOpenOutcomeInsights).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/Desirability factor management now lives under Settings/i),
    ).toBeInTheDocument();
  });
});
