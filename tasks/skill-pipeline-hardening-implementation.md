# Skill Pipeline Hardening — Implementation Plan

> Based on approved discovery: `tasks/skill-pipeline-hardening-discovery.md`

---

## Architecture Decisions

1. **Architect = master controller** — delegates via Opus subagents, validates at every gate, talks to user on FAIL/ambiguity
2. **Create → validate = always separate tasks** — validation in separate subagent with fresh context
3. **Three validation levels** — Design (after discovery, against mindmaps), Plan (after impl plan, against patterns/structure), Code (after each wave, against eval criteria)
4. **Citation-backed validation** — every check must cite the source pattern/mindmap
5. **Two-level todo lists** — master (architect) + skill-level (each subagent)
6. **Position-based todo enforcement** — TaskCreate block goes at the absolute TOP of every SKILL.md, before identity/context/everything. First instruction = highest adherence.
7. **beforeFinish guard** — every SKILL.md ends with "check TaskList, don't finish if tasks remain uncompleted" `[S03E03 §5]`
8. **Delegation brief template** — every subagent spawn includes: task description, context file paths, eval criteria, expected output format, model directive `[S02E04 §2, §7]`
9. **Architect selective context loading** — architect reads app-architecture.md TOC/headings first, then loads only sections relevant to the current feature. Not the whole file. `[S02E01 §1, §5]`
10. **TaskCreate fallback** — every SKILL.md's MANDATORY FIRST ACTION includes: "If TaskCreate is unavailable, write the task list as a markdown checklist in your first message." Single point of failure mitigated.
11. **Single CLAUDE.md with sync markers** — `SYNC:START/END` markers, sync script replaces managed section, user section untouched. No CLAUDE.base.md.
12. **4-tier knowledge architecture** — SKILL.md (compact domain summary) → KNOWLEDGE-INDEX.md (full tables) → REFERENCE.md (checklists) → mindmaps (content). Architect stays lean as knowledge grows.
13. **Git remote sync** — `ai-reference` remote, `predev` script fetches AI layer files. Sync script validates output (non-empty files) `[S04E04 §9]`.

---

## Step 1: Folder renames

**What:** Rename skill directories.

**Files:**

- `mv .claude/skills/creator/ → .claude/skills/architect/`
- `mv .claude/skills/efficient-orchestrator/ → .claude/skills/orchestrator/`

**Verify:** Folders exist at new paths, old paths gone.

---

## Step 2: Create evaluation criteria files

**What:** Create `.claude/evaluations/` with 3 eval criteria files.

**Files to create:**

- `.claude/evaluations/types-eval.md`
- `.claude/evaluations/tests-eval.md`
- `.claude/evaluations/architecture-eval.md`

**Content:** As specified in discovery doc §3 (Evaluation criteria files). Each file is a checklist of criteria that validation subagents use.

**Verify:** Files exist, content matches discovery spec.

---

## Step 3: Create `docs/app-architecture.md` template

**What:** Replace the existing reference example with a starter template for new projects. The existing 1593-line doc serves as the reference for what a mature project's doc should look like — but the template repo ships a skeleton.

**Files:**

- `docs/app-architecture.md` — overwrite with starter template (10 sections with guidance comments)

**Verify:** File has section headings matching discovery spec §1.

---

## Step 4: CLAUDE.md with sync markers

**What:** Restructure `CLAUDE.md` with sync markers so the managed section auto-updates from reference while user's project-specific section stays untouched. Single file — auto-loaded by Claude Code.

**Files:**

- `CLAUDE.md` — restructure with `SYNC:START/END` markers

**Structure:**

```markdown
<!-- SYNC:START — managed by ai-reference, do not edit below this line -->

## Tech Stack

...

## Conventions

...

## Workflow

...

## AI Skills

...

## Commands

...

## Scripts

...

## Reference

...

<!-- SYNC:END — managed by ai-reference, do not edit above this line -->

## Project-Specific Instructions

(user writes here — never touched by sync)
```

**Content decisions:**

- Everything currently in CLAUDE.md that is universal goes inside `SYNC:START/END`
- User gets a `## Project-Specific Instructions` section below the markers
- All references to `creator` → `architect`, `efficient-orchestrator` → `orchestrator` applied during this step
- No `CLAUDE.base.md` — single file approach

**Verify:** CLAUDE.md has sync markers. Content above markers is universal. Content below is user-owned placeholder.

---

## Step 5: Create KNOWLEDGE-INDEX.md

**What:** Create the detailed knowledge base reference table as a separate file. This is tier 2 of the 4-tier knowledge architecture.

**Files to create:**

- `.claude/skills/architect/KNOWLEDGE-INDEX.md`

**Content:** Full mindmap table + article table per domain. Migrated from current architect SKILL.md. Structure:

```markdown
# Knowledge Base Index

## ai/ — AI & Agent Design

### Mind Maps

| Path                                        | When to load                                               |
| ------------------------------------------- | ---------------------------------------------------------- |
| knowladge/ai/mindmaps/S01/s01e01-mindmap.md | Prompt design, structured outputs, JSON Schema             |
| knowladge/ai/mindmaps/S01/s01e02-mindmap.md | Tool schema design, workflow vs agent, context engineering |
| ... (all 25 current entries) ...            |

### Deep Dive Articles

| Path                                       | When to read               |
| ------------------------------------------ | -------------------------- |
| knowladge/ai/original_source/S01/s01e01-\* | Prompt design (full depth) |
| ... (all current entries) ...              |

## ux/ — UX Patterns (future)

(entries added when domain is created)

## testing/ — Testing Strategy (future)

(entries added when domain is created)
```

**Verify:** File exists. Contains all 25 mindmap entries + all article entries currently in SKILL.md. Future domain sections have placeholders.

---

## Step 6: Architect skill rewrite

**What:** Rewrite `.claude/skills/architect/SKILL.md` to master controller role.

**Files:**

- `.claude/skills/architect/SKILL.md` — major rewrite
- `.claude/skills/architect/REFERENCE.md` — update internal references (`creator/` → `architect/`)

**Content changes to SKILL.md:**

- **MANDATORY FIRST ACTION block at top** (after frontmatter, before everything else) — master todo TaskCreate list. Position-based enforcement: first instruction = highest adherence. Includes fallback: "If TaskCreate is unavailable, write the task list as a markdown checklist in your first message."
- **Identity section:** Master controller, not just mentor/builder. Owns pipeline, delegates to Opus subagents, validates at every gate, always talks to user.
- **Builder mode = master controller:** Creates master todo → delegates plan-feature (Opus) → validates plan (Opus validation subagent) → user review → delegates orchestrator (Opus) → delegates architecture-review (Opus) → evaluates → updates app-architecture.md
- **Mentor mode preserved:** No master todo for Q&A, stays conversational
- **Model directive:** All subagents spawned as Opus unless orchestrator decides otherwise for implementation waves
- **`docs/app-architecture.md` selective loading:** Read TOC/headings first, then load only sections relevant to the current feature. Not the whole file. `[S02E01 §1, §5]`
- **4-tier knowledge architecture:**
  - SKILL.md gets compact domain summary (~15 lines): "ai/ = agent design, ux/ = UI patterns, testing/ = test strategy"
  - SKILL.md keeps loading strategy: broad vs selective, agentic search pattern
  - SKILL.md instructs: "Load KNOWLEDGE-INDEX.md as first action for detailed entries"
  - Big mindmap tables + article tables removed from SKILL.md (moved to KNOWLEDGE-INDEX.md in Step 5)
  - MANDATORY FIRST ACTION block includes: "Load KNOWLEDGE-INDEX.md" alongside TaskCreate
- **Three validation levels:** Design (after discovery, mindmaps), Plan (after impl, patterns/structure), Code (after waves, eval criteria)
- **Delegation brief template:** Every subagent spawn includes: task description, context file paths, eval criteria file, expected output format, model directive `[S02E04 §2, §7]`
- **beforeFinish guard:** Closing instruction — check TaskList, don't finish if tasks remain uncompleted `[S03E03 §5]`
- **Validation rules section:** The 6 rules from discovery (separate tasks, separate subagent, load eval file, cite sources, verdict, talk to user on FAIL)

**Verify:** `name: architect` in frontmatter. Master controller flow documented. Phase 0 todo template present.

---

## Step 7: Plan-feature skill update

**What:** Add Phase 0 todo list + plan validation step to `.claude/skills/plan-feature/SKILL.md`.

**Files:**

- `.claude/skills/plan-feature/SKILL.md`

**Content changes:**

- **MANDATORY FIRST ACTION block at top** (after frontmatter, before everything else) — 14-task internal todo list. Position-based enforcement. Includes TaskCreate fallback.
- **Add design validation step** after discovery: return discovery doc to architect for Level 1 validation (architecture decisions against mindmaps + REFERENCE.md)
- **Add plan validation step** after implementation plan: return plan to architect for Level 2 validation (file placement, naming, patterns, architecture-eval.md)
- **Citation requirement** on both validation levels: must cite specific pattern files and mindmap sections
- **beforeFinish guard** at end of skill: check TaskList, don't finish if tasks remain uncompleted
- **Update all references:** `creator` → `architect`, `efficient-orchestrator` → `orchestrator`
- **Knowledge base:** Reference KNOWLEDGE-INDEX.md for loading decisions (replaces hardcoded mindmap paths in skill file)
- **App-architecture.md:** Add to context loading (Task 1)

**Verify:** Phase 0 exists with TaskCreate instructions. Citation requirement documented. References updated.

---

## Step 8: Orchestrator skill update

**What:** Add Phase 0 pipeline-level todo + split create/validate tasks in `.claude/skills/orchestrator/SKILL.md`.

**Files:**

- `.claude/skills/orchestrator/SKILL.md`

**Content changes:**

- **Update `name:` frontmatter** to `orchestrator`
- **MANDATORY FIRST ACTION block at top** (after frontmatter, before everything else) — 12-task pipeline-level todo list. Position-based enforcement. Includes TaskCreate fallback.
- **Split TYPES phase:** CREATE TYPES → VALIDATE TYPES (separate task, separate subagent, loads types-eval.md)
- **Per-wave test cycle:** After each wave: CREATE TESTS → EXECUTE TESTS (with coverage) → VALIDATE TESTS (separate task, separate subagent, loads tests-eval.md)
- **Architecture check:** After all waves, validate against architecture-eval.md + patterns, with citations
- **Model directive:** Orchestrator = Opus. Implementation subagents = orchestrator's choice. Validation subagents = always Opus.
- **Coverage:** `yarn test --coverage` for created files, report uncovered lines
- **On FAIL:** Report to user, user decides
- **Delegation brief template:** Every subagent spawn includes: task description, context file paths, eval criteria, expected output format, model directive
- **beforeFinish guard:** Check TaskList, don't finish if tasks remain uncompleted

**Verify:** `name: orchestrator` in frontmatter. Phase 0 exists. Types split into create/validate. Per-wave test cycle documented. Coverage step present. beforeFinish guard present.

---

## Step 9: Architecture-review skill update

**What:** Add Phase 0 todo list + type/test eval tasks to `.claude/commands/architecture-review.md`.

**Files:**

- `.claude/commands/architecture-review.md`

**Content changes:**

- **MANDATORY FIRST ACTION block at top** (after the existing review instructions) — 9-task internal todo list. Position-based enforcement. Includes TaskCreate fallback.
- **Add knowledge base loading** (Task 3): load relevant mindmap sections where applicable
- **Add type validation** (Task 5): validate against types-eval.md
- **Add test validation** (Task 6): validate against tests-eval.md
- **Citation requirement:** Every finding must cite source, extended to include eval criteria citations
- **Update references:** `creator` → `architect`, `efficient-orchestrator` → `orchestrator` (if any)
- **beforeFinish guard:** Check TaskList, don't finish if tasks remain uncompleted

**Verify:** Phase 0 exists. Tasks 3, 5, 6 are new additions. Citation requirement intact. beforeFinish guard present.

---

## Step 10: Update README.md

**What:** Update all references + document the new pipeline flow.

**Files:**

- `README.md`

**Content changes:**

- All `/creator` → `/architect`
- All `/efficient-orchestrator` → `/orchestrator`
- Update skill table (step 1-4)
- Update workflow diagram
- Update quick reference table
- Add section about self-updating reference repo
- Document CLAUDE.md sync markers approach
- Mention evaluation criteria

**Verify:** No references to `creator` or `efficient-orchestrator` remain. New pipeline flow documented.

---

## Step 11: Update `docs/repo-structure.md`

**What:** Update directory tree + references.

**Files:**

- `docs/repo-structure.md`

**Content changes:**

- Directory tree: `creator/` → `architect/`, `efficient-orchestrator/` → `orchestrator/`
- Add `.claude/evaluations/` to directory tree
- Document CLAUDE.md sync markers in file listing
- Add `.claude/skills/architect/KNOWLEDGE-INDEX.md` to directory tree
- Add `docs/app-architecture.md` to directory tree under `docs/`
- Fix knowledge base paths: `.claude/mindmaps/` → `knowladge/ai/mindmaps/`, `.claude/original_source/` → `knowladge/ai/original_source/` (existing inconsistency — actual files are in `knowladge/`, not `.claude/`)
- Add `scripts/sync-ai-reference.ts` to scripts section
- Update comments/descriptions

**Verify:** Directory tree matches actual filesystem structure. No old names remain. `knowladge/` path is correct.

---

## Step 12: Create sync script + config

**What:** Create the self-updating reference repo mechanism.

**Files to create:**

- `scripts/sync-ai-reference.ts` — sync script
- Update `package.json` — add `predev` and `sync-ai` scripts

**Sync script logic:**

1. Check if `ai-reference` remote exists (`git remote get-url ai-reference`)
2. If not: log "ai-reference remote not configured, skipping sync" and exit 0
3. `git fetch ai-reference main --quiet`
4. For each path in sync list: `git show ai-reference/main:{path}` → write to local path
5. Handle new files (exist in remote, not local) → create
6. Handle deleted files (exist local, not in remote sync paths) → remove
7. Validate synced files: non-empty, valid content (not truncated) `[S04E04 §9 Pattern 2]`
8. Log summary of changes
9. Exit 0 (always — never fail the dev server)

**Sync paths (AI layer):**

```
.claude/skills/
.claude/patterns/
.claude/evaluations/
.claude/commands/
knowladge/
docs/repo-structure.md
```

**CLAUDE.md sync:** Script reads the managed section from `ai-reference/main:CLAUDE.md` (between `SYNC:START` and `SYNC:END` markers) and replaces the local managed section. User's project-specific section below `SYNC:END` is untouched.

**package.json changes:**

```json
"predev": "tsx scripts/sync-ai-reference.ts",
"sync-ai": "tsx scripts/sync-ai-reference.ts"
```

**Verify:** Script runs without error when remote not configured. Script runs and syncs when remote exists.

---

## Step 13: Add coverage tooling

**What:** Add `@vitest/coverage-v8` for test coverage reporting.

**Files:**

- `package.json` — add devDependency
- `vitest.config.ts` — add coverage config (if needed)

**Verify:** `yarn test --coverage` runs and produces output.

---

## Step 14: Final verification

**What:** End-to-end check that everything is consistent.

**Checks:**

- No references to `creator` (as skill name) or `efficient-orchestrator` anywhere in the repo
- All eval files exist in `.claude/evaluations/`
- `CLAUDE.md` has `SYNC:START/END` markers with managed section + user section
- `.claude/skills/architect/KNOWLEDGE-INDEX.md` exists with all 25 mindmap entries + article entries
- Architect SKILL.md has compact domain summary (no full tables)
- `docs/app-architecture.md` is the starter template
- `scripts/sync-ai-reference.ts` exists and runs
- All SKILL.md files have MANDATORY FIRST ACTION block at top
- All SKILL.md files have beforeFinish guard at bottom
- `yarn tsc` passes
- `yarn lint` passes
- `yarn test` passes
- Directory structure matches `docs/repo-structure.md`
