import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { PipelineModal } from "../../../src/components/roles/PipelineModal";

describe("PipelineModal", () => {
  it("renders loading and error states", () => {
    render(
      <PipelineModal
        counters={{ needs_follow_up: 1, overdue_actions: 2, upcoming_deadlines: 3 }}
        error="Pipeline unavailable"
        items={[]}
        loading
        onClose={vi.fn()}
        onOpenRole={vi.fn()}
        pipelineOverdueOnly={false}
        pipelineRecentlyUpdated={false}
        pipelineStageFilter="all"
        pipelineWeekDeadlines={false}
        setPipelineOverdueOnly={vi.fn()}
        setPipelineRecentlyUpdated={vi.fn()}
        setPipelineStageFilter={vi.fn()}
        setPipelineWeekDeadlines={vi.fn()}
      />,
    );

    expect(screen.getByText(/Loading pipeline/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Pipeline unavailable");
  });

  it("renders items, filters by stage, and forwards interactions", () => {
    const setPipelineOverdueOnly = vi.fn();
    const setPipelineWeekDeadlines = vi.fn();
    const setPipelineRecentlyUpdated = vi.fn();
    const setPipelineStageFilter = vi.fn();
    const onOpenRole = vi.fn();

    const { rerender } = render(
      <PipelineModal
        counters={{ needs_follow_up: 1, overdue_actions: 2, upcoming_deadlines: 3 }}
        error={null}
        items={[
          {
            role_id: 1,
            company: "Evergray",
            title: "Platform Engineer",
            status: "interviewing",
            interview_stage: "technical",
            next_action_at: "2026-03-18T15:00:00.000Z",
            deadline_at: null,
            needs_attention: true,
            attention_reasons: ["Follow up"],
            updated_at: "2026-03-18T14:00:00.000Z",
          },
        ]}
        loading={false}
        onClose={vi.fn()}
        onOpenRole={onOpenRole}
        pipelineOverdueOnly={false}
        pipelineRecentlyUpdated={false}
        pipelineStageFilter="all"
        pipelineWeekDeadlines={false}
        setPipelineOverdueOnly={setPipelineOverdueOnly}
        setPipelineRecentlyUpdated={setPipelineRecentlyUpdated}
        setPipelineStageFilter={setPipelineStageFilter}
        setPipelineWeekDeadlines={setPipelineWeekDeadlines}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Overdue actions/i));
    fireEvent.click(screen.getByLabelText(/This-week deadlines/i));
    fireEvent.click(screen.getByLabelText(/Recently updated/i));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "technical" } });
    fireEvent.click(screen.getByRole("button", { name: /Platform Engineer/i }));

    expect(setPipelineOverdueOnly).toHaveBeenCalledWith(true);
    expect(setPipelineWeekDeadlines).toHaveBeenCalledWith(true);
    expect(setPipelineRecentlyUpdated).toHaveBeenCalledWith(true);
    expect(setPipelineStageFilter).toHaveBeenCalledWith("technical");
    expect(onOpenRole).toHaveBeenCalledWith(1);

    rerender(
      <PipelineModal
        counters={{ needs_follow_up: 1, overdue_actions: 2, upcoming_deadlines: 3 }}
        error={null}
        items={[
          {
            role_id: 1,
            company: "Evergray",
            title: "Platform Engineer",
            status: "interviewing",
            interview_stage: "technical",
            next_action_at: "2026-03-18T15:00:00.000Z",
            deadline_at: null,
            needs_attention: true,
            attention_reasons: ["Follow up"],
            updated_at: "2026-03-18T14:00:00.000Z",
          },
        ]}
        loading={false}
        onClose={vi.fn()}
        onOpenRole={onOpenRole}
        pipelineOverdueOnly={false}
        pipelineRecentlyUpdated={false}
        pipelineStageFilter="offer"
        pipelineWeekDeadlines={false}
        setPipelineOverdueOnly={setPipelineOverdueOnly}
        setPipelineRecentlyUpdated={setPipelineRecentlyUpdated}
        setPipelineStageFilter={setPipelineStageFilter}
        setPipelineWeekDeadlines={setPipelineWeekDeadlines}
      />,
    );

    expect(screen.queryByRole("button", { name: /Platform Engineer/i })).not.toBeInTheDocument();
  });
});
