# S01E04 — Multimodality Support and Attachments

## 1. Overview of Latest Models for Image, Audio, and Video

- **Benchmarks** are limited in absolute evaluation but show correct **trends** — top models consistently rank high
- [Artificial Analysis](https://artificialanalysis.ai/image/leaderboard/text-to-image) provides rankings across categories
- **LLM rankings** (intelligence / speed / price per 1M tokens):
  - **GPT-5.2** — #1 intelligence (51), 74 t/s, $4.8/1M
  - **Claude Opus 4.5** — 50, 77 t/s, $10.0/1M
  - **Gemini 3 Pro** (Preview) — 48, 114 t/s, $4.5/1M
  - **Kimi K2.5** — 47, 114 t/s, $1.2/1M
  - **Gemini 3 Flash** — 46, #1 speed (170 t/s), $1.1/1M
  - **Claude 4.5 Sonnet** — 43, 70 t/s, $6.0/1M
  - **DeepSeek V3.2** — 42, 31 t/s, #1 cheapest ($0.3/1M)
  - **Grok 4** — 41, 39 t/s, $6.0/1M
- **Image generation top 3**: Gemini 3 (Nano Banana), GPT-Image-1, Flux
- **Video generation top**: Grok 4, Kling 2.5
- Beyond accuracy, evaluate **speed**, **price**, **privacy**, and **local deployment** options (e.g., Qwen)
- Rankings change rapidly — maintain a process for staying current (see S01E01)

## 2. Processing Attachments with Tool Support

- Users attach files (images, documents) when interacting with agents — these become inputs for tools (background removal, embedding in emails, editing)
- **Key problem**: images are sent as **URL or Base64**, but the LLM **cannot see the URL itself** — it only sees pixel data
  - Agent cannot reference the file path for tool calls or pass it to other agents
- **Multi-turn image conversation**: images must be **re-sent with every request** — the model does not retain pixels across turns
  - Request #1: user sends "What's in this image?" + photo.jpg → assistant describes the image
  - Request #2: user asks follow-up → photo.jpg must be included again in the message
- Same problem applies to **audio, video, and text documents** — no API natively solves this

### Solution: Media Tag Pattern

- Add a **system instruction** explaining how to reference files: "Attached files are listed as `<media>` tags. Reference them using `@file:filename` in tool arguments."
- **User message** contains three parts:
  1. `input_text` — the actual query ("Remove background")
  2. `input_image` — Base64 image data (pixels for the model to see)
  3. `input_text` — `<media filename="photo.jpg" />` tag (filename for the agent to reference)
- **Agent tool call** uses `@file:photo.jpg` as reference
- **Runtime resolves** `@file:photo.jpg` → actual Base64 data before executing the tool
- This pattern enables agents to **freely pass documents across the entire system**

## 3. Adapting Image Recognition with LLMs

- Image recognition can go **beyond base model knowledge** — external descriptions can augment classification
- **Workflow vs Agent decision**:
  - Simple, static classification with fixed rules → **workflow**
  - Dynamic data, changing descriptions, uncertain coverage → **agent**
- **Agent instruction design** — two contrasting approaches:
  - **Workflow style** (left): explicit step-by-step procedure — "Read adam.md, jakub.md...", "For each image use understand_image...", "Copy to adam/ or jakub/..." → **programmer thinks, agent executes**
  - **Agent style** (right): goal + constraints — "GOAL: Classify images by profiles", "MATCH: All criteria must be visible", "AMBIGUITY: Multiple → all folders", "UNKNOWN: Not visible ≠ absent" → **programmer constrains, agent thinks**
- Agent instructions should define: **goal**, **limits/constraints**, **universal patterns** — NOT data-dependent steps
- Example: [01_04_image_recognition](https://github.com/i-am-alice/4th-devs/tree/main/01_04_image_recognition) — agent with **Files MCP** + **dedicated image analysis tool**, searches `knowledge/` and `image/` directories, organizes into `image/organized/`
- Accuracy **won't be 100%** — unconfident items go to `unclassified/` — **human verification is easier than doing the full work manually**
- High agent flexibility comes at the cost of increased error risk, but can be mitigated with safeguards

## 4. Iterative Image Generation and Editing

- Current commercial models (Gemini 3) are now sufficient for production-grade image generation
- **Core challenge**: agent can send images to the model (from user), but **cannot see images it generates itself**
- Tools like [ComfyUI](https://www.comfy.org/) and [Weavy](https://www.weavy.ai/) remain useful for advanced workflows
- VLMs were once "blind" ([vlmsareblind.github.io](https://vlmsareblind.github.io/)) — latest models solve most tasks from that publication, though **precision, detail detection, and color recognition** still have issues
- Agents can create images via **models** or by **writing code** (e.g., generating charts) — both produce tool output the agent can't natively see
- **Solution**: equip agent with a **dedicated image analysis tool** — e.g., ask questions about generated images, or use [Code Execution with Images](https://ai.google.dev/gemini-api/docs/gemini-3#code_execution_with_images)
- Example: [01_04_image_editing](https://github.com/i-am-alice/4th-devs/tree/main/01_04_image_editing) — agent with **filesystem**, **image generation/editing**, and **image analysis** tools
- **Iterative edit loop** (Image-to-Concept-Art Agent):
  1. User input: "Convert sci-fi graphic to match our styleguide"
  2. **fs_read**: load style-guide.md → extract rules (B&W, pencil sketch, loose strokes)
  3. **fs_search**: locate source image
  4. **create_image**: apply style transformation
  5. **analyze_image**: quality assessment — check sketch style, B&W, loose strokes, no overrendering
  6. **Decision**: FAIL ("Too clean — retry with looser strokes") → loop back to step 4 / PASS → save output
- Agent defaults to style-guide.md unless user explicitly says not to — user can **ask for clarification** before generation
- **Workflow vs Agent again**: if only one style → workflow; if multiple styles determined from instructions or reference images → agent; workflow can also be **a tool inside an agent**

## 5. Generating and Enriching Prompts with References

- Models like **Nano Banana (Gemini)**, [gpt-image](https://platform.openai.com/docs/guides/image-generation), [Riverflow 2.0](https://replicate.com/sourceful/riverflow-2.0-pro), [Seedream](https://replicate.com/bytedance/seedream-4), [Flux](https://replicate.com/black-forest-labs/flux-2-pro) have high instruction-following precision
- Best practices: [Google prompting tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/), [JSON-formatted prompts](https://www.fofr.ai/prompting-with-json)
- **JSON prompt structure** helps organize generation settings — may benefit **humans more than models** at this point
- In application logic, **LLMs generate the detailed prompts** based on established rules — agents can also optimize prompts
- **Hallucination warning**: models can generate impressive images that are 95% correct but contain **subtle glitches** — hard to catch, similar to text hallucinations
  - Example: Gemini 3 Pro comic explaining a meme — last panel has visual artifacts (4-panel comic showing "Hidden hazard" rake scenario — "Lesson: unseen inputs create predictable outcomes")

### JSON Template Workflow

- Agent uses **template.json** as a base for image generation:
  1. **Parse**: extract subject from query → `{ subject: "phoenix", action: "rising", context: "flames" }`
  2. **Clone template**: load base prompt structure with style/quality/subject fields
  3. **Inject**: replace placeholder `[[@@@SUBJECT]]` → actual subject description
  4. **Generate**: LLM function call with prompt and size (e.g., 1024x1024)
  5. **Save**: persist to disk via `fs.write`
- Template itself can be **AI-generated** from a short description
- Example: [01_04_json_image](https://github.com/i-am-alice/4th-devs/tree/main/01_04_json_image)

### Style Learning from Reference Images

- Templates can be **created from images** — agent "learns" a style:
  - **Phase 1 — Create Blueprint**: user sends reference images → agent analyzes and extracts style attributes (lighting, mood, color palette, quality) → stores as JSON blueprint
  - **Phase 2 — Generate**: user requests new image → agent clones + modifies template → generates with consistent style
- Creating a **dedicated skill** for template generation is recommended — usually requires several iterations
- Precise style cloning is not always within autonomous agent capability — **human support** improves results

## 6. Reference Graphics for Controlling Model Behavior

- Generation can use **reference images** as starting points — controlling composition, framing, character poses
- Supports **in-painting** (filling missing elements) and **out-painting** (generating new image regions)
- Advanced control via **ControlNet** in tools like ComfyUI — API (OpenAI, Gemini) offers less control but still powerful
- **Pose reference workflow**:
  1. User requests character ("Create a magical night walker character")
  2. Agent loads + modifies JSON template, injects subject descriptor
  3. Agent selects **pose reference** image (simple line-drawing sketch)
  4. Agent generates with template + pose → `{ prompt: "magical night walker, fantasy...", reference_image: "poses/walking.png" }`
  5. Output matches pose reference positioning
- Code: [01_04_image_guidance](https://github.com/i-am-alice/4th-devs/tree/main/01_04_image_guidance) — same agent architecture, changed instructions + added `references/` folder with pose images
- Use cases: **e-commerce**, **advertising materials**, anywhere needing **consistency of subject/character** across images

## 7. Processing Rendered PDF Documents

- Generated images can be embedded in **HTML, PDF, email** — combined with programmatic graphics (charts) for rich reports
- Example: [01_04_reports](https://github.com/i-am-alice/4th-devs/tree/main/01_04_reports) — agent with **HTML-to-PDF conversion via Puppeteer**
- Agent capabilities stack:
  - Flexible (yet scoped) **filesystem access**
  - **Image analysis, generation, and editing**
  - **Document writing** with embedded local file references
  - **HTML-to-PDF conversion**
- **Document generation pipeline**:
  1. User requests document (e.g., "4 Karate Kata positions")
  2. Agent reads **style-guide.md** + **template.html**, clones template
  3. Agent generates content + images (line-drawn karate stance illustrations)
  4. Agent assembles into HTML with embedded images
  5. Agent converts to PDF, delivers final document
- Agent can **fix issues** (styling, content, broken images) without starting over — incremental edits
- Generated materials can be **emailed, uploaded to Google Drive, or passed to other agents** (translation, verification)
- **Reading PDFs** is harder than generating them — most providers offer [special PDF APIs](https://platform.claude.com/docs/en/build-with-claude/pdf-support); [LlamaIndex](https://www.llamaindex.ai/) also addresses this

## 8. Audio and Latest Voice Interface Capabilities

- Audio processing has evolved: models now **understand audio holistically** — environment sounds, tone of voice, not just transcription
- Audio generation now includes **voice modulation** and **tempo changes**, not just text-to-speech
- **Key providers**: [Gemini](https://ai.google.dev/gemini-api/docs/audio), [OpenAI](https://platform.openai.com/docs/guides/text-to-speech), [ElevenLabs](https://elevenlabs.io/), [Hume](https://www.hume.ai/), open source [Kokoro-TTS](https://huggingface.co/spaces/hexgrad/Kokoro-TTS) ([TTS leaderboard](https://artificialanalysis.ai/text-to-speech/leaderboard?open-weights=true))
- Local models now have **comparable quality** to commercial options
- **Three audio processing decisions**:
  1. Separate **text-to-speech / speech-to-text** pipeline
  2. **Multimodal models** for holistic audio processing
  3. **Real-time interaction** models
- Selection based on **price** and **capabilities** (speed, quality, accuracy, detail level) — no single best model
- Live API still has **glitches and stability issues** (OpenAI, Gemini) — cost is also a challenge

### Audio Agent Architecture

- **Three-tier flow**: Browser → App Server → AI/Gemini
  1. **UI Input**: `{ text?: "query", audio?: base64 }`
  2. **App Normalize**: save audio to `workspace/input/*.wav`
  3. **LLM Route** — tool selection based on intent:
     - **Understand branch (STT)**: `transcribe_audio`, `analyze_audio`, `query_audio`
     - **Generate branch (TTS)**: `generate_audio` → output `*.wav`
  4. **App Package**: `{ text: "response", audio?: base64 }`
  5. **UI Render**: display text + play audio
- Example: [01_04_audio](https://github.com/i-am-alice/4th-devs/tree/main/01_04_audio) — agent with filesystem + audio generation/analysis/transcription/querying via **Gemini Flash**
- Capabilities: meeting transcription (files >20MB), audio responses for emails/messengers, speaking style guidance (though hallucination-prone)

### Audio Analysis Capabilities

- **Transcript** with timestamps: `0:00 - "Hello there, how are you?"`
- **Voice Profile**: gender (Male), speaker count (Single), environment (Quiet), accent detection ("Eastern European accent, non-native")
- **Speaking Style**: pace (Slow-Moderate), clarity (Clear), emotion (Neutral)
- Suggests capability for **diarization** (speaker identification)
- **Important**: adapt response style for audio output — avoid dictating URLs, tables, or complex formatting that doesn't work in spoken form

## 9. Processing Video Materials

- Previously: split video into frames + analyze with vision models + separate STT for audio — now **Gemini API handles video natively** (still in preview)
- Can analyze **YouTube videos directly** — also as audio-only for podcasts
- Example: [01_04_video](https://github.com/i-am-alice/4th-devs/tree/main/01_04_video) — agent with filesystem + video analysis/querying tools
- **Video analysis example**: agent summarized [Claude AI Co-founder video](https://www.youtube.com/watch?v=Iar4yweKGoI) into 4 key claims:
  1. "AI automates entire job categories" — full replacement, not just tasks; skeptics warn of diminishing returns
  2. "50% become permanent underclass" — lower-skill workers hit hardest; historical parallels suggest adaptation
  3. "10-20% annual GDP growth" — unprecedented productivity; risk of instability and wealth concentration
  4. "AI enables totalitarian control" — surveillance states, autonomous weapons; Constitutional AI as safeguard
- Processing: `analyze_video type=general`, completed in 89 seconds via Gemini
- Works with **.mp4, .mpeg, .mov** files — agent navigates filesystem via shell or Files MCP
- **Optimization**: compress/accelerate audio/video to reduce cost and processing time (if details aren't lost)

### Video Generation

- Text-to-video models: [Veo](https://ai.google.dev/gemini-api/docs/video?example=dialogue), [Sora](https://platform.openai.com/docs/guides/video-generation), [Kling](https://replicate.com/kwaivgi/kling-v2.5-turbo-pro)
- Support **start frame** and **end frame** specification for high control
- Example: [01_04_video_generation](https://github.com/i-am-alice/4th-devs/tree/main/01_04_video_generation) — combines filesystem + image generation + video synthesis
- **Video generation agent workflow**:
  1. User: "Fox jumping on fence, walking, then diving into snowdrift"
  2. Agent reads `template.json` (pencil + watercolor style)
  3. **Generate start frame** via Gemini (16:9, 2K resolution) → `fox_start_frame.jpg`
  4. **Generate end frame** via Gemini → `fox_end_frame.jpg`
  5. Agent asks for **user confirmation**: "Frames ready. Proceed with video generation?"
  6. User confirms → **Generate video** via Kling model on Replicate (10s duration)
  7. Output: animated sequence from start to end frame (START → MID → END)
- Agent may ask for **instruction clarification** or **image verification** before proceeding — this is expected agent behavior
