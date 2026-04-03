import { render, screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import type React from "react";
import { vi } from "vitest";

vi.mock("../../src/components/settings/AISettingsPanel", () => ({
  AISettingsPanel: () => (
    <section aria-label="AI model configuration">
      <h3>AI Model Configuration</h3>
      <p>Use the shared AI configuration panel to choose between the app-provided route.</p>
      <div data-testid="ai-config-panel">Mock AI config panel</div>
    </section>
  ),
}));

import SettingsPage from "../../src/app/settings/page";

describe("SettingsPage", () => {
  it("renders settings sections and local-first trust guidance", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data_root: "/tmp/plot-your-path",
          database_path: "/tmp/plot-your-path/plot_your_path.db",
          storage_mode: "browser_local",
          has_resume: false,
          roles_count: 0,
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
    expect(screen.getByTestId("ai-config-panel")).toBeInTheDocument();
    expect(
      screen.getByText(/use the shared AI configuration panel to choose between the app-provided/i),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Local data and backup/i })).toBeInTheDocument();
    });
    expect(
      screen.getByRole("heading", { name: /Product architecture status/i }),
    ).toBeInTheDocument();
  });
});
