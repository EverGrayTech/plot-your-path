"use client";

import React, { useEffect, useState } from "react";

import {
  type ApplicationMaterial,
  type FitRecommendation,
  type JobDetail,
  type JobListItem,
  type RoleStatus,
  type SkillDetail,
  analyzeJobFit,
  generateCoverLetter,
  generateQuestionAnswers,
  getJob,
  getSkill,
  listApplicationMaterials,
  listJobs,
  updateJobStatus,
} from "../lib/api";
import { CaptureJobForm } from "./CaptureJobForm";
import { Modal } from "./Modal";

type SortMode = "newest" | "oldest" | "company_az";
type RecommendationFilter = "all" | "go" | "maybe" | "no-go" | "not_analyzed";

function recommendationLabel(value: FitRecommendation | null): string {
  if (value === "go") {
    return "Go";
  }
  if (value === "maybe") {
    return "Maybe";
  }
  if (value === "no-go") {
    return "No-Go";
  }
  return "Not analyzed";
}

export function JobsPageClient() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>("all");
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [analyzingFit, setAnalyzingFit] = useState(false);
  const [fitError, setFitError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null);
  const [loadingSkillDetail, setLoadingSkillDetail] = useState(false);
  const [skillDetailError, setSkillDetailError] = useState<string | null>(null);
  const [applicationMaterials, setApplicationMaterials] = useState<ApplicationMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatingQA, setGeneratingQA] = useState(false);
  const [qaQuestionsInput, setQaQuestionsInput] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  async function loadJobs() {
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial mount load only
  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const fetchJobDetail = async () => {
      setLoadingDetail(true);
      setSelectedJob(null);
      setDetailError(null);
      try {
        const response = await getJob(selectedRoleId);
        setSelectedJob(response);
      } catch (error) {
        if (error instanceof Error) {
          setDetailError(error.message);
        } else {
          setDetailError("Failed to load job detail.");
        }
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchJobDetail();
  }, [selectedRoleId]);

  async function handleStatusChange(nextStatus: RoleStatus) {
    if (!selectedJob) {
      return;
    }

    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await updateJobStatus(selectedJob.id, nextStatus);
      await loadJobs();
      const refreshed = await getJob(selectedJob.id);
      setSelectedJob(refreshed);
    } catch (error) {
      if (error instanceof Error) {
        setStatusError(error.message);
      } else {
        setStatusError("Failed to update status.");
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAnalyzeFit() {
    if (!selectedJob) {
      return;
    }

    setAnalyzingFit(true);
    setFitError(null);
    try {
      const response = await analyzeJobFit(selectedJob.id);
      setSelectedJob((previous) => {
        if (!previous) {
          return previous;
        }
        return {
          ...previous,
          latest_fit_analysis: response,
        };
      });
      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setFitError(error.message);
      } else {
        setFitError("Failed to analyze fit.");
      }
    } finally {
      setAnalyzingFit(false);
    }
  }

  useEffect(() => {
    if (!selectedSkillId) {
      return;
    }

    const fetchSkillDetail = async () => {
      setLoadingSkillDetail(true);
      setSelectedSkill(null);
      setSkillDetailError(null);
      try {
        const response = await getSkill(selectedSkillId);
        setSelectedSkill(response);
      } catch (error) {
        if (error instanceof Error) {
          setSkillDetailError(error.message);
        } else {
          setSkillDetailError("Failed to load skill detail.");
        }
      } finally {
        setLoadingSkillDetail(false);
      }
    };

    fetchSkillDetail();
  }, [selectedSkillId]);

  useEffect(() => {
    if (!selectedRoleId) {
      setApplicationMaterials([]);
      setSelectedMaterialId(null);
      setMaterialsError(null);
      return;
    }

    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      setMaterialsError(null);
      try {
        const response = await listApplicationMaterials(selectedRoleId);
        setApplicationMaterials(response);
        setSelectedMaterialId((previous) => {
          if (previous && response.some((item) => item.id === previous)) {
            return previous;
          }
          return response[0]?.id ?? null;
        });
      } catch (error) {
        if (error instanceof Error) {
          setMaterialsError(error.message);
        } else {
          setMaterialsError("Failed to load application materials.");
        }
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [selectedRoleId]);

  async function handleGenerateCoverLetter() {
    if (!selectedJob) {
      return;
    }
    setGeneratingCoverLetter(true);
    setMaterialsError(null);
    try {
      const created = await generateCoverLetter(selectedJob.id);
      const refreshed = await listApplicationMaterials(selectedJob.id);
      setApplicationMaterials(refreshed);
      setSelectedMaterialId(created.id);
    } catch (error) {
      if (error instanceof Error) {
        setMaterialsError(error.message);
      } else {
        setMaterialsError("Failed to generate cover letter.");
      }
    } finally {
      setGeneratingCoverLetter(false);
    }
  }

  async function handleGenerateQA() {
    if (!selectedJob) {
      return;
    }

    const questions = qaQuestionsInput
      .split("\n")
      .map((question) => question.trim())
      .filter(Boolean);

    if (questions.length === 0) {
      setMaterialsError("Add at least one application question before generating Q&A drafts.");
      return;
    }

    setGeneratingQA(true);
    setMaterialsError(null);
    try {
      const created = await generateQuestionAnswers(selectedJob.id, questions);
      const refreshed = await listApplicationMaterials(selectedJob.id);
      setApplicationMaterials(refreshed);
      setSelectedMaterialId(created.id);
    } catch (error) {
      if (error instanceof Error) {
        setMaterialsError(error.message);
      } else {
        setMaterialsError("Failed to generate application Q&A.");
      }
    } finally {
      setGeneratingQA(false);
    }
  }

  const selectedMaterial =
    applicationMaterials.find((item) => item.id === selectedMaterialId) ?? null;

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
      return true;
    }
    if (recommendationFilter === "not_analyzed") {
      return job.fit_recommendation === null;
    }
    return job.fit_recommendation === recommendationFilter;
  });

  const sortedJobs = [...filteredJobs].sort((left, right) => {
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

  return (
    <section>
      <header
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Jobs</h1>
        <button onClick={() => setShowCaptureModal(true)} type="button">
          Add Job
        </button>
      </header>

      <p>Capture and review roles from your job search.</p>

      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "2fr 1fr 1fr",
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
      </div>

      {captureNotice ? <output aria-live="polite">{captureNotice}</output> : null}

      {loadingJobs ? <p>Loading jobs...</p> : null}
      {listError ? <p role="alert">{listError}</p> : null}

      {!loadingJobs && !listError ? (
        <ul style={{ listStyle: "none", margin: "1rem 0 0", padding: 0 }}>
          {sortedJobs.map((job) => (
            <li key={job.id} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => setSelectedRoleId(job.id)}
                style={{ textAlign: "left", width: "100%" }}
                type="button"
              >
                <strong>{job.title}</strong> — {job.company}
                <br />
                <small>
                  {job.salary_range ?? "No salary"} • {job.status} • {job.skills_count} skills •{" "}
                  {recommendationLabel(job.fit_recommendation)}
                  {job.fit_score !== null ? ` (${job.fit_score}%)` : ""}
                </small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showCaptureModal ? (
        <Modal onClose={() => setShowCaptureModal(false)} title="Capture Job">
          <CaptureJobForm
            onCaptured={(result) => {
              setCaptureNotice(
                `Captured ${result.title} at ${result.company}. Filters were reset so it is visible.`,
              );
              setSearch("");
              setSortMode("newest");
              setRecommendationFilter("all");
              setSelectedRoleId(result.role_id);
              setShowCaptureModal(false);
              loadJobs();
            }}
          />
        </Modal>
      ) : null}

      {selectedRoleId ? (
        <Modal
          onClose={() => {
            setSelectedRoleId(null);
            setSelectedJob(null);
            setDetailError(null);
            setFitError(null);
          }}
          title="Job Detail"
        >
          {loadingDetail ? <p>Loading job details...</p> : null}
          {detailError ? <p role="alert">{detailError}</p> : null}

          {selectedJob ? (
            <article>
              <h3>{selectedJob.title}</h3>
              <p>
                <strong>{selectedJob.company.name}</strong>
              </p>
              <p>Status: {selectedJob.status}</p>
              <label style={{ display: "grid", gap: "0.25rem", marginBottom: "0.75rem" }}>
                Update status
                <select
                  disabled={updatingStatus}
                  onChange={(event) => handleStatusChange(event.target.value as RoleStatus)}
                  value={selectedJob.status}
                >
                  <option value="open">Open</option>
                  <option value="submitted">Submitted</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              {statusError ? <p role="alert">{statusError}</p> : null}
              {fitError ? <p role="alert">{fitError}</p> : null}
              <p>
                Salary: {selectedJob.salary.min ?? "?"} - {selectedJob.salary.max ?? "?"}{" "}
                {selectedJob.salary.currency}
              </p>

              <section>
                <h4>Fit analysis</h4>
                <button disabled={analyzingFit} onClick={handleAnalyzeFit} type="button">
                  {analyzingFit ? "Analyzing..." : "Analyze Fit"}
                </button>
                {selectedJob.latest_fit_analysis ? (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p>
                      <strong>Recommendation:</strong>{" "}
                      {recommendationLabel(selectedJob.latest_fit_analysis.recommendation)}
                    </p>
                    <p>
                      <strong>Fit score:</strong> {selectedJob.latest_fit_analysis.fit_score}%
                    </p>
                    <p>
                      <strong>Strengths:</strong>{" "}
                      {selectedJob.latest_fit_analysis.covered_required_skills.concat(
                        selectedJob.latest_fit_analysis.covered_preferred_skills,
                      ).length
                        ? selectedJob.latest_fit_analysis.covered_required_skills
                            .concat(selectedJob.latest_fit_analysis.covered_preferred_skills)
                            .join(", ")
                        : "None identified"}
                    </p>
                    <p>
                      <strong>Gaps:</strong>{" "}
                      {selectedJob.latest_fit_analysis.missing_required_skills.concat(
                        selectedJob.latest_fit_analysis.missing_preferred_skills,
                      ).length
                        ? selectedJob.latest_fit_analysis.missing_required_skills
                            .concat(selectedJob.latest_fit_analysis.missing_preferred_skills)
                            .join(", ")
                        : "No explicit gaps"}
                    </p>
                    <p>
                      <strong>Rationale:</strong> {selectedJob.latest_fit_analysis.rationale}
                    </p>
                    <p>
                      <small>
                        Generated{" "}
                        {new Date(selectedJob.latest_fit_analysis.created_at).toLocaleString()} with{" "}
                        {selectedJob.latest_fit_analysis.provider}/
                        {selectedJob.latest_fit_analysis.model}
                      </small>
                    </p>
                  </div>
                ) : (
                  <p>No fit analysis generated yet.</p>
                )}
              </section>

              <section>
                <h4>Application Materials</h4>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <button
                    disabled={generatingCoverLetter}
                    onClick={handleGenerateCoverLetter}
                    type="button"
                  >
                    {generatingCoverLetter ? "Generating cover letter..." : "Generate Cover Letter"}
                  </button>

                  <label
                    htmlFor="application-questions"
                    style={{ display: "grid", gap: "0.25rem" }}
                  >
                    Application questions (one per line)
                  </label>
                  <textarea
                    id="application-questions"
                    onChange={(event) => setQaQuestionsInput(event.target.value)}
                    placeholder="Why are you interested in this role?"
                    rows={4}
                    value={qaQuestionsInput}
                  />
                  <button disabled={generatingQA} onClick={handleGenerateQA} type="button">
                    {generatingQA ? "Generating Q&A..." : "Generate Q&A Drafts"}
                  </button>
                </div>

                {loadingMaterials ? <p>Loading application materials...</p> : null}
                {materialsError ? <p role="alert">{materialsError}</p> : null}

                {applicationMaterials.length ? (
                  <>
                    <label htmlFor="material-version" style={{ display: "grid", gap: "0.25rem" }}>
                      Saved drafts
                    </label>
                    <select
                      id="material-version"
                      onChange={(event) => setSelectedMaterialId(Number(event.target.value))}
                      value={selectedMaterialId ?? ""}
                    >
                      {applicationMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.artifact_type === "cover_letter"
                            ? "Cover letter"
                            : "Application Q&A"}{" "}
                          v{material.version} ({new Date(material.created_at).toLocaleString()})
                        </option>
                      ))}
                    </select>

                    {selectedMaterial ? (
                      <article
                        style={{
                          border: "1px solid #ddd",
                          marginTop: "0.5rem",
                          padding: "0.75rem",
                        }}
                      >
                        <p>
                          <strong>Type:</strong>{" "}
                          {selectedMaterial.artifact_type === "cover_letter"
                            ? "Cover letter"
                            : "Application Q&A"}
                        </p>
                        <p>
                          <strong>Version:</strong> {selectedMaterial.version}
                        </p>
                        <p>
                          <strong>Generated with:</strong> {selectedMaterial.provider}/
                          {selectedMaterial.model}
                        </p>
                        <pre
                          style={{
                            background: "#fafafa",
                            borderRadius: 4,
                            overflowX: "auto",
                            padding: "0.75rem",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {selectedMaterial.content}
                        </pre>
                      </article>
                    ) : null}
                  </>
                ) : (
                  <p>No application materials generated yet.</p>
                )}
              </section>

              <h4>Status history</h4>
              {selectedJob.status_history.length ? (
                <ul>
                  {selectedJob.status_history.map((entry, index) => (
                    <li key={`${entry.changed_at}-${entry.to_status}-${index}`}>
                      {entry.from_status ?? "none"} → {entry.to_status} (
                      {new Date(entry.changed_at).toLocaleString()})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No status changes yet.</p>
              )}
              <p>
                <a href={selectedJob.url} rel="noreferrer" target="_blank">
                  View original posting
                </a>
              </p>

              <h4>Required skills</h4>
              <ul>
                {selectedJob.skills.required.map((skill) => (
                  <li key={`required-${skill.id}`}>
                    <button
                      onClick={() => {
                        setSelectedRoleId(null);
                        setSelectedSkillId(skill.id);
                      }}
                      style={{ textAlign: "left" }}
                      type="button"
                    >
                      {skill.name}
                    </button>
                  </li>
                ))}
              </ul>

              <h4>Preferred skills</h4>
              <ul>
                {selectedJob.skills.preferred.map((skill) => (
                  <li key={`preferred-${skill.id}`}>
                    <button
                      onClick={() => {
                        setSelectedRoleId(null);
                        setSelectedSkillId(skill.id);
                      }}
                      style={{ textAlign: "left" }}
                      type="button"
                    >
                      {skill.name}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </Modal>
      ) : null}

      {selectedSkillId ? (
        <Modal
          onClose={() => {
            setSelectedSkillId(null);
            setSelectedSkill(null);
            setSkillDetailError(null);
          }}
          title="Skill Detail"
        >
          {loadingSkillDetail ? <p>Loading skill details...</p> : null}
          {skillDetailError ? <p role="alert">{skillDetailError}</p> : null}

          {selectedSkill ? (
            <article>
              <h3>{selectedSkill.name}</h3>
              <p>Category: {selectedSkill.category ?? "Uncategorized"}</p>
              <p>Used in {selectedSkill.usage_count} captured jobs.</p>

              <h4>Referenced jobs</h4>
              <ul>
                {selectedSkill.jobs.map((job) => (
                  <li key={job.id}>
                    <button
                      onClick={() => {
                        setSelectedSkillId(null);
                        setSelectedRoleId(job.id);
                      }}
                      style={{ textAlign: "left" }}
                      type="button"
                    >
                      {job.title} — {job.company}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </Modal>
      ) : null}
    </section>
  );
}
