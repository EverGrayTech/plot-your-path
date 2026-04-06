import { render, screen, waitFor } from "@testing-library/react";

import YourDataPage from "../../src/app/settings/data/page";

describe("YourDataPage", () => {
  it("renders the dedicated data management page", async () => {
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

    render(<YourDataPage />);

    expect(screen.getByRole("heading", { name: "Your Data" })).toBeInTheDocument();
    expect(
      screen.getByText(/Back up, restore, or reset your browser-local workspace/i),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Local data and backup/i })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /Download backup/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Restore backup/i })).toBeInTheDocument();
  });
});
