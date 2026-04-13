==========================================================================================
title: ai_devs_4_architecture-1f6d8c0d-e.png
diagram:
name: GENERATIVE APP — ARCHITECTURE
legend:

- Client
- Application Code
- LLM / Providers
- Infrastructure
  sections:
- name: CLIENT
  items:
- title: Web / Mobile App
  content: Sends typed requests. No direct model access.
- name: API LAYER
  items:
- title: Specialized Endpoints
  content: Typed contracts — exposes intent, not raw inference.
  use:
- "POST /product/review"
- "POST /document/summarize"
  avoid:
- "POST /api/chat"
- name: GATEWAY
  items:
- title: AI Gateway
  badge: single switching point
  content: Centralizes all model communication. Swap providers without touching business logic.
  responsibilities:
- Connection management
- Request configuration
- Monitoring & logging
- Provider abstraction
  implementation:
- AI SDK
- LiteLLM
- custom adapter
- name: LLM PROVIDERS — INTERCHANGEABLE
  items:
- provider: PROVIDER A
  name: OpenAI
  models: GPT-4o, o3...
- provider: PROVIDER B
  name: Anthropic
  models: Claude 3.5...
- provider: PROVIDER C
  name: Google
  models: Gemini...
- provider: PROVIDER N
  name: Local / OSS
  models: Ollama, vLLM...
- name: FILESYSTEM
  items:
- title: Agent File Access
  content: Scoped permissions per agent. Explicit rules for read / write / delete.
  controls:
- permission scopes
- path sandboxing
- audit trail
  notes:
- "⚠ agents can delete directories unintentionally"
- name: DATABASE
  items:
- title: Agent State & Knowledge
  content: Structures that don’t exist in classical apps — built around agent lifecycle.
  storage:
- interaction history
- scheduled tasks
- agent definitions
- tool configs
- vector store
- name: DEPENDENCIES
  items:
- title: Tooling & Libraries
  groups:
- name: OBSERVABILITY
  items:
- evaluation
- tracing
- monitoring
- name: DOCUMENTS
  items:
- markdown transform
- streaming → HTML
- doc parsing
- name: SEARCH
  items:
- semantic search
- embeddings
- reranking
- name: FRAMEWORKS
  items:
- LangChain (optional)
- LlamaIndex (optional)
  flow:
- actor: Client
  step: request
  content: Web / Mobile App
- actor: API Layer
  step: routing
  content: Specialized Endpoints
- actor: Gateway
  step: model communication
  content: AI Gateway
- actor: Providers
  step: inference
  content: LLM PROVIDERS — INTERCHANGEABLE
- actor: Infrastructure
  step: state and file operations
  content: Agent File Access; Agent State & Knowledge
- actor: Dependencies
  step: support
  content: Tooling & Libraries

==========================================================================================
title: ai_devs_4_primitives-50efe16a-f.png
diagram:
name: SCHEMA FLEXIBILITY — MESSAGES VS. ITEMS
sections:

- name: MESSAGES — SPECIALIZED
  entity:
  name: messages
  description: chat message between user & assistant
  categories:
- name: IDENTITY
  fields:
- name: id
  type: string
- name: conversation_id
  type: string
- name: CONTENT
  fields:
- name: role
  type: enum
- name: content
  type: text
- name: created_at
  type: timestamp
  values:
- user
- assistant
  notes:
- schema is closed — new interaction types require structural changes
- name: ITEMS — POLYMORPHIC
  entity:
  name: items
  description: any event between any actors
  categories:
- name: IDENTITY
  fields:
- name: id
  type: string
- name: agent_id
  type: string
- name: sequence
  type: integer
- name: type
  type: enum
- name: TYPE = MESSAGE
  fields:
- name: role
  type: enum?
- name: content
  type: text | json?
- name: TYPE = FUNCTION_CALL
  fields:
- name: name
  type: string?
- name: arguments
  type: string?
- name: TYPE = REASONING
  fields:
- name: summary
  type: json?
- name: encrypted_content
  type: string?
  values:
- message
- function_call
- function_call_output
- reasoning
- - new type...
    notes:
- schema is open — new actors and event types extend without breaking existing structure

==========================================================================================
title: ai_devs_4_agent_graph-91448bfb-c.png
diagram:
name: AGENT GRAPH — ARCHITECTURE OVERVIEW
sections:

- name: ENTRY
  items:
- title: User request
  content: '"Write a blog post and email it"'
- name: LLM AGENT
  items:
- title: Orchestrator
  content: Decomposes request → creates actors → delegates tasks with dependency chains → stops
- name: SHARED STATE
  items:
- title: Blackboard
  content: sessions · actors · tasks · items · artifacts · relations
- name: DETERMINISTIC · NO LLM
  items:
- title: DAG Scheduler
  content: Resolves task readiness via dependency graph → executes in order → promotes on completion
- name: SPECIALISTS
  items:
- type: LLM AGENT
  title: Researcher
  artifact: research-notes.md
- type: LLM AGENT
  title: Writer
  artifact: blog-post.md
- type: LLM AGENT
  title: Email Writer
  artifact: email sent
  notes:
- ↑ orchestrator resumes when all children done
- name: CROSS-CUTTING
  items:
- title: Memory
  content: Observer extracts → Reflector compresses → injected into every agent context
- title: Event Bus
  subtitle: FIRE-AND-FORGET
  content: Typed events stream to Dashboard via SSE. Read-only — cannot affect execution.
  flow:
- actor: User request
  step: entry
  content: '"Write a blog post and email it"'
- actor: Orchestrator
  step: decompose
  content: creates actors and delegates tasks with dependency chains
- actor: Blackboard
  step: shared state
  content: sessions · actors · tasks · items · artifacts · relations
- actor: DAG Scheduler
  step: execution
  content: resolves readiness and executes in order
- actor: Researcher
  step: specialist output
  content: research-notes.md
- actor: Writer
  step: specialist output
  content: blog-post.md
- actor: Email Writer
  step: specialist output
  content: email sent
- actor: Orchestrator
  step: resume
  content: resumes when all children done
  notes:
- Flat implementation, hierarchical behavior. Every agent is the same structure. Role is determined by tools granted and system prompt — not code.

==========================================================================================
title: ai_devs_4_agent_dag-97db9952-6.png
diagram:
name: DAG SCHEDULER
sections:

- name: TASK STATE MACHINE
  flow:
- actor: delegate_task
  step: no deps
  content: todo
- actor: delegate_task
  step: with deps
  content: waiting
- actor: scheduler
  step: picks it up
  content: in_progress
- actor: waiting
  step: deps met + no children in flight
  content: in_progress
- actor: in_progress
  step: complete_task
  content: done
- actor: in_progress
  step: children delegated
  content: waiting
- actor: in_progress
  step: block_task / error
  content: blocked
- actor: waiting
  step: children done + deps met
  content: promoted back to todo
- actor: blocked
  step: autoRetry = true timer elapsed
  content: promoted back to todo
  notes:
- ↑ promoted back to todo — max 3 auto-retry attempts
- name: ROUND LOOP
  notes:
- "• Session start: any task stuck in in_progress is reset to todo — stale recovery from crashed runs"
- name: ROUND N — REPEATED UP TO 20×
  items:
- step: 1
  title: Find ready tasks
  content:
- todo tasks
- waiting whose deps are met and no children in flight
- blocked with auto-retry whose timer elapsed
- Sort by priority lower = first
- step: 2
  title: None ready → exit
  content: Session complete. All work done or permanently blocked.
- step: 3
  title: For each ready task — sequential
  content:
- Set → in_progress
- find assigned actor
- run actor loop LLM steps
  result:
- done unblocks parents
- waiting
- blocked with recovery info
- step: 4
  title: Memory cycle
  content: Observer extracts from completed work. Reflector compresses if over budget. Injected into next round's context.
  notes:
- ↑ repeats from step 1 — next round
  states:
- todo
- waiting
- in_progress
- done
- blocked

==========================================================================================
title: ai_devs_4_agent_graph_trace-16dd7be5-5.png
diagram:
name: EXECUTION TRACE — TYPESCRIPT 5.0 BLOG POST
stats:
rounds: 4
agents: 3
items: 26
legend:

- Orchestrator
- Researcher
- Writer
- Memory observer
  sections:
- name: ROUND 1
  items:
- actor: Orchestrator
  type: LLM
  budget: MAX 15 STEPS
  sequence:
- seq: "1"
  content: Receives user message
- seq: "2-3"
  content: create_actor researcher
- seq: "4-6"
  content: 'delegate_task → "Research TypeScript 5.0"'
- seq: "7"
  content: 'Decision: "awaiting research" → stops'
  status: root task → waiting
  memory_flow:
- id: mem observer-002
  content: root task · seq 1-7 sealed, 2 items active tail · 190 tokens · extracts: user goal, researcher created, task delegated
- name: ROUND 2
  items:
- actor: Researcher
  type: LLM
  tools: WEB SEARCH
  sequence:
- seq: "8"
  content: Decision: full research summary via web search
- seq: "9-10"
  content: write_artifact → research-notes.md
  meta: 3,818 chars
- seq: "11-12"
  content: 'complete_task "research complete"'
  status: task → done · writer task unblocked
  memory_flow:
- id: mem observer-001
  content: research task · seq 5-8 sealed, 2 items active tail · 363 tokens · extracts: goal, deliverables, key findings, artifact refs
- name: ROUND 3
  items:
- actor: Orchestrator
  type: RESUMED
  sequence:
- seq: "13-14"
  content: Sees research done · create_actor writer
- seq: "15-17"
  content: 'delegate_task → "Draft blog post"'
- seq: "18"
  content: 'Decision: "awaiting writer" → stops'
  status: root task → waiting again
- actor: artifact handoff
  content: research-notes.md → writer reads
- actor: Writer
  type: LLM
  budget: 8 STEPS
  sequence:
- seq: "19-20"
  content: read_artifact research-notes.md
- seq: "21-22"
  content: write_artifact → blog-post.md
  meta: 4,915 chars
- seq: "23-24"
  content: 'complete_task "blog post drafted"'
  status: task → done · root task unblocked
  memory_flow:
- id: mem observer-003
  content: draft task · seq 16 sealed · 149 tokens · extracts: user requirements
- id: observer-004
  content: draft task · seq 19-20 sealed · 52 tokens · extracts: writer read artifact
- name: ROUND 4
  items:
- actor: Orchestrator
  type: RESUMED
  sequence:
- content: Sees all children done
- seq: "25-26"
  content: 'complete_task "all work finished"'
  status: root task → done · session → done
  flow:
- actor: Orchestrator
  step: create_actor
  content: researcher
- actor: Orchestrator
  step: delegate_task
  content: '"Research TypeScript 5.0"'
- actor: Researcher
  step: write_artifact
  content: research-notes.md
- actor: Orchestrator
  step: create_actor
  content: writer
- actor: Orchestrator
  step: delegate_task
  content: '"Draft blog post"'
- actor: Writer
  step: read_artifact
  content: research-notes.md
- actor: Writer
  step: write_artifact
  content: blog-post.md
- actor: Orchestrator
  step: complete_task
  content: '"all work finished"'

==========================================================================================
title: ai_devs_4_multi_provider-bcf2efbc-9.png
diagram:
name: MULTI-PROVIDER API ARCHITECTURE
sections:

- name: YOUR SYSTEM
  items:
- method: POST
  path: /v1/responses
  payload:
  model: '"claude-opus-4"'
  alternatives: or gpt-5.1 / gemini-3-flash
  instructions: '"You are a helpful assistant"'
  input: '[{ role: "user", content: "..." }]'
  reasoning: '{ effort: "high" }'
- name: UNIFIED ENDPOINT — RESPONSES API FORMAT
  items:
- title: Provider Router
  note: reads model field
  routing:
- model*prefix: '"gpt-*" | "o1-\_" | "o3-\*"'
  provider: OpenAI mapper
- model_prefix: '"claude-\*"'
  provider: Anthropic mapper
- model_prefix: '"gemini-\*"'
  provider: Gemini mapper
- name: FIELD MAPPING
  items:
- provider: OpenAI
  mode: PASS-THROUGH
  mappings:
- instructions → instructions
- input[] → input[]
- reasoning.effort → reasoning.effort
- reasoning token → encrypted_content
  notes:
- Native format — no translation needed
- provider: Anthropic
  mode: TRANSLATED
  mappings:
- instructions → system
- input[] → messages[]
- reasoning.effort → budget_tokens
- reasoning token → signature
  notes:
- assistant msg must not be first turn
- provider: Gemini
  mode: TRANSLATED
  mappings:
- instructions → system_instruction
- input[] → input[]
- reasoning.effort → thinking_level
- reasoning token → thought signature
  notes:
- Gemini 3[unclear] only; required on tool calls
- name: PROVIDER APIS
  items:
- provider: OpenAI
  method: POST
  endpoint: api.openai.com /v1/responses
- provider: Anthropic
  method: POST
  endpoint: api.anthropic.com /v1/messages
- provider: Gemini
  method: POST
  endpoint: generativelanguage.googleapis.com /v1beta/interactions
- name: RESPONSE NORMALIZATION
  items:
- title: Back to Responses API format
  note: // All providers normalized to same shape
  output: '[{ type: "message", content: [...] }]'
  usage: '{ input_tokens, output_tokens }'
  reasoning: '{ summary: [...] }'
- name: YOUR SYSTEM RECEIVES
  items:
- content: Unified response — always Responses API shape
  flow:
- actor: Your system
  step: request
  content: POST /v1/responses
- actor: Provider Router
  step: route by model prefix
  content: reads model field
- actor: OpenAI mapper
  step: field mapping
  content: PASS-THROUGH
- actor: Anthropic mapper
  step: field mapping
  content: TRANSLATED
- actor: Gemini mapper
  step: field mapping
  content: TRANSLATED
- actor: Provider APIs
  step: provider call
  content: api.openai.com / api.anthropic.com / generativelanguage.googleapis.com
- actor: Response normalization
  step: normalize
  content: Back to Responses API format
- actor: Your system
  step: receive
  content: Unified response — always Responses API shape
  notes:
- → Provider is chosen by reading model field prefix. Your code never changes — swap provider by changing the model name.
