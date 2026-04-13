# S04E04 — Designing Your Own Knowledge Base for AI

## 1. From Daily Life to Agentic Knowledge Scope

- **The question is not "how to build a knowledge base?" but "how to build YOUR OWN knowledge base?"** — the answer is deeply individual; some may not need one at all
- **Discovery process** — 4-layer funnel from broad life to focused agent scope:
  1. **Daily life areas** — messages, events, email, coding, browsing, shopping, health, entertainment, learning, hobbies, etc.
  2. **Regularly used tools** — communicators, calendars, code editor, note-taking, task manager, social media, etc.
  3. **Activities where AI applies** — learning, creating, research, scheduling, managing, reporting, coding, messaging, etc.
  4. **Personal knowledge system** — the filtered intersection: identify recurring patterns, ask "where can AI help?", remove what you won't connect
- **AI as discovery partner** — open a chat interface and simply talk through which areas benefit from AI; this breaks the illusion that AI can automate everything
- **"Best ideas are not the reason for work done, but its result"** — build, make mistakes, explore; the most valuable use cases emerge through practice, not planning sessions
- **Include areas you DON'T want to automate** — if AI has access to your content, you can reference it instead of manually passing context; agents can reach it without your involvement
- **Two spaces to design for**: your space (human-created content, decisions) and agent space (automated operations, process execution)

## 2. Knowledge Base Structure — Five Domains

- **Me** — who I am, how I operate
  - **Identity** — values, direction, self-knowledge
  - **Preferences** — tastes, style, aesthetics
  - **Wellbeing** — health, routines, training
  - **Thinking** — mental models, decision frameworks
  - **Process** — system for growth and relevance
  - Agents can access selected areas when information aids their actions
- **World** — people, places, things I interact with
  - **People** — relationships, collaborators
  - **Places** — cities, routes, significant locations
  - **Services** — tools, apps, platforms
  - **Sources** — podcasts, blogs, newsletters
- **Craft** — what I do, learn, and create
  - **Ideas** — raw sparks, thinking inbox
  - **Projects** — active work with context
  - **Knowledge** — AI, programming, design — organized by theme
  - **Lab** — prototypes, POCs, experiments
  - **Shared** — articles, newsletters, workshops (published content)
- **Ops** — how things should be done (primarily agent space)
  - **Tasks** — triage, sprint rules
  - **Calendar** — scheduling, briefing templates
  - **Email** — labeling, triage, response rules
  - **Newsletter** — format, flow, edition staging
  - **Research** — sources, depth, extraction
  - **Publishing** — idea-to-release flow
  - **Config** — infrastructure, deployment, sync
- **System** — the machine layer (exclusively system-updated)
  - **Status** — location, device, weather, battery
  - **Agents** — workspaces, decision logs, coordination
- **Start with ONE area or even ONE activity** — don't try to implement the full structure immediately; pick something enjoyable first, useful second
- **Note-taking frameworks apply** — Zettelkasten (atomic notes, linking), PARA; but different rules may apply for humans vs agents; agent notes can include code fragments or scripts

## 3. Note Anatomy — Structure and Metadata

- **Frontmatter as rich metadata** — notes carry structured frontmatter beyond just title:
  - **status** — lifecycle stages: `seed → growing → evergreen → archived`
  - **publish** — publication states: `draft → review → live → updated`
  - **tags** — semantic classification
  - **access.read / access.write** — granular permission control (can inherit from parent directory defaults)
  - **attention** — flag for specific person with reason (e.g., "review before expanding")
- **Sections follow templates** — Overview, Core Components, Relevance to Current Work, Sources, Related Notes
- **Wikilinks as the connective tissue** — `[[Craft/Knowledge/AI/attention-mechanism]]` enables agent graph traversal and context discovery
- **Related notes with commentary** — each link includes a note explaining the relationship (e.g., "conflicts with multilingual claims here, worth revisiting")
- **Well-designed structure enables AI co-development** — when templates and rules exist, agents expand the knowledge base more effectively; the utility is incomparably greater when agents can use notes in real processes

## 4. Markdown — Where It Works, Where It Doesn't

- **Markdown strengths** (primarily agent and tooling scenarios):
  - **Native to AI** — models read and write it naturally
  - **Plain text = full control** — transformable, searchable, creatable programmatically
  - **Frontmatter as metadata** — structured data co-located with content
  - **Git-friendly** — version control, diff, merge
  - **Wikilinks and graph traversal** — knowledge base navigation
  - **Offline, portable, durable** — no vendor lock-in
- **Markdown falls short** (primarily team scenarios):
  - No real-time collaboration
  - No granular permissions
  - No comments or review mode
  - No rich embeds or databases
  - Lossy conversion to/from Notion/Docs
  - Rendering varies by tool
- **Decision rule: pick the boundary once per area, don't mix**:
  - **Use .md** — personal knowledge base, agent memory, ops playbooks, instruction files, code docs, content drafts
  - **Use Notion / Docs** — multi-author team docs, client-facing documents, proposals
  - **Use Linear / Notion** — project management, task tracking
- **Converting between formats is impractical** — most information is lost during conversion; decide upfront which areas use which format
- **Enriching Markdown is possible** — project [with-md](https://github.com/emotion-machine-org/with-md) explores adding agent-accessible metadata to markdown content (early-stage concept by [egeozin](https://x.com/egeozin/status/2026344803097878939))
- **Images must use remote URLs, not local paths** — local paths break when agents send content to external tools, emails, or other contexts:
  - Tool calls on remote servers cannot resolve `./assets/diagram.png`
  - Email clients and Slack previews cannot reach local filesystems
  - Content copied or quoted elsewhere turns local paths into dead strings
- **Security for remote image URLs**:
  - **Token-based paths** — `cdn.example.com/a8f3c9e2/diagram.png` (knowing the URL IS the permission; no sequence to enumerate)
  - **Layered protection** — bucket policy (no public listing) + token paths (non-guessable) + `X-Robots-Tag: noindex` (requires HTTP layer like CloudFront)
  - Open links are nearly essential but hard to control for permissions and expiry; maintain an inventory of accessible resources

## 5. Knowledge Base vs Long-Term Memory — Context Gaps

- **Knowledge base and long-term memory converge** when they share the same space — both involve dynamic content created by humans and AI (builds on S02E03)
- **Humans write notes assuming shared context; agents have none** — this gap is the primary failure mode for agent-navigated knowledge bases
- **Five critical context gaps**:
  1. **Unnamed references** — "Sync with Marek about Phoenix deadline" → agent doesn't know who Marek is or what Phoenix is; **fix**: use wikilinks `[[World/People/Marek-Kowalski]]`, `[[Craft/Projects/Phoenix]]`
  2. **Opaque links** — shortened URLs (`bit.ly/x7k2p`) and vague anchors ("described here") carry zero signal for agents; **fix**: use descriptive wikilinks or full references with titles
  3. **Vague temporal references** — "as discussed in the last call", "the previous approach" are dead ends; **fix**: link to specific dated notes `[[Craft/Projects/Alice/calls/2026-03-01]]`
  4. **Links only appearing once** — if a wikilink appears only at line 199 of a 340-line document, an agent reading lines 1-200 may cut off just before it; **fix**: repeat key links near the top or in frontmatter; they must survive partial reads
  5. **Overwritten versions** — in-place edits destroy history; agent can't determine what's current or why it changed; **fix**: versioned files (`proposal-v3.md`) with `supersedes: [[proposal-v2]]` and change reason
- **Core rule: write as if the reader has zero prior context** — names, links, references, and versions must be self-contained; the agent has no memory outside what's on the page
- **This explains why agents struggle with direct access to external documents** — documents written for humans assume too much shared knowledge

## 6. AI Engagement Balance — Human Content, AI Organization

- **Core principle: humans own the content and rules; AI handles organization** — this is the starting point for balancing engagement
- **Generating content you never read is dangerous** — you quickly lose orientation in what's happening; when something goes wrong, you can't fix it; for knowledge bases this is even worse because you lose the entire purpose of building one
- **Clear boundary that agents cannot cross** — defined per activity type:
- **Human-dominant activities**:
  - **Direction** — what matters, what to capture, what the KB is for; AI has no say
  - **Writing** — your words, your perspective; AI assists with phrasing only
  - **Curation** — you decide what stays, expands, or gets archived; AI surfaces candidates
- **Shared activities**:
  - **Transformation** — you provide the source (image, voice, rough draft); AI formats and structures it; content stays yours
  - **Commenting** — AI adds observations in a separate block; source note untouched
  - **Organization** — AI suggests correct location with reasoning; you confirm
- **AI-dominant activities**:
  - **Templates** — structure defined once in System/; AI applies the right template on every new note
  - **Linking** — linking rules defined by you; AI scans vault and proposes `[[wikilinks]]`
  - **Validation** — conventions set by you; AI flags missing frontmatter, broken links, wrong placement
  - **Indexing** — AI generates and updates Maps of Content (MoC); you trim
  - **Auditing** — AI scans for orphans, duplicates, noise; you decide what to act on
- **Exception: agent-dedicated areas** — in Ops/ directories, content can be fully agent-created, but according to your rules and for your defined purposes

## 7. Agent Integration — Templates, Navigation, and Autonomous Note Management

- **Example system (`04_04_system`)** — minimalist multi-agent system where the knowledge base in markdown IS the main component
- **Template system** — `workspace/system/templates/` contains 9 templates across 2 areas (Craft, World):
  - **Craft templates**: Idea (minimal), Knowledge (standard), Project (standard), Experiment (standard), Shared (full with publish lifecycle)
  - **World templates**: Person (minimal), Source (standard), Event (standard), Service (standard)
  - **Frontmatter levels**: minimal = title + tags; standard = + description, status; full = + publish lifecycle
- **Agent decision flow for note placement** (4-step process):
  1. **Parse intent** — classify note type from user message, determine area and template
  2. **Explore workspace** — search for duplicates, read the template, list target directory, cross-reference scan for related concepts, search for source candidates
  3. **Resolve structure** — confirm no duplicates, determine subfolder, choose slug, plan sections, identify wikilinks and source references, compose frontmatter
  4. **Write** — create the note, confirm to user, suggest next steps (e.g., "add arxiv source note")
- **A single note may trigger a dozen LLM calls** — explore structure, read template, search for duplicates, scan related concepts; the larger the knowledge base, the more value AI provides through structural consistency
- **Agent equipped with knowledge base knowledge doesn't just store — it navigates** — this opens a large space for autonomous actions

## 8. Multi-Agent Processes in the Knowledge Base

- **Ops directory as process definition space** — `workspace/ops/` describes processes executed exclusively by agents, including inter-agent collaboration
- **Daily-news example** — 4 simple text files define a repeatable multi-agent process:
  - `_info.md` — process overview: sources, topics, phase table, output structure
  - `01-research.md` — research agent instructions (search sources, write per-topic notes)
  - `02-assemble.md` — assembly agent instructions (merge topic notes into HTML digest)
  - `03-deliver.md` — delivery agent instructions (verify digest, send email, write status)
- **Execution flow**:
  1. **Scheduler** sends "Execute process: daily-news" automatically every morning
  2. **Main agent** reads all ops files, parses task split, prepares scoped instructions for each sub-agent
  3. **Sub-agents** execute in sequence: Research → Assemble → Deliver
  4. **Each run produces a dated output folder** — same process, fresh data, every day
- **Key insight: 4 simple text files translate into a repeatable, delegated process** — instruction files never change; each run is a new execution against the same structure
- **This combines everything from the course** — knowledge bases, multi-agent systems (S02E04), background agents (S04E03), direct agent work (S04E02), filesystem, and the Digital Garden concept (S04E01)
- **Extensibility** — describe more processes, connect more tools; the pattern scales without architectural changes

## 9. Automation Verification — The Gap Between "Done" and "Done Correctly"

- **"The Ironies of Automation" (Lisanne Bainbridge, 1983)** — the more advanced the automation, the harder it is for humans to notice when something goes wrong; automation eliminates repetitive contact with the process, and that contact built the intuition that "something isn't right"
- **The better automation looks, the less you should trust it** — professional-looking output creates false confidence; the model may even add "data current as of today" when it's a lie
- **Four essential verification patterns** (each ~20 lines of code, massive reliability impact):

### Pattern 1: Heartbeat Monitoring

- **Concept**: after every run, the task pings an external service ("I'm alive, result is OK" or "I'm alive, result is bad")
- **If the ping doesn't arrive within the expected window** — the service raises an alarm
- **Silent refusal is as bad as silent error** — a task that correctly refuses to run (e.g., stale data) but doesn't alert anyone is a failure mode
- **Tool**: [healthchecks.io](https://healthchecks.io) — create a check, get a URL, curl it at the end of your task; alerts via email/Slack/SMS; 3 minutes setup, zero infrastructure
- **This was lesson learned**: report stopped generating for 5 days (timestamp check correctly blocked stale data, but nobody knew the API source was down)

### Pattern 2: Output Validation

- **Don't trust exit codes — verify the output itself**
- **Four questions that catch 90% of problems**:
  1. **Does the output exist?** — sounds obvious; see GitLab 2017 (backup script logged "Backup Complete!" but wrote to a non-existent directory; 6 hours of production data lost)
  2. **Does it have a sensible size?** — 0-byte backup is not a backup; single-sentence report is not a report
  3. **Is the format correct?** — if expecting JSON, parse it; if CSV, count columns; if PDF, open page 1
  4. **Is the content complete?** — if report should cover 7 days, verify it has 7 days of data
- **GitLab 2017 incident** — published full public postmortem; key recommendation: "verify that a backup can be restored", not just that the script ran
- **Principle: verify the EFFECT of the action, not the action itself**

### Pattern 3: Explicit Timezone Declaration

- **Every schedule must have an explicitly declared timezone** — not the server default, not "probably UTC"; in config, in code, in comments
- **If anyone on the team has to guess what timezone the scheduler runs in, that's a bug**
- **Real-world example**: server on US East (UTC-5), report scheduled for 9:00 but runs at 15:00 local time in Poland; by then it's buried under 10 Slack threads; nobody sees it
- **Note**: Kubernetes only added native timezone support for CronJobs in version 1.27 (2023)

### Pattern 4: Lock Files (Concurrency Guard)

- **Problem**: slow data source causes task to run 50 minutes instead of 5; scheduler fires a second instance; two processes write to the same file; result is corrupted
- **Solution**: before starting, check for a lock file; if it exists, the previous instance is still running — don't start a new one
- **Crash recovery**: lock file contains a timestamp; after TTL expiry, the lock is ignored (stale lock = something crashed, safe to retry)
- **These race conditions are devilishly hard to debug** — they only occur when processes overlap in time: rarely, randomly, and always at the worst moment

### The Complete Automation Checklist

- **Version 1** (works for a week): cron → model → Slack — 3 lines, beautiful, fragile
- **Production version**: explicit timezone + input data verification + output validation + heartbeat to healthchecks.io + lock file + alert on failure — ~30 extra lines
- **"The difference between automation I trust and automation I pray for is those 20 lines"**
- **Core message**: automate aggressively, but every automation without verification is just a way to not check things manually; the outcome is the same — nobody knows what's happening

## 10. Starting Without Code

- **At this stage, you may not need to write any code** — connect the knowledge base directory directly to Claude Code and shape processes, notes, and templates with the agent
- **Progression path**:
  1. Start with Claude Code + knowledge base directory (zero code)
  2. Add MCP servers and CLI tools as needed
  3. Later: run processes on remote servers, connect interfaces
  4. Eventually: write full custom agent logic from scratch
- **Iterative conversation with AI** is valuable for shaping the structure — don't try to design the perfect structure upfront; build incrementally through practice
