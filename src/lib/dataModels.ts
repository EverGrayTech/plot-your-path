export interface RoleCaptureRequest {
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
export type FitRecommendation = "go" | "maybe" | "no-go";
export type ApplicationArtifactType =
  | "cover_letter"
  | "application_qa"
  | "interview_prep_pack"
  | "resume_tuning";
export type InterviewPrepSectionKey = "likely_questions" | "talking_points" | "star_stories";
export type DesirabilityScoreScope = "company";
export type OperationFamily =
  | "role_parsing"
  | "desirability_scoring"
  | "application_generation"
  | "fit_analysis";

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

export interface AISetting {
  operation_family: OperationFamily;
  provider: string;
  model: string;
  token_label: string;
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
  token_label?: string;
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
  storage_mode?: "browser_local";
  backup_reminder_level?: "none" | "recommended" | "overdue";
  backup_reminder_message?: string | null;
  has_resume: boolean;
  roles_count: number;
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

export interface RoleListItem {
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

export interface RoleSkillItem {
  id: number;
  name: string;
  requirement_level: "required" | "preferred";
}

export interface RoleDetail {
  id: number;
  company: CompanySummary;
  title: string;
  team_division: string | null;
  salary: SalaryInfo;
  url: string;
  skills: {
    required: RoleSkillItem[];
    preferred: RoleSkillItem[];
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

export interface SkillListItem {
  id: number;
  name: string;
  category: string | null;
  usage_count: number;
}

export interface SkillRoleReference {
  id: number;
  company: string;
  title: string;
  status: RoleStatus;
  created_at: string;
}

export interface SkillDetail {
  id: number;
  name: string;
  category: string | null;
  usage_count: number;
  roles: SkillRoleReference[];
}

export interface RoleCaptureResponse {
  status: string;
  role_id: number;
  company: string;
  title: string;
  skills_extracted: number;
  processing_time_seconds: number;
}
