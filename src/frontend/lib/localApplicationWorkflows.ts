import type {
  ApplicationOps,
  ApplicationOpsUpdate,
  InterviewStage,
  InterviewStageEvent,
  InterviewStageEventCreate,
  OutcomeEvent,
  OutcomeEventCreate,
  OutcomeEventType,
  PipelineCounters,
  PipelineItem,
  PipelineResponse,
} from "./api";
import { createLocalId, listStoreRecords, nowIso, saveStoreRecord } from "./localData";
import { listLocalJobs } from "./localJobs";

interface LocalApplicationOpsRecord {
  id: string;
  roleId: number;
  appliedAt: string | null;
  deadlineAt: string | null;
  source: string | null;
  recruiterContact: string | null;
  notes: string | null;
  nextActionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LocalInterviewStageRecord {
  id: string;
  roleId: number;
  stage: InterviewStage;
  notes: string | null;
  occurredAt: string;
  createdAt: string;
}

interface LocalOutcomeRecord {
  id: string;
  outcomeId: number;
  roleId: number;
  eventType: OutcomeEventType;
  occurredAt: string;
  notes: string | null;
  fitAnalysisId: number | null;
  desirabilityScoreId: number | null;
  applicationMaterialId: number | null;
  createdAt: string;
}

function toApplicationOps(record: LocalApplicationOpsRecord): ApplicationOps {
  const reasons: string[] = [];
  const now = Date.now();

  if (record.nextActionAt && new Date(record.nextActionAt).getTime() < now) {
    reasons.push("Overdue next action");
  }
  if (record.deadlineAt && new Date(record.deadlineAt).getTime() < now) {
    reasons.push("Past deadline");
  }

  return {
    role_id: record.roleId,
    applied_at: record.appliedAt,
    deadline_at: record.deadlineAt,
    source: record.source,
    recruiter_contact: record.recruiterContact,
    notes: record.notes,
    next_action_at: record.nextActionAt,
    needs_attention: reasons.length > 0,
    attention_reasons: reasons,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

function toInterviewStageEvent(record: LocalInterviewStageRecord): InterviewStageEvent {
  return {
    id: Number.parseInt(record.id.replace(/\D/g, "").slice(-6) || "1", 10),
    role_id: record.roleId,
    stage: record.stage,
    notes: record.notes,
    occurred_at: record.occurredAt,
    created_at: record.createdAt,
  };
}

function toOutcomeEvent(record: LocalOutcomeRecord): OutcomeEvent {
  return {
    id: record.outcomeId,
    role_id: record.roleId,
    event_type: record.eventType,
    occurred_at: record.occurredAt,
    notes: record.notes,
    fit_analysis_id: record.fitAnalysisId,
    desirability_score_id: record.desirabilityScoreId,
    application_material_id: record.applicationMaterialId,
    model_family: null,
    model: null,
    prompt_version: null,
    created_at: record.createdAt,
  };
}

export async function getLocalApplicationOps(roleId: number): Promise<ApplicationOps> {
  const records = await listStoreRecords<LocalApplicationOpsRecord>("applicationOps");
  const existing = records.find((item) => item.roleId === roleId);

  if (existing) {
    return toApplicationOps(existing);
  }

  const timestamp = nowIso();
  const created: LocalApplicationOpsRecord = {
    id: createLocalId("ops"),
    roleId,
    appliedAt: null,
    deadlineAt: null,
    source: null,
    recruiterContact: null,
    notes: null,
    nextActionAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await saveStoreRecord("applicationOps", created);
  return toApplicationOps(created);
}

export async function upsertLocalApplicationOps(
  roleId: number,
  payload: ApplicationOpsUpdate,
): Promise<ApplicationOps> {
  const existing = await getLocalApplicationOps(roleId);
  const records = await listStoreRecords<LocalApplicationOpsRecord>("applicationOps");
  const record = records.find((item) => item.roleId === roleId);
  const updatedAt = nowIso();

  const updated: LocalApplicationOpsRecord = {
    id: record?.id ?? createLocalId("ops"),
    roleId,
    appliedAt: payload.applied_at ?? existing.applied_at,
    deadlineAt: payload.deadline_at ?? existing.deadline_at,
    source: payload.source ?? existing.source,
    recruiterContact: payload.recruiter_contact ?? existing.recruiter_contact,
    notes: payload.notes ?? existing.notes,
    nextActionAt: payload.next_action_at ?? existing.next_action_at,
    createdAt: record?.createdAt ?? updatedAt,
    updatedAt,
  };

  await saveStoreRecord("applicationOps", updated);
  return toApplicationOps(updated);
}

export async function updateLocalNextAction(
  roleId: number,
  nextActionAt: string | null,
): Promise<ApplicationOps> {
  return upsertLocalApplicationOps(roleId, { next_action_at: nextActionAt });
}

export async function listLocalInterviewStages(roleId: number): Promise<InterviewStageEvent[]> {
  const records = await listStoreRecords<LocalInterviewStageRecord>("interviewStages");
  return records
    .filter((item) => item.roleId === roleId)
    .map(toInterviewStageEvent)
    .sort((left, right) => new Date(left.occurred_at).getTime() - new Date(right.occurred_at).getTime());
}

export async function addLocalInterviewStage(
  roleId: number,
  payload: InterviewStageEventCreate,
): Promise<InterviewStageEvent> {
  const record: LocalInterviewStageRecord = {
    id: createLocalId("stage"),
    roleId,
    stage: payload.stage,
    notes: payload.notes ?? null,
    occurredAt: payload.occurred_at,
    createdAt: nowIso(),
  };
  await saveStoreRecord("interviewStages", record);
  return toInterviewStageEvent(record);
}

export async function listLocalOutcomeEvents(roleId: number): Promise<OutcomeEvent[]> {
  const records = await listStoreRecords<LocalOutcomeRecord>("outcomes");
  return records
    .filter((item) => item.roleId === roleId)
    .map(toOutcomeEvent)
    .sort((left, right) => new Date(right.occurred_at).getTime() - new Date(left.occurred_at).getTime());
}

export async function addLocalOutcomeEvent(
  roleId: number,
  payload: OutcomeEventCreate,
): Promise<OutcomeEvent> {
  const record: LocalOutcomeRecord = {
    id: createLocalId("outcome"),
    outcomeId: Date.now(),
    roleId,
    eventType: payload.event_type,
    occurredAt: payload.occurred_at,
    notes: payload.notes ?? null,
    fitAnalysisId: payload.fit_analysis_id ?? null,
    desirabilityScoreId: payload.desirability_score_id ?? null,
    applicationMaterialId: payload.application_material_id ?? null,
    createdAt: nowIso(),
  };
  await saveStoreRecord("outcomes", record);
  return toOutcomeEvent(record);
}

export async function listLocalPipeline(options?: {
  overdueOnly?: boolean;
  thisWeekDeadlines?: boolean;
  recentlyUpdated?: boolean;
}): Promise<PipelineResponse> {
  const jobs = await listLocalJobs();
  const opsRecords = await listStoreRecords<LocalApplicationOpsRecord>("applicationOps");
  const stageRecords = await listStoreRecords<LocalInterviewStageRecord>("interviewStages");
  const now = Date.now();
  const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;

  let items: PipelineItem[] = jobs.map((job) => {
    const ops = opsRecords.find((item) => item.roleId === job.id);
    const stages = stageRecords
      .filter((item) => item.roleId === job.id)
      .sort((left, right) => new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime());

    const attentionReasons: string[] = [];
    if (ops?.nextActionAt && new Date(ops.nextActionAt).getTime() < now) {
      attentionReasons.push("Overdue next action");
    }
    if (ops?.deadlineAt && new Date(ops.deadlineAt).getTime() < now) {
      attentionReasons.push("Past deadline");
    }

    return {
      role_id: job.id,
      company: job.company,
      title: job.title,
      status: job.status,
      interview_stage: stages[0]?.stage ?? null,
      next_action_at: ops?.nextActionAt ?? null,
      deadline_at: ops?.deadlineAt ?? null,
      needs_attention: attentionReasons.length > 0,
      attention_reasons: attentionReasons,
      updated_at: ops?.updatedAt ?? job.created_at,
    };
  });

  if (options?.overdueOnly) {
    items = items.filter((item) => item.next_action_at && new Date(item.next_action_at).getTime() < now);
  }
  if (options?.thisWeekDeadlines) {
    items = items.filter((item) => {
      if (!item.deadline_at) return false;
      const deadline = new Date(item.deadline_at).getTime();
      return deadline >= now && deadline <= weekFromNow;
    });
  }
  if (options?.recentlyUpdated) {
    items = items.filter((item) => new Date(item.updated_at).getTime() >= now - 7 * 24 * 60 * 60 * 1000);
  }

  const counters: PipelineCounters = {
    needs_follow_up: items.filter((item) => item.needs_attention).length,
    overdue_actions: items.filter(
      (item) => item.next_action_at && new Date(item.next_action_at).getTime() < now,
    ).length,
    upcoming_deadlines: items.filter((item) => {
      if (!item.deadline_at) return false;
      const deadline = new Date(item.deadline_at).getTime();
      return deadline >= now && deadline <= weekFromNow;
    }).length,
  };

  return { counters, items };
}
