import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { DataManagementPanel } from "../../../src/frontend/components/DataManagementPanel";

describe("DataManagementPanel", () => {
  const summaryPayload = {
    data_root: "/tmp/plot-your-path",
    database_path: "/tmp/plot-your-path/plot_your_path.db",
    desktop_runtime: true,
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
