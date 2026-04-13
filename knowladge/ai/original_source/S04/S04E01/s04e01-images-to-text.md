==========================================================================================
title: ai_devs_4_garden-8919e468-9.png
diagram:
name: 04_01_GARDEN — AGENT ARCHITECTURE
stats:
subtitle: conversation-driven content ops · markdown vault · static build · web publish
legend:

- User / CLI
- Agent Core
- Tooling / Execution
- Content / Infra
  sections:
- name: DEVELOPER MACHINE
  items:
- type: entry
  name: CLI Chat
  content:
- user message via argv
- type: agent_core
  name: Agentic Loop
  content:
- turn-based · dispatches tool calls · chains responses
- type: prompt
  name: Agent Blueprints
  content:
- identity · workflows · {{date}} injection
- type: model
  name: OpenAI API
  content:
- responses.create · response chaining
- type: function_tools
  name: Tools
  content:
- registered handlers · model-facing definitions
  notes:
- run(message, context)
- ↑ repeats until text output or max turns
- name: TOOLING + REMOTE SANDBOX
  items:
- type: tools_group
  name: AVAILABLE TOOLS
  items:
- exec — run shell commands
- read_file / write_file — vault IO
- git_push — sync vault ↔ repo
- web_search — built-in OpenAI
- type: sandbox
  name: DAYTONA SANDBOX
- type: remote_environment
  name: Code Execution
  content:
- isolated shell · executeCommand · repo at workspace/repo
- type: file_sync
  name: Vault ↔ Sandbox
  content:
- upload on init · download on destroy
- type: content_store
  name: vault/
  content:
- markdown · system prompts · workflows
  notes:
- lazy init on first use
- git_push → commit vault/
- name: GITHUB
  items:
- type: remote
  name: GitHub Repo
  content:
- push on vault/** · grove/** · menu.json
- type: ci_cd
  name: GitHub Actions
  content:
- bun install · bun run build
- type: static_build
  name: grove/ → dist/
  content:
- frontmatter parse · marked.parse · layout render
- type: public_surface
  name: GitHub Pages
  content:
- static dist/ · system/ excluded
  notes:
- push event → CI trigger
- grove renders vault → dist/
- upload artifact · deploy
  lifecycle_flow:
- actor: User / CLI
  step: Entry
  content: CLI Chat
- actor: Agent Core
  step: Loop
  content: Agentic Loop
- actor: Tooling / Execution
  step: Tool init
  content: lazy init on first use
- actor: Tooling / Execution
  step: Sandbox
  content: DAYTONA SANDBOX
- actor: Tooling / Execution
  step: Code execution
  content: Code Execution
- actor: Tooling / Execution
  step: File sync
  content: Vault ↔ Sandbox
- actor: Content / Infra
  step: Content store
  content: vault/
- actor: Content / Infra
  step: Repo sync
  content: GitHub Repo
- actor: Content / Infra
  step: CI/CD
  content: GitHub Actions
- actor: Content / Infra
  step: Static build
  content: grove/ → dist/
- actor: Content / Infra
  step: Public surface
  content: GitHub Pages
  communication_channels:
- run(message, context)
- push event → CI trigger
- upload artifact · deploy
  memory_flow:
- Vault ↔ Sandbox
- git_push — sync vault ↔ repo
- git_push → commit vault/
  pipeline:
  name: CONTENT BUILD PIPELINE
  stages:
- type: source
  name: vault/
  content:
- markdown + frontmatter
- type: parse
  name: markdown.ts
  content:
- gray-matter · marked.parse
- type: render
  name: build.ts + template.ts
  content:
- page model · menu nav · layout
- type: output
  name: dist/ → Pages
  content:
- HTML · static assets
  notes:
- vault/system excluded from public build · push-based CI · no manual deploy step

==========================================================================================
title: ai_devs_4_layout-00852aa4-6.png
diagram:
name: GROVE / OUTPUT — RENDERED PAGE LAYOUT
sections:

- name: page_layout
  items:
- type: brand
  name: Digital Garden
- type: nav
  items:
- Home
- Signal
- Shelf
- Lab
- type: main_content
  heading: Welcome
  body:
- This is a personal digital garden — a loose collection of thoughts, resources, and
- experiments. Nothing here is final. Everything grows.
  notes:
- nav links sourced from menu.json · active state = current page · brand = site title from frontmatter
- content rendered from vault/index.md → gray-matter parse → marked.parse → grove template layout

==========================================================================================
title: ai_devs_4_async:async-351d8e7d-9.png
diagram:
name: AGENTIC COLLABORATION MODES
stats:
subtitle: synchronous · in-loop · human-supervised vs asynchronous · background · process-driven
legend:

- User
- Agent
- System / Infra
- Absent / passive
  sections:
- name: SYNCHRONOUS
  items:
- role: USER
  type: setup
  name: Configuration
  content:
- workflows · skills · context · extensions
  status: PERSONALIZED
- role: USER
  type: trigger
  name: Direct message
  content:
- chat · voice · CLI input
- role: AGENT
  type: interface
  name: Agentic loop
  content:
- reads context · plans · calls tools
- role: USER
  type: feedback
  name: Human in the loop
  content:
- approves · redirects · refines
  status: SUPERVISED
- role: SYSTEM
  type: synchronization
  name: Shared state
  content:
- user + agent see the same data
- role: AGENT
  type: execution
  name: Tool calls
  content:
- files · search · code · APIs
- role: USER
  type: output
  name: Result delivered
  content:
- visible · confirmed · iterable
  notes:
- ↑ loop repeats until user satisfied
- name: ASYNCHRONOUS
  items:
- role: SYSTEM
  type: setup
  name: Integration
  content:
- services · APIs · schedule · requirements
  status: PRE-WIRED
- role: SYSTEM
  type: trigger
  name: Schedule / event
  content:
- cron · webhook · pipeline
- role: AGENT
  type: process
  name: Defined workflow
  content:
- spec is the interface · no improvisation
  status: AUTONOMOUS
- role: USER
  role_state: Absent / passive
  type: feedback
  name: Self-recovery
  content:
- handles errors · no escalation
- role: AGENT
  type: synchronization
  name: Process as state
  content:
- workflow spec defines current reality
- role: AGENT
  type: execution
  name: Tool calls
  content:
- files · APIs · publish · notify
- role: USER
  type: output
  name: Report / artifact
  content:
- passive receipt · post-hoc review
  notes:
- ↑ process must be pre-defined precisely
  comparison_axes:
- axis: SETUP
  synchronous: config
  asynchronous: integration
- axis: TRIGGER
  synchronous: human
  asynchronous: schedule
- axis: INTERFACE
  synchronous: central
  asynchronous: minimal
- axis: FEEDBACK
  synchronous: in-loop
  asynchronous: self-recover
- axis: STATE
  synchronous: shared
  asynchronous: process
- axis: PERMISSIONS
  synchronous: broad
  asynchronous: scoped
- axis: AUTONOMY
  synchronous: supervised
  asynchronous: independent
  flow:
- actor: USER
  step: setup
  content: Configuration
- actor: USER
  step: trigger
  content: Direct message
- actor: AGENT
  step: interface
  content: Agentic loop
- actor: USER
  step: feedback
  content: Human in the loop
- actor: SYSTEM
  step: synchronization
  content: Shared state
- actor: AGENT
  step: execution
  content: Tool calls
- actor: USER
  step: output
  content: Result delivered
- actor: SYSTEM
  step: setup
  content: Integration
- actor: SYSTEM
  step: trigger
  content: Schedule / event
- actor: AGENT
  step: process
  content: Defined workflow
- actor: USER
  step: feedback
  content: Self-recovery
- actor: AGENT
  step: synchronization
  content: Process as state
- actor: AGENT
  step: execution
  content: Tool calls
- actor: USER
  step: output
  content: Report / artifact

==========================================================================================
title: ai_devs_4_garden_structure-94fe8562-e.png
diagram:
name: DIGITAL GARDEN — SYSTEM ARCHITECTURE
stats:
subtitle: editor · vault · agents · publish · all connected through markdown
legend:

- User
- Agent
- Vault
- Publish
  sections:
- name: LAYER 1
  title: User
  description:
- direct interaction · canonical content ownership
  status: IN-LOOP
  items:
- type: editor
  name: Markdown editor
  content:
- Obsidian · any md editor · full vault access
- type: interface
  name: Quick commands
  content:
- save note · retrieve · tag · not a chat
- type: promotion
  name: Review & promote
  content:
- user decides what becomes canonical content
- name: LAYER 2
  title: Vault
  description:
- single source of truth · structured markdown · shared state
  status: SOURCE OF TRUTH
  items:
- type: canonical
  name: Notes & articles
  content:
- user-authored · promoted content
- type: structure
  name: Workflows & rules
  content:
- agent instructions · process definitions
- type: agent_output
  name: Side notes
  content:
- suggestions · enrichments · comments · drafts
  paths:
- /notes
- /research
- /learning
- /newsletter
- /podcast
- /agent-notes
- /dist → pages
- name: LAYER 3
  title: Agents
  description:
- isolated · schedule-driven · vault-mediated exchange only
  status: ASYNC
  items:
- type: newsletter
  name: Newsletter agent
  content:
- drafts issues · pulls from vault
- • weekly schedule
- type: podcast
  name: Podcast agent
  content:
- outlines episodes · suggests topics
- • on new content
- type: research
  name: Research agent
  content:
- web search · summarize · enrich notes
- • daily · on demand
- type: learning
  name: Learning agent
  content:
- surfaces gaps · suggests connections
- • periodic review
  notes:
- x agents do not task each other · exchange via vault only
- name: LAYER 4
  title: Publish
  description:
- vault becomes public · the purpose of the whole system
  status: OUTPUT
  items:
- type: source
  name: vault/
- type: parse
  name: markdown.ts
- type: build
  name: GitHub Actions
- type: deploy
  name: GitHub Pages
- type: public
  name: Digital Garden
  notes:
- → agent-notes excluded from build · only canonical content goes public
  flow:
- actor: User
  step: READ / WRITE
  content: LAYER 1 → LAYER 2
- actor: Vault
  step: READ RESULTS · WRITE SIDE NOTES
  content: LAYER 2 → LAYER 3
- actor: Publish
  step: VAULT → BUILD → DEPLOY
  content: LAYER 3 → LAYER 4
  shared_foundation:
- vault
- structured markdown
- canonical content
- side notes
- workflows & rules
  memory_flow:
- User reads and writes through the vault
- Agents read results and write side notes
- Publish reads from vault and outputs public site
  notes:
- all connected through markdown

==========================================================================================
title: ai_devs_4_decision_map-8088af1a-f.png
diagram:
name: ARCHITECTURE DECISION MAP
stats:
subtitle: constraint → decision → consequence · six dimensions of the digital garden
legend:

- CONSTRAINT
- DECISION
- CONSEQUENCE
  categories:
- id: "01"
  name: User
  constraint:
  title: Developer profile
  text:
- can read code · understands tooling · higher complexity tolerance
  labels:
- TECHNICAL
  decision:
  title: Allow higher tool complexity
  text:
- terminal access · code execution · relaxed agent limits
  labels:
- SANDBOX
- CLI
  consequence:
  title: Sandbox required for safety
  text:
- Daytona isolates execution · prevents uncontrolled side effects
  labels:
- DAYTONA
- id: "02"
  name: Content
  constraint:
  title: User-authored, personal
  text:
- full AI generation has no value · enrichment does
  labels:
- HUMAN VOICE
  decision:
  title: Agent enriches, never replaces
  text:
- full vault access · scoped by defined rules · side notes only
  labels:
- SCOPED
- NO GENERATION
  consequence:
  title: Canonical content stays human
  text:
- agent output lives in /agent-notes · user promotes manually
  labels:
- PROMOTION GATE
- id: "03"
  name: Format
  constraint:
  title: HTML is impractical to write
  text:
- even for a developer · especially for long-form notes
  labels:
- ERGONOMICS
  decision:
  title: Markdown as source format
  text:
- editable by human and model · HTML only via build step
  labels:
- MARKDOWN
- NO RAW HTML
  consequence:
  title: Build pipeline is mandatory
  text:
- md → HTML conversion handled exclusively by code
  labels:
- GROVE/
- MARKED.TS
- id: "04"
  name: Integrations
  constraint:
  title: Agent can execute code
  text:
- skills concept · code mode tool use · no hard limits
  labels:
- CODE MODE
  decision:
  title: CLI + MCP + native tools
  text:
- all integration patterns available · no architectural lock-in
  labels:
- CLI
- MCP
- SKILLS
  consequence:
  title: Unconstrained tool surface
  text:
- any external service reachable · Firecrawl · Replicate · Resend
  labels:
- EXTENSIBLE
- id: "05"
  name: Publishing
  constraint:
  title: Static HTML output
  text:
- no dynamic server needed · public content by design
  labels:
- PUBLIC
- STATIC
  decision:
  title: GitHub Pages + Actions
  text:
- push triggers build · zero manual deploy · free hosting
  labels:
- CI/CD
- AUTO-DEPLOY
  consequence:
  title: Privacy non-issue by design
  text:
- digital garden concept assumes public · no access control needed
  labels:
- ZERO OPS
- id: "06"
  name: Availability
  constraint:
  title: API access required
  text:
- save and recall from anywhere · not tied to one device
  labels:
- REMOTE-FIRST
  decision:
  title: Remote server + local sync
  text:
- app and markdown live on server · synced to user's machine
  labels:
- SYNC
- SERVER
  consequence:
  title: Vault must be always online
  text:
- agent writes remotely · editor reads locally · sync is critical path
  labels:
- ALWAYS-ON
  notes:
- → each decision is reversible except availability — remote-first is a structural commitment that shapes everything else

==========================================================================================
title: ai_devs_4_decision_map_roles-4544c002-a.png
diagram:
name: ARCHITECTURE DECISION MAP
stats:
subtitle: constraint → decision → consequence · classic engineering vs AI-driven mechanics
legend:

- Classic / Engineering
- AI-driven / exists because of AI
- Hybrid / shaped by both
  categories:
- id: "01"
  name: User
  constraint:
  title: Developer profile
  text:
- can read code · higher complexity tolerance
  labels:
- ENGINEERING
- TECHNICAL
  decision:
  title: Allow higher tool complexity
  text:
- terminal access · code execution · relaxed limits
  labels:
- ENGINEERING
- CLI
- TERMINAL
  consequence:
  title: Sandbox required
  text:
- classic security pattern · amplified by agent's unrestricted execution
  labels:
- HYBRID
- DAYTONA
- ISOLATION
- id: "02"
  name: Content
  constraint:
  title: User-authored, personal
  text:
- product decision · full AI generation has no value here
  labels:
- ENGINEERING
- PRODUCT SPEC
  decision:
  title: Agent enriches, never replaces
  text:
- full vault access · scoped by rules · side notes only
  labels:
- AI-DRIVEN
- SCOPED
- NO GENERATION
  consequence:
  title: Canonical content stays human
  text:
- promotion gate exists only because agent writes to vault
  labels:
- AI-DRIVEN
- PROMOTION GATE
- id: "03"
  name: Format
  constraint:
  title: HTML impractical to write
  text:
- even for developers · especially long-form notes
  labels:
- ENGINEERING
- ERGONOMICS
  decision:
  title: Markdown as source format
  text:
- readable by humans · native format for models · both matter
  labels:
- HYBRID
- HUMAN + MODEL
  consequence:
  title: Build pipeline mandatory
  text:
- md → HTML via code only · grove/ · marked.ts
  labels:
- ENGINEERING
- GROVE/
- CI
- id: "04"
  name: Integrations
  constraint:
  title: Agent can execute code
  text:
- skills concept · code mode tool use
  labels:
- AI-DRIVEN
- CODE MODE
- SKILLS
  decision:
  title: CLI + MCP + native tools
  text:
- all patterns unlocked by agent execution model
  labels:
- AI-DRIVEN
- MCP
- CLI
  consequence:
  title: Unconstrained tool surface
  text:
- any external service reachable · Firecrawl · Resend
  labels:
- ENGINEERING
- EXTENSIBLE
- id: "05"
  name: Publishing
  constraint:
  title: Static HTML output
  text:
- no dynamic server needed · public content by design
  labels:
- ENGINEERING
- STATIC
- PUBLIC
  decision:
  title: GitHub Pages + Actions
  text:
- push triggers build · zero manual deploy · free hosting
  labels:
- ENGINEERING
- CI/CD
- ZERO OPS
  consequence:
  title: Privacy non-issue by design
  text:
- matters because agent has full vault access · public = no risk
  labels:
- HYBRID
- BY DESIGN
- id: "06"
  name: Availability
  constraint:
  title: API access required
  text:
- agent needs vault access at any time · local-only won't work
  labels:
- AI-DRIVEN
- AGENT-DRIVEN
  decision:
  title: Remote server + local sync
  text:
- app and vault live on server · synced to user machine
  labels:
- ENGINEERING
- SYNC
- SERVER
  consequence:
  title: Vault must be always online
  text:
- agent writes remotely · editor reads locally · sync is critical path
  labels:
- ENGINEERING
- ALWAYS-ON
  balance:
  counts:
  engineering: 10
  hybrid: 3
  AI-driven: 5
  notes:
- → solid engineering foundation with AI concentrated in content rules, integrations, and availability trigger — the infrastructure serves the agent, not the other way around

==========================================================================================
title: ai_devs_4_prototyping-5052af56-a.png
diagram:
name: PROTOTYPING LOOP COMPRESSION
stats:
subtitle: same project scope · 4 weeks without AI · 3 days with AI
sections:

- name: WITHOUT AI · DIGITAL GARDEN
  summary: ~4 weeks · 1 thread · mockup as output
  timeline:
  unit: Week
  columns:
- Week 1
- Week 2
- Week 3
- Week 4
  lanes:
- name: project
  items:
- name: IDEA + SPEC
  start: Week 1
  end: Week 1
  content:
- requirements · architecture
- name: BUILD PROTOTYPE
  start: Week 2
  end: Week 3
  content:
- wireframes · mocked API · fake search · static pages
- name: TEST · DECIDE
  start: Week 4
  end: Week 4
  content:
- feedback · rework
  notes:
- OUTPUT: MOCKUP · NO REAL FUNCTIONALITY · NO REAL DATA · NO AGENT
- name: WITH AI · DIGITAL GARDEN
  summary: days to ship · hours to iterate · parallel exploration
  timeline:
  unit: Day
  columns:
- Day 1
- Day 2
- Day 3
- Day 4
- Day 5
- Day 6
- Day 7
- Day 8
- Day 9
- Day 10
  lanes:
- name: core system
  items:
- name: FULL WORKING SYSTEM
  start: Day 1
  end: Day 3
  content:
- vault · agent loop · publish pipeline · live site
- name: ITERATE ON REAL USAGE
  start: Day 5
  end: Day 6
  content:
- real content · real feedback
- name: search
  items:
- name: SEMANTIC V1
  start: Day 1
  end: Day 1
  content:
- hours
- name: HYBRID + RERANKING
  start: Day 3
  end: Day 4
  content:
- refined from signal
- name: SEARCH + CHAT
  start: Day 6
  end: Day 7
  content:
- combined approach
- name: mobile app
  items:
- name: NATIVE APP
  start: Day 2
  end: Day 3
  content:
- full features · generated
- name: OFFLINE SYNC + PUSH NOTIFICATIONS
  start: Day 5
  end: Day 7
  content:
- iterated on real device
- name: enrichment
  items:
- name: AUTO-ENRICH
  start: Day 1
  end: Day 1
- name: KILLED
  start: Day 3
  end: Day 3
- name: FRONTMATTER-GUIDED
  start: Day 5
  end: Day 6
  content:
- user steers agent
- name: newsletter
  items:
- name: DRAFT PIPELINE
  start: Day 3
  end: Day 4
  content:
- notes ↔ issue
- name: FULL SEND PIPELINE
  start: Day 6
  end: Day 8
  content:
- curate · draft · review · send
  milestones:
- name: DAY 3: FULLY WORKING SYSTEM · LIVE SITE · REAL AGENT
- name: DAY 4–10: CONTINUED ITERATION · MULTIPLE FEATURES · REAL SIGNAL
  notes:
- EACH COLUMN = SAME PHYSICAL WIDTH, DIFFERENT TIME UNIT
- → each column is the same physical width — Week 1 vs Day 1 makes the compression visible · working system ships where a mockup would still be in progress
- · killing ideas costs hours not months
