---
name: architect-evaluate-discovery
description: Evaluates a discovery doc against KB mindmaps, REFERENCE.md, and web search. Writes findings directly into the document. Template-driven gate skill.
---

## MANDATORY FIRST ACTION — LOAD EVAL TEMPLATE AND CREATE TASKS

Before reading ANYTHING below:

1. Read `.claude/evaluations/discovery-eval.md` — criteria template
2. Create tasks via TaskCreate — one per criterion from template, plus static tasks below

**Static tasks (always create):**

1. "Load discovery doc from conversation context or path"
2. "Load discovery-eval.md — read criteria list"
3. "Load KB — KNOWLEDGE-INDEX.md → load relevant mindmaps"
4. "Load REFERENCE.md — design principles checklist"
5. "Web search — follow Web Search Protocol"

**Dynamic tasks (one per criterion from discovery-eval.md):**

6–N. "Check: {criterion from template}" — one task per criterion

**Final tasks (always create):**

- "Write findings into discovery doc — append ## Evaluation section"
- "Present to user — overall verdict + findings"
- "HANDOFF → user runs /plan-implementation"

Chain tasks sequentially with `addBlockedBy`.

If TaskCreate unavailable, write task list as markdown checklist in first message instead.

If tasks not created, STOP. Go back and create them.

Mark each task `in_progress` when starting. Mark `completed` when done.

---

## Purpose

Evaluate discovery doc for strategic soundness — right problems identified? Architecture decisions grounded in KB? Industry patterns or pitfalls missing?

**Gate skill.** Does NOT create new documents — evaluates existing artifact, writes findings directly into it.

**Pipeline position:**

```
/architect → /plan-discovery → [YOU ARE HERE] → /plan-implementation → ...
```

---

## What to Load

1. **Discovery doc** — artifact being evaluated (in conversation context or read from path)
2. `.claude/evaluations/discovery-eval.md` — criteria template (drives task list)
3. `.claude/skills/architect/KNOWLEDGE-INDEX.md` — identify relevant mindmaps
4. Relevant mindmaps from `knowledge/ai/mindmaps/` — load selectively per feature
5. `.claude/skills/architect/REFERENCE.md` — design principles checklist

---

## Web Search Protocol

Read `.claude/evaluations/web-search-protocol.md` for full 4-phase process (extract targets → structured queries → evaluate + cite → write into evaluation).

**Search targets for this skill:** architecture patterns proposed, risk areas and failure modes, similar systems in industry.

---

## How to Evaluate

Work through each criterion from `discovery-eval.md` sequentially. For each:

1. Mark task `in_progress`
2. Check criterion against discovery doc
3. Cite KB source that supports or contradicts approach
4. Record verdict: `[PASS]`, `[NOTE]`, or `[FAIL]`
5. Mark task `completed`

**Rules:**

- Every KB criterion MUST cite KB source — `[S02E04 §2 — Pipeline Pattern]`. No citation = not checked.
- Every web finding MUST cite URL or named source — no citation = not included.
- Web findings contradicting KB findings flagged explicitly — KB takes precedence but conflict worth noting.

---

## Output — Write Into Discovery Doc

Append this section to discovery doc:

```markdown
## Evaluation

**Verdict:** PASS | PASS WITH NOTES | FAIL
**Evaluated:** {date}
**Sources:** {list of KB sources loaded}

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

- **PASS or PASS WITH NOTES** → tell user: "Run `/plan-implementation` to create implementation plan from this evaluated discovery."
- **FAIL** → discuss issues with user in this conversation. Update discovery doc with fixes. Re-evaluate if needed.

---

## Before Finishing

Check TaskList. If any task not `completed`, do not finish — address remaining tasks or explain to user why skipped.
