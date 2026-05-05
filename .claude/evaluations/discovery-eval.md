# Discovery Evaluation Checklist

Validation criteria for discovery document soundness. Loaded by `/architect-evaluate-discovery` — the gate skill creates one task per criterion.

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before evaluating, create a task for EACH criterion using TaskCreate:

1. "Check: problem scope is clearly bounded — not too broad, not too narrow"
2. "Check: existing infrastructure correctly identified — no reinventing what exists"
3. "Check: architecture decisions have rationale grounded in KB"
4. "Check: communication patterns defined — clear data flow between components"
5. "Check: risk areas identified — KB-known pitfalls addressed"
6. "Check: dependencies and integration points mapped — nothing orphaned"
7. "Check: 'what does this NOT know?' answered — context gaps identified"
8. "Check: no over-engineering — simplest approach that meets requirements"
9. "Check: existing types audit present — weak types in affected area identified and flagged"
10. "Check: feature overview and motivation present — clear why this feature matters"
11. "Check: edge cases and error handling identified — not just happy path"
12. "Check: what needs to be built clearly defined — build scope explicit"
13. "Web search: are the proposed architecture patterns current best practice or outdated?"
14. "Web search: do similar systems exist? what did they learn?"
15. "Web search: are there known failure modes for this approach?"

Mark each task `in_progress` when checking, `completed` when verified.
Cite source for each: `[discovery-eval.md → {criterion}]`.

---

## KB Criteria

- Problem scope is clearly bounded — not too broad, not too narrow `[S02E01 §2 — Signal over noise]`
- Existing infrastructure correctly identified — no reinventing what exists `[S02E01 §10 — Context gaps]`
- Architecture decisions have rationale grounded in KB `[REFERENCE.md — Design Principles]`
- Communication patterns defined — clear data flow between components `[S02E04 §2-§3 — Inter-agent communication]`
- Risk areas identified — KB-known pitfalls addressed `[S01E05 §1 — Error recovery]`
- Dependencies and integration points mapped — nothing orphaned `[S02E01 §10 — Context gaps]`
- "What does this NOT know?" answered — context gaps identified `[S02E01 §10]`
- No over-engineering — simplest approach that meets requirements `[S02E05 §4 — Simplicity principle]`
- Existing types audit present — weak types in affected area identified and flagged (no `any`, no bare `string`/`number` when narrower types exist, no optional fields that are always present) `[types-eval.md — no any, no casting]`
- Feature overview and motivation present — clear why this feature matters, not just what it does `[S02E05 §1 — Identity: agent/feature must know its purpose]`
- Edge cases and error handling identified — error scenarios, boundary conditions, not just happy path `[S01E05 §1 — Error recovery]`
- What needs to be built clearly defined — explicit build scope, not just "what exists" `[S02E01 §2 — Signal over noise]`

## Web Search Criteria

- Are the proposed architecture patterns current best practice or outdated? — search for pattern names from discovery `[web: cite source]`
- Do similar systems exist? What did they learn? — search for comparable approaches `[web: cite source]`
- Are there known failure modes for this approach? — search for pitfalls + antipatterns `[web: cite source]`

## Sources to Load

- `.claude/skills/architect/KNOWLEDGE-INDEX.md` — identify relevant mindmaps
- Relevant mindmaps from `knowledge/ai/mindmaps/` — loaded selectively
- `.claude/skills/architect/REFERENCE.md` — design principles checklist
- Web search results — per Web Search Protocol
