# Types Evaluation Checklist

Validation criteria for type safety and schema correctness. Loaded by validation subagents during the TYPES and TEST phases.

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before validating, create a task for EACH criterion using TaskCreate:

1. "Check: no `any` type anywhere"
2. "Check: no type casting unless justified"
3. "Check: no @ts-ignore or @ts-expect-error"
4. "Check: all params and return types explicitly typed"
5. "Check: no optional where always present"
6. "Check: union types over boolean flags"
7. "Check: no bare string/number when narrower type exists"
8. "Check: discriminated unions over optional fields"
9. "Check: readonly where data is immutable"
10. "Check: Record<SpecificKey> not Record<string> when keys known"
11. "Check: yarn tsc — zero errors"

If TaskCreate is unavailable, write the task list as a markdown checklist in your first message instead.

Mark each task `in_progress` when checking, `completed` when verified. Cite source for each: `[types-eval.md → {criterion}]`.

---

## Criteria

- No `any` type anywhere
- No type casting (`as`, `<Type>`) unless explicitly justified with a comment
- No `@ts-ignore` or `@ts-expect-error`
- All function parameters and return types explicitly typed
- No optional properties (`?`) where the value is always present
- Union types over boolean flags where applicable
- No bare `string` or `number` when a narrower type exists — use string literals, unions, or branded types
- Discriminated unions over optional fields — `{ type: 'error'; message: string } | { type: 'success'; data: T }` not `{ type?: string; data?: T }`
- `readonly` where data should not be mutated
- `Record<SpecificKey, Value>` not `Record<string, Value>` when keys are known
- `yarn tsc` — zero errors
