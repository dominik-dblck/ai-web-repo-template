# Skill Pipeline Hardening — Discovery

## Feature Overview

Fundamental restructuring of the skill pipeline:

1. **Rename skills** — `creator` → `architect`, `efficient-orchestrator` → `orchestrator`
2. **Architect becomes master controller** — owns the pipeline, keeps master todo list, delegates to Opus subagents, validates at every gate, always talks to user when needed
3. **Mandatory in-chat TaskCreate todo lists** in every skill — runtime checklists that survive context growth
4. **Create and validate are ALWAYS separate tasks** — never bundled. Validation = separate task, separate subagent, fresh eyes
5. **Evaluation criteria files** — shared validation standards for types, tests, and architecture
6. **`docs/app-architecture.md`** — comprehensive living document (not a skeleton), architect owns and updates it
7. **Knowledge base scales via 4-tier architecture** — SKILL.md (compact domain summary) → KNOWLEDGE-INDEX.md (full reference tables) → REFERENCE.md (checklists) → mindmaps (content). Architect SKILL.md stays small as knowledge grows.
8. **Single CLAUDE.md with sync markers** — no CLAUDE.base.md split. One auto-loaded file with `SYNC:START/END` markers. Sync script replaces managed section, user section untouched.
9. **Self-updating reference repo** — this template repo serves as the upstream reference. Projects copied from it auto-fetch latest skills, patterns, knowledge base, and evaluations on `yarn dev`. No stale copies.

### Why this architecture

**Drift problem:** SKILL.md instructions degrade as context grows (S02E01 §2, S02E02 instruction dropout). In-chat tasks survive. The orchestrator already uses TaskCreate and is the most reliable skill.

**Validation problem:** Subagents produce `any` types, weak casting, tests with missing assertions. The agent who created the work shouldn't validate it — same context, same blind spots. Separate validation task = fresh eyes.

**Context problem:** One long conversation = context overload. Architect stays lean by delegating. Each subagent gets fresh context with specific instructions. Master Controller pattern (S05E05 §3).

### Model strategy

- **Architect** — always Opus (master controller, best judgment)
- **Plan-feature** — always Opus (architectural decisions need top reasoning)
- **Validation subagents** — always Opus (catching mistakes needs top reasoning)
- **Orchestrator** — Opus for pipeline control, spawns implementation subagents according to need
- **Architecture-review** — always Opus

---

## What Exists Today

### Files to rename/update

| File                                             | Current reference                    | New reference            |
| ------------------------------------------------ | ------------------------------------ | ------------------------ |
| `.claude/skills/creator/SKILL.md`                | `name: creator`                      | `name: architect`        |
| `.claude/skills/creator/REFERENCE.md`            | referenced as `creator/REFERENCE.md` | `architect/REFERENCE.md` |
| `.claude/skills/efficient-orchestrator/SKILL.md` | `name: efficient-orchestrator`       | `name: orchestrator`     |
| `.claude/skills/plan-feature/SKILL.md`           | references both old names            | update references        |
| `.claude/commands/architecture-review.md`        | no direct skill refs                 | verify                   |
| `CLAUDE.md`                                      | ~10 references to both names         | update all               |
| `README.md`                                      | ~12 references to both names         | update all               |
| `docs/repo-structure.md`                         | 2 references in directory tree       | update both              |

### Folder renames

| Current path                             | New path                       |
| ---------------------------------------- | ------------------------------ |
| `.claude/skills/creator/`                | `.claude/skills/architect/`    |
| `.claude/skills/efficient-orchestrator/` | `.claude/skills/orchestrator/` |

### Current state

| Skill                   | Uses TaskCreate? | Drift?                  | Current role      |
| ----------------------- | ---------------- | ----------------------- | ----------------- |
| **Orchestrator**        | YES (TASKS GATE) | Least drift             | Executes plans    |
| **Plan Feature**        | NO               | Skips questions, rushes | Discovers + plans |
| **Architecture Review** | NO               | Forgets patterns        | Reviews PRs       |
| **Creator**             | NO               | Less relevant           | Mentor + builder  |

### Existing `docs/app-architecture.md`

Already exists in the repo — 1593 lines, 19 sections. This is the reference example from a real project (Investigation Pipeline V2). Sections:

1. System Overview (Mermaid diagram)
2. Session Discovery — Dashboard
3. Session Preparation (deterministic pipeline)
4. Deterministic Preprocessing — Details
5. Context Builder (6 layers, 8 traversal tools)
6. Session Replay — Trace Rendering (component tree, state mgmt)
7. Input Assembly + Agent Spawn
8. Agent Spawning
9. Agent Stages (3 stages with full I/O specs)
10. Pipeline Integrity
11. Type Resolution
12. Reference Repositories
13. DB Schema
14. V2 Constants
15. Event Tracking & Heartbeat Pattern
16. Infrastructure
17. Testing
18. Data Transformation Summary
19. TODO & Plans

**Key characteristics of this doc:**

- Comprehensive — covers every subsystem, not just a summary
- Shows data flow with code paths and type signatures
- Mermaid diagrams for system overview
- API endpoints with request/response shapes
- Component architecture trees
- State management strategy
- DB schema
- TODO tracking with done/planned status
- Updated with "Last updated" date

This is the standard. Every project using this template should build toward this level of detail as the app grows.

---

## New Architecture: Architect as Master Controller

### The flow

```
User invokes /architect with feature request
│
├── Architect loads app-architecture.md (project context)
├── Architect creates MASTER TODO LIST (TaskCreate)
│
├── Task 1: Delegate to plan-feature — discovery phase (Opus subagent)
│   ├── plan-feature creates its own internal todo list
│   ├── discovery doc
│   └── returns discovery to architect
│
├── Task 2: VALIDATE DESIGN — Level 1 (Opus validation subagent — fresh context)
│   └── checks architecture decisions against knowledge base mindmaps + REFERENCE.md
│   └── catches: missing patterns, delegation gaps, lifecycle gaps, KB alignment
│
├── Task 3: User review of validated discovery
│
├── Task 4: Delegate to plan-feature — planning phase (Opus subagent)
│   ├── implementation plan
│   └── returns plan to architect
│
├── Task 5: VALIDATE PLAN — Level 2 (Opus validation subagent — fresh context)
│   └── checks against patterns + repo-structure + architecture-eval.md
│   └── catches: file placement, naming, conventions, structural issues
│
├── Task 6: User review of validated plan
│
├── Task 7: Plan-feature writes orchestration file → user review
│
├── Task 8: Delegate to orchestrator (Opus subagent)
│   ├── orchestrator creates its own internal todo list
│   ├── Parse orchestration file
│   ├── Tasks gate (per-step tasks, present, get ack)
│   ├── Create types
│   ├── Validate types (separate task, separate subagent, types-eval.md) ← LEVEL 3
│   ├── Wave 1: implement
│   ├── Wave 1: create tests
│   ├── Wave 1: execute tests (run + coverage report)
│   ├── Wave 1: validate tests (separate task, separate subagent, tests-eval.md) ← LEVEL 3
│   ├── ... repeat per wave ...
│   ├── Architecture check (architecture-eval.md + patterns) ← LEVEL 3
│   └── returns to architect
│
├── Task 9: Delegate to architecture-review (Opus subagent)
│   ├── architecture-review creates its own internal todo list
│   └── returns findings to architect
│
├── Task 10: Architect evaluates final output — talks to user if issues found
│
└── Task 11: Update app-architecture.md with what was built
```

### Two levels of todo lists

| Level           | Owner               | Scope           | Purpose                                      |
| --------------- | ------------------- | --------------- | -------------------------------------------- |
| **Master todo** | Architect           | Entire pipeline | Tracks macro flow, gates, validation results |
| **Skill todo**  | Each subagent skill | Internal steps  | Tracks skill-specific protocol steps         |

### Todo list enforcement — Position-based (Option A)

The Phase 0 todo list instruction goes at the **absolute top** of every SKILL.md — before identity, before context loading, before everything. Not buried in a section. The first thing the agent reads after frontmatter is "create these tasks NOW."

```markdown
---
name: skill-name
---

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before reading ANYTHING below, create these tasks using TaskCreate:

1. "..."
2. "..."
3. "..."

If TaskCreate is unavailable, write the task list as a markdown checklist in your first message instead.

If you have not created tasks, STOP. Go back and create them.

---

# Skill Name — Definition

[rest of the skill...]
```

**Why position-based works:** LLMs process instructions top-to-bottom. The first instruction has the highest adherence. By the time the agent reads the identity section, tasks already exist. This was validated empirically — during the planning of this very feature, the todo list was forgotten because it was a buried "Phase 0" concept, not the first thing executed.

### Three validation levels

Each level checks different things at different points. Missing a level means missing a category of bugs.

| Level                 | When                      | What it checks                                                                        | Sources                                                      |
| --------------------- | ------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Design validation** | After discovery doc       | Architecture decisions, agent roles, communication patterns, knowledge base alignment | Mindmaps, REFERENCE.md                                       |
| **Plan validation**   | After implementation plan | File placement, naming, structure, pattern compliance                                 | repo-structure.md, `.claude/patterns/`, architecture-eval.md |
| **Code validation**   | After each wave           | Types, tests, architecture conformance                                                | types-eval.md, tests-eval.md, architecture-eval.md           |

**Lesson learned:** During this very planning session, design validation was missing. The plan validation (level 2) caught structural issues (Step 10 incomplete) but missed architectural gaps (delegation brief template, beforeFinish guard). Those gaps were only caught when the Creator evaluated the design against mindmaps — level 1.

### Delegation brief template `[S02E04 §2, §7]` `[S02E05 §4]`

When the architect delegates to a subagent, each hop compresses information. The subagent doesn't see the parent conversation. Every delegation must include:

```
1. Task description (what to do)
2. Context files to load (paths)
3. Eval criteria file (if validation task)
4. Expected output format (structured)
5. Model directive (Opus/Sonnet)
```

### beforeFinish guard `[S03E03 §5]`

Every SKILL.md must end with a closing instruction:

> Before reporting completion, check TaskList. If any task is not `completed`, do not finish — address remaining tasks or explain to user why they were skipped.

This is the lifecycle hook equivalent — blocks exit if required steps are incomplete.

### Validation rules

1. **Create and validate are ALWAYS separate tasks** — never in the same bullet, never in the same step
2. **Validation runs in a separate subagent** — fresh context, no bias from creation
3. **Every validation task loads the relevant eval criteria file** — reads the actual file, not from memory
4. **Every validation MUST cite sources** — format: `[patterns/mui7.md → Token Safety]`, `[S02E01 §3 → Context Management]`, `[repo-structure.md → Services]`. No citation = source was not checked. This proves the agent actually loaded and read the patterns/mindmaps, not just claimed to.
5. **Validation produces a verdict** — PASS (continue) or FAIL (list issues, each with citation)
6. **On FAIL: architect talks to user** — architect always communicates with user when decisions are needed, never auto-retries silently

---

## What Needs to Be Built

### 1. `docs/app-architecture.md` — template for new projects

The existing 1593-line doc is the reference example. For the template repo, we create a **starter version** that new projects fill in as they grow. Same section structure, but with placeholder content and guidance comments.

**Sections (matching the reference):**

```markdown
# {Project Name} — Architecture

> Last updated: {date}

## System Overview

<!-- Mermaid diagram of your system. Start simple, add detail as the app grows. -->

## 1. Core Feature / Main Flow

<!-- What the app does. Primary user journey. API endpoints. -->

## 2. Data Pipeline

<!-- How data enters, transforms, and is stored. -->

## 3. Component Architecture

<!-- Component tree. Which organisms exist, what they do. -->

## 4. State Management

<!-- React Query keys, providers, local state strategy. -->

## 5. API Layer

<!-- API routes, external service integrations, request flow. -->

## 6. DB Schema

<!-- Tables, key columns, relationships. -->

## 7. Type System

<!-- Key Zod schemas, branded types, shared interfaces. -->

## 8. Infrastructure

<!-- Environment, deployment, external services. -->

## 9. Testing Strategy

<!-- What's tested, how, coverage goals. -->

## 10. Current State & TODOs

<!-- What's done, what's planned, what's blocked. -->
```

**Rules:**

- Architect updates this after every feature cycle (Task 8 in master todo)
- Should reach the depth of the reference example as the project matures
- The architect loads this as primary context — it's how the architect knows the app

### 2. Folder + file renames (mechanical)

- `mv .claude/skills/creator/ .claude/skills/architect/`
- `mv .claude/skills/efficient-orchestrator/ .claude/skills/orchestrator/`
- Update `name:` frontmatter in both SKILL.md files
- Find-and-replace all references across 7 files

### 3. Evaluation criteria files

```
.claude/evaluations/
├── types-eval.md
├── tests-eval.md
└── architecture-eval.md
```

#### `types-eval.md`

- No `any` type anywhere
- No type casting (`as`, `<Type>`) unless explicitly justified with a comment
- No `@ts-ignore` or `@ts-expect-error`
- All function parameters and return types explicitly typed
- Zod schemas defined for all external data (API responses, form inputs)
- TS types inferred from Zod (`z.infer<>`) — no duplicate manual types
- No optional properties (`?`) where the value is always present
- Union types over boolean flags where applicable
- Enums as `const` objects or Zod enums, not TS `enum`
- `yarn tsc` — zero errors

#### `tests-eval.md`

- Every test file runs successfully (`yarn test {file}`)
- Run coverage for created test files — report uncovered lines
- Happy path tested for every public function/component
- Edge cases: empty inputs, null/undefined, boundary values, error states
- No internal mocking (don't mock the module under test)
- Assertions are specific (check exact values, not just "doesn't throw")
- Async operations properly awaited
- No `test.skip` or `test.todo` without a comment
- Component tests: test user-visible behavior, not implementation details
- Follows `.claude/patterns/testing.md`
- Agent goes through each test and verifies everything from the implementation is covered
- If coverage gaps found: report to user, iterate if needed (human decides)

#### `architecture-eval.md`

- File placement follows `docs/repo-structure.md`
- Naming follows organism prefix convention (where applicable)
- Services: single async function per file (`{verb}{Noun}Service.ts`)
- API routes: two-file pattern (`route.ts` + `{action}Route.ts`)
- Constants split: frontend vs backend
- Types defined before implementation
- No circular dependencies
- Server/client boundary respected
- Follows relevant `.claude/patterns/` for touched layers
- Where applicable: validates against knowledge base (loaded selectively from `knowladge/`)

### 4. Architect skill rewrite

**Master controller identity:**

- Owns the pipeline, delegates to Opus subagents, validates at every gate
- Loads `docs/app-architecture.md` **selectively** — reads TOC/headings first, then only sections relevant to current feature. Not the whole file. Prevents context window exhaustion in mature projects. `[S02E01 §1, §5]`
- Keeps context low — delegates work, doesn't do implementation
- Creates master todo list (TaskCreate) for the entire flow
- **Always talks to user when needed** — on validation FAIL, on ambiguity, on architectural decisions
- Updates `docs/app-architecture.md` after feature completion

**Mentor mode preserved:**

- Q&A stays conversational, no master todo needed
- Loads knowledge base selectively using the domain-aware reference table in `CLAUDE.base.md`

**Builder mode = master controller mode:**

- Creates master todo → delegates → validates → tracks → talks to user

### 5. Plan-feature skill update

Internal todo list:

```
1.  "Load repo-structure.md + app-architecture.md"
2.  "Identify relevant patterns + knowledge base sections"
3.  "Search codebase for existing implementations"
4.  "Ask clarifying questions (single batch)"
5.  "Write discovery doc"
6.  "Return discovery to architect for DESIGN VALIDATION (Level 1 — mindmaps)"
7.  "User review of validated discovery"
8.  "Load patterns + explore references"
9.  "Write implementation plan"
10. "Return plan to architect for PLAN VALIDATION (Level 2 — patterns/structure)"
11. "User review of validated plan"
12. "Write orchestration file"
13. "User review of orchestration file"
14. "Hand off complete"
```

**Task 9 — plan validation happens at the plan level.** Before any code is written, the plan gets checked against:

- `docs/repo-structure.md` — file placement, naming
- `.claude/patterns/` — relevant patterns for touched layers
- `knowladge/` — relevant mindmaps where applicable
- `.claude/evaluations/architecture-eval.md` — architectural criteria

**Citation requirement:** The validation output MUST include citations as proof that sources were actually loaded and checked. Format: `[patterns/mui7.md → Token Safety]`, `[S02E01 §3 → Context Management]`, `[repo-structure.md → Services]`. No citation = not checked. This applies to plan validation, architecture checks, and all eval criteria validations across the entire pipeline.

This catches structural mistakes before they propagate to execution.

### 6. Orchestrator skill update

Internal todo list — every create has a separate validate:

```
1.  "PARSE — read orchestration file, extract steps"
2.  "TASKS GATE — create per-step tasks, present table, get ack"
3.  "CREATE TYPES — define all new types/interfaces/Zod schemas"
4.  "VALIDATE TYPES — separate subagent checks against types-eval.md"
5.  "WAVE 1 — implement"
6.  "WAVE 1: CREATE TESTS"
7.  "WAVE 1: EXECUTE TESTS — run tests + coverage report"
8.  "WAVE 1: VALIDATE TESTS — separate subagent checks against tests-eval.md"
9.  (repeat 5-8 per wave)
10. "ARCHITECTURE CHECK — validate all changes against architecture-eval.md + patterns"
11. "DELIVER — final report"
12. "CLEANUP — remove debug, verify, commit"
```

**Key points:**

- Task 3 and 4: types are created, THEN validated as a separate task (no `any`, no casting, strong typing)
- Task 6, 7, 8: tests are created, THEN executed, THEN validated — three separate tasks
- Tests happen after EACH wave, not batched at the end
- Task 10: architecture check after all waves complete
- Validation subagents are always Opus, implementation subagents per orchestrator's judgment
- Coverage report: agent runs `yarn test --coverage` for created files, reports uncovered lines
- On coverage gaps or validation FAIL: report to user, iterate if human decides to

### 7. Architecture-review skill update

Internal todo list:

```
1. "Classify layers touched by PR"
2. "Load relevant pattern files (ONLY touched layers)"
3. "Load relevant knowledge base sections (where applicable)"
4. "Review code against loaded patterns"
5. "Validate types against types-eval.md"
6. "Validate tests against tests-eval.md"
7. "Check cross-cutting smells"
8. "Write findings with citations"
9. "Present architecture summary + findings"
```

### 8. Knowledge base — 4-tier architecture

As knowledge grows (ai → ai + ux + testing + ...), the architect SKILL.md would bloat with reference tables (~100 lines per domain). Solution: split into 4 tiers.

**Current flow (2 tiers — doesn't scale):**

```
SKILL.md (always loaded — has full mindmap tables ~150 lines)
  → REFERENCE.md (on demand — checklists)
    → mindmaps (on demand — content)
```

**New flow (4 tiers — scales):**

```
SKILL.md (always loaded — compact domain summary ~15 lines, stable)
  → KNOWLEDGE-INDEX.md (loaded as first action — full reference tables, grows with knowledge)
    → REFERENCE.md (on demand — design checklists)
      → mindmaps (on demand — actual content)
```

**What lives where:**

| Content                                                 | File                | Loaded                 | Grows?                   |
| ------------------------------------------------------- | ------------------- | ---------------------- | ------------------------ |
| Domain summary: "ai/ = agent design, ux/ = UI patterns" | Architect SKILL.md  | Always (system prompt) | No — one line per domain |
| Loading strategy: broad vs selective, agentic search    | Architect SKILL.md  | Always                 | No — stable              |
| Full mindmap table per domain (paths + "when to load")  | KNOWLEDGE-INDEX.md  | First action           | Yes — per entry          |
| Full article table per domain                           | KNOWLEDGE-INDEX.md  | First action           | Yes — per entry          |
| Design principles cheat sheet + review checklist        | REFERENCE.md        | On demand (reviews)    | Slowly                   |
| Actual mindmap/article content                          | knowladge/{domain}/ | On demand per task     | Yes                      |

**KNOWLEDGE-INDEX.md structure:**

```markdown
# Knowledge Base Index

## ai/ — AI & Agent Design

### Mind Maps

| Path                                        | When to load                                               |
| ------------------------------------------- | ---------------------------------------------------------- |
| knowladge/ai/mindmaps/S01/s01e01-mindmap.md | Prompt design, structured outputs, JSON Schema             |
| knowladge/ai/mindmaps/S01/s01e02-mindmap.md | Tool schema design, workflow vs agent, context engineering |
| ...                                         | ...                                                        |

### Deep Dive Articles

| Path                                       | When to read               |
| ------------------------------------------ | -------------------------- |
| knowladge/ai/original_source/S01/s01e01-\* | Prompt design (full depth) |
| ...                                        | ...                        |

## ux/ — UX Patterns (future)

(entries added when domain is created)

## testing/ — Testing Strategy (future)

(entries added when domain is created)
```

**Why this works:**

- Architect SKILL.md stays small and stable (~15 lines of domain summary, doesn't grow per-entry)
- KNOWLEDGE-INDEX.md is loaded once per session as first action (part of MANDATORY FIRST ACTION block)
- Adding new domain = 1 line in SKILL.md + entries in KNOWLEDGE-INDEX.md
- KNOWLEDGE-INDEX.md syncs from reference — every project gets updated tables
- Explicit entries, not directory scanning — agents cite from the table

**File location:** `.claude/skills/architect/KNOWLEDGE-INDEX.md` (lives with the architect skill, synced from reference)

### 9. Self-updating reference repo mechanism

**Problem:** User copies this template, builds their app. Over time, we improve skills, add patterns, expand knowledge base, update evaluations. The user's copy is frozen at the point they copied it — skills drift out of date, new patterns never arrive.

**Solution:** This template repo is the **upstream reference**. Projects copied from it auto-sync the AI layer on `yarn dev`.

#### What syncs (AI layer — managed by reference):

```
.claude/skills/          — all skill SKILL.md + REFERENCE.md files
.claude/patterns/        — all coding pattern files
.claude/evaluations/     — all evaluation criteria files
.claude/commands/        — all slash commands
knowladge/               — all knowledge base content (mindmaps + original_source)
docs/repo-structure.md   — project structure conventions
```

#### What does NOT sync (project layer — owned by user):

```
docs/app-architecture.md — user's project-specific architecture doc
app/                     — user's application code
tasks/                   — user's feature docs
plans/                   — user's implementation plans
__tests__/               — user's tests
CLAUDE.md                — user's project-level instructions (may have customizations)
package.json             — user's dependencies
```

#### How it works:

**Git remote reference — simplest approach.** The reference repo is added as a git remote. Sync = `git pull` from reference + copy AI layer files.

1. **Setup (one-time, on project creation):**

   ```bash
   git remote add ai-reference https://github.com/{org}/ai-repo-template.git
   ```

   The reference repo is public across the organisation.

2. **Sync script:** `scripts/sync-ai-reference.ts`:
   - `git fetch ai-reference main`
   - Copies AI layer files from `ai-reference/main` into working tree (using `git show ai-reference/main:{path}`)
   - Overwrites local AI layer files with latest from reference
   - Logs what was updated
   - Does NOT merge branches — just reads files from the remote ref

3. **`yarn dev` integration:**

   ```json
   "predev": "tsx scripts/sync-ai-reference.ts"
   ```

   Runs before Next.js dev server starts. Fails gracefully if offline or remote not configured.

4. **Manual sync:** `yarn sync-ai` for on-demand sync.

5. **CLAUDE.md with sync markers** (single file, no split):

   ```markdown
   # CLAUDE.md

   <!-- SYNC:START — managed by ai-reference, do not edit -->

   ## Tech Stack

   ...

   ## Skills & Workflow

   ...

   ## Knowledge Base Reference (compact domain summary)

   ...

   <!-- SYNC:END -->

   ## Project-Specific Instructions

   (user writes here — never touched by sync)
   ```

   Sync script replaces everything between markers. User's section below is untouched. Single file = auto-loaded by Claude Code.

#### Edge cases:

- **Offline / remote not configured:** Sync fails gracefully, logs warning, dev server starts normally with existing files
- **First run after copy:** No sync needed — files are already from the template. Remote added during setup.
- **Conflicts:** AI layer files are always overwritten — reference wins. Customizations go in project-specific files, not in the AI layer.
- **New files in reference:** Automatically pulled in (new skill, new pattern, new knowledge domain)
- **Deleted files in reference:** Removed from local project on sync (deprecated skill/pattern)
- **Version pinning:** Optional — script can pin to a specific tag instead of `main`

### 10. Coverage tooling

May need `@vitest/coverage-v8` added to devDependencies for the orchestrator's test coverage step.

---

## Revised Pipeline Flow

```
/architect (loads app-architecture.md, creates master todo)
    │
    ├── Delegate: /plan-feature (Opus subagent)
    │   ├── discovery doc → return to architect
    │   │
    │   ├── VALIDATE DESIGN (Opus validation subagent) ← LEVEL 1
    │   │   └── checks architecture decisions against knowledge base mindmaps
    │   │   └── catches design gaps (delegation patterns, lifecycle hooks, etc.)
    │   │
    │   ├── User review of validated discovery
    │   │
    │   └── implementation plan → return to architect
    │
    ├── VALIDATE PLAN (Opus validation subagent) ← LEVEL 2
    │   └── checks against patterns + repo-structure + architecture-eval.md
    │   └── catches structural mistakes (file placement, naming, conventions)
    │
    ├── User review of validated plan
    │
    ├── Plan-feature: orchestration file → user review
    │
    ├── Delegate: /orchestrator (Opus subagent)
    │   ├── PARSE + TASKS GATE
    │   │
    │   ├── CREATE TYPES
    │   ├── VALIDATE TYPES (separate task, separate subagent)
    │   │
    │   ├── PER WAVE:
    │   │   ├── IMPLEMENT wave
    │   │   ├── CREATE TESTS (separate task)
    │   │   ├── EXECUTE TESTS + coverage (separate task)
    │   │   └── VALIDATE TESTS (separate task, separate subagent)
    │   │
    │   ├── ARCHITECTURE CHECK (architecture-eval.md + patterns)
    │   └── DELIVER + CLEANUP
    │
    ├── Delegate: /architecture-review (Opus subagent)
    │
    ├── Architect evaluates — talks to user if issues
    │
    └── Update app-architecture.md
```

---

## Edge Cases

- **Mentor mode** — architect stays conversational for Q&A, no master todo
- **Small features** — architect can skip delegation for trivial changes ("just code it" path preserved)
- **Single-wave features** — per-wave test cycle still applies, just once
- **Resuming mid-conversation** — master todo survives in task system
- **Knowledge base not yet expanded** — skills scan `knowladge/` for available domains. Only `ai/` now. No breakage when new domains added.
- **Validation FAIL** — architect talks to user, user decides whether to iterate or accept
- **Coverage gaps** — reported with uncovered lines, user decides whether to iterate
- **Offline sync** — fails gracefully, dev server starts with existing files, no crash
- **User modified AI layer file** — overwritten on next sync. By design — customizations go in project-specific files
- **CLAUDE.md sync markers** — sync script replaces managed section only, user section untouched

---

## Dependencies and Blockers

- **`@vitest/coverage-v8`** — may need to be added for coverage reporting
- Everything else is internal to `.claude/` and docs

---

## Resolved Questions

1. ~~"Verify tasks exist" guardrail~~ — Not needed. The "If no tasks exist, you have not started" instruction in Phase 0 is sufficient.
2. ~~`app-architecture.md` template~~ — Comprehensive doc (reference: 1593 lines, 19 sections). Template starts as a skeleton with section headings + guidance comments, grows with the project.
3. ~~Coverage threshold~~ — No threshold. Report coverage + uncovered lines + explain. Human reviews, decides whether to iterate.
4. ~~Validation FAIL flow~~ — Architect always talks to user. No silent auto-retry.
