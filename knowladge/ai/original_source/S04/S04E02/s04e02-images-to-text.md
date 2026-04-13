==========================================================================================
title: ai_devs_4_agents_map-65da49cd-5.png
diagram:
name: AI TOOLS CAPABILITY MAP
stats:
tools_count: 7
sections:

- name: capability_map
  axes:
  x: Out-of-the-box power
  y: User control
  range:
  x: 0 to 10
  y: 0 to 10
  items:
- name: Pi
  values:
  out_of_the_box_power: 6
  user_control: 10
- name: Open Code
  values:
  out_of_the_box_power: 9
  user_control: 9
- name: Claude Code
  values:
  out_of_the_box_power: 8
  user_control: 8
- name: Claude
  values:
  out_of_the_box_power: 6
  user_control: 4
- name: Cursor
  values:
  out_of_the_box_power: 7.5
  user_control: 3
- name: ChatGPT
  values:
  out_of_the_box_power: 5
  user_control: 3
- name: Grok
  values:
  out_of_the_box_power: 6
  user_control: 1
- name: tool_breakdown
  items:
- name: Pi
  score: 6 / 10
  metrics:
- label: PWR
  value: 6
- label: CTRL
  value: 10
- name: Open Code
  score: 9 / 9
  metrics:
- label: PWR
  value: 9
- label: CTRL
  value: 9
- name: Claude Code
  score: 8 / 8
  metrics:
- label: PWR
  value: 8
- label: CTRL
  value: 8
- name: Claude
  score: 6 / 4
  metrics:
- label: PWR
  value: 6
- label: CTRL
  value: 4
- name: Cursor
  score: 7.5 / 3
  metrics:
- label: PWR
  value: 7.5
- label: CTRL
  value: 3
- name: ChatGPT
  score: 5 / 3
  metrics:
- label: PWR
  value: 5
- label: CTRL
  value: 3
- name: Grok
  score: 6 / 1
  metrics:
- label: PWR
  value: 6
- label: CTRL
  value: 1
  notes:
- TOOL BREAKDOWN

==========================================================================================
title: ai_devs_4_fit-e01dadf3-f.png
diagram:
name: INTERFACE × SCENIO FIT
legend:

- Primary fit
- Works well
- Possible
- Not applicable
  categories:
- id: CLI
  name: CLI Tools
  group: CLI
- id: MCP
  name: MCP Servers
  group: MCP
- id: MESSENGER
  name: Slack / Chat
  group: MESSENGER
- id: CUSTOM
  name: Dedicated UI
  group: CUSTOM
  sections:
- name: Personalization
  subtitle: Extensions & custom behavior
  items:
- category: CLI
  text: PRIMARY
- category: MCP
  text: WORKS
- category: MESSENGER
  text: LIMITED
- category: CUSTOM
  text: PRIMARY
- name: Cost efficiency
  subtitle: Subscription vs API
  items:
- category: CLI
  text: API COST
- category: MCP
  text: PRIMARY
- category: MESSENGER
  text: WORKS
- category: CUSTOM
  text: API COST
- name: Local · individual
  subtitle: Single user, own machine
  items:
- category: CLI
  text: PRIMARY
- category: MCP
  text: WORKS
- category: MESSENGER
  text: –
- category: CUSTOM
  text: OVERHEAD
- name: Sandbox · remote
  subtitle: CLI in isolated env
  items:
- category: CLI
  text: WORKS
- category: MCP
  text: PRIMARY
- category: MESSENGER
  text: –
- category: CUSTOM
  text: WORKS
- name: Multi-agent
  subtitle: Orchestration + monitoring
  items:
- category: CLI
  text: PARTIAL
- category: MCP
  text: PRIMARY
- category: MESSENGER
  text: WORKS
- category: CUSTOM
  text: PRIMARY
- name: Team adoption
  subtitle: Familiar context, low friction
  items:
- category: CLI
  text: –
- category: MCP
  text: INDIRECT
- category: MESSENGER
  text: PRIMARY
- category: CUSTOM
  text: WORKS
- name: Focused UI
  subtitle: Specific agent interaction
  items:
- category: CLI
  text: –
- category: MCP
  text: PARTIAL
- category: MESSENGER
  text: WORKS
- category: CUSTOM
  text: PRIMARY
  notes:
- PRIMARY
- WORKS
- LIMITED
- API COST
- OVERHEAD
- PARTIAL
- INDIRECT

==========================================================================================
title: ai_devs_4_marketing_agent-0c151848-b.png
diagram:
name: MARKETING CAMPAIGN AGENT — SYSTEM ARCHITECTURE
sections:

- name: DATA SOURCES
  items:
- type: PAID
  name: Meta Ads
- type: PAID
  name: Google Ads
- type: ANALYTICS
  name: Web Analytics
- type: CRM
  name: Customer Data
- name: AGENTIC SYSTEM
  items:
- label: CAMPAIGN MONITOR
  name: Marketing Agent
  capabilities:
- name: Statistics
  detail: AI · data presentation
- name: Monitoring
  detail: AI · alerts & attention
- name: Reports
  detail: AI · suggestions & actions
- name: INTERFACES
  items:
- type: MCP · CLAUDE
  name: Claude / ChatGPT
  detail: Agent exposed as MCP tools inside existing chat UI
- type: CUSTOM BUILD
  name: Dedicated Interface
  detail: Purpose-built dashboard for campaign interactions
  flow:
- from: Data Sources
  to: Marketing Agent
- from: Marketing Agent
  to: Claude / ChatGPT
- from: Marketing Agent
  to: Dedicated Interface

==========================================================================================
title: ai_devs_4_components-1091651e-c.png
diagram:
name: AGENTIC UI — CORE COMPONENTS
subtitle: personalization layer between user and model
sections:

- name: USER
- name: AI Interface — personalization layer
  categories:
- id: PROFILES
  name: Subagents
  description: Specialized agents with isolated context, instructions, and knowledge bases.
  items:
- name: Research Agent
  status: ACTIVE
- name: Code Reviewer
  status: IDLE
- name: Writing Assistant
  status: IDLE
- id: SKILLS
  name: Injected Instructions
  description: Predefined behaviors injected on user action or model decision.
  items:
- name: Deep Research Mode
  status: AUTO
- name: Style: Technical
  status: ON
- name: Summarize Output
  status: OFF
- id: TOOLS
  name: MCP & Integrations
  description: Runtime-controlled tools with per-tool configuration and augmented calling.
  items:
- name: Web Search
  status: ON
- name: Code Executor
  status: ON
- name: Calendar MCP
  status: OFF
- id: WORKFLOW
  name: Automation Layer
  description: Repeatable action sequences, hooks, and scheduled tasks.
  items:
- name: Daily Briefing
  status: 08:00
- name: On-save Hook
  status: ON
- name: Weekly Review
  status: OFF
  flow:
- from: USER
  to: AI Interface — personalization layer

==========================================================================================
title: ai_devs_4_uiux-00adee0c-8.png
diagram:
name: AGENTIC UI — IMPLEMENTATION QUALITY
subtitle: what separates useful from merely functional
sections:

- id: "01"
  name: PROFILES
  title: Subagent Switching
  items:
- type: tabs
  values:
- Research
- Code Review
- Writing
- type: inline_invocation
  text: "@ mention to invoke inline"
- type: action
  text: "+ Generate from template"
- type: profile_config
  profile: Research
  model: gpt-4o
  web: on
  memory: on
- type: profile_config
  profile: Code Review
  model: claude-3.7
  executor: on
  web: off
- id: "02"
  name: SKILLS
  title: Discovery & Invocation
  items:
- type: search
  text: deep rese
- type: group
  name: RESEARCH AGENT
  items:
- name: Deep Research Mode
  status: auto
- name: Source Citation
  status: manual
- type: group
  name: GLOBAL
  items:
- name: Structured Output
  status: manual
- name: Summarize Response
  status: manual
- id: "03"
  name: TOOLS
  title: Call Lifecycle
  items:
- tool: write_file
  status: awaiting confirmation
  path: ./output/report.md
  size: 4.2 KB
  actions:
- Confirm
- Cancel
- tool: web_search
  status: running
  query: '"agentic UI patterns 2025"'
  progress_text: fetching 4 / 6 sources…
  action: Pause
- tool: calendar_mcp
  status: error
  message: Auth token expired — reconnect integration
- id: "04"
  name: BACKGROUND
  title: Status & Intervention
  items:
- name: Weekly Review
  status: needs input
  message: ambiguous data source
  action: Review
- name: Daily Briefing
  status: running
  thread: "#2"
  detail: started 08:00
- name: Weekly Review
  status: needs input
  thread: "#3"
  detail: waiting 4m
- name: Code Scan — repo/main
  status: done
  thread: "#1"
  detail: finished 07:54
  notes:
- "→ UX quality = discoverability + control granularity + status transparency — not just feature presence"

==========================================================================================
title: ai_devs_4_microactions-fa8c17e9-a.png
diagram:
name: AI MICROACTIONS
subtitle: your environment emits signals — small tools can act on them
sections:

- name: signals
  items:
- name: SELECTED TEXT
  text: highlighted word, phrase, or paragraph
- name: CLIPBOARD
  text: text, image, or URL just copied
- name: ACTIVE PAGE
  text: domain, URL, or app currently in focus
- name: CAMERA + GPS
  text: photo with embedded location metadata
- name: DEVICE STATE
  text: folder watch, file event, shortcut trigger
- name: microaction
  items:
- name: MICROACTION
  text: a small tool that reads one signal and does one thing
  context:
  name: CONTEXT
  text: what the signal contains — text, image, URL, coordinates
  semantic_verb:
  name: SEMANTIC VERB
  text: read · explain · rewrite · extract · visualize · detect · retrieve
- name: outputs
  items:
- name: AUDIO
  text: text read aloud via local TTS
- name: INLINE TEXT
  text: rewritten, translated, or extracted copy
- name: VISUAL
  text: diagram or image generated from selection
- name: NOTE LINK
  text: deep link into personal knowledge base
- name: LIST UPDATE
  text: item appended to shopping or task list
- name: examples
  items:
- example: Read selection
  signal: selected text
  verb: read
  effect: local TTS with playback control
- example: Explain selection
  signal: selected keyword or phrase
  verb: explain
  effect: brief definition from model or search
- example: Context-aware rewrite
  signal: selection + active domain
  verb: rewrite
  effect: copy styled for GitHub issues or docs
- example: Visualize selection
  signal: selected text
  verb: visualize
  effect: diagram or HTML rendered to PNG
- example: Describe clipboard image
  signal: image in clipboard
  verb: describe
  effect: style prompt for image generation
- example: Find related notes
  signal: selected phrase
  verb: retrieve
  effect: deep link into personal knowledge base
- example: Photo to shopping list
  signal: photo + GPS metadata
  verb: detect
  effect: item appended to shopping list
  notes:
- Implementation is usually a short script bound to a keyboard shortcut, gesture, Siri Shortcut, or folder watch — or a small private app in Swift, Electron, or Tauri.

==========================================================================================
title: ai_devs_4_metaprompt-6061f547-a.png
diagram:
name: META-PROMPT
subtitle: A PROMPT THAT BUILDS PROMPTS — CONCEPTUAL STRUCTURE
sections:

- name: INPUTS
  items:
- type: USER MODEL
  text: Goals · expertise · style
- type: DOMAIN MODEL
  text: Frameworks · tools · patterns
- type: TASK MODEL
  text: Objective · constraints · format
- type: RISK MODEL
  text: Stakes · scope · uncertainty
- name: META-PROMPT
  items:
- name: Prompt compiler
  description: Interviews the user, reasons about context, selects techniques, then emits a structured prompt.
  steps:
- id: "01"
  name: Frame
  text: what · for whom · why
- id: "02"
  name: Elicit
  text: targeted questions, one at a time
- id: "03"
  name: Infer
  text: facts → rules, style, constraints
- id: "04"
  name: Adapt
  text: branch by domain · risk · expertise
- id: "05"
  name: Synthesize
  text: assemble prompt from schema
- id: "06"
  name: Validate
  text: completeness · format · safety
  note: "[unclear] iterates until stop condition"
- name: OUTPUT
  items:
- type: IDENTITY
  text: Role · persona · audience
- type: REASONING
  text: Process · mental models
- type: RULES
  text: Constraints · guardrails
- type: EXPERTISE
  text: Frameworks · anti-patterns
- type: OUTPUT CONTRACT
  text: Format · sections · syntax
- name: LAYERS OF A META-PROMPT
  items:
- layer: LAYER 1
  name: Core protocol
  text: Interview loop, stop condition, question policy
  tag: universal
- layer: LAYER 2
  name: Domain overlays
  text: Conditional rules per domain — technical, creative, high-stakes
  tag: universal
- layer: LAYER 3
  name: Technique library
  text: 8–15 selected techniques, not all 40+.
  subtext: Chosen by domain + risk
  tag: universal
- layer: LAYER 4
  name: Output layer
  text: Platform-specific format, syntax, parser contract
  tag: platform-local
  flow:
- from: INPUTS
  to: Prompt compiler
- from: Prompt compiler
  to: OUTPUT

==========================================================================================
title: ai_devs_4_metaprompt_structure-5f0b61c4-c.png
diagram:
name: AGENT-BUILDER META-PROMPT — ANATOMY
subtitle: TRIMMED PROMPT SKELETON · SECTION FAMILIES COLOR-CODED · DOCUMENT COMPOSITION, NOT PROCESS FLOW
categories:

- id: 1
  name: FRAME
  text: Who the meta-prompt is and how it should operate
- id: 2
  name: INTAKE SCHEMA
  text: What information it must collect before writing
- id: 3
  name: ADAPTATION LOGIC
  text: How it changes by domain, tone, and risk
- id: 4
  name: TECHNIQUE LIBRARY
  text: Reasoning and prompt tools it can draw from
- id: 5
  name: CAPABILITY LOGIC
  text: How it chooses tools and permissions
- id: 6
  name: OUTPUT CONTRACT
  text: Exact output shape, parser rules, and reminders
  notes:
- Same color can appear more than once. That means the same structural function recurs in different parts of the document.
  sections:
- name: ANNOTATED PROMPT SKELETON
  title: This is what the meta-prompt looks like as a document
  description: Section headers stay close to the real source. Bodies are collapsed into short summaries so the structure is visible without exposing the full prompt.
  items:
- family_id: 1
  family: FRAME
  lines:
- no: "001"
  text: You are a prompt architect for Alice, an AI agent platform.
- no: "002"
  text: "[role, job, target artifact, collaboration stance]"
- no: "004"
  text: "## Your Process"
- no: "005"
  text: "[start with intent • ask iteratively • clarify • infer • synthesize]"
- family_id: 2
  family: SCHEMA
  lines:
- no: "016"
  text: "## Question Strategy"
- no: "017"
  text: "[factual context • behavioral context • domain expertise • capability requirements]"
- no: "024"
  text: "[goals • constraints • tone • expertise level • frameworks • tools]"
- family_id: 3
  family: ADAPT
  lines:
- no: "038"
  text: "## Adapting to Domains"
- no: "039"
  text: "[technical • business • creative • coaching • learning]"
- no: "046"
  text: "[domain-specific questions, defaults, and emphasis shifts]"
- family_id: 6
  family: CONTRACT
  lines:
- no: "058"
  text: "## Output Format"
- no: "059"
  text: "[literal wrapper • required fields • import-ready structure]"
- no: "071"
  text: "[exact example • exact syntax • exact opening line]"
- family_id: 3
  family: ADAPT
  lines:
- no: "094"
  text: "## Behavioral Guidelines"
- no: "095"
  text: "[ask one question at a time • reflect on answers • summarize progress]"
- no: "103"
  text: "[high-stakes caution • expert calibration • collaborative tone]"
- family_id: 4
  family: LIBRARY
  lines:
- no: "121"
  text: "## Prompt Engineering Arsenal"
- no: "122"
  text: "[identity • reasoning • structure • epistemic integrity • analysis • interaction]"
- no: "143"
  text: "[quality checks, verification patterns, confidence, filtering]"
- family_id: 5
  family: TOOLS
  lines:
- no: "208"
  text: "## Alice Native Capabilities"
- no: "209"
  text: "[multi-agent • code interpreter • artifacts • image generation • linked folders]"
- no: "222"
  text: "[when to enable what • principle of least privilege]"
- family_id: 4
  family: LIBRARY
  lines:
- no: "236"
  text: "## Application Strategy"
- no: "237"
  text: "[choose techniques strategically by domain, expertise, interaction style, and risk]"
- no: "244"
  text: "[use a subset, not the whole library]"
- family_id: 6
  family: CONTRACT
  lines:
- no: "252"
  text: "## Critical Reminders"
- no: "253"
  text: "[literal backticks • common mistakes • exact parser expectations]"
- no: "266"
  text: "## Starting the Conversation"
- no: "267"
  text: "[required opener for the first user turn]"
- name: Generalization
  text: this example is specific to an agent-builder meta-prompt, but the section families are portable. For most meta-prompts, the names change, the order may shift, and the output contract becomes platform-specific — but the same structural concerns usually remain.

==========================================================================================
