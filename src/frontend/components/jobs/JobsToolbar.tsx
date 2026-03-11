import React from "react";

import type { DesirabilityFilter, RecommendationFilter, SortMode } from "../../lib/useJobsBoard";

interface JobsToolbarProps {
  desirabilityFilter: DesirabilityFilter;
  onOpenAISettings: () => void;
  onOpenCapture: () => void;
  onOpenFactorSettings: () => void;
  onOpenOutcomeInsights: () => void;
  onOpenPipeline: () => void;
  recommendationFilter: RecommendationFilter;
  search: string;
  setDesirabilityFilter: (value: DesirabilityFilter) => void;
  setRecommendationFilter: (value: RecommendationFilter) => void;
  setSearch: (value: string) => void;
  setSortMode: (value: SortMode) => void;
  smartSortDescription: string;
  sortMode: SortMode;
}

export function JobsToolbar({
  desirabilityFilter,
  onOpenAISettings,
  onOpenCapture,
  onOpenFactorSettings,
  onOpenOutcomeInsights,
  onOpenPipeline,
  recommendationFilter,
  search,
  setDesirabilityFilter,
  setRecommendationFilter,
  setSearch,
  setSortMode,
  smartSortDescription,
  sortMode,
}: JobsToolbarProps) {
  return (
    <>
      <header
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Jobs</h1>
        <button onClick={onOpenCapture} type="button">
          Add Job
        </button>
        <button onClick={onOpenPipeline} type="button">
          Pipeline
        </button>
        <button onClick={onOpenOutcomeInsights} type="button">
          Outcome Insights
        </button>
        <button onClick={onOpenFactorSettings} type="button">
          Factor Settings
        </button>
        <button onClick={onOpenAISettings} type="button">
          AI Settings
        </button>
      </header>

      <p>Capture and review roles from your job search.</p>
      <p>{smartSortDescription}</p>

      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
        }}
      >
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Search jobs
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company or title"
            type="search"
            value={search}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Sort jobs
          <select
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            value={sortMode}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="company_az">Company A→Z</option>
            <option value="desirability_desc">Desirability ↓</option>
            <option value="smart_sort">Smart Sort</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Recommendation
          <select
            onChange={(event) =>
              setRecommendationFilter(event.target.value as RecommendationFilter)
            }
            value={recommendationFilter}
          >
            <option value="all">All</option>
            <option value="go">Go</option>
            <option value="maybe">Maybe</option>
            <option value="no-go">No-Go</option>
            <option value="not_analyzed">Not analyzed</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Desirability
          <select
            onChange={(event) => setDesirabilityFilter(event.target.value as DesirabilityFilter)}
            value={desirabilityFilter}
          >
            <option value="all">All</option>
            <option value="scored">Scored only</option>
            <option value="not_scored">Not scored</option>
          </select>
        </label>
      </div>
    </>
  );
}
