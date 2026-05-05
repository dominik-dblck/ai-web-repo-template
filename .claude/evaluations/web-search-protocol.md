# Web Search Protocol

Structured web search process for gate skills. Not a generic "google it" — a 4-phase research step with specific queries and citation requirements. `[S02E03 §7 — query enrichment before agentic loop]`

---

## Phase 1 — Extract Search Targets

Read the document being evaluated. Identify concrete, searchable claims:

- Architecture patterns proposed (e.g., "pipeline pattern", "event-driven", "template-driven tasks")
- Technologies or libraries chosen (e.g., "TaskCreate API", "evaluation checklist pattern")
- Design approaches (e.g., "single conversation multi-skill pipeline", "external eval criteria files")

---

## Phase 2 — Formulate Structured Queries

For each search target, create 2-3 query variations `[S02E01 §3 — search with keywords + synonyms, 3-5 angles]`:

- `"{pattern name}" best practices {year}` — current consensus
- `"{pattern name}" problems OR pitfalls OR antipatterns` — known issues
- `"{pattern name}" alternatives OR comparison` — what else exists

---

## Phase 3 — Evaluate and Cite

- Each web finding produces a citation: `[web: {URL or source name} — {specific finding}]`
- Findings fall into 3 categories:
  - **CONFIRMS** — web evidence supports the approach
  - **WARNS** — web evidence identifies a risk not addressed
  - **SUGGESTS** — web evidence offers an alternative worth considering
- Only cite findings that are **actionable** — skip generic blog advice
- Web findings that contradict KB findings should be flagged explicitly — KB takes precedence but the conflict is worth noting

---

## Phase 4 — Write Into Evaluation

Web findings go in dedicated sections within the evaluation output:

```markdown
### Web Search Insights

- [CONFIRMS] {what it confirms} `[web: {URL or source name} — {specific finding}]`
- [WARNS] {risk identified} `[web: {URL or source name} — {specific finding}]`
- [SUGGESTS] {alternative worth considering} `[web: {URL or source name} — {specific finding}]`

### Web Search Queries Executed

- "{query 1}" → {N results reviewed} → {findings: N confirms, N warns, N suggests}
- "{query 2}" → {N results reviewed} → {findings: N confirms, N warns, N suggests}
```

---

## Which Gate Searches for What

| Gate skill                      | Search targets                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| `/architect-evaluate-discovery` | Architecture patterns proposed, risk areas and failure modes, similar systems in industry |
| `/architect-evaluate-plan`      | Libraries/tools chosen, file structure patterns, known issues with specific tech choices  |
| `/orchestrator-plan-review`     | No web search — purely structural                                                         |
| `/architecture-review`          | No web search — code review only                                                          |
