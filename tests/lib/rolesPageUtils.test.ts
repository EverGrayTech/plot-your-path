import type { InterviewPrepPack, ResumeTuningSuggestion } from "../../src/lib/dataModels";
import {
  exportMarkdownFile,
  interviewPrepToMarkdown,
  interviewStageLabel,
  outcomeEventLabel,
  recommendationLabel,
  resumeTuningToMarkdown,
  toLocalInputValue,
  toPercent,
} from "../../src/lib/rolesPageUtils";

describe("rolesPageUtils", () => {
  it("formats recommendation labels", () => {
    expect(recommendationLabel("go")).toBe("Go");
    expect(recommendationLabel("maybe")).toBe("Maybe");
    expect(recommendationLabel("no-go")).toBe("No-Go");
    expect(recommendationLabel(null)).toBe("Not analyzed");
  });

  it("formats interview stage labels", () => {
    expect(interviewStageLabel(undefined)).toBe("Not started");
    expect(interviewStageLabel(null)).toBe("Not started");
    expect(interviewStageLabel("recruiter_screen")).toBe("Recruiter Screen");
    expect(interviewStageLabel("hiring_manager")).toBe("Hiring Manager");
    expect(interviewStageLabel("technical")).toBe("Technical");
  });

  it("formats outcome event labels", () => {
    expect(outcomeEventLabel("screen")).toBe("Screen");
    expect(outcomeEventLabel("interview")).toBe("Interview");
    expect(outcomeEventLabel("offer")).toBe("Offer");
    expect(outcomeEventLabel("rejected")).toBe("Rejected");
  });

  it("formats percent and local input values", () => {
    expect(toPercent(null)).toBe("N/A");
    expect(toPercent(0.456)).toBe("45.6%");
    expect(toLocalInputValue(null)).toBe("");
    expect(toLocalInputValue("2026-03-18T13:45:00.000Z")).toMatch(/^2026-03-18T\d{2}:45$/);
  });

  it("renders interview prep markdown", () => {
    const pack: InterviewPrepPack = {
      id: 1,
      role_id: 7,
      artifact_type: "interview_prep_pack",
      version: 1,
      sections: {
        likely_questions: ["Why this role?"],
        talking_points: ["Highlight measurable outcomes"],
        star_stories: ["Migration story"],
      },
      provider: "browser-local",
      model: "template-v1",
      prompt_version: "test",
      created_at: "2026-03-18T13:00:00.000Z",
    };

    expect(interviewPrepToMarkdown(pack)).toContain("## Likely Questions");
    expect(interviewPrepToMarkdown(pack)).toContain("- Migration story");
  });

  it("renders resume tuning markdown", () => {
    const suggestion: ResumeTuningSuggestion = {
      id: 1,
      role_id: 7,
      artifact_type: "resume_tuning",
      version: 1,
      sections: {
        keep_bullets: ["Keep impact bullet"],
        remove_bullets: ["Remove generic objective"],
        emphasize_bullets: ["Emphasize leadership"],
        missing_keywords: ["typescript"],
        summary_tweaks: ["Lead with relevant experience"],
        confidence_notes: ["Derived from role evidence"],
      },
      provider: "browser-local",
      model: "template-v1",
      prompt_version: "test",
      created_at: "2026-03-18T13:00:00.000Z",
    };

    expect(resumeTuningToMarkdown(suggestion)).toContain("## Missing Keywords");
    expect(resumeTuningToMarkdown(suggestion)).toContain("- typescript");
  });

  it("exports markdown files through a temporary anchor", () => {
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");
    const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
      if (tagName === "a") {
        Object.defineProperty(element, "click", { value: click });
      }
      return element;
    });

    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    exportMarkdownFile("report.md", "# Report");

    expect(appendChildSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");

    createElementSpy.mockRestore();
  });
});
