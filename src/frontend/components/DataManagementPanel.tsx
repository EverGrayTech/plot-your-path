"use client";

import React from "react";

import {
  type DataPortabilitySummary,
  exportDataArchive,
  getDataPortabilitySummary,
  importDataArchive,
  resetDataWorkspace,
} from "../lib/api";
import { Modal } from "./Modal";

function describeTimestamp(value: string | null): string {
  if (!value) {
    return "Not yet";
  }

  return new Date(value).toLocaleString();
}

function describeResumePresence(hasResume: boolean): string {
  return hasResume ? "Available" : "Not added yet";
}

function describeRuntime(desktopRuntime: boolean): string {
  return desktopRuntime ? "Packaged desktop runtime" : "Browser-connected development runtime";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Backup file could not be read."));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Backup file could not be read."));
        return;
      }

      const [, payload] = result.split(",", 2);
      resolve(payload ?? "");
    };
    reader.readAsDataURL(file);
  });
}

export function DataManagementPanel() {
  const [summary, setSummary] = React.useState<DataPortabilitySummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [operationError, setOperationError] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  async function loadSummary() {
    setLoading(true);
    setError(null);

    try {
      setSummary(await getDataPortabilitySummary());
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to load data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    async function loadInitialSummary() {
      setLoading(true);
      setError(null);

      try {
        setSummary(await getDataPortabilitySummary());
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadInitialSummary();
  }, []);

  React.useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function handleExport() {
    setExporting(true);
    setOperationError(null);

    try {
      const { blob, filename } = await exportDataArchive();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);

      setNotice("Backup created and downloaded.");
      await loadSummary();
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : "Backup could not be created.";
      setOperationError(message);
    } finally {
      setExporting(false);
    }
  }

  async function handleImportSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImporting(true);
    setOperationError(null);

    try {
      const payload = await fileToBase64(file);
      await importDataArchive(payload);
      setNotice("Backup restored.");
      await loadSummary();
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : "Backup could not be restored.";
      setOperationError(message);
    } finally {
      event.target.value = "";
      setImporting(false);
    }
  }

  async function handleReset() {
    setResetting(true);
    setOperationError(null);

    try {
      await resetDataWorkspace();
      setShowResetConfirmation(false);
      setNotice("Local data reset.");
      await loadSummary();
    } catch (actionError) {
      const message =
        actionError instanceof Error ? actionError.message : "Local data could not be reset.";
      setOperationError(message);
    } finally {
      setResetting(false);
    }
  }

  return (
    <section className="card" aria-label="Local data and backup">
      <div className="section-header">
        <h3>Local data and backup</h3>
        <span className="badge badge-info">Local-first</span>
      </div>

      <p>
        Plot Your Path stores your workspace on this device by default. Use backups before major
        cleanup, test installs, or moving to another machine.
      </p>

      {notice ? (
        <div className="toast-container">
          <output className="toast toast-success">{notice}</output>
        </div>
      ) : null}

      {summary ? (
        <div className="flex-row mb-md">
          <span className="badge badge-neutral">
            Last export: {describeTimestamp(summary.last_export_at)}
          </span>
          <span className="badge badge-neutral">
            Last restore: {describeTimestamp(summary.last_import_at)}
          </span>
          <span className="badge badge-neutral">
            Last reset: {describeTimestamp(summary.last_reset_at)}
          </span>
        </div>
      ) : null}

      {!loading && summary && !summary.desktop_runtime ? (
        <output aria-live="polite" className="alert alert-warning">
          Desktop packaging checks are most accurate in the packaged app. You are currently viewing
          this through the browser-connected development runtime.
        </output>
      ) : null}

      {error ? (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {operationError ? (
        <div className="structured-message structured-message-error" role="alert">
          <h4>Data operation could not be completed</h4>
          <p>{operationError}</p>
          <p className="form-helper">
            Keep your current backup file, confirm the app is still open, and try again. If the
            problem continues, capture the Windows smoke-test notes before sharing the build.
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="spinner-center" aria-label="Loading local data summary">
          <span className="spinner" />
        </div>
      ) : null}

      {!loading && summary ? (
        <div className="form-grid">
          <div className="metadata-block">
            <span className="metadata-key">Workspace location</span>
            <span className="metadata-value">
              <code>{summary.data_root}</code>
            </span>

            <span className="metadata-key">Database file</span>
            <span className="metadata-value">
              <code>{summary.database_path}</code>
            </span>

            <span className="metadata-key">Runtime</span>
            <span className="metadata-value">{describeRuntime(summary.desktop_runtime)}</span>

            <span className="metadata-key">Roles captured</span>
            <span className="metadata-value">{summary.jobs_count}</span>

            <span className="metadata-key">Skills tracked</span>
            <span className="metadata-value">{summary.skills_count}</span>

            <span className="metadata-key">Resume profile</span>
            <span className="metadata-value">{describeResumePresence(summary.has_resume)}</span>
          </div>

          <div className="structured-message structured-message-info">
            <h4>What a backup includes</h4>
            <p>
              The export contains your SQLite database plus captured local files such as cleaned job
              descriptions and resume/profile artifacts.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex-row mt-md">
        <button
          className={`btn btn-primary${exporting ? " btn-loading" : ""}`}
          disabled={exporting || importing || resetting}
          onClick={() => void handleExport()}
          type="button"
        >
          {exporting ? "Creating backup" : "Download backup"}
        </button>

        <button
          className="btn btn-secondary"
          disabled={exporting || importing || resetting}
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          Restore backup
        </button>

        <button
          className="btn btn-destructive"
          disabled={exporting || importing || resetting}
          onClick={() => setShowResetConfirmation(true)}
          type="button"
        >
          Reset local data
        </button>
      </div>

      <input
        accept=".zip,application/zip"
        className="visually-hidden"
        onChange={handleImportSelection}
        ref={fileInputRef}
        type="file"
      />

      {importing ? (
        <div aria-live="polite" className="progress-panel mt-md">
          <p>Restoring backup and replacing the current local workspace.</p>
          <progress className="progress-bar" />
          <p className="form-helper">Do not close the app until the restore finishes.</p>
        </div>
      ) : null}

      {showResetConfirmation ? (
        <Modal onClose={() => setShowResetConfirmation(false)} title="Reset local data">
          <div className="form-grid">
            <p>
              This removes captured roles, generated materials, and local files from this device.
              Use a backup first if you may want this workspace again.
            </p>
            <div className="flex-row">
              <button
                className="btn btn-tertiary"
                onClick={() => setShowResetConfirmation(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className={`btn btn-destructive${resetting ? " btn-loading" : ""}`}
                disabled={resetting}
                onClick={() => void handleReset()}
                type="button"
              >
                {resetting ? "Resetting data" : "Delete local data"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}
