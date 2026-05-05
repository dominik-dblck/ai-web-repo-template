---
name: brainstorm
description: Structured divergent thinking — explores multiple approaches before committing. Options matrix + trade-off analysis in chat. Multi-round iteration until user consensus. No doc output — decision stays in conversation for /plan-discovery to read.
---

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before reading ANYTHING below, create tasks using TaskCreate:

1. "Read architect context — problem classification, constraints, suggested angles"
2. "Frame problem — restate, verify with user, gather constraints"
3. "Generate options — min 3 incl 'do nothing', present trade-off matrix"
4. "Iterate until consensus — user picks, refines, or defers"
5. "HANDOFF → user runs /plan-discovery"

Chain tasks sequentially with `addBlockedBy` — each blocked by previous.

Task 4 ("iterate") stays `in_progress` through multiple rounds. Only mark `completed` when user signals consensus.

If TaskCreate unavailable, write task list as markdown checklist in first message.

If tasks not created, STOP. Go back. Create them.

Mark each task `in_progress` when begun. Mark `completed` when done.

---

## Purpose

Explore multiple approaches before committing. Options matrix, trade-off analysis, rationale for chosen approach — all in conversation. No doc created — `/plan-discovery` reads decision from chat context directly.

**Divergent thinking phase** — goal: widen option space, not narrow. Narrowing happens at consensus.

**User-provided context:** $ARGUMENTS

Expected arguments: `<feature-name> [hint-about-scope]`

**Pipeline position:**

```
/architect → [YOU ARE HERE] → /plan-discovery → /architect-evaluate-discovery → ...
```

---

## When to Skip

Skip `/brainstorm`, go straight to `/plan-discovery` when:

- **Approach obvious** — bug fix, small enhancement, well-precedented pattern
- **Single viable option** — no real alternatives
- **User already decided** — needs execution, not exploration

---

## What to Load

1. **Conversation context** — architect's problem classification, constraints, KB domains
2. **KNOWLEDGE-INDEX.md** — on-demand only, when comparing options against known patterns
   - Load from `.claude/skills/architect/KNOWLEDGE-INDEX.md`
   - Agentic search: scan headings → deepen with keywords + synonyms → explore related → verify coverage `[S02E01 §3]`
3. **Web search** — on-demand only, when comparing external approaches/libs/patterns
   - Use ToolSearch to load WebSearch tool when needed

Do NOT preload KB or web results. Simple decisions may not need either.

---

## Core Behaviors — Anti-Drift Instructions

Non-negotiable. Prevent most common brainstorming failures.

### Guardrail: Ask before proposing

Do NOT propose solutions before understanding problem. First response after reading architect context must be **questions**, not options. Probe:

- What real problem? (not symptom)
- What constraints? (time, scope, tech debt tolerance, team context)
- What tried before?
- What success look like?

`[S02E05 §2 — Guardrail instruction type: boundaries and fallback behaviors]`

### Principle: Honest evaluation

Weak options identified early save wasted exploration. If option has fatal flaw, say so directly. "All options look good" never true — find real trade-offs.

`[S02E05 §2 — Principle instruction type: reasoning behind the rule]`

### Action: Challenge assumptions

For each option, state what breaks if core assumption wrong. Format: "This assumes X. If X false, option fails because Y."

`[S02E05 §2 — Action instruction type: concrete behavior expected]`

### Action: Devil's advocate (DoT mitigation)

Argue FOR weakest option first. Present strongest possible case before moving to stronger options. Prevents Degeneration-of-Thought — tendency to lock onto first confident position, never genuinely reconsider alternatives.

`[S03E05 §1 — Behavior-shaping L2 Cognitive Patterns: self-questioning, gap recognition]`

### Reference: Multi-angle evaluation

Evaluate each option across: feasibility, effort, risk, maintainability, skip-ability. Use comparison table. Never evaluate in prose paragraphs — tables force parallel comparison.

`[S02E05 §2 — Reference instruction type: pointer to evaluation dimensions]`

### Action: Re-anchor each round (drift mitigation)

Start of each new round after user feedback, restate:

1. Problem (one sentence)
2. All **active** options with labels (A/B/C)
3. What changed since last round

When user eliminates option, **remove it** from subsequent summaries. Keep only active options + brief tombstone ("Option B dropped — {reason}"). Reduces context noise, prevents multi-turn drift.

`[S02E01 §2 — Signal vs Noise: maintain high signal by removing noise]`

---

## Step 1 — Frame Problem

1. Read architect context from conversation (problem classification, constraints, suggested angles)
2. Restate problem in own words — one paragraph max
3. Ask user to confirm or correct understanding
4. Gather constraints: time, scope, tech debt tolerance, team context

Do NOT generate options yet. Understanding first, options second.

---

## Step 2 — Generate Options

1. Generate at least 3 options, always including "do nothing" / "status quo"
2. Draw from multiple sources:
   - Direct approaches (obvious solution)
   - Alternative architectures (different trade-off profile)
   - "Do nothing" / minimal viable alternative
   - KB-informed options (load KNOWLEDGE-INDEX.md if relevant patterns exist)
   - Web-informed options (search if comparing external approaches)
3. **Present ALL options BEFORE evaluating ANY** — prevent premature commitment
4. Build trade-off matrix with consistent criteria across all options

---

## Step 3 — Evaluate and Iterate

1. Present trade-off matrix (table format, always)
2. For each option: state core assumption and what breaks if wrong
3. Argue FOR weakest option first (DoT mitigation)
4. Ask user: which options resonate? which to drop? new angles?
5. **Re-anchor** at start of each new round (see Core Behaviors)
6. Repeat until user signals consensus

Consensus signals: "go with A", "decided", "let's do X", "consensus", or similar.

No consensus after 5+ rounds: explicitly summarize all evolution, ask user to converge or defer.

---

## Step 4 — Summarize Decision in Chat

When consensus reached, post clear decision summary in conversation:

1. **Chosen option** — name + one-line description
2. **Why** — core rationale
3. **Why not others** — one line per rejected option
4. **Open questions** — for discovery phase

No doc created. This summary stays in conversation context — `/plan-discovery` reads it directly.

---

## Step 5 — Handoff

Tell user:

> Decision reached: {Option X — short description}.
> Next step: run `/plan-discovery` to explore codebase within decided approach.

---

## Before Finishing

Check TaskList. If any task not `completed`, do not finish — address remaining tasks or explain to user why skipped.
