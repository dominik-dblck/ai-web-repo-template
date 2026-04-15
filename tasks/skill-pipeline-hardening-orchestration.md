# Skill Pipeline Hardening — Orchestration

> Discovery: `tasks/skill-pipeline-hardening-discovery.md`
> Implementation plan: `tasks/skill-pipeline-hardening-implementation.md`

---

## Steps

### Wave 1 — Foundations (parallel, no dependencies)

- [ ] **Step 1: Folder renames** — rename skill directories
  - `mv .claude/skills/creator/ .claude/skills/architect/`
  - `mv .claude/skills/efficient-orchestrator/ .claude/skills/orchestrator/`
  - Verify: old paths gone, new paths exist
  - Files: `.claude/skills/architect/`, `.claude/skills/orchestrator/`

- [ ] **Step 2: Create evaluation criteria files** — 3 eval files in `.claude/evaluations/`
  - Create `.claude/evaluations/types-eval.md` (content from discovery §3)
  - Create `.claude/evaluations/tests-eval.md` (content from discovery §3)
  - Create `.claude/evaluations/architecture-eval.md` (content from discovery §3)
  - Verify: files exist, content matches discovery spec
  - Files: `.claude/evaluations/types-eval.md`, `.claude/evaluations/tests-eval.md`, `.claude/evaluations/architecture-eval.md`

- [ ] **Step 3: Create app-architecture.md template** — starter skeleton for new projects
  - Overwrite `docs/app-architecture.md` with 10-section template + guidance comments
  - Sections: System Overview, Core Feature, Data Pipeline, Component Architecture, State Management, API Layer, DB Schema, Type System, Infrastructure, Current State & TODOs
  - Verify: file has all 10 section headings
  - Files: `docs/app-architecture.md`

- [ ] **Step 4: CLAUDE.md with sync markers** — restructure with SYNC:START/END
  - Add `<!-- SYNC:START — managed by ai-reference, do not edit below this line -->` before universal content
  - Add `<!-- SYNC:END — managed by ai-reference, do not edit above this line -->` after universal content
  - Add `## Project-Specific Instructions` section below SYNC:END
  - Replace all `creator` → `architect`, `efficient-orchestrator` → `orchestrator` within the file
  - Verify: markers present, universal content inside, user section below, no old references
  - Files: `CLAUDE.md`

- [ ] **Step 5: Architecture-review update** — add todo list + eval tasks
  - MANDATORY FIRST ACTION block at top (9-task todo + TaskCreate fallback)
  - Add knowledge base loading task
  - Add type validation task (types-eval.md)
  - Add test validation task (tests-eval.md)
  - Add beforeFinish guard at bottom
  - Replace old references if any
  - Verify: MANDATORY FIRST ACTION present, 9 tasks listed, beforeFinish present
  - Files: `.claude/commands/architecture-review.md`

- [ ] **Step 6: Create sync script** — self-updating reference repo mechanism
  - Create `scripts/sync-ai-reference.ts`
  - Logic: check remote → fetch → copy AI layer files → CLAUDE.md marker sync → validate output (non-empty) → log
  - Add `predev` and `sync-ai` scripts to `package.json`
  - Graceful failure when offline or remote not configured
  - Verify: script runs without error when remote absent, exits 0 always
  - Files: `scripts/sync-ai-reference.ts`, `package.json`

- [ ] **Step 7: Add coverage tooling** — vitest coverage dependency
  - Add `@vitest/coverage-v8` to devDependencies
  - Add coverage config to `vitest.config.ts` if needed
  - Verify: `yarn test --coverage` runs and produces output
  - Files: `package.json`, `vitest.config.ts`

### Gate 1 — Validate Wave 1 (separate validation subagent, Opus)

- [ ] **Step 8: VALIDATE WAVE 1** — verify foundations are correct
  - Check: eval criteria files exist and content matches discovery §3
  - Check: CLAUDE.md has SYNC:START/END markers, no old references (creator/efficient-orchestrator)
  - Check: app-architecture.md has all 10 section headings
  - Check: architecture-review.md has MANDATORY FIRST ACTION + 9 tasks + beforeFinish
  - Check: sync script exists and exits 0 when no remote configured
  - Check: `yarn test --coverage` produces output
  - Check: folder renames successful (old paths gone, new paths exist)
  - **Must cite each check with source:** `[discovery §3]`, `[implementation Step 4]`, etc.
  - **Verdict: PASS or FAIL with specific issues**
  - On FAIL: fix issues, re-validate before proceeding

### Wave 2 — Skill Updates (depends on Wave 1 + Gate 1)

- [ ] **Step 9: Create KNOWLEDGE-INDEX.md** — tier 2 of 4-tier knowledge architecture
  - Create `.claude/skills/architect/KNOWLEDGE-INDEX.md`
  - Migrate all 25 mindmap entries from current SKILL.md into domain-aware table
  - Migrate all article entries from current SKILL.md into domain-aware table
  - Add future domain placeholders (ux/, testing/)
  - Verify: all 25 mindmap paths present, all article paths present
  - Files: `.claude/skills/architect/KNOWLEDGE-INDEX.md`

- [ ] **Step 10: Architect REFERENCE.md update** — fix internal references
  - Replace all `creator/` → `architect/` references
  - Replace all `efficient-orchestrator` → `orchestrator` references
  - Verify: no old references remain
  - Files: `.claude/skills/architect/REFERENCE.md`

- [ ] **Step 11: Plan-feature SKILL.md update** — add todo list + validation gates
  - MANDATORY FIRST ACTION block at top (14-task todo list + TaskCreate fallback)
  - Add design validation step after discovery (return to architect for Level 1)
  - Add plan validation step after implementation plan (return to architect for Level 2)
  - Add citation requirement on both validation levels
  - Add beforeFinish guard at bottom
  - Replace all `creator` → `architect`, `efficient-orchestrator` → `orchestrator`
  - Reference KNOWLEDGE-INDEX.md for loading decisions
  - Add app-architecture.md to context loading
  - Verify: MANDATORY FIRST ACTION present, 14 tasks listed, beforeFinish present, no old references
  - Files: `.claude/skills/plan-feature/SKILL.md`

- [ ] **Step 12: Orchestrator SKILL.md update** — add todo list + create/validate split
  - Update `name:` frontmatter to `orchestrator`
  - MANDATORY FIRST ACTION block at top (12-task pipeline todo + TaskCreate fallback)
  - Split TYPES: CREATE TYPES → VALIDATE TYPES (separate task, types-eval.md)
  - Per-wave test cycle: CREATE TESTS → EXECUTE TESTS (coverage) → VALIDATE TESTS (tests-eval.md)
  - Architecture check after all waves (architecture-eval.md + patterns, with citations)
  - Model directive: orchestrator = Opus, implementation = choice, validation = always Opus
  - Add delegation brief template
  - Add beforeFinish guard at bottom
  - Verify: `name: orchestrator`, MANDATORY FIRST ACTION present, types split documented, per-wave tests documented, beforeFinish present
  - Files: `.claude/skills/orchestrator/SKILL.md`

### Gate 2 — Validate Skill Updates (separate validation subagent, Opus)

- [ ] **Step 13: VALIDATE WAVE 2** — verify every skill file follows the protocol
  - For EACH skill file (plan-feature, orchestrator, architecture-review):
    - Check: MANDATORY FIRST ACTION block is the FIRST thing after frontmatter
    - Check: TaskCreate fallback instruction present
    - Check: beforeFinish guard at bottom
    - Check: no references to `creator` or `efficient-orchestrator`
    - Check: validation gates documented (where applicable)
  - For KNOWLEDGE-INDEX.md:
    - Check: all 25 mindmap entries present with paths + "when to load"
    - Check: all article entries present
    - Check: future domain placeholders exist
  - For REFERENCE.md:
    - Check: no old references remain
  - **Must cite each check:** `[discovery → Todo enforcement]`, `[discovery → beforeFinish guard]`, etc.
  - **Verdict: PASS or FAIL with specific issues**
  - On FAIL: fix issues, re-validate

### Wave 3 — Architect Rewrite + Docs (depends on Wave 2 + Gate 2)

- [ ] **Step 14: Architect SKILL.md rewrite** — master controller role
  - MANDATORY FIRST ACTION block at top (TaskCreate + fallback + load KNOWLEDGE-INDEX.md)
  - Replace identity: master controller, not just mentor/builder
  - Add builder mode = master controller flow (delegate → validate → user review → repeat)
  - Preserve mentor mode (conversational, no master todo)
  - Add compact domain summary (~15 lines, replaces full mindmap tables)
  - Keep loading strategy (broad vs selective, agentic search)
  - Add selective app-architecture.md loading (TOC first, then relevant sections)
  - Add three validation levels documentation
  - Add delegation brief template (5 elements)
  - Add beforeFinish guard at bottom
  - Add validation rules section (6 rules)
  - Verify: `name: architect` in frontmatter, no full mindmap tables remain, MANDATORY FIRST ACTION present, beforeFinish present
  - Files: `.claude/skills/architect/SKILL.md`

- [ ] **Step 15: Update docs/repo-structure.md** — directory tree + paths
  - Rename: `creator/` → `architect/`, `efficient-orchestrator/` → `orchestrator/`
  - Add `.claude/evaluations/` to directory tree
  - Add `.claude/skills/architect/KNOWLEDGE-INDEX.md` to directory tree
  - Add `docs/app-architecture.md` under `docs/`
  - Fix: `knowladge/` paths (currently wrong in tree, shows `.claude/mindmaps/`)
  - Add `scripts/sync-ai-reference.ts` to scripts section
  - Document CLAUDE.md sync markers
  - Verify: directory tree matches actual filesystem, no old names
  - Files: `docs/repo-structure.md`

### Gate 3 — Design Validation (separate Opus subagent against mindmaps)

- [ ] **Step 16: VALIDATE ARCHITECT DESIGN** — Level 1 validation against knowledge base
  - Load relevant mindmaps: S02E01, S02E04, S02E05, S03E03, S05E05
  - Check architect SKILL.md against Master Controller pattern `[S05E05 §3]`
  - Check: 4 components present (tool registry, routing intelligence, memory triad, graduated autonomy)
  - Check: manager agent 7 responsibilities covered `[S02E04 §9]`
  - Check: delegation brief template aligns with `[S02E04 §2, §7]`
  - Check: beforeFinish guard aligns with `[S03E03 §5]`
  - Check: 4-tier knowledge architecture aligns with signal vs noise `[S02E01 §2]`
  - Check: selective app-architecture.md loading aligns with context management `[S02E01 §1, §5]`
  - Check: repo-structure.md matches actual filesystem
  - **Every check must cite the specific mindmap section**
  - **Verdict: PASS or FAIL with specific issues**
  - On FAIL: architect talks to user, user decides

### Wave 4 — Documentation (depends on Wave 3 + Gate 3)

- [ ] **Step 17: Update README.md** — all references + new pipeline flow
  - Replace all `/creator` → `/architect`
  - Replace all `/efficient-orchestrator` → `/orchestrator`
  - Update skill table, workflow diagram, quick reference table
  - Add self-updating reference repo section
  - Document CLAUDE.md sync markers
  - Mention evaluation criteria
  - Verify: no old references remain, new pipeline documented
  - Files: `README.md`

### Gate 4 — Documentation Consistency (separate validation subagent)

- [ ] **Step 18: VALIDATE DOCS** — cross-check docs vs filesystem
  - Check: README.md pipeline flow matches actual skill names
  - Check: README.md skill table matches actual files in `.claude/skills/`
  - Check: repo-structure.md directory tree matches actual filesystem (`ls -R .claude/`)
  - Check: CLAUDE.md skill references match actual skill names
  - Check: no references to `creator` or `efficient-orchestrator` in ANY file in the repo
  - **Verdict: PASS or FAIL**
  - On FAIL: fix, re-validate

### Wave 5 — Final (depends on ALL)

- [ ] **Step 19: Final verification** — end-to-end consistency check
  - All eval files exist in `.claude/evaluations/`
  - `CLAUDE.md` has `SYNC:START/END` markers with managed + user sections
  - `KNOWLEDGE-INDEX.md` has all 25 mindmap + article entries
  - Architect SKILL.md has compact domain summary (no full tables)
  - `docs/app-architecture.md` is starter template
  - `scripts/sync-ai-reference.ts` exists and runs
  - All SKILL.md files have MANDATORY FIRST ACTION at top
  - All SKILL.md files have beforeFinish guard at bottom
  - `yarn tsc` passes
  - `yarn lint` passes
  - `yarn test` passes
  - Directory structure matches `docs/repo-structure.md`
  - Verify: all checks pass

---

## Dependency Graph

```
Wave 1 (Steps 1-7) — parallel, no dependencies
  ↓
Gate 1 (Step 8) — validate foundations
  ↓
Wave 2 (Steps 9-12) — skill updates, depends on Gate 1
  ↓
Gate 2 (Step 13) — validate skill protocols
  ↓
Wave 3 (Steps 14-15) — architect rewrite + docs structure
  ↓
Gate 3 (Step 16) — design validation against mindmaps
  ↓
Wave 4 (Step 17) — documentation
  ↓
Gate 4 (Step 18) — documentation consistency
  ↓
Wave 5 (Step 19) — final verification
```

## Waves Summary

| Wave  | Steps | What                                                                          | Gate after                             |
| ----- | ----- | ----------------------------------------------------------------------------- | -------------------------------------- |
| **1** | 1-7   | Foundations: renames, eval files, templates, CLAUDE.md, sync script, coverage | Gate 1: verify foundations             |
| **2** | 9-12  | Skill updates: KNOWLEDGE-INDEX, REFERENCE, plan-feature, orchestrator         | Gate 2: verify skill protocols         |
| **3** | 14-15 | Architect rewrite + repo-structure                                            | Gate 3: design validation vs mindmaps  |
| **4** | 17    | README.md                                                                     | Gate 4: docs consistency vs filesystem |
| **5** | 19    | Final end-to-end verification                                                 | —                                      |

## Status

- Current step: 0 (not started)
- Blocked: no
- Waves: 5 (+ 4 validation gates)
- Total steps: 19 (15 implementation + 4 validation)
