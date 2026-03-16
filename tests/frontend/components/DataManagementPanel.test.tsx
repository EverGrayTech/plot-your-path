import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { DataManagementPanel } from "../../../src/frontend/components/DataManagementPanel";

describe("DataManagementPanel", () => {
  const summaryPayload = {
    data_root: null,
    database_path: null,
    desktop_runtime: false,
    storage_mode: "browser_local",
    backup_reminder_level: "recommended",
    backup_reminder_message: "Consider exporting a fresh backup after recent changes.",
    has_resume: true,
    jobs_count: 2,
    last_export_at: null,
    last_import_at: null,
    last_reset_at: null,
    skills_count: 5,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and renders local data summary details", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify(summaryPayload), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(<DataManagementPanel />);

    expect(screen.getByLabelText(/Loading local data summary/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Local data and backup/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/Consider exporting a fresh backup/i)).toBeInTheDocument();
    expect(screen.getByText(/Browser-managed local storage/i)).toBeInTheDocument();
    expect(screen.getByText(/portable zip archive with readable JSON/i)).toBeInTheDocument();
    expect(screen.getByText(/active browser-local MVP path/i)).toBeInTheDocument();
    expect(screen.getByText(/Export after meaningful changes/i)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText(/Download backup/i)).toBeInTheDocument();
    expect(screen.getByText(/Restore backup/i)).toBeInTheDocument();
  });

  it("confirms reset before deleting local data", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(summaryPayload), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            completed_at: "2026-03-14T00:00:00Z",
            message: "Local data reset successfully.",
            added_count: 0,
            updated_count: 0,
            unchanged_count: 0,
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...summaryPayload,
            has_resume: false,
            jobs_count: 0,
            last_reset_at: "2026-03-14T00:00:00Z",
            skills_count: 0,
            backup_reminder_level: "none",
            backup_reminder_message: null,
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        ),
      );

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
