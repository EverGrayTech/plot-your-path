import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { indexedDB } from "fake-indexeddb";
import React from "react";

import { JobsPageClient } from "../../../src/frontend/components/JobsPageClient";
import * as api from "../../../src/frontend/lib/browserApi";
import { setFrontendServicesForTests } from "../../../src/frontend/lib/services";
import type { FrontendServices } from "../../../src/frontend/lib/services/types";
import { setJobsLoaderForTests } from "../../../src/frontend/lib/useJobsBoard";

const baseJobDetail: api.JobDetail = {
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
};

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
    setJobsLoaderForTests(null);
    setFrontendServicesForTests(null);
    (globalThis as { fetch?: typeof fetch }).fetch = undefined;
  });

  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });
    vi.spyOn(api, "listApplicationMaterials").mockResolvedValue([]);
    vi.spyOn(api, "listInterviewPrepPacks").mockResolvedValue([]);
    vi.spyOn(api, "listResumeTuning").mockResolvedValue([]);
    vi.spyOn(api, "getJob").mockResolvedValue(baseJobDetail);
    setJobsLoaderForTests(async () => jobs);
    const services = {
      jobs: {
        getJob: api.getJob,
        listJobs: api.listJobs,
        scrapeJob: api.scrapeJob,
        updateJobStatus: api.updateJobStatus,
      },
      skills: {
        getSkill: api.getSkill,
        listSkills: api.listSkills,
      },
      workflows: {
        createOutcomeEvent: api.createOutcomeEvent,
        getApplicationOps: api.getApplicationOps,
        getOutcomeInsights: api.getOutcomeInsights,
        getOutcomeTuningSuggestions: api.getOutcomeTuningSuggestions,
        listInterviewStages: api.listInterviewStages,
        listOutcomeEvents: api.listOutcomeEvents,
        listPipeline: api.listPipeline,
        updateInterviewStage: api.updateInterviewStage,
        updateNextAction: api.updateNextAction,
        upsertApplicationOps: api.upsertApplicationOps,
      },
      aiSettings: {
        clearAISettingToken: api.clearAISettingToken,
        healthcheckAISetting: api.healthcheckAISetting,
        listAISettings: api.listAISettings,
        updateAISetting: api.updateAISetting,
        updateAISettingToken: api.updateAISettingToken,
      },
      aiGeneration: {
        analyzeJobFit: api.analyzeJobFit,
        generateCoverLetter: api.generateCoverLetter,
        generateInterviewPrepPack: api.generateInterviewPrepPack,
        generateQuestionAnswers: api.generateQuestionAnswers,
        generateResumeTuning: api.generateResumeTuning,
        listApplicationMaterials: api.listApplicationMaterials,
        listInterviewPrepPacks: api.listInterviewPrepPacks,
        listResumeTuning: api.listResumeTuning,
        refreshDesirabilityScore: api.refreshDesirabilityScore,
        regenerateInterviewPrepSection: api.regenerateInterviewPrepSection,
        scoreJobDesirability: api.scoreJobDesirability,
        syncResumeProfile: api.syncResumeProfile,
        updateInterviewPrepPack: api.updateInterviewPrepPack,
      },
      desirabilityFactors: {
        createDesirabilityFactor: api.createDesirabilityFactor,
        deleteDesirabilityFactor: api.deleteDesirabilityFactor,
        listDesirabilityFactors: api.listDesirabilityFactors,
        reorderDesirabilityFactors: api.reorderDesirabilityFactors,
        updateDesirabilityFactor: api.updateDesirabilityFactor,
      },
      portability: {
        exportDataArchive: api.exportDataArchive,
        getDataPortabilitySummary: api.getDataPortabilitySummary,
        importDataArchive: api.importDataArchive,
        resetDataWorkspace: api.resetDataWorkspace,
      },
    } satisfies FrontendServices;
    setFrontendServicesForTests(services);
    global.fetch = vi.fn(async () => {
      throw new Error("Unexpected fetch in JobsPageClient test");
    }) as typeof fetch;
  });

  it("loads jobs and applies search + sort controls", async () => {
    setJobsLoaderForTests(async () => jobs);
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
    setJobsLoaderForTests(async () => jobs);
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

    expect(screen.getByLabelText("Capture method")).toHaveValue("paste");
    fireEvent.change(screen.getByLabelText(/Pasted job description text/i), {
      target: { value: "New Role at New Co with 5 extracted skills." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture from pasted text" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Search jobs")).toHaveValue("");
      expect(screen.getByLabelText("Sort jobs")).toHaveValue("newest");
    });

    expect(
      screen.getByText(/Captured New Role at New Co. Filters were reset so it is visible./i),
    ).toBeInTheDocument();
  }, 20000);

  it("opens job detail modal from row click", async () => {
    setJobsLoaderForTests(async () => jobs);
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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));

    expect(await screen.findByRole("heading", { name: "Job Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Required skills")).toBeInTheDocument();
    expect(await screen.findByText("Python")).toBeInTheDocument();
  }, 15000);

  it("navigates from job skill to skill detail", async () => {
    setJobsLoaderForTests(async () => jobs);
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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Python" }));

    const skillHeading = await screen.findByRole("heading", { name: "Skill Detail" });
    const skillModal = skillHeading.closest("dialog") as HTMLElement;
    expect(
      within(skillModal).getByRole("button", { name: /Engineer.*Beta Co/i }),
    ).toBeInTheDocument();
  }, 20000);

  it("supports preferred skill link navigation from job detail", async () => {
    setJobsLoaderForTests(async () => jobs);
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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));
    fireEvent.click(await screen.findByRole("button", { name: "FastAPI" }));

    expect(getSkillSpy).toHaveBeenCalledWith(2);
    expect(await screen.findByRole("heading", { name: "Skill Detail" })).toBeInTheDocument();
  }, 20000);

  it("updates status and renders status history", async () => {
    setJobsLoaderForTests(async () => jobs);
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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));
    fireEvent.change(await screen.findByLabelText("Update status"), {
      target: { value: "submitted" },
    });

    expect(await screen.findByText(/open → submitted/i)).toBeInTheDocument();
  }, 15000);

  it("analyzes fit from job detail and renders result", async () => {
    setJobsLoaderForTests(async () => jobs);
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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));
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
    setJobsLoaderForTests(async () => jobs);
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
    setJobsLoaderForTests(async () => jobs);
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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Generate Cover Letter" }));

    await waitFor(() => {
      expect(listMaterialsSpy).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("Dear hiring manager...")).toBeInTheDocument();
  }, 20000);

  it("opens AI settings, shows masked token, and saves updated token", async () => {
    setJobsLoaderForTests(async () => jobs);
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

    expect(await screen.findByText(/Browser-local AI configuration/i)).toBeInTheDocument();
    expect(screen.getByText(/API keys are stored locally on this device/i)).toBeInTheDocument();
    expect(await screen.findByText(/Runtime token:\s*••••••••7890/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Paste token"), {
      target: { value: "sk-test-0000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Token" }));

    await waitFor(() => {
      expect(updateTokenSpy).toHaveBeenCalledWith("job_parsing", "sk-test-0000");
    });

    expect(await screen.findByText(/Local API key saved for this browser/i)).toBeInTheDocument();
  });

  it("shows pipeline rows and filters by stage with attention indicators", async () => {
    setJobsLoaderForTests(async () => jobs);
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
      within(pipelineDialog).getByRole("button", { name: /Engineer.*Beta Co/i }),
    ).toBeInTheDocument();

    fireEvent.change(within(pipelineDialog).getByLabelText("Stage"), {
      target: { value: "applied" },
    });

    expect(
      within(pipelineDialog).queryByRole("button", { name: /Engineer.*Beta Co/i }),
    ).not.toBeInTheDocument();
    expect(
      within(pipelineDialog).getByRole("button", { name: /Developer — Acme Corp/i }),
    ).toBeInTheDocument();
  });

  it("generates, edits, and regenerates interview prep pack sections", async () => {
    setJobsLoaderForTests(async () => jobs);
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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));

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
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));

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

  it("renders evidence traceability and unsupported claim flags for generated outputs", async () => {
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
      latest_fit_analysis: {
        id: 90,
        role_id: 2,
        fit_score: 84,
        recommendation: "go",
        covered_required_skills: ["Python"],
        adjacent_required_skills: ["PySpark"],
        missing_required_skills: [],
        covered_preferred_skills: ["FastAPI"],
        adjacent_preferred_skills: ["TypeScript"],
        missing_preferred_skills: [],
        rationale: "Strong match based on core skills.",
        rationale_citations: [
          {
            source_type: "career_evidence",
            source_id: 7,
            source_record_id: "resume.md",
            source_key: "experience.platform",
            snippet_reference: "Built and scaled APIs",
            confidence: 0.9,
          },
        ],
        unsupported_claims: ["Leadership depth not fully evidenced"],
        fallback_used: true,
        confidence_label: "medium",
        provider: "openai",
        model: "gpt-4o",
        version: "fit-v1",
        created_at: "2026-03-07T18:00:00Z",
      },
      latest_desirability_score: null,
    });

    vi.spyOn(api, "listApplicationMaterials").mockResolvedValue([
      {
        id: 11,
        role_id: 2,
        artifact_type: "cover_letter",
        version: 1,
        content: "Dear hiring manager...",
        questions: null,
        section_traceability: [
          {
            section_key: "intro",
            citations: [
              {
                source_type: "career_evidence",
                source_id: 8,
                source_record_id: "resume.md",
                source_key: "projects.job_ingestion",
                snippet_reference: "Improved ingestion reliability",
                confidence: 0.87,
              },
            ],
            unsupported_claims: [],
          },
        ],
        unsupported_claims: ["Team size estimate is inferred"],
        provider: "openai",
        model: "gpt-4o",
        prompt_version: "cover-letter-v1",
        created_at: "2026-03-07T18:10:00Z",
      },
    ]);
    vi.spyOn(api, "listInterviewPrepPacks").mockResolvedValue([]);
    vi.spyOn(api, "listResumeTuning").mockResolvedValue([]);

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));

    expect(await screen.findByText("Evidence references:")).toBeInTheDocument();
    expect(screen.getByText(/Built and scaled APIs/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Unsupported claim flags:/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Leadership depth not fully evidenced/i)).toBeInTheDocument();

    expect(await screen.findByText("Evidence Traceability")).toBeInTheDocument();
    expect(screen.getByText(/Improved ingestion reliability/i)).toBeInTheDocument();
    expect(screen.getByText(/Team size estimate is inferred/i)).toBeInTheDocument();
  }, 20000);

  it("logs outcome events and renders outcome insights with manual tuning suggestions", async () => {
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
      latest_fit_analysis: {
        id: 90,
        role_id: 2,
        fit_score: 84,
        recommendation: "go",
        covered_required_skills: ["Python"],
        missing_required_skills: [],
        covered_preferred_skills: ["FastAPI"],
        missing_preferred_skills: [],
        rationale: "Strong match.",
        fallback_used: false,
        confidence_label: "high",
        provider: "openai",
        model: "gpt-4o",
        version: "fit-v1",
        created_at: "2026-03-07T18:00:00Z",
      },
      latest_desirability_score: {
        id: 80,
        company_id: 10,
        role_id: 2,
        total_score: 8.2,
        factor_breakdown: [],
        score_scope: "company",
        fallback_used: false,
        cache_expires_at: "2026-04-07T18:00:00Z",
        is_stale: false,
        provider: "openai",
        model: "gpt-4o",
        version: "desirability-v1",
        created_at: "2026-03-07T18:00:00Z",
      },
    });
    const listOutcomesSpy = vi
      .spyOn(api, "listOutcomeEvents")
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 10,
          role_id: 2,
          event_type: "offer",
          occurred_at: "2026-03-09T12:00:00Z",
          notes: "Verbal offer",
          fit_analysis_id: 90,
          desirability_score_id: 80,
          application_material_id: null,
          model_family: "openai",
          model: "gpt-4o",
          prompt_version: "cover-letter-v1",
          created_at: "2026-03-09T12:00:30Z",
        },
      ]);
    const createOutcomeSpy = vi
      .spyOn(api, "createOutcomeEvent")
      .mockImplementation(async (roleId, payload) => ({
        id: 10,
        role_id: roleId,
        event_type: payload.event_type,
        occurred_at: payload.occurred_at,
        notes: payload.notes ?? null,
        fit_analysis_id: payload.fit_analysis_id ?? null,
        desirability_score_id: payload.desirability_score_id ?? null,
        application_material_id: payload.application_material_id ?? null,
        model_family: payload.model_family ?? null,
        model: payload.model ?? null,
        prompt_version: payload.prompt_version ?? null,
        created_at: "2026-03-09T12:00:30Z",
      }));

    vi.spyOn(api, "getOutcomeInsights").mockResolvedValue({
      confidence_message: "Low confidence: early signal only.",
      conversion_by_fit_band: [{ segment: "70-100", attempts: 2, hires: 1, conversion_rate: 0.5 }],
      conversion_by_desirability_band: [
        { segment: "7.0-10.0", attempts: 2, hires: 1, conversion_rate: 0.5 },
      ],
      conversion_by_model_family: [
        { segment: "openai", attempts: 2, hires: 1, conversion_rate: 0.5 },
      ],
      total_events: 2,
      total_roles_with_outcomes: 1,
    });
    vi.spyOn(api, "getOutcomeTuningSuggestions").mockResolvedValue({
      confidence_message: "Low confidence: early signal only.",
      suggestions: [
        {
          recommendation: "Prefer openai for new drafts.",
          rationale: "Current conversion appears stronger.",
          reversible_action: "Re-check after 5 additional events.",
        },
      ],
    });

    render(<JobsPageClient />);

    await screen.findByText("Engineer");
    fireEvent.click(screen.getByRole("button", { name: /Engineer.*Beta Co/i }));

    expect(await screen.findByLabelText("Outcome type")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Outcome type"), {
      target: { value: "offer" },
    });
    fireEvent.change(screen.getByLabelText("Outcome notes"), {
      target: { value: "Verbal offer" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log Outcome Event" }));

    await waitFor(() => {
      expect(listOutcomesSpy).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByText(/Offer —/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Outcome Insights" }));
    const outcomeInsightsHeading = await screen.findByRole("heading", { name: "Outcome Insights" });
    const outcomeInsightsDialog = outcomeInsightsHeading.closest("dialog") as HTMLElement;
    expect(outcomeInsightsHeading).toBeInTheDocument();
    expect(
      await within(outcomeInsightsDialog).findByText(/Conversion by Fit Band/i),
    ).toBeInTheDocument();
    expect(
      await within(outcomeInsightsDialog).findByText(/Prefer openai for new drafts/i),
    ).toBeInTheDocument();
  }, 20000);
});
