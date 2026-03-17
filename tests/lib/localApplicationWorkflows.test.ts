import {
  addLocalInterviewStage,
  addLocalOutcomeEvent,
  getLocalApplicationOps,
  listLocalInterviewStages,
  listLocalOutcomeEvents,
  listLocalPipeline,
  upsertLocalApplicationOps,
} from "../../src/lib/localApplicationWorkflows";
import { captureLocalJob } from "../../src/lib/localJobs";

import { indexedDB } from "fake-indexeddb";

describe("local application workflows", () => {
  beforeAll(() => {
    Object.defineProperty(window, "indexedDB", {
      configurable: true,
      value: indexedDB,
    });
  });

  it("creates and updates local application ops", async () => {
    const captured = await captureLocalJob({
      url: "pasted-job-description",
      fallback_text: "Ops Engineer\nIncident response",
    });

    const initial = await getLocalApplicationOps(captured.role_id);
    expect(initial.role_id).toBe(captured.role_id);

    const updated = await upsertLocalApplicationOps(captured.role_id, {
      source: "Referral",
      notes: "Follow up soon",
    });
    expect(updated.source).toBe("Referral");
  });

  it("stores and lists interview stages and outcomes", async () => {
    const captured = await captureLocalJob({
      url: "pasted-job-description",
      fallback_text: "Backend Engineer\nNode.js",
    });

    await addLocalInterviewStage(captured.role_id, {
      stage: "technical",
      occurred_at: new Date().toISOString(),
      notes: "Panel completed",
    });
    await addLocalOutcomeEvent(captured.role_id, {
      event_type: "offer",
      occurred_at: new Date().toISOString(),
      notes: "Verbal offer",
    });

    const stages = await listLocalInterviewStages(captured.role_id);
    const outcomes = await listLocalOutcomeEvents(captured.role_id);

    expect(stages).toHaveLength(1);
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0].event_type).toBe("offer");
  });

  it("builds pipeline data from local workflow records", async () => {
    const captured = await captureLocalJob({
      url: "pasted-job-description",
      fallback_text: "Product Engineer\nReact",
    });

    const overdue = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await upsertLocalApplicationOps(captured.role_id, {
      next_action_at: overdue,
    });

    const pipeline = await listLocalPipeline({ overdueOnly: true });
    expect(pipeline.counters.overdue_actions).toBeGreaterThan(0);
    expect(pipeline.items.some((item) => item.role_id === captured.role_id)).toBe(true);
  });
});
