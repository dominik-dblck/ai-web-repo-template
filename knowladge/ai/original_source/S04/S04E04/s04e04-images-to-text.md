==========================================================================================
title: ai_devs_4_knowledge_scope-06622f93-8.png
diagram:
name: FROM DAILY LIFE TO AGENTIC SCOPE
sections:

- layer: LAYER 1
  name: Daily life areas
  items:
- Messages
- Events
- Email
- Coding
- Browsing
- Shopping
- Marketing
- Business
- Finance
- Health
- Training
- Entertainment
- Travel
- Learning
- Documents
- News
- Hobbies
- layer: LAYER 2
  name: Regularly used tools
  items:
- Communicators
- Mailbox
- Calendars
- Code Editor
- Note Taking
- Task Manager
- Docs / Sheets
- Coding Agents
- Social Media
- Shopping
- Entertainment
- layer: LAYER 3
  name: Activities where AI applies
  items:
- Learning
- Creating
- Research
- Scheduling
- Managing
- Reporting
- Coding
- Fun
- Health
- Messaging
- layer: LAYER 4
  name: Personal Knowledge System
  flow:
- from: LAYER 1
  step: IDENTIFY RECURRING PATTERNS
  to: LAYER 2
- from: LAYER 2
  step: WHERE CAN AI HELP?
  to: LAYER 3
- from: LAYER 3
  step: REMOVE WHAT YOU WON'T CONNECT
  to: LAYER 4

==========================================================================================
title: ai_devs_4_knowledge_structure-41f3bac5-6.png
diagram:
name: PERSONAL KNOWLEDGE BASE — STRUCTURE
sections:

- id: "01"
  name: Me
  description: Who I am, how I operate.
  items:
- name: Identity
  text: values, direction, self-knowledge
- name: Preferences
  text: tastes, style, aesthetics
- name: Wellbeing
  text: health, routines, training
- name: Thinking
  text: mental models, decision frameworks
- name: Process
  text: system for growth & relevance
- id: "02"
  name: World
  description: People, places, things I interact with
  items:
- name: People
  text: relationships, collaborators
- name: Places
  text: cities, routes, spots that matter
- name: Services
  text: tools, apps, platforms I rely on
- name: Sources
  text: podcasts, blogs, newsletters
- id: "03"
  name: Craft
  description: What I do, learn, and create
  items:
- name: Ideas
  text: raw sparks, thinking inbox
- name: Projects
  text: Alice, eduweb, Easytools, ovoment
- name: Knowledge
  text: AI, programming, design — by theme
- name: Lab
  text: prototypes, POCs, experiments
- name: Shared
  text: articles, newsletters, workshops
- id: "04"
  name: Ops
  description: How things should be done.
  items:
- name: Tasks
  text: Linear, triage, sprint rules
- name: Calendar
  text: scheduling, briefing template
- name: Email
  text: labeling, triage, response rules
- name: Newsletter
  text: format, flow, edition staging
- name: Research
  text: sources, depth, extraction
- name: Design
  text: brand, visual standards, assets
- name: Development
  text: code standards, CI/CD, review
- name: Marketing
  text: channels, messaging, playbooks
- name: Publishing
  text: idea → release flow
- name: Config
  text: infra, deployment, sync
- id: "05"
  name: System
  description: The machine layer
  items:
- name: Status
  text: location, device, weather, battery
- name: Agents
  text: workspaces, decision logs, coordination
  relationships:
- parent: KNOWLEDGE BASE
  children:
- Me
- World
- Craft
- Ops
- System
  legend:
- Me
- World
- Craft
- Ops
- System

==========================================================================================
title: ai_devs_4_knowledge_contents-850ed061-0.png
diagram:
name: NOTE ANATOMY — STRUCTURE & CONTENT
note:
path: Craft / Knowledge / AI / transformer-architecture.md
frontmatter:
title: '"Transformer Architecture"'
description: '"Core concepts of the transformer model and its role in modern AI"'
status:
value: growing
comment: seed → growing → evergreen → archived
publish:
value: draft
comment: draft · review · live · updated
tags:

- ai
- architecture
- deep-learning
- transformers
  access.read:
  value: all
  comment: inherited from Craft/Knowledge default
  access.write:
  value:
- adam
- ellie
- tony
  comment: inherited
  attention:
  who: adam
  reason: '"initial research done, review before expanding"'
  rendered_note:
  title: Transformer Architecture
  labels:
- growing
- draft
- ai
- architecture
- deep-learning
- transformers
  sections:
- name: OVERVIEW
  content: The transformer is a sequence-to-sequence architecture built entirely on [[Craft/Knowledge/AI/attention-mechanism]] rather than recurrence. Introduced in Attention Is All You Need (2017), it became the foundation for nearly every modern LLM. Its key insight: global context can be computed in parallel using self-attention, bypassing the bottleneck of RNNs.
- name: CORE COMPONENTS
  content: The architecture splits into an encoder and decoder stack. Each layer applies multi-head attention followed by a feed-forward network with residual connections. Positional encodings inject sequence order since the model has no built-in notion of position — see [[Craft/Knowledge/AI/positional-encoding]]. Scaling behavior is documented in [[Craft/Knowledge/AI/scaling-laws]].
- name: RELEVANCE TO CURRENT WORK
  content: Most of the agent infrastructure in [[Craft/Projects/Alice]] depends on transformer-based models. Understanding the context window limits is directly tied to [[Craft/Knowledge/AI/context-window-limits]]. Tokenization edge cases that affect multilingual prompts are covered in [[Craft/Knowledge/AI/tokenization-failures]].
- name: SOURCE
  content: Primary: [[World/Sources/andrej-karpathy]] — lecture series on transformers. Cross-referenced with [[World/Sources/papers-with-code]].
  related_notes:
- path: "[[Craft/Knowledge/AI/attention-mechanism]]"
  note: the core operation this architecture is built on
- path: "[[Craft/Knowledge/AI/scaling-laws]]"
  note: how performance scales with model size
- path: "[[Craft/Knowledge/AI/tokenization-failures]]"
  note: conflicts with multilingual claims here, worth revisiting
- path: "[[Craft/Knowledge/AI/context-window-limits]]"
  note: downstream constraint for agent design
- path: "[[Craft/Projects/Alice]]"
  note: active project that depends on this knowledge
  attention_banner: ATTENTION adam — initial research done, review before expanding. Set by ellie after HN scan on 2026-03-06.
  legend:
- frontmatter key
- string value
- keyword value
- comment / inherited
- wikilink
- attention

==========================================================================================
title: ai_devs_4_markdown_vs-8af9d115-9.png
diagram:
name: MARKDOWN — WHERE IT WORKS, WHERE IT DOESN'T
sections:

- name: Works well
  items:
- text: Native to AI
  label: agents
- text: Plain text — full control
  label: tooling
- text: Frontmatter as metadata
  label: agents
- text: Git-friendly
  label: tooling
- text: Wikilinks & graph traversal
  label: knowledge base
- text: Offline, portable, durable
  label: knowledge base
- name: Falls short
  items:
- text: No real-time collaboration
  label: team
- text: No granular permissions
  label: team
- text: No comments or review mode
  label: team
- text: No rich embeds or databases
  label: tooling
- text: Lossy conversion to Notion / Docs
  label: tooling
- text: Rendering varies by tool
  label: tooling
  table:
  columns:
- SCENARIO
- FORMAT
  rows:
- scenario: Personal knowledge base & agent memory
  format: .md
- scenario: Agent ops playbooks & instruction files
  format: .md
- scenario: Code documentation & READMEs
  format: .md
- scenario: Published content drafts
  format: .md
- scenario: Multi-author team docs & briefs
  format: Notion / Docs
- scenario: Client-facing documents & proposals
  format: Notion / Docs
- scenario: Project management & task tracking
  format: Linear / Notion
  notes:
- "→ Agent-readable? Use .md. Team editing, comments, permissions? Use Notion or Docs. Pick the boundary once per area — don't mix."
  legend:
- agents
- knowledge base
- team
- tooling

==========================================================================================
title: ai_devs_4_external_links_practices-32d5ae17-5.png
diagram:
name: IMAGE LINKS IN MARKDOWN — WHAT ACTUALLY BREAKS
sections:

- id: "01"
  name: Agent calls a tool — local path is meaningless outside the machine
  content:
  tool_call:
  code: |
  send_email({
  to: "[client@company.com](mailto:client@company.com)",
  body: "Here's the diagram:",
  image: "./assets/diagram.png"
  })
  error: "Error: Cannot resolve file path. URL expected."
  note: The tool runs on a remote server. ./assets/ doesn't exist there — the call fails silently or throws.
- id: "02"
  name: Image in email or remote UI — broken render
  panels:
- title: LOCAL PATH
  items:
- "From [agent@system.ai](mailto:agent@system.ai)"
- "Subj Weekly report"
- "Hi — here's the chart:"
- "./assets/chart.png"
- title: REMOTE URL
  items:
- "From [agent@system.ai](mailto:agent@system.ai)"
- "Subj Weekly report"
- "Hi — here's the chart:"
- "chart.png — 340×220"
  note: Email clients, Slack previews, dashboards — none can reach into your local filesystem.
- id: "03"
  name: Content copied or quoted — image reference dies
  panels:
- title: PASTED INTO ANOTHER DOC
  items:
- "Architecture overview"
- "The system uses a three-layer approach:"
- "file:///Users/adam/vault/assets/arch.png"
- "Each layer handles a specific concern..."
- title: PASTED WITH REMOTE URL
  items:
- "Architecture overview"
- "The system uses a three-layer approach:"
- "arch.png — 800×450"
- "Each layer handles a specific concern..."
  note: When an agent quotes your note elsewhere — or you paste it yourself — local paths become dead strings.
- id: "04"
  name: Guessable URL — anyone can enumerate your assets
  panels:
- title: PREDICTABLE PATTERN
  items:
- "cdn.example.com/images/001.png"
- "cdn.example.com/images/002.png"
- "cdn.example.com/images/003.png"
- "..."
  callout: "Sequential IDs + full enumeration in seconds"
- title: TOKEN-BASED PATH
  items:
- "cdn.example.com/a8f3c9e2/diagram.png"
- "cdn.example.com/7b2d41f0/chart.png"
- "cdn.example.com/c1908a3d/banner.png"
  callout: "Knowing the URL is the permission"
  note: Token-based paths make each URL a capability. No pattern to guess, no sequence to walk.
- id: "05"
  name: No indexing protection — private assets appear in search results
  panels:
- title: GOOGLE IMAGES
  items:
- "cdn.example.com › images › internal-roadmap.png"
- "internal-roadmap.png"
- "Your private roadmap diagram, publicly indexed and cached."
- "cdn.example.com › images › client-proposal-draft.png"
- "client-proposal-draft.png"
- "Draft proposal screenshots visible to anyone searching your domain."
- title: FIX — LAYERED APPROACH
  items:
- "1. Bucket policy no public directory listing"
- "2. Token paths non-guessable URLs per asset"
- "3. X-Robots-Tag noindex # requires HTTP layer"
- "(CloudFront / CDN with custom headers)"
  note: Token paths reduce exposure but don't block crawlers. X-Robots-Tag only works if you control the HTTP response — not on a plain S3 public bucket.
  notes:
- "→ Remote URLs solve reachability (01–03). Token paths + noindex headers solve exposure (04–05). Both layers are needed."

==========================================================================================
title: ai_devs_4_note_context-fb70430d-9.png
diagram:
name: NOTES WITHOUT CONTEXT — WHAT THE AGENT CAN'T SEE
sections:

- id: "01"
  name: Project names and people — no context attached
  as_written:
  content: Sync with Marek about the Phoenix deadline. Follow up after the board meeting.
  result:
- Who is Marek? What is Phoenix? When was the board meeting?
  with_context:
  content: Sync with [[World/People/Marek-Kowalski]] about the [[Craft/Projects/Phoenix]] deadline. Follow up after [[Craft/Projects/Phoenix/board-meeting-2026-03]].
  result:
- Marek is CTO at eduweb. Phoenix deadline March 20. Board meeting notes loaded.
- id: "02"
  name: Shortened or opaque links — invisible to the agent
  as_written:
  content: |
  Reference architecture described here. See
  also: bit.ly/x7k2p
  result:
- '"here" and "bit.ly/x7k2p" carry no signal. Skipped.'
  with_context:
  content: |
  Reference architecture:
  [[Craft/Knowledge/AI/transformer-architecture]]
  See also: Attention Is All You Need — Vaswani
  et al. 2017
  result:
- Note located. Paper title matches existing knowledge entry.
- id: "03"
  name: Vague temporal references — no path to follow
  as_written:
  content: As discussed in the last call, we're moving away from the previous approach. Decision made after what happened last week.
  result:
- No reference to follow. Context is a dead end.
  with_context:
  content: As discussed in [[Craft/Projects/Alice/calls/2026-03-01]], moving away from [[Craft/Lab/context-v1]]. Triggered by [[Craft/Projects/Alice/incidents/token-overflow-2026-02-28]].
  result:
- Call notes, prior approach, and incident loaded. Decision chain reconstructed.
- id: "04"
  name: Link exists only once — agent reads a fragment, misses it
  note:
  content: |
  Lines 1-198 — detailed technical content...
  Line 199 — See also: [[Craft/Knowledge/AI/context-window-limits]]
  Lines 200-340 — more content (not loaded)...
  agent:
  result:
- Loaded lines 1-200. Cut off at line 199. Wikilink not seen. No related notes found.
  fix:
  result:
- Repeat key links near the top or in frontmatter — they must survive partial reads.
- id: "05"
  name: Overwritten versions — agent doesn't know what's current
  overwritten_in_place:
  content: |

# proposal.md

Budget: ~~€40k~~ €55k
Timeline: ~~Q2~~ Q3
history lost
result:

- Which figures are current? Why did scope change? No trail.
  versioned:
  content: |

# proposal-v3.md (current)

supersedes: [[proposal-v2]]
Budget: €55k
Timeline: Q3
reason: scope expanded after board-meeting-2026-03
result:

- v3 is current. Previous version linked. Change reason traceable.
  notes:
- "→ Write as if the reader has zero prior context. Names, links, references, and versions must be self-contained — the agent has no memory outside what's on the page."

==========================================================================================
title: ai_devs_4_knowledge_balance-5eaa265d-b.png
diagram:
name: AI ENGAGEMENT IN THE KNOWLEDGE BASE
scale:
left: "← HUMAN"
right: "AI →"
sections:

- name: HUMAN-DOMINANT
  items:
- name: Direction
  left_label: WHAT MATTERS, WHAT TO CAPTURE, WHAT THE KB IS FOR
  note: Goals and priorities set → AI has no say. This is the foundation everything else builds on.
- name: Writing
  left_label: AUTHOR
  right_label: ASSIST
  note: Thoughts and knowledge → Your words, your perspective. AI may help with phrasing only.
- name: Curation
  left_label: JUDGE
  right_label: SURFACE
  note: Growing vault → You decide what stays, expands, or gets archived. AI surfaces candidates.
- name: SHARED
  items:
- name: Transformation
  left_label: SOURCE
  right_label: FORMAT
  note: Image / Voice / Rough draft → Structured and formatted. Content stays yours.
- name: Commenting
  left_label: CONTENT
  right_label: ANNOTATE
  note: Your note → AI adds observations in a separate block. Source untouched.
- name: Organisation
  left_label: DECIDE
  right_label: SUGGEST
  note: New note added → AI suggests correct location with reasoning. You confirm.
- name: AI-DOMINANT
  items:
- name: Templates
  left_label: DEFINE
  right_label: APPLY
  note: Structure defined once in System/ → AI applies right template on every new note.
- name: Linking
  left_label: RULES
  right_label: PROPOSE LINKS
  note: Linking rules defined → AI scans vault and proposes [[wikilinks]].
- name: Validation
  left_label: STANDARDS
  right_label: FLAG VIOLATIONS
  note: Conventions set → AI flags missing frontmatter, broken links, wrong placement.
- name: Indexing
  left_label: CURATE
  right_label: GENERATE MOC
  note: Topic cluster grows → AI generates and updates Map of Content. You trim.
- name: Auditing
  left_label: ACT
  right_label: SCAN & REPORT
  note: Vault accumulates → AI surfaces orphans, duplicates, noise. You decide.

==========================================================================================
title: ai_devs_4_blueprints-c41d89ad-3.png
diagram:
name: NOTE TEMPLATES — BLUEPRINT SYSTEM
stats:
path: workspace/system/templates
templates: "9 templates"
areas: "2 areas"
legend:

- Craft — creative workspace
- World — external context
  sections:
- name: Craft
  templates:
- name: Idea
  path: Craft/Ideas/<slug>.md
  level: MINIMAL
  frontmatter:
- title
- tags
  sections:
- Context
- Related area
- Next step
- name: Knowledge
  path: Craft/Knowledge/<topic>/<slug>.md
  level: STANDARD
  frontmatter:
- title
- description
- status
- tags
  sections:
- Overview
- Core concepts
- Relevance
- Sources
- Related notes
- name: Project
  path: Craft/Projects/<slug>.md
  level: STANDARD
  frontmatter:
- title
- description
- status
- tags
  sections:
- Mission
- People
- Stack
- Key links
- Status
- Related
- name: Experiment
  path: Craft/Lab/<slug>.md
  level: STANDARD
  frontmatter:
- title
- description
- status
- tags
  sections:
- Goal
- Approach
- Code
- Outcome
- Promotion path
- name: Shared
  path: Craft/Shared/<slug>.md
  level: FULL
  frontmatter:
- title
- description
- status
- publish
- tags
  sections:
- Format
- Audience
- Key points
- Sources
- Distribution
- Status
- name: World
  templates:
- name: Person
  path: World/People/<firstname-lastname>.md
  level: MINIMAL
  frontmatter:
- title
- tags
  sections:
- Who
- Context
- Communication
- Notes
- name: Source
  path: World/Sources/<slug>.md
  level: STANDARD
  frontmatter:
- title
- description
- tags
  sections:
- About
- URL
- Why it matters
- Frequency
- Highlights
- name: Event
  path: World/Events/<YYYY-MM-DD>-<slug>.md
  level: STANDARD
  frontmatter:
- title
- description
- date
- tags
  sections:
- What happened
- People
- Place
- Related projects
- Next steps
- name: Service
  path: World/Tools/<slug>.md
  level: STANDARD
  frontmatter:
- title
- description
- tags
  sections:
- Purpose
- URL
- Configuration
- API access
- Alternatives
  notes:
- "→ Frontmatter: minimal = title + tags · standard = + description, status · full = + publish lifecycle"

==========================================================================================
title: ai_devs_4_decision-6a8aed19-e.png
diagram:
name: AGENT NOTE PLACEMENT — DECISION FLOW
legend:

- User
- Agent
- Filesystem
  flow:
- actor: User
  step: Intent received
  content: '"Add a knowledge note about RAG (Retrieval-Augmented Generation)..."'
- step: 1 — PARSE INTENT
- actor: Agent
  step: What kind of note is this?
  content:
  type_signal: '"knowledge note" — explicit in user message'
  area: RAG = AI topic → Craft/Knowledge/ai/
  template: knowledge.md — title, description, status, tags
- step: 2 — EXPLORE WORKSPACE
- actor: Filesystem
  step: FILESYSTEM READS
  content:
- action: fs_search
  query: '"RAG" in craft/knowledge'
  result: 0 results
- action: fs_search
  query: '"Retrieval-Augmented Generation" in craft/knowledge'
  result: 0 results
- action: fs_read
  query: system/templates/knowledge.md
  result: 31 lines
- action: fs_read
  query: craft/knowledge — directory listing
  result: 2 items
- action: fs_search
  query: '"embedding" in workspace/ — cross-ref scan'
  result: matches
- action: fs_search
  query: '"LLM" in workspace/ — related concepts'
  result: matches
- action: fs_search
  query: '"arxiv" in world/sources — source candidates'
  result: 0 results
- action: fs_read
  query: world/sources/hacker-news-ai.md — fallback source
  result: 15 lines
- step: 3 — RESOLVE STRUCTURE
- actor: Agent
  step: How to structure the note?
  content:
  duplicate: No — both RAG searches returned 0 results → safe to create
  subfolder: Topic = AI → nest under craft/knowledge/ai/
  slug: retrieval-augmented-generation.md — full name, no abbrev
  sections: Overview · Core concepts (embedding, chunking, retrieval, reranking) · Relevance · Sources · Related notes
  wikilinks: Link embedding + LLM matches found in workspace scan
  source_ref: arxiv not found → use [[world/sources/hacker-news-ai]] as fallback
  frontmatter: title, description, status: draft, tags: [ai, rag, retrieval]
- step: 4 — WRITE
- actor: Filesystem
  step: FS_WRITE — CREATED
  content:
  chars: 1791 chars
  path: craft/knowledge/ai/retrieval-augmented-generation.md
  written:
  FRONTMATTER: title, description, status: draft, tags
  OVERVIEW: What RAG is + why it matters
  CORE CONCEPTS: embedding · chunking · retrieval · reranking
  RELEVANCE: links to knowledge-base + assistant use cases
  SOURCES: "[[world/sources/hacker-news-ai]]"
  RELATED NOTES: wikilinks to embedding + LLM notes found in scan
- actor: Agent
  step: Confirm + offer next steps
  content: Reports path written · sections included · suggests: add arxiv source note in world/sources/ and link it properly

==========================================================================================
title: ai_devs_4_daily_news_delegation-d2fe03c4-7.png
diagram:
name: AGENT DELEGATION — DAILY-NEWS PROCESS
legend:

- Scheduler
- Main agent
- Filesystem
- Research agent
- Assemble agent
- Deliver agent
  lifecycle_flow:
- actor: Scheduler
  step: Automated daily trigger
  content: '"Execute process: daily-news" — sent automatically every morning'
- step: 1 — MAIN AGENT READS OPS
- actor: Filesystem
  step: OPS DIRECTORY
  content:
- action: fs_read
  path: ops/daily-news/\_info.md
  note: process overview + source wikilinks
- action: fs_read
  path: ops/daily-news/research.md
  note: research agent instructions
- action: fs_read
  path: ops/daily-news/assemble.md
  note: assembly instructions
- action: fs_read
  path: ops/daily-news/deliver.md
  note: delivery instructions
- actor: Main agent
  step: Parse process + plan delegation
  content: Reads task split · identifies 3 sub-agents · prepares scoped instructions for each
- step: 2 — DELEGATE TO SUB-AGENTS
- actor: Research agent
  step: Research
  source: ops/daily-news/research.md
  tasks:
- Read source wikilinks from \_info.md
- Fetch + scan each source
- Extract relevant items
  result: raw findings
- actor: Assemble agent
  step: Assemble
  source: ops/daily-news/assemble.md
  tasks:
- Receive research output
- Rank + deduplicate items
- Format into digest structure
  result: formatted digest
- actor: Deliver agent
  step: Deliver
  source: ops/daily-news/deliver.md
  tasks:
- Receive assembled digest
- Apply delivery format
- Send to channel / write note
  result: delivered
- step: 3 — COMPLETE
- actor: Main agent
  step: Process complete
  content: All sub-agents confirmed · digest delivered · execution logged to ops/daily-news/
  notes:
- "→ repeats next day via scheduler"

==========================================================================================
title: ai-devs_4_daily_news_process-8c77ab1b-6.png
diagram:
name: 4 FILES → INFINITE RUNS
subtitle: Static instructions, repeatable execution — every day, same structure
sections:

- name: OPS/DAILY-NEWS/ — STATIC
  items:
- file: \_info.md
  title: Process definition
  description: Sources · topics · phase table · output structure
- file: 01-research.md
  agent: Ellie
  description: Search sources · write per-topic notes
- file: 02-assemble.md
  agent: Tony
  description: Merge topic notes into HTML digest
- file: 03-deliver.md
  agent: Rose
  description: Verify digest · send email · write status
- name: DAILY EXECUTIONS — ONE PER TRIGGER
  items:
- date: 2026-03-08
  status: DELIVERED
  flow:
- research Ellie
- assemble Tony
- deliver Rose
  outputs:
- 2026-03-08/ai.md
- dev.md
- startups.md
- digest.html
- status.md
- date: 2026-03-09
  status: DELIVERED
  flow:
- research Ellie
- assemble Tony
- deliver Rose
  outputs:
- 2026-03-09/ai.md
- dev.md
- startups.md
- digest.html
- status.md
- date: 2026-03-10 — today
  status: RUNNING
  flow:
- research Ellie
- assemble Tony
- deliver Rose
  outputs:
- 2026-03-10/ai.md
- dev.md
- startups.md
- digest.html
- "..."
- date: 2026-03-11
  status: SCHEDULED
  flow:
- research Ellie
- assemble Tony
- deliver Rose
  outputs:
- 2026-03-11/
- "..."
  flow:
- from: OPS/DAILY-NEWS/ — STATIC
  step: each run reads same files
  to: DAILY EXECUTIONS — ONE PER TRIGGER
  notes:
- "→ The 4 instruction files never change. Each run produces a new dated folder. Same process, fresh data, every day at 07:00."
