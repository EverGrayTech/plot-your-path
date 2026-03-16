export interface JobScrapeRequest {
  url: string;
  fallback_text?: string;
}

import {
  analyzeLocalJobFit,
  clearLocalAISettingToken,
  generateLocalCoverLetter,
  generateLocalInterviewPrepPack,
  generateLocalQuestionAnswers,
  generateLocalResumeTuning,
  healthcheckLocalAISetting,
  listLocalAISettings,
  listLocalApplicationMaterials,
  listLocalDesirabilityFactors,
  listLocalInterviewPrepPacks,
  listLocalResumeTuning,
  refreshLocalJobDesirability,
  regenerateLocalInterviewPrepSection,
  scoreLocalJobDesirability,
  syncLocalResumeProfile,
  updateLocalAISetting,
  updateLocalAISettingToken,
  updateLocalInterviewPrepPack,
} from "./localAi";
import {
  addLocalInterviewStage,
  addLocalOutcomeEvent,
  getLocalApplicationOps,
  listAllLocalOutcomeEvents,
  listLocalInterviewStages,
  listLocalOutcomeEvents,
  listLocalPipeline,
  updateLocalNextAction,
  upsertLocalApplicationOps,
} from "./localApplicationWorkflows";
import {
  captureLocalJob,
  getLocalJob,
  getLocalSkill,
  listLocalJobs,
  listLocalSkills,
  updateLocalJobStatus,
} from "./localJobs";
import {
  exportLocalDataArchive,
  getLocalDataPortabilitySummary,
  importLocalDataArchive,
  resetLocalWorkspace,
} from "./localPortability";

export interface CompanySummary {
  id: number;
  name: string;
  slug: string;
  website: string | null;
  created_at: string;
}

export type RoleStatus = "open" | "submitted" | "interviewing" | "rejected";
export type InterviewStage =
  | "applied"
  | "recruiter_screen"
  | "hiring_manager"
  | "technical"
  | "onsite"
  | "offer"
  | "closed";

export type OutcomeEventType = "screen" | "interview" | "offer" | "rejected";

export interface RoleStatusChange {
  from_status: RoleStatus | null;
  to_status: RoleStatus;
  changed_at: string;
}

export interface InterviewStageEvent {
  id: number;
  role_id: number;
  stage: InterviewStage;
  notes: string | null;
  occurred_at: string;
  created_at: string;
}

export interface InterviewStageEventCreate {
  stage: InterviewStage;
  notes?: string | null;
  occurred_at: string;
}

export interface OutcomeEvent {
  id: number;
  role_id: number;
  event_type: OutcomeEventType;
  occurred_at: string;
  notes: string | null;
  fit_analysis_id: number | null;
  desirability_score_id: number | null;
  application_material_id: number | null;
  model_family: string | null;
  model: string | null;
  prompt_version: string | null;
  created_at: string;
}

export interface OutcomeEventCreate {
  event_type: OutcomeEventType;
  occurred_at: string;
  notes?: string | null;
  fit_analysis_id?: number | null;
  desirability_score_id?: number | null;
  application_material_id?: number | null;
  model_family?: string | null;
  model?: string | null;
  prompt_version?: string | null;
}

export interface OutcomeConversionRow {
  segment: string;
  attempts: number;
  hires: number;
  conversion_rate: number | null;
}

export interface OutcomeInsights {
  confidence_message: string;
  conversion_by_fit_band: OutcomeConversionRow[];
  conversion_by_desirability_band: OutcomeConversionRow[];
  conversion_by_model_family: OutcomeConversionRow[];
  total_events: number;
  total_roles_with_outcomes: number;
}

export interface TuningSuggestion {
  recommendation: string;
  rationale: string;
  reversible_action: string;
}

export interface OutcomeTuningSuggestions {
  confidence_message: string;
  suggestions: TuningSuggestion[];
}

export interface ApplicationOps {
  role_id: number;
  applied_at: string | null;
  deadline_at: string | null;
  source: string | null;
  recruiter_contact: string | null;
  notes: string | null;
  next_action_at: string | null;
  needs_attention: boolean;
  attention_reasons: string[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationOpsUpdate {
  applied_at?: string | null;
  deadline_at?: string | null;
  source?: string | null;
  recruiter_contact?: string | null;
  notes?: string | null;
  next_action_at?: string | null;
}

export interface PipelineCounters {
  needs_follow_up: number;
  overdue_actions: number;
  upcoming_deadlines: number;
}

export interface PipelineItem {
  role_id: number;
  company: string;
  title: string;
  status: RoleStatus;
  interview_stage: InterviewStage | null;
  next_action_at: string | null;
  deadline_at: string | null;
  needs_attention: boolean;
  attention_reasons: string[];
  updated_at: string;
}

export interface PipelineResponse {
  counters: PipelineCounters;
  items: PipelineItem[];
}

export type FitRecommendation = "go" | "maybe" | "no-go";
export type ApplicationArtifactType =
  | "cover_letter"
  | "application_qa"
  | "interview_prep_pack"
  | "resume_tuning";
export type InterviewPrepSectionKey = "likely_questions" | "talking_points" | "star_stories";

export interface ResumeProfileSyncResult {
  ingested_count: number;
  source_record_id: string;
  source_used: string;
}

export interface ResumeTuningSections {
  keep_bullets: string[];
  remove_bullets: string[];
  emphasize_bullets: string[];
  missing_keywords: string[];
  summary_tweaks: string[];
  confidence_notes: string[];
}

export interface OutputCitation {
  source_type: string;
  source_id: number | null;
  source_record_id: string | null;
  source_key: string;
  snippet_reference: string;
  confidence: number;
}

export interface SectionTraceability {
  section_key: string;
  citations: OutputCitation[];
  unsupported_claims: string[];
}

export interface ResumeTuningSuggestion {
  id: number;
  role_id: number;
  artifact_type: "resume_tuning";
  version: number;
  sections: ResumeTuningSections;
  provider: string;
  model: string;
  prompt_version: string;
  section_traceability?: SectionTraceability[];
  unsupported_claims?: string[];
  fallback_used?: boolean;
  created_at: string;
}

export interface InterviewPrepPackSections {
  likely_questions: string[];
  talking_points: string[];
  star_stories: string[];
}

export interface InterviewPrepPack {
  id: number;
  role_id: number;
  artifact_type: "interview_prep_pack";
  version: number;
  sections: InterviewPrepPackSections;
  provider: string;
  model: string;
  prompt_version: string;
  section_traceability?: SectionTraceability[];
  unsupported_claims?: string[];
  fallback_used?: boolean;
  created_at: string;
}

export interface DesirabilityFactor {
  id: number;
  name: string;
  prompt: string;
  weight: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type OperationFamily =
  | "job_parsing"
  | "desirability_scoring"
  | "application_generation"
  | "fit_analysis";

export interface AISetting {
  operation_family: OperationFamily;
  provider: string;
  model: string;
  api_key_env: string;
  base_url: string | null;
  temperature: number;
  max_tokens: number;
  has_runtime_token: boolean;
  token_masked: string | null;
  created_at: string;
  updated_at: string;
}

export interface AISettingUpdate {
  provider?: string;
  model?: string;
  api_key_env?: string;
  base_url?: string | null;
  temperature?: number;
  max_tokens?: number;
}

export interface AISettingHealth {
  operation_family: OperationFamily;
  ok: boolean;
  detail: string;
}

export interface DataPortabilitySummary {
  data_root: string | null;
  database_path: string | null;
  desktop_runtime: boolean;
  storage_mode?: "browser_local" | "desktop_local" | "transition";
  backup_reminder_level?: "none" | "recommended" | "overdue";
  backup_reminder_message?: string | null;
  has_resume: boolean;
  jobs_count: number;
  last_export_at: string | null;
  last_import_at: string | null;
  last_reset_at: string | null;
  skills_count: number;
}

export interface DataOperationResult {
  completed_at: string;
  message: string;
  added_count?: number;
  updated_count?: number;
  unchanged_count?: number;
}

export interface DesirabilityFactorCreate {
  name: string;
  prompt: string;
  weight: number;
  is_active: boolean;
  display_order: number;
}

export interface DesirabilityFactorUpdate {
  name?: string;
  prompt?: string;
  weight?: number;
  is_active?: boolean;
  display_order?: number;
}

export interface DesirabilityFactorScore {
  factor_id: number;
  factor_name: string;
  weight: number;
  score: number;
  reasoning: string;
  fallback_used?: boolean;
}

export type DesirabilityScoreScope = "company";

export interface DesirabilityScore {
  id: number;
  company_id: number;
  role_id: number;
  total_score: number;
  factor_breakdown: DesirabilityFactorScore[];
  score_scope: DesirabilityScoreScope;
  fallback_used: boolean;
  cache_expires_at: string;
  is_stale: boolean;
  provider: string;
  model: string;
  version: string;
  created_at: string;
}

export interface FitAnalysis {
  id: number;
  role_id: number;
  fit_score: number;
  recommendation: FitRecommendation;
  covered_required_skills: string[];
  adjacent_required_skills?: string[];
  missing_required_skills: string[];
  covered_preferred_skills: string[];
  adjacent_preferred_skills?: string[];
  missing_preferred_skills: string[];
  rationale: string;
  rationale_citations?: OutputCitation[];
  unsupported_claims?: string[];
  fallback_used?: boolean;
  confidence_label?: string;
  provider: string;
  model: string;
  version: string;
  created_at: string;
}

export interface ApplicationMaterial {
  id: number;
  role_id: number;
  artifact_type: ApplicationArtifactType;
  version: number;
  content: string;
  questions: string[] | null;
  section_traceability?: SectionTraceability[];
  unsupported_claims?: string[];
  fallback_used?: boolean;
  provider: string;
  model: string;
  prompt_version: string;
  created_at: string;
}

export interface SalaryInfo {
  min: number | null;
  max: number | null;
  currency: string;
}

export interface JobListItem {
  id: number;
  company: string;
  title: string;
  salary_range: string | null;
  created_at: string;
  skills_count: number;
  status: RoleStatus;
  fit_score: number | null;
  fit_recommendation: FitRecommendation | null;
  desirability_score: number | null;
  current_interview_stage?: InterviewStage | null;
  deadline_at?: string | null;
  next_action_at?: string | null;
  needs_attention?: boolean;
}

export interface JobDetail {
  id: number;
  company: CompanySummary;
  title: string;
  team_division: string | null;
  salary: SalaryInfo;
  url: string;
  skills: {
    required: JobSkillItem[];
    preferred: JobSkillItem[];
  };
  description_md: string;
  created_at: string;
  status: RoleStatus;
  status_history: RoleStatusChange[];
  application_ops?: ApplicationOps | null;
  interview_stage_timeline?: InterviewStageEvent[];
  latest_fit_analysis: FitAnalysis | null;
  latest_desirability_score: DesirabilityScore | null;
}

export interface JobSkillItem {
  id: number;
  name: string;
  requirement_level: "required" | "preferred";
}

export interface SkillListItem {
  id: number;
  name: string;
  category: string | null;
  usage_count: number;
}

export interface SkillDetail {
  id: number;
  name: string;
  category: string | null;
  usage_count: number;
  jobs: SkillJobReference[];
}

export interface SkillJobReference {
  id: number;
  company: string;
  title: string;
  status: RoleStatus;
  created_at: string;
}

export interface JobScrapeResponse {
  status: string;
  role_id: number;
  company: string;
  title: string;
  skills_extracted: number;
  processing_time_seconds: number;
}

export async function getJob(roleId: number): Promise<JobDetail> {
  return getLocalJob(roleId);
}

export async function getApplicationOps(roleId: number): Promise<ApplicationOps> {
  return getLocalApplicationOps(roleId);
}

export async function listInterviewStages(roleId: number): Promise<InterviewStageEvent[]> {
  return listLocalInterviewStages(roleId);
}

export async function createOutcomeEvent(
  roleId: number,
  payload: OutcomeEventCreate,
): Promise<OutcomeEvent> {
  return addLocalOutcomeEvent(roleId, payload);
}

export async function listOutcomeEvents(roleId: number): Promise<OutcomeEvent[]> {
  return listLocalOutcomeEvents(roleId);
}

export async function getOutcomeInsights(): Promise<OutcomeInsights> {
  const outcomeEvents = await listAllLocalOutcomeEvents();
  const jobs = await listLocalJobs();

  const eventsWithJobs = outcomeEvents
    .map((event) => ({
      event,
      job: jobs.find((job) => job.id === event.role_id) ?? null,
    }))
    .filter((row) => row.job !== null);

  const rolesWithOutcomes = new Set(eventsWithJobs.map(({ event }) => event.role_id));
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

  return {
    confidence_message:
      eventsWithJobs.length < 5 ? "Low confidence: early signal only." : "Moderate confidence.",
    conversion_by_fit_band: summarize(
      eventsWithJobs.map(({ event, job }) => ({
        key: toFitBand(job.fit_score),
        hired: hires.has(event.event_type),
      })),
      (key) => key ?? "Unknown",
    ),
    conversion_by_desirability_band: summarize(
      eventsWithJobs.map(({ event, job }) => ({
        key: toDesirabilityBand(job.desirability_score),
        hired: hires.has(event.event_type),
      })),
      (key) => key ?? "Unknown",
    ),
    conversion_by_model_family: summarize(
      eventsWithJobs.map(({ event }) => ({
        key: event.model_family ?? "unknown",
        hired: hires.has(event.event_type),
      })),
      (key) => key ?? "unknown",
    ),
    total_events: eventsWithJobs.length,
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

export async function listPipeline(options?: {
  overdueOnly?: boolean;
  thisWeekDeadlines?: boolean;
  recentlyUpdated?: boolean;
}): Promise<PipelineResponse> {
  return listLocalPipeline(options);
}

export async function listJobs(): Promise<JobListItem[]> {
  return listLocalJobs();
}

export async function upsertApplicationOps(
  roleId: number,
  payload: ApplicationOpsUpdate,
): Promise<ApplicationOps> {
  return upsertLocalApplicationOps(roleId, payload);
}

export async function updateInterviewStage(
  roleId: number,
  payload: InterviewStageEventCreate,
): Promise<InterviewStageEvent> {
  return addLocalInterviewStage(roleId, payload);
}

export async function updateNextAction(
  roleId: number,
  next_action_at: string | null,
): Promise<ApplicationOps> {
  return updateLocalNextAction(roleId, next_action_at);
}

export async function listSkills(): Promise<SkillListItem[]> {
  return listLocalSkills();
}

export async function getSkill(skillId: number): Promise<SkillDetail> {
  return getLocalSkill(skillId);
}

export async function scrapeJob(request: JobScrapeRequest): Promise<JobScrapeResponse> {
  return captureLocalJob(request);
}

export async function updateJobStatus(roleId: number, status: RoleStatus): Promise<JobListItem> {
  return updateLocalJobStatus(roleId, status);
}

export async function analyzeJobFit(roleId: number): Promise<FitAnalysis> {
  return analyzeLocalJobFit(roleId);
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

export async function generateCoverLetter(roleId: number): Promise<ApplicationMaterial> {
  return generateLocalCoverLetter(roleId);
}

export async function listDesirabilityFactors(): Promise<DesirabilityFactor[]> {
  return listLocalDesirabilityFactors();
}

export async function generateQuestionAnswers(
  roleId: number,
  questions: string[],
): Promise<ApplicationMaterial> {
  return generateLocalQuestionAnswers(roleId, questions);
}

export async function listApplicationMaterials(roleId: number): Promise<ApplicationMaterial[]> {
  return listLocalApplicationMaterials(roleId);
}

export async function generateInterviewPrepPack(roleId: number): Promise<InterviewPrepPack> {
  return generateLocalInterviewPrepPack(roleId);
}

export async function listInterviewPrepPacks(roleId: number): Promise<InterviewPrepPack[]> {
  return listLocalInterviewPrepPacks(roleId);
}

export async function regenerateInterviewPrepSection(
  roleId: number,
  section: InterviewPrepSectionKey,
): Promise<InterviewPrepPack> {
  return regenerateLocalInterviewPrepSection(roleId, section);
}

export async function updateInterviewPrepPack(
  roleId: number,
  materialId: number,
  sections: InterviewPrepPackSections,
): Promise<InterviewPrepPack> {
  return updateLocalInterviewPrepPack(roleId, materialId, sections);
}

export async function syncResumeProfile(payload?: {
  resume_markdown?: string | null;
  source_record_id?: string;
}): Promise<ResumeProfileSyncResult> {
  void payload;
  return syncLocalResumeProfile();
}

export async function generateResumeTuning(roleId: number): Promise<ResumeTuningSuggestion> {
  return generateLocalResumeTuning(roleId);
}

export async function listResumeTuning(roleId: number): Promise<ResumeTuningSuggestion[]> {
  return listLocalResumeTuning(roleId);
}

export async function refreshDesirabilityScore(roleId: number): Promise<DesirabilityScore> {
  return refreshLocalJobDesirability(roleId);
}

export async function reorderDesirabilityFactors(
  factorIds: number[],
): Promise<DesirabilityFactor[]> {
  void factorIds;
  throw new Error("Desirability factor reordering is not available in the browser-local MVP path.");
}

export async function scoreJobDesirability(roleId: number): Promise<DesirabilityScore> {
  return scoreLocalJobDesirability(roleId);
}

export async function updateDesirabilityFactor(
  factorId: number,
  payload: DesirabilityFactorUpdate,
): Promise<DesirabilityFactor> {
  void factorId;
  void payload;
  throw new Error("Desirability factor mutation is not available in the browser-local MVP path.");
}

export async function listAISettings(): Promise<AISetting[]> {
  return listLocalAISettings();
}

export async function updateAISetting(
  operationFamily: OperationFamily,
  payload: AISettingUpdate,
): Promise<AISetting> {
  return updateLocalAISetting(operationFamily, payload);
}

export async function updateAISettingToken(
  operationFamily: OperationFamily,
  token: string,
): Promise<AISetting> {
  return updateLocalAISettingToken(operationFamily, token);
}

export async function clearAISettingToken(operationFamily: OperationFamily): Promise<void> {
  return clearLocalAISettingToken(operationFamily);
}

export async function healthcheckAISetting(
  operationFamily: OperationFamily,
): Promise<AISettingHealth> {
  return healthcheckLocalAISetting(operationFamily);
}

export async function getDataPortabilitySummary(): Promise<DataPortabilitySummary> {
  return getLocalDataPortabilitySummary();
}

export async function exportDataArchive(): Promise<{ blob: Blob; filename: string }> {
  return exportLocalDataArchive();
}

export async function importDataArchive(archiveBase64: string): Promise<DataOperationResult> {
  return importLocalDataArchive(archiveBase64);
}

export async function resetDataWorkspace(): Promise<DataOperationResult> {
  return resetLocalWorkspace();
}
