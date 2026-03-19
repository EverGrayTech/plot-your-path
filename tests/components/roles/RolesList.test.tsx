import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { RolesList } from "../../../src/components/roles/RolesList";

describe("RolesList", () => {
  it("renders capture notice and role rows, then forwards selection", () => {
    const onSelectRole = vi.fn();

    render(
      <RolesList
        captureNotice="Captured New Role at New Co"
        roles={[
          {
            company: "Beta Co",
            created_at: "2026-03-05T10:00:00Z",
            current_interview_stage: "technical",
            desirability_score: 8.1,
            fit_recommendation: "go",
            fit_score: 76,
            id: 2,
            needs_attention: true,
            salary_range: "$120,000 - $150,000 USD",
            skills_count: 3,
            status: "open",
            title: "Engineer",
          },
        ]}
        listError={null}
        loadingRoles={false}
        onSelectRole={onSelectRole}
      />,
    );

    expect(screen.getByText("Captured New Role at New Co")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Beta Co/)).toBeInTheDocument();
    expect(screen.getByText(/Needs attention/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Engineer/i }));

    expect(onSelectRole).toHaveBeenCalledWith(2);
  });

  it("renders empty loading and error states without the roles list", () => {
    const onOpenCapture = vi.fn();
    const { rerender } = render(
      <RolesList
        captureNotice={null}
        roles={[]}
        listError={null}
        loadingRoles={true}
        onOpenCapture={onOpenCapture}
        onSelectRole={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Loading roles")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    rerender(
      <RolesList
        captureNotice={null}
        roles={[]}
        listError="Failed to load roles."
        loadingRoles={false}
        onOpenCapture={onOpenCapture}
        onSelectRole={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load roles.");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    rerender(
      <RolesList
        captureNotice={null}
        roles={[]}
        listError={null}
        loadingRoles={false}
        onOpenCapture={onOpenCapture}
        onSelectRole={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Capture your first role/i }));
    expect(onOpenCapture).toHaveBeenCalledTimes(1);
  });
});
