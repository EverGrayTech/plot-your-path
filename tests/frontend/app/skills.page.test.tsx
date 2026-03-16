import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { indexedDB } from "fake-indexeddb";

import { SkillsPageClient } from "../../../src/frontend/components/SkillsPageClient";
import * as dataModels from "../../../src/frontend/lib/dataModels";
import { setFrontendServicesForTests } from "../../../src/frontend/lib/services";
import type { FrontendServices } from "../../../src/frontend/lib/services/types";

describe("SkillsPageClient", () => {
  const skills: dataModels.SkillListItem[] = [
    { id: 1, name: "Python", category: "language", usage_count: 3 },
    { id: 2, name: "FastAPI", category: "tool", usage_count: 2 },
    { id: 3, name: "Leadership", category: "soft", usage_count: 1 },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
    setFrontendServicesForTests(null);
  });

  beforeEach(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });

    const services = {
      jobs: {
        getJob: vi.fn(),
        listJobs: vi.fn(),
        scrapeJob: vi.fn(),
        updateJobStatus: vi.fn(),
      },
      skills: {
        getSkill: vi.fn(),
        listSkills: vi.fn(),
      },
      workflows: {
        createOutcomeEvent: vi.fn(),
        getApplicationOps: vi.fn(),
        getOutcomeInsights: vi.fn(),
        getOutcomeTuningSuggestions: vi.fn(),
        listInterviewStages: vi.fn(),
        listOutcomeEvents: vi.fn(),
        listPipeline: vi.fn(),
        updateInterviewStage: vi.fn(),
        updateNextAction: vi.fn(),
        upsertApplicationOps: vi.fn(),
      },
      aiSettings: {
        clearAISettingToken: vi.fn(),
        healthcheckAISetting: vi.fn(),
        listAISettings: vi.fn(),
        updateAISetting: vi.fn(),
        updateAISettingToken: vi.fn(),
      },
      aiGeneration: {
        analyzeJobFit: vi.fn(),
        generateCoverLetter: vi.fn(),
        generateInterviewPrepPack: vi.fn(),
        generateQuestionAnswers: vi.fn(),
        generateResumeTuning: vi.fn(),
        listApplicationMaterials: vi.fn(),
        listInterviewPrepPacks: vi.fn(),
        listResumeTuning: vi.fn(),
        refreshDesirabilityScore: vi.fn(),
        regenerateInterviewPrepSection: vi.fn(),
        scoreJobDesirability: vi.fn(),
        syncResumeProfile: vi.fn(),
        updateInterviewPrepPack: vi.fn(),
      },
      desirabilityFactors: {
        createDesirabilityFactor: vi.fn(),
        deleteDesirabilityFactor: vi.fn(),
        listDesirabilityFactors: vi.fn(),
        reorderDesirabilityFactors: vi.fn(),
        updateDesirabilityFactor: vi.fn(),
      },
      portability: {
        exportDataArchive: vi.fn(),
        getDataPortabilitySummary: vi.fn(),
        importDataArchive: vi.fn(),
        resetDataWorkspace: vi.fn(),
      },
    } satisfies FrontendServices;

    setFrontendServicesForTests(services);
    global.fetch = vi.fn(async () => {
      throw new Error("Unexpected fetch in SkillsPageClient test");
    }) as typeof fetch;
  });

  afterEach(() => {
    delete (globalThis as { fetch?: typeof fetch }).fetch;
  });

  it("renders skills list and supports search + sort", async () => {
    const services = {
      ...(({} as unknown) as FrontendServices),
    };

    const listSkills = vi.fn().mockResolvedValue(skills);
    setFrontendServicesForTests({
      ...(services as FrontendServices),
      jobs: {
        getJob: vi.fn(),
        listJobs: vi.fn(),
        scrapeJob: vi.fn(),
        updateJobStatus: vi.fn(),
      },
      skills: {
        getSkill: vi.fn(),
        listSkills,
      },
      workflows: {
        createOutcomeEvent: vi.fn(),
        getApplicationOps: vi.fn(),
        getOutcomeInsights: vi.fn(),
        getOutcomeTuningSuggestions: vi.fn(),
        listInterviewStages: vi.fn(),
        listOutcomeEvents: vi.fn(),
        listPipeline: vi.fn(),
        updateInterviewStage: vi.fn(),
        updateNextAction: vi.fn(),
        upsertApplicationOps: vi.fn(),
      },
      aiSettings: {
        clearAISettingToken: vi.fn(),
        healthcheckAISetting: vi.fn(),
        listAISettings: vi.fn(),
        updateAISetting: vi.fn(),
        updateAISettingToken: vi.fn(),
      },
      aiGeneration: {
        analyzeJobFit: vi.fn(),
        generateCoverLetter: vi.fn(),
        generateInterviewPrepPack: vi.fn(),
        generateQuestionAnswers: vi.fn(),
        generateResumeTuning: vi.fn(),
        listApplicationMaterials: vi.fn(),
        listInterviewPrepPacks: vi.fn(),
        listResumeTuning: vi.fn(),
        refreshDesirabilityScore: vi.fn(),
        regenerateInterviewPrepSection: vi.fn(),
        scoreJobDesirability: vi.fn(),
        syncResumeProfile: vi.fn(),
        updateInterviewPrepPack: vi.fn(),
      },
      desirabilityFactors: {
        createDesirabilityFactor: vi.fn(),
        deleteDesirabilityFactor: vi.fn(),
        listDesirabilityFactors: vi.fn(),
        reorderDesirabilityFactors: vi.fn(),
        updateDesirabilityFactor: vi.fn(),
      },
      portability: {
        exportDataArchive: vi.fn(),
        getDataPortabilitySummary: vi.fn(),
        importDataArchive: vi.fn(),
        resetDataWorkspace: vi.fn(),
      },
    });

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
    const getSkill = vi.fn().mockResolvedValue({
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
    const getJob = vi.fn().mockResolvedValue({
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

    setFrontendServicesForTests({
      jobs: {
        getJob,
        listJobs: vi.fn(),
        scrapeJob: vi.fn(),
        updateJobStatus: vi.fn(),
      },
      skills: {
        getSkill,
        listSkills: vi.fn().mockResolvedValue(skills),
      },
      workflows: {
        createOutcomeEvent: vi.fn(),
        getApplicationOps: vi.fn(),
        getOutcomeInsights: vi.fn(),
        getOutcomeTuningSuggestions: vi.fn(),
        listInterviewStages: vi.fn(),
        listOutcomeEvents: vi.fn(),
        listPipeline: vi.fn(),
        updateInterviewStage: vi.fn(),
        updateNextAction: vi.fn(),
        upsertApplicationOps: vi.fn(),
      },
      aiSettings: {
        clearAISettingToken: vi.fn(),
        healthcheckAISetting: vi.fn(),
        listAISettings: vi.fn(),
        updateAISetting: vi.fn(),
        updateAISettingToken: vi.fn(),
      },
      aiGeneration: {
        analyzeJobFit: vi.fn(),
        generateCoverLetter: vi.fn(),
        generateInterviewPrepPack: vi.fn(),
        generateQuestionAnswers: vi.fn(),
        generateResumeTuning: vi.fn(),
        listApplicationMaterials: vi.fn(),
        listInterviewPrepPacks: vi.fn(),
        listResumeTuning: vi.fn(),
        refreshDesirabilityScore: vi.fn(),
        regenerateInterviewPrepSection: vi.fn(),
        scoreJobDesirability: vi.fn(),
        syncResumeProfile: vi.fn(),
        updateInterviewPrepPack: vi.fn(),
      },
      desirabilityFactors: {
        createDesirabilityFactor: vi.fn(),
        deleteDesirabilityFactor: vi.fn(),
        listDesirabilityFactors: vi.fn(),
        reorderDesirabilityFactors: vi.fn(),
        updateDesirabilityFactor: vi.fn(),
      },
      portability: {
        exportDataArchive: vi.fn(),
        getDataPortabilitySummary: vi.fn(),
        importDataArchive: vi.fn(),
        resetDataWorkspace: vi.fn(),
      },
    });

    render(<SkillsPageClient />);

    await screen.findByText("Python");
    fireEvent.click(screen.getByRole("button", { name: /Python/i }));

    expect(await screen.findByRole("heading", { name: "Skill Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Used in 3 captured jobs.")).toBeInTheDocument();

    const skillModal = await screen.findByRole("dialog");
    fireEvent.click(within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i }));
    expect(await screen.findByRole("heading", { name: "Job Detail" })).toBeInTheDocument();
  }, 30000);
});
