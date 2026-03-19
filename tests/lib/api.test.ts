import { indexedDB } from "fake-indexeddb";
import {
  captureRole,
  clearAISettingToken,
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
  updateAISetting,
  updateAISettingToken,
  updateDesirabilityFactor,
  updateRoleStatus,
} from "../../src/lib/api";
import { addLocalOutcomeEvent } from "../../src/lib/localApplicationWorkflows";
import { captureLocalRole } from "../../src/lib/localRoles";

beforeEach(() => {
  Object.defineProperty(window, "indexedDB", {
    configurable: true,
    value: indexedDB,
  });
  localStorage.clear();
});

describe("api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns local skills payload", async () => {
    const result = await listSkills();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws when local skill does not exist", async () => {
    await expect(getSkill(1)).rejects.toThrow(/Skill not found/i);
  });

  it("throws when updating a missing local role", async () => {
    await expect(updateRoleStatus(2, "submitted")).rejects.toThrow(/Role not found/i);
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

  it("lists, updates, and validates local AI settings", async () => {
    const listed = await listAISettings();
    expect(listed.length).toBeGreaterThanOrEqual(1);

    const updated = await updateAISetting("role_parsing", { model: "gpt-4o-mini" });
    expect(updated.model).toBe("gpt-4o-mini");

    const tokenUpdated = await updateAISettingToken("role_parsing", "sk-test-1234567890");
    expect(tokenUpdated.token_masked).toContain("7890");

    await clearAISettingToken("role_parsing");

    const health = await healthcheckAISetting("role_parsing");
    expect(health.ok).toBe(false);
  });

  it("lists local outcomes", async () => {
    const listed = await listOutcomeEvents(2);
    expect(listed).toEqual([]);
  });

  it("computes outcome insights and default tuning suggestions", async () => {
    const capturedRole = await captureLocalRole({
      url: "https://example.com/role-1",
      fallback_text: "Platform Engineer\nTypeScript\nLeadership",
    });

    await addLocalOutcomeEvent(capturedRole.role_id, {
      event_type: "offer",
      occurred_at: "2026-03-18T13:00:00.000Z",
      model_family: "openai",
    });

    const insights = await getOutcomeInsights();
    expect(insights.total_events).toBe(1);
    expect(insights.total_roles_with_outcomes).toBe(1);
    expect(insights.conversion_by_model_family).toEqual([
      expect.objectContaining({ segment: "openai", attempts: 1, hires: 1, conversion_rate: 1 }),
    ]);

    const suggestions = await getOutcomeTuningSuggestions();
    expect(suggestions.suggestions).toHaveLength(1);
    expect(suggestions.suggestions[0]?.recommendation).toMatch(/Prefer openai/i);
  });

  it("returns no tuning suggestions when non-openai outcomes exist", async () => {
    const capturedRole = await captureLocalRole({
      url: "https://example.com/role-2",
      fallback_text: "Frontend Engineer\nReact\nTesting",
    });

    await addLocalOutcomeEvent(capturedRole.role_id, {
      event_type: "interview",
      occurred_at: "2026-03-18T14:00:00.000Z",
      model_family: "anthropic",
    });

    const suggestions = await getOutcomeTuningSuggestions();
    expect(suggestions.suggestions).toHaveLength(1);
    expect(suggestions.suggestions[0]?.recommendation).toMatch(/Prefer openai/i);
  });

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

  it("scrapes roles through the local browser workflow", async () => {
    const result = await captureRole({
      url: "pasted-role-description",
      fallback_text: "Backend Engineer\nTypeScript, React, Testing",
    });

    expect(result.status).toBe("success");
    expect(result.title).toContain("Backend Engineer");
  });
});
