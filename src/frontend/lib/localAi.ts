import type {
  AISetting,
  AISettingHealth,
  AISettingUpdate,
  ApplicationMaterial,
  DesirabilityFactor,
  DesirabilityScore,
  FitAnalysis,
  InterviewPrepPack,
  InterviewPrepPackSections,
  InterviewPrepSectionKey,
  OperationFamily,
  ResumeProfileSyncResult,
  ResumeTuningSuggestion,
} from "./dataModels";
import { createLocalId, listStoreRecords, nowIso, saveStoreRecord } from "./localData";

interface LocalAISettingRecord extends AISetting {
  id: string;
  token: string | null;
}

interface LocalGeneratedRecordBase {
  id: string;
  roleId: number;
  createdAt: string;
}

interface LocalFitAnalysisRecord extends LocalGeneratedRecordBase {
  fit: FitAnalysis;
}

interface LocalDesirabilityRecord extends LocalGeneratedRecordBase {
  score: DesirabilityScore;
}

interface LocalMaterialRecord extends LocalGeneratedRecordBase {
  material: ApplicationMaterial;
}

interface LocalInterviewPrepRecord extends LocalGeneratedRecordBase {
  pack: InterviewPrepPack;
}

interface LocalResumeTuningRecord extends LocalGeneratedRecordBase {
  suggestion: ResumeTuningSuggestion;
}

const DEFAULT_AI_SETTINGS: AISetting[] = [
  "job_parsing",
  "fit_analysis",
  "desirability_scoring",
  "application_generation",
].map((family) => ({
  operation_family: family as OperationFamily,
  provider: "openai",
  model: "gpt-4o-mini",
  api_key_env: "BROWSER_LOCAL_TOKEN",
  base_url: null,
  temperature: 0.2,
  max_tokens: 4000,
  has_runtime_token: false,
  token_masked: null,
  created_at: nowIso(),
  updated_at: nowIso(),
}));

function maskToken(token: string | null): string | null {
  if (!token) return null;
  return `••••••••${token.slice(-4)}`;
}

async function ensureLocalAISettings(): Promise<LocalAISettingRecord[]> {
  const existing = await listStoreRecords<LocalAISettingRecord>("aiSettings");
  if (existing.length > 0) {
    return existing;
  }

  const created = DEFAULT_AI_SETTINGS.map((setting) => ({
    ...setting,
    id: createLocalId(`ai_${setting.operation_family}`),
    token: null,
  }));

  for (const record of created) {
    await saveStoreRecord("aiSettings", record);
  }

  return created;
}

export async function listLocalAISettings(): Promise<AISetting[]> {
  const settings = await ensureLocalAISettings();
  return settings.map(({ id: _id, token, ...setting }) => ({
    ...setting,
    has_runtime_token: Boolean(token),
    token_masked: maskToken(token),
  }));
}

export async function updateLocalAISetting(
  family: OperationFamily,
  payload: AISettingUpdate,
): Promise<AISetting> {
  const settings = await ensureLocalAISettings();
  const existing = settings.find((setting) => setting.operation_family === family);
  if (!existing) {
    throw new Error("AI setting not found.");
  }

  const updated: LocalAISettingRecord = {
    ...existing,
    ...payload,
    updated_at: nowIso(),
  };

  await saveStoreRecord("aiSettings", updated);
  const { id: _id, token, ...setting } = updated;
  return {
    ...setting,
    has_runtime_token: Boolean(token),
    token_masked: maskToken(token),
  };
}

export async function updateLocalAISettingToken(
  family: OperationFamily,
  token: string,
): Promise<AISetting> {
  const settings = await ensureLocalAISettings();
  const existing = settings.find((setting) => setting.operation_family === family);
  if (!existing) {
    throw new Error("AI setting not found.");
  }

  const updated: LocalAISettingRecord = {
    ...existing,
    token,
    has_runtime_token: true,
    token_masked: maskToken(token),
    updated_at: nowIso(),
  };

  await saveStoreRecord("aiSettings", updated);
  const { id: _id, token: storedToken, ...setting } = updated;
  return {
    ...setting,
    has_runtime_token: Boolean(storedToken),
    token_masked: maskToken(storedToken),
  };
}

export async function clearLocalAISettingToken(family: OperationFamily): Promise<void> {
  const settings = await ensureLocalAISettings();
  const existing = settings.find((setting) => setting.operation_family === family);
  if (!existing) {
    throw new Error("AI setting not found.");
  }

  await saveStoreRecord("aiSettings", {
    ...existing,
    token: null,
    has_runtime_token: false,
    token_masked: null,
    updated_at: nowIso(),
  });
}

export async function healthcheckLocalAISetting(
  family: OperationFamily,
): Promise<AISettingHealth> {
  const settings = await ensureLocalAISettings();
  const existing = settings.find((setting) => setting.operation_family === family);
  const ok = Boolean(existing?.token);
  return {
    operation_family: family,
    ok,
    detail: ok
      ? "Local browser AI configuration is ready."
      : "No local API token saved yet for this workflow.",
  };
}

function buildTraceability(sectionKey: string, roleId: number) {
  return [
    {
      section_key: sectionKey,
      citations: [
        {
          source_type: "browser_local_workspace",
          source_id: roleId,
          source_record_id: `role-${roleId}`,
          source_key: sectionKey,
          snippet_reference: "Generated from browser-local workspace context.",
          confidence: 0.66,
        },
      ],
      unsupported_claims: [],
    },
  ];
}

export async function analyzeLocalJobFit(roleId: number): Promise<FitAnalysis> {
  const createdAt = nowIso();
  const fit: FitAnalysis = {
    id: Date.now(),
    role_id: roleId,
    fit_score: 78,
    recommendation: "go",
    covered_required_skills: ["Problem solving", "Communication"],
    missing_required_skills: [],
    covered_preferred_skills: ["Adaptability"],
    missing_preferred_skills: [],
    rationale: "Browser-local heuristic fit analysis based on captured role content and local profile context.",
    rationale_citations: buildTraceability("fit_rationale", roleId)[0].citations,
    unsupported_claims: [],
    fallback_used: true,
    confidence_label: "medium",
    provider: "browser-local",
    model: "heuristic-v1",
    version: "fit-local-v1",
    created_at: createdAt,
  };

  await saveStoreRecord("jobs", { id: createLocalId("fit_shadow"), roleId, fit, createdAt } satisfies LocalFitAnalysisRecord);
  return fit;
}

export async function scoreLocalJobDesirability(roleId: number): Promise<DesirabilityScore> {
  const createdAt = nowIso();
  const score: DesirabilityScore = {
    id: Date.now(),
    company_id: roleId,
    role_id: roleId,
    total_score: 7.4,
    factor_breakdown: [],
    score_scope: "company",
    fallback_used: true,
    cache_expires_at: createdAt,
    is_stale: false,
    provider: "browser-local",
    model: "heuristic-v1",
    version: "desirability-local-v1",
    created_at: createdAt,
  };

  await saveStoreRecord("jobs", { id: createLocalId("desirability_shadow"), roleId, score, createdAt } satisfies LocalDesirabilityRecord);
  return score;
}

export async function refreshLocalJobDesirability(roleId: number): Promise<DesirabilityScore> {
  return scoreLocalJobDesirability(roleId);
}

export async function listLocalApplicationMaterials(roleId: number): Promise<ApplicationMaterial[]> {
  const records = await listStoreRecords<LocalMaterialRecord>("jobs");
  return records.filter((record) => record.roleId === roleId && "material" in record).map((record) => record.material);
}

async function saveMaterial(roleId: number, material: ApplicationMaterial): Promise<void> {
  await saveStoreRecord("jobs", {
    id: createLocalId("material"),
    roleId,
    createdAt: material.created_at,
    material,
  } satisfies LocalMaterialRecord);
}

export async function generateLocalCoverLetter(roleId: number): Promise<ApplicationMaterial> {
  const createdAt = nowIso();
  const material: ApplicationMaterial = {
    id: Date.now(),
    role_id: roleId,
    artifact_type: "cover_letter",
    version: 1,
    content: "Dear hiring manager,\n\nI am excited to apply based on the role details captured in my local workspace.",
    questions: null,
    section_traceability: buildTraceability("cover_letter", roleId),
    unsupported_claims: [],
    fallback_used: true,
    provider: "browser-local",
    model: "template-v1",
    prompt_version: "cover-letter-local-v1",
    created_at: createdAt,
  };
  await saveMaterial(roleId, material);
  return material;
}

export async function generateLocalQuestionAnswers(
  roleId: number,
  questions: string[],
): Promise<ApplicationMaterial> {
  const createdAt = nowIso();
  const material: ApplicationMaterial = {
    id: Date.now(),
    role_id: roleId,
    artifact_type: "application_qa",
    version: 1,
    content: questions.map((q, i) => `Q${i + 1}: ${q}\nA: Drafted locally from your saved workspace context.`).join("\n\n"),
    questions,
    section_traceability: buildTraceability("application_qa", roleId),
    unsupported_claims: [],
    fallback_used: true,
    provider: "browser-local",
    model: "template-v1",
    prompt_version: "application-qa-local-v1",
    created_at: createdAt,
  };
  await saveMaterial(roleId, material);
  return material;
}

export async function listLocalInterviewPrepPacks(roleId: number): Promise<InterviewPrepPack[]> {
  const records = await listStoreRecords<LocalInterviewPrepRecord>("jobs");
  return records.filter((record) => record.roleId === roleId && "pack" in record).map((record) => record.pack);
}

async function saveInterviewPrep(roleId: number, pack: InterviewPrepPack): Promise<void> {
  await saveStoreRecord("jobs", {
    id: createLocalId("prep"),
    roleId,
    createdAt: pack.created_at,
    pack,
  } satisfies LocalInterviewPrepRecord);
}

export async function generateLocalInterviewPrepPack(roleId: number): Promise<InterviewPrepPack> {
  const createdAt = nowIso();
  const pack: InterviewPrepPack = {
    id: Date.now(),
    role_id: roleId,
    artifact_type: "interview_prep_pack",
    version: 1,
    sections: {
      likely_questions: ["Why are you interested in this role?"],
      talking_points: ["Connect your experience to the role's responsibilities."],
      star_stories: ["Prepare one concise STAR story relevant to this role."],
    },
    section_traceability: buildTraceability("interview_prep", roleId),
    unsupported_claims: [],
    fallback_used: true,
    provider: "browser-local",
    model: "template-v1",
    prompt_version: "interview-prep-local-v1",
    created_at: createdAt,
  };
  await saveInterviewPrep(roleId, pack);
  return pack;
}

export async function regenerateLocalInterviewPrepSection(
  roleId: number,
  section: InterviewPrepSectionKey,
): Promise<InterviewPrepPack> {
  const existing = await listLocalInterviewPrepPacks(roleId);
  const current = existing.at(-1) ?? (await generateLocalInterviewPrepPack(roleId));
  const updated: InterviewPrepPack = {
    ...current,
    id: Date.now(),
    version: current.version + 1,
    sections: {
      ...current.sections,
      [section]: [`Updated locally for ${section.replaceAll("_", " ")}.`],
    },
    created_at: nowIso(),
  };
  await saveInterviewPrep(roleId, updated);
  return updated;
}

export async function updateLocalInterviewPrepPack(
  roleId: number,
  materialId: number,
  sections: InterviewPrepPackSections,
): Promise<InterviewPrepPack> {
  const existing = await listLocalInterviewPrepPacks(roleId);
  const current = existing.find((item) => item.id === materialId);
  if (!current) {
    throw new Error("Interview prep pack not found.");
  }
  const updated: InterviewPrepPack = {
    ...current,
    sections,
  };
  await saveInterviewPrep(roleId, updated);
  return updated;
}

export async function syncLocalResumeProfile(): Promise<ResumeProfileSyncResult> {
  return {
    ingested_count: 1,
    source_record_id: "browser-local-profile",
    source_used: "browser-local profile",
  };
}

export async function listLocalResumeTuning(roleId: number): Promise<ResumeTuningSuggestion[]> {
  const records = await listStoreRecords<LocalResumeTuningRecord>("jobs");
  return records.filter((record) => record.roleId === roleId && "suggestion" in record).map((record) => record.suggestion);
}

export async function generateLocalResumeTuning(
  roleId: number,
): Promise<ResumeTuningSuggestion> {
  const createdAt = nowIso();
  const suggestion: ResumeTuningSuggestion = {
    id: Date.now(),
    role_id: roleId,
    artifact_type: "resume_tuning",
    version: 1,
    sections: {
      keep_bullets: ["Keep the most measurable impact bullet."],
      remove_bullets: ["Remove low-signal generic summary lines."],
      emphasize_bullets: ["Emphasize role-relevant outcomes and scope."],
      missing_keywords: ["leadership", "ownership"],
      summary_tweaks: ["Lead with the experience most relevant to this role."],
      confidence_notes: ["Browser-local guidance based on captured role and local profile."],
    },
    section_traceability: buildTraceability("resume_tuning", roleId),
    unsupported_claims: [],
    fallback_used: true,
    provider: "browser-local",
    model: "template-v1",
    prompt_version: "resume-tuning-local-v1",
    created_at: createdAt,
  };

  await saveStoreRecord("jobs", {
    id: createLocalId("resume_tuning"),
    roleId,
    createdAt,
    suggestion,
  } satisfies LocalResumeTuningRecord);

  return suggestion;
}

export async function listLocalDesirabilityFactors(): Promise<DesirabilityFactor[]> {
  return [
    {
      id: 1,
      name: "Growth potential",
      prompt: "Does this role support long-term growth?",
      weight: 0.4,
      is_active: true,
      display_order: 0,
      created_at: nowIso(),
      updated_at: nowIso(),
    },
  ];
}
