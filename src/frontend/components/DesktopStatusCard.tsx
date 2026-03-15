import React from "react";

import { API_BASE_URL } from "../lib/api";

function desktopDataPathLabel(): string {
  if (typeof window === "undefined") {
    return "your local application data directory";
  }

  const platform = window.navigator.platform.toLowerCase();
  if (platform.includes("mac")) {
    return "~/Library/Application Support/Plot Your Path";
  }
  if (platform.includes("win")) {
    return "%LOCALAPPDATA%\\Plot Your Path";
  }
  return "$XDG_DATA_HOME/plot-your-path (or ~/.local/share/plot-your-path)";
}

export function DesktopStatusCard() {
  return (
    <section className="card" aria-label="Desktop runtime status">
      <h3>Desktop runtime foundation</h3>
      <p>
        Desktop builds run the frontend inside a Tauri shell and launch the packaged backend
        automatically, so users do not need to manage separate terminals or ports.
      </p>
      <p>Your workspace data stays in a local application folder unless you export a backup.</p>
      <ul>
        <li>
          API endpoint: <code>{API_BASE_URL}</code>
        </li>
        <li>
          Desktop data root: <code>{desktopDataPathLabel()}</code>
        </li>
        <li>
          Healthcheck: <code>{`${API_BASE_URL}/api/health`}</code>
        </li>
      </ul>
    </section>
  );
}
