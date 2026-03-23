import { render, screen } from "@testing-library/react";
import React from "react";

import IntroductionPage from "../../src/app/introduction/page";

vi.mock("../../src/components/HomePageClient", () => ({
  HomePageClient: () => <div data-testid="home-page-client" />,
}));

describe("IntroductionPage", () => {
  it("renders the introduction view with intro content and app entry points", () => {
    render(<IntroductionPage />);

    expect(screen.getByTestId("home-page-client")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Make better career decisions with clarity and confidence\./i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Start with the decision, not the busywork\./i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start evaluating Roles/i })).toHaveAttribute(
      "href",
      "/roles",
    );
    expect(screen.getByRole("link", { name: /Start with Roles/i })).toHaveAttribute(
      "href",
      "/roles",
    );
    expect(screen.getByRole("link", { name: /Explore Skills/i })).toHaveAttribute(
      "href",
      "/skills",
    );
    expect(screen.getByLabelText(/Reinforcing career decision loop/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /MVP \/ public preview/i })).toBeInTheDocument();
  });
});
