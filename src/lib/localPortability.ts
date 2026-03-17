import type { DataOperationResult, DataPortabilitySummary } from "./dataModels";
import {
  type WorkspaceMetadata,
  initializeLocalWorkspace,
  listStoreRecords,
  nowIso,
  openLocalWorkspaceDb,
} from "./localData";

interface PortableWorkspaceSnapshot {
  version: number;
  exported_at: string;
  metadata: WorkspaceMetadata;
  jobs: Record<string, unknown>[];
  skills: Record<string, unknown>[];
  fitAnalyses: Record<string, unknown>[];
  desirabilityScores: Record<string, unknown>[];
  applicationMaterials: Record<string, unknown>[];
  interviewPrepPacks: Record<string, unknown>[];
  resumeTuning: Record<string, unknown>[];
  applicationOps: Record<string, unknown>[];
  interviewStages: Record<string, unknown>[];
  outcomes: Record<string, unknown>[];
}

const PORTABLE_WORKSPACE_VERSION = 1;

async function updateWorkspaceMetadata(
  updater: (current: WorkspaceMetadata) => WorkspaceMetadata,
): Promise<void> {
  const current = await initializeLocalWorkspace();
  const next = await updater(current);
  const db = await openLocalWorkspaceDb();
  try {
    const transaction = db.transaction("metadata", "readwrite");
    transaction.objectStore("metadata").put(next);
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Failed to update metadata."));
      transaction.onabort = () =>
        reject(transaction.error ?? new Error("Metadata update aborted."));
    });
  } finally {
    db.close();
  }
}

function buildBackupReminder(lastExportAt: string | null): {
  level: DataPortabilitySummary["backup_reminder_level"];
  message: string | null;
} {
  if (!lastExportAt) {
    return {
      level: "recommended",
      message: "No backup exported yet for this browser-local workspace.",
    };
  }

  const ageMs = Date.now() - new Date(lastExportAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays >= 14) {
    return {
      level: "overdue",
      message: "Your latest backup is more than 14 days old. Export a fresh backup soon.",
    };
  }

  if (ageDays >= 3) {
    return {
      level: "recommended",
      message: "Consider exporting a fresh backup after recent changes.",
    };
  }

  return {
    level: "none",
    message: null,
  };
}

export async function getLocalDataPortabilitySummary(): Promise<DataPortabilitySummary> {
  const metadata = await initializeLocalWorkspace();
  const jobs = await listStoreRecords<Record<string, unknown>>("jobs");
  const skills = await listStoreRecords<Record<string, unknown>>("skills");
  const reminder = buildBackupReminder(metadata.lastExportAt);

  return {
    data_root: null,
    database_path: null,
    storage_mode: "browser_local",
    backup_reminder_level: reminder.level,
    backup_reminder_message: reminder.message,
    has_resume: false,
    jobs_count: jobs.filter((record) => typeof record.roleId === "number").length,
    last_export_at: metadata.lastExportAt,
    last_import_at: metadata.lastImportAt,
    last_reset_at: metadata.lastResetAt,
    skills_count: skills.length,
  };
}

export async function exportLocalDataArchive(): Promise<{ blob: Blob; filename: string }> {
  const metadata = await initializeLocalWorkspace();
  const snapshot: PortableWorkspaceSnapshot = {
    version: PORTABLE_WORKSPACE_VERSION,
    exported_at: nowIso(),
    metadata,
    jobs: await listStoreRecords<Record<string, unknown>>("jobs"),
    skills: await listStoreRecords<Record<string, unknown>>("skills"),
    fitAnalyses: await listStoreRecords<Record<string, unknown>>("fitAnalyses"),
    desirabilityScores: await listStoreRecords<Record<string, unknown>>("desirabilityScores"),
    applicationMaterials: await listStoreRecords<Record<string, unknown>>("applicationMaterials"),
    interviewPrepPacks: await listStoreRecords<Record<string, unknown>>("interviewPrepPacks"),
    resumeTuning: await listStoreRecords<Record<string, unknown>>("resumeTuning"),
    applicationOps: await listStoreRecords<Record<string, unknown>>("applicationOps"),
    interviewStages: await listStoreRecords<Record<string, unknown>>("interviewStages"),
    outcomes: await listStoreRecords<Record<string, unknown>>("outcomes"),
  };

  await updateWorkspaceMetadata((current) => ({
    ...current,
    lastExportAt: snapshot.exported_at,
    updatedAt: snapshot.exported_at,
  }));

  return {
    blob: new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }),
    filename: `plot-your-path-backup-${snapshot.exported_at.slice(0, 10)}.json`,
  };
}

export async function importLocalDataArchive(archiveBase64: string): Promise<DataOperationResult> {
  const json = atob(archiveBase64);
  const snapshot = JSON.parse(json) as PortableWorkspaceSnapshot;
  const db = await openLocalWorkspaceDb();
  const completedAt = nowIso();

  try {
    const storeNames = [
      "jobs",
      "skills",
      "fitAnalyses",
      "desirabilityScores",
      "applicationMaterials",
      "interviewPrepPacks",
      "resumeTuning",
      "applicationOps",
      "interviewStages",
      "outcomes",
    ] as const;
    const transaction = db.transaction(storeNames, "readwrite");

    for (const storeName of storeNames) {
      const store = transaction.objectStore(storeName);
      const incoming = snapshot[storeName] ?? [];
      for (const record of incoming) {
        store.put(record);
      }
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Import failed."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Import aborted."));
    });
  } finally {
    db.close();
  }

  await updateWorkspaceMetadata((current) => ({
    ...current,
    lastImportAt: completedAt,
    updatedAt: completedAt,
  }));

  return {
    completed_at: completedAt,
    message: "Backup restored into the current browser-local workspace.",
    added_count:
      snapshot.jobs.length +
      snapshot.skills.length +
      snapshot.fitAnalyses.length +
      snapshot.desirabilityScores.length +
      snapshot.applicationMaterials.length +
      snapshot.interviewPrepPacks.length +
      snapshot.resumeTuning.length,
    updated_count:
      snapshot.applicationOps.length + snapshot.interviewStages.length + snapshot.outcomes.length,
    unchanged_count: 0,
  };
}

export async function resetLocalWorkspace(): Promise<DataOperationResult> {
  const db = await openLocalWorkspaceDb();
  const completedAt = nowIso();

  try {
    const storeNames = [
      "jobs",
      "skills",
      "fitAnalyses",
      "desirabilityScores",
      "applicationMaterials",
      "interviewPrepPacks",
      "resumeTuning",
      "applicationOps",
      "interviewStages",
      "outcomes",
    ] as const;
    const transaction = db.transaction(storeNames, "readwrite");

    for (const storeName of storeNames) {
      transaction.objectStore(storeName).clear();
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Reset failed."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Reset aborted."));
    });
  } finally {
    db.close();
  }

  await updateWorkspaceMetadata((current) => ({
    ...current,
    lastResetAt: completedAt,
    updatedAt: completedAt,
  }));

  return {
    completed_at: completedAt,
    message: "Local data reset successfully.",
    added_count: 0,
    updated_count: 0,
    unchanged_count: 0,
  };
}
