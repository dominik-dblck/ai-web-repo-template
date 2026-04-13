==========================================================================================
title: ai_devs_4_contextual-8aafd7e1-2.png
diagram:
name: AI CONTEXTUAL INTEGRATION
subtitle: broad perspective · non-interactive use
legend:

- Capability
- Tool / Platform
- Risk / Caution
  sections:
- name: PERSONAL
  items:
- name: OS / Desktop
  content: CLI scripts, schedulers, and programmable actions like AppleScript or deep links give agents direct access to system-level automation
- name: Mobile / Smart devices
  content: Reading sensor data like location, triggering Shortcuts, and running automations across smart home and mobile platforms
- name: Calendar
  content: Beyond meetings: availability signals for agents, event context for preparation, recaps, and task planning around scheduled activities
- name: Messaging
  content: Agents as participants: monitoring activity, feedback loops, and async collaboration across team and private channels
- name: Learning / Lifestyle
  content: AI as a skill coach: language practice, exploring new tools, and development companion that complements human teachers
- name: BUSINESS
  items:
- name: Sales tools / CRM
  content: Research, pipeline analysis, offer prep, and contact management. Highest financial leverage, but poor automation destroys relationships fast
- name: Email
  content: Thread organization, draft assistance, and personalized newsletters. A solid channel for async agent collaboration, not mass sends
- name: Task management
  content: Agents with clear roles and scoped access operating within project boards. Requires caution around prompt injection and permissions
- name: Remote repos
  content: Code review, ticket resolution, and mobile-first dev workflows. Real risks: token theft and supply chain attacks via injected prompts
- name: Content / Editors
  content: AI as quality control and creative support, not a replacement. CMS integration, image generation, and documentation management
- name: CROSS-CUTTING
  items:
- name: Internet / Web
  content: Social monitoring, RSS feeds, scraping, and tracking creators on YouTube or X. Read-focused integration with high value for topic awareness
- name: Graphics / Design
  content: Vision models paired with Figma, Blender, or game engines. Image generation precision is growing fast. Still early but moving quickly
  notes:
- AI works around direct interaction: reading context, acting on events, supporting rather than replacing. Risk scales with autonomy and access scope.

==========================================================================================
title: ai_devs_4_tool_stack-7a0914f8-8.png
diagram:
name: PERSONAL TOOL STACK
subtitle: mapping tools to daily needs
legend:

- Communication
- Content / Media
- Data / Research
- Dev / Infra
- Business Ops
- Productivity
  categories:
- name: Communication
  items:
- Gmail
- Slack / Discord / Telegram
- Resend
- SMS API
- ElevenLabs
- name: Content / Media
  items:
- Obsidian / iA Writer
- Replicate
- HTMLCSSToImage
- Dropshare / Uploadthing
- Google Docs / Sheets
- name: Data / Research
  items:
- Firecrawl
- YouTube / X API
- Google Maps
- Dub
- Tally
- name: Dev / Infrastructure
  items:
- GitHub
- Daytona / E2B / Sandbox SDK
- Convex / Supabase
- name: Business Operations
  items:
- Attio
- Easytools
- E-Signatures / Fakturownia / Quaderno
- name: Scheduling / Productivity
  items:
- Google Calendar
- Zencal
- Linear
- Google Drive
  notes:
- '→ Each tool was chosen for API access and webhook support, the two properties that make a tool agent-friendly. The question is never "can AI use this?" but "should it, and with what scope?"'

==========================================================================================
title: ai_devs_4_devices-a3f8cc93-8.png
diagram:
name: PERSONAL DEVICE PULSE — CAPABILITY SURFACE
legend:

- DESKTOP AGENT
- CORE ENGINE
- MOBILE APP
  sections:
- name: DESKTOP AGENT
  groups:
- name: PROCESS
  items:
- name: active app
  type: STRING
- name: window title
  type: STRING
- name: open windows
  type: LIST
- name: running processes
  type: LIST
- name: SYSTEM
  items:
- name: CPU / RAM usage
  type: FLOAT
- name: battery / power
  type: FLOAT
- name: screen on / locked
  type: BOOL
- name: idle time
  type: INT (S)
- name: AUDIO / INPUT
  items:
- name: audio output device
  type: STRING
- name: mic active
  type: BOOL
- name: camera active
  type: BOOL
- name: NETWORK
  items:
- name: network interface
  type: STRING
- name: bandwidth usage
  type: FLOAT
- name: CORE ENGINE
  groups:
- name: STATE MERGE
  items:
- unify context snapshot
- timestamp all fields
- delta detection
- name: RULE ENGINE
  items:
- threshold checks
- schedule (1 / 5 / 15 min)
- quiet hour guard
- priority routing
- name: NOTIFICATION POLICY
  items:
- suppress duplicates
- channel selector
- snooze / ack state
- name: STORAGE
  items:
- local SQLite log
- rule config (JSON)
- name: MOBILE APP
  groups:
- name: MOTION & LOCATION
  items:
- name: location class
  type: ENUM
- name: accelerometer
  type: VEC3
- name: activity type
  type: ENUM
- name: proximity / pocket
  type: BOOL
- name: POWER & CONNECTIVITY
  items:
- name: battery level
  type: FLOAT
- name: charging state
  type: BOOL
- name: wifi / cellular
  type: ENUM
- name: OS / FOCUS
  items:
- name: focus mode
  type: ENUM
- name: screen brightness
  type: FLOAT
- name: audio route
  type: ENUM
- name: screen on / locked
  type: BOOL
- name: OUTPUT
  items:
- name: TTS voice alert
  type: PUSH
- name: silent notification
  type: PUSH
- name: snooze / ack
  type: INPUT
  flow:
- actor: DESKTOP AGENT
  step: send capability signals
  content: PROCESS, SYSTEM, AUDIO / INPUT, NETWORK
- actor: CORE ENGINE
  step: process context
  content: STATE MERGE, RULE ENGINE, NOTIFICATION POLICY, STORAGE
- actor: MOBILE APP
  step: receive and return signals
  content: MOTION & LOCATION, POWER & CONNECTIVITY, OS / FOCUS, OUTPUT

==========================================================================================
title: ai_devs_4_isolation-c3c45b45-b.png
diagram:
name: AGENT ISOLATION MODEL — SWIM LANES WITH SHARED SURFACES
columns:

- AGENT
- INBOX / TRIGGER
- PROCESSING
- OUTPUT
- SURFACE
  legend:
- Read / Trigger
- Process
- Write / Output
- Shared Surface
  agents:
- name: Classifier
  role: clipboard events
  inbox_trigger: clipboard event
  processing: classify + extract
  output: tagged note
  surface: inbox/
- name: Reviewer
  role: file-watch trigger
  inbox_trigger: new file in inbox/
  processing: validate + enrich
  output: move to ready/
  surface: ready/
- name: Publisher
  role: scheduled check
  inbox_trigger: scan ready/
  processing: QA checks + format
  output: publish or flag
  surface: published/
- name: Digest
  role: daily cron
  inbox_trigger: read all surfaces
  processing: aggregate + rank
  output: daily summary
  surface: digest/
  shared_surfaces:
- inbox/
- ready/
- published/
- digest/
  notes:
- id: "01"
  text: No direct agent-to-agent communication. Each agent reads from a surface and writes to a surface. The next agent discovers work by watching its own trigger — not by receiving a message.
- id: "02"
  text: Loose coupling through artifacts. The Classifier doesn't know the Reviewer exists. The Reviewer doesn't know who created the file. Agents share surfaces, not state.
- id: "03"
  text: Adding a new agent never breaks existing ones. A new module simply watches a surface. No existing agent needs reconfiguration — the system grows by accretion, not by rewiring.

==========================================================================================
title: ai_devs_self-observing-system-1c5aa317-0.png
diagram:
name: SELF-OBSERVING SYSTEM
running_agents:

- name: Digest
  trigger: daily cron
  output: newsletter sent
- name: Signal Listener
  trigger: source polling
  output: feed items
- name: Classifier
  trigger: clipboard events
  output: tagged notes
- name: Publisher
  trigger: scheduled check
  output: published docs
  monitor_agent:
  name: Monitor Agent
  mode: periodic · LLM-as-judge
  checks:
- output volume
- delivery rate
- open / read rate
- source availability
- queue depth
  detected_issues:
- repeated failures
- source unreachable
  task_routing:
- route: AUTO-ACTION
  result:
  title: System acts
  items:
- mark source unreachable
- pause zero-output agent
- throttle high-volume agent
- route: HUMAN GATE
  result:
  title: Flagged for review
  items:
- newsletter nobody reads
- source offline 3+ days
- agent producing noise
  lifecycle_flow:
- actor: RUNNING AGENTS
  step: produce outputs
  content:
- newsletter sent
- feed items
- tagged notes
- published docs
- actor: Monitor Agent
  step: evaluate system behavior
  content:
- output volume
- delivery rate
- open / read rate
- source availability
- queue depth
- actor: AUTO-ACTION
  step: system acts
  content:
- mark source unreachable
- pause zero-output agent
- throttle high-volume agent
- actor: HUMAN GATE
  step: flagged for review
  content:
- newsletter nobody reads
- source offline 3+ days
- agent producing noise
  memory_flow:
- findings feed back into agent config and source registry
