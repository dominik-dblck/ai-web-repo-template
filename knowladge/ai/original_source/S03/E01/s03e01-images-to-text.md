title: ai_devs_4_evals-7a5c150e-8.png

diagram:
name: LLM APPLICATION QUALITY ASSURANCE

legend:

- Evals
- Guardrails
- Observation

sections:

- name: LLM Application
  description: non-deterministic logic

```
- name: Evals
  description: VERIFY QUALITY
  subsections:
    - name: OFFLINE · DEVELOPMENT
      items:
        - Prompt regression
        - Dataset benchmarks
        - Pre-deploy checks
    - name: ONLINE · PRODUCTION
      items:
        - Live interaction scoring
        - Violation detection
        - User satisfaction
  methods:
    - Programmatic
    - LLM-as-judge
    - Human

- name: Guardrails
  description: ENFORCE BOUNDARIES
  subsections:
    - name: IN APPLICATION LOGIC
      items:
        - Input validation
        - Output filtering
        - Content policies
        - Schema enforcement
    - name: Execution
      description: Runs inline with every request, not as a separate stage
    - name: CATCHES WHAT EVALS MISS
      items:
        - Real-time blocking
        - Fallback responses

- name: Observation
  description: UNDERSTAND BEHAVIOR
  subsections:
    - name: RUNTIME VISIBILITY
      items:
        - Agent behavior traces
        - Tool call sequences
        - Inter-agent dependencies
    - name: OPERATIONAL INSIGHTS
      items:
        - Cost estimation
        - Performance metrics
        - Error analysis
        - Architecture mapping
    - name: Note
      description: Critical for complex agent systems where logic is dynamic
```

flow:

- actor: LLM Application
  step: feeds into
  targets:
- Evals
- Guardrails
- Observation

notes:

- Not 100% match — sufficient threshold across indicators. Evaluated programmatically, by LLM, or by human.

=========================================================================================================
title: ai_devs_4_debugging-93b04837-2.png

diagram:
name: DEBUGGING AGENT: OVERLAPPING TOOL DESCRIPTIONS

sections:

- name: USER QUERY
  content: Find my interaction history with Anna

```
- name: AGENT LOGIC
  code: |
    const tools = [
      {
        name: "search_contacts",
        desc: "Search user data and interactions"
      },
      {
        name: "search_notes",
        desc: "Search user data and documents"
      }
    ]

    // Agent selects tool
    const choice = await agent.plan(query)

    // -> picks search_notes
    // (descriptions overlap)

    const result = await search(
      "Anna",
      { space: "notes" } // -> wrong
    )

    // result: []
    // "No records found"

- name: SEARCH AREA
  subsections:
    - name: AGENT SEARCHED HERE
      items:
        - notes/ (SEARCHED)
        - meeting-notes/
        - project-docs/
        - drafts/
    - name: DATA WAS HERE
      items:
        - contacts/ (TARGET)
        - anna-history.json
        - team/

- name: ISSUE
  content: Both tools say "search user data" – ambiguous for agent

- name: AGENT RESPONSE
  content: No interaction history found for Anna in the knowledge base
```

notes:

- No error thrown. Logic appears correct. Only tracing agent steps reveals the wrong tool was selected due to overlapping descriptions.

=========================================================================================================
title: ai_devs_4_costs-1c8f8bc2-f.png

diagram:
name: COST COMPLEXITY IN LLM AGENT SYSTEMS

sections:

- name: SINGLE REQUEST
  subsections:
- name: TOKEN COMPOSITION PER CALL · VARIABLE
  items:
- name: system prompt
  type: stable
  variance: low
- name: tool defs
  type: stable
  variance: low
- name: user query
  type: varies
  variance: high
- name: context
  type: dynamic composition
  variance: high
- name: tool outputs
  type: unpredictable size
  variance: extreme
- name: completion
  type: model decides
  variance: extreme
  legend:
- Predictable
- Variable input
- Unpredictable

```
- name: MULTIPLIERS
  subsections:
    - name: TASK LENGTH · ITERATIONS PER SESSION
      items:
        - 1 call → n calls
        - Agent loops, retries, multi-step reasoning, tool chains
    - name: MODELS INVOLVED · DIFFERENT PRICE POINTS
      items:
        - gpt-4o $$$
        - gpt-4o-mini $
        - claude-3.5 $$
        - embedding ¢
    - name: USER COUNT · ENGAGEMENT VARIANCE
      items:
        - casual users
        - outliers hit limits

- name: ESTIMATION
  items:
    - Approximate cost estimation is inherently hard
    - Precise only with real usage data and cost reporting
```

notes:

- Outlier users may not be malicious — could be bugs on our side. Hard limits are critical, but observation data turns rough guesses into usable estimates.

=========================================================================================================
title: ai_devs_4_monitoring-2ab9aacf-1.png

diagram:
name: CENTRALIZED GATEWAY

sections:

- name: AGENT LOOP
  items:
- type: Generation
- type: Tool
  name: search_docs
- type: Generation
- type: Spawn Agent
- type: Generation
- type: Event
  name: cost_alert
- type: Span
  name: finalize
  sub_agent:
  items:
- type: Generation
- type: Tool
  name: read_file
- type: Generation
- type: Event
  name: result_ready

```
- name: CENTRALIZED GATEWAY
  components:
    - name: LLM ADAPTER
    - name: TOOL EXECUTOR
    - name: EVENT EMITTER
  capabilities:
    - INTERCEPT · ENRICH · EMIT

- name: SESSION CONTEXT
  fields:
    - userId
    - sessionId
    - agentId
    - promptVersion
    - tags

- name: OBSERVABILITY PLATFORM
```

flow:

- actor: AGENT LOOP
  step: sends events and calls
  target: CENTRALIZED GATEWAY
- actor: CENTRALIZED GATEWAY
  step: enriches with context (+CTX)
  target: SESSION CONTEXT
- actor: CENTRALIZED GATEWAY
  step: forwards enriched data
  target: OBSERVABILITY PLATFORM

notes:

- Context is attached at multiple stages via +CTX signals between gateway and session context.

=========================================================================================================
title: ai_devs_4_playground-1c0e26df-6.png

dashboard:
product: LLM DEBUG PLAYGROUND

nav:

- model gpt-5-nano
- tools 12
- schema
- variables

panels:

- title: MESSAGES
  items:
- role: SYSTEM
  content: You're a friendly assistant.
- role: USER
  content: Summarize the video and pull key takeaways...
- action: + message

```
- title: OUTPUT
  items:
    - section: TOOL CALL
      function: video__understand
      arguments:
        source: "https://youtube.com/..."
        prompt: "summarize WebMCP..."

- title: LOOP CONTROL
  items:
    - action: add tool result to messages, re-run to continue agent loop
    - note: Model sees tools → decides to call one instead of responding directly. Add result back to messages to close the loop.
```

=========================================================================================================
title: ai_devs_4_prompts_versioning-3c71c451-4.png

diagram:
name: SYSTEM PROMPT VERSIONING

sections:

- name: agents/alice
  metadata:
- prompt registry
- 2 versions
- tagged: agent-template

```
- name: VERSION #1
  id: 1
  timestamp: 2/16/2026, 2:19:45 PM
  metrics:
    generations: 4
    latency: 2.762s
    tokens: 7 943
    cost: $0.0150
  linked_generations:
    - name: alice-routing
      latency: 2.30s
      cost: $0.0041
    - name: alice-routing
      latency: 2.84s
      cost: $0.0038

- name: VERSION #2 · ACTIVE
  id: 2
  tags:
    - PRODUCTION
    - LATEST
  timestamp: 2/16/2026, 2:58:23 PM
  metrics:
    generations: 183
    avg_latency: 2.409s
    tokens: 126 in · 60 out
    cost: $0.0011
    avg_score: 0.65
    status: Live
  linked_generations:
    - name: alice/generation#1
      latency: 2.49s
      cost: $0.0012
    - name: alice-routing
      latency: 1.82s
      cost: $0.0009
    - name: alice-routing
      latency: 1.00s
      cost: $0.0011
```

notes:

- Each version carries its own performance fingerprint — latency, cost, token usage, score — enabling data-driven prompt iteration and rollback.

=========================================================================================================
title: ai_devs_4_prompt_observability-a9adef49-e.png

diagram:
name: PROMPT-LINKED OBSERVABILITY

sections:

- name: SOURCE
  items:
- name: alice.agent.md
  description: system prompt · local
- name: rose.agent.md
  description: system prompt · local
- name: observer.md
  description: memory prompt · local
  process:
- SHA-256 DIFF → PUSH IF CHANGED

```
- name: PROMPT REGISTRY
  items:
    - name: agents/alice
      version: v2
      tags:
        - PRODUCTION
      metrics:
        gen: 183
        lat: 2.4s
        cost: $0.001
        score: 0.65
    - name: agents/rose
      version: v1
      metrics:
        gen: 47
        lat: 3.1s
        cost: $0.012

- name: LINKING
  description: GETPROMPTREF() → LINK TO GENERATION

- name: RUNTIME TRACE
  trace:
    - type: TRACE
      label: chat request · session_a8f2
    - actor: Agent
      name: alice
      prompt: agents/alice v2
    - step: Generation #1
      latency: 2.49s
      cost: $0.001
    - step: Tool
      name: spawn_agent
    - actor: Agent
      name: rose
      prompt: agents/rose v1
    - step: Generation #1
      latency: 1.82s
      cost: $0.004
    - step: Tool
      name: web_search
    - step: Generation #2
      latency: 2.30s
      cost: $0.003
    - step: Generation #2
      latency: 1.00s
      cost: $0.001
    - step: Event
      name: cost_alert

- name: SESSION CONTEXT
  fields:
    - userId: usr_29x
    - sessionId: ses_a8f2
    - agentId: alice · turn 3
    - promptVersion: agents/alice v2
    - tags: production

- name: SCORES
  items:
    - routing: 1.0
    - completed: 1.0
    - cost: $0.009

- name: OBSERVABILITY PLATFORM
  subsections:
    - name: PROMPT METRICS
      items:
        - version → traces → scores
        - Compare performance across prompt versions side by side
    - name: PLAYGROUND
      items:
        - replay any generation
        - Edit prompt, messages, tools and re-run against any model
    - name: EXPERIMENTS
      items:
        - dataset → evaluators
        - Run offline evals per prompt version with scoring
```

notes:

- Prompt versioning is the connective tissue — linking code changes to production behavior, enabling replay, comparison, and data-driven iteration.

=========================================================================================================
title: ai_devs_4_evals_decision-79cca19e-9.png

diagram:
name: EVAL ALIGNMENT MATRIX

axes:
x: ACTUAL OUTPUT QUALITY →
y: EVAL SCORE ↑

quadrants:

- name: False positive
  position:
  eval_score: HIGH
  actual_output: POOR OUTPUT
  action: fix evals

```
- name: Aligned
  position:
    eval_score: HIGH
    actual_output: GOOD OUTPUT
  action: monitor

- name: True negative
  position:
    eval_score: LOW
    actual_output: POOR OUTPUT
  action: fix app

- name: False negative
  position:
    eval_score: LOW
    actual_output: GOOD OUTPUT
  action: fix evals
```

=========================================================================================================
title: ai_devs_4_prompt_anatomy-a5279e56-1.png

diagram:
name: PROMPT ANATOMY — WHAT EVALS ACTUALLY TEST

stats:
full_prompt_composition: TYPICAL AGENTIC CALL

sections:

- name: FULL PROMPT COMPOSITION
  breakdown:
- name: Tools
  percentage: 10.7%
- name: User / Asst
  percentage: 18.3%
- name: Tool Responses
  percentage: 67.6%
  note:
  system_prompt: 3.4%

```
- name: COMPONENTS
  items:
    - name: SYSTEM PROMPT
      percentage: 3.4%
      tokens: 465
    - name: TOOL DEFINITIONS
      percentage: 10.7%
      tokens: 1,466
    - name: CONVERSATION
      percentage: 18.3%
      tokens: ~2,500
    - name: TOOL RESPONSES
      percentage: 67.6%
      tokens: 9,294
```

=========================================================================================================
title: ai_devs_4_datasets-044ad554-1.png

diagram:
name: WHAT MAKES A GOOD EVAL DATASET

sections:

- name: Coverage
  description:
- All zones tested.
- No blind spots.
  examples:
  complete:
  items:
- USE
- SKIP
- USE
- MULTI
- EDGE
  label: COMPLETE
  incomplete:
  items:
- USE
- SKIP
- USE
- ?
- MULTI
- EDGE
- ?
- ?
  label: BLIND SPOTS

```
- name: Diversity
  description:
    - Same zone, many angles.
    - Varied inputs per category.
  examples:
    varied:
      label: VARIED
    repetitive:
      label: REPETITIVE

- name: Balance
  description:
    - Even attention per tool.
    - No skewed results.
  examples:
    balanced:
      distribution:
        - A
        - B
        - C
      label: BALANCED
    skewed:
      distribution:
        - A
        - B
        - C
      label: SKEWED
```

=========================================================================================================
