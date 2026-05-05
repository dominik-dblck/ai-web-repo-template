# Architecture Evaluation Checklist

Validation criteria for structural correctness and convention adherence. Loaded by validation subagents during architecture review.

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before validating, create a task for EACH criterion using TaskCreate:

1. "Check: file placement follows repo-structure.md"
2. "Check: naming follows organism prefix convention"
3. "Check: services — single async function per file"
4. "Check: API routes — two-file pattern"
5. "Check: constants split — frontend vs backend"
6. "Check: types defined before implementation"
7. "Check: no circular dependencies"
8. "Check: server/client boundary respected"
9. "Check: follows relevant .claude/patterns/"
10. "Check: validates against knowledge base where applicable"
11. "Check: DB migrations in migrateSchema.ts — not standalone SQL files"

If TaskCreate is unavailable, write the task list as a markdown checklist in your first message instead.

Mark each task `in_progress` when checking, `completed` when verified. Cite source for each: `[architecture-eval.md → {criterion}]`.

---

## Criteria

- File placement follows `docs/repo-structure.md`
- Naming follows organism prefix convention (where applicable)
- Services: single async function per file (`{verb}{Noun}Service.ts`)
- API routes: two-file pattern (`route.ts` + `{action}Route.ts`)
- Constants split: frontend vs backend
- Types defined before implementation
- No circular dependencies
- Server/client boundary respected
- Follows relevant `.claude/patterns/` for touched layers
- Where applicable: validates against knowledge base (loaded selectively from `knowledge/`)
- DB migrations: added to `scripts/tooling/migrateSchema.ts` SCHEMA_SQL string — never standalone SQL files in `scripts/migrations/`. Pattern: idempotent `DO $$ BEGIN ... IF NOT EXISTS ... END $$;` blocks
