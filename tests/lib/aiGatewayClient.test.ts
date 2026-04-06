import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AIConfigManagerOptions } from "@evergraytech/ai-config";

const invokeMock = vi.fn();
const createManagerMock = vi.fn(() => ({
  invoke: invokeMock,
}));

vi.mock("@evergraytech/ai-config", () => ({
  createAIConfigManager: createManagerMock,
}));

describe("aiGatewayClient", () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL;
  const originalClientId = process.env.NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID;

  function getManagerOptions(): AIConfigManagerOptions {
    expect(createManagerMock).toHaveBeenCalled();
    const firstArg = createManagerMock.mock.calls.at(0)?.at(0);
    if (!firstArg) {
      throw new Error("Expected createAIConfigManager to be called with options.");
    }
    return firstArg as AIConfigManagerOptions;
  }

  beforeEach(() => {
    vi.resetModules();
    invokeMock.mockReset();
    createManagerMock.mockClear();
    process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL = "https://gateway.example.com/";
    process.env.NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID = "plot-your-path-client";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL = originalBaseUrl;
    process.env.NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID = originalClientId;
    vi.restoreAllMocks();
  });

  it("creates a shared manager configured with the hosted gateway client", async () => {
    const { getAIConfigManager } = await import("../../src/lib/aiGatewayClient");

    const first = getAIConfigManager();
    const second = getAIConfigManager();

    expect(first).toBe(second);
    expect(createManagerMock).toHaveBeenCalledTimes(1);

    const options = getManagerOptions();
    expect(options.appDefinition.appId).toBe("plot-your-path");
    expect(options.hostedGateway?.clientId).toBe("plot-your-path-client");
    expect(options.hostedGateway?.gateway).toBeDefined();
  });

  it("calls ai-config invocation with the provided category", async () => {
    invokeMock.mockResolvedValueOnce({ ok: true, output: "done" });

    const { invokeConfiguredAI } = await import("../../src/lib/aiGatewayClient");

    const result = await invokeConfiguredAI("Summarize this role", "fit_analysis");

    expect(invokeMock).toHaveBeenCalledWith({
      input: "Summarize this role",
      category: "fit_analysis",
    });
    expect(result).toEqual({ ok: true, output: "done" });
  });

  it("uses the documented /auth and /ai gateway request shapes", async () => {
    const authResponse = { token: "signed-token" };
    const aiResponse = { provider: "openai", model: "gpt-4o-mini", output: "hello" };

    const fetchMock = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify(authResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(aiResponse), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const { getAIConfigManager } = await import("../../src/lib/aiGatewayClient");
    const manager = getAIConfigManager();

    const options = getManagerOptions();
    const gateway = options.hostedGateway?.gateway;
    expect(gateway).toBeDefined();

    await expect(
      gateway!.authenticate({ appId: "plot-your-path", clientId: "plot-your-path-client" }),
    ).resolves.toEqual(authResponse);

    await expect(
      gateway!.invoke({
        token: "signed-token",
        provider: "openai",
        model: "gpt-4o-mini",
        credential: "sk-test",
        input: "hello",
        stream: false,
      }),
    ).resolves.toEqual(aiResponse);

    expect(manager).toBeDefined();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://gateway.example.com/auth",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ appId: "plot-your-path", clientId: "plot-your-path-client" }),
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://gateway.example.com/ai",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer signed-token",
          "Content-Type": "application/json",
          "X-EG-AI-Provider-Credential": "sk-test",
        }),
        body: JSON.stringify({
          provider: "openai",
          model: "gpt-4o-mini",
          input: "hello",
          stream: false,
        }),
      }),
    );
  });

  it("throws a clear configuration error when gateway env vars are missing", async () => {
    process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL = "";
    process.env.NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID = "";

    const { getAIConfigManager, isAIConfigGatewayConfigured } = await import(
      "../../src/lib/aiGatewayClient"
    );

    expect(isAIConfigGatewayConfigured()).toBe(false);

    expect(() => getAIConfigManager()).toThrow(
      /NEXT_PUBLIC_AI_GATEWAY_BASE_URL and NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID/i,
    );
  });
});
