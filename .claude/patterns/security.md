# Security Guide

## Purpose

Define mandatory security defaults for the web application (frontend + App Router backend-for-frontend).

## Security Baseline

- Assume browser runtime is untrusted.
- Keep secrets and trust decisions server-side.
- Prefer fail-closed behavior for auth/session/CSRF checks.

## Mandatory Controls

### Auth and Session

- Auth enforced via `AuthProvider` wrapping all app content. `AuthGuard` renders `LoginForm` when unauthenticated. All routes protected by default.
- Token material in secure HttpOnly cookies only (NextAuth manages automatically).
- Client-side `AuthGuard` protects UI only. Server Actions and API route handlers must call `auth()` from `@/auth` to verify session server-side.
- Validate auth per protected route and subscription endpoint.
- Rotate/refresh tokens server-side; clear compromised state on failures.

### CSRF

- Enforce CSRF validation for all state-changing operations (POST/PUT/PATCH/DELETE).
- Require cookie+header match with signature validation.
- Reject on missing/mismatch/expired/bad signature.

### Server/Client Boundary

- No secrets in client bundles, serialized props, or frontend logs.
- Access `cookies()`, `headers()`, env secrets only in server contexts.
- Keep cryptographic private keys server-only.

### Data Handling

- Sanitize outbound request bodies and untrusted input.
- Avoid leaking raw backend/internal errors to users.
- Restrict logs: no tokens, no private keys, no full PII payload dumps.

## Security Code Review Checklist

- Are tokens ever returned to client payloads?
- Are mutating routes protected by CSRF?
- Are server-only helpers accidentally imported into client files?
- Do logs contain any secret material?
- Are unauthorized accesses rejected deterministically?

## Regression Test Checklist

- CSRF mismatch rejects requests.
- Missing auth cookies reject protected operations.
- Refresh failure forces safe logout path.
- Unauthorized endpoints return forbidden.
