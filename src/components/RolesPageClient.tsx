"use client";

import React, { useState } from "react";

import { useRoleDetailState } from "../lib/useRoleDetailState";
import { useRolesBoard } from "../lib/useRolesBoard";
import { useRolesFeatureModals } from "../lib/useRolesFeatureModals";
import { CaptureRoleForm } from "./CaptureRoleForm";
import { Modal } from "./Modal";
import { FactorSettingsModal } from "./roles/FactorSettingsModal";
import { OutcomeInsightsModal } from "./roles/OutcomeInsightsModal";
import { PipelineModal } from "./roles/PipelineModal";
import { RoleDetailModal } from "./roles/RoleDetailModal";
import { RolesList } from "./roles/RolesList";
import { RolesToolbar } from "./roles/RolesToolbar";
import { SkillDetailModal } from "./roles/SkillDetailModal";

export function RolesPageClient() {
  const {
    applyCaptureResult,
    captureNotice,
    desirabilityFilter,
    listError,
    loadRoles,
    loadingRoles,
    recommendationFilter,
    search,
    setDesirabilityFilter,
    setRecommendationFilter,
    setSearch,
    setSortMode,
    smartSortDescription,
    sortMode,
    sortedRoles,
  } = useRolesBoard();

  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const {
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
  } = useRoleDetailState({ loadRoles });

  const {
    closeFactorSettings,
    closeOutcomeInsights,
    closePipeline,
    factors,
    factorsError,
    factorsLoading,
    handleAddFactor,
    handleDeleteFactor,
    handleMoveFactor,
    handleUpdateFactor,
    newFactorName,
    newFactorPrompt,
    newFactorWeight,
    openFactorSettings,
    openOutcomeInsights,
    openPipeline,
    outcomeInsights,
    outcomeInsightsError,
    outcomeInsightsLoading,
    pipelineCounters,
    pipelineError,
    pipelineItems,
    pipelineLoading,
    pipelineOverdueOnly,
    pipelineRecentlyUpdated,
    pipelineStageFilter,
    pipelineWeekDeadlines,
    setNewFactorName,
    setNewFactorPrompt,
    setNewFactorWeight,
    setPipelineOverdueOnly,
    setPipelineRecentlyUpdated,
    setPipelineStageFilter,
    setPipelineWeekDeadlines,
    showFactorSettings,
    showOutcomeInsights,
    showPipeline,
    tuningSuggestions,
  } = useRolesFeatureModals();

  return (
    <section>
      <RolesToolbar
        desirabilityFilter={desirabilityFilter}
        onOpenCapture={() => setShowCaptureModal(true)}
        onOpenFactorSettings={openFactorSettings}
        onOpenOutcomeInsights={openOutcomeInsights}
        onOpenPipeline={openPipeline}
        recommendationFilter={recommendationFilter}
        search={search}
        setDesirabilityFilter={setDesirabilityFilter}
        setRecommendationFilter={setRecommendationFilter}
        setSearch={setSearch}
        setSortMode={setSortMode}
        smartSortDescription={smartSortDescription}
        sortMode={sortMode}
      />

      <RolesList
        captureNotice={captureNotice}
        roles={sortedRoles}
        listError={listError}
        loadingRoles={loadingRoles}
        onOpenCapture={() => setShowCaptureModal(true)}
        onSelectRole={openRoleDetail}
      />

      {showCaptureModal ? (
        <Modal onClose={() => setShowCaptureModal(false)} title="Capture Role">
          <CaptureRoleForm
            onCaptured={(result) => {
              applyCaptureResult(result);
              openRoleDetail(result.role_id);
              setShowCaptureModal(false);
              void loadRoles();
            }}
          />
        </Modal>
      ) : null}

      {selectedRoleId ? (
        <RoleDetailModal
          analyzingFit={analyzingFit}
          applicationMaterials={applicationMaterials}
          detailError={detailError}
          desirabilityError={desirabilityError}
          editingLikelyQuestions={editingLikelyQuestions}
          editingStarStories={editingStarStories}
          editingTalkingPoints={editingTalkingPoints}
          fitError={fitError}
          generatingCoverLetter={generatingCoverLetter}
          generatingInterviewPrep={generatingInterviewPrep}
          generatingQA={generatingQA}
          generatingResumeTuning={generatingResumeTuning}
          interviewPrepError={interviewPrepError}
          interviewPrepLoading={interviewPrepLoading}
          interviewPrepPacks={interviewPrepPacks}
          role={selectedRole}
          loadingDetail={loadingDetail}
          loadingMaterials={loadingMaterials}
          materialsError={materialsError}
          newOutcomeNotes={newOutcomeNotes}
          newOutcomeOccurredAt={newOutcomeOccurredAt}
          newOutcomeType={newOutcomeType}
          newStage={newStage}
          onAddStage={handleAddStage}
          onAnalyzeFit={handleAnalyzeFit}
          onClose={closeRoleDetail}
          onCopyInterviewPrep={handleCopyInterviewPrep}
          onCopyResumeTuning={handleCopyResumeTuning}
          onEditLikelyQuestions={setEditingLikelyQuestions}
          onEditStarStories={setEditingStarStories}
          onEditTalkingPoints={setEditingTalkingPoints}
          onExportInterviewPrep={handleExportInterviewPrep}
          onExportResumeTuning={handleExportResumeTuning}
          onGenerateCoverLetter={handleGenerateCoverLetter}
          onGenerateInterviewPrep={handleGenerateInterviewPrep}
          onGenerateQA={handleGenerateQA}
          onGenerateResumeTuning={handleGenerateResumeTuning}
          onLogOutcome={handleAddOutcomeEvent}
          onOpenSkill={openSkillDetail}
          onRegenerateInterviewPrepSection={handleRegenerateInterviewPrepSection}
          onSaveInterviewPrepEdits={handleSaveInterviewPrepEdits}
          onSaveOps={handleSaveOps}
          onScoreDesirability={handleScoreDesirability}
          onSetMaterialId={setSelectedMaterialId}
          onSetNewOutcomeNotes={setNewOutcomeNotes}
          onSetNewOutcomeOccurredAt={setNewOutcomeOccurredAt}
          onSetNewOutcomeType={setNewOutcomeType}
          onSetNewStage={setNewStage}
          onSetNextAction={handleSetNextAction}
          onSetOpsAppliedAt={setOpsAppliedAt}
          onSetOpsDeadlineAt={setOpsDeadlineAt}
          onSetOpsNextActionAt={setOpsNextActionAt}
          onSetOpsNotes={setOpsNotes}
          onSetOpsRecruiterContact={setOpsRecruiterContact}
          onSetOpsSource={setOpsSource}
          onSetQaQuestionsInput={setQaQuestionsInput}
          onSetSelectedInterviewPrepId={setSelectedInterviewPrepId}
          onSetSelectedResumeTuningId={setSelectedResumeTuningId}
          onSetStageNotes={setStageNotes}
          onSetStageOccurredAt={setStageOccurredAt}
          onSetStatus={handleStatusChange}
          onSyncResumeProfile={handleSyncResumeProfile}
          opsAppliedAt={opsAppliedAt}
          opsDeadlineAt={opsDeadlineAt}
          opsError={opsError}
          opsNextActionAt={opsNextActionAt}
          opsNotes={opsNotes}
          opsRecruiterContact={opsRecruiterContact}
          opsSaving={opsSaving}
          opsSource={opsSource}
          outcomeEvents={outcomeEvents}
          outcomesError={outcomesError}
          outcomesLoading={outcomesLoading}
          qaQuestionsInput={qaQuestionsInput}
          regeneratingSection={regeneratingSection}
          resumeSyncNotice={resumeSyncNotice}
          resumeTuningError={resumeTuningError}
          resumeTuningLoading={resumeTuningLoading}
          resumeTuningSuggestions={resumeTuningSuggestions}
          savingInterviewPrep={savingInterviewPrep}
          savingOutcome={savingOutcome}
          scoringDesirability={scoringDesirability}
          selectedInterviewPrepId={selectedInterviewPrepId}
          selectedMaterialId={selectedMaterialId}
          selectedResumeTuningId={selectedResumeTuningId}
          stageNotes={stageNotes}
          stageOccurredAt={stageOccurredAt}
          stageSaving={stageSaving}
          statusError={statusError}
          syncingResumeProfile={syncingResumeProfile}
          updatingStatus={updatingStatus}
        />
      ) : null}

      {showFactorSettings ? (
        <FactorSettingsModal
          error={factorsError}
          factors={factors}
          loading={factorsLoading}
          newFactorName={newFactorName}
          newFactorPrompt={newFactorPrompt}
          newFactorWeight={newFactorWeight}
          onAddFactor={handleAddFactor}
          onClose={closeFactorSettings}
          onDeleteFactor={handleDeleteFactor}
          onMoveFactor={handleMoveFactor}
          onSetNewFactorName={setNewFactorName}
          onSetNewFactorPrompt={setNewFactorPrompt}
          onSetNewFactorWeight={setNewFactorWeight}
          onUpdateFactor={handleUpdateFactor}
        />
      ) : null}

      {showPipeline ? (
        <PipelineModal
          counters={pipelineCounters}
          error={pipelineError}
          items={pipelineItems}
          loading={pipelineLoading}
          onClose={closePipeline}
          onOpenRole={(roleId) => {
            closePipeline();
            openRoleDetail(roleId);
          }}
          pipelineOverdueOnly={pipelineOverdueOnly}
          pipelineRecentlyUpdated={pipelineRecentlyUpdated}
          pipelineStageFilter={pipelineStageFilter}
          pipelineWeekDeadlines={pipelineWeekDeadlines}
          setPipelineOverdueOnly={setPipelineOverdueOnly}
          setPipelineRecentlyUpdated={setPipelineRecentlyUpdated}
          setPipelineStageFilter={setPipelineStageFilter}
          setPipelineWeekDeadlines={setPipelineWeekDeadlines}
        />
      ) : null}

      {showOutcomeInsights ? (
        <OutcomeInsightsModal
          error={outcomeInsightsError}
          insights={outcomeInsights}
          loading={outcomeInsightsLoading}
          onClose={closeOutcomeInsights}
          tuningSuggestions={tuningSuggestions}
        />
      ) : null}

      {selectedSkillId ? (
        <SkillDetailModal
          error={skillDetailError}
          loading={loadingSkillDetail}
          onClose={closeSkillDetail}
          onOpenRole={(roleId) => {
            closeSkillDetail();
            openRoleDetail(roleId);
          }}
          skill={selectedSkill}
        />
      ) : null}
    </section>
  );
}
