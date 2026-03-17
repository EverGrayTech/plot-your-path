import type {
  FitRecommendation,
  InterviewPrepPack,
  InterviewStage,
  OutcomeEventType,
  ResumeTuningSuggestion,
} from "./dataModels";

export function recommendationLabel(value: FitRecommendation | null): string {
  if (value === "go") {
    return "Go";
  }
  if (value === "maybe") {
    return "Maybe";
  }
  if (value === "no-go") {
    return "No-Go";
  }
  return "Not analyzed";
}

export function interviewStageLabel(value: InterviewStage | null | undefined): string {
  if (!value) {
    return "Not started";
  }
  if (value === "recruiter_screen") {
    return "Recruiter Screen";
  }
  if (value === "hiring_manager") {
    return "Hiring Manager";
  }
  return value
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function outcomeEventLabel(value: OutcomeEventType): string {
  if (value === "screen") {
    return "Screen";
  }
  if (value === "interview") {
    return "Interview";
  }
  if (value === "offer") {
    return "Offer";
  }
  return "Rejected";
}

export function toPercent(value: number | null): string {
  if (value === null) {
    return "N/A";
  }
  return `${(value * 100).toFixed(1)}%`;
}

export function toLocalInputValue(isoString: string | null): string {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  const hh = `${date.getHours()}`.padStart(2, "0");
  const min = `${date.getMinutes()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function interviewPrepToMarkdown(pack: InterviewPrepPack): string {
  const sections = [
    { key: "likely_questions", title: "Likely Questions" },
    { key: "talking_points", title: "Talking Points" },
    { key: "star_stories", title: "STAR Story Draft Suggestions" },
  ] as const;

  const lines: string[] = ["# Interview Prep Pack"];
  for (const section of sections) {
    lines.push(`\n## ${section.title}`);
    for (const item of pack.sections[section.key]) {
      lines.push(`- ${item}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function resumeTuningToMarkdown(suggestion: ResumeTuningSuggestion): string {
  const sections = [
    { key: "keep_bullets", title: "Keep Bullets" },
    { key: "remove_bullets", title: "Remove / Deprioritize Bullets" },
    { key: "emphasize_bullets", title: "Emphasize Bullets" },
    { key: "missing_keywords", title: "Missing Keywords" },
    { key: "summary_tweaks", title: "Summary Tweaks" },
    { key: "confidence_notes", title: "Confidence / Rationale Notes" },
  ] as const;

  const lines: string[] = ["# Resume Tuning Suggestions"];
  for (const section of sections) {
    lines.push(`\n## ${section.title}`);
    for (const item of suggestion.sections[section.key]) {
      lines.push(`- ${item}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

export function exportMarkdownFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
