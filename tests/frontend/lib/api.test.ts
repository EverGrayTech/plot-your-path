import {
  type ApiError,
  clearAISettingToken,
  createOutcomeEvent,
  generateCoverLetter,
  generateQuestionAnswers,
  getOutcomeInsights,
  getOutcomeTuningSuggestions,
  getSkill,
  healthcheckAISetting,
  listAISettings,
  listApplicationMaterials,
  listOutcomeEvents,
  listSkills,
  scrapeJob,
  updateAISetting,
  updateAISettingToken,
  updateJobStatus,
} from "../../../src/frontend/lib/api";

describe("scrapeJob", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed payload for successful response", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "success",
          role_id: 12,
          company: "Acme",
          title: "Engineer",
          skills_extracted: 4,
          processing_time_seconds: 0.88,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await scrapeJob({ url: "https://example.com/jobs/1" });

    expect(result.role_id).toBe(12);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws ApiError with structured fallback code", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: {
            code: "FALLBACK_TEXT_REQUIRED",
            message: "Unable to scrape this URL. Paste the job text and resubmit.",
          },
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(
      scrapeJob({ url: "https://example.com/jobs/blocked" }),
    ).rejects.toMatchObject<ApiError>({
      name: "ApiError",
      status: 422,
      code: "FALLBACK_TEXT_REQUIRED",
    });
  });
});

describe("listSkills", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed skills payload", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify([
          { id: 1, name: "Python", category: "language", usage_count: 3 },
          { id: 2, name: "FastAPI", category: "tool", usage_count: 2 },
        ]),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await listSkills();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Python");
    expect(result[0].usage_count).toBe(3);
  });
});

describe("getSkill", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns parsed skill detail payload", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          name: "Python",
          category: "language",
          usage_count: 2,
          jobs: [
            {
              id: 10,
              company: "Acme",
              title: "Backend Engineer",
              status: "open",
              created_at: "2026-03-05T10:00:00Z",
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await getSkill(1);

    expect(result.name).toBe("Python");
    expect(result.jobs[0].title).toBe("Backend Engineer");
  });
});

describe("updateJobStatus", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("patches status and returns updated list item", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 2,
          company: "Acme",
          title: "Backend Engineer",
          salary_range: "$120,000 - $150,000 USD",
          created_at: "2026-03-05T10:00:00Z",
          skills_count: 3,
          status: "submitted",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await updateJobStatus(2, "submitted");
    expect(result.status).toBe("submitted");
  });
});

describe("application materials endpoints", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("generates cover letter", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 10,
          role_id: 2,
          artifact_type: "cover_letter",
          version: 1,
          content: "Dear hiring manager...",
          questions: null,
          provider: "openai",
          model: "gpt-4o",
          prompt_version: "cover-letter-v1",
          created_at: "2026-03-07T18:00:00Z",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const result = await generateCoverLetter(2);
    expect(result.artifact_type).toBe("cover_letter");
  });

  it("generates question answers and lists saved materials", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 11,
            role_id: 2,
            artifact_type: "application_qa",
            version: 1,
            content: "Q: Why this role?\nA: Impact.",
            questions: ["Why this role?"],
            provider: "openai",
            model: "gpt-4o",
            prompt_version: "application-qa-v1",
            created_at: "2026-03-07T18:01:00Z",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 11,
              role_id: 2,
              artifact_type: "application_qa",
              version: 1,
              content: "Q: Why this role?\nA: Impact.",
              questions: ["Why this role?"],
              provider: "openai",
              model: "gpt-4o",
              prompt_version: "application-qa-v1",
              created_at: "2026-03-07T18:01:00Z",
            },
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    const generated = await generateQuestionAnswers(2, ["Why this role?"]);
    expect(generated.artifact_type).toBe("application_qa");

    const listed = await listApplicationMaterials(2);
    expect(listed).toHaveLength(1);
    expect(listed[0].id).toBe(11);
  });
});

describe("ai settings endpoints", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists, updates, and validates AI settings APIs", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              operation_family: "job_parsing",
              provider: "openai",
              model: "gpt-4o",
              api_key_env: "OPENAI_API_KEY",
              base_url: null,
              temperature: 0.1,
              max_tokens: 4000,
              has_runtime_token: false,
              token_masked: null,
              created_at: "2026-03-07T18:01:00Z",
              updated_at: "2026-03-07T18:01:00Z",
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            operation_family: "job_parsing",
            provider: "openai",
            model: "gpt-4o-mini",
            api_key_env: "OPENAI_API_KEY",
            base_url: null,
            temperature: 0.1,
            max_tokens: 4000,
            has_runtime_token: false,
            token_masked: null,
            created_at: "2026-03-07T18:01:00Z",
            updated_at: "2026-03-07T18:02:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            operation_family: "job_parsing",
            provider: "openai",
            model: "gpt-4o-mini",
            api_key_env: "OPENAI_API_KEY",
            base_url: null,
            temperature: 0.1,
            max_tokens: 4000,
            has_runtime_token: true,
            token_masked: "••••••••7890",
            created_at: "2026-03-07T18:01:00Z",
            updated_at: "2026-03-07T18:03:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ operation_family: "job_parsing", ok: true, detail: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const listed = await listAISettings();
    expect(listed).toHaveLength(1);

    const updated = await updateAISetting("job_parsing", { model: "gpt-4o-mini" });
    expect(updated.model).toBe("gpt-4o-mini");

    const tokenUpdated = await updateAISettingToken("job_parsing", "sk-test-1234567890");
    expect(tokenUpdated.token_masked).toContain("7890");

    await clearAISettingToken("job_parsing");

    const health = await healthcheckAISetting("job_parsing");
    expect(health.ok).toBe(true);
  });
});

describe("outcome feedback endpoints", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates/lists outcomes and fetches insight + tuning payloads", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 10,
            role_id: 2,
            event_type: "offer",
            occurred_at: "2026-03-09T12:00:00Z",
            notes: "Verbal offer",
            fit_analysis_id: 4,
            desirability_score_id: 5,
            application_material_id: 6,
            model_family: "openai",
            model: "gpt-4o",
            prompt_version: "cover-letter-v1",
            created_at: "2026-03-09T12:01:00Z",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: 10,
              role_id: 2,
              event_type: "offer",
              occurred_at: "2026-03-09T12:00:00Z",
              notes: "Verbal offer",
              fit_analysis_id: 4,
              desirability_score_id: 5,
              application_material_id: 6,
              model_family: "openai",
              model: "gpt-4o",
              prompt_version: "cover-letter-v1",
              created_at: "2026-03-09T12:01:00Z",
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            confidence_message: "Low confidence",
            conversion_by_fit_band: [
              { segment: "70-100", attempts: 2, hires: 1, conversion_rate: 0.5 },
            ],
            conversion_by_desirability_band: [
              { segment: "7.0-10.0", attempts: 2, hires: 1, conversion_rate: 0.5 },
            ],
            conversion_by_model_family: [
              { segment: "openai", attempts: 2, hires: 1, conversion_rate: 0.5 },
            ],
            total_events: 2,
            total_roles_with_outcomes: 1,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            confidence_message: "Low confidence",
            suggestions: [
              {
                recommendation: "Prefer openai for cover letters.",
                rationale: "Higher observed conversion in recent outcomes.",
                reversible_action: "Switch one setting and re-evaluate after 5 events.",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    const created = await createOutcomeEvent(2, {
      event_type: "offer",
      occurred_at: "2026-03-09T12:00:00Z",
      notes: "Verbal offer",
      fit_analysis_id: 4,
      desirability_score_id: 5,
      application_material_id: 6,
    });
    expect(created.event_type).toBe("offer");

    const listed = await listOutcomeEvents(2);
    expect(listed).toHaveLength(1);
    expect(listed[0].notes).toBe("Verbal offer");

    const insights = await getOutcomeInsights();
    expect(insights.total_events).toBe(2);

    const tuning = await getOutcomeTuningSuggestions();
    expect(tuning.suggestions[0].recommendation).toMatch(/Prefer openai/i);
  });
});
