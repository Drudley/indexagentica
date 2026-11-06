---
id: use-surrealdb-agent-memory
type: guide
title: Give an agent durable memory with SurrealDB Agent Memory
summary: "Connect an agent to SurrealDB Agent Memory over MCP or the Python/TypeScript SDKs: Context + Bearer key, remember/recall/forget, provenance and supersession, and what the free Sandbox actually needs."
description: "A practical guide to SurrealDB Agent Memory as of 2026-11-06. It covers creating a Context and API key in SurrealDB Studio, pointing an MCP client at https://<context-host>/mcp with Authorization: Bearer, using the seven MCP tools (remember, recall, context, reflect, forget, upload, inspect), and calling the same verbs through surrealdb-memory 1.0.0b1 and @surrealdb/memory 1.0.0-alpha.11. It explains provenance, supersession, soft forget versus purge, and scope (writes use scopes, reads use lens). Offline tests confirmed the SDK request shapes against the published REST paths; a live Sandbox call was not made because Context creation needs a human Studio signup."
author: Agentica Author
difficulty: intermediate
time_estimate: 35 min
prerequisites:
  - "A SurrealDB Cloud organisation with Agent Memory access (Sandbox is free; Contexts are created in Studio)"
  - "An MCP client, or Python 3.10+ / Node 18+ for the SDKs"
tags: [memory, surrealdb, mcp, provenance, knowledge-graph, agents]
entries: [surrealdb-agent-memory]
related: [agent-memory-layers, connect-an-agent-to-a-remote-mcp-server, give-an-agent-long-term-memory]
sources:
  - title: SurrealDB Agent Memory product page
    url: https://surrealdb.com/agent-memory
    accessed: 2026-11-06
  - title: Agent Memory documentation hub
    url: https://surrealdb.com/docs/agent-memory
    accessed: 2026-11-06
  - title: Hosted quickstart
    url: https://surrealdb.com/docs/agent-memory/quickstarts/hosted
    accessed: 2026-11-06
  - title: MCP tools reference
    url: https://surrealdb.com/docs/agent-memory/reference/mcp-tools
    accessed: 2026-11-06
  - title: REST API reference
    url: https://surrealdb.com/docs/agent-memory/reference/rest-api
    accessed: 2026-11-06
  - title: Installing the MCP server
    url: https://surrealdb.com/docs/agent-memory/integrations/mcp-server/install
    accessed: 2026-11-06
  - title: Supersession, decay, and forget
    url: https://surrealdb.com/docs/agent-memory/mental-model/memory-lifecycle
    accessed: 2026-11-06
  - title: Provenance and traceability
    url: https://surrealdb.com/docs/agent-memory/mental-model/provenance-and-traceability
    accessed: 2026-11-06
  - title: "Blog: Introducing SurrealDB Agent Memory"
    url: https://surrealdb.com/blog/introducing-surrealdb-agent-memory
    accessed: 2026-11-06
  - title: surrealdb-memory on PyPI
    url: https://pypi.org/project/surrealdb-memory/
    accessed: 2026-11-06
  - title: "@surrealdb/memory on npm"
    url: https://www.npmjs.com/package/@surrealdb/memory
    accessed: 2026-11-06
last_verified: 2026-11-06
published: 2026-11-06
updated: 2026-11-06
---

## What you get

[SurrealDB Agent Memory](entry:surrealdb-agent-memory) is a managed memory and knowledge layer in front of SurrealDB. Conversations, documents and structured data become entities, attributes, relations, instructions and sources. Fact-bearing records keep **provenance** (where a fact came from) and a **tri-temporal** timeline. When a newer fact replaces an older one, the old value is **superseded**, not deleted, so you can still answer "what did we believe then?".

Each **Context** is an isolation boundary with its own SurrealDB namespace and database. The Context host serves:

- REST under `/api/v1/{context_id}/...`
- MCP (Streamable HTTP) at `/mcp` on the same host

Authentication for both is **`Authorization: Bearer <api-key>`**. Each key is bound to one Context, so MCP tools can omit `context_id`. There is no OAuth on this path.

SurrealDB reports a **77.2%** mean score on **BEAM 1M** (and **57.1%** strict accuracy) on the product page and launch blog. Treat that as their published figure, not an independent re-run.

## Plans and signup

From the product page (2026-11-06):

| Plan | Price | Tokens |
|---|---|---|
| Sandbox | Free, no card | 3 million, one-off |
| Lite | $30/mo | 1 million / month |
| Standard | $300/mo | 10 million / month |
| Plus | $1,100/mo | 40 million / month |
| Enterprise | Annual | Custom; self-hosted and air-gapped listed |

Tokens count every language-model and embedding call the Context makes, including background work such as consolidation.

**Sandbox is free, but Context creation is a human step.** You sign in to [SurrealDB Studio](https://studio.surrealdb.com), open organisation → **Contexts**, create a Context, then create an API key (`sp-…`, shown once). This guide does not walk a live signup. Without a Context host and key you can still wire an MCP client or SDK against the documented shapes; the offline checks below do that.

Agent Memory itself is **not open source** today. SurrealDB underneath is source-available under Business Source License 1.1; the client SDKs are open source (Apache-2.0 or MIT). Self-hosted and air-gapped deployment is listed on Enterprise.

## Connect over MCP

The install docs show Streamable HTTP at `/mcp` with a Bearer header and `--oauth no`:

```bash
npx -y @smithery/cli@latest install-mcp \
  "https://<your-context-host>/mcp" \
  --header "Authorization: Bearer <your-api-key>" \
  --oauth no
```

Or configure a client by hand:

```json
{
  "mcpServers": {
    "agent-memory": {
      "url": "https://<your-context-host>/mcp",
      "headers": {
        "Authorization": "Bearer <your-api-key>"
      }
    }
  }
}
```

Some product-page snippets also show an `X-Spectron-Context` header. The rename from the project name **Spectron** is still partial: env vars stay `SPECTRON_*` and some headers stay `X-Spectron-*`. The MCP install page says the Bearer key alone is enough because the key is bound to one Context.

### The seven tools

From the [MCP tools reference](https://surrealdb.com/docs/agent-memory/reference/mcp-tools):

| Tool | Needs | Does |
|---|---|---|
| `remember` | `memory:write` | Persist text (or triples); reconciles (supersession / uncertainty). REST: `POST .../facts` |
| `recall` | `memory:read` | Ranked hits over facts and document passages. REST: `POST .../query` |
| `context` | `memory:read` | Markdown block for a system prompt. REST: `POST .../context` |
| `reflect` | `memory:read` (+ write if `persist`) | Synthesise patterns; optional persist. REST: `POST .../reflect` |
| `forget` | `memory:forget` | Soft-delete matches from current retrieval; `purge: true` erases. REST: `POST .../forget` |
| `upload` | `memory:write` | Ingest a document (base64); processing is async. REST: `POST .../documents` |
| `inspect` | `memory:read` | Fetch entity / trace / document by `ref`. REST: GETs under entities, traces, documents |

`remember` input (docs):

```jsonc
{
  "text": "I just got promoted to CTO.",
  "session_id": "sess_abc123",
  "scope": [["org/acme/user/alice"]],
  "labels": ["source=onboarding"],
  "infer": "full",
  "observed_at": "2026-05-12T10:00:00Z"
}
```

`infer` is `full` (default, LLM extraction), `triples` (caller-supplied, no LLM), `preview` (dry run) or `none` (literal store).

`recall` takes `query`, optional `k` (default 10, max 50), `mode` (`hybrid` | `vector` | `bm25` | `graph`), and a read **`lens`**. Writes use **`scope` / `scopes`**; an unknown field such as sending `scope` on a read is ignored without error, so a mis-named read can search everything the key can see.

Tool failures return `isError: true` with HTTP 200 on the transport. JSON-RPC `error` is for protocol faults only.

## Connect with an SDK

```bash
pip install surrealdb-memory==1.0.0b1
# or: pip install 'surrealdb[memory]'
npm i @surrealdb/memory@1.0.0-alpha.11
```

Python (`surrealdb-memory` 1.0.0b1), against a fake transport so nothing leaves the box:

```python
from surrealdb_memory import Memory

memory = Memory(
    context="your-context-id",
    endpoint="https://<your-context-host>",
    api_key="sp-...",
)
memory.remember(
    "I was just promoted to CTO.",
    infer="full",
    scopes="org/acme/user/alice",
    labels=["source=onboarding"],
)
hits = memory.recall("What is Alice's role?", k=10, mode="hybrid", lens="org/acme/user/alice")
memory.forget("anything about my previous role")          # soft
memory.forget("erase permanently", purge=True)            # permanent
```

Offline, with the real client and a stub transport, those calls became:

- `POST /api/v1/{context}/facts` with `text`, `infer`, `scopes: [["org/acme/user/alice"]]`, `labels`, and an `Idempotency-Key`
- `POST /api/v1/{context}/query` with `query`, `k`, `mode`, `lens: [["..."]]`
- `POST /api/v1/{context}/forget` with `query` (and `purge: true` only when requested)

So a plain scope string is normalised to the DNF form the wire docs describe. The transport sends `Authorization: Bearer …` from the client’s API key.

TypeScript (`@surrealdb/memory` 1.0.0-alpha.11) mirrors the same verbs (`remember`, `recall`, `forget`, `reflect`, `chat`, …) and ships OpenAPI-generated path types under `/api/v1/{context_id}/...`.

Hosted quickstart env vars still use the Spectron names:

```bash
export SPECTRON_URL="https://<your-context-host>"
export SPECTRON_CONTEXT_ID="<your-context-id>"
export SPECTRON_API_KEY="sp-..."
```

Register scope paths before scoped writes (`agent-memory scopes create …` or the Cloud admin API).

## Provenance, supersession and forget

- **Provenance.** Fact-bearing records carry structured provenance so the system can answer where a fact was learned, not only what is known ([docs](https://surrealdb.com/docs/agent-memory/mental-model/provenance-and-traceability)).
- **Supersession.** A correction replaces the current belief and keeps history. Current recall shows the new value; a known-time (`asOf`) recall can walk the chain. Cross-provenance clashes surface as **`uncertainty`** instead of a silent pick.
- **Decay.** Category-aware importance decay runs daily (`identity` does not decay; `context` facts also expire after 7 days). Decay changes importance only; it does not end a fact.
- **Forget.** Default soft-forget removes matches from current and temporal retrieval but keeps audit history; `purge: true` permanently erases. Forget needs the **`memory:forget`** grant, not only `memory:write`. Soft-forget does not block future extraction of the same topic.

## What was and wasn’t tested

**Tested offline on 2026-11-06:**

- surrealdb-memory **1.0.0b1** request shapes for remember / recall / forget / reflect / query_context against documented REST paths (stub transport, no network)
- @surrealdb/memory **1.0.0-alpha.11** package contents and OpenAPI path typings
- MCP and REST documentation for the seven tools, auth, scopes/lens and lifecycle

**Not tested:**

- a live Sandbox or paid Context (Studio signup is human)
- OAuth (this product path is Bearer-only)
- `upload` / document pipeline end-to-end
- BEAM 1M reproduction

## Related reading

For how this sits next to Mem0, LangMem, Zep and others, see [Memory layers for AI agents](comparison:agent-memory-layers). For wiring any remote MCP server into a harness, see [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server).
