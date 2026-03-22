import { deleteLocalWorkspaceDbForTests, saveStoreRecord } from "../../src/lib/localData";
import {
  exportLocalDataArchive,
  getLocalDataPortabilitySummary,
  importLocalDataArchive,
  resetLocalWorkspace,
} from "../../src/lib/localPortability";
import { captureLocalRole } from "../../src/lib/localRoles";

import { indexedDB } from "fake-indexeddb";

describe("local portability", () => {
  beforeAll(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });
  });

  beforeEach(async () => {
    vi.useRealTimers();
    await deleteLocalWorkspaceDbForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds a local summary from browser-local data", async () => {
    await captureLocalRole({
      url: "pasted-role-description",
      fallback_text: "Platform Engineer\nTypeScript",
    });

    const summary = await getLocalDataPortabilitySummary();
    expect(summary.storage_mode).toBe("browser_local");
    expect(summary.roles_count).toBeGreaterThan(0);
  });

  it("exports and re-imports local workspace data", async () => {
    await captureLocalRole({
      url: "pasted-role-description",
      fallback_text: "Frontend Engineer\nReact",
    });

    const exported = await exportLocalDataArchive();
    expect(exported.filename).toMatch(/\.json$/i);
    const text = await exported.blob.text();
    const base64 = btoa(text);

    const result = await importLocalDataArchive(base64);
    expect(result.message).toMatch(/Backup restored/i);
  });

  it("resets local workspace data", async () => {
    const result = await resetLocalWorkspace();
    const summary = await getLocalDataPortabilitySummary();

    expect(result.message).toMatch(/Local data reset successfully/i);
    expect(summary.roles_count).toBe(0);
  });

  it("flags stale backups as recommended or overdue based on export age", async () => {
    const dateNowSpy = vi
      .spyOn(Date, "now")
      .mockReturnValue(new Date("2026-03-21T12:00:00.000Z").getTime());

    await saveStoreRecord("metadata", {
      id: "workspace",
      key: "workspace",
      schemaVersion: 1,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-21T12:00:00.000Z",
      lastExportAt: "2026-03-17T12:00:00.000Z",
      lastImportAt: "2026-03-21T12:00:00.000Z",
      lastResetAt: null,
    });

    const recommendedSummary = await getLocalDataPortabilitySummary();
    expect(recommendedSummary.backup_reminder_level).toBe("recommended");
    expect(recommendedSummary.backup_reminder_message).toMatch(
      /Consider exporting a fresh backup/i,
    );

    await saveStoreRecord("metadata", {
      id: "workspace",
      key: "workspace",
      schemaVersion: 1,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-21T12:00:00.000Z",
      lastExportAt: "2026-03-01T12:00:00.000Z",
      lastImportAt: "2026-03-21T12:00:00.000Z",
      lastResetAt: null,
    });

    const overdueSummary = await getLocalDataPortabilitySummary();
    expect(overdueSummary.backup_reminder_level).toBe("overdue");
    expect(overdueSummary.backup_reminder_message).toMatch(/more than 14 days old/i);

    dateNowSpy.mockRestore();
  });

  it("tracks export metadata and counts imported records across all stores", async () => {
    await saveStoreRecord("fitAnalyses", { id: "fit-1", score: 0.8 });
    await saveStoreRecord("desirabilityScores", { id: "score-1", value: 10 });
    await saveStoreRecord("applicationMaterials", { id: "material-1", kind: "cover_letter" });
    await saveStoreRecord("interviewPrepPacks", { id: "prep-1", title: "Prep" });
    await saveStoreRecord("resumeTuning", { id: "resume-1", title: "Resume" });
    await saveStoreRecord("applicationOps", { id: "ops-1", state: "applied" });
    await saveStoreRecord("interviewStages", { id: "stage-1", name: "Phone" });
    await saveStoreRecord("outcomes", { id: "outcome-1", status: "offer" });

    const exported = await exportLocalDataArchive();
    const exportedText = await exported.blob.text();
    const parsed = JSON.parse(exportedText) as { exported_at: string };
    const summaryAfterExport = await getLocalDataPortabilitySummary();

    expect(summaryAfterExport.last_export_at).toBe(parsed.exported_at);

    const importResult = await importLocalDataArchive(btoa(exportedText));
    expect(importResult.added_count).toBe(5);
    expect(importResult.updated_count).toBe(3);
    expect(importResult.unchanged_count).toBe(0);
  });
});
