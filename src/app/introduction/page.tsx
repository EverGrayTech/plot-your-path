import Link from "next/link";
import React from "react";

import { HomePageClient } from "../../components/HomePageClient";
import { LoopArrows } from "../../components/LoopArrows";

const outcomes = [
  "Decide which roles are worth your time before you sink effort into them.",
  "Reuse real experience in applications and interviews instead of rebuilding from memory.",
  "Spot patterns in strengths, gaps, and outcomes that improve your next decision.",
  "Build concrete plans to grow and improve in the areas you want to focus on.",
];

const features = [
  {
    description:
      "Turn pasted descriptions and captured opportunities into structured role records you can actually compare.",
    title: "Role capture and structuring",
  },
  {
    description:
      "Review fit, desirability, and key signals so you can focus on the opportunities that matter most.",
    title: "Evaluation support",
  },
  {
    description:
      "Keep relevant context, evidence, and preparation steps connected as you move through applications and interviews.",
    title: "Application and interview workflow",
  },
  {
    description:
      "Preserve reusable accomplishments, stories, and skill evidence so each future search starts stronger.",
    title: "Evidence and skills visibility",
  },
];

const differentiators = [
  {
    description:
      "Plot Your Path helps you judge where to focus, not just record what happened after the fact.",
    title: "Decision support over simple tracking",
  },
  {
    description:
      "It turns messy career activity into structured information that is easier to compare, revisit, and build on.",
    title: "Structured career intelligence",
  },
  {
    description:
      "It preserves evidence you can reuse across roles, interviews, and future growth decisions.",
    title: "Reusable evidence capture",
  },
  {
    description:
      "Your career data stays on your device by default, which supports trust without asking you to accept black-box handling.",
    title: "Local-first trust",
  },
];

const gettingStartedSteps = [
  "Paste a job description you're interested in into Roles.",
  "Review the desirability of the company and the role.",
  "Add your career experience in order to evaluated how each role matches your existings skills.",
  "Prepare applications and interviews with relevant evidence close at hand.",
  "Review in demand skills against your current strengths, and create plans to fill any gaps.",
];

const loopStages = [
  "Evaluate desirability and fit",
  "Prepare applications and interviews",
  "Capture evidence and outcomes",
  "Improve future decisions",
];

const technicalDifferentiators = [
  "Browser-based and local-first by default, so your information stays with you unless you choose to export it.",
  "Structured records and traceable context instead of opaque automation or one-shot prompts.",
  "Built to support judgment and authorship rather than replace them with blind workflow automation.",
];

export default function IntroductionPage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <p className="home-eyebrow">Welcome to Plot Your Path</p>
        <header className="page-header home-hero-header">
          <div className="home-hero-copy">
            <h1>Make better career decisions with clarity and confidence.</h1>
            <p className="home-hero-description">
              Plot Your Path helps you evaluate opportunities, prepare stronger applications, and
              build a purposeful career roadmap.
            </p>
            <HomePageClient />
          </div>
        </header>
      </section>

      <section aria-labelledby="home-outcomes-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">What Plot Your Path helps you do</p>
            <h2 id="home-outcomes-heading">Start with the decision, not the busywork.</h2>
          </div>
        </div>
        <ul className="home-outcome-list">
          {outcomes.map((item) => (
            <li className="home-outcome-item" key={item}>
              {item}
            </li>
          ))}
        </ul>
        <div className="home-cta-row">
          <Link className="btn btn-primary" href="/roles">
            Start evaluating Roles
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-it-works" id="how-it-works">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">The path gets stronger as you use it</p>
            <h2 id="home-path-heading">This is not just a one-time application helper.</h2>
          </div>
        </div>
        <p className="home-section-intro">
          Each part of the workflow feeds the next. The more clearly you capture opportunities,
          evidence, and outcomes, the easier it becomes to make stronger decisions later.
        </p>
        <div aria-label="Reinforcing career decision loop" className="home-loop-diagram">
          <div className="home-loop-stage home-loop-stage--top-left">{loopStages[0]}</div>
          <div className="home-loop-stage home-loop-stage--bottom-left">{loopStages[1]}</div>
          <div className="home-loop-stage home-loop-stage--bottom-right">{loopStages[2]}</div>
          <div className="home-loop-stage home-loop-stage--top-right">{loopStages[3]}</div>
          <LoopArrows className="home-loop-illustration" />
        </div>
      </section>

      <section aria-labelledby="home-features-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">Key features</p>
            <h2 id="home-features-heading">
              Core capabilities built around real career workflows.
            </h2>
          </div>
        </div>
        <div className="home-card-grid">
          {features.map((feature) => (
            <article className="card home-info-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-different-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">Why it is different</p>
            <h2 id="home-different-heading">Built to support judgment, reuse, and trust.</h2>
          </div>
        </div>
        <div className="home-card-grid">
          {differentiators.map((item) => (
            <article className="card home-info-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-getting-started-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">Getting started</p>
            <h2 id="home-getting-started-heading">A simple first path into the app.</h2>
          </div>
        </div>
        <ol className="home-steps-list">
          {gettingStartedSteps.map((step) => (
            <li className="home-step-item" key={step}>
              {step}
            </li>
          ))}
        </ol>
        <div className="home-cta-row">
          <Link className="btn btn-primary" href="/roles">
            Start with Roles
          </Link>
          <Link className="btn btn-secondary" href="/skills">
            Explore Skills
          </Link>
        </div>
      </section>

      <section aria-labelledby="home-technical-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">Technical differentiators</p>
            <h2 id="home-technical-heading">
              Readable product architecture, not engineering theater.
            </h2>
          </div>
        </div>
        <p className="home-section-intro">
          Plot Your Path is designed to be trustworthy in how it handles sensitive career data and
          useful in how it structures information for later reuse.
        </p>
        <ul className="home-outcome-list">
          {technicalDifferentiators.map((item) => (
            <li className="home-outcome-item" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-status-heading" className="card home-status-card">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">Current status</p>
            <h2 id="home-status-heading">MVP / public preview</h2>
          </div>
        </div>
        <p>
          Plot Your Path is already useful for the core workflow, but it is still evolving. Expect
          steady refinement, clearer supporting materials, and stronger visualization over time.
        </p>
      </section>
    </div>
  );
}
