# S02E01 — Context Management in Conversations

## 1. Role of Context in System Instructions

- **System instructions shape model behavior** — but their role has decreased as agents dynamically discover what they need
- System prompt acts as a **map** (not the territory) — provides orientation, not exhaustive detail
  - Reference: [The Map Is Not the Territory](https://fs.blog/map-and-territory/)
- **Four categories of system prompt content**:
  - **Universal instructions** — generalized descriptions of capabilities (e.g., "you have long-term memory" + its role: personality, user profiles, preferences)
    - Why generalized? Because the same tool (e.g., memory) may serve different roles in different agents — keep descriptions flexible
    - Memory-aware agent example: system prompt says "use memory to recall personality, user profiles, past context" — at runtime, agent calls `memory_search(["agent identity personality tone", "user profile recent conversation context"])` — returns personalized response combining agent style + user history
  - **Environment** — what the agent must know BEFORE running tools to shorten path to goal
    - App state (foreground/background/cron, human present: true/false)
    - Interface type (voice/chat/API)
    - Permissions and features (web: enabled, fs: read-only)
    - User brief (name, role, tone preference, timezone)
    - Context snapshots (meetings today, unread priority, device status)
    - Decision filter: "What must the agent know before tools to avoid unnecessary calls?"
    - Detailed data (full profile, deep history, task-specific knowledge) belongs in **tools**, fetched on demand
  - **Session** — compressed context from earlier in the conversation
    - Modifying system prompt mid-session breaks **prompt cache** — so session block is injected only when context is compressed
    - Session block contains: compressed summary, removed message count, retrieval pointer (e.g., `session_store:abc-123`), artifact references
    - Warning: adding task progress to system prompt can **break chronology** — system prompt shows older facts than later messages
    - Visual: fresh session (~12% used) -> limit approaching (~87%) -> messages pruned, session block injected (~38% used)
  - **Multi-agent teams** — shared instructions, placeholders for prompt composition, communication rules, context sharing conventions (usually via text files)
    - At least part of the system prompt will be **shared** across agents
    - System should support **placeholders** for flexible prompt composition

## 2. Distinguishing Signal from Noise

- **Signal** = information that helps the agent complete the task; **noise** = information that distracts
- As models improve, task complexity grows, context scope expands — harder to control signal directly
- The balance between **code-controlled logic** and **AI-driven logic** shifts with system complexity:
  - **AI Workflow**: code 65%, hybrid 26%, AI 9%
  - **Agent + Tools**: code 27%, hybrid 43%, AI 30%
  - **Multi-Agent**: code 8%, hybrid 49%, AI 44%
  - Routing, planning, tool selection, self-correction migrate from code to AI
  - But: security, auth, schema enforcement, session tracking **stay in code** across all levels
- Less code in multi-agent systems does NOT mean code is less important — code quality must be **higher** because agents can't easily work around broken core infrastructure
- **Five practices for maintaining high signal**:
  1. **Correct context delivery** — incomplete or wrong data happens often (tool conflicts, misleading API responses)
  2. **High-quality application logic** — less code but must be extremely polished
  3. **Well-crafted instructions and tool schemas** — prompt engineering is now about designing **components** that appear dynamically during interaction, not just system prompts
  4. **Generic mechanisms** — auto-compression, task planning, progress monitoring — designed universally to provide value in any situation; **generalizing solutions is one of the most important skills**
  5. **Space for clarification** — errors and dead ends will happen; human (or agent) interventions to provide "signal" are essential

## 3. Shaping Context Through Observation

- Agents with external context access often **don't use it** because they "don't know what they know"
- A "map" in the system prompt helps but cannot cover details that only emerge during exploration
- **Agentic Search / Agentic RAG** — agent builds context by iteratively searching, observing results, and refining queries
  - RAG = Retrieval Augmented Generation; **Agentic RAG** = agent-driven retrieval with adaptive query refinement
  - Example: agent searching Polish AI_devs documents — first tries English keywords (0 results) -> notices documents are in Polish -> retries with Polish terms -> finds relevant content
  - Limitation: keyword "context window" may not reach S01E05's section on "model limits" because that exact phrase never appears there
- **Prompt strategies for improving search** (ranked by coverage vs cost):
  - **A. Language hint** — "Documents are in Polish" — fixes language mismatch but not semantic reach
  - **B. Explicit mapping** — "context window -> also search model limits" — too specific, fixes one case
  - **C. Broader scope** — "search for related topics" — ambiguous, risks over-retrieval
  - **D. Few-shot examples** — concrete query->search-term mappings — good coverage but verbose, eats context
  - **E. Deep search process** — "3 passes: keywords, synonyms, adjacent concepts" — best coverage but overkill for simple queries
  - No prompt guarantees 100% retrieval — we operate in **probability, not certainty**
- **Practical agentic RAG** — generalized search instructions that work universally:
  - **Scan** — if no path given, explore folder hierarchies, filenames, headings of potentially relevant documents
  - **Deepen** — iterative: search with initial keywords + synonyms (3-5 angles) -> read promising fragments -> collect new terminology -> run follow-up searches -> repeat until no new terms emerge
  - **Explore** — look for related aspects: cause/effect, part/whole, problem/solution, limitations/workarounds, requirements/configuration — each as a separate lead
  - **Verify coverage** — before answering, check: definitions, numbers/limits, edge cases, steps, exceptions — if gaps remain, return to Deepen
- Adaptive behavior in practice (from [02_01_agentic_rag](https://github.com/i-am-alice/4th-devs/tree/main/02_01_agentic_rag)):
  - Complex query: 18 steps, ~57s, 538k input tokens, 72% cache hit — multi-phase with discovered keywords
  - Simple query: 4 steps, ~6s, 13k input tokens, 83% cache hit — direct lookup, no search phases
  - Same system prompt produces **different behavior** based on query complexity — agent self-adapts
  - **41x fewer input tokens** for simple vs complex queries — efficiency built into generalized instructions

## 4. Generalizing Context Processing Rules

- Creating **generalized instructions** (universal rules vs specific cases) is critical for agent design
- Resembles architectural thinking in programming — generic components that stay flexible without becoming overly complex
- **Key challenge**: no syntax validators or compilers for prompts — can't verify how changes affect existing instructions or detect conflicts
  - Currently rely on intuition + evaluation tools (which still don't guarantee behavior)
  - [Anthropic research on tracing model thoughts](https://www.anthropic.com/research/tracing-thoughts-language-model) — models can't explain exact internal processes, but CAN reasonably **justify** their behavior and suggest instruction improvements
- **Iterative prompt refinement with LLM assistance**:
  - Example: agent has `load_url` + `analyze_video` tools — user sends YouTube link — agent tries `load_url` first (fails), gives up instead of trying `analyze_video`
  - When asked "why didn't you use analyze_video?", model explains: instruction said "load link first, then use tools" — treated load_url as mandatory step 1
  - Model's initial fix suggestion is usually too **direct** (tool-specific routing) — not the generalization we want
  - **Iterative refinement process** (from broken interaction to universal rules):
    - V1: Tool-specific rules — oversteered, brittle to new tools
    - V2: Input-type routing — still tool-aware
    - V3: Action-oriented policy — still leaks tool patterns
    - **Final**: Universal operating rules (zero tool references, survives adding/removing tools):
      1. Identify intent: what the user wants produced
      2. Identify constraints: what's missing, what's needed
      3. Choose actions by fit: fewest assumptions
      4. Enforce scope: don't misuse actions
      5. Handle uncertainty: ask or pick safest option
      6. Failure protocol: interpret cause, retry, then report
      7. Be explicit about limits: what failed and why
- **Useful prompts for iterating with LLM**:
  1. **Analyze problem** — describe the broken behavior, ask for root causes, offer to provide more info
  2. **Generalize** — ask for universal patterns, not case-specific fixes; "find the category of problems, not just this bug"
  3. **Add your own judgment** — ~60% of LLM suggestions are useless, ~30% need changes, ~10% are good; emphasize instruction independence from tools, avoid oversteer
  4. **Iterate** — point out specific errors, model refines; usually simple guidance, not laborious
- Latest models have rich knowledge about prompt design and agents but **lack the "feel"** for what matters in a given situation — human involvement remains essential

## 5. Structure of Dynamic System Instructions

- **Priority**: prompt **cache hit** — directly impacts response time and cost
- **Context window structure** (top to bottom):
  1. **System prompt** [static, cached] — stable rules, behavior definitions
  2. **Tool definitions** [static, cached] — placed UNDER system prompt
  3. **Conversation** [dynamic, growing] — messages consuming remaining window
  - Critical: any change to system prompt **invalidates tool definition cache** (tools are below system prompt in the cache prefix)
- **Coding agent pattern** (inspired by Cursor/Claude Code):
  - **First user message** — one-time state injection via XML-like tags:
    - `<user_info>` — OS, shell, working directory, date
    - `<git_status>` — branch, modified/untracked files
    - `<rules>` — coding conventions
    - `<agent_skills>` — available skills with file paths
    - `<mcp_instructions>` — server configs
    - `<open_files>` — currently focused files with cursor position
  - **Subsequent messages** — refreshed state with only frequently changing info (e.g., open files)
  - User message doesn't have to contain ONLY what user said — programmatically injecting info the user "could have provided" is valid
  - **XML-like tags** clearly separate user query from injected metadata
- **Repeating important instructions** across messages — manages **model attention** as conversation grows; model may lose track of facts in long conversations
- Combine dynamic injection with context optimization techniques — but avoid "overloading" with too many updates (can hurt effectiveness)
- **Key question**: which information should be dynamically injected vs available via tools/external files?

## 6. Controlling Interaction State Beyond the Context Window

- Not everything happens inside the context window — **Agent Harness** = infrastructure around the LLM enabling effective agent function
  - Reference: [Phil Schmid on Agent Harness](https://www.philschmid.de/agent-harness-2026) (DeepMind)
- **Five external mechanisms** (organized by timing):
  - **Real-time**:
    - **Session hooks** — monitor state/metadata per interaction, trigger partial summaries or external updates; data queued and injected automatically or on demand
    - **Environment** — external signals (IoT, location, system alerts) injected when conditions are met
  - **Near-time**:
    - **Files** — persistent storage for tool results, collaboration documents, skill definitions, data collection; agents read/write as needed
    - **Agents** — multi-agent cooperation across separate context windows with shared state (delegated tasks, shared memory, status sync)
  - **Background**:
    - **Memory** — built asynchronously, even long after session ends; can use [Batch API](https://platform.openai.com/docs/guides/batch) for significant cost reduction (e.g., daily processing)
- Shift in thinking: agent systems are not just SDK/framework/single app — they are the **entire environment** the agent interacts with

## 7. Context Masking (Prefilling Technique)

- Technique from [Manus agent team](https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus) — mask context elements **without removing them**
- **Mechanism**: prefill the beginning of the model's response with tokens that constrain tool selection
  - Example: when browser session is active, prefill with `<|im_start|>assistant<tool_call>{"name": "browser_...` — model can ONLY complete tool names starting with `browser_`
  - Available: `browser_click`, `browser_type`, `browser_scroll`, `browser_close`
  - Blocked: `file_read`, `shell_exec`, `code_run`, `search`
  - Lock released when `browser_close` is called — full tool access restored
- **Status**: marked as [deprecated](https://platform.claude.com/docs/en/build-with-claude/working-with-messages) in Anthropic API — rarely available, but conceptually valuable
- Related project: [.txt](https://blog.dottxt.ai/control-layer-for-ai) — control layer for AI
- Takeaway: **creative approaches in AI logic are still being explored** — even unusual ideas can address entire classes of problems

## 8. Planning and Progress Monitoring

- Not all agent tools must affect the environment — some manage **model attention**
- **Task lists (TODO)**:
  - Model writes planned activities, checks them off after completion, **rewrites remaining tasks** each time
  - Purpose: not just user info — **reminds the model** of priorities through repetition
  - Model-generated content may have stronger influence on behavior than externally injected content
  - Related: [Many-shot jailbreaking](https://www.anthropic.com/research/many-shot-jailbreaking) — model's own outputs steer its behavior
  - Challenge: without programmatic support, models often forget to update the list or do it only after all tasks are done
  - Pattern: CURRENT task marked with arrow, PENDING with circle, DONE with checkmark — agent updates after each task completion
- **Plan mode** (inspired by Claude Code/Cursor):
  - Instructions injected into **user message** (not system prompt) — preserves cache
  - Plan mode ON: read-only constraint, phases: Understand -> Design -> Review -> Plan
  - Plan mode OFF: replacement instruction injected — "Exited plan mode. You can now make edits and take actions."
  - Subsequent messages during plan mode don't need re-injection — instructions already in context
  - Key: instructions **replaced** on state change, not removed
- Both task lists and plan mode exist **in the UI as well** — not just in model context

## 9. Sharing Information Between Threads

- Agents need a defined **workspace** for saving, sharing, and persisting information across sessions and agents
- Even if modules like long-term memory use relational/graph databases, agents still benefit from file-based workspaces for navigation and exchange
- **Workspace structure** (session-scoped):
  - `workspaces/{year}/{month}/{day}/{session_id}/`
    - `plan.md` — session context
    - `attachments/` — user uploads
    - `agents/{agent_id}/`
      - `inbox/` — receives tasks (written ONLY by root/orchestrator agent)
      - `notes/` — private scratch space (agent's own)
      - `outbox/` — delivers results (readable by orchestrator, who routes to other agents or user)
- **Isolation rules**:
  - Agents live inside sessions — kill session -> agents gone
  - Programmatic restriction: agent cannot access other users' materials
  - Communication via orchestrator: agent finishes work -> places documents in outbox -> root agent routes to other agents' inboxes or to user
  - Date-based organization (`year/month/day`) — good practice, should be more granular for larger systems
- Design decisions depend on system requirements — no universal answer, and workspace doesn't have to be elaborate

## 10. Context Engineering as Foundation (Extra Knowledge)

- **Context is not optional** — it is the foundation for every agent decision
- **Without context, agents fail predictably**: file organizer example — agent told to "clean up desktop" (300 files) organizes in 8 seconds, but:
  - Presentation lands in archive
  - Vacation photos split across 3 folders (beach vs mountains)
  - RAW+JPEG pairs treated as duplicates — RAWs deleted (irreversible)
  - File renaming destroys embedded timestamps in filenames
  - 80% of files end up in "other" folder when agent doesn't understand user's organization system
- **Same model + same tools + context = completely different decisions**
  - Example: telling agent "I'm a photographer, RAW and JPEG are always pairs never duplicates, organize by sessions with date and client name, 'to edit' folder means work in progress" — transforms behavior without changing code
- **Alternative approach**: let the agent discover the system — analyze existing organization, show inferred rules, user corrects mistakes (faster than writing rules from scratch)
- **Four essential safety mechanisms** for agents operating on user data:
  1. **Dry run as default** — agent shows plan first, executes only after approval ("surgeon who plans before cutting")
  2. **Backup before every operation** — copy before move/rename/delete; seconds of disk vs hours of lost work
  3. **Confirmation for large operations** — 300 files? Ask first, show summary
  4. **Operation log with undo** — every action recorded (source, destination, timestamp); rollback with single command
- **Two levels work together**: context improves decision quality; safeguards ensure bad decisions aren't catastrophic — neither alone is sufficient
- Key question to ask before any agent task: **"What does this agent not know, but should know, to avoid causing harm?"**
