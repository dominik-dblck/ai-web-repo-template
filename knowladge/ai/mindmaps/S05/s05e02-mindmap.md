# S05E02 — Toolset for Generative Applications

## 1. Building User Interfaces for Agents

- **Simple chat UI is not the challenge** — the real difficulty is building interfaces for advanced agents and multi-agent systems
- **Key UI problems** specific to generative apps:
  - **Streaming Markdown rendering** — displaying content as it generates, with custom components whose state changes during generation
  - **Custom blocks** — reasoning panels, tool call displays, artifacts, media players, interactive elements
  - **Performance at scale** — conversations can reach hundreds of messages; the entire UI must remain responsive
  - **UX details** — visual status indicators, animations, progress feedback during long operations
- **Fundamental chat UI library stack** (used across most projects):
  - **[markdown-it](https://github.com/markdown-it/markdown-it)** — converts Markdown syntax to HTML; handles the entire text rendering layer
  - **[highlight.js](https://github.com/highlightjs/highlight.js/)** — renders code blocks with language-specific syntax highlighting
  - **[DOMPurify](https://github.com/cure53/DOMPurify)** — **critically important security tool**; strips potentially malicious tags from LLM-generated output; prevents XSS from rendered model responses
  - **[remend](https://www.npmjs.com/package/remend)** — fixes incomplete Markdown syntax during streaming (unclosed code blocks, lists, bold markers); enables correct rendering of partial content
  - **[marked](https://marked.js.org/)** — tokenizes growing streamed content into independent blocks (paragraphs, headers, code blocks); without this, the entire message would need re-rendering on every token
  - **[Streamdown](https://github.com/vercel/streamdown)** — alternative streaming Markdown tool by Vercel (not yet production-tested by the author)
- **Example `05_02_ui`** — advanced chat interface demonstrating:
  - Streaming with special blocks for **reasoning**, **tools**, and **artifacts**
  - **Streaming pace control** — throttling displayed text speed
  - **Live / Demo modes** — demo mode tests behavior with up to 1500 messages
- **Missing features** that production interfaces typically need (beyond the example):
  - Attachment upload and display (images, documents)
  - Message content copy with preserved styles
  - Thread branching and message editing
  - Message deletion / conversation rollback
  - Response interruption (stop generating)
  - Keyword search across entire conversation
  - Sending messages during inference
  - Voice recording and playback
  - LaTeX rendering — **[KaTeX](https://katex.org/)**
  - Rich text input field — **[TipTap](https://tiptap.dev/)**
  - Diagram rendering — **[Beautiful Mermaid](https://github.com/lukilabs/beautiful-mermaid)**
  - Mind map rendering — **[Markmap](https://markmap.js.org/)**
  - Thread sharing between users
  - Sub-agent support in UI
  - Keyboard shortcut handling

## 2. Useful Tools for Agents

- **Selection caution** — many tools in the AI ecosystem are early-stage and get abandoned; exercise care when choosing, especially for AI-specific tools
- **Note**: many tools listed are JavaScript/Node ecosystem; search for equivalents in your stack or use AI to translate functionality (license permitting)

### Virtual Filesystem and Shell

- **[just-bash](https://github.com/vercel-labs/just-bash)** — virtual filesystem with bash-like commands; agent works with files without actual terminal access; models are proficient with bash commands; avoids sandbox complexity; good alternative to Files MCP

### Browser Automation

- **[agent-browser](https://github.com/vercel-labs/agent-browser.git)** — CLI tool for agents to use a **local** Chrome/Chromium browser in headless mode; simple commands agents handle easily; responses optimized for token count; supports **individual sessions** (access to login-required pages)
- **[browser-use](https://docs.browser-use.com/cloud/introduction)** / **[browserbase](https://www.browserbase.com/)** — cloud browser access; can combine with agent-browser when local browser isn't available or when scale requires cloud solutions

### Web Search and Content Extraction

- **[Firecrawl](https://www.firecrawl.dev/)** — web crawling and content extraction (recommended)
- **[Tavily](https://www.tavily.com/)** — AI-optimized web search
- **[Brave Search API](https://brave.com/search/api/)** — web search API (recommended)
- **[Exa](https://exa.ai/)** — semantic web search
- **[Jina](https://jina.ai/)** — web content reading and search (recommended)
- **Key advantage over native LLM web_search** — incomparably greater control over the search and content extraction process
- **Practical note** — consider using multiple services simultaneously due to varying limitations and effectiveness in content extraction

### Code Execution Sandboxes

- **[Daytona](https://www.daytona.io/)** — sandbox environment for agents
- **[E2B](https://e2b.dev/)** — sandbox for agents using terminal or Code Mode tools
- **[Deno Sandbox](https://deno.com/deploy/sandbox)** — alternative sandbox option
- **[secure-exec](https://github.com/rivet-dev/secure-exec)** — code execution without a full sandbox (not yet production-tested by the author)

### Audio and Voice

- **[LiveKit](https://github.com/livekit/client-sdk-js)** — advanced audio/video interfaces; features include **silence detection** and **speech start detection**; excellent for building voice agent interfaces
- **[ElevenLabs](https://elevenlabs.io/)** — top-tier text-to-speech and speech-to-text models; voice cloning; voice agent solutions; API supports **tools (e.g., MCP)** and **audio streaming**
- **[sine-waves](https://github.com/isuttell/sine-waves)** — audio waveform visualization

### Document and Text Processing

- **[TipTap](https://tiptap.dev/)** — probably the best available tooling for building Markdown editors
- **[Pyodide](https://pyodide.org)** — run Python code in browser or Node.js via WebAssembly
- **[MarkItDown](https://github.com/microsoft/markitdown)** — document parsing (PDF/DOCX) to Markdown by Microsoft; sufficient accuracy for simpler structures

### Visualization and Diagrams

- **[React Flow](https://reactflow.dev/)** — interactive diagram builder; potentially useful for multi-agent system interfaces

### Image, Video, and Model Hosting

- **[Replicate](https://replicate.com/)** — platform for image/video processing models; includes **fine-tuning** options
- **[Fal](https://fal.ai/)** — similar platform with model catalog for image/video processing and fine-tuning

### Search and Embeddings

- **[sqlite-vec](https://github.com/asg017/sqlite-vec)** — SQLite extension for storing embeddings and semantic search
- **[Qdrant](https://qdrant.tech/)** — vector search engine for larger-scale projects where database extensions aren't sufficient

### Productivity and Integration

- **[Google Workspace CLI](https://github.com/googleworkspace/cli)** — CLI tools for Google Drive interaction; useful for private agents or sandbox-based agents
- **[Chokidar](https://github.com/paulmillr/chokidar.git)** — filesystem change monitoring
- **[Commander](https://github.com/tj/commander.js#readme)** / **[zx](https://github.com/google/zx)** — terminal interaction from JavaScript/TypeScript code
- **[Croner](https://www.npmjs.com/package/croner)** — CRON scheduled task management for JavaScript/Node
- **[Winston](https://github.com/winstonjs/winston)** / **[tslog](https://github.com/fullstack-build/tslog.git)** — logging libraries

### Cloud File Management

- **[Uploadthing](https://uploadthing.com/)** — file upload service; useful for giving agents file sharing capabilities

## 3. Voice Agent Architecture

- **Example `05_02_voice`** — conversational agent with tool support (e.g., Files MCP), near real-time interaction, **silence detection**, and **interruption handling**
- **Built on LiveKit** running locally; two operating modes:

### STT/TTS Mode (3 Models)

- Activates with OpenAI key (+ optional ElevenLabs key)
- **Three separate models** in the pipeline:
  - **Speech-to-Text** — recognizes user voice commands
  - **LLM** — generates agent response (text)
  - **Text-to-Speech** — generates audio output
- **Key characteristic**: audio and text are **separate layers**; text boundary exists between them
- **Trade-off**: 3 models = 3 latency hops, but text layer is inspectable and debuggable

### Realtime Mode (1 Model)

- Activates with Gemini key (uses **[Gemini Live](https://ai.google.dev/gemini-api/docs/live-api)**)
- **Single unified model** processes all modalities natively: audio, text, images, video
- **No text boundary** — audio is first-class; interruption and silence detection built-in
- **Trade-off**: lower latency, but currently expensive; no separate text layer for inspection
- For simple interactions and commands, **Realtime mode is not needed** — STT/TTS is sufficient and more cost-effective

## 4. Search Engines and Vector Databases

- **Context**: S02E02 covered hybrid RAG with full-text + semantic search, using SQLite with **[fts5](https://www.sqlite.org/fts5.html)** and **[sqlite-vec](https://github.com/asg017/sqlite-vec)** extensions
- **Similar extensions exist for PostgreSQL** (pgvector, tsvector); full-text and semantic search are now default in most tools including **[Supabase](https://supabase.com/)** and **[Neo4j](https://neo4j.com/)**
- **Dedicated vector databases**: **[Qdrant](https://qdrant.tech/)**, **[Chroma](https://www.trychroma.com/)** — specialize in semantic (or hybrid) search
- **Classical search engines**: **[Algolia](https://algolia.com/)**, **[Elasticsearch](https://www.elastic.co)** — full-text search at scale

### Shifting Landscape of Semantic Search

- **Semantic search importance has decreased** — attention has shifted to filesystem navigation with **grep/ripgrep** tools
- **Community divided**: Claude Code relies exclusively on **grep**; Cursor uses both grep and semantic search
- **No universal answer** — match approach to project characteristics and scale

### Decision Framework (4 Tiers)

- **Tier 1 — Direct loading**: no search needed; load selected documents directly into conversation context
  - Example: ChatGPT memory likely prioritizes **speed over effectiveness** (per [analysis](https://x.com/manthanguptaa/status/2011673060844397005))
  - Vector databases not necessary in this case
- **Tier 2 — Text files + agent navigation**: agent navigates text files with high effectiveness; simple to implement
  - **Limitation**: struggles with multi-language content or diverse formats
- **Tier 3 — Hybrid search**: pure vector-only search is **no longer recommended**; always combine with full-text
  - Rule: if grep/full-text search is insufficient, **extend** it with semantic search (don't replace)
- **Tier 4 — Graph-based indexing**: content mapping + graph exploration (e.g., Neo4j) gives highest effectiveness
  - **Trade-off**: significantly higher cost — financial, logic complexity, and data processing time
  - Worth considering for advanced use cases

### Architecture Comparison (from diagram)

- **DB + Extensions** (simple):
  - Single store (SQLite/PostgreSQL) with extensions (fts5/tsvector + sqlite-vec/pgvector)
  - All data in one row: id, text, fts_index, vector
  - Hybrid query in a single SQL statement
  - **Advantages**: no sync needed, one transaction, one source of truth
  - **Limitations**: limited scale
- **DB + Search Engine + Vector DB** (complex):
  - Three separate stores: PostgreSQL (records + meta), Elasticsearch (inverted index), Qdrant (vector index)
  - Synchronized by shared ID
  - Parallel queries → RRF/re-rank merge → enrich from primary DB
  - **Advantages**: massive scale, best recall
  - **Risks**: three stores must stay in sync; shared ID is the contract; failure = stale results

## 5. Building Custom Tools and Solutions

- **Repeating patterns emerge** when working with generative AI — some universal (solved by existing tools), some individual (require custom solutions)
- Custom solutions include: **MCP servers**, **CLI tools**, **dedicated API applications** for agents

### Areas for Custom Tooling

- **Prompt libraries** — reusable prompts assigned to keyboard shortcuts or agent skills; even a small library used repeatedly is extremely valuable; consider macros, browser extensions, phone shortcuts for triggering them
- **File management** — tools for agents to work with documents in filesystem or external services (Notion, Google Drive)
- **Cloud access** — file upload/download and sharing capabilities; use **[Uploadthing](https://uploadthing.com/)** or custom servers
- **Document generation** — not full content generation but elements: images, tables, visualizations, document templates, ad creatives that LLM fills in automatically
- **Image/audio/video processing** — even simple AI integrations add value if you work with voice notes, photos, or video; example: **[Audiopen](https://www.audiopen.ai/)** — a polished tool focused on a single task
- **Sandboxes** — agents executing actions with potential negative effects are now common; prepare sandboxes; consider a **dedicated machine** (e.g., old laptop) for actions that cloud servers may block by IP
- **CLI/MCP integrations** — wrapping daily tools/services as CLI or MCP enables easy portability between agents, team sharing, and client distribution; start with even one integration that immediately becomes part of your workflow
- **Custom UI** — building your own chat interface for multi-agent collaboration or management panel; valuable when you need **high personalization**; can focus on specific areas rather than the entire system

### Practical Advice

- **Start small** — even creating a single MCP/CLI integration that you use daily teaches you to spot the need for more
- **"Click through" all tools** — even if not using them now, awareness helps when the need arises later
- **Tools address clearly defined, repeatable problems** — example: voice interface design, where most audio processing logic has existed for years (LiveKit adapts this well to the agent context)

## 6. Lessons from Failed AI Projects (from video)

- **Gartner prediction (July 2024)**: at least 30% of generative AI projects will be abandoned after proof of concept by end of 2025
  - 43% due to **low data quality**
  - Also: unclear business value, unexpectedly growing costs, insufficient risk management

### Case Studies

- **McDonald's + IBM Drive-Thru (2021-2024)** — 3 years, 100+ restaurants, 85% accuracy; every 6th order wrong; noise, accents, overlapping voices; ended July 2024
  - **Lesson**: full automation of live customer conversation was too ambitious; **support the worker instead** — AI suggests, human confirms
- **Chevrolet Dealer Chatbot (Dec 2023)** — prompt injection: user told bot to agree with everything and end responses with "this offer is legally binding"; bot agreed to sell car for $1
  - **Lesson**: textbook prompt injection; access to actions and resources must be **controlled programmatically**, not just by prompt rules
- **Air Canada Chatbot (Nov 2022)** — hallucinated a bereavement discount procedure that didn't exist; customer relied on it; tribunal ruled company responsible for chatbot statements
  - **Lesson**: model needed **document routing**, not open generation; anchor responses in sources
- **Klarna AI (Feb 2024 - 2025)** — initial triumph: 2/3 of all customer conversations, equivalent to 700 employees, projected $40M savings; then quality dropped, customers complained, CEO admitted over-focus on efficiency
  - **Lesson**: full AI control over customer communication is risky; build **hybrid model** (AI handles simple, humans handle complex)
- **DPD Chatbot (Jan 2024)** — after system update, bot wrote poems about being useless, swore, called DPD "worst delivery company"; zero jailbreak protection
  - **Lesson**: every public chatbot **will** be tested by someone trying to break it; prepare defenses

### Three Essential Questions Before Deploying AI

1. **What happens when the system is wrong?** — if the answer involves wrong info, financial loss, or unverified publication → **human-in-the-loop is required now**
2. **Does the model need to generate, or just select?** — generation = open hallucination field; selection (routing, classification, prioritization) = different risk level entirely
3. **Do you really need this?** — 43% of abandoned projects had data quality issues; if you don't have the data, no model will fix that
