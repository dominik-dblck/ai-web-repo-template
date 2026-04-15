# Tests Evaluation Checklist

Validation criteria for unit test quality and coverage. Loaded by validation subagents during the TEST phase.

## MANDATORY FIRST ACTION — CREATE TASKS NOW

Before validating, create a task for EACH criterion using TaskCreate:

1. "Check: every test file runs successfully"
2. "Check: run coverage, report uncovered lines"
3. "Check: happy path tested for every public function/component"
4. "Check: edge cases (empty, null, boundary, error states)"
5. "Check: no internal mocking"
6. "Check: assertions are specific (exact values)"
7. "Check: async operations properly awaited"
8. "Check: no test.skip/test.todo without comment"
9. "Check: component tests — user-visible behavior"
10. "Check: follows .claude/patterns/testing.md"
11. "Check: verify everything from implementation is covered"
12. "Check: report coverage gaps to user"

If TaskCreate is unavailable, write the task list as a markdown checklist in your first message instead.

Mark each task `in_progress` when checking, `completed` when verified. Cite source for each: `[tests-eval.md → {criterion}]`.

---

## Criteria

- Every test file runs successfully (`yarn test {file}`)
- Run coverage for created test files — report uncovered lines
- Happy path tested for every public function/component
- Edge cases: empty inputs, null/undefined, boundary values, error states
- No internal mocking (don't mock the module under test)
- Assertions are specific (check exact values, not just "doesn't throw")
- Async operations properly awaited
- No `test.skip` or `test.todo` without a comment
- Component tests: test user-visible behavior, not implementation details
- Follows `.claude/patterns/testing.md`
- Agent goes through each test and verifies everything from the implementation is covered
- If coverage gaps found: report to user, iterate if needed (human decides)
