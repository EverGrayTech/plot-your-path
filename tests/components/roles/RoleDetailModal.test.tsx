import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { RoleDetailModal } from "../../../src/components/roles/RoleDetailModal";

vi.mock("../../../src/components/roles/TraceabilityBlock", () => ({
  TraceabilityBlock: () => <div>Traceability</div>,
}));

const baseProps = {
  analyzingFit: false,
  applicationMaterials: [],
  detailError: null,
  desirabilityError: null,
  editingLikelyQuestions: "Question 1",
  editingStarStories: "Story 1",
  editingTalkingPoints: "Point 1",
  fitError: null,
  generatingCoverLetter: false,
  generatingInterviewPrep: false,
  generatingQA: false,
  generatingResumeTuning: false,
  interviewPrepError: null,
  interviewPrepLoading: false,
  interviewPrepPacks: [],
  loadingDetail: false,
  loadingMaterials: false,
  materialsError: null,
  newOutcomeNotes: "",
  newOutcomeOccurredAt: "2026-03-18T12:00",
  newOutcomeType: "screen" as const,
  newStage: "applied" as const,
  onAddStage: vi.fn(),
  onAnalyzeFit: vi.fn(),
  onClose: vi.fn(),
  onCopyInterviewPrep: vi.fn(),
  onCopyResumeTuning: vi.fn(),
  onEditLikelyQuestions: vi.fn(),
  onEditStarStories: vi.fn(),
  onEditTalkingPoints: vi.fn(),
  onExportInterviewPrep: vi.fn(),
  onExportResumeTuning: vi.fn(),
  onGenerateCoverLetter: vi.fn(),
  onGenerateInterviewPrep: vi.fn(),
  onGenerateQA: vi.fn(),
  onGenerateResumeTuning: vi.fn(),
  onLogOutcome: vi.fn(),
  onOpenSkill: vi.fn(),
  onRegenerateInterviewPrepSection: vi.fn(),
  onSaveInterviewPrepEdits: vi.fn(),
  onSaveOps: vi.fn(),
  onScoreDesirability: vi.fn(),
  onSetMaterialId: vi.fn(),
  onSetNewOutcomeNotes: vi.fn(),
  onSetNewOutcomeOccurredAt: vi.fn(),
  onSetNewOutcomeType: vi.fn(),
  onSetNewStage: vi.fn(),
  onSetNextAction: vi.fn(),
  onSetOpsAppliedAt: vi.fn(),
  onSetOpsDeadlineAt: vi.fn(),
  onSetOpsNextActionAt: vi.fn(),
  onSetOpsNotes: vi.fn(),
  onSetOpsRecruiterContact: vi.fn(),
  onSetOpsSource: vi.fn(),
  onSetQaQuestionsInput: vi.fn(),
  onSetSelectedInterviewPrepId: vi.fn(),
  onSetSelectedResumeTuningId: vi.fn(),
  onSetStageNotes: vi.fn(),
  onSetStageOccurredAt: vi.fn(),
  onSetStatus: vi.fn(),
  onSyncResumeProfile: vi.fn(),
  opsAppliedAt: "2026-03-18T12:00",
  opsDeadlineAt: "2026-03-20T12:00",
  opsError: null,
  opsNextActionAt: "2026-03-19T12:00",
  opsNotes: "ops notes",
  opsRecruiterContact: "recruiter",
  opsSaving: false,
  opsSource: "LinkedIn",
  outcomeEvents: [],
  outcomesError: null,
  outcomesLoading: false,
  qaQuestionsInput: "Why this role?",
  regeneratingSection: null,
  resumeSyncNotice: null,
  resumeTuningError: null,
  resumeTuningLoading: false,
  resumeTuningSuggestions: [],
  savingInterviewPrep: false,
  savingOutcome: false,
  scoringDesirability: false,
  selectedInterviewPrepId: null,
  selectedMaterialId: null,
  selectedResumeTuningId: null,
  stageNotes: "stage notes",
  stageOccurredAt: "2026-03-18T12:00",
  stageSaving: false,
  statusError: null,
  syncingResumeProfile: false,
  updatingStatus: false,
};

const role = {
  id: 1,
  company: {
    id: 1,
    name: "Evergray",
    slug: "evergray",
    website: null,
    created_at: "2026-03-18T00:00:00.000Z",
  },
  title: "Platform Engineer",
  team_division: null,
  salary: { min: 100000, max: 150000, currency: "USD" },
  url: "https://example.com/role",
  skills: {
    required: [{ id: 10, name: "TypeScript", requirement_level: "required" as const }],
    preferred: [{ id: 11, name: "React", requirement_level: "preferred" as const }],
  },
  description_md: "desc",
  created_at: "2026-03-18T00:00:00.000Z",
  status: "open" as const,
  status_history: [
    { from_status: null, to_status: "open" as const, changed_at: "2026-03-18T00:00:00.000Z" },
  ],
  application_ops: {
    role_id: 1,
    applied_at: "2026-03-18T12:00:00.000Z",
    deadline_at: "2026-03-20T12:00:00.000Z",
    source: "LinkedIn",
    recruiter_contact: "recruiter",
    notes: "ops notes",
    next_action_at: "2026-03-19T12:00:00.000Z",
    needs_attention: true,
    attention_reasons: ["Follow up"],
    created_at: "2026-03-18T00:00:00.000Z",
    updated_at: "2026-03-18T00:00:00.000Z",
  },
  interview_stage_timeline: [
    {
      id: 1,
      role_id: 1,
      stage: "technical" as const,
      notes: "panel",
      occurred_at: "2026-03-18T12:00:00.000Z",
      created_at: "2026-03-18T12:00:00.000Z",
    },
  ],
  latest_fit_analysis: {
    id: 2,
    role_id: 1,
    fit_score: 78,
    recommendation: "go" as const,
    covered_required_skills: ["TypeScript"],
    adjacent_required_skills: ["Node.js"],
    missing_required_skills: [],
    covered_preferred_skills: ["React"],
    adjacent_preferred_skills: [],
    missing_preferred_skills: ["GraphQL"],
    rationale: "Strong fit",
    rationale_citations: [
      {
        source_type: "browser_local_workspace",
        source_id: 1,
        source_record_id: "role-1",
        source_key: "fit",
        snippet_reference: "evidence",
        confidence: 0.8,
      },
    ],
    unsupported_claims: ["none"],
    fallback_used: true,
    confidence_label: "medium",
    provider: "browser-local",
    model: "heuristic-v1",
    version: "v1",
    created_at: "2026-03-18T12:00:00.000Z",
  },
  latest_desirability_score: {
    id: 3,
    company_id: 1,
    role_id: 1,
    total_score: 7.4,
    factor_breakdown: [
      {
        factor_id: 1,
        factor_name: "Growth",
        weight: 0.4,
        score: 8,
        reasoning: "Good",
        fallback_used: true,
      },
    ],
    score_scope: "company" as const,
    fallback_used: true,
    cache_expires_at: "2026-03-19T12:00:00.000Z",
    is_stale: false,
    provider: "browser-local",
    model: "heuristic-v1",
    version: "v1",
    created_at: "2026-03-18T12:00:00.000Z",
  },
};

describe("RoleDetailModal", () => {
  it("renders loading and error states", () => {
    render(
      <RoleDetailModal {...baseProps} detailError="Failed detail" loadingDetail role={null} />,
    );

    expect(screen.getByText(/Loading role details/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Failed detail");
  });

  it("renders major sections and forwards key interactions", () => {
    const props = {
      ...baseProps,
      applicationMaterials: [
        {
          id: 4,
          role_id: 1,
          artifact_type: "cover_letter" as const,
          version: 1,
          content: "Dear team",
          questions: null,
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      interviewPrepPacks: [
        {
          id: 5,
          role_id: 1,
          artifact_type: "interview_prep_pack" as const,
          version: 1,
          sections: {
            likely_questions: ["Why?"],
            talking_points: ["Impact"],
            star_stories: ["Story"],
          },
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      resumeTuningSuggestions: [
        {
          id: 6,
          role_id: 1,
          artifact_type: "resume_tuning" as const,
          version: 1,
          sections: {
            keep_bullets: ["Keep"],
            remove_bullets: ["Remove"],
            emphasize_bullets: ["Emphasize"],
            missing_keywords: ["TypeScript"],
            summary_tweaks: ["Lead"],
            confidence_notes: ["Note"],
          },
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      outcomeEvents: [
        {
          id: 7,
          role_id: 1,
          event_type: "offer" as const,
          occurred_at: "2026-03-18T12:00:00.000Z",
          notes: "Great",
          fit_analysis_id: 2,
          desirability_score_id: 3,
          application_material_id: 4,
          model_family: "browser-local",
          model: "heuristic-v1",
          prompt_version: "v1",
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      selectedMaterialId: 4,
      selectedInterviewPrepId: 5,
      selectedResumeTuningId: 6,
      role,
    };

    render(<RoleDetailModal {...props} />);

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "submitted" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Ops/i }));
    fireEvent.click(screen.getByRole("button", { name: /Next Action \+1 day/i }));
    fireEvent.click(screen.getByRole("button", { name: /Add Stage Event/i }));
    fireEvent.click(screen.getByRole("button", { name: /Analyze Fit/i }));
    fireEvent.click(screen.getByRole("button", { name: /Score Desirability/i }));
    fireEvent.click(screen.getByRole("button", { name: /Refresh Score/i }));
    fireEvent.click(screen.getByRole("button", { name: /Log Outcome Event/i }));
    fireEvent.click(screen.getByRole("button", { name: /Generate Cover Letter/i }));
    fireEvent.click(screen.getByRole("button", { name: /Generate Q&A Drafts/i }));
    fireEvent.click(screen.getByRole("button", { name: /Generate Interview Prep Pack/i }));
    fireEvent.click(screen.getByRole("button", { name: /Regenerate Questions/i }));
    fireEvent.click(screen.getByRole("button", { name: /Regenerate Talking Points/i }));
    fireEvent.click(screen.getByRole("button", { name: /Regenerate STAR Drafts/i }));
    fireEvent.click(screen.getByRole("button", { name: /Save Interview Prep Edits/i }));
    fireEvent.click(screen.getByRole("button", { name: /Copy Prep Pack/i }));
    fireEvent.click(screen.getByRole("button", { name: /Export Prep Pack/i }));
    fireEvent.click(screen.getByRole("button", { name: /Sync Resume Profile/i }));
    fireEvent.click(screen.getByRole("button", { name: /Generate Resume Tuning/i }));
    fireEvent.click(screen.getByRole("button", { name: /Copy Tuning Suggestions/i }));
    fireEvent.click(screen.getByRole("button", { name: /Export Tuning Suggestions/i }));
    fireEvent.click(screen.getByRole("button", { name: /TypeScript/i }));
    fireEvent.click(screen.getByRole("button", { name: /React/i }));

    expect(props.onSetStatus).toHaveBeenCalledWith("submitted");
    expect(props.onSaveOps).toHaveBeenCalled();
    expect(props.onSetNextAction).toHaveBeenCalledWith(1);
    expect(props.onAddStage).toHaveBeenCalled();
    expect(props.onAnalyzeFit).toHaveBeenCalled();
    expect(props.onScoreDesirability).toHaveBeenCalledWith(false);
    expect(props.onScoreDesirability).toHaveBeenCalledWith(true);
    expect(props.onLogOutcome).toHaveBeenCalled();
    expect(props.onGenerateCoverLetter).toHaveBeenCalled();
    expect(props.onGenerateQA).toHaveBeenCalled();
    expect(props.onGenerateInterviewPrep).toHaveBeenCalled();
    expect(props.onRegenerateInterviewPrepSection).toHaveBeenCalledWith("likely_questions");
    expect(props.onRegenerateInterviewPrepSection).toHaveBeenCalledWith("talking_points");
    expect(props.onRegenerateInterviewPrepSection).toHaveBeenCalledWith("star_stories");
    expect(props.onSaveInterviewPrepEdits).toHaveBeenCalled();
    expect(props.onCopyInterviewPrep).toHaveBeenCalled();
    expect(props.onExportInterviewPrep).toHaveBeenCalled();
    expect(props.onSyncResumeProfile).toHaveBeenCalled();
    expect(props.onGenerateResumeTuning).toHaveBeenCalled();
    expect(props.onCopyResumeTuning).toHaveBeenCalled();
    expect(props.onExportResumeTuning).toHaveBeenCalled();
    expect(props.onOpenSkill).toHaveBeenCalledWith(10);
    expect(props.onOpenSkill).toHaveBeenCalledWith(11);
    expect(screen.getByText(/Strong fit/i)).toBeInTheDocument();
    expect(screen.getAllByText("Traceability").length).toBeGreaterThan(0);
  });

  it("renders fallback branches when optional data is missing", () => {
    render(
      <RoleDetailModal
        {...baseProps}
        role={{
          ...role,
          application_ops: {
            ...role.application_ops,
            needs_attention: false,
            attention_reasons: [],
          },
          interview_stage_timeline: [],
          latest_fit_analysis: null,
          latest_desirability_score: null,
          status_history: [],
          skills: { required: [], preferred: [] },
        }}
      />,
    );

    expect(screen.getByText(/No urgent follow-up flags/i)).toBeInTheDocument();
    expect(screen.getByText(/No interview stage updates yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No fit analysis generated yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No desirability score generated yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No outcomes logged yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No application materials generated yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No interview prep packs generated yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No resume tuning suggestions generated yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No status changes yet/i)).toBeInTheDocument();
  });

  it("covers helper-based labels and fallback function paths", () => {
    const props = {
      ...baseProps,
      applicationMaterials: [
        {
          id: 8,
          role_id: 1,
          artifact_type: "application_qa" as const,
          version: 2,
          content: "Answer content",
          questions: ["Why?"],
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          fallback_used: false,
          created_at: "2026-03-18T12:00:00.000Z",
        },
        {
          id: 9,
          role_id: 1,
          artifact_type: "custom_artifact" as never,
          version: 3,
          content: "Custom",
          questions: null,
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          fallback_used: true,
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      interviewPrepPacks: [
        {
          id: 10,
          role_id: 1,
          artifact_type: "interview_prep_pack" as const,
          version: 2,
          sections: {
            likely_questions: ["Why now?"],
            talking_points: ["Impact"],
            star_stories: ["Story"],
          },
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          fallback_used: false,
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      resumeTuningSuggestions: [
        {
          id: 11,
          role_id: 1,
          artifact_type: "resume_tuning" as const,
          version: 2,
          sections: {
            keep_bullets: ["Keep"],
            remove_bullets: ["Remove"],
            emphasize_bullets: ["Emphasize"],
            missing_keywords: ["Keyword"],
            summary_tweaks: ["Summary"],
            confidence_notes: ["Confidence"],
          },
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          fallback_used: false,
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      selectedMaterialId: 8,
      selectedInterviewPrepId: 10,
      selectedResumeTuningId: 11,
      role: {
        ...role,
        latest_fit_analysis: {
          ...role.latest_fit_analysis!,
          fallback_used: false,
          recommendation: "go" as const,
          missing_preferred_skills: [],
          rationale_citations: [],
          unsupported_claims: [],
        },
        latest_desirability_score: {
          ...role.latest_desirability_score!,
          fallback_used: false,
        },
      },
    };

    render(<RoleDetailModal {...props} />);

    expect(screen.getAllByText(/Application Q&A/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Model output/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No explicit gaps/i)).toBeInTheDocument();
  });

  it("forwards all input change handlers and close action", () => {
    const props = {
      ...baseProps,
      applicationMaterials: [
        {
          id: 4,
          role_id: 1,
          artifact_type: "cover_letter" as const,
          version: 1,
          content: "Dear team",
          questions: null,
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      interviewPrepPacks: [
        {
          id: 5,
          role_id: 1,
          artifact_type: "interview_prep_pack" as const,
          version: 1,
          sections: {
            likely_questions: ["Why?"],
            talking_points: ["Impact"],
            star_stories: ["Story"],
          },
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      resumeTuningSuggestions: [
        {
          id: 6,
          role_id: 1,
          artifact_type: "resume_tuning" as const,
          version: 1,
          sections: {
            keep_bullets: ["Keep"],
            remove_bullets: ["Remove"],
            emphasize_bullets: ["Emphasize"],
            missing_keywords: ["TypeScript"],
            summary_tweaks: ["Lead"],
            confidence_notes: ["Note"],
          },
          provider: "browser-local",
          model: "template-v1",
          prompt_version: "v1",
          created_at: "2026-03-18T12:00:00.000Z",
        },
      ],
      selectedMaterialId: 4,
      selectedInterviewPrepId: 5,
      selectedResumeTuningId: 6,
      role,
    };

    render(<RoleDetailModal {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /Close/i }));
    fireEvent.change(screen.getByLabelText(/Applied at/i), {
      target: { value: "2026-03-21T09:30" },
    });
    fireEvent.change(screen.getByLabelText(/Deadline/i), {
      target: { value: "2026-03-22T09:30" },
    });
    fireEvent.change(screen.getByDisplayValue("LinkedIn"), {
      target: { value: "Referral" },
    });
    fireEvent.change(screen.getByDisplayValue("recruiter"), {
      target: { value: "new recruiter" },
    });
    fireEvent.change(screen.getByDisplayValue("ops notes"), {
      target: { value: "updated ops note" },
    });
    fireEvent.change(screen.getByLabelText(/Next action date/i), {
      target: { value: "2026-03-23T11:00" },
    });
    fireEvent.change(screen.getByLabelText(/Add stage/i), {
      target: { value: "technical" },
    });
    fireEvent.change(screen.getByDisplayValue("stage notes"), {
      target: { value: "updated stage note" },
    });
    fireEvent.change(screen.getByLabelText(/Outcome type/i), {
      target: { value: "offer" },
    });
    fireEvent.change(screen.getByLabelText(/Outcome notes/i), {
      target: { value: "Outcome summary" },
    });
    fireEvent.change(screen.getByDisplayValue("Why this role?"), {
      target: { value: "Why now?" },
    });
    fireEvent.change(screen.getByDisplayValue("Question 1"), {
      target: { value: "Question 2" },
    });
    fireEvent.change(screen.getByDisplayValue("Point 1"), {
      target: { value: "Point 2" },
    });
    fireEvent.change(screen.getByDisplayValue("Story 1"), {
      target: { value: "Story 2" },
    });
    fireEvent.change(screen.getByLabelText(/Saved drafts/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/Saved prep versions/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/Saved resume tuning versions/i), {
      target: { value: "6" },
    });

    expect(props.onClose).toHaveBeenCalled();
    expect(props.onSetOpsAppliedAt).toHaveBeenCalledWith("2026-03-21T09:30");
    expect(props.onSetOpsDeadlineAt).toHaveBeenCalledWith("2026-03-22T09:30");
    expect(props.onSetOpsSource).toHaveBeenCalledWith("Referral");
    expect(props.onSetOpsRecruiterContact).toHaveBeenCalledWith("new recruiter");
    expect(props.onSetOpsNotes).toHaveBeenCalledWith("updated ops note");
    expect(props.onSetOpsNextActionAt).toHaveBeenCalledWith("2026-03-23T11:00");
    expect(props.onSetNewStage).toHaveBeenCalledWith("technical");
    expect(props.onSetStageNotes).toHaveBeenCalledWith("updated stage note");
    expect(props.onSetNewOutcomeType).toHaveBeenCalledWith("offer");
    expect(props.onSetNewOutcomeNotes).toHaveBeenCalledWith("Outcome summary");
    expect(props.onSetQaQuestionsInput).toHaveBeenCalledWith("Why now?");
    expect(props.onEditLikelyQuestions).toHaveBeenCalledWith("Question 2");
    expect(props.onEditTalkingPoints).toHaveBeenCalledWith("Point 2");
    expect(props.onEditStarStories).toHaveBeenCalledWith("Story 2");
    expect(props.onSetMaterialId).toHaveBeenCalledWith(4);
    expect(props.onSetSelectedInterviewPrepId).toHaveBeenCalledWith(5);
    expect(props.onSetSelectedResumeTuningId).toHaveBeenCalledWith(6);
  });
});
