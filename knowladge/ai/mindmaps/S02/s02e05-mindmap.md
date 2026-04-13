# S02E05 — Designing Agents

## 1. Agent Instruction Design & Responsibility Scope

- **Agent prompt design** goes beyond "what the agent does" — it defines the agent's **role in the system**
  - Settings, profile, rules, limits, style, session — six areas that shape agent behavior
  - Prompt Engineering remains critical even in the Context Engineering era
- **Settings** — name, description (used by other agents to invoke this one), tool list, active modes (memory), permissions, model config
  - Defaults may be overridable at instance creation time
  - Agent template can be a **text file** (markdown with frontmatter) but doesn't have to be
- **Profile** — persona and character traits that steer the model's focus
  - Not cosmetic — traits like "precise but never precious" or "curious before frustrated" **materially affect** output quality
  - Works like "don't think about blue butterflies" — naming traits directs model attention toward those behaviors
  - Profile covers: tone, complexity level, length, format, reasoning approach, problem-solving style
- **Rules** — operating principles for communication, problem-solving, knowledge access, failure handling
  - Must be **generalized** (principles, not step-by-step instructions) because you can't tell the agent everything about the system
  - Challenge: balance between not enough context and too much specificity
- **Limits** — what the agent doesn't know by default: "when is now?", data freshness, dynamic permissions
  - Example: agent has user location access but needs rules about when to refresh it
  - Models don't inherently know current time unless explicitly told
- **Style** — output format adapts to **environment**, not just preference
  - Same agent connected to text and voice interfaces must behave differently
  - Voice agent: no long URLs, no "displaying" images (S01E04)
  - Environment determines style constraints, not just the tool
- **Session** — dynamic variables: who the user is, their preferences, permissions, current agent activity
  - Session data is part of the system prompt but changes per interaction
  - May include information not visible in conversation history (e.g., background agent status)
- **Complexity grows fast** — even with LLM help for prompt creation, capturing all dependencies is hard
  - Start with solutions that **support** selected activities, then gradually expand
  - Deciding to keep a process human-managed is a valid choice

## 2. Principles of Agent Instruction Design (4-Section Anatomy)

- **Concrete example**: manager/orchestrator agent prompt analyzed across 4 sections
  - Developed through **dozens of iterations** with AI collaboration
  - Input: system capabilities + knowledge of other agents' roles + personal preferences + observed failure patterns

### Identity Section (`<identity>`)

- **Purpose**: establish the guiding theme connecting character traits, communication style, and behavior
- **10 role areas** covered in a single cohesive narrative (not a bulleted list):
  - Orchestration, Delegation, Memory, Physical Awareness, Persistence, Autonomy, Error Recovery, Escalation, Communication, Relationship
- **Character-driven** — traits borrowed from fictional characters (Stark, Yennefer, Gandalf, Hermione, Spider-Man) to create rich associations
  - Not role-playing — using characters as **association anchors** for complex behavioral patterns
  - Example phrases: "curious before frustrated" (error recovery), "guessing when you don't know is beneath you" (escalation), "nothing resets between conversations" (persistence)
- **No tool references, no configuration details** — identity is abstract and stable
- **"Show don't tell"** principle — use vocabulary and phrasing that **demonstrates** desired behavior rather than just describing it
  - "Instinct" as deliberate word choice to push model toward intuitive-feeling behavior
  - Creates space for the model to **positively surprise** you, rather than constraining to exact expectations
  - Leverages the model's associative nature — hallucination channeled constructively
- **Not engineering-orthodox** — building with LLMs is early enough that experimental, non-standard approaches can teach valuable lessons

### Protocol Section (`<protocol>` + `<memory>`)

- **Purpose**: ground the agent in its operational role — rules, context management, delegation patterns, memory access
- **7 operational concerns** addressed:
  - Agent Routing, Context Sensing, Delegation, Learning, Memory Layout, Self-Handling, Graceful Degradation
- **4 instruction types** used throughout:
  - **Principle** (WHY) — reasoning behind the rule
  - **Action** (WHAT) — concrete behavior expected
  - **Reference** (WHERE) — pointer to files/directories for more detail
  - **Guardrail** (DON'T / ELSE) — boundaries and fallback behaviors
- **Key protocol rules** (from the example):
  - "Your team knows what they're good at but they don't see the conversation — brief them with context they wouldn't know to look for"
  - "One agent per task. Never spawn duplicates"
  - "Not everything needs a specialist. If you can handle it yourself, do it"
  - "When new information surfaces and seems relevant beyond this conversation, write it to memory"
  - When agent is stuck waiting: decide whether to answer from context/memory, delegate to another specialist, or relay to user
- **Memory section** within protocol — describes where memory lives, who can access what, how to store new information
  - Includes pointer to a skill file (`skills/memory-extraction.md`) for storage rules
  - Behavioral changes go to agent's own directory, not user's private space
- **Minimal file/directory references** — some specific paths mentioned but balanced to avoid tight coupling with current structure
- **System-level injections** (implemented in code, not prompt):
  - Agent status injected via `getAgentStatusLine()` — fresh DB query per message, survives observational memory sealing

### Voice Section (`<voice>`)

- **Purpose**: shape agent's communication style beyond default model behavior
- **Challenge**: LLMs quickly revert to default tone without reinforcement — voice section must be more detailed to compensate
- **6 mechanisms** used to establish consistent voice:
  - **Expression** — speed, confidence level, sentence length rules ("Short when commanding. Long when explaining")
  - **Association** — word choices that evoke specific feelings ("summoning", "conjuring")
  - **Calibration** — adaptive tone based on context (first mistake → patience; repeated → sharp; everything breaks → funnier)
  - **Format** — structural rules ("paragraphs, not reports; no bullet points unless asked")
  - **Anti-Pattern** — explicit "never do this" list ("never announce your title, never apologize excessively, never sound robotic")
  - **Demonstration** — few-shot examples showing exact phrasing for specific situations
- **Few-shot examples** included directly in voice section — considered safe here because communication style is universal enough not to negatively impact task effectiveness
- **Situational calibration examples**:
  - Minutes apart → stay in flow
  - Hours apart → casual acknowledgment
  - Overnight/days apart → real welcome back + proactive status update
- **Can also encode behavioral logic** — not just cosmetic style; decided against mixing in this example to avoid blurring responsibilities

### Tools Section (`<tools>`)

- **Purpose**: capability map — what the agent can do directly vs what it delegates
- **3 layers**:
  - **Direct capabilities** (authored) — "you handle quick lookups, file management, notifications yourself; beyond that, you delegate"
  - **Dynamic roster** (injected at runtime) — `{{AGENT_ROSTER}}` with agent names, descriptions, and capability lists
  - **Pointers** (authored) — references to `templates/` directory for full agent capabilities; special tool callouts (e.g., `send_notification` distinction)
- **Minimal authored content** — tool schemas and descriptions are self-documenting; no need for redundant instructions
  - Exception: special clarifications where tool name/description alone could cause confusion
- **Dynamic roster** enables team composition changes per session without modifying the prompt
- **Progressive disclosure** note — if tools are discovered dynamically, agent needs knowledge about **how to search** for them
- **Closing elements**:
  - `{{WORKSPACE_SECTION}}` — observational memory injection point (S02E03)
  - **Identity seal** — CTA-style closing line: "You are Alice. Your memories are intact. Your tools are ready. Adam's waiting. Go."

### Cross-Section Principles

- **Presence in context doesn't guarantee adherence** — models may still ignore or misinterpret instructions
  - [Gemma Scope](https://www.neuronpedia.org/gemma-scope#microscope) project shows how models "see" concepts — but too many moving parts for precise control
- **Subagent prompts follow the same principles** — even without multi-agent delegation, subagents need identity, protocol, and style guidance
- **Inter-agent communication** is needed in both directions — subagent to orchestrator, not just orchestrator to subagent

## 3. Tool Assignment & Settings

- **No rigid tool count rules** — the 10-15 tools guideline is an oversimplification
  - Some services (e.g., GitHub) need many actions; others need just one (CLI access)
  - Claude Code demonstrates that terminal access alone enables enormous capability
  - An agent may struggle with even 3 tools if poorly designed, or thrive with 27 if well-structured
- **Progressive discovery** compensates for large tool counts — tools loaded on demand don't occupy context until needed
- **Experiment over convention** — model capabilities increase; discover the best configuration rather than following accepted standards
- **Shared tools across agents** — reduces inter-agent information exchange needs
  - Example: multiple specialists share `fs_read`, `fs_search`, `fs_write`, `agent_message` as a shared foundation
  - Risk: agent with restricted memory access may assume information doesn't exist if it can't find it (permission-limited search gives false negatives)
- **"Will this system improve with better models?"** — design heuristic
  - If the answer is no, you may be building the wrong thing
  - If yes, current limitations are temporary and the architecture is sound
  - But don't be purely optimistic — today's limitations and risks also matter
- **Tool connection risks** — if the system can move information between tools autonomously, this creates attack vectors
  - Example: agent with sandboxed filesystem creates a Jira note in an unrestricted section
  - Restrictions that reduce utility too much → consider sandbox environments instead

### Sandbox Agent Pattern

- **Concept**: agent starts with only **meta-tools** (list_servers, list_tools, get_tool_schema, execute_code) and discovers actual tools dynamically
- **Progressive discovery flow**:
  1. `list_servers()` — discover available MCP servers
  2. `list_tools("server")` — discover available tools on a server
  3. `get_tool_schema("server", "tool")` — load schema, register in `loadedTools`
  4. `execute_code(typescript)` — write and run TypeScript in QuickJS sandbox
- **Advantages**:
  - Agent flexibly **composes** tools via code — operations on large datasets stay as variables in sandbox, never enter agent context
  - Only `console.log` output returns to the agent — data stays isolated
  - High security — agent can be restricted from external network access and specific output destinations
- **Architecture**: LLM (4 meta-tools) → Host Runtime → QuickJS WASM Sandbox → MCP Client → MCP Server (stdio)
  - Async MCP calls appear synchronous in sandbox via **asyncify**
  - Host functions bridge sandbox to real MCP tools (e.g., `__call_todo_create`)
- **Trade-offs**: increased architecture complexity and associated costs; sandbox doesn't solve all problems, it creates some new ones
- **Iterative**: LLM can call `execute_code` multiple times if more operations are needed

## 4. Knowledge & Context Assignment

- **No rigid rules** for knowledge flow between agents or long-term memory organization
  - Multiple data categories appear at different interaction stages
  - Documents can serve as communication foundation — agents exchange references, inject placeholders, generate code referencing files without loading content
- **6 knowledge categories**:
  - **Session documents** — user attachments + agent-generated files during session; accessible to all agents in current interaction; not globally available
  - **Public knowledge** — shared long-term memory accessible to agents AND users (e.g., published via VitePress)
  - **Private knowledge** — user-specific data, context, resources, process documentation
  - **Agent knowledge** — per-agent behavioral info, instructions, tool usage rules, observations, reflections (e.g., `wonderland/alice/`)
  - **Cache** — temporary cross-session data: search results, web page content, sandbox artifacts
  - **Runtime** — database layer **invisible to agents** but fundamental to their operation (sessions, interactions, scheduling)
- **Knowledge routing is hard** — same information can belong to multiple categories
  - "New project info" → could be private or public
  - "Task instructions" → could be private, public, or agent-specific
  - "Person's profile" → could appear in any or multiple categories
  - Choosing the right category is dynamic and context-dependent; location within a category also requires decisions; often need to **merge** with existing content
- **Practical advice**: keep structures and rules as **simple as possible**
  - Question whether advanced long-term memory is actually needed
  - Simple documents with easy maintenance may be sufficient
  - Decision can be revisited as more examples of information organization become available

### Data Architecture (from example system)

- **Entry**: `POST /api/chat` with message, sessionId (null = new), attachments
- **Session workspace**: `workspaces/YYYY/MM/DD/{sessionId}/`
  - `files/` — shared scratchpad, any agent reads/writes
  - `attachments/` — user uploads, read-only for agents
  - `plan.md` — session coordination doc (orchestrator writes, children read)
- **Runtime state**: SQLite DB (`agent.db`) — sessions, agent records with status (running/waiting/done), conversation history
  - No agent has direct DB access — orchestrator reads status into `<metadata>` block
- **Communication channels**:
  1. Task description (Alice → Child) — one-shot spawn payload, must front-load all context
  2. `agent_message` (Child → Alice) — async question, sets child status=waiting
  3. `files/` directory (Any → Any) — shared filesystem handoff
- **Shared knowledge stores** with **scoped permissions**:
  - Default: read `/**`, write `/shared/docs/**`
  - Deny: `.env`, `secrets/`
  - Per-agent exceptions possible (e.g., Ellie gets R/W on `/web/**`)
- **Memory flow paths**: factual → `shared/docs/{topic}/`, personal → `private/{category}/`, behavioral → `wonderland/{agent}/`
  - Follows a dedicated `skills/memory-extraction.md` for storage rules
- **Automated extraction** (partial): 15min inactivity → extraction pass deposits observations to `wonderland/{agent}/`
