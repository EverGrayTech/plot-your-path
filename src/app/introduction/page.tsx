import Link from "next/link";
import React from "react";

import { appMetadata } from "../../app-metadata";
import { HomePageClient } from "../../components/HomePageClient";
import { LoopArrows } from "../../components/LoopArrows";

export default function IntroductionPage() {
  const { overview } = appMetadata;

  return (
    <div className="home-page">
      <section className="home-hero">
        <p className="home-eyebrow">{overview.hero.eyebrow}</p>
        <header className="page-header home-hero-header">
          <div className="home-hero-copy">
            <h1>{overview.hero.title}</h1>
            <p className="home-hero-description">{overview.hero.description}</p>
            <HomePageClient />
          </div>
        </header>
      </section>

      <section aria-labelledby="home-outcomes-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">{overview.outcomes.kicker}</p>
            <h2 id="home-outcomes-heading">{overview.outcomes.title}</h2>
          </div>
        </div>
        <ul className="home-outcome-list">
          {overview.outcomes.items.map((item) => (
            <li className="home-outcome-item" key={item}>
              {item}
            </li>
          ))}
        </ul>
        <div className="home-cta-row">
          <Link className="btn btn-primary" href={overview.outcomes.primaryCtaHref}>
            {overview.outcomes.primaryCtaLabel}
          </Link>
        </div>
      </section>

      <section aria-labelledby="how-it-works" id="how-it-works">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">{overview.loop.kicker}</p>
            <h2 id="home-path-heading">{overview.loop.title}</h2>
          </div>
        </div>
        <p className="home-section-intro">{overview.loop.description}</p>
        <div aria-label={overview.loop.ariaLabel} className="home-loop-diagram">
          <div className="home-loop-stage home-loop-stage--top-left">{overview.loop.stages[0]}</div>
          <div className="home-loop-stage home-loop-stage--bottom-left">
            {overview.loop.stages[1]}
          </div>
          <div className="home-loop-stage home-loop-stage--bottom-right">
            {overview.loop.stages[2]}
          </div>
          <div className="home-loop-stage home-loop-stage--top-right">
            {overview.loop.stages[3]}
          </div>
          <LoopArrows className="home-loop-illustration" />
        </div>
      </section>

      <section aria-labelledby="home-features-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">{overview.features.kicker}</p>
            <h2 id="home-features-heading">{overview.features.title}</h2>
          </div>
        </div>
        <div className="home-card-grid">
          {overview.features.items.map((feature) => (
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
            <p className="home-section-kicker">{overview.differentiators.kicker}</p>
            <h2 id="home-different-heading">{overview.differentiators.title}</h2>
          </div>
        </div>
        <div className="home-card-grid">
          {overview.differentiators.items.map((item) => (
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
            <p className="home-section-kicker">{overview.gettingStarted.kicker}</p>
            <h2 id="home-getting-started-heading">{overview.gettingStarted.title}</h2>
          </div>
        </div>
        <ol className="home-steps-list">
          {overview.gettingStarted.items.map((step) => (
            <li className="home-step-item" key={step}>
              {step}
            </li>
          ))}
        </ol>
        <div className="home-cta-row">
          <Link className="btn btn-primary" href={overview.gettingStarted.primaryCtaHref}>
            {overview.gettingStarted.primaryCtaLabel}
          </Link>
          <Link className="btn btn-secondary" href={overview.gettingStarted.secondaryCtaHref}>
            {overview.gettingStarted.secondaryCtaLabel}
          </Link>
        </div>
      </section>

      <section aria-labelledby="home-technical-heading">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">{overview.technicalDifferentiators.kicker}</p>
            <h2 id="home-technical-heading">{overview.technicalDifferentiators.title}</h2>
          </div>
        </div>
        <p className="home-section-intro">{overview.technicalDifferentiators.description}</p>
        <ul className="home-outcome-list">
          {overview.technicalDifferentiators.items.map((item) => (
            <li className="home-outcome-item" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="home-status-heading" className="card home-status-card">
        <div className="section-header home-section-header">
          <div>
            <p className="home-section-kicker">{overview.currentStatus.kicker}</p>
            <h2 id="home-status-heading">{overview.currentStatus.heading}</h2>
          </div>
        </div>
        <p>{overview.currentStatus.content}</p>
      </section>
    </div>
  );
}
