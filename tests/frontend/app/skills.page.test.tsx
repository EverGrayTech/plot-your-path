import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { SkillsPageClient } from "../../../src/frontend/components/SkillsPageClient";
import * as api from "../../../src/frontend/lib/api";

describe("SkillsPageClient", () => {
  const skills: api.SkillListItem[] = [
    { id: 1, name: "Python", category: "language", usage_count: 3 },
    { id: 2, name: "FastAPI", category: "tool", usage_count: 2 },
    { id: 3, name: "Leadership", category: "soft", usage_count: 1 },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders skills list and supports search + sort", async () => {
    vi.spyOn(api, "listSkills").mockResolvedValue(skills);

    render(<SkillsPageClient />);

    expect(await screen.findByText("Python")).toBeInTheDocument();
    expect(screen.getByText("FastAPI")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search skills"), {
      target: { value: "lead" },
    });

    expect(screen.getByText("Leadership")).toBeInTheDocument();
    expect(screen.queryByText("Python")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search skills"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Sort skills"), {
      target: { value: "name_az" },
    });

    const listItems = screen.getAllByRole("listitem");
    expect(listItems[0]).toHaveTextContent("FastAPI");
    expect(listItems[1]).toHaveTextContent("Leadership");
    expect(listItems[2]).toHaveTextContent("Python");
  });

  it("opens skill detail modal from row click", async () => {
    vi.spyOn(api, "listSkills").mockResolvedValue(skills);

    render(<SkillsPageClient />);

    await screen.findByText("Python");
    fireEvent.click(screen.getByRole("button", { name: /Python/i }));

    expect(await screen.findByRole("heading", { name: "Skill Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Used in 3 captured jobs.")).toBeInTheDocument();
  });
});
