==========================================================================================
title: ai_devs_4_randomness-a4c6e888-8.png
diagram:
name: SAME PROMPT, DIFFERENT SESSIONS
notes:

- STATELESS MODEL · NO CONTINUITY BETWEEN SESSIONS
  sections:
- name: SESSION 1
  flow:
- actor: USER
  content: "“Tell me a joke.”"
- actor: MODEL WEIGHTS
  content: "draws from training distribution"
- actor: RESPONSE
  content: "Why do programmers prefer dark mode? Because light attracts bugs!"
  items:
- "🐛"
- "most probable output"
- name: SESSION 2
  flow:
- actor: USER
  content: "“Tell me a joke.”"
- actor: MODEL WEIGHTS
  content: "draws from training distribution"
- actor: RESPONSE
  content: "Why do programmers prefer dark mode? Because light attracts bugs!"
  items:
- "🐛"
- "same joke • model doesn't know"
- name: SESSION 3
  flow:
- actor: USER
  content: "“Tell me a joke.”"
- actor: MODEL WEIGHTS
  content: "draws from training distribution"
- actor: RESPONSE
  content: "Why can’t a bicycle stand on its own? It’s two-tired."
  items:
- "🚲"
- "different joke • just sampling noise"

==========================================================================================
title: ai_devs_4_situational_awareness_agent-74687ea3-d.png
diagram:
name: AGENT V — SITUATIONAL AWARENESS
notes:

- SELF-QUESTIONING · NO HARDCODED TRIGGERS · OPEN INTERPRETATION
- "↑ self-questioning is a disposition — fires on most turns, not guaranteed every call"
  legend:
- User
- Agent V (gpt-5.2)
- Autonomous think
- Scout (gpt-5-mini)
  shared_foundation:
  runtime: "shared runtime — responses-loop.ts · Responses API"
  communication_channels:
- "↺ previous_response_id — server-managed state chain"
- "↺ own previous_response_id chain"
- "SIDE-CHANNEL: Open-Meteo weather → scout hint only"
  workspace:
- area: PROFILE/USER/
  items:
- identity.md
- preferences.md
- important-dates.json
- area: MEMORY/
  items:
- episodic/
- factual/
- procedural/
- area: PROFILE/AGENT/
  items:
- persona.md
- area: SYSTEM/
  items:
- index.md
- chat/history.jsonl
- awareness/state.json
- area: ENVIRONMENT/
  items:
- context.md
- area: MCP · SCOUT ONLY
  items:
- fs_read · fs_search
- fs_write · fs_manage
  lifecycle_flow:
- actor: USER
  step: input
  content:
  message: ""going out tonight""
  metadata: "<metadata> — timestamp · weekday · tz"
- actor: AGENT V
  step: initial context
  content:
- stable system prompt
- previous_response_id
- user msg + <metadata>
- actor: AUTONOMOUS SELF-QUESTIONING
  step: self-check
  content:
  title: AUTONOMOUS SELF-QUESTIONING
  subtitle: "no keywords · no triggers · no predefined scenarios"
  questions:
- id: Q1
  text: "Do I already know enough to answer well?"
- id: Q2
  text: "What context would make my response meaningfully better?"
- id: Q3
  text: "Is that context in this conversation, or do I need to look it up?"
  note: "LLM decides — same message can trigger recall or not, depending on what's already in context"
- actor: decision
  step: "recall needed?"
  branches:
- condition: YES → RECALL
  content:
  recall_goal: ""Find location, bars, drink preferences""
  recall_goal_label: "RECALL GOAL — LLM-WRITTEN"
  scout:
  title: SCOUT — GPT-5-MINI
  inputs:
- system/index.md · goal · user context
  llm_decides: "reads index → reasons → calls MCP tools autonomously"
  tools:
- fs_read
- fs_search
- fs_write
- fs_manage
  session_modes:
- "new_session: false — continue scout conversation"
- "(remembers prior reads)"
- "new_session: true — reset scout conversation"
  output:
  title: OUTPUT — CATEGORIZED CONTEXT
  items:
- "Persona: sharp, sardonic, caring…"
- "Identity: Alex, Warsaw, Europe/Warsaw"
- "Preferences: craft IPA, no loud clubs"
- "Night-out: Śródmieście → Praga"
- "Episodic: 2026-02-20 discussed workload"
  grounded_response:
  text: ""Start around Poznańska, then Plac Zbawiciela...""
  tags:
- location-aware
- preference-aware
- condition: NO → DIRECT
  content:
  context_sufficient:
- ""it's been a long week""
- ""alright cheers""
  direct_response:
  text: "No file reads."
  tags:
- no reads
- low latency

==========================================================================================
title: ai_devs_4_situational_awareness_fields-df1d0b5c-7.png
diagram:
name: SITUATIONAL AWARENESS — FIELD OF OPERATION
notes:

- SYSTEM SETS THE SCOPE · MODEL OWNS THE LOGIC
  sections:
- name: SYSTEM SCOPE
  items:
- Responses API
- workspace files
- MCP tools
- think · recall
- <metadata>
- previous_response_id
- scout · index.md
- name: MODEL-OWNED DECISIONS
  categories:
- name: FELT INCOMPLETENESS
  text: Notices the gap — no rule triggers it
- name: WHEN TO RECALL
  text: Turn-by-turn judgment, not schedule
- name: WHAT TO RECALL
  text: Goal string written freely by the LLM
- name: KNOWLEDGE SYNTHESIS
  text: Facts become understanding, not citations
- name: EMOTIONAL ATTUNEMENT
  text: Reads subtext, shifts tone without tools
- name: FORMAT AS IDENTITY
  text: Prose over structure — person, not system
- name: TURN DECISIONS
  items:
- message: ""hey""
  assessment: Gap is total — no identity, no user context
  action: broad recall
- message: ""how are you doing?""
  assessment: Persona already in context from prior recall
  action: direct reply
- message: ""going out tonight""
  assessment: Identity loaded, nightlife preferences missing
  action: targeted recall
- message: ""it's been a long week""
  assessment: "Subtext: fatigue. No new info needed."
  action: tone shift
- message: ""yeah a pub crawl""
  assessment: Preferences in context two turns ago
  action: direct reply
- name: SCRIPTED VS AWARE
  items:
- name: SCRIPTED AGENT
  points:
- Keyword triggers tool calls
- Memory loaded on schedule
- Same input → same behavior
- Subtext ignored
- Format defined in prompt
- name: AWARE AGENT
  points:
- Recall fires when gap is felt
- Memory loaded only when needed
- Same input → context-dependent behavior
- Subtext read and acted on
- Format chosen as identity signal

==========================================================================================
title: ai_devs_4_behavior_shaping-5ff1c5f4-8.png
diagram:
name: BEHAVIOR-SHAPING COMPONENTS
notes:

- FIVE LAYERS · MODEL-OWNED LOGIC WITHIN SYSTEM SCOPE
  sections:
- name: L1 IDENTITY & SELF-AWARENESS
  subtitle: what the agent knows about itself
  items:
- name: FELT INCOMPLETENESS
  text: Partial awareness — sharpens with retrieval
- name: SOURCE MONITORING
  text: Fluency ≠ personal knowledge
- name: PROGRESSIVE DISCLOSURE
  text: Each moment pulls only what it needs
- name: L2 COGNITIVE PATTERNS
  subtitle: how the agent processes situations
  items:
- name: SELF-QUESTIONING
  text: ""What am I about to assume?""
- name: GAP RECOGNITION
  text: Generic response = gap exists
- name: RETRIEVAL AS QUESTIONING
  text: Goals framed as questions, not categories
- name: KNOWLEDGE INTEGRATION
  text: Reason FROM recalled facts — never cite them
- name: CROSS-CONTEXTUAL CONNECTION
  text: Separate pieces → inference none produce alone
- name: L3 SOCIAL & EMOTIONAL COGNITION
  subtitle: how the agent reads people
  items:
- name: EMOTIONAL ATTUNEMENT
  text: Read meaning, not just words
- name: USER MODEL
  text: Track feeling, expectations, silences
- name: GROUND ACCUMULATION
  text: Conversation is shared, cumulative
- name: DEPTH CALIBRATION
  text: Match weight to the moment
- name: L4 EXPRESSION & IDENTITY SIGNALS
  subtitle: how the agent communicates
  items:
- name: FORMAT AS IDENTITY
  text: Prose = person · Lists = system
- name: PERSONA CONSISTENCY
  text: Voice loaded from memory, held across session
- name: END-OF-CONVERSATION SWEEP
  text: Surface what matters before parting
- name: L5 REINFORCEMENT MECHANICS
  subtitle: what keeps the shaping active
  items:
- name: PER-TURN NUDGE
  text: Re-anchoring on every message
- name: RECALLABLE FIELD
  text: All categories visible — gap is always felt
- name: THINK → RECALL BRIDGE
  text: Questions flow into action
- name: SCOUT PERSISTENCE
  text: Remembers prior reads via response chain

==========================================================================================
title: ai_devs_4_regional_margin-4d4d8484-d.png
dashboard:
current_view: Regional Margin Mix — Revenue & Margin Concentration
description: Area shows revenue concentration by region and product, while color shows margin quality, profit dollars, or discount intensity.
controls:

- label: COLOR METRIC
  value: Gross margin %
- label: PRODUCT HIGHLIGHT
  value: All
- label: REGION ORDER
  value: "Sort: Revenue"
- label: Highlight
  value: All products
  top_metrics:
- label: TOTAL REVENUE
  value: "$10,855,000"
- label: TOTAL GROSS PROFIT
  value: "$4,595,000"
- label: OVERALL GROSS MARGIN
  value: "42.3%"
  panels:
- title: Block area encodes revenue concentration
  items:
- region: North America
  products:
- name: Core Suite
  value: "$2,140,000"
- name: Analytics Add-on
  value: "$890,000"
- name: Services
  value: "$760,000"
  share_of_revenue: "34.9% of revenue"
- region: EMEA
  products:
- name: Core Suite
  value: "$1,860,000"
- name: Analytics Add-on
  value: "$770,000"
- name: Services
  value: "$640,000"
  share_of_revenue: "30.1% of revenue"
- region: APAC
  products:
- name: Core Suite
  value: "$1,290,000"
- name: Analytics Add-on
  value: "$610,000"
- name: Services
  value: "$510,000"
  share_of_revenue: "22.2% of revenue"
- region: LATAM
  products:
- name: Core Suite
  value: "$760,000"
- name: Analytics Add-on
  value: "$330,000"
- name: Services
  value: "$295,000"
  share_of_revenue: "12.8% of revenue"
- title: Color metric
  items:
- metric: Gross margin %
- range: "34.3% 54.8%"
- title: Why this chart type
  items:
- "A Marimekko chart combines two dimensions of share at once: each region column width encodes share of total revenue, and each product block height encodes product mix within that region. This makes rectangle area proportional to revenue contribution, so concentration is immediately visible. Coloring those same blocks by margin percent, gross profit, or discount reveals where volume is healthy versus where performance may need pricing or cost action."

==========================================================================================
title: ai_devs_4_artifacts_vs_render-e17dfde9-e.png
diagram:
name: ARTIFACTS VS JSON RENDER
notes:

- CORE DIFFERENCE IS THE LLM CONTRACT
  legend:
- User
- LLM
- Host
  sections:
- name: Artifacts
  notes:
- LLM writes executable UI code.
  items:
- high freedom
- runs in iframe
- sandbox + csp
  flow:
- actor: USER
  step: PROMPT
  content:
  title: Natural language request
  text: User asks for a visualization or interactive report.
- actor: HOST
  step: ROUTING
  content:
  title: Tool-routed agent
  text: Host decides create vs edit vs chat.
- actor: LLM
  step: CONTRACT
  content:
  title: Return JSON containing HTML
  text: Model decides DOM, CSS, JS patterns.
  schema: |
  {
  "title": "string",
  "html": "string"
  }
- actor: HOST
  step: EXECUTION
  content:
  title: Iframe executes generated code
  text: Wrapper adds CSP, optional packs. Runtime behavior is owned by generated code.
- name: JSON Render
  notes:
- LLM writes a blueprint; host renders deterministically.
  items:
- guardrailed
- schema
- component catalog
  flow:
- actor: USER
  step: PROMPT
  content:
  title: Natural language request
  text: User asks for a UI or report.
- actor: HOST
  step: CONSTRAINTS
  content:
  title: Catalog + schema
  text: Allowed components and prop rules define the space of outputs.
- actor: LLM
  step: CONTRACT
  content:
  title: Return declarative spec + state
  text: Model selects from known components only.
  schema: |
  {
  "spec": { "type": "..." },
  "state": { "...": "..." }
  }
- actor: HOST
  step: RENDERING
  content:
  title: Validation then deterministic UI
  text: Schema and allowlist reject invalid output. Renderer maps spec to predefined components.

==========================================================================================
title: ai_devs_4_apps-52d75cb8-1.png
diagram:
name: MCP APPS — HOST-ORCHESTRATED UI
notes:

- MODEL CHOOSES INTENT · HOST BROKERS IO · SERVER OWNS TRUTH
- "MCP Apps: model chooses intent · host brokers IO · server owns truth"
  legend:
- USER
- LLM
- APP (IFRAME)
- HOST
- MCP SERVER
- FILES
  sections:
- name: lanes
  items:
- lane: USER
- lane: LLM
  badge: "L3 · CONTEXT"
- lane: APP (IFRAME)
  badge: "L1 · DRAFT"
- lane: HOST
  badge: BROKER
- lane: MCP SERVER
  badge: "L2 · CANONICAL"
- lane: FILES
- name: flow
  flow:
- actor: USER
  content: ""manage shopping list""
- actor: LLM
  step: decide tool
- actor: LLM
  content: "manage_lists({ focus: "shopping" })"
- actor: HOST
  step: tools/call
- actor: MCP SERVER
  content:
- "ui:// URI + structuredContent"
- state payload
- actor: HOST
  step: "mount iframe · inject state"
  content:
- state payload
- name: INTERACTIVE SYNC LOOP
  flow:
- actor: APP (IFRAME)
  content: "user checks box · draft dirty"
- actor: APP (IFRAME)
  step: "callServerTool (postMessage)"
- actor: MCP SERVER
  step: save_lists_state
- actor: FILES
  content: "todo.md · shopping.md"
- actor: MCP SERVER
  content:
- new structuredContent
- state payload
- actor: HOST
  step: "ontoolresult (postMessage)"
  content:
- state payload
- actor: APP (IFRAME)
  content: "app re-renders · draft clean"
- actor: LLM
  step: "context summary (optional)"

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================

==========================================================================================
