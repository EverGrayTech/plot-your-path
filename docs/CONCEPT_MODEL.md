# Plot Your Path — Concept Model

This document describes the core conceptual entities in Plot Your Path and how they relate to each other.

Its purpose is to provide a shared mental model for contributors so that features and architecture evolve consistently.

This document intentionally stays at a **conceptual level**, separate from implementation details or database schema.

---

# System Perspective

Plot Your Path is a **career intelligence system**.

It operates by connecting three domains:

1. **Market Intelligence**
2. **Personal Career Data**
3. **Analytical Insights**

---

# Core Entities

## Company

A company represents an organization that offers job opportunities.

Companies are evaluated using a set of desirability factors that reflect long-term career value.

Examples of factors may include:

- culture
- innovation
- reputation
- compensation potential
- social impact

A company may have multiple roles associated with it.

---

## Role

A role represents a specific job opening at a company.

Roles are typically ingested from job postings and converted into structured information.

A role contains information such as:

- company
- role title
- description
- required skills
- preferred skills

Roles are evaluated against the user’s current skills and experiences to determine fit.

---

## Skill

Skills represent the capabilities required to perform roles.

They act as the **bridge between job market demand and personal capability**.

Examples include:

- programming languages
- technical platforms
- domain expertise
- leadership skills
- communication skills

Skills may appear in two contexts:

- Market Demand → Role_Skills
- Personal Supply → Learnings

---

## Learning

A learning represents a skill the user has developed or is actively developing.

Each learning may include metadata such as:

- proficiency level
- personal interest
- market demand
- dependencies on other skills

Learnings represent the **user’s evolving skill portfolio**.

---

## Experience

Experiences represent things the user has done throughout their career.

These may include:

- projects
- achievements
- leadership experiences
- technical challenges solved

Experiences provide the raw material for:

- resume bullet points
- interview answers
- STAR stories

Capturing experiences over time prevents loss of detail and improves the quality of applications.

---

## STAR Story

STAR stories are structured narratives derived from experiences.

STAR stands for:

- Situation
- Task
- Action
- Result

These stories provide reusable interview and application material.

They are generated from experiences and enriched over time.

---

## Application

An application represents a job the user has applied to.

Applications connect:

- Role
- Resume
- Application Materials
- Interview Progress

Applications progress through stages such as:

- Saved
- Applied
- Recruiter Screen
- Hiring Manager Interview
- Team Interviews
- Offer
- Rejected

Tracking applications helps the user stay organized during job searches.

---

# Derived Concepts

The system generates insights by analyzing relationships between the core entities.

---

## Role Fit

Role Fit measures how well a role aligns with the user’s skills.

This is calculated by comparing:

- Role Skills vs User Learnings

Outputs may include:

- skill match percentage
- identified skill gaps
- overall recommendation

---

## Company Desirability

Company desirability estimates how attractive a company is from a long-term career perspective.

This is derived from multiple weighted factors such as:

- culture
- innovation
- growth potential
- reputation
- compensation potential

---

## Skill Gaps

Skill gaps represent capabilities that frequently appear in desirable roles but are currently missing from the user’s profile.

These gaps help users identify which skills could unlock new career opportunities.

---

# Conceptual Relationships

The system can be summarized with the following relationships:

Company
↓
Roles
↓
Role Skills
↓
Skill Comparison
↓
Learnings


Experiences feed the personal knowledge base:

Experience
↓
STAR Stories
↓
Applications

Together these relationships enable the system to produce actionable career intelligence.

---

# Design Intent

The concept model is designed to support three core goals:

### Job Search Intelligence

Evaluate opportunities and focus effort on the most promising roles.

### Career Narrative

Capture and structure career experiences so users can tell their story effectively.

### Strategic Growth

Identify the skills and experiences that will unlock future opportunities.

---

# Future Evolution

Over time the system may expand the concept model to include:

- company recommendations
- skill clusters and capability graphs
- portfolio projects
- career path simulations

These additions should remain consistent with the core model defined here.
