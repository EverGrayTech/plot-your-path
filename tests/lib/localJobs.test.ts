import {
  analyzeLocalJobFit,
  generateLocalInterviewPrepPack,
  generateLocalResumeTuning,
} from "../../src/lib/localAi";
import {
  captureLocalJob,
  getLocalJob,
  getLocalSkill,
  listLocalJobs,
  listLocalSkills,
  updateLocalJobStatus,
} from "../../src/lib/localJobs";

import { indexedDB } from "fake-indexeddb";

describe("localJobs migration foundation", () => {
  beforeAll(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });
  });

  it("captures a job locally and lists it", async () => {
    const captured = await captureLocalJob({
      url: "pasted-job-description",
      fallback_text: "Platform Engineer\nTypeScript\nReact\nTesting",
    });

    const jobs = await listLocalJobs();
    expect(captured.status).toBe("success");
    expect(jobs.some((job) => job.id === captured.role_id)).toBe(true);
  });

  it("returns job and skill detail from local records", async () => {
    const captured = await captureLocalJob({
      url: "pasted-job-description",
      fallback_text: "Frontend Engineer\nReact\nAccessibility",
    });

    const job = await getLocalJob(captured.role_id);
    const skills = await listLocalSkills();
    const skill = await getLocalSkill(skills[0].id);

    expect(job.title).toMatch(/Frontend Engineer/i);
    expect(skill.usage_count).toBeGreaterThan(0);
  });

  it("updates local job status", async () => {
    const captured = await captureLocalJob({
      url: "pasted-job-description",
      fallback_text: "Developer Advocate\nDocumentation",
    });

    const updated = await updateLocalJobStatus(captured.role_id, "submitted");
    expect(updated.status).toBe("submitted");
  });

  it("hydrates generated browser-local detail surfaces from dedicated stores", async () => {
    const captured = await captureLocalJob({
      url: "pasted-job-description",
      fallback_text: "Staff Engineer\nTypeScript\nSystems design",
    });

    await analyzeLocalJobFit(captured.role_id);
    await generateLocalInterviewPrepPack(captured.role_id);
    await generateLocalResumeTuning(captured.role_id);

    const job = await getLocalJob(captured.role_id);
    expect(job.latest_fit_analysis).not.toBeNull();
    expect(job.interview_stage_timeline).toEqual([]);
    expect(job.application_ops).toBeNull();
  });
});
