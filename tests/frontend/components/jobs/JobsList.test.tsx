import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { JobsList } from "../../../../src/frontend/components/jobs/JobsList";

describe("JobsList", () => {
  it("renders capture notice and job rows, then forwards selection", () => {
    const onSelectJob = vi.fn();

    render(
      <JobsList
        captureNotice="Captured New Role at New Co"
        jobs={[
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
        loadingJobs={false}
        onSelectJob={onSelectJob}
      />,
    );

    expect(screen.getByText("Captured New Role at New Co")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Engineer — Beta Co/i })).toBeInTheDocument();
    expect(screen.getByText(/Needs attention/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Engineer — Beta Co/i }));

    expect(onSelectJob).toHaveBeenCalledWith(2);
  });

  it("renders empty loading and error states without the jobs list", () => {
    const { rerender } = render(
      <JobsList
        captureNotice={null}
        jobs={[]}
        listError={null}
        loadingJobs={true}
        onSelectJob={vi.fn()}
      />,
    );

    expect(screen.getByText("Loading jobs...")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();

    rerender(
      <JobsList
        captureNotice={null}
        jobs={[]}
        listError="Failed to load jobs."
        loadingJobs={false}
        onSelectJob={vi.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load jobs.");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
