# AI Repo Template

A ready-to-go Next.js project template with AI-assisted development built in. Clone it, rename it, start building — all coding conventions, AI skills, and patterns are pre-configured.

## Setup

```bash
cp -R ai-repo-template/ my-project/
cd my-project
# Update "name" in package.json
yarn install
```

Configure authentication:

```bash
cp .env.example .env
# Fill in AUTH_SECRET (generate with: npx auth secret)
# Fill in AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from Google Cloud Console
yarn dev
```

## What's inside

- **Next.js 16** + React 19 + TypeScript 6 (strict)
- **Material UI 7** with a polished theme (light + dark mode toggle, component overrides)
- **NextAuth v5** — Google SSO, JWT sessions, role-based allowlist, all routes protected by default
- **Recharts** for data visualization (line, bar, area, pie charts)
- **TanStack React Query** for data fetching
- **Zod** for validation
- **Vitest** for testing (42 tests across 4 files)
- **ESLint + Prettier + Husky** (pre-commit: lint + tsc + format, pre-push: test)
- **Atomic design** component structure (atoms/molecules/organisms/templates)
- **Global Drawer & Dialog** via context hooks (`useDrawer()`, `useDialog()`)
- **AppProvider** — composite provider pattern (all providers nested in one place)
- **Evaluation criteria** in `.claude/evaluations/` — validation checklists for types, tests, and architecture used by pipeline gates

## Authentication

All routes are protected by default via `AuthProvider`. The `AuthGuard` component renders a `LoginForm` inline when unauthenticated — no separate login route exists. Pages live flat under `app/` (e.g., `app/dashboard/page.tsx`).

**Stack:** NextAuth v5, Google SSO, JWT session strategy, `@deblock.com` domain restriction

**Session management:**

- 1-hour session maxAge with auto-extend on user activity (debounced 60s)
- 30-second expiry warning with countdown snackbar
- Offline/online and tab focus/visibility handling
- Cross-tab signout detection

**Configuration:**

| Variable             | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `AUTH_URL`           | NextAuth base URL (`http://localhost:3000`) |
| `AUTH_SECRET`        | JWT signing secret (`npx auth secret`)      |
| `AUTH_GOOGLE_ID`     | Google OAuth client ID                      |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret                  |

**User allowlist:** `app/config/authConfig.ts` — add/remove authorized `@deblock.com` emails and roles (`admin`, `operator`, `viewer`).

## How to build a new feature

Every new feature goes through a 10-skill pipeline. Each skill has a single responsibility and hands off to the next:

```
/architect → /brainstorm → /plan-discovery → /architect-evaluate-discovery
  → /plan-implementation → /architect-evaluate-plan
    → /plan-orchestration → /orchestrator-plan-review
      → /orchestrator → /architecture-review
```

| #   | Skill                           | Type     | What it does                                        | Writes code? |
| --- | ------------------------------- | -------- | --------------------------------------------------- | ------------ |
| 1   | `/architect`                    | Advisor  | Loads context, advises on architecture, hands off   | No           |
| 2   | `/brainstorm`                   | Creator  | Structured divergent thinking, options matrix       | No           |
| 3   | `/plan-discovery`               | Creator  | Explores codebase, writes discovery doc             | No — doc     |
| 4   | `/architect-evaluate-discovery` | Gate     | Evaluates discovery against KB + web search         | No — verdict |
| 5   | `/plan-implementation`          | Creator  | Writes implementation plan (types, features, tests) | No — doc     |
| 6   | `/architect-evaluate-plan`      | Gate     | Evaluates plan against KB + patterns + web search   | No — verdict |
| 7   | `/plan-orchestration`           | Creator  | Converts plan into step-by-step orchestration file  | No — doc     |
| 8   | `/orchestrator-plan-review`     | Gate     | Reviews orchestration for coverage + buildability   | No — verdict |
| 9   | `/orchestrator`                 | Executor | Executes orchestration: types first, waves, testing | Yes          |
| 10  | `/architecture-review`          | Gate     | Reviews implemented code against patterns + evals   | No           |

### Step 1: `/architect` — build context

```
/architect

I want to build [feature name] for [project name].

What it should do:
- [2-3 sentences describing the feature]

What already exists:
- [Related files, types, services, endpoints]

Constraints:
- [Must work with X, depends on API Y, follows pattern Z]
```

Advises on architecture, identifies which patterns apply, and aligns on approach before any code is written.

### Steps 2-8: planning pipeline

Each skill produces a document in `roadmaps/{ISO-week}/plans/{feature}/tasks/`, evaluated by a gate skill before proceeding:

1. **Brainstorm** — explore multiple approaches, pick one
2. **Discovery doc** — what exists, what needs building, edge cases → evaluated by architect
3. **Implementation plan** — architecture decisions, file-level details → evaluated by architect
4. **Orchestration file** — step-by-step execution checklist with dependencies → reviewed for buildability

### Step 9: `/orchestrator` — execution

```
/orchestrator

Execute: roadmaps/2026-W19/plans/W19-feature/W19-feature-orchestration.md
```

Parses steps into dependency waves, defines types first, writes all code directly, runs structured testing, cleans up and commits.

### Step 10: `/architecture-review`

Run `/architecture-review` on your branch before merging.

### Quick reference

| Situation                      | Flow                                         |
| ------------------------------ | -------------------------------------------- |
| New feature                    | Full 10-skill pipeline                       |
| New feature (obvious approach) | Skip `/brainstorm` → 9-skill pipeline        |
| Small fix / bug                | Just code it                                 |
| PR review only                 | `/architecture-review`                       |
| Architecture question          | `/architect` (mentor mode)                   |
| Resuming execution             | Load orchestration file, run `/orchestrator` |

## Architecture & Planning

### `docs/app-architecture.md` — living architecture doc

Single source of truth for how the app is built. The `/architect` skill loads this as primary context. Covers system overview, core features, data pipeline, component architecture, state management, API layer, DB schema, type system, infrastructure (auth, env vars), and testing strategy.

**Update it after every feature cycle** — it's a living document, not a one-time spec. When the architect skill advises on a new feature, it reads this file to understand current state.

### Weekly roadmap flow

All execution artifacts live under `roadmaps/` organized by ISO week:

```
roadmaps/
├── templates/
│   └── week-roadmap.md
└── 2026-W19/
    ├── W19-week-roadmap.md              ← priority stack, schedule, gates
    ├── W19-learnings.md                 ← findings from the week
    └── plans/
        └── W19-auth/                    ← one folder per feature
            ├── W19-auth-orchestration.md
            └── tasks/
                ├── W19-auth-discovery.md
                └── W19-auth-implementation.md
```

**Weekly cadence:**

- **Monday:** create `{week}-week-roadmap.md` from template + previous week's next-steps
- **Per feature:** full 10-skill pipeline, artifacts land in `plans/{week}-{feature}/`
- **Friday:** retrospective → `{week}-learnings.md`

## Tips

**Be specific about what exists.** "The user profile is in `app/components/organisms/UserProfile/`" beats "there's a profile component somewhere."

**Correct early.** Fix wrong assumptions in the discovery doc before approving the plan. Fixing a plan is cheap; fixing code is expensive.

**One feature per conversation.** Don't mix unrelated work in the same conversation.

**Resume via orchestration file.** It persists between conversations:

```
/orchestrator

Continue executing: roadmaps/2026-W19/plans/W19-feature/W19-feature-orchestration.md
```

**CLAUDE.md structure:** The file has `SYNC:START/END` markers. Content above the markers is synced from the reference repo. Add your project-specific instructions below `SYNC:END` — they are never overwritten.
