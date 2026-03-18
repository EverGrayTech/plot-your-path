import { act, renderHook, waitFor } from "@testing-library/react";

import { setJobsLoaderForTests, useJobsBoard } from "../../src/lib/useJobsBoard";

const jobs = [
  {
    id: 1,
    company: "Beta Corp",
    title: "Frontend Engineer",
    salary_range: null,
    created_at: "2026-03-18T12:00:00.000Z",
    skills_count: 2,
    status: "open" as const,
    fit_score: 50,
    fit_recommendation: "maybe" as const,
    desirability_score: 8,
  },
  {
    id: 2,
    company: "Acme",
    title: "Platform Engineer",
    salary_range: null,
    created_at: "2026-03-17T12:00:00.000Z",
    skills_count: 4,
    status: "submitted" as const,
    fit_score: 90,
    fit_recommendation: "go" as const,
    desirability_score: null,
  },
  {
    id: 3,
    company: "Delta",
    title: "QA Engineer",
    salary_range: null,
    created_at: "2026-03-16T12:00:00.000Z",
    skills_count: 1,
    status: "rejected" as const,
    fit_score: null,
    fit_recommendation: null,
    desirability_score: 4,
  },
];

describe("useJobsBoard", () => {
  afterEach(() => {
    setJobsLoaderForTests(null);
    vi.restoreAllMocks();
  });

  it("loads jobs and applies search, filter, sort, and capture reset behavior", async () => {
    setJobsLoaderForTests(async () => jobs);

    const { result } = renderHook(() => useJobsBoard());

    await waitFor(() => expect(result.current.loadingJobs).toBe(false));
    expect(result.current.sortedJobs).toHaveLength(3);

    act(() => {
      result.current.setSearch("platform");
    });
    expect(result.current.sortedJobs.map((job) => job.id)).toEqual([2]);

    act(() => {
      result.current.setSearch("");
      result.current.setRecommendationFilter("not_analyzed");
    });
    expect(result.current.sortedJobs.map((job) => job.id)).toEqual([3]);

    act(() => {
      result.current.setRecommendationFilter("all");
      result.current.setDesirabilityFilter("scored");
    });
    expect(result.current.sortedJobs.map((job) => job.id)).toEqual([1, 3]);

    act(() => {
      result.current.setDesirabilityFilter("all");
      result.current.setSortMode("company_az");
    });
    expect(result.current.sortedJobs.map((job) => job.company)).toEqual(["Acme", "Beta Corp", "Delta"]);

    act(() => {
      result.current.setSortMode("oldest");
    });
    expect(result.current.sortedJobs.map((job) => job.id)).toEqual([3, 2, 1]);

    act(() => {
      result.current.setSortMode("desirability_desc");
    });
    expect(result.current.sortedJobs.map((job) => job.id)).toEqual([1, 3, 2]);

    act(() => {
      result.current.setSortMode("smart_sort");
    });
    expect(result.current.sortedJobs.map((job) => job.id)[0]).toBe(1);

    act(() => {
      result.current.setSearch("beta");
      result.current.applyCaptureResult({
        status: "success",
        role_id: 99,
        company: "NewCo",
        title: "Principal Engineer",
        skills_extracted: 5,
        processing_time_seconds: 0.4,
      });
    });

    expect(result.current.search).toBe("");
    expect(result.current.sortMode).toBe("newest");
    expect(result.current.recommendationFilter).toBe("all");
    expect(result.current.desirabilityFilter).toBe("all");
    expect(result.current.captureNotice).toMatch(/Captured Principal Engineer at NewCo/i);
  });

  it("surfaces loader failures and supports reload", async () => {
    const loader = vi
      .fn<[], Promise<typeof jobs>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(jobs);
    setJobsLoaderForTests(loader);

    const { result } = renderHook(() => useJobsBoard());

    await waitFor(() => expect(result.current.loadingJobs).toBe(false));
    expect(result.current.listError).toBe("boom");

    await act(async () => {
      await result.current.loadJobs();
    });

    expect(result.current.listError).toBeNull();
    expect(result.current.sortedJobs).toHaveLength(3);
  });
});
