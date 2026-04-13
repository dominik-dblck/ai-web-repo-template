# S01E05 — Managing Explicit and Implicit Model Limits

## 1. Production Foundations for Generative AI Applications

- Generative AI apps are ~80% traditional software — but the remaining 20% creates **unique production challenges**
- **Ten production concerns** that appear immediately:
  - **Context** — model effectiveness depends on context, which is limited
  - **Control** — models hallucinate, behavior is unpredictable
  - **Performance** — generative models are currently very slow
  - **Dynamic costs** — inference billed per token processed
  - **Security** — Prompt Injection remains an open problem
  - **Stability** — most providers still have API stability issues
  - **Scaling** — API limits and costs emerge at scale
  - **Privacy** — potential model training on user data
  - **Violations** — unwanted user behaviors can lead to API account blocks
  - **Flexibility** — growing model capabilities and tooling require highly flexible architecture and sometimes business model changes
- These problems surface quickly, sometimes with the very first users

### Context Management

- Users **will upload** hundreds-page PDFs and DOCX files — must be prepared
- Users **will activate** hundreds of MCP tools simultaneously
- Users **have no knowledge** of LLM mechanics — expect infinite conversations and long-horizon task execution
- Must implement **programmatic guards** wherever token waste or dangerous actions (e.g., data deletion) are possible
- Context management affects **everything**: UX, effectiveness, security, speed, cost, and profitability

### Control and Error Recovery

- LLM-driven logic **will make mistakes** — system must enable self-repair or require human involvement
- **Error recovery flow** (from image):
  1. User requests calendar invite for external contact
  2. Tool call fails: **403 — email not in whitelist**
  3. Agent proposes alternative: **whitelist_add** tool
  4. Code requires **human confirmation** via UI (Approve/Reject buttons)
  5. Deterministic approval reduces error risk
- **Problems with this flow**:
  - Addresses on the list may be confused — invite goes to **wrong person**
  - Event description may contain data from **other tools** (email, knowledge base) — unintended data sharing
  - Confirmation **must show all details**, not just the email address
- Example: [01_05_confirmation](https://github.com/i-am-alice/4th-devs/tree/main/01_05_confirmation) — agent with [Resend](https://resend.com/) access, whitelist.json, physical buttons (Accept/Trust/Cancel)

### Trusted Tools Mechanism

- Manual approval of every agent step becomes **tedious** — need trust mechanism
- **Trust flow** (from image):
  1. LLM calls tool (e.g., `resend_send`)
  2. Code computes **checksum** = `hash(name + desc + schema)`
  3. Decision: is tool trusted? Yes → execute; No → show approval UI
  4. UI shows "Send email via Resend?" with **Approve**, **Trust**, **Reject** buttons
  5. Trust stores `tool_id + checksum` — **schema change invalidates trust** (re-prompt)
- **Critical for MCP servers** — their interface can change **without user knowledge**
- Approval/rejection **must be deterministic** (code-based, not LLM-decided)
- If accidental data transfer is unacceptable and user approval insufficient — **LLM deployment is not recommended**

## 2. Performance Optimization at Architecture Level

- Model performance is low — must be addressed through **architecture and UX design**
- **Six performance strategies** (from image — agent optimization architecture):
  - **Heartbeat** — inform user what's happening; show work-in-progress (e.g., document being built); perceived performance matters even without actual speedup
  - **Multi-threading** — long tasks (image/video generation) need: progress indication, **message queuing**, ability to **open new threads**; UI state must be decoupled from backend actions
  - **Background processing** — handle app closure, browser close, unstable internet; avoid requiring users to repeat multi-minute agent tasks
  - **Task resumption** — pause and continue on error, user approval, or agent completion; agent may await **multiple things** simultaneously; **event-driven architecture** recommended
  - **Query reduction** — always ask: "Is AI necessary for this step?" Use code when possible
  - **Token reduction** — optimize both input and output tokens via Context Engineering and Prompt Engineering
- If these aren't enough → consider **fine-tuning** smaller models or **[distillation](https://openai.com/index/api-model-distillation/)** of larger ones
- In practice, "Flash" models (Gemini 3 Flash, Sonnet Haiku) are often sufficient in price and speed

## 3. Cost Management and Token Economics

- Unit token costs are falling, but **real costs can be high** because:
  - **LRM models** (Large Reasoning Models) — cheaper per token but **generate far more tokens**
  - **Fan-out ratio** — one user message can trigger 1:50+ AI queries; caching is critical but not always possible
  - **Growing complexity** — as model capabilities grow, agent logic and operational horizon expand, increasing token consumption
  - **Proactive AI** — background processing at small intervals accumulates large numbers quickly
- **Cheaper model != cheaper solution** — [Solving A Million-step LLM Task With Zero Errors](https://arxiv.org/pdf/2511.09030) showed GPT-4.1-nano was **less cost-effective** than GPT-4.1-mini because it required far more steps
- **Cost optimization foundation**: observe application and user behavior to estimate production token consumption
- Platforms: [Langfuse](https://langfuse.com/), [Confident AI](https://www.confident-ai.com/) for observation and evaluation
- Even minimal testing with a small group helps estimate scale

## 4. Content Moderation and Safety

- Systems can receive data that **shouldn't reach the model**: confidential documents, API keys, illegal content, abuse attempts, corrupted attachments, web pages with prompt injection
- **Moderation flow** (from image):
  1. User sends inappropriate content
  2. Safety filter classifies: `category: "HARM_CATEGORY_HARASSMENT"`, `probability: "HIGH"`, `blocked: true`
  3. **Two parallel actions**:
     - User receives: "Your request was blocked due to policy violation. Please rephrase."
     - Moderator receives flag: `user_id`, `reason`, `status: "pending_review"`
- [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation) — **not using it can lead to account block**
- [Gemini filtering docs](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/gemini-for-filtering-and-moderation) for custom classification rules
- Moderation can **over-block** legitimate use (e.g., blocking ad with Messenger UI screenshot)
- For scope enforcement: use a prompt that returns **structured classification** of input, then programmatically decide next steps
- **Hallucinations in classification** are possible but limited; Moderation API is usually sufficient

## 5. Legal and Compliance Considerations

- System **will** do something it shouldn't — application must clearly inform users of this fact
- Product must be **legally protected**: Terms of Service, Privacy Policy, contracts with providers and end users
- Details vary by project, company, and scope — **always inform stakeholders** about the need for proper legal documents

## 6. Key Architecture Decisions

- Choices about models, frameworks, tools, and tech stack are **binding and hard to reverse**
- **Four guiding principles**:
  - **Common provider interface** — enable easy switching between models; libraries like [AI SDK](https://ai-sdk.dev/) help, but direct official SDKs also work well (allow custom event systems and hooks)
  - **No AI frameworks** — LangChain, CrewAI etc. become burdens quickly; dynamic model development, evolving APIs, and changing techniques make frameworks problematic; difficult to find positive production experience reports
  - **Independence** — limit use of native API features and platforms with difficult data export (some vector DBs, evaluation tools); today's solution will be replaced sooner than in classical apps
  - **Thoughtful architecture** — always increased flexibility; now even more critical due to faster change dynamics and higher probability of modifying fundamental application modules
- These principles may lose importance over time, but currently their role is **still growing**

## 7. API Limits — Token Windows, Rate Limits, and User Budgets

- Production limits are **technical, not just capability-based**: output token limits, base knowledge limits, API rate limits

### Context Window Management

- Models cannot generate infinitely — **output limits range from 2,000 to 128,000 tokens**
- Example (from image): GPT-5.2 with 400k context window:
  - Context window partitioned into: **System Prompt** (~2-8k), **Tool Definitions** (~1-16k), **Conversation History** (variable), **Output Token Reserve** (up to 128k)
  - Setting `max_tokens=128000` leaves only **272k for input**
- For most single queries, default limits are fine; for **agents and multi-agent systems**, token control is critical

### Token Estimation Techniques

- **Pre-call estimation** (from image):
  1. `estimated = chars / 4` (1 token ~ 3-4 English characters)
  2. `buffer = estimated * 1.2` (20% safety margin)
  3. After API call: compare actual `input_tokens` vs estimate — **refine future estimates**
- Trigger **compression, summarization, or extraction** actions early — at ~**30% of available limit**

### API Rate Limits

- Limits typically cover **requests per minute** and **tokens per minute**
- **Response headers** (from image) provide real-time data:
  - `x-ratelimit-limit-requests: 60`
  - `x-ratelimit-limit-tokens: 150000`
  - `x-ratelimit-remaining-requests: 59`
  - `x-ratelimit-remaining-tokens: 149984`
  - `x-ratelimit-reset-requests: 1s`
  - `x-ratelimit-reset-tokens: 6m0s`
- Address approaching limits programmatically while informing users of extended wait times

### Per-User Budget Control

- **Always enforce user-level limits** alongside provider limits
- [OpenRouter](https://openrouter.ai/) enables **per-user API keys with individual limits** (from image):
  1. Create user key via `POST /api/v1/keys` with name and $5 hard cap
  2. Runtime routes through OpenRouter with user's Bearer token
  3. At limit: **429 error** with `credits_used: 5.00`, `credits_limit: 5.00` — blocked at provider level
- Any API endpoint involving LLM logic must be **protected against excessive requests**, whether authenticated or anonymous

## 8. Implicit Limits — Hallucinations and Common Model Errors

- **Structure guaranteed != values guaranteed** — projects like [json-render](https://github.com/vercel-labs/json-render) are marketed as "guardrailed" and "predictable" but only guarantee JSON shape, not correctness
- **Value error example** (from image):
  - System sets `current_date: "2026-01-01"`, user asks for "last week's revenue report"
  - LLM generates chart config with dates "Dec 18-25" instead of correct "Dec 25-Jan 1"
  - Schema validates, UI renders — but **data is wrong and system can't detect it**
  - Even **self-verification by the model** doesn't guarantee error detection
- Hallucination rates are declining (e.g., [GPT-5.2 System Card](https://cdn.openai.com/pdf/3a4153c8-c748-4b71-8e31-aecbde944f8d/oai_5_2_system-card.pdf)) but the problem persists

### Hallucination vs Refusal

- **Gemini Flash** (from image): when asked about a webpage, **fully hallucinates** content based only on URL and random knowledge — confident tone masks complete invention
- **GPT-5.2**: same question — clearly states it **cannot access the page**, offers alternatives (paste text, upload screenshot)
- Models also hallucinate **tool call arguments** — e.g., guessing email addresses from names instead of asking for clarification

### Reducing Hallucination Risk

- **Inform model about its limitations** — whether web search is active, whether it has file access
- **Instruct on insufficient-data behavior** — ask to clarify or abort, not guess
- **Reduce task complexity** — decompose into smaller steps
- **Reduce context volume** — large contexts distract model attention
- **Application bugs** can also cause hallucination-like behavior — missing instructions, phantom tool access; **log and monitor all events** including system prompt changes during interaction

## 9. Environmental Limits — Tools, Integrations, and Business Processes

- Many limitations have **nothing to do with model capabilities**:
  - Distributed knowledge bases with diverse document formats
  - Undocumented, unstructured processes based on manual work
  - Legacy tool sets without API integration capability
  - Physical lack of access to real-time data (e.g., warehouse stock)
  - Field processes (e.g., sales activities)
- Require **close collaboration with business** and process stakeholders
- Solutions involve: **new or modified processes**, **tool migration**, **knowledge base unification**
- Same as traditional digital transformation — but AI potential is usually **much greater**
- Rarely full automation — usually **process optimization**; even a **few percent improvement** can be fully justified from business perspective
- AI_devs lessons contain many implicit hints about **designing solutions for business** (digital transformation)

## 10. Production Agent Architecture — Complete Example

- Full example: [01_05_agent](https://github.com/i-am-alice/4th-devs/tree/main/01_05_agent) — 100% code generated by Opus 4.5/4.6 in under 3 hours
- Components cover everything discussed in the week's lessons

### System Overview (from architecture image)

- **API Gateway** — routing, auth, CORS, timeouts; `/api/*` and `/mcp/*` endpoints
- **Runtime Orchestrator** — initializes providers, tools, MCP, agent templates per request
- **LLM Providers** — OpenAI + Gemini adapters via `provider.model`
- **Tooling Layer** — built-in tools + custom definitions
- **MCP Integration** — MCP client, server registry, OAuth flow
- **Agent Templates** — `agent.md` files with frontmatter + system prompt
- **Domain Models** — Agent, Session, Item entities + lifecycle transitions
- **Data Layer** — SQLite + Drizzle ORM, optional in-memory repo
- **Observability** — HTTP logs + agent lifecycle events

### API Configuration and Endpoints (from image)

- **Global middleware**: CORS allowlist, secure headers, request IDs, body size limits, timeouts, structured logging; **CORS wildcard blocked in production**
- **Auth + Rate Limit** on `/api/*`: Bearer token required, per-user RPM limit + rate-limit headers
- **Five endpoints**:
  1. `POST /api/chat/completions` — **primary**: runs agent turn, returns output or waiting state (AUTH)
  2. `GET /api/mcp/servers` — lists MCP servers + connection status (AUTH)
  3. `GET /api/mcp/:server/auth` — returns OAuth URL for MCP server (AUTH)
  4. `GET /mcp/:server/callback` — OAuth redirect handler (PUBLIC)
  5. `GET /health` — liveness check (PUBLIC)

### Context Assembly (from image)

- **Four input components** merge at Context Builder:
  1. **Agent Template** — frontmatter (name, model, tools) + body (system prompt)
  2. **Request Overrides** — optional model, tools, instructions, sessionId from API
  3. **Tool Registry** — built-in + MCP tools resolved by name (schemas included)
  4. **Session State** — prior items (messages, tool calls, tool outputs)
- Template read from disk per request (hot-reload); overrides take precedence over template defaults

### Agent Logic Loop (from image)

- **Core cycle**: Request Input → Agent Engine → LLM Provider → Tool Dispatcher → Tool Result → back to Agent Engine → Response Output
- **Event stream** emitted throughout:
  - `agent_started`, `turn_started`
  - `tool_called`, `tool_completed`
  - `turn_completed`
  - `agent_waiting` (pending external tool result)
  - `agent_resumed`, `agent_completed`
  - `agent_failed`, `agent_cancelled`
- **State management** is critical — affects prompt cache utilization
- Waiting state enables **external delivery** of tool results; continue via same session

### Unified Provider Abstraction (from image)

- Agent Engine produces **provider-agnostic requests** (messages, tools, params)
- **Provider Registry** resolves model and selects adapter
- **Adapters** (OpenAI, Gemini): map unified format → provider format, parse response back to normalized output (text + tool calls + usage)
- **Extensible**: add new providers by implementing adapter interface
- [OpenRouter](https://openrouter.ai/) can work but **doesn't support all features/models**; Gemini, Anthropic, OpenAI increasingly introduce API features that **block cross-provider translation**
- Not a problem for **multi-agent systems** — each agent can use different API

### Observability and Monitoring (from image)

- **Three event sources** feeding central observability layer:
  1. **HTTP Layer** — structured request logs: method, path, status, latency, request ID
  2. **Agent Engine** — lifecycle events: start, complete, fail, wait, resume
  3. **Tools & MCP** — tool execution + MCP connection events
- Central sink → JSON logs / external backend (e.g., [Langfuse](https://langfuse.com/))
- Two-level monitoring: classical system logs + agent-specific action tracking
- Also enables **interaction moderation** and blocking

### API Request Example (from image)

```
curl -X POST http://localhost:3000/api/chat/completions \
  -H "Authorization: Bearer 0f47acce-3aa7-4b58-9389-21b2940ecc70" \
  -H "Content-Type: application/json" \
  -d '{"agent": "alice", "input": "Create a file hello-world.md with a random inspirational quote."}'
```

- Agent connects to [Files MCP](https://github.com/iceener/files-stdio-mcp-server) for file operations in `workspace/` directory

## 11. Deployment to Production

- Application can run locally but eventually needs publishing
- VPS options: [DigitalOcean](https://digitalocean.com/), [Mikr.us](https://mikr.us/)
- **Deployment steps**:
  1. Create DigitalOcean droplet (Ubuntu, Frankfurt); use **SSH keys**, disable password login
  2. Install git, node, nginx, configure ufw
  3. Point DNS A records to server IP (e.g., via [Cloudflare](https://cloudflare.com/))
  4. Configure TLS with **letsencrypt** via `certbot --nginx`
  5. Set up **GitHub Actions Runner** from repository settings
  6. Configure **nginx reverse proxy** to `127.0.0.1:3000`
  7. Add secrets (`.env` values) to GitHub repository settings for runners
  8. `.github` workflow YAML triggers on push to main branch
- [Google AI Studio Live](https://aistudio.google.com/live) with screen share can guide through setup — **but hide API keys** during configuration
