"use client";

import React from "react";

import type { DataPortabilitySummary } from "../lib/dataModels";
import { getFrontendServices } from "../lib/services";
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
  const services = getFrontendServices();
  const [summary, setSummary] = React.useState<DataPortabilitySummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [operationError, setOperationError] = React.useState<string | null>(null);
  const [operationNotice, setOperationNotice] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  async function loadSummary() {
    setLoading(true);
    setError(null);

    try {
      setSummary(await services.portability.getDataPortabilitySummary());
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
        setSummary(await services.portability.getDataPortabilitySummary());
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Failed to load data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadInitialSummary();
  }, [services]);

  React.useEffect(() => {
    if (!notice && !operationNotice) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotice(null);
      setOperationNotice(null);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [notice, operationNotice]);

  async function handleExport() {
    setExporting(true);
    setOperationError(null);

    try {
      const { blob, filename } = await services.portability.exportDataArchive();
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
      const result = await services.portability.importDataArchive(payload);
      setNotice("Backup restored.");
      if (
        typeof result.added_count === "number" ||
        typeof result.updated_count === "number" ||
        typeof result.unchanged_count === "number"
      ) {
        setOperationNotice(
          `Import summary: ${result.added_count ?? 0} added, ${result.updated_count ?? 0} updated, ${result.unchanged_count ?? 0} unchanged.`,
        );
      }
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
      await services.portability.resetDataWorkspace();
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
        Your workspace stays in this browser by default. Export a backup before major cleanup,
        device changes, or experimental testing.
      </p>

      {notice ? (
        <div className="toast-container">
          <output className="toast toast-success">{notice}</output>
        </div>
      ) : null}

      {operationNotice ? (
        <div className="toast-container">
          <output className="toast toast-success">{operationNotice}</output>
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
        <div className="metadata-block mb-md">
          <span className="metadata-key">Roles captured</span>
          <span className="metadata-value">{summary.roles_count}</span>

          <span className="metadata-key">Skills tracked</span>
          <span className="metadata-value">{summary.skills_count}</span>

          <span className="metadata-key">Resume profile</span>
          <span className="metadata-value">{describeResumePresence(summary.has_resume)}</span>
        </div>
      ) : null}

      <div className="flex-row">
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

      {!loading && summary ? (
        <section className="structured-message structured-message-info mt-md">
          <h4>What to know</h4>
          <p>
            Backups export your workspace as a readable JSON archive. Provider credentials and API
            keys are not included.
          </p>
          <p>
            Restore merges a backup into the current browser workspace. Reset permanently removes
            local roles, skills, and generated materials from this browser profile.
          </p>
        </section>
      ) : null}

      <input
        accept=".json,application/json"
        className="visually-hidden"
        onChange={handleImportSelection}
        ref={fileInputRef}
        type="file"
      />

      {importing ? (
        <div aria-live="polite" className="progress-panel mt-md">
          <p>Restoring backup and merging it into the current local workspace.</p>
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
