# S04E01 — AI Solution Deployments

## 1. Expectations vs Reality of AI Deployments

- **AI deployments largely resemble non-AI system deployments** — we can combine existing engineering knowledge with what we're currently learning about AI
- **Build for yourself first** — create solutions you will personally use; experiencing problems and understanding capabilities firsthand prepares you for building at larger scale
- **Digital Garden / Second Brain concept** — a personal knowledge base (usually public) that goes beyond blog articles; can take any form; the key twist is connecting it with AI so that notes become **agent memory** (ties back to S02E03)
- **Core capabilities of a garden agent**:
  - Navigate the entire knowledge base via terminal commands
  - Create and edit any markdown document
  - Follow instructions described in files (workflows, skills)
  - Run generated scripts (code execution)
  - Use tools via Code Mode ([Anthropic reference](https://www.anthropic.com/engineering/code-execution-with-mcp))
  - Autonomously publish changes
- **"Why not just use Claude Code?"** — Claude Code has all these capabilities, but the point is understanding **what happens underneath**; production use of Claude Code at scale wouldn't make sense; alternatively, [Pi](https://pi.dev/) logic could be wrapped for production use
- **The collision**: initial excitement about unlimited potential meets reality constraints:
  - Agent can't process overly long documents
  - Agent doesn't see images embedded in text
  - Agent can't process binary documents (e.g., PDF)
  - Agent can't access some websites
  - Agent can't use service features unavailable via API
  - Agent generates responses too slowly
  - Agent generates excessive costs
- **Key takeaway**: "We can't do everything, but we can do anything" — same applies to production solutions where you must choose focus areas
- **Starting point matters** — the minimal example (`04_01_garden`) has limited utility (no UI, no context compression, minimal tools), but it serves as a **foundation** to build upon; every AI deployment benefits from defining such a foundation early
- **Architecture** (from diagram): CLI Chat → Agentic Loop → Tools (exec, read_file, write_file, git_push, web_search) → Daytona Sandbox → vault/ (markdown + system prompts + workflows) → GitHub Repo → GitHub Actions (build) → GitHub Pages (deploy)
  - Vault synced between sandbox and repo via git_push
  - Content build pipeline: vault/ (markdown + frontmatter) → gray-matter + marked.parse → page model + nav + layout → dist/ → Pages
  - `vault/system` excluded from public build

## 2. Synchronous vs Asynchronous AI Collaboration

- **Two fundamentally different problem categories** in AI deployments — direct (synchronous) and background (asynchronous) work
- **Synchronous collaboration** characteristics:
  - **Interface** is central — editor, chat, various communication modes directly affect system effectiveness
  - **Personalization** — building context, modifying structures, creating custom workflows/skills, extensions and configuration
  - **Synchronization** — both user and agents need free access to current data
  - **Feedback** — system can have broader permissions because critical actions are under human supervision
  - Setup: **personalized** configuration → human trigger → agentic loop → **supervised** human-in-the-loop → shared state → tool calls → visible/confirmed/iterable result
- **Asynchronous collaboration** characteristics:
  - **Integration** — system must follow defined processes or navigate predefined spaces; requirements, service connections, and schedule must be established upfront
  - **Communication** — UI can be minimal or absent entirely; system may only function in background or report results with minimal human involvement
  - **Self-sufficiency** — processes must be precisely defined and effective enough to not require human intervention; must accommodate modifications and adaptation to changing environment
  - **Autonomy** — agents work independently on scheduled/event-driven triggers
  - Setup: **pre-wired** integration → schedule/event trigger → defined workflow (spec is the interface, no improvisation) → **autonomous** self-recovery → process as state → tool calls → passive receipt/post-hoc review
- **Comparison axes** (from diagram):
  - Setup: config vs integration
  - Trigger: human vs schedule
  - Interface: central vs minimal
  - Feedback: in-loop vs self-recover
  - State: shared vs process-defined
  - Permissions: broad vs scoped
  - Autonomy: supervised vs independent
- **Hybrid approach is valid** — nothing prevents a system from working in the background while still enabling direct user collaboration
- **Digital Garden hybrid design** — four components:
  - **Editor**: user manages notes in markdown editor (Obsidian or similar); needs access to latest document versions
  - **Interface**: user issues simple commands (not chat) — save info, retrieve content
  - **Workflows**: agent processes described in files; results stored in defined structures; space for research, periodic notes, observations, resource collection
  - **Agents**: agents have dedicated tools but do **not directly collaborate** — only exchange information; e.g., email agent uses research agent's outputs but cannot assign new tasks to it
- **4-layer system architecture** (from diagram):
  - **Layer 1 (User)**: markdown editor + quick commands + review & promote (user decides what becomes canonical)
  - **Layer 2 (Vault)**: single source of truth — notes & articles (user-authored), workflows & rules (agent instructions), side notes (agent output: suggestions, enrichments, drafts)
  - **Layer 3 (Agents)**: isolated, schedule-driven, vault-mediated exchange only — newsletter agent, podcast agent, research agent, learning agent; agents do NOT task each other
  - **Layer 4 (Publish)**: vault/ → markdown.ts → GitHub Actions → GitHub Pages → public Digital Garden; agent-notes excluded from build
- **Progression pattern**: from **general foundations** with "unlimited" possibilities → to a **clearly specialized system** whose role is supporting the user in growth, skill acquisition, resource collection, and sharing experiences
- **Not about replacing humans** or generating blog content — it's about clear collaboration and **amplifying capabilities on both sides**

## 3. Process Mapping in the Context of AI Capabilities

- **Three questions to answer**: "What do we want to do?", "What do we NOT want to do?", and "How do we want to do it?" — including the decision to **not use AI** where benefits are small or nonexistent
- **Six decision dimensions** for the Digital Garden (from decision map diagram):
  - **User**: developer profile → higher tool complexity tolerance → terminal access, code execution, relaxed agent limits → **sandbox required for safety** (Daytona)
  - **Content**: user-authored, personal → agent **enriches, never replaces** → full vault access but scoped by rules, side notes only → **canonical content stays human** (promotion gate: agent output in /agent-notes, user promotes manually)
  - **Format**: HTML impractical to write → **markdown as source format** (editable by human and model) → build pipeline mandatory (md → HTML via code only)
  - **Integrations**: agent can execute code → **CLI + MCP + native tools** all available → unconstrained tool surface (any external service reachable: Firecrawl, Replicate, Resend, etc.)
  - **Publishing**: static HTML output → **GitHub Pages + Actions** (push triggers build, zero manual deploy, free hosting) → privacy non-issue by design (digital garden is public)
  - **Availability**: API access required (save/recall from anywhere) → **remote server + local sync** (Mutagen) → vault must be always online (agent writes remotely, editor reads locally, sync is critical path)
- **Decision map pattern**: constraint → decision → consequence — each dimension follows this chain; **all decisions are reversible except availability** (remote-first is a structural commitment)
- **Balance between code logic and AI involvement** — classic engineering still constitutes the **vast majority** of the architecture:
  - From the labeled decision map: ~10 engineering decisions, ~5 AI-driven, ~3 hybrid
  - Infrastructure **serves** the agent, not the other way around
  - A few months ago the split was 90-10 or 80-20; now agent logic increases the AI role, and in some scenarios we observe **inverted proportions**
- **Prepare for fast iterations** — not all initial decisions will be correct; maintain high project flexibility; in business contexts, information may not only be unavailable but also **incorrect**

## 4. Validating Assumptions Through "Simple" Tests

- **AI deployments introduce unpredictable model behaviors** and API complications (costs) alongside standard engineering uncertainty; also the reverse — new models may enable what was previously "impossible"
- **Three test categories** for the Digital Garden:
  - **Enrichment test**: can the model determine what should be added to a note and whether anything should be added at all? May reveal need for frontmatter properties where user leaves guidance for the agent
  - **Building test**: can the agent correctly place and describe a new entry from a URL? Build evaluation datasets to test which model and configuration works best
  - **Accessibility test**: is a chatbot necessary for knowledge access, or would a well-configured search engine or mobile app with direct document access suffice?
- **"Simple tests" now means more** — today a "simple test" can include **generating a native mobile app** with relatively advanced functionality, not just a basic prototype
- **Prototyping loop compression** (from diagram):
  - **Without AI** (~4 weeks): Week 1 idea+spec → Weeks 2-3 build prototype (wireframes, mocked API, fake search, static pages) → Week 4 test+decide → **output: mockup with no real functionality, no real data, no agent**
  - **With AI** (~3 days to working system): Day 1-3 full working system (vault, agent loop, publish pipeline, live site) + parallel tracks: semantic search V1 (hours), native mobile app, auto-enrich test → Day 3 milestone: **fully working system, live site, real agent** → Days 4-10: continued iteration on multiple features with real signal
  - Parallel exploration tracks: search (semantic → hybrid+reranking → search+chat), mobile app (full features → offline sync + push), enrichment (auto-enrich → killed after test → frontmatter-guided), newsletter (draft pipeline → full send pipeline)
  - **Killing ideas costs hours, not months**
- **Business implications**: clients can receive testable functionality in **days, sometimes hours** (especially startups/agency projects); enables testing many ideas in parallel and verifying hypotheses in expanded test environments that faithfully represent reality or even include real end-user context and feedback
- **Applies beyond client work** — same acceleration for building features, learning processes, and daily workflow optimization; requires **changing habits** — there may be a gap between what we know and what we actually do

## 5. Sources of Inspiration and Knowledge

- **Business AI deployments suffer from information scarcity** — most available content is marketing articles from implementation firms, containing few actionable details
- **Best sources are blogs of people behind specific tools** — companies whose business model includes providing quality knowledge that also encourages product adoption; they often have enterprise client experience
- **Recommended sources**:
  - [LlamaIndex Blog](https://www.llamaindex.ai/blog) — RAG, indexing, retrieval
  - [Vercel Blog](https://vercel.com/blog) — AI SDK, deployment patterns
  - [Langfuse Blog](https://langfuse.com/blog) — observability, evaluation
  - [Cloudflare Blog](https://blog.cloudflare.com/code-mode/) — code mode, edge AI
  - [HumanLayer Blog](https://www.humanlayer.dev/blog) — human-in-the-loop patterns
  - [Philipp Schmid](https://www.philschmid.de/agent-harness-2026) — agent harness design
  - [ngrok Blog](https://ngrok.com/blog) — AI-related networking topics
  - [Manus Blog](https://manus.im/blog) — agent architecture
  - [Nous Research](https://github.com/NousResearch/hermes-agent) — open-source agent projects
  - [Pi Project](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) — coding agent implementation
  - [Braintrust](https://www.youtube.com/@BraintrustData) — evaluation presentations
  - [Databricks](https://www.youtube.com/@Databricks) — data + AI presentations
  - [AI Engineer](https://www.youtube.com/@aiDotEngineer) — engineering-focused AI talks
- **Strategy**: find profiles of people involved in these projects, follow their publications and shared content; do the same for tools you use daily where enterprise collaboration is part of the business model

## 6. Key Principles for AI Deployments

- **Start with a foundation** — define a minimal starting point (like `04_01_garden`) that serves as the base to build upon; don't try to build everything at once
- **"We can't do everything, but we can do anything"** — choose focus areas deliberately; the existence of AI doesn't automatically answer what to build or how
- **Hybrid sync/async is the natural pattern** — most real systems combine direct collaboration with background processing; decide the balance based on use case
- **Agent enriches, never replaces** — for content/knowledge systems, AI-generated content has no value; AI-enriched human content does; maintain a promotion gate between agent output and canonical content
- **Infrastructure serves the agent** — solid engineering foundation with AI concentrated in content rules, integrations, and availability; don't invert this relationship
- **Test assumptions early and cheaply** — AI-accelerated prototyping compresses weeks into days; killing bad ideas costs hours, not months
- **Vault as single source of truth** — structured markdown shared between user and agents; agents exchange information through the vault, not through direct communication
- **Agents don't task each other** — exchange information via shared vault only; each agent has dedicated tools and defined processes
- **Every decision follows constraint → decision → consequence** — map each dimension explicitly; most decisions are reversible except structural commitments (like remote-first architecture)
- **Balance changes over time** — the engineering-to-AI ratio is shifting; what was 90-10 a few months ago may now be inverted in some scenarios; stay prepared for this evolution
