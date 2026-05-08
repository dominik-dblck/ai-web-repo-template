# Repository Structure Reference

This document explains how the project is organized. Use it as a reference when adding new features, components, or services.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript 6 (strict mode)
- **UI Framework:** Material UI 7 (MUI)
- **Charts:** Recharts
- **Validation:** Zod
- **Data fetching:** TanStack React Query
- **Testing:** Vitest
- **Linting:** ESLint (flat config) + Prettier
- **Git hooks:** Husky (pre-commit: lint + tsc + format, pre-push: test)

---

## Directory Overview

```
{project}/
├── .claude/                        # AI knowledge base & skills
│   ├── skills/                     # 10-skill pipeline (create → gate pattern)
│   │   ├── architect/              # #1 Advisor — context + architecture
│   │   │   ├── SKILL.md            # Skill definition & workflow
│   │   │   ├── KNOWLEDGE-INDEX.md  # Knowledge base reference tables
│   │   │   ├── PLANNING-CHECKLISTS.md # Creation checklists by type
│   │   │   └── REFERENCE.md        # Design principles + review checklist
│   │   ├── brainstorm/             # #2 Creator — divergent thinking, options matrix
│   │   ├── plan-discovery/         # #3 Creator — codebase exploration, discovery doc
│   │   ├── architect-evaluate-discovery/ # #4 Gate — evaluates discovery vs KB
│   │   ├── plan-implementation/    # #5 Creator — implementation plan
│   │   ├── architect-evaluate-plan/ # #6 Gate — evaluates plan vs KB + patterns
│   │   ├── plan-orchestration/     # #7 Creator — orchestration file
│   │   ├── orchestrator-plan-review/ # #8 Gate — reviews orchestration
│   │   ├── orchestrator/           # #9 Executor — types first, waves, testing
│   │   └── plan-feature/           # Legacy — combined discovery + planning
│   ├── evaluations/                # Validation criteria for pipeline gates
│   │   ├── discovery-eval.md       # KB criteria + web search criteria
│   │   ├── plan-eval.md            # KB + pattern + structural + web search
│   │   ├── orchestration-eval.md   # Coverage + dependency + buildability
│   │   ├── web-search-protocol.md  # 4-phase structured web search process
│   │   ├── architecture-eval.md    # Code structure criteria
│   │   ├── tests-eval.md           # Test quality criteria
│   │   └── types-eval.md           # Type safety criteria
│   ├── commands/                    # Claude Code slash commands
│   │   └── architecture-review.md   # /architecture-review — PR architecture review
│   ├── patterns/                   # Architecture pattern guides (referenced by commands)
│   │   ├── api-clients.md         # HTTP client layering, service rules
│   │   ├── cookies-auth.md        # Cookie-based auth, CSRF, session management
│   │   ├── error-handling.md      # Error boundaries, typed errors, route handler errors
│   │   ├── mui7.md                # MUI styling rules, token safety, accessibility
│   │   ├── nextjs-app-router.md   # Server/client boundary, route groups, data loading
│   │   ├── performance.md         # Code splitting, images, bundle size, Web Vitals
│   │   ├── security.md            # Auth, CSRF, data handling, server/client boundary
│   │   ├── state-management.md    # Context, state machines, TanStack Query, decision tree
│   │   ├── tanstack-query.md      # Query keys, invalidation, error model, performance
│   │   └── testing.md             # Vitest rules, test pyramid, test legitimacy
│   └── settings.local.json        # Claude Code permission allowlist
│
├── .husky/                         # Git hooks
│   ├── pre-commit                  # lint:fix → tsc → format → git add
│   └── pre-push                    # yarn test
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (wraps with AppProvider)
│   ├── page.tsx                    # Home page (or redirect)
│   ├── globals.css                 # Global styles / CSS reset
│   │
│   ├── dashboard/page.tsx           # Dashboard page
│   ├── settings/page.tsx           # Settings page
│   │
│   ├── api/                        # Backend API routes
│   │   ├── auth/[...nextauth]/     # NextAuth catch-all route handler
│   │   │   └── route.ts            # Re-exports GET, POST from auth.ts
│   │   └── {feature}/              # One folder per endpoint
│   │       ├── route.ts            # Thin re-export of HTTP methods
│   │       └── {action}Route.ts    # Handler logic (GET/POST/PUT/DELETE)
│   │
│   ├── components/                 # UI components (atomic design)
│   │   ├── atoms/                  # Smallest UI primitives (Button, Input, Label)
│   │   ├── molecules/              # Composed atoms (SearchField, CardHeader)
│   │   ├── organisms/              # Complex feature blocks (forms, lists, charts)
│   │   │   └── {Name}/            # Organism with internal structure
│   │   │       ├── {Name}.tsx      # Main component
│   │   │       ├── components/     # {Name}SubComponent.tsx (PascalCase prefix)
│   │   │       ├── hooks/          # use{Name}Hook.ts (use + PascalCase prefix)
│   │   │       ├── services/       # get{Name}Service.ts (camelCase prefix)
│   │   │       ├── types/          # {name}Types.ts (camelCase prefix)
│   │   │       ├── constants/      # {name}Constants.ts (camelCase prefix)
│   │   │       ├── queries/        # use{Name}Query.tsx (camelCase prefix)
│   │   │       └── utils/          # {name}Utils.ts (camelCase prefix)
│   │   └── templates/              # Page-level layouts
│   │
│   ├── config/                     # App configuration
│   ├── constants/                  # Constants (frontend + backend separated)
│   │   ├── frontendApiConstants.ts # Browser → /api/* URLs
│   │   ├── backendApiConstants.ts  # /api/* → external backend URLs
│   │   └── {feature}Constants.ts   # Feature-specific enums, keys, config
│   ├── hooks/                      # Custom React hooks (use{Feature}.ts)
│   ├── providers/                  # React context providers
│   │   ├── AppProvider/            # Composite provider (nests all others)
│   │   │   ├── AppProvider.tsx     # Provider composition tree
│   │   │   └── index.ts           # Re-export
│   │   ├── AuthProvider.tsx         # NextAuth SessionProvider + AuthGuard
│   │   ├── QueryClientProvider.tsx # TanStack React Query client
│   │   └── ThemeProvider.tsx       # MUI ThemeProvider + CssBaseline
│   ├── queries/                    # TanStack Query hooks (use{Feature}Query.tsx)
│   ├── services/                   # Async functions ({verb}{Noun}Service.ts)
│   ├── styles/                     # MUI theme & design tokens
│   │   └── theme.ts               # MUI createTheme configuration
│   ├── types/                      # Zod schemas + TS types ({feature}Types.ts)
│   └── utils/                      # Utility functions ({verbNoun}.ts)
│
├── knowladge/                      # Knowledge base (synced from reference)
│   └── ai/                         # AI & Agent Design domain
│       ├── mindmaps/               # Condensed mind maps (25 files)
│       │   ├── S01/                # Prompts, tools, API design, multimodal, production limits
│       │   ├── S02/                # Context mgmt, RAG, memory, multi-agent, agent design
│       │   ├── S03/                # Observability, model limits, feedback, tool building, behavior
│       │   ├── S04/                # Deployments, collaboration, background tasks, KB design, internal AI
│       │   └── S05/                # Architecture, toolset, features, production, master controller
│       └── original_source/        # Full theory articles (deep reading on demand)
│           ├── S01/ ... S05/
│
├── docs/                           # Project documentation
│   ├── repo-structure.md           # This file — conventions reference
│   └── app-architecture.md         # Living architecture doc (architect maintains)
├── roadmaps/                       # Execution artifacts (weekly roadmaps + feature plans)
│   ├── backlog.md                  # Week-agnostic prioritized backlog
│   ├── templates/
│   │   └── week-roadmap.md         # Weekly roadmap template
│   └── {ISO-week}/                 # e.g., 2026-W19/
│       ├── {week}-week-roadmap.md  # Priority stack, schedule, gates
│       ├── {week}-learnings.md     # Findings from the week
│       └── plans/
│           └── {week}-{feature}/   # One folder per feature
│               ├── {week}-{feature}-orchestration.md
│               └── tasks/
│                   ├── {week}-{feature}-discovery.md
│                   └── {week}-{feature}-implementation.md
├── scripts/                        # CLI scripts (run via tsx)
│   └── sync-ai-reference.ts        # AI layer sync from reference repo (runs on yarn dev)
├── __tests__/                      # Unit tests
│
├── auth.ts                         # NextAuth v5 config (providers, callbacks, session)
├── .env.example                    # Required environment variables
├── CLAUDE.md                       # Root AI instructions (with SYNC:START/END markers)
├── eslint.config.js                # ESLint flat config (TS + React + React Hooks)
├── next.config.ts                  # Next.js configuration
├── tsconfig.json                   # TypeScript strict config (bundler, @/* alias)
├── vitest.config.ts                # Vitest config (node env, globals, @/ alias)
├── vitest.setup.ts                 # Vitest setup file
├── package.json                    # Dependencies + scripts
├── .nvmrc                          # Node version (22.22.0)
├── .prettierrc                     # Prettier config
├── .prettierignore                 # Prettier ignore
└── .gitignore                      # Git ignore
```

---

## Components — Atomic Design

Components live in `app/components/` and follow atomic design:

| Level         | Path                    | What goes here                                   | Example                         |
| ------------- | ----------------------- | ------------------------------------------------ | ------------------------------- |
| **Atoms**     | `components/atoms/`     | Smallest UI primitives (buttons, labels, inputs) | `Button/Button.tsx`             |
| **Molecules** | `components/molecules/` | Composed atoms (search field, card header)       | `SearchInput/SearchInput.tsx`   |
| **Organisms** | `components/organisms/` | Complex feature blocks (forms, lists, charts)    | `UserProfile/UserProfile.tsx`   |
| **Templates** | `components/templates/` | Page-level layouts                               | `MainTemplate/MainTemplate.tsx` |

Each component lives in its own **PascalCase folder** with a matching `.tsx` file:

```
components/atoms/Button/
  Button.tsx
  Button.test.tsx        # optional
```

### Complex organisms — prefix naming convention

Organisms can have their own internal structure. **All internal files are prefixed with the organism name** — this is the key convention.

```
components/organisms/UserProfile/
  UserProfile.tsx                              # main component
  components/
    UserProfileAvatar.tsx                       # PascalCase prefix
    UserProfileStats.tsx
  hooks/
    useUserProfileData.ts                       # use + organism name
  services/
    getUserProfileService.ts                    # camelCase prefix
  types/
    userProfileTypes.ts                         # camelCase prefix
  constants/
    userProfileConstants.ts                     # camelCase prefix
```

**Prefix rules:**

| Internal file type | Prefix style               | Example (organism: `ItemList`)          |
| ------------------ | -------------------------- | --------------------------------------- |
| Components         | PascalCase                 | `ItemListHeader.tsx`, `ItemListRow.tsx` |
| Services           | camelCase                  | `getItemListDataService.ts`             |
| Types              | camelCase                  | `itemListTypes.ts`                      |
| Constants          | camelCase                  | `itemListConstants.ts`                  |
| Hooks              | `use` + PascalCase         | `useItemListFilters.ts`                 |
| Queries            | camelCase + Query/Mutation | `useItemListQuery.ts`                   |
| Utils              | camelCase                  | `itemListFormatUtils.ts`                |

**Why prefix?** When you import from an organism, the filename immediately tells you which organism it belongs to. No ambiguity across organisms that might have similar sub-parts (e.g., multiple organisms can have a `Header` — the prefix prevents confusion).

**Where the prefix does NOT apply:**

- **Atoms** — typically single-file, no internal structure
- **Molecules** — prefix is inconsistently applied (simpler components)
- **Global files** (`app/services/`, `app/types/`, `app/constants/`) — use semantic/domain naming, not organism prefixing

---

## Services

**Location:** `app/services/` (global) or `app/components/organisms/{Name}/services/` (local)

**Naming:** `{verb}{Noun}Service.ts` — one async function per file, matching the filename.

```typescript
// app/services/getItemDataService.ts
export const getItemDataService = async (id: string): Promise<ItemData> => {
  // load, transform, return typed data
};
```

**Rules:**

- Export a **single async function** (not a class)
- Use **typed parameters and return types**
- A base `requestService` utility handles HTTP calls (when an external API exists)
- Global services use **domain/feature naming** (e.g., `getUserService.ts`, `authPasskeyService.ts`)
- Organism-local services are **prefixed with the organism name** (see prefix convention above)

**Organization:** starts flat, groups by feature folder when a domain grows:

```
services/
  getItemDataService.ts             # standalone service
  loginService.ts                   # standalone service
  auth/                             # feature folder
    complete2faSessionService.ts
    create2faSessionService.ts
    get2faKeysService.ts
```

---

## API Routes

**Location:** `app/api/`

Next.js App Router folder-based routing. Each endpoint folder contains:

- `route.ts` — thin file that re-exports HTTP methods from handler files
- `{action}Route.ts` — the actual handler with business logic

```
app/api/
  items/
    ├── route.ts                    # re-exports GET, POST
    ├── getItemsRoute.ts            # GET handler
    └── createItemRoute.ts          # POST handler
  users/
    ├── route.ts                    # re-exports GET
    └── getUsersRoute.ts            # GET handler
```

### route.ts (thin re-export — no logic here)

```typescript
import { getItemsRoute } from './getItemsRoute';
import { createItemRoute } from './createItemRoute';

export const GET = getItemsRoute;
export const POST = createItemRoute;
```

### Handler file ({action}Route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const getItemsRoute = async (request: NextRequest) => {
  // 1. extract params from request
  // 2. call service (using backendApiConstants for external URLs)
  // 3. transform/filter data
  // 4. return NextResponse with typed data
};
```

**Why separate `route.ts` from handler files?**

- `route.ts` stays a simple mapping — easy to scan which HTTP methods are supported
- Handler files contain actual logic, can be tested independently
- Multiple handlers can share the same route folder

---

## Constants

**Location:** `app/constants/` — flat structure, one file per domain.

### Frontend vs Backend separation

Constants are split by **where they're used** in the request flow:

| File                      | Purpose                                       | Used by                             |
| ------------------------- | --------------------------------------------- | ----------------------------------- |
| `frontendApiConstants.ts` | URLs the browser calls (`/api/...`)           | Client components, hooks, queries   |
| `backendApiConstants.ts`  | URLs the Next.js server calls (external APIs) | API route handlers, server services |
| `{feature}Constants.ts`   | Feature-specific values (enums, keys, config) | Both sides                          |

**Request flow:**

```
Browser → frontendApiConstants → /app/api/route.ts → backendApiConstants → External API
```

**Example:**

```typescript
// app/constants/frontendApiConstants.ts
const API_URL = '/api';
export const ITEMS_API_URL = `${API_URL}/items`;
export const USERS_API_URL = `${API_URL}/users`;

// app/constants/backendApiConstants.ts
const BACKEND_URL = process.env.BACKEND_API_URL;
export const BACKEND_ITEMS_URL = `${BACKEND_URL}/v1/items`;
export const BACKEND_USERS_URL = `${BACKEND_URL}/v1/users`;
```

**This separation ensures:**

- Frontend code never leaks backend URLs or secrets
- Backend constants can reference `process.env` server-side only
- Each layer only knows about the next hop, not the full chain

### General constants

Feature-specific constants use domain naming:

```
constants/
  appRoutesConstants.ts             # route path definitions
  frontendApiConstants.ts           # browser → Next.js API URLs
  backendApiConstants.ts            # Next.js API → external backend URLs
  errorCodesConstants.ts            # error code enums
```

**Naming:** `{feature}Constants.ts` — always flat, no subfolders.

---

## Hooks

**Location:** `app/hooks/` (global) or `app/components/organisms/{Name}/hooks/` (local)

**Naming:** `use{FeatureName}.ts` or `.tsx`

Organization starts flat. When hooks for a feature grow, group them into a subfolder:

```
hooks/
  useLocalStorage.ts          # standalone hook
  useItemData.ts              # standalone hook
  auth/                       # feature folder (when multiple hooks exist)
    useAuthSession.ts
    useAuthRedirect.ts
```

Organism-local hooks are **prefixed with the organism name** (see prefix convention above).

---

## Types

**Location:** `app/types/` (global) or `app/components/organisms/{Name}/types/` (local)

**Naming:** `{feature}Types.ts` — flat structure, one file per domain.

Zod schemas and inferred TypeScript types live together:

```typescript
// app/types/itemTypes.ts
import { z } from 'zod/v4';

export const ItemSchema = z.object({ ... });
export type Item = z.infer<typeof ItemSchema>;
```

Global types use **domain naming** (`itemTypes.ts`, `userTypes.ts`). Organism-local types are **prefixed with the organism name** (`userProfileTypes.ts`).

---

## Queries

**Location:** `app/queries/` (global) or `app/components/organisms/{Name}/queries/` (local)

**Naming:** `use{Feature}Query.tsx` for queries, `use{Feature}Mutation.tsx` for mutations.

Uses TanStack React Query. Starts flat, groups by feature folder when needed:

```
queries/
  useItemsQuery.tsx                # standalone query
  useUsersQuery.tsx                # standalone query
  items/                           # feature folder
    useItemsQuery.tsx
    useCreateItemMutation.tsx
    itemQueryKeys.ts               # query key factory
```

---

## Providers

**Location:** `app/providers/`

**Naming:** `{Domain}Provider.tsx`

### AppProvider — composite provider pattern

The **AppProvider** is a single component that nests all providers in the correct dependency order. The root `layout.tsx` wraps children with `<AppProvider>` — individual pages never import providers directly.

```
providers/
  AppProvider/                      # composite provider (folder-based)
    AppProvider.tsx                  # nests all providers in order
    index.ts                        # re-export
  AuthProvider.tsx                  # NextAuth SessionProvider + AuthGuard
  QueryClientProvider.tsx           # TanStack React Query client
  ThemeProvider.tsx                 # MUI theme + CssBaseline
  {Domain}Provider.tsx              # feature-specific providers (add as needed)
```

**AppProvider nesting order** (outermost → innermost):

```tsx
// app/providers/AppProvider/AppProvider.tsx
export const AppProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider>
      <ThemeProvider>
        <NotificationProvider>
          <DialogProvider>
            <DrawerProvider>
              <AuthProvider>{children}</AuthProvider>
            </DrawerProvider>
          </DialogProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
```

**Rules:**

- **Order matters** — providers that depend on others must be nested inside them (e.g., `UserProvider` inside `AuthProvider`, `ThemeProvider` inside `QueryClientProvider`)
- **One place to add** — when adding a new provider, add it to `AppProvider.tsx` at the correct nesting level
- **Root layout only** — `layout.tsx` uses `<AppProvider>{children}</AppProvider>`, nothing else
- **Route-group layouts** can add route-specific providers (e.g., auth guard in `(protected)/layout.tsx`) but never duplicate what `AppProvider` already provides
- **Flat files for simple providers** — each provider is its own `.tsx` file; only `AppProvider` gets a folder (for the index.ts re-export)

### When to create a new provider

Create a provider when:

- Multiple components need the same shared state (auth user, theme, notifications)
- You need React context for dependency injection
- Data from a parent layout must be available to all child routes

Do NOT create a provider for:

- Data that only one component uses (use local state or a hook)
- Server-side data (use async server components or API routes)

### Provider categories (grow as needed)

| Category           | Examples                                                            |
| ------------------ | ------------------------------------------------------------------- |
| **Infrastructure** | QueryClientProvider, ThemeProvider                                  |
| **Auth & User**    | AuthProvider, UserProvider, SecurityProvider                        |
| **Features**       | NotificationProvider, CurrencyProvider, FeatureFlagsProvider        |
| **Real-time**      | WebSocketProvider (use factory pattern for multiple WS connections) |
| **UI State**       | DialogProvider, DrawerProvider, BalanceVisibilityProvider           |

---

## Drawer & Dialog — Global Overlays

**Location:** `app/components/molecules/Drawer/` and `app/components/molecules/Dialog/`

Rendered once in `AppProvider`, controlled via `useDrawer()` and `useDialog()` hooks from any component. Never render your own `<Drawer>` or `<Dialog>`.

For API and usage examples, read the provider source: `DrawerProvider.tsx`, `DialogProvider.tsx`.

---

## Notifications

**Location:** `app/providers/NotificationProvider.tsx`

Use `useNotification()` hook to show toast notifications (notistack + MUI Alert). Wired in `AppProvider`.

---

## Routes — Auth-Protected by Default

All routes are protected by default via `AuthProvider`. The `AuthGuard` component renders `LoginForm` when unauthenticated — no separate login route exists.

Pages live flat under `app/` (e.g., `app/dashboard/page.tsx`). Route groups available for layout boundaries only, not auth gating.

For App Router patterns, see `.claude/patterns/nextjs-app-router.md`.

---

## MUI Theme

- **Theme:** `app/styles/theme.ts` — `createTheme()` with `colorSchemes` (light + dark)
- **Color scales:** `app/styles/themePrimitives.ts` — brand, gray, green, orange, red
- **Component overrides:** `app/styles/customizations/` — inputs, surfaces, feedback, navigation, data display

For MUI styling rules, see `.claude/patterns/mui7.md`.

---

## Charts (Recharts)

[Recharts](https://recharts.org) — composable chart components (Line, Bar, Area, Pie, Scatter, Radar, TreeMap).

- Always wrap in `ResponsiveContainer` with `width="100%"` and explicit `height`
- Use colors from `app/styles/themePrimitives.ts`
- Requires the browser — use `next/dynamic` with `ssr: false` or lazy import
- Chart components with data fetching belong in organisms

## Data Pipeline

<!-- Define your project's data pipeline here -->

---

## Scripts

**Location:** `scripts/`

Run via `tsx` (TypeScript execution). Define in `package.json`:

<!-- Add your project-specific scripts here -->

---

## Adding New Features — Checklist

When adding a new feature:

1. **Types first** — define Zod schemas + TS types in `app/types/{feature}Types.ts`
2. **Service** — create `app/services/{verb}{Feature}Service.ts` (async function)
3. **API route** (if needed) — create `app/api/{feature}/route.ts` + `{action}Route.ts`
4. **Constants** — add URLs to `frontendApiConstants.ts` and/or `backendApiConstants.ts`
5. **Query hook** — create `app/queries/use{Feature}Query.tsx`
6. **Components** — build atoms → molecules → organisms as needed
7. **Tests** — add `*.test.ts(x)` alongside components or in `__tests__/`
