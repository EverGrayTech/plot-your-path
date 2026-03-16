import React from "react";

import { DataManagementPanel } from "../../components/DataManagementPanel";
import { DesktopStatusCard } from "../../components/DesktopStatusCard";

export default function SettingsPage() {
  return (
    <>
      <header className="page-header">
        <h1>Settings</h1>
      </header>
      <p className="page-description">
        Configuration and administration for AI models, desirability scoring, local data safety,
        backups, and the browser-local MVP workflow.
      </p>

      <section className="structured-message structured-message-info">
        <h3>Local-first trust model</h3>
        <p>
          Plot Your Path is designed so sensitive career data stays local by default. Use export and
          import deliberately to back up your workspace or move it between devices.
        </p>
      </section>

      <section>
        <h3>AI Model Configuration</h3>
        <p>
          Manage AI provider settings, runtime tokens, and model selection for each operation
          family. These settings are also accessible from the Jobs page toolbar.
        </p>
      </section>

      <section>
        <h3>Desirability Factor Settings</h3>
        <p>
          Configure the factors, prompts, and weights used to score role desirability. These
          settings are also accessible from the Jobs page toolbar.
        </p>
      </section>

      <DataManagementPanel />

      <DesktopStatusCard />
    </>
  );
}
