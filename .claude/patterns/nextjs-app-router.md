# Next.js App Router Guide

## Purpose

Define how the project uses App Router with clear server/client boundaries, predictable data loading, and secure route handlers.

## Core Rules

- Default to Server Components.
- Add `use client` only for browser APIs, event handlers, or client-only state.
- Keep auth/session/bootstrap reads on server side (`cookies()`, `headers()`, server utilities).
- Keep route handlers thin: validate request, call service, return typed response.

## Folder Architecture

- Keep route files (`page.tsx`, `layout.tsx`, `route.ts`) focused on orchestration and composition.
- Keep heavy UI logic in `app/components/organisms/*`.
- Keep reusable UI primitives in `app/components/atoms|molecules/*`.
- Keep data/network logic in `app/services/*` (or feature-local services).
- Keep reusable behaviors in `app/hooks/*` (or feature-local hooks).

## Route Groups

- Use parenthesized route groups (`(public)`, `(protected)`) for layout boundaries — they don't affect URLs.
- Each group has its own `layout.tsx` controlling providers, guards, and navigation.
- Root `layout.tsx` wraps everything with `AppProvider`.

## Component Boundary Pattern

- Server component: layout/page-level orchestration, secure bootstrap data.
- Client component: interactive UI, form state, query hooks, optimistic UX.
- Never pass secrets from server to client props.

## Data Loading Pattern

- Resolve independent async server operations in parallel with `Promise.all`.
- Fetch auth-dependent data only after auth context is known.
- Fail closed for missing/invalid auth context.

## Route Handlers

- Use `route.ts` (thin re-export) + `{action}Route.ts` (handler logic) pattern.
- Validate auth context from cookies before backend calls.
- Return normalized error responses with safe messages.
- Never leak internal tokens, raw backend errors, or secret headers.

## Caching and Revalidation

- Prefer explicit caching behavior over defaults.
- For user/session-sensitive data, avoid static leakage across users.
- Revalidate only where business freshness requires it.
