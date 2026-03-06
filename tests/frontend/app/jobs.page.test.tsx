import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { JobsPageClient } from "../../../src/frontend/components/JobsPageClient";
import * as api from "../../../src/frontend/lib/api";

describe("JobsPageClient", () => {
  const jobs: api.JobListItem[] = [
    {
      id: 2,
      company: "Beta Co",
      title: "Engineer",
      salary_range: "$120,000 - $150,000 USD",
      created_at: "2026-03-05T10:00:00Z",
      skills_count: 3,
      status: "active",
    },
    {
      id: 1,
      company: "Acme Corp",
      title: "Developer",
      salary_range: null,
      created_at: "2026-03-01T10:00:00Z",
      skills_count: 2,
      status: "applied",
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads jobs and applies search + sort controls", async () => {
    vi.spyOn(api, "listJobs").mockResolvedValue(jobs);
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
      skills: { required: ["Python"], preferred: ["FastAPI"] },
      description_md: "",
      created_at: "2026-03-05T10:00:00Z",
      status: "active",
    });

    render(<JobsPageClient />);

    expect(await screen.findByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText("Developer")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search jobs"), {
      target: { value: "beta" },
    });

    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Developer")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search jobs"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Sort jobs"), {
      target: { value: "company_az" },
    });

    const listItems = screen.getAllByRole("listitem");
    expect(listItems[0]).toHaveTextContent("Developer");
    expect(listItems[1]).toHaveTextContent("Engineer");
  });

  it("opens capture modal and refreshes list after success", async () => {
    vi.spyOn(api, "listJobs").mockResolvedValue(jobs);
    vi.spyOn(api, "scrapeJob").mockResolvedValue({
      status: "success",
      role_id: 100,
      company: "New Co",
      title: "New Role",
      skills_extracted: 5,
      processing_time_seconds: 1.1,
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");

    fireEvent.click(screen.getByRole("button", { name: "Add Job" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/new" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    await waitFor(() => {
      expect(api.listJobs).toHaveBeenCalledTimes(2);
    });
  });

  it("opens job detail modal from row click", async () => {
    vi.spyOn(api, "listJobs").mockResolvedValue(jobs);
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
      skills: { required: ["Python"], preferred: ["FastAPI"] },
      description_md: "",
      created_at: "2026-03-05T10:00:00Z",
      status: "active",
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));

    expect(await screen.findByRole("heading", { name: "Job Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Required skills")).toBeInTheDocument();
    expect(await screen.findByText("Python")).toBeInTheDocument();
  });
});
