import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { JobsPageClient } from "../../src/components/JobsPageClient";

const useJobsBoardMock = vi.fn();
const useJobDetailStateMock = vi.fn();
const useJobsFeatureModalsMock = vi.fn();

vi.mock("../../src/lib/useJobsBoard", () => ({
  useJobsBoard: () => useJobsBoardMock(),
}));

vi.mock("../../src/lib/useJobDetailState", () => ({
  useJobDetailState: (args: unknown) => useJobDetailStateMock(args),
}));

vi.mock("../../src/lib/useJobsFeatureModals", () => ({
  useJobsFeatureModals: () => useJobsFeatureModalsMock(),
}));

vi.mock("../../src/components/jobs/JobsToolbar", () => ({
  JobsToolbar: (props: Record<string, unknown>) => (
    <div>
      <button onClick={() => (props.onOpenCapture as () => void)()} type="button">
        Open Capture
      </button>
      <button onClick={() => (props.onOpenAISettings as () => void)()} type="button">
        Open AI
      </button>
      <button onClick={() => (props.onOpenFactorSettings as () => void)()} type="button">
        Open Factors
      </button>
      <button onClick={() => (props.onOpenPipeline as () => void)()} type="button">
        Open Pipeline
      </button>
      <button onClick={() => (props.onOpenOutcomeInsights as () => void)()} type="button">
        Open Insights
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/jobs/JobsList", () => ({
  JobsList: (props: Record<string, unknown>) => (
    <div>
      <button onClick={() => (props.onOpenCapture as () => void)()} type="button">
        List Open Capture
      </button>
      <button onClick={() => (props.onSelectJob as (id: number) => void)(7)} type="button">
        Select Job
      </button>
      <span>{String(props.captureNotice ?? "")}</span>
    </div>
  ),
}));

vi.mock("../../src/components/CaptureJobForm", () => ({
  CaptureJobForm: ({ onCaptured }: { onCaptured: (result: { role_id: number }) => void }) => (
    <button onClick={() => onCaptured({ role_id: 42 })} type="button">
      Complete Capture
    </button>
  ),
}));

vi.mock("../../src/components/Modal", () => ({
  Modal: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock("../../src/components/jobs/JobDetailModal", () => ({
  JobDetailModal: (props: Record<string, unknown>) => (
    <div>
      <div>Job Detail Modal</div>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Job Detail
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/jobs/FactorSettingsModal", () => ({
  FactorSettingsModal: (props: Record<string, unknown>) => (
    <div>
      <div>Factor Settings Modal</div>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Factors
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/jobs/AISettingsModal", () => ({
  AISettingsModal: (props: Record<string, unknown>) => (
    <div>
      <div>AI Settings Modal</div>
      <button
        onClick={() =>
          (props.onTokenInputChange as (family: string, value: string) => void)("job_parsing", "abc")
        }
        type="button"
      >
        Change Token
      </button>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close AI
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/jobs/PipelineModal", () => ({
  PipelineModal: (props: Record<string, unknown>) => (
    <div>
      <div>Pipeline Modal</div>
      <button onClick={() => (props.onOpenJob as (id: number) => void)(9)} type="button">
        Open Pipeline Job
      </button>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Pipeline
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/jobs/OutcomeInsightsModal", () => ({
  OutcomeInsightsModal: (props: Record<string, unknown>) => (
    <div>
      <div>Outcome Insights Modal</div>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Insights
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/jobs/SkillDetailModal", () => ({
  SkillDetailModal: (props: Record<string, unknown>) => (
    <div>
      <div>Skill Detail Modal</div>
      <button onClick={() => (props.onOpenJob as (id: number) => void)(13)} type="button">
        Open Skill Job
      </button>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Skill
      </button>
    </div>
  ),
}));

describe("JobsPageClient", () => {
  beforeEach(() => {
    useJobsBoardMock.mockReturnValue({
      applyCaptureResult: vi.fn(),
      captureNotice: "Captured role",
      desirabilityFilter: "all",
      listError: null,
      loadJobs: vi.fn().mockResolvedValue(undefined),
      loadingJobs: false,
      recommendationFilter: "all",
      search: "",
      setDesirabilityFilter: vi.fn(),
      setRecommendationFilter: vi.fn(),
      setSearch: vi.fn(),
      setSortMode: vi.fn(),
      smartSortDescription: "Smart sort",
      sortMode: "newest",
      sortedJobs: [],
    });

    useJobDetailStateMock.mockReturnValue({
      analyzingFit: false,
      applicationMaterials: [],
      closeJobDetail: vi.fn(),
      closeSkillDetail: vi.fn(),
      detailError: null,
      desirabilityError: null,
      editingLikelyQuestions: "",
      editingStarStories: "",
      editingTalkingPoints: "",
      fitError: null,
      generatingCoverLetter: false,
      generatingInterviewPrep: false,
      generatingQA: false,
      generatingResumeTuning: false,
      handleAddOutcomeEvent: vi.fn(),
      handleAddStage: vi.fn(),
      handleAnalyzeFit: vi.fn(),
      handleCopyInterviewPrep: vi.fn(),
      handleCopyResumeTuning: vi.fn(),
      handleExportInterviewPrep: vi.fn(),
      handleExportResumeTuning: vi.fn(),
      handleGenerateCoverLetter: vi.fn(),
      handleGenerateInterviewPrep: vi.fn(),
      handleGenerateQA: vi.fn(),
      handleGenerateResumeTuning: vi.fn(),
      handleRegenerateInterviewPrepSection: vi.fn(),
      handleSaveInterviewPrepEdits: vi.fn(),
      handleSaveOps: vi.fn(),
      handleScoreDesirability: vi.fn(),
      handleSetNextAction: vi.fn(),
      handleStatusChange: vi.fn(),
      handleSyncResumeProfile: vi.fn(),
      interviewPrepError: null,
      interviewPrepLoading: false,
      interviewPrepPacks: [],
      loadingDetail: false,
      loadingMaterials: false,
      loadingSkillDetail: false,
      materialsError: null,
      newOutcomeNotes: "",
      newOutcomeOccurredAt: "",
      newOutcomeType: "screen",
      newStage: "applied",
      openJobDetail: vi.fn(),
      openSkillDetail: vi.fn(),
      opsAppliedAt: "",
      opsDeadlineAt: "",
      opsError: null,
      opsNextActionAt: "",
      opsNotes: "",
      opsRecruiterContact: "",
      opsSaving: false,
      opsSource: "",
      outcomeEvents: [],
      outcomesError: null,
      outcomesLoading: false,
      qaQuestionsInput: "",
      regeneratingSection: null,
      resumeSyncNotice: null,
      resumeTuningError: null,
      resumeTuningLoading: false,
      resumeTuningSuggestions: [],
      savingInterviewPrep: false,
      savingOutcome: false,
      scoringDesirability: false,
      selectedInterviewPrepId: null,
      selectedJob: null,
      selectedMaterialId: null,
      selectedResumeTuningId: null,
      selectedRoleId: null,
      selectedSkill: null,
      selectedSkillId: null,
      setEditingLikelyQuestions: vi.fn(),
      setEditingStarStories: vi.fn(),
      setEditingTalkingPoints: vi.fn(),
      setNewOutcomeNotes: vi.fn(),
      setNewOutcomeOccurredAt: vi.fn(),
      setNewOutcomeType: vi.fn(),
      setNewStage: vi.fn(),
      setOpsAppliedAt: vi.fn(),
      setOpsDeadlineAt: vi.fn(),
      setOpsNextActionAt: vi.fn(),
      setOpsNotes: vi.fn(),
      setOpsRecruiterContact: vi.fn(),
      setOpsSource: vi.fn(),
      setQaQuestionsInput: vi.fn(),
      setSelectedInterviewPrepId: vi.fn(),
      setSelectedMaterialId: vi.fn(),
      setSelectedResumeTuningId: vi.fn(),
      setStageNotes: vi.fn(),
      setStageOccurredAt: vi.fn(),
      skillDetailError: null,
      stageNotes: "",
      stageOccurredAt: "",
      stageSaving: false,
      statusError: null,
      syncingResumeProfile: false,
      updatingStatus: false,
    });

    useJobsFeatureModalsMock.mockReturnValue({
      aiSettings: [],
      aiSettingsError: null,
      aiSettingsLoading: false,
      closeAISettings: vi.fn(),
      closeFactorSettings: vi.fn(),
      closeOutcomeInsights: vi.fn(),
      closePipeline: vi.fn(),
      factors: [],
      factorsError: null,
      factorsLoading: false,
      handleAddFactor: vi.fn(),
      handleClearToken: vi.fn(),
      handleDeleteFactor: vi.fn(),
      handleHealthcheck: vi.fn(),
      handleMoveFactor: vi.fn(),
      handleUpdateAIConfig: vi.fn(),
      handleUpdateFactor: vi.fn(),
      handleUpdateToken: vi.fn(),
      healthByFamily: {},
      newFactorName: "",
      newFactorPrompt: "",
      newFactorWeight: "0.10",
      openAISettings: vi.fn(),
      openFactorSettings: vi.fn(),
      openOutcomeInsights: vi.fn(),
      openPipeline: vi.fn(),
      outcomeInsights: null,
      outcomeInsightsError: null,
      outcomeInsightsLoading: false,
      pipelineCounters: { needs_follow_up: 0, overdue_actions: 0, upcoming_deadlines: 0 },
      pipelineError: null,
      pipelineItems: [],
      pipelineLoading: false,
      pipelineOverdueOnly: false,
      pipelineRecentlyUpdated: false,
      pipelineStageFilter: "all",
      pipelineWeekDeadlines: false,
      setNewFactorName: vi.fn(),
      setNewFactorPrompt: vi.fn(),
      setNewFactorWeight: vi.fn(),
      setPipelineOverdueOnly: vi.fn(),
      setPipelineRecentlyUpdated: vi.fn(),
      setPipelineStageFilter: vi.fn(),
      setPipelineWeekDeadlines: vi.fn(),
      setTokenInputs: vi.fn(),
      showAISettings: false,
      showFactorSettings: false,
      showOutcomeInsights: false,
      showPipeline: false,
      tokenInputs: {
        application_generation: "",
        desirability_scoring: "",
        fit_analysis: "",
        job_parsing: "",
      },
      tuningSuggestions: null,
    });
  });

  it("opens capture flow and forwards captured jobs", () => {
    const board = useJobsBoardMock();
    const detail = useJobDetailStateMock({});

    render(<JobsPageClient />);

    fireEvent.click(screen.getAllByRole("button", { name: /Open Capture/i })[0]);
    expect(screen.getByText("Capture Job")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Complete Capture/i }));

    expect(board.applyCaptureResult).toHaveBeenCalledWith({ role_id: 42 });
    expect(detail.openJobDetail).toHaveBeenCalledWith(42);
    expect(board.loadJobs).toHaveBeenCalled();
  });

  it("renders modal branches when hook state enables them", () => {
    useJobDetailStateMock.mockReturnValueOnce({
      ...useJobDetailStateMock(),
      selectedRoleId: 7,
      selectedSkillId: 3,
    });
    useJobsFeatureModalsMock.mockReturnValueOnce({
      ...useJobsFeatureModalsMock(),
      showAISettings: true,
      showFactorSettings: true,
      showPipeline: true,
      showOutcomeInsights: true,
    });

    render(<JobsPageClient />);

    expect(screen.getByText("Job Detail Modal")).toBeInTheDocument();
    expect(screen.getByText("Skill Detail Modal")).toBeInTheDocument();
    expect(screen.getByText("AI Settings Modal")).toBeInTheDocument();
    expect(screen.getByText("Factor Settings Modal")).toBeInTheDocument();
    expect(screen.getByText("Pipeline Modal")).toBeInTheDocument();
    expect(screen.getByText("Outcome Insights Modal")).toBeInTheDocument();
  });

  it("wires modal callbacks and cross-modal job opening actions", () => {
    const detailState = {
      ...useJobDetailStateMock(),
      closeJobDetail: vi.fn(),
      closeSkillDetail: vi.fn(),
      openJobDetail: vi.fn(),
      selectedRoleId: 7,
      selectedSkillId: 3,
    };
    const featureState = {
      ...useJobsFeatureModalsMock(),
      closeAISettings: vi.fn(),
      closeFactorSettings: vi.fn(),
      closeOutcomeInsights: vi.fn(),
      closePipeline: vi.fn(),
      setTokenInputs: vi.fn(),
      showAISettings: true,
      showFactorSettings: true,
      showOutcomeInsights: true,
      showPipeline: true,
    };

    useJobDetailStateMock.mockReturnValueOnce(detailState);
    useJobsFeatureModalsMock.mockReturnValueOnce(featureState);

    render(<JobsPageClient />);

    fireEvent.click(screen.getByRole("button", { name: /Close Job Detail/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close Factors/i }));
    fireEvent.click(screen.getByRole("button", { name: /Change Token/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close AI/i }));
    fireEvent.click(screen.getByRole("button", { name: /Open Pipeline Job/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close Pipeline/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close Insights/i }));
    fireEvent.click(screen.getByRole("button", { name: /Open Skill Job/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close Skill/i }));

    expect(detailState.closeJobDetail).toHaveBeenCalled();
    expect(featureState.closeFactorSettings).toHaveBeenCalled();
    expect(featureState.setTokenInputs).toHaveBeenCalled();
    expect(featureState.closeAISettings).toHaveBeenCalled();
    expect(featureState.closePipeline).toHaveBeenCalledTimes(2);
    expect(detailState.openJobDetail).toHaveBeenCalledWith(9);
    expect(featureState.closeOutcomeInsights).toHaveBeenCalled();
    expect(detailState.closeSkillDetail).toHaveBeenCalledTimes(2);
    expect(detailState.openJobDetail).toHaveBeenCalledWith(13);
  });
});
