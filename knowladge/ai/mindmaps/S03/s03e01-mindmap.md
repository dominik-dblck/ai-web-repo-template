# S03E01 — Observability and Evaluation

## 1. The Quality Assurance Triad: Evals, Guardrails, Observation

- **Three complementary pillars** for LLM application quality — none replaces the others:
  - **Evals** — verify quality: structured tests assessing system behavior against defined metrics
    - **Offline** (development): prompt regression, dataset benchmarks, pre-deploy checks
    - **Online** (production): live interaction scoring, violation detection, user satisfaction
    - Assessment methods: **programmatic**, **LLM-as-judge**, **human**
  - **Guardrails** — enforce boundaries: inline with every request, not a separate stage
    - Input validation, output filtering, content policies, schema enforcement
    - **Catches what evals miss** — real-time blocking, fallback responses
  - **Observation** — understand behavior: runtime visibility into agent actions
    - Agent behavior traces, tool call sequences, inter-agent dependencies
    - Operational insights: cost estimation, performance metrics, error analysis, architecture mapping
    - **Critical for complex agent systems** where logic is dynamic — much happens outside static code
- **Evals do NOT replace** unit tests or E2E tests — they focus on **model and agent behavior**, not deterministic logic
- **Key distinction**: we're not looking for 100% match — we're checking whether results **sufficiently meet** established thresholds
  - Model outputs involve natural language — programmatic equality checks rarely apply
  - "My name is Adam" and "I am Adam" preserve the same meaning but differ in form
  - Partial compliance is expected and measurable
- **Why bother with evals if small changes can break everything?** Because evals allow you to **predict negative effects before publishing changes**, even without full certainty
- **Start early** — if the project is still in planning/architecture phase, build observability and evals into the design from the beginning

## 2. Practical Value of Observability

- **Debugging agent behavior** is fundamentally different from debugging code
  - Tools may not return errors, logic may appear correct — yet the agent searched the **wrong area** due to overlapping tool descriptions
  - Example: agent asked to find interaction history with "Anna" — `search_contacts` and `search_notes` both described as "search user data" → agent picks wrong tool → returns "no records found" → **no error thrown**
  - Only **tracing agent steps** reveals the wrong tool was selected — code-level debugging would not catch this
  - The problem is not just single instruction errors — it's **combinations of instructions** and their interaction with conversation context
- **Cost estimation** depends on observability
  - Token composition per API call is highly variable: system prompt (stable, low variance), tool definitions (stable, low variance), user query (varies, high), context (dynamic composition, high), tool outputs (unpredictable size, extreme), completion (model decides, extreme)
  - **Multipliers**: task length (agent loops, retries, multi-step reasoning, tool chains), models involved (different price points), user count and engagement variance
  - **Outlier users** may not be malicious — could be bugs on our side; hard limits are critical, but observation data turns rough estimates into usable predictions
  - Even small-scale activity stats and cost reports are **immensely useful** — directly improve estimation precision; for many products this is existential
- **Error analysis, performance monitoring, customer support** — monitoring enables fast reaction to update errors, intentional misuse, and user-reported issues

## 3. Monitoring Architecture — Centralized Gateway

- **Core principle**: intercept **all LLM API interactions** and **all tool invocations** through a centralized gateway
  - Plan architecture so these interception points can be centralized from the start
- **Seven observation types** (Langfuse taxonomy — universal across platforms):
  - **Session** — linked to a conversation thread or agent task batch
  - **Trace** — single user interaction (e.g., one chat message)
  - **Span** — duration of a selected action (e.g., context gathering)
  - **Generation** — LLM interaction including full query context and settings
  - **Agent** — agent activity during an interaction
  - **Tool** — tool invocation (input/output)
  - **Event** — application events, not necessarily LLM-related
- **Context is everything** — not just the event itself, but the **full session context**:
  - User ID, session ID, agent IDs, prompt version, tags
  - Application-specific context: license type (trial), account permissions (manager), user preferences (web search mode), request type (CRON job)
  - Metadata: connection info, interface type, application version, environment (locale)
- **Centralized gateway architecture**:
  - Agent loop (generations, tools, spawned agents, events, spans) → **Centralized Gateway** (LLM adapter, tool executor, event emitter) → enriched with session context (+CTX) → **Observability Platform**
  - Context attached at multiple stages between gateway and session context
- **Grouping and nesting** — observation events must be grouped (by session/trace) and nested (spans within traces, tools within agents) — similar challenge to classical logging but with explicit hierarchical structure
- **Tip**: when integrating with platforms like Langfuse, have a coding agent analyze the SDK source code in context of your interface; create a reference note for future feature additions
- **Start minimal** — after creating minimal integration, you'll immediately see what's missing; problems with **missing** or **excessive** logs will reveal themselves quickly
- **Data privacy** — observing agent behavior directly involves **processing user data**; even with open-source self-hosted tools, ensure anonymization: names, addresses, contact details, personal identifiers

## 4. Interaction Replay and Debugging

- **Playground debugging** — observability platforms provide built-in Playgrounds for replaying interactions
  - Change parameters and re-execute queries for testing
  - Not 100% functional (e.g., no live tool connections), but good for verifying assumptions
- **What to capture for replay**: system prompt, message history, tool list → edit any element → verify impact on model behavior; can also **compare different models**
- **Asking the model to justify decisions** — useful in practice despite theoretical limitations
  - Ask model to explain **why it chose a specific tool** — response often contains clues to fix the problem
  - Note: this is at odds with research like Anthropic's "[Tracing the thoughts of a large language model](https://www.anthropic.com/research/tracing-thoughts-language-model)" which shows internal reasoning may differ from stated reasoning
- **Key insight**: debugging agent behavior ≠ debugging code
  - Even if an instruction change fixes behavior in one case, it may **break behavior elsewhere**
  - This is why **generalized instructions** and **patterns over specific commands** are so critical (callbacks to S01E01 §8, S02E01 §4)
  - Detecting and fixing a problem is not the end — must verify impact on the rest of the system

## 5. System Prompt Versioning

- **Why Git isn't enough**: system prompts are in source code (auto-versioned via Git), but agent systems need more — **performance statistics and execution history linked to each prompt version**
- **Prompt registry** — platforms like Langfuse allow saving and versioning prompts with:
  - Environment tagging (development, production)
  - Linked generations — every agent execution traced back to which prompt version was active
  - **Per-version metrics**: generation count, average latency, token usage (in/out), cost, average score
  - Example: Version #1 (4 generations, 2.76s latency, 7,943 tokens, $0.015) vs Version #2 (183 generations, 2.41s latency, 126 in / 60 out tokens, $0.0011, 0.65 avg score)
- **One-way synchronization** — when storing prompts in code is technically necessary:
  - Changes in application code → reflected in Langfuse (SHA-256 diff → push if changed)
  - Lose easy version switching, but retain the main value: **easy assessment of current state**
- **Prompt-linked observability** (full picture):
  - **Source**: agent prompt files (markdown) in code → SHA-256 diff → push to prompt registry if changed
  - **Registry**: prompt versions with tags (production, latest), linked generation metrics
  - **Linking**: `getPromptRef()` links runtime generations to prompt versions
  - **Runtime trace**: full trace showing which prompt version each agent used, with cost/latency per generation
  - **Session context**: userId, sessionId, agentId, promptVersion, tags
  - **Scores**: per-trace scoring (routing accuracy, task completion, cost)
  - **Platform capabilities**: prompt metrics (version → traces → scores), playground (replay any generation), experiments (dataset → evaluators per version)
- **Integration context to capture**:
  - Application-specific: license type, account permissions, user preferences, request type (CRON)
  - Metadata: connection info, interface, app version, locale
- **AI can handle most technical integration** — but the **what to capture** decisions are ours

## 6. Evaluation Tools and Methodology

- **Eval** = structured test evaluating system elements against defined metrics
  - Focused on: **quality, stability, effectiveness, performance, cost**
- **Three components of an eval**:
  - **Task**: input data + output data; may be a single prompt or an entire interaction
  - **Data**: set of examples — synthetic, production-based, or (usually) both; synthetic data is a good starting point
  - **Score**: 0-1 range (presented as 0-100%) measuring alignment with expected result; scored deterministically (code) or by LLM
- **Eval development is tedious** — requires significant manual work and verification; high scores don't always mean correct results; sometimes **the evals need fixing, not the system** (false positives)
- **Eval alignment matrix** (4 quadrants):
  - **Aligned** (high score + good output): monitor
  - **False positive** (high score + poor output): fix evals
  - **True negative** (low score + poor output): fix app
  - **False negative** (low score + good output): fix evals
- **Offline evals** (development) — run in dev environment or CI/CD pipeline
  - Platforms allow configuration and execution via **UI and API**
  - Can design experiments entirely in code, analyze results programmatically; results also visible on platform
- **Online evals** (production) — automatic assessment of live user interactions
  - Detect violations, quality drops, and anomalies that didn't get caught by built-in system mechanisms
- **Prompt anatomy insight** (from Braintrust) — during agent interactions, **tool responses** quickly dominate the prompt:
  - System prompt: 3.4% (465 tokens)
  - Tool definitions: 10.7% (1,466 tokens)
  - Conversation (user/assistant): 18.3% (~2,500 tokens)
  - **Tool responses: 67.6%** (9,294 tokens)
  - Implication: evals should account for tool responses as the dominant context influence
- **Platforms**: [Langfuse](https://langfuse.com/), [Promptfoo](https://www.promptfoo.dev/), [Confident AI](https://www.confident-ai.com/), [Braintrust](https://www.braintrust.dev/), [Grafana](https://grafana.com/)
  - Author's recommendation: Langfuse and Promptfoo
  - In some cases, **simple internal scripts** suffice without external platforms

## 7. Designing Eval Datasets

- **Three principles** for good eval datasets:
  - **Coverage** — examples must span **all behavior categories**: positive scenarios, negative scenarios, edge cases beyond basic assumptions; no blind spots
  - **Diversity** — same category, many angles; varied inputs per behavior zone
  - **Balance** — even attention across all tools/behaviors; skewed distribution distorts experiment results
    - Example: testing an agent with 5 tools — distribute tests across all 5 tools plus cases beyond "happy paths"
- **Dataset design is iterative** — involves human verification and continuous modification
  - AI is highly useful for: filling gaps, checking correctness, generating scenario variations, creating test data series
  - AI also excellent at: **analyzing experiment results** and **reviewing activity logs**
  - Langfuse allows exporting full JSON for any interaction/experiment → discuss with AI
- **Synthetic data** is a valid and recommended starting point — but must be supplemented with production data over time

## 8. Scoring Criteria and Success Metrics

- **Two categories of assertions** (from Promptfoo documentation):
  - **Deterministic** — programmatic verification:
    - **Direct comparisons**: `contains`, `is-json`, `equals`, `starts-with`, keyword presence checks, regex
    - **Programmatic checks**: JavaScript/Python logic, HTTP queries, transformations
  - **Model-graded** — LLM-based assessment:
    - **llm-rubric**: LLM evaluates result against criteria described in natural language
    - **conversation-relevance**: evaluates results against current interaction context
    - **context-recall**: evaluates how effectively context was recalled (e.g., via hybrid search) for the agent's response
- **Each response can be verified against multiple criteria** — configuration possibilities are infinite
- **Five evaluation areas** for agent systems:
  1. **Prompt effectiveness** — both single instructions and agent skill execution
  2. **Tool selection accuracy** — does the agent reach for the right tools?
  3. **Tool usage proficiency** — does the agent use tools correctly? How many iterations/errors needed?
  4. **User satisfaction** — active feedback (thumbs up/down)
  5. **Specific tests** — domain-specific activities like search effectiveness
- **Success metrics drive dataset design** — the criteria and metrics you choose directly determine what test data you need

## 9. Agent Effectiveness and Violation Detection

- **Minimum viable eval strategy** — even if full eval suites seem daunting:
  - Observability tooling is the **foundation** — opens a path to at least basic evals
  - Most critical evals: **tool selection accuracy** and **tool usage proficiency** (at minimum)
  - These enable quick testing of new models and decisions about switching to smaller/cheaper models
- **Evals don't have to be permanent** — can be created **temporarily** to answer specific questions (e.g., "which areas can be handled by smaller models?"), then discarded
- **Violation monitoring** (online evals) — highly recommended for:
  - **Input violations** — detecting problematic/malicious input data
  - **Output violations** — detecting problematic model responses
  - Can have **serious consequences** if undetected — product misuse or model errors
  - Even slightly delayed detection is valuable — catching issues hours later is better than never
- **Performance, cost, and response time anomalies** — should be addressed in application code for immediate reaction, but observability data feeds the detection
- **Balanced perspective on evals**:
  - Evals **don't guarantee anything** — application can still misbehave
  - At some point, it becomes hard to tell where the problem even lies
  - Evals have costs: financial + human resources for design and maintenance
  - **Fastest-growing products reportedly use NO evals** — Claude Code creator says "no evals"
  - Similar to E2E testing debate: critical for some teams, optional for others
  - **Decision should match**: available resources, project goals, and pace of change
  - Early stages with rapid changes may not justify eval investment
  - Products where **stability or cost efficiency is priority** → hard to develop without evals

## 10. The Human Oversight Imperative

- **From the "AI confessional" narrative** — a cautionary perspective on unsupervised AI systems:
  - AI tools are extraordinarily capable at scale — personalization, speed, and quality that humans cannot match
  - The same capabilities that make AI useful make it **dangerous without oversight**: social engineering at scale, identity spoofing, deepfakes
  - **Deepfake scale**: 500K in 2023 → 8M (16x growth in 2 years); deepfake phishing up 1,600% in Q1 2025; only **0.1% of people** can consistently recognize deepfakes; detection tools bypassed in >90% of cases
  - Real-world impact: $12M loss (cloned CFO voice), $25M loss (Arup — live video call deepfake)
  - **Video calls are NOT verification** — voice + face are reproducible; not proof of identity
- **Defense principles** (personal and organizational):
  - Personal: family **code word** for verifying identity in urgent situations
  - Cross-channel verification: email request → verify by phone; phone call → verify by SMS to known number
  - Organizational: **callback to known number** (not number given in conversation), **dual approval** for transfers above threshold
- **The monitoring lesson** — what all AI incidents have in common:
  - **Nobody was watching** — no logging, no approval flow, no behavior evaluation
  - When a human reviewed every AI output before sending → system worked safely (human as filter)
  - When AI was left unsupervised → problems emerged — not because AI "became bad", but because **nobody was checking**
- **Four self-imposed rules for responsible AI use**:
  1. **Transparency** — optional "sent with AI assistance" label; a matter of respect, not regulation
  2. **No impersonation** — AI can write in someone's style, but the recipient should know who they're really communicating with
  3. **Approval flow as standard** — every AI-generated message reviewed by human before sending; human decides, human clicks send, human takes responsibility
  4. **Monitor** — log what AI does, check if results match expectations, build systems that catch anomalies
- **Core message**: "I'm a tool. I do what I'm told. If nobody watches, there's nobody to say stop." — the case for observability and evaluation is ultimately about **maintaining human agency** over increasingly capable autonomous systems
