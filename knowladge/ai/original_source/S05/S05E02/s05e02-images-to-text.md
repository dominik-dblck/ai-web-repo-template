==========================================================================================
title: ai_devs_4_generative_ui-36620434-5.png
dashboard:
product: GENERATIVE UI
current_view: CHAT THREAD
conversation:

- role: USER
  message: Show me the top 3 performing products from last month, generate a chart, and explain what might be driving the trend.
- role: ASSISTANT
  message: Sure. Let me pull the sales data first, then I'll build the chart and walk you through what's happening.
  thinking:
  label: THINKING
  tokens: 312
  text: User wants top 3 products by revenue for last month. I should call get_sales_report with granularity=monthly, then filter top 3 by revenue. After that I'll call render_chart with a bar type. Finally provide trend analysis based on the returned data...
  panels:
- title: GET_SALES_REPORT
  status: DONE
  input:
  granularity: '"monthly"'
  period: '"2025-02"'
  limit: 3
  output:
- product: ProMax X1
  value: "$142,400"
- product: NeoCore S
  value: "$98,750"
- product: Drift Pad
  value: "$76,200"
- title: RENDER_CHART
  status: RUNNING
  input:
  type: '"bar"'
  data:
- ProMax X1
- NeoCore S
- Drift Pad
  output: waiting for result...
- title: CHART — TOP 3 PRODUCTS · FEB 2025
  chart:
  type: bar
  y_axis_ticks:
- 0
- 50k
- 100k
- 150k
  bars:
- label: ProMax X1
  value: "$142.4k"
- label: NeoCore S
  value: "$98.7k"
- label: Drift Pad
  value: "$76.2k"
- title: What's driving this
  items:
- ProMax X1 — launched a referral campaign in late Jan; organic acquisition spiked ~40% WoW into February.
- NeoCore S — steady performer, boosted by a bundle discount tied to the X1 campaign.
- Drift Pad — entering a seasonal peak; historically strong in Q1 due to back-to-desk purchasing cycles.
- title: PYTHON
  action: copy
  code: |

# reproduce the query

report = get_sales_report(
granularity="monthly",
period="2025-02",
limit=3,
)
top3 = sorted(report, key=lambda x: x["revenue"], reverse=True)
input_box:
placeholder: Ask a follow-up...

==========================================================================================
title: ai_devs_4_voice_agents_modes-5191d053-c.png
diagram:
name: VOICE AGENT MODES
legend:

- Audio / User
- LLM
- Unified model
  sections:
- name: STT / TTS MODE
  flow:
- actor: INPUT
  step: Audio speech
  content: user's voice
- actor: MODEL 1
  step: Speech to Text
  content: audio → text
- actor: MODEL 2
  step: LLM
  content: text → text
- actor: MODEL 3
  step: Text to Speech
  content: text → audio
- actor: OUTPUT
  step: Audio speech
  content: agent's voice
  notes:
- "△ Audio and text are separate layers. 3 models, 3 latency hops."
  tags:
- 3 models
- text boundary
- higher latency
- name: REALTIME MODE
  flow:
- actor: INPUT
  step: Audio / Text / Video
  content: any modality
- actor: SINGLE MODEL
  step: Gemini Live
  content: processes all modalities natively
  modalities:
- audio
- text
- images
- video
- actor: OUTPUT
  step: Audio / Text
  content: native output, no conversion
  notes:
- "→ No text boundary. Audio is first-class. Interruption and silence detection built-in."
  tags:
- 1 model
- no conversion
- lower latency

==========================================================================================
title: ai_devs_4_searches-983353e2-8.png
diagram:
name: RAG ARCHITECTURE PATTERNS
legend:

- Query path
- Sync / shared ID
- Embedding
  sections:
- name: DB + EXTENSIONS
  flow:
- actor: WRITE
  step: New record
  content:
  application: APPLICATION
  fields:
  id: 42
  text: '"content..."'
  embedding: "[0.12, 0.87, ...]"
- actor: SINGLE STORE
  step: SQLite / PostgreSQL
  content:
  extensions:
- fts5 / tsvector
- sqlite-vec / pgvector
  schema:
- "-- all in one row"
- "id | text | fts_index | vec"
- actor: QUERY
  step: Hybrid search
  content:
  query: |
  SELECT \* FROM docs
  WHERE fts MATCH ?
  OR vec_distance(vec, ?) < 0.3
- actor: RESULT
  step: Ranked results
  content: RRF or weighted merge
  notes:
- "→ Embedding lives in the record. No sync needed. One transaction, one source of truth."
  tags:
- low complexity
- no sync
- limited scale
- name: DB + SEARCH ENGINE + VECTOR DB
  flow:
- actor: WRITE + SYNC
  step: New record
  content:
  application: APPLICATION
  fields:
  id: "42 ← shared key"
  text: '"content..."'
  metadata: "{...}"
- actor: sync
  step: sync by id=42
  content:
  stores:
- role: PRIMARY
  name: PostgreSQL
  detail: records + meta
- role: FULL-TEXT
  name: Elasticsearch
  detail: inverted index
- role: SEMANTIC
  name: Qdrant
  detail: vector index
- actor: QUERY
  step: parallel queries
  content:
  queries:
- name: FTS QUERY
  detail: keyword match
- name: VEC QUERY
  detail: cosine sim
- actor: MERGE
  step: RRF / re-rank
  content: resolve by shared id=42
- actor: ENRICH
  step: Fetch full records
  content: PostgreSQL lookup by id
  notes:
- "△ Three stores must stay in sync. Shared id is the contract. Failure = stale results."
  tags:
- sync overhead
- 3 stores
- massive scale
- best recall
