---
name: plan-feature
description: Feature discovery and planning — explores the codebase, writes discovery doc, implementation plan, and orchestration file in tasks/. Does NOT execute code — produces approved documents for the orchestrator.
---

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before reading ANYTHING below, create these tasks using TaskCreate:

1. "Load repo-structure.md + app-architecture.md"
2. "Identify relevant patterns + knowledge base sections"
3. "Search codebase for existing implementations"
4. "Ask clarifying questions (single batch)"
5. "Write discovery doc"
6. "Return discovery to architect for DESIGN VALIDATION (Level 1 — mindmaps)"
7. "User review of validated discovery"
8. "Load patterns + explore references"
9. "Write implementation plan"
10. "Return plan to architect for PLAN VALIDATION (Level 2 — patterns/structure)"
11. "User review of validated plan"
12. "Write orchestration file"
13. "User review of orchestration file"
14. "Hand off complete"

If TaskCreate is unavailable, write the task list as a markdown checklist in your first message instead.

If you have not created tasks, STOP. Go back and create them.

Mark each task `in_progress` when you begin it. Mark it `completed` when done.

---

Discover and plan a new feature. This skill does NOT execute code — it produces approved documents that the orchestrator uses for implementation.

**User-provided context:** $ARGUMENTS

Expected arguments: `<feature-name> [hint-about-scope]`

Example: `user-settings "profile editing, password change, notification preferences"`

This is a multi-phase command. Each phase produces a persistent markdown document in `tasks/` and requires user review before proceeding.

**Full workflow:**

```
/architect (context + architecture) → /plan-feature (discovery + plan) → /orchestrator (execution) → /architecture-review
```

---

## Pattern Loading Strategy

**Always load `docs/repo-structure.md` and `docs/app-architecture.md` first** — they apply to every plan.

**Then load patterns selectively** based on what the feature touches:

| Feature touches      | Load these patterns                   |
| -------------------- | ------------------------------------- |
| UI Components        | `ui-architecture.md`, `mui7.md`       |
| App Router / Routes  | `nextjs-app-router.md`                |
| Data Fetching        | `tanstack-query.md`, `api-clients.md` |
| State Management     | `state-management.md`                 |
| MUI / Styling        | `mui7.md`                             |
| Auth / Security      | `security.md`, `cookies-auth.md`      |
| Error Handling       | `error-handling.md`                   |
| Testing              | `testing.md`                          |
| Performance concerns | `performance.md`                      |

Pattern files live in `.claude/patterns/`. Do NOT load all of them — only the ones relevant to this feature.

**Every file proposed in the plan must follow the conventions from the loaded patterns.** If the plan creates a service, it must match `api-clients.md` naming. If it creates a provider, it must match `state-management.md` context pattern. Cite the pattern when proposing a file structure.

---

## Phase 1: Discovery

Goal: Understand the feature scope, constraints, and existing infrastructure before any planning.

### Step 1 — Gather context

Search the codebase for anything related to the feature:

- Existing implementations that overlap or can be reused
- Discovery/implementation docs in `tasks/` that reference the feature
- Types, hooks, services, components in the affected area
- Related tests and test patterns
- API endpoints and backend contracts

### Step 2 — Present summary and ask questions

Present a concise summary of what exists, then ask all clarifying questions in a single batch:

- What's the exact scope (in/out)?
- Which existing code can be reused vs needs extension?
- Are there external dependencies (BE changes, APIs)?
- What are the edge cases and error scenarios?
- Are there reference implementations to follow?

### Step 3 — Explore gaps (parallel)

Launch parallel explorations for all identified gaps:

- Infrastructure that needs building
- Patterns to follow from similar features
- API/service layer needs
- UI component patterns to reuse

### Step 4 — Write discovery document

Write `tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-discovery.md` covering:

- Feature overview and motivation
- What exists today (reusable code, patterns)
- What needs to be built
- Technical approach with rationale
- Data flow / architecture diagram (if non-trivial)
- Edge cases and error handling
- Dependencies and blockers
- Open questions

### Step 5 — Design validation (Level 1)

Return the discovery doc to the architect for **Level 1 design validation** — architecture decisions checked against knowledge base mindmaps (loaded selectively from KNOWLEDGE-INDEX.md at `.claude/skills/architect/KNOWLEDGE-INDEX.md`) + REFERENCE.md. Validation must cite sources. Format: `[S02E01 §3 — Context Management]`, `[REFERENCE.md — Design Principles]`. No citation = source was not checked.

### Step 6 — User review

Wait for user to review and correct the validated discovery doc before proceeding.

**Output:** `tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-discovery.md`

---

## Phase 2: Implementation Plan

Goal: Create a detailed, ordered implementation plan with clear steps.

### Step 1 — Load patterns and explore references

1. **Identify which areas the feature touches** (UI, routes, data fetching, state, etc.)
2. **Load the relevant pattern files** using the mapping table above
3. **Read 1–2 existing examples** in the codebase for each pattern you'll need:
   - Types with Zod schemas (`app/types/`)
   - Services (`app/services/`)
   - Hooks (`app/hooks/`)
   - Provider + context patterns (`app/providers/`)
   - UI components (atoms, molecules, organisms)
   - API routes (`app/api/`)

### Step 2 — Write implementation plan

Write `tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-implementation.md` with:

- Architecture decisions and rationale
- Technical approach for each area
- File-level details (what to create, what to modify)
- Dependencies on external changes (BE, APIs)
- Edge cases and error handling strategy

This is the **reference document** — it describes what to build and why.

### Step 3 — Plan validation (Level 2)

Return the implementation plan to the architect for **Level 2 plan validation** — file placement, naming, patterns, and architecture-eval.md. The validator checks against `docs/repo-structure.md`, relevant `.claude/patterns/` files, and `.claude/evaluations/architecture-eval.md`. Validation must cite sources. Format: `[patterns/mui7.md — Token Safety]`, `[repo-structure.md — Services]`. No citation = source was not checked.

### Step 4 — User review of implementation plan

Wait for user to review and approve the validated implementation plan before creating the orchestration file. The user may adjust scope, reorder steps, or change technical decisions.

**Output:** `tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-implementation.md` (approved)

### Step 5 — Write orchestration file

After the implementation plan is approved, write `tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-orchestration.md` — the **execution contract** for the orchestrator. This is a sequential checklist derived from the approved implementation plan:

```markdown
# {Feature Name} — Orchestration

## Steps

- [ ] **Step 1: {title}** — {brief description of deliverable}
  - Files: `path/to/file.ts`, `path/to/other.ts`
  - Verify: `yarn tsc`

- [ ] **Step 2: {title}** — {brief description}
  - Files: ...
  - Depends on: Step 1
  - Verify: `yarn tsc`, `yarn test`

...

## Status

- Current step: 1
- Blocked: no
```

Each step must be atomic and verifiable. Include `Depends on` for steps that can't run in parallel — the orchestrator uses this to group waves.

### Step 6 — User review of orchestration file

Wait for user to review the orchestration file before handing off to execution.

**Output:** `tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-orchestration.md` (approved)

---

## Phase 3: Hand off to execution

Tell the user:

> The discovery, implementation plan, and orchestration file are approved. Ready to execute.
> Run `/orchestrator` — it will read `tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-orchestration.md` and execute the steps.

**This command is done.** Execution is the orchestrator's responsibility.

---

## Housekeeping

The orchestration file persists between conversations. If you need to resume:

```
I'm continuing work on [feature]. The orchestration file is at
tasks/{DD-MM-YYYY}/{DD-MM-YYYY}-{feature-name}-orchestration.md — please read it and continue.
```

---

## Before Finishing

Check TaskList. If any task is not `completed`, do not finish — address remaining tasks or explain to user why they were skipped.
