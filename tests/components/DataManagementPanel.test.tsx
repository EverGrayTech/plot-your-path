import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { indexedDB } from "fake-indexeddb";
import { DataManagementPanel } from "../../src/components/DataManagementPanel";
import * as api from "../../src/lib/api";
import { setFrontendServicesForTests } from "../../src/lib/services";
import type { FrontendServices } from "../../src/lib/services/types";

function createServices(overrides: Partial<FrontendServices> = {}): FrontendServices {
  return {
    roles: {
      getRole: api.getRole,
      listRoles: api.listRoles,
      captureRole: api.captureRole,
      updateRoleStatus: api.updateRoleStatus,
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
    aiGeneration: {
      analyzeRoleFit: api.analyzeRoleFit,
      generateCoverLetter: api.generateCoverLetter,
      generateInterviewPrepPack: api.generateInterviewPrepPack,
      generateQuestionAnswers: api.generateQuestionAnswers,
      generateResumeTuning: api.generateResumeTuning,
      listApplicationMaterials: api.listApplicationMaterials,
      listInterviewPrepPacks: api.listInterviewPrepPacks,
      listResumeTuning: api.listResumeTuning,
      refreshDesirabilityScore: api.refreshDesirabilityScore,
      regenerateInterviewPrepSection: api.regenerateInterviewPrepSection,
      scoreRoleDesirability: api.scoreRoleDesirability,
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
    ...overrides,
  };
}

describe("DataManagementPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });

    setFrontendServicesForTests(createServices());
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

    expect(screen.getByText(/Last export: Not yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Last restore: Not yet/i)).toBeInTheDocument();
    expect(screen.getByText(/What to know/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Backups export your workspace as a readable JSON archive/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reset permanently removes local roles, skills, and generated materials/i),
    ).toBeInTheDocument();
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

  it("downloads a backup and refreshes the summary", async () => {
    const appendSpy = vi.spyOn(document.body, "append");
    const link = document.createElement("a");
    const click = vi.spyOn(link, "click").mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        return link;
      }

      return document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
    });
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const getSummary = vi
      .fn()
      .mockResolvedValueOnce({
        storage_mode: "browser_local",
        backup_reminder_level: "recommended",
        backup_reminder_message: "Export soon",
        has_resume: false,
        roles_count: 1,
        last_export_at: null,
        last_import_at: null,
        last_reset_at: null,
        skills_count: 2,
        data_root: null,
        database_path: null,
      })
      .mockResolvedValueOnce({
        storage_mode: "browser_local",
        backup_reminder_level: "none",
        backup_reminder_message: null,
        has_resume: false,
        roles_count: 1,
        last_export_at: "2026-03-21T00:00:00.000Z",
        last_import_at: null,
        last_reset_at: null,
        skills_count: 2,
        data_root: null,
        database_path: null,
      });
    const exportDataArchive = vi.fn().mockResolvedValue({
      blob: new Blob(["{}"], { type: "application/json" }),
      filename: "backup.json",
    });

    setFrontendServicesForTests(
      createServices({
        portability: {
          exportDataArchive,
          getDataPortabilitySummary: getSummary,
          importDataArchive: api.importDataArchive,
          resetDataWorkspace: api.resetDataWorkspace,
        },
      }),
    );

    render(<DataManagementPanel />);

    await screen.findByRole("button", { name: /Download backup/i });
    fireEvent.click(screen.getByRole("button", { name: /Download backup/i }));

    await waitFor(() => {
      expect(screen.getByText(/Backup created and downloaded/i)).toBeInTheDocument();
    });

    expect(exportDataArchive).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(getSummary).toHaveBeenCalledTimes(2);

    createElementSpy.mockRestore();
  });

  it("shows an operation error when export fails", async () => {
    const exportDataArchive = vi.fn().mockRejectedValue(new Error("Export failed"));

    setFrontendServicesForTests(
      createServices({
        portability: {
          exportDataArchive,
          getDataPortabilitySummary: api.getDataPortabilitySummary,
          importDataArchive: api.importDataArchive,
          resetDataWorkspace: api.resetDataWorkspace,
        },
      }),
    );

    render(<DataManagementPanel />);

    await screen.findByRole("button", { name: /Download backup/i });
    fireEvent.click(screen.getByRole("button", { name: /Download backup/i }));

    expect(await screen.findByText("Export failed")).toBeInTheDocument();
    expect(screen.getByText(/Data operation could not be completed/i)).toBeInTheDocument();
  });

  it("restores a backup file and shows the import summary", async () => {
    class MockFileReader {
      result: string | ArrayBuffer | null = null;
      onerror: null | (() => void) = null;
      onload: null | (() => void) = null;

      readAsDataURL(_file: File) {
        this.result = "data:application/json;base64,ZXlKMGVYQWlPakUyT1RrPQ==";
        this.onload?.();
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);
    const importDataArchive = vi.fn().mockResolvedValue({
      completed_at: "2026-03-21T00:00:00.000Z",
      message: "Backup restored into the current browser-local workspace.",
      added_count: 3,
      updated_count: 1,
      unchanged_count: 2,
    });
    const getSummary = vi.fn().mockResolvedValue({
      storage_mode: "browser_local",
      backup_reminder_level: "none",
      backup_reminder_message: null,
      has_resume: false,
      roles_count: 3,
      last_export_at: null,
      last_import_at: "2026-03-21T00:00:00.000Z",
      last_reset_at: null,
      skills_count: 4,
      data_root: null,
      database_path: null,
    });

    setFrontendServicesForTests(
      createServices({
        portability: {
          exportDataArchive: api.exportDataArchive,
          getDataPortabilitySummary: getSummary,
          importDataArchive,
          resetDataWorkspace: api.resetDataWorkspace,
        },
      }),
    );

    render(<DataManagementPanel />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["{}"], "backup.json", { type: "application/json" });
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/Backup restored/i)).toBeInTheDocument();
    });

    expect(importDataArchive).toHaveBeenCalledWith("ZXlKMGVYQWlPakUyT1RrPQ==");
    expect(screen.getByText(/3 added, 1 updated, 2 unchanged/i)).toBeInTheDocument();
  });

  it("shows an operation error when importing fails to read the file", async () => {
    class MockFileReader {
      onerror: null | (() => void) = null;
      onload: null | (() => void) = null;

      readAsDataURL(_file: File) {
        this.onerror?.();
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);

    render(<DataManagementPanel />);

    await screen.findByRole("button", { name: /Restore backup/i });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["{}"], "backup.json", { type: "application/json" });
    Object.defineProperty(input, "files", { configurable: true, value: [file] });
    fireEvent.change(input);

    expect(await screen.findByText(/Backup file could not be read/i)).toBeInTheDocument();
  });

  it("returns early when no backup file is selected", async () => {
    const importDataArchive = vi.fn();
    setFrontendServicesForTests(
      createServices({
        portability: {
          exportDataArchive: api.exportDataArchive,
          getDataPortabilitySummary: api.getDataPortabilitySummary,
          importDataArchive,
          resetDataWorkspace: api.resetDataWorkspace,
        },
      }),
    );

    render(<DataManagementPanel />);

    await screen.findByRole("button", { name: /Restore backup/i });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, "files", { configurable: true, value: [] });
    fireEvent.change(input);

    expect(importDataArchive).not.toHaveBeenCalled();
  });
});
