export interface LocalRecordBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMetadata extends LocalRecordBase {
  key: "workspace";
  schemaVersion: number;
  lastExportAt: string | null;
  lastImportAt: string | null;
  lastResetAt: string | null;
}

export type LocalStoreName =
  | "metadata"
  | "aiSettings"
  | "roles"
  | "skills"
  | "fitAnalyses"
  | "desirabilityScores"
  | "applicationMaterials"
  | "interviewPrepPacks"
  | "resumeTuning"
  | "applicationOps"
  | "interviewStages"
  | "outcomes";

export interface LocalStoreDefinition<TRecord> {
  name: LocalStoreName;
  keyPath: keyof TRecord & string;
}

const DB_NAME = "plot-your-path-local";
const DB_VERSION = 2;
const WORKSPACE_METADATA_ID = "workspace";
const WORKSPACE_SCHEMA_VERSION = 1;

const STORE_DEFINITIONS: Array<LocalStoreDefinition<Record<string, unknown>>> = [
  { name: "metadata", keyPath: "id" },
  { name: "aiSettings", keyPath: "id" },
  { name: "roles", keyPath: "id" },
  { name: "skills", keyPath: "id" },
  { name: "fitAnalyses", keyPath: "id" },
  { name: "desirabilityScores", keyPath: "id" },
  { name: "applicationMaterials", keyPath: "id" },
  { name: "interviewPrepPacks", keyPath: "id" },
  { name: "resumeTuning", keyPath: "id" },
  { name: "applicationOps", keyPath: "id" },
  { name: "interviewStages", keyPath: "id" },
  { name: "outcomes", keyPath: "id" },
];

function ensureIndexedDbAvailable(): IDBFactory {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("IndexedDB is not available in this environment.");
  }

  return window.indexedDB;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionComplete(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
  });
}

export function createLocalId(prefix: string): string {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${suffix}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export async function openLocalWorkspaceDb(): Promise<IDBDatabase> {
  const indexedDb = ensureIndexedDbAvailable();

  return await new Promise((resolve, reject) => {
    const request = indexedDb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORE_DEFINITIONS) {
        if (!db.objectStoreNames.contains(store.name)) {
          db.createObjectStore(store.name, { keyPath: store.keyPath });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open IndexedDB."));
  });
}

export async function deleteLocalWorkspaceDbForTests(): Promise<void> {
  const indexedDb = ensureIndexedDbAvailable();

  await new Promise<void>((resolve, reject) => {
    const request = indexedDb.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Unable to delete IndexedDB."));
    request.onblocked = () => reject(new Error("IndexedDB deletion was blocked."));
  });
}

export async function initializeLocalWorkspace(): Promise<WorkspaceMetadata> {
  const db = await openLocalWorkspaceDb();
  try {
    const transaction = db.transaction("metadata", "readwrite");
    const store = transaction.objectStore("metadata");
    const existing = (await requestToPromise(store.get(WORKSPACE_METADATA_ID))) as
      | WorkspaceMetadata
      | undefined;

    if (existing) {
      await transactionComplete(transaction);
      return existing;
    }

    const timestamp = nowIso();
    const metadata: WorkspaceMetadata = {
      id: WORKSPACE_METADATA_ID,
      key: "workspace",
      schemaVersion: WORKSPACE_SCHEMA_VERSION,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastExportAt: null,
      lastImportAt: null,
      lastResetAt: null,
    };

    store.put(metadata);
    await transactionComplete(transaction);
    return metadata;
  } finally {
    db.close();
  }
}

export async function listStoreRecords<TRecord>(storeName: LocalStoreName): Promise<TRecord[]> {
  const db = await openLocalWorkspaceDb();
  try {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const records = (await requestToPromise(store.getAll())) as TRecord[];
    await transactionComplete(transaction);
    return records;
  } finally {
    db.close();
  }
}

export async function saveStoreRecord<TRecord extends { id: string }>(
  storeName: LocalStoreName,
  record: TRecord,
): Promise<TRecord> {
  const db = await openLocalWorkspaceDb();
  try {
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(record);
    await transactionComplete(transaction);
    return record;
  } finally {
    db.close();
  }
}

export async function getStoreRecord<TRecord>(
  storeName: LocalStoreName,
  id: string,
): Promise<TRecord | null> {
  const db = await openLocalWorkspaceDb();
  try {
    const transaction = db.transaction(storeName, "readonly");
    const result = await requestToPromise(transaction.objectStore(storeName).get(id));
    await transactionComplete(transaction);
    return (result as TRecord | undefined) ?? null;
  } finally {
    db.close();
  }
}
