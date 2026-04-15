<!-- SYNC:START — managed by ai-reference, do not edit below this line -->

# AI Repo Template

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript 6 (strict mode)
- **UI Framework:** Material UI 7 (MUI)
- **Charts:** Recharts
- **Validation:** Zod
- **Data fetching:** TanStack React Query
- **Testing:** Vitest
- **Linting:** ESLint (flat config) + Prettier
- **Git hooks:** Husky (pre-commit: lint + tsc + format, pre-push: test)

## Conventions

All coding conventions, naming patterns, and project structure rules are in `docs/repo-structure.md`. **Read it before adding features.**

Key conventions:

- Atomic design (atoms/molecules/organisms/templates)
- Organism prefix naming for internal files
- Services as async functions (`{verb}{Noun}Service.ts`)
- API routes: `route.ts` (re-export) + `{action}Route.ts` (handler)
- Constants split: `frontendApiConstants.ts` vs `backendApiConstants.ts`
- Types first: Zod schemas + inferred TS types

## Workflow — How to Work With This Repo

### Quick fix or small change

Just do it. No skills or commands needed.

### New feature

Always start with **Architect** to build context and align on architecture:

```
Architect (context + architecture) → /plan-feature (discovery + plan) → /orchestrator (execution) → /architecture-review
```

1. **Architect** — load `.claude/skills/architect/SKILL.md`, describe what you want to build. Architect advises on architecture, identifies patterns, aligns on approach.
2. **`/plan-feature`** — run with the agreed scope. Produces discovery doc + implementation plan + orchestration checklist in `tasks/`. Each phase requires your approval. Does NOT write code.
3. **`/orchestrator`** — takes the approved orchestration file and executes: types first, parallel waves via subagents, structured testing, cleanup + commit.
4. **`/architecture-review`** — run on your branch before merging. Reports violations with citations to pattern files.

### Summary

| Situation             | Flow                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| New feature           | Architect → `/plan-feature` → `/orchestrator` → `/architecture-review`  |
| Small fix / bug       | Just code it                                                            |
| PR review only        | `/architecture-review`                                                  |
| Architecture question | Architect (Mentor mode)                                                 |
| Resuming execution    | Load `tasks/{date}/{date}-{name}-orchestration.md`, run `/orchestrator` |

## AI Skills

### Architect

Expert mentor and build orchestrator for generative AI applications. Two modes:

- **Mentor** — teaches and advises grounded in the knowledge base. Use when you need architecture guidance.
- **Builder** — plans and scaffolds new agents, skills, tools. Use when you need to design AI-specific components.

Files: `.claude/skills/architect/SKILL.md`, `.claude/skills/architect/REFERENCE.md`

### Plan Feature

Feature discovery and planning. Explores the codebase, writes discovery doc, implementation plan, and orchestration file in `tasks/`. Does NOT execute code — produces approved documents for the orchestrator.

File: `.claude/skills/plan-feature/SKILL.md`

### Orchestrator

Implementation executor. Takes an approved orchestration file, defines types first, executes in dependency waves via subagents, runs structured testing, delivers + cleans up.

Pipeline: PARSE → TASKS GATE → TYPES → WAVES → TEST → DELIVER → CLEANUP

File: `.claude/skills/orchestrator/SKILL.md`

## Commands

### `/architecture-review`

PR architecture review. Loads relevant pattern files for touched layers, reports violations with source citations.

## Reference

| What                | Where                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Project conventions | `docs/repo-structure.md`                                                                               |
| Coding patterns     | `.claude/patterns/` (11 files: MUI, Next.js, TanStack Query, state, services, testing, security, etc.) |
| Knowledge base      | `knowladge/ai/mindmaps/` (25 mind maps), `knowladge/ai/original_source/` (full articles)               |
| Feature docs        | `tasks/` (discovery, implementation, orchestration per feature)                                        |

## Getting Started

1. Copy this repo: `cp -R ai-repo-template/ my-new-project/`
2. Rename in `package.json`: `"name": "my-new-project"`
3. `cd my-new-project && yarn install`
4. `yarn dev` — starts Next.js
5. Define your types in `app/types/`, build from there

## Scripts

| Script     | Command         | Description          |
| ---------- | --------------- | -------------------- |
| `dev`      | `yarn dev`      | Start dev server     |
| `build`    | `yarn build`    | Production build     |
| `lint`     | `yarn lint`     | Run ESLint           |
| `lint:fix` | `yarn lint:fix` | Fix lint errors      |
| `tsc`      | `yarn tsc`      | Type check           |
| `format`   | `yarn format`   | Format with Prettier |
| `test`     | `yarn test`     | Run tests            |

<!-- SYNC:END — managed by ai-reference, do not edit above this line -->

## Project-Specific Instructions

<!-- Add project-specific conventions, custom rules, and feature notes below. This section is never overwritten by the sync script. -->
