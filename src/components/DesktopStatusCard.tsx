import React from "react";

export function DesktopStatusCard() {
  return (
    <section className="card" aria-label="Product architecture status">
      <h3>Product architecture status</h3>
      <p>
        Plot Your Path now ships as a browser-hosted, local-first web application focused on keeping
        core workspace data on-device.
      </p>
      <p>
        Your workspace data is expected to stay local to this browser/device by default, with
        explicit export/import used for backup and portability.
      </p>
      <div className="structured-message structured-message-info">
        <h4>Architecture boundary</h4>
        <p>
          The active experience is the web app itself. Archived implementation history may still
          exist in documentation for traceability, but it is not part of the current runtime.
        </p>
      </div>
      <ul>
        <li>
          Active trust model: <code>browser-local workspace + explicit backups</code>
        </li>
      </ul>
    </section>
  );
}
