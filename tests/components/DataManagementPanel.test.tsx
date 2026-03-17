import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { indexedDB } from "fake-indexeddb";
import { DataManagementPanel } from "../../src/components/DataManagementPanel";
import * as api from "../../src/lib/browserApi";
import { setFrontendServicesForTests } from "../../src/lib/services";
import type { FrontendServices } from "../../src/lib/services/types";

describe("DataManagementPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });

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
      throw new Error("Unexpected fetch in DataManagementPanel test");
    }) as typeof fetch;
  });

  afterEach(() => {
    setFrontendServicesForTests(null);
    (globalThis as { fetch?: typeof fetch }).fetch = undefined;
  });

  it("loads and renders local data summary details", async () => {
    render(<DataManagementPanel />);

    expect(screen.getByLabelText(/Loading local data summary/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByLabelText(/Loading local data summary/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No backup exported yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Browser-managed local storage/i)).toBeInTheDocument();
    expect(screen.getByText(/readable JSON archive with durable artifacts/i)).toBeInTheDocument();
    expect(screen.getByText(/active browser-local MVP path/i)).toBeInTheDocument();
    expect(screen.getByText(/Export after meaningful changes/i)).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText(/Download backup/i)).toBeInTheDocument();
    expect(screen.getByText(/Restore backup/i)).toBeInTheDocument();
  });

  it("confirms reset before deleting local data", async () => {
    render(<DataManagementPanel />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Reset local data/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Reset local data/i }));
    expect(screen.getByRole("heading", { name: /Reset local data/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Delete local data/i }));

    await waitFor(() => {
      expect(screen.getByText(/Local data reset/i)).toBeInTheDocument();
    });
  });
});
