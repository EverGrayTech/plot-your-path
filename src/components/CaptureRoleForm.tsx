"use client";

import React, { type FormEvent, useEffect, useState } from "react";

import type { RoleCaptureResponse } from "../lib/dataModels";
import { getFrontendServices } from "../lib/services";

type Phase = "idle" | "submitting" | "success" | "error";

const progressSteps = [
  "Validating URL",
  "Scraping role posting",
  "Parsing role details",
  "Saving role and skills",
];

interface CaptureRoleFormProps {
  onCaptured?: (result: RoleCaptureResponse) => void;
}

export function CaptureRoleForm({ onCaptured }: CaptureRoleFormProps) {
  const services = getFrontendServices();
  const [url, setUrl] = useState("");
  const [roleText, setRoleText] = useState("");
  const [captureMode, setCaptureMode] = useState<"url" | "paste">("paste");
  const [needsFallbackText, setNeedsFallbackText] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progressIndex, setProgressIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RoleCaptureResponse | null>(null);

  useEffect(() => {
    if (phase !== "submitting") {
      return;
    }

    setProgressIndex(0);
    const timer = setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % progressSteps.length);
    }, 900);

    return () => {
      clearInterval(timer);
    };
  }, [phase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPhase("submitting");
    setErrorMessage(null);
    setResult(null);

    try {
      const payload =
        captureMode === "paste"
          ? {
              fallback_text: roleText.trim(),
              url: url.trim() || "pasted-role-description",
            }
          : needsFallbackText
            ? { url, fallback_text: roleText.trim() }
            : { url };
      const response = await services.roles.captureRole(payload);
      setResult(response);
      setNeedsFallbackText(false);
      setRoleText("");
      setPhase("success");
      onCaptured?.(response);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      setPhase("error");
    }
  }

  function resetForm() {
    setUrl("");
    setRoleText("");
    setCaptureMode("paste");
    setNeedsFallbackText(false);
    setPhase("idle");
    setErrorMessage(null);
    setResult(null);
  }

  const submitDisabled =
    phase === "submitting" ||
    (captureMode === "url" && url.trim().length === 0) ||
    ((needsFallbackText || captureMode === "paste") && roleText.trim().length === 0);

  return (
    <section>
      {phase !== "success" ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="structured-message structured-message-info">
            <h4>MVP capture mode</h4>
            <p>
              The preferred MVP workflow is to paste the role description text directly. URL-based
              capture remains available only as transition-era compatibility while the browser-local
              workflow is being completed.
            </p>
          </div>

          <label className="form-label">
            Capture method
            <select
              className="form-select"
              onChange={(event) => {
                const nextMode = event.target.value as "url" | "paste";
                setCaptureMode(nextMode);
                setNeedsFallbackText(nextMode === "paste");
                setErrorMessage(null);
              }}
              value={captureMode}
            >
              <option value="paste">Paste role description text</option>
              <option value="url">Use role URL (temporary compatibility mode)</option>
            </select>
          </label>

          {captureMode === "url" ? (
            <div className="form-label">
              <label htmlFor="role-url">Role URL</label>
              <input
                className="form-input"
                id="role-url"
                name="role-url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                required={captureMode === "url"}
                type="url"
                value={url}
              />
              <span className="form-helper">
                URL capture is transition-era compatibility. Prefer pasted role text for the browser
                MVP workflow.
              </span>
            </div>
          ) : null}

          {needsFallbackText || captureMode === "paste" ? (
            <div className="form-label">
              <label htmlFor="fallback-text">Pasted role description text</label>
              <textarea
                className="form-textarea"
                id="fallback-text"
                name="fallback-text"
                onChange={(event) => setRoleText(event.target.value)}
                placeholder="Paste the full role description text here"
                rows={8}
                value={roleText}
              />
              <span className="form-helper">
                Paste the full role description text. This is the preferred MVP input path for the
                browser-local workflow.
              </span>
            </div>
          ) : null}

          <div>
            <button
              className={`btn btn-primary${phase === "submitting" ? " btn-loading" : ""}`}
              disabled={submitDisabled}
              type="submit"
            >
              {phase === "submitting"
                ? "Capturing"
                : captureMode === "paste"
                  ? "Capture from pasted text"
                  : needsFallbackText
                    ? "Submit with pasted text"
                    : "Capture role"}
            </button>
          </div>
        </form>
      ) : null}

      {phase === "submitting" ? (
        <p className="page-description mt-md" aria-live="polite">
          {progressSteps[progressIndex]}…
        </p>
      ) : null}

      {errorMessage ? (
        <div className="alert alert-error mt-md" role="alert" aria-live="assertive">
          <strong>Capture failed</strong>
          <p>{errorMessage}</p>
          {!needsFallbackText ? (
            <p className="form-helper">Check that the URL is correct and try again.</p>
          ) : null}
        </div>
      ) : null}

      {phase === "success" && result ? (
        <output aria-live="polite">
          <div className="alert alert-success mt-md">
            <p>
              Role captured: <strong>{result.title}</strong> at <strong>{result.company}</strong>.
            </p>
            <p className="form-helper">
              This role is now available for local-first evaluation and application-help workflows.
            </p>
          </div>
          <button className="btn btn-secondary mt-md" onClick={resetForm} type="button">
            Capture another role
          </button>
        </output>
      ) : null}
    </section>
  );
}
