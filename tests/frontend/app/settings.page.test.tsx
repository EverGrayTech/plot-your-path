import { render, screen } from "@testing-library/react";
import React from "react";

import SettingsPage from "../../../src/frontend/app/settings/page";

describe("SettingsPage", () => {
  it("renders settings sections and desktop runtime guidance", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /AI Model Configuration/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Desktop runtime foundation/i }),
    ).toBeInTheDocument();
  });
});
