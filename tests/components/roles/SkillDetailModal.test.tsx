import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { SkillDetailModal } from "../../../src/components/roles/SkillDetailModal";

describe("SkillDetailModal", () => {
  it("renders loading and error states", () => {
    render(
      <SkillDetailModal
        error="Unable to load"
        loading
        onClose={vi.fn()}
        onOpenRole={vi.fn()}
        skill={null}
      />,
    );

    expect(screen.getByText(/Loading skill details/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load");
  });

  it("renders skill details and opens referenced roles", () => {
    const onOpenRole = vi.fn();
    render(
      <SkillDetailModal
        error={null}
        loading={false}
        onClose={vi.fn()}
        onOpenRole={onOpenRole}
        skill={{
          id: 1,
          name: "TypeScript",
          category: null,
          usage_count: 2,
          roles: [
            {
              id: 42,
              company: "Evergray",
              title: "Engineer",
              status: "open",
              created_at: "2026-03-18T00:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Category: Uncategorized")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Engineer — Evergray/i }));
    expect(onOpenRole).toHaveBeenCalledWith(42);
  });
});
