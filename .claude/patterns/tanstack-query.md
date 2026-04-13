# TanStack Query Guide

## Purpose

Keep server state predictable, typed, and synchronized across UI flows.

## Query Key Design

- Use stable keys with deterministic ordering.
- Include all effective parameters in keys.
- Export key builders per feature for reuse.
- Avoid ad-hoc string keys sprinkled across components.

## Query vs Mutation Responsibilities

- `useQuery` / `useInfiniteQuery`: reads.
- `useMutation`: writes and side effects.
- Keep write operations in service layer and keep hooks thin.

## Retry and Freshness

- Configure retry policy per endpoint risk:
  - Critical auth/security endpoints: low retries, explicit handling
  - Idempotent reads: moderate retries acceptable
- Tune `staleTime` and `gcTime` intentionally; do not rely on defaults blindly.
- Disable `refetchOnWindowFocus` when it causes noisy UX for stable data.

## Invalidation Strategy

- Invalidate narrowly using feature-level key prefixes.
- Prefer targeted invalidation after successful mutation.
- Avoid `queryClient.clear()` except for auth logout or hard reset scenarios.

## Error Model

- Normalize backend errors into typed frontend errors.
- Throw domain-specific errors in services used by query hooks.
- Keep UI mapping of error types to messages consistent.

## Performance

- Avoid unnecessary `useEffect` refetch loops.
- Use optimistic updates only when rollback logic is clear.
- Keep heavy transforms inside `select` or service layer, not render paths.

## Security-Sensitive Queries

- Never include auth tokens in query keys.
- Do not cache secret payloads in client state.

## Testing Checklist

- Key builder returns stable keys for same params.
- Mutation triggers expected invalidations.
- Error handling branch tested for mapped domain errors.
- Cache reset on logout is covered.
