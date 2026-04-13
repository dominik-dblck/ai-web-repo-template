# S02E03 — Documents and Long-Term Memory as Tools

## 1. The Retrieval Gap Problem

- **Core problem**: agents find a document that appears complete but miss related documents it depends on
  - Example: doc_B retrieved → doc_A and doc_C (connected to doc_B) remain invisible
  - The agent cannot know what it failed to find — produces **unknown unknowns**
  - Prompt changes alone cannot fix this — full context understanding may require reading dozens of documents
- **Open problem**: no definitive solution exists yet
  - Reference: [LongMemEval benchmark](https://arxiv.org/pdf/2410.10813) — detailed analysis of long-term interactive memory challenges across sessions
- **Key insight**: instead of solving retrieval gaps, **eliminate the need for discovery search altogether**
  - Build knowledge bases specifically for agents, not for humans
  - When knowledge is structured for agent navigation, retrieval gaps stop being the bottleneck

## 2. Observational Memory (Observer / Reflector Pattern)

- **Source**: [Mastra.ai Observational Memory](https://mastra.ai/blog/observational-memory) ([GitHub](https://github.com/mastra-ai/mastra))
- **Core idea**: skip semantic search and graph dependencies — replace them with a structured, compressed **log journal**
  - Journal entries are precise, concise observations from the current interaction
  - Each entry captures the essence: what happened, what was decided, what the current task is
- **Two-agent architecture**:
  - **Observer** — triggered at ~30K tokens; receives existing log + recent messages → produces updated log; messages are then "sealed" and removed from conversation; updated log is appended to system prompt
  - **Reflector** — triggered when log exceeds ~60K tokens; receives log only → produces compressed log; compressed log replaces original in system prompt
- **Token thresholds**:
  - 30K tokens → Observer runs, thread restarts with updated log
  - 60K tokens → Reflector compresses the accumulated log
- **Cross-session continuity**: "unsealed" messages + latest log version can be attached to a new session
- **Results**: achieves **94.87% on LongMemEval** with gpt-5-mini — extremely strong for such a simple mechanism
- **Trade-off**: compression means natural **forgetting** over time (similar to human memory)
  - Agents can still have tools to load earlier memories if needed
- **Lesson for builders**: the thinking pattern behind OM — eliminate search complexity through incremental compression — is more valuable than any specific implementation detail

## 3. Building Knowledge Bases FOR Agents

- **Paradigm shift**: most RAG implementations connect agents to **existing** knowledge (designed for humans)
  - Better approach: **create** knowledge bases designed for agent processes
- **Benefits of agent-designed knowledge**:
  - Agents know exactly where to find what they need — no discovery search required
  - Documents rarely become too large or use incompatible formats
  - Updating one document cascades correctly through the entire process
  - Information composition: a single update propagates without manual rewiring
- **Comparison**:
  - **Agent + search**: agent may or may not find the right document; some information is always invisible; creates unknown unknowns
  - **Knowledge to agent**: system prompt points to a directory; agent follows a curated, navigable path; unknown unknowns become visible gaps
- **Design principle**: use **generic navigation rules**, not tool-specific instructions
  - Bad: "instructions for Linear are in `/workflows/linear/assign-issue.md`"
  - Good: "instructions for your tools are in `./workflows`"
  - Generic rules survive adding or removing tools; specific rules create maintenance burden
- **Example — Task Manager agent**:
  - Receives: "add a task"
  - Reads: `./workflows/linear/create-issue.md` (rule: always assign to a project)
  - Follows reference: `./projects/overview.md` (finds correct project: AUTH-01)
  - Executes: creates Linear issue with correct project assignment
- **Scaling limits**: very complex processes and rich human interactions reveal challenges; agents should start by taking over individual process **elements**, not complete workflows

## 4. Presenting Resources to the Model

- **Navigation modes** — agents use all four simultaneously:
  - **Perspective** — bird's-eye view of available materials (e.g., directory listing)
  - **Navigation** — searching file names and content (e.g., grep)
  - **Links** — references between documents (internal links, imports)
  - **Details** — reading the original document content
- **Key observation**: external context is exposed via information **inside** the documents themselves
  - This is natural in source code — imports reveal dependencies; function names reveal related files
  - Rare outside code — exceptions: Wikipedia (rich internal links), Second Brain tools (Obsidian, Roam, Logseq)
  - Business content (docs, emails, transcripts, financial docs) rarely has these links
- **Coding agent example**: task is "add bio field to user profile"
  - Grep for "profile" → find `ProfileSettings.tsx`
  - Follow imports → `userStore.ts` → `userApi.ts` → `users` route → `schema.ts`
  - Discover full implementation chain from a single grep entry point
- **Dynamic vs static context exposure**:
  - Static: show full directory tree → only useful when structure is stable and the agent focuses exclusively on navigation
  - Dynamic: reveal information through document content links → preferred; context unfolds progressively
- **Learning vs connecting**:
  - **Connect to source**: chunk → embed → query → retrieve fragments → agent sees partial context with invisible gaps
  - **Learn from source**: read full document → organize into explicit structure → gaps become visible
  - Structured learning produces visible gaps; fragment retrieval hides absence
- **Debate**: dynamic, content-driven knowledge exposure solves many problems but not all — some challenges remain open

## 5. Knowledge Base in Multi-Agent Workflows

- **Principle**: a shared knowledge base acts as the **handoff layer** between agent sessions
  - Agents in separate sessions write to and read from the same directory
  - The shared folder is the coordination mechanism — no direct agent-to-agent communication needed
- **Example — personalized newsletter pipeline**:
  - **Researcher** (3 separate sessions): blogs session, YouTube session, newsletters session
    - Each reads the same `news.md` instruction file
    - All write to `newsletter/edition-26/` (blog-summaries.md, youtube-highlights.md, newsletter-digest.md)
  - **Writer**: reads `edition-26/` contents + `daily-newsletter.md` rules → produces `content.md`
  - **Sender**: reads `content.md` → sends personalized email to team inbox
- **Cost optimization**: decomposing into focused sessions pays only for re-reading shared instructions; avoids massive single-session cost
- **Quality benefit**: each agent focuses on one task → higher output quality than a single overloaded agent
- **Safety warning**: any agent that sends to a mailing list must be restricted to **draft creation only**
  - Human review is mandatory before delivery
  - Risks without review: hallucination, prompt injection → could redirect recipients to malicious sites
- **Applicable patterns**: team updates, monthly product newsletters, personalized sales briefings
- **File-based handoffs reduce coupling** — gathering, writing, and delivery are independent agent responsibilities connected only through files

## 6. Graph-Based Knowledge Mapping

- **When to use graphs**: multilevel relationships across many documents + need for multiple retrieval modes simultaneously
- **Technology**: [Neo4j](https://neo4j.com/) — **property graph** model
  - **Nodes**: objects with labels (categories) and properties (attributes); one node can have multiple labels
  - **Edges**: directed, typed relationships between exactly two nodes; may carry properties
  - Example: Adam (Person + Developer) OWNS eduweb (Company), CREATED Alice (Project)
- **Hybrid RAG in graph**:
  - Full-text search (BM25) + semantic vector search + graph traversal — all in one system
  - Agent navigates through relationships, not just retrieves fragments
- **Example — `02_03_graph_agents`**:
  - Indexes an article from the `workspace` directory
  - Query: "How does David Shapiro's work relate to prompt engineering?" → agent searches + traverses graph
- **Toolset — 4 categories**:
  - **Retrieval**: `search` (BM25 + vector, returns chunks + entities), `explore` (neighbors of a node), `connect` (shortest path between two nodes)
  - **Advanced**: `cypher` (read-only Cypher queries — aggregations, type filters, relationship counts not covered by higher-level tools)
  - **Indexing**: `learn` (chunk + embed + entity extraction + graph write from file or text), `forget` (remove document + orphaned entities)
  - **Maintenance**: `audit` (node counts, orphans, duplicates, type distributions), `merge_entities` (deduplicate entities across sources)
- **Trade-offs**:
  - Pro: most comprehensive knowledge-base integration available; handles any retrieval mode
  - Con: high complexity, significant maintenance cost (financial + operational), slow response generation
  - Use only when **multilevel relationships** across distributed documents are a genuine priority
- **Dynamic memory candidates**: [mem0](https://docs.mem0.ai/open-source/features/graph-memory), [supermemory](https://supermemory.ai) — both explore graph-based approaches for persistent agent memory

## 7. Deep Research — Generating Long-Form Content

- **Concept**: agentic process that produces comprehensive documents through iterative search, analysis, and synthesis
  - Available in ChatGPT, Gemini; also via API: [OpenAI](https://developers.openai.com/api/docs/guides/deep-research), [Gemini](https://ai.google.dev/gemini-api/docs/deep-research), [Firecrawl](https://docs.firecrawl.dev/features/alpha/deep-research)
  - Process runs in the **background**, often **30–60 minutes**
  - Tool trace may include 80–250 search calls
- **Pre-processing step — query enrichment** (developer's responsibility, not the research model's):
  - Step 1: intermediate LLM generates clarifying questions (scope, timeframe, format, evaluation criteria)
  - Step 2: user provides constraints and preferences
  - Step 3: intermediate LLM merges original query + clarifications into a detailed, structured prompt
  - Research model should never begin with a raw, vague user query
- **Agentic research loop**:
  - Decompose question → Search → Read → Find gaps → Evaluate sufficiency
  - If not sufficient: Refine → return to Search
  - If sufficient: produce final Report with inline citations
  - Research is **iterative**, not linear — gap detection and refinement are core steps, not optional
- **Output**: structured report with inline citations (not just summarized content)
- **"Deep Action" reframe**: the same pattern applies beyond research — any task requiring long-form output + iterative depth:
  - Code generation with deep codebase exploration
  - Audits requiring cross-system analysis
  - Rename "Deep Research" → "Deep Action" to see broader applicability
- **Reference implementation**: [aidevs-deeper](https://github.com/iceener/aidevs-deeper) — personalized deep research agent operating on private data; main logic in [deep.service.ts](https://github.com/iceener/aidevs-deeper/blob/main/src/services/agent/deep.service.ts)
- **Use cases**: deep topic explanations, market analysis, comprehensive reports, complex audits

## 8. Voice Data Privacy & Privacy Routing (Supplementary — AID4)

- **Voice data is biometric data**:
  - A voice recording carries: tone/emotions, accent/regional origin, background sounds (location), and **voice print** (biometric identifier with fingerprint-level statistical strength)
  - Under GDPR: biometric data is a **special category**, requiring explicit consent
  - Legal precedent: Texas vs. Google (2025) — $1.375 billion settlement for biometric data violations (BIPA)
- **Voice cloning risk** (2025 state):
  - 1 minute of audio is sufficient to clone a convincing voice copy (MIT + Google research)
  - Sam Altman (OpenAI, 2025): "What scares me is that some financial institutions still accept voice print as authentication. AI has completely defeated that."
  - Sending audio to the cloud risks not just content leakage — it risks **cloning material**
- **Cloud vs. local processing**:
  - **Cloud** (Whisper API, Google Cloud STT, Deepgram Nova): fast, high quality, convenient — but audio leaves the device; copy exists on external server
  - **Local** (Whisper Large V3, Whisper Large V3 Turbo ~6GB VRAM, MacWhisper for Mac, VOSK offline): audio never leaves the device
  - **2025 shift**: local transcription quality now matches cloud API quality for most use cases (Polish: Whisper Large V3 Turbo); processing speed up to 418x faster than real-time (Nvidia Canary-Qwen 2.5B for English)
- **Privacy routing — design decision, not optional feature**:
  - Route by sensitivity: non-sensitive (shopping lists, public webinar notes) → cloud acceptable; sensitive (client meetings, therapy notes, financial data) → local only
  - Rule of thumb: "If you wouldn't email the content to a stranger, don't send the recording to an external server"
  - This routing decision must be made **before deployment**, not after — once recordings are sent, they exist somewhere
- **Builder responsibility**: if you build an agent that transcribes conversations, decide the routing architecture upfront; your users may not know where their audio is going
