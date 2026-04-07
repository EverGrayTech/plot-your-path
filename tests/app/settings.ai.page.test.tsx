import { render, screen } from "@testing-library/react";

vi.mock("../../src/components/settings/AISettingsSurfaceClient", () => ({
  AISettingsSurfaceClient: () => <div data-testid="ai-settings-surface">Mock AI settings</div>,
}));

import AIConfigurationPage from "../../src/app/settings/ai/page";

describe("AIConfigurationPage", () => {
  it("renders the dedicated AI configuration page", () => {
    render(<AIConfigurationPage />);

    expect(screen.getByTestId("ai-settings-surface")).toBeInTheDocument();
  });
});
