---
name: architect-evaluate-plan
description: Evaluates an implementation plan against KB, patterns, repo-structure, and web search. Writes findings directly into the document. Template-driven gate skill.
---

## MANDATORY FIRST ACTION — LOAD EVAL TEMPLATE AND CREATE TASKS

Before reading ANYTHING below:

1. Read `.claude/evaluations/plan-eval.md` — criteria template
2. Create tasks using TaskCreate — one per criterion from template, plus static tasks below

**Static tasks (always create):**

1. "Load implementation plan from conversation context or path"
2. "Load plan-eval.md — read criteria list"
3. "Load KB — KNOWLEDGE-INDEX.md → load relevant mindmaps"
4. "Load REFERENCE.md — design principles checklist"
5. "Load patterns + repo-structure.md + architecture-eval.md"
6. "Web search — follow Web Search Protocol"

**Dynamic tasks (one per criterion from plan-eval.md):**

7–N. "Check: {criterion from template}" — one task per criterion

**Final tasks (always create):**

- "Write findings into implementation plan — append ## Evaluation section"
- "Present to user — overall verdict + findings"
- "HANDOFF → user runs /plan-orchestration"

Chain tasks sequentially with `addBlockedBy`.

If TaskCreate unavailable, write task list as markdown checklist in first message instead.

If tasks not created, STOP. Go back and create them.

Mark each task `in_progress` when starting. Mark `completed` when done.

---

## Purpose

Evaluate implementation plan for design + structural soundness — follows KB principles? File placements correct? Pattern citations check out? Better alternatives exist?

Gate skill. Does NOT create new documents — evaluates existing artifact, writes findings directly into it.

**Pipeline position:**

```
... → /plan-implementation → [YOU ARE HERE] → /plan-orchestration → ...
```

---

## What to Load

1. **Implementation plan** — artifact being evaluated (in conversation context or read from path)
2. `.claude/evaluations/plan-eval.md` — criteria template (drives task list)
3. `.claude/skills/architect/KNOWLEDGE-INDEX.md` — identify relevant mindmaps
4. Relevant mindmaps from `knowledge/ai/mindmaps/` — load selectively
5. `.claude/skills/architect/REFERENCE.md` — design principles checklist
6. `.claude/patterns/` — load patterns cited in plan to verify claims
7. `docs/repo-structure.md` — naming conventions, directory layout
8. `.claude/evaluations/architecture-eval.md` — structural criteria

---

## Web Search Protocol

Read `.claude/evaluations/web-search-protocol.md` for full 4-phase process (extract targets → structured queries → evaluate + cite → write into evaluation).

**Search targets for this skill:** libraries/tools chosen, file structure patterns, known issues with specific tech choices.

---

## How to Evaluate

Work through each criterion from `plan-eval.md` sequentially. For each:

1. Mark task `in_progress`
2. Check criterion against implementation plan
3. Cite source: KB section, pattern file, or repo-structure.md
4. Record verdict: `[PASS]`, `[NOTE]`, or `[FAIL]`
5. Mark task `completed`

**Rules:**

- Every KB criterion MUST cite KB source. No citation = not checked.
- Every pattern criterion MUST cite specific pattern file and section: `[patterns/mui7.md → Token Safety]`.
- Every web finding MUST cite URL or named source.
- Web findings contradicting KB or pattern findings — flag explicitly.

---

## Output — Write Into Implementation Plan

Append this section to implementation plan:

```markdown
## Evaluation

**Verdict:** PASS | PASS WITH NOTES | FAIL
**Evaluated:** {date}
**Sources:** {list of KB + pattern sources loaded}

### KB Findings

Only include [NOTE] and [FAIL] items — omit [PASS] to save tokens. If all pass, write "All {N} KB criteria passed."

- [NOTE] {criterion} — {finding + suggestion} `[{KB source § section}]`
- [FAIL] {criterion} — {issue + what to fix} `[{KB source § section}]`

### Web Search Insights

Only include [WARNS] and [SUGGESTS] — omit [CONFIRMS] to save tokens. If nothing to warn about, write "No web warnings."

- [WARNS] {risk identified} `[web: {URL or source name} — {specific finding}]`
- [SUGGESTS] {alternative worth considering} `[web: {URL or source name} — {specific finding}]`

### Web Search Queries Executed

- "{query 1}" → {N results reviewed} → {findings: N confirms, N warns, N suggests}
- "{query 2}" → {N results reviewed} → {findings: N confirms, N warns, N suggests}
```

---

## Handoff

Present verdict and findings to user. Then:

- **PASS or PASS WITH NOTES** → tell user: "Run `/plan-orchestration` to create orchestration file from this evaluated plan."
- **FAIL** → discuss issues with user in this conversation. Update plan with fixes. Re-evaluate if needed.

---

## Before Finishing

Check TaskList. Any task not `completed` — do not finish. Address remaining tasks or explain to user why skipped.
