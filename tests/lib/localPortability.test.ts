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
});
