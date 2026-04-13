# S03E03 — Contextual Feedback Supporting Agent Effectiveness

## 1. Autonomous Triggers — Five Ways to Activate an Agent

- **Agents can act without direct human interaction** — proactive behavior driven by environment, time, and events; not just responding to user messages
- **Five trigger types** (unified taxonomy for agent activation):
  - **Messages** — sent by a human or another agent; carries a contextual payload; agent replies
  - **Hooks** — internal application events (e.g., subagent completion); agent resolves a goal triggered by the event
  - **Webhooks** — external service events (e.g., calendar update, payment received); HTTP POST delivers payload; agent updates context
  - **Cron** — time-based triggers (e.g., `0 9 * * *`); forces execution regardless of state; generates reports
  - **Heartbeat** — periodic state check (e.g., every 30m); evaluates whether action is needed; if yes → acts; if no → maintains silence
- **Key difference from traditional event-driven programming**: classic systems fire independent actions with fixed arguments; agent systems can have a **single entry point** that dynamically interprets and adapts to any trigger
- **Single entry point architecture**:
  - All 5 trigger types converge to one **event ingestion** layer
  - Dynamic agent core (LLM) interprets the event using available context: session history, vault memory, environment state
  - Agent selects from available tools (web search, filesystem, external actions) based on the event
  - Result: **adaptive execution** — same architecture handles all trigger types
  - Natural language task descriptions can be built by code or come from other agent systems — both are interpreted the same way

## 2. Proactive Session Architecture

- **Default behavior**: each trigger starts a **new session** — system sees no connections between events; avoids context pollution with unnecessary data
- **Alternative**: a persistent **"infinite" main session** that remains active across interactions, enabled by context compression (e.g., Observational Memory from S02E03)
- **Proactive session pattern**:
  - Heartbeat pulses inject messages into the main thread at regular intervals (e.g., every 30m): "read tasks.md for pending work"
  - If no tasks require action → agent **skips** (user sees nothing)
  - If tasks found → agent executes proactively, resuming the session **on its own initiative**
  - **tasks.md** contains the most important user-relevant activities requiring main thread context; content managed manually or by the agent itself
- **Session strategy matters**:
  - **Persistent main thread**: heartbeat pulses inject directly; share context with user conversation; best for tasks that need conversation history
  - **Isolated sessions**: webhooks and cron jobs run in separate, single-turn sessions with **no shared context**; best for independent operations (e.g., payment processing, weekly reports)
- **Proactive tasks can depend on**:
  - **Time** — approaching deadlines, scheduled events
  - **Environment** — location, weather, device state (connected apps, open programs)
  - **User activity** — what the user is currently working on
  - **External events** — calendar entries, messages from other systems

## 3. Context-Driven Environment Integration

- **Agents can be deeply integrated with their environment** — even fully independent from direct human interaction, operating entirely in the background
- **Environment layer** — real-time state available to the agent at all times:
  - **Time** — current datetime, timezone
  - **Location** — resolved place ID + coordinates
  - **Weather** — live temperature, wind, precipitation
  - **Device state** — walking/stationary, battery level, active calls
- **Multi-hop enrichment** — agent connects fragmented information from multiple sources to produce rich output:
  - Example (Add Phase): user says "Take Anna for dinner, she loves sushi" → agent: `search_contacts("Anna")` → `web_search("sushi Kraków")` → `search_places("Sakura Sushi")` → creates calendar event with full details (guest email, address, hours)
  - Example (Notification Phase): webhook fires "CoWork Meeting at 14:00" → agent checks current location (at restaurant) → calculates route (10 min walk) → checks weather (rain) → sends context-aware push: "Leave by 13:40. Bring umbrella."
  - **3-hop enrichment** pattern: contact → web search → place lookup — transforms sparse input into rich, actionable data
- **Heartbeat convergence triggers** — proactive action fired when multiple environmental signals converge:
  - **Sprint capacity check**: time (Friday 4pm) + conversation context (focus: auth refactor) + Linear data (8 in progress, 3 todo) + memory (avg 4.2 tickets/day) + calendar (62h until deadline, no weekend meetings) → decision logic: `11 tickets > capacity (62h / 6h = 10.3)` → MISMATCH → surface prioritization UI with scope cuts
  - **Location-based intent match**: conversation mention ("catch up with Alice next time in SF", 11 days ago) + location (SF, current) + memory (Alice's profile, last contact 3 weeks ago) + calendar (overlap 15:30-16:30) + device state (walking, no calls) → all conditions met → draft iMessage with one-tap send + calendar hold
- **Background agents standardize and elevate process quality** (e.g., marketing, sales) — connecting dispersed, fragmentary information creates real business value
- **Security consideration**: when creating events/entries, agent may confuse addresses or include confidential info in descriptions — for sensitive operations, **deterministic code should manage contacts/recipients**, not the agent

## 4. Feedback and Learning Mechanisms

- **Agents can improve over time** through feedback loops — not necessarily complex memory systems, but simple rules for specialized agents
- **Browser agent example** (`03_03_browser`):
  - Agent navigates websites using Playwright; equipped with browser tools + filesystem tools (MCP)
  - **Instructions per domain**: `instructions/{site}.md` — site structure, selectors, URL patterns, even Playwright scripts; prevents re-discovering the site each time
  - **Discoveries file**: `{site}-discoveries.md` — learned workarounds and fallbacks; accumulated across sessions
  - **Escalating error response pattern**:
    - **Success** → silent (no extra action needed)
    - **Failure** → **take screenshot** (capture state for analysis)
    - **Repeated failure** → **save discovery** (persist the learning for future sessions)
  - Discoveries feed back into knowledge for the next run — **self-improving knowledge loop**
- **Agent can handle authenticated sessions** — run login flow once (e.g., `npm run login`), session persists, agent navigates on user's behalf
- **Content overflow handling**: when page content exceeds context window limits, tools have built-in limits; **content is saved to file**, agent searches it — alternatively, launch a **subagent** for the overflow
- **Feedback mechanisms can be**:
  - Tied to **specific tools** or **specific error categories**
  - Not just static hints but also **additional actions** that provide extra context
  - Include instructions **encouraging the agent to save lessons** from recent errors
- **Extension: code generation for automation** — agent can learn to create Playwright scripts for repeatable activities, progressively **replacing LLM calls with deterministic automation** where possible
- **Principle**: everywhere you can simplify task execution or skip the LLM entirely, you should consider it

## 5. Agent Lifecycle Hooks — Active Control Between Tool Calls

- **Agent execution is a loop** of steps — each step can include additional logic affecting subsequent behavior or external processes
- **Generic hook taxonomy** (from [AI SDK](https://ai-sdk.dev/docs/reference/ai-sdk-core/generate-text#experimental_on-tool-call-finish.on-tool-call-finish-event.output)):
  - **onStart** — agent begins work
  - **onStepStart** — agent begins a new step
  - **onStepFinish** — agent completes a step
  - **onToolCallStart** — agent begins a tool invocation
  - **onToolCallFinish** — agent completes a tool invocation
  - **onFinish** — agent completes work
- **Extended hooks** (from projects like [Pi](https://github.com/badlogic/pi-mono)) can also cover: **streaming**, **context building**, **session modification** (e.g., compression), **user activity monitoring**, **agent status tracking**
- **Hooks should have access to**: current interaction state + session information — enables event emission and direct additional actions
- **Hooks are NOT just passive observers** — they can be **active participants** in agent control:
  - **Phase tracking** — flags per task (e.g., `listen_done`, `feedback_done`, `session_saved`); when all flags are set, state resets and agent proceeds to next iteration
  - **beforeFinish guardian** — checks if all required steps were completed; if not, **automatically requests the agent to complete them**; exception: step limit exceeded or tool errors occurred → allow exit
  - **Session-end cleanup** (onSessionEnd) — always runs, best-effort; handles missing data (audio, sessions, profile updates)
- **Example: English coaching agent** (`03_03_language`):
  - Tools: `listen` (audio → structured analysis via Gemini API), `feedback` (analysis → text + spoken audio via Gemini Live), `speak` (text → WAV), `fs_read`/`fs_write`
  - **beforeToolCall**: when `listen` is called, automatically saves the audio file path for the current session
  - **afterToolResult**: updates phase tracking flags; when all 3 flags set → snapshot phase → reset → ready for next audio file
  - **beforeFinish**: guardian that checks all analysis steps completed; blocks exit if incomplete; allows exit if step limit exceeded or errors occurred
  - **Model has freedom — hooks have authority**: the model decides what to do, but hooks enforce process completion
- **Session-level state tracking with hooks enables**: highly specialized agents that maintain precise control over multi-step processes without relying solely on the model's ability to remember and follow instructions

## 6. Tool-Embedded API Calls and MCP Sampling

- **Tools frequently need to make their own API calls** — a tool like `listen` or `feedback` may invoke specialized models (e.g., Gemini for audio analysis, Gemini Live for audio generation) during execution
- **MCP Sampling** ([specification](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling)) — allows an MCP Server to request API calls executed by the client:
  - **Reversed communication flow**: server asks client to make LLM calls on its behalf
  - Enables tools that need AI capabilities without managing their own API keys/connections
  - **Rarely supported** in practice despite being in the MCP specification
- **Implication**: tool design must account for tools that are not simple function calls but contain **complex processing pipelines** with their own LLM interactions

## 7. Human Support in Autonomous Agent Systems

- **Full autonomy is an illusion** — even with proactive mechanics, feedback loops, triggers, and environment integration, the complexity of the real world (even for simple processes) is enormous
- **Design for human involvement from the start** — even in MVP and initial assumptions:
  - Hook-mediated checkpoints: hook starting a session or tool call can include **human verification** — not just for confirming untrusted actions, but also for **filling missing information** or **resolving ambiguities**
  - Pre-completion review: agent analyzes its own actions before session end; in specific cases, decides whether **human support is needed** or simply **informs about execution status**
  - Before/after requirements: system can define specific human activities required before or after agent execution (e.g., "record a quality audio sample with genuine engagement")
- **"Offensive" vs "defensive" design thinking**:
  - **Defensive**: "where will the system have problems?" — error handling, fallbacks, confirmations
  - **Offensive**: "what capabilities can elevate the system to a higher level?" — e.g., voice interface (even simple STT→TTS) as an upgrade that dramatically increases usability
  - Both perspectives should be applied simultaneously
- **User responsibility in agent effectiveness**:
  - Problems with agent performance **very often lie with users** working with agents in inappropriate ways
  - Addressing this through **product communication and onboarding** can significantly impact both user perception and actual effectiveness
  - Must be treated with **equal importance** as technical architecture and agent design details
- **Name/entity conflicts, missing data, and integration errors will occur** — autonomous agents that run without human involvement still need an **interface for exception handling**

## 8. Practical Examples and Implementation Patterns

- **Calendar assistant agent** (`03_03_calendar`):
  - Tools: contacts, places, calendar, web search, routing, notifications
  - Constant access to environment layer: time, location, weather
  - Works entirely in the background — value delivered with minimal/zero user engagement
  - **Two execution phases**: Add Phase (enrich sparse input → create detailed calendar events) and Notification Phase (context-aware push alerts based on environment state)
  - Handles both **reactive** (webhook: form submission → calendar entry) and **proactive** (heartbeat: approaching event → notification) scenarios
  - **MCP integration**: [Google Calendar](https://github.com/iceener/google-calendar-streamable-mcp-server/tree/main/src) and [Google Maps](https://github.com/iceener/maps-streamable-mcp-server) MCP servers available
- **Browser navigation agent** (`03_03_browser`):
  - OpenAI Responses API as orchestrator; Playwright for browser interaction; MCP filesystem tools
  - Three phases: **Orient** (read instructions, discover site structure) → **Extract** (navigate, evaluate, extract data) → **Persist** (write results to filesystem)
  - Runtime trace example (Goodreads): 8 turns, 9 tool calls, 0 failures, 45k tokens — extracted books from two authors into structured markdown
  - Can handle **authenticated sessions** — login once, agent navigates on user's behalf
  - Classic bots (non-LLM) are preferable for large-scale repeatable scraping; agents for cases requiring **adaptive navigation**
  - For large-scale browser automation: [Browserbase](https://www.browserbase.com/), [kernel.sh](https://kernel.sh/)
- **English coaching agent** (`03_03_language`):
  - Multi-model architecture: gemini-3-flash (orchestration), Gemini Live (audio feedback generation)
  - Interaction pattern: text + audio input → text + audio output
  - Profile-based personalization: `weakAreas[]` (append-only, cap 20), recent 3 sessions injected into prompt
  - Max 15 model turns per session
  - Highly specialized — not every agent needs to be universal
  - Production form would use **real-time audio interface**; async form sends task notifications (e.g., "record how you spent your day")
- **Web content landscape is changing**:
  - Shift from blocking agents to treating them "on par" with users: [Markdown for Agents](https://blog.cloudflare.com/markdown-for-agents/) (Cloudflare), [WebMCP](https://developer.chrome.com/blog/webmcp-epp) (Google Chrome)
  - Active defenses still exist: [AI Labyrinth](https://blog.cloudflare.com/ai-labyrinth/) (Cloudflare) — feeds bots infinite generated nonsense pages
  - Navigation challenges remain for sites without APIs (e.g., Goodreads disabled developer registration years ago)
