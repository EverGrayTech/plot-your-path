import { fireEvent, render, screen, within } from "@testing-library/react";
import { indexedDB } from "fake-indexeddb";
import React from "react";

import { SkillsPageClient } from "../../src/components/SkillsPageClient";
import type * as dataModels from "../../src/lib/dataModels";
import { setFrontendServicesForTests } from "../../src/lib/services";
import type { FrontendServices } from "../../src/lib/services/types";

describe("SkillsPageClient", () => {
  const skills: dataModels.SkillListItem[] = [
    { id: 1, name: "Python", category: "language", usage_count: 3 },
    { id: 2, name: "FastAPI", category: "tool", usage_count: 2 },
    { id: 3, name: "Leadership", category: "soft", usage_count: 1 },
  ];

  afterEach(() => {
    vi.restoreAllMocks();
    setFrontendServicesForTests(null);
    (globalThis as { fetch?: typeof fetch }).fetch = undefined;
  });

  beforeEach(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });

    const services = {
      roles: {
        getRole: vi.fn(),
        listRoles: vi.fn(),
        captureRole: vi.fn(),
        updateRoleStatus: vi.fn(),
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
        analyzeRoleFit: vi.fn(),
        generateCoverLetter: vi.fn(),
        generateInterviewPrepPack: vi.fn(),
        generateQuestionAnswers: vi.fn(),
        generateResumeTuning: vi.fn(),
        listApplicationMaterials: vi.fn(),
        listInterviewPrepPacks: vi.fn(),
        listResumeTuning: vi.fn(),
        refreshDesirabilityScore: vi.fn(),
        regenerateInterviewPrepSection: vi.fn(),
        scoreRoleDesirability: vi.fn(),
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

  it("renders skills list and supports search + sort", async () => {
    const services = {
      ...({} as unknown as FrontendServices),
    };

    const listSkills = vi.fn().mockResolvedValue(skills);
    setFrontendServicesForTests({
      ...(services as FrontendServices),
      roles: {
        getRole: vi.fn(),
        listRoles: vi.fn(),
        captureRole: vi.fn(),
        updateRoleStatus: vi.fn(),
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
        analyzeRoleFit: vi.fn(),
        generateCoverLetter: vi.fn(),
        generateInterviewPrepPack: vi.fn(),
        generateQuestionAnswers: vi.fn(),
        generateResumeTuning: vi.fn(),
        listApplicationMaterials: vi.fn(),
        listInterviewPrepPacks: vi.fn(),
        listResumeTuning: vi.fn(),
        refreshDesirabilityScore: vi.fn(),
        regenerateInterviewPrepSection: vi.fn(),
        scoreRoleDesirability: vi.fn(),
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

  it("opens skill detail modal and navigates to a referenced role", async () => {
    const getSkill = vi.fn().mockResolvedValue({
      id: 1,
      name: "Python",
      category: "language",
      usage_count: 3,
      roles: [
        {
          id: 2,
          company: "Beta Co",
          title: "Engineer",
          status: "open",
          created_at: "2026-03-05T10:00:00Z",
        },
      ],
    });
    const getRole = vi.fn().mockResolvedValue({
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
      url: "https://example.com/roles/2",
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
      roles: {
        getRole,
        listRoles: vi.fn(),
        captureRole: vi.fn(),
        updateRoleStatus: vi.fn(),
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
        analyzeRoleFit: vi.fn(),
        generateCoverLetter: vi.fn(),
        generateInterviewPrepPack: vi.fn(),
        generateQuestionAnswers: vi.fn(),
        generateResumeTuning: vi.fn(),
        listApplicationMaterials: vi.fn(),
        listInterviewPrepPacks: vi.fn(),
        listResumeTuning: vi.fn(),
        refreshDesirabilityScore: vi.fn(),
        regenerateInterviewPrepSection: vi.fn(),
        scoreRoleDesirability: vi.fn(),
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
    expect(await screen.findByText("Used in 3 captured roles.")).toBeInTheDocument();

    const skillModal = await screen.findByRole("dialog");
    fireEvent.click(within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i }));
    expect(await screen.findByRole("heading", { name: "Role Detail" })).toBeInTheDocument();
  }, 30000);
});
