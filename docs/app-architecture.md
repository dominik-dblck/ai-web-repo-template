# {Project Name} — Architecture

> Last updated: {date}
>
> Living source of truth for app architecture. Architect skill loads this as primary context. Update after every feature cycle.

---

## System Overview

<!--
Mermaid diagram of your system. Start simple, add detail as the app grows.
Example: flowchart showing main components and data flow.
-->

## 1. Core Feature / Main Flow

<!--
What the app does. Primary user journey.
Key API endpoints and their purpose.
-->

## 2. Data Pipeline

<!--
How data enters the system, gets transformed, and is stored.
External data sources, internal transformations, storage.
-->

## 3. Component Architecture

<!--
Component tree. Which organisms exist, what they do.
Follow atomic design: atoms → molecules → organisms → templates.
-->

## 4. State Management

<!--
React Query keys and cache strategy.
Providers and their responsibilities.
Local state vs server state decisions.
-->

## 5. API Layer

<!--
API routes with request/response shapes.
External service integrations.
Request flow: Browser → frontend constants → /api/ → backend constants → External API
-->

## 6. DB Schema

<!--
Tables, key columns, relationships.
If using an ORM, note the models.
-->

## 7. Type System

<!--
Key Zod schemas and where they live.
Branded types if any.
Shared interfaces that multiple features depend on.
-->

## 8. Infrastructure

<!--
Environment variables and their purpose.
Deployment target and process.
External services (auth, payments, monitoring, etc.)
-->

## 9. Testing Strategy

<!--
What's tested and how.
Test file locations and conventions.
Coverage goals or areas of focus.
-->

## 10. Current State & TODOs

<!--
What's done, what's in progress, what's planned.
Link to roadmap and plans if they exist.
-->

---

## Dev Pipeline — 10-Skill Architecture

Every new feature goes through a 10-skill pipeline following create → gate → create → gate pattern. Each skill has single responsibility. Entire pipeline runs in one conversation.

### Pipeline Flow

```
/architect → /brainstorm → /plan-discovery → /architect-evaluate-discovery
  → /plan-implementation → /architect-evaluate-plan
    → /plan-orchestration → /orchestrator-plan-review
      → /orchestrator → /architecture-review
```

### Skill Roles

| #   | Skill                           | Type     | Responsibility                                     |
| --- | ------------------------------- | -------- | -------------------------------------------------- |
| 1   | `/architect`                    | Advisor  | Load context, advise architecture, hand off        |
| 2   | `/brainstorm`                   | Creator  | Divergent thinking, options matrix, trade-offs     |
| 3   | `/plan-discovery`               | Creator  | Explore codebase, write discovery doc              |
| 4   | `/architect-evaluate-discovery` | Gate     | Evaluate discovery against KB + web search         |
| 5   | `/plan-implementation`          | Creator  | Write implementation plan (types, features, tests) |
| 6   | `/architect-evaluate-plan`      | Gate     | Evaluate plan against KB + patterns + web search   |
| 7   | `/plan-orchestration`           | Creator  | Convert plan into orchestration file               |
| 8   | `/orchestrator-plan-review`     | Gate     | Review orchestration for coverage + buildability   |
| 9   | `/orchestrator`                 | Executor | Execute: types first, waves, testing               |
| 10  | `/architecture-review`          | Gate     | Review code against patterns + evals               |

### Task Types

| Type            | How tasks defined                   | Used by                            |
| --------------- | ----------------------------------- | ---------------------------------- |
| Static          | Hardcoded in SKILL.md               | Creator skills (#2-3, #5, #7) + #1 |
| Template-driven | Loads eval file, task per criterion | Gate skills (#4, #6, #8, #10)      |

### Evaluation Templates

Gate skills load criteria from `.claude/evaluations/`:

| Template                 | Used by                         | Contains                               |
| ------------------------ | ------------------------------- | -------------------------------------- |
| `discovery-eval.md`      | `/architect-evaluate-discovery` | KB criteria + web search criteria      |
| `plan-eval.md`           | `/architect-evaluate-plan`      | KB + pattern + structural + web search |
| `orchestration-eval.md`  | `/orchestrator-plan-review`     | Coverage + dependency + buildability   |
| `web-search-protocol.md` | Both architect-evaluate skills  | 4-phase structured web search process  |
| `architecture-eval.md`   | `/architecture-review`          | Code structure criteria                |
| `tests-eval.md`          | `/architecture-review`          | Test quality criteria                  |
| `types-eval.md`          | `/architecture-review`          | Type safety criteria                   |

### Quick Reference

| Situation                      | Flow                         |
| ------------------------------ | ---------------------------- |
| New feature                    | Full 10-skill pipeline       |
| New feature (obvious approach) | Skip `/brainstorm` → 9-skill |
| Small fix / bug                | Just code it                 |
| PR review only                 | `/architecture-review`       |
| Architecture question          | `/architect` (mentor mode)   |

---

## Roadmap & Execution Structure

All execution artifacts live under `roadmaps/`. `docs/` is documentation only.

### Directory Layout

```
roadmaps/
├── backlog.md                              ← week-agnostic prioritized backlog
├── templates/
│   └── week-roadmap.md                     ← weekly roadmap template
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

### Three Tiers

| Tier    | Analogy              | Scope                                                |
| ------- | -------------------- | ---------------------------------------------------- |
| Roadmap | Mindmap (high-level) | Week — priorities, schedule, gates                   |
| Plan    | REFERENCE.md         | Feature — architecture decisions, file-level plan    |
| Tasks   | Original article     | Execution — discovery, implementation, orchestration |

### Weekly Cadence

- **Monday:** create `{week}-week-roadmap.md` from template + previous week's next-steps
- **Per feature:** full 10-skill pipeline (`/architect` → ... → `/architecture-review`)
- **Friday:** retrospective → `{week}-learnings.md` + `{week}-next-steps.md`
