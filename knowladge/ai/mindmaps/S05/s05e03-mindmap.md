# S05E03 — Feature Development in Generative Applications

## 1. Characteristics of Generative Application Development

- **Dual nature of generative AI** — stable at the foundations, highly dynamic at the higher layers
  - **Stable fundamentals** (slow change, principles unchanged):
    - **Autoregression** — each token predicted from all previous tokens; mechanic unchanged
    - **Tokenization** — text-to-integers-to-text conversion; mechanics unchanged
    - **Context window limits** — numbers grow (4k → 128k → 1M+) but truncation logic stays the same
    - **Hallucination** — model generates confidently, not necessarily truthfully; still unsolved
    - **Prompt injection** — malicious input hijacking agent behavior; still unsolved
    - **Base knowledge cutoff** — improved but fundamentally the same constraint
  - **Dynamic higher layer** (fast change, quarterly shifts):
    - **Multimodality** — from text-only to natively multimodal models (text, image, audio, video)
    - **Expanding context** — same mechanics, radically expanded capability surface
    - **Agentic workflows** — autonomous tool chains with growing autonomy level
    - **Working techniques** — RAG, fine-tuning, prompting evolve constantly with short shelf life
    - **Tooling ecosystem** — SDKs, frameworks, APIs; high turnover, design for replaceability
- **Practical implication**: investing time in understanding **fundamental model mechanics** is justified — they are stable and foundational logic built on them will require less frequent changes
  - Recommended: [What ChatGPT is doing](https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/) by Stephen Wolfram
  - Even AI_devs first edition content about these mechanics remains current — only the numbers changed (token sizes, hallucination rates, knowledge scope)
- **Architecture duality** — two seemingly contradictory effects happening simultaneously:
  - **Simpler logic** — more logic delegated to the model, less code to own:
    - **RAG before vs now**: multi-level query analysis → rewrite → retrieval → rerank → merge has become agent with search() + fetch() + answer() tools; agent adapts retrieval strategy to context dynamically
    - **Logic delegation trend**: ~10% agent (2022) → ~45% agent (2024) → ~75% agent (2025); less code to maintain, agent handles edge cases dynamically
    - **Instructions replace code** — logic lives in prompts (system prompt + tool definitions + constraints + behavior), not in conditionals and switch statements
  - **Complex environment** — agents need space to act and walls not to cross:
    - **Agent sandbox** — controlled environment with tools (code_exec, file_system, browser) and controls (network limits, permission model, kill switch); freedom within hard boundaries
    - **Multimodal processing pipeline** — each modality needs its own ingestion path (PDF → parse+chunk+embed, image → vision+OCR+describe, audio → transcribe+diarize)
    - **Temporal operating modes** — async (long-running, checkpoints, resumability, state persistence) and real-time (streaming, event emission, sub-second latency) coexist in one system with different infra but same agent
    - **Evaluation and safety layer** — evals, guardrails, logging, tracing, injection detection, output validation; new attack surface only addressable at design time
- **Factory metaphor**: classic application development = building the assembly line (every step defined, every gear placed by hand, fixed deterministic path). Generative application development = building the factory (the system creates its own assembly lines at runtime; you design the environment, the agent designs the process)

## 2. Evolution of the Ecosystem Over Three Years

- **Provider race** — new model launches every few months with new capabilities, API features, better performance, lower costs; leave room to support more than one provider
- **Agent evolution** — transition from simple chatbots to agents was a significant architectural shift:
  - Agent logic replaced or significantly changed existing application logic
  - Example: **RAG systems** evolved from multi-stage intent recognition + query transformation + search to **Agentic RAG** — agent with simpler tools adapting dynamically
  - Agent logic is becoming the **default approach** when designing features; deterministic logic chosen only when there's a very strong reason
- **Multimodality growth** — processing non-text content impacted communication and data storage architecture; assume by default that the system may handle text, image, and audio
- **Tool development** — repeating problems addressed by extensions and ready-made tools (e.g., Streamdown for interface design)
- **System integration** — agents increasingly operate in terminals, sandboxes, or as desktop apps; need for CLI tools, direct browser access, filesystem access, native functionality; impacts application design through local environment integration and device-stored configuration

## 3. Model Migrations and API Changes

- **API is still being shaped** — expect further changes; exercise caution with features that create strong vendor lock-in
- **Cautionary example: Assistants API** — launched as "revolutionary", had `deprecated` status 15 months later; replaced by Responses API
  - Responses API had much broader adoption — adopted by other providers, libraries, SDKs, and frameworks within 3-4 months
- **How to recognize worthwhile new features** (signal vs noise):
  - **Signal** (invest): cross-provider, open standard, portable format, community-built, keeps returning after weeks, aligns with primitives
  - **Useful but risky** (watch): single-vendor, no migration path, opaque internals, high exit cost, deprecation risk
  - **Early signal** (revisit): solves real pain, small but growing, reappears over time, fundamentals-aware
  - **Noise** (ignore): one vendor demo, benchmark-only, spike then silence, no real adoption, vague mechanics
  - **Key heuristic**: if a topic keeps returning after weeks of silence, give it a second look; no return = skip
- **Verify personally** — industry reactions to all new features are very intense with heavy marketing narrative; much more reliable to **test yourself** and use your experience to evaluate
  - You may be wrong — maintain **openness** and **distance**; if the same topic keeps returning after weeks, give it another chance
- **Sources for spotting direction**: provider research publications, technical podcasts, [Model Spec](https://model-spec.openai.com/2025-12-18.html) by OpenAI (open discussion about API and model development direction)
  - Avoid skeptical attitudes — they can effectively block new possibilities
  - Maintain healthy distance toward temporary trends that vanish faster than they appear
- **Model version migration details**:
  - Models come in multiple tiers (main/mini/nano); main version usually noticeably better, **smaller tiers may only appear better** — invest more time evaluating them
  - Newer models should handle instructions better, but **not always true**; previously recommended practices may have **negative effects** on newer models (e.g., Anthropic guide: aggressive tone with CRITICAL/MUST no longer recommended for Opus 4.5)
  - Consider not just stability but **new opportunities** — model upgrade may allow **significant prompt simplification**, **logic simplification**, or **increased complexity** for previously impossible capabilities
  - Watch Open Source models too — platforms like OpenRouter may offer switching to significantly faster and cheaper models
  - Technically switching = changing model identifier; for agent systems it may require **much more attention**

## 4. Managing Agent Development and Capabilities

- **Key difference from classic apps**: in classic applications, working code changes only when business requirements change or during refactoring; in agent logic, **even small changes can significantly impact the entire system's effectiveness**
- **Agent systems can continuously evolve** — driven by model development, new techniques, and evolving tool ecosystem
- **Redefining rules** — changing circumstances may require redefining established development practices; current AI capabilities are incomparable to even two years ago
- **Coding agent example (05_03_coding)** — simple agent with only **filesystem access** and **memory mechanism**:
  - Architecture: user input → GPT-5.4 agentic loop (up to 50 turns) → 4 file tools (fs_read, fs_write, fs_search, fs_manage) + MCP stdio → workspace/
  - **Memory system** (Observer/Reflector pattern):
    - **Observer** — seals messages exceeding 4k tokens into structured observations (high/medium/low priority); model: gpt-4.1-mini; saves observer-NNN.md
    - **Reflector** — compresses observations when they exceed 4k tokens, up to 3 passes (gentle → moderate → aggressive); model: gpt-4.1-mini; saves reflector-NNN.md
    - **Bounded context for next turn**: system prompt (base + workspace state + observations) + unobserved tail only
  - Created full games from single-sentence prompts (Snake with AI opponent, Racing with ghost replay), both with SQLite persistence
- **Capability levers** — ways to dramatically expand agent capabilities without changing core architecture:
  - **Lever 1: Model swap** — e.g., gpt-5.4 → gpt-5.4 xhigh; same tools, deeper reasoning, more complex logic, better self-correction
  - **Lever 2: Add a tool** — e.g., + shell_exec (sandboxed); file editor → full dev environment in one tool; **sandbox required** — terminal without isolation = arbitrary code execution on host
  - **Lever 3: Connect services** — plugging in Gmail, Google Calendar, Firecrawl, Todoist unlocks new capabilities without changing main agent logic
- **Implication**: simple tool changes can **completely transform an application's profile** — unlike classic apps tightly coupled to specific processes

## 5. Autonomous Self-Improvement of Agents

- **Agents can already develop themselves to some degree** — systems capable of autonomously building new skills and running closed feedback loop optimizations are emerging
- **Autoprompt example (05_03_autoprompt)** — experimental logic for **autonomous prompt generation/optimization**:
  - Setup: 3 meeting transcripts, 3 expected output files, experiment configuration
  - Goal: optimize a one-sentence initial prompt to achieve high scores on structuring transcripts (extracting tasks, decisions, progress updates)
  - **Optimization loop** (up to 10 rounds):
    - **Baseline evaluation**: execution model (GPT-5.4-mini, no reasoning) runs seed prompt → judge model (GPT-5.4, high reasoning) scores actual vs expected with weighted sections (tasks 0.40, people 0.25, decisions 0.20, projects 0.15)
    - **Improver** (GPT-5.4, high reasoning): receives current prompt, schema, evaluation policy, judge feedback, full history, strategy hint; generates **3 candidate prompts** with one atomic change each
    - **Strategies**: balanced, coverage, simplify, boundary, salience
    - **Parallel evaluation**: all 3 candidates run through execution → judge pipeline in parallel (Promise.allSettled)
    - **Selection**: keep if delta > noise floor (max of candidate/last spread / 2); discard otherwise
    - **Key design**: only the prompt text changes, never model weights
  - **Holdout verification**: best prompt tested on case 03 (never seen during optimization)
  - **Results**: baseline 60% → after optimization 94.3% (+34.3pp, iteration 6, train set) → holdout verification 89.9% (+29.9pp, unseen data)
  - **Artifacts saved**: prompt.best.md, prompt.initial.md, results.tsv, run.json, diffs/_.diff, traces/_.json
  - **Important caveat**: conceptual presentation only — few examples, not production-ready; purpose is demonstrating potential
- **Production frameworks for automatic prompt optimization**:
  - **[DSPy](https://dspy.ai/)** (Python) and **[AX](https://axllm.dev/)** (TypeScript) — prompts almost never appear in application code
  - **Signature-based approach**: declare inputs, task, and expected outputs as "signatures" instead of writing prompts
    - Example: `'emailFrom:string, emailSubject:string, emailBody:string -> labels:string[], priority:class, needsReply:boolean, summary:string'`
    - Ax builds the prompt internally — injects task description + few-shot demos + input values, returns typed output
  - **Automatic optimization** (BootstrapFewShot): scores each trace, keeps best as demos; **signature never changes**, only in-context examples improve
    - Save demos to JSON file, reload on next run — same signature, better examples
  - Combined with tools for **automatic instruction optimization** or **few-shot example generation** to increase model effectiveness

## 6. Deployment Failures and Successes

- **Common failure areas** in production AI deployments — a checklist of areas to address before launch (some may only surface after time):
  - **Rate limits** — one of the main problems historically; check available API limits for your account; prepare key rotation or use services like OpenRouter
  - **Content moderation** — account blocking from sending/generating content violating terms of service can immobilize a production app for extended time; connect Moderation API or use custom input/output filters to flag and block problematic user queries
  - **Performance** — agent systems often send parallel requests; at higher volumes (e.g., 100 requests per user) some may slow down; problem affects major providers (observed on OpenAI, less on OpenRouter); no solution other than avoiding logic requiring many parallel requests
  - **Speed** — LLMs are still one of the slowest application components; without UX-level management (loading states, streaming) and application-level management (caching, partial parallel requests), LLM latency will kill user engagement
  - **Costs** — typically **1-3% of users generate higher costs than all others combined**; must protect with hard limits or dedicated user keys; monitor costs in broader business context (may exceed subscription revenue)
  - **Effectiveness** — agents designed for specific queries/scenarios break when typical users interact with them; especially problematic for chatbots; consider replacing chat windows with **button-based UIs and background actions** without direct user query contact; if chat interface is essential, observe user activity and conduct conversations to understand their working style and expectations
  - **Usefulness** — many deployed AI solutions are simply **unnecessary**; agent managing a task list via conversation is less convenient than a well-designed interface; differences appear only at scale or when an action requires many sub-actions
