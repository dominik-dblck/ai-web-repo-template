---
name: plan-orchestration
description: Converts an approved implementation plan into a step-by-step orchestration file — the execution contract for the orchestrator. Does NOT implement code.
---

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before reading ANYTHING below, create tasks using TaskCreate:

1. "Load approved implementation plan (with evaluation) from path"
2. "Load patterns — for test requirements per step"
3. "Derive steps from plan — each step = one deliverable, types first"
4. "Define dependencies — which steps block which"
5. "Define tests per step — unit/integration/N/A with reason"
6. "Cross-reference — verify every item from Types, Features, Tests sections in plan has step"
7. "Write orchestration file → save to roadmaps/{week}/plans/{feature}/{feature}-orchestration.md"
8. "HANDOFF → user runs /orchestrator-plan-review"

Chain tasks sequentially with `addBlockedBy` — each blocked by previous.

If TaskCreate unavailable, write task list as markdown checklist in first message instead.

If tasks not created, STOP. Go back and create them.

Mark each task `in_progress` when started. Mark `completed` when done.

---

## Purpose

Convert approved+evaluated implementation plan into step-by-step execution contract. `/orchestrator` reads and executes this file. Each step must be atomic, verifiable, independently buildable.

Does NOT implement code — produces single orchestration document.

**Pipeline position:**

```
... → /architect-evaluate-plan → [YOU ARE HERE] → /orchestrator-plan-review → /orchestrator → ...
```

---

## What to Load

1. **Approved implementation plan** (with `## Evaluation` section) — in conversation context or read from path
2. `.claude/patterns/testing.md` — test requirements per step

Plan already contains Types, Features, Tests sections. This skill converts those into ordered execution steps.

---

## Step 1 — Derive Steps from Plan

Read plan's Types, Features, Tests sections. Convert into ordered steps:

- **Types first** — all type definitions earliest. Types must be STRONG: no `any`, no bare `string`/`number`, discriminated unions over optionals, `readonly` where immutable. Copy type definitions exactly from plan's Types section.
- **Shared before specific** — utilities, constants, shared hooks before feature-specific code
- **One deliverable per step** — never bundle unrelated files
- **Tests paired with implementation** — each step includes code file and test file

---

## Step 2 — Define Dependencies

For each step, declare dependencies:

- `Depends on: —` for independent steps
- `Depends on: Step 1, Step 3` for steps needing prior work

Orchestrator uses this to group parallel waves — steps with no unresolved dependencies run together.

---

## Step 3 — Define Tests Per Step

For each step:

- **Test file path** — where test lives
- **What to test** — specific scenarios from plan's Tests section
- **Verify command** — `yarn tsc` for types, `yarn test {file}` for tests
- **N/A with reason** — only for genuinely untestable steps (config-only, types-only with no logic, documentation)

---

## Step 4 — Cross-Reference with Plan

Before writing, verify complete coverage:

- Every type from plan's **Types** section has step
- Every file from plan's **Features** section has step
- Every test from plan's **Tests** section paired with implementation step
- File paths match plan exactly — no renames, no path changes
- Nothing added that wasn't in plan — no scope creep

---

## Step 5 — Write Orchestration File

Write `roadmaps/{ISO-week}/plans/{week}-{feature-name}/{week}-{feature-name}-orchestration.md`:

```markdown
# {Feature Name} — Orchestration

## Steps

- [ ] **Step 1: Define types** — {deliverable}
  - Files: `app/types/{feature}.ts`
  - Depends on: —
  - Verify: `yarn tsc`
  - Tests: N/A — type definitions only

- [ ] **Step 2: {title}** — {deliverable}
  - Files: `path/to/file.ts`
  - Depends on: Step 1
  - Verify: `yarn tsc`, `yarn test path/to/file.test.ts`
  - Tests: `path/to/file.test.ts` — {what to test}

- [ ] **Step 3: {title}** — {deliverable}
  - Files: `path/to/file.ts`
  - Depends on: Step 1, Step 2
  - Verify: `yarn tsc`, `yarn test path/to/file.test.ts`
  - Tests: `path/to/file.test.ts` — {what to test}

...

## Status

- Current step: 1
- Blocked: no
```

Each step atomic and verifiable. Orchestrator reads this file and executes steps in dependency waves.

---

## Step 6 — Handoff

Tell user:

> Orchestration file written to `roadmaps/{week}/plans/{feature}/{feature}-orchestration.md`.
> Next step: run `/orchestrator-plan-review` to verify coverage, dependency order, and buildability.

---

## Before Finishing

Check TaskList. If any task not `completed`, do not finish — address remaining tasks or explain to user why skipped.
