import {
  analyzeLocalRoleFit,
  generateLocalInterviewPrepPack,
  generateLocalResumeTuning,
} from "../../src/lib/localAi";
import {
  captureLocalRole,
  getLocalRole,
  getLocalSkill,
  listLocalRoles,
  listLocalSkills,
  updateLocalRoleStatus,
} from "../../src/lib/localRoles";

import { indexedDB } from "fake-indexeddb";

describe("localRoles migration foundation", () => {
  beforeAll(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });
  });

  it("captures a role locally and lists it", async () => {
    const captured = await captureLocalRole({
      url: "pasted-role-description",
      fallback_text: "Platform Engineer\nTypeScript\nReact\nTesting",
    });

    const roles = await listLocalRoles();
    expect(captured.status).toBe("success");
    expect(roles.some((role) => role.id === captured.role_id)).toBe(true);
  });

  it("returns role and skill detail from local records", async () => {
    const captured = await captureLocalRole({
      url: "pasted-role-description",
      fallback_text: "Frontend Engineer\nReact\nAccessibility",
    });

    const role = await getLocalRole(captured.role_id);
    const skills = await listLocalSkills();
    const skill = await getLocalSkill(skills[0].id);

    expect(role.title).toMatch(/Frontend Engineer/i);
    expect(skill.usage_count).toBeGreaterThan(0);
  });

  it("updates local role status", async () => {
    const captured = await captureLocalRole({
      url: "pasted-role-description",
      fallback_text: "Developer Advocate\nDocumentation",
    });

    const updated = await updateLocalRoleStatus(captured.role_id, "submitted");
    expect(updated.status).toBe("submitted");
  });

  it("hydrates generated browser-local detail surfaces from dedicated stores", async () => {
    const captured = await captureLocalRole({
      url: "pasted-role-description",
      fallback_text: "Staff Engineer\nTypeScript\nSystems design",
    });

    await analyzeLocalRoleFit(captured.role_id);
    await generateLocalInterviewPrepPack(captured.role_id);
    await generateLocalResumeTuning(captured.role_id);

    const role = await getLocalRole(captured.role_id);
    expect(role.latest_fit_analysis).not.toBeNull();
    expect(role.interview_stage_timeline).toEqual([]);
    expect(role.application_ops).toBeNull();
  });
});
