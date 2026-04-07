import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";

import { RolesPageClient } from "../../src/components/RolesPageClient";

const useRolesBoardMock = vi.fn();
const useRoleDetailStateMock = vi.fn();
const useRolesFeatureModalsMock = vi.fn();

vi.mock("../../src/lib/useRolesBoard", () => ({
  useRolesBoard: () => useRolesBoardMock(),
}));

vi.mock("../../src/lib/useRoleDetailState", () => ({
  useRoleDetailState: (args: unknown) => useRoleDetailStateMock(args),
}));

vi.mock("../../src/lib/useRolesFeatureModals", () => ({
  useRolesFeatureModals: () => useRolesFeatureModalsMock(),
}));

vi.mock("../../src/components/roles/RolesToolbar", () => ({
  RolesToolbar: (props: Record<string, unknown>) => (
    <div>
      <button onClick={() => (props.onOpenCapture as () => void)()} type="button">
        Open Capture
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

vi.mock("../../src/components/roles/RolesList", () => ({
  RolesList: (props: Record<string, unknown>) => (
    <div>
      <button onClick={() => (props.onOpenCapture as () => void)()} type="button">
        List Open Capture
      </button>
      <button onClick={() => (props.onSelectRole as (id: number) => void)(7)} type="button">
        Select Role
      </button>
      <span>{String(props.captureNotice ?? "")}</span>
    </div>
  ),
}));

vi.mock("../../src/components/CaptureRoleForm", () => ({
  CaptureRoleForm: ({ onCaptured }: { onCaptured: (result: { role_id: number }) => void }) => (
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

vi.mock("../../src/components/roles/RoleDetailModal", () => ({
  RoleDetailModal: (props: Record<string, unknown>) => (
    <div>
      <div>Role Detail Modal</div>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Role Detail
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/roles/PipelineModal", () => ({
  PipelineModal: (props: Record<string, unknown>) => (
    <div>
      <div>Pipeline Modal</div>
      <button onClick={() => (props.onOpenRole as (id: number) => void)(9)} type="button">
        Open Pipeline Role
      </button>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Pipeline
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/roles/OutcomeInsightsModal", () => ({
  OutcomeInsightsModal: (props: Record<string, unknown>) => (
    <div>
      <div>Outcome Insights Modal</div>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Insights
      </button>
    </div>
  ),
}));

vi.mock("../../src/components/roles/SkillDetailModal", () => ({
  SkillDetailModal: (props: Record<string, unknown>) => (
    <div>
      <div>Skill Detail Modal</div>
      <button onClick={() => (props.onOpenRole as (id: number) => void)(13)} type="button">
        Open Skill Role
      </button>
      <button onClick={() => (props.onClose as () => void)()} type="button">
        Close Skill
      </button>
    </div>
  ),
}));

describe("RolesPageClient", () => {
  beforeEach(() => {
    useRolesBoardMock.mockReturnValue({
      applyCaptureResult: vi.fn(),
      captureNotice: "Captured role",
      desirabilityFilter: "all",
      listError: null,
      loadRoles: vi.fn().mockResolvedValue(undefined),
      loadingRoles: false,
      recommendationFilter: "all",
      search: "",
      setDesirabilityFilter: vi.fn(),
      setRecommendationFilter: vi.fn(),
      setSearch: vi.fn(),
      setSortMode: vi.fn(),
      smartSortDescription: "Smart sort",
      sortMode: "newest",
      sortedRoles: [],
    });

    useRoleDetailStateMock.mockReturnValue({
      analyzingFit: false,
      applicationMaterials: [],
      closeRoleDetail: vi.fn(),
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
      openRoleDetail: vi.fn(),
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
      selectedRole: null,
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

    useRolesFeatureModalsMock.mockReturnValue({
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
      setPipelineOverdueOnly: vi.fn(),
      setPipelineRecentlyUpdated: vi.fn(),
      setPipelineStageFilter: vi.fn(),
      setPipelineWeekDeadlines: vi.fn(),
      showOutcomeInsights: false,
      showPipeline: false,
      tuningSuggestions: null,
    });
  });

  it("opens capture flow and forwards captured roles", () => {
    const board = useRolesBoardMock();
    const detail = useRoleDetailStateMock({});

    render(<RolesPageClient />);

    fireEvent.click(screen.getAllByRole("button", { name: /Open Capture/i })[0]);
    expect(screen.getByText("Capture Role")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Complete Capture/i }));

    expect(board.applyCaptureResult).toHaveBeenCalledWith({ role_id: 42 });
    expect(detail.openRoleDetail).toHaveBeenCalledWith(42);
    expect(board.loadRoles).toHaveBeenCalled();
  });

  it("renders modal branches when hook state enables them", () => {
    useRoleDetailStateMock.mockReturnValueOnce({
      ...useRoleDetailStateMock.mock.results[0]?.value,
      selectedRoleId: 7,
      selectedSkillId: 3,
    });
    useRolesFeatureModalsMock.mockReturnValueOnce({
      ...useRolesFeatureModalsMock.mock.results[0]?.value,
      showPipeline: true,
      showOutcomeInsights: true,
    });

    render(<RolesPageClient />);

    expect(screen.getByText("Role Detail Modal")).toBeInTheDocument();
    expect(screen.getByText("Skill Detail Modal")).toBeInTheDocument();
    expect(screen.getByText("Pipeline Modal")).toBeInTheDocument();
    expect(screen.getByText("Outcome Insights Modal")).toBeInTheDocument();
  });

  it("wires modal callbacks and cross-modal role opening actions", () => {
    const detailState = {
      ...useRoleDetailStateMock.mock.results[0]?.value,
      closeRoleDetail: vi.fn(),
      closeSkillDetail: vi.fn(),
      openRoleDetail: vi.fn(),
      selectedRoleId: 7,
      selectedSkillId: 3,
    };
    const featureState = {
      ...useRolesFeatureModalsMock.mock.results[0]?.value,
      closeOutcomeInsights: vi.fn(),
      closePipeline: vi.fn(),
      showOutcomeInsights: true,
      showPipeline: true,
    };

    useRoleDetailStateMock.mockReturnValueOnce(detailState);
    useRolesFeatureModalsMock.mockReturnValueOnce(featureState);

    render(<RolesPageClient />);

    fireEvent.click(screen.getByRole("button", { name: /Open Pipeline Role/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close Pipeline/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close Insights/i }));
    fireEvent.click(screen.getByRole("button", { name: /Open Skill Role/i }));
    fireEvent.click(screen.getByRole("button", { name: /Close Skill/i }));

    expect(featureState.closePipeline).toHaveBeenCalledTimes(2);
    expect(detailState.openRoleDetail).toHaveBeenCalledWith(9);
    expect(featureState.closeOutcomeInsights).toHaveBeenCalled();
    expect(detailState.closeSkillDetail).toHaveBeenCalledTimes(2);
    expect(detailState.openRoleDetail).toHaveBeenCalledWith(13);
  });

  it("does not expose any in-page AI settings action", () => {
    render(<RolesPageClient />);

    expect(screen.queryByRole("button", { name: /Open AI/i })).not.toBeInTheDocument();
  });
});
