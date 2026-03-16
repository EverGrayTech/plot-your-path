"use client";

import { useEffect, useState } from "react";

import type {
  ApplicationMaterial,
  InterviewPrepPack,
  InterviewPrepSectionKey,
  InterviewStage,
  JobDetail,
  OutcomeEvent,
  OutcomeEventType,
  ResumeTuningSuggestion,
  RoleStatus,
  SkillDetail,
} from "./api";
import {
  analyzeJobFit,
  createOutcomeEvent,
  generateCoverLetter,
  generateInterviewPrepPack,
  generateQuestionAnswers,
  generateResumeTuning,
  getJob,
  getSkill,
  listApplicationMaterials,
  listInterviewPrepPacks,
  listOutcomeEvents,
  listResumeTuning,
  refreshDesirabilityScore,
  regenerateInterviewPrepSection,
  scoreJobDesirability,
  syncResumeProfile,
  updateInterviewPrepPack,
  updateInterviewStage,
  updateJobStatus,
  updateNextAction,
  upsertApplicationOps,
} from "./api";
import {
  exportMarkdownFile,
  interviewPrepToMarkdown,
  resumeTuningToMarkdown,
  toLocalInputValue,
} from "./jobsPageUtils";

interface UseJobDetailStateOptions {
  loadJobs: () => Promise<void>;
}

export function useJobDetailState({ loadJobs }: UseJobDetailStateOptions) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [analyzingFit, setAnalyzingFit] = useState(false);
  const [fitError, setFitError] = useState<string | null>(null);
  const [desirabilityError, setDesirabilityError] = useState<string | null>(null);
  const [scoringDesirability, setScoringDesirability] = useState(false);

  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null);
  const [loadingSkillDetail, setLoadingSkillDetail] = useState(false);
  const [skillDetailError, setSkillDetailError] = useState<string | null>(null);

  const [applicationMaterials, setApplicationMaterials] = useState<ApplicationMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatingQA, setGeneratingQA] = useState(false);
  const [qaQuestionsInput, setQaQuestionsInput] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  const [interviewPrepPacks, setInterviewPrepPacks] = useState<InterviewPrepPack[]>([]);
  const [interviewPrepLoading, setInterviewPrepLoading] = useState(false);
  const [interviewPrepError, setInterviewPrepError] = useState<string | null>(null);
  const [selectedInterviewPrepId, setSelectedInterviewPrepId] = useState<number | null>(null);
  const [editingLikelyQuestions, setEditingLikelyQuestions] = useState("");
  const [editingTalkingPoints, setEditingTalkingPoints] = useState("");
  const [editingStarStories, setEditingStarStories] = useState("");
  const [generatingInterviewPrep, setGeneratingInterviewPrep] = useState(false);
  const [savingInterviewPrep, setSavingInterviewPrep] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<InterviewPrepSectionKey | null>(
    null,
  );

  const [resumeTuningSuggestions, setResumeTuningSuggestions] = useState<ResumeTuningSuggestion[]>(
    [],
  );
  const [resumeTuningLoading, setResumeTuningLoading] = useState(false);
  const [resumeTuningError, setResumeTuningError] = useState<string | null>(null);
  const [generatingResumeTuning, setGeneratingResumeTuning] = useState(false);
  const [syncingResumeProfile, setSyncingResumeProfile] = useState(false);
  const [resumeSyncNotice, setResumeSyncNotice] = useState<string | null>(null);
  const [selectedResumeTuningId, setSelectedResumeTuningId] = useState<number | null>(null);

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

  const [outcomeEvents, setOutcomeEvents] = useState<OutcomeEvent[]>([]);
  const [outcomesLoading, setOutcomesLoading] = useState(false);
  const [outcomesError, setOutcomesError] = useState<string | null>(null);
  const [newOutcomeType, setNewOutcomeType] = useState<OutcomeEventType>("screen");
  const [newOutcomeOccurredAt, setNewOutcomeOccurredAt] = useState(
    toLocalInputValue(new Date().toISOString()),
  );
  const [newOutcomeNotes, setNewOutcomeNotes] = useState("");
  const [savingOutcome, setSavingOutcome] = useState(false);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const fetchJobDetail = async () => {
      setLoadingDetail(true);
      setSelectedJob(null);
      setDetailError(null);
      try {
        setSelectedJob(await getJob(selectedRoleId));
      } catch (error) {
        setDetailError(error instanceof Error ? error.message : "Failed to load job detail.");
      } finally {
        setLoadingDetail(false);
      }
    };

    void fetchJobDetail();
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
    setNewOutcomeOccurredAt(toLocalInputValue(new Date().toISOString()));
  }, [selectedJob]);

  useEffect(() => {
    if (!selectedRoleId) {
      setOutcomeEvents([]);
      setOutcomesError(null);
      return;
    }

    const fetchOutcomes = async () => {
      setOutcomesLoading(true);
      setOutcomesError(null);
      try {
        setOutcomeEvents(await listOutcomeEvents(selectedRoleId));
      } catch (error) {
        setOutcomesError(error instanceof Error ? error.message : "Failed to load outcome events.");
      } finally {
        setOutcomesLoading(false);
      }
    };

    void fetchOutcomes();
  }, [selectedRoleId]);

  useEffect(() => {
    if (!selectedSkillId) {
      return;
    }

    const fetchSkillDetail = async () => {
      setLoadingSkillDetail(true);
      setSelectedSkill(null);
      setSkillDetailError(null);
      try {
        setSelectedSkill(await getSkill(selectedSkillId));
      } catch (error) {
        setSkillDetailError(
          error instanceof Error ? error.message : "Failed to load skill detail.",
        );
      } finally {
        setLoadingSkillDetail(false);
      }
    };

    void fetchSkillDetail();
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
        setMaterialsError(
          error instanceof Error ? error.message : "Failed to load application materials.",
        );
      } finally {
        setLoadingMaterials(false);
      }
    };

    void fetchMaterials();
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
        setInterviewPrepError(
          error instanceof Error ? error.message : "Failed to load interview prep packs.",
        );
      } finally {
        setInterviewPrepLoading(false);
      }
    };

    void fetchInterviewPrepPacks();
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
        setResumeTuningError(
          error instanceof Error ? error.message : "Failed to load resume tuning suggestions.",
        );
      } finally {
        setResumeTuningLoading(false);
      }
    };

    void fetchResumeTuning();
  }, [selectedRoleId]);

  const selectedInterviewPrepPack =
    interviewPrepPacks.find((item) => item.id === selectedInterviewPrepId) ?? null;

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

  const openJobDetail = (roleId: number) => {
    setSelectedSkillId(null);
    setSelectedSkill(null);
    setSkillDetailError(null);
    setSelectedRoleId(roleId);
  };

  const openSkillDetail = (skillId: number) => {
    setSelectedRoleId(null);
    setSelectedJob(null);
    setDetailError(null);
    setSelectedSkillId(skillId);
  };

  const closeJobDetail = () => {
    setSelectedRoleId(null);
    setSelectedJob(null);
    setDetailError(null);
    setFitError(null);
    setStatusError(null);
    setDesirabilityError(null);
    setOpsError(null);
  };

  const closeSkillDetail = () => {
    setSelectedSkillId(null);
    setSelectedSkill(null);
    setSkillDetailError(null);
  };

  const refreshSelectedJob = async (roleId: number) => {
    setSelectedJob(await getJob(roleId));
  };

  const handleStatusChange = async (nextStatus: RoleStatus) => {
    if (!selectedJob) {
      return;
    }

    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await updateJobStatus(selectedJob.id, nextStatus);
      await loadJobs();
      await refreshSelectedJob(selectedJob.id);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAnalyzeFit = async () => {
    if (!selectedJob) {
      return;
    }

    setAnalyzingFit(true);
    setFitError(null);
    try {
      const response = await analyzeJobFit(selectedJob.id);
      setSelectedJob((previous) =>
        previous
          ? {
              ...previous,
              latest_fit_analysis: response,
            }
          : previous,
      );
      await loadJobs();
    } catch (error) {
      setFitError(
        error instanceof Error
          ? error.message
          : "Failed to analyze fit. Confirm your local AI provider settings and resume/job inputs.",
      );
    } finally {
      setAnalyzingFit(false);
    }
  };

  const handleSaveOps = async () => {
    if (!selectedJob) {
      return;
    }

    setOpsSaving(true);
    setOpsError(null);
    try {
      await upsertApplicationOps(selectedJob.id, {
        applied_at: opsAppliedAt || null,
        deadline_at: opsDeadlineAt || null,
        next_action_at: opsNextActionAt || null,
        notes: opsNotes || null,
        recruiter_contact: opsRecruiterContact || null,
        source: opsSource || null,
      });
      await refreshSelectedJob(selectedJob.id);
      await loadJobs();
    } catch (error) {
      setOpsError(error instanceof Error ? error.message : "Failed to save application ops.");
    } finally {
      setOpsSaving(false);
    }
  };

  const handleAddStage = async () => {
    if (!selectedJob || !stageOccurredAt) {
      return;
    }

    setStageSaving(true);
    setOpsError(null);
    try {
      await updateInterviewStage(selectedJob.id, {
        occurred_at: new Date(stageOccurredAt).toISOString(),
        notes: stageNotes || null,
        stage: newStage,
      });
      setStageNotes("");
      await refreshSelectedJob(selectedJob.id);
      await loadJobs();
    } catch (error) {
      setOpsError(error instanceof Error ? error.message : "Failed to add interview stage.");
    } finally {
      setStageSaving(false);
    }
  };

  const handleSetNextAction = async (daysFromNow: number) => {
    if (!selectedJob) {
      return;
    }

    const next = new Date();
    next.setDate(next.getDate() + daysFromNow);

    try {
      const updated = await updateNextAction(selectedJob.id, next.toISOString());
      setOpsNextActionAt(toLocalInputValue(updated.next_action_at));
      await refreshSelectedJob(selectedJob.id);
      await loadJobs();
    } catch (error) {
      setOpsError(error instanceof Error ? error.message : "Failed to update next action.");
    }
  };

  const handleAddOutcomeEvent = async () => {
    if (!selectedJob || !newOutcomeOccurredAt) {
      return;
    }

    setSavingOutcome(true);
    setOutcomesError(null);
    try {
      await createOutcomeEvent(selectedJob.id, {
        application_material_id: selectedMaterialId,
        desirability_score_id: selectedJob.latest_desirability_score?.id ?? null,
        event_type: newOutcomeType,
        fit_analysis_id: selectedJob.latest_fit_analysis?.id ?? null,
        model: selectedJob.latest_fit_analysis?.model ?? null,
        model_family: selectedJob.latest_fit_analysis?.provider ?? null,
        notes: newOutcomeNotes || null,
        occurred_at: new Date(newOutcomeOccurredAt).toISOString(),
        prompt_version: selectedJob.latest_fit_analysis?.version ?? null,
      });
      setOutcomeEvents(await listOutcomeEvents(selectedJob.id));
      setNewOutcomeNotes("");
    } catch (error) {
      setOutcomesError(error instanceof Error ? error.message : "Failed to log outcome event.");
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
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
      setMaterialsError(
        error instanceof Error ? error.message : "Failed to generate cover letter.",
      );
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleGenerateQA = async () => {
    if (!selectedJob) {
      return;
    }

    const questions = qaQuestionsInput
      .split("\n")
      .map((question) => question.trim())
      .filter(Boolean);

    if (questions.length === 0) {
      setMaterialsError(
        "Add at least one application question before generating Q&A drafts. AI assistance works best with explicit pasted prompts.",
      );
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
      setMaterialsError(
        error instanceof Error
          ? error.message
          : "Failed to generate application Q&A. Confirm local AI settings and try again.",
      );
    } finally {
      setGeneratingQA(false);
    }
  };

  const handleGenerateInterviewPrep = async () => {
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
      setInterviewPrepError(
        error instanceof Error
          ? error.message
          : "Failed to generate cover letter. Confirm local AI settings and the role inputs.",
      );
    } finally {
      setGeneratingInterviewPrep(false);
    }
  };

  const handleRegenerateInterviewPrepSection = async (section: InterviewPrepSectionKey) => {
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
      setInterviewPrepError(
        error instanceof Error ? error.message : "Failed to regenerate interview prep section.",
      );
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleSaveInterviewPrepEdits = async () => {
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
      star_stories: toItems(editingStarStories),
      talking_points: toItems(editingTalkingPoints),
    };

    if (
      !sections.likely_questions.length ||
      !sections.star_stories.length ||
      !sections.talking_points.length
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
      setInterviewPrepError(
        error instanceof Error ? error.message : "Failed to save interview prep edits.",
      );
    } finally {
      setSavingInterviewPrep(false);
    }
  };

  const handleCopyInterviewPrep = async (pack: InterviewPrepPack) => {
    try {
      await navigator.clipboard.writeText(interviewPrepToMarkdown(pack));
    } catch {
      setInterviewPrepError("Unable to copy prep pack to clipboard in this browser.");
    }
  };

  const handleExportInterviewPrep = (pack: InterviewPrepPack) => {
    exportMarkdownFile(`interview-prep-pack-v${pack.version}.md`, interviewPrepToMarkdown(pack));
  };

  const handleSyncResumeProfile = async () => {
    setSyncingResumeProfile(true);
    setResumeTuningError(null);
    setResumeSyncNotice(null);
    try {
      const result = await syncResumeProfile();
      setResumeSyncNotice(
        `Synced ${result.ingested_count} resume section(s) from ${result.source_used}.`,
      );
    } catch (error) {
      setResumeTuningError(
        error instanceof Error ? error.message : "Failed to sync resume profile.",
      );
    } finally {
      setSyncingResumeProfile(false);
    }
  };

  const handleGenerateResumeTuning = async () => {
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
      setResumeTuningError(
        error instanceof Error ? error.message : "Failed to generate resume tuning suggestions.",
      );
    } finally {
      setGeneratingResumeTuning(false);
    }
  };

  const handleCopyResumeTuning = async (suggestion: ResumeTuningSuggestion) => {
    try {
      await navigator.clipboard.writeText(resumeTuningToMarkdown(suggestion));
    } catch {
      setResumeTuningError("Unable to copy resume tuning suggestions in this browser.");
    }
  };

  const handleExportResumeTuning = (suggestion: ResumeTuningSuggestion) => {
    exportMarkdownFile(
      `resume-tuning-v${suggestion.version}.md`,
      resumeTuningToMarkdown(suggestion),
    );
  };

  const handleScoreDesirability = async (forceRefresh: boolean) => {
    if (!selectedJob) {
      return;
    }

    setScoringDesirability(true);
    setDesirabilityError(null);
    try {
      const score = forceRefresh
        ? await refreshDesirabilityScore(selectedJob.id)
        : await scoreJobDesirability(selectedJob.id);
      setSelectedJob((previous) =>
        previous
          ? {
              ...previous,
              latest_desirability_score: score,
            }
          : previous,
      );
      await loadJobs();
    } catch (error) {
      setDesirabilityError(
        error instanceof Error
          ? error.message
          : "Failed to score desirability. Confirm local AI settings and try again.",
      );
    } finally {
      setScoringDesirability(false);
    }
  };

  return {
    analyzingFit,
    applicationMaterials,
    closeJobDetail,
    closeSkillDetail,
    detailError,
    desirabilityError,
    editingLikelyQuestions,
    editingStarStories,
    editingTalkingPoints,
    fitError,
    generatingCoverLetter,
    generatingInterviewPrep,
    generatingQA,
    generatingResumeTuning,
    handleAddOutcomeEvent,
    handleAddStage,
    handleAnalyzeFit,
    handleCopyInterviewPrep,
    handleCopyResumeTuning,
    handleExportInterviewPrep,
    handleExportResumeTuning,
    handleGenerateCoverLetter,
    handleGenerateInterviewPrep,
    handleGenerateQA,
    handleGenerateResumeTuning,
    handleRegenerateInterviewPrepSection,
    handleSaveInterviewPrepEdits,
    handleSaveOps,
    handleScoreDesirability,
    handleSetNextAction,
    handleStatusChange,
    handleSyncResumeProfile,
    interviewPrepError,
    interviewPrepLoading,
    interviewPrepPacks,
    loadingDetail,
    loadingMaterials,
    loadingSkillDetail,
    materialsError,
    newOutcomeNotes,
    newOutcomeOccurredAt,
    newOutcomeType,
    newStage,
    openJobDetail,
    openSkillDetail,
    opsAppliedAt,
    opsDeadlineAt,
    opsError,
    opsNextActionAt,
    opsNotes,
    opsRecruiterContact,
    opsSaving,
    opsSource,
    outcomeEvents,
    outcomesError,
    outcomesLoading,
    qaQuestionsInput,
    regeneratingSection,
    resumeSyncNotice,
    resumeTuningError,
    resumeTuningLoading,
    resumeTuningSuggestions,
    savingInterviewPrep,
    savingOutcome,
    scoringDesirability,
    selectedInterviewPrepId,
    selectedJob,
    selectedMaterialId,
    selectedResumeTuningId,
    selectedRoleId,
    selectedSkill,
    selectedSkillId,
    setEditingLikelyQuestions,
    setEditingStarStories,
    setEditingTalkingPoints,
    setNewOutcomeNotes,
    setNewOutcomeOccurredAt,
    setNewOutcomeType,
    setNewStage,
    setOpsAppliedAt,
    setOpsDeadlineAt,
    setOpsNextActionAt,
    setOpsNotes,
    setOpsRecruiterContact,
    setOpsSource,
    setQaQuestionsInput,
    setSelectedInterviewPrepId,
    setSelectedMaterialId,
    setSelectedResumeTuningId,
    setStageNotes,
    setStageOccurredAt,
    skillDetailError,
    stageNotes,
    stageOccurredAt,
    stageSaving,
    statusError,
    syncingResumeProfile,
    updatingStatus,
  };
}
