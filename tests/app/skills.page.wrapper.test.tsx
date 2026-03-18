import { render, screen } from "@testing-library/react";
import React from "react";

import SkillsPage from "../../src/app/skills/page";

vi.mock("../../src/components/SkillsPageClient", () => ({
  SkillsPageClient: () => <div>Mock Skills Page Client</div>,
}));

describe("SkillsPage", () => {
  it("renders the skills page client", () => {
    render(<SkillsPage />);

    expect(screen.getByText("Mock Skills Page Client")).toBeInTheDocument();
  });
});
