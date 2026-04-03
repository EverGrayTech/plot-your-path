import type {
  ApplicationMaterial,
  ApplicationOps,
  ApplicationOpsUpdate,
  DataOperationResult,
  DataPortabilitySummary,
  DesirabilityFactor,
  DesirabilityFactorCreate,
  DesirabilityFactorUpdate,
  DesirabilityScore,
  FitAnalysis,
  InterviewPrepPack,
  InterviewPrepPackSections,
  InterviewPrepSectionKey,
  InterviewStageEvent,
  InterviewStageEventCreate,
  OutcomeEvent,
  OutcomeEventCreate,
  OutcomeInsights,
  OutcomeTuningSuggestions,
  PipelineResponse,
  ResumeProfileSyncResult,
  ResumeTuningSuggestion,
  RoleCaptureRequest,
  RoleCaptureResponse,
  RoleDetail,
  RoleListItem,
  RoleStatus,
  SkillDetail,
  SkillListItem,
} from "../dataModels";

export interface RolesDataService {
  listRoles(): Promise<RoleListItem[]>;
  getRole(roleId: number): Promise<RoleDetail>;
  captureRole(request: RoleCaptureRequest): Promise<RoleCaptureResponse>;
  updateRoleStatus(roleId: number, status: RoleStatus): Promise<RoleListItem>;
}

export interface SkillsDataService {
  listSkills(): Promise<SkillListItem[]>;
  getSkill(skillId: number): Promise<SkillDetail>;
}

export interface WorkflowDataService {
  getApplicationOps(roleId: number): Promise<ApplicationOps>;
  upsertApplicationOps(roleId: number, payload: ApplicationOpsUpdate): Promise<ApplicationOps>;
  listInterviewStages(roleId: number): Promise<InterviewStageEvent[]>;
  updateInterviewStage(
    roleId: number,
    payload: InterviewStageEventCreate,
  ): Promise<InterviewStageEvent>;
  updateNextAction(roleId: number, nextActionAt: string | null): Promise<ApplicationOps>;
  listOutcomeEvents(roleId: number): Promise<OutcomeEvent[]>;
  createOutcomeEvent(roleId: number, payload: OutcomeEventCreate): Promise<OutcomeEvent>;
  listPipeline(options?: {
    overdueOnly?: boolean;
    thisWeekDeadlines?: boolean;
    recentlyUpdated?: boolean;
  }): Promise<PipelineResponse>;
  getOutcomeInsights(): Promise<OutcomeInsights>;
  getOutcomeTuningSuggestions(): Promise<OutcomeTuningSuggestions>;
}

export interface AIGenerationService {
  analyzeRoleFit(roleId: number): Promise<FitAnalysis>;
  scoreRoleDesirability(roleId: number): Promise<DesirabilityScore>;
  refreshDesirabilityScore(roleId: number): Promise<DesirabilityScore>;
  generateCoverLetter(roleId: number): Promise<ApplicationMaterial>;
  generateQuestionAnswers(roleId: number, questions: string[]): Promise<ApplicationMaterial>;
  listApplicationMaterials(roleId: number): Promise<ApplicationMaterial[]>;
  generateInterviewPrepPack(roleId: number): Promise<InterviewPrepPack>;
  listInterviewPrepPacks(roleId: number): Promise<InterviewPrepPack[]>;
  regenerateInterviewPrepSection(
    roleId: number,
    section: InterviewPrepSectionKey,
  ): Promise<InterviewPrepPack>;
  updateInterviewPrepPack(
    roleId: number,
    materialId: number,
    sections: InterviewPrepPackSections,
  ): Promise<InterviewPrepPack>;
  syncResumeProfile(payload?: {
    resume_markdown?: string | null;
    source_record_id?: string;
  }): Promise<ResumeProfileSyncResult>;
  generateResumeTuning(roleId: number): Promise<ResumeTuningSuggestion>;
  listResumeTuning(roleId: number): Promise<ResumeTuningSuggestion[]>;
}

export interface DesirabilityFactorsService {
  listDesirabilityFactors(): Promise<DesirabilityFactor[]>;
  createDesirabilityFactor(payload: DesirabilityFactorCreate): Promise<DesirabilityFactor>;
  updateDesirabilityFactor(
    factorId: number,
    payload: DesirabilityFactorUpdate,
  ): Promise<DesirabilityFactor>;
  deleteDesirabilityFactor(factorId: number): Promise<void>;
  reorderDesirabilityFactors(factorIds: number[]): Promise<DesirabilityFactor[]>;
}

export interface DataPortabilityService {
  getDataPortabilitySummary(): Promise<DataPortabilitySummary>;
  exportDataArchive(): Promise<{ blob: Blob; filename: string }>;
  importDataArchive(archiveBase64: string): Promise<DataOperationResult>;
  resetDataWorkspace(): Promise<DataOperationResult>;
}

export interface FrontendServices {
  roles: RolesDataService;
  skills: SkillsDataService;
  workflows: WorkflowDataService;
  aiGeneration: AIGenerationService;
  desirabilityFactors: DesirabilityFactorsService;
  portability: DataPortabilityService;
}
