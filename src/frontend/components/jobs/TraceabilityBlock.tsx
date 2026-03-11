import React from "react";

import type { SectionTraceability } from "../../lib/api";

interface TraceabilityBlockProps {
  traceability?: SectionTraceability[];
  unsupportedClaims?: string[];
}

export function TraceabilityBlock({ traceability, unsupportedClaims }: TraceabilityBlockProps) {
  const traces = traceability ?? [];
  const unsupported = unsupportedClaims ?? [];

  if (!traces.length && !unsupported.length) {
    return null;
  }

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <h5 style={{ marginBottom: "0.25rem" }}>Evidence Traceability</h5>
      {traces.length ? (
        <ul>
          {traces.map((trace) => (
            <li key={trace.section_key}>
              <strong>{trace.section_key}</strong>
              {trace.citations.length ? (
                <ul>
                  {trace.citations.map((citation) => (
                    <li
                      key={`${trace.section_key}-${citation.source_key}-${citation.snippet_reference}`}
                    >
                      [{citation.source_type}] {citation.source_record_id ?? citation.source_key}
                      {citation.snippet_reference ? ` — ${citation.snippet_reference}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No citations available.</p>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {unsupported.length ? (
        <p>
          <strong>Unsupported claim flags:</strong> {unsupported.join("; ")}
        </p>
      ) : null}
    </div>
  );
}
