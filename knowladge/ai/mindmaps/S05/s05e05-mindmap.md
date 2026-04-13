# S05E05 — The New Reality

## 1. The State of AI Agents in 2026

- **The "year of agents" hype vs reality** — Sam Altman predicted AI agents joining the workforce in January 2025; the industry echoed "year of agents"; vendors promised autonomous systems replacing entire departments
- **The numbers are sobering**:
  - Gartner predicts **>40% of enterprise agent projects will be cancelled** by end of 2027
  - Deloitte TechTrends 2026: only **11% of organizations** have agents in production; 38% piloting; 35% have no agent strategy at all
  - Apex Agents benchmark: even top models (Gemini, GPT) completed **<25% of real office tasks** on first attempt; **40% after 8 attempts**
  - Gardner estimates only ~130 of thousands of "agent platform" vendors offer something real — rest is **agent washing** (rebranded chatbots)
- **Andrej Karpathy's framing**: "This is not the year of agents — it's the **decade of agents**." Current systems lack perception, memory, and real-world operation skills
- **The problem is not the engines (LLMs work increasingly well) — the problem is architecture**
  - Composio (2025), Harvard Business Review, IBM — all converge on the same conclusion: **none of the 3 core problems are about model quality**

## 2. Three Core Problems Preventing Agent Production

- **Problem 1: Dumb RAG** — agent processes a document, responds, then 5 minutes later has no idea the document exists
  - Not about vector databases — about the system **not knowing what it knows**
  - Classic example: customer service agent confirms delivery address, then asks for it again in the next message because context evaporated between calls
- **Problem 2: Brutal Connectors** — integrations with real-world systems (APIs, databases, calendars, ticketing) that **break at the first edge case**
  - Agent works perfectly in demo (3 paths); production has 300
  - Unexpected API format, timeout, or Polish input instead of English — entire pipeline stops
  - Amazon's report: majority of failures are **integration errors**, not model errors — missing retry logic, missing partial failure handling, missing graceful degradation
- **Problem 3: Polling Tax** — lack of **event-driven architecture**
  - Agent polls every 30 seconds instead of reacting to events
  - Burns CPU and tokens on empty queries; reacts with delay because it's mid-cycle when something actually happens

## 3. Master Controller — Four Essential Components

- **Component 1: Tool Registry**
  - Not 25 loosely connected tools — a **catalog** where each tool has defined capabilities, invocation cost, limits, and fallbacks
  - Without it, routing is guesswork
- **Component 2: Routing Intelligence**
  - Not an if-else cascade — system that selects path based on **user intent + task complexity**: single tool, tool chain, or human escalation
  - MIT Technology Review: companies with intelligent routing have **3x higher pilot-to-production transition rate**
- **Component 3: Memory Triad** — three memory layers:
  - **Short-term** — what's happening in this session
  - **Long-term** — what the system knows about your data, processes, preferences
  - **Episodic** — what happened when and with what result
  - Most agent systems only have the first layer — then wonder why the agent doesn't learn from mistakes
  - Good episodic memory example: calendar agent knows last 3 meetings with client X were rescheduled → suggests time buffer; code review agent remembers same bug type appeared 3 times last sprint → auto-raises priority
- **Component 4: Graduated Autonomy** — not all-or-nothing, a **spectrum of permissions**:
  - **Read Only** — system reads, classifies, notifies
  - **Supervised** — system proposes, human approves
  - **Trusted** — system acts, human gets a report
  - **Full Auto** — system acts unsupervised within strictly defined boundaries
  - "Never go full auto" — an ensign doesn't make decisions for the admiral

## 4. Frameworks Are Not Architecture

- **LangGraph** — state graph approach; used in production at LinkedIn and Uber
- **Crew AI** — role-based model; popular for prototyping
- **Claude Agent SDK** — native sub-agent support and parallelization
- **Critical distinction**: framework = building material; without an architectural plan, you build ruins
  - Best bricks in the world + no blueprint = mediocre result
- **The decade ahead**: after 5 weeks of learning, you have something 89% of organizations don't — not another chatbot, not a conference demo, but **an architecture of thinking about AI**
  - A decision framework: when to automate, when to supervise, when to let go, when to say no

## 5. Wonderlands — A Production Reference Architecture

- **Core concept**: an agent whose knowledge base is a **"digital garden"** — a website generated from a text-file filesystem connected by directories, tags, and wikilinks
- **The system is a full-stack production-ready agent platform** combining all concepts from the AI_devs 4 course in one project
- **Main components**:
  - **API** — for agent interaction; used by the chat interface, but also accepts background queries
  - **Chat** — advanced interface with streaming, blocks, prompt cache, file references, inter-agent interactions
  - **Agent** — multi-agent cooperation, event-driven, task management, event emission, connection recovery, **Observational Memory** context compression
  - **Tools** — native tools (web search, delegate) + MCP support in both Function Calling mode and **Code Mode** (sandbox-backed); MCP Apps extension supported
  - **Images** — generation via OpenAI / Gemini / OpenRouter; includes editing of user-uploaded files
  - **Sandbox** — two modes: Node.js process or [lo](https://github.com/just-js/lo) tool; filesystem access via [just-bash](https://github.com/vercel-labs/just-bash); production alternative: [Daytona](https://www.daytona.io/)
  - **Browser** — agent browser access via locally-run [kernel.sh](https://kernel.sh/); production: [browserbase](https://www.browserbase.com/)
  - **Garden** — expanded version of S05E01; website generated from user's filesystem; agent can read/modify content; supports private pages (frontmatter `visibility: private` — hidden from menu, password-locked)

## 6. Architecture — Client/Server With Shared Contracts

- **Same client/server split as S05E04** but as a **single application with shared contracts** describing event-based communication structure
- **Module map**:
  - **Client** (`apps/client/src/`):
    - **State** (`lib/stores/`) — chat store as central state machine; handles message submission, SSE stream consumption, run status tracking
    - **Stream Processing** (`lib/runtime/`) — converts raw event stream into visible blocks; streaming markdown, scroll control, batched updates
    - **API + Transport** (`lib/services/`) — SSE client with reconnection + cursor-based replay; API modules for threads, runs, agents, files, gardens, MCP, auth
    - **UI** (`components/`) — block renderer (text, tool calls, delegation, thinking, web search); composer (input + attachments + agent picker); virtualized message list
  - **Shared** (`packages/`):
    - **Contracts** — single source of truth for all event types between client and server; `BackendEvent` union type
    - **Sandbox runtime** — code executing inside isolated sandbox environments (JS + bash modes)
  - **Server** (`apps/server/src/`):
    - **Adapters** (entry points) — HTTP routes, AI provider adapters (OpenAI, Google, OpenRouter normalized to single streaming interface), MCP gateway, sandbox runner, browser automation, blob storage
    - **Application** (business logic) — commands (send message, resume, cancel, branch), runtime engine (worker claims run, drives agent turn loop), interactions (assembles model request — history + instructions + tools + attachments), agents (resolution, profiles, delegation, native tools), events (append-only store → outbox → relay → SSE)
    - **Domain** — framework-free types, interfaces, repository contracts
    - **DB** — SQLite + migrations; one file per instance

## 7. Execution Mechanics — The Turn Loop

- **Flow**: user action → `start-thread-interaction` command → agent resolution → **turn loop** → events → client pipeline → UI
- **Agent resolution**: explicit pick, account default, or plain assistant — bound to **immutable agent revision** (reproducible behavior even after agent is edited)
- **Turn loop** (the engine):
  1. **Load context** — history + agent instructions + tool schemas
  2. **Call model** — stream response, persist output items, emit `stream.delta`
  3. **Execute tools** — if model called tools → run them → feed results back → **repeat**
  4. **Final text** — no more tool calls → persist durable message → exit loop
- **Tool types by lifecycle**:
  - **Immediate** — result → continue
  - **Waiting** — run pauses → resumes when done
  - **Approval** — user must accept/reject first
- **Delegation** — agents calling agents:
  - Parent calls `delegate_to_agent` → server spawns **child Job + Run** → parent enters waiting → child runs own turn loop → result returns as tool output → parent resumes
  - Child blocks appear **nested inside the parent message**, not as separate messages
- **Event system** (central nervous system):
  - Every action → event → append-only durable store → outbox worker → realtime relay → SSE → client
  - Connection drop: **cursor-based replay** catches up; client also polls run state every 3s as safety net
  - Event categories: content (`stream.delta`, `reasoning.delta`, `stream.done`), tools (`tool.called`, `tool.completed`, `tool.failed`, `confirmation_requested`), run (`run.started`, `run.waiting`, `run.completed`, `run.failed`), delegation (`child_run.created`, `tool.waiting`, `child_run.completed`)
- **Key additions over S05E04**:
  - **Context enrichment** — available tools metadata, agent metadata, digital garden structure metadata, current date, space for environment data
  - **Code Mode** — when sandbox active, agent writes and executes code to use tools; tool definitions **not preloaded** into context; controllable per agent
  - **References** — agents pass files between each other and to tools via references; used in image generation/editing + sandbox + filesystem chain
  - **Additional events** — error handling and background thread status reporting

## 8. Agent Ecosystem — Multi-Agent Team

- **Orchestrator** coordinates specialists, each with access to specific filesystem areas and tools
  - **Researcher** — gathers and stores knowledge (web search, browse, summarize, read/write)
  - **Memory Manager** — organizes and deduplicates vault (search, deduplicate, structure, index)
  - **Daily Ops** — morning briefing from life context (calendar, email, todos, digest)
  - **Writer** — long-form content from knowledge (articles, newsletters, image gen)
  - **Media Producer** — audio and visual content generation (TTS, image gen, podcast, run code)
  - **Publisher** — builds and deploys digital garden (build site, publish, versioning)
- **Two input channels**: Chat (interactive) and Scheduled Jobs (background)
- **Shared foundation**: Filesystem / Vault containing notes, memories, procedures, history, goals, assets
- **Background operation**: system can receive queries from external sources, run internal event systems or schedulers; background tasks appear in conversation history

## 9. MCP Tools — Practical Integration Catalog

- **Tool connection alone doesn't add value** — usefulness increases when you **personalize** usage through process descriptions, procedures, and scripts
- **Concrete MCP server catalog** (all based on the streamable MCP server template from week 1):
  - **[Linear](https://github.com/iceener/linear-streamable-mcp-server)** — task management; agents can place their own tasks and communicate
  - **[Google Calendar](https://github.com/iceener/google-calendar-streamable-mcp-server)** — agents can have their own calendar (work schedule); manage user availability
  - **[Gmail](https://github.com/iceener/gmail-streamable-mcp-server)** — read-only selected labels or create drafts for repetitive emails (full access not recommended)
  - **[Maps](https://github.com/iceener/maps-streamable-mcp-server)** — route planning, place info; especially useful on mobile; combines well with Calendar
  - **[Replicate](https://github.com/iceener/replicate-streamable-mcp-server)** — image generation models; alternative to native OpenAI/Gemini generation
  - **[Resend](https://github.com/iceener/resend-streamable-mcp-server)** — private newsletters generated by agents
  - **[ElevenLabs](https://github.com/iceener/elevenlabs-streamable-mcp-server)** — long-form audio, regular updates, private podcasts; great STT models for voice interaction
  - **[YouTube](https://github.com/iceener/youtube-streamable-mcp-server)** — search/monitor channels; combined with Gemini video analysis to find most valuable content
  - **[Firecrawl](https://github.com/iceener/firecrawl-streamable-mcp-server)** — controlled web content loading; can run locally without subscription
  - **[Video](https://github.com/iceener/video-stdio-mcp)** — video analysis via Gemini API (short materials only)
  - **[Spotify](https://github.com/iceener/spotify-streamable-mcp-server)** — playlist creation, voice-activated music by description rather than exact titles
  - **[Tesla](https://github.com/iceener/tesla-streamable-mcp-server)** — vehicle integration
  - **[Template](https://github.com/iceener/streamable-mcp-server-template)** — base template for creating new MCP servers

## 10. Daily Ops — Decoupled Agent Pipeline Example

- **Phase 1 (07:00) — Parallel Data Gather**: 4 agents triggered by cron simultaneously:
  - **Calendar Agent** → Google Calendar MCP → reads `fetch-events.md` skill → writes `briefings/2026-04-09/calendar/events.md`
  - **Tasks Agent** → Linear MCP → reads `open-issues.md` skill → writes `briefings/2026-04-09/tasks/priority.md`
  - **Mail Agent** → Gmail MCP → reads `unread-digest.md` skill → writes `briefings/2026-04-09/mail/digest.md`
  - **Newsfeed Agent** → Firecrawl + YouTube MCP → reads `news-filter.md` skill → writes `briefings/2026-04-09/news/stories.md`
- **Digital Garden filesystem** stores all briefing data per day for replay or re-synthesis
- **Phase 2 (07:15) — Synthesis & Delivery**:
  - **Synthesis Agent** reads all 4 files from `briefings/2026-04-09/`, follows `briefing-format.md`, produces 2-4 spoken sentences
  - **TTS Agent** → ElevenLabs MCP → reads `voice-config.md` → writes `briefings/2026-04-09/audio/briefing.mp3`
  - **Output** → iPhone notification via Shortcuts/Pushover/custom app; audio plays inline, no unlock needed
- **Each agent reads its skill doc at runtime** — raw data persists per day
- **No built-in scheduler** currently — use external cron sending POST requests to the sessions/bootstrap API endpoint
- **Background tasks should be time-grouped without unnecessary dependencies** — if newsletter should arrive at 5:01, data-gathering agents should run at least an hour earlier, **in parallel** (they don't interfere with each other)

## 11. Collaborating With Agents — Expectations vs Reality

- **Default expectations toward AI agents are inflated** — this directly impacts system performance:
  - Instructions too general (assuming agent will "figure it out")
  - Assuming system works per theoretical requirements (flawless file navigation, perfect tool usage)
  - Assuming everything goes according to plan, and errors self-resolve
  - Expecting error-free content quality matching unspecified assumptions
  - Wanting fast execution while underinvesting in process design and verification
  - Expecting deterministic prompt execution like code — line by line
- **Additional limitation**: trying to translate old processes into new reality; insufficient creativity to imagine new possibilities
- **Vague vs Precise instructions** (critical practical difference):
  - Vague: "Save meeting notes somewhere in my notes" → which folder? what filename? overwrite or create?
  - Precise: "Save meeting notes to `meetings/2026-04-09.md`. Use filesystem MCP. Append if file exists." → exact path, specific tool, conflict rule
  - Vague: "Every morning, check what's going on and send me a summary" → what sources? what format? how to send?
  - Precise: "Read `briefings/2026-04-09/` calendar, tasks, mail. Follow `briefing-format.md`. Send via pushover MCP." → explicit sources, format doc, delivery tool
  - **Precision removes inference — every guess is a potential failure point**
- **Skill expansion through digital garden documents** — agents can discover linked notes progressively, focusing on the most important threads
- **Keep interactions as short as possible** — improves both effectiveness and cost (own agents = pay per token, not subscription)
- **Polishing agent instructions is typically one-time effort that pays off repeatedly**

## 12. Building Habits Around Agents

- **Configuring agents is not enough** — you must build the **habit of working with them** and with the content they generate
  - Easy to set up a daily newsletter; pointless if you never read it
  - Using an MCP integration once delivers zero value
- **Adapt your environment** to build habits — connect new activities to existing routines:
  - Spend time on Discord? → notifications go there
  - Lots of phone time? → generate a simple mobile app or create a shortcut to the chat web page
  - Morning training/walk? → when phone disconnects from home WiFi, load the audio news briefing
- **Result**: agents become part of daily life without extra effort — this is the "New Reality"

## 13. System Development — Growth Areas

- **The system can evolve** toward personal processes, internal company use, or even commercial products
- **Development leverage**: increasingly better LLMs + coding agents = **incomparably more** achievable than even a few months ago
  - Wonderlands was built in ~2 weeks with AI; would have taken months without it; 100% generated code, but massive shaping effort based on 3 years of similar app development experience
- **Concrete development areas**:
  - **Cron** — scheduled task system with time-triggered jobs; optionally expand with external event listeners
  - **Environment** — add environment context (per S04E03, S03E05) — enables agents to use tools more effectively and take proactive actions
  - **Loop hardening** — improve tool loading effectiveness and error recovery techniques; e.g., agent reuses failed tool payload instead of regenerating it
  - **Deeper integrations** — if used locally, give agent better computer access (with security considerations for externally-exposed configurations)
  - **Mobile app** — voice connection to agents via native watch/phone app; querying the entire digital garden by voice is extremely useful
  - **Management panel** — beyond the current Activity Bar; dashboard showing current agent activities with interactive (not just passive) capabilities
  - **Artifacts** — dynamic artifact generation, saving, and recall in the chat interface (reference: S03E05 example)
  - **Memory** — agent and user profile building (partially static, partially dynamic during interaction); dedicated agent memory tools

## 14. Personal Knowledge Base Structure

- **Five-domain structure** for organizing the digital garden (from S04E04):
  - **01 Me** — identity, values, preferences, wellbeing, thinking, mental models, decision frameworks, personal growth process
  - **02 World** — people/relationships, places/routes, services/tools/platforms, sources (podcasts, blogs, newsletters)
  - **03 Craft** — ideas (thinking inbox), projects, knowledge by theme (AI, programming, design), lab (prototypes, POCs), shared content (articles, newsletters, workshops)
  - **04 Ops** — tasks (Linear, triage, sprint rules), calendar, email (labeling, triage, response rules), newsletter, research, design, development, marketing, publishing, config (infra, deployment, sync)
  - **05 System** — status (location, device, weather, battery), agents (workspaces, decision logs, coordination)
- **This structure is a starting point** — don't build in one evening; start simple; if agents execute **one repeatable process** for you after setup, that's a success

## 15. Production Considerations

- **Wonderlands is designed with production in mind** but has exceptions:
  - **STDIO** — still allows STDIO MCP server registration; only valid for desktop apps with direct computer access, not web apps
  - **Sandbox** — two sandbox types for demonstration; production may need multiple (just-bash for filesystem navigation, lo for MCP code execution, or Deno/Daytona for everything else)
  - **Permissions** — app manages filesystem access permissions, sandbox is configured, tool calls outside Code Mode require confirmation — but production needs additional verification
  - **Details** — still a lesson example; may contain oversights, though minimized to serve as a reference for building your own projects
- **Multi-tenant support** — user account management, organization grouping, resource sharing between users — solid foundations for further building

## 16. Course Synthesis — The Decision Framework

- **What you have after 5 weeks**: not another chatbot, not a conference demo — **an architecture of thinking about AI**
  - A decision framework: when to automate, when to supervise, when to let go, when to say no
  - Anyone with API access can connect an LLM to Slack and call it an agent; building a system that works in production **longer than a week** is a completely different story
- **The 5-week journey was about engineering, not AI** — about limitations, architecture, and not being the captain who yells "full speed ahead" without checking if navigation works
- **Two paths forward**: delegate more work to agents and comfortably accept AI-suggested changes, OR learn the capabilities of available tools and push boundaries — **the right answer is "which path is right FOR ME?"**
- **The new reality**: still space for new challenges; even achieving things that were recently beyond our competence
- **Key quote** (Lou Gerstner, "Who Says Elephants Can't Dance?"): _"Technology has limitations on what it can accomplish. You do not."_
