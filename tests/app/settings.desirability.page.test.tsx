import { render, screen } from "@testing-library/react";

import DesirabilityFactorsPage from "../../src/app/settings/desirability/page";

describe("DesirabilityFactorsPage", () => {
  it("renders the dedicated desirability settings page", () => {
    render(<DesirabilityFactorsPage />);

    expect(screen.getByRole("heading", { name: "Desirability Factors" })).toBeInTheDocument();
    expect(screen.getByText(/Settings relocation in progress/i)).toBeInTheDocument();
  });
});
