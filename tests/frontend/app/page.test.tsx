import { render, screen } from "@testing-library/react";
import React from "react";

import CapturePage from "../../../src/frontend/app/page";

describe("CapturePage", () => {
  it("renders page heading and URL-first helper text", () => {
    render(<CapturePage />);

    expect(screen.getByRole("heading", { name: "MVP Job Capture" })).toBeInTheDocument();
    expect(
      screen.getByText("Paste a job URL first. If needed, you can fall back to pasted job text."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Job URL")).toBeInTheDocument();
  });
});
