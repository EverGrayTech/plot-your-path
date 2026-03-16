import type {
  CompanySummary,
  JobDetail,
  JobListItem,
  JobScrapeRequest,
  JobScrapeResponse,
  JobSkillItem,
  RoleStatus,
  SkillDetail,
  SkillJobReference,
  SkillListItem,
} from "./api";
import { createLocalId, listStoreRecords, nowIso, saveStoreRecord } from "./localData";

interface LocalJobRecord {
  id: string;
  roleId: number;
  companyId: number;
  companyName: string;
  companySlug: string;
  title: string;
  url: string;
  descriptionMd: string;
  status: RoleStatus;
  createdAt: string;
  updatedAt: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

interface LocalSkillRecord {
  id: string;
  skillId: number;
  name: string;
  category: string | null;
  jobRefs: Array<{ roleId: number; company: string; title: string; status: RoleStatus; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractSkillsFromText(text: string): { required: string[]; preferred: string[] } {
  const candidates = text
    .split(/\r?\n|,|\.|;|•/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 60);

  const unique = [...new Set(candidates)].slice(0, 8);
  return {
    required: unique.slice(0, Math.min(4, unique.length)),
    preferred: unique.slice(Math.min(4, unique.length), Math.min(6, unique.length)),
  };
}

function buildCompanySummary(record: LocalJobRecord): CompanySummary {
  return {
    id: record.companyId,
    name: record.companyName,
    slug: record.companySlug,
    website: null,
    created_at: record.createdAt,
  };
}

function toJobSkillItems(names: string[], requirementLevel: "required" | "preferred"): JobSkillItem[] {
  return names.map((name, index) => ({
    id: index + 1,
    name,
    requirement_level: requirementLevel,
  }));
}

function toJobListItem(record: LocalJobRecord): JobListItem {
  return {
    id: record.roleId,
    company: record.companyName,
    title: record.title,
    salary_range: null,
    created_at: record.createdAt,
    skills_count: record.requiredSkills.length + record.preferredSkills.length,
    status: record.status,
    fit_score: null,
    fit_recommendation: null,
    desirability_score: null,
  };
}

function toJobDetail(record: LocalJobRecord): JobDetail {
  return {
    id: record.roleId,
    company: buildCompanySummary(record),
    title: record.title,
    team_division: null,
    salary: { min: null, max: null, currency: "USD" },
    url: record.url,
    skills: {
      required: toJobSkillItems(record.requiredSkills, "required"),
      preferred: toJobSkillItems(record.preferredSkills, "preferred"),
    },
    description_md: record.descriptionMd,
    created_at: record.createdAt,
    status: record.status,
    status_history: [],
    latest_fit_analysis: null,
    latest_desirability_score: null,
  };
}

function toSkillListItem(record: LocalSkillRecord): SkillListItem {
  return {
    id: record.skillId,
    name: record.name,
    category: record.category,
    usage_count: record.jobRefs.length,
  };
}

function toSkillDetail(record: LocalSkillRecord): SkillDetail {
  const jobs: SkillJobReference[] = record.jobRefs.map((job) => ({
    id: job.roleId,
    company: job.company,
    title: job.title,
    status: job.status,
    created_at: job.createdAt,
  }));

  return {
    id: record.skillId,
    name: record.name,
    category: record.category,
    usage_count: record.jobRefs.length,
    jobs,
  };
}

export async function listLocalJobs(): Promise<JobListItem[]> {
  const records = await listStoreRecords<LocalJobRecord>("jobs");
  return records.map(toJobListItem).sort((left, right) =>
    new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
}

export async function getLocalJob(roleId: number): Promise<JobDetail> {
  const records = await listStoreRecords<LocalJobRecord>("jobs");
  const record = records.find((item) => item.roleId === roleId);
  if (!record) {
    throw new Error("Job not found in local workspace.");
  }
  return toJobDetail(record);
}

export async function updateLocalJobStatus(roleId: number, status: RoleStatus): Promise<JobListItem> {
  const records = await listStoreRecords<LocalJobRecord>("jobs");
  const record = records.find((item) => item.roleId === roleId);
  if (!record) {
    throw new Error("Job not found in local workspace.");
  }

  const updated: LocalJobRecord = {
    ...record,
    status,
    updatedAt: nowIso(),
  };

  await saveStoreRecord("jobs", updated);
  return toJobListItem(updated);
}

export async function listLocalSkills(): Promise<SkillListItem[]> {
  const records = await listStoreRecords<LocalSkillRecord>("skills");
  return records.map(toSkillListItem).sort((left, right) => right.usage_count - left.usage_count);
}

export async function getLocalSkill(skillId: number): Promise<SkillDetail> {
  const records = await listStoreRecords<LocalSkillRecord>("skills");
  const record = records.find((item) => item.skillId === skillId);
  if (!record) {
    throw new Error("Skill not found in local workspace.");
  }
  return toSkillDetail(record);
}

export async function captureLocalJob(request: JobScrapeRequest): Promise<JobScrapeResponse> {
  const timestamp = nowIso();
  const roleId = Date.now();
  const companyName = request.url === "pasted-job-description" ? "Pasted Company" : "Imported Company";
  const title = request.fallback_text?.split(/\r?\n/)[0]?.slice(0, 80) || "Captured Role";
  const skills = extractSkillsFromText(request.fallback_text ?? title);
  const companySlug = slugify(companyName);
  const companyId = Date.now() + 1;

  const jobRecord: LocalJobRecord = {
    id: createLocalId("job"),
    roleId,
    companyId,
    companyName,
    companySlug,
    title,
    url: request.url,
    descriptionMd: request.fallback_text ?? "",
    status: "open",
    createdAt: timestamp,
    updatedAt: timestamp,
    requiredSkills: skills.required,
    preferredSkills: skills.preferred,
  };

  await saveStoreRecord("jobs", jobRecord);

  const skillRecords = await listStoreRecords<LocalSkillRecord>("skills");
  const allSkillNames = [...skills.required, ...skills.preferred];

  for (const [index, skillName] of allSkillNames.entries()) {
    const existing = skillRecords.find((item) => item.name.toLowerCase() === skillName.toLowerCase());
    const jobRef = {
      roleId,
      company: companyName,
      title,
      status: "open" as RoleStatus,
      createdAt: timestamp,
    };

    if (existing) {
      await saveStoreRecord("skills", {
        ...existing,
        updatedAt: timestamp,
        jobRefs: [...existing.jobRefs, jobRef],
      });
      continue;
    }

    await saveStoreRecord("skills", {
      id: createLocalId("skill"),
      skillId: Date.now() + index + 10,
      name: skillName,
      category: null,
      jobRefs: [jobRef],
      createdAt: timestamp,
      updatedAt: timestamp,
    } satisfies LocalSkillRecord);
  }

  return {
    status: "success",
    role_id: roleId,
    company: companyName,
    title,
    skills_extracted: allSkillNames.length,
    processing_time_seconds: 0.1,
  };
}
