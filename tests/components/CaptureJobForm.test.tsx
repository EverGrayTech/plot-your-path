import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { CaptureJobForm } from "../../src/components/CaptureJobForm";
import { setFrontendServicesForTests } from "../../src/lib/services";
import type { FrontendServices } from "../../src/lib/services/types";

function createServices(overrides?: Partial<FrontendServices>): FrontendServices {
  return {
    jobs: {
      getJob: vi.fn(),
      listJobs: vi.fn(),
      scrapeJob: vi.fn(),
      updateJobStatus: vi.fn(),
      ...overrides?.jobs,
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
    aiSettings: {
      clearAISettingToken: vi.fn(),
      healthcheckAISetting: vi.fn(),
      listAISettings: vi.fn(),
      updateAISetting: vi.fn(),
      updateAISettingToken: vi.fn(),
      ...overrides?.aiSettings,
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

describe("CaptureJobForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setFrontendServicesForTests(null);
  });

  it("submits URL first and renders success state", async () => {
    setFrontendServicesForTests(
      createServices({
        jobs: {
          getJob: vi.fn(),
          listJobs: vi.fn(),
          scrapeJob: vi.fn().mockResolvedValue({
            status: "success",
            role_id: 101,
            company: "TechCo",
            title: "Backend Engineer",
            skills_extracted: 6,
            processing_time_seconds: 1.2,
          }),
          updateJobStatus: vi.fn(),
        },
      }),
    );

    render(<CaptureJobForm />);

    fireEvent.change(screen.getByLabelText("Capture method"), {
      target: { value: "url" },
    });

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Role captured:.*Backend Engineer.*TechCo/,
    );
    expect(screen.queryByLabelText("Job URL")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Capture job" })).not.toBeInTheDocument();
  });

  it("defaults to pasted job description capture for the browser MVP", async () => {
    const scrapeJob = vi.fn().mockResolvedValue({
      status: "success",
      role_id: 22,
      company: "Paste Co",
      title: "Typed Role",
      skills_extracted: 3,
      processing_time_seconds: 0.9,
    });

    setFrontendServicesForTests(
      createServices({
        jobs: {
          getJob: vi.fn(),
          listJobs: vi.fn(),
          scrapeJob,
          updateJobStatus: vi.fn(),
        },
      }),
    );

    render(<CaptureJobForm />);

    expect(
      screen.getByText(/preferred MVP workflow is to paste the job description text/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Capture method")).toHaveValue("paste");

    fireEvent.change(screen.getByLabelText(/Pasted job description text/i), {
      target: { value: "Senior engineer role with TypeScript and systems design." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Capture from pasted text/i }));

    await waitFor(() => {
      expect(scrapeJob).toHaveBeenCalledWith({
        fallback_text: "Senior engineer role with TypeScript and systems design.",
        url: "pasted-job-description",
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent(
      /Role captured:\s*Typed Role\s*at\s*Paste Co/i,
    );
  });

  it("shows returned error message for failed URL capture", async () => {
    const scrapeJob = vi.fn().mockRejectedValue(new Error("Unable to scrape this URL."));

    setFrontendServicesForTests(
      createServices({
        jobs: {
          getJob: vi.fn(),
          listJobs: vi.fn(),
          scrapeJob,
          updateJobStatus: vi.fn(),
        },
      }),
    );

    render(<CaptureJobForm />);

    fireEvent.change(screen.getByLabelText("Capture method"), {
      target: { value: "url" },
    });

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Unable to scrape this URL.");
    });
  });
});
