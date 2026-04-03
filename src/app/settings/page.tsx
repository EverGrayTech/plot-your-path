import React from "react";

import { DataManagementPanel } from "../../components/DataManagementPanel";
import { DesktopStatusCard } from "../../components/DesktopStatusCard";
import { AISettingsPanel } from "../../components/settings/AISettingsPanel";

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

      <AISettingsPanel />

      <section>
        <h3>Desirability Factor Settings</h3>
        <p>
          Configure the factors, prompts, and weights used to score role desirability. These
          settings are part of the current browser-local MVP workflow and remain separate from the
          shared AI configuration panel.
        </p>
      </section>

      <DataManagementPanel />

      <DesktopStatusCard />
    </>
  );
}
