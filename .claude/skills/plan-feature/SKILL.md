---
name: plan-feature
description: Feature discovery and planning — explores the codebase, writes discovery doc, implementation plan, and orchestration file in tasks/. Does NOT execute code — produces approved documents for the efficient-orchestrator.
---

Discover and plan a new feature. This skill does NOT execute code — it produces approved documents that the efficient-orchestrator uses for implementation.

**User-provided context:** $ARGUMENTS

Expected arguments: `<feature-name> [hint-about-scope]`

Example: `user-settings "profile editing, password change, notification preferences"`

This is a multi-phase command. Each phase produces a persistent markdown document in `tasks/` and requires user review before proceeding.

**Full workflow:**

```
/creator (context + architecture) → /plan-feature (discovery + plan) → /efficient-orchestrator (execution) → /architecture-review
```

---

## Pattern Loading Strategy

**Always load `docs/repo-structure.md` first** — it applies to every plan.

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

Write `tasks/{feature-name}-discovery.md` covering:

- Feature overview and motivation
- What exists today (reusable code, patterns)
- What needs to be built
- Technical approach with rationale
- Data flow / architecture diagram (if non-trivial)
- Edge cases and error handling
- Dependencies and blockers
- Open questions

### Step 5 — User review

Wait for user to review and correct the discovery doc before proceeding.

**Output:** `tasks/{feature-name}-discovery.md`

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

Write `tasks/{feature-name}-implementation.md` with:

- Architecture decisions and rationale
- Technical approach for each area
- File-level details (what to create, what to modify)
- Dependencies on external changes (BE, APIs)
- Edge cases and error handling strategy

This is the **reference document** — it describes what to build and why.

### Step 3 — User review of implementation plan

Wait for user to review and approve the implementation plan before creating the orchestration file. The user may adjust scope, reorder steps, or change technical decisions.

**Output:** `tasks/{feature-name}-implementation.md` (approved)

### Step 4 — Write orchestration file

After the implementation plan is approved, write `tasks/{feature-name}-orchestration.md` — the **execution contract** for the efficient-orchestrator. This is a sequential checklist derived from the approved implementation plan:

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

### Step 5 — User review of orchestration file

Wait for user to review the orchestration file before handing off to execution.

**Output:** `tasks/{feature-name}-orchestration.md` (approved)

---

## Phase 3: Hand off to execution

Tell the user:

> The discovery, implementation plan, and orchestration file are approved. Ready to execute.
> Run `/efficient-orchestrator` — it will read `tasks/{feature-name}-orchestration.md` and execute the steps.

**This command is done.** Execution is the efficient-orchestrator's responsibility.

---

## Housekeeping

The orchestration file persists between conversations. If you need to resume:

```
I'm continuing work on [feature]. The orchestration file is at
tasks/{feature-name}-orchestration.md — please read it and continue.
```
