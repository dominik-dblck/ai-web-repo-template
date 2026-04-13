# S01E03 — Designing APIs for Effective Work with Language Models

## 1. API Characteristics That Shape AI Tool Design

- **Before building tools**, audit the API for LLM-unfriendly patterns:
  - Missing or limited actions (e.g., no resource creation endpoint)
  - **Resource referencing** — model needs clarity: "label named Priority" must resolve to an ID
  - Inconsistencies in request/response naming (e.g., `content` vs `body` for the same concept)
  - Incomplete responses (e.g., only `201 Created` with no resource data returned)
  - Complex relationships requiring multiple actions for one task (e.g., create promo + assign to product for a discount code)
  - **Polling/async operations** — problematic for agents; handle in code, not agent logic
  - **Rate limits** — handle programmatically so agent doesn't retry blindly
  - Pagination and search — agents need these heavily to avoid loading too much content upfront
- **Best practice**: download official SDK, discuss it with a coding agent (e.g., Open Code), generate verification scripts, save notes
- The more you know about the API, the better your tools will be

## 2. Planning Tool Structure and Property Schemas

- Combine **API knowledge** + **tool design principles** from S01E01/S01E02
- **Official Filesystem MCP** ([GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)) exposes **13 tools**: read_text_file, read_media_file, read_multiple_files, write_file, edit_file, create_directory, list_directory, list_directory_with_sizes, move_file, search_files, directory_tree, get_file_info, list_allowed_directories
  - 13 tools for just one domain (filesystem) is excessive context consumption
- **Coding agents** (Cursor, Claude Code) show that tools like **grep/ripgrep** + shell access are far more flexible
  - But shell access requires sandboxing → higher cost and complexity
- **MCP vs Shell trade-off**: MCP is safe but rigid; shell is flexible but dangerous
- **Optimization: 13 tools → 4 tools** by grouping by capability:
  1. **fs_search** — file search + directory tree + file info + allowed directories
  2. **fs_read** — text files + media + multiple files
  3. **fs_write** — write + edit
  4. **fs_manage** — create directory + list directory + move file
- **Goal is not just fewer schemas** — find the right balance between available actions and model effectiveness
- Same approach applies to any API: analyze endpoints → group into consolidated tools → plan with LLM assistance
- Example: [files-stdio-mcp-server](https://github.com/iceener/files-stdio-mcp-server), specifically [src/tools](https://github.com/iceener/files-stdio-mcp-server/tree/main/src/tools)

## 3. Optimizing Tool Interfaces for Language Models

- Three dimensions to consider: **API structure**, **LLM perspective/capabilities**, **use cases**
  - API defines fundamental capabilities and constraints
  - LLM perspective requires **tool clarity**
  - LLM capabilities dictate action complexity and result handling
  - LLM limitations flag potential problems (e.g., hallucination)
  - Use cases address user needs and tool purpose
- **fs_read** — detailed schema from image:
  - **Input**: `path` (required), `lines` (default: 50), `limit` (1KB for dirs), `offset`, `depth`, `details` (size/modified/hash), `glob` pattern, `exclude` patterns, `respectIgnore`
  - **Output (file)**: `success`, `path`, `type`, `content`, `checksum`, `totalLines`, `range`, `truncated`, `hint`
  - **Output (directory)**: `success`, `path`, `type`, `entries` array, `summary`, `stats`
  - Simple names, minimal required data, optional **mode** and **details**
- **fs_read edge cases** (from image):
  - **Basic read**: returns first 50 lines + checksum
  - **Auto-resolve filename**: fuzzy matching — `"utils.ts"` → auto-resolved to `src/lib/utils.ts`
  - **Large file pagination**: `totalLines: 8432, truncated: true, hint: "Showing 1-100. Use lines=1-200"`
  - **Ambiguous path**: error `AMBIGUOUS_PATH` with candidates list
  - **Sandbox escape**: error `OUT_OF_SCOPE` — "Absolute paths not allowed"
- **Debate**: whether to split `fs_read_file` and `fs_read_directory` vs single `fs_read` — depends on project context; in practice, LLM handles combined tool well
- **Key insight**: implementation thinking goes beyond standard API design — auto-resolving paths, detailed hints, designing for **use cases** that are LLM-unfriendly (context overflow)

## 4. fs_write — Safe File Modification

- Reading is low-risk; **writing creates significant error space**
- Cannot prevent all mistakes, but can **minimize risk**:
  - **Checksum verification** — prevents overwriting files changed in the meantime
  - **dryRun option** — agent previews changes before applying
- **fs_write schema** (from image):
  - **Input**: `path` (required), `operation` (`create`/`update`), `content` (for create), `action` (`replace`/`insert_before`/`insert_after`/`delete_lines`), `lines` range, `checksum` (recommended for update), `dryRun`, `createDirs`
  - **Output envelope**: `status` (`applied`/`preview`/`error`), `path`, `operation`, `result` (action-specific), `error` (code + message + `recoveryHint`), `hint`
  - Create result: `action`, `newChecksum`, `diff`
  - Update result: `action`, `targetRange`, `newChecksum`, `diff`
- **Usage examples** (from image):
  - **Create file**: returns path + newChecksum + hint "File created. Checksum: 9c1c."
  - **Update preview**: dryRun returns diff + hint "Review diff. Re-run with dryRun=false to apply."
  - **Error — file changed**: `CHECKSUM_MISMATCH` + recoveryHint "Re-read with fs_read"
- Returning file path in response **reinforces** model behavior — enables using the file in subsequent actions
- For **lossy actions** (write/edit), maintain change history for rollback — **without involving the model**

## 5. fs_search and fs_manage — Completing the Toolkit

- **fs_search** (from image):
  - **Input**: `path` (required), `query` (required), `target` (`all`/`filenames`), `patternMode` (`literal`/`regex`/`fuzzy`), `caseInsensitive`, `wholeword`, `multiline`, `types` filter, `glob`, `exclude`, `depth` (default: 5), `maxResults` (default: 100), `respectIgnore`
  - **Output**: `success`, `query`, `files` (FileMatch[]), `content` (ContentMatch[]), `totalCount`, `truncated`, `hint`
  - Supports both **filename matching** and **content search** — increases flexibility and effectiveness
- **fs_manage** (from image):
  - **Input**: `operation` (`delete`/`rename`/`move`/`copy`/`mkdir`/`stat`), `path` (required), `target` (for rename/move/copy), `force`
  - **Output**: `success`, `operation`, `path`, `target`, `stat` (StatResult), `hint`
  - **Delete is restricted**: single files or **empty directories only** — no recursive delete
  - Consider a "trash" or archive concept for easy restoration
- Same design principles apply to **any integration** — also useful when designing APIs that will later integrate with LLMs

## 6. Designing Dynamic Success and Error Responses

- **hints** / **recoveryHints** in nearly every action — designed for the model to guide next steps
- Support the model **even when everything works**, not just on errors
  - Context-dependent info (e.g., permission constraints revealed only after action) remains useful regardless of model intelligence
- **Five rules for dynamic responses**:
  1. **Errors say what happened AND what to do** — e.g., "File content updated. Re-read it."
  2. **Resource status with special settings communicated** — e.g., "Document exists but is write-protected by user settings."
  3. **Success suggestions prevent unnecessary steps** — e.g., "Found 3 documents. Read their content before editing."
  4. **Wrong values suggest available options** — e.g., "Invalid label type. Available: 'X, Y, Z'."
  5. **Corrections reported** — e.g., "Requested lines 48-70, document has 59 lines. Loaded 48-59."
- Dynamic messages = **significantly more complex code** — generic error messages exist not by choice but because quality error handling was too expensive
- **Don't skip this complexity** — AI assists with planning, test generation, and implementation; multiple iterations are within reach of even small teams
- Code source: [files-stdio-mcp-server](https://github.com/iceener/files-stdio-mcp-server)

## 7. Model Context Protocol vs Custom Implementation

- **MCP proposed by Anthropic** ([announcement](https://www.anthropic.com/news/model-context-protocol)) in November 2024
  - Addresses the problem of connecting LLMs/agents with their environment
  - Function Calling exists at every provider, but **API formats differ**
  - Tool handling differs across Claude Code, Claude, ChatGPT, Cursor
  - Without MCP: dedicate integration per client; with MCP: **build once, connect everywhere**
- **Three core concepts**: **Host** (app), **Client** (connection manager), **Server** (external tool process)
- From the agent's perspective, **tool origin doesn't matter** — native tools and MCP tools are identical
- MCP = a **standard for packaging and delivering tools** in a consistent form
- Example: [01_03_mcp_native](https://github.com/i-am-alice/4th-devs/tree/main/01_03_mcp_native) — host with both native + MCP tools
  - **Native tools**: Function Calling schemas, part of app source code
  - **MCP tools**: same format, but delivered via Client-Server connection
  - Schemas from both sources **merged into one list** for the model
  - Handlers from both sources **merged** — agent doesn't know the difference
- Using MCP is **not mandatory** — it can coexist with built-in tools, not replace them

## 8. Main MCP Components for STDIO and Streamable HTTP

- MCP is more than just tools:
  1. **Apps** — interactive UIs returned in agent responses; display data + execute actions without leaving the client
     - Flow: User asks → LLM calls tool → Server returns rich response (e.g., chart) → Host renders embedded
  2. **Resources** — static or dynamic read-only data (files, images, resource lists like /users)
     - Flow: User opens resource picker → Client lists resources → User selects → Content injected into LLM context
     - Activation method not defined — can be UI-driven or agent-decided
  3. **Prompts** — predefined instructions with dynamic elements, activated by user (e.g., from command list)
     - Flow: User opens prompt picker → Client lists prompts → User selects with arguments → Instructions loaded into LLM
     - Example: `code_review` prompt with `lang: "typescript"` argument
  4. **Sampling** — **reverse interaction**: Server sends request to be forwarded to the model
     - Server pauses mid-operation → requests LLM classification → Client forwards → LLM responds → Server resumes
     - Requires **explicit user acceptance**
  5. **Elicitation** — reverse communication directed at the **user** (not LLM)
     - e.g., fill a form, perform an external action in browser
- Most MCP servers currently **don't use** these capabilities; client support is growing
- Example: [S01E03_mcp_core](https://github.com/i-am-alice/4th-devs/tree/main/01_03_mcp_core) — testable with [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector)
- **Transport types** ([spec](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)):
  - **STDIO** — local processes; best for desktop apps; one user per connection (new process per connection)
  - **Streamable HTTP** — remote servers; **default choice**; supports user sessions + OAuth 2.1; deployable on VPS or Cloudflare Workers

## 9. Backend MCP Client and Server Design

- MCP Host doesn't require a GUI — backend integration is valid
- **Translation agent example** ([01_03_mcp_translator](https://github.com/i-am-alice/4th-devs/tree/main/01_03_mcp_translator)):
  - **Workflow approach**: Split → Translate → Merge (linear, no error recovery)
  - **Agent approach**: Decide → Act loop with Read/Write/Translate tools + Review step (adaptive, self-correcting)
  - Workflow = **high control, low flexibility**; Agent = **high flexibility, risk + opportunity for better results**
- **Agent architecture** (from image):
  - **File Watcher** monitors `translate/` and `translated/` directories
  - **Agentic Loop** (reason → act → repeat)
  - **MCP Client** communicates with Files MCP Server (external process, STDIO, scoped to workspace)
- **System prompt contains general rules and schemas** — execution method depends on the model
  - If you want **fixed steps always**, consider a workflow instead
- **MCP Client-Server connection** ([client.js](https://github.com/i-am-alice/4th-devs/blob/main/01_03_mcp_translator/src/mcp/client.js)):
  1. **Load config** — read `mcp.json` with server settings
  2. **Connect** — `new Client()` → set name/version/capabilities → `StdioClientTransport` → `client.connect(transport)`
  3. **Use** — `client.listTools()` to discover, `client.callTool({ name, arguments })` to invoke

## 10. Building MCP Servers with Spec-Driven Approach

- Simple MCP servers are easy; **production-grade ones are complex**
- **Template**: [Streamable MCP Template](https://github.com/iceener/streamable-mcp-server-template) (TypeScript, general principles apply to other languages)
- MCP servers are **architecturally repetitive** → templates make sense
- **Use LLMs to generate servers** — but model knowledge of the evolving protocol may be outdated → rely on README.md + manual.md, load into context frequently
- **9-step generation process**:
  1. Clone template repository
  2. Create `API.md` with target service documentation (e.g., [uploadthing.com](https://uploadthing.com/))
  3. Ask AI to read README.md + manual.md
  4. Ask AI to suggest MCP tool list based on available API
  5. Review list — apply lessons: limit tool count, group related actions, drop unnecessary ones
  6. Ask for input/output schemas applying design principles
  7. Ask for implementation
  8. Review code, suggest corrections
  9. Remove unused template elements
- Even with **multiple iterations**, the process remains the same
- Example: [01_03_upload_mcp](https://github.com/i-am-alice/4th-devs/tree/main/01_03_upload_mcp) — agent uploads files from workspace, saves result in `uploaded.md`
- Server implementation: [mcp/uploadthing-mcp](https://github.com/i-am-alice/4th-devs/tree/main/mcp/uploadthing-mcp)

## 11. Security and Privacy Concerns

- Generating MCP servers/tools **does not automatically solve** security and privacy problems
- **Prompt injection remains an open problem** — no universal solution except physical restrictions (which reduce agent capabilities)
- **Internal tools** offer higher control:
  - Control over resources and actions
  - Known tool list and configurations
  - Known agent processes and human roles
  - Users can be trained
  - Information flow limited to company structures
- **Public MCP servers** lose almost all of these advantages:
  - No knowledge of host, other tools, processes, or data scope
  - Users may have malicious intent or be influenced by malicious content (e.g., emails)
- **Mandatory programmatic safeguards**: access blocks, action restrictions, rate limits, extra verification, data anonymization, thorough validation
- Some resources/actions simply **cannot be exposed** to AI agents at current model maturity
- These problems exist at **Function Calling level**, not just MCP — but MCP does little to address them
- **"USB-like" promise** creates high business/user expectations → communicate risks with concrete examples and demos
- Stay current with model development — some problems may diminish over time

## 12. MCP Server Authorization and User Permissions

- Authorization spans both **MCP Client** and **MCP Server**
- Even backend MCP usage requires auth handling (not just desktop apps)
- **API keys**: simpler — Host stores keys, Server uses them per-action; ensure keys don't leak
- **OAuth**: significantly more complex for both client and server
- **OAuth Server-side flow** (from image — 6 steps):
  1. **Server Discovery** — proxied resource metadata, authorization server metadata
  2. **Client Metadata Validation** — OIDC unauthenticated flag (required), HTTP URIs validation
  3. **Authorization Code** — PKCE (required), request context cleanup
  4. **Token Exchange** — single-use auth codes (required), two-layer tokens (required)
  5. **Token Storage** — end-to-end encryption, manage by all keys
  6. **Provider API Calls** — token usage enforcement, two-layer token enhancement (optional)
- **OAuth Host/Client-side flow** (from image — 5 steps):
  1. Implement OAuth/OpenID Provider
  2. Fetch Server Metadata
  3. Generate PKCE + Request (user authentication required)
  4. Generate/Exchange Code (PKCE + client verification required)
  5. Use & Refresh Tokens (automatic refresh, request context isolation optional)
- Template repository includes OAuth implementation reference
- With tokens/API keys in hand, **permission management** works like standard application RBAC
- At this stage: focus on **broad perspective**, not implementation details

## 13. Handling Large Numbers of Tools and Server Conflicts

- Multiple MCP servers = potential **naming conflicts** and context overload
- As server creators: use **unique, descriptive names** (not just `get`, `send`, `search`)
- **Host responsibility** — present tools with namespace prefix:
  - `resend__send` and `gmail__search` to eliminate collisions
  - Users can't add two servers with identical names
- Host should provide **easy control** over active components:
  - Assign tools to assistant profiles via simple UI
  - UI significantly impacts system effectiveness
- **Hard tool limit** — prevent activating too many simultaneously
  - In multi-agent systems, limit applies per agent, not total
  - Dynamic tool discovery as an alternative (covered later)

## 14. MCP Servers with Local Open-Source Models

- Local models via LM Studio, llama.cpp, vllm — expose Chat Completions API (OpenAI format)
- If Function Calling is supported → **MCP servers work with local models**
- **Benefit**: token costs effectively **zero** (only energy consumption)
- Small local models as **quality test** for MCP servers:
  - If a small model handles your tools correctly → tools are well-designed
  - Not always true, but a useful heuristic
- **Recommended models**:
  - GPT-OSS 20B
  - Nemotron 3 Nano
  - GLM 4.7 Flash 30B
  - Qwen 3 Coder 30B A3B
  - GPT-OSS 120B (for stronger hardware)
- Alternative: test via [OpenRouter](https://openrouter.ai/) for cloud inference
- Example: modify [01_03_upload_mcp](https://github.com/i-am-alice/4th-devs/tree/main/01_03_upload_mcp) to point at LM Studio (change API address + model name)

## 15. Publishing Remote MCP Servers and MCPB for Local Servers

- **Streamable HTTP servers** can run locally or on remote servers
  - Expose via **nginx** — single `/mcp` endpoint (without OAuth) or multiple endpoints (with OAuth)
- **Cloudflare Workers** deployment (from image):
  - Create KV namespace for tokens: `bunx wrangler kv:namespace create "TOKENS"`
  - Configure `wrangler.toml`: name, KV binding, vars (`AUTH_ENABLED`, `MCP_TITLE`)
  - With OAuth: add `PROVIDER_CLIENT_ID`, `PROVIDER_CLIENT_SECRET`
  - Deploy: `bunx wrangler deploy` → publishes to `https://mcp-server.cloudflare.workers.dev/mcp`
  - **Free tier limits**: 100k requests/day, 10k KV ops/day, each MCP call = 3 requests minimum
- **Nginx config** (from image):
  - Client → nginx :443 (SSL) → MCP Server :3000
  - Without OAuth: proxy `/mcp` → :3000/mcp
  - With OAuth: additional routes for `/.well-known/`, `/authorize`, `/token`, `/refresh/callback`
- **STDIO servers** — for local/desktop use only (Claude, Claude Code, CLI tools)
  - Installation can be difficult for non-technical users
- **MCPB** ([MCP Bundle](https://github.com/modelcontextprotocol/mcpb)) — packages server source + config into single file
  - Host supporting MCPB handles download, configuration (e.g., API key entry)
  - Not widely popular; available in Claude app
