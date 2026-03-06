"use client";

import React, { useEffect, useState } from "react";

import { CaptureJobForm } from "./CaptureJobForm";
import { Modal } from "./Modal";
import { getJob, type JobDetail, type JobListItem, listJobs } from "../lib/api";

type SortMode = "newest" | "oldest" | "company_az";

export function JobsPageClient() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

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

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return (
      job.company.toLowerCase().includes(query) ||
      job.title.toLowerCase().includes(query)
    );
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

      <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "2fr 1fr" }}>
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
      </div>

      {captureNotice ? <p role="status">{captureNotice}</p> : null}

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
                  {job.salary_range ?? "No salary"} • {job.status} • {job.skills_count} skills
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
              <p>
                Salary: {selectedJob.salary.min ?? "?"} - {selectedJob.salary.max ?? "?"}{" "}
                {selectedJob.salary.currency}
              </p>
              <p>
                <a href={selectedJob.url} rel="noreferrer" target="_blank">
                  View original posting
                </a>
              </p>

              <h4>Required skills</h4>
              <ul>
                {selectedJob.skills.required.map((skill) => (
                  <li key={`required-${skill}`}>{skill}</li>
                ))}
              </ul>

              <h4>Preferred skills</h4>
              <ul>
                {selectedJob.skills.preferred.map((skill) => (
                  <li key={`preferred-${skill}`}>{skill}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </Modal>
      ) : null}
    </section>
  );
}
