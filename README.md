# Plot Your Path

Plot Your Path is a local-first career intelligence workspace that helps you approach job searching and career growth with clarity and continuity.

It transforms scattered roles, applications, interview prep, and career reflection into a single system; so you can make better decisions in the moment while building a coherent, reusable record of your experiences.

Over time, it becomes a navigable map of your career, grounded in your actual experience, so you can see where you are, which opportunities truly fit, and puposefully chart your path forward.

## What it is

Plot Your Path is designed to help a user:

- evaluate whether a role is worth pursuing
- prepare stronger, more grounded applications
- organize interview preparation around real experience
- capture career evidence before it is forgotten
- identify skill gaps and recurring patterns that meaningfully affect future options

The product is not meant to automate a career search end to end. It is meant to help a person think more clearly, prepare more effectively, and retain the professional context that usually gets lost between opportunities.

## Why it exists

Job searching is often handled as a series of disconnected tasks:

- saving links in too many places
- re-reading the same job descriptions
- rewriting the same stories from memory
- guessing which roles are realistic
- guessing which skills matter most next

That makes the process noisy, repetitive, and hard to learn from.

Plot Your Path reframes job-search activity as a feedback loop:

1. collect opportunities
2. analyze them consistently
3. pursue the right ones intentionally
4. prepare using real evidence
5. learn from outcomes
6. use those patterns to guide future growth

## Product values

The project is shaped by a small set of durable values:

- **local-first** so sensitive career data stays under YOUR control
- **assistive** rather than autonomous
- **evidence-based** so decisions and outputs stay grounded in real experience
- **progressive** so the system is useful early and becomes more valuable with deeper use
- **practical** in scope, favoring clear decisions over exhaustive analysis

## Application shape

The repository is centered on a browser-hosted Next.js application with a TypeScript-first architecture.

The product keeps workspace data on the user's device, uses browser-local persistence for core workflows, and treats export/import as an explicit part of the user experience rather than a hidden implementation detail.

The app focuses on five capability areas:

1. opportunity capture
2. role fit evaluation
3. application and interview support
4. career evidence capture
5. skill-gap and pattern discovery

That is a deliberate product boundary. The vision is broader than a tracker, but narrower than a general life-planning system.

## Documentation map

These documents define the product purpose, shared language, and architectural expectations the codebase should reinforce.

- [Product Overview](docs/product-overview.md) — product goals, user journey, principles, and scope boundaries
- [Concept Model](docs/concept-model.md) — shared domain language and how the core entities relate
- [System Specification](docs/system-spec.md) — architectural guardrails, capability boundaries, and system expectations
- [Development Workflows](docs/development.md) — local setup, test commands, and contributor workflow guidance

If you are new to the project, read them in that order.
