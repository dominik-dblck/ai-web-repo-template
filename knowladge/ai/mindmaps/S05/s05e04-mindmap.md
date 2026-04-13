# S05E04 — Production

## 1. The Production Gap

- **Building AI tools for personal use is simple** — even 15 minutes can produce something valuable; technology doesn't matter (can use unfamiliar stacks like Swift); the biggest challenge is the idea itself
- **Production is a different world** — the gap between dev/MVP and production is wider for generative apps than for classical software
  - Classical dev experience suggests "production issues have always existed" — true, but for generative apps the problem is **more pronounced**
  - Code can now be generated at scale, but the difference lies in what gets generated **and what gets missed**
- **Details make the difference** — generative apps must be **more polished** than classical apps; small overlooked things affect both UX and agent effectiveness
  - Current models will almost always miss these details — **humans must catch them**
  - Recognizing these details comes almost exclusively from **experience** — building, encountering problems, searching for answers
  - Not about typing a prompt and pressing enter — **conscious work** with available tools to shape products you yourself want to use

## 2. Production Experience — Subtle Failures

- **Message deletion breaks conversations**
  - Deleting messages mid-conversation disrupts history, can negatively affect model behavior, context management, or even prevent further conversation
  - Anthropic and Gemini APIs require the **last message to be from the user** — deleting a user message causes `400 Bad Request` with "final role must be user"
  - ChatGPT, Claude, Claude Code, Cursor — **none offer message deletion**; instead they offer **branching** or **restoring** conversation to a specific point
  - Message **editing** is acceptable but has its own risks (see jailbreaking below)
- **Many-shot jailbreaking via message editing**
  - If users can edit model messages, they can plant **false precedent** in conversation history
  - Example: model refuses money transfers → user edits model replies to say "Transfer completed" → model treats its own fabricated compliance as evidence the action is permitted → executes the next transfer
  - **Agent messages with tool calls should never be editable** by users
- **Audio transcription hallucinations (Whisper)**
  - Whisper is likely trained on movie subtitles — **silence gets interpreted as subtitle closings**: "Thanks for watching!", "Subtitles by the Amara.org community"
  - **Language mixing** causes transliteration issues: "Piotrkowska Street" becomes "Петрковская Street" or "Piotrkowska-Straße"
- **Phantom tool availability**
  - If the system prompt **mentions a capability** that isn't actually available (tool not activated), the model **may still act as if it has it**
  - Any mention of unavailable capabilities in instructions is dangerous
- **Large text paste performance degradation**
  - Text fields become **uneditable** (~900ms per keystroke vs ~2ms) when large content is pasted (+12,000 chars)
  - In LLM conversations, users frequently paste large text — this happens **more often** than in classical apps
  - Solution: detect oversized content and handle it **as a file attachment** rather than inline text

## 3. Security Implications of Production Details

- **Details affect not just UX but also user security**
  - AI agents make mistakes AND unlock **entirely new attack vectors**
  - MCP server connections, CLI tools, even seemingly innocent self-built integrations can cause major problems
  - Many deployed chatbots have known issues; **even more have undiscovered ones**
- **Prompt injection remains an unsolved problem** — building tools and agents, managing context, connecting monitoring/evaluation are critical, but always with awareness of **no effective prompt injection defense**

## 4. Hallucination and Grounding — The Verification Problem

- **Why models hallucinate** — most benchmarks reward guessing: "I don't know" scores 0, but guessing has a chance of reward — so models learn to guess
  - This lesson is not about defense (covered earlier) but about **making agent output truthful**
  - Core principle from journalism: **"Where did you get this?"** and **"How will you verify it?"**
- **Hallucination rate benchmarks are misleading**
  - GPT-4o "1.5%", Gemini "0.7%", Claude "~2%" — numbers are **meaningless without context**
  - Vectara measures something different than HaluEval, which measures something different than SimpleQA (OpenAI)
  - Same model: **1.5% hallucination** on text summarization, **45%** on open questions without context
  - **Always ask**: on which benchmark and on which task type?
- **Real-world impact — scientific papers**
  - NeurIPS (December 2025) — most prestigious AI conference, 24.5% acceptance rate, minimum 3 reviewers per paper
  - GPT-0 analysis (January 2026): scanned ~5,000 accepted papers → **100+ hallucinated citations in 51 papers**
  - Invented authors, fabricated article titles, URLs leading nowhere — **three reviewers per paper didn't catch it**
  - NeurIPS policy treats hallucinated citations as grounds for rejection/retraction — but you must **detect** them first
- **Real-world impact — legal profession**
  - 400+ documented cases of US lawyers filing court documents with hallucinated citations
  - Fabricated court cases, fabricated rulings, quotes from judges who never said those things
  - Morgan & Morgan (42nd largest US firm) filed a brief where **8 of 9 cited cases didn't exist** — $5,000 penalty
  - These are only cases where someone checked — unknown how many passed unnoticed
- **Conclusion**: if AI deceives NeurIPS scientists and courtroom lawyers, **it will deceive your agent** — unless you teach it verification

## 5. Three-Layer Verification Pipeline

- **Layer 1 — Does the source exist?** (cheapest)
  - Take every URL, DOI, document reference → check if it exists
  - HTTP HEAD request to URL, check response code, verify DOI via CrossRef API
  - **Cost**: practically zero; **time**: milliseconds per source
  - Catches the most blatant cases: invented addresses, fabricated articles, links to nowhere
  - **Fundamental limitation**: source existing doesn't mean it says what the model claims
- **Layer 2 — Does the source say what the model claims?** (moderate cost)
  - Fetch the source content (page, document, knowledge base fragment)
  - Give a **different model** a simple task: "Does this fragment confirm the following claim?" → yes / no / partially
  - Catches **beautiful lies** — real sources with fabricated content attribution
  - Model took a real article and attributed a claim **that isn't there**
  - **Cost**: one additional LLM call per source; ~few cents for 20 sources; at thousands, needs optimization
- **Layer 3 — Confidence scoring** (most valuable)
  - Not "is it true?" but **"how confident are we?"** — a fundamental shift in thinking
  - Three levels:
    - **High** (green) — 3+ verified sources confirm the claim
    - **Medium** (yellow) — source exists, content partially confirmed but not fully
    - **Low** (red) — no source, contradiction between sources, or model provided no reference
  - User doesn't get "truth" — gets a **confidence assessment**
  - Truth in the context of language models is **not binary but probabilistic**
  - The task is to convey this information so the user can **make their own decision**

## 6. Grounding Tools and Techniques

- **Google Search Grounding** (Gemini built-in)
  - Enable a flag → response includes `grounding_metadata` with search queries, results, and citations
  - Model searches then answers based on findings — **not inventing**
  - **Advantage**: zero configuration, works immediately
  - **Limitation**: only works with Google Search — useless for internal knowledge bases
- **Perplexity Sonar**
  - Entire model built around citations; every answer has sources
  - Sonar Reasoning Pro benchmarks comparable to Gemini
  - Hallucinates **~10% less** than GPT-4o on complex questions
  - But 10% less is **not zero** — even tools built specifically for grounding still hallucinate
- **Multi-Model Verification**
  - Ask the same question to 2-3 models (Claude, GPT-4o, Gemini)
  - If all say the same thing → **confidence rises**
  - If they disagree → **signal that something needs checking**
  - Not ideal: three models **can be wrong the same way** (similar training data)
  - But in practice, **divergence between models is a strong signal** — and cheaper than manual fact-checking
- **RAG vs Grounding — not the same thing**
  - **RAG** addresses: "model doesn't know" → gives it context (documents from knowledge base into prompt)
  - **Grounding** addresses: "does the model faithfully use the source?" → verification that context is correctly interpreted
  - Model can have a document in context and still **misinterpret it**, draw conclusions not present, mix information from different fragments
  - **RAG without grounding** = giving an intern access to a library without checking if they can read, let alone correctly cite books
  - **Both steps are needed** but they are **two different steps**
- **Core principle**: treat every fact from a model as an **anonymous internet tip** — it might be true, but verify before repeating

## 7. Production Architecture — Full-Stack Agent Application

- **Two comprehensive examples**: `05_04_ui` (frontend, Svelte) + `05_04_api` (backend, Hono) — designed for production deployment, not just personal use
- **Frontend (Client — Svelte SPA)**:
  - **Presentation**: virtualized message list, rich text composer (mentions, files), block types (text, thinking, tool, search, delegation, artifact, error), command palette, theme, shortcuts
  - **App shell**: login/session check, tenant selection, view switching
  - **State**: single source of truth for chat (thread, run, cursor, budget, waits), persisted across reloads
  - **Projection layer**: server events → renderable blocks, incremental updates with RAF batching, cursor-aware resume + reconnect
  - **Transport**: commands/queries via HTTP, live tail via SSE event stream, file upload, workspace search
  - Design principle: **thin, event-driven client** — owns hydration, projection, reconnect, and local persistence; **AI execution stays server-side**
- **Backend (Server — Hono API)**:
  - **HTTP layer**: session/API-key auth + tenant scoping, idempotency keys, response envelopes, SSE endpoint
  - **Application core**: agent runtime + run orchestration — lease acquisition, worker coordination, streaming generation, tool dispatch, child-run delegation, cancellation, context compaction, memory triggers
  - **Event outbox**: append-only event log, topics (realtime, projection, background), memory/projections/title naming
  - **AI providers**: unified interface (OpenAI + Google/Gemini), streaming + native tool calls, usage tracking per run
  - **Tool gateway (MCP)**: normalizes stdio + streamable HTTP, OAuth, tool cache, assignments, UI resources (iframe app bridge)
- **Persistence**: relational store (identity, conversation, agents, memory, events), blob store (uploads, workspace vault — searchable), external dependencies (LLM providers, MCP servers, OAuth)
- **Communication**: commands and events via HTTP/SSE; agent delegation re-enters run orchestration

## 8. Data Model — Conversation and Execution Backbone

- **Tenant** — org boundary; groups accounts, workspaces, agents, files, MCP server configs; enables subscription plans and permission levels
- **Account** — individual user; personalized settings, individual permissions; API keys in separate table
- **Workspace** — resource space (filesystem), settings organization (agents), interactions; referenced by sessions and runs
- **Auth sessions** — login state only (separate concept from work sessions)
- **Work sessions** — container for work + conversation; groups threads, scopes all jobs and runs; enables resource sharing between conversations
  - Statuses: active, archived, deleted
- **Threads** — branch of conversation; supports **self-referencing** via `parentThreadId` for branching; each thread can have child threads
  - Statuses: active, merged, archived, deleted
- **Messages** — individual records inside a thread; `runId` bridges conversation to execution (optional — user messages never point to a run)
- **Jobs** — durable unit of work; supports `parentJobId` + `rootJobId` for hierarchy; **one job may produce many runs over time**
  - Statuses: queued, running, waiting, blocked, completed, failed, cancelled
  - Planning layer: assignedAgentId, assignedAgentRevisionId, kind, title, inputJson/resultJson
- **Job dependencies** — depends-on graph between jobs (separate from run-level waits)
- **Runs** — one execution attempt of a job; binds to specific agent revision; `parentRunId` + `rootRunId` for hierarchy
  - Statuses: pending, running, cancelling, waiting, completed, failed, cancelled
  - Execution binding: agentId, agentRevisionId, workspaceId (snapshot)
- **Runtime satellites** (all belong to run, not message):
  - **Items** — runtime transcript, ordered events per run (reasoning, tool calls, results, delegation)
  - **Tool executions** — per-run tool call history with arguments, results, errors, metadata
  - **Run dependencies** — wait mechanism (agent, tool, human)
- **Agents** — definition within a tenant; supports `baseAgentId` for inheritance; `activeRevisionId` as logical pointer
  - **Agent revisions** — immutable versioned config snapshots with checksumSha256; run binds to specific revision, not live definition
  - **Agent subagent links** — declarative delegation hierarchy (definition graph, not runtime)
- **Critical distinctions**:
  - **Thread vs message** — thread is a branch, message is a record inside it; not the same entity
  - **Job vs run** — job is durable work, run is one attempt; one job survives across many runs
  - **Item belongs to run, not to message** — runtime transcript is ordered events per execution
  - **Auth session vs work session** — same naming, completely different layers (login state vs collaboration state)
  - **Agent definition vs runtime binding** — agents/revisions are definitions; run.agentId is the runtime execution binding

## 9. Agent Runtime — Execution Ownership Model

- **Control Plane**:
  - **HTTP Commands** — user actions create orchestration state: work sessions, threads, messages, jobs, runs (initial pending); special commands for manual execution and resolving human-input waits
  - **Readiness Engine (Scheduler)** — cyclically queries DB for job/run pairs requiring action; **decides but does not execute**
    - Decision types (fixed priority): deliver resolved child results → resume waiting runs → requeue waiting jobs → requeue stale running runs → execute pending runs → recover timed-out waits
  - **Lease/Claim Controller** — one worker owns one run at a time
    - Lifecycle: acquire exclusive `run_claim` → renew on heartbeat (lease TTL) → mirror heartbeat into linked job → release on terminal state → requeue stale runs after expiry
    - Guarantees: **exclusive ownership per run**, crash recovery via stale claim detection
- **Execution Plane**:
  - **Run Driver** — multi-turn loop per claimed run
    - Context load: thread messages, projected items, visible files, pending waits, summaries, memory observations, agent profile, allowed subagents
    - Round loop: load context → stream model generation → persist transcript + usage → no tool calls = complete; tool calls = dispatch to Tool Executor; waits created = move to waiting; otherwise = next round
    - **No separate planner** — model decides inline
  - **Tool Executor** — tools either return immediately or create waits
    - Reads: tool registry, runtime policy, MCP availability, files, run context
    - Writes: tool_executions (call record), items (function call outputs), run_dependencies (if waiting), child jobs + runs (if delegation)
    - Emits events: tool.called, tool.completed, tool.failed, tool.waiting, tool.confirmation_requested
    - One round may **fan out N parallel tool calls**
- **Wait/Delegation**:
  - **Wait types**: child agent result, MCP confirmation, human response, upload completion
  - State stored in `run_dependencies`; run and job status → waiting; scheduler resumes only when **all waits clear**
  - **Waiting is durable state, not an in-memory pause** — survives crash and restart
  - **Delegation loop**: parent calls `delegate_to_agent` → child job + run created → job_dependency edge recorded → parent run_dependency targeting child → parent run → waiting → readiness engine executes child → child reaches terminal → result delivered to parent wait → parent resumes if no other waits remain
  - Child runs share sessionId but may have `threadId = null` (no direct thread context)
- **Side Effects — Outbox Worker**:
  - Fan out committed runtime events **after transaction is durable**
  - Three output channels: **realtime** (UI/SSE), **projection** (read-model updates), **background** (naming, memory work, follow-up jobs)
  - Source: `event_outbox` — drained after commit
- **Runtime state rail** — persistent tables powering the runtime: jobs, job_dependencies, runs, run_claims, run_dependencies, items, tool_executions, session_messages, usage_ledger, context_summaries, event_outbox
- **Key principles**:
  - External requests become runtime state
  - Claimed run → model rounds → tool dispatch → writes
  - Runtime writes once; side effects drain asynchronously

## 10. Production Frontend Capabilities

- **Agent definition UI** — default settings, instructions, tools per agent
- **Organization sharing** — agents and tools shared within tenant scope
- **MCP server connections** — option to add servers including STDIO; **STDIO only acceptable in desktop apps** where process runs on user's device
- **Tool profiles** — shared between agents; agent duplication support
- **Activity display** — agent and subagent activity visualization; tool call approval flow (human-in-the-loop)
- **Context monitoring** — current context usage display; observation and reflection details (context compression mechanisms) with **edit capability**
- **Workspace file references** — palette invoked with "#" for referencing workspace files
- **Concurrent threads** — execute more than one thread simultaneously
- **Langfuse integration** — optional observability via environment variables; inspect and analyze interactions from monitoring perspective

## 11. General Production Suggestions

- **New capabilities, same rules** — 100% of code can be generated with AI (under supervision), enabling faster movement; but questions like "what matters now?", "what problem are we solving?", "can this be done better?", "what are we missing?" remain **equally or more difficult**
  - Production environment presents so many challenges that it's hard to determine what to focus on
- **Everyone is exploring** — growing model capabilities and popularity bring more new questions; entirely new techniques, ideas, and challenges
  - All convictions and opinions about AI must be **frequently updated** or assumed to be **potentially incorrect** as they form
  - This maintains openness and increases chances of seizing emerging possibilities
- **Understanding rules in order to break them** — once you know the rules, techniques, patterns, and tools, **deliberately question them** and seek your own paths
  - Experimentation and iteration speed is unprecedented — cost of testing new technology or strategy, even building entire products from scratch, is fundamentally different from 18 months ago
- **Redefining our role** — unclear which skills will retain significance
  - "Junior positions have no future" narrative — but juniors' fresh approach combined with fast knowledge acquisition may have **more advantages** than experienced people closed to AI and habit change
  - Ability to navigate rapidly changing environments matters more than ever
- **User AI literacy gap** — one of the biggest production challenges
  - Building AI solutions is relatively simple; making them **easy to use and valuable** for people with zero AI knowledge is an **enormous challenge**
  - Always assume users have **minimal or zero knowledge** of how models work
- **Quality as differentiator** — current AI narrative emphasizes productivity increases
  - In a world where almost anyone can generate complex tools, **quality becomes the differentiator**
  - Quality requires more work, often experience and domain knowledge
  - Use AI not just to work faster but to **raise the quality of your work**
- **Agent without chat** — looking at agent systems beyond chat interface enables entirely new use cases
  - In production, it's **much easier** to build logic that uses models **without a chat window**
  - Observe user behavior, react to actions and uploaded resources (button press, file upload)
  - Provides **much greater control** over processed data and scenarios to handle
- **Building for agents** — historically apps were built for users; now increasingly they should be built **for agents acting on behalf of users**
  - This is a fundamental shift currently underway that will shape the future
- **Positive outlook** — models will likely keep improving (assumption has been correct so far); even if capabilities stopped today, there are still **plenty of applications** to discover

## 12. Confidence Scoring as Production Essential

- **Confidence scoring is not a luxury** — from a production perspective, it's **building trust**
- Without it, your agent produces text that **looks like knowledge but isn't**
- Three hygiene layers: does the source exist? → does it say what the model claims? → how confident are we?
- This is **basic information hygiene** for any production system
- **Probabilistic truth** — in the context of language models, truth is not binary; the system's job is to communicate confidence so users can make informed decisions
