"use client";

import "@evergraytech/ai-config/styles/base.css";

import { AIConfigPanel, AIConfigProvider } from "@evergraytech/ai-config/react";

import { aiConfigAppDefinition } from "../../lib/aiConfig";

export function AISettingsPanel() {
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

      <AIConfigProvider appDefinition={aiConfigAppDefinition}>
        <AIConfigPanel />
      </AIConfigProvider>
    </section>
  );
}
