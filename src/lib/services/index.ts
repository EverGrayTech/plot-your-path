import * as api from "../browserApi";
import type { FrontendServices } from "./types";

export function createFrontendServices(): FrontendServices {
  return {
    jobs: {
      getJob: api.getJob,
      listJobs: api.listJobs,
      scrapeJob: api.scrapeJob,
      updateJobStatus: api.updateJobStatus,
    },
    skills: {
      getSkill: api.getSkill,
      listSkills: api.listSkills,
    },
    workflows: {
      createOutcomeEvent: api.createOutcomeEvent,
      getApplicationOps: api.getApplicationOps,
      getOutcomeInsights: api.getOutcomeInsights,
      getOutcomeTuningSuggestions: api.getOutcomeTuningSuggestions,
      listInterviewStages: api.listInterviewStages,
      listOutcomeEvents: api.listOutcomeEvents,
      listPipeline: api.listPipeline,
      updateInterviewStage: api.updateInterviewStage,
      updateNextAction: api.updateNextAction,
      upsertApplicationOps: api.upsertApplicationOps,
    },
    aiSettings: {
      clearAISettingToken: api.clearAISettingToken,
      healthcheckAISetting: api.healthcheckAISetting,
      listAISettings: api.listAISettings,
      updateAISetting: api.updateAISetting,
      updateAISettingToken: api.updateAISettingToken,
    },
    aiGeneration: {
      analyzeJobFit: api.analyzeJobFit,
      generateCoverLetter: api.generateCoverLetter,
      generateInterviewPrepPack: api.generateInterviewPrepPack,
      generateQuestionAnswers: api.generateQuestionAnswers,
      generateResumeTuning: api.generateResumeTuning,
      listApplicationMaterials: api.listApplicationMaterials,
      listInterviewPrepPacks: api.listInterviewPrepPacks,
      listResumeTuning: api.listResumeTuning,
      refreshDesirabilityScore: api.refreshDesirabilityScore,
      regenerateInterviewPrepSection: api.regenerateInterviewPrepSection,
      scoreJobDesirability: api.scoreJobDesirability,
      syncResumeProfile: api.syncResumeProfile,
      updateInterviewPrepPack: api.updateInterviewPrepPack,
    },
    desirabilityFactors: {
      createDesirabilityFactor: api.createDesirabilityFactor,
      deleteDesirabilityFactor: api.deleteDesirabilityFactor,
      listDesirabilityFactors: api.listDesirabilityFactors,
      reorderDesirabilityFactors: api.reorderDesirabilityFactors,
      updateDesirabilityFactor: api.updateDesirabilityFactor,
    },
    portability: {
      exportDataArchive: api.exportDataArchive,
      getDataPortabilitySummary: api.getDataPortabilitySummary,
      importDataArchive: api.importDataArchive,
      resetDataWorkspace: api.resetDataWorkspace,
    },
  };
}

let frontendServices: FrontendServices | null = null;

export function getFrontendServices(): FrontendServices {
  frontendServices ??= createFrontendServices();
  return frontendServices;
}

export function setFrontendServicesForTests(services: FrontendServices | null): void {
  frontendServices = services;
}
