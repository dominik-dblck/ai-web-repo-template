=====================================================================================================================
File: ai_devs_4_gap-96e11ee3-4.png

Concept: Retrieval Gap

Ground truth:

- Retrieved document: doc_B
- Related context documents: doc_A, doc_C
- Relationships:
  - doc_B <-> doc_A
  - doc_B <-> doc_C
  - doc_A <-> doc_C

Agent-visible state:

- Retrieved document: doc_B
- Missing context documents: doc_A, doc_C
- Missing relationships:
  - doc_B <-> doc_A
  - doc_B <-> doc_C

Consequence:

- The agent answers using doc_B alone
- Important surrounding context is lost
- Retrieval quality appears correct locally but incomplete globally

=====================================================================================================================
File: ai_devs_4_observational_memory-aaa1f996-0.png

Title: Observational Memory Log

Observations:

- Date: January 15, 2026
- 09:15: User stated they live in Krakow, Poland
- 09:16: User is building a SaaS analytics dashboard called "PulseBoard"
- 09:20: User asked how to structure the database schema
- 09:30: Agent created 4 tables: events, sessions, pages, conversions
- Additional implementation details:
  - events table uses TimescaleDB hypertable
  - sessions are linked by session_id with 30-minute timeout
- 10:00: User mentioned they might add dark mode later

Current task:

- Primary task: implementing database schema for PulseBoard

Suggested response:

- The schema is ready
- Ask the user about indexing strategy for the events table

# =====================================================================================================================

File: ai_devs_4_observer_reflector-90bac67f-2.png

Record type: Memory management workflow

Entities:

- thread
- observer
- reflector
- log
- system prompt
- updated log
- compressed log

Process stages:

- Accumulation
- Observer
- Seal and restart
- Reflector

Process facts:

- A thread accumulates messages until it reaches about 30K tokens
- At the observer stage, the system combines:
  - existing log
  - new messages
- The observer produces an updated log
- During seal and restart:
  - the previous thread is sealed
  - the system prompt is rebuilt with the updated log
  - the thread is restarted
- This cycle repeats at the next 30K tokens
- After the log grows to about 60K tokens, the reflector stage is triggered
- The reflector operates on the log only
- The reflector produces a compressed log
- The compressed log is inserted into the system prompt

State transitions:

- thread accumulation reaches token threshold
- observer updates the log from prior memory plus recent messages
- sealed thread is closed
- restarted thread continues with updated log in system prompt
- reflector later compresses accumulated log for longer-term continuity

Token thresholds:

- first operational threshold: 30K tokens
- later log threshold: 60K tokens

System behavior:

- memory is updated incrementally by the observer
- conversation is periodically restarted with preserved memory
- long logs are compressed by the reflector to keep memory manageable

# =====================================================================================================================

File: ai_devs_4_generated_knowledge-fa68663c-a.png

Record type: Knowledge access model

Entities:

- agent
- search
- knowledge base
- workflows
- system prompt
- projects
- definitions
- spaces
- current tasks
- Linear
- assign-issue.md

Knowledge access modes:

- Agent plus search
- Knowledge to agent

Agent plus search:

- The agent receives a task: assign issue to project
- The agent performs a discovery search
- Example search query: how to assign Linear issue
- Search returns only partial matches from the knowledge base
- Some relevant information remains invisible
- The agent works with partial context
- The agent does not know what it failed to find
- Missing knowledge creates unknown unknowns
- Additional queries may or may not recover the missing context

Knowledge to agent:

- The agent receives a task: assign issue to project
- The system prompt directs the agent to look in /workflows
- Knowledge is organized as a navigable structure instead of relying on discovery search
- Example workflow path:
  - workflows/
  - linear/
  - assign-issue.md
- The agent can continue through related structured areas:
  - projects and definitions
  - spaces and current tasks
- A generic navigation rule is provided:
  - look in /workflows
  - map tool to folder to document chain
- A curated path is shown:
  - /workflows
  - linear
  - definitions
  - tasks
  - action

Structural decisions:

- Tool knowledge should be placed in structured workflow directories
- The system prompt should provide an explicit entry point into the knowledge structure
- Related definitions and task state should be connected through predictable navigation paths
- Structured knowledge reduces dependence on uncertain search discovery

Comparative outcome:

- Search-based access provides incomplete and potentially invisible context
- Structured knowledge access provides guided navigation and fuller context
- Search alone is reactive
- Structured knowledge is curated and proactive

Design implication:

- Agents perform better when knowledge is delivered as an explicit, navigable structure
- Discovery search should not be the only mechanism for operational knowledge access

# =====================================================================================================================

File: ai_devs_4_exploration-6e2a83e8-4.png

Record type: Task execution workflow

Entities:

- task manager agent
- system prompt
- workflows
- Linear
- create-issue.md
- triage.md
- close-issue.md
- projects overview
- project Auth
- team-id AUTH-01
- Linear API

Process stages:

- Task received
- Read workflow
- Resolve project
- Execute

Task input:

- Add a task: implement auth token refresh

System guidance:

- The system prompt tells the agent that tool documentation is in ./workflows

Workflow facts:

- The agent reads workflows/linear/create-issue.md
- Related workflow documents include:
  - create-issue.md
  - triage.md
  - close-issue.md
- The workflow includes a rule for assigning issues:
  - always assign to a project
- The workflow references a project list document:
  - ./projects/overview.md

Project resolution:

- The agent reads projects/overview.md
- The relevant project is:
  - Project: Auth
  - team-id: AUTH-01

Execution facts:

- The agent calls the Linear API to create an issue
- Issue title:
  - Implement auth token refresh
- Issue project:
  - AUTH-01
- Issue status:
  - backlog

Structural decisions:

- Operational behavior is driven by workflow documents
- Workflow documents can reference additional knowledge documents
- Project assignment is resolved through a separate project overview source before execution
- Execution occurs only after workflow rules and project mapping are resolved

Design implication:

- Task execution should follow a document chain from workflow to referenced definitions to action
- Structured documentation enables deterministic issue creation in external systems

=====================================================================================================================
File: ai_devs_4_imports-85a5e7a9-4.png

Record type: Codebase navigation workflow

Entities:

- coding agent
- profile settings
- working directory
- src
- ProfileSettings.tsx
- userStore.ts
- userApi.ts
- users route
- schema
- bio field
- migration

Process stages:

- Task received
- Search
- Read component
- Follow imports
- Execute

Task input:

- Add a bio field to the user profile settings

Repository context:

- Working directory is src
- Main areas shown:
  - components
  - stores
  - api
  - server
- Git status is clean

Navigation process:

- The agent searches the codebase for profile-related matches
- Search results include:
  - components/Dashboard.tsx
  - components/ProfileSettings.tsx
  - components/ProfileAvatar.tsx
- The agent selects ProfileSettings.tsx because it matches profile settings from the task

Component facts:

- The agent reads components/ProfileSettings.tsx
- The component imports:
  - useUserStore from ../stores/userStore
  - updateProfile from ../api/userApi
- The form currently contains:
  - displayName input
  - email input
- A bio field is identified as the missing addition point

Dependency traversal:

- The agent follows imports from the component to map the full implementation chain
- stores/userStore.ts defines the UserProfile interface
- UserProfile currently includes:
  - displayName: string
  - email: string
- A bio field is indicated as a missing property
- api/userApi.ts defines updateProfile data flow to /api/users/profile
- server/routes/users.ts handles the profile update request
- The route currently updates:
  - displayName
  - email
- server/db/schema.ts defines the users table
- The table currently includes:
  - displayName
  - email
- A bio column is indicated as the missing schema field

Mapped implementation chain:

- Component
- Store
- API
- Route
- Schema

Execution changes:

- Update server/db/schema.ts to add the bio field
- Create a new migration file:
  - server/db/migrations/0003_add_bio.ts
- Update server/routes/users.ts to accept and persist bio
- Update stores/userStore.ts to add bio to the user profile type
- Update components/ProfileSettings.tsx to add a textarea for bio

Structural decisions:

- Code changes should follow the dependency chain from UI to persistence
- Import traversal is used to discover the complete implementation path before editing
- Data model changes require synchronized updates across component, store, API, route, schema, and migration

Design implication:

- Codebase navigation should rely on task-to-component matching, then imported dependency traversal, then coordinated multi-layer updates

=====================================================================================================================
File: ai_devs_4_learning-31a263c3-d.png

Record type: Knowledge acquisition model

Entities:

- agent
- source document
- chunking pipeline
- embeddings
- query
- search
- fragments
- structure
- deployment
- env/prod
- dependencies
- project-x

Knowledge acquisition modes:

- Connect to source
- Learn from source

Connect to source:

- A source document is processed through a chunk and embed pipeline
- Chunking introduces artificial boundaries and fixed-size segments
- A query is executed against the indexed chunks
- Search returns only a subset of matches
- The agent receives fragments rather than the full source
- Missing context is not explicitly visible
- The agent has no signal about what was not retrieved
- This produces unknown unknowns

Learn from source:

- The agent reads the full source document directly
- The document is understood in its original context
- The agent organizes knowledge into explicit structures
- Example structured areas include:
  - project-x
  - deployment
  - env/prod
  - dependencies
- Relationships between concepts are preserved in the structure
- The agent reaches a more complete knowledge state
- Missing areas become visible through gaps in the structure

Structural facts:

- Fragment retrieval hides absence
- Direct reading preserves context
- Organizing knowledge creates explicit relationships
- Structured knowledge exposes what exists and what is missing
- Visible gaps are preferable to invisible gaps

Comparative outcome:

- Connect flow:
  - source
  - chunks
  - search
  - fragments
- Learn flow:
  - source
  - read
  - organize
  - knows

Design implication:

- Agent knowledge should be built by reading and structuring source material, not only by retrieving embedded fragments
- Structured learning improves completeness, context retention, and gap detection

=====================================================================================================================
File: ai_devs_4_personalized_newsletter-86904b5a-f.png

Record type: Multi-agent content production workflow

Entities:

- knowledge base
- researcher
- writer
- sender
- blogs
- YouTube
- newsletters
- shared knowledge base
- edition-26
- blog-summaries.md
- youtube-highlights.md
- newsletter-digest.md
- daily-newsletter.md
- content.md
- team inbox

Process stages:

- Phase 1: gathering
- Phase 2: writing
- Phase 3: delivery

Agent roles:

- Researcher
- Writer
- Sender

Gathering phase:

- Multiple researcher sessions run separately
- Session 1 focuses on blogs
- Session 2 focuses on YouTube
- Session 3 focuses on newsletters
- Researcher inputs include:
  - news.md
  - blogs.md
  - channels.md
  - inbox
- Separate research sessions write into the same shared knowledge base output area

Shared knowledge base structure:

- newsletter/edition-26/
  - blog-summaries.md
  - youtube-highlights.md
  - newsletter-digest.md

Knowledge base rules:

- The same instruction file news.md is used across separate sessions
- Separate sessions still write to the same output directory
- The shared folder acts as the handoff point between gathering and writing

Writing phase:

- The writer agent composes the newsletter
- The writer reads:
  - edition-26 folder contents
  - daily-newsletter.md rules
- The writer produces:
  - content.md

Delivery phase:

- The sender agent reads content.md
- The sender sends a personalized email to the team
- Delivery target is:
  - team inbox

Structural decisions:

- Research is split by source type into separate sessions
- Outputs are normalized into a shared edition folder
- Writing is based on both collected source material and explicit newsletter rules
- Delivery is separated from writing as its own agent responsibility
- content.md is the final handoff artifact between writing and sending

Design implication:

- Multi-agent pipelines work best when each phase writes to a predictable shared directory
- Shared knowledge artifacts enable parallel research and deterministic downstream composition
- # Clear file-based handoffs reduce coupling between gathering, writing, and delivery
  File: ai_devs_4_graphs-dcb0ecee-9.png

Record type: Property graph model example

Entities:

- Neo4j
- property graph
- person
- developer
- company
- project
- Adam
- eduweb
- EasyTools
- Alice

Node types:

- Person
- Developer
- Company
- Project

Node facts:

- A person node has:
  - name: Adam
  - age: 35
- The same node also carries the Developer label
- A company node has:
  - name: eduweb
  - brand: EasyTools
- A project node has:
  - name: Alice
  - status: active

Relationship types:

- OWNS
- CREATED

Graph relationships:

- Person Adam OWNS Company eduweb
- Person Adam CREATED Project Alice
- Company eduweb OWNS Project Alice

Property graph rules:

- Nodes have labels and properties
- A node can have multiple labels
- Relationships are directed
- Relationships have a type
- Relationships may also carry properties

Structural facts:

- Labels define node categories
- Properties store attributes on nodes
- Directed relationships encode graph semantics between entities
- The same node can represent multiple roles through multiple labels

Design implication:

- A property graph models entities as labeled nodes with attributes
- Connections between entities are represented as typed, directed relationships
- # Multi-label nodes allow one entity to belong to more than one category at the same time
  File: ai_devs_4_agentic_graph_tools-4c483f7d-c.png

Record type: Graph-RAG toolset specification

Entities:

- Graph-RAG
- search
- explore
- connect
- cypher
- learn
- forget
- audit
- merge_entities
- chunks
- entities
- paths
- nodes
- edges
- rows
- source
- graph

Tool groups:

- Retrieval
- Advanced
- Indexing
- Maintenance

Retrieval tools:

- search
- explore
- connect

Advanced tools:

- cypher

Indexing tools:

- learn
- forget

Maintenance tools:

- audit
- merge_entities

Tool specifications:

search:

- Purpose:
  - Run hybrid retrieval using full-text BM25 plus semantic vector search
- Behavior:
  - Returns matching chunks and mentioned entities
- Inputs:
  - keywords
  - semantic
  - optional limit
- Outputs:
  - chunks[]
  - entities[]

explore:

- Purpose:
  - Inspect the graph around one entity
- Behavior:
  - Returns entity metadata and directly connected neighbors with relationship types
- Inputs:
  - entity
  - optional limit
- Outputs:
  - name
  - type
  - neighbors[]

connect:

- Purpose:
  - Find shortest path or paths between two entities
- Behavior:
  - Reveals indirect links through the graph
- Inputs:
  - from
  - to
  - optional maxDepth
- Outputs:
  - paths[]
  - nodes[]
  - edges[]

cypher:

- Purpose:
  - Run read-only Cypher queries
- Behavior:
  - Supports aggregations, type filters, and relationship counts not covered by higher-level tools
- Inputs:
  - query
  - optional params
- Outputs:
  - rows[]

learn:

- Purpose:
  - Index content into the graph
- Behavior:
  - Runs a pipeline of chunking, embedding, entity extraction, and graph write
  - Can index a file by filename or raw text with source
- Inputs:
  - optional filename
  - optional text
  - optional source
- Outputs:
  - success message

forget:

- Purpose:
  - Remove a document or remembered text from the graph
- Behavior:
  - Removes chunks, entity mentions, and orphaned entities associated with the source
- Inputs:
  - source
- Outputs:
  - success message

audit:

- Purpose:
  - Check graph quality
- Behavior:
  - Returns node counts, orphaned entities, potential duplicates, and type distributions
- Inputs:
  - empty object
- Outputs:
  - nodeCounts
  - orphans
  - duplicates

merge_entities:

- Purpose:
  - Merge one entity into another
- Behavior:
  - Moves relationships and chunk mentions from source entity to target entity
- Inputs:
  - source
  - target
- Outputs:
  - success message

Structural decisions:

- Retrieval is separated from indexing and maintenance
- High-level graph operations are exposed as task-oriented tools
- Cypher is reserved for advanced read-only querying
- Indexing and deletion are explicit graph lifecycle operations
- Maintenance includes both quality inspection and entity normalization

Design implication:

- A Graph-RAG system benefits from a small, clear tool surface that covers retrieval, traversal, indexing, cleanup, and diagnostics
- Higher-level tools should handle common agent workflows, while Cypher remains an escape hatch for unsupported analytical queries

=====================================================================================================================

File: ai_devs_4_rephrasing-e4272053-6.png

Record type: Deep research query pre-processing workflow

Entities:

- user
- intermediate LLM
- deep research model
- query
- clarifying questions
- enriched prompt
- structured report
- inline citations
- benchmarks
- diffusion transformers
- DiT
- Sora
- Veo
- Kling

Process stages:

- Input
- Clarification
- Prompt rewrite
- Deep research
- Output

Input query:

- What are the latest breakthroughs in generative AI for video synthesis

Clarification phase:

- An intermediate LLM generates follow-up questions
- Example clarification dimensions include:
  - architectures or products
  - academic papers or industry
  - specific timeframe
- The user provides constraints and preferences
- Example user response:
  - focus on both
  - focus on diffusion transformers
  - last 6 months
  - include benchmarks
- Clarification may iterate until intent is clear

Prompt rewrite facts:

- The intermediate LLM merges the original query with the clarifications
- The result is a detailed, structured prompt
- The enriched prompt adds:
  - scope
  - named systems or products
  - time window
  - output format
  - benchmark requirements
- Example systems mentioned:
  - DiT
  - Sora
  - Veo
  - Kling

Deep research phase:

- The deep research model receives the enriched prompt
- Research execution follows an agentic loop:
  - plan
  - search
  - read
  - analyze
  - iterate
  - write
- The research phase is long-running
- Indicative duration:
  - 5 to 60 minutes
- Background execution is enabled

Output facts:

- The result is a structured report
- The report contains inline citations
- The tool trace may include:
  - 80 to 250 search calls

Responsibility boundaries:

- Clarification and prompt rewrite are handled by the intermediate LLM, not by the deep research model itself
- The API exposes only the research phase
- Pre-processing is the developer's responsibility

Structural decisions:

- User intent should be clarified before launching deep research
- Research quality depends on rewriting vague queries into explicit structured prompts
- Scope, timeframe, and evaluation criteria should be attached before execution
- Clarification and research are separate system responsibilities

Design implication:

- Deep research systems should not begin with raw user input when the request is broad or ambiguous
- Query clarification and enrichment improve precision, coverage, and report usefulness
- The research model should focus on execution, while another layer handles intent resolution and prompt shaping

=====================================================================================================================
File: ai_devs_4_deepresearch-0f1da77b-3.png

Record type: Deep research execution loop

Entities:

- deep research
- question
- search
- read
- find gaps
- refine
- report

Process stages:

- Question
- Break apart
- Search
- Read
- Find gaps
- Enough
- Refine
- Report

Process facts:

- Deep research starts with a question
- The question is broken into smaller parts before research begins
- The system searches for relevant sources
- Retrieved sources are read
- After reading, the system identifies knowledge gaps
- Search, read, and gap finding repeat as an iterative loop
- The system evaluates whether the gathered information is sufficient

Decision flow:

- If the information is not sufficient:
  - refine the research direction
  - return to search
- If the information is sufficient:
  - produce the final report

Structural decisions:

- Research is iterative, not linear
- Gap detection is a core step in the loop
- Sufficiency is explicitly evaluated before reporting
- Refinement feeds back into another search cycle

Design implication:

- Effective deep research depends on decomposition, iterative retrieval, gap detection, and repeated refinement before synthesis
