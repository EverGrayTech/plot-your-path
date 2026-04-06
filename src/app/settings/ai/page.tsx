import React from "react";

import { AISettingsPanel } from "../../../components/settings/AISettingsPanel";

export default function AIConfigurationPage() {
  return (
    <>
      <header className="page-header">
        <h1>AI Configuration</h1>
      </header>
      <p className="page-description">
        Configure AI providers, models, and category-specific overrides through the shared EverGray
        configuration panel.
      </p>

      <AISettingsPanel />
    </>
  );
}
