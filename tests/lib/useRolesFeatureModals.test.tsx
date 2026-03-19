import { act, renderHook, waitFor } from "@testing-library/react";

import { useRolesFeatureModals } from "../../src/lib/useRolesFeatureModals";

const services = {
  desirabilityFactors: {
    listDesirabilityFactors: vi.fn(),
    createDesirabilityFactor: vi.fn(),
    deleteDesirabilityFactor: vi.fn(),
    reorderDesirabilityFactors: vi.fn(),
    updateDesirabilityFactor: vi.fn(),
  },
  aiSettings: {
    listAISettings: vi.fn(),
    updateAISetting: vi.fn(),
    updateAISettingToken: vi.fn(),
    clearAISettingToken: vi.fn(),
    healthcheckAISetting: vi.fn(),
  },
  workflows: {
    listPipeline: vi.fn(),
    getOutcomeInsights: vi.fn(),
    getOutcomeTuningSuggestions: vi.fn(),
  },
};

vi.mock("../../src/lib/services", () => ({
  getFrontendServices: () => services,
}));

describe("useRolesFeatureModals", () => {
  beforeEach(() => {
    services.desirabilityFactors.listDesirabilityFactors.mockResolvedValue([
      {
        id: 1,
        name: "Growth",
        prompt: "Prompt",
        weight: 0.4,
        is_active: true,
        display_order: 0,
        created_at: "2026-03-18T00:00:00.000Z",
        updated_at: "2026-03-18T00:00:00.000Z",
      },
    ]);
    services.aiSettings.listAISettings.mockResolvedValue([
      {
        operation_family: "role_parsing",
        provider: "openai",
        model: "gpt-4o-mini",
        token_label: "Local token",
        base_url: null,
        temperature: 0.2,
        max_tokens: 4000,
        has_runtime_token: false,
        token_masked: null,
        created_at: "2026-03-18T00:00:00.000Z",
        updated_at: "2026-03-18T00:00:00.000Z",
      },
    ]);
    services.workflows.listPipeline.mockResolvedValue({
      counters: { needs_follow_up: 1, overdue_actions: 1, upcoming_deadlines: 1 },
      items: [],
    });
    services.workflows.getOutcomeInsights.mockResolvedValue({
      confidence_message: "Moderate",
      conversion_by_fit_band: [],
      conversion_by_desirability_band: [],
      conversion_by_model_family: [],
      total_events: 0,
      total_roles_with_outcomes: 0,
    });
    services.workflows.getOutcomeTuningSuggestions.mockResolvedValue({
      confidence_message: "Low",
      suggestions: [],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("opens modals, loads data, and handles AI token/config actions", async () => {
    const { result } = renderHook(() => useRolesFeatureModals());

    act(() => {
      result.current.openFactorSettings();
      result.current.openAISettings();
      result.current.openPipeline();
      result.current.openOutcomeInsights();
    });

    await waitFor(() => expect(result.current.factors).toHaveLength(1));
    await waitFor(() => expect(result.current.aiSettings).toHaveLength(1));
    await waitFor(() => expect(result.current.pipelineCounters.needs_follow_up).toBe(1));
    await waitFor(() =>
      expect(result.current.outcomeInsights?.confidence_message).toBe("Moderate"),
    );

    await act(async () => {
      await result.current.handleUpdateAIConfig("role_parsing", { provider: "anthropic" });
      result.current.setTokenInputs((previous) => ({ ...previous, role_parsing: "secret" }));
    });

    services.aiSettings.updateAISettingToken.mockResolvedValue(undefined);
    services.aiSettings.clearAISettingToken.mockResolvedValue(undefined);
    services.aiSettings.healthcheckAISetting.mockResolvedValue({ ok: true, detail: "Ready" });

    await act(async () => {
      await result.current.handleUpdateToken("role_parsing");
      await result.current.handleClearToken("role_parsing");
      await result.current.handleHealthcheck("role_parsing");
    });

    expect(services.aiSettings.updateAISetting).toHaveBeenCalled();
    expect(services.aiSettings.updateAISettingToken).toHaveBeenCalledWith("role_parsing", "secret");
    expect(services.aiSettings.clearAISettingToken).toHaveBeenCalledWith("role_parsing");
    expect(result.current.healthByFamily.role_parsing).toMatch(/OK/i);
  });

  it("handles factor create, update, move, delete, validation, and modal close paths", async () => {
    services.desirabilityFactors.createDesirabilityFactor.mockResolvedValue(undefined);
    services.desirabilityFactors.deleteDesirabilityFactor.mockResolvedValue(undefined);
    services.desirabilityFactors.reorderDesirabilityFactors.mockResolvedValue([
      {
        id: 1,
        name: "Growth",
        prompt: "Prompt",
        weight: 0.4,
        is_active: true,
        display_order: 0,
        created_at: "2026-03-18T00:00:00.000Z",
        updated_at: "2026-03-18T00:00:00.000Z",
      },
    ]);
    services.desirabilityFactors.updateDesirabilityFactor.mockResolvedValue(undefined);

    const { result } = renderHook(() => useRolesFeatureModals());

    act(() => {
      result.current.openFactorSettings();
    });
    await waitFor(() => expect(result.current.factors).toHaveLength(1));

    await act(async () => {
      await result.current.handleAddFactor();
    });
    expect(result.current.factorsError).toMatch(/Provide name, prompt, and numeric weight/i);

    act(() => {
      result.current.setNewFactorName("Compensation");
      result.current.setNewFactorPrompt("Pay well?");
      result.current.setNewFactorWeight("0.3");
    });

    services.desirabilityFactors.listDesirabilityFactors.mockResolvedValueOnce([
      {
        id: 1,
        name: "Growth",
        prompt: "Prompt",
        weight: 0.4,
        is_active: true,
        display_order: 0,
        created_at: "2026-03-18T00:00:00.000Z",
        updated_at: "2026-03-18T00:00:00.000Z",
      },
      {
        id: 2,
        name: "Compensation",
        prompt: "Pay well?",
        weight: 0.3,
        is_active: true,
        display_order: 1,
        created_at: "2026-03-18T00:00:00.000Z",
        updated_at: "2026-03-18T00:00:00.000Z",
      },
    ]);

    await act(async () => {
      await result.current.handleAddFactor();
      await result.current.handleUpdateFactor(1, "prompt", "Updated");
      await result.current.handleUpdateFactor(1, "weight", 0.5);
      await result.current.handleUpdateFactor(1, "is_active", false);
      await result.current.handleMoveFactor(1, 1);
      await result.current.handleDeleteFactor(1);
    });

    expect(services.desirabilityFactors.createDesirabilityFactor).toHaveBeenCalled();
    expect(services.desirabilityFactors.updateDesirabilityFactor).toHaveBeenCalledTimes(3);
    expect(services.desirabilityFactors.reorderDesirabilityFactors).not.toHaveBeenCalled();
    expect(services.desirabilityFactors.deleteDesirabilityFactor).toHaveBeenCalledWith(1);

    act(() => {
      result.current.closeFactorSettings();
      result.current.closeAISettings();
      result.current.closePipeline();
      result.current.closeOutcomeInsights();
    });

    expect(result.current.showFactorSettings).toBe(false);
    expect(result.current.showAISettings).toBe(false);
    expect(result.current.showPipeline).toBe(false);
    expect(result.current.showOutcomeInsights).toBe(false);
  });
});
