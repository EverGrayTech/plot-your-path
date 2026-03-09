"use client";

import React, { useEffect, useState } from "react";

import {
  type AISetting,
  type ApplicationMaterial,
  type DesirabilityFactor,
  type FitRecommendation,
  type InterviewPrepPack,
  type InterviewPrepSectionKey,
  type InterviewStage,
  type JobDetail,
  type JobListItem,
  type OperationFamily,
  type PipelineItem,
  type ResumeTuningSuggestion,
  type RoleStatus,
  type SectionTraceability,
  type SkillDetail,
  analyzeJobFit,
  clearAISettingToken,
  createDesirabilityFactor,
  deleteDesirabilityFactor,
  generateCoverLetter,
  generateInterviewPrepPack,
  generateQuestionAnswers,
  generateResumeTuning,
  getJob,
  getSkill,
  healthcheckAISetting,
  listAISettings,
  listApplicationMaterials,
  listDesirabilityFactors,
  listInterviewPrepPacks,
  listJobs,
  listPipeline,
  listResumeTuning,
  refreshDesirabilityScore,
  regenerateInterviewPrepSection,
  reorderDesirabilityFactors,
  scoreJobDesirability,
  syncResumeProfile,
  updateAISetting,
  updateAISettingToken,
  updateDesirabilityFactor,
  updateInterviewPrepPack,
  updateInterviewStage,
  updateJobStatus,
  updateNextAction,
  upsertApplicationOps,
} from "../lib/api";
import { CaptureJobForm } from "./CaptureJobForm";
import { Modal } from "./Modal";

type SortMode = "newest" | "oldest" | "company_az" | "desirability_desc" | "smart_sort";
type RecommendationFilter = "all" | "go" | "maybe" | "no-go" | "not_analyzed";
type DesirabilityFilter = "all" | "scored" | "not_scored";
type StageFilter = "all" | InterviewStage;

const SMART_SORT_FIT_WEIGHT = 0.6;
const SMART_SORT_DESIRABILITY_WEIGHT = 0.4;

function recommendationLabel(value: FitRecommendation | null): string {
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

function interviewStageLabel(value: InterviewStage | null | undefined): string {
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

function toLocalInputValue(isoString: string | null): string {
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

function interviewPrepToMarkdown(pack: InterviewPrepPack): string {
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

function resumeTuningToMarkdown(suggestion: ResumeTuningSuggestion): string {
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

function renderTraceability(
  traceability: SectionTraceability[] | undefined,
  unsupportedClaims: string[] | undefined,
) {
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

export function JobsPageClient() {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [recommendationFilter, setRecommendationFilter] = useState<RecommendationFilter>("all");
  const [desirabilityFilter, setDesirabilityFilter] = useState<DesirabilityFilter>("all");
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [showFactorSettings, setShowFactorSettings] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [analyzingFit, setAnalyzingFit] = useState(false);
  const [fitError, setFitError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null);
  const [loadingSkillDetail, setLoadingSkillDetail] = useState(false);
  const [skillDetailError, setSkillDetailError] = useState<string | null>(null);
  const [applicationMaterials, setApplicationMaterials] = useState<ApplicationMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatingQA, setGeneratingQA] = useState(false);
  const [generatingInterviewPrep, setGeneratingInterviewPrep] = useState(false);
  const [interviewPrepPacks, setInterviewPrepPacks] = useState<InterviewPrepPack[]>([]);
  const [interviewPrepLoading, setInterviewPrepLoading] = useState(false);
  const [interviewPrepError, setInterviewPrepError] = useState<string | null>(null);
  const [selectedInterviewPrepId, setSelectedInterviewPrepId] = useState<number | null>(null);
  const [editingLikelyQuestions, setEditingLikelyQuestions] = useState("");
  const [editingTalkingPoints, setEditingTalkingPoints] = useState("");
  const [editingStarStories, setEditingStarStories] = useState("");
  const [savingInterviewPrep, setSavingInterviewPrep] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<InterviewPrepSectionKey | null>(
    null,
  );
  const [scoringDesirability, setScoringDesirability] = useState(false);
  const [resumeTuningSuggestions, setResumeTuningSuggestions] = useState<ResumeTuningSuggestion[]>(
    [],
  );
  const [resumeTuningLoading, setResumeTuningLoading] = useState(false);
  const [resumeTuningError, setResumeTuningError] = useState<string | null>(null);
  const [generatingResumeTuning, setGeneratingResumeTuning] = useState(false);
  const [syncingResumeProfile, setSyncingResumeProfile] = useState(false);
  const [resumeSyncNotice, setResumeSyncNotice] = useState<string | null>(null);
  const [selectedResumeTuningId, setSelectedResumeTuningId] = useState<number | null>(null);
  const [desirabilityError, setDesirabilityError] = useState<string | null>(null);
  const [qaQuestionsInput, setQaQuestionsInput] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [factors, setFactors] = useState<DesirabilityFactor[]>([]);
  const [factorsLoading, setFactorsLoading] = useState(false);
  const [factorsError, setFactorsError] = useState<string | null>(null);
  const [newFactorName, setNewFactorName] = useState("");
  const [newFactorPrompt, setNewFactorPrompt] = useState("");
  const [newFactorWeight, setNewFactorWeight] = useState("0.10");
  const [aiSettings, setAISettings] = useState<AISetting[]>([]);
  const [aiSettingsLoading, setAISettingsLoading] = useState(false);
  const [aiSettingsError, setAISettingsError] = useState<string | null>(null);
  const [tokenInputs, setTokenInputs] = useState<Record<OperationFamily, string>>({
    job_parsing: "",
    desirability_scoring: "",
    application_generation: "",
  });
  const [healthByFamily, setHealthByFamily] = useState<Partial<Record<OperationFamily, string>>>(
    {},
  );
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineCounters, setPipelineCounters] = useState({
    needs_follow_up: 0,
    overdue_actions: 0,
    upcoming_deadlines: 0,
  });
  const [pipelineOverdueOnly, setPipelineOverdueOnly] = useState(false);
  const [pipelineWeekDeadlines, setPipelineWeekDeadlines] = useState(false);
  const [pipelineRecentlyUpdated, setPipelineRecentlyUpdated] = useState(false);
  const [pipelineStageFilter, setPipelineStageFilter] = useState<StageFilter>("all");
  const [opsAppliedAt, setOpsAppliedAt] = useState("");
  const [opsDeadlineAt, setOpsDeadlineAt] = useState("");
  const [opsSource, setOpsSource] = useState("");
  const [opsRecruiterContact, setOpsRecruiterContact] = useState("");
  const [opsNotes, setOpsNotes] = useState("");
  const [opsNextActionAt, setOpsNextActionAt] = useState("");
  const [opsSaving, setOpsSaving] = useState(false);
  const [opsError, setOpsError] = useState<string | null>(null);
  const [newStage, setNewStage] = useState<InterviewStage>("applied");
  const [stageNotes, setStageNotes] = useState("");
  const [stageOccurredAt, setStageOccurredAt] = useState(
    toLocalInputValue(new Date().toISOString()),
  );
  const [stageSaving, setStageSaving] = useState(false);

  async function loadJobs() {
    setLoadingJobs(true);
    setListError(null);
    try {
      const response = await listJobs();
      setJobs(response);
    } catch (error) {
      if (error instanceof Error) {
        setListError(error.message);
      } else {
        setListError("Failed to load jobs.");
      }
    } finally {
      setLoadingJobs(false);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: initial mount load only
  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const fetchJobDetail = async () => {
      setLoadingDetail(true);
      setSelectedJob(null);
      setDetailError(null);
      try {
        const response = await getJob(selectedRoleId);
        setSelectedJob(response);
      } catch (error) {
        if (error instanceof Error) {
          setDetailError(error.message);
        } else {
          setDetailError("Failed to load job detail.");
        }
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchJobDetail();
  }, [selectedRoleId]);

  useEffect(() => {
    if (!selectedJob) {
      return;
    }
    const timeline = selectedJob.interview_stage_timeline ?? [];
    setOpsAppliedAt(toLocalInputValue(selectedJob.application_ops?.applied_at ?? null));
    setOpsDeadlineAt(toLocalInputValue(selectedJob.application_ops?.deadline_at ?? null));
    setOpsSource(selectedJob.application_ops?.source ?? "");
    setOpsRecruiterContact(selectedJob.application_ops?.recruiter_contact ?? "");
    setOpsNotes(selectedJob.application_ops?.notes ?? "");
    setOpsNextActionAt(toLocalInputValue(selectedJob.application_ops?.next_action_at ?? null));
    setNewStage(timeline.at(-1)?.stage ?? "applied");
    setStageOccurredAt(toLocalInputValue(new Date().toISOString()));
  }, [selectedJob]);

  useEffect(() => {
    if (!showPipeline) {
      return;
    }

    const fetchPipeline = async () => {
      setPipelineLoading(true);
      setPipelineError(null);
      try {
        const response = await listPipeline({
          overdueOnly: pipelineOverdueOnly,
          thisWeekDeadlines: pipelineWeekDeadlines,
          recentlyUpdated: pipelineRecentlyUpdated,
        });
        setPipelineItems(response.items);
        setPipelineCounters(response.counters);
      } catch (error) {
        if (error instanceof Error) {
          setPipelineError(error.message);
        } else {
          setPipelineError("Failed to load pipeline.");
        }
      } finally {
        setPipelineLoading(false);
      }
    };

    fetchPipeline();
  }, [showPipeline, pipelineOverdueOnly, pipelineWeekDeadlines, pipelineRecentlyUpdated]);

  async function handleStatusChange(nextStatus: RoleStatus) {
    if (!selectedJob) {
      return;
    }

    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await updateJobStatus(selectedJob.id, nextStatus);
      await loadJobs();
      const refreshed = await getJob(selectedJob.id);
      setSelectedJob(refreshed);
    } catch (error) {
      if (error instanceof Error) {
        setStatusError(error.message);
      } else {
        setStatusError("Failed to update status.");
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAnalyzeFit() {
    if (!selectedJob) {
      return;
    }

    setAnalyzingFit(true);
    setFitError(null);
    try {
      const response = await analyzeJobFit(selectedJob.id);
      setSelectedJob((previous) => {
        if (!previous) {
          return previous;
        }
        return {
          ...previous,
          latest_fit_analysis: response,
        };
      });
      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setFitError(error.message);
      } else {
        setFitError("Failed to analyze fit.");
      }
    } finally {
      setAnalyzingFit(false);
    }
  }

  async function handleSaveOps() {
    if (!selectedJob) {
      return;
    }
    setOpsSaving(true);
    setOpsError(null);
    try {
      await upsertApplicationOps(selectedJob.id, {
        applied_at: opsAppliedAt || null,
        deadline_at: opsDeadlineAt || null,
        source: opsSource || null,
        recruiter_contact: opsRecruiterContact || null,
        notes: opsNotes || null,
        next_action_at: opsNextActionAt || null,
      });
      const refreshed = await getJob(selectedJob.id);
      setSelectedJob(refreshed);
      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setOpsError(error.message);
      } else {
        setOpsError("Failed to save application ops.");
      }
    } finally {
      setOpsSaving(false);
    }
  }

  async function handleAddStage() {
    if (!selectedJob || !stageOccurredAt) {
      return;
    }
    setStageSaving(true);
    setOpsError(null);
    try {
      await updateInterviewStage(selectedJob.id, {
        stage: newStage,
        notes: stageNotes || null,
        occurred_at: new Date(stageOccurredAt).toISOString(),
      });
      setStageNotes("");
      const refreshed = await getJob(selectedJob.id);
      setSelectedJob(refreshed);
      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setOpsError(error.message);
      } else {
        setOpsError("Failed to add interview stage.");
      }
    } finally {
      setStageSaving(false);
    }
  }

  async function handleSetNextAction(daysFromNow: number) {
    if (!selectedJob) {
      return;
    }
    const next = new Date();
    next.setDate(next.getDate() + daysFromNow);
    try {
      const updated = await updateNextAction(selectedJob.id, next.toISOString());
      setOpsNextActionAt(toLocalInputValue(updated.next_action_at));
      const refreshed = await getJob(selectedJob.id);
      setSelectedJob(refreshed);
      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setOpsError(error.message);
      } else {
        setOpsError("Failed to update next action.");
      }
    }
  }

  useEffect(() => {
    if (!selectedSkillId) {
      return;
    }

    const fetchSkillDetail = async () => {
      setLoadingSkillDetail(true);
      setSelectedSkill(null);
      setSkillDetailError(null);
      try {
        const response = await getSkill(selectedSkillId);
        setSelectedSkill(response);
      } catch (error) {
        if (error instanceof Error) {
          setSkillDetailError(error.message);
        } else {
          setSkillDetailError("Failed to load skill detail.");
        }
      } finally {
        setLoadingSkillDetail(false);
      }
    };

    fetchSkillDetail();
  }, [selectedSkillId]);

  useEffect(() => {
    if (!selectedRoleId) {
      setApplicationMaterials([]);
      setSelectedMaterialId(null);
      setMaterialsError(null);
      setInterviewPrepPacks([]);
      setSelectedInterviewPrepId(null);
      setInterviewPrepError(null);
      setResumeTuningSuggestions([]);
      setSelectedResumeTuningId(null);
      setResumeTuningError(null);
      setResumeSyncNotice(null);
      return;
    }

    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      setMaterialsError(null);
      try {
        const response = await listApplicationMaterials(selectedRoleId);
        setApplicationMaterials(response);
        setSelectedMaterialId((previous) => {
          if (previous && response.some((item) => item.id === previous)) {
            return previous;
          }
          return response[0]?.id ?? null;
        });
      } catch (error) {
        if (error instanceof Error) {
          setMaterialsError(error.message);
        } else {
          setMaterialsError("Failed to load application materials.");
        }
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [selectedRoleId]);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const fetchResumeTuning = async () => {
      setResumeTuningLoading(true);
      setResumeTuningError(null);
      try {
        const response = await listResumeTuning(selectedRoleId);
        setResumeTuningSuggestions(response);
        setSelectedResumeTuningId((previous) => {
          if (previous && response.some((item) => item.id === previous)) {
            return previous;
          }
          return response[0]?.id ?? null;
        });
      } catch (error) {
        if (error instanceof Error) {
          setResumeTuningError(error.message);
        } else {
          setResumeTuningError("Failed to load resume tuning suggestions.");
        }
      } finally {
        setResumeTuningLoading(false);
      }
    };

    fetchResumeTuning();
  }, [selectedRoleId]);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const fetchInterviewPrepPacks = async () => {
      setInterviewPrepLoading(true);
      setInterviewPrepError(null);
      try {
        const response = await listInterviewPrepPacks(selectedRoleId);
        setInterviewPrepPacks(response);
        setSelectedInterviewPrepId((previous) => {
          if (previous && response.some((item) => item.id === previous)) {
            return previous;
          }
          return response[0]?.id ?? null;
        });
      } catch (error) {
        if (error instanceof Error) {
          setInterviewPrepError(error.message);
        } else {
          setInterviewPrepError("Failed to load interview prep packs.");
        }
      } finally {
        setInterviewPrepLoading(false);
      }
    };

    fetchInterviewPrepPacks();
  }, [selectedRoleId]);

  const selectedInterviewPrepPack =
    interviewPrepPacks.find((item) => item.id === selectedInterviewPrepId) ?? null;
  const selectedResumeTuning =
    resumeTuningSuggestions.find((item) => item.id === selectedResumeTuningId) ?? null;

  useEffect(() => {
    if (!selectedInterviewPrepPack) {
      setEditingLikelyQuestions("");
      setEditingTalkingPoints("");
      setEditingStarStories("");
      return;
    }
    setEditingLikelyQuestions(selectedInterviewPrepPack.sections.likely_questions.join("\n"));
    setEditingTalkingPoints(selectedInterviewPrepPack.sections.talking_points.join("\n"));
    setEditingStarStories(selectedInterviewPrepPack.sections.star_stories.join("\n"));
  }, [selectedInterviewPrepPack]);

  async function handleGenerateCoverLetter() {
    if (!selectedJob) {
      return;
    }
    setGeneratingCoverLetter(true);
    setMaterialsError(null);
    try {
      const created = await generateCoverLetter(selectedJob.id);
      const refreshed = await listApplicationMaterials(selectedJob.id);
      setApplicationMaterials(refreshed);
      setSelectedMaterialId(created.id);
    } catch (error) {
      if (error instanceof Error) {
        setMaterialsError(error.message);
      } else {
        setMaterialsError("Failed to generate cover letter.");
      }
    } finally {
      setGeneratingCoverLetter(false);
    }
  }

  async function handleGenerateQA() {
    if (!selectedJob) {
      return;
    }

    const questions = qaQuestionsInput
      .split("\n")
      .map((question) => question.trim())
      .filter(Boolean);

    if (questions.length === 0) {
      setMaterialsError("Add at least one application question before generating Q&A drafts.");
      return;
    }

    setGeneratingQA(true);
    setMaterialsError(null);
    try {
      const created = await generateQuestionAnswers(selectedJob.id, questions);
      const refreshed = await listApplicationMaterials(selectedJob.id);
      setApplicationMaterials(refreshed);
      setSelectedMaterialId(created.id);
    } catch (error) {
      if (error instanceof Error) {
        setMaterialsError(error.message);
      } else {
        setMaterialsError("Failed to generate application Q&A.");
      }
    } finally {
      setGeneratingQA(false);
    }
  }

  async function handleGenerateInterviewPrep() {
    if (!selectedJob) {
      return;
    }

    setGeneratingInterviewPrep(true);
    setInterviewPrepError(null);
    try {
      const created = await generateInterviewPrepPack(selectedJob.id);
      const refreshed = await listInterviewPrepPacks(selectedJob.id);
      setInterviewPrepPacks(refreshed);
      setSelectedInterviewPrepId(created.id);
    } catch (error) {
      if (error instanceof Error) {
        setInterviewPrepError(error.message);
      } else {
        setInterviewPrepError("Failed to generate interview prep pack.");
      }
    } finally {
      setGeneratingInterviewPrep(false);
    }
  }

  async function handleRegenerateInterviewPrepSection(section: InterviewPrepSectionKey) {
    if (!selectedJob) {
      return;
    }
    setRegeneratingSection(section);
    setInterviewPrepError(null);
    try {
      const updated = await regenerateInterviewPrepSection(selectedJob.id, section);
      const refreshed = await listInterviewPrepPacks(selectedJob.id);
      setInterviewPrepPacks(refreshed);
      setSelectedInterviewPrepId(updated.id);
    } catch (error) {
      if (error instanceof Error) {
        setInterviewPrepError(error.message);
      } else {
        setInterviewPrepError("Failed to regenerate interview prep section.");
      }
    } finally {
      setRegeneratingSection(null);
    }
  }

  async function handleSaveInterviewPrepEdits() {
    if (!selectedJob || !selectedInterviewPrepPack) {
      return;
    }

    const toItems = (value: string) =>
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    const sections = {
      likely_questions: toItems(editingLikelyQuestions),
      talking_points: toItems(editingTalkingPoints),
      star_stories: toItems(editingStarStories),
    };

    if (
      !sections.likely_questions.length ||
      !sections.talking_points.length ||
      !sections.star_stories.length
    ) {
      setInterviewPrepError("Each interview prep section requires at least one non-empty item.");
      return;
    }

    setSavingInterviewPrep(true);
    setInterviewPrepError(null);
    try {
      const saved = await updateInterviewPrepPack(
        selectedJob.id,
        selectedInterviewPrepPack.id,
        sections,
      );
      setInterviewPrepPacks((previous) =>
        previous.map((item) => (item.id === saved.id ? saved : item)),
      );
      setSelectedInterviewPrepId(saved.id);
    } catch (error) {
      if (error instanceof Error) {
        setInterviewPrepError(error.message);
      } else {
        setInterviewPrepError("Failed to save interview prep edits.");
      }
    } finally {
      setSavingInterviewPrep(false);
    }
  }

  async function handleCopyInterviewPrep(pack: InterviewPrepPack) {
    const text = interviewPrepToMarkdown(pack);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setInterviewPrepError("Unable to copy prep pack to clipboard in this browser.");
    }
  }

  async function handleSyncResumeProfile() {
    setSyncingResumeProfile(true);
    setResumeTuningError(null);
    setResumeSyncNotice(null);
    try {
      const result = await syncResumeProfile();
      setResumeSyncNotice(
        `Synced ${result.ingested_count} resume section(s) from ${result.source_used}.`,
      );
    } catch (error) {
      if (error instanceof Error) {
        setResumeTuningError(error.message);
      } else {
        setResumeTuningError("Failed to sync resume profile.");
      }
    } finally {
      setSyncingResumeProfile(false);
    }
  }

  async function handleGenerateResumeTuning() {
    if (!selectedJob) {
      return;
    }
    setGeneratingResumeTuning(true);
    setResumeTuningError(null);
    try {
      const created = await generateResumeTuning(selectedJob.id);
      const refreshed = await listResumeTuning(selectedJob.id);
      setResumeTuningSuggestions(refreshed);
      setSelectedResumeTuningId(created.id);
    } catch (error) {
      if (error instanceof Error) {
        setResumeTuningError(error.message);
      } else {
        setResumeTuningError("Failed to generate resume tuning suggestions.");
      }
    } finally {
      setGeneratingResumeTuning(false);
    }
  }

  async function handleCopyResumeTuning(suggestion: ResumeTuningSuggestion) {
    const text = resumeTuningToMarkdown(suggestion);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setResumeTuningError("Unable to copy resume tuning suggestions in this browser.");
    }
  }

  function handleExportResumeTuning(suggestion: ResumeTuningSuggestion) {
    const text = resumeTuningToMarkdown(suggestion);
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `resume-tuning-v${suggestion.version}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  function handleExportInterviewPrep(pack: InterviewPrepPack) {
    const text = interviewPrepToMarkdown(pack);
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `interview-prep-pack-v${pack.version}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  async function handleScoreDesirability(forceRefresh: boolean) {
    if (!selectedJob) {
      return;
    }
    setScoringDesirability(true);
    setDesirabilityError(null);
    try {
      const score = forceRefresh
        ? await refreshDesirabilityScore(selectedJob.id)
        : await scoreJobDesirability(selectedJob.id);
      setSelectedJob((previous) => {
        if (!previous) {
          return previous;
        }
        return {
          ...previous,
          latest_desirability_score: score,
        };
      });
      await loadJobs();
    } catch (error) {
      if (error instanceof Error) {
        setDesirabilityError(error.message);
      } else {
        setDesirabilityError("Failed to score desirability.");
      }
    } finally {
      setScoringDesirability(false);
    }
  }

  async function loadFactors() {
    setFactorsLoading(true);
    setFactorsError(null);
    try {
      const response = await listDesirabilityFactors();
      setFactors(response);
    } catch (error) {
      if (error instanceof Error) {
        setFactorsError(error.message);
      } else {
        setFactorsError("Failed to load factors.");
      }
    } finally {
      setFactorsLoading(false);
    }
  }

  async function loadAISettings() {
    setAISettingsLoading(true);
    setAISettingsError(null);
    try {
      const response = await listAISettings();
      setAISettings(response);
    } catch (error) {
      if (error instanceof Error) {
        setAISettingsError(error.message);
      } else {
        setAISettingsError("Failed to load AI settings.");
      }
    } finally {
      setAISettingsLoading(false);
    }
  }

  async function handleUpdateAIConfig(
    family: OperationFamily,
    payload: { provider?: string; model?: string; api_key_env?: string },
  ) {
    try {
      await updateAISetting(family, payload);
      await loadAISettings();
    } catch (error) {
      if (error instanceof Error) {
        setAISettingsError(error.message);
      } else {
        setAISettingsError("Failed to update AI setting.");
      }
    }
  }

  async function handleUpdateToken(family: OperationFamily) {
    const token = tokenInputs[family]?.trim() ?? "";
    if (!token) {
      setAISettingsError("Token cannot be empty.");
      return;
    }
    try {
      await updateAISettingToken(family, token);
      setTokenInputs((previous) => ({ ...previous, [family]: "" }));
      await loadAISettings();
    } catch (error) {
      if (error instanceof Error) {
        setAISettingsError(error.message);
      } else {
        setAISettingsError("Failed to update token.");
      }
    }
  }

  async function handleClearToken(family: OperationFamily) {
    try {
      await clearAISettingToken(family);
      await loadAISettings();
    } catch (error) {
      if (error instanceof Error) {
        setAISettingsError(error.message);
      } else {
        setAISettingsError("Failed to clear token.");
      }
    }
  }

  async function handleHealthcheck(family: OperationFamily) {
    try {
      const response = await healthcheckAISetting(family);
      setHealthByFamily((previous) => ({
        ...previous,
        [family]: response.ok ? "OK" : `Error: ${response.detail}`,
      }));
    } catch (error) {
      if (error instanceof Error) {
        setHealthByFamily((previous) => ({ ...previous, [family]: `Error: ${error.message}` }));
      } else {
        setHealthByFamily((previous) => ({ ...previous, [family]: "Error: health check failed" }));
      }
    }
  }

  async function handleAddFactor() {
    const parsedWeight = Number(newFactorWeight);
    if (!newFactorName.trim() || !newFactorPrompt.trim() || Number.isNaN(parsedWeight)) {
      setFactorsError("Provide name, prompt, and numeric weight.");
      return;
    }

    try {
      await createDesirabilityFactor({
        name: newFactorName.trim(),
        prompt: newFactorPrompt.trim(),
        weight: parsedWeight,
        is_active: true,
        display_order: factors.length,
      });
      setNewFactorName("");
      setNewFactorPrompt("");
      setNewFactorWeight("0.10");
      await loadFactors();
    } catch (error) {
      if (error instanceof Error) {
        setFactorsError(error.message);
      } else {
        setFactorsError("Failed to create factor.");
      }
    }
  }

  async function handleDeleteFactor(factorId: number) {
    try {
      await deleteDesirabilityFactor(factorId);
      const ordered = factors.filter((factor) => factor.id !== factorId).map((factor) => factor.id);
      if (ordered.length) {
        await reorderDesirabilityFactors(ordered);
      }
      await loadFactors();
    } catch (error) {
      if (error instanceof Error) {
        setFactorsError(error.message);
      } else {
        setFactorsError("Failed to delete factor.");
      }
    }
  }

  async function handleMoveFactor(factorId: number, direction: -1 | 1) {
    const index = factors.findIndex((factor) => factor.id === factorId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= factors.length) {
      return;
    }
    const copy = [...factors];
    const [item] = copy.splice(index, 1);
    copy.splice(nextIndex, 0, item);
    try {
      const reordered = await reorderDesirabilityFactors(copy.map((factor) => factor.id));
      setFactors(reordered);
    } catch (error) {
      if (error instanceof Error) {
        setFactorsError(error.message);
      } else {
        setFactorsError("Failed to reorder factors.");
      }
    }
  }

  async function handleUpdateFactor(
    factorId: number,
    field: "is_active" | "prompt" | "weight",
    value: boolean | number | string,
  ) {
    try {
      if (field === "is_active") {
        await updateDesirabilityFactor(factorId, { is_active: Boolean(value) });
      }
      if (field === "prompt") {
        await updateDesirabilityFactor(factorId, { prompt: String(value) });
      }
      if (field === "weight") {
        await updateDesirabilityFactor(factorId, { weight: Number(value) });
      }
      await loadFactors();
    } catch (error) {
      if (error instanceof Error) {
        setFactorsError(error.message);
      } else {
        setFactorsError("Failed to update factor.");
      }
    }
  }

  const selectedMaterial =
    applicationMaterials.find((item) => item.id === selectedMaterialId) ?? null;

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      job.company.toLowerCase().includes(query) ||
      job.title.toLowerCase().includes(query);

    if (!matchesSearch) {
      return false;
    }

    if (recommendationFilter === "all") {
      if (desirabilityFilter === "all") {
        return true;
      }
      if (desirabilityFilter === "scored") {
        return job.desirability_score !== null;
      }
      return job.desirability_score === null;
    }
    if (recommendationFilter === "not_analyzed") {
      if (job.fit_recommendation !== null) {
        return false;
      }
      if (desirabilityFilter === "all") {
        return true;
      }
      if (desirabilityFilter === "scored") {
        return job.desirability_score !== null;
      }
      return job.desirability_score === null;
    }
    if (job.fit_recommendation !== recommendationFilter) {
      return false;
    }
    if (desirabilityFilter === "all") {
      return true;
    }
    if (desirabilityFilter === "scored") {
      return job.desirability_score !== null;
    }
    return job.desirability_score === null;
  });

  const sortedJobs = [...filteredJobs].sort((left, right) => {
    if (sortMode === "desirability_desc") {
      return (right.desirability_score ?? -1) - (left.desirability_score ?? -1);
    }

    if (sortMode === "smart_sort") {
      const leftFit = left.fit_score ?? 0;
      const rightFit = right.fit_score ?? 0;
      const leftDesirability = (left.desirability_score ?? 0) * 10;
      const rightDesirability = (right.desirability_score ?? 0) * 10;
      const leftSmart =
        leftFit * SMART_SORT_FIT_WEIGHT + leftDesirability * SMART_SORT_DESIRABILITY_WEIGHT;
      const rightSmart =
        rightFit * SMART_SORT_FIT_WEIGHT + rightDesirability * SMART_SORT_DESIRABILITY_WEIGHT;
      return rightSmart - leftSmart;
    }

    if (sortMode === "company_az") {
      return left.company.localeCompare(right.company);
    }

    const leftTs = new Date(left.created_at).getTime();
    const rightTs = new Date(right.created_at).getTime();

    if (sortMode === "oldest") {
      return leftTs - rightTs;
    }
    return rightTs - leftTs;
  });

  return (
    <section>
      <header
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0 }}>Jobs</h1>
        <button onClick={() => setShowCaptureModal(true)} type="button">
          Add Job
        </button>
        <button onClick={() => setShowPipeline(true)} type="button">
          Pipeline
        </button>
        <button
          onClick={() => {
            setShowFactorSettings(true);
            loadFactors();
          }}
          type="button"
        >
          Factor Settings
        </button>
        <button
          onClick={() => {
            setShowAISettings(true);
            loadAISettings();
          }}
          type="button"
        >
          AI Settings
        </button>
      </header>

      <p>Capture and review roles from your job search.</p>
      <p>
        Smart Sort default: {Math.round(SMART_SORT_FIT_WEIGHT * 100)}% fit +{" "}
        {Math.round(SMART_SORT_DESIRABILITY_WEIGHT * 100)}% desirability.
      </p>

      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
        }}
      >
        <label style={{ display: "grid", gap: "0.25rem" }}>
          Search jobs
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company or title"
            type="search"
            value={search}
          />
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Sort jobs
          <select
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            value={sortMode}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="company_az">Company A→Z</option>
            <option value="desirability_desc">Desirability ↓</option>
            <option value="smart_sort">Smart Sort</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Recommendation
          <select
            onChange={(event) =>
              setRecommendationFilter(event.target.value as RecommendationFilter)
            }
            value={recommendationFilter}
          >
            <option value="all">All</option>
            <option value="go">Go</option>
            <option value="maybe">Maybe</option>
            <option value="no-go">No-Go</option>
            <option value="not_analyzed">Not analyzed</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.25rem" }}>
          Desirability
          <select
            onChange={(event) => setDesirabilityFilter(event.target.value as DesirabilityFilter)}
            value={desirabilityFilter}
          >
            <option value="all">All</option>
            <option value="scored">Scored only</option>
            <option value="not_scored">Not scored</option>
          </select>
        </label>
      </div>

      {captureNotice ? <output aria-live="polite">{captureNotice}</output> : null}

      {loadingJobs ? <p>Loading jobs...</p> : null}
      {listError ? <p role="alert">{listError}</p> : null}

      {!loadingJobs && !listError ? (
        <ul style={{ listStyle: "none", margin: "1rem 0 0", padding: 0 }}>
          {sortedJobs.map((job) => (
            <li key={job.id} style={{ marginBottom: "0.5rem" }}>
              <button
                onClick={() => setSelectedRoleId(job.id)}
                style={{ textAlign: "left", width: "100%" }}
                type="button"
              >
                <strong>{job.title}</strong> — {job.company}
                <br />
                <small>
                  {job.salary_range ?? "No salary"} • {job.status} • {job.skills_count} skills •{" "}
                  {recommendationLabel(job.fit_recommendation)}
                  {job.fit_score !== null ? ` (${job.fit_score}%)` : ""}
                  {" • "}
                  Desirability:{" "}
                  {job.desirability_score !== null
                    ? job.desirability_score.toFixed(2)
                    : "Not scored"}
                  {" • Stage: "}
                  {interviewStageLabel(job.current_interview_stage)}
                  {job.needs_attention ? " • Needs attention" : ""}
                </small>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {showCaptureModal ? (
        <Modal onClose={() => setShowCaptureModal(false)} title="Capture Job">
          <CaptureJobForm
            onCaptured={(result) => {
              setCaptureNotice(
                `Captured ${result.title} at ${result.company}. Filters were reset so it is visible.`,
              );
              setSearch("");
              setSortMode("newest");
              setRecommendationFilter("all");
              setDesirabilityFilter("all");
              setSelectedRoleId(result.role_id);
              setShowCaptureModal(false);
              loadJobs();
            }}
          />
        </Modal>
      ) : null}

      {selectedRoleId ? (
        <Modal
          onClose={() => {
            setSelectedRoleId(null);
            setSelectedJob(null);
            setDetailError(null);
            setFitError(null);
          }}
          title="Job Detail"
        >
          {loadingDetail ? <p>Loading job details...</p> : null}
          {detailError ? <p role="alert">{detailError}</p> : null}

          {selectedJob ? (
            <article>
              <h3>{selectedJob.title}</h3>
              <p>
                <strong>{selectedJob.company.name}</strong>
              </p>
              <p>Status: {selectedJob.status}</p>
              <label style={{ display: "grid", gap: "0.25rem", marginBottom: "0.75rem" }}>
                Update status
                <select
                  disabled={updatingStatus}
                  onChange={(event) => handleStatusChange(event.target.value as RoleStatus)}
                  value={selectedJob.status}
                >
                  <option value="open">Open</option>
                  <option value="submitted">Submitted</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              {statusError ? <p role="alert">{statusError}</p> : null}
              {fitError ? <p role="alert">{fitError}</p> : null}
              {desirabilityError ? <p role="alert">{desirabilityError}</p> : null}
              <p>
                Salary: {selectedJob.salary.min ?? "?"} - {selectedJob.salary.max ?? "?"}{" "}
                {selectedJob.salary.currency}
              </p>

              <section>
                <h4>Application Ops</h4>
                {selectedJob.application_ops?.needs_attention ? (
                  <p>
                    <strong>Needs attention:</strong>{" "}
                    {selectedJob.application_ops.attention_reasons.join(", ") ||
                      "Missing next action"}
                  </p>
                ) : (
                  <p>No urgent follow-up flags.</p>
                )}
                {opsError ? <p role="alert">{opsError}</p> : null}
                <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 1fr" }}>
                  <label style={{ display: "grid", gap: "0.25rem" }}>
                    Applied at
                    <input
                      onChange={(event) => setOpsAppliedAt(event.target.value)}
                      type="datetime-local"
                      value={opsAppliedAt}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "0.25rem" }}>
                    Deadline
                    <input
                      onChange={(event) => setOpsDeadlineAt(event.target.value)}
                      type="datetime-local"
                      value={opsDeadlineAt}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "0.25rem" }}>
                    Source
                    <input
                      onChange={(event) => setOpsSource(event.target.value)}
                      value={opsSource}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "0.25rem" }}>
                    Recruiter / Contact
                    <input
                      onChange={(event) => setOpsRecruiterContact(event.target.value)}
                      value={opsRecruiterContact}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "0.25rem", gridColumn: "1 / -1" }}>
                    Notes
                    <textarea
                      onChange={(event) => setOpsNotes(event.target.value)}
                      rows={3}
                      value={opsNotes}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "0.25rem", gridColumn: "1 / -1" }}>
                    Next action date
                    <input
                      onChange={(event) => setOpsNextActionAt(event.target.value)}
                      type="datetime-local"
                      value={opsNextActionAt}
                    />
                  </label>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}
                >
                  <button disabled={opsSaving} onClick={handleSaveOps} type="button">
                    {opsSaving ? "Saving..." : "Save Ops"}
                  </button>
                  <button onClick={() => handleSetNextAction(1)} type="button">
                    Next Action +1 day
                  </button>
                  <button onClick={() => handleSetNextAction(3)} type="button">
                    Next Action +3 days
                  </button>
                </div>

                <h5 style={{ marginBottom: "0.5rem", marginTop: "1rem" }}>
                  Interview stage timeline
                </h5>
                {(selectedJob.interview_stage_timeline ?? []).length ? (
                  <ul>
                    {(selectedJob.interview_stage_timeline ?? []).map((entry) => (
                      <li key={entry.id}>
                        {interviewStageLabel(entry.stage)} —{" "}
                        {new Date(entry.occurred_at).toLocaleString()}
                        {entry.notes ? ` (${entry.notes})` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No interview stage updates yet.</p>
                )}
                <div style={{ display: "grid", gap: "0.5rem", gridTemplateColumns: "1fr 1fr" }}>
                  <label style={{ display: "grid", gap: "0.25rem" }}>
                    Add stage
                    <select
                      onChange={(event) => setNewStage(event.target.value as InterviewStage)}
                      value={newStage}
                    >
                      <option value="applied">Applied</option>
                      <option value="recruiter_screen">Recruiter Screen</option>
                      <option value="hiring_manager">Hiring Manager</option>
                      <option value="technical">Technical</option>
                      <option value="onsite">Onsite</option>
                      <option value="offer">Offer</option>
                      <option value="closed">Closed</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: "0.25rem" }}>
                    Occurred at
                    <input
                      onChange={(event) => setStageOccurredAt(event.target.value)}
                      type="datetime-local"
                      value={stageOccurredAt}
                    />
                  </label>
                  <label style={{ display: "grid", gap: "0.25rem", gridColumn: "1 / -1" }}>
                    Stage notes
                    <textarea
                      onChange={(event) => setStageNotes(event.target.value)}
                      rows={2}
                      value={stageNotes}
                    />
                  </label>
                </div>
                <button disabled={stageSaving} onClick={handleAddStage} type="button">
                  {stageSaving ? "Adding stage..." : "Add Stage Event"}
                </button>
              </section>

              <section>
                <h4>Fit analysis</h4>
                <button disabled={analyzingFit} onClick={handleAnalyzeFit} type="button">
                  {analyzingFit ? "Analyzing..." : "Analyze Fit"}
                </button>
                {selectedJob.latest_fit_analysis ? (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p>
                      <strong>Recommendation:</strong>{" "}
                      {recommendationLabel(selectedJob.latest_fit_analysis.recommendation)}
                    </p>
                    <p>
                      <strong>Fit score:</strong> {selectedJob.latest_fit_analysis.fit_score}%
                    </p>
                    <p>
                      <strong>Strengths:</strong>{" "}
                      {selectedJob.latest_fit_analysis.covered_required_skills.concat(
                        selectedJob.latest_fit_analysis.covered_preferred_skills,
                      ).length
                        ? selectedJob.latest_fit_analysis.covered_required_skills
                            .concat(selectedJob.latest_fit_analysis.covered_preferred_skills)
                            .join(", ")
                        : "None identified"}
                    </p>
                    <p>
                      <strong>Gaps:</strong>{" "}
                      {selectedJob.latest_fit_analysis.missing_required_skills.concat(
                        selectedJob.latest_fit_analysis.missing_preferred_skills,
                      ).length
                        ? selectedJob.latest_fit_analysis.missing_required_skills
                            .concat(selectedJob.latest_fit_analysis.missing_preferred_skills)
                            .join(", ")
                        : "No explicit gaps"}
                    </p>
                    <p>
                      <strong>Rationale:</strong> {selectedJob.latest_fit_analysis.rationale}
                    </p>
                    {selectedJob.latest_fit_analysis.rationale_citations?.length ? (
                      <div>
                        <strong>Evidence references:</strong>
                        <ul>
                          {selectedJob.latest_fit_analysis.rationale_citations.map((citation) => (
                            <li key={`${citation.source_key}-${citation.snippet_reference}`}>
                              [{citation.source_type}]{" "}
                              {citation.source_record_id ?? citation.source_key}
                              {citation.snippet_reference ? ` — ${citation.snippet_reference}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {selectedJob.latest_fit_analysis.unsupported_claims?.length ? (
                      <p>
                        <strong>Unsupported claim flags:</strong>{" "}
                        {selectedJob.latest_fit_analysis.unsupported_claims.join("; ")}
                      </p>
                    ) : null}
                    <p>
                      <small>
                        Generated{" "}
                        {new Date(selectedJob.latest_fit_analysis.created_at).toLocaleString()} with{" "}
                        {selectedJob.latest_fit_analysis.provider}/
                        {selectedJob.latest_fit_analysis.model}
                      </small>
                    </p>
                  </div>
                ) : (
                  <p>No fit analysis generated yet.</p>
                )}
              </section>

              <section>
                <h4>Desirability score</h4>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    disabled={scoringDesirability}
                    onClick={() => handleScoreDesirability(false)}
                    type="button"
                  >
                    {scoringDesirability ? "Scoring..." : "Score Desirability"}
                  </button>
                  <button
                    disabled={scoringDesirability}
                    onClick={() => handleScoreDesirability(true)}
                    type="button"
                  >
                    Refresh Score
                  </button>
                </div>
                {selectedJob.latest_desirability_score ? (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p>
                      <strong>Total:</strong>{" "}
                      {selectedJob.latest_desirability_score.total_score.toFixed(2)} / 10
                    </p>
                    <ul>
                      {selectedJob.latest_desirability_score.factor_breakdown.map((factor) => (
                        <li key={factor.factor_id}>
                          <strong>{factor.factor_name}</strong> — score {factor.score}/10, weight{" "}
                          {(factor.weight * 100).toFixed(1)}% — {factor.reasoning}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No desirability score generated yet.</p>
                )}
              </section>

              <section>
                <h4>Application Materials</h4>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <button
                    disabled={generatingCoverLetter}
                    onClick={handleGenerateCoverLetter}
                    type="button"
                  >
                    {generatingCoverLetter ? "Generating cover letter..." : "Generate Cover Letter"}
                  </button>

                  <label
                    htmlFor="application-questions"
                    style={{ display: "grid", gap: "0.25rem" }}
                  >
                    Application questions (one per line)
                  </label>
                  <textarea
                    id="application-questions"
                    onChange={(event) => setQaQuestionsInput(event.target.value)}
                    placeholder="Why are you interested in this role?"
                    rows={4}
                    value={qaQuestionsInput}
                  />
                  <button disabled={generatingQA} onClick={handleGenerateQA} type="button">
                    {generatingQA ? "Generating Q&A..." : "Generate Q&A Drafts"}
                  </button>
                </div>

                {loadingMaterials ? <p>Loading application materials...</p> : null}
                {materialsError ? <p role="alert">{materialsError}</p> : null}

                {applicationMaterials.length ? (
                  <>
                    <label htmlFor="material-version" style={{ display: "grid", gap: "0.25rem" }}>
                      Saved drafts
                    </label>
                    <select
                      id="material-version"
                      onChange={(event) => setSelectedMaterialId(Number(event.target.value))}
                      value={selectedMaterialId ?? ""}
                    >
                      {applicationMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.artifact_type === "cover_letter"
                            ? "Cover letter"
                            : "Application Q&A"}{" "}
                          v{material.version} ({new Date(material.created_at).toLocaleString()})
                        </option>
                      ))}
                    </select>

                    {selectedMaterial ? (
                      <article
                        style={{
                          border: "1px solid #ddd",
                          marginTop: "0.5rem",
                          padding: "0.75rem",
                        }}
                      >
                        <p>
                          <strong>Type:</strong>{" "}
                          {selectedMaterial.artifact_type === "cover_letter"
                            ? "Cover letter"
                            : "Application Q&A"}
                        </p>
                        <p>
                          <strong>Version:</strong> {selectedMaterial.version}
                        </p>
                        <p>
                          <strong>Generated with:</strong> {selectedMaterial.provider}/
                          {selectedMaterial.model}
                        </p>
                        <pre
                          style={{
                            background: "#fafafa",
                            borderRadius: 4,
                            overflowX: "auto",
                            padding: "0.75rem",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {selectedMaterial.content}
                        </pre>
                        {renderTraceability(
                          selectedMaterial.section_traceability,
                          selectedMaterial.unsupported_claims,
                        )}
                      </article>
                    ) : null}
                  </>
                ) : (
                  <p>No application materials generated yet.</p>
                )}
              </section>

              <section>
                <h4>Interview Prep</h4>
                <button
                  disabled={generatingInterviewPrep}
                  onClick={handleGenerateInterviewPrep}
                  type="button"
                >
                  {generatingInterviewPrep
                    ? "Generating prep pack..."
                    : "Generate Interview Prep Pack"}
                </button>

                {interviewPrepLoading ? <p>Loading interview prep packs...</p> : null}
                {interviewPrepError ? <p role="alert">{interviewPrepError}</p> : null}

                {interviewPrepPacks.length ? (
                  <>
                    <label
                      htmlFor="interview-prep-version"
                      style={{ display: "grid", gap: "0.25rem" }}
                    >
                      Saved prep versions
                    </label>
                    <select
                      id="interview-prep-version"
                      onChange={(event) => setSelectedInterviewPrepId(Number(event.target.value))}
                      value={selectedInterviewPrepId ?? ""}
                    >
                      {interviewPrepPacks.map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          Interview prep v{pack.version} (
                          {new Date(pack.created_at).toLocaleString()})
                        </option>
                      ))}
                    </select>

                    {selectedInterviewPrepPack ? (
                      <div
                        style={{
                          border: "1px solid #ddd",
                          marginTop: "0.5rem",
                          padding: "0.75rem",
                        }}
                      >
                        <p>
                          <strong>Generated with:</strong> {selectedInterviewPrepPack.provider}/
                          {selectedInterviewPrepPack.model}
                        </p>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          <label style={{ display: "grid", gap: "0.25rem" }}>
                            Likely questions (one per line)
                            <textarea
                              onChange={(event) => setEditingLikelyQuestions(event.target.value)}
                              rows={6}
                              value={editingLikelyQuestions}
                            />
                          </label>
                          <button
                            disabled={regeneratingSection === "likely_questions"}
                            onClick={() => handleRegenerateInterviewPrepSection("likely_questions")}
                            type="button"
                          >
                            {regeneratingSection === "likely_questions"
                              ? "Regenerating questions..."
                              : "Regenerate Questions"}
                          </button>

                          <label style={{ display: "grid", gap: "0.25rem" }}>
                            Talking points (one per line)
                            <textarea
                              onChange={(event) => setEditingTalkingPoints(event.target.value)}
                              rows={6}
                              value={editingTalkingPoints}
                            />
                          </label>
                          <button
                            disabled={regeneratingSection === "talking_points"}
                            onClick={() => handleRegenerateInterviewPrepSection("talking_points")}
                            type="button"
                          >
                            {regeneratingSection === "talking_points"
                              ? "Regenerating talking points..."
                              : "Regenerate Talking Points"}
                          </button>

                          <label style={{ display: "grid", gap: "0.25rem" }}>
                            STAR story drafts (one per line)
                            <textarea
                              onChange={(event) => setEditingStarStories(event.target.value)}
                              rows={6}
                              value={editingStarStories}
                            />
                          </label>
                          <button
                            disabled={regeneratingSection === "star_stories"}
                            onClick={() => handleRegenerateInterviewPrepSection("star_stories")}
                            type="button"
                          >
                            {regeneratingSection === "star_stories"
                              ? "Regenerating STAR drafts..."
                              : "Regenerate STAR Drafts"}
                          </button>
                        </div>
                        {renderTraceability(
                          selectedInterviewPrepPack.section_traceability,
                          selectedInterviewPrepPack.unsupported_claims,
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          <button
                            disabled={savingInterviewPrep}
                            onClick={handleSaveInterviewPrepEdits}
                            type="button"
                          >
                            {savingInterviewPrep ? "Saving..." : "Save Interview Prep Edits"}
                          </button>
                          <button
                            onClick={() => handleCopyInterviewPrep(selectedInterviewPrepPack)}
                            type="button"
                          >
                            Copy Prep Pack
                          </button>
                          <button
                            onClick={() => handleExportInterviewPrep(selectedInterviewPrepPack)}
                            type="button"
                          >
                            Export Prep Pack
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p>No interview prep packs generated yet.</p>
                )}
              </section>

              <section>
                <h4>Resume Tuning</h4>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <button
                    disabled={syncingResumeProfile}
                    onClick={handleSyncResumeProfile}
                    type="button"
                  >
                    {syncingResumeProfile ? "Syncing profile..." : "Sync Resume Profile"}
                  </button>
                  <button
                    disabled={generatingResumeTuning}
                    onClick={handleGenerateResumeTuning}
                    type="button"
                  >
                    {generatingResumeTuning ? "Generating tuning..." : "Generate Resume Tuning"}
                  </button>
                </div>
                {resumeSyncNotice ? <p>{resumeSyncNotice}</p> : null}
                {resumeTuningLoading ? <p>Loading resume tuning suggestions...</p> : null}
                {resumeTuningError ? <p role="alert">{resumeTuningError}</p> : null}

                {resumeTuningSuggestions.length ? (
                  <>
                    <label
                      htmlFor="resume-tuning-version"
                      style={{ display: "grid", gap: "0.25rem" }}
                    >
                      Saved resume tuning versions
                    </label>
                    <select
                      id="resume-tuning-version"
                      onChange={(event) => setSelectedResumeTuningId(Number(event.target.value))}
                      value={selectedResumeTuningId ?? ""}
                    >
                      {resumeTuningSuggestions.map((suggestion) => (
                        <option key={suggestion.id} value={suggestion.id}>
                          Resume tuning v{suggestion.version} (
                          {new Date(suggestion.created_at).toLocaleString()})
                        </option>
                      ))}
                    </select>

                    {selectedResumeTuning ? (
                      <div
                        style={{
                          border: "1px solid #ddd",
                          marginTop: "0.5rem",
                          padding: "0.75rem",
                        }}
                      >
                        <p>
                          <strong>Generated with:</strong> {selectedResumeTuning.provider}/
                          {selectedResumeTuning.model}
                        </p>
                        {[
                          ["Keep Bullets", selectedResumeTuning.sections.keep_bullets],
                          [
                            "Remove / Deprioritize Bullets",
                            selectedResumeTuning.sections.remove_bullets,
                          ],
                          ["Emphasize Bullets", selectedResumeTuning.sections.emphasize_bullets],
                          ["Missing Keywords", selectedResumeTuning.sections.missing_keywords],
                          ["Summary Tweaks", selectedResumeTuning.sections.summary_tweaks],
                          [
                            "Confidence / Rationale Notes",
                            selectedResumeTuning.sections.confidence_notes,
                          ],
                        ].map(([title, items]) => (
                          <div key={title}>
                            <h5 style={{ marginBottom: "0.25rem" }}>{title}</h5>
                            <ul>
                              {(items as string[]).map((item) => (
                                <li key={`${title}-${item}`}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {renderTraceability(
                          selectedResumeTuning.section_traceability,
                          selectedResumeTuning.unsupported_claims,
                        )}
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => handleCopyResumeTuning(selectedResumeTuning)}
                            type="button"
                          >
                            Copy Tuning Suggestions
                          </button>
                          <button
                            onClick={() => handleExportResumeTuning(selectedResumeTuning)}
                            type="button"
                          >
                            Export Tuning Suggestions
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p>No resume tuning suggestions generated yet.</p>
                )}
              </section>

              <h4>Status history</h4>
              {selectedJob.status_history.length ? (
                <ul>
                  {selectedJob.status_history.map((entry, index) => (
                    <li key={`${entry.changed_at}-${entry.to_status}-${index}`}>
                      {entry.from_status ?? "none"} → {entry.to_status} (
                      {new Date(entry.changed_at).toLocaleString()})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No status changes yet.</p>
              )}
              <p>
                <a href={selectedJob.url} rel="noreferrer" target="_blank">
                  View original posting
                </a>
              </p>

              <h4>Required skills</h4>
              <ul>
                {selectedJob.skills.required.map((skill) => (
                  <li key={`required-${skill.id}`}>
                    <button
                      onClick={() => {
                        setSelectedRoleId(null);
                        setSelectedSkillId(skill.id);
                      }}
                      style={{ textAlign: "left" }}
                      type="button"
                    >
                      {skill.name}
                    </button>
                  </li>
                ))}
              </ul>

              <h4>Preferred skills</h4>
              <ul>
                {selectedJob.skills.preferred.map((skill) => (
                  <li key={`preferred-${skill.id}`}>
                    <button
                      onClick={() => {
                        setSelectedRoleId(null);
                        setSelectedSkillId(skill.id);
                      }}
                      style={{ textAlign: "left" }}
                      type="button"
                    >
                      {skill.name}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </Modal>
      ) : null}

      {showFactorSettings ? (
        <Modal
          onClose={() => {
            setShowFactorSettings(false);
            setFactorsError(null);
          }}
          title="Desirability Factor Settings"
        >
          {factorsLoading ? <p>Loading factors...</p> : null}
          {factorsError ? <p role="alert">{factorsError}</p> : null}

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {factors.map((factor, index) => (
              <li
                key={factor.id}
                style={{ border: "1px solid #ddd", marginBottom: "0.5rem", padding: "0.5rem" }}
              >
                <p>
                  <strong>{factor.name}</strong>
                </p>
                <label style={{ display: "grid", gap: "0.25rem" }}>
                  Prompt
                  <textarea
                    defaultValue={factor.prompt}
                    onBlur={(event) => {
                      if (event.target.value !== factor.prompt) {
                        handleUpdateFactor(factor.id, "prompt", event.target.value);
                      }
                    }}
                    rows={2}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.25rem" }}>
                  Weight
                  <input
                    defaultValue={factor.weight}
                    min={0}
                    onBlur={(event) =>
                      handleUpdateFactor(factor.id, "weight", Number(event.target.value))
                    }
                    step={0.01}
                    type="number"
                  />
                </label>
                <label>
                  <input
                    checked={factor.is_active}
                    onChange={(event) =>
                      handleUpdateFactor(factor.id, "is_active", event.target.checked)
                    }
                    type="checkbox"
                  />{" "}
                  Active
                </label>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveFactor(factor.id, -1)}
                    type="button"
                  >
                    Move up
                  </button>
                  <button
                    disabled={index === factors.length - 1}
                    onClick={() => handleMoveFactor(factor.id, 1)}
                    type="button"
                  >
                    Move down
                  </button>
                  <button onClick={() => handleDeleteFactor(factor.id)} type="button">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <h4>Add factor</h4>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            Name
            <input
              onChange={(event) => setNewFactorName(event.target.value)}
              value={newFactorName}
            />
          </label>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            Prompt
            <textarea
              onChange={(event) => setNewFactorPrompt(event.target.value)}
              rows={3}
              value={newFactorPrompt}
            />
          </label>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            Weight
            <input
              min={0}
              onChange={(event) => setNewFactorWeight(event.target.value)}
              step={0.01}
              type="number"
              value={newFactorWeight}
            />
          </label>
          <button onClick={handleAddFactor} type="button">
            Add factor
          </button>
        </Modal>
      ) : null}

      {showAISettings ? (
        <Modal
          onClose={() => {
            setShowAISettings(false);
            setAISettingsError(null);
            setHealthByFamily({});
          }}
          title="AI Settings"
        >
          {aiSettingsLoading ? <p>Loading AI settings...</p> : null}
          {aiSettingsError ? <p role="alert">{aiSettingsError}</p> : null}

          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {aiSettings.map((setting) => (
              <li
                key={setting.operation_family}
                style={{ border: "1px solid #ddd", marginBottom: "0.75rem", padding: "0.75rem" }}
              >
                <p style={{ marginTop: 0 }}>
                  <strong>{setting.operation_family}</strong>
                </p>
                <label style={{ display: "grid", gap: "0.25rem" }}>
                  Provider
                  <input
                    defaultValue={setting.provider}
                    onBlur={(event) => {
                      if (event.target.value !== setting.provider) {
                        handleUpdateAIConfig(setting.operation_family, {
                          provider: event.target.value,
                        });
                      }
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.25rem" }}>
                  Model
                  <input
                    defaultValue={setting.model}
                    onBlur={(event) => {
                      if (event.target.value !== setting.model) {
                        handleUpdateAIConfig(setting.operation_family, {
                          model: event.target.value,
                        });
                      }
                    }}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.25rem" }}>
                  API key env
                  <input
                    defaultValue={setting.api_key_env}
                    onBlur={(event) => {
                      if (event.target.value !== setting.api_key_env) {
                        handleUpdateAIConfig(setting.operation_family, {
                          api_key_env: event.target.value,
                        });
                      }
                    }}
                  />
                </label>
                <p>Runtime token: {setting.token_masked ?? "Not set"}</p>
                <label style={{ display: "grid", gap: "0.25rem" }}>
                  Update runtime token
                  <input
                    onChange={(event) =>
                      setTokenInputs((previous) => ({
                        ...previous,
                        [setting.operation_family]: event.target.value,
                      }))
                    }
                    placeholder="Paste token"
                    type="password"
                    value={tokenInputs[setting.operation_family] ?? ""}
                  />
                </label>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  <button onClick={() => handleUpdateToken(setting.operation_family)} type="button">
                    Save Token
                  </button>
                  <button onClick={() => handleClearToken(setting.operation_family)} type="button">
                    Clear Token
                  </button>
                  <button onClick={() => handleHealthcheck(setting.operation_family)} type="button">
                    Test Config
                  </button>
                </div>
                {healthByFamily[setting.operation_family] ? (
                  <p>{healthByFamily[setting.operation_family]}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Modal>
      ) : null}

      {showPipeline ? (
        <Modal
          onClose={() => {
            setShowPipeline(false);
            setPipelineError(null);
          }}
          title="Application Pipeline"
        >
          <p>
            <strong>Needs follow-up:</strong> {pipelineCounters.needs_follow_up} •{" "}
            <strong>Overdue:</strong> {pipelineCounters.overdue_actions} •{" "}
            <strong>Deadlines (7d):</strong> {pipelineCounters.upcoming_deadlines}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <label>
              <input
                checked={pipelineOverdueOnly}
                onChange={(event) => setPipelineOverdueOnly(event.target.checked)}
                type="checkbox"
              />{" "}
              Overdue actions
            </label>
            <label>
              <input
                checked={pipelineWeekDeadlines}
                onChange={(event) => setPipelineWeekDeadlines(event.target.checked)}
                type="checkbox"
              />{" "}
              This-week deadlines
            </label>
            <label>
              <input
                checked={pipelineRecentlyUpdated}
                onChange={(event) => setPipelineRecentlyUpdated(event.target.checked)}
                type="checkbox"
              />{" "}
              Recently updated
            </label>
            <label>
              Stage
              <select
                onChange={(event) => setPipelineStageFilter(event.target.value as StageFilter)}
                value={pipelineStageFilter}
              >
                <option value="all">All</option>
                <option value="applied">Applied</option>
                <option value="recruiter_screen">Recruiter Screen</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="technical">Technical</option>
                <option value="onsite">Onsite</option>
                <option value="offer">Offer</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          {pipelineLoading ? <p>Loading pipeline...</p> : null}
          {pipelineError ? <p role="alert">{pipelineError}</p> : null}
          {!pipelineLoading && !pipelineError ? (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {pipelineItems
                .filter(
                  (item) =>
                    pipelineStageFilter === "all" || item.interview_stage === pipelineStageFilter,
                )
                .map((item) => (
                  <li
                    key={item.role_id}
                    style={{ border: "1px solid #ddd", marginBottom: "0.5rem", padding: "0.5rem" }}
                  >
                    <button
                      onClick={() => {
                        setShowPipeline(false);
                        setSelectedRoleId(item.role_id);
                      }}
                      style={{ textAlign: "left", width: "100%" }}
                      type="button"
                    >
                      <strong>{item.title}</strong> — {item.company}
                      <br />
                      <small>
                        {interviewStageLabel(item.interview_stage)} • next action:{" "}
                        {item.next_action_at
                          ? new Date(item.next_action_at).toLocaleString()
                          : "None"}{" "}
                        • deadline:{" "}
                        {item.deadline_at ? new Date(item.deadline_at).toLocaleString() : "None"}
                        {item.needs_attention ? ` • ${item.attention_reasons.join(", ")}` : ""}
                      </small>
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}
        </Modal>
      ) : null}

      {selectedSkillId ? (
        <Modal
          onClose={() => {
            setSelectedSkillId(null);
            setSelectedSkill(null);
            setSkillDetailError(null);
          }}
          title="Skill Detail"
        >
          {loadingSkillDetail ? <p>Loading skill details...</p> : null}
          {skillDetailError ? <p role="alert">{skillDetailError}</p> : null}

          {selectedSkill ? (
            <article>
              <h3>{selectedSkill.name}</h3>
              <p>Category: {selectedSkill.category ?? "Uncategorized"}</p>
              <p>Used in {selectedSkill.usage_count} captured jobs.</p>

              <h4>Referenced jobs</h4>
              <ul>
                {selectedSkill.jobs.map((job) => (
                  <li key={job.id}>
                    <button
                      onClick={() => {
                        setSelectedSkillId(null);
                        setSelectedRoleId(job.id);
                      }}
                      style={{ textAlign: "left" }}
                      type="button"
                    >
                      {job.title} — {job.company}
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </Modal>
      ) : null}
    </section>
  );
}
