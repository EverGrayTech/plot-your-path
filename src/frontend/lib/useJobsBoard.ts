"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import type { FitRecommendation, JobListItem, JobScrapeResponse } from "./api";
import { listJobs } from "./api";

export type SortMode = "newest" | "oldest" | "company_az" | "desirability_desc" | "smart_sort";
export type RecommendationFilter = "all" | FitRecommendation | "not_analyzed";
export type DesirabilityFilter = "all" | "scored" | "not_scored";

const SMART_SORT_FIT_WEIGHT = 0.6;
const SMART_SORT_DESIRABILITY_WEIGHT = 0.4;

async function fetchJobsList(
  setLoadingJobs: Dispatch<SetStateAction<boolean>>,
  setListError: Dispatch<SetStateAction<string | null>>,
  setJobs: Dispatch<SetStateAction<JobListItem[]>>,
) {
  setLoadingJobs(true);
  setListError(null);
  try {
    const response = await listJobs();
    setJobs(response);
  } catch (error) {
    if (error instanceof Error) {
      setListError(error.message);
    } else {
      setListError("Failed to load jobs.");
    }
  } finally {
    setLoadingJobs(false);
  }
}

export function useJobsBoard() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>("all");
  const [desirabilityFilter, setDesirabilityFilter] = useState<DesirabilityFilter>("all");

  const loadJobs = async () => {
    await fetchJobsList(setLoadingJobs, setListError, setJobs);
  };

  useEffect(() => {
    void fetchJobsList(setLoadingJobs, setListError, setJobs);
  }, []);

  function resetFilters() {
    setSearch("");
    setSortMode("newest");
    setRecommendationFilter("all");
    setDesirabilityFilter("all");
  }

  function applyCaptureResult(result: JobScrapeResponse) {
    setCaptureNotice(
      `Captured ${result.title} at ${result.company}. Filters were reset so it is visible.`,
    );
    resetFilters();
  }

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      job.company.toLowerCase().includes(query) ||
      job.title.toLowerCase().includes(query);

    if (!matchesSearch) {
      return false;
    }

    if (recommendationFilter === "all") {
      if (desirabilityFilter === "all") {
        return true;
      }
      if (desirabilityFilter === "scored") {
        return job.desirability_score !== null;
      }
      return job.desirability_score === null;
    }

    if (recommendationFilter === "not_analyzed") {
      if (job.fit_recommendation !== null) {
        return false;
      }
      if (desirabilityFilter === "all") {
        return true;
      }
      if (desirabilityFilter === "scored") {
        return job.desirability_score !== null;
      }
      return job.desirability_score === null;
    }

    if (job.fit_recommendation !== recommendationFilter) {
      return false;
    }
    if (desirabilityFilter === "all") {
      return true;
    }
    if (desirabilityFilter === "scored") {
      return job.desirability_score !== null;
    }
    return job.desirability_score === null;
  });

  const sortedJobs = [...filteredJobs].sort((left, right) => {
    if (sortMode === "desirability_desc") {
      return (right.desirability_score ?? -1) - (left.desirability_score ?? -1);
    }

    if (sortMode === "smart_sort") {
      const leftFit = left.fit_score ?? 0;
      const rightFit = right.fit_score ?? 0;
      const leftDesirability = (left.desirability_score ?? 0) * 10;
      const rightDesirability = (right.desirability_score ?? 0) * 10;
      const leftSmart =
        leftFit * SMART_SORT_FIT_WEIGHT + leftDesirability * SMART_SORT_DESIRABILITY_WEIGHT;
      const rightSmart =
        rightFit * SMART_SORT_FIT_WEIGHT + rightDesirability * SMART_SORT_DESIRABILITY_WEIGHT;
      return rightSmart - leftSmart;
    }

    if (sortMode === "company_az") {
      return left.company.localeCompare(right.company);
    }

    const leftTs = new Date(left.created_at).getTime();
    const rightTs = new Date(right.created_at).getTime();
    if (sortMode === "oldest") {
      return leftTs - rightTs;
    }
    return rightTs - leftTs;
  });

  return {
    applyCaptureResult,
    captureNotice,
    desirabilityFilter,
    listError,
    loadJobs,
    loadingJobs,
    recommendationFilter,
    search,
    setDesirabilityFilter,
    setRecommendationFilter,
    setSearch,
    setSortMode,
    sortMode,
    sortedJobs,
    smartSortDescription: `Smart Sort default: ${Math.round(
      SMART_SORT_FIT_WEIGHT * 100,
    )}% fit + ${Math.round(SMART_SORT_DESIRABILITY_WEIGHT * 100)}% desirability.`,
  };
}
