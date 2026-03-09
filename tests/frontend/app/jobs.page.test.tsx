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
      desirability_score: 8.1,
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
      desirability_score: null,
    },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(api, "listApplicationMaterials").mockResolvedValue([]);
    vi.spyOn(api, "listInterviewPrepPacks").mockResolvedValue([]);
    vi.spyOn(api, "listResumeTuning").mockResolvedValue([]);
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
      latest_desirability_score: null,
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
      latest_desirability_score: null,
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
  }, 20000);

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
      latest_desirability_score: null,
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));

    expect(await screen.findByRole("heading", { name: "Job Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Required skills")).toBeInTheDocument();
    expect(await screen.findByText("Python")).toBeInTheDocument();
  }, 15000);

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
      latest_desirability_score: null,
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
    expect(
      within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i }),
    ).toBeInTheDocument();
  }, 20000);

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
      latest_desirability_score: null,
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
  }, 20000);

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
        latest_desirability_score: null,
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
        latest_desirability_score: null,
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
      desirability_score: 8.1,
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));
    fireEvent.change(await screen.findByLabelText("Update status"), {
      target: { value: "submitted" },
    });

    expect(await screen.findByText(/open → submitted/i)).toBeInTheDocument();
  }, 15000);

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
      latest_desirability_score: null,
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

    expect(fitAnalysisSection).toHaveTextContent(
      /Rationale:\s*Strong match based on core skills\./i,
    );
  }, 20000);

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
      latest_desirability_score: null,
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

  it("generates and renders application materials in job detail", async () => {
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
      latest_desirability_score: null,
    });
    const listMaterialsSpy = vi
      .spyOn(api, "listApplicationMaterials")
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 11,
          role_id: 2,
          artifact_type: "cover_letter",
          version: 1,
          content: "Dear hiring manager...",
          questions: null,
          provider: "openai",
          model: "gpt-4o",
          prompt_version: "cover-letter-v1",
          created_at: "2026-03-07T18:10:00Z",
        },
      ]);
    vi.spyOn(api, "generateCoverLetter").mockResolvedValue({
      id: 11,
      role_id: 2,
      artifact_type: "cover_letter",
      version: 1,
      content: "Dear hiring manager...",
      questions: null,
      provider: "openai",
      model: "gpt-4o",
      prompt_version: "cover-letter-v1",
      created_at: "2026-03-07T18:10:00Z",
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Generate Cover Letter" }));

    await waitFor(() => {
      expect(listMaterialsSpy).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Dear hiring manager...")).toBeInTheDocument();
  }, 20000);

  it("opens AI settings, shows masked token, and saves updated token", async () => {
    vi.spyOn(api, "listJobs").mockResolvedValue(jobs);
    vi.spyOn(api, "listAISettings")
      .mockResolvedValueOnce([
        {
          operation_family: "job_parsing",
          provider: "openai",
          model: "gpt-4o",
          api_key_env: "OPENAI_API_KEY",
          base_url: null,
          temperature: 0.1,
          max_tokens: 4000,
          has_runtime_token: true,
          token_masked: "••••••••7890",
          created_at: "2026-03-07T18:01:00Z",
          updated_at: "2026-03-07T18:01:00Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          operation_family: "job_parsing",
          provider: "openai",
          model: "gpt-4o",
          api_key_env: "OPENAI_API_KEY",
          base_url: null,
          temperature: 0.1,
          max_tokens: 4000,
          has_runtime_token: true,
          token_masked: "••••••••0000",
          created_at: "2026-03-07T18:01:00Z",
          updated_at: "2026-03-07T18:02:00Z",
        },
      ]);
    const updateTokenSpy = vi.spyOn(api, "updateAISettingToken").mockResolvedValue({
      operation_family: "job_parsing",
      provider: "openai",
      model: "gpt-4o",
      api_key_env: "OPENAI_API_KEY",
      base_url: null,
      temperature: 0.1,
      max_tokens: 4000,
      has_runtime_token: true,
      token_masked: "••••••••0000",
      created_at: "2026-03-07T18:01:00Z",
      updated_at: "2026-03-07T18:02:00Z",
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: "AI Settings" }));

    expect(await screen.findByText(/Runtime token:\s*••••••••7890/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Paste token"), {
      target: { value: "sk-test-0000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Token" }));

    await waitFor(() => {
      expect(updateTokenSpy).toHaveBeenCalledWith("job_parsing", "sk-test-0000");
    });
  });

  it("shows pipeline rows and filters by stage with attention indicators", async () => {
    vi.spyOn(api, "listJobs").mockResolvedValue(jobs);
    vi.spyOn(api, "listPipeline").mockResolvedValue({
      counters: {
        needs_follow_up: 1,
        overdue_actions: 1,
        upcoming_deadlines: 1,
      },
      items: [
        {
          role_id: 2,
          company: "Beta Co",
          title: "Engineer",
          status: "open",
          interview_stage: "technical",
          next_action_at: "2026-03-05T10:00:00Z",
          deadline_at: "2026-03-07T17:00:00Z",
          needs_attention: true,
          attention_reasons: ["Overdue next action"],
          updated_at: "2026-03-04T10:00:00Z",
        },
        {
          role_id: 1,
          company: "Acme Corp",
          title: "Developer",
          status: "submitted",
          interview_stage: "applied",
          next_action_at: null,
          deadline_at: null,
          needs_attention: false,
          attention_reasons: [],
          updated_at: "2026-03-05T10:00:00Z",
        },
      ],
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: "Pipeline" }));

    const pipelineHeading = await screen.findByRole("heading", { name: "Application Pipeline" });
    const pipelineDialog = pipelineHeading.closest("dialog") as HTMLElement;
    expect(within(pipelineDialog).getByText(/Needs follow-up:/i)).toBeInTheDocument();
    expect(within(pipelineDialog).getByText(/Overdue next action/i)).toBeInTheDocument();
    expect(
      within(pipelineDialog).getByRole("button", { name: /Engineer — Beta Co/i }),
    ).toBeInTheDocument();

    fireEvent.change(within(pipelineDialog).getByLabelText("Stage"), {
      target: { value: "applied" },
    });

    expect(
      within(pipelineDialog).queryByRole("button", { name: /Engineer — Beta Co/i }),
    ).not.toBeInTheDocument();
    expect(
      within(pipelineDialog).getByRole("button", { name: /Developer — Acme Corp/i }),
    ).toBeInTheDocument();
  });

  it("generates, edits, and regenerates interview prep pack sections", async () => {
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
      latest_desirability_score: null,
    });

    vi.spyOn(api, "generateInterviewPrepPack").mockResolvedValue({
      id: 900,
      role_id: 2,
      artifact_type: "interview_prep_pack",
      version: 1,
      sections: {
        likely_questions: ["Why this role?"],
        talking_points: ["Strong fit to required skills"],
        star_stories: ["STAR draft one"],
      },
      provider: "openai",
      model: "gpt-4o",
      prompt_version: "interview-prep-pack-v1",
      created_at: "2026-03-07T18:10:00Z",
    });

    const listPrepSpy = vi
      .spyOn(api, "listInterviewPrepPacks")
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 900,
          role_id: 2,
          artifact_type: "interview_prep_pack",
          version: 1,
          sections: {
            likely_questions: ["Why this role?"],
            talking_points: ["Strong fit to required skills"],
            star_stories: ["STAR draft one"],
          },
          provider: "openai",
          model: "gpt-4o",
          prompt_version: "interview-prep-pack-v1",
          created_at: "2026-03-07T18:10:00Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 901,
          role_id: 2,
          artifact_type: "interview_prep_pack",
          version: 2,
          sections: {
            likely_questions: ["Tell us about your impact."],
            talking_points: ["Strong fit to required skills"],
            star_stories: ["STAR draft one"],
          },
          provider: "openai",
          model: "gpt-4o",
          prompt_version: "interview-prep-pack-v1",
          created_at: "2026-03-07T18:15:00Z",
        },
      ]);

    const updatePrepSpy = vi.spyOn(api, "updateInterviewPrepPack").mockResolvedValue({
      id: 900,
      role_id: 2,
      artifact_type: "interview_prep_pack",
      version: 1,
      sections: {
        likely_questions: ["Why this role?", "How do you prioritize?"],
        talking_points: ["Strong fit to required skills"],
        star_stories: ["STAR draft one"],
      },
      provider: "openai",
      model: "gpt-4o",
      prompt_version: "interview-prep-pack-v1",
      created_at: "2026-03-07T18:10:00Z",
    });

    const regenerateSpy = vi.spyOn(api, "regenerateInterviewPrepSection").mockResolvedValue({
      id: 901,
      role_id: 2,
      artifact_type: "interview_prep_pack",
      version: 2,
      sections: {
        likely_questions: ["Tell us about your impact."],
        talking_points: ["Strong fit to required skills"],
        star_stories: ["STAR draft one"],
      },
      provider: "openai",
      model: "gpt-4o",
      prompt_version: "interview-prep-pack-v1",
      created_at: "2026-03-07T18:15:00Z",
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));

    fireEvent.click(await screen.findByRole("button", { name: "Generate Interview Prep Pack" }));

    await waitFor(() => {
      expect(listPrepSpy).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByDisplayValue("Why this role?")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Likely questions (one per line)"), {
      target: { value: "Why this role?\nHow do you prioritize?" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Interview Prep Edits" }));

    await waitFor(() => {
      expect(updatePrepSpy).toHaveBeenCalledWith(2, 900, {
        likely_questions: ["Why this role?", "How do you prioritize?"],
        talking_points: ["Strong fit to required skills"],
        star_stories: ["STAR draft one"],
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "Regenerate Questions" }));
    await waitFor(() => {
      expect(regenerateSpy).toHaveBeenCalledWith(2, "likely_questions");
      expect(listPrepSpy).toHaveBeenCalledTimes(3);
    });
    expect(await screen.findByDisplayValue("Tell us about your impact.")).toBeInTheDocument();
  }, 20000);

  it("syncs profile and generates resume tuning suggestions", async () => {
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
      latest_desirability_score: null,
    });

    vi.spyOn(api, "syncResumeProfile").mockResolvedValue({
      ingested_count: 2,
      source_record_id: "resume.md",
      source_used: "resume.md",
    });
    vi.spyOn(api, "generateResumeTuning").mockResolvedValue({
      id: 1001,
      role_id: 2,
      artifact_type: "resume_tuning",
      version: 1,
      sections: {
        keep_bullets: ["Keep measurable impact bullet"],
        remove_bullets: ["Remove generic bullet"],
        emphasize_bullets: ["Emphasize API scale outcomes"],
        missing_keywords: ["observability"],
        summary_tweaks: ["Lead with platform impact"],
        confidence_notes: ["High confidence for required-skill alignment"],
      },
      provider: "openai",
      model: "gpt-4o",
      prompt_version: "resume-tuning-v1",
      created_at: "2026-03-07T18:20:00Z",
    });

    const listResumeTuningSpy = vi
      .spyOn(api, "listResumeTuning")
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 1001,
          role_id: 2,
          artifact_type: "resume_tuning",
          version: 1,
          sections: {
            keep_bullets: ["Keep measurable impact bullet"],
            remove_bullets: ["Remove generic bullet"],
            emphasize_bullets: ["Emphasize API scale outcomes"],
            missing_keywords: ["observability"],
            summary_tweaks: ["Lead with platform impact"],
            confidence_notes: ["High confidence for required-skill alignment"],
          },
          provider: "openai",
          model: "gpt-4o",
          prompt_version: "resume-tuning-v1",
          created_at: "2026-03-07T18:20:00Z",
        },
      ]);

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));

    fireEvent.click(await screen.findByRole("button", { name: "Sync Resume Profile" }));
    expect(
      await screen.findByText(/Synced 2 resume section\(s\) from resume\.md/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Generate Resume Tuning" }));

    await waitFor(() => {
      expect(listResumeTuningSpy).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Keep measurable impact bullet")).toBeInTheDocument();
    expect(screen.getByText("observability")).toBeInTheDocument();
  }, 20000);
});
