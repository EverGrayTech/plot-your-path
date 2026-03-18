import { render, screen } from "@testing-library/react";
import React from "react";

import JobsPage from "../../src/app/jobs/page";

vi.mock("../../src/components/JobsPageClient", () => ({
  JobsPageClient: () => <div>Mock Jobs Page Client</div>,
}));

describe("JobsPage", () => {
  it("renders the jobs page client", () => {
    render(<JobsPage />);

    expect(screen.getByText("Mock Jobs Page Client")).toBeInTheDocument();
  });
});
