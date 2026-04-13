# AI Repo Template

A ready-to-go Next.js project template with AI-assisted development built in. Clone it, rename it, start building — all coding conventions, AI skills, and patterns are pre-configured.

## Setup

```bash
cp -R ai-repo-template/ my-project/
cd my-project
# Update "name" in package.json
yarn install
yarn dev
```

## What's inside

- **Next.js 16** + React 19 + TypeScript 6 (strict)
- **Material UI 7** with a polished theme (light + dark mode, component overrides)
- **Recharts** for data visualization (line, bar, area, pie charts)
- **TanStack React Query** for data fetching
- **Zod** for validation
- **Vitest** for testing
- **ESLint + Prettier + Husky** (pre-commit: lint + tsc + format, pre-push: test)
- **Atomic design** component structure (atoms/molecules/organisms/templates)
- **Global Drawer & Dialog** via context hooks (`useDrawer()`, `useDialog()`)
- **Route groups** — `(public)` and `(protected)` layouts ready to go
- **AppProvider** — composite provider pattern (add your providers in one place)

## How to build a new feature

Every new feature goes through a 4-step pipeline. Each step is a separate skill with a single responsibility:

| Step | Skill                     | What it does                                                                   | Writes code?                |
| ---- | ------------------------- | ------------------------------------------------------------------------------ | --------------------------- |
| 1    | `/creator`                | Builds context, advises on architecture, aligns on approach                    | No                          |
| 2    | `/plan-feature`           | Discovers codebase, writes implementation plan + orchestration file            | No — produces `tasks/` docs |
| 3    | `/efficient-orchestrator` | Executes the approved plan: types first, parallel waves via subagents, testing | Yes — via subagents         |
| 4    | `/architecture-review`    | Reviews the PR against coding pattern files                                    | No                          |

```
/creator → /plan-feature → /efficient-orchestrator → /architecture-review
```

### Step 1: `/creator` — build context

```
/creator

I want to build [feature name] for [project name].

What it should do:
- [2-3 sentences describing the feature]

What already exists:
- [Related files, types, services, endpoints]

Constraints:
- [Must work with X, depends on API Y, follows pattern Z]
```

Advises on architecture, identifies which patterns apply, and aligns on approach before any code is written.

### Step 2: `/plan-feature` — discovery and planning

```
/plan-feature [feature-name] "[brief scope]"
```

Produces three documents in `tasks/`, each requiring your approval:

1. **Discovery doc** — what exists, what needs building, edge cases
2. **Implementation plan** — architecture decisions, file-level details
3. **Orchestration file** — step-by-step execution checklist with dependencies

### Step 3: `/efficient-orchestrator` — execution

```
/efficient-orchestrator

Execute: tasks/{feature-name}-orchestration.md
```

Parses steps into dependency waves, defines types first, executes via subagents, runs structured testing, cleans up and commits.

### Step 4: `/architecture-review`

Run `/architecture-review` on your branch before merging.

### Quick reference

| Situation             | Flow                                                                              |
| --------------------- | --------------------------------------------------------------------------------- |
| New feature           | `/creator` → `/plan-feature` → `/efficient-orchestrator` → `/architecture-review` |
| Small fix / bug       | Just code it                                                                      |
| PR review only        | `/architecture-review`                                                            |
| Architecture question | `/creator`                                                                        |
| Resuming execution    | `/efficient-orchestrator` → point to `tasks/{name}-orchestration.md`              |

## Tips

**Be specific about what exists.** "The user profile is in `app/components/organisms/UserProfile/`" beats "there's a profile component somewhere."

**Correct early.** Fix wrong assumptions in the discovery doc before approving the plan. Fixing a plan is cheap; fixing code is expensive.

**One feature per conversation.** Don't mix unrelated work in the same conversation.

**Resume via orchestration file.** It persists between conversations:

```
/efficient-orchestrator

Continue executing: tasks/{feature-name}-orchestration.md
```
