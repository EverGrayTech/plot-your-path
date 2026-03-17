import { render, screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import React from "react";

import SettingsPage from "../../../src/frontend/app/settings/page";

describe("SettingsPage", () => {
  it("renders settings sections and local-first trust guidance", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data_root: "/tmp/plot-your-path",
          database_path: "/tmp/plot-your-path/plot_your_path.db",
          desktop_runtime: true,
          has_resume: false,
          jobs_count: 0,
          last_export_at: null,
          last_import_at: null,
          last_reset_at: null,
          skills_count: 0,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      ),
    );

    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Local-first trust model/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /AI Model Configuration/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Local data and backup/i })).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: /Product architecture status/i }),
    ).toBeInTheDocument();
  });
});
