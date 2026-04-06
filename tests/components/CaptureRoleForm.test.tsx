import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { CaptureRoleForm } from "../../src/components/CaptureRoleForm";
import { setFrontendServicesForTests } from "../../src/lib/services";
import type { FrontendServices } from "../../src/lib/services/types";

function createServices(overrides?: Partial<FrontendServices>): FrontendServices {
  return {
    roles: {
      getRole: vi.fn(),
      listRoles: vi.fn(),
      captureRole: vi.fn(),
      updateRoleStatus: vi.fn(),
      ...overrides?.roles,
    },
    skills: {
      getSkill: vi.fn(),
      listSkills: vi.fn(),
      ...overrides?.skills,
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
      ...overrides?.workflows,
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
      ...overrides?.aiGeneration,
    },
    desirabilityFactors: {
      createDesirabilityFactor: vi.fn(),
      deleteDesirabilityFactor: vi.fn(),
      listDesirabilityFactors: vi.fn(),
      reorderDesirabilityFactors: vi.fn(),
      updateDesirabilityFactor: vi.fn(),
      ...overrides?.desirabilityFactors,
    },
    portability: {
      exportDataArchive: vi.fn(),
      getDataPortabilitySummary: vi.fn(),
      importDataArchive: vi.fn(),
      resetDataWorkspace: vi.fn(),
      ...overrides?.portability,
    },
  };
}

describe("CaptureRoleForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setFrontendServicesForTests(null);
  });

  it("submits URL first and renders success state", async () => {
    setFrontendServicesForTests(
      createServices({
        roles: {
          getRole: vi.fn(),
          listRoles: vi.fn(),
          captureRole: vi.fn().mockResolvedValue({
            status: "success",
            role_id: 101,
            company: "TechCo",
            title: "Backend Engineer",
            skills_extracted: 6,
            processing_time_seconds: 1.2,
          }),
          updateRoleStatus: vi.fn(),
        },
      }),
    );

    render(<CaptureRoleForm />);

    fireEvent.change(screen.getByLabelText("Capture method"), {
      target: { value: "url" },
    });

    fireEvent.change(screen.getByLabelText("Role URL"), {
      target: { value: "https://example.com/roles/123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture role" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Role captured:.*Backend Engineer.*TechCo/,
    );
    expect(screen.queryByLabelText("Role URL")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Capture role" })).not.toBeInTheDocument();
  });

  it("defaults to pasted role description capture for the browser MVP", async () => {
    const captureRole = vi.fn().mockResolvedValue({
      status: "success",
      role_id: 22,
      company: "Paste Co",
      title: "Typed Role",
      skills_extracted: 3,
      processing_time_seconds: 0.9,
    });

    setFrontendServicesForTests(
      createServices({
        roles: {
          getRole: vi.fn(),
          listRoles: vi.fn(),
          captureRole,
          updateRoleStatus: vi.fn(),
        },
      }),
    );

    render(<CaptureRoleForm />);

    expect(
      screen.getByText(/preferred MVP workflow is to paste the role description text/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Capture method")).toHaveValue("paste");

    fireEvent.change(screen.getByLabelText(/Pasted role description text/i), {
      target: { value: "Senior engineer role with TypeScript and systems design." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Capture from pasted text/i }));

    await waitFor(() => {
      expect(captureRole).toHaveBeenCalledWith({
        fallback_text: "Senior engineer role with TypeScript and systems design.",
        url: "pasted-role-description",
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Role captured:\s*Typed Role\s*at\s*Paste Co/i,
    );
  });

  it("shows returned error message for failed URL capture", async () => {
    const captureRole = vi.fn().mockRejectedValue(new Error("Unable to scrape this URL."));

    setFrontendServicesForTests(
      createServices({
        roles: {
          getRole: vi.fn(),
          listRoles: vi.fn(),
          captureRole,
          updateRoleStatus: vi.fn(),
        },
      }),
    );

    render(<CaptureRoleForm />);

    fireEvent.change(screen.getByLabelText("Capture method"), {
      target: { value: "url" },
    });

    fireEvent.change(screen.getByLabelText("Role URL"), {
      target: { value: "https://example.com/roles/500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture role" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Unable to scrape this URL.");
    });
  });
});
