import { render, screen } from "@testing-library/react";
import React from "react";

import { DesktopStatusCard } from "../../../src/frontend/components/DesktopStatusCard";

describe("DesktopStatusCard", () => {
  it("renders the desktop runtime API and healthcheck details", () => {
    render(<DesktopStatusCard />);

    expect(
      screen.getByRole("heading", { name: /Desktop runtime foundation/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/launch the packaged backend automatically/i)).toBeInTheDocument();
    expect(
      screen.getByText(/workspace data stays in a local application folder/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/http:\/\/localhost:8000\/api\/health/i)).toBeInTheDocument();
  });
});
