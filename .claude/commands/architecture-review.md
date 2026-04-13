You are performing an ARCHITECTURE REVIEW for this project (Next.js App Router).

Focus on architecture consistency, component boundaries, data flow, and framework standards.

Scope:

- Review ONLY the current branch changes versus `main` branch
- Do NOT speculate about code not shown
- Maximum 25 findings total (prioritize highest impact)

Authoritative Guides (these override generic best practices):

- `docs/repo-structure.md` — project structure and conventions
- `.claude/patterns/nextjs-app-router.md`
- `.claude/patterns/ui-architecture.md`
- `.claude/patterns/state-management.md`
- `.claude/patterns/tanstack-query.md`
- `.claude/patterns/api-clients.md`
- `.claude/patterns/mui7.md`
- `.claude/patterns/testing.md`
- `.claude/patterns/error-handling.md`
- `.claude/patterns/performance.md`
- `.claude/patterns/security.md`
- `.claude/patterns/cookies-auth.md`

**IMPORTANT — Pattern loading strategy:**

- Do NOT read all pattern files upfront. That wastes context.
- First classify which layers the PR touches (Step 0).
- Then read ONLY the pattern files relevant to those layers.
- Use the mapping below to decide which patterns to load.

**IMPORTANT — Citation requirement:**

- Every finding MUST cite the specific source: pattern file + section name.
- Format: `[patterns/mui7.md → Token Safety]` or `[repo-structure.md → Services]`
- If a finding is not grounded in any guide, do not include it.
- No finding without a citation. No citation without reading the source.

**IMPORTANT — Uncertainty handling:**

- If a finding is uncertain (could be a violation or could be intentional), mark it as `[Uncertain]` with a question for the author rather than a directive.
- Do not guess about code you cannot see. If context is missing, say so explicitly with what you'd need: "Insufficient context for [area] — to review this, I would need to see [specific file/type/service]."

---

# STEP 0 — Classify and Load

### 0a. Identify touched layers

Which layers does this PR affect?

- UI Components (atoms / molecules / organisms)
- Next.js App Router (routes, layouts, server components)
- Data Fetching (TanStack Query, services, route handlers)
- State Management (Context, providers)
- MUI Theme / Styling
- Auth / Security
- Error Handling
- Testing

### 0b. Load relevant patterns

| Layer touched        | Read these patterns                   |
| -------------------- | ------------------------------------- |
| UI Components        | `ui-architecture.md`, `mui7.md`       |
| App Router / Routes  | `nextjs-app-router.md`                |
| Data Fetching        | `tanstack-query.md`, `api-clients.md` |
| State Management     | `state-management.md`                 |
| MUI / Styling        | `mui7.md`                             |
| Auth / Security      | `security.md`, `cookies-auth.md`      |
| Error Handling       | `error-handling.md`                   |
| Testing              | `testing.md`                          |
| Performance concerns | `performance.md`                      |

Always load `docs/repo-structure.md` — it applies to every review.

### 0c. Identify context gaps

Before reviewing, ask: **"What do I NOT know about this PR that I should know to avoid a wrong finding?"**

If you can't see the service being called, the types being used, the provider being consumed, or the route being modified — say so. Missing context is not a violation.

Only apply strict checks to touched layers to reduce noise.

---

# STEP 1 — Review Against Loaded Patterns

For each loaded pattern file, check the PR code against:

- **"Must" rules** → violations are findings
- **"Flag if" rules** → violations are findings
- **Testing checklists** → missing coverage is a finding

Do NOT duplicate rules from the pattern files here. The patterns are the source of truth. Read them, apply them, cite them.

### Cross-cutting smells (always check)

Flag if you see:

- Business logic in atoms/molecules
- Domain logic in route handlers instead of services
- Cross-organism imports (organisms should be self-contained)
- Props drilling through 3+ levels instead of Context
- Duplicated fetch/service logic across components
- `any` types in app logic
- Generic file/folder names that don't describe purpose (`utils.ts`, `helpers.ts`, `constants.ts`, `index.ts`)

---

# OUTPUT FORMAT

---

## Architecture Summary

- **Layers touched:**
- **Patterns loaded:**
- **Context gaps** (what you couldn't see but would need to fully review):

---

## Findings

For each finding:

- **Source:** `[patterns/file.md → Section Name]` or `[repo-structure.md → Section]`
- **Severity:** `CRITICAL` | `HIGH` | `UNCERTAIN`
- **File:** `path/to/file.ts:line`
- **Rule:** one-line summary of the violated rule
- **Why:** one sentence on what breaks or what risk it creates
- **Fix hint:** what to do about it — or for `UNCERTAIN`, a question for the PR author

Rules:

- Every finding MUST have a `Source` citation from a pattern file or repo-structure.md
- `UNCERTAIN` findings are questions, not directives — use when the code might be intentional
- Do NOT tell me what is good, only flag violations and uncertainties
- Be DIRECT and SHORT on each point
- If no violations found, say "No violations found" — do not invent issues
