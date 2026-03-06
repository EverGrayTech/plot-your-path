"use client";

import React, { useEffect, useState } from "react";

import { Modal } from "./Modal";
import { listSkills, type SkillListItem } from "../lib/api";

type SkillSortMode = "most_used" | "least_used" | "name_az";

export function SkillsPageClient() {
  const [skills, setSkills] = useState<SkillListItem[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SkillSortMode>("most_used");
  const [selectedSkill, setSelectedSkill] = useState<SkillListItem | null>(null);

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
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>Skills</h1>
      </header>

      <p>Browse captured skills and see how often they appear across roles.</p>

      <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "2fr 1fr" }}>
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Search skills
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by skill name"
            type="search"
            value={search}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Sort skills
          <select
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
        <ul style={{ listStyle: "none", margin: "1rem 0 0", padding: 0 }}>
          {sortedSkills.map((skill) => (
            <li key={skill.id} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => setSelectedSkill(skill)}
                style={{ textAlign: "left", width: "100%" }}
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

      {selectedSkill ? (
        <Modal onClose={() => setSelectedSkill(null)} title="Skill Detail">
          <article>
            <h3>{selectedSkill.name}</h3>
            <p>Category: {selectedSkill.category ?? "Uncategorized"}</p>
            <p>Used in {selectedSkill.usage_count} captured jobs.</p>
            <p>Referenced jobs list will be connected in Iteration 09.</p>
          </article>
        </Modal>
      ) : null}
    </section>
  );
}
