"use client";

import React, { useEffect, useState } from "react";

import type { RoleDetail, SkillDetail, SkillListItem } from "../lib/dataModels";
import { getFrontendServices } from "../lib/services";
import { Modal } from "./Modal";

type SkillSortMode = "most_used" | "least_used" | "name_az";

export function SkillsPageClient() {
  const services = getFrontendServices();
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
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null);
  const [loadingRoleDetail, setLoadingRoleDetail] = useState(false);
  const [roleDetailError, setRoleDetailError] = useState<string | null>(null);

  useEffect(() => {
    const loadSkills = async () => {
      setLoadingSkills(true);
      setSkillsError(null);
      try {
        const response = await services.skills.listSkills();
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
  }, [services]);

  useEffect(() => {
    if (!selectedSkillId) {
      return;
    }

    const loadSkillDetail = async () => {
      setLoadingSkillDetail(true);
      setSelectedSkill(null);
      setSkillDetailError(null);
      try {
        const response = await services.skills.getSkill(selectedSkillId);
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
  }, [selectedSkillId, services]);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const loadRoleDetail = async () => {
      setLoadingRoleDetail(true);
      setSelectedRole(null);
      setRoleDetailError(null);
      try {
        const response = await services.roles.getRole(selectedRoleId);
        setSelectedRole(response);
      } catch (error) {
        if (error instanceof Error) {
          setRoleDetailError(error.message);
        } else {
          setRoleDetailError("Failed to load role detail.");
        }
      } finally {
        setLoadingRoleDetail(false);
      }
    };

    loadRoleDetail();
  }, [selectedRoleId, services]);

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
      <header className="page-header">
        <h1>Skills</h1>
      </header>

      <p className="page-description">
        Browse captured skills and see how often they appear across roles.
      </p>

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

      {loadingSkills ? (
        <div className="spinner-center" aria-label="Loading skills">
          <span className="spinner" />
        </div>
      ) : null}
      {skillsError ? (
        <div className="alert alert-error" role="alert">
          {skillsError}
        </div>
      ) : null}

      {!loadingSkills && !skillsError && sortedSkills.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">No skills captured yet</p>
          <p className="empty-state-description">
            Skills are extracted automatically when roles are captured.
          </p>
        </div>
      ) : null}

      {!loadingSkills && !skillsError && sortedSkills.length > 0 ? (
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
                  {skill.usage_count} roles referenced
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
              <p>Used in {selectedSkill.usage_count} captured roles.</p>

              <h4>Referenced roles</h4>
              <ul>
                {selectedSkill.roles.map((role) => (
                  <li key={role.id}>
                    <button
                      className="link-btn"
                      onClick={() => {
                        setSelectedSkillId(null);
                        setSelectedRoleId(role.id);
                      }}
                      type="button"
                    >
                      {role.title} — {role.company}
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
            setSelectedRole(null);
            setRoleDetailError(null);
          }}
          title="Role Detail"
        >
          {loadingRoleDetail ? <p>Loading role details...</p> : null}
          {roleDetailError ? <p role="alert">{roleDetailError}</p> : null}

          {selectedRole ? (
            <article>
              <h3>{selectedRole.title}</h3>
              <p>
                <strong>{selectedRole.company.name}</strong>
              </p>
              <p>Status: {selectedRole.status}</p>

              <h4>Required skills</h4>
              <ul>
                {selectedRole.skills.required.map((skill) => (
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
                {selectedRole.skills.preferred.map((skill) => (
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
