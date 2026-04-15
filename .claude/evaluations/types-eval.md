# Types Evaluation Checklist

Validation criteria for type safety and schema correctness. Loaded by validation subagents during the TYPES and TEST phases.

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before validating, create a task for EACH criterion using TaskCreate:

1. "Check: no `any` type anywhere"
2. "Check: no type casting unless justified"
3. "Check: no @ts-ignore or @ts-expect-error"
4. "Check: all params and return types explicitly typed"
5. "Check: Zod schemas for all external data"
6. "Check: types inferred from Zod (z.infer)"
7. "Check: no optional where always present"
8. "Check: union types over boolean flags"
9. "Check: enums as const objects or Zod enums"
10. "Check: yarn tsc — zero errors"

If TaskCreate is unavailable, write the task list as a markdown checklist in your first message instead.

Mark each task `in_progress` when checking, `completed` when verified. Cite source for each: `[types-eval.md → {criterion}]`.

---

## Criteria

- No `any` type anywhere
- No type casting (`as`, `<Type>`) unless explicitly justified with a comment
- No `@ts-ignore` or `@ts-expect-error`
- All function parameters and return types explicitly typed
- Zod schemas defined for all external data (API responses, form inputs)
- TS types inferred from Zod (`z.infer<>`) — no duplicate manual types
- No optional properties (`?`) where the value is always present
- Union types over boolean flags where applicable
- Enums as `const` objects or Zod enums, not TS `enum`
- `yarn tsc` — zero errors
