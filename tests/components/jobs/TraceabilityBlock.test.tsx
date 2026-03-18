import { render, screen } from "@testing-library/react";
import React from "react";

import { TraceabilityBlock } from "../../../src/components/jobs/TraceabilityBlock";

describe("TraceabilityBlock", () => {
  it("renders nothing when both traceability and unsupported claims are empty", () => {
    const { container } = render(<TraceabilityBlock />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders no citations fallback when a trace has no citations", () => {
    render(
      <TraceabilityBlock
        traceability={[
          {
            citations: [],
            section_key: "summary",
            unsupported_claims: [],
          },
        ]}
      />,
    );

    expect(screen.getByText("summary")).toBeInTheDocument();
    expect(screen.getByText(/No citations available/i)).toBeInTheDocument();
  });

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

  it("renders traceability without unsupported claims and falls back to source key", () => {
    render(
      <TraceabilityBlock
        traceability={[
          {
            citations: [
              {
                confidence: 0.91,
                snippet_reference: "",
                source_id: 7,
                source_key: "experience.platform",
                source_record_id: null,
                source_type: "career_evidence",
              },
            ],
            section_key: "intro",
            unsupported_claims: [],
          },
        ]}
        unsupportedClaims={[]}
      />,
    );

    expect(screen.getByText(/experience\.platform/i)).toBeInTheDocument();
    expect(screen.queryByText(/Unsupported claim flags/i)).not.toBeInTheDocument();
  });
});
