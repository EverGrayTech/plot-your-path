import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { CaptureJobForm } from "../../../src/frontend/components/CaptureJobForm";
import * as api from "../../../src/frontend/lib/api";

describe("CaptureJobForm", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("submits URL first and renders success state", async () => {
    vi.spyOn(api, "scrapeJob").mockResolvedValue({
      status: "success",
      role_id: 101,
      company: "TechCo",
      title: "Backend Engineer",
      skills_extracted: 6,
      processing_time_seconds: 1.2,
    });

    render(<CaptureJobForm />);

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Captured Backend Engineer at TechCo",
    );
    expect(screen.getByText("Role ID: 101")).toBeInTheDocument();
  });

  it("reveals fallback textarea when API requests fallback", async () => {
    vi.spyOn(api, "scrapeJob").mockRejectedValueOnce(
      new api.ApiError(
        "Unable to scrape this URL. Paste the job text and resubmit.",
        422,
        {
          code: "FALLBACK_TEXT_REQUIRED",
          message: "Unable to scrape this URL. Paste the job text and resubmit.",
        },
        "FALLBACK_TEXT_REQUIRED",
      ),
    );

    render(<CaptureJobForm />);

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/blocked" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to scrape this URL");
    expect(screen.getByLabelText("Pasted job description text")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit with pasted text" })).toBeInTheDocument();
  });

  it("submits fallback text after fallback is requested", async () => {
    const scrapeSpy = vi
      .spyOn(api, "scrapeJob")
      .mockRejectedValueOnce(
        new api.ApiError(
          "Unable to scrape this URL. Paste the job text and resubmit.",
          422,
          {
            code: "FALLBACK_TEXT_REQUIRED",
            message: "Unable to scrape this URL. Paste the job text and resubmit.",
          },
          "FALLBACK_TEXT_REQUIRED",
        ),
      )
      .mockResolvedValueOnce({
        status: "success",
        role_id: 102,
        company: "Fallback Inc",
        title: "Platform Engineer",
        skills_extracted: 5,
        processing_time_seconds: 1.5,
      });

    render(<CaptureJobForm />);

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/blocked" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    await screen.findByLabelText("Pasted job description text");

    fireEvent.change(screen.getByLabelText("Pasted job description text"), {
      target: { value: "Full pasted JD text" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit with pasted text" }));

    await screen.findByRole("status");

    expect(scrapeSpy).toHaveBeenNthCalledWith(1, {
      url: "https://example.com/jobs/blocked",
    });
    expect(scrapeSpy).toHaveBeenNthCalledWith(2, {
      url: "https://example.com/jobs/blocked",
      fallback_text: "Full pasted JD text",
    });
  });

  it("shows generic error for non-fallback API errors", async () => {
    vi.spyOn(api, "scrapeJob").mockRejectedValue(
      new api.ApiError("Server error", 500, "Server error"),
    );

    render(<CaptureJobForm />);

    fireEvent.change(screen.getByLabelText("Job URL"), {
      target: { value: "https://example.com/jobs/500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Capture job" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Server error");
    });
  });
});
