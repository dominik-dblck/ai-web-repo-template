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

### New feature — 10-Skill Pipeline

Every feature goes through a create → gate → create → gate pipeline. Each skill has single responsibility and hands off to next. Entire pipeline runs in one conversation — all skills share full context.

```
/architect → /brainstorm → /plan-discovery → /architect-evaluate-discovery
  → /plan-implementation → /architect-evaluate-plan
    → /plan-orchestration → /orchestrator-plan-review
      → /orchestrator → /architecture-review
```

| #   | Skill                           | Type     | What it does                                        | Writes code? |
| --- | ------------------------------- | -------- | --------------------------------------------------- | ------------ |
| 1   | `/architect`                    | Advisor  | Loads context, advises on architecture, hands off   | No           |
| 2   | `/brainstorm`                   | Creator  | Structured divergent thinking, options matrix       | No — doc     |
| 3   | `/plan-discovery`               | Creator  | Explores codebase, writes discovery doc             | No — doc     |
| 4   | `/architect-evaluate-discovery` | Gate     | Evaluates discovery against KB + web search         | No — verdict |
| 5   | `/plan-implementation`          | Creator  | Writes implementation plan (types, features, tests) | No — doc     |
| 6   | `/architect-evaluate-plan`      | Gate     | Evaluates plan against KB + patterns + web search   | No — verdict |
| 7   | `/plan-orchestration`           | Creator  | Converts plan into step-by-step orchestration file  | No — doc     |
| 8   | `/orchestrator-plan-review`     | Gate     | Reviews orchestration for coverage + buildability   | No — verdict |
| 9   | `/orchestrator`                 | Executor | Executes orchestration: types first, waves, testing | Yes          |
| 10  | `/architecture-review`          | Gate     | Reviews implemented code against patterns + evals   | No           |

### Weekly Roadmap Flow

All execution artifacts live under `roadmaps/`. Template: `roadmaps/templates/week-roadmap.md`.

```
roadmaps/
├── templates/
│   └── week-roadmap.md
└── {ISO-week}/
    ├── {week}-week-roadmap.md              ← priority stack, schedule, gates
    ├── {week}-learnings.md                 ← findings from the week
    └── plans/
        └── {week}-{feature}/               ← one folder per feature
            ├── {week}-{feature}-orchestration.md
            └── tasks/
                ├── {week}-{feature}-discovery.md
                └── {week}-{feature}-implementation.md
```

Weekly cadence:

- **Monday:** create `{week}-week-roadmap.md` from template + previous week's next-steps
- **Per feature:** full 10-skill pipeline
- **Friday:** retrospective → `{week}-learnings.md`

### Summary

| Situation                      | Flow                                         |
| ------------------------------ | -------------------------------------------- |
| New feature                    | Full 10-skill pipeline                       |
| New feature (obvious approach) | Skip `/brainstorm` → 9-skill pipeline        |
| Small fix / bug                | Just code it                                 |
| PR review only                 | `/architecture-review`                       |
| Architecture question          | `/architect` (mentor mode)                   |
| Resuming execution             | Load orchestration file, run `/orchestrator` |

## AI Skills

### Pipeline Skills

**Advisor:**

- **`/architect`** — Architecture advisor. Mentor mode for Q&A, Builder mode advises and hands off. Files: `.claude/skills/architect/SKILL.md`, `REFERENCE.md`

**Creators (produce docs, no code):**

- **`/brainstorm`** — Structured divergent thinking, options matrix + trade-off analysis
- **`/plan-discovery`** — Explores codebase, writes discovery doc
- **`/plan-implementation`** — Writes implementation plan from approved discovery
- **`/plan-orchestration`** — Converts plan into step-by-step orchestration file

**Gates (evaluate docs, no code):**

- **`/architect-evaluate-discovery`** — Evaluates discovery against KB + web search
- **`/architect-evaluate-plan`** — Evaluates plan against KB + patterns + web search
- **`/orchestrator-plan-review`** — Reviews orchestration for coverage + buildability
- **`/architecture-review`** — Reviews implemented code against patterns + evals

**Executor:**

- **`/orchestrator`** — Executes orchestration: types first, dependency waves, structured testing

### Evaluation Templates

Gate skills use eval templates from `.claude/evaluations/`:

| Template                 | Used by                         |
| ------------------------ | ------------------------------- |
| `discovery-eval.md`      | `/architect-evaluate-discovery` |
| `plan-eval.md`           | `/architect-evaluate-plan`      |
| `orchestration-eval.md`  | `/orchestrator-plan-review`     |
| `web-search-protocol.md` | Both architect-evaluate skills  |
| `architecture-eval.md`   | `/architecture-review`          |
| `tests-eval.md`          | `/architecture-review`          |
| `types-eval.md`          | `/architecture-review`          |

### Legacy Skills

- **`/plan-feature`** — Combined discovery + planning (pre-pipeline). Use 10-skill pipeline instead for new work.

## Reference

| What                | Where                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| Project conventions | `docs/repo-structure.md`                                                                                 |
| App architecture    | `docs/app-architecture.md`                                                                               |
| Coding patterns     | `.claude/patterns/` (11 files: MUI, Next.js, TanStack Query, state, services, testing, security, etc.)   |
| Eval templates      | `.claude/evaluations/` (7 files: discovery, plan, orchestration, architecture, tests, types, web search) |
| Knowledge base      | `knowladge/ai/mindmaps/` (25 mind maps), `knowladge/ai/original_source/` (full articles)                 |
| Roadmap template    | `roadmaps/templates/week-roadmap.md`                                                                     |
| Feature artifacts   | `roadmaps/{ISO-week}/plans/{week}-{feature}/` (discovery, implementation, orchestration)                 |

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
