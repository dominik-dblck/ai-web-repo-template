=====================================================================================================================

title: ai_devs_4_agentic_architectures-53bb1485-e.png

architectures:

- name: PIPELINE (ASSEMBLY LINE)
  nodes:
  - Agent A
  - Agent B
  - Agent C
  - Agent D
    connections:
  - Agent A -> Agent B
  - Agent B -> Agent C
  - Agent C -> Agent D
    note: Fixed sequence. Each agent transforms and forwards output.

- name: BLACKBOARD (SHARED STATE)
  shared_state: Blackboard
  agents:
  - Agent A
  - Agent B
  - Agent C
    interactions:
  - Agent A <-> Blackboard
  - Agent B <-> Blackboard
  - Agent C <-> Blackboard
    note: Agents read/write a shared store. No direct agent-to-agent messaging.

- name: HUB-AND-SPOKE (ORCHESTRATOR)
  central_node: Orchestrator
  specialists:
  - Agent A
  - Agent B
  - Agent C
    connections:
  - Orchestrator <-> Agent A
  - Orchestrator <-> Agent B
  - Orchestrator <-> Agent C
    note: Central coordinator delegates, collects, decides.

- name: PEER-TO-PEER (MESH)
  agents:
  - Agent A
  - Agent B
  - Agent C
  - Agent D
    connections:
  - Agent A <-> Agent B
  - Agent A <-> Agent C
  - Agent B <-> Agent D
  - Agent C <-> Agent D
    note: Every agent can message every other directly. No central router.

- name: HIERARCHICAL (TREE)
  root: Manager
  mid_level:
  - Lead 1
  - Lead 2
    workers:
  - Lead 1 -> Worker A
  - Lead 1 -> Worker B
  - Lead 2 -> Worker C
  - Lead 2 -> Worker D
    hierarchy:
  - Manager -> Lead 1
  - Manager -> Lead 2
    note: Delegation flows down. Results aggregate up.

- name: SWARM / GOSSIP
  agents:
  - Agent A
  - Agent B
  - Agent C
  - Agent D
  - Agent E
  - Agent F
    local_broadcast_paths:
  - Agent A -> Agent B
  - Agent B -> Agent C
  - Agent A -> Agent D
  - Agent D -> Agent E
  - Agent B -> Agent E
  - Agent C -> Agent F
  - Agent E -> Agent F
    note: Knowledge spreads probabilistically via local broadcasts.

=====================================================================================================================
title: ai_devs_4_delegation-4c08dbfc-b.png

diagram:
name: ORCHESTRATOR WITH DELEGATE (AWAIT: TRUE)

legend:

- User
- Agent

flow:

- actor: USER
  step: REQUEST
  content: Get weekly stats for overment.com

- actor: MAIN
  step: EVALUATION
  content: No analytics access. Specialist agent available.

- actor: MAIN
  step: DELEGATE

- actor: MAIN
  step: SPAWN_AGENT
  mode: AWAIT: TRUE
  target: ANALYTICS AGENT
  payload:
  task: weekly_stats
  domain: overment.com

- actor: ANALYTICS AGENT
  step: RESULT
  content:
  visits: 12847
  bounce_rate: 0.42
  status: complete

- actor: MAIN
  state: blocked
  note: Main agent blocked until result returned

- actor: MAIN
  step: RESPONSE
  content: Weekly stats: 12,847 visits, 42% bounce rate

=====================================================================================================================
title: ai_devs_4_bidirectional_communication-e577cdbb-3.png

diagram:
name: DELEGATE WITH MESSAGE (PAUSED LOOP)

legend:

- User
- Agent

flow:

- actor: USER
  step: REQUEST
  content: Add a 20% coupon to all winter jackets

- actor: MAIN
  step: EVALUATION
  content: Delegating to E-commerce Agent

- actor: MAIN
  step: DELEGATE

- actor: MAIN
  step: SPAWN_AGENT
  mode: AWAIT: TRUE
  target: E-COMMERCE AGENT
  payload:
  task: create_coupon
  discount: 20%
  category: winter_jackets

- actor: E-COMMERCE AGENT
  step: MESSAGE_TO_ORCHESTRATOR
  content:
  type: need_info
  question: How long should the coupon be active?

- actor: MAIN
  state: paused
  note: Loop paused — waiting for data

- actor: MAIN
  step: RELAY_TO_USER
  content: How long should the coupon stay active?

- actor: USER
  step: RESPONSE
  content: 14 days

- actor: MAIN
  step: RESUME

- actor: MAIN
  step: AGENT_RESUMED
  target: E-COMMERCE AGENT

- actor: E-COMMERCE AGENT
  step: RECEIVED_DATA
  content:
  expires_in: 14d

- actor: E-COMMERCE AGENT
  step: RESULT
  content:
  coupon: WINTER20
  products: 47 items
  expires: 2026-02-25

- actor: MAIN
  state: completed
  note: Loop completed after receiving missing data

- actor: MAIN
  step: RESPONSE
  content: Done. WINTER20 applied to 47 jackets, active for 14 days.

=====================================================================================================================
title: ai_devs_4_events-c204c7bb-e.png

diagram:
name: AGENT EVENT BUS

publishers:
label: PUBLISHERS — FIRE AND FORGET
agents:

- name: Agent A
  publishes:
- order.created
- task.complete
- name: Agent B
  publishes:
- task.complete
  note: Publishers don't know who listens.

event_bus:
name: EVENT BUS
behavior: routes by topic — no logic, just delivery
topics:

- name: order.created
  publishers:
- Agent A
  subscribers:
- Agent C
- Agent E
- name: task.complete
  publishers:
- Agent A
- Agent B
  subscribers:
- Agent D
- Agent E
- name: user.updated
  publishers:
- Agent A
  subscribers:
- Agent E

subscribers:
label: SUBSCRIBERS — DECLARE INTEREST, NOT DEPENDENCY
agents:

- name: Agent C
  subscriptions:
- order.\*
- name: Agent D
  subscriptions:
- task.\*
- name: Agent E
  subscriptions:
- "\*"
  note: Subscribers don't know who publishes.

key_insight:
Neither side knows the other exists. Add or remove any agent — nothing else changes. The topics are the only shared contract.

# =====================================================================================================================

title: ai_devs_4_agentic_events-32ffb396-5.png

diagram:
name: AGENT EVENT BUS — ORDER INQUIRY

legend:

User

Agent (LLM)

Service (code)

flow:

actor: USER
phase: TRIGGER
step: CUSTOMER_MESSAGE
content: Where is my order #4821?
emits:

user.message

actor: AGENT
phase: CLASSIFICATION
role: INTENT AGENT
step: CLASSIFY_INTENT_AND_EXTRACT_ORDER_ID
content: Reads message → order status inquiry, orderId: 4821
emits:

ticket.classified

actor: SYSTEM
phase: PARALLEL
step: 3_SUBSCRIBERS_REACT_INDEPENDENTLY

actor: SERVICE
role: TRACKER SERVICE
step: LOOK_UP_SHIPMENT
content: API call → stuck in customs, 3 days
emits:

tracking.found

actor: SERVICE
role: CREDIT SERVICE
step: CHECK_DELAY_RULES
content: Delay > 2 days → auto $5 credit
emits:

credit.applied

actor: AGENT
phase: AGENT_REQUESTS_CONTEXT
role: DRAFT AGENT
step: NEEDS_CUSTOMER_PROFILE_TO_SET_TONE
content: Has ticket + tracking + credit, but doesn't know who this customer is
emits:

customer.lookup_requested

actor: SERVICE
role: CUSTOMER SERVICE
step: LOOK_UP_CUSTOMER_PROFILE
content: Returning customer, 3 prior orders, VIP tier
emits:

customer.found

actor: AGENT
phase: AGGREGATION
role: DRAFT AGENT
step: COMPOSE_PERSONALIZED_REPLY
content: VIP customer → warmer tone, proactive apology, bigger gesture
emits:

reply.drafted

draft_agent_buffer:
scope: per ticketId
items:

- ticket.classified — intent + message
- tracking.found — shipment status
- credit.applied — $5 credit
- customer.found — VIP, 3 orders

# =====================================================================================================================

title: ai_devs_4_context_conflict-7cba7e3a-a.png

diagram:
name: LOST UPDATE — SAME AGENT, TWO SESSIONS, ONE MEMORY

memory_initial_state:
label: MEMORY — USER PROFILE
content:

- Adam is a developer working with TypeScript and Node.
- Prefers concise answers. Uses macOS and Cursor IDE.

parallel_section:
label: TWO SESSIONS START IN PARALLEL

sessions:

- name: SESSION A
  user_input:
  label: USER SAYS
  content: I switched to Rust for the new project
  rewrite:
  label: INSTANCE A REWRITES
  saved_at: T=120MS
  content:
  - Adam is a developer working with TypeScript, Node, and Rust.
  - Prefers concise answers. Uses macOS and Cursor IDE.

- name: SESSION B
  user_input:
  label: USER SAYS
  content: My new email is [adam@newdomain.com](mailto:adam@newdomain.com)
  rewrite:
  label: INSTANCE B REWRITES
  saved_at: T=340MS
  content:
  - Adam is a developer working with TypeScript and Node.
  - Prefers concise answers. Uses macOS and Cursor IDE.
  - Email: [adam@newdomain.com](mailto:adam@newdomain.com)

conflict:
label: LAST WRITE WINS

memory_final_state:
label: MEMORY — FINAL STATE
content:

- Adam is a developer working with TypeScript and Node.
- Prefers concise answers. Uses macOS and Cursor IDE.
- Email: [adam@newdomain.com](mailto:adam@newdomain.com)
  lost_update:
- and Rust

explanation:
Instance B wrote the full note from its stale snapshot. The Rust update from Instance A was silently erased. With free-text memory there is no field-level merge — the entire string gets replaced.

=====================================================================================================================
title: ai_devs_4_managing_context-1e26a7d6-7.png

diagram:
name: MANAGING GLOBAL CONTEXT — MULTI-AGENT SYSTEMS

shared_memory:
label: SHARED MEMORY

race_example:

- actor: AGENT A
  time: T=120MS
  action: Adds Rust to stack

- actor: AGENT B
  time: T=340MS
  action: Adds email from stale snapshot

data_loss:
label: LAST WRITE WINS — DATA LOST
content: B overwrites A. Rust silently erased.

strategies:

- id: 01
  name: Conflict Detection
  details:
  - read(note) → checksum: a3f8
  - "...agent processes..."
  - write(note) → current: b71c x
  - CHECKSUM CHANGED SINCE READ → REJECT WRITE
  - ALSO: PER-LINE HASHING FOR GRANULAR DIFFS

- id: 02
  name: Conflict Avoidance
  details:
  - R/W memory-agent → owns notes
  - R/O search-agent → reads only
  - ISO session data → per-instance
  - OWNERSHIP + PERMISSIONS + ISOLATION
  - PREVENTS CONFLICTS BY DESIGN

- id: 03
  name: Managing Agent
  flow:
  - agent A → write request
  - gatekeeper agent
  - agent B → write request
    details:
  - SEES FULL HISTORY + MERGES CHANGES
  - CAN ESCALATE TO HUMAN IF UNSURE

- id: 04
  name: Change History
  timeline:
  - T3 email: [adam@new.com](mailto:adam@new.com)
  - T2 stack: +Rust
  - T1 stack: TS, Node
    details:
  - APPEND-ONLY — NOTHING OVERWRITTEN
  - AGENT SEES EVOLUTION, NOT JUST STATE

- id: 05
  name: Manual Resolution
  flow:
  - conflict detected → pause
  - human reviews both versions
  - merged result
    details:
  - FALLBACK WHEN AUTOMATION CAN'T DECIDE

footer:
Git-style merge doesn't transfer directly — agents often lack the context to resolve conflicts alone. Combine strategies.

# =====================================================================================================================

title: ai_devs_4_shared_knowledge-cf27fdb9-3.png

diagram:
name: EXTERNAL CONTEXT — MULTI-AGENT KNOWLEDGE MAP

legend:

- ./workflows
- ./projects
- ./memory
- ./company

external_context:
label: EXTERNAL CONTEXT (PERSISTENT)
roots:

- name: ./WORKFLOWS
  documents:
- path: linear/assign-issue.md
  description: Rules for assigning issues
  references:
- overview.md
- definitions.md
- path: slack/notify.md
  description: Notification routing
  references:
- clients.md
- path: calendar/schedule.md
  description: Scheduling procedures
  references:
- overview.md

```
- name: ./PROJECTS
  documents:
    - path: overview.md
      description: Active projects, team IDs
      references:
        - decisions.md
    - path: definitions.md
      description: Categories, priorities
      references:
        - profile.md

- name: ./MEMORY
  documents:
    - path: clients.md
      description: Interactions, preferences
    - path: decisions.md
      description: Past choices, rationale

- name: ./COMPANY
  documents:
    - path: profile.md
      description: Team, offerings, stack
    - path: pricing.md
      description: Tiers, case studies
      references:
        - clients.md
```

agent_access:
label: AGENT ACCESS
agents:

- name: Task Manager
  purpose: Planning, deadlines, issues
  access:
- mode: R/O
  path: ./workflows
- mode: R/O
  path: ./projects
- mode: R/O
  path: ./memory

```
- name: Pre-Sales Assistant
  purpose: Proposals, discovery calls
  access:
    - mode: R/O
      path: ./company
    - mode: R/O
      path: ./memory/clients

- name: Memory Manager
  purpose: Organizes shared knowledge
  access:
    - mode: R/W
      path: ./memory
    - mode: R/W
      path: ./projects
    - mode: R/O
      path: ./company
```

key_insight:
Agents don't search — they navigate. Each enters through a known root and follows document references. Only Memory Manager writes to shared state.

# =====================================================================================================================

title: ai_devs_4_ops_agent-4ca77029-6.png

diagram:
name: DAILY OPS — ORCHESTRATOR + SPECIALIZED AGENTS

legend:

- Trigger
- LLM Agent
- System / Memory

flow:

- actor: CRON
  phase: TRIGGER
  step: SCHEDULED
  time: "06:30"
  action: Load ./workflows/daily-ops.md
  content: Workflow definition file. Contains pipeline steps, agent roles, output format, and escalation rules. Passed as initial context to the orchestrator.

- actor: MAIN
  phase: ORCHESTRATOR
  role: OPS ORCHESTRATOR
  step: READS_WORKFLOW_AND_DELEGATES
  content: Reads workflow, delegates to specialists
  capabilities:
  - delegate
  - message
  - ./goals
  - ./history

- actor: MAIN
  phase: DELEGATE_PARALLEL
  step: SPAWN_AGENTS
  mode: AWAIT: TRUE
  agents:
  - name: MAIL AGENT
    task: Inbox scan
    tools:
    - gmail_api
    - message

  - name: CALENDAR AGENT
    task: Today + 48h
    tools:
    - gcal_api
    - message

  - name: TASK AGENT
    task: Open + overdue
    tools:
    - linear_api
    - message

  - name: NOTES AGENT
    task: Open loops
    tools:
    - vault_read
    - message
      note: Each agent owns its source. Cross-source context flows through message ↔ Orchestrator.

- actor: MAIN
  phase: RESULTS
  step: ORCHESTRATOR_RECEIVES
  content:
  mail: client X follow-up, invoice, team sync
  calendar: standup 10:00, review 15:00
  tasks: 2 due today, 1 overdue, 2 blocked
  notes: draft: pricing model, open Q: deploy

shared_context:
label: SHARED CONTEXT (PERSISTENT)
stores:

- path: ./goals
  description: Yearly plan, Q themes
  mode: R/O
- path: ./history
  description: Previous daily notes
  mode: R/O
- path: ./memory
  description: Escalation state
  mode: R/W
- path: ./output
  description: Today's note
  mode: R/W

processing:

- actor: MAIN
  phase: DEDUP_ESCALATION
  role: ORCHESTRATOR_FILTER
  step: REMOVE_REPEATED_ESCALATE_SKIPPED
  rules:
  - dedup vs ./history
  - skip_days++ → priority++

- actor: MAIN
  phase: SYNTHESIS
  role: ORCHESTRATOR_COMPOSE
  step: DIRECTION_NOTE_WEIGHTED_BY_GOALS_ALIGNMENT
  content: Direction note, weighted by ./goals alignment

output:
phase: OUTPUT
note:
date: 2026-02-12
direction: Deep work on agent memory architecture
aligned_with: "Q1: ship multi-agent framework"
escalated:

- tax docs (3d)
- deploy decision (2d)
  shifted:
- Client X → Friday
- standup cancelled
  protect:
- No meetings before 12:00

feedback_loop:
note: Output feeds back into ./memory + ./history for tomorrow's dedup and escalation

warnings:

- type: Degradation
  content: each delegate → orchestrator hop compresses information. Agents return structured data, not prose — orchestrator keeps raw items alongside the narrative.
- type: Conflict
  content: if user edits ./goals mid-pipeline, orchestrator reads stale state. Checksum on read to detect and re-read.

# =====================================================================================================================

title: ai_devs_4_ops_execution-15b2bf7e-4.png

diagram:
name: DAILY OPS — EXECUTION TRACE

legend:

- function call
- tool call
- file path / string
- child agent scope
- key moment
- context growth

flow:

- phase: TRIGGER — INDEX.TS
  location: index.ts → main()
  code:
  - const task = "Prepare Daily Ops for ${today}. Read workflows/daily-ops.md first."
  - await runAgent("orchestrator", task)
    note: enters agent.ts

- phase: ORCHESTRATOR — DEPTH 0
  location: agent.ts → runAgent("orchestrator", task, 0)
  setup:
  template:
  action: loadAgent("orchestrator")
  file: workspace/agents/orchestrator.agent.md
  model: gpt-4.1-mini
  tools:
  - delegate
  - read_file
  - write_file
    messages:
  - role: system
    content: template.systemPrompt
  - role: user
    content: task

- phase: LOOP
  turn: 0
  action: LLM decides to read workflow
  llm_call: openai.chat.completions.create({ model, messages, tools })
  tool_calls:
  - name: read_file
    args:
    path: workflows/daily-ops.md
    tool_execution:
  - result = findTool("read_file").handler({ path: "workflows/daily-ops.md" })
  - messages.push({ role: "tool", content: result })
    context_growth:
    msgs: 4

- phase: LOOP
  turn: 1
  action: LLM delegates to 4 agents
  llm_call: openai.chat.completions.create({ model, messages, tools })
  tool_calls:
  - name: delegate
    args:
    agent: mail
    task: Gather inbox summary
  - name: delegate
    args:
    agent: calendar
    task: Gather events
  - name: delegate
    args:
    agent: tasks
    task: Gather open tasks
  - name: delegate
    args:
    agent: notes
    task: Gather open loops
    delegate_runtime:
  - name == "delegate" → agent.ts intercepts before handler
  - each call triggers recursive runAgent(child, task, depth + 1)
  - executed sequentially via for...of

child_agents:
phase: CHILD AGENTS — DEPTH 1
example:
location: runAgent("mail", "Gather inbox summary", 1)
setup:
template:
action: loadAgent("mail")
tools:

- get_mail
  note: can ONLY read mail
  system_prompt: You summarize emails...
  messages:
- role: system
  content: template.systemPrompt
- role: user
  content: Gather inbox summary
  loop:
- turn: 0
  action: LLM calls get_mail
  llm_call: openai.create(...)
  tool_calls:
- name: get_mail
  tool_execution:
- result = readJSON("sources/mail.json")
- messages.push({ role: "tool", content: result })
- turn: 1
  action: LLM returns text
  llm_call: openai.create(...)
  output: 3 emails: ...
  return_value: message.content
  note: becomes tool result in parent
  note: Same pattern for calendar, tasks, notes — each loads its own .agent.md, runs its own loop with one tool, returns summary text.

back_to_orchestrator:
phase: BACK TO ORCHESTRATOR — DEPTH 0
turn: 1 continued
action: delegate results land
tool_results_added:

- 3 emails: ...
- 5 events: ...
- 12 tasks: ...
- 4 open loops: ...
  note: each child return text becomes tool result for parent
  context_growth:
  msgs: 10

context_reads:
phase: LOOP
turn: 2
action: LLM reads context files
llm_call: openai.create(...)
tool_calls:

- name: read_file
  args:
  path: goals/goals.md
- name: read_file
  args:
  path: history/2026-02-12.md
- name: read_file
  args:
  path: memory/preferences.md
  tool_execution:
- messages.push({ role: "tool", content: goalsContent })
- messages.push({ role: "tool", content: historyContent })
- messages.push({ role: "tool", content: prefContent })
  note: all go through normal handler, not delegate
  context_growth:
  msgs: 16

synthesis:
phase: SYNTHESIS — THE EXPENSIVE CALL
turn: 3
action: LLM synthesizes everything
full_context_now_in_messages:

- system prompt
- user task
- workflow instructions
- 4 delegate summaries
- goals
- yesterday's output
- preferences
  llm_call: openai.create({ model, messages, tools })
  context_growth:
  msgs: "16 - full window"
  tool_calls:
- name: write_file
  args:
  path: output/2026-02-13.md
  content: "# Daily Ops 2026-02-13\n\n## Direction\n..."
  result:
- deduped vs history
- escalated stale items
- weighted by goals
- applied preferences
  bottleneck: One LLM call carries the full context. Compression happened upstream — each child agent reduced raw JSON to a text summary. Without delegation, all raw data would be in this window.

finish:
phase: DONE
turn: 4
action: LLM returns text, loop exits
llm_call: openai.create(...)
condition: no more tool_calls
return_value: The Daily Ops note has been prepared...
caller:
location: index.ts
action: console.log(result)

feedback_loop:

- output/2026-02-13.md becomes tomorrow's history/2026-02-13.md
- used for next dedup + escalation loop

# =====================================================================================================================

# =====================================================================================================================

# =====================================================================================================================

# =====================================================================================================================
