"use client";

import React, { type FormEvent, useEffect, useState } from "react";

import { ApiError, type JobScrapeResponse, scrapeJob } from "../lib/api";

type Phase = "idle" | "submitting" | "success" | "error";

const progressSteps = [
  "Validating URL...",
  "Scraping job posting...",
  "Parsing job details...",
  "Saving role and skills...",
];

interface CaptureJobFormProps {
  onCaptured?: (result: JobScrapeResponse) => void;
}

export function CaptureJobForm({ onCaptured }: CaptureJobFormProps) {
  const [url, setUrl] = useState("");
  const [jobText, setJobText] = useState("");
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
      const payload = needsFallbackText ? { url, fallback_text: jobText.trim() } : { url };
      const response = await scrapeJob(payload);
      setResult(response);
      setNeedsFallbackText(false);
      setJobText("");
      setPhase("success");
      onCaptured?.(response);
    } catch (error) {
      if (error instanceof ApiError && error.code === "FALLBACK_TEXT_REQUIRED") {
        setNeedsFallbackText(true);
        setErrorMessage(
          error.message ||
            "We couldn't parse that URL automatically. Paste the job description text and try again.",
        );
      } else if (error instanceof Error) {
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
    setNeedsFallbackText(false);
    setPhase("idle");
    setErrorMessage(null);
    setResult(null);
  }

  const submitDisabled =
    phase === "submitting" ||
    url.trim().length === 0 ||
    (needsFallbackText && jobText.trim().length === 0);

  return (
    <section>
      {phase !== "success" ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="job-url">
            Job URL
            <input
              className="form-input"
              id="job-url"
              name="job-url"
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              required
              type="url"
              value={url}
            />
          </label>

          {needsFallbackText ? (
            <label className="form-label" htmlFor="fallback-text">
              Pasted job description text
              <textarea
                className="form-textarea"
                id="fallback-text"
                name="fallback-text"
                onChange={(event) => setJobText(event.target.value)}
                placeholder="Paste the full job description text here"
                rows={8}
                value={jobText}
              />
            </label>
          ) : null}

          <div>
            <button className="btn btn-primary" disabled={submitDisabled} type="submit">
              {needsFallbackText ? "Submit with pasted text" : "Capture job"}
            </button>
          </div>
        </form>
      ) : null}

      {phase === "submitting" ? <p aria-live="polite">{progressSteps[progressIndex]}</p> : null}

      {errorMessage ? (
        <p role="alert" aria-live="assertive">
          {errorMessage}
        </p>
      ) : null}

      {phase === "success" && result ? (
        <output aria-live="polite">
          <p>
            Captured <strong>{result.title}</strong> at <strong>{result.company}</strong>.
          </p>
          <p>Role ID: {result.role_id}</p>
          <button className="btn btn-secondary" onClick={resetForm} type="button">
            Capture another job
          </button>
        </output>
      ) : null}
    </section>
  );
}
