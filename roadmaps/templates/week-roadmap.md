# Week Roadmap — {ISO week} ({date range})

> Created: {date} | Owner: {name} | Status: 🟢 **active**
> **Goal**: {one sentence — what must be true by Friday}
>
> **Rule: one week only.** Covers Mon-Fri this ISO week. Anything not starting this week stays in `roadmaps/backlog.md`.
>
> **Status lifecycle:** 🟢 `active` → ✅ `completed` → 📦 `archived`. Next week starts, this becomes read-only.

---

## Current State

{3-5 bullets: what works, what broken, key numbers/metrics}

---

## Dependencies

| Blocker        | Blocks            | Resolution         |
| -------------- | ----------------- | ------------------ |
| {prerequisite} | {dependent tasks} | {unlock condition} |

---

## Task Stack

> Status: ⬜ `planned` → 🔵 `in-progress` → ✅ `done` → ⏸️ `deferred` (→ backlog with reason)
> Priority = row order. P0 first, P1 next.

### P0 — {LABEL}

| #      | Task   | Status | Why                                 | Gate            | Est    | Depends | Plan                            |
| ------ | ------ | ------ | ----------------------------------- | --------------- | ------ | ------- | ------------------------------- |
| {code} | {name} | ⬜     | {1-liner: what broke / what metric} | {done criteria} | {time} | —       | [Plan](plans/{week}-{feature}/) |
| {code} | {name} | ⬜     | {1-liner}                           | {done criteria} | {time} | {code}  | —                               |

### P1 — {LABEL}

| #      | Task   | Status | Why       | Gate            | Est    | Depends | Plan |
| ------ | ------ | ------ | --------- | --------------- | ------ | ------- | ---- |
| {code} | {name} | ⬜     | {1-liner} | {done criteria} | {time} | —       | —    |

### P2 — BACKLOG CANDIDATES

> See `roadmaps/backlog.md`. Pull into this week only if P0-P1 finish early.

---

## Risks

| Risk                  | Mitigation   | Escalation    |
| --------------------- | ------------ | ------------- |
| {what could go wrong} | {what to do} | {who decides} |

---

## Friday Retrospective

> Fill end of week.

**Did we hit Goal?** {yes/no — one sentence}

| Feature   | Status                    | Gate passed?   |
| --------- | ------------------------- | -------------- |
| {feature} | done / partial / deferred | yes / no / n/a |

**What changed from plan:** {what added, dropped, or re-prioritized and why}

**Key learnings:** → `{week}-learnings.md`

---

## Execution Structure

```
roadmaps/{ISO-week}/
├── {week}-week-roadmap.md              ← this file
├── {week}-learnings.md
│
└── plans/
    └── {week}-{feature-name}/
        ├── {week}-{feature-name}-orchestration.md
        └── tasks/
            ├── {week}-{feature-name}-discovery.md
            └── {week}-{feature-name}-implementation.md
```
