# S04E02 — Active Collaboration with AI

## 1. The Chat Interface Landscape

- **Simple chat interface was key to ChatGPT's success** — and chat remains the default interaction form for AI agents, but it now encompasses much more: context management, integrations, autonomy, and diverse interaction modes
- **One event can now trigger an entire team of agents** — the 1:1 message-response pattern has evolved into multi-agent orchestration where a single user message spawns coordinated agent activity
- **Key decision: build vs integrate** — when to use existing tools vs create custom solutions; this decision requires understanding what's available on the market
- **Agent Client Protocol (ACP)** — used by JetBrains and Zed to connect with agents like Codex or Cursor; shows how boundaries between tools are blurring
- **Tool capability map** (from diagram — 2-axis comparison: out-of-the-box power vs user control):
  - **High control + high power**: Open Code (9/9), Claude Code (8/8), Pi (6/10)
  - **High power + low control**: Cursor (7.5/3), Claude (6/4)
  - **Moderate**: ChatGPT (5/3), Grok (6/1)
  - CLI tools dominate in personalization and extensibility, but aren't friendly for all users
- **Economic factor matters** — subscription plans (Claude Code, Codex, ChatGPT) are far more cost-effective than API due to scale; some clients already have enterprise agreements, easing adoption
- **Interface choice is not obvious** — it heavily determines all other project areas; not a single choice but a combination

## 2. Four Interface Categories and Their Fit

- **CLI Tools** — best for individual context on own machine; sandbox can extend CLI to remote/isolated environments, opening new scenarios despite added architectural complexity
- **MCP Servers** — nearly every interface supports MCP; tools can encompass multi-agent communication (not just single actions); MCP Apps enable progress monitoring and additional information delivery
- **Messengers (Slack, Telegram, Discord)** — not designed for AI, but their APIs include bots, interactive messages with UI elements, dedicated channels, and commands; users stay in familiar context
- **Dedicated solutions** — building from scratch is no longer as complex; doesn't mean cloning ChatGPT — even relatively simple interfaces focused on specific agent interactions add value
- **Interface-scenario fit matrix** (from diagram):
  - **Personalization**: CLI = primary, MCP = works, Messenger = limited, Custom = primary
  - **Cost efficiency**: CLI = API cost, MCP = primary (subscription), Messenger = works, Custom = API cost
  - **Local/individual**: CLI = primary, MCP = works, Messenger = N/A, Custom = overhead
  - **Sandbox/remote**: CLI = works, MCP = primary, Messenger = N/A, Custom = works
  - **Multi-agent orchestration**: CLI = partial, MCP = primary, Messenger = works, Custom = primary
  - **Team adoption**: CLI = N/A, MCP = indirect, Messenger = primary, Custom = works
  - **Focused UI**: CLI = N/A, MCP = partial, Messenger = works, Custom = primary
- **No universal solution** — in practice, you combine interfaces rather than choosing one
- **Practical recommendations**:
  - **Claude Code / Open Code** — best for personal context
  - **Pi** — more advanced CLI alternative
  - **Claude.ai** — good for non-technical users
  - **Slack** (or other messenger) — best for team context
- **Growing AI usage naturally pushes away from generic interfaces toward dedicated solutions**

## 3. MCP vs Dedicated Interface — Trade-offs

- **Example case**: marketing campaign monitoring agent with statistics, monitoring, and report generation — each involving AI for data presentation and suggestions
- **MCP integration with Claude — concrete limitations**:
  - **No sampling support** — Claude.ai doesn't support MCP sampling, meaning you pay subscription + API costs for agent operation (no reverse Client→Server communication)
  - **Limited instruction personalization** — system must rely solely on tool descriptions and returned content
  - **No control over tool invocation UI** — if the system needs additional confirmations or info from the user during tool execution, options are severely limited
  - **Permission complexity** — elaborate authorization rules (multi-campaign, multi-client) become difficult
  - **Background actions** — very limited ability to inform users about status or enable intervention for background tasks
- **MCP Apps partially addresses these limitations** — but still can't match a dedicated interface for full UX control
- **Key insight**: connecting to existing ecosystems often makes great sense, but requires deep awareness of each platform's capabilities and limitations — and those capabilities change constantly
- **Marketing agent architecture** (from diagram): Data Sources (Meta Ads, Google Ads, Web Analytics, Customer Data) → Marketing Agent (Statistics, Monitoring, Reports) → Interface choice: MCP/Claude OR Dedicated UI
- **MCP client support is still incomplete** — [modelcontextprotocol.io/clients](https://modelcontextprotocol.io/clients) shows very few clients declare full protocol support

## 4. Personalizing Interactions with Language Models

- **Personalization needs exist on the user-facing side**, not just the backend — four key areas:
- **Profiles (Subagents)**:
  - Users work in multiple contexts — specialized agent profiles make sense
  - Each profile has its own settings and knowledge resources
  - Application can include autonomous collaboration between profiles
  - Concept of **subagents** as seen in Claude Code
- **Skills (Injected Instructions)**:
  - Predefined instructions injected into conversation either by user action or model decision
  - **One of the most important features of any AI interface**
  - Easy generation and invocation essential; group by agent, enable search
- **Tools (MCP & Integrations)**:
  - Must include easy control over which tools are active
  - Personalization of tool configuration (relates to "Augmented Function Calling")
  - Presentation of: data for action launch, confirmations, progress, error info, and results
  - Must support pause/cancel actions
- **Workflows (Automation Layer)**:
  - Repeatable action sequences — currently only a few interfaces support this
  - Hooks and scheduled tasks complement workflows
- **Implementation quality matters more than feature presence** (from diagram — 4 quality dimensions):
  - **Subagent switching**: tabs, @mention invocation, generate-from-template, per-profile model/capability config
  - **Skill discovery**: searchable, grouped by agent, auto vs manual activation
  - **Tool call lifecycle**: confirmation dialogs (confirm/cancel), progress indicators, error messages with actions, pause capability
  - **Background status**: thread-based status display, "needs input" flags, intervention buttons, completion timestamps
- **UX quality = discoverability + control granularity + status transparency** — not just feature presence
- **This is an almost entirely new class of interfaces** and design challenges

## 5. One-Shot Tasks and Micro-Actions

- **Conversations about agents jump to complex systems too quickly** — simple solutions deployable in minutes get overlooked
- **Think through the lens of keyboard shortcuts, gestures, and simple triggers** (Keyboard Maestro, BetterTouchTool, Siri Shortcuts)
- **Micro-action pattern** (from diagram): Signal → Context + Semantic Verb → Output
  - **Signals**: selected text, clipboard content, active page/domain, camera + GPS, device state (folder watch, file event)
  - **Semantic verbs**: read, explain, rewrite, extract, visualize, detect, retrieve
  - **Outputs**: audio (TTS), inline text, visual (diagram/image), note link (deep-link to knowledge base), list update
- **Concrete micro-action examples**:
  - **Read selection** — local TTS with playback speed control; even local models are fast and effective with adequate hardware
  - **Explain selection** — brief definition from model or search results
  - **Transform selection** — corrections, translations, paraphrases, readability improvements, bullet extraction; **potentially the most useful AI application in daily work**
  - **Context-aware transforms** — behavior adapts based on context (e.g., on github.com, text transforms match your documentation style)
  - **Visualize selection** — text to precise visualization (e.g., Nano Banana 2 model, or HTML-to-PNG conversion)
  - **Find related notes** — selection becomes a query to knowledge base search, opens related notes via deep-link / x-scheme-url
  - **Describe clipboard image** — generate style descriptions for image generation from clipboard photos
  - **Photo to action** — phone photo with GPS metadata triggers contextual action (e.g., item added to shopping list)
- **Implementation**: usually a simple script bound to keyboard shortcut, or connected to mobile automation (Siri Shortcuts); can also generate desktop/mobile apps in Swift/Electron/Tauri/React Native for native device access — apps don't need to be public, just for personal use
- **Folder/cloud-drive automations** — actions can also be triggered by specific directories or remote drive spaces

## 6. Designing Your Own Meta-Prompts

- **Direct AI collaboration differs from agent system design** — users don't spend much time writing prompts; some argue prompt design is irrelevant for end users since models "understand anyway"
- **Shift to planning and specification** — tools like Claude Code and Cursor now auto-activate planning mode to generate detailed task documents
- **Agent design showed the hard truth**: writing instructions for an entire **category of tasks** (not just one task) is demanding, especially for first-time-right execution without intervention
  - Not just about model intelligence — also about transferring knowledge, context, rules the model doesn't possess
  - Requires synthesis and paraphrase to avoid repetition and emphasize key behaviors
- **Meta-prompt concept**: a prompt that generates prompts through **guided conversation with the user**
- **Three components of a meta-prompt** (from diagram):
  - **Inputs**: User Model (goals, expertise, style), Domain Model (frameworks, tools, patterns), Task Model (objective, constraints, format), Risk Model (stakes, scope, uncertainty)
  - **Prompt compiler** (6-step process): Frame (what/for whom/why) → Elicit (targeted questions, one at a time) → Infer (facts → rules, style, constraints) → Adapt (branch by domain/risk/expertise) → Synthesize (assemble from schema) → Validate (completeness/format/safety)
  - **Output**: Identity (role, persona, audience), Reasoning (process, mental models), Rules (constraints, guardrails), Expertise (frameworks, anti-patterns), Output Contract (format, sections, syntax)
- **Four layers of a meta-prompt** (from diagram):
  - **Layer 1 — Core protocol** (universal): interview loop, stop condition, question policy
  - **Layer 2 — Domain overlays** (universal): conditional rules per domain (technical, creative, high-stakes)
  - **Layer 3 — Technique library** (universal): 8-15 selected techniques (not all 40+), chosen by domain + risk
  - **Layer 4 — Output layer** (platform-local): platform-specific format, syntax, parser contract
- **Reference meta-prompt available**: [overment.com/metaprompt](https://cloud.overment.com/metaprompt-1772797061.txt) — very extensive, with many examples, expressions, definitions, and adaptation rules
- **Phased generation is justified** — breaking prompt generation into separate phases because of high complexity
- **Meta-prompt anatomy** (from diagram — 6 section families, color-coded):
  - **Frame** (lines ~001-015): who the meta-prompt is, how it operates, the process (intent → ask → clarify → infer → synthesize)
  - **Intake Schema** (lines ~016-037): question strategy — factual context, behavioral context, domain expertise, capability requirements; goals, constraints, tone, expertise level, frameworks, tools
  - **Adaptation Logic** (lines ~038-057, ~094-120): adapting to domains (technical, business, creative, coaching, learning); behavioral guidelines (one question at a time, reflect, summarize progress, high-stakes caution, expert calibration)
  - **Technique Library** (lines ~121-157, ~236-251): prompt engineering arsenal (identity, reasoning, structure, epistemic integrity, analysis, interaction); quality checks, verification, confidence, filtering; application strategy — choose techniques strategically, use a subset not the whole library
  - **Capability Logic** (lines ~208-235): native platform capabilities (multi-agent, code interpreter, artifacts, image generation, linked folders); when to enable what, principle of least privilege
  - **Output Contract** (lines ~058-093, ~252-267): output format (literal wrapper, required fields, import-ready structure, exact examples); critical reminders (literal backticks, common mistakes, parser expectations); conversation opener
- **Section families are portable** — specific to this agent-builder meta-prompt, but the structural concerns (frame, schema, adapt, library, tools, contract) remain the same across most meta-prompts; names change, order may shift, output contract becomes platform-specific

## 7. Practical Applications of Meta-Prompts

- **Meta-prompts are not niche** — they appear frequently in practice despite seeming narrow at first:
  - **Onboarding**: new users go through initial configuration; can generate personalized instructions from their context (e.g., marketplace platform generates prompts from product descriptions, pages, photos for better content generation)
  - **Image generation**: marketing/sales tools need image generation adapted to specific products and brand tone — meta-prompts for instruction generation are very helpful
  - **Chatbots and agents**: tools like Claude and Claude Code already use meta-prompts to generate subagent/skill instructions; improves product perception because personalization directly translates to usefulness and effectiveness
  - **Optimization**: even for simple mechanics or specialized agents (e.g., data classification), automatic optimization strategies use meta-prompt concepts
- **Despite growing model capability** with understanding general instructions, **significant work in prompt optimization remains necessary** — prompt quality determines model effectiveness, which determines the value AI delivers in daily work and products
