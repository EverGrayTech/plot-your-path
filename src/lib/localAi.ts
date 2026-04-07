import type {
  ApplicationMaterial,
  DesirabilityFactor,
  DesirabilityScore,
  FitAnalysis,
  InterviewPrepPack,
  InterviewPrepPackSections,
  InterviewPrepSectionKey,
  ResumeProfileSyncResult,
  ResumeTuningSuggestion,
} from "./dataModels";
import { listStoreRecords, nowIso, saveStoreRecord } from "./localData";

const AI_UNAVAILABLE_MESSAGE =
  "This AI workflow is not implemented yet. Placeholder browser-local generation has been removed.";

interface LocalGeneratedRecordBase {
  id: string;
  roleId: number;
  createdAt: string;
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

function unavailableError(): Error {
  return new Error(AI_UNAVAILABLE_MESSAGE);
}

export async function analyzeLocalRoleFit(roleId: number): Promise<FitAnalysis> {
  void roleId;
  throw unavailableError();
}

export async function scoreLocalRoleDesirability(roleId: number): Promise<DesirabilityScore> {
  void roleId;
  throw unavailableError();
}

export async function refreshLocalRoleDesirability(roleId: number): Promise<DesirabilityScore> {
  return scoreLocalRoleDesirability(roleId);
}

export async function listLocalApplicationMaterials(
  roleId: number,
): Promise<ApplicationMaterial[]> {
  const records = await listStoreRecords<LocalMaterialRecord>("applicationMaterials");
  return records
    .filter((record) => record.roleId === roleId && "material" in record)
    .map((record) => record.material);
}

async function saveMaterial(roleId: number, material: ApplicationMaterial): Promise<void> {
  await saveStoreRecord("applicationMaterials", {
    id: `manual-material-${material.id}`,
    roleId,
    createdAt: material.created_at,
    material,
  } satisfies LocalMaterialRecord);
}

export async function generateLocalCoverLetter(roleId: number): Promise<ApplicationMaterial> {
  void roleId;
  throw unavailableError();
}

export async function generateLocalQuestionAnswers(
  roleId: number,
  questions: string[],
): Promise<ApplicationMaterial> {
  void roleId;
  void questions;
  throw unavailableError();
}

export async function listLocalInterviewPrepPacks(roleId: number): Promise<InterviewPrepPack[]> {
  const records = await listStoreRecords<LocalInterviewPrepRecord>("interviewPrepPacks");
  return records
    .filter((record) => record.roleId === roleId && "pack" in record)
    .map((record) => record.pack);
}

async function saveInterviewPrep(roleId: number, pack: InterviewPrepPack): Promise<void> {
  await saveStoreRecord("interviewPrepPacks", {
    id: `manual-prep-${pack.id}`,
    roleId,
    createdAt: pack.created_at,
    pack,
  } satisfies LocalInterviewPrepRecord);
}

export async function generateLocalInterviewPrepPack(roleId: number): Promise<InterviewPrepPack> {
  void roleId;
  throw unavailableError();
}

export async function regenerateLocalInterviewPrepSection(
  roleId: number,
  section: InterviewPrepSectionKey,
): Promise<InterviewPrepPack> {
  void roleId;
  void section;
  throw unavailableError();
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
  throw unavailableError();
}

export async function listLocalResumeTuning(roleId: number): Promise<ResumeTuningSuggestion[]> {
  const records = await listStoreRecords<LocalResumeTuningRecord>("resumeTuning");
  return records
    .filter((record) => record.roleId === roleId && "suggestion" in record)
    .map((record) => record.suggestion);
}

export async function generateLocalResumeTuning(roleId: number): Promise<ResumeTuningSuggestion> {
  void roleId;
  throw unavailableError();
}

export async function listLocalDesirabilityFactors(): Promise<DesirabilityFactor[]> {
  const now = nowIso();
  return [
    {
      id: 1,
      name: "Culture",
      prompt: 'Fetch Glassdoor "Culture & Values" rating (1-5)',
      weight: 1.0,
      is_active: true,
      display_order: 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      name: "Notoriety",
      prompt: "Use company Market Cap (Trillion/Billion/Million)",
      weight: 1.0,
      is_active: true,
      display_order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      name: "Progressiveness",
      prompt: "Analyze public Diversity & Inclusion reports and parental leave policy length",
      weight: 1.0,
      is_active: true,
      display_order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      name: "Inventiveness",
      prompt: "Analyze Patent/R&D spend/recent product breakthroughs",
      weight: 1.0,
      is_active: true,
      display_order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: 5,
      name: "Social Impact",
      prompt: "Determine the company's mission alignment with the UN SDGs or social good",
      weight: 1.0,
      is_active: true,
      display_order: 4,
      created_at: now,
      updated_at: now,
    },
    {
      id: 6,
      name: "Wow Factor",
      prompt:
        'Rate based on the use of cutting-edge technology (e.g., Generative AI, Quantum) and public perception of "coolness"',
      weight: 1.0,
      is_active: true,
      display_order: 5,
      created_at: now,
      updated_at: now,
    },
    {
      id: 7,
      name: "Reputation",
      prompt:
        "Calculate average RepTrak/TrustPilot score and overall Glassdoor rating (excluding salary)",
      weight: 1.0,
      is_active: true,
      display_order: 6,
      created_at: now,
      updated_at: now,
    },
    {
      id: 8,
      name: "Comp Growth",
      prompt:
        "Rate based on median salary and clarity/budget for internal career development/training",
      weight: 1.0,
      is_active: true,
      display_order: 7,
      created_at: now,
      updated_at: now,
    },
  ];
}
