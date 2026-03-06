import React from "react";
import { CaptureJobForm } from "../components/CaptureJobForm";

export default function CapturePage() {
  return (
    <section>
      <h1>MVP Job Capture</h1>
      <p>Paste a job URL first. If needed, you can fall back to pasted job text.</p>
      <CaptureJobForm />
    </section>
  );
}
