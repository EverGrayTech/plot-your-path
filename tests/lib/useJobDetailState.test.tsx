import { act, renderHook, waitFor } from "@testing-library/react";

import { useJobDetailState } from "../../src/lib/useJobDetailState";

const services = {
  jobs: {
    getJob: vi.fn(),
    updateJobStatus: vi.fn(),
  },
  skills: {
    getSkill: vi.fn(),
  },
  workflows: {
    listOutcomeEvents: vi.fn(),
    upsertApplicationOps: vi.fn(),
    updateInterviewStage: vi.fn(),
    updateNextAction: vi.fn(),
    createOutcomeEvent: vi.fn(),
  },
  aiGeneration: {
    listApplicationMaterials: vi.fn(),
    generateCoverLetter: vi.fn(),
    generateQuestionAnswers: vi.fn(),
    listInterviewPrepPacks: vi.fn(),
    generateInterviewPrepPack: vi.fn(),
    regenerateInterviewPrepSection: vi.fn(),
    updateInterviewPrepPack: vi.fn(),
    syncResumeProfile: vi.fn(),
    listResumeTuning: vi.fn(),
    generateResumeTuning: vi.fn(),
    analyzeJobFit: vi.fn(),
    scoreJobDesirability: vi.fn(),
    refreshDesirabilityScore: vi.fn(),
  },
};

vi.mock("../../src/lib/services", () => ({
  getFrontendServices: () => services,
}));

vi.mock("../../src/lib/jobsPageUtils", async () => {
  const actual = await vi.importActual<typeof import("../../src/lib/jobsPageUtils")>(
    "../../src/lib/jobsPageUtils",
  );
  return {
    ...actual,
    exportMarkdownFile: vi.fn(),
  };
});

const job = {
  id: 1,
  company: { id: 1, name: "Evergray", slug: "evergray", website: null, created_at: "2026-03-18T00:00:00.000Z" },
  title: "Platform Engineer",
  team_division: null,
  salary: { min: 100000, max: 150000, currency: "USD" },
  url: "https://example.com/job",
  skills: { required: [], preferred: [] },
  description_md: "desc",
  created_at: "2026-03-18T00:00:00.000Z",
  status: "open" as const,
  status_history: [],
  application_ops: {
    role_id: 1,
    applied_at: "2026-03-18T12:00:00.000Z",
    deadline_at: "2026-03-20T12:00:00.000Z",
    source: "LinkedIn",
    recruiter_contact: "recruiter",
    notes: "notes",
    next_action_at: "2026-03-19T12:00:00.000Z",
    needs_attention: false,
    attention_reasons: [],
    created_at: "2026-03-18T00:00:00.000Z",
    updated_at: "2026-03-18T00:00:00.000Z",
  },
  interview_stage_timeline: [],
  latest_fit_analysis: null,
  latest_desirability_score: null,
};

describe("useJobDetailState", () => {
  beforeEach(() => {
    services.jobs.getJob.mockResolvedValue(job);
    services.jobs.updateJobStatus.mockResolvedValue(undefined);
    services.skills.getSkill.mockResolvedValue({ id: 9, name: "TypeScript", category: null, usage_count: 1, jobs: [] });
    services.workflows.listOutcomeEvents.mockResolvedValue([]);
    services.workflows.upsertApplicationOps.mockResolvedValue(undefined);
    services.workflows.updateInterviewStage.mockResolvedValue(undefined);
    services.workflows.updateNextAction.mockResolvedValue({ next_action_at: "2026-03-22T12:00:00.000Z" });
    services.workflows.createOutcomeEvent.mockResolvedValue(undefined);
    services.aiGeneration.listApplicationMaterials.mockResolvedValue([]);
    services.aiGeneration.generateCoverLetter.mockResolvedValue({ id: 100 });
    services.aiGeneration.generateQuestionAnswers.mockResolvedValue({ id: 101 });
    services.aiGeneration.listInterviewPrepPacks.mockResolvedValue([]);
    services.aiGeneration.generateInterviewPrepPack.mockResolvedValue({ id: 102 });
    services.aiGeneration.regenerateInterviewPrepSection.mockResolvedValue({ id: 103 });
    services.aiGeneration.updateInterviewPrepPack.mockResolvedValue({ id: 103 });
    services.aiGeneration.syncResumeProfile.mockResolvedValue({ ingested_count: 1, source_used: "profile", source_record_id: "id" });
    services.aiGeneration.listResumeTuning.mockResolvedValue([]);
    services.aiGeneration.generateResumeTuning.mockResolvedValue({ id: 104 });
    services.aiGeneration.analyzeJobFit.mockResolvedValue({ id: 2, role_id: 1, fit_score: 80, recommendation: "go", covered_required_skills: [], missing_required_skills: [], covered_preferred_skills: [], missing_preferred_skills: [], rationale: "ok", provider: "browser", model: "v1", version: "v1", created_at: "2026-03-18T00:00:00.000Z" });
    services.aiGeneration.scoreJobDesirability.mockResolvedValue({ id: 3, company_id: 1, role_id: 1, total_score: 7, factor_breakdown: [], score_scope: "company", fallback_used: true, cache_expires_at: "2026-03-19T00:00:00.000Z", is_stale: false, provider: "browser", model: "v1", version: "v1", created_at: "2026-03-18T00:00:00.000Z" });
    services.aiGeneration.refreshDesirabilityScore.mockResolvedValue({ id: 4, company_id: 1, role_id: 1, total_score: 8, factor_breakdown: [], score_scope: "company", fallback_used: true, cache_expires_at: "2026-03-20T00:00:00.000Z", is_stale: false, provider: "browser", model: "v1", version: "v1", created_at: "2026-03-18T00:00:00.000Z" });
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it("loads job detail and exercises major handlers", async () => {
    const loadJobs = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useJobDetailState({ loadJobs }));

    act(() => {
      result.current.openJobDetail(1);
    });

    await waitFor(() => expect(result.current.selectedJob?.id).toBe(1));

    await act(async () => {
      await result.current.handleStatusChange("submitted");
      await result.current.handleAnalyzeFit();
      await result.current.handleSaveOps();
      await result.current.handleAddStage();
      await result.current.handleSetNextAction(3);
      await result.current.handleAddOutcomeEvent();
      await result.current.handleGenerateCoverLetter();
      result.current.setQaQuestionsInput("Why this role?");
    });

    await waitFor(() => expect(result.current.qaQuestionsInput).toBe("Why this role?"));

    await act(async () => {
      await result.current.handleGenerateQA();
      await result.current.handleGenerateInterviewPrep();
      await result.current.handleRegenerateInterviewPrepSection("likely_questions");
      await result.current.handleSyncResumeProfile();
      await result.current.handleGenerateResumeTuning();
      await result.current.handleScoreDesirability(false);
      await result.current.handleScoreDesirability(true);
    });

    expect(services.jobs.updateJobStatus).toHaveBeenCalledWith(1, "submitted");
    expect(services.aiGeneration.analyzeJobFit).toHaveBeenCalledWith(1);
    expect(services.workflows.upsertApplicationOps).toHaveBeenCalled();
    expect(services.workflows.updateInterviewStage).toHaveBeenCalled();
    expect(services.workflows.updateNextAction).toHaveBeenCalled();
    expect(services.workflows.createOutcomeEvent).toHaveBeenCalled();
    expect(services.aiGeneration.generateCoverLetter).toHaveBeenCalledWith(1);
    expect(services.aiGeneration.generateQuestionAnswers).toHaveBeenCalledWith(1, ["Why this role?"]);
    expect(services.aiGeneration.generateInterviewPrepPack).toHaveBeenCalledWith(1);
    expect(services.aiGeneration.regenerateInterviewPrepSection).toHaveBeenCalledWith(1, "likely_questions");
    expect(services.aiGeneration.syncResumeProfile).toHaveBeenCalled();
    expect(services.aiGeneration.generateResumeTuning).toHaveBeenCalledWith(1);
    expect(services.aiGeneration.scoreJobDesirability).toHaveBeenCalledWith(1);
    expect(services.aiGeneration.refreshDesirabilityScore).toHaveBeenCalledWith(1);
  });

  it("loads skill detail and supports closing state", async () => {
    const { result } = renderHook(() => useJobDetailState({ loadJobs: vi.fn() }));

    act(() => {
      result.current.openSkillDetail(9);
    });

    await waitFor(() => expect(result.current.selectedSkill?.id).toBe(9));

    act(() => {
      result.current.closeSkillDetail();
      result.current.closeJobDetail();
    });

    expect(result.current.selectedSkillId).toBeNull();
    expect(result.current.selectedRoleId).toBeNull();
  });

  it("covers guard clauses and error branches", async () => {
    services.jobs.getJob.mockRejectedValueOnce(new Error("detail fail"));
    services.skills.getSkill.mockRejectedValueOnce(new Error("skill fail"));

    const loadJobs = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useJobDetailState({ loadJobs }));

    await act(async () => {
      await result.current.handleStatusChange("submitted");
      await result.current.handleAnalyzeFit();
      await result.current.handleSaveOps();
      await result.current.handleAddStage();
      await result.current.handleSetNextAction(1);
      await result.current.handleAddOutcomeEvent();
      await result.current.handleGenerateCoverLetter();
      await result.current.handleGenerateQA();
      await result.current.handleGenerateInterviewPrep();
      await result.current.handleRegenerateInterviewPrepSection("talking_points");
      await result.current.handleSaveInterviewPrepEdits();
      await result.current.handleGenerateResumeTuning();
      await result.current.handleScoreDesirability(false);
    });

    act(() => {
      result.current.openJobDetail(1);
    });

    await waitFor(() => expect(result.current.detailError).toBe("detail fail"));

    act(() => {
      result.current.openSkillDetail(9);
    });

    await waitFor(() => expect(result.current.skillDetailError).toBe("skill fail"));

    services.aiGeneration.generateQuestionAnswers.mockRejectedValueOnce(
      new Error("qa generation failed"),
    );
    services.aiGeneration.generateInterviewPrepPack.mockRejectedValueOnce(
      new Error("prep generation failed"),
    );
    services.aiGeneration.regenerateInterviewPrepSection.mockRejectedValueOnce(
      new Error("regen failed"),
    );
    services.aiGeneration.generateResumeTuning.mockRejectedValueOnce(
      new Error("resume tuning failed"),
    );
    services.aiGeneration.scoreJobDesirability.mockRejectedValueOnce(
      new Error("desirability failed"),
    );
    services.aiGeneration.syncResumeProfile.mockRejectedValueOnce(
      new Error("sync failed"),
    );
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("copy failed")) } });

    const emptyQuestionsHook = renderHook(() => useJobDetailState({ loadJobs }));

    await act(async () => {
      emptyQuestionsHook.result.current.openJobDetail(1);
    });

    await waitFor(() => expect(emptyQuestionsHook.result.current.selectedJob?.id).toBe(1));

    act(() => {
      emptyQuestionsHook.result.current.setQaQuestionsInput("");
    });

    await act(async () => {
      await emptyQuestionsHook.result.current.handleGenerateQA();
    });

    expect(String(emptyQuestionsHook.result.current.materialsError)).toMatch(
      /Add at least one application question/i,
    );

    act(() => {
      emptyQuestionsHook.result.current.setQaQuestionsInput("Question");
    });

    await act(async () => {
      await emptyQuestionsHook.result.current.handleGenerateQA();
      await emptyQuestionsHook.result.current.handleGenerateInterviewPrep();
      await emptyQuestionsHook.result.current.handleRegenerateInterviewPrepSection(
        "talking_points",
      );
      await emptyQuestionsHook.result.current.handleGenerateResumeTuning();
      await emptyQuestionsHook.result.current.handleScoreDesirability(false);
      await emptyQuestionsHook.result.current.handleSyncResumeProfile();
      await emptyQuestionsHook.result.current.handleCopyInterviewPrep({
        id: 1,
        role_id: 1,
        artifact_type: "interview_prep_pack",
        version: 1,
        sections: {
          likely_questions: ["Q"],
          talking_points: ["P"],
          star_stories: ["S"],
        },
        provider: "browser",
        model: "v1",
        prompt_version: "v1",
        created_at: "2026-03-18T00:00:00.000Z",
      });
      await emptyQuestionsHook.result.current.handleCopyResumeTuning({
        id: 1,
        role_id: 1,
        artifact_type: "resume_tuning",
        version: 1,
        sections: {
          keep_bullets: ["Keep"],
          remove_bullets: ["Remove"],
          emphasize_bullets: ["Emphasize"],
          missing_keywords: ["Keyword"],
          summary_tweaks: ["Summary"],
          confidence_notes: ["Note"],
        },
        provider: "browser",
        model: "v1",
        prompt_version: "v1",
        created_at: "2026-03-18T00:00:00.000Z",
      });
    });

    services.aiGeneration.generateInterviewPrepPack.mockResolvedValueOnce({ id: 999 });
    services.aiGeneration.listInterviewPrepPacks.mockResolvedValueOnce([
      {
        id: 999,
        role_id: 1,
        artifact_type: "interview_prep_pack",
        version: 1,
        sections: {
          likely_questions: ["Existing question"],
          talking_points: ["Existing point"],
          star_stories: ["Existing story"],
        },
        provider: "browser",
        model: "v1",
        prompt_version: "v1",
        created_at: "2026-03-18T00:00:00.000Z",
      },
    ]);

    await act(async () => {
      await emptyQuestionsHook.result.current.handleGenerateInterviewPrep();
    });

    await waitFor(() => expect(emptyQuestionsHook.result.current.selectedInterviewPrepId).toBe(999));

    act(() => {
      emptyQuestionsHook.result.current.setEditingLikelyQuestions("");
      emptyQuestionsHook.result.current.setEditingTalkingPoints("");
      emptyQuestionsHook.result.current.setEditingStarStories("");
    });

    await act(async () => {
      await emptyQuestionsHook.result.current.handleSaveInterviewPrepEdits();
    });

    expect(String(emptyQuestionsHook.result.current.materialsError)).toMatch(/qa generation failed/i);
    expect(String(emptyQuestionsHook.result.current.interviewPrepError)).toMatch(/Each interview prep section requires at least one/i);
    expect(String(emptyQuestionsHook.result.current.resumeTuningError)).toMatch(/copy resume tuning suggestions|sync failed|resume tuning failed/i);
    expect(String(emptyQuestionsHook.result.current.desirabilityError)).toMatch(/desirability failed/i);
  });
});
