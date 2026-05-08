# W19-auth — Implementation Plan

> Feature: NextAuth v5 + Google SSO authentication
> Date: 2026-05-08
> Status: Implementation Plan
> Discovery: `W19-auth-discovery.md` (evaluated: PASS WITH NOTES)

---

## Architecture Decisions

1. **All routes protected by default** — `AuthGuard` inside `AuthProvider` wraps all app content. No route-level auth gating. `[patterns/security.md → Auth and Session]`
2. **Client-side session management** — `useSession()` + `SessionProvider` from `next-auth/react`. Server-side `auth()` available for future Server Actions/route handlers. `[patterns/cookies-auth.md → Session Source of Truth]`
3. **JWT session strategy** — no database needed. Tokens in secure HttpOnly cookies (handled by NextAuth). `[patterns/cookies-auth.md → Non-Negotiable Rules]`
4. **LoginForm rendered inline** — `AuthGuard` renders `LoginForm` when unauthenticated. No separate `/login` route. `[patterns/nextjs-app-router.md → Component Boundary Pattern]`
5. **Delete route groups** — `(public)/` and `(protected)/` removed. Pages move to flat `app/` structure. Auth at provider level makes layout-based gating redundant.
6. **Exact port from flow-insights** — proven production code, same company. Minimal adaptation (branding only).

---

## Types

### `app/types/authTypes.ts`

```typescript
import type { DefaultSession } from 'next-auth';

export type UserRole = 'viewer' | 'operator' | 'admin';

export interface AllowedUser {
  readonly email: string;
  readonly role: UserRole;
}

declare module 'next-auth' {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession['user'];
    maxAge: number;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role: UserRole;
  }
}
```

**Imported by:** `auth.ts`, `app/config/authConfig.ts`
**Dependencies:** `next-auth` (module augmentation targets)

### Inline types (no separate file needed)

**`useSessionExpiry.ts`** — internal types, not shared:

```typescript
type SessionExpiryStatus = 'active' | 'warning' | 'expired';

interface SessionExpiryState {
  readonly status: SessionExpiryStatus;
  readonly warningSecondsLeft: number | null;
  readonly totalWarningSeconds: number;
}
```

**`LoginForm.tsx`** — component props, not shared:

```typescript
interface LoginFormProps {
  signedOut?: boolean;
  error?: string | null;
  sessionExpired?: boolean;
}
```

---

## Features

### F1. `app/types/authTypes.ts` — NEW

- **Purpose:** Auth type definitions + NextAuth module augmentation
- **Pattern:** `[repo-structure.md → Types: Zod schemas + TS types]`
- **Exports:** `UserRole`, `AllowedUser`
- **Server/client:** Both (type-only, no runtime)
- **Imports:** `DefaultSession` from `next-auth`

### F2. `app/config/authConfig.ts` — NEW

- **Purpose:** Allowlist of authorized users + role lookup function
- **Pattern:** `[repo-structure.md → Config: app/config/]`
- **Exports:** `ALLOWED_USERS` (readonly array), `getUserRole(email: string): UserRole | null`
- **Server/client:** Server-only (imported by `auth.ts` callbacks)
- **Imports:** `AllowedUser`, `UserRole` from `app/types/authTypes`

```typescript
import type { AllowedUser, UserRole } from '@/app/types/authTypes';

export const ALLOWED_USERS: readonly AllowedUser[] = [
  { email: 'dominik@deblock.com', role: 'admin' },
  { email: 'marcin@deblock.com', role: 'operator' },
  { email: 'mario@deblock.com', role: 'operator' },
  { email: 'guilhem@deblock.com', role: 'operator' },
  { email: 'matias@deblock.com', role: 'operator' },
  { email: 'marcin.blacharski@deblock.com', role: 'operator' },
  { email: 'sergio@deblock.com', role: 'operator' },
  { email: 'bart@deblock.com', role: 'operator' },
  { email: 'sipei@deblock.com', role: 'operator' },
  { email: 'elvis@deblock.com', role: 'operator' },
] as const;

export function getUserRole(email: string): UserRole | null {
  const user = ALLOWED_USERS.find((u) => u.email === email);
  return user?.role ?? null;
}
```

### F3. `auth.ts` (project root) — NEW

- **Purpose:** NextAuth v5 configuration — providers, callbacks, session strategy
- **Pattern:** `[patterns/security.md → Auth and Session]`, `[patterns/cookies-auth.md → Session Source of Truth]`
- **Exports:** `handlers`, `auth`, `signIn`, `signOut`, `SESSION_MAX_AGE`
- **Server/client:** Server-only
- **Imports:** `NextAuth` from `next-auth`, `Google` from `next-auth/providers/google`, `getUserRole` from `@/app/config/authConfig`

```typescript
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { getUserRole } from '@/app/config/authConfig';

export const SESSION_MAX_AGE = 3600;

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { hd: 'deblock.com' } },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email;
      if (!email?.endsWith('@deblock.com')) return false;
      if (!getUserRole(email)) return false;
      return true;
    },
    redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    jwt({ token, profile }) {
      if (profile?.email) {
        token.role = getUserRole(profile.email) ?? 'viewer';
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.maxAge = SESSION_MAX_AGE;
      return session;
    },
  },
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE, updateAge: 0 },
});
```

### F4. `app/api/auth/[...nextauth]/route.ts` — NEW

- **Purpose:** NextAuth catch-all route handler
- **Pattern:** `[patterns/nextjs-app-router.md → Route Handlers: thin re-export]`
- **Exports:** `GET`, `POST` (from handlers)
- **Server/client:** Server-only
- **Imports:** `handlers` from `@/auth`

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

### F5. `app/hooks/useSessionExpiry.ts` — NEW

- **Purpose:** Session expiry monitoring — countdown, warning, auto-extend, offline handling
- **Pattern:** `[patterns/cookies-auth.md → Refresh Strategy]`, `[patterns/testing.md → fake timers for expiry/time-window]`
- **Exports:** `useSessionExpiry`, `SESSION_EXPIRY_CONSTANTS`
- **Server/client:** Client-only (`'use client'`)
- **Imports:** `useSession` from `next-auth/react`
- **Exact port** from flow-insights `app/hooks/useSessionExpiry.ts`

### F6a. `app/components/organisms/LoginForm/LoginForm.tsx` — NEW

- **Purpose:** Google SSO login form with error/expiry/signout states
- **Pattern:** `[repo-structure.md → Organisms: complex feature blocks]`, `[patterns/mui7.md → MUI styling]`
- **Exports:** `LoginForm`
- **Server/client:** Client-only (`'use client'`)
- **Imports:** `signIn` from `next-auth/react`, `LoginFormGoogleIcon` from `./components/LoginFormGoogleIcon`, MUI components (`Button`, `Typography`, `Paper`, `Alert`, `CircularProgress`)
- **Adaptations from flow-insights:**
  - Title: "AI Repo Template" (or project-specific — update per project)
  - Description: "Sign in to continue"
  - Remove `/logo.svg` reference
  - Restriction text: "Restricted to @deblock.com accounts"

### F6b. `app/components/organisms/LoginForm/components/LoginFormGoogleIcon.tsx` — NEW

- **Purpose:** Google brand SVG icon for login button
- **Pattern:** `[repo-structure.md → Organism prefix naming: PascalCase prefix]`
- **Exports:** `LoginFormGoogleIcon`
- **Server/client:** Client-only (used in client component)
- **Imports:** `SvgIcon` from `@mui/material/SvgIcon`

### F6c. `app/components/organisms/LoginForm/index.ts` — NEW

- **Purpose:** Re-export barrel
- **Exports:** `{ LoginForm }` from `./LoginForm`

### F7. `app/providers/AuthProvider.tsx` — NEW

- **Purpose:** Wraps app with `SessionProvider` + `AuthGuard` — all routes protected by default
- **Pattern:** `[patterns/security.md → Auth and Session: fail-closed]`, `[repo-structure.md → Providers: flat file]`
- **Exports:** `AuthProvider`
- **Server/client:** Client-only (`'use client'`)
- **Imports:** `SessionProvider`, `useSession` from `next-auth/react`, `useSessionExpiry` from `@/app/hooks/useSessionExpiry`, `LoginForm` from `@/app/components/organisms/LoginForm`, MUI components (`Snackbar`, `Box`, `CircularProgress`, `Typography`)
- **Exact port** from flow-insights `app/providers/AuthProvider.tsx`

### F8. `app/providers/AppProvider/AppProvider.tsx` — MODIFY

- **Purpose:** Add `AuthProvider` to provider nesting tree
- **Pattern:** `[repo-structure.md → Providers: AppProvider nesting order]`
- **Change:** Add `AuthProvider` wrapping `{children}` (innermost, after DrawerProvider)
- **Imports:** Add `import { AuthProvider } from '@/app/providers/AuthProvider'`

```typescript
<DrawerProvider>
  <AuthProvider>
    {children}
  </AuthProvider>
  <Drawer />
  <Dialog />
</DrawerProvider>
```

### F9. `.env.example` — NEW

- **Purpose:** Document required environment variables
- **Pattern:** `[patterns/security.md → Server/Client Boundary: no secrets in client]`
- **Server/client:** N/A (config)

```
AUTH_URL=http://localhost:3000
AUTH_SECRET=
# AUTH_TRUST_HOST=true
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

### F10. `app/dashboard/page.tsx` — MOVE from `app/(protected)/dashboard/page.tsx`

- **Purpose:** Dashboard page (no longer needs route group)
- **Pattern:** `[patterns/nextjs-app-router.md → Folder Architecture]`
- **Change:** Move file, remove "Protected route" text
- **Server/client:** Server component (default)

### F11. `app/settings/page.tsx` — MOVE from `app/(protected)/settings/page.tsx`

- **Purpose:** Settings page (no longer needs route group)
- **Same as F10**

### F12. Delete files

| File/Dir                             | Reason                            |
| ------------------------------------ | --------------------------------- |
| `app/(public)/layout.tsx`            | Route group removed               |
| `app/(public)/login/page.tsx`        | LoginForm organism replaces this  |
| `app/(protected)/layout.tsx`         | Route group removed               |
| `app/(protected)/dashboard/page.tsx` | Moved to `app/dashboard/page.tsx` |
| `app/(protected)/settings/page.tsx`  | Moved to `app/settings/page.tsx`  |

### F13. `package.json` — MODIFY

- **Change:** Add dependencies

```json
{
  "dependencies": {
    "next-auth": "5.0.0-beta.31"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.2",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "jsdom": "^29.0.2"
  }
}
```

### F14. `docs/repo-structure.md` — MODIFY

- **Changes:**
  - Remove `(public)/` and `(protected)/` from directory overview and Route Groups section
  - Add `AuthProvider` to AppProvider nesting order
  - Add `auth.ts` to root files
  - Add `app/config/` directory
  - Add `LoginForm` organism to components section
  - Update providers section with AuthProvider
  - Replace Route Groups section: "All routes protected by default via AuthProvider. No route groups needed for auth. Use route groups only for layout boundaries if needed in future."

### F15. `docs/app-architecture.md` — MODIFY

- **Changes:**
  - Add auth infrastructure to §8 Infrastructure section
  - Document env vars, Google OAuth, session strategy
  - Add auth flow to System Overview

### F16. `.claude/patterns/nextjs-app-router.md` — MODIFY

- **Purpose:** Update to reflect AuthProvider-based auth instead of route groups
- **Changes:**
  - Route Groups section: remove `(public)`, `(protected)` as auth mechanism. Route groups available for layout boundaries only, not auth gating.
  - Add note: "Auth enforced at provider level (`AuthProvider`). All routes protected by default. Route groups optional for differing layout shells."
  - Data Loading Pattern: add note about fetching auth-dependent data after `useSession()` confirms authenticated status

### F17. `.claude/patterns/cookies-auth.md` — MODIFY

- **Purpose:** Align with NextAuth v5 JWT pattern (currently describes generic cookie auth)
- **Changes:**
  - Add NextAuth v5 section: JWT strategy, `SessionProvider` + `useSession()`, `auth()` for server-side
  - Session Source of Truth: server = NextAuth JWT in HttpOnly cookie, client = `useSession()` derived state
  - Refresh Strategy: `SessionProvider refetchInterval={300}` + `session.update()` on user activity (debounced)
  - Keep existing rules (they still apply — NextAuth handles cookie security internally)
  - Add note: "NextAuth v5 manages cookie security (HttpOnly, Secure, SameSite) automatically. Do not set auth cookies manually."

### F18. `.claude/patterns/security.md` — MODIFY

- **Purpose:** Reference AuthProvider pattern for auth enforcement
- **Changes:**
  - Auth and Session section: add "Auth enforced via `AuthProvider` wrapping all app content. `AuthGuard` renders `LoginForm` when unauthenticated. All routes protected by default."
  - Add note about Server Actions: "Client-side `AuthGuard` protects UI only. Server Actions and API route handlers must call `auth()` from `@/auth` to verify session server-side."
  - Keep existing CSRF rules (NextAuth v5 handles CSRF for its own routes)

---

## Tests

### T1. `app/config/__tests__/authConfig.test.ts` — NEW

- **What to test:** `getUserRole` returns correct role for each allowlisted email, `null` for unknown, `null` for non-deblock domain
- **Pattern:** Unit test `[patterns/testing.md → Unit tests: pure utilities]`
- **Mocking:** None — pure function
- **Port from:** flow-insights `app/config/__tests__/authConfig.test.ts`

### T2. `app/hooks/__tests__/useSessionExpiry.test.ts` — NEW

- **What to test:**
  - Returns `active` when session valid and far from expiry
  - Returns `warning` with countdown when within 30s of expiry
  - Returns `expired` when past expiry (minus skew)
  - Activity events trigger session `update()` (debounced)
  - Offline pauses expiry checks
  - Focus/visibility triggers re-check
- **Pattern:** Integration test (hook) `[patterns/testing.md → fake timers for expiry/refresh/time-window]`
- **Mocking:** `next-auth/react` (`useSession` mock), `vi.useFakeTimers()`
- **Env:** `// @vitest-environment jsdom`
- **Port from:** flow-insights `app/hooks/__tests__/useSessionExpiry.test.ts`

### T3. `app/components/organisms/LoginForm/__tests__/LoginForm.test.tsx` — NEW

- **What to test:**
  - Renders sign-in button
  - Shows loading spinner on click
  - Calls `signIn('google')` with callback URL
  - Shows "Session expired" alert when `sessionExpired` prop true
  - Shows "signed out" alert when `signedOut` prop true
  - Shows error message for each error type (AccessDenied, Configuration, etc.)
- **Pattern:** Component render test `[patterns/testing.md → Integration tests: components with controlled mocks]`
- **Mocking:** `next-auth/react` (`signIn` mock), MUI components (lightweight mocks)
- **Env:** `// @vitest-environment jsdom`
- **Port from:** flow-insights `app/login/__tests__/LoginForm.test.tsx`

### T4. `__tests__/auth.test.ts` — NEW

- **What to test:**
  - `SESSION_MAX_AGE` is 3600
  - `signIn` callback rejects non-deblock emails
  - `signIn` callback rejects deblock emails not in allowlist
  - `signIn` callback accepts allowlisted emails
  - `jwt` callback injects role from allowlist
  - `session` callback exposes role and maxAge
  - `redirect` callback prevents open redirect
- **Pattern:** Unit test `[patterns/testing.md → Unit tests: pure utilities]`
- **Mocking:** NextAuth internals (mock callback args)
- **Port from:** flow-insights `__tests__/auth.test.ts`

### Not tested (with reason)

| File                                        | Reason                                                                                                                            |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `app/types/authTypes.ts`                    | Types-only, no runtime behavior                                                                                                   |
| `app/api/auth/[...nextauth]/route.ts`       | Thin re-export, no logic                                                                                                          |
| `.env.example`                              | Config template                                                                                                                   |
| `app/providers/AuthProvider.tsx`            | Integration behavior tested via `useSessionExpiry` + `LoginForm` tests. Full AuthGuard integration would need e2e (out of scope). |
| `app/providers/AppProvider/AppProvider.tsx` | Provider nesting — structural, tested via app rendering                                                                           |

---

## Dependency Order

```
1. package.json          — install next-auth + testing deps (yarn install)
2. app/types/authTypes.ts — types first (everything depends on these)
3. app/config/authConfig.ts — depends on types
4. auth.ts               — depends on config + types
5. app/api/auth/[...nextauth]/route.ts — depends on auth.ts
6. app/hooks/useSessionExpiry.ts — depends on next-auth/react
7. app/login/LoginForm.tsx — depends on next-auth/react + MUI
8. app/providers/AuthProvider.tsx — depends on hooks + LoginForm + next-auth/react
9. app/providers/AppProvider/AppProvider.tsx — add AuthProvider import
10. .env.example          — config (no code deps)
11. DELETE: app/(public)/ and app/(protected)/ — after AuthProvider working
12. MOVE: dashboard + settings pages to app/
13. UPDATE: docs/repo-structure.md
14. UPDATE: docs/app-architecture.md
15. Tests (T1-T4)         — after all source files exist
```

**Wave structure (parallelizable):**

- **Wave 1:** F13 (package.json + install)
- **Wave 2:** F1 (types)
- **Wave 3:** F2 (config), F9 (.env.example) — parallel
- **Wave 4:** F3 (auth.ts)
- **Wave 5:** F4 (route), F5 (hook), F6a-F6c (LoginForm organism) — parallel
- **Wave 6:** F7 (AuthProvider)
- **Wave 7:** F8 (AppProvider modify)
- **Wave 8:** F12 (delete route groups), F10 + F11 (move pages) — parallel
- **Wave 9:** F14 + F15 + F16 + F17 + F18 (docs + patterns) — parallel
- **Wave 10:** T1-T4 (all tests) — parallel

---

## Edge Cases and Error Handling

| Component          | Edge case                              | Handling                                                                     |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------------- |
| `auth.ts signIn`   | Email missing from profile             | `!email?.endsWith(...)` returns false                                        |
| `auth.ts signIn`   | Email not in allowlist                 | `!getUserRole(email)` returns false → AccessDenied                           |
| `auth.ts redirect` | Open redirect attempt                  | `url.startsWith(baseUrl)` check → fallback to baseUrl                        |
| `auth.ts jwt`      | Profile email null on subsequent calls | `if (profile?.email)` guard — role already in token                          |
| `AuthGuard`        | Initial load flash                     | `sessionStatus === 'loading' && !initializedRef.current` → render nothing    |
| `AuthGuard`        | Cross-tab signout                      | `wasAuthenticatedRef` tracks if was ever authed → shows "signed out" message |
| `useSessionExpiry` | Tab goes offline                       | `isOfflineRef` pauses state changes until online                             |
| `useSessionExpiry` | Tab wakes from sleep                   | Focus/visibility handlers re-check expiry                                    |
| `useSessionExpiry` | Rapid activity events                  | 60s debounce on `session.update()`                                           |
| `LoginForm`        | Loading state stuck                    | Button disabled + spinner during `signIn()` call                             |

---

## External Dependencies

| Dependency               | Type       | Notes                                                                     |
| ------------------------ | ---------- | ------------------------------------------------------------------------- |
| Google OAuth credentials | Env config | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — obtain from Google Cloud Console |
| `AUTH_SECRET`            | Env config | Generate with `npx auth secret`                                           |
| Google Cloud Console     | Setup      | OAuth consent screen + authorized redirect URIs for `localhost:3000`      |
| No backend API changes   | —          | Auth is self-contained (NextAuth + Google OAuth)                          |

---

## Evaluation

**Verdict:** PASS WITH NOTES
**Evaluated:** 2026-05-08
**Sources:** plan-eval.md, architecture-eval.md, repo-structure.md, patterns/security.md, patterns/cookies-auth.md, patterns/nextjs-app-router.md, patterns/testing.md, REFERENCE.md, web search (2 queries)

### KB Findings

- [NOTE] File placement — `LoginForm` moved to `app/components/organisms/LoginForm/` with organism prefix naming (`LoginFormGoogleIcon.tsx`). Fixed post-evaluation to follow atomic design. `[repo-structure.md — Components: Atomic Design]`
- [NOTE] File size — `useSessionExpiry.ts` is ~300 lines in source, exceeds 200-line guideline. Acceptable: single cohesive hook, splitting would create artificial separation. Proven production code. `[plan-eval.md → atomic files: SRP]`

All other 16 KB/pattern criteria passed.

### Web Search Insights

- [WARNS] Auth.js (next-auth v5) in security-patch mode — as of Sep 2025, Better Auth team took over maintenance. Auth.js maintainers steering new projects to Better Auth. Not blocking for this port: flow-insights runs this version in production, and we're porting proven code, not choosing a new library. Future migration to Better Auth or stable next-auth release is separate concern. `[web: blog.logrocket.com — "I tested every major auth library for Next.js in 2026"]`
- [WARNS] Peer dependency warning — `next-auth@5.0.0-beta.31` with Next.js 16 may report peer dep error during install. Use `--legacy-peer-deps` or verify compatible. Flow-insights on Next.js 16.1.7 works fine, suggesting this is npm metadata issue not actual incompatibility. `[web: github.com/nextauthjs/next-auth/issues/13302 — Next.js 16 compatibility]`

### Web Search Queries Executed

- "next-auth stable release v5 2026 npm" → 10 results reviewed → 0 confirms, 2 warns, 0 suggests
- "next-auth npm versions 5.0 stable 2025 2026" → 10 results reviewed → 0 confirms, 1 warns, 0 suggests
