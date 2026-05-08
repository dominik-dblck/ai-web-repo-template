# W19-auth — Orchestration

> Feature: NextAuth v5 + Google SSO authentication
> Plan: `tasks/W19-auth-implementation.md` (evaluated: PASS WITH NOTES)
> Source: Port from `/Users/Dominik Piszczkiewicz/projects/flow-insights/`

---

## Steps

- [x] **Step 1: Install dependencies** — add next-auth + testing libs to package.json, run install
  - Files: `package.json`
  - Depends on: —
  - Verify: `yarn install` succeeds (use `--legacy-peer-deps` if peer dep warning for Next.js 16)
  - Tests: N/A — dependency installation only

- [x] **Step 2: Define auth types** — UserRole, AllowedUser, NextAuth module augmentation
  - Files: `app/types/authTypes.ts`
  - Depends on: Step 1
  - Verify: `yarn tsc`
  - Tests: N/A — type definitions only
  - Source: port from `flow-insights/app/types/authTypes.ts`

- [x] **Step 3: Create auth config** — allowlist + getUserRole function
  - Files: `app/config/authConfig.ts`
  - Depends on: Step 2
  - Verify: `yarn tsc`, `yarn test app/config/__tests__/authConfig.test.ts`
  - Tests: `app/config/__tests__/authConfig.test.ts` — getUserRole returns correct role per email, null for unknown, null for non-deblock
  - Source: port from `flow-insights/app/config/authConfig.ts` + `flow-insights/app/config/__tests__/authConfig.test.ts`

- [x] **Step 4: Create NextAuth config** — root auth.ts with Google provider, callbacks, JWT strategy
  - Files: `auth.ts`
  - Depends on: Step 3
  - Verify: `yarn tsc`, `yarn test __tests__/auth.test.ts`
  - Tests: `__tests__/auth.test.ts` — SESSION_MAX_AGE=3600, signIn rejects non-deblock/non-allowlist, accepts allowlisted, jwt injects role, session exposes role+maxAge, redirect prevents open redirect
  - Source: port from `flow-insights/auth.ts` + `flow-insights/__tests__/auth.test.ts`

- [x] **Step 5: Create NextAuth route handler** — catch-all API route
  - Files: `app/api/auth/[...nextauth]/route.ts`
  - Depends on: Step 4
  - Verify: `yarn tsc`
  - Tests: N/A — thin re-export of handlers

- [x] **Step 6: Create useSessionExpiry hook** — session expiry monitoring with countdown, warning, auto-extend
  - Files: `app/hooks/useSessionExpiry.ts`
  - Depends on: Step 1
  - Verify: `yarn tsc`, `yarn test app/hooks/__tests__/useSessionExpiry.test.ts`
  - Tests: `app/hooks/__tests__/useSessionExpiry.test.ts` — active when valid, warning with countdown at 30s, expired past skew, activity triggers update (debounced), offline pauses, focus re-checks
  - Source: port from `flow-insights/app/hooks/useSessionExpiry.ts` + `flow-insights/app/hooks/__tests__/useSessionExpiry.test.ts`

- [x] **Step 7: Create LoginForm organism** — Google SSO form with error/expiry/signout states
  - Files: `app/components/organisms/LoginForm/LoginForm.tsx`, `app/components/organisms/LoginForm/components/LoginFormGoogleIcon.tsx`, `app/components/organisms/LoginForm/index.ts`
  - Depends on: Step 1
  - Verify: `yarn tsc`, `yarn test app/components/organisms/LoginForm/__tests__/LoginForm.test.tsx`
  - Tests: `app/components/organisms/LoginForm/__tests__/LoginForm.test.tsx` — renders sign-in button, loading spinner on click, calls signIn('google'), shows session expired/signed out/error alerts
  - Source: port from `flow-insights/app/login/LoginForm.tsx` + `flow-insights/app/login/__tests__/LoginForm.test.tsx` — split GoogleIcon into LoginFormGoogleIcon.tsx, rebrand title/description

- [x] **Step 8: Create AuthProvider** — SessionProvider + AuthGuard wrapping all app content
  - Files: `app/providers/AuthProvider.tsx`
  - Depends on: Step 6, Step 7
  - Verify: `yarn tsc`
  - Tests: N/A — integration behavior covered by useSessionExpiry + LoginForm tests. Full AuthGuard integration = e2e (out of scope).
  - Source: port from `flow-insights/app/providers/AuthProvider.tsx`

- [x] **Step 9: Wire AuthProvider into AppProvider** — add to provider nesting tree
  - Files: `app/providers/AppProvider/AppProvider.tsx`
  - Depends on: Step 8
  - Verify: `yarn tsc`
  - Tests: N/A — provider nesting, structural

- [x] **Step 10: Create .env.example** — document required env vars
  - Files: `.env.example`
  - Depends on: —
  - Verify: file exists
  - Tests: N/A — config template

- [x] **Step 11: Move pages out of route groups** — dashboard + settings to flat app/
  - Files: `app/dashboard/page.tsx` (move from `app/(protected)/dashboard/page.tsx`), `app/settings/page.tsx` (move from `app/(protected)/settings/page.tsx`)
  - Depends on: Step 9
  - Verify: `yarn tsc`
  - Tests: N/A — file moves only, remove "Protected route" text

- [x] **Step 12: Delete route groups** — remove (public) and (protected) dirs
  - Files: DELETE `app/(public)/layout.tsx`, `app/(public)/login/page.tsx`, `app/(protected)/layout.tsx`
  - Depends on: Step 11
  - Verify: `yarn tsc`, `yarn build` (ensure no broken imports)
  - Tests: N/A — deletion only

- [x] **Step 13: Update docs/repo-structure.md** — remove route groups, add auth, add LoginForm organism
  - Files: `docs/repo-structure.md`
  - Depends on: Step 12
  - Verify: N/A — documentation
  - Tests: N/A
  - Changes: remove (public)/(protected) from directory overview + Route Groups section, add AuthProvider to AppProvider nesting, add auth.ts to root files, add app/config/ dir, add LoginForm organism, replace Route Groups auth text

- [x] **Step 14: Update docs/app-architecture.md** — add auth infrastructure
  - Files: `docs/app-architecture.md`
  - Depends on: Step 12
  - Verify: N/A — documentation
  - Tests: N/A
  - Changes: add auth infrastructure to §8, document env vars + Google OAuth + session strategy, add auth flow to System Overview

- [x] **Step 15: Update patterns/nextjs-app-router.md** — auth at provider level, not route groups
  - Files: `.claude/patterns/nextjs-app-router.md`
  - Depends on: Step 12
  - Verify: N/A — pattern documentation
  - Tests: N/A
  - Changes: Route Groups section — remove (public)/(protected) as auth mechanism, add note about AuthProvider-based auth, route groups optional for layout only

- [x] **Step 16: Update patterns/cookies-auth.md** — align with NextAuth v5 JWT pattern
  - Files: `.claude/patterns/cookies-auth.md`
  - Depends on: Step 12
  - Verify: N/A — pattern documentation
  - Tests: N/A
  - Changes: add NextAuth v5 section (JWT strategy, SessionProvider, auth()), update Session Source of Truth + Refresh Strategy sections, note NextAuth manages cookie security automatically

- [x] **Step 17: Update patterns/security.md** — reference AuthProvider, Server Actions warning
  - Files: `.claude/patterns/security.md`
  - Depends on: Step 12
  - Verify: N/A — pattern documentation
  - Tests: N/A
  - Changes: add AuthProvider auth enforcement to Auth and Session section, add Server Actions auth() requirement note

- [x] **Step 18: Final verification** — full build + test suite
  - Files: —
  - Depends on: Step 1–17
  - Verify: `yarn tsc && yarn lint && yarn build && yarn test`
  - Tests: full suite run

---

## Dependency Graph

```
Step 1 (install)
├── Step 2 (types)
│   └── Step 3 (config + test)
│       └── Step 4 (auth.ts + test)
│           └── Step 5 (route handler)
├── Step 6 (useSessionExpiry + test)
├── Step 7 (LoginForm organism + test)
│
Step 6 + Step 7 → Step 8 (AuthProvider)
                    └── Step 9 (AppProvider wire)
                          └── Step 11 (move pages)
                                └── Step 12 (delete route groups)
                                      ├── Step 13 (repo-structure.md)
                                      ├── Step 14 (app-architecture.md)
                                      ├── Step 15 (nextjs-app-router.md)
                                      ├── Step 16 (cookies-auth.md)
                                      └── Step 17 (security.md)

Step 10 (.env.example) — independent

Step 1–17 → Step 18 (final verification)
```

## Parallel Waves

| Wave | Steps              | What                                                               |
| ---- | ------------------ | ------------------------------------------------------------------ |
| 1    | 1, 10              | Install deps + .env.example                                        |
| 2    | 2                  | Types                                                              |
| 3    | 3, 6, 7            | Config + hook + LoginForm (parallel — all depend only on Step 1/2) |
| 4    | 4                  | auth.ts                                                            |
| 5    | 5, 8               | Route handler + AuthProvider                                       |
| 6    | 9                  | AppProvider wire                                                   |
| 7    | 11                 | Move pages                                                         |
| 8    | 12                 | Delete route groups                                                |
| 9    | 13, 14, 15, 16, 17 | All docs + patterns (parallel)                                     |
| 10   | 18                 | Final verification                                                 |

## Status

- Current step: COMPLETE
- Blocked: no

---

## Review

**Verdict:** PASS
**Reviewed:** 2026-05-08
**Sources:** W19-auth-implementation.md (evaluated), orchestration-eval.md, patterns/testing.md, repo-structure.md

### Findings

All 11 criteria passed. No notes, no failures.

### Coverage Cross-Reference

- Plan Types section: 1/1 covered (authTypes.ts → Step 2) ✓
- Plan Features section: 18/18 covered (F1-F18 → Steps 1-17) ✓
- Plan Tests section: 4/4 covered (T1-T4 → Steps 3, 4, 6, 7) ✓
