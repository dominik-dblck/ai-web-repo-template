# Cookie-Based Authentication Guide

## Purpose

Standardize authentication around secure cookies and server-side session truth.

## NextAuth v5 Implementation

This project uses NextAuth v5 with JWT strategy and Google SSO:

- **Config:** `auth.ts` at project root — exports `handlers`, `auth`, `signIn`, `signOut`
- **Session strategy:** JWT in HttpOnly cookie (managed by NextAuth automatically)
- **Client-side:** `SessionProvider` + `useSession()` from `next-auth/react`
- **Server-side:** `auth()` from `@/auth` for Server Actions and route handlers
- **Refresh:** `SessionProvider refetchInterval={300}` + `session.update()` on user activity (debounced 60s)
- **Cookie security:** NextAuth v5 manages HttpOnly, Secure, SameSite automatically — do not set auth cookies manually

## Non-Negotiable Rules

- Store auth and refresh tokens only in secure, HttpOnly cookies.
- Never expose tokens in API payloads sent to browser code.
- Never persist tokens in `localStorage` or `sessionStorage`.
- Treat invalid session metadata as compromised state and fail closed.

## Session Source of Truth

- Server verifies cookie tokens and session state.
- Client can cache only derived values (e.g., expiry timestamp) for UX scheduling.
- Client-side derived state must be validated and self-healing from server checks.

## Refresh Strategy

- Refresh before expiry using a safe margin.
- Use single-flight and cross-tab lock to prevent refresh stampedes.
- On invalid refresh response, force logout and clear local derived auth metadata.

## CSRF Protection

- For mutating routes (POST/PUT/PATCH/DELETE), validate double-submit token:
  - Signed CSRF cookie
  - Matching CSRF header
- Reject missing/mismatch/invalid signature with 403.

## Cookie Hygiene

- Clear stale auth-related cookies at flow start when appropriate.
- Separate flow-scoped cookies from long-lived auth cookies.
- Apply proper attributes: `Secure`, `HttpOnly`, `SameSite`, `Path`, controlled max-age.

## API Boundary Rules

- Frontend receives only minimal auth state (`isAuth`, expiry info if required).
- Challenge tokens stay cookie-bound and server-handled.
- Reject unauthorized API/SSE/WS subscriptions early (403).

## Testing Checklist

- Missing cookies → unauthorized response.
- Invalid/mismatched CSRF → 403.
- Expired/invalid token → logout path triggered.
- Multi-tab refresh lock prevents duplicate refresh requests.
- Sensitive tokens never appear in client payload/log output.
