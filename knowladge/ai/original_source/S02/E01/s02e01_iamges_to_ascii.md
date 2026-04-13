ai_devs_4_generalized_prompt_context-b0d37dd2-5.png

MEMORY-AWARE AGENT ARCHITECTURE

Legend:
[System Prompt] [Application Code] [LLM Agent]

========================
REQUEST ASSEMBLY
========================

[STATIC]

+------------------------------------------------------------+
| SYSTEM PROMPT |
| |
| // Generalized, stable instructions |
| You have access to long-term memory. |
| Use it to recall: |
| - your personality & communication style |
| - user profiles & preferences |
| - past conversations context |
| |
| // No specific data - just the "role" of memory |
+------------------------------------------------------------+
|
v

[CODE]

+------------------------------------------------------------+
| TOOLS DEFINITION (APPENDED) |
| |
| memory_search(queries[]) -> retrieve from memory areas |
| memory_save(content) -> store new information |
| memory_update(id, ...) -> modify existing memory |
| |
| Tools are the bridge - LLM knows WHAT, code knows HOW |
+------------------------------------------------------------+
|
v

========================
RUNTIME
========================

[LLM]

+------------------------------------------------------------+
| USER MESSAGE |
| |
| "How are you?" |
+------------------------------------------------------------+
|
v

[LLM]

+------------------------------------------------------------+
| LLM GENERATES TOOL CALL |
| |
| // "How are you?" -> needs: who am I + who is asking |
| |
| { |
| tool: "memory_search", |
| queries: [ |
| "agent identity personality tone", |
| "user profile recent conversation context" |
| ] |
| } |
+------------------------------------------------------------+
|
v

[CODE]

+------------------------------------------------------------+
| APPLICATION EXECUTES |
| |
| const results = await Promise.all( |
| payload.queries.map(q => memoryStore.search(q)) |
| ) |
| |
| // Returns both: agent style + user context |
+------------------------------------------------------------+
|
v

[LLM]

+------------------------------------------------------------+
| RESPONSE |
| |
| Combines: |
| - agent personality |
| - user context |
| |
| "Doing well! By the way, how did that deadline |
| you mentioned yesterday go?" |
+------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_system_vs_tools-460b59a5-d.png

ENVIRONMENT DATA IN SYSTEM PROMPTS

PRE-LOADED (SYSTEM PROMPT) TOOL-FETCHED (ON DEMAND)

+------------------------------------------------+ +------------------------------------------------+
| App State | | Full User Profile |
| foreground | background | cron | | detailed preferences, history |
| human present: true/false | | communication patterns, goals |
+------------------------------------------------+ +------------------------------------------------+

+------------------------------------------------+ +------------------------------------------------+
| Interface Type | | Deep Conversation History |
| voice | chat | api | | past threads, resolved tasks |
| | | long-term context retrieval |
+------------------------------------------------+ +------------------------------------------------+

+------------------------------------------------+ +------------------------------------------------+
| Permissions & Features | | Task-Specific Knowledge |
| web: enabled, fs: read-only | | retrieved docs, search results |
| memory: enabled, payments: disabled | | relevant code, external data |
+------------------------------------------------+ +------------------------------------------------+

+------------------------------------------------+ +------------------------------------------------+
| User Brief | | Detailed Device States |
| Adam, developer, direct tone | | all sensors, full smart home |
| timezone: Europe/Warsaw | | service health details |
+------------------------------------------------+ +------------------------------------------------+

+------------------------------------------------+ +------------------------------------------------+
| Context Snapshots | | Full Calendar & Inbox |
| 3 meetings today, 2 unread priority | | all events, message threads |
| Mac: online, API: degraded | | attachments, participants |
+------------------------------------------------+ +------------------------------------------------+

+------------------------------------------------+ +------------------------------------------------+
| Conversation Brief | | Detailed Settings |
| topic: prompt design | | all user preferences |
| pending: review diagram draft | | per-tool configurations |
+------------------------------------------------+ +------------------------------------------------+

SHAPES BEHAVIOR - LOADED ONCE PROVIDES DEPTH - FETCHED WHEN NEEDED

+--------------------------------------------------------------------------------------------------+
| DECISION FILTER |
| What must the agent know before tools to avoid unnecessary calls and shorten path to goal? |
+--------------------------------------------------------------------------------------------------+

=====================================================================================================================
ai_devs_4_session_state-aec5a223-1.png

SESSION STATE IN SYSTEM PROMPTS

Legend:
[Static] [Pruned] [Session]

                         +------------------+
                         |   FRESH SESSION  |
                         +------------------+

+--------------------------------------------------------------------------------------+
| CONTEXT WINDOW ~12% used |
|--------------------------------------------------------------------------------------|
| STATIC |
| +----------------------------------------------------------------------------------+ |
| | SYSTEM PROMPT | |
| | // universal instructions | |
| | // environment data | |
| | No session block | |
| +----------------------------------------------------------------------------------+ |
| |
| MSGS |
| +----------------------------------------------------------------------------------+ |
| | MESSAGES | |
| | USER "Analyze this CSV file" | |
| | ASST tool_call -> read_file | |
| | USER "Now group by region" | |
| +----------------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------------+

                                     |
                                     v

                              +-------------------+
                              | LIMIT APPROACHING |
                              +-------------------+

+--------------------------------------------------------------------------------------+
| CONTEXT WINDOW ~87% used |
|--------------------------------------------------------------------------------------|
| STATIC |
| +----------------------------------------------------------------------------------+ |
| | SYSTEM PROMPT | |
| | // universal instructions | |
| | // environment data | |
| +----------------------------------------------------------------------------------+ |
| |
| PRUNED |
| +----------------------------------------------------------------------------------+ |
| | MESSAGES x 34 -- REMOVED | |
| | USER "Analyze this CSV file" | |
| | ASST tool_call -> read_file | |
| | ... | |
| | USER "Build a pivot table" | |
| | ASST tool_call -> run_code | |
| +----------------------------------------------------------------------------------+ |
| |
| MSGS |
| +----------------------------------------------------------------------------------+ |
| | MESSAGES x 13 -- KEPT | |
| | USER "Add a trend column" | |
| | ASST tool_call -> run_code | |
| | USER "Export to PDF" | |
| +----------------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------------+

-- 34 older turns compressed into summary, stored at session_store:abc-123

                                     |
                                     v

                         +---------------------------+
                         |   SYSTEM PROMPT MUTATED   |
                         +---------------------------+

+--------------------------------------------------------------------------------------+
| CONTEXT WINDOW ~38% used |
|--------------------------------------------------------------------------------------|
| STATIC |
| +----------------------------------------------------------------------------------+ |
| | SYSTEM PROMPT | |
| | // universal instructions | |
| | // environment data | |
| +----------------------------------------------------------------------------------+ |
| |
| SESN |
| +----------------------------------------------------------------------------------+ |
| | SESSION BLOCK -- INJECTED | |
| | | |
| | compressed_context: | |
| | "User uploaded sales.csv, analyzed by region. Built pivot table. | |
| | Added trend column via run_code. | |
| | Current: exporting final report." | |
| | | |
| | removed_messages: 34 // turns 1-34 | |
| | retrieval: "session_store:abc-123" | |
| | artifacts: "pivot_table.csv, trends.py" | |
| +----------------------------------------------------------------------------------+ |
| |
| MSGS |
| +----------------------------------------------------------------------------------+ |
| | MESSAGES x 13 // RECENT ONLY | |
| | USER "Add a trend column" | |
| | ASST tool_call -> run_code | |
| | USER "Export to PDF" | |
| +----------------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_balance-14cfebe4-5.png

WHERE LOGIC LIVES
How application components migrate from code-controlled to AI-driven as agent complexity grows

Legend:
[code] deterministic program logic
[code+ai] hybrid logic
[ai] model-driven logic

                      AI WORKFLOW               AGENT + TOOLS               MULTI-AGENT
                   code 65% | hybrid 26% | ai 9%   code 27% | hybrid 43% | ai 30%   code 8% | hybrid 49% | ai 44%

## ROUTING & PLANNING

Intent classification [code+ai] [ai] [ai]
Task decomposition [code] [code+ai] [ai]
Step sequencing [code] [code+ai] [ai]
Agent selection [ ] [code] [ai]

## CONTEXT MANAGEMENT

Context selection [code] [code+ai] [code+ai]
Summarization [ ] [ai] [ai]
Relevance scoring [code] [code+ai] [code+ai]
Prompt assembly [code] [code] [code+ai]

## MEMORY

Storage & retrieval [code] [code] [code+ai]
Relevance decay [code] [code] [code+ai]
Shared state [code] [code] [code+ai]

## TOOL ORCHESTRATION

Tool selection [code] [ai] [ai]
Parameter construction [code] [ai] [ai]
Result interpretation [code] [ai] [ai]
Multi-tool coordination [code] [code+ai] [ai]

## ERROR HANDLING & RECOVERY

Failure detection [code] [code] [code+ai]
Retry strategy [code] [code] [code+ai]
Self-correction [ ] [ai] [ai]
Fallback planning [code] [code+ai] [ai]

## EVALUATION & QUALITY

Output validation [code] [code+ai] [code+ai]
Goal completion check [code] [code+ai] [code+ai]
Quality scoring [code+ai] [ai] [ai]
Hallucination detection [code+ai] [code+ai] [code+ai]

## SECURITY & GUARDRAILS

Auth / permissions [code] [code] [code]
Input sanitization [code+ai] [code+ai] [code+ai]
Output filtering [code+ai] [code+ai] [code+ai]
Injection defense [code+ai] [code+ai] [code+ai]

## STATE & COORDINATION

Session tracking [code] [code] [code]
Progress monitoring [code] [code+ai] [code+ai]
Inter-agent messaging [ ] [ ] [code+ai]
Conflict resolution [ ] [ ] [ai]

## DATA FLOW

Input parsing [code+ai] [code+ai] [code+ai]
Output formatting [code+ai] [code+ai] [code+ai]
Schema enforcement [code] [code] [code]
Data transformation [code] [code+ai] [code+ai]

## CORE INTELLIGENCE

Reasoning [ai] [ai] [ai]
Generation [ai] [ai] [ai]
Interpretation [ai] [ai] [ai]
Judgment [code+ai] [ai] [ai]

=====================================================================================================================

ai_devs_4_search-389e2566-1.png

                     +------------------+
                     |  DEFAULT BEHAVIOR|
                     +------------------+

STEP 1 STEP 2 RESULT
+----------------------+ +----------------------+ +----------------------+
| Search (EN) | --> | Retry (PL) | --> | Partial |
| | | | | |
| "context engineering"| | "okno kontekstowe" | | S01E05 missed |
| "context window" | | "zarządzanie | | "limity modeli" |
| | | kontekstem" | | not reachable via |
| 0 results | | | | "okno kontekstowe" |
| | | 2 docs found | | |
+----------------------+ +----------------------+ +----------------------+

=====================================================================================================================

ai_devs_4_prompt_strategies-5cf00be6-4.png

PROMPT STRATEGIES FOR AGENTIC SEARCH

+----------------------------------------------------------------------------------+
| A - LANGUAGE HINT |
|----------------------------------------------------------------------------------|
| "Documents in AI_devs folder are written in Polish" |
| |
| COVER: ████░░░░░░░░░░░░░░░░░░ |
| COST: ░░░░░░░░░░░░░░░░░░░░ |
| |
| Fixes language, not semantic reach |
+----------------------------------------------------------------------------------+
|
v
+----------------------------------------------------------------------------------+
| B - EXPLICIT MAPPING |
|----------------------------------------------------------------------------------|
| "When asked about context window, also search for model limits" |
| |
| COVER: ██████████░░░░░░░░░░ |
| COST: ░░░░░░░░░░░░░░░░░░░░ |
| |
| Too specific, one case only |
+----------------------------------------------------------------------------------+
|
v
+----------------------------------------------------------------------------------+
| C - BROADER SCOPE |
|----------------------------------------------------------------------------------|
| "When exploring documents, also search for related topics" |
| |
| COVER: █████░░░░░░░░░░░░ |
| COST: █████░░░░░░░░░░░░ |
| |
| "Related" is ambiguous |
+----------------------------------------------------------------------------------+
|
v
+----------------------------------------------------------------------------------+
| D - FEW-SHOT EXAMPLES |
|----------------------------------------------------------------------------------|
| "context window" -> search: "okno kontekstowe", |
| "limity modeli", "token limit" |
| |
| COVER: █████████████░░░ |
| COST: █████████████░░░ |
| |
| Verbose, eats context window |
+----------------------------------------------------------------------------------+
|
v
+----------------------------------------------------------------------------------+
| E - DEEP SEARCH PROCESS |
|----------------------------------------------------------------------------------|
| "Search in 3 passes: keywords first, then synonyms, then adjacent concepts. |
| Verify coverage before proceeding." |
| |
| COVER: █████████████████ |
| COST: ███████████████████ |
| |
| Overkill for simple queries |
+----------------------------------------------------------------------------------+

Coverage and cost scale together. No prompt guarantees full retrieval.

=====================================================================================================================

ai_devs_4_agentic_rag-7d824529-2.png

ADAPTIVE RAG AGENT — SAME PROMPT, DIFFERENT BEHAVIOR
Multi-phase research (18 steps, iterative discovery) vs direct lookup (4 steps, single read)

[keyword] Upfront term
[keyword] Discovered from content

COMPLEX QUERY
18 steps ~57s 538k input tokens

SCAN
1 Tree scan → find S01\* files
5 steps, 4 scans + filename search → 5 files found

PHASE 1 — SEARCH
6 5 parallel content searches
Upfront keywords from query analysis
kontekst okno token pamięć system

PHASE 2 — DISCOVERED TERMS
7 5 parallel follow-up searches
Terms found in Phase 1 results — impossible to guess upfront
cache kompres Progressive Disclosure izolac pływ

READ FRAGMENTS
8 S01E01 lines 35–90
Context window fundamentals

9 S01E01 lines 220–270
Token limits, pricing

10 S01E01 292–312 · S01E02 45–90
Prompt structure, role definitions

13 S01E02 ×3 parallel reads
Compression, history management

14 S01E05 136–156 · S01E03 1–70
Rate limits, RAG basics

17 S01E03 lines 1–70
Context isolation techniques

ANSWER
18 19 bullet points · 4 files cited
Found: context isolation, premise ordering,
progressive disclosure, cache behavior

TOKEN BUDGET
Total input 538,962
Total output 4,602
Total cached 389,016
Reasoning 2,214 (48%)

OVERALL CACHE HIT
72%

Final answer step
93% cached

SIMPLE QUERY
4 steps ~6s 13k input tokens

SCAN
1 Tree scan
Orientation — list workspace

LOCATE
2 Find S01E01 by filename
No content search needed — query names the file

READ
3 Read S01E01 lines 1–20
Just enough to find the first sentence

ANSWER
4 "Cześć!"
Direct answer with file citation

TOKEN BUDGET
Total input 13,091
Total output 400
Total cached 10,880
Reasoning 204 (51%)

OVERALL CACHE HIT
83%

Final answer step
84% cached

→ Same system prompt skipped the entire search-read loop.
→ No keywords, no phases, no multi-step discovery.
→ 41× fewer input tokens.

=====================================================================================================================

ai_devs_4_prompt_structure-6f64dd54-d.png

RAG AGENT SYSTEM PROMPT

+----------------------------------------------------------------------------------+
| You are an agent that answers questions by searching and reading available |
| documents. You have tools to explore file structures, search content, and read |
| specific fragments. Use them to find evidence before answering. |
+----------------------------------------------------------------------------------+

SEARCH GUIDANCE

Scan
If no specific path is given, start by exploring the resource structure —
scan folder hierarchies, file names, and headings of potentially relevant
documents.

Deepen
This is an iterative process, not a single step:

- Search with initial keywords, synonyms, and related terms
  at least 3–5 angles

- Read the most promising fragments from search results

- While reading, collect new terminology, concepts,
  section names, proper names

- Run follow-up searches using newly discovered terms

- Repeat until no significant new terms emerge

Explore
Look for related aspects —
cause/effect, part/whole, problem/solution,
limitations/workarounds, requirements/configuration —
investigating each as a separate lead.

Verify
Before answering, check coverage:
definitions, numbers/limits, edge cases, steps, exceptions.

If gaps remain, return to Deepen with new terms.

EFFICIENCY

• NEVER read entire files upfront.
Always search for relevant content first.

• Do NOT jump to reading after just one or two searches.
Exhaust keyword variations first.

• Use search results
paths + matching lines
to identify which fragments matter,
then read only those specific line ranges.

• Reading a full file is a last resort
only when the entire document is relevant and short.

RULES

• Ground answers in actual file content
cite specific documents and fragments.

• If information is not found,
say so explicitly.

• When multiple documents are relevant,
synthesize across them.

• Report which files you consulted
so the user can verify.

+----------------------------------------------------------------------------------+
| CONTEXT |
|----------------------------------------------------------------------------------|
| Knowledge base |
| AI_devs course materials stored as S01\*.md files |
| |
| Content language |
| Polish — use Polish keywords when searching |
| |
| Response language |
| Always respond in English |
+----------------------------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_explain-877db0a4-e.png

LLM EXPLAINING ITS OWN BEHAVIOR

Legend:
[User] [Agent] [Tool] [Developer]

[USER]
+-------------------------------------------------------------+
| Get me 3 key facts from this video |
| youtube.com/watch?v=abc123 |
+-------------------------------------------------------------+
|
v

[AGENT]
+-------------------------------------------------------------+
| FUNCTION CALL |
| { |
| "name": "load_url", |
| "args": { |
| "url": "youtube.com/watch?v=abc123" |
| } |
| } |
+-------------------------------------------------------------+
|
v

[TOOL]
+-------------------------------------------------------------+
| ERROR |
| Cannot extract text - dynamic content |
+-------------------------------------------------------------+
|
v

[AGENT]
+-------------------------------------------------------------+
| Sorry, I can't access video content. |
| x never tried analyze_video |
+-------------------------------------------------------------+

------------------------------[ DEVELOPER ]------------------------------

[DEV]
+-------------------------------------------------------------+
| Why didn't you use analyze_video? |
+-------------------------------------------------------------+
|
v

[AGENT]
+-------------------------------------------------------------+
| The instruction says: |
| |
| "When the user provides a link, load it first, then |
| use appropriate tools" |
| |
| I treated load_url as mandatory step 1. |
| It failed, so I stopped. |
| |
| Fix: route by content type first. |
| Video URLs -> analyze_video directly. |
+-------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_iteration-7ec2df6a-f.png

FROM BROKEN TOOL CALL TO UNIVERSAL OPERATING RULES

Legend:
[Problem] [Iteration] [Result]

----------------------------------- OBSERVE -----------------------------------

[INPUT]
+----------------------------------------------------------------------------------+
| THE BROKEN INTERACTION |
| Model receives video URL + load_url + analyze_video |
| |
| User: "Get me 3 key facts from this video" |
| Model: load_url("youtube.com/watch?v=abc123") |
| Tool: ERROR: Cannot extract text |
| Model: "Sorry, I can't access video content." |
+----------------------------------------------------------------------------------+
|
v

----------------------------------- DIAGNOSE -----------------------------------

[ROOT]
+----------------------------------------------------------------------------------+
| ROOT CAUSE PATTERNS |
| |
| [No input classification] [Generic tool preferred] [No scope boundaries] |
| |
| [Failure = give up] |
+----------------------------------------------------------------------------------+
|
v

----------------------------------- ITERATE ------------------------------------

[V1]
+----------------------------------------------------------------------------------+
| Tool-specific rules |
| Hard domain routing, negative constraints, retry ladder |
| |
| [Oversteered] [Brittle to new tools] |
+----------------------------------------------------------------------------------+
|
v

[V2]
+----------------------------------------------------------------------------------+
| Input-type routing |
| Classify input type, match to capability, prefer specific tools |
| |
| [Still tool-aware] [Mentions "open it and see"] |
+----------------------------------------------------------------------------------+
|
v

[V3]
+----------------------------------------------------------------------------------+
| Action-oriented policy |
| Generic "actions" language, input nature check, scope discipline |
| |
| [Still leaks tool patterns] |
+----------------------------------------------------------------------------------+
|
v

------------------------------------ RESULT ------------------------------------

[FINAL]
+----------------------------------------------------------------------------------+
| UNIVERSAL OPERATING RULES |
| |
| 1) Identify intent: what the user wants produced |
| 2) Identify constraints: what's missing, what's needed |
| 3) Choose actions by fit: fewest assumptions |
| 4) Enforce scope: don't misuse actions |
| 5) Handle uncertainty: ask or pick safest option |
| 6) Failure protocol: interpret cause, retry, then report |
| 7) Be explicit about limits: what failed and why |
+----------------------------------------------------------------------------------+

Zero tool references.
Survives adding/removing tools.
Fixes the original bug through reasoning discipline, not hardcoded routing.

=====================================================================================================================

ai_devs_4_transformation-7ef42b7d-5.png

BEFORE → AFTER: 3 LINES TO 7 OPERATING RULES

BEFORE
+--------------------------------------------------------------+
| You are a helpful assistant. |
| Follow the user's request and provide clear, concise answers.|
| If you cannot access required content, state that limitation |
| plainly. |
+--------------------------------------------------------------+

                           →

AFTER
+--------------------------------------------------------------+
| You are a helpful assistant. Follow the user's request and |
| provide clear, concise answers. If you cannot access |
| required content, state that limitation plainly. |
| |
| Operating rules: |
| |
| 1) Identify intent: restate what the user wants produced |
| |
| 2) Identify constraints: note what's missing to succeed |
| |
| 3) Choose actions by fit: fewest assumptions |
| |
| 4) Enforce scope: don't misuse actions |
| |
| 5) Handle uncertainty: ask or pick safest option |
| |
| 6) Failure protocol: interpret cause, retry, then report |
| |
| 7) Be explicit about limits: what failed and why |
+--------------------------------------------------------------+

Same base prompt. Seven rules added.
No tool names, no domain lists, no input types.
Pure reasoning discipline that scales to any toolset.

=====================================================================================================================

ai_devs_4_typical_context_window-563eecaf-7.png

DYNAMIC SYSTEM INSTRUCTION — CONTEXT WINDOW

+--------------------------------------------------------------------------------------+
| CONTEXT WINDOW ~4,200 tokens |
+--------------------------------------------------------------------------------------+

SYSTEM PROMPT [STATIC · CACHED]
+--------------------------------------------------------------------------------------+
| You are a helpful assistant named Alice. |
| |
| Rules: |
| - Respond concisely and directly |
| - Use tools when the user asks for real-time data or actions |
| - Always confirm before destructive ops |
| - Format output as Markdown |
+--------------------------------------------------------------------------------------+

TOOL DEFINITIONS [STATIC · CACHED]

+--------------------------------------------------------------------------------------+
| f web_search |
| query, limit |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| f read_file |
| path, lines |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| f send_email |
| to, subject, body |
+--------------------------------------------------------------------------------------+

CONVERSATION [DYNAMIC · GROWING]

[USER]
+--------------------------------------------------------------------------------------+
| Hey, what's the weather in Kraków? |
+--------------------------------------------------------------------------------------+

[AGENT]
+--------------------------------------------------------------------------------------+
| Let me check that for you. |
| -> web_search("weather Kraków") |
+--------------------------------------------------------------------------------------+

[USER]
+--------------------------------------------------------------------------------------+
| Thanks! Also remind me — did I upload any notes yesterday? |
+--------------------------------------------------------------------------------------+

[AGENT]
+--------------------------------------------------------------------------------------+
| Checking your files... |
| -> read_file("/notes/2026-02-06") |
+--------------------------------------------------------------------------------------+

...

Static parts (system prompt + tools) stay pinned at the top for cache hits.
The conversation grows downward, consuming the remaining window.

=====================================================================================================================

ai_devs_4_coding_agent-ae869f7f-b.png

CODING AGENT — CONTEXT WINDOW STRUCTURE

+--------------------------------------------------------------------------------------+
| CONTEXT WINDOW coding assistant|
+--------------------------------------------------------------------------------------+

SYSTEM PROMPT [STATIC · CACHED]
+--------------------------------------------------------------------------------------+
| You are a coding assistant operating inside the user's IDE. You have access to |
| the file system, terminal, and browser tools. |
| |
| Rules: |
| - Read before editing |
| - Confirm destructive ops |
| - Prefer bun over npm |
| - Follow the user's coding conventions |
+--------------------------------------------------------------------------------------+

TOOL DEFINITIONS [STATIC · CACHED]

+--------------------------------------------------------------------------------------+
| f read_file |
| path, lines |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| f edit_file |
| path, old, new |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| f run_command |
| cmd, cwd |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| f search_code |
| query, path, regex |
+--------------------------------------------------------------------------------------+

------------------------------- INITIAL MESSAGE --------------------------------------

USER MESSAGE #1 [ONE-TIME STATE INJECTION]

+--------------------------------------------------------------------------------------+
| <user_info> |
| macOS, zsh, ~/dev/myapp, git repo, 2026-02-07 |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| <git_status> |
| main ~ origin/main, 3 modified, 1 untracked |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| <rules> |
| bun over npm, TypeScript strict, prefer composition |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| <agent_skills> |
| create_file, refactor, test - with skill file paths |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| <mcp_instructions> |
| browser automation server config |
+--------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------+
| <open_files> |
| src/api.ts focused L42, src/types.ts, README.md |
+--------------------------------------------------------------------------------------+

[USER]
+--------------------------------------------------------------------------------------+
| The fetch call in api.ts keeps timing out. Can you add retry logic? |
+--------------------------------------------------------------------------------------+

[AGENT]
+--------------------------------------------------------------------------------------+
| Reading api.ts to understand the current fetch setup. |
| -> read_file("src/api.ts") |
+--------------------------------------------------------------------------------------+

------------------------------ SUBSEQUENT MESSAGE ------------------------------------

USER MESSAGE #2 [REFRESHED STATE]

+--------------------------------------------------------------------------------------+
| <open_files> |
| src/api.ts focused L67, src/utils/retry.ts new |
+--------------------------------------------------------------------------------------+

[USER]
+--------------------------------------------------------------------------------------+
| Looks good. Now add exponential backoff to that retry. |
+--------------------------------------------------------------------------------------+

[AGENT]
+--------------------------------------------------------------------------------------+
| Reading the retry utility to extend it. |
| -> read_file("src/utils/retry.ts") |
+--------------------------------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_context_beyond_window-c8536bad-2.png

INTERACTION STATE CONTROL BEYOND THE CONTEXT WINDOW

EXTERNAL MECHANISMS CONTEXT WINDOW EXTERNAL MECHANISMS

-------------------------------------- REAL-TIME --------------------------------------

SESSION
+--------------------------------------------------------------+
| Hooks monitor state and metadata, trigger partial |
| summaries or external updates |
| |
| on:message hooks |
| partial summaries |
| state snapshots |
| -> hooks & events |
+--------------------------------------------------------------+

                              +----------------------+
                              |    Context Window    |
                              |  Active conversation |
                              +----------------------+

ENVIRONMENT
+--------------------------------------------------------------+
| External signals injected when conditions are met, |
| beyond the user's device |
| |
| IoT sensors |
| location data |
| system alerts |
| -> conditional injection |
+--------------------------------------------------------------+

-------------------------------------- NEAR-TIME --------------------------------------

FILES
+--------------------------------------------------------------+
| Persistent storage for tool results, |
| collaboration, skills, and long-term data |
| |
| tool output logs |
| shared documents |
| skill definitions |
| data collection |
| -> read / write |
+--------------------------------------------------------------+

AGENTS
+--------------------------------------------------------------+
| Multi-agent cooperation across separate context windows |
| with shared state |
| |
| delegated tasks |
| shared memory |
| status sync |
| -> multi-window |
+--------------------------------------------------------------+

-------------------------------------- BACKGROUND -------------------------------------

MEMORY
+--------------------------------------------------------------+
| Memories built asynchronously, |
| even long after a session ends |
| |
| Batch API |
| daily processing |
| preference extraction |
| -> scheduled batch |
+--------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_prefilling-f52cf34f-e.png

PREFILLING — BROWSER SESSION TOOL LOCK

[AGENT]
+----------------------------------------------------------------------------------+
| Agent decides to open browser |
| Model generates a tool call to launch a browser session |
+----------------------------------------------------------------------------------+
|
v

[APPLICATION]
+----------------------------------------------------------------------------------+
| Browser session detected |
| System deterministically identifies an active browser session |
+----------------------------------------------------------------------------------+
|
v

                           +---------------------------+
                           |   PREFILLING ACTIVATED    |
                           +---------------------------+

+----------------------------------------------------------------------------------+
| PREFILLED TOKENS |
| <|im*start|>assistant<tool_call> |
| {"name": "browser*... |
+----------------------------------------------------------------------------------+

Model can only complete a tool name starting with browser\_

                                     |
                                     v

.----------------------------------------------------------------------------------.
| BROWSER SESSION ACTIVE |
| |
| AVAILABLE TOOLS |
| [browser_click] [browser_type] [browser_scroll] [browser_close] |
| |
| BLOCKED TOOLS |
| [file_read] [shell_exec] [code_run] [search] |
| |
| ↑ repeats until browser_close is called |
'----------------------------------------------------------------------------------'

                                     |
                                     v

+----------------------------------------------------------------------------------+
| SESSION CLOSED |
| All tools unlocked |
| Prefilling stops, agent regains full tool access |
+----------------------------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_todo-381ad2b4-e.png

TODO — AGENT TASK MANAGEMENT

[USER]
+--------------------------------------------------------------+
| Do A, B, and C |
+--------------------------------------------------------------+
|
v

[AGENT -> TODOWRITE]
+--------------------------------------------------------------+
| ▶ CURRENT Task A |
| ○ PENDING Task B |
| ○ PENDING Task C |
+--------------------------------------------------------------+
|
v

[AGENT]
+--------------------------------------------------------------+
| Performs Task A |
+--------------------------------------------------------------+
|
v

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. PER TASK .
. +----------------------------------------------------------+ .
. | [AGENT -> TODOWRITE] | .
. | ✓ DONE Task A | .
. | ▶ CURRENT Task B | .
. | ○ PENDING Task C | .
. +----------------------------------------------------------+ .
. | .
. v .
. +----------------------------------------------------------+ .
. | [AGENT] | .
. | Performs Task B | .
. +----------------------------------------------------------+ .
. .
. mark done, advance, repeat .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

                            |
                            v

[FINAL STATE]
+--------------------------------------------------------------+
| ✓ DONE Task A |
| ✓ DONE Task B |
| ✓ DONE Task C |
+--------------------------------------------------------------+

=====================================================================================================================

ai_devs_4_plan_mode-f92aa31c-f.png

PLAN MODE — INSTRUCTION INJECTION

                           +------------------+
                           |   PLAN MODE ON   |
                           +------------------+

+----------------------------------------------------------------------------------+
| <SYSTEM-REMINDER> |
| |
| Plan mode is active. |
| Phases: Understand -> Design -> Review -> Plan |
| Constraint: read-only, no edits |
| |
| USER MESSAGE |
| "Help me refactor module X" |
+----------------------------------------------------------------------------------+
|
v

+----------------------------------------------------------------------------------+
| AGENT |
| Reads code, creates plan |
| Can only read — no writes, no tool execution |
+----------------------------------------------------------------------------------+
|
v

+----------------------------------------------------------------------------------+
| USER MESSAGES turns 2, 3, ... |
| "What about edge cases?" |
| No injection — instructions already in context |
+----------------------------------------------------------------------------------+
|
v

+----------------------------------------------------------------------------------+
| AGENT |
| Continues planning |
| Still constrained by earlier injection |
+----------------------------------------------------------------------------------+
|
v

                           +-------------------+
                           |   PLAN MODE OFF   |
                           +-------------------+

+----------------------------------------------------------------------------------+
| <SYSTEM-REMINDER> — REPLACES PREVIOUS |
| |
| Exited plan mode. |
| You can now make edits and take actions. |
| |
| USER MESSAGE |
| "Okay, go ahead and implement it" |
+----------------------------------------------------------------------------------+
|
v

+----------------------------------------------------------------------------------+
| AGENT |
| Full access restored |
| Edits, tool calls, writes — all unlocked |
+----------------------------------------------------------------------------------+

key Instructions injected into user messages, not system prompt.
Replaced on state change, not removed.

=====================================================================================================================

ai_devs_4_workspaces-e68b7200-6.png

SESSION WORKSPACE STRUCTURE

+--------------------------------------------------------------------------------------------------+
| |
| workspaces/ |
| └─ 2026/ |
| └─ 01/ |
| └─ 25/ |
| │ |
| ├─ ses_0a7f8966/ year |
| │ ├─ plan.md month |
| │ ├─ attachments/ day |
| │ │ session root |
| │ └─ agents/ session context|
| │ └─ agt_baaa0fa8/ user uploads |
| │ ├─ inbox/ |
| │ ├─ notes/ spawned agent |
| │ └─ outbox/ receives tasks |
| │ private scratch |
| │ delivers results|
| │ |
| └─ ses_0a78caef/ another session |
| ├─ attachments/ |
| └─ agents/ |
| └─ agt_b1ad5273/ |
| ├─ inbox/ |
| ├─ notes/ |
| └─ outbox/ |
| |
+--------------------------------------------------------------------------------------------------+

Isolation: agents live inside sessions. Kill session -> agents gone.
Communication: orchestrator routes between inbox/outbox.
Promotion: user explicitly moves artifacts to /shared.
