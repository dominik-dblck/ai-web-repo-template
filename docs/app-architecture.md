# {Project Name} — Architecture

> Last updated: {date}
>
> Living source of truth for app architecture. Architect skill loads this as primary context. Update after every feature cycle.

---

## System Overview

<!--
Mermaid diagram of your system. Start simple, add detail as the app grows.
Example: flowchart showing main components and data flow.
-->

## 1. Core Feature / Main Flow

<!--
What the app does. Primary user journey.
Key API endpoints and their purpose.
-->

## 2. Data Pipeline

<!--
How data enters the system, gets transformed, and is stored.
External data sources, internal transformations, storage.
-->

## 3. Component Architecture

<!--
Component tree. Which organisms exist, what they do.
Follow atomic design: atoms → molecules → organisms → templates.
-->

## 4. State Management

<!--
React Query keys and cache strategy.
Providers and their responsibilities.
Local state vs server state decisions.
-->

## 5. API Layer

<!--
API routes with request/response shapes.
External service integrations.
Request flow: Browser → frontend constants → /api/ → backend constants → External API
-->

## 6. DB Schema

<!--
Tables, key columns, relationships.
If using an ORM, note the models.
-->

## 7. Type System

<!--
Key Zod schemas and where they live.
Branded types if any.
Shared interfaces that multiple features depend on.
-->

## 8. Infrastructure

### Authentication

- **Provider:** NextAuth v5 with Google SSO (`@deblock.com` domain restriction)
- **Strategy:** JWT session in HttpOnly cookie, 1-hour maxAge
- **Config:** `auth.ts` at project root
- **Guard:** `AuthProvider` wraps entire app — all routes protected by default
- **Session expiry:** `useSessionExpiry` hook monitors expiry with 30s warning countdown, auto-extends on user activity

### Environment Variables

| Variable             | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `AUTH_URL`           | NextAuth base URL (e.g., `http://localhost:3000`)    |
| `AUTH_SECRET`        | JWT signing secret (generate with `npx auth secret`) |
| `AUTH_GOOGLE_ID`     | Google OAuth client ID                               |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret                           |

<!--
Deployment target and process.
Additional external services (payments, monitoring, etc.)
-->

## 9. Testing Strategy

<!--
What's tested and how.
Test file locations and conventions.
Coverage goals or areas of focus.
-->

## 10. Current State & TODOs

<!--
What's done, what's in progress, what's planned.
Link to roadmap and plans if they exist.
-->
