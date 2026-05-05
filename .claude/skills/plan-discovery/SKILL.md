---
name: plan-discovery
description: Explores codebase, writes discovery doc for new feature. Does NOT plan implementation — produces discovery document only.
---

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before reading ANYTHING below, create tasks using TaskCreate:

1. "Load context — app-architecture.md (relevant sections), repo-structure.md"
2. "Read architect's advice from conversation context"
3. "Gather context — read existing code, related skills/tools"
4. "Explore gaps — parallel investigation of unknowns"
5. "Write discovery doc → save to roadmaps/{week}/plans/{feature}/tasks/{feature}-discovery.md"
6. "HANDOFF → user runs /architect-evaluate-discovery"

Chain tasks sequentially with `addBlockedBy` so each blocked by previous.

If TaskCreate unavailable, write task list as markdown checklist in first message instead.

If you have not created tasks, STOP. Go back and create them.

Mark each task `in_progress` when you begin it. Mark `completed` when done.

---

## Purpose

Explore codebase, write discovery doc for new feature. Skill does NOT plan implementation or write orchestration files — produces single discovery document capturing scope, existing infrastructure, architecture decisions, risks.

**User-provided context:** $ARGUMENTS

Expected arguments: `<feature-name> [hint-about-scope]`

**Pipeline position:**

```
/architect → /brainstorm → [YOU ARE HERE] → /architect-evaluate-discovery → /plan-implementation → ...
```

---

## What to Load

1. `docs/app-architecture.md` — load TOC first, then only sections relevant to feature
2. `docs/repo-structure.md` — naming conventions, directory layout, services pattern

Do NOT load `.claude/patterns/` — that for `/plan-implementation`.

---

## Step 1 — Gather Context

Search codebase for anything related to feature:

- Existing implementations that overlap or reusable
- Previous discovery/implementation docs in `roadmaps/` for related features
- Types, hooks, services, components in affected area
- Related tests and test patterns
- API endpoints and backend contracts
- **Brainstorm decision** (if exists) — read from conversation context (brainstorm runs in same conversation, no doc created). Honor decided approach — discovery explores within chosen direction, not reopening decision. If codebase exploration reveals decision may be wrong, flag explicitly rather than silently diverging.

---

## Step 2 — Present Summary and Ask Questions

Present concise summary of what exists, then ask all clarifying questions in single batch:

- Exact scope (in/out)?
- Which existing code reusable vs needs extension?
- External dependencies (BE changes, APIs)?
- Edge cases and error scenarios?
- Reference implementations to follow?

---

## Step 3 — Explore Gaps

Investigate all identified gaps:

- Infrastructure that needs building
- Patterns to follow from similar features
- API/service layer needs
- UI component patterns to reuse

---

## Step 4 — Write Discovery Document

Write `roadmaps/{ISO-week}/plans/{week}-{feature-name}/tasks/{week}-{feature-name}-discovery.md` covering:

- Feature overview and motivation
- **Scope** — explicit in/out boundaries: what feature covers and what it does not
- What exists today (reusable code, patterns)
- What needs building
- Technical approach with rationale
- Data flow / architecture diagram
- Edge cases and error handling
- **Risk areas** — technical risks distinct from edge cases: performance, security, migration, downstream pipeline impact
- **Context gaps** — what does feature NOT know about system? Known unknowns per S02E01 §10. Different from open questions: open questions = decisions pending, context gaps = system knowledge we lack
- Dependencies and blockers
- Open questions
- **Existing types audit** — identify types in affected area, flag weak types (`any`, bare `string`/`number`, optional fields always present) that should be tightened as part of feature

---

## Step 5 — Handoff

Tell user:

> Discovery doc written to `roadmaps/{week}/plans/{feature}/tasks/{feature}-discovery.md`.
> Next step: run `/architect-evaluate-discovery` to evaluate this document against knowledge base.

---

## Before Finishing

Check TaskList. If any task not `completed`, do not finish — address remaining tasks or explain to user why skipped.
