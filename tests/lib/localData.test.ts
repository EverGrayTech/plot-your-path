import {
  createLocalId,
  getStoreRecord,
  initializeLocalWorkspace,
  listStoreRecords,
  nowIso,
  saveStoreRecord,
} from "../../src/lib/localData";

import { indexedDB } from "fake-indexeddb";

describe("localData foundation", () => {
  beforeAll(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });
  });

  it("initializes workspace metadata once", async () => {
    const first = await initializeLocalWorkspace();
    const second = await initializeLocalWorkspace();

    expect(first.id).toBe("workspace");
    expect(first.schemaVersion).toBe(1);
    expect(second.id).toBe("workspace");
    expect(second.createdAt).toBe(first.createdAt);
  });

  it("creates ids with stable prefixes", () => {
    const id = createLocalId("role");
    expect(id.startsWith("role_")).toBe(true);
  });

  it("saves and loads records from a local store", async () => {
    const record = {
      id: createLocalId("role"),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      title: "Engineer",
    };

    await saveStoreRecord("roles", record);
    const loaded = await getStoreRecord<typeof record>("roles", record.id);
    const all = await listStoreRecords<typeof record>("roles");

    expect(loaded?.title).toBe("Engineer");
    expect(all.some((item) => item.id === record.id)).toBe(true);
  });
});
