import { render, screen } from "@testing-library/react";

vi.mock("../../src/components/settings/AISettingsPanel", () => ({
  AISettingsPanel: () => <div data-testid="ai-settings-panel">Mock AI settings panel</div>,
}));

import AIConfigurationPage from "../../src/app/settings/ai/page";

describe("AIConfigurationPage", () => {
  it("renders the dedicated AI configuration page", () => {
    render(<AIConfigurationPage />);

    expect(screen.getByRole("heading", { name: "AI Configuration" })).toBeInTheDocument();
    expect(screen.getByTestId("ai-settings-panel")).toBeInTheDocument();
  });
});
