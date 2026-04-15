# Planning Checklists

> Tier 2 reference file for the architect skill. Load the relevant section based on what you're planning.
> These checklists are derived from the knowledge base mindmaps — every item cites its source.

---

## 1. For New Agents/Skills

- **Role definition** — what it does, what it doesn't do (explicit boundaries)
- **Agent Harness** — two-layer architecture + external mechanisms (S01E02 §7, S02E01 §6):
  - **Agent Core** (cognition): model, instructions, reflection, planning, function calling, state loop
  - **Harness** (control plane): execution, state/context, reliability/control, orchestration, error recovery
  - **Beyond context window** (S02E01 §6): which of the 5 external mechanisms apply? (session hooks, environment signals, files, multi-agent cooperation, background memory)
- **Agent instruction anatomy** (S02E05 §2) — structure the prompt in 4 sections:
  - **Identity** — persona, character traits, 10 role areas (orchestration, delegation, memory, physical awareness, persistence, autonomy, error recovery, escalation, communication, relationship); no tool references; "show don't tell" via vocabulary
  - **Protocol + Memory** — operating rules (principle/action/reference/guardrail), context management, delegation briefing, memory layout; reference directories generically
  - **Voice** — 6 mechanisms (expression, association, calibration, format, anti-pattern, demonstration); few-shot examples for tone; situational calibration (time gaps)
  - **Tools** — 3 layers (direct capabilities, dynamic roster via injection, pointers to detailed docs); identity seal closing line
- **Toolkit design** — which tools, why (following 4-not-13 rule, S01E03 §2)
  - Max 10-15 tools per agent (S01E02 §12)
  - Each tool must be self-explanatory (name + description = enough, S01E02 §3)
  - Every response includes hints — both success and error paths (S01E03 §6)
  - Tool results saved to file when large, return summary + path (S01E02 §11)
  - If custom tools needed: iterative design with LLM (S03E04 §1); don't accept first-draft schemas; inject design rules to generalize corrections
- **Input/output schema** — with reasoning-first field order (S01E01 §2)
  - Include `unknown`/`neutral` values to avoid forcing hallucinations
  - Descriptions in JSON Schema ARE instructions for the model
- **Integration point** — where in the pipeline, what triggers it
- **Model selection** — haiku/sonnet/opus with rationale (S01E05 §2)
  - Evaluate smaller tiers (mini/nano) with extra scrutiny — may only appear better (S05E03 §3)
  - Consider new opportunities from model upgrades — prompt simplification, logic simplification, or increased complexity (S05E03 §3)
- **Capability evolution design** (S05E03 §4) — architecture should allow dramatic expansion through 3 levers without core logic changes:
  - Model swap (deeper reasoning), tool addition (new capabilities), service connection (new integrations)
  - Design the **environment** (tools, sandbox, permissions), not the **process** — agent designs the process at runtime (S05E03 §1)
- **Error recovery** — what happens on failure (S01E05 §1)
- **Prompt cache** — ensure system prompt is stable, no dynamic data injected (S01E02 §11)
- **External context strategy** (S02E02 §1) — if agent loads external data:
  - Instruction dropout mitigation: how to keep instruction adherence high when context grows? (repeat instructions, limit loaded content, use subagents for decomposition)
  - Source scope: what content does the agent access? Narrower scope = smaller injection surface
  - Toolkit minimization: does removing a tool eliminate an attack vector without losing needed capability?
  - Source attribution: do tool results include provenance metadata (file, page, line range) for model reasoning and UI citations? (S02E02 §3)
  - RAG tier: filesystem, SQLite+extensions, or dedicated engine? Start simple (S02E02 §5)
  - Chunking strategy: characters, separators, context-enriched, or topic-based? Paired with "how will the agent reach them?" (S02E02 §4)
  - Synchronization: how does the KB stay current with source data? Event-based or scheduled sync? (S02E02 §2)
- **Knowledge base strategy** (S02E03 §3-§4) — how does the agent access external knowledge?
  - Build FOR agents (structured navigation, no discovery search) vs connect to existing human-designed docs?
  - Generic navigation rules: point agent to a directory, not a specific file — survives tool changes
  - 4 navigation modes available to agents: perspective (ls), navigation (grep), links (internal references), details (read)
- **Long-term memory strategy** (S02E03 §2) — if agent needs cross-session memory:
  - Observer/Reflector pattern: incremental compression via log journal; no semantic search dependency
  - Define compression trigger and accept the trade-off: compression = natural forgetting over time
  - Agents can still load earlier memories on demand via tools even after compression
- **Deep action pattern** (S02E03 §7) — if agent produces long-form output through exploration:
  - Plan for query enrichment before the agentic loop (clarification → structured prompt, not raw user query)
  - Loop must include explicit gap detection: decompose → search → read → find gaps → evaluate → refine → report
  - "Deep Action" applies to code generation, audits, analysis — not just research
- **Sandbox consideration** (S02E05 §3) — if agent needs flexible tool composition or operates on large data:
  - Progressive discovery (list_servers → list_tools → get_schema → execute_code) as alternative to preloading all tools
  - Code generation as meta-tool: agent writes code that calls tools, data stays in sandbox variables (not in context)
  - Trade-off: higher architecture complexity + costs vs flexibility + security isolation
  - Design heuristic: "Will this system improve with better models?" — if no, reconsider the approach
- **Knowledge categories** (S02E05 §4) — which of 6 categories does agent data belong to?
  - Session documents, public knowledge, private knowledge, agent knowledge, cache, runtime
  - Same information can belong to multiple categories — routing rules must handle ambiguity
  - Prefer simple structures; question whether advanced long-term memory is truly needed
- **AI role definition** (S03E02 §1) — is the agent providing agentic support (assist humans) or full automation (replace humans)? Default to support. Four anti-patterns to avoid: org-wide RAG, public chatbot, mass auto-emails, all-in-one agent. Prefer dedicated, specialized tools.
- **Scope isolation design** (S03E02 §2-§3) — if agent handles multiple accounts/contexts/trust levels:
  - Phase separation: read-only triage (all data visible) vs isolated drafting (locked to one context)
  - Contact-type/trust-level knowledge scoping: different trust levels → different KB categories accessible
  - Defense stack: L1-L3 hard enforcement (sessions, KB lock, contact scoping) + L4 soft (prompt rules); L4 failure safe because L1-L3 already removed dangerous data
  - Remove irreversible actions (send, publish) from agent toolkit — human handles final step
- **Heartbeat pattern** (S03E02 §4-§6) — if process needs agent flexibility + high reliability (too dynamic for workflow, too critical for free-form agent):
  - Task contracts as markdown with frontmatter (id, title, status, deps, agent, capabilities, attempts)
  - Deterministic heartbeat logic: evaluate deps → dispatch eligible → reconcile after each round
  - LLM only runs inside claimed tasks; agents never self-select work
  - Human-in-the-loop path for decisions system can't make autonomously
- **Autonomous trigger design** (S03E03 §1) — which of 5 trigger types activate this agent: messages, hooks, webhooks, cron, heartbeat?
  - Single entry point (all triggers converge to one ingestion layer) or multiple paths?
  - Session strategy per trigger: new session (isolated, no shared context) or injected into persistent main thread (shares conversation history)?
  - Natural language task descriptions can be built by code or come from other agents — both interpreted the same way
- **Proactive session design** (S03E03 §2) — is this agent reactive-only or proactive?
  - If proactive: persistent session with compression (Observer/Reflector) + heartbeat pulse injection (tasks.md pattern)
  - Which tasks share the main thread (need conversation context) vs run in isolated sessions (independent operations)?
  - Proactive triggers can depend on: time, environment (location, weather, device), user activity, external events
- **Agent lifecycle hooks** (S03E03 §4-§5) — which lifecycle points need interception?
  - Hook taxonomy: onStart, onStepStart/Finish, onToolCallStart/Finish, onFinish
  - Hooks as passive observers (logging, metrics) or **active controllers** (phase tracking flags, guardian gates, context injection)?
  - beforeFinish guardian pattern: check all required steps completed; block exit if incomplete; allow exit on step limit or errors
  - Phase tracking: flags per task (e.g., `step1_done`, `step2_done`); all flags set → snapshot → reset → next iteration
- **Feedback/learning strategy** (S03E03 §3) — how does the agent improve from errors?
  - Domain-specific instruction files (instructions/{domain}.md) to avoid re-discovery?
  - Discoveries file for learned workarounds — self-improving knowledge loop?
  - Escalating error response: success→silent, fail→capture state, repeat fail→save discovery?
  - Can recurring tasks be automated via code generation, progressively replacing LLM calls?
- **Environment integration** (S03E03 §2-§3) — does the agent benefit from real-time environment data?
  - Environment layer: time, location, weather, device state, connected services
  - Multi-hop enrichment of sparse inputs (contact → web search → place lookup)
  - Heartbeat convergence triggers: multiple environmental signals converge to fire proactive action
  - Context-aware notification routing (adjust messaging based on weather, travel time, user state)
- **Human support design** (S03E03 §5) — design both "offensively" and "defensively":
  - Offensive: what capabilities elevate the system? (e.g., voice interface as dramatic usability upgrade)
  - Defensive: where will it fail? (error handling, fallbacks, confirmations)
  - User education/onboarding: how to work with the agent effectively — user behavior directly impacts agent performance
  - Hook-mediated human checkpoints: not just for confirming untrusted actions, but for filling missing info and resolving ambiguities
  - Exception handling interface: autonomous agents still need UI for name conflicts, missing data, integration errors
- **Prompt injection defense** (S03E02 §7) — filtering barrier pattern: isolated guard LLM classifies input as safe/unsafe via programmatic string match; combine with toolkit minimization + programmatic access control + content moderation
- **Code execution strategy** (S03E02 §8-§9) — if agent processes large data or needs precise calculations:
  - Code generation + sandbox (Deno/similar) as primary optimization lever
  - Four-phase pattern: discover (explore structure) → sample (read ONE file to learn schema) → process (generate code, data stays outside context) → output (generate deliverable)
  - Critical documents need strict supervision with code-controlled data loading processes
- **Behavior-shaping design** (S03E05 §1-§3) — scripted vs aware agent decision:
  - Scripted: deterministic triggers, scheduled memory, predictable behavior — suitable for task-execution agents
  - Aware: gap-felt recall, context-dependent behavior, open interpretation — suitable for conversational/advisory agents
  - If aware agent: consider 5-layer behavior-shaping architecture (identity/self-awareness, cognitive patterns, social/emotional cognition, expression/identity signals, reinforcement mechanics)
  - Cognitive architecture framing: create conditions for emergent behavior rather than specifying behavior directly
  - Think/recall tool pattern for gap detection and gradual information discovery
- **Generative UI strategy** (S03E05 §4-§5) — if agent generates visual interfaces:
  - Three approaches: artifacts (HTML gen, max freedom, iframe+CSP), JSON Render (declarative spec, component catalog, deterministic), MCP Apps (intent-based, server owns truth, interactive sync)
  - Selection depends on control/freedom trade-off and production requirements
  - Library selection: optimize for model proficiency, not latest versions
  - Approaches are not mutually exclusive — "when X, when Y, when X + Y"
- **Voice agent design** (S05E02 §3) — if agent uses voice interaction:
  - Mode selection: STT/TTS (3 models, text boundary, inspectable, higher latency) vs Realtime (1 model, native multimodal, lower latency, expensive)
  - STT/TTS sufficient for simple interactions; Realtime only for multimodal or latency-critical use cases
  - LiveKit for audio transport (silence/speech detection, interruption handling); ElevenLabs for TTS/STT
- **Chat UI considerations** (S05E02 §1) — if building agent chat interface:
  - Streaming Markdown requires: XSS sanitization (DOMPurify), incomplete syntax repair (remend), incremental tokenization (marked)
  - Plan for production features: attachments, thread branching, response interruption, keyboard shortcuts, sub-agent visualization
  - Performance at scale: conversations reaching hundreds of messages must remain responsive
- **Search tier selection** (S05E02 §4) — which of 4 tiers? Direct loading (no search needed), text files + agent navigation, hybrid search (full-text + semantic), graph-based indexing. Start at simplest tier that meets requirements. Pure vector-only is no longer recommended.
- **Three essential deployment questions** (S05E02 §6) — what happens when system is wrong (→ HITL), does model need to generate or select (→ routing > generation), do you really need this (→ data quality check)
- **Grounding strategy** (S05E04 §5-§6) — if agent generates factual claims: which verification layers (source exists → content confirms → confidence scoring)? RAG + grounding or grounding alone? Multi-model verification? How is confidence communicated to users (probabilistic, not binary)?
- **Conversation manipulation defense** (S05E04 §2) — if chat interface: message deletion disabled (use branching/rollback instead)? Agent messages with tool calls immutable? System prompt mentions no deactivated tools (phantom tool risk)?
- **Chat vs chatless agent** (S05E04 §11) — does this agent actually need a chat interface? Chatless agents (event-driven, observe behavior, react to actions/uploads) provide much greater control and are often easier to build in production
- **User AI literacy** (S05E04 §11) — assume users have zero knowledge of how models work; making AI easy to use for non-AI-literate users is an enormous production challenge
- **Master Controller components** (S05E05 §3) — 4 essential components for production: tool registry (catalog with capabilities/cost/limits/fallbacks), routing intelligence (intent + complexity → path selection), memory triad (short-term + long-term + episodic), graduated autonomy (read-only → supervised → trusted → full auto)
- **Agent instruction precision** (S05E05 §11) — background task instructions must be precise (explicit paths, tool names, conflict rules); every guess = potential failure point; one-time instruction polishing pays off repeatedly
- **System development areas** (S05E05 §13) — concrete growth areas for agent platforms: cron/scheduled tasks, environment context (S04E03, S03E05), loop hardening (tool error recovery, payload reuse), deeper integrations, mobile app (voice), management panel (interactive, not passive), artifacts, dedicated memory tools
- **Security** — prompt injection addressed? Destructive actions confirmed via UI? (S01E02 §13-14)
- **Legal/compliance** — system WILL do something it shouldn't; ToS, Privacy Policy, contracts addressing AI limitations (S01E05 §5)
- **Operational safety** (S02E01 §10) — dry-run as default? Backup before destructive ops? Confirmation for large batches? Operation log with undo?
- **Workspace design** (S02E01 §9) — if multi-agent: inbox/outbox/notes structure, session-scoped isolation, orchestrator-mediated communication
- **Multi-agent architecture** (S02E04 §1) — if multi-agent: which pattern(s)? Pipeline, Blackboard, Orchestrator, Tree? Often combined. Mesh/Swarm rarely justified in production.
- **Inter-agent communication** (S02E04 §2-§3) — delegate (spawn+await) and message (bidirectional, pause/resume)? Event bus with topics as shared contracts? Mixed LLM agents + deterministic services?
- **Context conflict strategy** (S02E04 §4) — which of 5 strategies? Detection (checksum), avoidance (ownership/permissions), managing agent, change history (append-only), manual resolution. Combine rather than rely on one.
- **Communication degradation** (S02E04 §5) — assume agents receive partial info; craft delegate/message descriptions carefully; return structured data alongside narrative
- **Manager agent scope** (S02E04 §9) — if orchestrator pattern: define 7 responsibilities (system knowledge, info access, tools, delegation, knowledge transport, decisions, verification); define escalation rules; plan for silent failures (skipped steps, not halts)
- **Context gap analysis** (S02E01 §10) — answer: "What does this agent NOT know, but should know, to avoid causing harm?"
- **Cost estimate** — tokens per invocation, expected cost (S01E05 §3)
- **Agent instruction safety**:
  - Include "What You Do NOT Have" section — explicitly state limitations to prevent hallucination (S01E05 §8)
  - Content moderation on input? Account block risk if missing (S01E05 §4)
  - Task list tools for multi-step work? Model needs self-reminders for priorities (S02E01 §8)
- **Observability strategy** (S03E01 §3) — which observation types needed (session, trace, span, generation, agent, tool, event)? Centralized gateway integration? Session context enrichment (userId, agentId, promptVersion, app-specific metadata)? User data anonymization?
- **Eval strategy** (S03E01 §6-§9) — minimum viable evals: tool selection accuracy + tool usage proficiency? Offline (dev/CI), online (production), or both? Dataset design: coverage, diversity, balance? Temporary evals for specific questions?
- **Prompt versioning** (S03E01 §5) — prompts linked to execution metrics (latency, cost, score)? One-way sync from code to observability platform? Playground replay for debugging?
- **Deployment collaboration mode** (S04E01 §2) — synchronous, asynchronous, or hybrid?
  - Evaluate 7 axes: setup, trigger, interface, feedback, state, permissions, autonomy
  - Sync: interface-central, human-supervised, broader permissions; Async: integration-central, self-recovering, scoped permissions
  - Hybrid is the natural pattern — decide the balance based on use case
- **Decision mapping** (S04E01 §3) — for each deployment dimension, trace: constraint → decision → consequence
  - Answer three questions: "What do we want to do?", "What do we NOT want to do?", "How do we want to do it?"
  - Label each decision as engineering, AI-driven, or hybrid; infrastructure serves the agent, not vice versa
  - Most decisions reversible except structural commitments (e.g., remote-first)
- **Foundation-first approach** (S04E01 §1) — define minimal starting point as base to build upon; "we can't do everything, but we can do anything"
- **Assumption validation** (S04E01 §4) — test assumptions early through targeted tests before full build
  - Build evaluation datasets for model/configuration choices
  - AI-accelerated prototyping compresses weeks into days; killing ideas costs hours, not months
  - Prepare for fast iterations — initial decisions will be wrong
- **Content ownership** (S04E01 §3) — if agent works with user content: agent enriches, never replaces; promotion gate between agent output and canonical content
- **Tool stack audit** (S04E03 §1-§2) — list all tools in the ecosystem, check each for API availability, webhook support, deep-link capability; evaluate AI integration scope per tool ("should AI use this, and with what scope?")
- **Background task scenario design** (S04E03 §3) — classify AI opportunities through two lenses: individual context scenarios (calendar review, event suggestions, agent email, active directories, signal listening, quality control) and data flow scenarios (project templates, routing/triage, workflow optimization, metric monitoring, reports)
- **AI workflow resilience** (S04E03 §7) — for any workflow with external LLM calls: implement retry+backoff+jitter, circuit breaker per dependency, dead letter queue for critical data, output monitoring (schema conformance, length checks, canary tests); silent degradation is the #1 risk
- **Agent isolation design** (S04E03 §5) — for background agent systems: design surface-based isolation (agents share directories, not state); growth by accretion (new agent never breaks existing); use self-observing monitor agent for system health
- **Knowledge base design** (S04E04 §1-§7) — if agent navigates or creates knowledge base content:
  - KB scope: which of the 5 domains (Me/World/Craft/Ops/System) does this agent interact with? What's human space vs agent space?
  - Note anatomy: are templates defined with consistent frontmatter (status, tags, access control)? Are wikilinks used for cross-referencing?
  - Context gaps: are notes written so agents can navigate them (no unnamed references, no opaque links, key links in frontmatter)?
  - Human-AI engagement balance: which activities are human-dominant, shared, or AI-dominant for this agent's KB area?
  - Format decision: markdown vs collaborative tool per area?
  - If KB-driven processes: ops directory with static instruction files + dated output folders?
- **Automation verification** (S04E04 §9) — if agent runs on a schedule or in background:
  - External heartbeat monitoring (ping service after each run, alert on missing ping)?
  - Output validation (exists? sensible size? correct format? content complete?)?
  - Explicit timezone declaration for schedules?
  - Lockfile for concurrent execution prevention?
  - Silent refusal handling (task refuses + alerts, not silently skips)?
- **Interface selection** (S04E02 §1-§2) — evaluate CLI/MCP/messenger/custom against scenario fit matrix (personalization, cost, team adoption, multi-agent, focused UI); combine interfaces rather than choosing one; consider economic factors (subscription vs API cost)
  - If MCP: assess 5 concrete limitations (no sampling, limited personalization, no tool invocation UI control, permission complexity, background actions)
  - If user-facing: address 4 personalization pillars (profiles, skills, tools, workflows); UX quality = discoverability + control granularity + status transparency
- **Micro-action assessment** (S04E02 §5) — before building complex agent systems, identify simple signal→verb→output actions deployable in minutes via keyboard shortcuts, scripts, or native apps
- **Meta-prompt design** (S04E02 §6) — if system generates prompts/instructions for agents or users: design as meta-prompt with 4 layers (core protocol, domain overlays, technique library, output layer) and 6 section families; consider phased generation for complex prompt construction
- **Internal deployment strategy** (S04E05 §1-§4) — if deploying AI within an organization:
  - Adoption pressures: assess business (cost, legal), cultural (engagement, literacy), and technical (non-determinism, accuracy) dimensions
  - Simplest viable solution first: document/prompt → custom tool/MCP server → full agent (escalate only when simpler approaches are insufficient)
  - Tool composition extensibility: same interface can serve different processes by changing tools (progressive levels: simple prompt → internet → documents → service integrations)
  - Deployment security: assess 5 risk categories (data leak, destruction, silent drift, tool misfire, misleading advice); model behavioral awareness (eval gaming, sandbox bypass); data isolation ≠ data safety
  - Small-scale experimentation: demonstrate prototypes to real users to surface unanticipated needs
- **Generative app architecture** (S05E01 §1) — six near-certainties: centralize AI interactions, multi-provider openness, event streaming, multimodality readiness, agent logic support (polymorphic schemas), long-horizon task handling
- **Primitives over features** (S05E01 §2) — design data schemas as open/polymorphic (items, artifacts) not closed/specialized (messages); design for model improvements amplifying capabilities, not threatening them
- **Multi-provider integration** (S05E01 §4) — if multiple providers in same logic: provider router pattern with unified endpoint, field mapping, response normalization; prefer custom logic with official SDKs for production
- **DAG-based task orchestration** (S05E01 §3) — if agent needs dynamic task planning: consider combined Orchestrator+Blackboard+DAG pattern with deterministic scheduler; flat implementation, hierarchical behavior (role = tools + prompt, not code)
- **Operational** (details in REFERENCE.md):
  - Performance strategy: which of 6 strategies apply? (S01E05 §2)
  - Observability: which of 3 event sources? HTTP, agent lifecycle, tool execution (S01E05 §10)
  - Provider abstraction needed? (S01E05 §6)
  - Event design: how will output be consumed? Event-based architecture for streamed/UI output (S01E01 §4)

---

## 2. For New Tools

- **Schema** — parameters with descriptions, types, defaults
- **Response format** — `{ success, data, hints }` envelope (S01E03 §6)
- **Dynamic responses** — 5 rules (S01E03 §6):
  1. Errors say what happened AND what to do next
  2. Resource status with special settings communicated
  3. Success suggestions prevent unnecessary steps
  4. Wrong values suggest available options
  5. Corrections reported (e.g., "Requested lines 48-70, document has 59 lines. Loaded 48-59.")
- **Validation** — input validation, common mistakes to autocorrect (S01E02 §4)
  - Accept multiple input formats (ID or name, flexible spelling)
  - Smart defaults — inject context (user ID from auth), safe fallbacks (timeouts)
- **Edge cases** — too many results, empty results, partial results, sandbox escapes
- **Source attribution** (S02E02 §3) — if tool returns document content, include provenance metadata (source, page, line range) for model reasoning and UI citations
- **Tool design process** (S03E04 §1) — iterative design with LLM: gather context → scan actions → design questions → generate schema → inject design rules → iterate; don't accept first-draft schemas (~60-70% quality)
- **Tool evaluation strategy** (S03E04 §3-§4) — per-tool (stateless) + scenario (stateful multi-turn) datasets; test with minimal system prompt to verify schema self-sufficiency; use Promptfoo or equivalent for offline evals
- **Model selection via comparative eval** (S03E04 §5) — test multiple models on same evals; compare efficiency/reliability/style; optimize tool interfaces for weaker models (benefits all models)

---

## 3. For Knowledge Integration

Use the `/integrate-knowledge` skill — it has the full workflow, classification framework, and target file references.

---

## 4. For Reviews

- **Checklist** against mind map principles (load `architect/REFERENCE.md` for full checklist)
- **Fix plan** — specific changes needed, ordered by priority

---

## 5. For Infrastructure

- **Problem statement** — what's missing, what breaks without it
- **Design** — following architecture decisions (S01E05 §6): no frameworks, event-driven, provider-independent
- **RAG tier selection** (S02E02 §5) — start with filesystem, move to SQLite+extensions, then dedicated engines only with concrete reason
- **Files to create/modify**
- **Verification** — how to test it works
