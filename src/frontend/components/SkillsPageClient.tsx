"use client";

import React, { useEffect, useState } from "react";

import {
  type JobDetail,
  type SkillDetail,
  type SkillListItem,
  getJob,
  getSkill,
  listSkills,
} from "../lib/api";
import { Modal } from "./Modal";

type SkillSortMode = "most_used" | "least_used" | "name_az";

export function SkillsPageClient() {
  const [skills, setSkills] = useState<SkillListItem[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SkillSortMode>("most_used");
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null);
  const [loadingSkillDetail, setLoadingSkillDetail] = useState(false);
  const [skillDetailError, setSkillDetailError] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loadingJobDetail, setLoadingJobDetail] = useState(false);
  const [jobDetailError, setJobDetailError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      setLoadingSkills(true);
      setSkillsError(null);
      try {
        const response = await listSkills();
        setSkills(response);
      } catch (error) {
        if (error instanceof Error) {
          setSkillsError(error.message);
        } else {
          setSkillsError("Failed to load skills.");
        }
      } finally {
        setLoadingSkills(false);
      }
    };

    loadSkills();
  }, []);

  useEffect(() => {
    if (!selectedSkillId) {
      return;
    }

    const loadSkillDetail = async () => {
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

    loadSkillDetail();
  }, [selectedSkillId]);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const loadJobDetail = async () => {
      setLoadingJobDetail(true);
      setSelectedJob(null);
      setJobDetailError(null);
      try {
        const response = await getJob(selectedRoleId);
        setSelectedJob(response);
      } catch (error) {
        if (error instanceof Error) {
          setJobDetailError(error.message);
        } else {
          setJobDetailError("Failed to load job detail.");
        }
      } finally {
        setLoadingJobDetail(false);
      }
    };

    loadJobDetail();
  }, [selectedRoleId]);

  const filteredSkills = skills.filter((skill) => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return skill.name.toLowerCase().includes(query);
  });

  const sortedSkills = [...filteredSkills].sort((left, right) => {
    if (sortMode === "name_az") {
      return left.name.localeCompare(right.name);
    }
    if (sortMode === "least_used") {
      return left.usage_count - right.usage_count;
    }
    return right.usage_count - left.usage_count;
  });

  return (
    <section>
      <header className="toolbar-header">
        <h1>Skills</h1>
      </header>

      <p>Browse captured skills and see how often they appear across roles.</p>

      <div className="form-grid-2-1">
        <label className="form-label">
          Search skills
          <input
            className="form-input"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by skill name"
            type="search"
            value={search}
          />
        </label>

        <label className="form-label">
          Sort skills
          <select
            className="form-select"
            onChange={(event) => setSortMode(event.target.value as SkillSortMode)}
            value={sortMode}
          >
            <option value="most_used">Most Used</option>
            <option value="least_used">Least Used</option>
            <option value="name_az">Name A→Z</option>
          </select>
        </label>
      </div>

      {loadingSkills ? <p>Loading skills...</p> : null}
      {skillsError ? <p role="alert">{skillsError}</p> : null}

      {!loadingSkills && !skillsError ? (
        <ul className="list-unstyled">
          {sortedSkills.map((skill) => (
            <li key={skill.id}>
              <button
                className="list-item-btn"
                onClick={() => setSelectedSkillId(skill.id)}
                type="button"
              >
                <strong>{skill.name}</strong>
                <br />
                <small>
                  {skill.usage_count} jobs referenced
                  {skill.category ? ` • ${skill.category}` : ""}
                </small>
              </button>
            </li>
          ))}
        </ul>
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
                      className="link-btn"
                      onClick={() => {
                        setSelectedSkillId(null);
                        setSelectedRoleId(job.id);
                      }}
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

      {selectedRoleId ? (
        <Modal
          onClose={() => {
            setSelectedRoleId(null);
            setSelectedJob(null);
            setJobDetailError(null);
          }}
          title="Job Detail"
        >
          {loadingJobDetail ? <p>Loading job details...</p> : null}
          {jobDetailError ? <p role="alert">{jobDetailError}</p> : null}

          {selectedJob ? (
            <article>
              <h3>{selectedJob.title}</h3>
              <p>
                <strong>{selectedJob.company.name}</strong>
              </p>
              <p>Status: {selectedJob.status}</p>

              <h4>Required skills</h4>
              <ul>
                {selectedJob.skills.required.map((skill) => (
                  <li key={`required-${skill.id}`}>
                    <button
                      className="link-btn"
                      onClick={() => {
                        setSelectedRoleId(null);
                        setSelectedSkillId(skill.id);
                      }}
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
                      className="link-btn"
                      onClick={() => {
                        setSelectedRoleId(null);
                        setSelectedSkillId(skill.id);
                      }}
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
    </section>
  );
}
