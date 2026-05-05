# Orchestration Evaluation Checklist

Validation criteria for orchestration file structural correctness. Loaded by `/orchestrator-plan-review` — the gate skill creates one task per criterion. No web search — purely structural checks.

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before evaluating, create a task for EACH criterion using TaskCreate:

1. "Check: coverage — every item from implementation plan has a step"
2. "Check: nothing added that wasn't in the plan — no scope creep"
3. "Check: dependency order — types before consumers, shared before specific"
4. "Check: each step has exactly one deliverable — not bundled"
5. "Check: every step has tests defined — no missing test lines"
6. "Check: N/A tests have justification — config-only, docs, git ops"
7. "Check: files in orchestration match files in plan — no drift"
8. "Check: each step is independently verifiable — clear done criteria"
9. "Check: buildability — orchestrator can execute without ambiguity"
10. "Check: type steps enforce STRONG types — no any, no bare string/number, discriminated unions, readonly"
11. "Check: Status section present — Current step and Blocked fields for orchestrator resume"

Mark each task `in_progress` when checking, `completed` when verified.
Cite source for each: `[orchestration-eval.md → {criterion}]`.

---

## Criteria

- Coverage — every type, file, and test from the implementation plan has a step `[cross-reference plan]`
- Nothing added that wasn't in the plan — no scope creep `[cross-reference plan]`
- Dependency order — types before consumers, shared before specific `[patterns — types-first]`
- Each step has exactly one deliverable — not bundled `[S03E03 §4 — guardian gates]`
- Every step has tests defined — no missing test lines `[patterns/testing.md]`
- N/A tests have justification — only for config-only, types-only with no logic, documentation `[patterns/testing.md]`
- Files in orchestration match files in plan — no path drift, no renamed files `[cross-reference plan]`
- Each step is independently verifiable — clear verify command and done criteria `[S03E01 §6 — Evaluation]`
- Buildability — every step has enough detail for the orchestrator to execute without asking questions `[S02E05 §1 — Identity clarity]`
- Type steps enforce STRONG types — type definitions in orchestration must specify no `any`, no bare `string`/`number`, discriminated unions over optionals, `readonly` where immutable `[types-eval.md — full type criteria]`
- Status section present — `## Status` with `Current step` and `Blocked` fields, required for orchestrator resume capability `[S03E03 §5 — Phase tracking flags]`

## Sources to Load

- Implementation plan (with `## Evaluation` section) — the source of truth
- `.claude/patterns/testing.md` — test requirement validation
- `docs/repo-structure.md` — file path validation
