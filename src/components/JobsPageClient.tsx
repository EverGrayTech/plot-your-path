"use client";

import React, { useState } from "react";

import { useJobDetailState } from "../lib/useJobDetailState";
import { useJobsBoard } from "../lib/useJobsBoard";
import { useJobsFeatureModals } from "../lib/useJobsFeatureModals";
import { CaptureJobForm } from "./CaptureJobForm";
import { Modal } from "./Modal";
import { AISettingsModal } from "./jobs/AISettingsModal";
import { FactorSettingsModal } from "./jobs/FactorSettingsModal";
import { JobDetailModal } from "./jobs/JobDetailModal";
import { JobsList } from "./jobs/JobsList";
import { JobsToolbar } from "./jobs/JobsToolbar";
import { OutcomeInsightsModal } from "./jobs/OutcomeInsightsModal";
import { PipelineModal } from "./jobs/PipelineModal";
import { SkillDetailModal } from "./jobs/SkillDetailModal";

export function JobsPageClient() {
  const {
    applyCaptureResult,
    captureNotice,
    desirabilityFilter,
    listError,
    loadJobs,
    loadingJobs,
    recommendationFilter,
    search,
    setDesirabilityFilter,
    setRecommendationFilter,
    setSearch,
    setSortMode,
    smartSortDescription,
    sortMode,
    sortedJobs,
  } = useJobsBoard();

  const [showCaptureModal, setShowCaptureModal] = useState(false);

  const {
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
  } = useJobDetailState({ loadJobs });

  const {
    aiSettings,
    aiSettingsError,
    aiSettingsLoading,
    closeAISettings,
    closeFactorSettings,
    closeOutcomeInsights,
    closePipeline,
    factors,
    factorsError,
    factorsLoading,
    handleAddFactor,
    handleClearToken,
    handleDeleteFactor,
    handleHealthcheck,
    handleMoveFactor,
    handleUpdateAIConfig,
    handleUpdateFactor,
    handleUpdateToken,
    healthByFamily,
    newFactorName,
    newFactorPrompt,
    newFactorWeight,
    openAISettings,
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
    setTokenInputs,
    showAISettings,
    showFactorSettings,
    showOutcomeInsights,
    showPipeline,
    tokenInputs,
    tuningSuggestions,
  } = useJobsFeatureModals();

  return (
    <section>
      <JobsToolbar
        desirabilityFilter={desirabilityFilter}
        onOpenAISettings={openAISettings}
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

      <JobsList
        captureNotice={captureNotice}
        jobs={sortedJobs}
        listError={listError}
        loadingJobs={loadingJobs}
        onOpenCapture={() => setShowCaptureModal(true)}
        onSelectJob={openJobDetail}
      />

      {showCaptureModal ? (
        <Modal onClose={() => setShowCaptureModal(false)} title="Capture Job">
          <CaptureJobForm
            onCaptured={(result) => {
              applyCaptureResult(result);
              openJobDetail(result.role_id);
              setShowCaptureModal(false);
              void loadJobs();
            }}
          />
        </Modal>
      ) : null}

      {selectedRoleId ? (
        <JobDetailModal
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
          job={selectedJob}
          loadingDetail={loadingDetail}
          loadingMaterials={loadingMaterials}
          materialsError={materialsError}
          newOutcomeNotes={newOutcomeNotes}
          newOutcomeOccurredAt={newOutcomeOccurredAt}
          newOutcomeType={newOutcomeType}
          newStage={newStage}
          onAddStage={handleAddStage}
          onAnalyzeFit={handleAnalyzeFit}
          onClose={closeJobDetail}
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

      {showAISettings ? (
        <AISettingsModal
          aiSettings={aiSettings}
          error={aiSettingsError}
          healthByFamily={healthByFamily}
          loading={aiSettingsLoading}
          onClearToken={handleClearToken}
          onClose={closeAISettings}
          onHealthcheck={handleHealthcheck}
          onTokenInputChange={(family, value) =>
            setTokenInputs((previous) => ({
              ...previous,
              [family]: value,
            }))
          }
          onUpdateConfig={handleUpdateAIConfig}
          onUpdateToken={handleUpdateToken}
          tokenInputs={tokenInputs}
        />
      ) : null}

      {showPipeline ? (
        <PipelineModal
          counters={pipelineCounters}
          error={pipelineError}
          items={pipelineItems}
          loading={pipelineLoading}
          onClose={closePipeline}
          onOpenJob={(roleId) => {
            closePipeline();
            openJobDetail(roleId);
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
          onOpenJob={(jobId) => {
            closeSkillDetail();
            openJobDetail(jobId);
          }}
          skill={selectedSkill}
        />
      ) : null}
    </section>
  );
}
