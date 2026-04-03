export {
  analyzeLocalRoleFit as analyzeRoleFit,
  generateLocalCoverLetter as generateCoverLetter,
  generateLocalInterviewPrepPack as generateInterviewPrepPack,
  generateLocalQuestionAnswers as generateQuestionAnswers,
  generateLocalResumeTuning as generateResumeTuning,
  listLocalApplicationMaterials as listApplicationMaterials,
  listLocalDesirabilityFactors as listDesirabilityFactors,
  listLocalInterviewPrepPacks as listInterviewPrepPacks,
  listLocalResumeTuning as listResumeTuning,
  refreshLocalRoleDesirability as refreshDesirabilityScore,
  regenerateLocalInterviewPrepSection as regenerateInterviewPrepSection,
  scoreLocalRoleDesirability as scoreRoleDesirability,
  syncLocalResumeProfile as syncResumeProfile,
  updateLocalInterviewPrepPack as updateInterviewPrepPack,
} from "./localAi";
export {
  addLocalInterviewStage as updateInterviewStage,
  addLocalOutcomeEvent as createOutcomeEvent,
  getLocalApplicationOps as getApplicationOps,
  listAllLocalOutcomeEvents,
  listLocalInterviewStages as listInterviewStages,
  listLocalOutcomeEvents as listOutcomeEvents,
  listLocalPipeline as listPipeline,
  updateLocalNextAction as updateNextAction,
  upsertLocalApplicationOps as upsertApplicationOps,
} from "./localApplicationWorkflows";
export {
  captureLocalRole as captureRole,
  getLocalRole as getRole,
  getLocalSkill as getSkill,
  listLocalRoles as listRoles,
  listLocalSkills as listSkills,
  updateLocalRoleStatus as updateRoleStatus,
} from "./localRoles";
export {
  exportLocalDataArchive as exportDataArchive,
  getLocalDataPortabilitySummary as getDataPortabilitySummary,
  importLocalDataArchive as importDataArchive,
  resetLocalWorkspace as resetDataWorkspace,
} from "./localPortability";

export type {
  ApplicationMaterial,
  ApplicationOps,
  ApplicationOpsUpdate,
  CompanySummary,
  DataOperationResult,
  DataPortabilitySummary,
  DesirabilityFactor,
  DesirabilityFactorCreate,
  DesirabilityFactorScore,
  DesirabilityFactorUpdate,
  DesirabilityScore,
  FitAnalysis,
  InterviewPrepPack,
  InterviewPrepPackSections,
  InterviewPrepSectionKey,
  InterviewStage,
  InterviewStageEvent,
  InterviewStageEventCreate,
  RoleDetail,
  RoleListItem,
  RoleCaptureRequest,
  RoleCaptureResponse,
  RoleSkillItem,
  OutcomeConversionRow,
  OutcomeEvent,
  OutcomeEventCreate,
  OutcomeEventType,
  OutcomeInsights,
  OutcomeTuningSuggestions,
  OutputCitation,
  PipelineCounters,
  PipelineItem,
  PipelineResponse,
  ResumeProfileSyncResult,
  ResumeTuningSections,
  ResumeTuningSuggestion,
  RoleStatus,
  RoleStatusChange,
  SalaryInfo,
  SectionTraceability,
  SkillDetail,
  SkillRoleReference,
  SkillListItem,
  TuningSuggestion,
} from "./dataModels";

import type {
  DesirabilityFactor,
  DesirabilityFactorCreate,
  DesirabilityFactorUpdate,
  OutcomeConversionRow,
  OutcomeEventType,
  OutcomeInsights,
  OutcomeTuningSuggestions,
} from "./dataModels";
import { listAllLocalOutcomeEvents } from "./localApplicationWorkflows";
import { listLocalRoles } from "./localRoles";

export async function getOutcomeInsights(): Promise<OutcomeInsights> {
  const outcomeEvents = await listAllLocalOutcomeEvents();
  const roles = await listLocalRoles();

  const eventsWithRoles = outcomeEvents
    .map((event) => ({
      event,
      role: roles.find((role) => role.id === event.role_id) ?? null,
    }))
    .filter((row) => row.role !== null);

  const rolesWithOutcomes = new Set(eventsWithRoles.map(({ event }) => event.role_id));
  const hires = new Set<OutcomeEventType>(["offer"]);

  const summarize = <T extends string | null>(
    values: Array<{ key: T; hired: boolean }>,
    formatter: (key: T) => string,
  ): OutcomeConversionRow[] => {
    const buckets = new Map<string, { attempts: number; hires: number }>();
    for (const value of values) {
      const segment = formatter(value.key);
      const bucket = buckets.get(segment) ?? { attempts: 0, hires: 0 };
      bucket.attempts += 1;
      if (value.hired) {
        bucket.hires += 1;
      }
      buckets.set(segment, bucket);
    }

    return Array.from(buckets.entries()).map(([segment, counts]) => ({
      segment,
      attempts: counts.attempts,
      hires: counts.hires,
      conversion_rate: counts.attempts ? counts.hires / counts.attempts : null,
    }));
  };

  const toFitBand = (score: number | null) => {
    if (score == null) return "Unknown";
    if (score >= 70) return "70-100";
    if (score >= 40) return "40-69";
    return "0-39";
  };

  const toDesirabilityBand = (score: number | null) => {
    if (score == null) return "Unknown";
    if (score >= 7) return "7.0-10.0";
    if (score >= 4) return "4.0-6.9";
    return "0.0-3.9";
  };

  const conversionRows = eventsWithRoles.flatMap(({ event, role }) => {
    if (!role) {
      return [];
    }

    return [
      {
        event,
        role,
      },
    ];
  });

  return {
    confidence_message:
      conversionRows.length < 5 ? "Low confidence: early signal only." : "Moderate confidence.",
    conversion_by_fit_band: summarize(
      conversionRows.map(({ event, role }) => ({
        key: toFitBand(role.fit_score),
        hired: hires.has(event.event_type),
      })),
      (key) => key ?? "Unknown",
    ),
    conversion_by_desirability_band: summarize(
      conversionRows.map(({ event, role }) => ({
        key: toDesirabilityBand(role.desirability_score),
        hired: hires.has(event.event_type),
      })),
      (key) => key ?? "Unknown",
    ),
    conversion_by_model_family: summarize(
      conversionRows.map(({ event }) => ({
        key: event.model_family ?? "unknown",
        hired: hires.has(event.event_type),
      })),
      (key) => key ?? "unknown",
    ),
    total_events: conversionRows.length,
    total_roles_with_outcomes: rolesWithOutcomes.size,
  };
}

export async function getOutcomeTuningSuggestions(): Promise<OutcomeTuningSuggestions> {
  const insights = await getOutcomeInsights();
  const openAiRow = insights.conversion_by_model_family.find((row) => row.segment === "openai");

  return {
    confidence_message: insights.confidence_message,
    suggestions:
      openAiRow || insights.total_events === 0
        ? [
            {
              recommendation: "Prefer openai for new drafts.",
              rationale: "Current conversion appears stronger.",
              reversible_action: "Re-check after 5 additional events.",
            },
          ]
        : [],
  };
}

export async function createDesirabilityFactor(
  payload: DesirabilityFactorCreate,
): Promise<DesirabilityFactor> {
  void payload;
  throw new Error("Desirability factor mutation is not available in the browser-local MVP path.");
}

export async function deleteDesirabilityFactor(factorId: number): Promise<void> {
  void factorId;
  throw new Error("Desirability factor mutation is not available in the browser-local MVP path.");
}

export async function reorderDesirabilityFactors(
  factorIds: number[],
): Promise<DesirabilityFactor[]> {
  void factorIds;
  throw new Error("Desirability factor reordering is not available in the browser-local MVP path.");
}

export async function updateDesirabilityFactor(
  factorId: number,
  payload: DesirabilityFactorUpdate,
): Promise<DesirabilityFactor> {
  void factorId;
  void payload;
  throw new Error("Desirability factor mutation is not available in the browser-local MVP path.");
}
