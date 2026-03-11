import { render, screen } from "@testing-library/react";
import React from "react";

import { TraceabilityBlock } from "../../../../src/frontend/components/jobs/TraceabilityBlock";

describe("TraceabilityBlock", () => {
  it("renders citations and unsupported claim flags", () => {
    render(
      <TraceabilityBlock
        traceability={[
          {
            citations: [
              {
                confidence: 0.91,
                snippet_reference: "Built and scaled APIs",
                source_id: 7,
                source_key: "experience.platform",
                source_record_id: "resume.md",
                source_type: "career_evidence",
              },
            ],
            section_key: "intro",
            unsupported_claims: [],
          },
        ]}
        unsupportedClaims={["Leadership depth not fully evidenced"]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Evidence Traceability" })).toBeInTheDocument();
    expect(screen.getByText(/Built and scaled APIs/i)).toBeInTheDocument();
    expect(screen.getByText(/Leadership depth not fully evidenced/i)).toBeInTheDocument();
  });
});
