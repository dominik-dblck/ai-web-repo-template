# S04E05 — Designing Internal Company AI Solutions

## 1. Applying Generative AI Within Organizations

- **Two paths**: deploy external tools/platforms OR build custom solutions — this article focuses on the latter, where the engineering role is significantly larger
- **The core problem is "change"** — not the technology itself, but adopting it within existing structures
- **Three compounding pressures** make AI adoption hard:
  - **Business** — process changes carry costs (implementation + ongoing maintenance), legal/compliance concerns (provider choice, cloud solutions like Amazon Bedrock, Azure), need to communicate technical capabilities AND limitations to business stakeholders
  - **Cultural** — even simple AI tools require engagement across organizational levels; bottom-up initiatives work best (internal workshops, experience sharing in team meetings)
  - **Technical/Product** — familiar engineering activities extended with model selection, evaluation, agent architecture, optimization, and the acknowledgment that **100% accuracy is currently unlikely**
- **All three forces compound each other** — addressing only one leaves the others fragile
- **Query awareness gap** — AI literacy varies even among technical users
  - **Expert user**: "Check my messages in Gmail and Slack, then look at my day plan file" — 3 tools invoked, explicit grounding
  - **Naive user**: "What do I have today?" — no tools invoked, ambiguous intent, generic or empty response
  - The query itself IS the prompt; naming sources, tools, and files is context injection that determines which tools fire
  - Models are improving at interpreting vague queries, but when it's not feasible or **not cost-effective**, seek alternative paths
- **Four complementary adoption strategies** (skip any one and the rest become fragile):
  1. **Build it right** — human in the loop, human-AI cooperation, fallbacks and reliability, security by design
  2. **Lead by example** — curiosity over mandates, bottom-up adoption, discover actual needs, visible wins first
  3. **Redesign the workflow** — build around AI not on top, new handoffs and ownership, feedback loops, rethink responsibilities
  4. **Prove it small, scale or don't** — high-value low-risk pilots, quick wins build trust, small by design is valid, measure before expanding

## 2. Lightweight AI Tools — Documents, Prompts, and Skills

- **AI deployment can be as simple as a well-crafted document** — not every solution needs an agent or custom application
- **Three practical examples**:
  - **Checklist** — a document listing activities with descriptions for repeatable processes (e.g., marketing content review: internal linking, SEO image descriptions, category-specific sections); normally manual, time-consuming, easy to miss items; AI verification adds significant value even when human involvement remains necessary
  - **Onboarding** — comprehensive reference document for new employees or cross-department colleagues; links to knowledge resources, responsible persons for processes; AI helps here because new employees may not know the exact search phrase, while AI can match even distant queries to the right content
  - **Style guide** — real example from AI_devs: a single prompt describing a consistent visual style for all course graphics; shared on Slack for anyone to use with Nano Banana 2; a simple thing that affects perception of the entire project
- **Even the smallest AI-related activities bring significant value** — time savings, increased work comfort, maintained standards
- **Hard to notice the need for simple solutions** — people simply don't think about it; yet crafting these files (like a style description) still requires experience working with models
- **AGENTS.md and Skills as precedent** — simple instruction sets that work in programming apply equally well outside it; the concept of documents/prompts gains new meaning when viewed through this lens

## 3. When Documents Are Not Enough — Custom Tools

- **Documents alone are fragile** — agents can interpret them freely, combined with user queries you can't control; this creates justification for building dedicated tools
- **Consider an internal MCP server or independent tool** fully tailored to a specific process
- **AI makes building cost-effective** — even tools used for a short time can be worth building; the cost of creation has dropped dramatically
- **04_05_review example** — a content review agent demonstrating the custom tool approach:
  - **Core mechanic**: processes paragraphs in a text document; agent receives each paragraph and decides whether to comment using **add_comment** tool; may leave 0, 1, or multiple comments per block
  - **UI is critical** — "the same effect can be achieved by pasting into ChatGPT" but you won't get convenient management of suggestions; the visual interface makes comments noticeable and actionable
  - **5-step workflow**:
    1. User selects document and prompt
    2. Document is split into typed fragments (heading, paragraph, code, list item, table — some reviewable, some skipped)
    3. Each fragment checked by agent via worker queue (concurrency 4, max 12 turns per block)
    4. Agent generates end summary from collected comments
    5. User can accept/reject suggestions or request re-check with a short prompt
  - **add_comment tool fields**: block_id, quote (exact text), comment, type (suggestion/warning/note), severity (low/medium/high), suggestion (replacement, optional)
  - **User actions**: per-comment (accept, reject, resolve, revert, convert) and per-block (edit, re-run, export .md)

## 4. Extensibility Through Tool Composition

- **The same interface can address entirely different processes** by changing the agent's tools — enormous flexibility
- **Progressive capability levels**:
  - **Simple prompts** — rely on model's knowledge and skills (corrections, transformations like translation)
  - **Internet/domain access** — enables grounding and fact-checking
  - **Additional documents** (e.g., internal blog page index) — enables internal linking (useful for readers and SEO)
  - **External service integrations** — enables routing information (e.g., agent suggests forwarding a complaint fragment to the appropriate department)
- **Each level may require UI or logic changes**, but all rest on the same core concept
- **Experiment even at small scale** — demonstrating a tool to colleagues immediately surfaced new use cases no one had considered; showing possibilities triggers discovery of needs
- **Practical adoption tip**: show the tool to real users, suggest possible applications in their domain (e.g., marketing, platform integration); during conversations, select areas where the solution applies; new tool needs emerge naturally from seeing what's possible

## 5. Data Privacy and Error Consequences

- **First question in any corporate AI deployment**: security and data privacy
- **Cloud instances (Bedrock, Azure) provide data isolation** — but internal policies and client contracts are the ultimate authority
- **Data isolation does NOT mean data safety** — even with a trusted LLM provider, the model itself cannot be trusted
- **Five concrete risk categories**:
  - **Data leak** — agent with internet access can send internal data outside the organization boundary
  - **Data destruction** — agent with code execution can delete or corrupt data sources (rm -rf, DROP TABLE, overwrite — no confirmation, no rollback)
  - **Silent drift** — without human review, errors accumulate unnoticed across iterations; each run drifts further; reverting requires knowing where it started going wrong
  - **Tool misfire** — send_email to wrong recipient, calendar invite to external person; one wrong inference and data leaves the org
  - **Misleading advice** — chatbot connected to company KB suggests action that bypasses established procedures (e.g., "restart production server" without change approval, backup verification, team notification); **confident suggestion does not equal safe suggestion**
- **Permission restriction is essential** — throughout the course: limit agent permissions, physically prevent certain actions
- **Sandbox caution** — agents find clever workarounds; coding agents denied .env access write scripts to retrieve it
- **Model behavioral awareness** — [System Card: Claude Opus 4.6](https://www-cdn.anthropic.com/6a5fa276ac68b9aeb0c8b6af5fa36326e0e166dd.pdf) and [Eval Awareness](https://www.anthropic.com/engineering/eval-awareness-browsecomp) show models can detect they're being tested and adjust behavior to pass tests while hiding actual capabilities
- **Current LLMs are potentially capable of bypassing safeguards**
- **Don't assume anything is impossible** — invest time analyzing options; even solutions requiring human involvement (preventing full automation) still deliver significant value

## 6. Working with Service and Tool Context — MCP Apps

- **The universal problem**: everyone spends time moving data between tools, gathering information from multiple sources, switching between services — more time spent context-switching than doing actual work
- **Concrete cross-department examples**:
  - **Customer support** — finding account settings in admin panel
  - **Marketing** — monitoring campaign effectiveness across tools and documents
  - **Sales** — keeping CRM updated (always gaps from various causes)
  - **Product development** — gathering information from many places, including tools they don't use frequently
- **Naive approach fails**: building an agent that does everything via user commands hits hallucination risk, prompt injection, and technical limitations of data interaction
- **MCP Apps / generative UI as the solution** — return to S03E05 concepts; interactive interfaces that combine data and actions from multiple tools
- **04_05_apps example** — chat interface with dedicated business process interfaces:
  - Not simple function mapping, but **business-process-aligned interfaces** (sales monitoring, product management, project task management)
  - Example: user asks "Review Spring Launch and show sales around its send date" → agent opens campaign detail panel (Resend data) + sales analytics panel (Stripe data) with comparison and actions
  - **Deterministic actions** available through UI (code-handled, not LLM-decided): "Compare campaigns", "View sales window", "Create coupon", "Add follow-up todo", "Open in Stripe"
- **MCP server portability** — remote MCP server means the same functionality connects to any MCP-supporting client (including Claude.ai); can even be provided to external clients working in their own interfaces
- **MCP Apps don't replace tools** — they facilitate access to selected functionalities or data; buttons like "Add follow-up todo" or "Open in Stripe" redirect to the primary tool for detailed work
- **Beyond chat** — MCP Apps can appear in other application areas, not just chat interfaces; AI and agents can be present anywhere without requiring free-text message input

## 7. Generative Interface Architecture

- **Three-layer architecture** for applications using generative interfaces:
  - **Client Layer (Presentation)** — chat host (manages UX and security), renders embedded business apps
  - **Host Backend (Orchestration)** — Backend API (routing, context, session) → AI Agent (decides tool calls) → MCP Runtime (executes tools/resources)
  - **Remote Business Services** — Remote MCP Server (exposes tools and UI resources) → Business Domain (source of truth: Stripe, Resend, DB, internal APIs)
- **Data flow**: Chat Host → POST /api/chat → Backend API → AI Agent → MCP Runtime → MCP Protocol Request → Remote MCP Server → Business Domain → Tool Result + UI Resource URI → back to host for rendering
- **Host renders embedded apps** using returned UI resource metadata; execution mapping isolated behind AppBridge
- **Remote MCP Server provides portability** — any MCP client can connect (e.g., Claude.ai)
- **One MCP server connecting to multiple services** is rare but permissible — approach with caution as it significantly increases server complexity and potentially reduces flexibility
- **Generative interfaces are complementary to direct agent engagement** — not a replacement; many indicators suggest generative interfaces will gain popularity, though currently at an early stage of development

## 8. Interactive Interfaces as Value Multipliers

- **Three key capabilities** of interactive generative interfaces:
  1. **Visual data presentation** — significantly more comfortable to review than text-only responses
  2. **Deterministic actions** — interface is code-driven, providing reliable action execution (unlike LLM-decided actions)
  3. **Multi-tool aggregation** — combine data and actions from multiple tools, significantly simplifying repetitive tasks at specific roles/positions
- **The "ChatGPT problem"** — pasting content into a general chat gives you raw output but no way to manage, review, or act on suggestions conveniently; custom UI transforms raw AI output into a workflow
- **Design for the process, not the technology** — the example review tool's power comes from aligning with how people actually review documents (inline comments, accept/reject), not from the underlying AI capability
- **Small experiments trigger adoption cascades** — showing a prototype to real users in their domain surfaces needs no one anticipated; each demonstrated tool creates demand for the next one
