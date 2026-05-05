# Plan Evaluation Checklist

Validation criteria for implementation plan soundness. Loaded by `/architect-evaluate-plan` — the gate skill creates one task per criterion.

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before evaluating, create a task for EACH criterion using TaskCreate:

1. "Check: every file has a clear purpose — no ambiguous 'utils' or 'helpers'"
2. "Check: file placement follows repo-structure.md conventions"
3. "Check: naming follows established patterns (services, hooks, components)"
4. "Check: types defined before implementation — dependency order sound"
5. "Check: each file cites which pattern it follows"
6. "Check: plan covers everything from discovery — nothing dropped"
7. "Check: integration points are concrete — not 'will integrate with X' but 'imports Y from Z'"
8. "Check: no circular dependencies in the proposed structure"
9. "Check: server/client boundary respected"
10. "Check: KB alignment — design follows knowledge base principles"
11. "Check: test strategy defined per component — not an afterthought"
12. "Check: types are STRONG — no any, no bare string/number, discriminated unions over optionals, readonly where immutable"
13. "Check: services follow single async function per file pattern"
14. "Check: API routes follow two-file pattern (route.ts + {action}Route.ts)"
15. "Check: constants split into frontend vs backend"
16. "Check: edge cases and error handling strategy defined per component"
17. "Check: external dependencies identified — BE changes, API contracts, third-party services"
18. "Web search: are chosen libraries/APIs current and maintained?"
19. "Web search: known issues with the specific tech choices?"
20. "Web search: better alternatives available?"

Mark each task `in_progress` when checking, `completed` when verified.
Cite source for each: `[plan-eval.md → {criterion}]`.

---

## KB + Pattern Criteria

- Every file has a clear purpose — no ambiguous "utils" or "helpers" `[repo-structure.md — Naming]`
- File placement follows repo-structure.md conventions `[repo-structure.md — Directory layout]`
- Naming follows established patterns (services, hooks, components) `[repo-structure.md — Naming conventions]`
- Types defined before implementation — dependency order sound `[patterns — types-first]`
- Each file cites which pattern it follows `[.claude/patterns/*]`
- Plan covers everything from discovery — nothing dropped `[cross-reference discovery doc]`
- Integration points are concrete — not "will integrate with X" but "imports Y from Z" `[S02E01 §10]`
- No circular dependencies in the proposed structure `[architecture-eval.md → no circular deps]`
- Server/client boundary respected `[architecture-eval.md → server/client boundary]`
- KB alignment — design follows knowledge base principles `[REFERENCE.md]`
- Test strategy defined per component — not an afterthought `[patterns/testing.md]`
- Types are STRONG — no `any`, no `as` casting, no bare `string`/`number` when narrower types exist, discriminated unions over optional fields, `readonly` where data is immutable, `Record<SpecificKey, Value>` over `Record<string, Value>` `[types-eval.md — full type criteria]`
- Services follow single async function per file pattern (`{verb}{Noun}Service.ts`) `[architecture-eval.md → services]`
- API routes follow two-file pattern (`route.ts` + `{action}Route.ts`) `[architecture-eval.md → API routes]`
- Constants split into frontend vs backend (`frontendApiConstants.ts` / `backendApiConstants.ts`) `[architecture-eval.md → constants]`
- Edge cases and error handling strategy defined per component — not just happy path `[S01E05 §1 — Error recovery]`
- External dependencies identified — BE changes, API contracts, third-party services `[S02E01 §10 — Context gaps]`

## Web Search Criteria

- Are chosen libraries/APIs current and maintained? — search for each library/tool in the plan `[web: cite source]`
- Known issues with the specific tech choices? — search for "{library} problems OR breaking changes {year}" `[web: cite source]`
- Better alternatives available? — search for "{library} vs OR alternatives" `[web: cite source]`

## Sources to Load

- `.claude/skills/architect/KNOWLEDGE-INDEX.md` — identify relevant mindmaps
- Relevant mindmaps from `knowledge/ai/mindmaps/` — loaded selectively
- `.claude/skills/architect/REFERENCE.md` — design principles checklist
- `.claude/patterns/` — load patterns cited in the plan
- `docs/repo-structure.md` — naming conventions, directory layout
- `.claude/evaluations/architecture-eval.md` — structural criteria
- Web search results — per Web Search Protocol
