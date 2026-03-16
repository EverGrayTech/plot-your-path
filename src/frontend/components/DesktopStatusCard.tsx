import React from "react";

import { API_BASE_URL } from "../lib/api";

export function DesktopStatusCard() {
  return (
    <section className="card" aria-label="Architecture status">
      <h3>Architecture status</h3>
      <p>
        The active MVP path is a browser-hosted, local-first web application. The earlier
        desktop-runtime direction is now archived context rather than the primary product path.
      </p>
      <p>
        Your workspace data is expected to stay local to this browser/device by default, with
        explicit export/import used for backup and portability.
      </p>
      <div className="structured-message structured-message-info">
        <h4>Legacy path retirement</h4>
        <p>
          Backend and desktop-runtime materials may remain in the repository for traceability, but
          they should not be treated as the active MVP default.
        </p>
      </div>
      <ul>
        <li>
          Active browser API base: <code>{API_BASE_URL}</code>
        </li>
        <li>
          Active trust model: <code>browser-local workspace + explicit backups</code>
        </li>
      </ul>
    </section>
  );
}
