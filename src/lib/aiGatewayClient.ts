import {
  type AIConfigManager,
  type AIHostedAuthRequest,
  type AIHostedAuthResult,
  type AIHostedGatewayClient,
  type AIHostedInvokeRequest,
  type AIHostedInvokeSuccess,
  type AIInvokeResult,
  createAIConfigManager,
} from "@evergraytech/ai-config";

import { aiConfigAppDefinition } from "./aiConfig";

const AI_GATEWAY_BASE_URL = process.env.NEXT_PUBLIC_AI_GATEWAY_BASE_URL?.trim() ?? "";
const AI_GATEWAY_CLIENT_ID = process.env.NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID?.trim() ?? "";

export function isAIConfigGatewayConfigured(): boolean {
  return Boolean(AI_GATEWAY_BASE_URL && AI_GATEWAY_CLIENT_ID);
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function requireGatewayConfig() {
  if (!AI_GATEWAY_BASE_URL || !AI_GATEWAY_CLIENT_ID) {
    throw new Error(
      "AI gateway is not configured. Set NEXT_PUBLIC_AI_GATEWAY_BASE_URL and NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID.",
    );
  }

  return {
    baseUrl: trimTrailingSlash(AI_GATEWAY_BASE_URL),
    clientId: AI_GATEWAY_CLIENT_ID,
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message =
      typeof payload?.message === "string"
        ? payload.message
        : `Gateway request failed with status ${response.status}.`;

    const error = new Error(message) as Error & {
      status?: number;
      code?: string;
      category?: string;
      retryable?: boolean;
      details?: Record<string, string | number | boolean | null | undefined>;
    };

    error.status = response.status;
    error.code = typeof payload?.code === "string" ? payload.code : undefined;
    error.category = typeof payload?.category === "string" ? payload.category : undefined;
    error.retryable = typeof payload?.retryable === "boolean" ? payload.retryable : undefined;
    error.details = typeof payload?.details === "object" ? payload.details : undefined;

    throw error;
  }

  return payload as T;
}

type GatewayErrorShape = Error & {
  status?: number;
  code?: string;
  category?: string;
  retryable?: boolean;
  details?: Record<string, string | number | boolean | null | undefined>;
};

function createHostedGatewayClient(): { clientId: string; gateway: AIHostedGatewayClient } {
  const { baseUrl, clientId } = requireGatewayConfig();

  return {
    clientId,
    gateway: {
      authenticate: async ({
        appId,
        clientId: authClientId,
      }: AIHostedAuthRequest): Promise<AIHostedAuthResult> => {
        const response = await fetch(`${baseUrl}/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ appId, clientId: authClientId }),
        });

        return parseJsonResponse(response);
      },
      invoke: async ({
        token,
        provider,
        model,
        credential,
        input,
        stream,
      }: AIHostedInvokeRequest): Promise<AIHostedInvokeSuccess> => {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        if (credential) {
          headers["X-EG-AI-Provider-Credential"] = credential;
        }

        const response = await fetch(`${baseUrl}/ai`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            ...(provider ? { provider } : {}),
            ...(model ? { model } : {}),
            input,
            stream: Boolean(stream),
          }),
        });

        return parseJsonResponse(response);
      },
    },
  };
}

let aiConfigManager: AIConfigManager | null = null;

export function getAIConfigManagerOptions() {
  return {
    hostedGateway: createHostedGatewayClient(),
  };
}

export function getAIConfigManager(): AIConfigManager {
  aiConfigManager ??= createAIConfigManager({
    appDefinition: aiConfigAppDefinition,
    ...getAIConfigManagerOptions(),
  });

  return aiConfigManager;
}

export async function invokeConfiguredAI(
  input: string,
  category?: string,
): Promise<AIInvokeResult> {
  return getAIConfigManager().invoke({ input, ...(category ? { category } : {}) });
}
