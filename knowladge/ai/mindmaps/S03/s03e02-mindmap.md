# S03E02 — Model Limitations at the Project Assumptions Stage

## 1. Defining AI Role and Engagement Level

- **Initial expectations are always too high** — demos suggest full automation is within reach, but deployment reveals mismatches with business requirements, technical limitations, and security threats (data leaks, injection, business risk)
- **Four common scenarios where naive AI application fails**:
  - **"Talk to your knowledge base"** (RAG) — start by asking "do we actually need this?"; map real use cases first; many fail at data collection alone; prototype before planning the full project; if tests disappoint, **pivot scope** (e.g., employee onboarding, sales tools, manager dashboards) or **abandon**
  - **Website chatbot** (customer service) — automating relationship-building with customers is currently a bad idea; instead, build **background agents** integrated into existing support panels so staff don't need to learn AI interaction
  - **Marketing/sales automation** — mass auto-emails from bots damage brand; AI should be a **draft assistant** where humans review and send; never connect LLMs to automated email sending
  - **All-in-one agent** for the entire organization — prompt injection and hallucination make org-wide reliability/security near impossible; prefer **dedicated, specialized tools** unless there's an explicit reason not to (e.g., R&D/innovation teams)
- **The shift**: Full Automation → **Agentic Support**
  - Global org RAG → **Onboarding MVP** (specialized, verifiable, practical)
  - Public chatbot → **Background agent** (quality boost, human leverage)
  - Mass auto-emails → **Draft assistant** (personalization, human sends)
  - All-in-one agent → **Dedicated tools** (modular, contained, reliable)
- **Regularly update your beliefs** — what's impossible today may be effortless tomorrow; what seems simple in theory may be hard in practice; the task is distinguishing one from the other
- **At implementation time**, deciding what AI handles vs what code handles is not obvious:
  - Experience may bias toward AI or toward familiar programmatic solutions
  - Sometimes the right answer is **retreating from the idea entirely** and handing the process to humans
  - Better models don't mean more logic on the model — models may better **manage deterministic logic** through routing and document references
- **The most valuable skill**: ability to determine **what doesn't matter right now**

## 2. Email Agent Case Study — Scope and Isolation Design

- **Problem**: support multi-account email management for a single owner across multiple projects
- **Design constraints**:
  - One agent handles all mailboxes
  - Each account is a separate project — **data must not mix**
  - Some information is shared and can be accessed across accounts
  - API access: read messages, threads, metadata; create filters and labels
  - Agent combines email content with user notes from knowledge base
- **Key question**: how to deliver high value while minimizing risks and the negative impact of model limitations?
- **Activity types where AI assists safely**: **labeling**, **prioritization**, **drafting**, **filtering**, **enrichment**, **optimization** — consequences of errors are limited due to high human involvement
- **Constraint types that address security**: **no send action** (agent cannot send emails), progressive **knowledge base isolation**, **permission management** — programmatic constraints that largely address prompt injection
- **Two-phase execution architecture**:
  - **Phase 1 — Triage** (open access, all accounts visible): read, classify, label, plan replies; tools: `list_emails`, `get_email`, `search_knowledge`, `list_labels`, `label_email`, `mark_for_reply`; **no drafts produced** — internal organization only
  - **Phase 2 — Isolated Drafts**: each session has fresh context, locked to one account, no memory of other drafts; knowledge base filtered by account AND by contact domain/type
- **Contact-type knowledge scoping** — different contact types see different KB categories:
  - **Internal** → product, clients, team, vendors, communication (5 categories loaded)
  - **Vendor** → vendors, communication (3 loaded)
  - **Client** → product, communication (3 loaded)
  - **Untrusted** → communication only (2 loaded)
- **Example result**: 5 drafts produced, 4 labels applied, **0 data leaks**

## 3. Email Agent — Safety Mechanics (Defense Stack)

- **Four-layer defense stack** with decreasing enforcement rigidity:
  - **L1 — Isolated sessions** (Hard enforcement) — protects against cross-draft contamination
  - **L2 — Knowledge base lock** (Hard enforcement) — protects against cross-account access
  - **L3 — Contact-type scoping** (Hard enforcement) — protects against over-sharing within account
  - **L4 — Prompt-level rules** (Soft enforcement) — protects against hallucination/edge cases
- **Critical design principle**: L4 failure is safe **because L1-L3 already removed dangerous data** — the model can only leak what's in its context, and hard enforcement ensures only appropriate data is loaded
- **Agent actions as event triggers** — labeling an email is an observable event:
  - Label "Bug Report" → auto-create issue in task management system → another agent (or human) assesses complexity → automatic resolution possible
  - Humans can also trigger events by assigning labels manually
- **Key insight**: design systems so their activity is **nearly invisible** while effects translate to real business value

## 4. Controlling Task Difficulty Level for Models

- **Complexity grows faster than expected** when moving to autonomous systems — even with strong AI support, you encounter new classes of engineering problems
- **Current challenges**: task complexity, information access, difficulty working with long contexts, architecture/integration stability, tool ecosystem reliability
- **As models improve, expectations and solution complexity also increase** — programmatic support for models remains necessary (just different kinds over time)
- **Agent precision for background tasks is critical** — errors tolerated in human-supervised interaction are unacceptable for agents working autonomously; a system that fails every 5th time is useless even with a clearly defined process
- **Solution: structured task plans** — plan consisting of tasks with names, descriptions, statuses, dependencies, and assigned agents/capabilities
  - Tasks form a **partially dependent sequence** — some run in parallel, others wait for dependencies
  - Tasks can change status mid-execution (e.g., to "waiting" for additional steps)
  - System status checked after each cycle until all tasks complete

## 5. Heartbeat Pattern — Task Progression and Orchestration

- **Three core components**:
  - **Contracts** — structured plan and task definitions with dependencies; application state built and updated from these
  - **Heartbeat** — manager logic that assigns tasks and updates state after each cycle
  - **Memory** — filesystem-based, works within single agent scope AND for inter-agent communication
- **Task contract structure**: id, title, status, agent, dependencies, capabilities, attempts, instructions
  - Status types: **open**, **in-progress**, **done**, **waiting**, **blocked**
  - Heartbeat evaluates: `status == open → all deps == done → agent has required capabilities`
- **Parallel execution**: tasks with no shared dependencies run simultaneously (e.g., T-01 "Setup scaffold" + T-02 "Content brief" in Round 1)
- **Status change mid-task**: task can switch to "waiting" mid-execution — heartbeat detects and resumes it in next round
- **Heartbeat cycle**: after each round, reconcile all statuses → unblock tasks whose deps completed → resume paused work → dispatch newly eligible tasks → loop until every task reaches "done"
- **Dispatch constraints per agent**: LLM loop with max turns (e.g., 16), scoped tools (fs, shell, web_search)
- **Key boundary**: task contracts are **markdown files with frontmatter** — heartbeat reads them as structured data; **routing logic is deterministic code** (if/switch on status, deps, capabilities); **LLM only runs inside a claimed task**; agents **never self-select work**

## 6. Heartbeat Execution — Real-World Example

- **Context**: report-v2 workflow, Claude Opus 4.6 vs GPT-5.3-Codex comparison
- **Uses Observational Memory** for context compression within each agent session — enables longer time horizons and effective inter-agent communication
- **Execution flow across 7 rounds**:
  - **R1**: T1 Evidence Collection (RESEARCHER) — web search, encountered firewall 404, requested human input → 24.6s, WAITING-HUMAN; T2-T5 blocked
  - **R2**: T1 resumed with human approval — 6 web scrapes, 12 file reads, 11 evidence records → 95.8s, hit 16-turn max, 331k tokens consumed, memory sealed (44 messages), re-queued
  - **R3**: T1 resumed with sealed memory context — produced structured evidence pack (1,630 words) → 76.3s, DONE
  - **R4**: T2 Normalized Axes & Outline (PLANNER) — read evidence, produced axes + outline (1,608 words) → 66.5s, DONE
  - **R5**: T3 Draft Report (WRITER) — read evidence + outline, wrote and revised draft, memory sealed mid-task → 191.7s, 1,751 words, DONE
  - **R6**: T4 Editorial Quality Gate (EDITOR) — QA audit (citations, caveats, forbidden content), cleaned final report → 77.1s, DONE
  - **R7**: T5 Render HTML (PLANNER) — render markdown to HTML, verify output → 14.9s, PROJECT COMPLETE (3,489 words, 780 lines)
- **Key observations**: agents dynamically create new tasks when additional info needed; human-in-the-loop when system can't decide; memory sealing enables working beyond single context window

## 7. Reducing Prompt Injection Risk

- **No definitive elimination possible** — only risk reduction and consequence mitigation
- **Core security principles**:
  - System prompt must be treated as **publicly available** — no exploitable data in it
  - Behavior change via chat **must not** grant unauthorized access to actions or resources — access controlled **programmatically**
  - Agents should have **blocked or heavily supervised** external communication (posting, emailing, SMS, document publishing) when they access confidential information
  - Even internal communication may need technical restrictions when handling privileged information
  - External sources accessible to agents should be **limited**; if not possible, content generated from them must be **carefully verified**
- **Blunt rule**: we cannot trust agents with information sharing or working on external data sources — all contact points with the outside world must be treated as **dangerous**
- **Filtering barrier pattern** (for production deployment):
  - User message → **separate, isolated LLM request** (no shared context with main thread) → guard prompt classifies as "safe" or "unsafe" → **programmatic string match** on result → forward or block
  - Attacker cannot see guard phrases — guard runs in fully isolated request
  - Bypass is possible but **very difficult** with current models for typical users
- **Legal and disclosure requirements**: when agents interact with users, legal protection + **explicit disclosure** that AI is used in communication is the only remaining defense line for unintentional errors
- **Combine all techniques** from previous lessons for a relatively high security level — but **no guarantees**; avoid such situations if absolutely not necessary

## 8. Managing Low Performance and Hallucinations

- **Inference speed landscape**: projects like [Taalas](https://taalas.com/the-path-to-ubiquitous-ai/), [Groq](https://groq.com/), [Cerebras](https://www.cerebras.ai/) promise near-instant inference but haven't proven stable API access for larger models at scale
- **Five areas for managing model performance**:
  - **Input token count** — directly affects response time; includes system prompt, tool definitions, conversation context
  - **Cache utilization** — affects costs and response time; applies only to input tokens
  - **Output token count** — affects generation time; controllable via shorter responses AND fewer agent steps
  - **Request count** — if not parallelized and not cached, significantly increases response time
  - **Smaller models** — increase speed and decrease cost, but limit capabilities
- **Key optimization: code generation + sandbox** — the most impactful lever

## 9. Code Execution Agent — Sandbox Pattern in Practice

- **Problem**: generate a PDF cost report from 240 JSON files across 10 departments — 150,000+ lines, 11,508 line items; loading into context is impossible; LLM "calculating from memory" guarantees errors
- **Agent capabilities**: filesystem access + **code execution in Deno sandbox**
- **Four-phase execution** (completed in 6 turns):
  - **Phase 1 — Discover**: explore workspace tree (fs_read), locate JSON files (fs_search) → 240 files found
  - **Phase 2 — Sample**: read ONE file to learn schema (field names, types, structure) → model now writes targeted code, no guessing
  - **Phase 3 — Process**: generate aggregation code → 240 files processed, 11,508 line items aggregated → summary.json (3.4K), **~200 tokens returned** (stdout only); **11,508 records processed outside context window**
  - **Phase 4 — Output**: generate PDF with pdfkit → 2026-cost-report.pdf; ~30 tokens returned (confirmation)
- **Architecture** (three processes):
  - **Host Process** (Bun): entry point (index.ts) → agent loop (agent.ts, max 25 turns) → LLM API
  - **Direct Path** (MCP): MCP Client (@modelcontextprotocol/sdk, stdio) → Files MCP Server (files-mcp, scoped to workspace/)
  - **Sandbox Path**: Deno sandbox (sandbox.ts) — fresh process per call, 30s timeout, no state, npm support; prelude (codegen.ts) injects tools object; HTTP Bridge (localhost:N) lets sandbox call MCP tools
- **LLM-visible tools**: Direct (fs_read, fs_search, fs_write, fs_manage — cheap, fast, no code gen) + Sandbox (execute_code — TypeScript in Deno)
- **Key insight**: model **never sees raw data** — writes code that processes records outside context window; only compact summaries return to context
- **Results**: speed, cost efficiency, and hallucination levels are **incomparable** to standard agent approaches; fs + execute_code configuration gives the agent capabilities far beyond PDF generation
- **Production consideration**: three-process architecture (host + MCP + sandbox) adds complexity for scale; sandbox infrastructure being addressed by [Cloudflare Sandbox](https://developers.cloudflare.com/sandbox/) and [Daytona](https://www.daytona.io/)
- **Critical caveat**: calculations are done in code (reliable), but **data loading correctness** creates room for errors — agents handling critical documents need strict supervision with code-controlled processes wherever possible
