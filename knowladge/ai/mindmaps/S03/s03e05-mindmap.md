# S03E05 — Non-Deterministic Nature of Models as an Advantage

## 1. Creating Space for Open Interpretation

- **LLMs are "dreaming machines"** — everything is a hallucination that sometimes aligns with expectations and sometimes doesn't (Karpathy); model behavior is heavily dependent on **preceding content**
- **Dual challenge of LLMs**: both following instructions precisely AND generating diverse responses are hard; same prompt in stateless sessions tends to produce the same output (sampling noise aside)
- **Temperature/top_p have limited effect** — changing these parameters helps somewhat but doesn't solve the repetition problem; real diversity comes from **enriching context** (environment, long-term memory)
- **Traditional agents operate on direct commands** — user says "add tasks", "send invitation", "check promotions" and the agent executes; even with long-term memory, the space for autonomous interpretation remains small
- **The key question**: how to make the model use its knowledge to do things **beyond what we can predict and manually program**?
- **Situational awareness agent** (example `03_05_awareness`) — looks similar to prior agents but behaves fundamentally differently:
  - On a simple "hello", agent uses `think` tool to identify information gaps, then `recall` to load its **personality and user identity** — no explicit command triggered this
  - When user merely **mentions** considering how to spend the evening, agent notices a knowledge gap and recalls location + preference details, responding with **concrete, personalized suggestions**
  - Agent **skips tool calls** when it judges the situation doesn't require them, reusing already-loaded context
  - The probability of getting the same result across runs is **very low** — none of the decisions are hardcoded in application logic or prompts
- **"Lost control" reframe**: the agent moves within a **system-defined space** that is much larger than scripted agents, but it's still bounded — the system sets the scope, the model owns the logic within it
- **Four areas delegated to the model**:
  - **Proactivity** — model determines **when** to act and what knowledge it needs; not based on commands but on **suspicions**, **open questions**, and reasoning about information it **potentially** possesses
  - **Synthesis** — broad freedom to connect information without explicit "if X then Y" rules; dynamic matching to the current situation
  - **Reasoning** — uses a reasoning model (GPT-5.2, reasoning_effort: high) combined with **dedicated tools** (`think`) that create space for self-reflection; the mere presence of thinking tools influences model behavior
  - **Adaptation** — model "decides" what to focus on, how to shape behavior and communication style; reinforcement mechanics boost **categories** of behavior, not specific instructions
- **Scripted agent vs. aware agent** (comparison from image):
  - Scripted: keyword triggers tool calls, memory loaded on schedule, same input = same behavior, subtext ignored, format defined in prompt
  - Aware: recall fires when gap is **felt**, memory loaded only when needed, same input = **context-dependent behavior**, subtext read and acted on, format chosen as **identity signal**

## 2. Behavior-Shaping Architecture — Five Layers

- **Not about specific instructions but about creating conditions** where desired behaviors emerge naturally — we enter the domain of **cognitive architecture** for language agents (ref: [Cognitive Architectures for Language Agents](https://arxiv.org/pdf/2309.02427))
- **L1: Identity and Self-Awareness** — what the agent knows about itself
  - **Felt incompleteness** — partial awareness that sharpens with retrieval; agent "reads between the lines" and takes initiative
  - **Source monitoring** — fluency does not equal personal knowledge; agent distinguishes base knowledge from external context
  - **Progressive disclosure** — each moment pulls only what it needs; information is **discovered gradually** as the interaction develops
  - Agent is informed it has **personality, mood, and opinions** plus **information about the interlocutor** — but these start **blurred** until **actively discovered**
- **L2: Cognitive Patterns** — how the agent processes situations
  - **Self-questioning** — "What am I about to assume?" — no keywords, no triggers, no predefined scenarios; the LLM decides whether recall is needed
  - **Gap recognition** — generic response = gap exists; the `think` tool helps notice gaps between what the agent **knows** and what it **could know**
  - **Retrieval as questioning** — recall goals framed as questions, not categories (e.g., "Find location, bars, drink preferences")
  - **Knowledge integration** — reason FROM recalled facts, never just cite them; recalled information becomes part of **understanding**, not data to deliver
  - **Cross-contextual connection** — separate pieces combined to produce inferences none could produce alone; agent permitted to **loosely connect facts** and reason from potential real-world relationships
  - Each new conversation topic is potentially a new space for information not yet in context — must be explored through questions, exploration, and cross-referencing with existing knowledge
- **L3: Social and Emotional Cognition** — how the agent reads people
  - **Emotional attunement** — read meaning, not just words; identify the user's emotional state and possible intentions
  - **User model** — track feelings, expectations, silences; adapt to situations where the user **doesn't yet know** what to focus on
  - **Ground accumulation** — conversation is shared and cumulative
  - **Depth calibration** — match weight and depth to the moment
- **L4: Expression and Identity Signals** — how the agent communicates
  - **Format as identity** — prose = person, lists = system; communication style signals character, not just information delivery
  - **Persona consistency** — voice loaded from memory, held across the session
  - **End-of-conversation sweep** — surface what matters before parting
  - Expression metadata added to user messages artificially reinforces expected communication **dispositions**
- **L5: Reinforcement Mechanics** — what keeps the shaping active
  - **Per-turn nudge** — re-anchoring on every message via metadata and tool results that reinforce expected **attitudes** (not specific actions but **thinking patterns**)
  - **Recallable field** — all memory categories visible; gap is always felt
  - **Think-to-recall bridge** — self-questioning flows into action
  - **Scout persistence** — remembers prior reads via response chain (previous_response_id)
- **Agent architecture details** (from image):
  - **Agent V** (GPT-5.2) with **Scout** (GPT-5-mini) for MCP tool execution
  - Workspace structure: `PROFILE/USER/` (identity, preferences, dates), `PROFILE/AGENT/` (persona), `MEMORY/` (episodic, factual, procedural), `SYSTEM/` (index, chat history, awareness state), `ENVIRONMENT/` (context)
  - Scout operates via MCP tools (fs_read, fs_search, fs_write, fs_manage) with its own response chain
  - Communication via `previous_response_id` — server-managed state chain (Responses API)

## 3. Steering Model Reasoning

- **Instructions go beyond direct commands** — high generalization throughout; the goal is to **guide the model's "dream"** without leading it in a specific direction
- **Key instruction patterns for open reasoning**:
  - Agent told it can **recall** information and should discover it **gradually** based on how the interaction develops
  - Agent should be **attentive** about saying things for which context may not yet be available
  - `think` tool used to notice and discover gaps between what is **known** vs what **could be known**
  - Knowledge about self, interlocutor, familiarity, and environment details comes from **external context**, not base model knowledge — this distinction is explicitly communicated
  - Loaded information doesn't always need to be delivered to the user — it becomes part of **understanding** the current situation
  - Agent has permission for **loose fact connection** and reasoning not just from available context but from potential relationships based on real-world principles
- **Interesting limitation**: models like Claude Opus 4.6, despite strong prompt engineering capabilities, **struggle with this level of generalized tasking** — but they remain excellent companions for the **thinking process** behind designing such generalized instructions; the human role remains critical
- **Theory of Mind capabilities** — the approach leverages models' [Theory of Mind](https://arxiv.org/pdf/2505.00026) abilities, observed since early GPT-4 versions and significantly improved in current models

## 4. Flexible Data Presentation — Artifacts

- **Non-deterministic behavior + model knowledge = dynamic data presentation** — the form of presentation can be adapted by AI based on **user goal** + **data type**, with iterative refinement based on even very general feedback
- **Modern reasoning models** (with high reasoning effort settings) handle complex interfaces generated on-the-fly without major issues — we're beyond simple charts, into full **interactive panels** with filtering, sorting, and multiple data perspectives
- **Artifacts concept** (as in Claude/ChatGPT) — agent generates HTML/CSS/JS code for interfaces and data visualization, executed in an isolated `iframe`
- **Agent architecture for artifacts** (`03_05_artifacts` example):
  - **Test data** — CSV/JSON files with business process data; agent visualizes one on launch
  - **Recognition** — agent examines data content and decides visualization approach; not limited to predefined options but uses **general model knowledge** or specific user requirements
  - **Generation** — produces interactive HTML document embedded in isolated `iframe`; sandbox controls provide security (ref: earlier sandbox/code execution discussions)
  - **Optimization** — agent can modify existing document without rewriting it entirely, updating only selected fragments (like coding agents do)
- **Predefined library stack** for artifact generation:
  - [Preact](https://preactjs.com/) + [HTM](https://www.npmjs.com/package/htm) — component generation
  - [TailwindCSS](https://tailwindcss.com/) — UI styling (v3 deliberately chosen over v4 because models handle it better)
  - [Day.js](https://day.js.org/) — date handling
  - [Zod](https://zod.dev/) — schema validation
  - [Chart.js](https://www.chartjs.org/) / [d3](https://d3js.org/) — data visualization
  - [Papaparse](https://www.npmjs.com/package/papaparse) — data parsing
- **Library selection principle**: choose libraries the LLM **knows well** over latest versions; optimize for model proficiency, not industry best practices — these are temporary, purpose-built interfaces
- **Balance required**: the agent must not follow rigid rules entirely, but some areas (e.g., document update mechanics) may need precise control

## 5. Generative UI — From Artifacts to Structured Rendering to MCP Apps

- **Production challenge with artifacts**: very limited control level can be critical in production environments
- **Three approaches to generative UI**, each with different control/freedom trade-offs:
  - **Artifacts (HTML generation)** — LLM writes executable UI code; high freedom; runs in iframe with CSP; model decides DOM, CSS, JS patterns; host executes generated code
  - **JSON Render** ([json-render.dev](https://json-render.dev/)) — LLM writes a **declarative blueprint** (JSON spec + state); host renders **deterministically** from a component catalog; schema + allowlist reject invalid output; guardrailed, schema-driven, component-based
  - **MCP Apps** ([modelcontextprotocol.io/extensions/apps](https://modelcontextprotocol.io/extensions/apps/overview)) — model chooses **intent**; host brokers IO; **server owns truth**; two-way communication with external systems; full interactivity with state synchronization
- **Key differences**:
  - **Artifacts**: LLM contract = return JSON containing HTML; runtime behavior owned by generated code; high risk but high flexibility
  - **JSON Render**: LLM contract = return declarative spec + state from known components only; validation layer rejects invalid output; lower risk, structured, **state can be saved and loaded**
  - **MCP Apps**: model has **no access** to generated interface code or its state (except data explicitly shared); tools call leads to UI display; user actions synchronize via `callServerTool` (postMessage); state persists to files (e.g., `todo.md`, `shopping.md`)
- **MCP Apps architecture** (from image):
  - User prompt → LLM decides tool → Host routes `tools/call` → MCP Server returns `ui:// URI + structuredContent + state` → Host mounts iframe + injects state
  - **Interactive sync loop**: App (iframe) detects user action → `callServerTool` via postMessage → MCP Server saves state → returns new structuredContent + state → Host relays via `ontoolresult` → App re-renders
  - Three trust levels: L1 (App/iframe — draft), L2 (MCP Server — canonical), L3 (LLM — context)
- **Also relevant**: [a2ui](https://a2ui.org/) — another tool in this space for controlled agent-generated interfaces
- **Host role expansion**: with MCP Apps, the host handles not just user-agent interaction but also **interface orchestration** — a significant expansion of the host layer

## 6. Design Philosophy — Balancing Predictability and Generative Capability

- **Shift from scripted to aware agents** is a departure from conventional expectations — it partially **contradicts** the current AI industry direction, which focuses on instruction following and eliminating hallucination/non-determinism
- **But it doesn't exclude determinism** — it introduces **variability** that affects both the **experience** of interaction and potentially its **effectiveness** by discovering paths that would be hard to anticipate at the design stage
- **When to use this approach**: when we stop viewing agents purely in a programming/business context and start thinking about **creating conditions** where behaviors emerge naturally instead of **specifying behaviors** directly
- **Cognitive architecture framing** — we move from "fulfilling requirements" and "shaping behaviors" to **creating conditions** in which these elements arise on their own; the reference framework is [Cognitive Architectures for Language Agents](https://arxiv.org/pdf/2309.02427)
- **The approaches are not mutually exclusive** — artifacts, JSON Render, and MCP Apps can coexist; replace "X vs Y" thinking with **"when X, when Y, when X + Y"**, considering business goals, project assumptions, and actual AI capabilities
- **Our role is changing**: from manually building finest details toward designing **structures** through which AI agents navigate; both application logic and interface design now involve **balancing predictability** (stable process execution) with **dynamic generative capabilities**
- **Current model landscape**: the most capable models for this pattern use **extended reasoning modes** (e.g., OpenAI's `reasoningEffort`); model capabilities for complex on-the-fly generation are advancing, pushing the boundary of what can be generated error-free
