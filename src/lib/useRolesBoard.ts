"use client";

import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import type { FitRecommendation, RoleCaptureResponse, RoleListItem } from "./dataModels";
import { getFrontendServices } from "./services";

type ListRolesFn = () => Promise<RoleListItem[]>;

let rolesLoader: ListRolesFn = () => getFrontendServices().roles.listRoles();

export function setRolesLoaderForTests(loader: ListRolesFn | null) {
  rolesLoader = loader ?? (() => getFrontendServices().roles.listRoles());
}

export type SortMode = "newest" | "oldest" | "company_az" | "desirability_desc" | "smart_sort";
export type RecommendationFilter = "all" | FitRecommendation | "not_analyzed";
export type DesirabilityFilter = "all" | "scored" | "not_scored";

const SMART_SORT_FIT_WEIGHT = 0.6;
const SMART_SORT_DESIRABILITY_WEIGHT = 0.4;

async function fetchRolesList(
  setLoadingRoles: Dispatch<SetStateAction<boolean>>,
  setListError: Dispatch<SetStateAction<string | null>>,
  setRoles: Dispatch<SetStateAction<RoleListItem[]>>,
) {
  setLoadingRoles(true);
  setListError(null);
  try {
    const response = await rolesLoader();
    setRoles(response);
  } catch (error) {
    if (error instanceof Error) {
      setListError(error.message);
    } else {
      setListError("Failed to load roles.");
    }
  } finally {
    setLoadingRoles(false);
  }
}

export function useRolesBoard() {
  const [roles, setRoles] = useState<RoleListItem[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>("all");
  const [desirabilityFilter, setDesirabilityFilter] = useState<DesirabilityFilter>("all");

  const loadRoles = async () => {
    await fetchRolesList(setLoadingRoles, setListError, setRoles);
  };

  useEffect(() => {
    void fetchRolesList(setLoadingRoles, setListError, setRoles);
  }, []);

  function resetFilters() {
    setSearch("");
    setSortMode("newest");
    setRecommendationFilter("all");
    setDesirabilityFilter("all");
  }

  function applyCaptureResult(result: RoleCaptureResponse) {
    setCaptureNotice(
      `Captured ${result.title} at ${result.company}. Filters were reset so it is visible.`,
    );
    resetFilters();
  }

  const filteredRoles = roles.filter((role) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      role.company.toLowerCase().includes(query) ||
      role.title.toLowerCase().includes(query);

    if (!matchesSearch) {
      return false;
    }

    if (recommendationFilter === "all") {
      if (desirabilityFilter === "all") {
        return true;
      }
      if (desirabilityFilter === "scored") {
        return role.desirability_score !== null;
      }
      return role.desirability_score === null;
    }

    if (recommendationFilter === "not_analyzed") {
      if (role.fit_recommendation !== null) {
        return false;
      }
      if (desirabilityFilter === "all") {
        return true;
      }
      if (desirabilityFilter === "scored") {
        return role.desirability_score !== null;
      }
      return role.desirability_score === null;
    }

    if (role.fit_recommendation !== recommendationFilter) {
      return false;
    }
    if (desirabilityFilter === "all") {
      return true;
    }
    if (desirabilityFilter === "scored") {
      return role.desirability_score !== null;
    }
    return role.desirability_score === null;
  });

  const sortedRoles = [...filteredRoles].sort((left, right) => {
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
    loadRoles,
    loadingRoles,
    recommendationFilter,
    search,
    setDesirabilityFilter,
    setRecommendationFilter,
    setSearch,
    setSortMode,
    sortMode,
    sortedRoles,
    smartSortDescription: `Smart Sort default: ${Math.round(
      SMART_SORT_FIT_WEIGHT * 100,
    )}% fit + ${Math.round(SMART_SORT_DESIRABILITY_WEIGHT * 100)}% desirability.`,
  };
}
