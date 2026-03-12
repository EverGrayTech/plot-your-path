# Plot Your Path — System Specification

See also: [README](../README.md), [Product Overview](./product-overview.md#product-principles), [Concept Model](./concept-model.md#core-concepts), [Development Workflows](./development.md#documentation-use-during-development)

## Purpose

This document describes the system-level direction for Plot Your Path.

It is not a step-by-step build plan and not a detailed schema reference. Its role is to preserve the architectural and product guardrails that should shape future phases.

For product intent and scope boundaries, see [Product Overview → Product principles](./product-overview.md#product-principles) and [Product Overview → In scope](./product-overview.md#in-scope). For shared terminology, see [Concept Model → Core concepts](./concept-model.md#core-concepts).

## System objective

The system should help a user turn fragmented career activity into a usable decision system.

At a minimum, that means supporting a loop like this:

1. capture opportunities
2. structure and evaluate them
3. support applications and interviews
4. preserve reusable evidence
5. learn from patterns and outcomes

## Product guardrails

### Local-first by default

Sensitive career information should be treated as private by default. The system should prefer local control, local storage, and transparent data handling.

### Assistive, not autonomous

The system may analyze and suggest, but it should not obscure authorship or create pressure toward blind automation.

### Structured where it matters

The system should convert messy inputs into structured representations when that structure leads to better decisions, comparison, retrieval, or reuse.

### Flexible at the edges

Career activity is messy. The system should allow imperfect input and partial data rather than demanding complete, pristine records before it can be useful.

### Opinionated about signal, not exhaustive coverage

The goal is not to model every possible career variable. The goal is to preserve enough signal to support good choices.

## Major capability areas

### 1. Opportunity ingestion

The system should accept opportunities from practical sources such as links, pasted descriptions, or manually entered notes.

Its job is to normalize raw opportunity input into a durable internal representation.

### 2. Opportunity evaluation

The system should help the user judge both:

- role fit
- company attractiveness or desirability

These evaluations should be explainable and should support comparison rather than pretend to be absolute truth.

### 3. Application support

The system should support application work by connecting opportunities with relevant evidence and providing structured drafting help.

### 4. Interview support

The system should support interview preparation by gathering the relevant context, stories, and materials for a specific role and stage.

### 5. Career evidence capture

The system should preserve useful evidence from ongoing work so that future search activity is less dependent on memory reconstruction.

### 6. Pattern detection and growth guidance

As usage accumulates, the system should surface high-value patterns, especially around recurring strengths, missing skills, and outcomes.

## Architectural direction

### Core data domains

The system should maintain clear boundaries between:

- market-facing opportunity data
- user-owned career evidence
- derived analyses and generated artifacts
- operational workflow records such as applications and outcomes

Keeping those domains distinct helps the system stay understandable and easier to evolve.

### Derived outputs should remain traceable

When the system produces fit analyses, recommendations, or drafted materials, it should remain possible to understand what source information informed them.

Traceability matters for trust, editing, and later refinement.

### AI should be a layer, not the foundation

AI-assisted features are important, but the core product should not be designed as an opaque prompt wrapper.

The durable value of the system comes from:

- structured information
- reusable evidence
- explicit workflows
- comparison across time

AI should strengthen those things, not replace them.

### Persistence should preserve reuse

The system should store information in ways that support later retrieval and recombination.

That is especially important for:

- opportunities
- evidence units
- generated materials
- outcomes
- historical changes over time

## User experience expectations

The system should feel:

- calm rather than cluttered
- analytical without being overbearing
- structured without being rigid
- helpful without pretending certainty it does not have

Where uncertainty exists, the product should acknowledge it clearly.

## Scope discipline

To protect coherence, future phases should favor depth in the core loop over breadth into loosely related features.

Good expansions are ones that strengthen one of these:

- opportunity selection
- evidence reuse
- interview readiness
- outcome learning
- skill-gap prioritization

Weak expansions are ones that turn the system into a generic productivity app or a broad social platform.

## Roadmap framing

Near- and mid-term planning should be evaluated against three questions:

1. Does this make the core loop more useful?
2. Does this improve trust, reuse, or decision quality?
3. Does this keep the product boundary clear?

If a planned feature does not answer at least one of those strongly, it likely belongs later or elsewhere.
