# Testing Guide (Vitest)

## Purpose

Ensure confidence for web flows with fast unit/integration tests and high-signal coverage.

## Test Pyramid

- Unit tests: pure utilities, mappers, validators.
- Integration tests (Vitest + RTL): components/hooks/services with controlled mocks.
- e2e tests (Playwright): critical cross-boundary flows (auth, checkout, key user journeys).

## Vitest Rules

- Follow AAA (Arrange, Act, Assert).
- Test behavior, not internal implementation details.
- Mock network and external dependencies deterministically.
- Use fake timers for expiry/refresh/time-window logic.
- Cover error branches explicitly (401/403/429/500).
- Import and test real functions — never copy logic into tests.

## Query and State Tests

- Verify query key stability and invalidation behavior.
- Test mutation success/error transitions.
- Ensure logout or session invalidation clears relevant caches.

## Test Legitimacy

Every test must pass these checks:

- **No copies of production logic** — tests import and call the real function
- **No hardcoded pass values** — assertions test actual behavior
- **Edge cases covered** — empty arrays, null inputs, boundary conditions
- **Tests can fail** — verify each test actually fails when the condition is broken

## e2e Coverage

- Unauthorized access to protected endpoints must fail.
- Authorized context with proper credentials must pass.
- Cover critical user flows end-to-end.

## CI Expectations

- Fast suite runs on every PR.
- Critical e2e smoke runs on protected branches.
- Flaky tests are triaged immediately (do not mute failures indefinitely).
