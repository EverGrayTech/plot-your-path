import { render, screen } from "@testing-library/react";
import React from "react";

import { appMetadata } from "../../src/app-metadata";
import IntroductionPage from "../../src/app/introduction/page";

vi.mock("../../src/components/HomePageClient", () => ({
  HomePageClient: () => <div data-testid="home-page-client" />,
}));

describe("IntroductionPage", () => {
  it("renders the introduction view with intro content and app entry points", () => {
    render(<IntroductionPage />);

    const { overview } = appMetadata;

    expect(screen.getByTestId("home-page-client")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: overview.hero.title,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(overview.outcomes.title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: overview.outcomes.primaryCtaLabel })).toHaveAttribute(
      "href",
      overview.outcomes.primaryCtaHref,
    );
    expect(
      screen.getByRole("link", { name: overview.gettingStarted.primaryCtaLabel }),
    ).toHaveAttribute("href", overview.gettingStarted.primaryCtaHref);
    expect(
      screen.getByRole("link", { name: overview.gettingStarted.secondaryCtaLabel }),
    ).toHaveAttribute("href", overview.gettingStarted.secondaryCtaHref);
    expect(screen.getByLabelText(overview.loop.ariaLabel)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: overview.currentStatus.heading }),
    ).toBeInTheDocument();
  });
});
