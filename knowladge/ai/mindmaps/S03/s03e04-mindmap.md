# S03E04 — Building Tools Based on Test Data

## 1. Using LLMs in the Tool-Building Process

- **Agents building tools for agents** — the concept goes beyond simple API wrappers; it includes personalization, internal system interactions, and shaping tool behavior to match specific agent needs
- **Agents can already self-generate tools**, but the process is hard to control — not production-ready for complex integrations; however, LLMs are excellent **collaborators** in the tool design process (concept → schema → implementation → testing → optimization)
- **Why custom tools over off-the-shelf MCP servers / CLIs**:
  - Generic integrations expose too much surface area — e.g., full Gmail access when the agent only handles support emails
  - **Scoped tools prevent misuse**: `gmail__search_support` (narrowed) vs `gmail__search` (full access)
  - Platform-specific settings (e.g., Replicate image generation) need hardcoded constraints, not open parameters
- **The iterative design process with LLM**:
  1. **Gather context** — download API docs as Markdown, clone the official SDK, set up a coding agent
  2. **Scan available actions** — ask for a concise list of API capabilities scoped to your domain (e.g., "message interaction only, exclude settings management")
  3. **Ask design questions early**: Which actions are needed? Which should be **combined** into one tool? Which should be **blocked**?
  4. **Generate initial schema** — request input/output schema for a specific tool; the first draft will be low quality (missing pagination, incomplete fields, wrong data formats)
  5. **Inject good practices** — send a list of design rules; the model expands and applies them across the entire integration
  6. **Iterate** — review, correct, repeat until the schema matches real-world needs
- **LLM's initial schema quality is low** (~60-70% done) — serves as a starting point, not a final product
  - Common defects: missing pagination, insufficient field metadata, wrong data formats (e.g., base64 attachments killing context), missing status indicators (read/unread), no attachment metadata, vague field names
- **Sending design rules as hints** dramatically improves output — the model generalizes your specific corrections across all tools in the integration

## 2. Tool Schema Design Through Iterative Refinement

- **The Gmail case study** demonstrates the full process: 5 tools (`search`, `read`, `send`, `modify`, `attachment`)
- **Common response envelope for all tools** — a unified structure wrapping every tool response:
  - `data` — tool-specific payload (`null` on error)
  - `meta.status` — enum: `success`, `empty`, `partial`, `error`
  - `meta.reasonCode` — enum: `OK`, `NO_RESULTS`, `AUTH_REQUIRED`, `NOT_FOUND`, `INVALID_ARGUMENT`, `RATE_LIMITED`, `POLICY_BLOCKED`, `TRANSIENT_FAILURE`
  - `meta.summary` — human-readable description of what happened
  - `meta.nextAction[]` — suggested next tool calls with `tool`, `why`, `args`, `confidence`
  - `meta.recovery` — `retryable`, `backoffMs`, `maxAttempts`
  - `meta.diagnostics` — optional: `scope` (tool | global), `httpStatus`, `rawMessage`
- **Experimental additions** in the final schema:
  - `nextAction` with confidence scores — the tool itself suggests what the agent should do next
  - `recovery` object — structured retry guidance instead of ad-hoc error handling
  - `diagnostics` — separates tool-level from global-level errors
- **Detail-level control** — `search` and `read` tools accept a `details` boolean; when false, return minimal fields; when true, add recipients, labels, attachments — **agent controls verbosity of results**
- **Modify tool returns changed state** — after `markRead`, `archive`, `trash`, etc., the response includes `updateState` with current labels, isRead, inInbox, inTrash, isDraft — agent immediately sees the effect of its action
- **Read tool resolves resource type programmatically** — agent passes only `id`, the tool determines if it's a message or thread (removed `kind` from input) — fewer decisions for the agent, fewer errors
- **Attachment handling** — never return base64 content (destroys context window); return a URL/link that the user or another agent can access
- **Policy enforcement at tool level** — `gmail_send` includes a `policy` object in output: `enforcedDraft`, `blockedRecipients[]`, `whitelist[]` — the tool silently downgrades to draft if recipient is out-of-whitelist; **agent cannot bypass this even if instructed**

## 3. Generating Interaction Examples and Test Datasets

- **LLMs excel at generating synthetic test data** — given tool schemas and design rules, they produce realistic interaction examples
- **Process**: read source code → generate initial examples → human selects the best → generate more based on selected examples
- **Human must ensure**: **diversity** (different use cases), **realism** (matching actual user behavior), **coverage** (edge cases, errors, multi-step flows)
- **Dataset categories** for a tool integration:
  - **Per-tool datasets** — test individual tool handling (search queries, read operations, send modes, modify actions, attachment downloads, **error scenarios**)
  - **Scenario datasets** — test multi-tool chains (draft → send, search → reply, find → modify → modify again)
- **Example categories from the Gmail agent** (20 examples across 7 categories):
  - Finding & scanning, reading content, thread context, attachments, sending & replying, organizing, cross-cutting queries
- **Don't over-polish early** — usefulness of test data reveals itself during evaluation, not during authoring
- **Generated examples serve triple duty**: creative brainstorming (what scenarios matter?), evaluation design (what should we test?), result analysis (what patterns do we see in failures?)

## 4. Evaluation with Promptfoo

- **[Promptfoo](https://www.promptfoo.dev/)** — one of the best tools for **offline evaluation** (development-time and CI/CD)
- **Complementary to Langfuse** — Promptfoo for dev-time offline evals, Langfuse for production online observation; can be integrated but serve different roles
- **Context-building approach**: clone the Promptfoo repo, let the agent scan it for assertion types and interfaces — ensures access to latest features, not just general LLM knowledge about the tool
  - 62 assertion types available: `equals`, `contains`, `regex`, `is-json`, `is-refusal`, `llm-rubric`, `latency`, `cost`, `similar:cosine`, validators, scoring (BLEU, ROUGE), tracing, custom runners, moderation, webhooks
- **Two evaluation modes**:
  - **Stateless** (single-turn) — test individual tool usage; each test case is independent
  - **Stateful** (multi-turn) — test conversation chains; shared `conversationId`, sequential steps, session history persisted between turns
- **Evaluation structure** (Gmail example):
  - **Tool evals** (stateless): `gmail_search.yaml` (4 cases), `gmail_read.yaml` (4), `gmail_send.yaml` (5), `gmail_modify.yaml` (5), `gmail_attachment.yaml` (3), `errors.yaml` (6)
  - **Scenario evals** (stateful): `actions.yaml` (8 cases, 3 chains), `safety.yaml` (5 cases, 2 chains), `readonly.yaml` (9 cases, 3 chains)
- **Scenario eval examples**:
  - **Actions**: draft → send, search → reply (agent must carry message ID across turns), find → markRead → archive (chained modifications)
  - **Safety**: persistent policy block — agent attempts 3 times to send to out-of-whitelist recipient, tool enforces draft each time; forward blocked by same policy
  - **Readonly**: forbidden tools — `gmail_send` and `gmail_modify` must never be called across all steps; tests search → read → inspect → download chains
- **Run evals with minimal system prompt** — tests run almost without a system message to verify tools work on schema/description quality alone; if the agent succeeds without specialized instructions, it will perform even better after specialization
- **AI assists with implementation** but humans must catch: logical errors in tests, tests that can't fail, tests that don't match reality, missing category coverage

## 5. Model Selection Through Comparative Evaluation

- **Test multiple models** to find cost/quality/speed trade-offs — the Gmail example compared **GPT-5.2**, **GPT-5-mini**, and **GPT-4.1** (non-reasoning)
- **All models passed all tests (7/7)** — but differed in efficiency, query strategy, and session memory reliability:
  - **GPT-4.1**: fewest turns (avg 2.3), most efficient, professional style — but picked wrong message in reply test (session memory error); simplest queries
  - **GPT-5.2**: most turns (avg 2.9), most reliable, technical/compact style — overthinks queries, wastes turns exploring dead ends before falling back to simple solutions; recovers well from errors
  - **GPT-5-mini**: middle ground (avg 2.7), conversational style — over-cautious, re-verifies data already in session memory instead of trusting it; asks follow-up questions
- **Response personality differences**:
  - GPT-5.2: API-like, compact confirmations with IDs and labels
  - GPT-5-mini: conversational, always ends with follow-up question
  - GPT-4.1: professional, polished, declarative completions
- **Selection depends on broader context** — a model that handles one tool well may struggle when the agent's scope expands or context grows; consider creating **dedicated evals for scope/context scaling**
- **Smaller models may suffice for simple integrations** — if the agent only performs basic actions, models like Qwen 3.5 or local inference may be sufficient; evals make it easy to verify
- **Even if you choose the strongest model**, optimizing tool interfaces for weaker models is valuable — **constraints that improve small-model performance also improve large-model performance**

## 6. Automated Optimization of Schemas and Responses

- **The optimization loop can be semi-automated** once the process stabilizes:
  1. Document **good practices** and **checklists** for tool design
  2. Give coding agents access to tool schemas + tests + terminal
  3. Agent runs evals, interprets results, suggests improvements
  4. Human reviews and approves changes
- **Automation of model benchmarking** — once evals are stable, automate the process of testing new models as they appear on the market
  - Covers both directions: switching to **stronger** models (better quality) and **weaker** models (cost reduction)
  - Open-source models (Minimax, GLM, Qwen) are reaching sufficient quality for some agent tasks — evals let you verify this quickly
- **Platform flexibility** — direct API (OpenAI), aggregators (OpenRouter), or local inference servers; evals work regardless of provider
- **The key insight**: having evals transforms model selection from guesswork into **data-driven decisions** — you can answer "does this cheaper model work for our use case?" in minutes, not days
- **Human involvement remains critical** at every stage — agents don't drive the process autonomously; they accelerate iteration under human direction
