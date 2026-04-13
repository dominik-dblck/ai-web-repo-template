==========================================================================================
title: ai_devs_4_capabilities-a90266fe-6.png
diagram:
name: WONDERLANDS - ARCHITECTURE OVERVIEW
sections:

- name: top_actions
  items:
- send message
- attach files
- pick agent
- approve actions
- branch conversation

orchestrator:
name: Conversation Interface
category: CLIENT
items:

- name: Composer
  content: input + attachments
- name: Chat Store
  content: state machine
- name: Materializer
  content: events → blocks
- name: Block Renderer
  content: blocks → UI

communication_channels:

- HTTP · USER MESSAGES
- SSE · LIVE EVENT STREAM

shared_foundation:
name: Agent Brain
category: SERVER
items:

- name: HTTP API
  content: routes
- name: Commands
  content: business logic
- name: Runtime Engine
  content: job / run loop
- name: Agent System
  content: profiles · delegation
- name: Event Store
  content: append-only log

lifecycle_flow:

- actor: USER
  step: request
  content: Research this topic and write a blog post
- actor: ORCHESTRATOR
  step: delegation
  content: Delegates subtasks → waits
- actor: RESEARCH AGENT
  step: research
  content: Searches web → returns findings
- actor: WRITER AGENT
  step: writing
  content: Writes post → returns draft
- actor: ORCHESTRATOR
  step: response
  content: Combines results → replies to user

notes:

- ↑ parent waits · child result = parent input · all nested inside one message

specialists:

- name: Research Agent
  role: Searches web → returns findings
- name: Writer Agent
  role: Writes post → returns draft

capabilities:

- Run Code
- Browse Web
- Search
- Generate Images
- Manage Files
- Publish Sites
- External Apps

publishable_websites:
name: GARDENS - PUBLISHABLE WEBSITES
flow:

- actor: STORAGE
  step: Vault
  content: markdown files + assets
- actor: CONFIG
  step: \_garden.yml
  content: title · nav · sections
- actor: BUILD
  step: Static Site
  content: auto on file change
- actor: PUBLISH
  step: Live on Web
  content: public · protected · private

==========================================================================================
title: ai_devs_content-ebf6decb-e.png
diagram:
name: WONDERLANDS - CONTENT FLOW
flow:

- actor: INPUT
  step: Chat Client
  content: user prompt
- actor: INPUT
  step: Background Jobs
  content: scheduled · triggered
- actor: PROCESSING
  step: Agentic Logic
  content: plan · execute · delegate
- actor: STORAGE
  step: Filesystem
  content: vault · markdown files
- actor: OUTPUT
  step: Digital Garden
  content: static web page
  lifecycle_flow:
- from:
  actor: INPUT
  step: Chat Client
  to:
  actor: PROCESSING
  step: Agentic Logic
- from:
  actor: INPUT
  step: Background Jobs
  to:
  actor: PROCESSING
  step: Agentic Logic
- from:
  actor: PROCESSING
  step: Agentic Logic
  to:
  actor: STORAGE
  step: Filesystem
- from:
  actor: STORAGE
  step: Filesystem
  to:
  actor: OUTPUT
  step: Digital Garden
  label: build

==========================================================================================
title: ai_devs_4_team-c69fd902-e.png
diagram:
name: WONDERLANDS - AGENT ECOSYSTEM
input:

- name: Chat
  type: INPUT
- name: Scheduled Jobs
  type: INPUT

orchestrator:
name: Orchestrator
type: COORDINATOR

shared_foundation:
name: Filesystem / Vault
type: SHARED KNOWLEDGE BASE
items:

- notes
- memories
- procedures
- history
- goals
- assets

specialists:

- name: Researcher
  type: AGENT
  description: gathers & stores knowledge
  tools:
- web search
- browse
- summarize
- read / write

```
- name: Memory Manager
  type: AGENT
  description: organizes & deduplicates vault
  tools:
    - search
    - deduplicate
    - structure
    - index

- name: Daily Ops
  type: AGENT
  description: morning briefing from life context
  tools:
    - calendar
    - email
    - todos
    - digest

- name: Writer
  type: AGENT
  description: long-form content from knowledge
  tools:
    - articles
    - newsletters
    - image gen

- name: Media Producer
  type: AGENT
  description: audio & visual content generation
  tools:
    - TTS
    - image gen
    - podcast
    - run code

- name: Publisher
  type: AGENT
  description: builds & deploys digital garden
  tools:
    - build site
    - publish
    - versioning
```

communication_channels:

- from: Chat
  to: Orchestrator
- from: Scheduled Jobs
  to: Orchestrator
- from: Orchestrator
  to: Filesystem / Vault
- from: Researcher
  to: Chat
- from: Memory Manager
  to: Orchestrator
- from: Daily Ops
  to: Filesystem / Vault
- from: Writer
  to: Scheduled Jobs
- from: Media Producer
  to: Orchestrator
- from: Publisher
  to: Filesystem / Vault

==========================================================================================
title: ai_devs_4_structure-e6da682e-4.png
diagram:
name: WONDERLANDS - MODULE MAP
sections:

- name: CLIENT - APPS/CLIENT/SRC/
  categories:
- name: lib/stores/
  label: STATE
  description: All reactive state for a conversation. The chat store is the central state machine - it handles submitting messages, consuming the SSE stream, and tracking run status.
  items:
- view-store
- composer-attachments
- typewriter
- background-activity
- theme

```
    - name: lib/runtime/
      label: STREAM PROCESSING
      description: Converts the raw event stream into visible blocks. Handles streaming markdown, scroll control, and batching rapid updates into smooth UI frames.
      items:
        - materialize
        - streaming-markdown
        - parse-blocks
        - scroll-controller
        - coalesce-events

    - name: lib/services/
      label: API + TRANSPORT
      description: All communication with the server. SSE client handles reconnection with cursor-based replay. API modules cover threads, runs, agents, files, and gardens.
      items:
        - sse
        - api/streaming
        - api/threads
        - runs
        - agents
        - gardens
        - mcp
        - auth
        - markdown pipeline

    - name: components/
      label: UI
      description: Everything the user sees. Blocks render the live assistant output. Composer handles input. Message list virtualizes the scroll.
      subcategories:
        - name: blocks/
          description: Renders each piece of assistant output - text, tool calls, delegation, thinking, web search. BlockRenderer groups and animates them.
        - name: composer/
          description: Message input with file attachments, agent picker, and rich text editor.
        - name: message-list/
          description: Virtualized scroll list of messages, each with status dot and actions.
      items:
        - command-palette/
        - agents/
        - garden/
        - prompt-editor/
        - Supporting UI - keyboard shortcuts, agent config forms, garden settings, rich text editor.

- name: SHARED - PACKAGES/
  categories:
    - name: contracts/
      label: SHARED TYPES
      description: Single source of truth for all event types shared between client and server. If a new event is added to the server, it must be declared here first.
      items:
        - BackendEvent union
        - BACKEND_EVENT_TYPES
        - blocks
        - agents
        - garden
        - files
        - api types

    - name: sandbox-runtime-lo/
      label: RUNS INSIDE SANDBOX
      description: The code that actually executes inside isolated sandbox environments. Handles JS and bash modes, and communicates results back to the host server.

- name: SERVER - APPS/SERVER/SRC/
  categories:
    - name: adapters/
      label: ENTRY POINTS
      description: Everything that touches the outside world - HTTP routes, AI provider clients, MCP gateway, sandbox runner, browser automation, blob storage.
      subcategories:
        - name: http/routes/v1/
          description: REST API surface. Key routes: start interaction, SSE stream, cancel/resume run, approve/reject tool actions, branch thread.
        - name: ai/
          description: Provider adapters that normalize OpenAI, Google, and OpenRouter into a single streaming interface.
        - name: mcp/ · sandbox/ · kernel/ · blob/
          description: External integrations - MCP tool gateway, Deno/Node sandbox runner, Playwright browser, file storage.

    - name: application/
      label: BUSINESS LOGIC
      description: The heart of the server. Orchestrates everything: commands enter here, the runtime engine executes agent turns, tools fire, events are emitted.
      subcategories:
        - name: commands/
          description: Entry points for user actions. Each command send message, resume, cancel, branch creates or modifies jobs and runs.
        - name: runtime/
          description: The execution engine. A worker picks ready jobs, claims a run, drives the agent turn loop - load context, call model, execute tools, persist output, repeat.
        - name: interactions/
          description: Assembles the full model request - conversation history, agent instructions, available tools, file attachments - then calls the AI provider and streams the response.
        - name: agents/
          description: Agent resolution, profile prompts, delegation spawning child runs, and native tool registration.
        - name: events/
          description: Append-only event store → outbox worker → realtime relay → SSE route. Every action in the system produces events; this is how the client stays in sync.
      items:
        - sandbox/
        - garden/
        - kernel/
        - memory/
        - naming/
        - images/
        - files/
        - workspaces/
        - Supporting services - code execution, site builds, browser automation, memory extraction, thread naming, image generation, file management.

    - name: domain/
      label: PURE ENTITIES + REPOS
      description: Framework-free types, interfaces, and repository contracts. No business logic here - just the shape of things: runs, jobs, agents, events, files, sessions, memory.

    - name: db/
      label: SQLITE + MIGRATIONS
      description: Database client, migration runner, and all table schemas. One SQLite file per instance. Schema covers every domain entity.
```

==========================================================================================
title: ai_devs_4_structure-e6da682e-4.png
diagram:
name: WONDERLANDS - MODULE MAP
sections:

- name: CLIENT - APPS/CLIENT/SRC/
  categories:
- name: lib/stores/
  label: STATE
  description: All reactive state for a conversation. The chat store is the central state machine - it handles submitting messages, consuming the SSE stream, and tracking run status.
  items:
- view-store
- composer-attachments
- typewriter
- background-activity
- theme

```
    - name: lib/runtime/
      label: STREAM PROCESSING
      description: Converts the raw event stream into visible blocks. Handles streaming markdown, scroll control, and batching rapid updates into smooth UI frames.
      items:
        - materialize
        - streaming-markdown
        - parse-blocks
        - scroll-controller
        - coalesce-events

    - name: lib/services/
      label: API + TRANSPORT
      description: All communication with the server. SSE client handles reconnection with cursor-based replay. API modules cover threads, runs, agents, files, and gardens.
      items:
        - sse
        - api/streaming
        - api/threads
        - runs
        - agents
        - gardens
        - mcp
        - auth
        - markdown pipeline

    - name: components/
      label: UI
      description: Everything the user sees. Blocks render the live assistant output. Composer handles input. Message list virtualizes the scroll.
      subcategories:
        - name: blocks/
          description: Renders each piece of assistant output - text, tool calls, delegation, thinking, web search. BlockRenderer groups and animates them.
        - name: composer/
          description: Message input with file attachments, agent picker, and rich text editor.
        - name: message-list/
          description: Virtualized scroll list of messages, each with status dot and actions.
      items:
        - command-palette/
        - agents/
        - garden/
        - prompt-editor/
        - keyboard shortcuts
        - agent config forms
        - garden settings
        - rich text editor

- name: SHARED - PACKAGES/
  categories:
    - name: contracts/
      label: SHARED TYPES
      description: Single source of truth for all event types shared between client and server. If a new event is added to the server, it must be declared here first.
      items:
        - BackendEvent union
        - BACKEND_EVENT_TYPES
        - blocks
        - agents
        - garden
        - files
        - api types

    - name: sandbox-runtime-lo/
      label: RUNS INSIDE SANDBOX
      description: The code that actually executes inside isolated sandbox environments. Handles JS and bash modes, and communicates results back to the host server.

- name: SERVER - APPS/SERVER/SRC/
  categories:
    - name: adapters/
      label: ENTRY POINTS
      description: Everything that touches the outside world - HTTP routes, AI provider clients, MCP gateway, sandbox runner, browser automation, blob storage.
      subcategories:
        - name: http/routes/v1/
          description: REST API surface. Key routes: start interaction, SSE stream, cancel/resume run, approve/reject tool actions, branch thread.
        - name: ai/
          description: Provider adapters that normalize OpenAI, Google, and OpenRouter into a single streaming interface.
        - name: mcp/ · sandbox/ · kernel/ · blob/
          description: External integrations - MCP tool gateway, Deno/Node sandbox runner, Playwright browser, file storage.

    - name: application/
      label: BUSINESS LOGIC
      description: The heart of the server. Orchestrates everything: commands enter here, the runtime engine executes agent turns, tools fire, events are emitted.
      subcategories:
        - name: commands/
          description: Entry points for user actions. Each command send message, resume, cancel, branch creates or modifies jobs and runs.
        - name: runtime/
          description: The execution engine. A worker picks ready jobs, claims a run, drives the agent turn loop - load context, call model, execute tools, persist output, repeat.
        - name: interactions/
          description: Assembles the full model request - conversation history, agent instructions, available tools, file attachments - then calls the AI provider and streams the response.
        - name: agents/
          description: Agent resolution, profile prompts, delegation spawning child runs, and native tool registration.
        - name: events/
          description: Append-only event store → outbox worker → realtime relay → SSE route. Every action in the system produces events; this is how the client stays in sync.
      items:
        - sandbox/
        - garden/
        - kernel/
        - memory/
        - naming/
        - images/
        - files/
        - workspaces/

    - name: domain/
      label: PURE ENTITIES + REPOS
      description: Framework-free types, interfaces, and repository contracts. No business logic here - just the shape of things: runs, jobs, agents, events, files, sessions, memory.

    - name: db/
      label: SQLITE + MIGRATIONS
      description: Database client, migration runner, and all table schemas. One SQLite file per instance. Schema covers every domain entity.
```

==========================================================================================
title: ai_devs_4_mechanics-1775671510.png
diagram:
name: WONDERLANDS - HOW IT WORKS
legend:

- client
- server / delegation
- focal point / success
- waiting / paused
- error / alert

sections:

- name: CLIENT
  items:
- type: USER ACTION
  name: Chat Composer
  content: User types, attaches files, picks an agent. Chat store creates an optimistic message locally and fires the submit.

```
- name: SERVER
  items:
    - type: COMMAND
      name: start-thread-interaction
      content: Resolves which agent answers. Creates a Job durable intent and a Run execution attempt. Wakes the worker. Emits run.created.
    - type: AGENT RESOLUTION
      name: Who answers?
      content: Explicit pick • account default • plain assistant. Bound to an immutable agent revision - behavior is reproducible even after the agent is edited later.

- name: TURN LOOP - THE ENGINE
  items:
    - type: JOB / RUN
      name: The execution loop
      content: A Job is the durable intent. A Run is one attempt. The worker claims the run and repeats turns until the model produces a final response with no more tool calls.
      steps:
        - number: 1
          name: Load context
          content: history + agent instructions + tool schemas
        - number: 2
          name: Call model
          content: stream response, persist output items, emit stream.delta
        - number: 3
          name: Execute tools
          content: if model called tools → run them → feed results back → repeat
        - number: 4
          name: Final text
          content: no more tool calls → persist durable message → exit loop
      notes:
        - ↑ repeats until no tool calls remain - one message = many turns
        - Tool types - what happens after the call:
        - immediate → result → continue
        - waiting → run pauses → resumes when done
        - approval - user must accept/reject first

- name: WAITING TOOL
  items:
    - name: Delegation - agents calling agents
      content: Parent calls delegate_to_agent. Server spawns a child Job + Run. Parent enters waiting. Child runs its own turn loop. When done, result returns as a tool output and parent resumes.
      flow:
        - actor: parent
          step: waiting
        - actor: child
          step: turn loop
          content: search, code, browse...
        - actor: child
          step: completed
          content: result delivered
        - actor: parent
          step: resumes with child result
      notes:
        - child blocks appear nested inside the parent message - not as separate messages

- name: EVENT SYSTEM
  items:
    - type: CENTRAL NERVOUS SYSTEM
      name: Every action → event → client
      content: Events are appended to a durable store → outbox worker → realtime relay → SSE → client. If the connection drops, cursor-based replay catches up. Every 3s the client also polls for run state as a safety net.
      categories:
        - name: CONTENT
          items:
            - stream.delta
            - reasoning.delta
            - stream.done
        - name: TOOLS
          items:
            - tool.called
            - tool.completed
            - tool.failed
            - confirmation_requested
        - name: RUN
          items:
            - run.started
            - run.waiting
            - run.completed
            - run.failed
        - name: DELEGATION
          items:
            - child_run.created
            - tool.waiting
            - child_run.completed

- name: CLIENT PIPELINE
  items:
    - SSE
      content: cursor replay
    - Chat Store
      content: ingestEvent()
    - Materializer
      content: events → blocks
    - Renderer
      content: blocks → UI

- name: WHAT THE USER SEES
  items:
    - name: Live blocks in the message
      content: Text word-by-word · tool calls spinning then settling · child agents nested in delegation blocks · thinking collapsible · approval buttons. On completion: all blocks settle, thread title appears.
```

communication_channels:

- POST /THREADS/:ID/INTERACTIONS
- SSE - LIVE EVENT STREAM

flow:

- actor: CLIENT
  step: Chat Composer
- actor: SERVER
  step: start-thread-interaction
- actor: SERVER
  step: Who answers?
- actor: TURN LOOP - THE ENGINE
  step: The execution loop
- actor: WAITING TOOL
  step: Delegation - agents calling agents
- actor: result
  step: completed
  content: output persisted
- actor: result
  step: failed
  content: error block added
- actor: result
  step: cancelled
  content: blocks settled, no error
- actor: EVENT SYSTEM
  step: Every action → event → client
- actor: CLIENT PIPELINE
  step: SSE → Chat Store → Materializer → Renderer
- actor: WHAT THE USER SEES
  step: Live blocks in the message

==========================================================================================
title: ai_devs_daily_ops-4479c72d-c.png
diagram:
name: DAILY OPS BRIEFING - DECOUPLED AGENT PIPELINE
legend:

- Scheduler
- Agent
- Tool (MCP)
- Skill doc
- Storage
- Output

sections:

- name: PHASE 1 · 07:00 - PARALLEL DATA GATHER
  items:
- scheduler:
  time: cron · 07:00
  name: Scheduler A
  agent:
  name: Calendar
  tools:
- google-calendar MCP
  skill_doc:
- fetch-events.md
  writes_to:
- briefings/2026-04-09/calendar/events.md

```
    - scheduler:
        time: cron · 07:00
        name: Scheduler B
      agent:
        name: Tasks
        tools:
          - linear MCP
        skill_doc:
          - open-issues.md
      writes_to:
        - briefings/2026-04-09/tasks/priority.md

    - scheduler:
        time: cron · 07:00
        name: Scheduler C
      agent:
        name: Mail
        tools:
          - gmail MCP
        skill_doc:
          - unread-digest.md
      writes_to:
        - briefings/2026-04-09/mail/digest.md

    - scheduler:
        time: cron · 07:00
        name: Scheduler D
      agent:
        name: Newsfeed
        tools:
          - firecrawl MCP
          - youtube MCP
        skill_doc:
          - news-filter.md
      writes_to:
        - briefings/2026-04-09/news/stories.md

- name: DIGITAL GARDEN - FILESYSTEM
  items:
    - name: BRIEFINGS/
      tree:
        - 2026-04-09/
        - 2026-04-09/calendar/events.md
        - 2026-04-09/tasks/priority.md
        - 2026-04-09/mail/digest.md
        - 2026-04-09/news/stories.md

- name: PHASE 2 · 07:15 - SYNTHESIS & DELIVERY
  items:
    - scheduler:
        time: cron · 07:15
        name: Scheduler E
      trigger:
        - SYNTHESIS TRIGGER

    - agent:
        name: Synthesis Agent
        reads:
          - briefings/2026-04-09/
        skill_doc:
          - briefing-format.md
        content:
          - merges all 4 files
          - produces 2-4 spoken sentences
        labels:
          - AGENT
          - SKILL

    - agent:
        name: TTS Agent
        tools:
          - elevenlabs MCP
        skill_doc:
          - voice-config.md
        writes_to:
          - briefings/2026-04-09/audio/briefing.mp3
        labels:
          - TOOL
          - SKILL

    - output:
        name: iPhone Notification
        content:
          - push via Shortcuts / Pushover / custom app
          - audio plays inline · no unlock needed
        labels:
          - OUTPUT
```

notes:

- each agent reads its skill doc at runtime · raw data persists per day for replay or re-synthesis

==========================================================================================
title: ai_devs_4_knowledge_structure-41f3bac5-6-8bca1647-b.png
diagram:
name: PERSONAL KNOWLEDGE BASE - STRUCTURE
shared_foundation:
name: KNOWLEDGE BASE

categories:

- id: "01"
  name: Me
  description: Who I am, how I operate.
  items:
- name: Identity
  content: values, direction, self-knowledge
- name: Preferences
  content: tastes, style, aesthetics
- name: Wellbeing
  content: health, routines, training
- name: Thinking
  content: mental models, decision frameworks
- name: Process
  content: system for growth & relevance

```
- id: "02"
  name: World
  description: People, places, things I interact with
  items:
    - name: People
      content: relationships, collaborators
    - name: Places
      content: cities, routes, spots that matter
    - name: Services
      content: tools, apps, platforms I rely on
    - name: Sources
      content: podcasts, blogs, newsletters

- id: "03"
  name: Craft
  description: What I do, learn, and create
  items:
    - name: Ideas
      content: raw sparks, thinking inbox
    - name: Projects
      content: Alice, eduweb, Easytools, ovoment
    - name: Knowledge
      content: AI, programming, design - by theme
    - name: Lab
      content: prototypes, POCs, experiments
    - name: Shared
      content: articles, newsletters, workshops

- id: "04"
  name: Ops
  description: How things should be done.
  items:
    - name: Tasks
      content: Linear, triage, sprint rules
    - name: Calendar
      content: scheduling, briefing template
    - name: Email
      content: labeling, triage, response rules
    - name: Newsletter
      content: format, flow, edition staging
    - name: Research
      content: sources, depth, extraction
    - name: Design
      content: brand, visual standards, assets
    - name: Development
      content: code standards, CI/CD, review
    - name: Marketing
      content: channels, messaging, playbooks
    - name: Publishing
      content: idea → release flow
    - name: Config
      content: infra, deployment, sync

- id: "05"
  name: System
  description: The machine layer
  items:
    - name: Status
      content: location, device, weather, battery
    - name: Agents
      content: workspaces, decision logs, coordination
```

legend:

- Me
- World
- Craft
- Ops
- System

==========================================================================================
title: ai_devs_4_instruct-097c1d5b-0.png
diagram:
name: VAGUE VS. PRECISE AGENT INSTRUCTIONS
notes:

- same intent - different cognitive load on the agent
- precision removes inference · every guess is a potential failure point

categories:

- id: "1"
  name: VAGUE
  items:
- text: Save the meeting notes from today somewhere in my notes.
  notes:
- which folder is "notes"?
- what filename format to use?
- what counts as "today's meeting notes"?
- overwrite existing or create new?

```
- id: "1"
  name: PRECISE
  items:
    - text: Save meeting notes to meetings/2026-04-09.md. Use filesystem MCP. Append if file exists.
      notes:
        - exact path, no search needed
        - which tool to call
        - conflict resolution rule

- id: "2"
  name: VAGUE
  items:
    - text: Every morning, check what's going on and send me a summary.
      notes:
        - what sources to check?
        - what "going on" means - tasks, mail, news?
        - what format is "a summary"?
        - how to send - push, email, message?

- id: "2"
  name: PRECISE
  items:
    - text: Read briefings/2026-04-09/ calendar, tasks, mail. Follow briefing-format.md. Send via pushover MCP.
      notes:
        - explicit source folder
        - format defined in skill doc
        - delivery tool named directly

- id: "3"
  name: VAGUE
  items:
    - text: Research the latest AI news and write something interesting about it.
      notes:
        - which sources? breadth vs. depth?
        - "interesting" by whose standard?
        - length, tone, format of output?
        - where does the result go?

- id: "3"
  name: PRECISE
  items:
    - text: Use firecrawl MCP on sources in news-sources.md. Write 3-bullet digest to news/2026-04-09.md.
      notes:
        - tool and source list named
        - output format defined 3 bullets
        - destination path explicit
```
