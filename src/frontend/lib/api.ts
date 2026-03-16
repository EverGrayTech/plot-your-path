export interface JobScrapeRequest {
  url: string;
  fallback_text?: string;
}

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
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}`);
  return parseResponse<JobDetail>(response);
}

export async function getApplicationOps(roleId: number): Promise<ApplicationOps> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/application-ops`);
  return parseResponse<ApplicationOps>(response);
}

export async function listInterviewStages(roleId: number): Promise<InterviewStageEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/interview-stages`);
  return parseResponse<InterviewStageEvent[]>(response);
}

export async function createOutcomeEvent(
  roleId: number,
  payload: OutcomeEventCreate,
): Promise<OutcomeEvent> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/outcomes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<OutcomeEvent>(response);
}

export async function listOutcomeEvents(roleId: number): Promise<OutcomeEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/outcomes`);
  return parseResponse<OutcomeEvent[]>(response);
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
  const params = new URLSearchParams();
  if (options?.overdueOnly) {
    params.set("overdue_only", "true");
  }
  if (options?.thisWeekDeadlines) {
    params.set("this_week_deadlines", "true");
  }
  if (options?.recentlyUpdated) {
    params.set("recently_updated", "true");
  }
  const query = params.toString();
  const url = `${API_BASE_URL}/api/jobs/pipeline${query ? `?${query}` : ""}`;
  const response = await fetch(url);
  return parseResponse<PipelineResponse>(response);
}

export async function listJobs(): Promise<JobListItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs`);
  return parseResponse<JobListItem[]>(response);
}

export async function upsertApplicationOps(
  roleId: number,
  payload: ApplicationOpsUpdate,
): Promise<ApplicationOps> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/application-ops`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<ApplicationOps>(response);
}

export async function updateInterviewStage(
  roleId: number,
  payload: InterviewStageEventCreate,
): Promise<InterviewStageEvent> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/interview-stages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<InterviewStageEvent>(response);
}

export async function updateNextAction(
  roleId: number,
  next_action_at: string | null,
): Promise<ApplicationOps> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/application-ops/next-action`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ next_action_at }),
  });
  return parseResponse<ApplicationOps>(response);
}

export async function listSkills(): Promise<SkillListItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/skills`);
  return parseResponse<SkillListItem[]>(response);
}

export async function getSkill(skillId: number): Promise<SkillDetail> {
  const response = await fetch(`${API_BASE_URL}/api/skills/${skillId}`);
  return parseResponse<SkillDetail>(response);
}

export async function scrapeJob(request: JobScrapeRequest): Promise<JobScrapeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/scrape`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return parseResponse<JobScrapeResponse>(response);
}

export async function updateJobStatus(roleId: number, status: RoleStatus): Promise<JobListItem> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return parseResponse<JobListItem>(response);
}

export async function analyzeJobFit(roleId: number): Promise<FitAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/fit-analysis`, {
    method: "POST",
  });

  return parseResponse<FitAnalysis>(response);
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
  const response = await fetch(
    `${API_BASE_URL}/api/jobs/${roleId}/application-materials/cover-letter`,
    {
      method: "POST",
    },
  );

  return parseResponse<ApplicationMaterial>(response);
}

export async function listDesirabilityFactors(): Promise<DesirabilityFactor[]> {
  const response = await fetch(`${API_BASE_URL}/api/desirability/factors`);
  return parseResponse<DesirabilityFactor[]>(response);
}

export async function generateQuestionAnswers(
  roleId: number,
  questions: string[],
): Promise<ApplicationMaterial> {
  const response = await fetch(
    `${API_BASE_URL}/api/jobs/${roleId}/application-materials/question-answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    },
  );

  return parseResponse<ApplicationMaterial>(response);
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
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/application-materials`);
  return parseResponse<ApplicationMaterial[]>(response);
}

export async function generateInterviewPrepPack(roleId: number): Promise<InterviewPrepPack> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/interview-prep-pack`, {
    method: "POST",
  });
  return parseResponse<InterviewPrepPack>(response);
}

export async function listInterviewPrepPacks(roleId: number): Promise<InterviewPrepPack[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/interview-prep-pack`);
  return parseResponse<InterviewPrepPack[]>(response);
}

export async function regenerateInterviewPrepSection(
  roleId: number,
  section: InterviewPrepSectionKey,
): Promise<InterviewPrepPack> {
  const response = await fetch(
    `${API_BASE_URL}/api/jobs/${roleId}/interview-prep-pack/regenerate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ section }),
    },
  );
  return parseResponse<InterviewPrepPack>(response);
}

export async function updateInterviewPrepPack(
  roleId: number,
  materialId: number,
  sections: InterviewPrepPackSections,
): Promise<InterviewPrepPack> {
  const response = await fetch(
    `${API_BASE_URL}/api/jobs/${roleId}/interview-prep-pack/${materialId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sections }),
    },
  );
  return parseResponse<InterviewPrepPack>(response);
}

export async function syncResumeProfile(payload?: {
  resume_markdown?: string | null;
  source_record_id?: string;
}): Promise<ResumeProfileSyncResult> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/profile/sync-resume`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload ?? {}),
  });
  return parseResponse<ResumeProfileSyncResult>(response);
}

export async function generateResumeTuning(roleId: number): Promise<ResumeTuningSuggestion> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/resume-tuning`, {
    method: "POST",
  });
  return parseResponse<ResumeTuningSuggestion>(response);
}

export async function listResumeTuning(roleId: number): Promise<ResumeTuningSuggestion[]> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/resume-tuning`);
  return parseResponse<ResumeTuningSuggestion[]>(response);
}

export async function refreshDesirabilityScore(roleId: number): Promise<DesirabilityScore> {
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/desirability-score/refresh`, {
    method: "POST",
  });

  return parseResponse<DesirabilityScore>(response);
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
  const response = await fetch(`${API_BASE_URL}/api/jobs/${roleId}/desirability-score`, {
    method: "POST",
  });

  return parseResponse<DesirabilityScore>(response);
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
  const response = await fetch(`${API_BASE_URL}/api/ai-settings`);
  return parseResponse<AISetting[]>(response);
}

export async function updateAISetting(
  operationFamily: OperationFamily,
  payload: AISettingUpdate,
): Promise<AISetting> {
  const response = await fetch(`${API_BASE_URL}/api/ai-settings/${operationFamily}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<AISetting>(response);
}

export async function updateAISettingToken(
  operationFamily: OperationFamily,
  token: string,
): Promise<AISetting> {
  const response = await fetch(`${API_BASE_URL}/api/ai-settings/${operationFamily}/token`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  return parseResponse<AISetting>(response);
}

export async function clearAISettingToken(operationFamily: OperationFamily): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/ai-settings/${operationFamily}/token`, {
    method: "DELETE",
  });
  if (!response.ok) {
    await parseResponse(response);
  }
}

export async function healthcheckAISetting(
  operationFamily: OperationFamily,
): Promise<AISettingHealth> {
  const response = await fetch(`${API_BASE_URL}/api/ai-settings/${operationFamily}/health`);
  return parseResponse<AISettingHealth>(response);
}

export async function getDataPortabilitySummary(): Promise<DataPortabilitySummary> {
  const response = await fetch(`${API_BASE_URL}/api/system/data-portability`);
  return parseResponse<DataPortabilitySummary>(response);
}

export async function exportDataArchive(): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(`${API_BASE_URL}/api/system/data-portability/export`);
  if (!response.ok) {
    await throwApiError(response);
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  return {
    blob: await response.blob(),
    filename: match?.[1] ?? "plot-your-path-backup.zip",
  };
}

export async function importDataArchive(archiveBase64: string): Promise<DataOperationResult> {
  const response = await fetch(`${API_BASE_URL}/api/system/data-portability/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ archive_base64: archiveBase64 }),
  });
  return parseResponse<DataOperationResult>(response);
}

export async function resetDataWorkspace(): Promise<DataOperationResult> {
  const response = await fetch(`${API_BASE_URL}/api/system/data-portability/reset`, {
    method: "POST",
  });
  return parseResponse<DataOperationResult>(response);
}
