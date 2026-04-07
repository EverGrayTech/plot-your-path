import React from "react";

import type { DesirabilityFilter, RecommendationFilter, SortMode } from "../../lib/useRolesBoard";

interface RolesToolbarProps {
  desirabilityFilter: DesirabilityFilter;
  onOpenCapture: () => void;
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

export function RolesToolbar({
  desirabilityFilter,
  onOpenCapture,
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
}: RolesToolbarProps) {
  return (
    <>
      <header className="page-header">
        <h1>Roles</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={onOpenCapture} type="button">
            Add Role
          </button>
          <button className="btn btn-secondary" onClick={onOpenPipeline} type="button">
            Pipeline
          </button>
          <button className="btn btn-secondary" onClick={onOpenOutcomeInsights} type="button">
            Outcome Insights
          </button>
        </div>
      </header>

      <p className="page-description">Capture and review roles from your role search.</p>
      <p className="page-description">{smartSortDescription}</p>
      <p className="page-description">
        AI configuration now lives on the Settings page through the shared EverGray configuration
        panel.
      </p>
      <p className="page-description">
        Desirability factor management now lives under Settings → Desirability Factors.
      </p>

      <div className="form-grid-4col">
        <label className="form-label">
          Search roles
          <input
            className="form-input"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company or title"
            type="search"
            value={search}
          />
        </label>

        <label className="form-label">
          Sort roles
          <select
            className="form-select"
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

        <label className="form-label">
          Recommendation
          <select
            className="form-select"
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

        <label className="form-label">
          Desirability
          <select
            className="form-select"
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
