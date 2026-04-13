==========================================================================================
title: ai_devs_4_triggers-a6c3a053-a.png
diagram:
name: AGENT AUTONOMOUS TRIGGERS
sections:

- name: MESSAGES
  description: Agent or human sends a contextual payload.
  items:
- type: payload
  title: PAYLOAD
  content: |
  {
  "role": "user",
  "text": "summarize"
  }
- type: result
  label: Agent Replies
- name: HOOKS
  description: System internal event triggers an execution.
  items:
- type: event_emitter
  title: EVENT EMITTER
  content: |
  app.emit(
  'subagent.done',
  payload
  )
- type: result
  label: Agent Resolves Goal
- name: WEBHOOKS
  description: External 3rd-party pushes an HTTP update.
  items:
- type: http_post
  title: HTTP POST
  content: |
  POST /webhook
  {
  "cal_id": "ev_123"
  }
- type: result
  label: Updates Context
- name: CRON
  description: Time-based trigger that forces execution.
  items:
- type: scheduler
  title: SCHEDULER
  content: |
  cron("0 9 \* \* \*")
  forceRun()
- type: result
  label: Generates Report
- name: HEARTBEAT
  description: Time-based loop checking for specific conditions.
  items:
- type: scheduler
  title: SCHEDULER
  content: |
  every 30m
  checkState()
- type: decision
  label: needs act?
- type: result
  condition: yes
  label: Takes Action
- type: result
  condition: no
  label: Maintain Silence
  flow:
- actor: MESSAGES
  step: trigger
  content: PAYLOAD -> Agent Replies
- actor: HOOKS
  step: trigger
  content: EVENT EMITTER -> Agent Resolves Goal
- actor: WEBHOOKS
  step: trigger
  content: HTTP POST -> Updates Context
- actor: CRON
  step: trigger
  content: SCHEDULER -> Generates Report
- actor: HEARTBEAT
  step: trigger
  content: SCHEDULER -> needs act? -> yes -> Takes Action
- actor: HEARTBEAT
  step: trigger
  content: SCHEDULER -> needs act? -> no -> Maintain Silence

==========================================================================================
title: ai_devs_4_single_entry-b393496a-4.png
diagram:
name: SINGLE ENTRY POINT ARCHITECTURE
orchestrator:
name: Single Point of Entry
title: EVENT INGESTION
shared_foundation:
dynamic_agent_core: true
context_state:

- Session History
- Vault Memory
- Environment
  available_tools:
- Web Search
- Filesystem
- External Actions
  specialists:
- name: LLM Brain
  title: ENGINE
  role: Reasoning & Routing
  result:
  name: Adaptive Execution
  title: RESOLUTION
  communication_channels:
- MESSAGES
- HOOKS
- WEBHOOKS
- CRON
- HEARTBEAT
  lifecycle_flow:
- from: MESSAGES
  to: Single Point of Entry
- from: HOOKS
  to: Single Point of Entry
- from: WEBHOOKS
  to: Single Point of Entry
- from: CRON
  to: Single Point of Entry
- from: HEARTBEAT
  to: Single Point of Entry
- from: Single Point of Entry
  to: LLM Brain
- from: Session History
  to: LLM Brain
- from: Vault Memory
  to: LLM Brain
- from: Environment
  to: LLM Brain
- from: LLM Brain
  to: Web Search
- from: LLM Brain
  to: Filesystem
- from: LLM Brain
  to: External Actions
- from: LLM Brain
  to: Adaptive Execution
  sections:
- name: Inputs
  items:
- MESSAGES
- HOOKS
- WEBHOOKS
- CRON
- HEARTBEAT
- name: Event Ingestion
  items:
- EVENT INGESTION: Single Point of Entry
- name: Dynamic Agent Core
  items:
- ENGINE: LLM Brain
- Reasoning & Routing
- name: Context State
  items:
- Session History
- Vault Memory
- Environment
- name: Available Tools
  items:
- Web Search
- Filesystem
- External Actions
- name: Resolution
  items:
- Adaptive Execution

==========================================================================================
title: ai_devs_4_proactivity-127e7b77-7.png
diagram:
name: PROACTIVE SESSION ARCHITECTURE
notes:

- The main thread acts as an infinite, shared context stream. Heartbeat pulses inject directly into it to assess state, while Webhooks and Cron jobs run in strictly isolated, single-turn sessions.
  sections:
- name: PULSE GENERATORS
  items:
- content: |
  timer: every 30m
  run: read.tasks
- content: |
  timer: every 30m
  run: read.tasks
- name: PERSISTENT MAIN THREAD
  items:
- actor: USER
  content: Schedule execution for tomorrow
- actor: AGENT
  content: Done. Added task to memory.
- actor: SYSTEM HOOK
  content: check tasks.md for pending work
- actor: AGENT
  content: |
  No pending tasks require action right now.

```
        → SKIP
    - actor: USER
      content: Urgent: Review PR #42 today instead
    - actor: AGENT
      content: Updated task priority in memory.
    - actor: SYSTEM HOOK
      content: check tasks.md for pending work
    - actor: AGENT
      content: |
        Found: "review PR #42" — priority urgent.
        Exec: GitHub action review triggers

        → EXECUTE TASK
- name: ISOLATED SESSIONS
  items:
    - note: NO SHARED CONTEXT
      actor: WEBHOOK
      content: |
        POST /stripe/payment

        → Invoice paid
        → Update DB status
    - note: NO SHARED CONTEXT
      actor: CRON TIMER
      content: |
        0 9 * * 1

        → Run metrics script
        → Email weekly report
```

flow:

- actor: USER
  step: message
  content: Schedule execution for tomorrow
- actor: AGENT
  step: memory_update
  content: Done. Added task to memory.
- actor: SYSTEM HOOK
  step: pulse_injection
  content: check tasks.md for pending work
- actor: AGENT
  step: assessment
  content: No pending tasks require action right now.
- actor: AGENT
  step: result
  content: → SKIP
- actor: USER
  step: message
  content: Urgent: Review PR #42 today instead
- actor: AGENT
  step: memory_update
  content: Updated task priority in memory.
- actor: SYSTEM HOOK
  step: pulse_injection
  content: check tasks.md for pending work
- actor: AGENT
  step: assessment
  content: |
  Found: "review PR #42" — priority urgent.
  Exec: GitHub action review triggers
- actor: AGENT
  step: result
  content: → EXECUTE TASK
  legend:
- USER MESSAGE
- AGENT REASON/ACT
- PULSE INJECTION
- ISOLATED SUB-SYSTEM

==========================================================================================
title: aidevs_4_heartbeat_triggers-9540b47c-7.png
diagram:
name: HEARTBEAT CONVERGENCE TRIGGERS
sections:

- name: SPRINT CAPACITY CHECK
  items:
- type: TIME
  content:
  primary: 16:00 Friday
  secondary: Feb 21, 2026
- type: CONVERSATION
  content:
  text: '"Focus: auth refactor + API v2"'
  secondary: Last message: 2h ago
- type: LINEAR
  content:
  primary: In Progress: 8 · Todo: 3
  secondary: Sprint-7 ends Mon 9am
- type: MEMORY
  content:
  primary: Avg close rate: 4.2 tickets/day
  secondary: Last 4 sprints
- type: CALENDAR
  content:
  primary: 62h until deadline
  secondary: No meetings Sat/Sun
- type: DECISION LOGIC
  content: |
  tickets > capacity
  11 > (62h / 6h) = 10.3
  → MISMATCH
- type: EXECUTE
  content: |
  Surface prioritization UI: "Capacity: 10 tickets. Rank by impact." Draft Slack update with scope cuts.
- name: LOCATION-BASED INTENT MATCH
  items:
- type: CONVERSATION
  content:
  text: '"Catch up with Alice next time I’m in SF"'
  secondary: Mentioned: 11d ago
- type: LOCATION
  content:
  primary: 37.7749, -122.4194
  secondary: San Francisco · 14:23
- type: MEMORY
  content:
  primary: Alice Overment · [alice@overment.com](mailto:alice@overment.com)
  secondary: Last contact: 3 weeks ago
- type: CALENDAR
  content:
  primary: You: free until 17:00
  secondary: Alice: free 15:30–16:30 shared
- type: DEVICE STATE
  content:
  primary: Walking · Battery 67%
  secondary: No calls scheduled
- type: DECISION LOGIC
  content: |
  location == "SF" AND
  intent_exists AND
  overlap > 30min
  → CONDITION MET
- type: EXECUTE
  content: |
  Draft iMessage: "Hey! I’m in SF today. Free for coffee at 3:30pm?" with one-tap send + calendar hold.

==========================================================================================
title: ai_devs_4_context_driven-6dae2a3a-a.png
diagram:
name: SYSTEM ARCHITECTURE — COMPONENT STRUCTURE
external_services:
title: EXTERNAL SERVICES — TOOL DOMAINS
tools:

- name: Contacts
  description: People directory with preferences & relationships
- name: Places
  description: Venues with coordinates, hours & tags
- name: Calendar
  description: Event store, retrieval & management
- name: Web Search
  description: Fallback for ambiguous venue requests
- name: Routing
  description: Travel time by mode & distance
- name: Notifications
  description: Context-aware push alerts
  orchestrator:
  title: AGENT CORE — ORCHESTRATION LAYER
  name: LLM ORCHESTRATOR
  description: Reasoning engine with environment-aware context
  phases:
- Add Phase
- Notification Phase
  event_ingestion:
  title: EVENT INGESTION
  description: Single point of entry — all triggers converge here
  communication_channels:
- MESSAGES
- HOOKS
- WEBHOOKS
- CRON
- HEARTBEAT
  environment_layer:
  title: ENVIRONMENT LAYER — REAL-TIME STATE
  state:
- name: TIME
  primary: Current
  secondary: CET timezone
- name: LOCATION
  primary: Resolved
  secondary: Place ID + coords
- name: WEATHER
  primary: Live
  secondary: Temp, wind, precip
  lifecycle_flow:
- from: EXTERNAL SERVICES — TOOL DOMAINS
  to: LLM ORCHESTRATOR
- from: LLM ORCHESTRATOR
  to: EVENT INGESTION
- from: MESSAGES
  to: EVENT INGESTION
- from: HOOKS
  to: EVENT INGESTION
- from: WEBHOOKS
  to: EVENT INGESTION
- from: CRON
  to: EVENT INGESTION
- from: HEARTBEAT
  to: EVENT INGESTION
- from: EVENT INGESTION
  to: ENVIRONMENT LAYER — REAL-TIME STATE
  sections:
- name: External Services
  items:
- Contacts
- Places
- Calendar
- Web Search
- Routing
- Notifications
- name: Agent Core
  items:
- LLM ORCHESTRATOR
- Reasoning engine with environment-aware context
- Add Phase
- Notification Phase
- name: Event Ingestion
  items:
- Single point of entry — all triggers converge here
- MESSAGES
- HOOKS
- WEBHOOKS
- CRON
- HEARTBEAT
- name: Environment Layer
  items:
- TIME: Current
- LOCATION: Resolved
- WEATHER: Live

==========================================================================================
title: ai_devs_4_context_driven_runtime-4b9fc15f-9.png
diagram:
name: TWO-PHASE RUNTIME EXECUTION FLOW
sections:

- name: PHASE 1 — ADD EVENTS
  time: Wednesday 09:00–09:40
  items:
- type: EXTERNAL TRIGGER
  content: |
  User: "Take Anna for dinner... she loves sushi, find a good place"
- type: ENVIRONMENT SNAPSHOT
  content: |
  Time: 09:15 CET
  Location: p-home
  Weather: 10°C clear
- type: DATA ENRICHMENT
  content: |
  → search_contacts("Anna")
  Found: Anna Wiśniewska
  → web_search("sushi Kraków")
  Top result: Sakura Sushi (4.8★)
  → search_places("Sakura Sushi")
  Resolved: p-sakura, ul. Floriańska
- type: CALENDAR EVENT CREATED
  content: |
  Title: Dinner with Anna
  Time: Friday 19:00–21:00
  Location: Sakura Sushi, ul. Floriańska
  Guest: [anna.wisniewska@example.com](mailto:anna.wisniewska@example.com)
- type: note
  content: |
  3-hop enrichment: contact → web search → place lookup
- name: PHASE 2 — NOTIFICATIONS
  time: Thursday 13:15
  items:
- type: EXTERNAL TRIGGER
  content: |
  Webhook: Event "CoWork Meeting" at 14:00
- type: ENVIRONMENT SNAPSHOT
  content: |
  Time: 13:15 CET
  Location: p-trattoria (at lunch)
  Weather: 4°C rain, 20 km/h wind
- type: CONTEXT-AWARE ROUTING
  content: |
  → find_event("CoWork", 14:00)
  Found: Meeting at CoWork Kazimierz
  → get_route(p-trattoria, p-cowork)
  Walk: 10 min | Drive: 5 min
  → Weather check: rain + wind
  Adjust messaging for conditions
- type: PUSH NOTIFICATION SENT
  content: |
  Title: CoWork Meeting in 45 min
  Message: Leave by ~13:40. 10 min walk from Trattoria. Rain continues—bring umbrella.
- type: note
  content: |
  Routes from current location (restaurant), weather-aware messaging
  flow:
- actor: PHASE 1
  step: trigger
  content: User: "Take Anna for dinner... she loves sushi, find a good place"
- actor: PHASE 1
  step: environment_snapshot
  content: |
  Time: 09:15 CET
  Location: p-home
  Weather: 10°C clear
- actor: PHASE 1
  step: data_enrichment
  content: |
  → search_contacts("Anna")
  → web_search("sushi Kraków")
  → search_places("Sakura Sushi")
- actor: PHASE 1
  step: result
  content: |
  CALENDAR EVENT CREATED
  Title: Dinner with Anna
  Time: Friday 19:00–21:00
  Location: Sakura Sushi, ul. Floriańska
  Guest: [anna.wisniewska@example.com](mailto:anna.wisniewska@example.com)
- actor: PHASE 2
  step: trigger
  content: |
  Webhook: Event "CoWork Meeting" at 14:00
- actor: PHASE 2
  step: environment_snapshot
  content: |
  Time: 13:15 CET
  Location: p-trattoria (at lunch)
  Weather: 4°C rain, 20 km/h wind
- actor: PHASE 2
  step: context_aware_routing
  content: |
  → find_event("CoWork", 14:00)
  → get_route(p-trattoria, p-cowork)
  → Weather check: rain + wind
- actor: PHASE 2
  step: result
  content: |
  PUSH NOTIFICATION SENT
  Title: CoWork Meeting in 45 min
  Message: Leave by ~13:40. 10 min walk from Trattoria. Rain continues—bring umbrella.

==========================================================================================
title: ai_devs_4_browser-627d7a9b-0.png
diagram:
name: BROWSER AGENT — ARCHITECTURE
orchestrator:
name: OpenAI Responses API
title: LLM ORCHESTRATOR
phases:

- Read knowledge
- Act on web
- Persist results
  shared_foundation:
  instructions:
  title: INSTRUCTIONS
  file: instructions/{site}.md
  description: Selectors, recipes, URL patterns
  discoveries:
  title: DISCOVERIES
  file: "{site}-discoveries.md"
  description: Learned workarounds, fallbacks
  tools:
  browser:
  title: Browser
  subtitle: Playwright
  actions:
- evaluate
- navigate
- click
- type_text
  file_system:
  title: File System
  subtitle: MCP
  actions:
- fs_write
- fs_read
- fs_search
  lifecycle_flow:
- from: instructions/{site}.md
  to: OpenAI Responses API
  label: read
- from: OpenAI Responses API
  to: "{site}-discoveries.md"
  label: write
- from: OpenAI Responses API
  to: Browser
- from: OpenAI Responses API
  to: File System
- step: navigate()
  result: auto-saves pages/{slug}.txt + .struct.txt
- step: success
  result: SUCCESS → SILENT
- step: fail
  result: FAIL → SCREENSHOT
- step: repeat_fail
  result: REPEAT FAIL → SAVE DISCOVERY
- from: discoveries
  to: knowledge
  label: discoveries feed back into knowledge for next run
  sections:
- name: Knowledge Inputs
  items:
- title: INSTRUCTIONS
  content: |
  instructions/{site}.md
  Selectors, recipes, URL patterns
- title: DISCOVERIES
  content: |
  {site}-discoveries.md
  Learned workarounds, fallbacks
- name: Orchestrator
  items:
- LLM ORCHESTRATOR
- OpenAI Responses API
- Read knowledge
- Act on web
- Persist results
- name: Execution Tools
  items:
- title: Browser
  subtitle: Playwright
  actions:
- evaluate
- navigate
- click
- type_text
- title: File System
  subtitle: MCP
  actions:
- fs_write
- fs_read
- fs_search
- name: Runtime Rules
  items:
- navigate() → auto-saves pages/{slug}.txt + .struct.txt
- SUCCESS → SILENT
- FAIL → SCREENSHOT
- REPEAT FAIL → SAVE DISCOVERY
- ↑ discoveries feed back into knowledge for next run

==========================================================================================
title: ai_devs_4_browser_runtime-727cae04-3.png
diagram:
name: RUNTIME TRACE — GOODREADS EXTRACTION
sections:

- name: ORIENT
  items:
- id: T1
  steps:
- tool: fs_read
  content: 'path: "."'
  status: OK
- tool: fs_search
  content: '"goodreads" → instructions/'
  status: OK
- id: T2
  steps:
- tool: fs_read
  content: instructions/goodreads.md
  status: OK
- name: EXTRACT
  items:
- id: T3
  parallel: true
  steps:
- tool: navigate
  content: goodreads.com/search?q=Simon Sinek
  status: OK
- tool: navigate
  content: goodreads.com/search?q=Jim Collins
  status: OK
- id: T4
  steps:
- tool: evaluate
  content: Extract Jim Collins books
  result: 10 rows
- id: T5
  steps:
- tool: navigate
  content: goodreads.com/search?q=Simon Sinek
  status: OK
- id: note
  content: ↑ same extraction recipe, different page ↓
- id: T6
  steps:
- tool: evaluate
  content: Extract Simon Sinek books
  result: 10 rows
- name: PERSIST
  items:
- id: T7
  steps:
- tool: fs_write
  content: readings.md → create
  status: OK
- id: artifact
  title: ARTIFACT
  file: readings.md
  description: 12 books, 2 authors, structured markdown
  flow:
- actor: T1
  step: orient
  content: |
  fs_read path: "."
  fs_search "goodreads" → instructions/
- actor: T2
  step: orient
  content: fs_read instructions/goodreads.md
- actor: T3
  step: extract
  content: |
  navigate goodreads.com/search?q=Simon Sinek
  navigate goodreads.com/search?q=Jim Collins
- actor: T4
  step: extract
  content: evaluate Extract Jim Collins books
- actor: T5
  step: extract
  content: navigate goodreads.com/search?q=Simon Sinek
- actor: T6
  step: extract
  content: evaluate Extract Simon Sinek books
- actor: T7
  step: persist
  content: fs_write readings.md → create
  stats:
  turns: 8
  tool_calls: 9
  failures: 0
  tokens: 45k

==========================================================================================
title: ai_devs_4_teacher-59bb9c1d-1.png
diagram:
name: ENGLISH COACHING AGENT
sections:

- name: TOOL-CALLING LLM
  items:
- model: gemini-3-flash
  role: orchestration, analysis, feedback
- model: gemini-2.5-flash-tts
  role: speech synthesis
- name: TOOLS
  items:
- name: listen
  description: audio → structured analysis
- name: feedback
  description: analysis → text + spoken audio
- name: speak
  description: text → WAV (slow | normal)
- name: fs_read / fs_write
  description: profile, sessions, audio files
- name: AGENT LOOP
  items:
- name: MODEL TURN (MAX 15)
- name: output?
- branch: TOOL CALLS
  content: |
  beforeToolCall → capture input
  execute
  afterToolResult → track output
- note: ↑ results → next turn
- branch: TEXT ONLY
  content: |
  beforeFinish gate
- name: HOOKS
  items:
- title: PHASE TRACKING — 3 FLAGS PER AUDIO FILE
  flags:
- listened
- feedback
- saved
- content: |
  all 3 true → snapshot phase → reset → ready for next file
- title: BEFOREFINISH
  content: |
  incomplete?
  → block, re-loop

```
        complete?
        → allow exit

        errors?
        → exit immediately
    - title: ONSESSIONEND
      content: |
        always runs
        best effort

        missing audio
        missing session
        missing profile
- name: MEMORY
  items:
    - title: PROFILE
      content: |
        weakAreas[] append-only, cap 20
    - title: SESSIONS
      content: |
        recent 3 → injected into prompt
```

flow:

- actor: MODEL TURN (MAX 15)
  step: decision
  content: output?
- actor: TOOL CALLS
  step: execution
  content: |
  beforeToolCall → capture input
  execute
  afterToolResult → track output
- actor: TOOL CALLS
  step: next_turn
  content: ↑ results → next turn
- actor: TEXT ONLY
  step: gate
  content: beforeFinish gate
- actor: HOOKS
  step: phase_tracking
  content: listened, feedback, saved
- actor: HOOKS
  step: phase_transition
  content: all 3 true → snapshot phase → reset → ready for next file
  notes:
- ⚠ model has freedom — hooks have authority
