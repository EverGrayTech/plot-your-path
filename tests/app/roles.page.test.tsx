import { render, screen } from "@testing-library/react";
import React from "react";

import RolesPage from "../../src/app/roles/page";

vi.mock("../../src/components/RolesPageClient", () => ({
  RolesPageClient: () => <div>Mock Roles Page Client</div>,
}));

describe("RolesPage", () => {
  it("renders the roles page client", () => {
    render(<RolesPage />);

    expect(screen.getByText("Mock Roles Page Client")).toBeInTheDocument();
  });
});
