"use client";

import "@evergraytech/ai-config/styles/base.css";

import { AIConfigPanel, AIConfigProvider } from "@evergraytech/ai-config/react";

import { aiConfigAppDefinition } from "../../lib/aiConfig";
import { getAIConfigManager, isAIConfigGatewayConfigured } from "../../lib/aiGatewayClient";

export function AISettingsPanel() {
  if (!isAIConfigGatewayConfigured()) {
    return (
      <section aria-label="AI model configuration" className="card settings-ai-panel">
        <h3>AI Model Configuration</h3>
        <div className="structured-message structured-message-warning">
          <h4>AI gateway setup required</h4>
          <p>
            Set <code>NEXT_PUBLIC_AI_GATEWAY_BASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID</code> in your local Next environment before
            using the shared AI configuration panel.
          </p>
          <p>
            Example: <code>NEXT_PUBLIC_AI_GATEWAY_BASE_URL=http://localhost:8787</code> and{" "}
            <code>NEXT_PUBLIC_AI_GATEWAY_CLIENT_ID=plot-your-path-client</code>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="AI model configuration" className="card settings-ai-panel">
      <h3>AI Model Configuration</h3>
      <p>
        Use the shared AI configuration panel to choose between the app-provided route and your own
        provider credentials. Category overrides let you tune different workflow families without
        rebuilding settings controls inside Plot Your Path.
      </p>
      <p>
        Provider keys remain local to this browser context. They are not part of exported backups,
        and AI invocation failures should be surfaced directly rather than replaced with local
        fallback output.
      </p>

      <AIConfigProvider appDefinition={aiConfigAppDefinition} manager={getAIConfigManager()}>
        <AIConfigPanel />
      </AIConfigProvider>
    </section>
  );
}
