import * as api from "../../../src/frontend/lib/api";
import {
  clearAISettingToken,
  createOutcomeEvent,
  createDesirabilityFactor,
  deleteDesirabilityFactor,
  generateCoverLetter,
  generateQuestionAnswers,
  getOutcomeInsights,
  getOutcomeTuningSuggestions,
  getSkill,
  healthcheckAISetting,
  listAISettings,
  listApplicationMaterials,
  listDesirabilityFactors,
  listOutcomeEvents,
  listSkills,
  reorderDesirabilityFactors,
  scrapeJob,
  updateAISetting,
  updateAISettingToken,
  updateDesirabilityFactor,
  updateJobStatus,
} from "../../../src/frontend/lib/api";
import { indexedDB } from "fake-indexeddb";

beforeEach(() => {
  Object.defineProperty(window, "indexedDB", {
    configurable: true,
    value: indexedDB,
  });
  localStorage.clear();
});

describe("listSkills", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns local skills payload", async () => {
    const result = await listSkills();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("getSkill", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when local skill does not exist", async () => {
    await expect(getSkill(1)).rejects.toThrow(/Skill not found/i);
  });
});

describe("updateJobStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when updating a missing local job", async () => {
    await expect(updateJobStatus(2, "submitted")).rejects.toThrow(/Job not found/i);
  });
});

describe("application materials endpoints", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists local materials and generates browser-local artifacts", async () => {
    expect(await listApplicationMaterials(2)).toEqual([]);
    const created = await generateCoverLetter(2);
    expect(created.artifact_type).toBe("cover_letter");
  });

  it("question generation creates browser-local artifacts", async () => {
    const created = await generateQuestionAnswers(2, ["Why this role?"]);
    expect(created.artifact_type).toBe("application_qa");
  });
});

describe("ai settings endpoints", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists, updates, and validates local AI settings", async () => {
    const listed = await listAISettings();
    expect(listed.length).toBeGreaterThanOrEqual(1);

    const updated = await updateAISetting("job_parsing", { model: "gpt-4o-mini" });
    expect(updated.model).toBe("gpt-4o-mini");

    const tokenUpdated = await updateAISettingToken("job_parsing", "sk-test-1234567890");
    expect(tokenUpdated.token_masked).toContain("7890");

    await clearAISettingToken("job_parsing");

    const health = await healthcheckAISetting("job_parsing");
    expect(health.ok).toBe(false);
  });
});

describe("outcome feedback endpoints", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists local outcomes", async () => {
    const listed = await listOutcomeEvents(2);
    expect(listed).toEqual([]);
  });
});

describe("retired transport-era abstractions", () => {
  it("keeps factor listing local but blocks transport-era factor mutation helpers", async () => {
    expect(Array.isArray(await listDesirabilityFactors())).toBe(true);
    await expect(
      createDesirabilityFactor({
        display_order: 0,
        is_active: true,
        name: "Test",
        prompt: "Prompt",
        weight: 0.2,
      }),
    ).rejects.toThrow(/not available in the browser-local MVP path/i);
    await expect(deleteDesirabilityFactor(1)).rejects.toThrow(/not available/i);
    await expect(reorderDesirabilityFactors([1, 2])).rejects.toThrow(/not available/i);
    await expect(updateDesirabilityFactor(1, { weight: 0.3 })).rejects.toThrow(/not available/i);
  });

  it("scrapes jobs through the local browser workflow", async () => {
    const result = await scrapeJob({
      url: "pasted-job-description",
      fallback_text: "Backend Engineer\nTypeScript, React, Testing",
    });

    expect(result.status).toBe("success");
    expect(result.title).toContain("Backend Engineer");
  });
});
