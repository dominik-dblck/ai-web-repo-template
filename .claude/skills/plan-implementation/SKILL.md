---
name: plan-implementation
description: Writes an implementation plan from an approved discovery doc. Does NOT write the orchestration file — produces a single implementation plan document only.
---

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before reading ANYTHING below, create tasks using TaskCreate:

1. "Load approved discovery doc (with evaluation) from path"
2. "Load patterns — .claude/patterns/ relevant to this feature"
3. "Load repo-structure.md — naming, file placement conventions"
4. "Explore references — read 1-2 existing examples per pattern in codebase"
5. "Define types — list every type/interface/schema needed, where they live, dependency order"
6. "Plan features — file-level design for every new/modified file with purpose and pattern citation"
7. "Plan tests — test strategy per component: what to test, which pattern, edge cases"
8. "Cross-reference — verify every item from discovery 'What Needs to Be Built' has file in plan"
9. "Write implementation plan → save to roadmaps/{week}/plans/{feature}/tasks/{feature}-implementation.md"
10. "HANDOFF → user runs /architect-evaluate-plan"

Chain tasks sequentially with `addBlockedBy` so each blocked by previous.

If TaskCreate unavailable, write task list as markdown checklist in first message instead.

If you have not created tasks, STOP. Go back and create them.

Mark each task `in_progress` when you begin it. Mark `completed` when done.

---

## Purpose

Write detailed implementation plan from approved and evaluated discovery doc. Skill does NOT write orchestration file — produces single implementation plan capturing architecture decisions, file-level design, type definitions, dependency order.

**Pipeline position:**

```
... → /architect-evaluate-discovery → [YOU ARE HERE] → /architect-evaluate-plan → /plan-orchestration → ...
```

---

## What to Load

1. **Approved discovery doc** (with `## Evaluation` section) — already in conversation context, or read from path
2. `docs/repo-structure.md` — naming conventions, directory layout, services pattern
3. `.claude/patterns/` — load selectively based on what feature touches:

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

Do NOT load all patterns — only relevant ones.

---

## Step 1 — Load Patterns and Explore References

1. Identify which areas feature touches (UI, routes, data fetching, state, etc.)
2. Load relevant pattern files using mapping table above
3. Read 1-2 existing codebase examples for each pattern:
   - Types (`app/types/`)
   - Services (`app/services/`)
   - Hooks (`app/hooks/`)
   - Provider + context patterns (`app/providers/`)
   - UI components (atoms, molecules, organisms)
   - API routes (`app/api/`)

---

## Step 2 — Define Types

List every type, interface, schema feature needs. Dedicated task because types must exist before anything depending on them.

**Types must be STRONG.** Non-negotiable:

- **No `any`** — ever
- **No `as` casting** — unless justified with comment explaining why
- **No bare `string` or `number`** when narrower type exists — use string literals, enums, branded types, union types. `string | number` last resort, not default.
- **Use discriminated unions** over optional fields — `{ type: 'error'; message: string } | { type: 'success'; data: T }` not `{ type?: string; message?: string; data?: T }`
- **Use `readonly`** for data that shouldn't mutate
- **Use `Record<SpecificKey, Value>`** not `Record<string, Value>` when keys known
- **Every field must have tightest possible type** — if value can only be `'pending' | 'active' | 'completed'`, say so — don't use `string`

For each type:

- **Name** and **file path** (e.g., `SessionFilter` in `app/types/session.ts`)
- **Fields** with exact types — write full type definition, not description
- **Which files import this type** — proves it's needed
- **Dependencies** — does this type extend or reference another?

Example output:

```typescript
// app/types/pipeline.ts
type SkillType = 'creator' | 'gate' | 'executor' | 'advisor';
type Verdict = 'pass' | 'pass_with_notes' | 'fail';

interface EvaluationFinding {
  readonly criterion: string;
  readonly verdict: 'pass' | 'note' | 'fail';
  readonly assessment: string;
  readonly citation: string;
}
```

---

## Step 3 — Plan Features

File-level design for every new/modified file. Per file:

- **Path** — exact location following `repo-structure.md`
- **Purpose** — one sentence
- **Pattern** — which `.claude/patterns/` it follows, with citation: `[patterns/api-clients.md → Service Pattern]`. If no pattern file is applicable (e.g., scripts/validation layer), cite the codebase reference file instead: `[follows enrichHandlerPattern.ts pattern]`
- **Imports** — concrete: "imports `SessionFilter` from `app/types/session.ts`", not "will use session types"
- **Exports** — what file provides to others
- **Integration points** — how connects to existing code
- **Server/client** — for Next.js app code, declare server or client. Verify no non-serializable data crosses boundary (functions, promises, Date objects). For scripts/, N/A. Follow `[patterns/nextjs-app-router.md → Server/Client Boundary]`

**File size and SRP constraint:** each file should be max ~200 lines, one function/check per file, single responsibility principle. If a planned file would exceed this, split into focused sub-files. Each file should do one thing well — atomic functions over monolithic modules.

Verify no circular import chains — if File A imports from File B and vice versa, restructure.

---

## Step 4 — Plan Tests

Test strategy per component. Per testable file:

- **Test file path** — e.g., `app/services/__tests__/fetchSessionService.test.ts`
- **What to test** — happy path, edge cases, error states
- **Test pattern** — which approach: unit, integration, component render
- **Mocking strategy** — what to mock, what to test real
- **N/A with reason** — if not testable (config-only, types-only, etc.)

---

## Step 5 — Write Implementation Plan

Write `roadmaps/{ISO-week}/plans/{week}-{feature-name}/tasks/{week}-{feature-name}-implementation.md` with mandatory sections:

```markdown
# {Feature} — Implementation Plan

## Architecture Decisions

{decisions with rationale, grounded in discovery, cite KB}

## Types

{from Step 2 — every type/interface/schema with fields, paths, dependencies}

## Features

{from Step 3 — every file with path, purpose, pattern citation, imports, exports}

## Tests

{from Step 4 — test file per component, what to test, pattern, mocking}

## Dependency Order

{what must exist before what — types first, then shared, then specific}

## Edge Cases and Error Handling

{strategy per component}

## External Dependencies

{BE changes, APIs, third-party services}
```

This is **reference document** — describes what to build and why. Every proposed file must follow conventions from loaded patterns.

---

## Step 6 — Handoff

Tell user:

> Implementation plan written to `roadmaps/{week}/plans/{feature}/tasks/{feature}-implementation.md`.
> Next step: run `/architect-evaluate-plan` to evaluate this plan against KB + patterns + web search.

---

## Before Finishing

Check TaskList. If any task not `completed`, do not finish — address remaining tasks or explain to user why skipped.
