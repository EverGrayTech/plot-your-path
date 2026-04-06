import { fireEvent, render, screen, within } from "@testing-library/react";
import { indexedDB } from "fake-indexeddb";
import React from "react";

import { SkillsPageClient } from "../../src/components/SkillsPageClient";
import type * as dataModels from "../../src/lib/dataModels";
import { setFrontendServicesForTests } from "../../src/lib/services";
import type { FrontendServices } from "../../src/lib/services/types";

function getOpenDialog() {
  const dialogs = screen.getAllByRole("dialog");
  return dialogs[dialogs.length - 1];
}

function createServices(overrides: Partial<FrontendServices> = {}): FrontendServices {
  return {
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
    ...overrides,
  };
}

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
    setFrontendServicesForTests(createServices());
    global.fetch = vi.fn(async () => {
      throw new Error("Unexpected fetch in SkillsPageClient test");
    }) as typeof fetch;
  });

  it("renders skills list and supports search + sort", async () => {
    const listSkills = vi.fn().mockResolvedValue(skills);
    setFrontendServicesForTests(createServices({ skills: { getSkill: vi.fn(), listSkills } }));

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

    setFrontendServicesForTests(
      createServices({
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
      }),
    );

    render(<SkillsPageClient />);

    await screen.findByText("Python");
    fireEvent.click(screen.getByRole("button", { name: /Python/i }));

    expect(await screen.findByRole("heading", { name: "Skill Detail" })).toBeInTheDocument();
    expect(await screen.findByText("Used in 3 captured roles.")).toBeInTheDocument();

    const skillModal = await screen.findByRole("dialog");
    fireEvent.click(within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i }));
    expect(await screen.findByRole("heading", { name: "Role Detail" })).toBeInTheDocument();
  }, 30000);

  it("shows a fallback error when skills loading rejects with a non-Error value", async () => {
    setFrontendServicesForTests(
      createServices({
        skills: {
          getSkill: vi.fn(),
          listSkills: vi.fn().mockRejectedValue("boom"),
        },
      }),
    );

    render(<SkillsPageClient />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load skills.");
  });

  it("renders the empty state when no skills match the current search", async () => {
    setFrontendServicesForTests(
      createServices({
        skills: {
          getSkill: vi.fn(),
          listSkills: vi.fn().mockResolvedValue(skills),
        },
      }),
    );

    render(<SkillsPageClient />);
    await screen.findByText("Python");

    fireEvent.change(screen.getByLabelText("Search skills"), {
      target: { value: "rust" },
    });

    expect(screen.getByText(/No skills captured yet/i)).toBeInTheDocument();
  });

  it("shows a skill detail error and clears it when the modal closes", async () => {
    setFrontendServicesForTests(
      createServices({
        skills: {
          getSkill: vi.fn().mockRejectedValue("boom"),
          listSkills: vi.fn().mockResolvedValue(skills),
        },
      }),
    );

    render(<SkillsPageClient />);

    await screen.findByText("Python");
    fireEvent.click(screen.getByRole("button", { name: /Python/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load skill detail.");
    fireEvent.click(within(getOpenDialog()).getByRole("button", { name: /^Close$/i }));

    expect(screen.queryByRole("heading", { name: /Skill Detail/i })).not.toBeInTheDocument();
  });

  it("shows a role detail error when role loading rejects with a non-Error value", async () => {
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

    setFrontendServicesForTests(
      createServices({
        roles: {
          getRole: vi.fn().mockRejectedValue("boom"),
          listRoles: vi.fn(),
          captureRole: vi.fn(),
          updateRoleStatus: vi.fn(),
        },
        skills: {
          getSkill,
          listSkills: vi.fn().mockResolvedValue(skills),
        },
      }),
    );

    render(<SkillsPageClient />);

    await screen.findByText("Python");
    fireEvent.click(screen.getByRole("button", { name: /Python/i }));
    const skillModal = await screen.findByRole("dialog");
    fireEvent.click(within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load role detail.");
  });

  it("supports least-used sorting and opening preferred skills from role detail", async () => {
    const getSkill = vi
      .fn()
      .mockResolvedValueOnce({
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
      })
      .mockResolvedValueOnce({
        id: 2,
        name: "FastAPI",
        category: "tool",
        usage_count: 2,
        roles: [],
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

    setFrontendServicesForTests(
      createServices({
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
      }),
    );

    render(<SkillsPageClient />);

    await screen.findByText("Python");
    fireEvent.change(screen.getByLabelText("Sort skills"), {
      target: { value: "least_used" },
    });

    const listItems = screen.getAllByRole("listitem");
    expect(listItems[0]).toHaveTextContent("Leadership");
    expect(listItems[2]).toHaveTextContent("Python");

    fireEvent.click(screen.getByRole("button", { name: /Python/i }));
    const skillModal = await screen.findByRole("dialog");
    fireEvent.click(within(skillModal).getByRole("button", { name: /Engineer — Beta Co/i }));

    expect(await screen.findByRole("heading", { name: /Role Detail/i })).toBeInTheDocument();
    fireEvent.click(within(getOpenDialog()).getByRole("button", { name: /^FastAPI$/i }));

    expect(await screen.findByText("Category: tool")).toBeInTheDocument();
  });
});
