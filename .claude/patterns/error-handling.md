# Error Handling Guide

## Purpose

Define consistent error handling patterns including error boundaries, service-level error mapping, and user-facing error states.

## Error Handling Layers

- **Service layer**: Map backend errors to typed domain errors
- **Component layer**: Handle errors gracefully with user-friendly messages
- **Error boundaries**: Catch React rendering errors and prevent app crashes
- **Route handlers**: Normalize backend errors into safe frontend responses

---

## Service-Level Error Handling

### Typed Error Classes

Create domain-specific error classes for consistent error handling:

```typescript
export class ServiceError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ServiceError';
    this.status = status;
  }
}
```

### Rules

- Never expose raw backend error messages to users
- Map HTTP status codes to user-friendly messages
- Include error codes for programmatic handling (e.g., rate limiting)
- Log detailed errors server-side, return safe messages to client

---

## Component-Level Error Handling

### Mutation Error Handling

Handle errors in TanStack Query mutations:

```typescript
const { mutate, error, isError } = useMutation({
  mutationFn: submitService,
  onError: (error) => {
    // Show notification or handle gracefully
  },
});
```

### Query Error Handling

Handle errors in queries with fallback UI:

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: false,
});

if (isError) {
  return <ErrorFallback error={error} />;
}
```

---

## Error Boundaries

### Placement Strategy

- **Feature-level boundaries**: Wrap complex organism components
- **Page-level boundaries**: Use Next.js `error.tsx` for route-level errors
- **Global boundary**: Use `global-error.tsx` for app-wide fallback

### Best Practices

- Reset error boundary state after handling (prevent stuck error state)
- Provide actionable fallback UI (retry button, contact support)
- Log errors for debugging but don't expose internals to users

---

## Route Handler Error Handling

### Normalization Pattern

```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  return NextResponse.json(
    { error: errorData.message || 'Request failed' },
    { status: response.status },
  );
}
```

### Special Status Handling

Handle special HTTP statuses explicitly:

- **401 (Unauthorized)**: Clear auth state, return logout response
- **403 (Forbidden)**: Return safe error message
- **429 (Too Many Requests)**: Return rate limit message with retry guidance

---

## Error Message Guidelines

- Be specific but not technical (avoid stack traces, internal codes)
- Provide actionable guidance when possible ("Please try again in 10 minutes")
- Use consistent severity levels: `error`, `warning`, `info`
- Include retry mechanisms for transient errors

---

## Testing Checklist

- Service errors map to expected domain errors
- Error boundaries catch and display fallback UI
- Route handlers return safe error responses
- Retry mechanisms work for transient errors
