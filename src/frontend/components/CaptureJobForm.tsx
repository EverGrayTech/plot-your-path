"use client";

import React, { type FormEvent, useEffect, useState } from "react";

import type { JobScrapeResponse } from "../lib/dataModels";
import { getFrontendServices } from "../lib/services";

type Phase = "idle" | "submitting" | "success" | "error";

const progressSteps = [
  "Validating URL",
  "Scraping job posting",
  "Parsing job details",
  "Saving role and skills",
];

interface CaptureJobFormProps {
  onCaptured?: (result: JobScrapeResponse) => void;
}

export function CaptureJobForm({ onCaptured }: CaptureJobFormProps) {
  const services = getFrontendServices();
  const [url, setUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [captureMode, setCaptureMode] = useState<"url" | "paste">("paste");
  const [needsFallbackText, setNeedsFallbackText] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progressIndex, setProgressIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<JobScrapeResponse | null>(null);

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
              fallback_text: jobText.trim(),
              url: url.trim() || "pasted-job-description",
            }
          : needsFallbackText
            ? { url, fallback_text: jobText.trim() }
            : { url };
      const response = await services.jobs.scrapeJob(payload);
      setResult(response);
      setNeedsFallbackText(false);
      setJobText("");
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
    setJobText("");
    setCaptureMode("paste");
    setNeedsFallbackText(false);
    setPhase("idle");
    setErrorMessage(null);
    setResult(null);
  }

  const submitDisabled =
    phase === "submitting" ||
    ((captureMode === "url" && url.trim().length === 0) ||
      ((needsFallbackText || captureMode === "paste") && jobText.trim().length === 0));

  return (
    <section>
      {phase !== "success" ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="structured-message structured-message-info">
            <h4>MVP capture mode</h4>
            <p>
              The preferred MVP workflow is to paste the job description text directly. URL-based
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
              <option value="paste">Paste job description text</option>
              <option value="url">Use job URL (legacy transition mode)</option>
            </select>
          </label>

          {captureMode === "url" ? (
            <div className="form-label">
              <label htmlFor="job-url">Job URL</label>
              <input
                className="form-input"
                id="job-url"
                name="job-url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://..."
                required={captureMode === "url"}
                type="url"
                value={url}
              />
              <span className="form-helper">
                URL capture is transition-era compatibility. Prefer pasted job text for the browser
                MVP workflow.
              </span>
            </div>
          ) : null}

          {needsFallbackText || captureMode === "paste" ? (
            <div className="form-label">
              <label htmlFor="fallback-text">Pasted job description text</label>
              <textarea
                className="form-textarea"
                id="fallback-text"
                name="fallback-text"
                onChange={(event) => setJobText(event.target.value)}
                placeholder="Paste the full job description text here"
                rows={8}
                value={jobText}
              />
              <span className="form-helper">
                Paste the full job description text. This is the preferred MVP input path for the
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
                    : "Capture job"}
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
            Capture another job
          </button>
        </output>
      ) : null}
    </section>
  );
}
