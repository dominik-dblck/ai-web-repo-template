==========================================================================================
title: ai_devs_4_query_awareness-9a1f8376-3.png
diagram:
name: QUERY AWARENESS — EXPERT VS NAIVE
categories:

- id: naive_user
  name: NAIVE USER
  items:
- id: prompt
  category: user_query
  text: '"What do I have today?"'
- id: tool_resolution
  category: agent_tool_resolution
  tools:
- Gmail
- Slack
- Files
- Calendar
- id: result
  category: outcome
  text: "No tools invoked. Agent lacks grounding — query resolves to ambiguous intent, likely a generic or empty response."
- id: expert_user
  name: EXPERT USER
  items:
- id: prompt
  category: user_query
  text: '"Check my messages in Gmail and Slack, then look at my day plan file."'
- id: tool_resolution
  category: agent_tool_resolution
  tools_invoked:
- Gmail
- Slack
- Files
  tools_not_invoked:
- Calendar
- id: result
  category: outcome
  text: "3 tools invoked. Agent has explicit grounding — query maps directly to concrete tool calls and returns a structured summary."
  notes:
- "→ The query itself is the prompt. Naming sources, tools, and files isn’t politeness — it’s context injection that determines which tools fire."

==========================================================================================
title: ai_devs_4_adoption-892e49ad-f.png
diagram:
name: AI ADOPTION — WHY IT'S HARD, WHAT TO DO
sections:

- name: PRESSURES
  items:
- name: ORGANIZATIONAL
  items:
- Process change
- Existing habits
- Additional costs
- name: TECHNICAL
  items:
- Non-deterministic models
- Infeasible edge cases
- Unprofitable solutions
- name: HUMAN
  items:
- New skills required
- Varying AI literacy
- Different query styles
- name: CORE CHALLENGE
  items:
- All three forces compound each other
- name: COMPLEMENTARY STRATEGIES
  items:
- id: "01"
  name: Build it right
  items:
- Human in the loop
- Human-AI cooperation
- Fallbacks & reliability
- Security by design
- id: "02"
  name: Lead by example
  items:
- Curiosity over mandates
- Bottom-up adoption
- Discover actual needs
- Visible wins first
- id: "03"
  name: Redesign the workflow
  items:
- Build around AI, not on top
- New handoffs & ownership
- Feedback loops
- Rethink responsibilities
- id: "04"
  name: Prove it small, scale or don't
  items:
- High-value, low-risk pilots
- Quick wins build trust
- Small by design is valid
- Measure before expanding
  notes:
- Complementary, not competing. Skip any path and the rest become fragile.

==========================================================================================
title: agent-1773399141.gif
diagram:
sections:

- name: DOCUMENT
  items:
- id: B1
  type: PARAGRAPH
- id: B2
  type: PARAGRAPH
  anchor: '"...roundabout phrasing here..."'
- id: B3
  type: PARAGRAPH
  anchor: '"...ambiguous escalation guidance..."'
- id: B4
  type: PARAGRAPH
- id: B5
  type: PARAGRAPH
  anchor: '"...unclear ownership..."'
- name: LLM AGENT
  items:
- name: ADD_COMMENT OR SKIP
  items:
- block: b1
  action: no issues found, skip
- type: SUGGESTION
  severity: LOW
  text: Use more direct phrasing to keep the sentence moving.
  anchor: '"...roundabout phrasing here..."'
- type: WARNING
  severity: HIGH
  text: Escalation criteria are ambiguous — reader can't determine when to act.
  anchor: '"...ambiguous escalation guidance..."'
- type: NOTE
  severity: MEDIUM
  text: Consider adding a concrete example to clarify the expected behavior.
  anchor: '"...ambiguous escalation guidance..."'
- block: b4
  action: no issues found, skip
- type: SUGGESTION
  severity: MEDIUM
  text: Assign explicit ownership — "the team" is too vague for an action item.
  anchor: '"...unclear ownership..."'
  flow:
- actor: DOCUMENT
  step: BLOCK BY BLOCK
  content: review each block and add_comment or skip

==========================================================================================
title: ai_devs_4_review-64de189a-3.png
diagram:
name: 04_05_REVIEW — ARCHITECTURE
legend:

- Browser
- Server
- LLM
  sections:
- name: UI
  component:
  runtime: Browser
  label: SVELTE 5
  title: Pick document, prompt, and review mode
  inputs:
- label: DOCUMENT
  value: Text document
  note: Markdown file to be reviewed
- label: PROMPT
  value: Review prompt
  note: Instructions that guide the agent's focus
- label: MODE
  value: Review mode
  note: Paragraph by paragraph, or entire document at once
- name: PARSE
  component:
  runtime: Server
  label: MARKDOWN.JS
  title: Document split into typed fragments
  source: SOURCE DOCUMENT
  fragments:
- HEADING
- PARAGRAPH
- CODE
- LIST ITEM
- PARAGRAPH
- TABLE
- PARAGRAPH
  legend:
- reviewable
- skipped
- name: REVIEW
  component:
  runtime: Server
  label: REVIEW-ENGINE.JS — CONCURRENCY 4
  title: Worker queue — 4 blocks in flight at once
  workers:
- worker: WORKER 1
  items:
- Heading done
- Paragraph active
- worker: WORKER 2
  items:
- Paragraph done
- Paragraph active
- worker: WORKER 3
  items:
- List item done
- waiting
- worker: WORKER 4
  items:
- Blockquote done
- waiting
- name: REVIEW
  component:
  runtime: LLM
  label: AGENT.JS — RESPONSES API, MAX 12 TURNS
  title: Decide: add comment or skip
  flow:
- step: INPUT
  content:
- Block text
- injected by server
- step: DECISION
  content:
- Call add_comment?
- 0, 1, or 2 times
- step: EXIT
  content:
- No function_call
- loop ends
  tool:
  name: add_comment
  fields:
- block_id
- quote — exact text from block
- comment
- type — suggestion | warning | note
- severity — low | medium | high
- suggestion — replacement optional
- name: SUMMARY
  component:
  runtime: LLM
  label: SEPARATE CALL — NO TOOLS
  title: Collected comments → 1–2 sentence summary
  flow:
- step: INPUT
  content:
- All collected comments
- step: OUTPUT
  content:
- Plain text, 1–2 sentences
- name: REVIEW OUTPUT
  component:
  runtime: Browser
  label: INLINE COMMENT UI
  title: Comments anchored to quoted text
  quoted_text: The API can often be integrated in a few hours if the team already has a basic backend and knows where the customer data is coming from.
  comment:
  text: Use more direct phrasing
  type: Suggestion
  severity: Low
  diff:
- "- knows where the customer data is coming from"
- "+ knows the source of the customer data"
  actions:
- Accept
- Reject
- Resolve
- name: USER ACTIONS
  subsections:
- runtime: Browser
  label: PER-COMMENT
  title: Comment actions
  actions:
- Accept
- Reject
- Resolve
- Revert
- Convert
- Accept / Reject all
- runtime: Browser
  label: PER-BLOCK
  title: Block actions
  actions:
- Edit block
- Re-run block
- Export .md
  flow:
- step: UI
  content: Pick document, prompt, and review mode
- step: PARSE
  content: Document split into typed fragments
- step: REVIEW
  content: Worker queue — 4 blocks in flight at once
- step: REVIEW
  content: Decide: add comment or skip
- step: SUMMARY
  content: Collected comments → 1–2 sentence summary
- step: REVIEW OUTPUT
  content: Comments anchored to quoted text
- step: USER ACTIONS
  content: per-comment and per-block actions

==========================================================================================
title: ai_devs_4_issues-c9618cc5-0.png
diagram:
name: AI AGENT — SECURITY RISKS
notes:

- Trusted environment · Real failure modes
  legend:
- CRITICAL — DATA OR INTEGRITY
- OPERATIONAL — BEHAVIORAL
  sections:
- name: DATA LEAK
  text: Internet access → internal data sent outside
  category: CRITICAL — DATA OR INTEGRITY
  flow:
- actor: INTERNAL DB
- actor: AGENT
- actor: EXTERNAL
  notes:
- Solid = trusted path · Dashed = data escaping boundary via web tool call
- name: DESTRUCTION
  text: Code execution → data deleted or corrupted
  category: CRITICAL — DATA OR INTEGRITY
  flow:
- actor: AGENT
- actor: CODE RUNNER
- actor: DATA SOURCE
  notes:
- rm -rf, DROP TABLE, overwrite — no confirmation step, no rollback
- name: SILENT DRIFT
  text: No human review → errors accumulate unnoticed
  category: CRITICAL — DATA OR INTEGRITY
  items:
- run: "#1"
  text: correct output
- run: "#2"
  text: minor deviation
- run: "#3"
  text: wrong, undetected
- run: "#4"
  text: compounding error
  blocked_reviewer: HUMAN
  notes:
- Each iteration drifts further · Reverting requires knowing where it started going wrong
- name: TOOL MISFIRE
  text: send_email / calendar invite → wrong recipients
  category: OPERATIONAL — BEHAVIORAL
  tool: SEND_EMAIL
  items:
- [alice@company.com](mailto:alice@company.com)
- [bob@company.com](mailto:bob@company.com)
- recipient: [external@partner.com](mailto:external@partner.com)
  status: UNINTENDED
  notes:
- Agent resolves recipient from context — one wrong inference, data leaves org
- name: MISLEAD
  text: Chatbot suggests action that bypasses procedure
  category: OPERATIONAL — BEHAVIORAL
  flow:
- actor: USER
  content: '"The server is slow, what should I do?"'
- actor: CHATBOT
  content: '"Try: restart production server"'
  skipped_steps:
- Change approval
- Backup verification
- Team notification
  notes:
- Model has no awareness of org procedures — confident suggestion ≠ safe suggestion

==========================================================================================
title: ai_devs_4_chat_ui-dda8757b-6.png
dashboard:
title: CHAT AS AN ORCHESTRATOR OF BUSINESS PROCESSES
conversation:

- role: USER
  label: USER
  text: Review Spring Launch and show sales around its send date.
- role: ASSISTANT
  label: ASSISTANT
  text: Spring Launch outperformed the February campaign. I’ve opened the campaign detail and the relevant sales window below.
  panels:
- title: CAMPAIGN DETAIL
  name: Spring Launch
  badge: RESEND
  top_metrics:
- label: SENT
  value: Mar 3, 2026
- label: AUDIENCE
  value: 4,820
- label: OPEN RATE
  value: 38.4%
- label: CLICKS
  value: 12.1%
  actions:
- Compare campaigns
- View sales window
- Create coupon
- Add follow-up todo
- title: CAMPAIGN COMPARISON
  items:
- campaign: SPRING LAUNCH
  metrics:
- label: OPEN
  value: 38.4%
- label: CONV.
  value: 89
- campaign: FEB PRODUCT UPDATE
  metrics:
- label: OPEN
  value: 28.6%
- label: CONV.
  value: 61
- title: SALES ANALYTICS
  subtitle: Mar 3–6 Window
  badge: STRIPE
  top_metrics:
- label: TOTAL REVENUE
  value: $4,240
  chart:
  x_axis:
- MAR 3
- MAR 6
  highlighted_value: $1.8k
  actions:
- Inspect Cohort
- Create coupon for top product
- Open in Stripe ↗

==========================================================================================
title: ai-devs_4_mcp_apps_design-7b940be1-a.png
diagram:
name: REMOTE MCP APPS ARCHITECTURE
legend:

- CLIENT LAYER
- ORCHESTRATION
- PROTOCOL & BUSINESS LOGIC
  sections:
- name: PRESENTATION
  items:
- name: Chat Host
  text: Manages chat UX & security
  embedded_component:
- Embedded Business App
  notes:
- POST /api/chat
- name: HOST BACKEND ENVIRONMENT
  items:
- name: Backend API
  category: ROUTING
  text: Context & Session
- name: AI Agent
  category: LLM
  text: Decides to call tools
- name: MCP Runtime
  category: CLIENT
  text: Executes tools/resources
  flow:
- actor: Backend API
  step: route context & session
- actor: AI Agent
  step: decides to call tools
- actor: MCP Runtime
  step: executes tools/resources
  notes:
- MCP Protocol Request
- name: REMOTE BUSINESS SERVICES
  items:
- name: Remote MCP Server
  category: SERVER
  text: Exposes tools & UI resources
- name: Business Domain
  category: SOURCE OF TRUTH
  text: Stripe, Resend, DB, internal APIs
  flow:
- actor: Remote MCP Server
  step: exposes tools & UI resources
- actor: Business Domain
  step: source of truth
  notes:
- Tool Result + UI Resource URI
  flow:
- actor: Chat Host
  step: POST /api/chat
- actor: Backend API
  step: passes context & session
- actor: AI Agent
  step: decides to call tools
- actor: MCP Runtime
  step: executes tools/resources
- actor: AI Agent
  step: MCP Protocol Request
- actor: Remote MCP Server
  step: accesses business services
- actor: Business Domain
  step: returns tool result and UI resource metadata
  notes:
- "↑ Context return: The Host renders the embedded app using the returned UI resource metadata, isolating execution mapping behind the AppBridge. The Remote MCP Server provides portability to Any MCP Client e.g. Claude."
