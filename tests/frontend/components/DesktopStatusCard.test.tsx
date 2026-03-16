import { render, screen } from "@testing-library/react";
import React from "react";

import { DesktopStatusCard } from "../../../src/frontend/components/DesktopStatusCard";

describe("DesktopStatusCard", () => {
  it("renders the active browser-local architecture guidance", () => {
    render(<DesktopStatusCard />);

    expect(screen.getByRole("heading", { name: /Architecture status/i })).toBeInTheDocument();
    expect(screen.getByText(/active MVP path is a browser-hosted, local-first web application/i)).toBeInTheDocument();
    expect(
      screen.getByText(/workspace data is expected to stay local to this browser\/device/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Legacy path retirement/i)).toBeInTheDocument();
    expect(screen.getByText(/browser-local workspace \+ explicit backups/i)).toBeInTheDocument();
    expect(screen.queryByText(/Active browser API base/i)).not.toBeInTheDocument();
  });
});
