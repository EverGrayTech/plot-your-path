import { render, screen } from "@testing-library/react";

import DesirabilityFactorsPage from "../../src/app/settings/desirability/page";

const desirabilityFactorsSettingsClientPageMock = vi.fn(() => (
  <div>Desirability Factors Settings Client</div>
));

vi.mock("../../src/components/settings/DesirabilityFactorsSettingsClient", () => ({
  DesirabilityFactorsSettingsClient: () => desirabilityFactorsSettingsClientPageMock(),
}));

describe("DesirabilityFactorsPage", () => {
  it("renders the dedicated desirability settings page", () => {
    render(<DesirabilityFactorsPage />);

    expect(screen.getByText("Desirability Factors Settings Client")).toBeInTheDocument();
  });
});
