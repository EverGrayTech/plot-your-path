"use client";

import "@evergraytech/ai-config/styles/base.css";

import { AIConfigProvider, AIConfigSettingsSurface } from "@evergraytech/ai-config/react";

import { aiConfigAppDefinition } from "../../lib/aiConfig";
import { getAIConfigManagerOptions } from "../../lib/aiGatewayClient";

export function AISettingsSurfaceClient() {
  const managerOptions = getAIConfigManagerOptions();

  return (
    <AIConfigProvider appDefinition={aiConfigAppDefinition} managerOptions={managerOptions}>
      <AIConfigSettingsSurface
        description="Configure AI providers, models, and category-specific overrides through the shared EverGray configuration panel."
        framed
        managerOptions={managerOptions}
        setupMessageConfig={{
          clientIdValue: managerOptions.hostedGateway?.clientId,
        }}
        title="AI Configuration"
      />
    </AIConfigProvider>
  );
}
