import { render, screen } from "@testing-library/react";
import HomePage from "../../src/app/page";

vi.mock("../../src/components/RootEntryRedirect", () => ({
  RootEntryRedirect: () => <div data-testid="root-entry-redirect" />,
}));

describe("HomePage", () => {
  it("renders the root entry redirector", () => {
    render(<HomePage />);

    expect(screen.getByTestId("root-entry-redirect")).toBeInTheDocument();
  });
});
