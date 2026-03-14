import React from "react";

export default function SettingsPage() {
  return (
    <>
      <header className="page-header">
        <h1>Settings</h1>
      </header>
      <p className="page-description">
        Configuration and administration for AI models, desirability scoring, and system behavior.
      </p>

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
    </>
  );
}
