# S02E04 — Organizing Context for Multiple Threads

## 1. Multi-Agent Architecture Patterns

- **Core idea**: multi-threaded LLM interactions go beyond individual chat sessions — they involve different **configurations** that shape communication and dependencies between agents
  - These architectures have existed for years; combining them with LLMs significantly increases their flexibility
- **Six architecture patterns**:
  - **Pipeline (Assembly Line)**: fixed sequence where each agent transforms and forwards output to the next; no backtracking to earlier stages
    - Agent A -> Agent B -> Agent C -> Agent D
    - Simplest pattern; good for linear transformations
  - **Blackboard (Shared State)**: agents read/write a shared store independently; no direct agent-to-agent messaging
    - All agents interact with the Blackboard, not with each other
    - Example from S02E03: "Researcher" agents gathering data from different sources into shared state
  - **Orchestrator (Hub-and-Spoke)**: central coordinator agent delegates tasks, collects results, and makes decisions
    - Orchestrator <-> Agent A, B, C
    - Currently used in tools like Claude Code
  - **Tree (Hierarchical)**: extended orchestrator with manager roles; delegation flows down, results aggregate up
    - Manager -> Lead 1 -> Workers A, B; Manager -> Lead 2 -> Workers C, D
    - Enables significantly more complex tasks but increases system complexity
  - **Mesh (Peer-to-Peer)**: every agent can message every other agent directly; communication is **addressed** — agent usually knows who it writes to (e.g., "File Manager")
    - No central router
    - Rarely used in production LLM systems — harder to control and debug
  - **Swarm / Gossip**: communication is distributed; many agents may act on a task; result emerges through selection or aggregation
    - Knowledge spreads probabilistically via local broadcasts
    - Even rarer in production than Mesh
- **Practical focus**: first four patterns (Pipeline, Blackboard, Orchestrator, Tree) are the most relevant; often **multiple patterns are combined** simultaneously
- **Visualization tip**: coding agents are very useful for visualizing multi-agent system designs — Mermaid syntax or HTML; but currently watch over design decisions, as models often complicate or skip important aspects

## 2. Inter-Agent Communication Tools

- **Two fundamental tools** for agent-to-agent communication:
  - **delegate**: assigns a task to a chosen agent
    - Opens a new thread assigned to another agent
    - Enables **changing the system instruction** and available toolset
    - After completing work, the agent responds — this response becomes the **tool result** for the parent agent
    - Example: Main agent asked for weekly stats → delegates to Analytics Agent → receives structured result (visits: 12,847, bounce_rate: 0.42) → formats response for user
  - **message**: enables **bidirectional communication** between agents
    - When an agent lacks information to complete a task, it sends a message to the parent agent
    - The agent's loop is **paused** until data is delivered (good use case for [JavaScript generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*))
    - Example: E-commerce Agent asked to create coupons → needs coupon duration → messages orchestrator → orchestrator relays question to user → user provides "14 days" → orchestrator resumes agent → agent completes task
- **Bidirectional communication** can take much more advanced forms:
  - Multiple agents with **interdependent** tasks
  - Dependencies may require **sending events** to more than one agent simultaneously
  - This leads to **event-driven architectures**

## 3. Event-Driven Multi-Agent Architecture

- **Event Bus pattern**: decouples agents completely — publishers fire events, subscribers declare interest
  - **Publishers** (fire and forget): Agent A publishes `order.created`, `task.complete`; Agent B publishes `task.complete`
  - **Event Bus**: routes by topic — no logic, just delivery
  - **Subscribers** (declare interest, not dependency): Agent C subscribes to `order.*`; Agent D subscribes to `task.*`; Agent E subscribes to `*`
  - **Key insight**: neither side knows the other exists; add or remove any agent — nothing else changes; **topics are the only shared contract**
- **Practical example — Order Inquiry System**:
  - **User** sends message: "Where is my order #4821?" → emits `user.message`
  - **Intent Agent** (LLM): classifies intent, extracts order ID → emits `ticket.classified`
  - **3 subscribers react independently** (in parallel):
    - **Tracker Service** (deterministic code): API call → "stuck in customs, 3 days" → emits `tracking.found`
    - **Credit Service** (deterministic code): delay > 2 days → auto $5 credit → emits `credit.applied`
    - **Draft Agent** (LLM): has ticket + tracking + credit, but needs customer profile to set tone → emits `customer.lookup_requested`
  - **Customer Service** (deterministic code): returns "VIP tier, 3 prior orders" → emits `customer.found`
  - **Draft Agent** aggregates all data (per ticketId buffer): ticket + tracking + credit + customer profile → composes personalized reply → emits `reply.drafted`
  - Reply goes to **human support agent for verification** before sending
- **Mixed architecture**: LLM agents and **deterministic services** coexist as event publishers/subscribers — not everything needs to be an LLM agent

## 4. Global Context and Conflict Management

- **The problem**: global context (memory, knowledge base) shapes not only individual agent behavior but also **inter-agent interactions**
  - Agents may work on the **same content simultaneously** — even a "single" agent can run in **multiple instances** in parallel
  - This makes even single-agent systems effectively **multi-agent** when running concurrently
- **Lost Update problem**: two parallel sessions read the same memory note → each modifies independently → last write wins → earlier update silently erased
  - Example: Session A adds "Rust" to tech stack → Session B (from stale snapshot) adds email → Session B writes last → "Rust" update is lost
  - With free-text memory there is no field-level merge — the entire string gets replaced
- **Five conflict management strategies** (combine rather than rely on one):
  1. **Conflict Detection**: compare checksums between read and write; if checksum changed since read → reject write; also: [per-line hashing](https://x.com/_can1357/status/2021828033640911196) for granular diffs
  2. **Conflict Avoidance**: define resource **ownership**, permission levels (read-only), and **isolation** (e.g., per-session data); prevents conflicts by design
  3. **Managing Agent**: a gatekeeper agent with additional privileges — sees full history, merges changes; can escalate to human if unsure
  4. **Change History**: append-only storage (as seen in Observational Memory from S02E03) — nothing is overwritten; agent sees how data evolved over time, not just current state; fewer direct conflicts
  5. **Manual Resolution**: fallback when automation cannot decide — conflict detected → pause → human reviews both versions → merged result
- **Git-style merge doesn't transfer directly** to multi-agent systems — agents often **lack the information** needed to decide which changes should be kept and how
- **External context should not dictate agent behavior directly** — documents should not say "what agents should do and when"; that's the system's job; external context should remain loosely coupled to agent logic

## 5. External Context Architecture

- **Separation principle**: external context (persistent knowledge) must be **separated** from agent logic
  - Documents should be accessible to **both agents and humans** — enabling real **collaboration**
  - Memory Manager agent handles writes, but the structure should be human-readable and maintainable
- **Knowledge categories** in external context (example structure):
  - `./workflows` — process definitions (e.g., `linear/assign-issue.md`, `slack/notify.md`, `calendar/schedule.md`)
  - `./projects` — active projects, team IDs, categories, priorities
  - `./memory` — client interactions, preferences, past decisions and rationale
  - `./company` — team profile, offerings, stack, pricing
- **Agent access with scoped permissions**:
  - **Task Manager**: R/O access to workflows, projects, memory — for planning, deadlines, issues
  - **Pre-Sales Assistant**: R/O access to company and memory/clients — for proposals, discovery calls
  - **Memory Manager**: R/W access to memory and projects, R/O access to company — organizes shared knowledge
- **Key insight**: agents don't search — they **navigate**; each enters through a known root and follows document references; only Memory Manager writes to shared state
- **Documents reference each other**: `assign-issue.md` → `overview.md` → `decisions.md`; `notify.md` → `clients.md`; this creates navigable paths, not flat search results

## 6. Shared Context Challenges

- **Reality check**: "Gen-AI can do more than we think and less than we imagine" — complexity quickly outpaces visible results; dynamic environments + natural language ambiguity compound the problem
- **Six challenges** to address when organizing shared context:
  1. **Session vs. Memory**: distinction seems obvious (temporary vs. long-term) but is oversimplified; something in a session may need to be persisted — someone must decide; chatbots can react to user commands or suggest saving; agents working in the background need **more autonomy**, generalized assumptions balanced with code-level guardrails (e.g., directory access controls)
  2. **Communication Degradation**: passing information between agents causes data loss or distortion; problem grows with session complexity and task size; **delegate** and **message** tool descriptions must be carefully crafted; system should assume agents receive **partial information**, requiring additional verification
  3. **Own Interpretation**: even with complete information, agents may interpret it differently; risk is lower for obvious tasks ("update client X's data") and higher for open-ended ones ("find all information about client X")
  4. **Information Context Loss**: when data is persisted, context obvious from conversation can be lost in standalone notes; e.g., a note about "Anna" may be confused when discussing someone else with the same name
  5. **Information Duplication**: even with good architecture, knowledge on the same topic may end up in multiple places; hard to fully prevent but can be **detected** — even smaller models can scan modified data and detect potential duplicates (as seen with graph databases in S02E03)
  6. **Metadata**: beyond content, stored information should carry metadata (source, creation date, details) for UI and analysis; for agents, metadata aids **inter-agent communication** and user interaction; e.g., "what did we discuss on the way to Warsaw?" shows how enriched information (location, time) matters
- **Best advice**: design the system **as simple as possible** and keep it that way as long as possible; multi-agent systems don't need to take over entire organizations; one system can serve many independent areas with **very limited inter-agent information exchange**

## 7. Practical Example: Daily Ops Multi-Agent System

- **Task**: build a multi-agent system that creates daily operational updates from multiple sources
  - Sources: emails, calendars, task lists, personal notes
  - Updates must not repeat across days; missed items must escalate in priority
- **System components**:
  - **CRON trigger**: scheduled daily (e.g., 06:30) → sends request "on behalf of user" to prepare Daily Ops → loads `workflows/daily-ops.md`
  - **Orchestrator agent**: reads workflow instructions, delegates to specialist agents
    - Tools: `delegate`, `message`, `read_file`, `write_file`
    - Access: `./goals` (R/O), `./history` (R/O), `./memory` (R/W), `./output` (R/W)
  - **Specialist agents** (can run in parallel):
    - **Mail Agent**: tools — `gmail_api`, `message`; task — inbox scan
    - **Calendar Agent**: tools — `gcal_api`, `message`; task — today + 48h events
    - **Task Agent**: tools — `linear_api`, `message`; task — open + overdue tasks
    - **Notes Agent**: tools — `vault_read`, `message`; task — open loops
  - Each agent **owns its source**; cross-source context flows through `message` <-> Orchestrator
- **Execution flow** (from trace logs):
  1. **Trigger**: `index.ts → main()` sends task to orchestrator
  2. **Turn 0**: Orchestrator reads `workflows/daily-ops.md` via `read_file`
  3. **Turn 1**: Orchestrator delegates to 4 agents (could be parallel, executed sequentially via `for...of` in the example)
     - Each child agent: loads its own `.agent.md` template, runs its own loop with one tool, returns summary text
     - Child return text becomes `tool` result in parent context
  4. **Turn 2**: Orchestrator reads context files: `goals/goals.md`, `history/2026-02-12.md`, `memory/preferences.md`
  5. **Turn 3** (the expensive call): Orchestrator synthesizes everything — full context: system prompt + user task + workflow instructions + 4 delegate summaries + goals + yesterday's output + preferences
     - Deduplicates vs. history; escalates stale items; weights by goals; applies preferences
     - **Bottleneck**: one LLM call carries the full context; compression happened upstream — each child reduced raw JSON to text summary; without delegation, all raw data would be in this window
  6. **Turn 4**: Orchestrator writes `output/2026-02-13.md` and exits
- **Feedback loop**: today's output feeds back into `./history` for tomorrow's dedup and escalation
- **Degradation warning**: each delegate → orchestrator hop compresses information; agents should return **structured data alongside narrative** so orchestrator keeps raw items
- **Conflict warning**: if user edits `./goals` mid-pipeline, orchestrator reads stale state; use checksum on read to detect and re-read

## 8. When to Use Agents vs. Simpler Approaches

- **Core question**: "Why agents here?" — decision must be made deliberately in **every case**
- **Agents are justified when**:
  - **Open-ended tasks**: process has a clear goal and activity list, but may need to **react to environmental data** during execution
  - **Dynamic data**: input/output structure is not predetermined, or information requires transformations beyond what code can do
  - **Dynamic dependencies**: dependencies between data exist at the **language and meaning level**, not detectable at code level
  - **Iteration with natural language criteria**: iteration depends on criteria written in natural language and involves steps that **cannot be defined in advance**
  - **Flexible architecture**: the process may expand to new areas and needs high flexibility in core logic
  - **Result personalization**: output customization goes beyond programmatically fillable templates
- **Agents are NOT justified when**:
  - Requirements demand near-zero costs, fast reaction time, or full predictability → classical code is the only option
- **Key skill**: finding the balance between agent logic, simpler LLM workflows, and pure code logic is one of the **most important skills**
  - Agent design can be initially attractive (technically and business-wise) but demands caution
  - Building agents still has many drawbacks at the current stage

## 9. Manager Agent Responsibilities

- **Role**: agent(s) responsible for managing the work of other agents; breaks tasks into stages, shapes and monitors execution plans, manages communication
  - Minimal tools but **broad information access** and permissions
  - Responsible for user contact
- **Seven responsibility areas**:
  1. **System Knowledge**: knows the system it operates in — user data, broad access to long-term memory, higher permissions for session information; knows available agent roles and their scope
  2. **Information Access**: can view not only agent results but also their **workspace**; has at least read-only access to nearly all long-term memory
  3. **Tool Access**: `delegate`/`message` tools plus usually `recall`/`search_memory`; avoid overloading with additional tools — the role is already large
  4. **Task Delegation**: during a session, the main thread, key information, action plan, and progress are available in the manager's context
  5. **Knowledge Transport**: other agents sometimes assign tasks back to the manager — typically requests for additional information or to relay their results to other agents
  6. **Decision-Making**: when an agent encounters a problem, needs confirmation, or a decision — the manager is on the front line; must have clear guidelines about its **authority** and when to contact the user
  7. **Verification**: manager verifies task outcomes; should have guidelines for evaluation criteria or ability to delegate verification to another agent
- **Current limitations**: model capabilities require limiting the manager's role, but with moderation — every communication step adds context management complexity
- **Silent failures are the real danger**: not all errors cause the system to halt; some manifest as **skipped steps** or decisions made with insufficient data; absence of action is harder to detect than wrong action

## 10. Human-in-the-Loop and Management Dashboards

- **Current reality**: multi-agent systems are not yet fully autonomous; humans remain the **key coordinator**
  - Full autonomy is beginning in some specific cases, but it's unclear how far off it is broadly
- **Management dashboards** are becoming essential for multi-agent systems:
  - Move beyond single chat windows (ChatGPT, Cursor style) — agents need richer interfaces
  - Dashboard elements (adapt to specific system and user needs):
    - **System statistics**: overall health, throughput, costs
    - **Active sessions**: currently running agent tasks
    - **Task schedule**: upcoming automated runs
    - **Areas requiring attention**: escalations, conflicts, failures needing human input
  - Purpose: monitor activities, provide information, resolve problems
- **Dual perspective**: design interfaces for **both** agent consumption and human oversight
  - Shared knowledge bases should be maintainable by humans, not just agents
  - Real collaboration between agents and people, not just agent autonomy
- **Impact on daily work**: consider how multi-agent systems will affect everyday routines, internal tools, and products offered to clients
