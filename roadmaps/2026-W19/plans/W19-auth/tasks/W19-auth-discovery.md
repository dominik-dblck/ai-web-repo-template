# W19-auth — Discovery Document

> Feature: NextAuth v5 + Google SSO authentication
> Date: 2026-05-08
> Status: Discovery

---

## Feature Overview

Port the proven authentication stack from flow-insights into ai-repo-template. All routes protected by default via an `AuthGuard` component inside `AuthProvider`. Unauthenticated users see an inline `LoginForm` — no separate login route. Google SSO with `@deblock.com` domain restriction and role-based allowlist.

**Motivation:** Same company, same auth requirements. Eliminates the current placeholder `(public)/`/`(protected)/` route group pattern that has no actual auth behind it.

---

## Scope

### In scope

- `auth.ts` — root NextAuth v5 config (Google provider, JWT strategy, callbacks, session maxAge)
- `app/providers/AuthProvider.tsx` — `SessionProvider` + `AuthGuard` component
- `app/hooks/useSessionExpiry.ts` — session expiry countdown, warning snackbar, auto-extend on activity, offline/online handling
- `app/login/LoginForm.tsx` — Google SSO login form (rebranded for template)
- `app/types/authTypes.ts` — `UserRole`, `AllowedUser`, NextAuth module augmentation
- `app/config/authConfig.ts` — allowlist + `getUserRole()`
- `app/api/auth/[...nextauth]/route.ts` — NextAuth catch-all route handler
- `.env.example` — auth environment variables
- `AppProvider` update — add `AuthProvider` to provider nesting
- Delete `app/(public)/` and `app/(protected)/` route groups
- Move `dashboard/page.tsx` and `settings/page.tsx` to flat `app/` routes
- Tests: `useSessionExpiry.test.ts`, `LoginForm.test.tsx`, `authConfig.test.ts`, `auth.test.ts`
- Update `docs/repo-structure.md` — remove route group references, add auth section
- Update `docs/app-architecture.md` — add auth to infrastructure section
- Update `package.json` — add `next-auth` dependency

### Out of scope

- Server-side middleware (flow-insights doesn't use it)
- Role-based route protection (roles exist in token but no per-route gating)
- Password/credentials auth providers
- Database session strategy (JWT only)
- CSRF customization (NextAuth v5 defaults sufficient)

---

## What Exists Today

### Reusable (no changes needed)

| File                                        | Why reusable                                            |
| ------------------------------------------- | ------------------------------------------------------- |
| `app/providers/AppProvider/AppProvider.tsx` | Composite provider — just add `AuthProvider` to nesting |
| `app/providers/QueryClientProvider.tsx`     | Infrastructure provider, unaffected                     |
| `app/providers/ThemeProvider.tsx`           | Infrastructure provider, unaffected                     |
| `app/providers/NotificationProvider.tsx`    | Used by session expiry warning snackbar                 |
| `app/styles/theme.ts`                       | MUI theme for LoginForm styling                         |
| `app/page.tsx`                              | Home/showcase page, stays as-is                         |

### Must modify

| File                                        | Change                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/providers/AppProvider/AppProvider.tsx` | Add `AuthProvider` wrapping children                                            |
| `package.json`                              | Add `next-auth@5.0.0-beta.31`                                                   |
| `next.config.ts`                            | No change needed (flow-insights config is project-specific: `standalone`, `pg`) |
| `docs/repo-structure.md`                    | Remove `(public)/`/`(protected)/` references, add auth patterns                 |
| `docs/app-architecture.md`                  | Add auth infrastructure section                                                 |

### Must delete

| File/Dir                             | Reason                                 |
| ------------------------------------ | -------------------------------------- |
| `app/(public)/layout.tsx`            | No more route groups                   |
| `app/(public)/login/page.tsx`        | LoginForm rendered inline by AuthGuard |
| `app/(protected)/layout.tsx`         | No more route groups                   |
| `app/(protected)/dashboard/page.tsx` | Move to `app/dashboard/page.tsx`       |
| `app/(protected)/settings/page.tsx`  | Move to `app/settings/page.tsx`        |

### Must create (new files)

| File                                           | Source                                              |
| ---------------------------------------------- | --------------------------------------------------- |
| `auth.ts`                                      | Port from flow-insights `auth.ts`                   |
| `app/providers/AuthProvider.tsx`               | Port from flow-insights                             |
| `app/hooks/useSessionExpiry.ts`                | Port from flow-insights                             |
| `app/login/LoginForm.tsx`                      | Port from flow-insights (rebrand title/description) |
| `app/types/authTypes.ts`                       | Port from flow-insights                             |
| `app/config/authConfig.ts`                     | Port from flow-insights                             |
| `app/api/auth/[...nextauth]/route.ts`          | Port from flow-insights                             |
| `.env.example`                                 | New file with auth env vars                         |
| `__tests__/auth.test.ts`                       | Port from flow-insights                             |
| `app/hooks/__tests__/useSessionExpiry.test.ts` | Port from flow-insights                             |
| `app/login/__tests__/LoginForm.test.tsx`       | Port from flow-insights                             |
| `app/config/__tests__/authConfig.test.ts`      | Port from flow-insights                             |

---

## Technical Approach

### Architecture

```
Root layout.tsx
  └── AppProvider
        └── QueryClientProvider
              └── ThemeProvider
                    └── NotificationProvider
                          └── DialogProvider
                                └── DrawerProvider
                                      └── AuthProvider (NEW)
                                            └── SessionProvider (next-auth)
                                                  └── AuthGuard
                                                        ├── LoginForm (if unauthenticated)
                                                        └── {children} (if authenticated)
```

**AuthProvider placement:** Innermost provider (before children). Needs `ThemeProvider` (MUI components in LoginForm), `NotificationProvider` (potential future use). Does NOT need `QueryClientProvider` or `DrawerProvider` — no queries or overlays in login state.

### Auth flow

1. User opens any page → `SessionProvider` checks session via NextAuth
2. `AuthGuard` reads `useSession()` status:
   - `loading` (first load) → render nothing (flash prevention)
   - `unauthenticated` → render `LoginForm` (inline, full-page centered)
   - `authenticated` → render `{children}` (normal app)
3. `useSessionExpiry` monitors session expiry:
   - `active` → normal
   - `warning` (30s before expiry) → countdown snackbar with progress
   - `expired` → back to LoginForm
4. Activity auto-extends session (debounced 60s, via `session.update()`)
5. Wake-up/focus/visibility checks re-validate expiry

### NextAuth config (auth.ts)

- Provider: Google with `hd: 'deblock.com'` restriction
- Session: JWT strategy, `maxAge: 3600` (1 hour), `updateAge: 0`
- Callbacks: `signIn` (allowlist check), `jwt` (role injection), `session` (role + maxAge exposure)
- Pages: `signIn: '/login'`, `error: '/login'` (NextAuth internal redirects — LoginForm handles display inline)
- `trustHost: true`, `debug: true`

### Environment variables

```
AUTH_URL=http://localhost:3000
AUTH_SECRET=                        # Generate with: npx auth secret
# AUTH_TRUST_HOST=true              # Set on server when behind reverse proxy
AUTH_GOOGLE_ID=                     # Google OAuth client ID
AUTH_GOOGLE_SECRET=                 # Google OAuth client secret
```

`AUTH_SECRET` auto-detected by NextAuth v5 (no need for `NEXTAUTH_SECRET`).
`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` auto-detected with `AUTH_` prefix.

### LoginForm branding

Flow-insights uses "Flow Insights" + `/logo.svg`. Template should use generic branding:

- Title: configurable or use project name from package.json
- Logo: use existing template logo or placeholder
- Description: "Sign in to continue"
- Restriction text: "Restricted to @deblock.com accounts"

---

## Data Flow

```
Browser                    Next.js Server              Google OAuth
  │                              │                          │
  ├── signIn('google') ─────────►│                          │
  │                              ├── redirect ─────────────►│
  │                              │◄── callback + profile ───┤
  │                              │                          │
  │                              ├── signIn callback        │
  │                              │   (allowlist check)      │
  │                              ├── jwt callback           │
  │                              │   (role injection)       │
  │                              ├── session callback       │
  │                              │   (role + maxAge)        │
  │◄── session cookie ──────────┤                          │
  │                              │                          │
  ├── useSession() ─────────────►│                          │
  │   (refetch every 300s)       │                          │
  │◄── session data ────────────┤                          │
  │                              │                          │
  ├── user activity ────────────►│                          │
  │   (debounced 60s)            │                          │
  │   session.update() ─────────►│                          │
  │◄── refreshed session ───────┤                          │
```

---

## Edge Cases and Error Handling

| Scenario                      | Handling                                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| Google OAuth not configured   | NextAuth returns `Configuration` error → LoginForm shows "SSO is not configured"                       |
| User not in allowlist         | `signIn` callback returns `false` → NextAuth redirects with `AccessDenied` error                       |
| Non-@deblock.com email        | `signIn` callback returns `false` before allowlist check                                               |
| Session expired               | `useSessionExpiry` detects expiry → AuthGuard shows LoginForm with "Session expired" alert             |
| User signs out (other tab)    | `SessionProvider` `refetchOnWindowFocus` detects → AuthGuard shows LoginForm with "signed out" message |
| Tab goes offline              | `useSessionExpiry` pauses expiry checks, resumes on online                                             |
| Tab regains focus after sleep | `useSessionExpiry` re-checks expiry on focus/visibility change                                         |
| Concurrent token refresh      | `SessionProvider` handles via single `update()` call + debounce                                        |
| Initial page load (SSR)       | `sessionStatus === 'loading'` → render nothing (prevents login flash)                                  |

---

## Risk Areas

| Risk                                        | Severity | Mitigation                                                                            |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `next-auth@5.0.0-beta.31` is beta           | Medium   | Same version running in production in flow-insights. Pin exact version.               |
| NextAuth v5 + Next.js 16 compatibility      | Low      | flow-insights already on Next.js 16.1.7, template on 16.2.3 — same major, should work |
| `@auth/core/jwt` module augmentation        | Low      | TypeScript 6 may need `moduleResolution: bundler` — already set in template           |
| Session cookie not set in dev without HTTPS | Low      | NextAuth v5 handles `localhost` as special case for dev                               |

---

## Context Gaps

| Gap                                                          | Impact              | How to resolve                                                                               |
| ------------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------- |
| Whether `@testing-library/react` is already in template deps | Test files need it  | Check package.json — if missing, add as devDep                                               |
| Whether template has `.gitignore` entry for `.env`           | Security            | Verify `.gitignore` covers `.env*` patterns                                                  |
| Auth pattern doc (`cookies-auth.md`) alignment               | Pattern consistency | Review if NextAuth JWT approach needs doc update (it's cookie-based JWT, not custom cookies) |

---

## Dependencies and Blockers

### New dependencies

| Package                     | Version         | Type          |
| --------------------------- | --------------- | ------------- |
| `next-auth`                 | `5.0.0-beta.31` | production    |
| `@testing-library/react`    | latest          | devDependency |
| `@testing-library/dom`      | latest          | devDependency |
| `@testing-library/jest-dom` | latest          | devDependency |
| `jsdom`                     | latest          | devDependency |

### No blockers

All source code available in flow-insights. No external API or backend changes needed. Google OAuth credentials are environment config.

---

## Open Questions

None — all answered from flow-insights source. Same company, same approach, exact port.

---

## Existing Types Audit

### New types to create

- `UserRole = 'viewer' | 'operator' | 'admin'` — role union
- `AllowedUser = { email: string; role: UserRole }` — allowlist entry
- NextAuth module augmentation: `Session.user.role`, `Session.maxAge`, `JWT.role`

### Types in affected area

- No existing auth types in template (clean slate)
- `ReactNode` from React — used in provider/guard signatures (no changes needed)

### Weak types to address

- None — starting fresh, all types will be strict from start

---

## Evaluation

**Verdict:** PASS WITH NOTES
**Evaluated:** 2026-05-08
**Sources:** KNOWLEDGE-INDEX.md, REFERENCE.md, S02E01 §2/§10, S01E05 §1, S02E05 §1/§4, types-eval.md, S02E04 §2-§3, web search (3 queries)

### KB Findings

- [NOTE] Existing infrastructure (dependencies) — discovery listed only `@testing-library/react` but flow-insights uses 4 testing deps: `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `jsdom`. All required for unit tests to run. User explicitly requested all deps installed. Fixed in dependencies table above. `[S02E01 §10 — Context gaps: "what does this NOT know?"]`
- [NOTE] Context gaps — should mention all 4 missing test deps (not just `@testing-library/react`), plus `jsdom` required for `// @vitest-environment jsdom` directive in test files. `[S02E01 §10]`

All other 10 KB criteria passed.

### Web Search Insights

- [WARNS] Server Actions not protected by client-side AuthGuard — "Every Server Action that touches user data needs an explicit `auth()` check, since middleware does not protect Server Actions." Client-side AuthGuard prevents UI access but doesn't protect API routes or Server Actions server-side. Current scope doesn't use Server Actions, but future features might — worth noting in risk areas. `[web: authjs.dev/getting-started/session-management/protecting — Server Actions protection]`
- [WARNS] Next.js 16 renamed `middleware.ts` to `proxy.ts` — if middleware route protection added later, file naming changed. Not blocking for current scope (no middleware). `[web: dev.to/huangyongshan46a11y — Auth.js v5 with Next.js 16]`
- [CONFIRMS] Auth.js v5 client-side pattern using `SessionProvider` + `useSession` is documented approach for Client Components. Server-side uses `auth()` function directly. `[web: authjs.dev/getting-started/session-management/protecting]`
- [CONFIRMS] next-auth v5 beta is stable enough for production use. Session extension issues reported in earlier betas but resolved. `[web: github.com/nextauthjs/next-auth/discussions/9511]`

### Web Search Queries Executed

- "next-auth v5 NextJS 16 App Router authentication best practices 2026" → 10 results reviewed → 2 confirms, 1 warns, 0 suggests
- "next-auth v5 beta known issues problems pitfalls 2026" → 10 results reviewed → 1 confirms, 0 warns, 0 suggests
- "next-auth v5 client-side AuthGuard vs middleware authentication pattern" → 10 results reviewed → 1 confirms, 1 warns, 0 suggests
