---
name: orchestrator-plan-review
description: Reviews an orchestration file for structural correctness, coverage, and buildability. Writes findings directly into the document. Template-driven gate skill. No web search.
---

## MANDATORY FIRST ACTION — LOAD EVAL TEMPLATE AND CREATE TASKS

Before reading ANYTHING below:

1. Read `.claude/evaluations/orchestration-eval.md` — criteria template
2. Create tasks via TaskCreate — one per criterion from template, plus static tasks below

**Static tasks (always create):**

1. "Load orchestration file from conversation context or path"
2. "Load orchestration-eval.md — read criteria list"
3. "Load implementation plan — cross-reference source"
4. "Load patterns + repo-structure.md"

**Dynamic tasks (one per criterion from orchestration-eval.md):**

5–N. "Check: {criterion from template}" — one task per criterion

**Final tasks (always create):**

- "Write findings into orchestration file — append ## Review section"
- "Present to user — overall verdict + findings"
- "HANDOFF → user runs /orchestrator"

Chain tasks sequentially with `addBlockedBy`.

If TaskCreate unavailable, write task list as markdown checklist in first message instead.

If tasks not created, STOP. Go back and create them.

Mark each task `in_progress` when starting. Mark `completed` when done.

---

## Purpose

Review orchestration file for structural correctness — covers everything from plan? Dependencies ordered right? Tests defined? Orchestrator can execute without ambiguity?

**Gate skill.** Does NOT create new documents — evaluates existing artifact, writes findings directly into it. No web search — purely structural, cross-references orchestration file against implementation plan.

**Pipeline position:**

```
... → /plan-orchestration → [YOU ARE HERE] → /orchestrator → /architecture-review
```

---

## What to Load

1. **Orchestration file** — artifact being reviewed (in conversation context, or read from path)
2. `.claude/evaluations/orchestration-eval.md` — criteria template (drives task list)
3. **Implementation plan** (with `## Evaluation` section) — source of truth for cross-reference
4. `.claude/patterns/testing.md` — test requirement validation
5. `docs/repo-structure.md` — file path validation

---

## How to Evaluate

Work through each criterion from `orchestration-eval.md` sequentially. For each:

1. Mark task `in_progress`
2. Check criterion against orchestration file
3. Cross-reference with implementation plan where needed
4. Record verdict: `[PASS]`, `[NOTE]`, or `[FAIL]`
5. Mark task `completed`

**Rules:**

- Every criterion MUST reference specific section of plan or orchestration file checked
- Coverage checks must be item-by-item — list what's covered and what's missing, not just "looks complete"
- Dependency checks must trace chain — "Step 3 depends on Step 1 (types) — correct, Step 3 imports `SessionFilter` defined in Step 1"

---

## Output — Write Into Orchestration File

Append this section to orchestration file:

```markdown
## Review

**Verdict:** PASS | PASS WITH NOTES | FAIL
**Reviewed:** {date}
**Sources:** implementation plan, orchestration-eval.md, patterns/testing.md, repo-structure.md

### Findings

- [PASS] {criterion} — {assessment}
- [NOTE] {criterion} — {finding + suggestion}
- [FAIL] {criterion} — {issue + what to fix}

### Coverage Cross-Reference

- Plan Types section: {N}/{N} covered ✓ | {list any missing}
- Plan Features section: {N}/{N} covered ✓ | {list any missing}
- Plan Tests section: {N}/{N} covered ✓ | {list any missing}
```

---

## Handoff

Present verdict and findings to user. Then:

- **If PASS or PASS WITH NOTES** → tell user: "Run `/orchestrator` to execute this orchestration file."
- **If FAIL** → discuss issues with user in this conversation. Update orchestration file with fixes. Re-evaluate if needed.

---

## Before Finishing

Check TaskList. If any task not `completed`, do not finish — address remaining tasks or explain to user why skipped.
