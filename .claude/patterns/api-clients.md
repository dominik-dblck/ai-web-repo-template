# API Clients Guide

## Purpose

Provide a consistent HTTP client layer for App Router + React client usage.

## Layering

- `services/`: frontend-facing service functions with typed outputs/errors.
- Route handlers (`app/api/`): server-side proxy/guard layer for cookie-authenticated backend calls.

## Service Naming

- Use purpose-driven names: `{verb}{Noun}Service.ts` (e.g., `loginService.ts`, `getUserDataService.ts`).
- Avoid generic names: never `apiService.ts`, `clientService.ts`, `service.ts`.
- Service names must clearly indicate what they do and what entity they operate on.

## Client-Side Service Rules

- Expose typed request/response contracts.
- Convert transport errors to domain errors with clear status context.
- Keep authentication implicit via cookies rather than explicit token plumbing in UI code.
- Never return secret headers/tokens to caller.

## Server-Side Route Rules

- Use `route.ts` (thin re-export) + `{action}Route.ts` (handler) pattern.
- Validate auth from cookies before calling backend.
- Add backend auth headers server-side only.
- Normalize backend errors into stable frontend-safe response shape.
- Separate `frontendApiConstants.ts` (browser→API) from `backendApiConstants.ts` (API→external).

## Security Constraints

- No token persistence in browser storage.
- No private keys in client code or serialized payloads.
- Never leak internal error details in user-facing responses.

## Testing Checklist

- Services map known backend errors to expected domain errors.
- Route handlers reject unauthenticated calls.
- Sensitive data does not appear in responses.
