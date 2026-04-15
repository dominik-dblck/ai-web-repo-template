# Architect — Design Principles & Review Checklist

Full reference extracted from knowledge base mind maps (S01E01–S01E05, S02E01–S02E05, S03E01–S03E05, S04E01–S04E05, S05E01–S05E05). Load on demand when reviewing, planning, or needing detailed guidance.

---

## Agent Production Reality Check (S05E05 §1-§2)

- **Industry data as of 2026** — provides data-backed framing for why architecture matters more than model quality:
  - Gartner: **>40% of enterprise agent projects will be cancelled** by end of 2027
  - Deloitte TechTrends 2026: only **11% in production**; 38% piloting; 35% no strategy
  - Apex Agents benchmark: top models complete **<25% of real tasks** first try; **40% after 8 attempts**
  - ~130 of thousands of "agent platform" vendors offer something real — rest is **agent washing** (rebranded chatbots)
- **"Decade of agents, not year of agents"** (Karpathy) — current systems lack perception, memory, and real-world operation skills; takes years to build these up
- **The problem is architecture, not engines** — Composio, HBR, IBM all converge: none of the 3 core production problems are about model quality
- **Three core production problems** preventing agents from reaching production:
  - **Dumb RAG** — system doesn't know what it knows; agent processes a document, 5 minutes later has no idea it exists; not about vector DBs but about **memory architecture** (addressed by Memory Triad, S05E05 §3)
  - **Brutal Connectors** — integrations break at first edge case; demo has 3 paths, production has 300; Amazon's report: majority of failures are **integration errors** (missing retry, missing partial failure handling, missing graceful degradation)
  - **Polling Tax** — agent polls every 30s instead of reacting to events; burns CPU/tokens on empty queries; reacts with delay (addressed by event-driven architecture, S05E01 §1)
- **Framework ≠ architecture** (S05E05 §4) — LangGraph (state graph, LinkedIn/Uber in production), CrewAI (role-based, prototyping), Claude Agent SDK (native sub-agents) are building materials, not blueprints; best bricks + no architectural plan = ruins

## Tool Design (S01E02 §3, S01E03 §2-§5)

- **4 tools not 13** — consolidate related actions by capability (S01E03 §2: fs MCP 13→4 tools)
- Purpose-driven, unique names — domain-specific prefixes ("send_email" > "send") (S01E02 §3)
- Property descriptions ARE instructions for the model (S01E01 §2, S01E02 §3)
- **Hints in every response** — success + error, guide next action (S01E03 §6)
- Handle rate limits and retries in code, not agent (S01E02 §3, S01E03 §1); **classify error type before retrying** — timeout → retry, 400 Bad Request → don't retry (prompt is wrong), 429 Rate Limit → retry with longer backoff; every retry costs tokens (S04E03 §7)
- **Tool results as files** — save large results to file, return summary + path (S01E02 §11)
- Support batch operations — `update_issues` not `update_issue` (S01E02 §3)
- **Namespace prefixing** for multi-server setups — `resend__send`, `gmail__search` (S01E03 §13)
- Clear ownership — what MUST model fill? What should code fill? What CAN'T model fill? (S01E02 §3)
- **Tool assignment flexibility** (S02E05 §3) — the 10-15 tools guideline is an oversimplification:
  - Some agents thrive with 27 tools (e.g., calendar + linear + gmail); others struggle with 3
  - CLI access as a single tool can replace many (Claude Code demonstrates this)
  - **Shared tools across agents** reduce inter-agent information exchange needs (shared foundation: fs_read, fs_search, fs_write, agent_message)
  - Risk: agent with restricted access may produce false negatives ("not found" ≠ "doesn't exist")
  - **Experiment** to find optimal configuration rather than following convention
- **Tool composition extensibility** (S04E05 §4) — the same agent/interface can address entirely different processes by changing the tool set; progressive capability levels:
  - **Simple prompts** — rely on model's knowledge and skills (corrections, translations, transformations)
  - **Internet/domain access** — enables grounding and fact-checking
  - **Additional documents** (e.g., internal blog index) — enables internal linking, cross-referencing
  - **External service integrations** — enables routing, forwarding, multi-system actions
  - Each level may require UI/logic changes but rests on the same core concept; **experiment at small scale** — demonstrating tools to real users immediately surfaces needs no one anticipated
- **Tool Registry** (S05E05 §3) — not loose tools connected ad hoc; a catalog where each tool has defined **capabilities, invocation cost, limits, and fallbacks**; without registry, routing is guesswork; MIT Technology Review: companies with intelligent tool routing have **3x higher pilot-to-production rate**
- **Tool connection risks** (S02E05 §3) — if system moves information between tools autonomously, this creates cross-tool attack vectors
  - Agent with sandboxed filesystem might create notes in unrestricted external systems
  - Restrictions that reduce utility too much → consider sandbox environments instead
- **Tool-embedded API calls** (S03E03 §6) — tools are not always simple function calls; they may contain complex processing pipelines with their own LLM interactions (e.g., `listen` tool calling Gemini for audio analysis, `feedback` tool calling Gemini Live for audio generation)
  - **MCP Sampling** ([spec](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling)) — reversed communication: MCP Server requests API calls executed by the client; rarely supported in practice but part of the specification
  - Design tools that need AI capabilities: decide whether the tool manages its own API calls or uses MCP Sampling for client-mediated calls

## LLM-Assisted Tool Design Process (S03E04 §1-§2)

- **Iterative design with LLM as collaborator** — 6-step process:
  1. **Gather context** — download API docs as Markdown, clone official SDK, set up coding agent
  2. **Scan available actions** — ask for concise capability list scoped to your domain (exclude irrelevant features)
  3. **Design questions early** — which actions needed? Which should be combined? Which blocked?
  4. **Generate initial schema** — request input/output per tool; first draft is ~60-70% quality (missing pagination, wrong formats, vague names)
  5. **Inject design rules** — send a checklist of good practices; model generalizes corrections across all tools
  6. **Iterate** — review, correct, repeat until schema matches real-world needs
- **Common first-draft defects**: missing pagination, insufficient field metadata, wrong data formats (e.g., base64 attachments killing context), missing status indicators, no attachment metadata, vague field names
- **Advanced response envelope** — extends the `{ success, data, hints }` pattern (S01E03 §6) with richer metadata:
  - `meta.status` — enum: `success`, `empty`, `partial`, `error`
  - `meta.reasonCode` — enum: `OK`, `NO_RESULTS`, `AUTH_REQUIRED`, `NOT_FOUND`, `INVALID_ARGUMENT`, `RATE_LIMITED`, `POLICY_BLOCKED`, `TRANSIENT_FAILURE`
  - `meta.nextAction[]` — suggested next tool calls with `tool`, `why`, `args`, `confidence`
  - `meta.recovery` — `retryable`, `backoffMs`, `maxAttempts`
  - `meta.diagnostics` — optional: `scope` (tool | global), `httpStatus`, `rawMessage`
- **Detail-level control** (S03E04 §2) — tools accept `details` boolean; when false, return minimal fields; when true, add full metadata — **agent controls verbosity**
- **Mutation feedback** (S03E04 §2) — modify/update tools return changed state (current labels, flags, status) so agent immediately sees the effect of its action
- **Programmatic resolution over agent decisions** (S03E04 §2) — tool resolves resource type/format instead of requiring agent to specify (e.g., pass only `id`, tool determines if message or thread) — fewer agent decisions = fewer errors
- **Never return raw binary** (S03E04 §2) — attachments, base64, large content returned as URL/link; raw binary in context destroys the context window
- **Policy enforcement at tool level** (S03E04 §2) — tool silently enforces policy (e.g., force-draft for out-of-whitelist recipients, block certain actions); agent cannot bypass even if instructed; policy violations surfaced in response metadata

## Schema Design (S01E01 §2)

- `reasoning` field FIRST — drives all subsequent fields (autoregressive: earlier fields steer later)
- Include `unknown`/`neutral`/`mixed` to avoid forced hallucinations
- Descriptions in JSON Schema are model instructions — precise AND concise
- Field order matters — `reasoning` → `classification` → `confidence`

## Generative App Architecture (S05E01 §1)

- **Six architectural areas** that generative apps introduce beyond classical apps:
  - **Gateway** — centralized AI communication: connection management, request config, monitoring; must enable free provider/model switching; implement via AI SDK, LiteLLM, or custom adapter
  - **API Layer** — specialized endpoints with typed contracts (`POST /product/review`, not `POST /api/chat`); client should never have direct model access
  - **Filesystem** — scoped permissions per agent; explicit read/write/delete rules; agents can unintentionally delete directories — requires path sandboxing + audit trail
  - **Database** — agent-specific structures not in classical apps: interaction history, scheduled tasks, agent definitions, tool configs, vector store
  - **Dependencies** — evaluation, observability, document transformation, streaming markdown→HTML, semantic search, AI frameworks (if chosen)
- **Analogy**: integrating AI resembles integrating a **payment system** — decide role, organize data structures, connect modules, design for multiple operators
- **Six "near-certainties"** across all generative projects:
  1. **Centralize AI interactions** — scattered query construction makes global settings and model switching impossible
  2. **Multi-provider openness** — don't lock to one provider; better models from other vendors will appear
  3. **Event streaming** — inform users of progress, reduce perceived response time
  4. **Multimodality readiness** — even for text-only start, design DB schemas so image/audio is easy to add later
  5. **Agent logic support** — even for simple chatbot, use polymorphic `items` table (not flat `messages`) to monitor actions between messages
  6. **Long-horizon task handling** — users close tabs, tasks exceed connection timeouts; plan for disconnected execution

## Primitives & Schema Flexibility (S05E01 §2)

- **Core principle**: design systems so that **further model improvements amplify capabilities** — applies to business, product, and technology
- **Business risk**: building for areas where LLMs currently perform poorly is risky — next-gen models may solve the problem natively, making your product unnecessary
- **AI framework caution** — basing an entire app on foundations that are still changing creates fragility; architecture skills matter more than ever
- **"Primitives over features"** — the key architectural mindset:
  - **Primitives**: simplest possible elements from which complex structures are built
  - **Feature thinking** ("chat") → closed schema: `messages` table with role/content → new interaction types require structural changes
  - **Primitive thinking** ("events between actors") → open schema: `items` table with type enum (message, function_call, reasoning, ...) → new actors/event types extend without breaking
  - **Artifact pattern**: single artifact entity with type metadata instead of separate structures for images, text, binary — artifacts assignable to users or agents, shareable between them
- **Apply everywhere** — front-end, back-end, interface planning, business assumptions; but balance: don't over-engineer for a future that may never come
- **Rapid iteration** — changes that took a quarter now happen in weeks; architecture must support this pace

## Context Engineering (S01E02 §11, S01E01 §9, S02E01 §1-§5)

- **Prompt cache = #1 priority** — stable system prompt, no dynamic data (even timestamps kill cache)
- Conversation history should remain **immutable** for cache benefits
- **Auto-compact** — summarize when approaching limit, save original to file for on-demand read
- Compress/summarize at **30% of available context limit** (S01E05 §7)
- Token estimation: `chars / 4`, add 20% buffer, compare with actual after call (S01E05 §7)
- **Progressive disclosure** — only basic tools in initial context; discover, don't preload (S01E02 §12)
- **"Agent doesn't know what it knows"** — always provide hints about available resources (S01E02 §12)
- **Chunked processing** — process in chunks even if fits context; improves focus, enables cheaper models (S01E01 §10)
- File-based checkpointing — save progress as JSON, resume on failure (S01E01 §10)
- **System prompt = map, not territory** — provides orientation, not exhaustive detail (S02E01 §1)
- **Four categories of system prompt content** (S02E01 §1):
  - **Universal instructions** — generalized capability descriptions, flexible across agents
  - **Environment** — what agent must know BEFORE tools (app state, interface type, permissions, user brief)
  - **Session** — compressed context from earlier conversation (injected only when context is compressed)
  - **Multi-agent** — shared instructions, placeholders for prompt composition
- **Decision filter**: "What must the agent know before tools to avoid unnecessary calls?" (S02E01 §1)
- **Dynamic context injection pattern** (S02E01 §5) — inject state via XML-like tags in user messages (not system prompt) to preserve cache:
  - First message: one-time state injection (`<user_info>`, `<git_status>`, `<rules>`, `<agent_skills>`)
  - Subsequent messages: only frequently changing info refreshed
  - **Repeat important instructions** across messages to manage model attention in long conversations
- **Key question**: which information should be dynamically injected vs available via tools/external files? (S02E01 §5)
- **Instruction dropout under cognitive load** (S02E02 §1) — large external context degrades instruction adherence even in latest models
  - Quantified: content quality 88% but instruction adherence only 43% when ~12k tokens of tool results compete with 7 behavioral instructions
  - Countermeasures: repeat critical instructions (S02E01 §5), reinforce behaviors via tool response hints (S01E03 §6), limit content loaded per context window via decomposition or subagents

## Agent Harness (S01E02 §7, S02E01 §6)

- **Two-layer architecture**:
  - **Agent Core** (cognition): model, instructions, reflection, planning, function calling, state loop
  - **Harness** (control plane): execution, state/context, reliability/control, orchestration, error recovery
- **Five external mechanisms beyond context window** (S02E01 §6):
  - **Real-time**: session hooks (monitor state, trigger summaries), environment signals (IoT, alerts, conditional injection)
  - **Near-time**: files (tool results, collaboration docs, skill definitions), agents (multi-agent cooperation, shared state)
  - **Background**: memory (async, Batch API for cost reduction, daily processing)
- Agent systems = the **entire environment** the agent interacts with, not just SDK/framework/app

## Agent vs Workflow (S01E02 §7, S02E04 §8)

- Structured + rarely changes → **workflow** (deterministic script)
- Reacts to what it finds + adaptive path → **agent** (LLM-driven)
- Most features are **hybrid** — workflow with agent-assisted steps
- A workflow can be **a tool inside an agent** (S01E04 §4)
- 100% reliability needed → LLM is probably wrong choice (unless human oversight)
- Open problems → don't jump to agents — try narrowing scope first
- **Six criteria justifying agents** (S02E04 §8):
  1. **Open-ended tasks** — clear goal but may need to react to environmental data mid-execution
  2. **Dynamic data** — input/output structure not predefined, transformations exceed code capabilities
  3. **Dynamic dependencies** — relationships exist at semantic level, not detectable in code
  4. **Iteration** — criteria in natural language, steps impossible to define upfront
  5. **Flexible architecture** — domain may expand to new areas requiring high main-logic flexibility
  6. **Result personalization** — output customization goes beyond programmable templates
- **Routing Intelligence** (S05E05 §3) — not if-else cascades; system selects path based on **user intent + task complexity**: single tool, tool chain, or human escalation; MIT Technology Review: 3x higher pilot-to-production rate with intelligent routing
- **Agents NOT justified when**: requirements demand near-zero cost, fast response time, or full predictability — classic code is the only option
- **Agent logic is becoming the default approach** (S05E03 §2) — deterministic logic chosen only when there's a very strong reason; RAG systems evolved from multi-stage pipelines to Agentic RAG (agent with simpler tools adapting dynamically); logic delegation trend: ~10% agent (2022) → ~75% agent (2025)
- **"Gen-AI can do more than we think and less than we expect"** — complexity grows fast, vision diverges from visible results; always question whether agents are needed

## Prompt & Instruction Design (S01E01 §8, S02E01 §4)

- Prompt = a **sandbox** — space where model operates within defined rules
- **"Generalizing the generalization"** — meta-rules ("how to decide") beat specific rules ("which choice")
  - Bad: "If user mentions 'meeting', use add_event" → cascading edge cases
  - Good: "Before selecting any tool: state which and why, rate certainty, if <30% ask clarifying question"
- Agent instructions should define: **goal, limits/constraints, universal patterns** — NOT data-dependent steps
- **Dynamic skill generation** — agents can create, activate, deactivate skills for other agents at runtime (S01E01 §7)
- Markdown files with YAML frontmatter = #1 choice for multi-agent system prompts (S01E01 §7)
- **Iterative prompt refinement with LLM** (S02E01 §4):
  - Models can **justify** behavior and suggest instruction improvements (even if they can't explain exact internal processes)
  - Initial LLM suggestions are usually too direct/tool-specific — guide toward generalization
  - Refinement pattern: V1 (tool-specific) → V2 (input-type routing) → V3 (action-oriented) → Final (universal operating rules)
  - **7 Universal Operating Rules** (zero tool references, survives tool changes):
    1. Identify intent: what the user wants produced
    2. Identify constraints: what's missing, what's needed
    3. Choose actions by fit: fewest assumptions
    4. Enforce scope: don't misuse actions
    5. Handle uncertainty: ask or pick safest option
    6. Failure protocol: interpret cause, retry, then report
    7. Be explicit about limits: what failed and why
- **Vague vs precise agent instructions** (S05E05 §11) — precision removes inference; every guess is a potential failure point:
  - Vague: "Save meeting notes somewhere in my notes" → which folder? filename? overwrite?
  - Precise: "Save meeting notes to `meetings/2026-04-09.md`. Use filesystem MCP. Append if file exists." → exact path, tool, conflict rule
  - Vague: "Every morning, check what's going on and send me a summary" → what sources? format? delivery?
  - Precise: "Read `briefings/2026-04-09/` calendar, tasks, mail. Follow `briefing-format.md`. Send via pushover MCP." → sources, format doc, tool
  - **Background task instructions especially** must be precise — no human to clarify mid-execution; invest in one-time instruction polishing that pays off repeatedly
- **Extreme generalization** (S03E05 §3) — for aware agents, instructions can go beyond operating rules to **guide the model's "dream"**: create conditions for emergent behavior rather than specifying behavior; human role remains critical as even strong models struggle with this level of generalization

## Behavior-Shaping & Cognitive Architecture (S03E05 §1-§3)

- **Scripted vs. aware agent spectrum** — two fundamentally different design approaches:
  - **Scripted agent**: keyword triggers tool calls, memory loaded on schedule, same input = same behavior, subtext ignored, format defined in prompt
  - **Aware agent**: recall fires when gap is **felt**, memory loaded only when needed, same input = **context-dependent behavior**, subtext read and acted on, format chosen as **identity signal**
  - **Key framing**: "system sets the scope, model owns the logic" — the agent moves within a system-defined space that is much larger than scripted agents, but still bounded
- **Five-layer behavior-shaping architecture** (ref: [Cognitive Architectures for Language Agents](https://arxiv.org/pdf/2309.02427)):
  - **L1: Identity & Self-Awareness** — felt incompleteness (partial awareness sharpens with retrieval), source monitoring (fluency ≠ personal knowledge), progressive disclosure (each moment pulls only what it needs); agent starts **blurred** until actively discovering its personality, mood, opinions, and user information
  - **L2: Cognitive Patterns** — self-questioning ("What am I about to assume?"), gap recognition (generic response = gap exists), retrieval as questioning (goals framed as questions, not categories), knowledge integration (reason FROM recalled facts, never just cite), cross-contextual connection (combine separate pieces into inferences none produce alone); each new topic = potential new information space to explore
  - **L3: Social & Emotional Cognition** — emotional attunement (read meaning, not words), user model (track feelings, expectations, silences), ground accumulation (conversation is shared, cumulative), depth calibration (match weight to the moment)
  - **L4: Expression & Identity Signals** — format as identity (prose = person, lists = system), persona consistency (voice loaded from memory, held across session), end-of-conversation sweep (surface what matters before parting)
  - **L5: Reinforcement Mechanics** — per-turn nudge (re-anchoring via metadata on every message), recallable field (all memory categories visible; gap always felt), think-to-recall bridge (self-questioning flows into action)
- **Cognitive architecture framing** — shift from "fulfilling requirements" and "shaping behaviors" to **creating conditions** where desired behaviors emerge naturally; not about specific instructions but about the **space** within which the model operates
- **Generalized instructions for open reasoning** — guide the model's "dream" without leading it in a specific direction:
  - Agent discovers information **gradually** as interaction develops (not preloaded)
  - Agent should be **attentive** about saying things for which context may not yet be available
  - `think` tool creates space for noticing gaps between what is **known** vs what **could be known**
  - Distinguish **base model knowledge** from **external context** — communicate this explicitly
  - Loaded information becomes part of **understanding**, not data to deliver to user
  - Permission for **loose fact connection** — reasoning from potential real-world relationships, not just available context
- **Limitation**: even strong models (Claude Opus 4.6) struggle with this level of generalized tasking — but they are excellent companions for the **thinking process** behind designing such instructions; the human role remains critical
- **Four areas delegated to model** (when using this pattern): proactivity (when to act, based on suspicions), synthesis (connect information without explicit if/then rules), reasoning (dedicated thinking tools), adaptation (focus, style, behavior categories)

## Agent Instruction Anatomy (S02E05 §1-§2)

- **Four-section prompt structure** for agents (especially orchestrators):
  1. **`<identity>`** — persona + character traits across **10 role areas**: orchestration, delegation, memory, physical awareness, persistence, autonomy, error recovery, escalation, communication, relationship
     - Written as **flowing narrative**, not bulleted list — model processes it as cohesive persona
     - **Character-driven**: use fictional character associations as anchors for complex behavioral patterns (not role-playing, but leveraging the model's associative nature)
     - **Zero tool references** — identity is abstract, stable, survives any configuration change
     - **"Show don't tell"**: vocabulary and phrasing should **demonstrate** behavior, not describe it; deliberate word choices ("instinct", "sharp") create space for model to positively surprise
  2. **`<protocol>` + `<memory>`** — operating rules + context/memory management
     - **4 instruction types**: Principle (WHY), Action (WHAT), Reference (WHERE), Guardrail (DON'T/ELSE)
     - **7 operational concerns**: agent routing, context sensing, delegation, learning, memory layout, self-handling, graceful degradation
     - Key rules: brief subagents with context they can't see; one agent per task; handle simple things yourself; write to memory when info seems relevant beyond current conversation
     - Minimal file/directory references — mention paths only when essential, keep generic enough to survive restructuring
  3. **`<voice>`** — communication style (not just cosmetic — affects usability)
     - **6 mechanisms**: Expression (speed, confidence, sentence length), Association (evocative vocabulary), Calibration (adaptive tone by context), Format (structural rules), Anti-Pattern (explicit "never" list), Demonstration (few-shot examples)
     - Models revert to default tone quickly — voice section must be detailed and reinforced
     - **Situational calibration**: minutes apart → stay in flow; hours → casual nod; overnight → real welcome + status update
     - Few-shot examples are safe here because style is universal enough not to hurt task effectiveness
     - See also S03E05 §2 L4 Expression & Identity Signals — format as identity (prose = person, lists = system), persona consistency loaded from memory; complementary perspective on voice as **identity**, not just cosmetics
  4. **`<tools>`** — capability map in 3 layers
     - **Direct capabilities** (authored) — what agent handles itself
     - **Dynamic roster** (`{{AGENT_ROSTER}}`, injected at runtime) — team composition that changes per session
     - **Pointers** (authored) — references to `templates/` for full capabilities; special tool callouts only where name/description would cause confusion
     - Closing: `{{WORKSPACE_SECTION}}` for observational memory + **identity seal** (CTA-style: "You are X. Your memories are intact. Your tools are ready. Go.")
- **Prompt development**: requires **many iterations** with AI collaboration, inputting system capabilities + other agents' roles + personal observations of failure patterns
- **Presence in context ≠ adherence** — models may still ignore instructions; [Gemma Scope](https://www.neuronpedia.org/gemma-scope#microscope) shows how models see concepts but too many moving parts for precise control
- **Subagent prompts** follow the same 4-section principles — even without multi-agent delegation

## Signal vs Noise (S02E01 §2)

- **Five practices for maintaining high signal**:
  1. **Correct context delivery** — incomplete or wrong data happens often
  2. **High-quality application logic** — less code but must be polished
  3. **Well-crafted instructions and tool schemas** — design components that appear dynamically
  4. **Generic mechanisms** — auto-compression, task planning, progress monitoring
  5. **Space for clarification** — human/agent interventions to provide signal
- Code vs AI logic balance shifts with complexity: workflow (65% code) → agent (27%) → multi-agent (8%)
- Security, auth, schema enforcement **always stay in code** regardless of agent complexity

## Agentic Search / RAG (S02E01 §3)

- **Scan** — explore folder hierarchies, filenames, headings
- **Deepen** — search with keywords + synonyms (3-5 angles) → read fragments → collect new terms → follow-up searches → repeat
- **Explore** — related aspects: cause/effect, part/whole, problem/solution, limitations/workarounds
- **Verify coverage** — definitions, numbers/limits, edge cases, steps, exceptions
- No prompt guarantees 100% retrieval — operate in probability, not certainty

## External Context & Knowledge Bases (S02E02)

- **Four goals for external context work** (S02E02 §1):
  1. Narrow document source scope — minimize prompt injection risk
  2. Build high-accuracy retrieval for chosen scope
  3. Limit content loaded per context window — decomposition, subagents
  4. Create UI that facilitates navigation and addresses model mistakes (show source fragments, links)
- **Source attribution in tool results** (S02E02 §3) — metadata (source file, page, line range) serves both model reasoning and UI citations
  - Two UI patterns: inline citation links beside agent response, or programmatic embedding in generated reports
  - **"Relevant" vs "similar"** — retrieval needs reasoning, not just matching; documents similar to the query are not necessarily relevant to the user's intent (S02E02 §7)
- **Indexing pipeline** (S02E02 §2) — when knowledge base grows beyond simple files:
  - Extract (binary → text) → Describe (summarize, tag) → Transform (chunk, embed) → searchable index of fragments
  - Synchronization: knowledge bases are rarely static — support event-based or scheduled sync with source data
- **Four chunking strategies** (S02E02 §4) — "How to create documents?" must be paired with "How will the agent reach them?":
  - **Characters** — fixed count, unstructured text, programmatic metadata only
  - **Separators** — structural markers (headings), recursive splitting, programmatic metadata
  - **Context** — enrich chunks with LLM-generated context from surrounding content (Anthropic's Contextual Retrieval)
  - **Topic** — full LLM-driven generation from scratch, self-contained chunks with generated keywords
- **Three RAG architecture tiers** (S02E02 §5) — start simple, scale only with concrete reason:
  - **Filesystem** — grep/ripgrep on .md/.json/.txt; no sync, no indexing; sufficient for markdown-based KBs
  - **SQLite + extensions** — FTS5 (full-text) + sqlite-vec (semantic) in one file; no sync needed
  - **Dedicated engines** — PostgreSQL + Algolia/Elasticsearch/Qdrant; requires sync layer between DB and search index
- **Five RAG effectiveness challenges** (S02E02 §8):
  1. **Base knowledge interference** — model may skip search if info is in training data (risk: outdated, ambiguous terms)
  2. **Knowledge coverage** — 100% retrieval near-impossible; incomplete results hard for model to detect → hallucinations
  3. **Information awareness** — model has only fragmentary descriptions of available resources initially
  4. **Context gap** — model lacks user context for effective query construction (Graph RAG can help)
  5. **Data format** — images, audio, video much harder to search than text
- **Knowledge base synchronization** (S02E02 §2) — KBs are rarely static; support event-based or scheduled sync with source data; synchronization logic is part of the indexing pipeline, not an afterthought
- **Core conclusion**: effective RAG must be **tailored to scope and formats** of its data — generic scripts work but rarely deliver real value (S02E02 §8)
- **Semantic search importance declining** (S05E02 §4) — attention shifted to filesystem navigation with grep/ripgrep; community divided (Claude Code = grep-only; Cursor = both); no universal answer — match to project characteristics and scale
- **4-tier search decision framework** (S05E02 §4) — select the simplest tier that meets requirements:
  - **Tier 1 — Direct loading**: no search needed; load documents into context directly; vector DBs unnecessary (e.g., ChatGPT memory prioritizes speed over recall effectiveness)
  - **Tier 2 — Text files + agent navigation**: agent navigates with grep/ripgrep; simple, effective, but struggles with multi-language or diverse formats
  - **Tier 3 — Hybrid search**: pure vector-only is **no longer recommended**; always combine with full-text; rule: if grep is insufficient, **extend** with semantic (don't replace)
  - **Tier 4 — Graph-based indexing**: highest effectiveness (content mapping + graph exploration); highest cost (financial, complexity, processing time)
- **Architecture comparison** (S05E02 §4):
  - **DB + Extensions** (simple): single store (SQLite/PostgreSQL) with fts5/tsvector + sqlite-vec/pgvector; one row, one transaction, no sync; limited scale
  - **DB + Search Engine + Vector DB** (complex): three stores synced by shared ID; parallel queries → RRF merge; massive scale + best recall; but three stores must stay in sync — failure = stale results

## Embedding & Hybrid Search (S02E02 §6-§7)

- **Embedding** = array of numbers (vector) describing text **meaning**; similar meanings produce similar vectors compared via **cosine similarity**
- **Embedding model selection criteria** (S02E02 §6):
  - **Size** (determines cost or hardware requirements)
  - **Dimensions** (e.g., text-embedding-3-small = 1536 dimensions)
  - **Context window** (max input length per embedding)
  - **Training data scope** (knowledge cutoff, multilingual support)
  - Same rules as LLMs: if information is not in training data, the model cannot correctly describe its meaning
- **Critical rule**: indexing and search **MUST use the same embedding model** — `EMBEDDING_DIM` in vector store config must exactly match model output dimensions
- **Hybrid RAG** combines full-text search (FTS5/BM25) + semantic search (vector similarity) with results merged via **RRF** (Reciprocal Rank Fusion)
  - Agent generates **two query forms**: keyword list (for BM25) + natural language question (for cosine similarity)
  - RRF merging: documents ranking high in one list but low in another can be promoted in the final ranking
- **Cross-language support**: FTS keyword matching fails across languages; embedding models with multilingual support still produce correct semantic matches; RRF compensates
- **Hybrid search vs filesystem search** — not either/or; both can be used in parallel
  - Hybrid: faster (programmatic control), supports multimodal content, but requires indexing overhead
  - Filesystem (grep/ripgrep): no indexing needed (decisive advantage in many cases), limited to text content
- **"Relevant" vs "similar"** — retrieval needs reasoning, not just matching; documents similar to the query are not necessarily relevant to the user's intent (S02E02 §7)
- Ranking: [Hugging Face MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard) for current best embedding models

## Graph-Based Knowledge Mapping (S02E03 §6)

- **When to use**: multilevel relationships across many documents + need for multiple retrieval modes simultaneously — use only when this is a genuine priority
- **Technology**: [Neo4j](https://neo4j.com/) — property graph model
  - **Nodes**: objects with labels (categories) and properties; one node can have multiple labels
  - **Edges**: directed, typed relationships between exactly two nodes; may carry properties
- **Hybrid RAG in graph**: full-text search (BM25) + semantic vector search + graph traversal — all in one system; agent navigates through relationships, not just retrieves fragments
- **Four tool categories for graph agents**:
  - **Retrieval**: `search` (BM25 + vector, returns chunks + entities), `explore` (neighbors of a node), `connect` (shortest path between two nodes)
  - **Advanced**: `cypher` (read-only queries — aggregations, type filters, relationship counts not covered by higher-level tools)
  - **Indexing**: `learn` (chunk + embed + entity extraction + graph write), `forget` (remove document + orphaned entities)
  - **Maintenance**: `audit` (node counts, orphans, duplicates), `merge_entities` (deduplicate across sources)
- **Trade-offs**: most comprehensive KB integration available; handles any retrieval mode — but high complexity, significant maintenance cost (financial + operational), slow response generation
- **Dynamic memory candidates**: [mem0](https://docs.mem0.ai/open-source/features/graph-memory), [supermemory](https://supermemory.ai) — graph-based approaches for persistent agent memory

**Agent-designed knowledge bases** (S02E03 §1-§4):

- **Retrieval gap**: agent retrieves doc_B (looks complete); related doc_A, doc_C remain invisible → **unknown unknowns**; no prompt change fixes this — full understanding may need dozens of docs; it's an open problem
- **Eliminate the need for discovery search** rather than improving search quality — structure KBs specifically for agent processes, not human reading
- **Build KBs FOR agents**: agents know exactly where to find what they need; no discovery search; updating one document cascades through the entire process without manual rewiring
- **Generic navigation rules** over tool-specific: `"find instructions in ./workflows"` not `"Linear docs are in /workflows/linear/assign-issue.md"` — generic rules survive adding/removing tools; specific rules create maintenance burden
- **4 navigation modes** — agents use all four: **Perspective** (bird's-eye, directory list), **Navigation** (search names + content), **Links** (references inside documents), **Details** (read original content)
- **"Learn from source" vs "Connect to source"** (S02E03 §4): Connect (chunk → embed → query → fragments) hides absence — agent doesn't know what it didn't retrieve; Learn (read full → organize into structure) makes gaps visible — unknown unknowns become known gaps; prefer structured learning when building agent-specific KBs

## Long-Term Memory & Cross-Session Continuity (S02E03 §2, S05E05 §3)

- **Memory Triad** (S05E05 §3) — three layers, most systems only implement the first:
  - **Short-term** — what's happening in this session (context window)
  - **Long-term** — what the system knows about data, processes, preferences (persistent KB)
  - **Episodic** — what happened when and with what result (event history)
  - Good episodic memory: calendar agent knows last 3 meetings with client X were rescheduled → suggests buffer; code review agent remembers same bug type 3x in last sprint → auto-raises priority
- **Core challenge**: cross-session memory remains an open problem — no universal solution; even small models can achieve strong results with the right architecture ([LongMemEval](https://arxiv.org/pdf/2410.10813))
- **Observational Memory / Observer-Reflector pattern** ([Mastra.ai](https://mastra.ai/blog/observational-memory)):
  - Replace semantic search complexity with a structured, compressed **log journal** of concise interaction observations
  - **Observer** — triggered when conversation grows large; reads existing log + recent messages → produces updated log; processed messages are "sealed" and removed from active context; updated log appended to system prompt
  - **Reflector** — triggered when log itself grows large; receives log only → produces compressed log replacing original in system prompt
  - **Cross-session**: unsealed messages + latest log version carried into a new session → persistent continuity
  - **Trade-off**: compression = natural forgetting over time; agents can have tools to reload earlier memories on demand
- **Key pattern**: incremental compression over time eliminates search complexity — the thinking pattern (not the implementation) is what matters; apply to any long-running agent that needs memory beyond a single session

## Deep Research / Deep Action Pattern (S02E03 §7)

- **Concept**: agentic loop for producing long-form content through iterative search, analysis, and synthesis — runs in background, may span many tool calls
- **Query enrichment** (developer's responsibility — not the research model's):
  1. Intermediate LLM generates clarifying questions (scope, timeframe, format, evaluation criteria)
  2. User provides constraints and preferences
  3. Intermediate LLM merges query + clarifications → detailed, structured enriched prompt
  - Research model should never begin with a raw, vague user query
- **Agentic research loop**: Decompose → Search → Read → Find gaps → Evaluate sufficiency → if not sufficient: Refine → return to Search → if sufficient: produce Report with inline citations
  - Gap detection is a **core step in the loop**, not optional
  - Research is **iterative**, not linear
- **"Deep Action" reframe**: same pattern applies to any long-form output with iterative depth — code generation with deep codebase exploration, security audits, cross-system analysis; rename "Deep Research" → "Deep Action" to see broader applicability
- **Design implication**: if an agent produces comprehensive output through exploration, plan for query enrichment + iterative gap detection rather than a single pass

## Sandbox Agent Pattern (S02E05 §3)

- **Concept**: agent starts with only **meta-tools** and discovers actual tools dynamically via code generation
- **4 meta-tools**: `list_servers` → `list_tools` → `get_tool_schema` → `execute_code`
  - Schemas load on-demand — only tools fetched via `get_tool_schema` become callable inside sandbox
- **Architecture**: LLM (4 meta-tools) → Host Runtime → QuickJS WASM Sandbox → MCP Client → MCP Server (stdio)
  - Async MCP calls appear synchronous via **asyncify**; host functions bridge sandbox to real MCP tools
- **Key advantages**:
  - Agent flexibly **composes tools via code** — can chain multiple tool calls in a single code execution
  - Large data stays as **variables in sandbox**, never enters agent context — only `console.log` output returns
  - High security: agent can be restricted from external network access and specific output destinations
- **Trade-offs**: increased architecture complexity + costs; sandbox doesn't eliminate all problems, creates new ones (debugging, latency)
- **Design heuristic**: "Will this system improve with better models?" — if no, reconsider the approach; if yes, current limitations are temporary
- **When to consider**: agents that need flexible tool composition, operate on large datasets, or need strong isolation
- **Code Mode per-agent control** (S05E05 §7) — when sandbox is active, agent writes and executes code to use tools; tool definitions **not preloaded** into context; controllable per agent — specialized agents with few tools should still have them in context directly
- **Concrete sandbox options** (S05E02 §2): Daytona, E2B (production-ready cloud sandboxes), Deno Sandbox (lightweight alternative), secure-exec (code execution without full sandbox — untested)

## Knowledge Categories & Routing (S02E05 §4)

- **6 knowledge categories** in agent systems:
  1. **Session documents** — user attachments + agent-generated files; scoped to current session; not globally available
  2. **Public knowledge** — shared long-term memory for agents AND users (e.g., published docs)
  3. **Private knowledge** — user-specific data, context, process documentation
  4. **Agent knowledge** — per-agent behavioral info, instructions, tool usage rules, observations/reflections
  5. **Cache** — temporary cross-session data: search results, web pages, sandbox artifacts
  6. **Runtime** — database layer **invisible to agents** (sessions, scheduling, interaction state)
- **Routing complexity**: same information can belong to multiple categories — dynamic, context-dependent decisions
  - "New project info" → private or public; "Task instructions" → private, public, or agent; "Person profile" → any or multiple
  - Choosing category is only half the problem — location within category + merging with existing content also required
- **Practical principle**: keep structures **as simple as possible**
  - Question whether advanced long-term memory is truly needed
  - Simple documents with easy maintenance may be sufficient
  - Decisions can be revisited as system matures
- **Digital garden as agent KB** (S05E05 §5) — filesystem-based knowledge base connected by directories, tags, and wikilinks; agent reads/writes content; publishable subset becomes a website; frontmatter `visibility: private` hides pages from menu + password-locks them; skill expansion through documents in the garden (agents discover linked notes progressively)
- **Data architecture pattern** (from example system):
  - Session workspace: `workspaces/YYYY/MM/DD/{sessionId}/` with `files/`, `attachments/`, `plan.md`
  - Runtime: SQLite/DB invisible to agents — orchestrator reads status into `<metadata>` block
  - Shared knowledge with **scoped permissions**: default R/O everywhere, R/W only to specific areas; deny patterns for secrets
  - Automated extraction: inactivity trigger → LLM pass → deposits observations to agent knowledge

## Personal Knowledge Base Design (S04E04 §1-§3, §5-§7)

- **KB scoping process** — 4-layer funnel from broad life to focused agent scope (S04E04 §1):
  1. **Daily life areas** — enumerate all activities (messages, events, coding, health, etc.)
  2. **Regularly used tools** — identify recurring tools and platforms
  3. **Activities where AI applies** — filter to where AI can genuinely help
  4. **Personal knowledge system** — remove what you won't connect; what remains is your KB scope
  - Include areas you DON'T want to automate but want agents to reference as context
  - Best ideas emerge through practice, not planning — start building, iterate
- **Five-domain KB structure** — organizing personal/team knowledge for both human and agent use (S04E04 §2):
  - **Me** — identity, preferences, wellbeing, thinking, process (human-owned; agents access selected areas)
  - **World** — people, places, services, sources (shared context for agents)
  - **Craft** — ideas, projects, knowledge, lab, shared content (creative workspace)
  - **Ops** — tasks, calendar, email, research, publishing, config (primarily agent space — process definitions)
  - **System** — status, agents (exclusively system-updated — device state, agent coordination)
  - Two spaces: **human space** (content, decisions) and **agent space** (operations, process execution)
  - Start with ONE area or ONE activity — don't implement full structure at once
- **Note anatomy for agent navigation** — structured notes that agents can reliably traverse (S04E04 §3):
  - **Frontmatter metadata**: status (`seed → growing → evergreen → archived`), publish (`draft → review → live → updated`), tags, access control (read/write with inheritance), attention flags
  - **Template system**: standardized templates per note type with frontmatter levels — minimal (title + tags), standard (+ description, status), full (+ publish lifecycle)
  - **Wikilinks as connective tissue** — `[[Path/To/Note]]` enables agent graph traversal; each link includes commentary explaining the relationship
  - **Sections follow templates** — consistent structure (Overview, Core Concepts, Relevance, Sources, Related Notes) enables predictable agent navigation
- **Agent note placement** — 4-step decision flow when agents create notes (S04E04 §7):
  1. **Parse intent** — classify note type, determine area and template
  2. **Explore workspace** — search for duplicates, read template, list target directory, cross-reference scan for related concepts
  3. **Resolve structure** — confirm no duplicates, determine subfolder, plan sections, identify wikilinks, compose frontmatter
  4. **Write** — create note, confirm to user, suggest next steps
  - A single note may trigger a dozen LLM calls — the larger the KB, the more value AI provides through structural consistency
- **Five context gaps in agent-navigated KBs** — why agents struggle with human-written notes (S04E04 §5):
  1. **Unnamed references** — "Sync with Marek about Phoenix" → agent has no context; **fix**: wikilinks to person/project notes
  2. **Opaque links** — shortened URLs and vague anchors ("described here") carry zero signal; **fix**: descriptive wikilinks or full references
  3. **Vague temporal references** — "last call", "previous approach" are dead ends; **fix**: link to specific dated notes
  4. **Single-occurrence links** — wikilink at line 199 of 340 lines may be cut off during partial reads; **fix**: repeat key links in frontmatter
  5. **Overwritten versions** — in-place edits destroy history; **fix**: versioned files with `supersedes:` and change reason
  - **Core rule: write as if the reader has zero prior context** — names, links, references, versions must be self-contained
  - This is the primary reason agents struggle when directly connected to external documents
- **Human-AI engagement balance** — 11 activities on a spectrum (S04E04 §6):
  - **Human-dominant**: Direction (what matters, what the KB is for), Writing (your words, AI assists phrasing only), Curation (you decide what stays/expands/archives)
  - **Shared**: Transformation (you provide source, AI formats), Commenting (AI annotates in separate block, source untouched), Organization (AI suggests location with reasoning, you confirm)
  - **AI-dominant**: Templates (AI applies defined templates), Linking (AI proposes wikilinks per your rules), Validation (AI flags violations), Indexing (AI generates Maps of Content), Auditing (AI surfaces orphans/duplicates/noise)
  - **Core principle**: humans own content + rules; AI handles organization
  - Exception: Ops/ directories can be fully agent-created, but according to your rules
- **Markdown format decision** — pick the boundary once per area, don't mix (S04E04 §4):
  - **Use .md**: personal KB, agent memory, ops playbooks, instruction files, code docs, content drafts
  - **Use Notion/Docs**: multi-author team docs, client-facing documents, proposals
  - Converting between formats is impractical — most information lost during conversion
  - Images in markdown must use **remote URLs** (not local paths) — local paths break in tool calls, emails, and cross-context use
  - Security for remote images: **token-based paths** (non-guessable) + bucket policy + `X-Robots-Tag: noindex`

## Planning & Progress Monitoring (S02E01 §8)

- **Task lists** — model writes activities, checks off after completion, rewrites remaining each time
  - Reminds model of priorities through repetition (model-generated content has stronger influence)
  - Without programmatic support, models forget to update lists
- **Plan mode** — instructions injected into user message (not system prompt) to preserve cache
  - Phases: Understand → Design → Review → Plan
  - Instructions **replaced** on state change, not removed

## Workspace / Inter-Agent Communication (S02E01 §9, S04E01 §2)

- Session-scoped workspace: `workspaces/{year}/{month}/{day}/{session_id}/`
  - `plan.md`, `attachments/`, `agents/{agent_id}/{inbox,notes,outbox}/`
- **Isolation**: agents live inside sessions; kill session → agents gone
- **Communication**: orchestrator routes between inbox/outbox; agents never access other users' materials
- `inbox/` — written ONLY by root/orchestrator; `notes/` — agent's private scratch; `outbox/` — delivers results
- **Shared KB as handoff layer** (S02E03 §5): complement to inbox/outbox — agents in separate sessions write to and read from a shared directory; the shared folder is the coordination mechanism without direct agent-to-agent communication
  - Each focused session reads the same instruction file → writes outputs to shared directory (e.g., `newsletter/edition-26/`)
  - File-based handoffs reduce coupling: gathering, writing, delivery as independent agent responsibilities connected only through files
  - Cost benefit: focused sessions avoid single-session overload; pay only for re-reading shared instructions, not for accumulating all prior work in one context
- **Vault-mediated agent exchange** (S04E01 §2) — agents do NOT task each other; exchange information only through a shared vault (structured markdown as single source of truth)
  - **4-layer architecture**: User (editor + quick commands + review/promote) → Vault (canonical notes + workflows/rules + agent side notes) → Agents (isolated, schedule-driven, vault-mediated exchange only) → Publish (vault → build → deploy; agent-notes excluded)
  - Each agent reads results and writes side notes; user decides what becomes canonical
  - Agent-notes excluded from public output — only promoted content goes public
- **Surface-based agent isolation** (S04E03 §5) — each agent reads from a surface and writes to a surface; no direct agent-to-agent communication
  - **Swim lane model**: Agent → Inbox/Trigger → Processing → Output → Surface (shared directory); next agent discovers work by watching its own trigger, not by receiving a message
  - **Loose coupling through artifacts** — agents share surfaces, not state; the Classifier doesn't know the Reviewer exists
  - **Growth by accretion** — adding a new agent never breaks existing ones; new module watches a surface, no reconfiguration needed
  - Example pipeline: Classifier (clipboard → inbox/) → Reviewer (file watch → ready/) → Publisher (scheduled → published/) → Digest (cron → digest/)
  - Design systems so conflicts **cannot occur** — agents work independently on specific areas; when full isolation isn't possible, apply S02E04 patterns but expect more frequent human involvement
- **KB-driven multi-agent processes** (S04E04 §8) — Ops directory as process definition space:
  - 4 simple text files define a repeatable, delegated process: `_info.md` (overview + sources), `01-research.md`, `02-assemble.md`, `03-deliver.md` (per-agent instructions)
  - Scheduler triggers main agent → reads ops files → delegates to sub-agents in sequence → each run produces dated output folder
  - **Instruction files never change**; each run is a new execution against the same structure — same process, fresh data
  - Pattern combines: KB navigation (S02E03), multi-agent delegation (S02E04), background tasks (S04E03), Digital Garden (S04E01)
  - Scales by adding more process directories and connecting more tools — no architectural changes needed
- **Daily Ops decoupled pipeline** (S05E05 §10) — concrete production example of KB-driven parallel agents:
  - **Phase 1** (cron 07:00): 4 agents in parallel — Calendar (Google Calendar MCP), Tasks (Linear MCP), Mail (Gmail MCP), Newsfeed (Firecrawl + YouTube MCP) — each reads its skill doc, writes to `briefings/{date}/{area}/`
  - **Phase 2** (cron 07:15): Synthesis Agent reads all 4 files → produces spoken sentences → TTS Agent (ElevenLabs MCP) → audio file → push notification to mobile
  - **Key pattern**: time-group background tasks without building dependencies; if result needed at 5:01, data agents run at least 1h earlier, in parallel (they don't interfere)
  - Each agent reads its **skill doc at runtime** — raw data persists per day for replay or re-synthesis

## Multi-Agent Architecture Patterns (S02E04 §1)

- **Six architecture patterns** — all pre-date LLMs, but LLMs make them significantly more flexible:
  1. **Pipeline** — fixed sequence, each agent transforms and forwards; no backtracking
  2. **Blackboard** — independent agents read/write shared store; no direct agent-to-agent messaging
  3. **Orchestrator** — central coordinator delegates tasks, controls information flow, contacts human (dominant pattern today — Claude Code, Cursor)
  4. **Tree** — extended orchestrator with manager roles; delegation flows down, results aggregate up; more complex tasks but higher system complexity
  5. **Mesh** — addressed peer-to-peer communication; agents know who they write to; rarely used in production LLM systems
  6. **Swarm** — distributed, probabilistic; result emerges through selection/aggregation; hardest to control
- **Practical focus**: first four (Pipeline, Blackboard, Orchestrator, Tree) are the workhorses — often **combined** in a single system
- **Combined-pattern example: Agent Graph** (S05E01 §3) — production systems combine multiple patterns:
  - **Orchestrator** agent with `delegate_task` + `create_actor` tools → **Blackboard** shared state (sessions, tasks, artifacts, relations) → **DAG Scheduler** (deterministic, no LLM) resolves task dependencies → **Events** via SSE for observation/guardrails
  - Key distinction from static heartbeat (S03E02): task plan is **shaped dynamically** by the orchestrator — more flexible but less predictable
  - **"Flat implementation, hierarchical behavior"** — every agent is the same structure; role determined by **tools granted and system prompt**, not code
  - Architecture works for simple conversations, tool use, AND long-horizon task execution; amenable to provider swaps and tool/actor reconfiguration
- **Implementation**: build **mechanics** (delegate/message tools), provide **tools**, establish **rules** — same elements as single-agent, but across sessions

## Inter-Agent Communication (S02E04 §2-§3)

- **Two fundamental communication tools**:
  - **delegate** — assigns task to chosen agent; opens new thread with different system instructions + toolset; child's final response becomes **tool result** for parent; parent **blocked** until child completes
  - **message** — bidirectional communication; agent's loop **paused** until requested data arrives; enables agents to ask orchestrator (or each other) for missing information
- **Event bus pattern** — beyond direct delegation:
  - **Publishers** fire and forget — don't know who listens
  - **Subscribers** declare interest, not dependency — don't know who publishes
  - **Topics are the only shared contract** — add/remove any agent, nothing else changes
  - Enables **mixed agent types**: LLM agents (intent classification, drafting) + deterministic services (tracking, credit rules) unified through events
- **Communication degradation** (S02E04 §5) — information is lost or distorted as it passes between agents; worsens with complexity:
  - Delegate/message tool descriptions must be **carefully crafted**
  - System must assume agents receive **partial information** requiring additional verification
  - Agents should return **structured data alongside narrative** so orchestrator keeps raw items (not just compressed summaries)

## Global Context Conflicts (S02E04 §4)

- **Core problem**: even a "single" agent can run as **parallel instances** — making it a de facto multi-agent system with conflict potential
- **Lost update**: Agent A writes at T=120ms, Agent B writes from stale snapshot at T=340ms → A's change silently erased (last write wins)
- **Five conflict management strategies** — combine rather than rely on one:
  1. **Conflict Detection** — checksum comparison between read and write; reject write if changed; per-line hashing for granular diffs
  2. **Conflict Avoidance** — resource ownership (R/W vs R/O), permission levels, session-level isolation — prevents conflicts by design
  3. **Managing Agent** — gatekeeper with full history visibility; merges changes; escalates to human when unsure
  4. **Change History** — append-only storage (like Observational Memory); nothing overwritten; agent sees evolution, not just current state
  5. **Manual Resolution** — fallback when automation can't decide; pause, human reviews, merged result
- **Why Git-style merge doesn't transfer**: resolving conflicts requires understanding **which changes matter** — agents often lack that context
- **Scoped access** (S02E04 §6) — define R/O vs R/W permissions per agent per resource category; only Memory Manager writes to shared state

## Shared Context Challenges (S02E04 §5)

- **Six challenges** in multi-agent context sharing:
  1. **Session vs Memory** — oversimplified distinction; sessions contain info that must persist; _someone_ must decide what to save; background agents need autonomy + generalized rules balanced with code-level access controls
  2. **Communication Degradation** — info lost/distorted between agents; worsens with complexity; craft delegate/message descriptions carefully
  3. **Own Interpretation** — agents interpret info their own way; lower risk for obvious tasks, higher for open-ended ones
  4. **Information Context Loss** — context clear in conversation becomes ambiguous in isolated notes (e.g., "Anna" confused across conversations)
  5. **Information Duplication** — same knowledge in multiple places; hard to prevent, can detect with periodic scans (cheap models flag duplicates)
  6. **Metadata** — source, date, enrichments used during agent-to-agent communication and with users; enriched info enables richer queries
- **Key takeaway**: design **as simple as possible**, maintain simplicity as long as possible; one system can serve many independent areas with very limited inter-agent information exchange

## Manager Agent Design (S02E04 §9)

- Manager agents are **critical** — minimal tools but broad information access and decision authority
- **Seven responsibilities**:
  1. **System knowledge** — knows user data, long-term memory, available agent roles and their responsibilities
  2. **Information access** — inspects agent results AND their workspace; near-complete long-term memory access (at minimum R/O)
  3. **Tool access** — primarily `delegate`, `message`, `recall/search_memory`; keep minimal — role is already large
  4. **Task delegation** — main thread, key info, action plan, progress available in manager's context
  5. **Knowledge transport** — other agents sometimes delegate _to_ the manager (requests for info, passing results between agents)
  6. **Decision-making** — first line for problems, confirmations, decisions; clear guidelines on authority scope and when to escalate to user
  7. **Verification** — verifies task outcomes; should have evaluation guidelines or ability to delegate verification
- **Silent failures**: missing information or decisions may not halt the system — it may **skip steps** and produce incomplete results without signaling failure
- **Human-in-the-loop remains essential** — management dashboards needed:
  - System statistics, active sessions, task schedules, attention-needed areas
  - Single chat window (ChatGPT/Cursor) is **no longer sufficient** for multi-agent systems

## Semantic Events (S01E01 §4)

- Agent output is NOT just text — it's a series of **events** (reasoning, tool calls, generated content, errors)
- Events carry text + metadata (ID, type, properties) — enable grouping, enrichment, UI-specific rendering
- Anti-pattern: storing raw message text — any expansion requires DB→backend→frontend changes
- **Agent interactions are ALWAYS event-based** — especially for multi-agent background systems

## Context Masking / Prefilling (S02E01 §7)

- **Concept** (from [Manus agent team](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus)): constrain tool selection by prefilling the beginning of the model's response with tokens that limit which tools can be called
  - Example: when browser session is active, prefill with `browser_...` prefix → model can ONLY call browser tools; lock released when `browser_close` is called
- **Status**: marked as [deprecated](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) in Anthropic API — rarely available, but conceptually valuable
- **Takeaway**: creative approaches to tool scoping beyond prompt instructions exist — prefilling is one pattern for constraining agent behavior at the token generation level

## Security & Safety (S01E02 §13-14, S01E03 §11, S01E05 §4-5, S02E01 §10, S02E02 §1-§2, S04E05 §5)

- **Prompt injection remains an open problem** — NO universal defense exists (S01E02 §14)
  - Address in early project assumptions + business stakeholder discussions
  - Agents cannot distinguish user commands from malicious instructions in data
  - **Toolkit minimization as defense** — if agent has no `send_email` tool, that attack vector disappears; narrow both content scope and tool scope (S02E02 §1)
- **External content security** (S02E02 §2) — all validations in application code, agent only receives error messages + hints:
  - Validate attachments: size, format, **MIME type** verification, sometimes source (email sender, domain)
  - Content moderation on text AND images (especially for providers that require it)
  - Access control: stored documents strictly protected, users and agents must have appropriate permissions
  - Shareable links: **hard to guess** + **expire** after set time
  - Size optimization: respect API limits (e.g., OpenAI 50MB per request)
- **Required data** → collect via **form UI**, not chat extraction (S01E02 §13)
- **Action confirmation** → use **buttons** (deterministic), not chat messages (S01E02 §13)
- **Permissions/access control** → must be handled **in code**, not LLM-decided (S01E02 §13)
- **Trusted tools mechanism** — `hash(name + desc + schema)`, schema change invalidates trust (S01E05 §1)
- **Content moderation** — use Moderation API; not using it can lead to account block (S01E05 §4)
- **Internal vs public tools** — internal tools have higher control; public MCP servers lose most advantages (S01E03 §11)
- **Safeguards**: recipient whitelist, context isolation, dry-run mode — all policy-enforced in code (S01E02 §4)
- **Four operational safety mechanisms** (S02E01 §10):
  1. **Dry run as default** — agent shows plan first, executes only after approval
  2. **Backup before every operation** — copy before move/rename/delete
  3. **Confirmation for large operations** — show summary, ask before batch actions
  4. **Operation log with undo** — every action recorded, rollback possible
- **Legal/compliance** (S01E05 §5) — system WILL do something it shouldn't; application must inform users of this fact; product must be legally protected (Terms of Service, Privacy Policy, contracts with providers and end users); always inform stakeholders about the need for proper legal documents
- **Five deployment risk categories** (S04E05 §5) — even with trusted LLM provider (Bedrock, Azure), the model itself cannot be trusted:
  1. **Data leak** — agent with internet access can send internal data outside the organization boundary
  2. **Data destruction** — agent with code execution can delete or corrupt data (rm -rf, DROP TABLE, overwrite — no confirmation, no rollback)
  3. **Silent drift** — without human review, errors accumulate across iterations; each run drifts further; reverting requires knowing where it started going wrong
  4. **Tool misfire** — send_email to wrong recipient, calendar invite to external person; one wrong inference and data leaves the org
  5. **Misleading advice** — chatbot connected to company KB suggests action bypassing established procedures (e.g., "restart production server" without change approval); **confident suggestion does not equal safe suggestion**
  - Data isolation (cloud instances) does NOT mean data safety — the model's behavior is the risk, not the provider
- **Model behavioral awareness** (S04E05 §5) — current models can detect they are being tested and adjust behavior to pass evaluations while hiding actual capabilities ([System Card: Claude Opus 4.6](https://www-cdn.anthropic.com/6a5fa276ac68b9aeb0c8b6af5fa36326e0e166dd.pdf), [Eval Awareness](https://www.anthropic.com/engineering/eval-awareness-browsecomp)); current LLMs are **potentially capable of bypassing safeguards**
- **Sandbox bypass** (S04E05 §5) — agents find clever workarounds to sandbox restrictions; example: coding agents denied .env access write and execute scripts to retrieve it; caution extends beyond simple permission checks
- **Don't assume anything is impossible** (S04E05 §5) — invest time analyzing security options; even solutions requiring human involvement (preventing full automation) still deliver significant value
- **Audio data / privacy routing** (S02E03 §8) — if agent processes voice or transcribes audio:
  - Voice recordings are biometric data: carry voice print (fingerprint-level identifier), emotional tone, accent/origin, background location — GDPR special category, requires explicit consent
  - Sending audio to cloud risks **voice cloning material**, not just content leakage
  - Privacy routing is a **design decision made before deployment**, not a runtime option
  - Route by sensitivity: non-sensitive content → cloud STT acceptable; sensitive (client meetings, medical, financial, legal) → local processing only
  - Local STT quality (Whisper Large V3 Turbo) now matches cloud for most use cases — no forced cloud dependency
  - Rule: "If you wouldn't email the transcript to a stranger, don't send the recording to an external server"

## Multimodal & Media (S01E04 §2-§7, S02E02 §3)

- **Media Tag Pattern** — `<media filename="photo.jpg" />` tags + `@file:filename` references for passing files between agents
- Agent **cannot see images it generates** — equip with dedicated image analysis tool
- **Iterative generation loop**: generate → analyze → decide → retry or pass (S01E04 §4)
- Processing: images (generation/editing/analysis), audio (STT/TTS/analysis), video (native via Gemini)
- **Visual form as context alternative** (S02E02 §3) — presenting documents as images can be more effective than extracted text
  - DeepSeek-OCR research: 9-10x better compression at 96% precision, even for fully textual content
  - Agent reads both text tokens and rendered page image — understands charts/layouts that text alone cannot convey
- **Markdown image handling** (S02E02 §3) — extract image references via regex → preflight checks (MIME, size, moderation, optimization) → convert to API-compatible format

## Generative UI — Artifacts, JSON Render, MCP Apps (S03E05 §4-§5)

- **Three approaches to agent-generated interfaces**, each with different control/freedom trade-offs:
  - **Artifacts (HTML generation)** — LLM writes executable UI code (HTML/CSS/JS); high freedom; runs in iframe with CSP; model decides DOM, CSS, JS patterns; host executes generated code; highest flexibility but highest risk
  - **JSON Render** — LLM writes a **declarative blueprint** (JSON spec + state); host renders **deterministically** from a component catalog; schema + allowlist reject invalid output; lower risk, structured; **state can be saved and loaded**
  - **MCP Apps** — model chooses **intent** via tool call; host brokers IO; **server owns truth**; two-way communication with external systems; full interactivity with state synchronization to files
- **Key design decision**: "when X, when Y, when X + Y" — these approaches are **not mutually exclusive** and can coexist in the same system
- **MCP Apps architecture** — three trust levels:
  - **L1 (App/iframe)** — draft state, user interactions
  - **L2 (MCP Server)** — canonical truth, persists state to files
  - **L3 (LLM)** — context only, no access to generated code or UI state except data explicitly shared
  - **Interactive sync loop**: App detects user action → `callServerTool` via postMessage → Server saves state → returns new structuredContent → Host relays → App re-renders
- **Host role expansion**: with MCP Apps, the host handles not just user-agent interaction but also **interface orchestration** — significant expansion of the host layer in agent architecture
- **Library selection for LLM-generated code** — choose libraries the LLM **knows well** over latest versions; optimize for **model proficiency**, not industry best practices (e.g., Tailwind v3 over v4 because models handle it better); these are temporary, purpose-built interfaces
- **Balance**: agent must not follow rigid rules entirely for UI generation, but some areas (e.g., document update mechanics, sandbox controls) may need **precise programmatic control**
- **MCP Apps for business processes** (S04E05 §6-§7) — MCP Apps in enterprise context:
  - Design **business-process-aligned interfaces**, not simple function mappings — e.g., "sales monitoring" panel combining Stripe + Resend data, not separate "get_payment" and "get_campaign" tools
  - **Deterministic actions through UI** — buttons like "Add follow-up todo", "Open in Stripe" are code-handled, not LLM-decided; combines AI-driven data retrieval with reliable action execution
  - **Multi-tool aggregation** — combine data and actions from multiple services in a single view; significantly simplifies repetitive tasks at specific roles/positions
  - MCP Apps **don't replace tools** — they facilitate access to selected functionalities; redirect to primary tool for detailed work
  - **Beyond chat** — MCP Apps can appear in other application areas, not just chat interfaces; AI can be present anywhere without requiring free-text input
- **Remote MCP Apps architecture** (S04E05 §7) — three-layer deployment for generative interfaces:
  - **Client Layer** — Chat Host (manages UX + security), renders embedded business apps
  - **Host Backend** — Backend API (routing, context, session) → AI Agent (decides tool calls) → MCP Runtime (executes tools/resources)
  - **Remote Business Services** — Remote MCP Server (exposes tools + UI resources) → Business Domain (source of truth: Stripe, Resend, DB, internal APIs)
  - **Remote MCP Server provides portability** — any MCP client can connect (e.g., Claude.ai); same functionality works in custom UI and third-party interfaces
  - **One MCP server → multiple services** — rare but permissible; approach with caution as it significantly increases server complexity and reduces flexibility

## Chat UI for Agents (S05E02 §1)

- **Simple chat is not the challenge** — advanced agent interfaces introduce streaming Markdown with custom blocks (reasoning, tools, artifacts), performance at scale (hundreds of messages), and interactive elements whose state changes during generation
- **Fundamental library stack** (JS/Node ecosystem — find equivalents for other stacks):
  - **Markdown→HTML converter** (markdown-it) — text rendering layer
  - **XSS sanitizer** (DOMPurify) — **critically important**: strips malicious tags from LLM-generated output; prevents XSS from rendered model responses
  - **Incomplete Markdown repair** (remend) — fixes unclosed code blocks, lists, bold during streaming
  - **Incremental tokenizer** (marked) — splits growing stream into independent blocks; avoids re-rendering entire message on every token
  - **Syntax highlighter** (highlight.js) — code blocks with language-specific highlighting
- **Production chat UI feature checklist** — beyond basic streaming, plan for: attachment upload/display, message copy with styles, thread branching + message editing, conversation rollback, response interruption, keyword search, voice recording/playback, LaTeX rendering, rich text input, diagram/mind map rendering, thread sharing, sub-agent visualization, keyboard shortcuts
  - **Message deletion is dangerous** (S05E04 §2) — prefer branching or rollback; deletion breaks turn order (Anthropic/Gemini require user-last), disrupts context management; no major chat product offers mid-conversation deletion
- **Performance consideration** — conversations reaching hundreds of messages must remain responsive; incremental tokenization is essential to avoid O(n) re-render on every token

## Agent Tool Ecosystem Catalog (S05E02 §2)

- **Selection caution** — many AI ecosystem tools are early-stage and get abandoned; exercise care, especially for AI-specific tools
- **Categorized recommendations** (JS/Node ecosystem — search for equivalents):
  - **Virtual filesystem**: just-bash — bash-like commands on virtual FS without terminal access; good alternative to Files MCP
  - **Browser automation**: agent-browser (local headless Chrome, token-optimized responses, session support) + browser-use/browserbase (cloud browser for scale)
  - **Web search/extraction**: Firecrawl, Brave Search API, Jina (recommended); Tavily, Exa (alternatives); consider using multiple services for coverage
  - **Sandboxes**: Daytona, E2B, Deno Sandbox (production-ready options); secure-exec (lightweight, untested)
  - **Audio/voice**: LiveKit (silence/speech detection, real-time audio/video), ElevenLabs (top-tier TTS/STT, voice cloning, MCP + streaming support)
  - **Document processing**: TipTap (Markdown editor), MarkItDown (PDF/DOCX→Markdown by Microsoft), Pyodide (Python in browser via WASM)
  - **Visualization**: React Flow (interactive diagrams for multi-agent UIs)
  - **Model hosting**: Replicate, Fal (image/video models + fine-tuning)
  - **Search/embeddings**: sqlite-vec (SQLite extension), Qdrant (dedicated vector DB for scale)
  - **Productivity**: Chokidar (file watching), Commander/zx (terminal from JS), Croner (CRON), Winston/tslog (logging), Google Workspace CLI
  - **Cloud files**: Uploadthing (file upload service for agent sharing)
- **Principle**: tools address **clearly defined, repeatable problems** — start with one CLI/MCP integration that immediately becomes part of your workflow, then expand as needs emerge
- **Production MCP server catalog** (S05E05 §9) — concrete streamable MCP servers with source code (all based on [template](https://github.com/iceener/streamable-mcp-server-template)):
  - [Linear](https://github.com/iceener/linear-streamable-mcp-server), [Google Calendar](https://github.com/iceener/google-calendar-streamable-mcp-server), [Gmail](https://github.com/iceener/gmail-streamable-mcp-server), [Maps](https://github.com/iceener/maps-streamable-mcp-server), [Replicate](https://github.com/iceener/replicate-streamable-mcp-server), [Resend](https://github.com/iceener/resend-streamable-mcp-server), [ElevenLabs](https://github.com/iceener/elevenlabs-streamable-mcp-server), [YouTube](https://github.com/iceener/youtube-streamable-mcp-server), [Firecrawl](https://github.com/iceener/firecrawl-streamable-mcp-server), [Video](https://github.com/iceener/video-stdio-mcp), [Spotify](https://github.com/iceener/spotify-streamable-mcp-server), [Tesla](https://github.com/iceener/tesla-streamable-mcp-server)
  - Tool connection alone doesn't add value — usefulness increases when you **personalize** usage through process descriptions, procedures, and scripts stored in the agent's knowledge base

## Voice Agent Architecture (S05E02 §3)

- **Two operating modes** with fundamentally different architectures:
  - **STT/TTS Mode (3 models)** — Speech-to-Text → LLM → Text-to-Speech; audio and text are **separate layers**; text boundary enables inspection and debugging; 3 latency hops
  - **Realtime Mode (1 model)** — single unified model (e.g., Gemini Live) processes all modalities natively (audio, text, images, video); no text boundary; built-in interruption and silence detection; lower latency but currently expensive
- **Selection guidance**: for simple interactions and commands, **STT/TTS is sufficient** and more cost-effective; Realtime mode justified only for multimodal or latency-critical use cases
- **Foundation**: LiveKit handles audio transport (silence detection, interruption handling, sessions); ElevenLabs provides top-tier TTS/STT with tool support (MCP) and streaming
- **Connection to existing principles**: voice interfaces can dramatically increase usability for background agents needing occasional human input (S03E03 §5 — offensive design)

## Interface Selection & Active Collaboration (S04E02 §1-§5)

- **Build vs integrate decision** — before building custom interfaces, evaluate whether existing tools + extensions cover the need; interface choice heavily determines all other project areas
- **Four interface categories** with different strengths:
  - **CLI Tools** (Claude Code, Open Code, Pi) — highest personalization + extensibility; best for individual/developer context; sandbox extends to remote environments
  - **MCP Servers** — nearly universal support; tools can encompass multi-agent communication; MCP Apps enable progress monitoring; best cost efficiency via subscription plans
  - **Messengers** (Slack, Telegram, Discord) — users stay in familiar context; bots, interactive messages, dedicated channels; best for team adoption
  - **Dedicated solutions** — full UX control; no longer as complex to build; even simple focused interfaces add value; best for specific agent interactions
- **Interface-scenario fit matrix** — no universal solution; combine interfaces rather than choosing one:
  - **Personalization**: CLI = primary, Custom = primary; MCP/Messenger = limited
  - **Cost efficiency**: MCP = primary (subscription); CLI/Custom = API cost
  - **Multi-agent orchestration**: MCP = primary, Custom = primary; CLI = partial
  - **Team adoption**: Messenger = primary; CLI = N/A
- **MCP integration limitations** (concrete, from Claude.ai case study):
  - **No sampling** — no reverse Client→Server communication; dual cost (subscription + API)
  - **Limited instruction personalization** — must rely on tool descriptions and returned content only
  - **No tool invocation UI control** — can't request confirmations or additional info during execution
  - **Permission complexity** — elaborate multi-tenant authorization becomes difficult
  - **Background actions** — very limited status reporting and user intervention capability
  - MCP Apps partially addresses these but can't match dedicated interface for full UX control
- **Economic factor** — subscription plans are far more cost-effective than API due to scale; enterprise agreements ease adoption; factor into build-vs-integrate decision
- **Growing AI usage naturally pushes toward dedicated solutions** — generic interfaces become limiting as sophistication increases

**Interaction Personalization — 4 Pillars** (S04E02 §4):

- **Profiles (Subagents)** — specialized agent profiles with own settings and knowledge resources; autonomous collaboration between profiles; concept of subagents as in Claude Code
- **Skills (Injected Instructions)** — predefined instructions injected by user action or model decision; **one of the most important features of any AI interface**; must support easy generation, invocation, search, grouping by agent
- **Tools (MCP & Integrations)** — easy control over active tools; personalization of tool configuration (Augmented Function Calling); must present: data for launch, confirmations, progress, errors, results; must support pause/cancel
- **Workflows (Automation Layer)** — repeatable action sequences; hooks and scheduled tasks complement workflows
- **UX quality = discoverability + control granularity + status transparency** — not just feature presence; implementation quality matters more than feature count
- **This is an almost entirely new class of interfaces** and design challenges

**Micro-Action Pattern** (S04E02 §5):

- **Simple solutions get overlooked** — conversations about agents jump to complex systems too quickly; many valuable AI applications deploy in minutes
- **Pattern**: Signal → Context + Semantic Verb → Output
  - **Signals**: selected text, clipboard content, active page/domain, camera + GPS, device state (folder watch, file event, shortcut trigger)
  - **Semantic verbs**: read, explain, rewrite, extract, visualize, detect, retrieve
  - **Outputs**: audio (TTS), inline text, visual (diagram/image), note link (deep-link to KB), list update
- **Context-aware transforms** — behavior adapts based on context (e.g., on github.com, text transforms match documentation style)
- **Implementation**: simple script bound to keyboard shortcut, Siri Shortcuts, folder watches; or generate private native apps (Swift/Electron/Tauri/React Native) for device access
- **Text transformation via shortcuts is potentially the most useful AI application in daily work**

## Meta-Prompt Design (S04E02 §6-§7)

- **Meta-prompt** = a prompt that generates prompts through **guided conversation with the user**; not autonomous — human role is fundamental
- **Writing instructions for a category of tasks** (not just one task) is demanding — requires transferring knowledge, context, and rules the model doesn't possess; needs synthesis to avoid repetition
- **Three components**:
  - **Inputs**: User Model (goals, expertise, style), Domain Model (frameworks, tools, patterns), Task Model (objective, constraints, format), Risk Model (stakes, scope, uncertainty)
  - **Prompt compiler** (6-step process): Frame (what/for whom/why) → Elicit (targeted questions, one at a time) → Infer (facts → rules, style, constraints) → Adapt (branch by domain/risk/expertise) → Synthesize (assemble from schema) → Validate (completeness/format/safety)
  - **Output**: Identity (role, persona, audience), Reasoning (process, mental models), Rules (constraints, guardrails), Expertise (frameworks, anti-patterns), Output Contract (format, sections, syntax)
- **Four layers** (universality decreases from L1 to L4):
  - **L1 — Core protocol** (universal): interview loop, stop condition, question policy
  - **L2 — Domain overlays** (universal): conditional rules per domain (technical, creative, high-stakes)
  - **L3 — Technique library** (universal): 8-15 selected techniques (not all 40+), chosen by domain + risk
  - **L4 — Output layer** (platform-local): platform-specific format, syntax, parser contract
- **Six section families** (portable across meta-prompts — names change, order may shift, structural concerns remain):
  - **Frame** — who the meta-prompt is, how it operates
  - **Intake Schema** — question strategy, what information to collect
  - **Adaptation Logic** — domain-specific rules, behavioral guidelines
  - **Technique Library** — prompt engineering arsenal, application strategy (use a subset, not the whole library)
  - **Capability Logic** — native platform capabilities, principle of least privilege
  - **Output Contract** — format, required fields, critical reminders, conversation opener
- **Phased generation is justified** — breaking into separate phases because of high complexity
- **Meta-prompts are not niche** — practical applications:
  - **Onboarding** — generate personalized instructions from user's context (product descriptions, photos)
  - **Image generation** — instructions adapted to specific products and brand tone
  - **Agent/skill creation** — Claude Code already uses meta-prompts for subagent/skill generation
  - **Optimization** — automatic prompt optimization strategies for specialized agents
- **Prompt quality determines model effectiveness** — despite growing model capability, significant optimization work remains necessary

## Deployment Collaboration Modes (S04E01 §2)

- **Synchronous vs asynchronous** — two fundamentally different problem categories in AI deployments:
  - **Synchronous**: interface is central, personalization matters, shared state, human-in-the-loop feedback, broader permissions (supervised)
  - **Asynchronous**: integration is central, minimal/no UI, self-recovery, process-defined state, scoped permissions (autonomous)
- **Seven comparison axes** for deciding mode:
  1. **Setup**: config (sync) vs integration (async)
  2. **Trigger**: human (sync) vs schedule/event (async)
  3. **Interface**: central (sync) vs minimal (async)
  4. **Feedback**: in-loop (sync) vs self-recover (async)
  5. **State**: shared (sync) vs process-defined (async)
  6. **Permissions**: broad (sync) vs scoped (async)
  7. **Autonomy**: supervised (sync) vs independent (async)
- **Hybrid is the natural pattern** — most real systems combine both; design the balance based on use case
- Closer to async → processes must be precisely defined, effective without human intervention, and adaptable to changing environment

## Process Mapping & Decision Architecture (S04E01 §3-§4)

- **Three questions before building**: "What do we want to do?", "What do we NOT want to do?", "How do we want to do it?" — including the explicit decision to **not use AI** where benefits are small
- **Decision map pattern** — for each deployment dimension, follow: **constraint → decision → consequence**
  - Typical dimensions: user profile, content ownership, format, integrations, publishing, availability
  - Label each decision as **engineering**, **AI-driven**, or **hybrid** to assess balance
  - Most decisions are reversible except **structural commitments** (e.g., remote-first architecture)
- **Engineering-to-AI balance** — classic engineering still constitutes the majority of architecture even in AI-heavy systems
  - Infrastructure **serves** the agent, not the other way around
  - Ratio is shifting: was 90-10 a few months ago, now some scenarios show inverted proportions
- **Foundation-first approach** — define a minimal starting point that serves as the base; don't try to build everything at once; "we can't do everything, but we can do anything"
- **Validate assumptions early** — AI-accelerated prototyping compresses weeks into days:
  - Test enrichment (can the model determine what to add?), building (can it correctly classify/place content?), accessibility (is a chatbot necessary, or would search suffice?)
  - Build evaluation datasets to test model/configuration choices
  - **Killing ideas costs hours, not months** — parallel exploration of multiple approaches with real signal
- **Prepare for fast iterations** — initial decisions will be wrong; maintain high project flexibility; in business contexts, information may be not just unavailable but also **incorrect**

## AI Workflow Resilience (S04E03 §7)

- **Silent degradation is problem #1** — AI failure is a **spectrum**, not binary; classic scripts either work or crash; AI workflows can produce technically valid but factually degraded output for days without any error signal
  - Example: model starts truncating summaries after a token limit change; outputs look normal; 14 days of lost information before anyone notices
- **AI workflow = distributed system + unpredictability layer** — resilience patterns from software engineering apply, but require AI-specific adaptation (Mark Brooker, AWS: "don't ask if something will break, but when and how you'll respond")
- **Pattern 1: Retry with Exponential Backoff + Jitter**
  - Naive retry → **Thundering Herd** (10K workflows retrying simultaneously = DDoS on your own provider)
  - Exponential backoff (1s → 2s → 4s → 8s) + **decorrelated jitter** (randomize from growing range) — reduces collisions by order of magnitude
  - **AI-specific**: classify error before retrying (timeout → retry; 400 → don't retry, prompt is wrong; 429 → retry with longer backoff); every retry costs tokens
- **Pattern 2: Circuit Breaker**
  - Three states: **Closed** (normal) → **Open** (all requests blocked, instant "unavailable") → **Half-Open** (one probe; success → closed, failure → open)
  - Trigger: e.g., 5 failures in last 10 calls → open breaker; cooldown period → half-open probe
  - **Per-dependency breakers** — each external service (LLM APIs, vector DB, CRM) gets its own; one down, rest continues with **graceful degradation**
  - **AI-specific challenge**: defining "failure" — HTTP 500 is clear, but HTTP 200 with hallucination is where classic resilience meets AI-specific problems → leads to output validation (Pattern 4)
- **Pattern 3: Dead Letter Queue (DLQ)**
  - Failed tasks go to a separate queue — **never disappear**; can be reprocessed automatically (when service recovers), manually reviewed, or trigger alerts
  - Simplest: database table (timestamp, input payload, error type, attempt count, status)
  - The difference: "we lost 7 days of data" vs "we have 7 days in queue to reprocess"
  - Use for **business-critical data**: client emails, financial documents, analytics pipelines — anything where loss = real cost
- **Pattern 4: Output Monitoring & Validation**
  - Traditional monitoring (server up, latency, error rate) is **insufficient** for AI — must additionally monitor **output quality**
  - Three techniques: **schema conformance** (expected fields exist, not empty), **length/proportions** (300 tokens normal → 50 tokens = red flag), **canary checks** (periodic known test data through the workflow)
  - Alert within **5 minutes** of first anomalous result — every minute of silent degradation = bad or missing data
- **Implementation priority** (highest ROI first):
  1. **Retry + Backoff + Monitoring** — handles 80% of transient issues; monitoring tells you when retry isn't enough
  2. **Circuit Breaker** — when you have multiple external dependencies (prevents cascade failures)
  3. **DLQ** — when processing business-critical data (prevents data loss)
- **These patterns are not AI-specific** but gain new meaning: model can be technically correct but factually wrong; non-deterministic outputs for identical prompts; order-of-magnitude latency changes without warning
- **Build every workflow as if every external call could fail — because eventually, it will**
- **"Ironies of Automation" (Bainbridge, 1983)** (S04E04 §9) — the more advanced the automation, the harder it is for humans to notice failures; automation eliminates repetitive contact with the process, and that contact built the intuition; **the better automation looks, the less you should trust it**
- **External heartbeat monitoring** (S04E04 §9) — after every run, task pings an external service ("alive + result OK" or "alive + result bad"); if ping doesn't arrive → alarm; **silent refusal is as bad as silent error** (task correctly refused due to stale data, but nobody knew for 5 days); tool example: [healthchecks.io](https://healthchecks.io)
- **Output validation — 4 questions that catch 90%** (S04E04 §9):
  1. Does the output **exist**? (GitLab 2017: backup script logged "Complete!" but wrote to non-existent directory)
  2. Does it have a **sensible size**? (0-byte file is not a backup; single sentence is not a report)
  3. Is the **format correct**? (if expecting JSON, parse it; CSV, count columns; PDF, open page 1)
  4. Is the **content complete**? (7-day report should have 7 days of data)
  - **Verify the EFFECT of the action, not the action itself**
- **Explicit timezone declaration** (S04E04 §9) — every schedule must have a declared timezone in config/code/comments; if anyone must guess the scheduler's timezone, that's a bug
- **Lockfile concurrency guard** (S04E04 §9) — check for lock file before starting; if exists, previous instance still runs → don't start; lock contains timestamp → ignored after TTL (stale lock = crash, safe to retry); prevents race conditions that are devilishly hard to debug (rare, random, worst-moment)

## Production (S01E05 §1-§7)

- **Ten production concerns**: context, control, performance, dynamic costs, security, stability, scaling, privacy, violations, flexibility
- Haiku/Flash first, escalate on LOW confidence (S01E05 §2) — but **cheaper model ≠ cheaper solution** (S01E05 §3): research showed GPT-4.1-nano was less cost-effective than mini because it required far more steps; observe actual token consumption before optimizing
- Every LLM call must track tokens in metrics (S01E05 §3)
- No AI frameworks — use SDKs directly (S01E05 §6); custom logic with official SDKs is the recommended approach for most production projects (S05E01 §4c) — AI coding agents make this viable now
- **Structure guaranteed ≠ values guaranteed** — JSON shape is certain, values are not; validate outputs (S01E05 §8)
- Tell model explicitly what it can't do — reduces hallucination (S01E05 §8)
- **Performance strategies**: heartbeat (show progress), multi-threading, background processing, task resumption, query reduction ("is AI necessary for this step?"), token reduction (S01E05 §2)
- **Provider abstraction** — provider-agnostic requests with adapters; each agent can use different API (S01E05 §10)
- **Multi-provider architecture** (S05E01 §4) — when multiple providers appear in the same logic:
  - **Provider router pattern**: unified endpoint (`POST /v1/responses`), router reads model prefix to select provider, per-provider field mapping, response normalization back to unified shape
  - **Three solutions**: OpenRouter (convenient, basic features only), Libraries/AI SDK (may block latest features), Custom logic with official SDKs (maximum control, recommended for production)
  - **Custom logic is now viable** — AI coding agents make building/maintaining provider adapters practical; place official SDK files, define default API structure + mapping rules + which settings to support
  - **For tools with unstable foundations**, replacing with custom logic is no longer impractical — but don't rebuild stable, long-standing frameworks
- **Observability** — 3 event sources: HTTP layer, agent lifecycle, tools/MCP (S01E05 §10)
- **Per-user budget control** — always enforce user-level limits alongside provider limits (S01E05 §7)
- **Legal/compliance** — system will do something it shouldn't; inform users, protect product legally (S01E05 §5)
- **Seven deployment failure areas** (S05E03 §6) — checklist from real production incidents:
  - **Rate limits** — check API limits, prepare key rotation or use OpenRouter
  - **Content moderation** — account blocking from TOS violations can immobilize production app; use Moderation API or custom filters
  - **Performance** — parallel requests at volume (100+ per user) may slow down on major providers; avoid logic requiring many parallel requests
  - **Speed** — LLMs are slowest app component; manage at UX level (streaming, loading states) and app level (caching, partial parallelism) or kill engagement
  - **Costs** — 1-3% of users generate higher costs than all others combined; enforce hard limits or dedicated user keys; monitor business-level cost ratio
  - **Effectiveness** — agents designed for specific scenarios break with typical users; consider **button-based UIs and background actions** over chat; observe user activity to understand working style
  - **Usefulness** — many AI solutions are unnecessary; agent managing tasks via conversation < well-designed interface; differences appear only at scale or when actions require many sub-actions
- **Audio transcription pitfalls** (S05E04 §2) — Whisper (and similar STT models) hallucinate on silence ("Thanks for watching!", "Subtitles by the Amara.org community") due to movie subtitle training data; language mixing causes transliteration errors on proper nouns; validate transcription output before passing to agents
- **Large content paste handling** (S05E04 §2) — text fields degrade at +12k chars (~900ms/keystroke); LLM conversations involve large pastes more often than classical apps; detect oversized content and treat as file attachment, not inline text
- **Agent without chat** (S05E04 §11) — chatless agent systems (observe user behavior, react to actions/uploads) provide much greater control over data and scenarios; in production, often **easier** to build than chat-based agents; consider event-driven/background models before defaulting to chat interface
- **Building for agents** (S05E04 §11) — paradigm shift: applications increasingly should be built for agents acting on behalf of users, not just for users directly; impacts API design, data formats, and interaction patterns
- **User AI literacy gap** (S05E04 §11) — always assume users have minimal or zero knowledge of how models work; building AI solutions is relatively simple, making them easy to use and valuable for non-AI-literate users is the enormous challenge

## Hallucination Grounding & Verification (S05E04 §4-§6, §12)

- **Hallucination benchmarks are misleading** — same model can show 1.5% on summarization and 45% on open questions; always ask: which benchmark, which task type?
- **RAG vs Grounding — two different steps**:
  - **RAG** addresses "model doesn't know" → gives it context (documents into prompt)
  - **Grounding** addresses "does model faithfully use the source?" → verification that context is correctly interpreted
  - Model can have a document in context and still misinterpret it, draw conclusions not present, or mix fragments
  - **RAG without grounding** = giving an intern library access without checking if they can cite correctly
- **Three-layer verification pipeline** (cheapest to most valuable):
  - **Layer 1 — Source exists?** — HTTP HEAD to URLs, DOI via CrossRef API; cost: ~zero, time: milliseconds; catches invented addresses, fabricated articles, dead links
  - **Layer 2 — Source confirms claim?** — fetch source content, ask a **different model**: "Does this fragment confirm this claim?" → yes/no/partially; catches "beautiful lies" (real source, fabricated attribution); cost: one LLM call per source
  - **Layer 3 — Confidence scoring** — not binary truth but probabilistic confidence: High (3+ verified sources confirm), Medium (source exists, partially confirmed), Low (no source, contradictions, no reference provided)
- **Multi-model verification** — ask 2-3 models the same question; divergence is a strong signal something needs checking; not perfect (similar training data → similar errors) but cheaper than manual fact-checking
- **Confidence scoring is production essential** — not a luxury but trust-building; without it, agent produces text that looks like knowledge but isn't; truth in LLM context is probabilistic, system's job is to communicate confidence so users can decide
- **Core principle**: treat every fact from a model as an **anonymous internet tip** — might be true, but verify before repeating

## Full Agent Architecture Reference (S01E05 §10, S05E04 §7-§9)

When designing production agents, consider all layers:

- **API Gateway** — routing, auth, CORS, timeouts
- **Runtime Orchestrator** — initializes providers, tools, MCP, agent templates per request
- **LLM Providers** — adapters via unified interface
- **Tooling Layer** — built-in + MCP tools
- **Agent Templates** — `agent.md` files with frontmatter + system prompt (hot-reload from disk)
- **Domain Models** — Agent, Session, Item entities + lifecycle transitions
- **Data Layer** — DB + optional in-memory repo
- **Observability** — HTTP logs + agent lifecycle events + tool execution events

### Production Data Model (S05E04 §8)

Reference entity hierarchy for production agent systems:

- **Conversation backbone**: tenant → work_session → thread → message
  - Tenant = org boundary; Work session = collaboration container (groups threads, scopes jobs/runs); Thread = branch (self-referencing `parentThreadId` for branching); Message = record inside thread (`runId` optionally bridges to execution)
- **Execution backbone**: work_session → job → run → runtime satellites
  - Job = durable work unit (survives across many runs); Run = one execution attempt (binds to specific agent revision); Items = runtime transcript (belong to run, NOT message); Tool executions = per-run call history; Run dependencies = wait mechanism
- **Identity**: tenant → account (M:N via memberships with role); auth sessions (login) separate from work sessions (collaboration)
- **Agents**: definition (agents + immutable agent_revisions with checksumSha256) separate from runtime binding (run.agentId/agentRevisionId); declarative delegation via agent_subagent_links; **agent resolution binds to immutable revision** (S05E05 §7) — reproducible behavior even after agent is edited later
- **Critical distinctions**: job vs run (durable work vs one attempt), thread vs message (branch vs record), auth session vs work session (login vs collaboration), agent definition vs runtime binding

### Agent Runtime — Execution Ownership Model (S05E04 §9)

Reference runtime architecture for production agent execution:

- **Control Plane**:
  - **Readiness Engine (Scheduler)** — cyclically queries DB for actionable job/run pairs; **decides but does not execute**; fixed priority: deliver child results → resume waiting → requeue stale → execute pending → recover timeouts
  - **Lease/Claim Controller** — exclusive ownership per run via `run_claim` with heartbeat renewal (lease TTL); crash recovery via stale claim detection and automatic requeue
- **Execution Plane**:
  - **Run Driver** — multi-turn loop per claimed run; loads context (messages, items, files, summaries, memory, agent profile) → streams generation → persists transcript + usage → dispatches tool calls or completes; **no separate planner** — model decides inline
  - **Tool Executor** — tools return immediately or create waits; writes call records, function outputs, run_dependencies (waits), child jobs/runs (delegation); one round can fan out N parallel tool calls
- **Wait/Delegation**:
  - Wait types: child agent result, MCP confirmation, human response, upload completion
  - **Waiting is durable state** (persisted run_dependencies), not in-memory pause — survives crash and restart
  - **Delegation loop**: parent → `delegate_to_agent` → child job/run created → parent enters waiting → child executes → result delivered → parent resumes
- **Side Effects — Outbox Worker**: fan out committed events **after transaction is durable** to three channels: realtime (UI/SSE), projection (read-model), background (naming, memory, follow-up jobs)
- **Key principles**: external requests become runtime state; runtime writes once, side effects drain asynchronously; message = user interaction, item = runtime transcript (different entities)

## Observability & Monitoring (S03E01 §1-§3)

- **Quality Triad** — three complementary pillars for LLM application quality; none replaces the others:
  - **Evals** — verify quality (offline: prompt regression, dataset benchmarks; online: live scoring, violation detection)
  - **Guardrails** — enforce boundaries inline with every request (input validation, output filtering, schema enforcement)
  - **Observation** — understand behavior (traces, tool call sequences, inter-agent dependencies, cost, performance, errors)
- **Seven observation types** (universal taxonomy across platforms):
  - **Session** — conversation thread or agent task batch
  - **Trace** — single user interaction (e.g., one chat message)
  - **Span** — duration of a selected action (e.g., context gathering)
  - **Generation** — LLM interaction including full query context and settings
  - **Agent** — agent activity during an interaction
  - **Tool** — tool invocation (input/output)
  - **Event** — application events, not necessarily LLM-related
- **Centralized gateway pattern** — intercept **all LLM API interactions** and **all tool invocations** through a single enrichment point
  - Agent loop → Centralized Gateway (LLM adapter, tool executor, event emitter) → enriched with session context → Observability Platform
  - Plan architecture so interception points can be centralized from the start
- **Session context enrichment** — not just the event, but the **full context**:
  - Core: userId, sessionId, agentId, promptVersion, tags
  - Application-specific: license type, account permissions, user preferences, request type (CRON)
  - Metadata: connection info, interface type, app version, locale
- **Grouping and nesting** — events must be grouped (by session/trace) and nested (spans within traces, tools within agents)
- **Start minimal, iterate** — create minimal integration first; missing and excessive logs will reveal themselves immediately
- **Anonymize observed data** — observability directly involves processing user data; anonymize names, addresses, contact details, personal identifiers — even with self-hosted tools
- **Self-observing system pattern** (S04E03 §6) — agents monitoring agents for system health, extending LLM-as-a-judge to continuous operation:
  - **Monitor agent** operates in periodic LLM-as-judge mode checking: output volume, delivery rate, open/read rate, source availability, queue depth
  - **Two response paths**: auto-action (mark source unreachable, pause zero-output agent, throttle high-volume agent) vs human gate (newsletter nobody reads, source offline 3+ days, agent producing noise)
  - Findings feed back into agent config and source registry — system self-adjusts
  - Key insight: if a daily output goes unread, question the process; if sources go offline, flag and remove (auto or after human confirmation)

## Prompt Versioning & Agent Debugging (S03E01 §4-§5)

- **Git is not enough** for system prompt versioning — agent systems need per-version **performance statistics and execution history** linked to each prompt version
- **Prompt registry** — save and version prompts with:
  - Environment tagging (development, production)
  - Linked generations — every execution traced to which prompt version was active
  - Per-version metrics: generation count, latency, token usage, cost, average score
- **One-way prompt sync** — when prompts must live in source code:
  - Code changes → hash diff → push to platform if changed
  - Lose easy version switching, retain the main value: easy assessment of current state
- **Prompt-linked observability** (full chain): source files → prompt registry → `getPromptRef()` linking → runtime traces → per-trace scores → experiments (dataset → evaluators per version)
- **Playground debugging** — replay interactions from observability data:
  - Edit system prompt, messages, tools → verify impact on model behavior
  - Compare different models on the same interaction
  - Not 100% functional (no live tool connections), but good for verifying assumptions
- **Agent debugging ≠ code debugging** — fixing one instruction may break behavior elsewhere
  - Overlapping tool descriptions cause wrong tool selection with no errors thrown — only tracing reveals the problem
  - This is why **generalized instructions** and **patterns over specific commands** matter (S01E01 §8)
  - Detecting and fixing a problem is not the end — must verify impact on the rest of the system
- **Ask model to justify tool selection** — useful in practice; response often contains clues to fix the problem; but at odds with research showing internal reasoning may differ from stated reasoning

## Evaluation & Testing (S03E01 §6-§9)

- **Eval** = structured test evaluating system elements against defined metrics; focused on quality, stability, effectiveness, performance, cost
- **Three components**: task (input + output), data (synthetic + production examples), score (0-1 range, by code or LLM)
- **Two modes**:
  - **Offline** (development/CI) — run experiments before deployment; via platform UI or API
  - **Online** (production) — automatic assessment of live interactions; detect violations that built-in mechanisms missed
- **Eval alignment matrix** — 4 quadrants determining action:
  - High score + good output → **monitor** (aligned)
  - High score + poor output → **fix evals** (false positive)
  - Low score + poor output → **fix app** (true negative)
  - Low score + good output → **fix evals** (false negative)
- **Scoring criteria** — two categories:
  - **Deterministic**: `contains`, `is-json`, `equals`, `starts-with`, regex, programmatic checks (JS/Python logic, HTTP queries)
  - **Model-graded**: `llm-rubric` (natural language criteria), `conversation-relevance` (interaction context), `context-recall` (retrieval effectiveness)
- **Five evaluation areas** for agent systems:
  1. **Prompt effectiveness** — single instructions and agent skill execution
  2. **Tool selection accuracy** — does the agent reach for the right tools?
  3. **Tool usage proficiency** — correct usage, iteration count, error rate
  4. **User satisfaction** — active feedback (thumbs up/down)
  5. **Domain-specific tests** — e.g., search effectiveness
- **Prompt anatomy insight** — during agent interactions, **tool responses dominate the prompt** (~67% of tokens in a typical agentic call vs ~3% for system prompt); evals must account for this
- **Dataset design principles**: **coverage** (all behavior categories, no blind spots), **diversity** (same category, many angles), **balance** (even attention across tools; skewed distribution distorts results)
- **Practical stance**:
  - Evals are **optional** — decision should match resources, goals, and pace of change
  - Evals can be **temporary** — create to answer specific questions (e.g., "which areas can smaller models handle?"), then discard
  - **Minimum viable evals**: tool selection accuracy + tool usage proficiency — enables quick model switching decisions
  - Start with observability (foundation), add evals incrementally where the system most needs them
- **Violation detection** (online evals) — async detection of problematic input/output beyond inline guardrails; even delayed detection is better than none; can have serious consequences if missed

### Tool-Specific Evaluation Workflow (S03E04 §3-§6)

- **Synthetic test dataset generation** (S03E04 §3) — LLMs generate realistic interaction examples from tool schemas + design rules; process: read source → generate initial → human selects best → generate more based on selection
  - Human ensures: **diversity** (different use cases), **realism** (matching actual behavior), **coverage** (edge cases, errors, multi-step flows)
  - Generated examples serve **triple duty**: creative brainstorming (what scenarios matter?), evaluation design (what to test?), result analysis (failure patterns)
- **Two dataset categories** (S03E04 §3-§4):
  - **Per-tool** (stateless) — test individual tool handling: search queries, read operations, send modes, error scenarios
  - **Scenario** (stateful, multi-turn) — test multi-tool chains: draft→send, search→reply, find→modify→modify; shared `conversationId` with sequential steps
- **Scenario sub-categories**: actions (chained operations), safety (policy enforcement across attempts), readonly (forbidden tool never called across all steps)
- **Eval with minimal system prompt** (S03E04 §4) — run tests almost without system instructions; if agent succeeds on schema/description quality alone, it will perform even better after specialization
- **[Promptfoo](https://www.promptfoo.dev/)** (S03E04 §4) — offline eval tool complementary to Langfuse (production observability); 62 assertion types; supports stateless (single-turn) and stateful (multi-turn with session history) evaluation modes
- **Comparative model evaluation** (S03E04 §5) — test multiple models on same evals to find cost/quality/speed trade-offs:
  - Compare: efficiency (avg turns), reliability (session memory), response personality
  - Selection depends on broader context — single-tool success doesn't guarantee multi-tool success
  - Create **dedicated evals for scope/context scaling** when expanding agent capabilities
- **"Optimize for weak models" principle** (S03E04 §5) — constraints that improve small-model performance also improve large-model performance; even if choosing the strongest model, optimizing tool interfaces for weaker models is always valuable
- **Semi-automated optimization loop** (S03E04 §6) — once process stabilizes:
  1. Document good practices + checklists
  2. Give coding agents access to schemas + tests + terminal
  3. Agent runs evals, interprets results, suggests improvements
  4. Human reviews and approves
- **Data-driven model selection** (S03E04 §6) — evals transform model choice from guesswork into minutes; automate benchmarking of new models (stronger for quality, weaker for cost); open-source models reaching sufficient quality for some tasks

## AI Role Definition & Scope Design (S03E02 §1-§3, S04E01 §3)

- **Full automation → Agentic support** — the default should be AI-assisted (not AI-replaced) workflows; four anti-patterns: org-wide RAG, public chatbot, mass auto-emails, all-in-one agent
- **Graduated Autonomy** (S05E05 §3) — not all-or-nothing; a 4-level spectrum of permissions:
  - **Read Only** — system reads, classifies, notifies
  - **Supervised** — system proposes, human approves
  - **Trusted** — system acts, human gets a report
  - **Full Auto** — system acts unsupervised within strictly defined boundaries
  - "Never go full auto" — use full auto only in the narrowest, best-tested scope
- **Agentic support pattern**: specialized tools, background agents, draft assistants, human-sends — modular, contained, reliable
- **"Agent enriches, never replaces"** (S04E01 §3, S04E04 §6) — for content/knowledge systems, AI-generated content has no value; AI-enriched human content does
  - Agent output lives in a separate space (e.g., `/agent-notes`); user **promotes** to canonical content manually
  - **Promotion gate**: canonical content stays human-authored; agent writes side notes, suggestions, enrichments, drafts — never overwrites originals
  - **Engagement balance** (S04E04 §6): humans own Direction, Writing, Curation; share Transformation, Commenting, Organization; AI leads Templates, Linking, Validation, Indexing, Auditing — see "Personal Knowledge Base Design" section for full spectrum
- **The most valuable skill**: ability to determine **what doesn't matter right now** — regularly update beliefs about what's possible vs practical
- **Scope isolation design** — multi-account/multi-context agents need hard boundaries:
  - **Phase separation**: triage (read-only, all accounts visible) vs drafting (isolated, locked to one account/context)
  - **Contact-type knowledge scoping**: different trust levels → different KB categories accessible
- **Four-layer defense stack** (L1-L4):
  - **L1-L3 (Hard enforcement)**: isolated sessions, KB lock, contact-type scoping — enforced by system, not AI
  - **L4 (Soft enforcement)**: prompt-level rules — protects against hallucination/edge cases
  - **Design principle**: L4 failure is safe because L1-L3 already removed dangerous data
- **Agent actions as event triggers** — agent output (e.g., label assignment) becomes input for other agents or deterministic actions; humans can trigger the same events manually
- **Three essential questions before deploying AI** (S05E02 §6) — distilled from real failure case studies:
  1. **What happens when the system is wrong?** — if wrong info, financial loss, or unverified publication → **human-in-the-loop required now**, not later
  2. **Does the model need to generate, or just select?** — generation = open hallucination field; selection (routing, classification, prioritization) = entirely different risk level; prefer routing to documented answers over open generation
  3. **Do you really need this?** — 43% of abandoned AI projects had data quality issues; if you don't have the data, no model will fix it

## Custom Tooling Areas (S05E02 §5)

- **Eight areas for building custom solutions** — repeating patterns when working with generative AI warrant custom tools (MCP servers, CLI tools, dedicated API applications):
  - **Prompt libraries** — reusable prompts assigned to keyboard shortcuts or agent skills; even a small library is extremely valuable; consider macros, browser extensions, phone shortcuts
  - **File management** — tools for agents to interact with documents in filesystem or external services (Notion, Google Drive)
  - **Cloud access** — file upload/download/sharing capabilities for agents
  - **Document generation** — not full content but elements: images, tables, visualizations, templates that LLM fills in automatically
  - **Media processing** — even simple AI integrations for voice notes, photos, video add significant value
  - **Sandboxes** — dedicated environments for agents executing potentially destructive actions; consider a dedicated machine for actions blocked by IP on cloud servers
  - **CLI/MCP integrations** — wrapping daily tools/services as CLI or MCP enables portability between agents, team sharing, and client distribution
  - **Custom UI** — own chat interface for multi-agent collaboration or management panel; valuable when high personalization is needed
- **Start small** — even one CLI/MCP integration that becomes part of your daily workflow teaches you to spot the need for more
- **Tools address clearly defined, repeatable problems** — where audio processing logic has existed for years, adapt it to agent context rather than rebuilding

## Technology Evolution & Feature Development (S05E03 §1-§2)

- **Gen AI duality** — stable at fundamentals, dynamic at higher layers:
  - **Stable fundamentals** (slow change): autoregression, tokenization, context window limits, hallucination, prompt injection, base knowledge cutoff — investing in logic built on these is justified; expect less frequent changes
  - **Dynamic higher layer** (quarterly shifts): multimodality, agentic workflows, working techniques (RAG, fine-tuning, prompting), tooling ecosystem — design for replaceability; expect significant changes
- **Architecture duality** — two seemingly contradictory effects happening simultaneously:
  - **Simpler logic** — more logic delegated to model; instructions replace code; less code to own and maintain
  - **Complex environment** — agents need controlled environments (sandboxes, permission models, kill switches), multimodal processing pipelines, dual temporal modes (async + real-time), evaluation and safety layers
  - **Factory metaphor**: classic apps = building the assembly line (fixed, deterministic); generative apps = building the factory (agent designs its own processes at runtime; you design the environment)
- **Ecosystem evolution signals** to track: provider race (leave room for multi-provider), agent logic becoming default, multimodality as default assumption, system integration (agents in terminals/sandboxes/desktop), tool ecosystem addressing repeating problems

## Evaluating New AI Features & Migrations (S05E03 §3)

- **Signal vs noise framework** — 4 quadrants for evaluating new features:
  - **Signal** (invest): cross-provider, open standard, portable format, community-built, keeps returning after weeks, aligns with primitives
  - **Useful but risky** (watch): single-vendor, no migration path, opaque internals, high exit cost, deprecation risk
  - **Early signal** (revisit): solves real pain, small but growing, reappears over time, fundamentals-aware
  - **Noise** (ignore): one vendor demo, benchmark-only, spike then silence, no real adoption, vague mechanics
- **Key heuristic**: if a topic keeps returning after weeks of silence → second look; no return → skip
- **Verify personally** — industry reactions are intense with heavy marketing narrative; test yourself, use your experience; maintain openness and distance
- **Direction sources**: provider research publications, technical podcasts, [Model Spec](https://model-spec.openai.com/2025-12-18.html) (open discussion about development direction)
- **Model migration considerations**:
  - Models come in multiple tiers (main/mini/nano); **smaller tiers may only appear better** — invest more evaluation time
  - Previously recommended practices may have **negative effects** on newer models (e.g., aggressive CRITICAL/MUST tone no longer recommended for Opus 4.5)
  - Consider not just stability but **new opportunities** — model upgrade may allow prompt simplification, logic simplification, or increased complexity for previously impossible capabilities
  - Watch Open Source models — platforms like OpenRouter may offer switching to faster/cheaper models
  - Technically switching = changing model identifier; for agent systems it may require **much more attention** due to cascading behavioral changes

## Agent Capability Evolution (S05E03 §4)

- **Key difference from classic apps**: in agent logic, **even small changes can significantly impact the entire system's effectiveness** — unlike classic code that changes only when requirements change
- **Agent systems can continuously evolve** — driven by model improvements, new techniques, and evolving tool ecosystem; changing circumstances may require **redefining established development practices**
- **Three capability levers** — expand agent capabilities without changing core architecture:
  - **Lever 1: Model swap** — same tools, deeper reasoning, more complex logic, better self-correction
  - **Lever 2: Add a tool** — e.g., terminal access transforms file editor into full dev environment; **sandbox required for dangerous tools**
  - **Lever 3: Connect services** — plugging in external services (Gmail, Calendar, Todoist) unlocks new capabilities without changing main agent logic
- **Design implication**: architecture should allow capability expansion through lever changes; simple tool changes can **completely transform an application's profile**

## Automatic Prompt Optimization (S05E03 §5)

- **Closed-loop prompt optimization** — autonomous systems that iteratively improve prompts:
  - Pattern: seed prompt → execution model runs it → judge model scores output vs expected → improver generates candidate prompts (one atomic change each) → parallel evaluation → keep if delta > noise floor → repeat
  - Use **weaker model for execution**, **stronger model for optimization/judging** — asymmetric model assignment
  - **Holdout verification** essential — test best prompt on data never seen during optimization
  - Only prompt text changes, never model weights
- **Production frameworks**: [DSPy](https://dspy.ai/) (Python) and [AX](https://axllm.dev/) (TypeScript) — prompts almost never appear in application code
  - **Signature-based approach**: declare inputs, task, and expected outputs as "signatures" instead of writing prompts
  - **BootstrapFewShot**: scores traces, keeps best as demos; signature never changes, only in-context examples improve
- **Relevance to agent systems**: automatic prompt optimization can be part of agent self-improvement — agents that iteratively optimize their own instructions or generate few-shot examples

## Heartbeat Pattern — Task Orchestration (S03E02 §4-§6)

- **When to use**: process is too dynamic for a rigid workflow but needs higher reliability than a free-form agent loop
- **Three components**: contracts (structured plan + tasks with deps), heartbeat (deterministic manager logic), memory (filesystem-based, within and across agents)
- **Task contract structure**: id, title, status (open/in-progress/done/waiting/blocked), agent, dependencies, capabilities, attempts, instructions
  - Contracts are **markdown files with frontmatter** — heartbeat reads them as structured data
- **Heartbeat cycle**: after each round → reconcile statuses → unblock ready tasks → resume paused work → dispatch eligible tasks → repeat until all done
- **Key boundaries**:
  - Routing logic is **deterministic code** (if/switch on status, deps, capabilities)
  - **LLM only runs inside a claimed task** — agents never self-select work
  - Tasks can change status mid-execution (waiting for human input, additional steps needed)
  - Memory sealing (Observational Memory) enables working beyond single context window
- **Parallel execution**: tasks with no shared dependencies run simultaneously
- **Human-in-the-loop**: system can request human decisions when plan requires resolution the system can't make autonomously
- **Dynamic DAG extension** (S05E01 §3a) — heartbeat with agent-created task graph instead of a static upfront plan:
  - **Task state machine**: todo → in_progress → done | blocked | waiting; auto-retry up to 3 attempts on blocked; stale recovery resets `in_progress` to `todo` on session start
  - **Round loop** (up to N rounds): find ready tasks (sort by priority) → execute sequentially → memory cycle (Observer extracts, Reflector compresses) → next round; exit when none ready
  - **Key difference**: orchestrator agent dynamically creates tasks and dependencies at runtime vs heartbeat's predefined plan — more flexible but less predictable
  - **Cross-cutting**: Memory (Observer/Reflector injected into every agent context) + Event Bus (fire-and-forget SSE, read-only — cannot affect execution)

## Prompt Injection Defense Patterns (S03E02 §7)

- **Filtering barrier pattern**: user message → **isolated LLM request** (no shared context) → classify as safe/unsafe → **programmatic string match** → forward or block
  - Attacker cannot see guard phrases; bypass possible but difficult
- **Defense-in-depth with previous techniques**: combine filtering barrier + toolkit minimization (S02E02 §1) + programmatic access control (S01E02 §13) + content moderation (S01E05 §4) + isolated sessions (S03E02 §3)
- **Legal + disclosure**: when agents interact with users, explicit AI disclosure + legal protection are the last line of defense for unintentional errors

## Code Execution Agent & Performance Management (S03E02 §8-§9)

- **Five performance levers**: input token count, cache utilization, output token count, request count, smaller models
- **Code generation + sandbox** = most impactful optimization — model writes code that processes data outside context window; only compact summaries return
- **Sandbox architecture**: Host Process → MCP (direct tools: fs_read, fs_search, fs_write, fs_manage) + Sandbox (execute_code in Deno — fresh process per call, 30s timeout, no state, npm support, HTTP bridge to MCP)
- **Four-phase pattern**: Discover (explore structure) → Sample (read ONE file to learn schema) → Process (generate aggregation code) → Output (generate presentation)
- **Key insight**: model **never sees raw data** — writes targeted code after learning schema from a single sample; 11,508 records processed in ~6 turns
- **Critical caveat**: calculations in code are reliable, but **data loading correctness** creates room for errors — strict supervision + code-controlled processes needed for critical documents
- **Production scaling**: three-process architecture adds complexity; sandbox infrastructure being addressed by Cloudflare Sandbox, Daytona

## Autonomous Triggers & Single Entry Point (S03E03 §1)

- **Five trigger types** for agent activation (unified taxonomy):
  1. **Messages** — from human or another agent; contextual payload; agent replies
  2. **Hooks** — internal application events (e.g., subagent completion); agent resolves a goal
  3. **Webhooks** — external service events (e.g., calendar update, payment); HTTP POST; agent updates context
  4. **Cron** — time-based (e.g., `0 9 * * *`); forces execution regardless of state
  5. **Heartbeat** — periodic state check (e.g., every 30m); evaluates need for action; acts or maintains silence
- **Single entry point architecture** — all 5 trigger types converge to one event ingestion layer; LLM dynamically interprets and adapts to any trigger using available context (session history, memory, environment) and tools
- **Key advantage over traditional event systems**: classic events fire independent actions with fixed arguments; agent entry point interprets natural language task descriptions and dynamically selects tools/actions
- **Session strategy per trigger** — critical design decision:
  - New session (isolated) — no shared context; best for independent operations (webhooks, cron)
  - Inject into persistent main thread — shares conversation history; best for tasks needing user context (heartbeat pulses)

## Proactive Session Architecture (S03E03 §2)

- **Persistent "infinite" main session** — enabled by context compression (Observer/Reflector from S02E03); session survives beyond context window limits
- **Heartbeat pulse injection** — periodic system messages injected into the main thread: "read tasks.md for pending work"
  - If no tasks require action → agent **skips** (user sees nothing; silent operation)
  - If tasks found → agent executes proactively, **resuming the session on its own initiative**
- **tasks.md pattern** — file containing user-relevant activities that require main thread context:
  - Content managed manually or by the agent itself
  - Entries can be repeatable (daily briefings, event notifications) or one-time
  - Agent personalizes execution based on environment and conversation history
- **Isolated sessions complement the main thread** — webhooks and cron jobs run in separate, single-turn sessions with no shared context; prevents context pollution
- **Proactive triggers can depend on**: time (deadlines, schedules), environment (location, weather, device state), user activity (current tasks, open apps), external events (calendar, messages)

## Environment-Driven Context Enrichment (S03E03 §2-§3)

- **Environment layer** — real-time state available to the agent:
  - **Time** — current datetime, timezone
  - **Location** — resolved place ID + coordinates
  - **Weather** — live temperature, wind, precipitation
  - **Device state** — movement mode, battery, active calls, connected apps
- **Device context signal taxonomy** (S04E03 §4) — agents can access detailed device status for adaptive behavior:
  - **Desktop signals**: process (active app, window title, open windows), system (CPU/RAM, battery, screen locked, idle time), audio/input (mic/camera active, audio device), network (interface, bandwidth)
  - **Mobile signals**: motion & location (location class, accelerometer, activity type, proximity), power (battery, charging, wifi/cellular), OS/focus (focus mode, brightness, audio route, screen state)
  - **Core engine** mediating signals: state merge (unified snapshot, timestamps, delta detection) → rule engine (thresholds, schedules, quiet hours, priority routing) → notification policy (suppress duplicates, channel selection, snooze/ack) → local storage (SQLite log, JSON config)
  - Practical use: auto-DND when in specific apps; SMS/phone for critical events during focus time; location context added to agent memory
- **Multi-hop enrichment** — agent connects fragmentary information from multiple sources:
  - Pattern: sparse user input → contact lookup → web search → place resolution → rich output (calendar event with full details, context-aware notification)
  - Transforms low-value fragments into high-value, actionable data
- **Heartbeat convergence triggers** — proactive action fired when multiple environmental signals align:
  - Example: time (Friday 4pm) + task tracker (11 tickets, sprint ends Monday) + memory (avg 4.2 tickets/day) + calendar (62h until deadline) → capacity mismatch detected → surface prioritization UI
  - Example: location (SF) + conversation memory ("catch up with Alice in SF", 11 days ago) + contacts (Alice's profile) + calendar (overlap slot found) → all conditions met → draft message with one-tap send
- **Background agents create business value** by connecting dispersed information — standardize and elevate process quality (marketing, sales, support)
- **Security consideration**: agent may confuse addresses/participants or include confidential info in created entries — for sensitive operations, **deterministic code should manage contacts/recipients**, not the agent

## Agent Lifecycle Hooks (S03E03 §4-§5)

- **Hook taxonomy** (from [AI SDK](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text#experimental_on-tool-call-finish.on-tool-call-finish-event.output)):
  - **onStart** — agent begins work
  - **onStepStart / onStepFinish** — agent begins/completes a step in the loop
  - **onToolCallStart / onToolCallFinish** — agent begins/completes a tool invocation
  - **onFinish** — agent completes work
- **Extended hooks** (from projects like [Pi](https://github.com/badlogic/pi-mono)) can also cover: streaming, context building, session modification (compression), user activity monitoring, agent status tracking
- **Hooks should have access to**: current interaction state + session information → enables event emission and direct additional actions
- **Hooks as active control participants** (not just passive observers):
  - **Phase tracking** — flags per task (e.g., `listen_done`, `feedback_done`, `session_saved`); all flags set → snapshot phase → reset → ready for next iteration
  - **beforeFinish guardian** — checks all required steps completed; if incomplete → **automatically requests agent to complete them**; exception: step limit exceeded or tool errors → allow exit
  - **Session-end cleanup** (onSessionEnd) — always runs, best-effort; handles missing data
  - **beforeToolCall injection** — capture tool inputs, save file paths, inject additional context before tool execution
  - **afterToolResult tracking** — update progress flags, detect phase completion, trigger state transitions
- **"Model has freedom — hooks have authority"** — the model decides what to do, but hooks enforce process completion and correctness
- **Simple example**: generating session name (like ChatGPT's "New Chat" → descriptive title after first message) — hook on first user message triggers a side LLM call for title generation

## Feedback-Driven Agent Learning (S03E03 §3)

- **Agents can improve over time** without complex memory systems — simple domain-specific rules suffice for specialized agents
- **Instruction files per domain** — `instructions/{domain}.md`: site structure, selectors, URL patterns, scripts, known workarounds; prevents re-discovering the domain each session
- **Discoveries file** — `{domain}-discoveries.md`: learned workarounds and fallbacks accumulated across sessions; forms a **self-improving knowledge loop**
- **Escalating error response pattern**:
  - **Success** → silent (no extra action)
  - **Failure** → capture state (screenshot, log snapshot) for analysis
  - **Repeated failure** → save discovery (persist the learning for future sessions)
- **Feedback mechanisms can be**:
  - Tied to **specific tools** or **specific error categories** (not global)
  - Not just static hints but also **additional actions** providing extra context
  - Include instructions encouraging the agent to **save lessons from errors**
- **Code generation for automation** — agent can learn to create scripts for repeatable activities, progressively **replacing LLM calls with deterministic automation**
- **Content overflow handling** — when retrieved content exceeds context limits: save to file + search, or launch a subagent for the overflow
- **Principle**: wherever task execution can be simplified or the LLM skipped entirely, consider it — feedback should drive toward **automation of the repeatable, LLM for the novel**

## Human Support in Autonomous Systems (S03E03 §5)

- **Full autonomy is an illusion** — real-world complexity exceeds agent capabilities even for simple, well-defined processes
- **Design for human involvement from MVP stage**:
  - **Hook-mediated checkpoints**: hooks on session start / tool call can include human verification — not just for confirming untrusted actions, but for **filling missing information** and **resolving ambiguities**
  - **Pre-completion review**: agent analyzes its own actions before session end; may decide human support is needed or simply inform about execution status
  - **Before/after requirements**: system defines specific human activities required (e.g., "record a quality audio sample with genuine engagement")
- **"Offensive" vs "defensive" design thinking**:
  - **Defensive** (where will it fail?) — error handling, fallbacks, confirmations, exception interfaces
  - **Offensive** (what elevates the system?) — voice interface (even simple STT→TTS), richer interaction modes, proactive suggestions
  - Apply both perspectives simultaneously
- **User responsibility in agent effectiveness**:
  - Problems with agent performance **very often lie with users** working with agents inappropriately
  - Addressing through **product communication and onboarding** significantly impacts both perception and actual effectiveness
  - Must be treated with **equal importance** as technical architecture
- **Exception handling interface is non-negotiable** — autonomous agents running without human involvement still need UI for: name/entity conflicts, missing data, integration errors, ambiguous inputs
- **Voice interface as upgrade path** — even simple STT→TTS interaction can dramatically increase usability for background agents that need occasional human input
- **Habit building for agent adoption** (S05E05 §12) — configuring agents is not enough; must build the **habit of working with them**:
  - Connect agent interactions to existing routines: Discord user → notifications go there; phone-heavy → mobile app shortcut to chat; morning walk → WiFi disconnect triggers audio news briefing
  - Using an MCP integration once delivers zero value; daily newsletter is pointless if never read
  - One-time instruction polishing pays off repeatedly; short interactions reduce cost (own agents = pay per token)

## Internal AI Deployment & Adoption (S04E05 §1-§2)

- **Three compounding pressures** make AI adoption hard — skip any one and the rest become fragile (S04E05 §1):
  - **Business** — process changes carry costs (implementation + maintenance), legal/compliance concerns (provider choice, cloud solutions), need to communicate technical capabilities AND limitations to stakeholders
  - **Cultural** — even simple AI tools require engagement across organizational levels; bottom-up initiatives work best (internal workshops, experience sharing)
  - **Technical/Product** — familiar engineering extended with model selection, evaluation, agent architecture, and the acknowledgment that **100% accuracy is currently unlikely**
- **Query awareness gap** (S04E05 §1) — AI literacy varies even among technical users; expert users naturally include context injection ("Check Gmail and Slack, then my day plan file" = 3 tools invoked) while naive users send vague queries ("What do I have today?" = no tools invoked, empty response); the query itself IS the prompt
- **Four complementary adoption strategies** (S04E05 §1):
  1. **Build it right** — human in the loop, human-AI cooperation, fallbacks, security by design
  2. **Lead by example** — curiosity over mandates, bottom-up adoption, discover actual needs, visible wins first
  3. **Redesign the workflow** — build around AI not on top, new handoffs and ownership, feedback loops
  4. **Prove it small, scale or don't** — high-value low-risk pilots, quick wins build trust, small by design is valid, measure before expanding
- **Small experiments trigger adoption cascades** (S04E05 §4) — demonstrating a tool to real users in their domain immediately surfaces needs no one anticipated; each demonstrated tool creates demand for the next one

## Lightweight AI Tools — Documents, Prompts, and Custom Interfaces (S04E05 §2-§4)

- **AI deployment can be as simple as a well-crafted document** — not every solution needs an agent or custom application (S04E05 §2):
  - **Checklist** — process verification document with AI-assisted checking (e.g., content review for SEO, internal linking, category-specific sections); significantly reduces manual oversight errors
  - **Onboarding** — comprehensive reference with AI-powered fuzzy search; new employees don't know exact search phrases, AI matches even distant queries to correct content
  - **Style guide** — a single prompt describing consistent visual style shared across a team; simple thing with large impact on perception
- **AGENTS.md and Skills as precedent** — simple instruction sets work in programming and apply equally well to non-code processes; documents/prompts gain new meaning when viewed through this lens
- **When documents are not enough** (S04E05 §3) — documents alone are fragile because agents interpret them freely; when combined with uncontrolled user queries, consider:
  - **Internal MCP server** or independent tool fully tailored to a specific process
  - **AI makes building cost-effective** — even tools used briefly can be worth building; creation cost has dropped dramatically
- **Content review agent pattern** (S04E05 §3) — paragraph-by-paragraph processing with add_comment tool:
  - Agent receives each text fragment, decides whether to comment (0, 1, or multiple comments per block)
  - **UI is the critical differentiator** — "same effect from pasting into ChatGPT" but no convenient way to manage, accept/reject, or re-run suggestions; custom UI transforms raw AI output into a workflow
  - **Design for the process, not the technology** — power comes from aligning with how people actually work (inline comments, accept/reject), not from the underlying AI capability

---

## Review Checklist

When reviewing any agent, skill, or tool, check:

```
TOOL DESIGN
□ Tool registry defined with capabilities, cost, limits, and fallbacks per tool? (S05E05 §3)
□ Tool count ≤15 per agent? (S01E02 §12)
□ Every tool response has hints array? (S01E03 §6)
□ Large tool results saved to file, not dumped into context? (S01E02 §11)
□ Tool namespace prefixed for multi-server setups? (S01E03 §13)
□ Batch operations supported where applicable? (S01E02 §3)

SCHEMA & OUTPUT
□ Schema has reasoning/thinking field first? (S01E01 §2)
□ Enums include unknown/neutral escape hatch? (S01E01 §2)
□ Dynamic responses follow 5 rules (error+fix, status, suggestions, options, corrections)? (S01E03 §6)

CONTEXT & PERFORMANCE
□ System prompt is stable (no dynamic data injected)? (S01E02 §11)
□ Prompt cache preserved (immutable history)? (S01E02 §11)
□ Progressive disclosure (load on demand, not upfront)? (S01E02 §12)
□ Cost/token tracking in metrics? (S01E05 §3)
□ Rate limits handled programmatically? (S01E02 §3)
□ System prompt follows 4-category structure (universal, environment, session, multi-agent)? (S02E01 §1)
□ Dynamic state injected via user messages, not system prompt? (S02E01 §5)

SECURITY & SAFETY
□ Prompt injection addressed in project assumptions? (S01E02 §14)
□ Destructive actions confirmed via UI buttons, not chat? (S01E02 §13)
□ Trusted tools mechanism (checksum invalidation on schema change)? (S01E05 §1)
□ Content moderation on input? (S01E05 §4)
□ Permissions enforced in code, not LLM-decided? (S01E02 §13)
□ LLM-generated HTML sanitized via DOMPurify or equivalent (XSS from model output)? (S05E02 §1)
□ Dry-run as default for data-modifying operations? (S02E01 §10)
□ Backup before destructive operations? (S02E01 §10)
□ Operation log with undo capability? (S02E01 §10)
□ Legal protection addressed (ToS, Privacy Policy) for AI-generated actions/outputs? (S01E05 §5)
□ Conversation manipulation defended (message deletion disabled, branching/rollback instead)? (S05E04 §2)
□ Agent messages with tool calls immutable (not user-editable) to prevent many-shot jailbreaking? (S05E04 §2)
□ System prompt mentions NO capabilities that aren't actually available (phantom tool risk)? (S05E04 §2)

AGENT DESIGN
□ Routing intelligence designed (intent + complexity → single tool, chain, or human escalation)? (S05E05 §3)
□ Memory architecture covers 3 layers (short-term, long-term, episodic)? (S05E05 §3)
□ Graduated autonomy spectrum defined (read-only → supervised → trusted → full auto)? (S05E05 §3)
□ Agent resolution bound to immutable revision for reproducible behavior? (S05E05 §7)
□ "What You Do NOT Have" section present — also covers deactivated tools (phantom tool risk)? (S01E05 §8, S05E04 §2)
□ Model informed about its own limitations? (S01E05 §8)
□ Error recovery path defined? (S01E05 §1)
□ Agent Harness layers considered (core + control plane + 5 external mechanisms)? (S01E02 §7, S02E01 §6)
□ Human confirmation for irreversible actions? (S01E02 §13)
□ "What does this agent not know, but should know?" answered? (S02E01 §10)
□ Workspace/inter-agent communication designed (if multi-agent)? (S02E01 §9)

EXTERNAL CONTEXT & RAG (S02E02)
□ Agent toolkit minimized to reduce prompt injection attack surface? (S02E02 §1)
□ Instruction dropout mitigated (critical instructions repeated when large external content loaded)? (S02E02 §1)
□ External content validated programmatically (size, format, MIME, moderation)? (S02E02 §2)
□ Source attribution metadata included with retrieved content (file, page, line range)? (S02E02 §3)
□ RAG architecture tier justified (filesystem → SQLite → dedicated engine)? (S02E02 §5)
□ Base knowledge interference addressed (model may skip search for known topics)? (S02E02 §8)
□ Search results distinguished as "relevant" vs merely "similar"? (S02E02 §7)
□ Search approach justified against 4-tier framework (direct loading → text files → hybrid → graph)? (S05E02 §4)
□ Embedding model dimensions match vector store config? Same model for indexing and search? (S02E02 §6)

KNOWLEDGE BASE DESIGN & LONG-TERM MEMORY (S02E03)
□ External KB built FOR agent navigation, not connected to human-designed docs? (S02E03 §3)
□ Generic navigation rules used (point to directory, not specific file paths)? (S02E03 §3)
□ If agent needs cross-session memory: Observer/Reflector or similar incremental compression considered? (S02E03 §2)
□ If multi-agent: shared KB directory used as handoff layer vs direct agent-to-agent communication? (S02E03 §5)
□ If multilevel relationships across documents: graph-based approach (Neo4j) evaluated? (S02E03 §6)
□ If agent produces long-form output: pipeline uses iterative gap detection loop, not one-shot generation? (S02E03 §7)
□ If agent processes audio: privacy routing (local vs cloud) decided before deployment? (S02E03 §8)

AGENT INSTRUCTION DESIGN (S02E05)
□ Prompt structured in 4 sections (identity, protocol, voice, tools)? (S02E05 §2)
□ Identity section uses narrative form with character traits across role areas? (S02E05 §2)
□ Identity has zero tool references (abstract, stable)? (S02E05 §2)
□ Protocol uses 4 instruction types (principle, action, reference, guardrail)? (S02E05 §2)
□ Voice section detailed enough to prevent model reverting to default tone? (S02E05 §2)
□ Voice includes situational calibration (time gaps, error handling, success)? (S02E05 §2)
□ Tools section separates authored (stable) vs dynamic (injected) content? (S02E05 §2)
□ Closing identity seal present (CTA-style)? (S02E05 §2)
□ Tool assignment considers shared tools to reduce inter-agent communication? (S02E05 §3)
□ Cross-tool information flow risks assessed? (S02E05 §3)
□ Knowledge categories identified (session/public/private/agent/cache/runtime)? (S02E05 §4)
□ Knowledge routing rules handle ambiguity (same info → multiple categories)? (S02E05 §4)
□ Sandbox evaluated for agents needing flexible tool composition or large data? (S02E05 §3)
□ "Will this system improve with better models?" question answered? (S02E05 §3)

OBSERVABILITY & EVALUATION (S03E01)
□ Observation types defined (session/trace/span/generation/agent/tool/event)? (S03E01 §3)
□ Centralized gateway for intercepting all LLM + tool calls? (S03E01 §3)
□ Session context enriched (userId, sessionId, agentId, promptVersion, metadata)? (S03E01 §3)
□ Observed user data anonymized? (S03E01 §3)
□ Prompt versions linked to execution metrics (latency, cost, score)? (S03E01 §5)
□ Minimum viable evals defined (at least tool selection + tool usage)? (S03E01 §9)
□ Eval datasets cover all behavior categories with balance across tools? (S03E01 §7)
□ Online violation detection for input and output? (S03E01 §9)

AI ROLE & SCOPE DESIGN (S03E02)
□ AI role defined as agentic support (not full automation)? (S03E02 §1)
□ Multi-context agents use phase separation (read-only triage vs isolated drafting)? (S03E02 §2)
□ Hard enforcement layers (L1-L3) protect against data leaks independent of prompt compliance? (S03E02 §3)
□ Contact-type/trust-level knowledge scoping implemented? (S03E02 §2)
□ Agent lacks send/publish actions for irreversible external communication? (S03E02 §2)
□ Filtering barrier (isolated guard LLM) considered for user-facing agents? (S03E02 §7)
□ Three deployment questions answered (what if wrong → HITL, generate vs select, do you really need this)? (S05E02 §6)

TASK ORCHESTRATION (S03E02)
□ If process needs agent flexibility + high reliability: heartbeat pattern considered? (S03E02 §4)
□ Task contracts structured as markdown with frontmatter (status, deps, capabilities)? (S03E02 §5)
□ Routing logic is deterministic code, LLM only runs inside claimed tasks? (S03E02 §5)
□ Human-in-the-loop path defined for decisions system can't make? (S03E02 §6)

PERFORMANCE & CODE EXECUTION (S03E02)
□ Large data processing uses code generation + sandbox (not context loading)? (S03E02 §9)
□ Agent samples schema from single file before writing processing code? (S03E02 §9)
□ Critical document agents supervised with code-controlled data loading processes? (S03E02 §9)

MULTI-AGENT DESIGN (S02E04)
□ Architecture pattern selected and justified (pipeline/blackboard/orchestrator/tree)? (S02E04 §1)
□ Inter-agent communication tools designed with careful descriptions (delegate/message)? (S02E04 §2)
□ If event-driven: topics defined as shared contracts, agents decoupled? (S02E04 §3)
□ Context conflict strategy chosen (detection, avoidance, managing agent, history, manual)? (S02E04 §4)
□ Communication degradation addressed (assume partial info, verify)? (S02E04 §5)
□ Shared context scoped with R/O, R/W permissions per agent? (S02E04 §6)
□ Manager agent responsibilities defined (7 areas) with escalation rules? (S02E04 §9)
□ Agent vs simpler approach justified against 6 criteria? (S02E04 §8)

AUTONOMOUS AGENT DESIGN (S03E03)
□ Trigger types identified (messages/hooks/webhooks/cron/heartbeat)? (S03E03 §1)
□ Single entry point or multiple ingestion paths justified? (S03E03 §1)
□ Session strategy per trigger defined (new session vs persistent main thread)? (S03E03 §2)
□ If proactive: heartbeat pulse injection + tasks.md pattern designed? (S03E03 §2)
□ If proactive: which tasks share main thread vs run in isolated sessions? (S03E03 §2)
□ Agent lifecycle hooks designed (which points, passive vs active control)? (S03E03 §4)
□ If hooks used: phase tracking flags + guardian gates defined? (S03E03 §4)
□ Feedback/learning mechanism for error recovery and domain improvement? (S03E03 §3)
□ Escalating error response defined (silent → capture → save discovery)? (S03E03 §3)
□ Environment data integration designed (time, location, device state)? (S03E03 §2)
□ Sensitive operations handled by deterministic code, not agent? (S03E03 §3)
□ Human support path designed (offensive + defensive)? (S03E03 §5)
□ User education/onboarding for agent interaction considered? (S03E03 §5)
□ Exception handling interface exists for autonomous operation? (S03E03 §5)
□ Background task instructions precise (explicit paths, tool names, conflict rules) not vague? (S05E05 §11)
□ Habit-building considered (connect agent to existing user routines for adoption)? (S05E05 §12)
□ Tools with embedded API calls: own keys or MCP Sampling? (S03E03 §6)

TOOL DESIGN PROCESS & EVALUATION (S03E04)
□ Tool schema designed iteratively with LLM (not accepted from first draft)? (S03E04 §1)
□ Response envelope includes nextAction hints + recovery guidance? (S03E04 §2)
□ Mutation tools return changed state for immediate agent feedback? (S03E04 §2)
□ Agent decision surface minimized (tool resolves what it can programmatically)? (S03E04 §2)
□ Binary/large content returned as URL, never as base64/raw? (S03E04 §2)
□ Policy constraints enforced at tool level (not prompt-level)? (S03E04 §2)
□ Eval datasets cover per-tool (stateless) + scenarios (stateful chains)? (S03E04 §3-§4)
□ Tools tested with minimal system prompt to verify schema self-sufficiency? (S03E04 §4)
□ Multiple models compared via evals before final selection? (S03E04 §5)
□ Tool interfaces optimized for weaker models (benefits all models)? (S03E04 §5)

BEHAVIOR SHAPING & GENERATIVE UI (S03E05)
□ Scripted vs aware agent decision made (does this agent need open interpretation or deterministic behavior)? (S03E05 §1)
□ If aware agent: 5-layer behavior-shaping architecture considered (identity, cognition, social, expression, reinforcement)? (S03E05 §2)
□ If aware agent: instructions create conditions for emergent behavior rather than specifying behavior directly? (S03E05 §3)
□ If aware agent: think/recall tool pattern designed for gap detection and gradual discovery? (S03E05 §1-§2)
□ If agent generates UI: approach selected (artifacts vs JSON Render vs MCP Apps) with control/freedom trade-off justified? (S03E05 §4-§5)
□ If using generative UI: libraries chosen for model proficiency, not latest versions? (S03E05 §4)

INTERFACE & COLLABORATION (S04E02)
□ Interface selection evaluated (CLI/MCP/messenger/custom) against scenario fit matrix? (S04E02 §1-§2)
□ Build-vs-integrate decision made with economic factors considered (subscription vs API cost)? (S04E02 §1)
□ MCP limitations assessed if using MCP integration (sampling, personalization, permissions, background)? (S04E02 §3)
□ If user-facing: 4 personalization pillars addressed (profiles, skills, tools, workflows)? (S04E02 §4)
□ UX quality considered beyond feature presence (discoverability, control granularity, status transparency)? (S04E02 §4)
□ Micro-action opportunities identified before building complex agent systems? (S04E02 §5)
□ If generating prompts/instructions: meta-prompt pattern considered (4 layers, 6 section families)? (S04E02 §6)
□ If meta-prompt used: phased generation for complex prompt construction? (S04E02 §6)
□ If streaming chat UI: incomplete Markdown repair handled (remend or equivalent)? (S05E02 §1)
□ If voice agent: mode selected (STT/TTS vs Realtime) with cost/latency trade-off justified? (S05E02 §3)

AI WORKFLOW RESILIENCE (S04E03)
□ Silent degradation addressed (output quality monitored, not just uptime)? (S04E03 §7)
□ Retry uses exponential backoff + jitter (not naive retry)? (S04E03 §7)
□ Error type classified before retry decision (transient vs permanent)? (S04E03 §7)
□ Circuit breaker per external dependency (prevents cascade failures)? (S04E03 §7)
□ Dead letter queue for business-critical data (failed tasks preserved, not lost)? (S04E03 §7)
□ Output validation includes schema conformance + length/proportion checks + canary tests? (S04E03 §7)
□ Alert threshold ≤5 minutes for first anomalous output? (S04E03 §7)
□ Background agents isolated via shared surfaces (no direct agent-to-agent communication)? (S04E03 §5)
□ Self-observing monitor agent checks output volume, delivery rate, source availability? (S04E03 §6)
□ Tool stack audited for AI integration potential (API, webhooks, deep-links, scope)? (S04E03 §1-§2)

KNOWLEDGE BASE & NOTE DESIGN (S04E04)
□ KB scope defined through 4-layer funnel (daily life → tools → AI-applicable → KB scope)? (S04E04 §1)
□ Human-AI engagement balance defined per KB area (who owns content vs organization)? (S04E04 §6)
□ Notes written as if reader has zero prior context (no unnamed refs, no opaque links, no vague temporal refs)? (S04E04 §5)
□ Key wikilinks repeated in frontmatter to survive partial reads? (S04E04 §5)
□ Note templates defined with consistent frontmatter levels (minimal/standard/full)? (S04E04 §3, §7)
□ Markdown vs collaborative tool boundary decided per area (not mixed)? (S04E04 §4)
□ Images use remote URLs with token-based paths (not local file paths)? (S04E04 §4)
□ If KB-driven processes: ops directory with static instruction files + dated output folders? (S04E04 §8)

AUTOMATION VERIFICATION (S04E04)
□ Scheduled tasks use external heartbeat monitoring (ping service, not just exit code)? (S04E04 §9)
□ Output validated for existence, size, format, and content completeness? (S04E04 §9)
□ Schedules have explicitly declared timezone (not server default)? (S04E04 §9)
□ Concurrent execution prevented via lockfile with TTL-based crash recovery? (S04E04 §9)
□ Silent refusal handled (task correctly refuses + alerts, not just silently skips)? (S04E04 §9)

INTERNAL AI DEPLOYMENT & ADOPTION (S04E05)
□ Three adoption pressures assessed (business/cultural/technical) with mitigation for each? (S04E05 §1)
□ Query awareness gap addressed (user education on effective prompting)? (S04E05 §1)
□ Simplest viable solution considered first (document/prompt before custom tool before agent)? (S04E05 §2)
□ Small-scale pilot planned before full deployment? (S04E05 §1, §4)
□ 5 deployment risk categories assessed (data leak, destruction, silent drift, tool misfire, misleading advice)? (S04E05 §5)
□ Model behavioral awareness (eval gaming, sandbox bypass) factored into security design? (S04E05 §5)
□ If generative UI: business-process-aligned interfaces designed (not simple function mappings)? (S04E05 §6)
□ MCP Apps used for multi-tool aggregation with deterministic action buttons? (S04E05 §6-§7)

DEPLOYMENT & ARCHITECTURE (S04E01)
□ Collaboration mode decided (synchronous/asynchronous/hybrid) with 7 axes evaluated? (S04E01 §2)
□ Decision map created (constraint→decision→consequence per dimension)? (S04E01 §3)
□ Engineering vs AI-driven balance assessed per component? (S04E01 §3)
□ Content ownership defined (agent enriches vs replaces) with promotion gate if needed? (S04E01 §3)
□ Assumptions validated through targeted tests before full build? (S04E01 §4)
□ Minimal foundation defined as starting point? (S04E01 §1)
□ Three deployment questions answered: what to do, what NOT to do, how to do it? (S04E01 §3)

GENERATIVE APP ARCHITECTURE (S05E01)
□ AI interactions centralized through a gateway (not scattered across codebase)? (S05E01 §1)
□ Multi-provider openness considered (not locked to single provider)? (S05E01 §1)
□ API uses specialized endpoints with typed contracts (not generic /api/chat)? (S05E01 §1)
□ Data schemas use primitives (polymorphic items/artifacts) over specialized structures (messages)? (S05E01 §2)
□ System designed so model improvements amplify capabilities (not become a threat)? (S05E01 §2)
□ Event streaming supported for progress reporting and long-running tasks? (S05E01 §1)
□ Long-horizon task handling planned (disconnected execution, timeout resilience)? (S05E01 §1)
□ If multi-provider: provider router with field mapping and response normalization? (S05E01 §4)
□ If dynamic task orchestration needed: DAG scheduler with deterministic logic considered? (S05E01 §3)
□ Agent roles determined by tools + prompt (not code structure) — flat implementation, hierarchical behavior? (S05E01 §3)

FEATURE DEVELOPMENT & EVOLUTION (S05E03)
□ Architecture designed for capability expansion via levers (model swap, tool addition, service connection) without core logic changes? (S05E03 §4)
□ New API features/tools evaluated against signal vs noise framework (cross-provider, keeps returning, aligns with primitives)? (S05E03 §3)
□ Model migration evaluated for both stability AND new opportunities (prompt simplification, logic simplification, increased complexity)? (S05E03 §3)
□ Smaller model tiers (mini/nano) evaluated with extra scrutiny (may only appear better)? (S05E03 §3)
□ Deployment failure areas addressed (rate limits, moderation, performance, speed, costs, effectiveness, usefulness)? (S05E03 §6)

PRODUCTION UX & GROUNDING (S05E04)
□ Chat interface uses branching/rollback instead of message deletion? (S05E04 §2)
□ Agent messages (especially with tool calls) immutable — not user-editable? (S05E04 §2)
□ System prompt mentions NO capabilities that aren't actually available? (S05E04 §2)
□ Large content paste detected and converted to file attachment? (S05E04 §2)
□ Audio transcription output validated before passing to agents (silence hallucinations, language mixing)? (S05E04 §2)
□ If agent generates factual claims: grounding strategy defined (verification layers, confidence scoring)? (S05E04 §5-§6)
□ RAG and grounding treated as separate steps (context retrieval vs source verification)? (S05E04 §6)
□ Confidence scoring communicates probabilistic truth to users (not binary true/false)? (S05E04 §12)
□ Chat vs chatless agent decision made (event-driven/background may provide more control)? (S05E04 §11)
□ User AI literacy gap addressed (assume zero knowledge of model behavior)? (S05E04 §11)
```
