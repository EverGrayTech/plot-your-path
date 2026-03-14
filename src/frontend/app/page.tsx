import Link from "next/link";
import React from "react";

import { DesktopStatusCard } from "../components/DesktopStatusCard";

export default function HomePage() {
  return (
    <>
      <header className="page-header">
        <h1>Home</h1>
      </header>
      <p className="page-description">
        Capture opportunities, evaluate fit, pursue deliberately, and learn over time.
      </p>

      <div className="form-grid-2col">
        <Link className="card" href="/jobs">
          <h3>Jobs</h3>
          <p>
            Capture and review roles from your job search. Analyze fit, score desirability, and
            track applications through every stage.
          </p>
        </Link>

        <Link className="card" href="/skills">
          <h3>Skills</h3>
          <p>
            Browse captured skills across all roles. See which skills appear most often and where
            they are referenced.
          </p>
        </Link>

        <DesktopStatusCard />
      </div>
    </>
  );
}
