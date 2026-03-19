"use client";

import { useEffect, useState } from "react";

import type {
  ApplicationMaterial,
  InterviewPrepPack,
  InterviewPrepSectionKey,
  InterviewStage,
  OutcomeEvent,
  OutcomeEventType,
  ResumeTuningSuggestion,
  RoleDetail,
  RoleStatus,
  SkillDetail,
} from "./dataModels";
import {
  exportMarkdownFile,
  interviewPrepToMarkdown,
  resumeTuningToMarkdown,
  toLocalInputValue,
} from "./rolesPageUtils";
import { getFrontendServices } from "./services";

interface UseRoleDetailStateOptions {
  loadRoles: () => Promise<void>;
}

export function useRoleDetailState({ loadRoles }: UseRoleDetailStateOptions) {
  const services = getFrontendServices();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null);
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

    const fetchRoleDetail = async () => {
      setLoadingDetail(true);
      setSelectedRole(null);
      setDetailError(null);
      try {
        setSelectedRole(await services.roles.getRole(selectedRoleId));
      } catch (error) {
        setDetailError(error instanceof Error ? error.message : "Failed to load role detail.");
      } finally {
        setLoadingDetail(false);
      }
    };

    void fetchRoleDetail();
  }, [selectedRoleId, services]);

  useEffect(() => {
    if (!selectedRole) {
      return;
    }

    const timeline = selectedRole.interview_stage_timeline ?? [];
    setOpsAppliedAt(toLocalInputValue(selectedRole.application_ops?.applied_at ?? null));
    setOpsDeadlineAt(toLocalInputValue(selectedRole.application_ops?.deadline_at ?? null));
    setOpsSource(selectedRole.application_ops?.source ?? "");
    setOpsRecruiterContact(selectedRole.application_ops?.recruiter_contact ?? "");
    setOpsNotes(selectedRole.application_ops?.notes ?? "");
    setOpsNextActionAt(toLocalInputValue(selectedRole.application_ops?.next_action_at ?? null));
    setNewStage(timeline.at(-1)?.stage ?? "applied");
    setStageOccurredAt(toLocalInputValue(new Date().toISOString()));
    setNewOutcomeOccurredAt(toLocalInputValue(new Date().toISOString()));
  }, [selectedRole]);

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
        setOutcomeEvents(await services.workflows.listOutcomeEvents(selectedRoleId));
      } catch (error) {
        setOutcomesError(error instanceof Error ? error.message : "Failed to load outcome events.");
      } finally {
        setOutcomesLoading(false);
      }
    };

    void fetchOutcomes();
  }, [selectedRoleId, services]);

  useEffect(() => {
    if (!selectedSkillId) {
      return;
    }

    const fetchSkillDetail = async () => {
      setLoadingSkillDetail(true);
      setSelectedSkill(null);
      setSkillDetailError(null);
      try {
        setSelectedSkill(await services.skills.getSkill(selectedSkillId));
      } catch (error) {
        setSkillDetailError(
          error instanceof Error ? error.message : "Failed to load skill detail.",
        );
      } finally {
        setLoadingSkillDetail(false);
      }
    };

    void fetchSkillDetail();
  }, [selectedSkillId, services]);

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
        const response = await services.aiGeneration.listApplicationMaterials(selectedRoleId);
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
  }, [selectedRoleId, services]);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const fetchInterviewPrepPacks = async () => {
      setInterviewPrepLoading(true);
      setInterviewPrepError(null);
      try {
        const response = await services.aiGeneration.listInterviewPrepPacks(selectedRoleId);
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
  }, [selectedRoleId, services]);

  useEffect(() => {
    if (!selectedRoleId) {
      return;
    }

    const fetchResumeTuning = async () => {
      setResumeTuningLoading(true);
      setResumeTuningError(null);
      try {
        const response = await services.aiGeneration.listResumeTuning(selectedRoleId);
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
  }, [selectedRoleId, services]);

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

  const openRoleDetail = (roleId: number) => {
    setSelectedSkillId(null);
    setSelectedSkill(null);
    setSkillDetailError(null);
    setSelectedRoleId(roleId);
  };

  const openSkillDetail = (skillId: number) => {
    setSelectedRoleId(null);
    setSelectedRole(null);
    setDetailError(null);
    setSelectedSkillId(skillId);
  };

  const closeRoleDetail = () => {
    setSelectedRoleId(null);
    setSelectedRole(null);
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

  const refreshSelectedRole = async (roleId: number) => {
    setSelectedRole(await services.roles.getRole(roleId));
  };

  const handleStatusChange = async (nextStatus: RoleStatus) => {
    if (!selectedRole) {
      return;
    }

    setUpdatingStatus(true);
    setStatusError(null);
    try {
      await services.roles.updateRoleStatus(selectedRole.id, nextStatus);
      await loadRoles();
      await refreshSelectedRole(selectedRole.id);
    } catch (error) {
      setStatusError(error instanceof Error ? error.message : "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAnalyzeFit = async () => {
    if (!selectedRole) {
      return;
    }

    setAnalyzingFit(true);
    setFitError(null);
    try {
      const response = await services.aiGeneration.analyzeRoleFit(selectedRole.id);
      setSelectedRole((previous) =>
        previous
          ? {
              ...previous,
              latest_fit_analysis: response,
            }
          : previous,
      );
      await loadRoles();
    } catch (error) {
      setFitError(
        error instanceof Error
          ? error.message
          : "Failed to analyze fit. Confirm your local AI provider settings and resume/role inputs.",
      );
    } finally {
      setAnalyzingFit(false);
    }
  };

  const handleSaveOps = async () => {
    if (!selectedRole) {
      return;
    }

    setOpsSaving(true);
    setOpsError(null);
    try {
      await services.workflows.upsertApplicationOps(selectedRole.id, {
        applied_at: opsAppliedAt || null,
        deadline_at: opsDeadlineAt || null,
        next_action_at: opsNextActionAt || null,
        notes: opsNotes || null,
        recruiter_contact: opsRecruiterContact || null,
        source: opsSource || null,
      });
      await refreshSelectedRole(selectedRole.id);
      await loadRoles();
    } catch (error) {
      setOpsError(error instanceof Error ? error.message : "Failed to save application ops.");
    } finally {
      setOpsSaving(false);
    }
  };

  const handleAddStage = async () => {
    if (!selectedRole || !stageOccurredAt) {
      return;
    }

    setStageSaving(true);
    setOpsError(null);
    try {
      await services.workflows.updateInterviewStage(selectedRole.id, {
        occurred_at: new Date(stageOccurredAt).toISOString(),
        notes: stageNotes || null,
        stage: newStage,
      });
      setStageNotes("");
      await refreshSelectedRole(selectedRole.id);
      await loadRoles();
    } catch (error) {
      setOpsError(error instanceof Error ? error.message : "Failed to add interview stage.");
    } finally {
      setStageSaving(false);
    }
  };

  const handleSetNextAction = async (daysFromNow: number) => {
    if (!selectedRole) {
      return;
    }

    const next = new Date();
    next.setDate(next.getDate() + daysFromNow);

    try {
      const updated = await services.workflows.updateNextAction(
        selectedRole.id,
        next.toISOString(),
      );
      setOpsNextActionAt(toLocalInputValue(updated.next_action_at));
      await refreshSelectedRole(selectedRole.id);
      await loadRoles();
    } catch (error) {
      setOpsError(error instanceof Error ? error.message : "Failed to update next action.");
    }
  };

  const handleAddOutcomeEvent = async () => {
    if (!selectedRole || !newOutcomeOccurredAt) {
      return;
    }

    setSavingOutcome(true);
    setOutcomesError(null);
    try {
      await services.workflows.createOutcomeEvent(selectedRole.id, {
        application_material_id: selectedMaterialId,
        desirability_score_id: selectedRole.latest_desirability_score?.id ?? null,
        event_type: newOutcomeType,
        fit_analysis_id: selectedRole.latest_fit_analysis?.id ?? null,
        model: selectedRole.latest_fit_analysis?.model ?? null,
        model_family: selectedRole.latest_fit_analysis?.provider ?? null,
        notes: newOutcomeNotes || null,
        occurred_at: new Date(newOutcomeOccurredAt).toISOString(),
        prompt_version: selectedRole.latest_fit_analysis?.version ?? null,
      });
      setOutcomeEvents(await services.workflows.listOutcomeEvents(selectedRole.id));
      setNewOutcomeNotes("");
    } catch (error) {
      setOutcomesError(error instanceof Error ? error.message : "Failed to log outcome event.");
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedRole) {
      return;
    }

    setGeneratingCoverLetter(true);
    setMaterialsError(null);
    try {
      const created = await services.aiGeneration.generateCoverLetter(selectedRole.id);
      const refreshed = await services.aiGeneration.listApplicationMaterials(selectedRole.id);
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
    if (!selectedRole) {
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
      const created = await services.aiGeneration.generateQuestionAnswers(
        selectedRole.id,
        questions,
      );
      const refreshed = await services.aiGeneration.listApplicationMaterials(selectedRole.id);
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
    if (!selectedRole) {
      return;
    }

    setGeneratingInterviewPrep(true);
    setInterviewPrepError(null);
    try {
      const created = await services.aiGeneration.generateInterviewPrepPack(selectedRole.id);
      const refreshed = await services.aiGeneration.listInterviewPrepPacks(selectedRole.id);
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
    if (!selectedRole) {
      return;
    }

    setRegeneratingSection(section);
    setInterviewPrepError(null);
    try {
      const updated = await services.aiGeneration.regenerateInterviewPrepSection(
        selectedRole.id,
        section,
      );
      const refreshed = await services.aiGeneration.listInterviewPrepPacks(selectedRole.id);
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
    if (!selectedRole || !selectedInterviewPrepPack) {
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
      const saved = await services.aiGeneration.updateInterviewPrepPack(
        selectedRole.id,
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
      const result = await services.aiGeneration.syncResumeProfile();
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
    if (!selectedRole) {
      return;
    }

    setGeneratingResumeTuning(true);
    setResumeTuningError(null);
    try {
      const created = await services.aiGeneration.generateResumeTuning(selectedRole.id);
      const refreshed = await services.aiGeneration.listResumeTuning(selectedRole.id);
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
    if (!selectedRole) {
      return;
    }

    setScoringDesirability(true);
    setDesirabilityError(null);
    try {
      const score = forceRefresh
        ? await services.aiGeneration.refreshDesirabilityScore(selectedRole.id)
        : await services.aiGeneration.scoreRoleDesirability(selectedRole.id);
      setSelectedRole((previous) =>
        previous
          ? {
              ...previous,
              latest_desirability_score: score,
            }
          : previous,
      );
      await loadRoles();
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
    closeRoleDetail,
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
    openRoleDetail,
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
    selectedRole,
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
