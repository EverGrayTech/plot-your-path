import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
      status: "open",
      fit_score: 76,
      fit_recommendation: "go",
    },
    {
      id: 1,
      company: "Acme Corp",
      title: "Developer",
      salary_range: null,
      created_at: "2026-03-01T10:00:00Z",
      skills_count: 2,
      status: "submitted",
      fit_score: null,
      fit_recommendation: null,
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

  it("resets filters and refreshes list after capture so new job is visible", async () => {
    vi.spyOn(api, "listJobs").mockResolvedValue(jobs);
    vi.spyOn(api, "scrapeJob").mockResolvedValue({
      status: "success",
      role_id: 100,
      company: "New Co",
      title: "New Role",
      skills_extracted: 5,
      processing_time_seconds: 1.1,
    });
    vi.spyOn(api, "getJob").mockResolvedValue({
      id: 100,
      company: {
        id: 11,
        name: "New Co",
        slug: "new-co",
        website: null,
        created_at: "2026-03-06T12:00:00Z",
      },
      title: "New Role",
      team_division: null,
      salary: { min: null, max: null, currency: "USD" },
      url: "https://example.com/jobs/new",
      skills: { required: [], preferred: [] },
      description_md: "",
      created_at: "2026-03-06T12:00:00Z",
      status: "open",
      status_history: [],
      latest_fit_analysis: null,
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");

    fireEvent.change(screen.getByLabelText("Search jobs"), {
      target: { value: "acme" },
    });
    fireEvent.change(screen.getByLabelText("Sort jobs"), {
      target: { value: "oldest" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Job" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/new" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    await waitFor(() => {
      expect(api.listJobs).toHaveBeenCalledTimes(2);
      expect(screen.getByLabelText("Search jobs")).toHaveValue("");
      expect(screen.getByLabelText("Sort jobs")).toHaveValue("newest");
    });

    expect(
      screen.getByText(/Captured New Role at New Co. Filters were reset so it is visible./i),
    ).toBeInTheDocument();
  }, 10000);

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

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));

    expect(await screen.findByRole("heading", { name: "Job Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Required skills")).toBeInTheDocument();
    expect(await screen.findByText("Python")).toBeInTheDocument();
  });

  it("navigates from job skill to skill detail", async () => {
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
    vi.spyOn(api, "getSkill").mockResolvedValue({
      id: 1,
      name: "Python",
      category: "language",
      usage_count: 1,
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

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Python" }));

    const skillHeading = await screen.findByRole("heading", { name: "Skill Detail" });
    const skillModal = skillHeading.closest("dialog") as HTMLElement;
    expect(within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i })).toBeInTheDocument();
  }, 10000);

  it("supports preferred skill link navigation from job detail", async () => {
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
    const getSkillSpy = vi.spyOn(api, "getSkill").mockResolvedValue({
      id: 2,
      name: "FastAPI",
      category: "tool",
      usage_count: 1,
      jobs: [],
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));
    fireEvent.click(await screen.findByRole("button", { name: "FastAPI" }));

    expect(getSkillSpy).toHaveBeenCalledWith(2);
    expect(await screen.findByRole("heading", { name: "Skill Detail" })).toBeInTheDocument();
  }, 10000);

  it("updates status and renders status history", async () => {
    vi.spyOn(api, "listJobs").mockResolvedValue(jobs);
    vi.spyOn(api, "getJob")
      .mockResolvedValueOnce({
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
      })
      .mockResolvedValueOnce({
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
        status: "submitted",
        status_history: [
          {
            from_status: "open",
            to_status: "submitted",
            changed_at: "2026-03-06T12:00:00Z",
          },
        ],
        latest_fit_analysis: null,
      });

    vi.spyOn(api, "updateJobStatus").mockResolvedValue({
      id: 2,
      company: "Beta Co",
      title: "Engineer",
      salary_range: "$120,000 - $150,000 USD",
      created_at: "2026-03-05T10:00:00Z",
      skills_count: 3,
      status: "submitted",
      fit_score: 76,
      fit_recommendation: "go",
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));
    fireEvent.change(await screen.findByLabelText("Update status"), {
      target: { value: "submitted" },
    });

    expect(await screen.findByText(/open → submitted/i)).toBeInTheDocument();
  });

  it("analyzes fit from job detail and renders result", async () => {
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
    vi.spyOn(api, "analyzeJobFit").mockResolvedValue({
      id: 90,
      role_id: 2,
      fit_score: 84,
      recommendation: "go",
      covered_required_skills: ["Python"],
      missing_required_skills: [],
      covered_preferred_skills: ["FastAPI"],
      missing_preferred_skills: [],
      rationale: "Strong match based on core skills.",
      provider: "openai",
      model: "gpt-4o",
      version: "fit-v1",
      created_at: "2026-03-07T18:00:00Z",
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Analyze Fit" }));

    const fitAnalysisHeading = await screen.findByRole("heading", { name: "Fit analysis" });
    const fitAnalysisSection = fitAnalysisHeading.closest("section") as HTMLElement;

    expect(fitAnalysisSection).toHaveTextContent(/Recommendation:\s*Go/i);
    expect(fitAnalysisSection).toHaveTextContent(/Fit score:\s*84\s*%/i);

    expect(fitAnalysisSection).toHaveTextContent(/Rationale:\s*Strong match based on core skills\./i);
  }, 10000);

  it("filters jobs by recommendation including not analyzed", async () => {
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

    render(<JobsPageClient />);

    await screen.findByText("Engineer");

    fireEvent.change(screen.getByLabelText("Recommendation"), {
      target: { value: "go" },
    });
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.queryByText("Developer")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Recommendation"), {
      target: { value: "not_analyzed" },
    });
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.queryByText("Engineer")).not.toBeInTheDocument();
  });
});
