# S05E01 — Architecture

## 1. Characteristics of Generative AI Applications

- **AI can appear in any scope** — as the product's foundation (architecture shaped around it) or as one module (must fit existing structure); in both cases the architectural decisions are similar
- **Six key architectural areas** that generative apps introduce:
  - **Gateway** — centralized logic for all AI communication: connection management, request configuration, monitoring; must enable **free switching between models and providers**; implement via AI SDK, LiteLLM, or custom adapter
  - **API Layer** — specialized endpoints with typed contracts (e.g., `POST /product/review`, `POST /document/summarize`); client should **never have direct model access** (avoid generic `POST /api/chat`); constrain model contact at the API level
  - **Filesystem** — scoped permissions for agents acting on behalf of users; explicit read/write/delete rules per agent; harder than classical apps because **agents can unintentionally delete entire directories**; requires path sandboxing and audit trail
  - **Database** — additional structures for agent lifecycle: interaction history, scheduled tasks, agent definitions, tool configs, vector store; these structures **don't exist in classical apps**
  - **Dependencies** — libraries for evaluation, observability, document transformation (markdown), streaming markdown-to-HTML, semantic search, AI frameworks (if chosen)
- **Architecture diagram flow**: Client (Web/Mobile) -> Specialized Endpoints -> AI Gateway -> LLM Providers (interchangeable) -> Infrastructure (filesystem + DB) + Dependencies
- **Analogy**: integrating AI resembles integrating a **payment system** — you decide its role, organize data structures for the full process, connect to existing modules, and design for **multiple operators** with easy switching
- **Six "near-certainties"** across all generative projects:
  - **Centralize AI interactions** — building/sending queries from many places makes global settings and model switching extremely difficult
  - **Multi-provider openness** — don't lock yourself to one provider; better models from other vendors will appear
  - **Event streaming support** — inform users of progress, reduce perceived response time
  - **Multimodality readiness** — even if starting with text only, design DB schemas so adding image/audio is easy later
  - **Agent logic support** — even for a simple chatbot, use polymorphic `items` table (from S01E01) instead of flat `messages` to monitor actions **between** messages
  - **Long-horizon task handling** — in production, users close browser tabs and tasks exceed connection timeout limits

## 2. The Fundamental Product Characteristic in the AI Era

- **Core principle**: every system should be designed so that **further model improvements amplify its capabilities** — applies to business, product, and technology dimensions
- **Business risk** — building solutions that address areas where LLMs currently perform poorly is risky; if next-generation models solve that problem natively, your product becomes unnecessary or the investment never returns
  - Exceptions exist, but this is a **real risk** to account for
- **Technology implication** — systems must be **more amenable to modification than ever before**; architecture skills matter even more
  - **Implementation details** can block or severely hinder evolution
  - Special caution with **AI frameworks** — basing an entire app on foundations that are still changing creates fragility
- **Primitives over features** — the key architectural mindset shift:
  - **"Primitives"**: the most basic, simplest elements from which more complex structures can be built
  - **Feature-oriented thinking** (e.g., "chat"): leads to specialized, inflexible structures like a `messages` table with `role` (user/assistant) and `content` — schema is closed, new interaction types require structural changes
  - **Primitive-oriented thinking** (e.g., "events between actors"): leads to polymorphic `items` table with `type` enum (message, function_call, function_call_output, reasoning, ...) — schema is open, new actors and event types extend without breaking existing structure
  - Same primitive thinking applies to **artifacts** — instead of separate data structures for images, text files, binary files, use a single artifact entity with type metadata; artifacts can be assigned to users or agents, shared between them
- **Schema flexibility comparison** (from diagram):
  - `messages` table: id, conversation_id, role (user/assistant), content, created_at — **closed schema**
  - `items` table: id, agent_id, sequence, type (message/function_call/reasoning/...) with type-specific fields — **open schema**, extensible without breaking changes
- **Apply primitive thinking everywhere** — front-end, back-end, interface planning, business assumptions; but maintain balance — don't over-engineer for a future that may never come
  - In practice: "simple chatbot" quickly becomes an agent, sometimes a multi-agent system
- **Rapid iteration is essential** — changes that used to take a quarter or half-year now happen in weeks; architecture must support this pace
- **No definitive answer** on "how to design" for extreme flexibility — but focus on **primitives** (architectural sense), not features

## 3. Architecture for Chatbots and Agents

- **Context**: chatbot architecture requires conversations + message lists (two simple tables); but today almost every chatbot is actually an agent (visible in ChatGPT, Claude, coding tools)
- **Reference**: S02E04 covered context design and multi-agent architectures (Orchestrator, Mesh, Blackboard); in practice, **combine elements** rather than using pure forms
- **Example: `05_01_agent_graph`** — combines four architectural concepts:
  - **Orchestrator** — an agent with tools like `delegate_task` and `create_actor` to manage tasks and other agents
  - **Blackboard** — shared state layer containing sessions, events, tasks, relations, and artifacts; agents manage it through their tools (e.g., `write_artifact`)
  - **DAG (Directed Acyclic Graph)** — task relationships form a graph; a deterministic **scheduler** resolves dependencies, promotes tasks whose deps are met, holds back those still waiting
  - **Events** — every state change (task creation, artifact modification, tool call) emits an event via SSE (Server-Sent Events); used for visualization dashboard, but also useful for observation, evaluation, and guardrails
- **Key distinction from S03E02 heartbeat** — in the earlier example (`03_02_events`), the full task plan and dependencies were defined upfront; here the plan is **shaped dynamically** by the orchestrator agent — more flexible but less predictable
- **Flat implementation, hierarchical behavior** — every agent is the same structure; role is determined by **tools granted and system prompt**, not code

### 3a. DAG Scheduler — Deterministic Logic (No LLM)

- **Task state machine**: todo -> in_progress -> done | blocked | waiting
  - `delegate_task` with no deps -> `todo`
  - `delegate_task` with deps -> `waiting`
  - Scheduler picks up ready tasks -> `in_progress`
  - Actor completes -> `done` (unblocks parents)
  - Actor delegates children -> `waiting`
  - Error/block -> `blocked` (auto-retry up to 3 attempts)
  - Waiting with deps met + no children in flight -> promoted back to `todo`
- **Round loop** (up to 20 rounds):
  1. **Find ready tasks**: `todo` tasks, `waiting` whose deps are met with no children in flight, `blocked` with auto-retry whose timer elapsed; sort by priority (lower = first)
  2. **None ready -> exit**: session complete — all work done or permanently blocked
  3. **For each ready task** (sequential): set to `in_progress`, find assigned actor, run actor loop (LLM steps); result is done/waiting/blocked
  4. **Memory cycle**: Observer extracts from completed work, Reflector compresses if over budget, injected into next round's context
- **Stale recovery**: on session start, any task stuck in `in_progress` is reset to `todo`

### 3b. Execution Trace Example — Blog Post Task

- **Round 1**: Orchestrator receives user request ("write blog post about TypeScript 5.0"), creates Researcher actor, delegates research task, stops (root task -> `waiting`)
- **Round 2**: Researcher searches web, creates `research-notes.md` artifact (3,818 chars), completes task (-> `done`, writer task unblocked)
- **Round 3**: Orchestrator resumes, sees research done, creates Writer actor, delegates blog post writing; Writer reads `research-notes.md` artifact, writes `blog-post.md` (4,915 chars), completes task
- **Round 4**: Orchestrator resumes, sees all children done, completes root task, contacts user
- **Stats**: 4 rounds, 3 agents, 26 items
- **Memory flow**: Observer runs after each round — seals completed sequences, extracts key facts (goal, deliverables, findings, artifact refs), compresses to token budget

### 3c. Architecture Properties

- **Highly extensible** — works for simple AI conversations, tool use, and longer-horizon task execution
- **Amenable to fundamental changes** — can swap AI provider, modify tool/actor configurations
- **Background task support** — with or without human involvement; events emitted by the system support both modes
- **Cross-cutting concerns**: Memory (Observer/Reflector pattern injected into every agent context) + Event Bus (fire-and-forget typed events streamed via SSE, read-only — cannot affect execution)

## 4. Multi-Provider Integrations

- **Why multiple providers**: each offers unique strengths — Gemini for image editing, Anthropic for coding; using both for **separate logic** is straightforward (distinct codepaths)
- **The real problem**: multiple providers in **the same logic** (e.g., one agent on OpenAI, another on Anthropic) — requires a **translation layer** for request/response mapping
- **API differences are numerous**:
  - **Structure**: system message placement differs — OpenAI: inline with messages; Anthropic: separate `system` field; Gemini: `system_instruction` field
  - **Settings**: reasoning budget differs — Anthropic and Gemini use `budget_tokens`; OpenAI uses `reasoning_effort`
  - **Thought signatures**: required for preserving reasoning tokens — Gemini requires them in Interactions API (v3+, only on tool calls, only current turn); Anthropic has its own signature format
  - **Constraints**: Anthropic doesn't allow assistant message as first turn; Gemini recently added tool use with Web Search (previously blocked)
  - API differences **change constantly** — mapping providers creates ongoing maintenance burden

### 4a. Three Solutions for Multi-Provider Support

- **OpenRouter** — convenient, but supports only basic API features; rare bugs in mapping and signatures still occur
- **Libraries/Frameworks** (AI SDK, LiteLLM) — can block access to latest features; bugs in advanced logic get low fix priority
- **Custom logic** — maximum control, but full maintenance burden; choose a **default API format** for your system (currently Responses API is best due to popularity)
- **Decision depends on project needs**:
  - LLM-only work -> OpenRouter is a good choice
  - Libraries (e.g., AI SDK) -> good if your provider is supported or you can add a custom adapter; exercise caution based on practical experience
  - Custom logic with official SDKs -> best choice for most production projects today (author's primary approach)

### 4b. Multi-Provider Architecture Pattern (from diagram)

- **Unified endpoint**: your system sends `POST /v1/responses` with model name, instructions, input, reasoning settings
- **Provider router**: reads model field prefix to route (`gpt-*`/`o1-*`/`o3-*` -> OpenAI, `claude-*` -> Anthropic, `gemini-*` -> Gemini)
- **Field mapping per provider**:
  - OpenAI: **pass-through** (native format, no translation)
  - Anthropic: **translated** — instructions -> `system`, input[] -> `messages[]`, reasoning.effort -> `budget_tokens`, reasoning token -> `signature`; constraint: assistant msg must not be first turn
  - Gemini: **translated** — instructions -> `system_instruction`, reasoning.effort -> `thinking_level`, reasoning token -> `thought signature`; required on tool calls for Gemini 3+
- **Response normalization**: all provider responses normalized back to Responses API shape — unified `[{ type: "message", content: [...] }]` + usage + reasoning
- **Key property**: your code never changes — swap provider by changing the model name

### 4c. Custom Logic in the AI Era

- **Custom logic would never be recommended without coding agents** — building from scratch used to cost more than the benefits
- **With AI coding agents**: place official SDK files for target providers, discuss main assumptions with the agent:
  - Default API structure (request shape, response shape, streaming format)
  - Provider activation logic and settings mapping (e.g., `reasoning_effort`)
  - Which settings to support (likely only a subset)
- **Broader lesson**: before AI, we chose tooling and accepted whatever else it brought; now, for tools with **unstable foundations** or **still forming**, we can decide to replace them with custom logic
  - Self-building/maintaining logic **is no longer impractical in the AI era**
  - This doesn't mean rebuilding stable, long-standing tools and frameworks
- **Future outlook**: mature AI frameworks comparable to React/Vue/Angular/Svelte may emerge; even then, stay open to **new possibilities that generative AI offers** for programming
