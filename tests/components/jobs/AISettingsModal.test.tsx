import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { AISettingsModal } from "../../../src/components/jobs/AISettingsModal";

describe("AISettingsModal", () => {
  const setting = {
    operation_family: "job_parsing" as const,
    provider: "openai",
    model: "gpt-4o-mini",
    token_label: "Local token",
    base_url: null,
    temperature: 0.2,
    max_tokens: 4000,
    has_runtime_token: true,
    token_masked: "••••7890",
    created_at: "2026-03-18T00:00:00.000Z",
    updated_at: "2026-03-18T00:00:00.000Z",
  };

  it("renders loading and error states", () => {
    render(
      <AISettingsModal
        aiSettings={[]}
        error="Failed to load"
        healthByFamily={{}}
        loading
        onClearToken={vi.fn()}
        onClose={vi.fn()}
        onHealthcheck={vi.fn()}
        onTokenInputChange={vi.fn()}
        onUpdateConfig={vi.fn()}
        onUpdateToken={vi.fn()}
        tokenInputs={{
          application_generation: "",
          desirability_scoring: "",
          fit_analysis: "",
          job_parsing: "",
        }}
      />,
    );

    expect(screen.getByText(/Loading AI settings/i)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to load");
  });

  it("updates config, token input, and action buttons", () => {
    const onUpdateConfig = vi.fn();
    const onTokenInputChange = vi.fn();
    const onUpdateToken = vi.fn();
    const onClearToken = vi.fn();
    const onHealthcheck = vi.fn();

    render(
      <AISettingsModal
        aiSettings={[setting]}
        error={null}
        healthByFamily={{ job_parsing: "OK" }}
        loading={false}
        onClearToken={onClearToken}
        onClose={vi.fn()}
        onHealthcheck={onHealthcheck}
        onTokenInputChange={onTokenInputChange}
        onUpdateConfig={onUpdateConfig}
        onUpdateToken={onUpdateToken}
        tokenInputs={{
          application_generation: "",
          desirability_scoring: "",
          fit_analysis: "",
          job_parsing: "new-token",
        }}
      />,
    );

    fireEvent.blur(screen.getByDisplayValue("openai"), { target: { value: "anthropic" } });
    fireEvent.blur(screen.getByDisplayValue("gpt-4o-mini"), { target: { value: "gpt-4.1" } });
    fireEvent.blur(screen.getByDisplayValue("Local token"), {
      target: { value: "Updated token" },
    });
    fireEvent.change(screen.getByPlaceholderText("Paste token"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /Save Token/i }));
    fireEvent.click(screen.getByRole("button", { name: /Clear Token/i }));
    fireEvent.click(screen.getByRole("button", { name: /Test Config/i }));

    expect(onUpdateConfig).toHaveBeenCalledWith("job_parsing", { provider: "anthropic" });
    expect(onUpdateConfig).toHaveBeenCalledWith("job_parsing", { model: "gpt-4.1" });
    expect(onUpdateConfig).toHaveBeenCalledWith("job_parsing", { token_label: "Updated token" });
    expect(onTokenInputChange).toHaveBeenCalledWith("job_parsing", "secret");
    expect(onUpdateToken).toHaveBeenCalledWith("job_parsing");
    expect(onClearToken).toHaveBeenCalledWith("job_parsing");
    expect(onHealthcheck).toHaveBeenCalledWith("job_parsing");
    expect(screen.getByText("OK")).toBeInTheDocument();
  });
});
