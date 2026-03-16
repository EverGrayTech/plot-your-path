export interface JobScrapeRequest {
  url: string;
  fallback_text?: string;
}

import {
  captureLocalJob,
  getLocalJob,
  getLocalSkill,
  listLocalJobs,
  listLocalSkills,
  updateLocalJobStatus,
} from "./localJobs";
import {
  addLocalInterviewStage,
  addLocalOutcomeEvent,
  getLocalApplicationOps,
  listLocalInterviewStages,
  listLocalOutcomeEvents,
  listLocalPipeline,
  updateLocalNextAction,
  upsertLocalApplicationOps,
} from "./localApplicationWorkflows";
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

interface StructuredErrorDetail {
  code?: string;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  code?: string;

  constructor(message: string, status: number, detail: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.code = code;
  }
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function parseStructuredDetail(detail: unknown): StructuredErrorDetail {
  if (typeof detail === "object" && detail !== null) {
    const maybeDetail = detail as StructuredErrorDetail;
    return {
      code: maybeDetail.code,
      message: maybeDetail.message,
    };
  }
  return {};
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    await throwApiError(response);
  }

  return (await response.json()) as T;
}

async function throwApiError(response: Response): Promise<never> {
  let detail: unknown = "Request failed";
  try {
    const payload = await response.json();
    detail = payload?.detail ?? detail;
  } catch {
    // Keep default when backend does not return JSON.
  }

  const { code, message } = parseStructuredDetail(detail);
  throw new ApiError(
    message ?? `Request failed with status ${response.status}`,
    response.status,
    detail,
    code,
  );
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
  const response = await fetch(`${API_BASE_URL}/api/outcomes/insights`);
  return parseResponse<OutcomeInsights>(response);
}

export async function getOutcomeTuningSuggestions(): Promise<OutcomeTuningSuggestions> {
  const response = await fetch(`${API_BASE_URL}/api/outcomes/tuning-suggestions`);
  return parseResponse<OutcomeTuningSuggestions>(response);
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
  const response = await fetch(`${API_BASE_URL}/api/desirability/factors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<DesirabilityFactor>(response);
}

export async function deleteDesirabilityFactor(factorId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/desirability/factors/${factorId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    await parseResponse(response);
  }
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

export async function getApplicationMaterial(
  roleId: number,
  materialId: number,
): Promise<ApplicationMaterial> {
  const response = await fetch(
    `${API_BASE_URL}/api/jobs/${roleId}/application-materials/${materialId}`,
  );
  return parseResponse<ApplicationMaterial>(response);
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
  const response = await fetch(`${API_BASE_URL}/api/desirability/factors/reorder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ factor_ids: factorIds }),
  });

  return parseResponse<DesirabilityFactor[]>(response);
}

export async function scoreJobDesirability(roleId: number): Promise<DesirabilityScore> {
  return scoreLocalJobDesirability(roleId);
}

export async function updateDesirabilityFactor(
  factorId: number,
  payload: DesirabilityFactorUpdate,
): Promise<DesirabilityFactor> {
  const response = await fetch(`${API_BASE_URL}/api/desirability/factors/${factorId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse<DesirabilityFactor>(response);
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
