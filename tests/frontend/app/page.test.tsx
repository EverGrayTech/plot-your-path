import { render, screen } from "@testing-library/react";
import React from "react";

import HomePage from "../../../src/frontend/app/page";

describe("HomePage", () => {
  it("renders a landing view with navigation cards", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText(/Capture opportunities/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Start here/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start here/i })).toHaveAttribute("href", "/jobs");
    expect(screen.getAllByRole("link", { name: /Jobs/ })[0]).toHaveAttribute("href", "/jobs");
    expect(screen.getByRole("link", { name: /Skills/ })).toHaveAttribute("href", "/skills");
    expect(screen.getByRole("heading", { name: /Product architecture status/i })).toBeInTheDocument();
    expect(screen.getByText(/Architecture boundary/i)).toBeInTheDocument();
  });
});
