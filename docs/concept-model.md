# Plot Your Path — Concept Model

This document defines the shared conceptual language of Plot Your Path.

It is intentionally product-level rather than implementation-level. The goal is to give contributors a stable mental model for discussing features, workflows, and future phases without tying the language too tightly to a specific schema or UI.

- [README](README.md) — high-level introduction for new users
- [Product Overview](docs/product-overview.md) — product goals, design principles, user journey, and scope
- [System Specification](docs/system-spec.md) — architectural guardrails, capability boundaries, and system expectations
- [Development Workflows](docs/development.md) — local setup, test commands, and contributor workflow guidance


## System view

Plot Your Path creates value by connecting three domains:

1. **opportunities** — what the market is asking for
2. **evidence** — what the user has done, learned, and can credibly claim
3. **insight** — what the system derives by comparing the first two

## Core concepts

### Company

A **company** is an organization associated with one or more opportunities.

In the product, a company is not only a source of roles. It is also part of the decision context. Users may care about attributes such as reputation, growth, culture, compensation potential, or mission alignment.

### Role

A **role** is a specific opportunity at a company.

It begins as unstructured input, such as a posting URL or pasted description, and becomes structured enough to evaluate. A role provides the main unit of comparison for fit, desirability, applications, and interview preparation.

### Skill

A **skill** is a capability that appears in one or both of these places:

- the market's expectations for a role
- the user's current or developing capability set

Skills are one of the main bridges between opportunity analysis and growth planning.

### Career evidence

**Career evidence** is the raw material of the user's professional story.

It includes concrete experiences, outcomes, projects, responsibilities, examples, and achievements. Evidence matters because it supports grounded applications, interview answers, and more trustworthy analysis.

This is the preferred umbrella term for the user's reusable professional substance.

### Experience

An **experience** is a meaningful unit of career evidence.

Examples:

- a project delivered
- a technical problem solved
- a leadership moment
- a measurable outcome achieved

Experiences are useful because they can be repurposed into several downstream artifacts.

### Story

A **story** is a structured narrative derived from career evidence.

The most familiar form is a STAR story, but the broader idea matters more than the specific format: a story packages evidence so it can be reused in interviews, applications, and reflection.

### Application

An **application** is the user's active pursuit of a role.

It connects the opportunity itself with operational details, generated materials, interview progress, and eventual outcomes.

### Outcome

An **outcome** is a downstream signal from the market in response to a pursued role.

Examples include:

- recruiter response
- interview progression
- rejection
- offer

Outcomes matter because they help the user learn which patterns are working and where to adjust.

## Derived concepts

These concepts are not primary records; they are produced by comparing or synthesizing other concepts.

### Role fit

**Role fit** is the system's view of how well a role aligns with the user's current evidence and skills.

It should help answer:

- what is already covered
- what is adjacent or learnable
- what is missing
- whether the opportunity looks strong, uncertain, or weak

### Company desirability

**Company desirability** is a structured view of how attractive a company appears from the user's perspective.

This is not a universal truth. It is a decision aid shaped by chosen factors and user priorities.

### Skill gap

A **skill gap** is a missing or underdeveloped capability that appears often enough, or matters strongly enough, to deserve attention.

The goal is not to list every missing skill. The goal is to surface the gaps with the highest decision value.

### Career memory

**Career memory** is the accumulated body of evidence, stories, outcomes, and reflections that makes future search work easier and better grounded.

This is one of the product's central long-term advantages.

## Relationship view

At a high level:

- companies contain or contextualize roles
- roles express demand through skills and expectations
- the user supplies evidence and skills
- applications connect a user to a role in action
- outcomes feed learning back into future decisions

Or more simply:

**opportunities + evidence -> insight -> action -> outcomes -> better future insight**

## Design intent

This concept model should support three persistent product goals:

1. **better role selection**
2. **better career storytelling**
3. **better long-term growth decisions**

If a proposed feature does not strengthen at least one of those goals, it should be treated skeptically.
