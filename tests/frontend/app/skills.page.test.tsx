import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("opens skill detail modal and navigates to a referenced job", async () => {
    vi.spyOn(api, "listSkills").mockResolvedValue(skills);
    vi.spyOn(api, "getSkill").mockResolvedValue({
      id: 1,
      name: "Python",
      category: "language",
      usage_count: 3,
      jobs: [
        {
          id: 2,
          company: "Beta Co",
          title: "Engineer",
          status: "open",
          created_at: "2026-03-05T10:00:00Z",
        },
      ],
    });
    vi.spyOn(api, "getJob").mockResolvedValue({
      id: 2,
      company: {
        id: 10,
        name: "Beta Co",
        slug: "beta-co",
        website: null,
        created_at: "2026-03-05T10:00:00Z",
      },
      title: "Engineer",
      team_division: "Platform",
      salary: { min: 120000, max: 150000, currency: "USD" },
      url: "https://example.com/jobs/2",
      skills: {
        required: [{ id: 1, name: "Python", requirement_level: "required" }],
        preferred: [{ id: 2, name: "FastAPI", requirement_level: "preferred" }],
      },
      description_md: "",
      created_at: "2026-03-05T10:00:00Z",
      status: "open",
      status_history: [],
      latest_fit_analysis: null,
    });

    render(<SkillsPageClient />);

    await screen.findByText("Python");
    fireEvent.click(screen.getByRole("button", { name: /Python/i }));

    expect(await screen.findByRole("heading", { name: "Skill Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Used in 3 captured jobs.")).toBeInTheDocument();

    const skillModal = await screen.findByRole("dialog");
    fireEvent.click(within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i }));
    expect(await screen.findByRole("heading", { name: "Job Detail" })).toBeInTheDocument();
  }, 20000);
});
