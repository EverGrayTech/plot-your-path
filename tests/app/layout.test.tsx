/* @jsxRuntime classic */
import { render, screen } from "@testing-library/react";
import React from "react";

import RootLayout from "../../src/app/layout";

vi.mock("../../src/components/shell/AppShell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

describe("RootLayout", () => {
  it("wraps page content in the app shell", () => {
    render(
      <RootLayout>
        <div>Child content</div>
      </RootLayout>,
    );

    expect(screen.getByTestId("app-shell")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute("lang", "en");
  });
});
