# Plot Your Path — Product Overview

See also: [README](../README.md), [Concept Model](./concept-model.md#core-concepts), [System Specification](./system-spec.md#product-guardrails)

## Purpose

This document defines the product intent of Plot Your Path: what problem it solves, who it is for, how it should feel to use, and where the product boundary should stay for now.

For the shared domain language behind the product, see [Concept Model → Core concepts](./concept-model.md#core-concepts). For system-level direction and constraints, see [System Specification → Product guardrails](./system-spec.md#product-guardrails).

## Product statement

Plot Your Path is a career intelligence workspace that helps people make better career decisions by connecting job opportunities, personal experience, application work, interview preparation, and skill development.

Its value comes from two things happening together:

- it helps with immediate job search tasks
- it accumulates structured knowledge that improves future decisions

## Problem

Most job search activity is fragmented.

People often have to:

- compare roles manually and inconsistently
- recreate career stories from memory
- prepare applications under time pressure
- track interview progress across too many tools
- guess which skills would materially improve future options

The result is effort without much retained learning.

## Desired outcome

Plot Your Path should help a user:

- decide which roles deserve attention
- prepare grounded, credible applications
- walk into interviews with better recall and structure
- preserve useful career evidence as it happens
- see patterns across roles, outcomes, and skill gaps

The product should make the user more intentional, not more dependent.

## Product principles

### 1. Immediate value first

The product should be useful early.

A user should be able to bring in a role, compare it against their background, and get something actionable without a long setup process.

### 2. Progressive depth

The system should become more valuable as the user adds more information, but deeper engagement should always feel optional rather than required.

Typical progression:

1. evaluate a role
2. manage an application
3. prepare for interviews
4. capture career evidence
5. identify patterns and strategic next steps

### 3. Assistive, not autonomous

The system can analyze, summarize, and suggest. It should not pretend to replace judgment, authorship, or authenticity.

The user remains responsible for decisions, messaging, and final materials.

### 4. Evidence over performance

Whenever possible, the product should ground outputs in real experience, concrete achievements, and traceable career evidence.

This matters especially for applications, interview prep, and future learning recommendations.

### 5. Local-first trust

Career data is sensitive. The product should be shaped around privacy, ownership, and the assumption that users want strong control over their information.

### 6. Clear scope

The project should be ambitious about usefulness, but disciplined about sprawl.

It is not trying to become a general life coach, an auto-apply bot, or an exhaustive labor-market simulator.

## Core user journey

The product supports a repeating cycle.

### Phase 1: Capture opportunities

The user brings opportunities into the system from job boards, company sites, recruiter messages, or pasted text.

The goal of this phase is simple: turn a messy opportunity into something structured enough to reason about.

### Phase 2: Evaluate fit

The system compares the role with the user's current skills and experience.

This phase should answer questions like:

- Is this role plausible?
- Where am I strong?
- What are the meaningful gaps?
- Is this worth time and energy right now?

### Phase 3: Prepare the application

If the role is worth pursuing, the system helps the user prepare materials and position their experience more clearly.

This includes support for:

- cover letters
- application question responses
- resume tailoring prompts or suggestions
- role-specific positioning

### Phase 4: Prepare for interviews

Once a process is underway, the system becomes an interview workspace.

It should help the user reconnect the role, company context, relevant evidence, and prepared stories in one place.

### Phase 5: Capture career evidence

Outside an active search, the system should still be useful.

Users should be able to capture meaningful work, outcomes, challenges, and growth while they are fresh. This reduces later reconstruction work and improves future applications.

### Phase 6: Find patterns and guide growth

As more roles and evidence accumulate, the system should help the user notice:

- recurring strengths
- recurring missing skills
- opportunity clusters
- outcome patterns
- development moves with high leverage

This is where the product becomes a career intelligence system rather than only a job search assistant.

## Primary user

Plot Your Path is most valuable for people taking an intentional, strategic approach to their careers.

That likely includes:

- mid-career professionals
- senior individual contributors
- people navigating complex or high-stakes career decisions
- people who want stronger continuity between one search and the next

It may still help earlier-career users, but it should not be designed around high-volume mass application behavior.

## In scope

The current product vision should stay focused on:

- role capture and structuring
- fit and desirability evaluation
- application support
- interview preparation
- career evidence capture
- skill-gap discovery
- outcome-informed reflection

## Not in scope for now

To keep the vision manageable, the product should avoid expanding too quickly into:

- automated job application submission
- social networking features
- multi-user collaboration
- exhaustive career-path simulation
- broad personal productivity tooling unrelated to career decisions

## Long-term shape

Over time, Plot Your Path may reasonably grow into adjacent areas such as:

- opportunity recommendations
- learning roadmap suggestions
- portfolio or project planning
- stronger outcome feedback loops

Those additions should reinforce the core loop rather than distract from it.
