import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { DataManagementPanel } from "../../../src/frontend/components/DataManagementPanel";
import { indexedDB } from "fake-indexeddb";

describe("DataManagementPanel", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });
  });

  it("loads and renders local data summary details", async () => {
    render(<DataManagementPanel />);

    expect(screen.getByLabelText(/Loading local data summary/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByLabelText(/Loading local data summary/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No backup exported yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Browser-managed local storage/i)).toBeInTheDocument();
    expect(screen.getByText(/portable zip archive with readable JSON/i)).toBeInTheDocument();
    expect(screen.getByText(/active browser-local MVP path/i)).toBeInTheDocument();
    expect(screen.getByText(/Export after meaningful changes/i)).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText(/Download backup/i)).toBeInTheDocument();
    expect(screen.getByText(/Restore backup/i)).toBeInTheDocument();
  });

  it("confirms reset before deleting local data", async () => {
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
