---
id: use-the-indexagentica-mcp-server
type: guide
title: "Use the Index Agentica MCP server: the five real tools, their schemas and the mistakes to avoid"
summary: "A reference for the five tools that mcp.indexagentica.com actually exposes (search, get_entry, get_content, list_categories and request_listing), with input schemas, live example calls and responses, the matching REST endpoints, and the wrong tool names and arguments that clients send most often."
description: "Some clients call the Index Agentica MCP server with tool names it does not have, such as search_entries, get_guide or fetch. This guide lists the server's real tools, taken from a live tools/list call and the server source on 2026-10-24. For each tool it gives the input schema, a raw JSON-RPC example with the real response, and the REST equivalent. It then lists the common mistakes and the exact error each one returns. Every request shown here was run against the live server on 2026-10-24. The only exception is a successful request_listing call, which writes to a public queue and was not made."
author: Agentica Author
difficulty: beginner
time_estimate: 15 min
prerequisites:
  - "curl, or any MCP client that supports remote Streamable HTTP servers"
  - "Optional: Node.js 20 or later to run the SDK example"
tags: [mcp, index-agentica, api, rest, json-rpc, tools, reference]
entries: [indexagentica-mcp, model-context-protocol, mcp-typescript-sdk, mcp-inspector, llms-txt, openapi]
sources:
  - title: Index Agentica MCP server source and README (Drudley/indexagentica-mcp)
    url: https://github.com/Drudley/indexagentica-mcp
    accessed: 2026-10-24
  - title: Index Agentica MCP server card
    url: https://mcp.indexagentica.com/.well-known/mcp/server-card.json
    accessed: 2026-10-24
  - title: Index Agentica REST API OpenAPI document
    url: https://mcp.indexagentica.com/openapi.json
    accessed: 2026-10-24
  - title: Index Agentica public usage stats
    url: https://mcp.indexagentica.com/v1/usage
    accessed: 2026-10-24
  - title: "MCP specification 2025-11-25, Tools (tools/list, tools/call, error handling)"
    url: https://modelcontextprotocol.io/specification/2025-11-25/server/tools
    accessed: 2026-10-24
  - title: "MCP specification 2025-11-25, Streamable HTTP transport"
    url: https://modelcontextprotocol.io/specification/2025-11-25/basic/transports
    accessed: 2026-10-24
  - title: MCP TypeScript SDK (modelcontextprotocol/typescript-sdk)
    url: https://github.com/modelcontextprotocol/typescript-sdk
    accessed: 2026-10-24
related: [indexagentica-lookup, connect-an-agent-to-a-remote-mcp-server, connect-remote-mcp, test-your-mcp-server, pick-an-mcp-server, publish-an-mcp-server]
last_verified: 2026-10-24
published: 2026-10-24
---

The [Index Agentica MCP server](entry:indexagentica-mcp) at `https://mcp.indexagentica.com/mcp` has exactly **five tools**:

| Tool | What it does | Writes anything? |
|---|---|---|
| `search` | Ranked search across entries, guides, comparisons, stacks and skills | No (`readOnlyHint: true`) |
| `get_entry` | One directory entry by id, with its long-form backlinks | No (`readOnlyHint: true`) |
| `get_content` | One guide, comparison, stack or skill by type and id, with its full Markdown | No (`readOnlyHint: true`) |
| `list_categories` | The 11 entry categories and their counts | No (`readOnlyHint: true`) |
| `request_listing` | Adds a missing tool or service to the public request queue | **Yes** (`readOnlyHint: false`, `idempotentHint: false`) |

There are no other tools. Names such as `search_entries`, `get_guide`, `fetch` or `list_entries` don't exist on this server. The server's public usage stats show why that matters: in the 7 days before 2026-10-24, 25 of 89 `tools/call` requests were bucketed as `unknown_tool` ([/v1/usage](https://mcp.indexagentica.com/v1/usage), generated 07:08 CEST). Part of that count is a stats bug, explained under "What the usage numbers show" below.

If you're an agent rather than a person, the [indexagentica-lookup skill](skill:indexagentica-lookup) is the short version of this page. For connecting a client in the first place, see [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server).

## The basics

- **Endpoint:** `POST https://mcp.indexagentica.com/mcp` (Streamable HTTP). `GET` and `DELETE` return 405 because there are no sessions and no server-to-client stream.
- **Auth:** none. The server card says `"authentication": {"required": false}`.
- **Protocol versions:** the server card lists `2026-07-28`, `2025-11-25`, `2025-06-18` and `2025-03-26`.
  - Under the three older versions, `initialize` works as usual, and `tools/list` and `tools/call` work with or without it.
  - Under `2026-07-28`, the server is stateless. `initialize` returns `-32601 Method not found` with HTTP 404, `server/discover` replaces it, and every request carries the version in `params._meta["io.modelcontextprotocol/protocolVersion"]` plus the `MCP-Protocol-Version` and `Mcp-Method` headers. A `tools/call` also carries `Mcp-Name`.
  - If the headers don't match the body, the request fails with `-32020`. For example, `Mcp-Name: search` on a `get_entry` call returned HTTP 400 with "Header mismatch: Mcp-Name header 'search' does not match body value 'get_entry'".
- **Rate limit:** 120 requests per 60 seconds per client (`x-ratelimit-limit: 120`, `x-ratelimit-period: 60`). `request_listing` has its own stricter limit (see below).
- **Freshness:** the server reads the site's published JSON and caches it for 10 minutes, so new content shows up within about 10 minutes of a site deploy.
- **Response shape:** every tool returns `structuredContent` and the same JSON again as one `text` content block, so clients that ignore `structuredContent` still get the data. Tool-level problems come back as a normal result with `isError: true` and `{"error": "..."}` in the text, not as JSON-RPC errors.

All the examples below use the `2025-11-25` header so they work as single curl calls:

```bash
M=https://mcp.indexagentica.com/mcp
call() { curl -s "$M" -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-11-25' -d "$1"; }

call '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

`tools/list` returned the five names above in this order: `search, get_entry, get_content, list_categories, request_listing`. Use `tools/list` as the source of truth, not this page, because the schema can change.

## search

Searches entries and long-form content and ranks the results. Exact id or name matches, whole-word matches and leading-word matches in the name rank above hits that only match the summary or tags.

| Argument | Type | Notes |
|---|---|---|
| `query` | string, max 200 | Free text. The argument is `query`, not `q`. |
| `type` | `entry`, `guide`, `comparison`, `stack`, `skill` or `all` | Default `all` |
| `category` | category slug | Only for entries. It implies `type: entry`. |
| `tags` | array of strings, max 10 | A result must have all of them. |
| `limit` | integer 1–50 | Default 10 |

You have to give at least one of `query`, `type`, `category` or `tags`. The schema sets `additionalProperties: false`.

```bash
call '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search","arguments":{"query":"sandbox","type":"comparison","limit":2}}}'
```

Real response (`structuredContent`, trimmed after the first result):

```json
{
  "query": "sandbox", "type": "comparison", "tags": [], "limit": 2, "total": 5,
  "results": [{
    "type": "comparison",
    "id": "self-hosted-agent-sandboxes",
    "name": "Self-hosted sandboxes for agents compared",
    "summary": "Six ways to isolate agent-run code on hardware you control (...)",
    "url": "https://indexagentica.com/compare/self-hosted-agent-sandboxes/",
    "tags": ["sandbox", "self-hosted", "code-execution", "..."],
    "author": "Agentica Author",
    "last_verified": "2026-10-20",
    "entries": ["opensandbox", "aio-sandbox", "..."],
    "score": 12,
    "links": {
      "html": "https://indexagentica.com/compare/self-hosted-agent-sandboxes/",
      "markdown": "https://indexagentica.com/compare/self-hosted-agent-sandboxes.md",
      "json": "https://indexagentica.com/api/longform/compare/self-hosted-agent-sandboxes.json",
      "source": "https://github.com/Drudley/indexagentica/blob/main/content-long/compare/self-hosted-agent-sandboxes.md"
    }
  }]
}
```

The fields differ by result type:

- **Entry results** carry `category`, `url` (the project's own site), `status`, `pricing` and `tags`. For example, `{"query":"browser automation","type":"entry"}` returned `agent-browser` with `"category":"tools"`, `"status":"active"` and `"pricing":"open-source"`.
- **Long-form results** carry `author`, `last_verified` and `entries`.
- **The response** echoes `category` only when you pass it.

## get_entry

| Argument | Type | Notes |
|---|---|---|
| `id` | string, kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), max 80 | Required |

```bash
call '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_entry","arguments":{"id":"playwright"}}}'
```

The response is `{"entry": {...}}`. Besides `id`, `name`, `category`, `summary`, `url`, `repo`, `tags`, `license`, `pricing`, `status`, `related`, `sources`, `added`, `updated`, `last_verified`, `submitted_by` and `maintainer`, an entry includes:

- `longform`: every guide, comparison, stack or skill that references the entry, each with `type`, `id`, `title`, `url` and `json`. This is the fastest way to go from a tool to the write-ups about it.
- `links`: `html`, `markdown`, `json` and `source`.

An id that doesn't exist is a tool error with suggestions, not a protocol error:

```json
{"error":"no entry with id \"github-mcp\"","suggestions":["github-mcp-server","github-mcp-registry","mcp-reference-servers","awesome-mcp-servers","deepwiki-mcp"]}
```

## get_content

| Argument | Type | Notes |
|---|---|---|
| `type` | `guide`, `comparison`, `stack` or `skill` | Required. Singular. There is no `entry` type here. |
| `id` | kebab-case string | Required |
| `include_html` | boolean | Default `false`. Adds rendered HTML. |

```bash
call '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_content","arguments":{"type":"skill","id":"connect-remote-mcp"}}}'
```

The response is `{"content": {...}}`. For this skill, the live keys were:

`type, id, title, summary, author, tags, published, last_verified, entries, links, status, skill, entries_detail, related, sources, front_matter, markdown, skill_md`

The keys vary by type:

- **Guides** add `difficulty`, `time_estimate` and `prerequisites`.
- **Comparisons** add a `comparison` object with subjects, criteria, rows and verdict.
- **Stacks** add `stack`.
- **Skills** add `skill_md` (the raw `SKILL.md`) and two download links: `links.skill_md` and `links.zip`, both under `https://mcp.indexagentica.com/skills/`.
- **`entries_detail`** resolves every entry id the piece references.

## list_categories

It takes no arguments. Pass `{}` or leave `arguments` out.

```bash
call '{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"list_categories","arguments":{}}}'
```

It returns `{total, generated, categories: [{slug, name, description, count, html, json}]}`. On 2026-10-24, `total` was 433, across these slugs:

`skills` (24), `harnesses` (49), `mcp-servers` (89), `tools` (62), `protocols` (24), `apis` (18), `information` (37), `finance-payments` (47), `directories` (23), `infrastructure` (26) and `evals-observability` (34).

## request_listing (writes to a public queue)

This is the only tool with side effects. It adds a request to the public queue at [indexagentica.com/requested/](https://indexagentica.com/requested/), where the Curator checks it and lists, merges or rejects it. **Call it only when a user actually wants something added and `search` has confirmed it isn't already listed.**

| Argument | Type | Notes |
|---|---|---|
| `wanted` | string, 1–120 | Required. The name of the missing tool or service. |
| `category` | category slug or `other` | Required |
| `url` | absolute http(s) URL, max 300 | Optional |
| `reason` | string, max 500 | Optional |
| `requester` | string, max 60 | Optional. Shown publicly. |

The server rejects unknown fields and control characters. A request whose name matches one already in the queue is merged into it as a vote (`merged: true`, `vote_counted`) instead of creating a duplicate. The response is `{ok, id, merged, vote_counted, request: {..., status}, note, list}`, where `status` is one of `pending`, `verified`, `listed` or `rejected`. The limit is 5 requests per hour and 20 per day per client. Over the limit, you get a `rate_limited` error with `retry_after` in seconds.

A successful call wasn't made for this guide, because it would have added a real public request. This invalid call shows the error shape, and it writes nothing:

```bash
call '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"request_listing","arguments":{"wanted":"x"}}}'
# result: {"isError":true, "content":[{"type":"text","text":"{\"error\":\"category is required\",\"code\":\"bad_request\"}"}]}
```

## REST equivalents

The same data is available without MCP on the same host. These are useful for scripts and for clients that can only make HTTP requests. The [OpenAPI document](https://mcp.indexagentica.com/openapi.json) describes them all.

| MCP | REST |
|---|---|
| `search` | `GET /search?q=&type=&category=&tags=a,b&limit=` (here it **is** `q`, and `tags` is comma-separated) |
| `get_entry` | `GET /entries/{id}` (`.json` suffix optional). `GET /entries` lists all ids. |
| `get_content` | `GET /content/{type}/{id}?include_html=1`. `GET /content?type=skill` lists items. |
| `list_categories` | `GET /categories` |
| `request_listing` | `POST /v1/requests` with the same JSON body (201 when new, 200 when merged). `GET /v1/requests?status=&limit=` reads the queue. |
| — | `GET /skills/{id}.zip`, `GET /skills/{id}/SKILL.md` (302 to the file), `GET /.well-known/mcp/server-card.json`, `GET /stats` (alias `/v1/usage`), `GET /health` |

REST responses aren't wrapped in `{entry}` or `{content}`. `/entries/playwright` returns the entry object itself. REST errors look like `{"error": {"status", "code", "message"}}`, with `code` set to `bad_request`, `not_found`, `method_not_allowed`, `rate_limited` or `upstream_error`. A 404 for an entry includes `suggestions`, just like the tool does. Successful reads are sent with `cache-control: public, max-age=300`.

The site also publishes static files that need no server at all: [llms.txt](https://indexagentica.com/llms.txt) (about 106 KB on 2026-10-24), [llms-full.txt](https://indexagentica.com/llms-full.txt) (about 1.1 MB) and [api/index.json](https://indexagentica.com/api/index.json) (about 830 KB). See the [llms.txt](entry:llms-txt) entry for the format.

## Common mistakes and what they return

Every row was sent to the live server on 2026-10-24.

| You sent | What happens | Fix |
|---|---|---|
| Tool `search_entries`, `list_entries`, `find` | JSON-RPC error `-32602`, "Unknown tool: search_entries. Valid tools: search, get_entry, get_content, list_categories, request_listing. Did you mean "search"?" | Use `search` |
| Tool `get_guide`, `get_comparison`, `get_skill` | `-32602`, suggestion `get_content` | `get_content` with `type: "guide"` and so on |
| Tool `fetch`, `get` | `-32602`, suggestion `get_entry` | `get_entry` for entries, or the `links.markdown` URL for pages |
| Tool `mcp__indexagentica__search` or `indexagentica_search` | `-32602`, suggestion `search` | Send the bare name. Prefixes like this are how some clients label MCP tools locally. They aren't the server's tool names. |
| `search` with `{"q": "sandbox"}` | `isError`: "provide a query, a type, a category or tags" | The MCP argument is `query`. `q` is only for REST. |
| `search` with `"tags": "mcp,auth"` | `isError`: "tags must be an array of strings" | `"tags": ["mcp", "auth"]` (comma-separated only in REST) |
| `search` with `"category": "sandboxes"` | `isError`: unknown category, followed by the 11 valid slugs | Call `list_categories` first |
| `search` with `type: "guide"` plus a `category` | `isError`: "category applies to directory entries only; use it with type entry (or omit type)" | Categories only apply to entries. For guides, use `query` or `tags`. |
| `get_content` with `type: "entry"` | `isError`: "type is required: one of guide, comparison, stack, skill (use get_entry for directory entries)" | `get_entry` |
| `get_content` with `type: "guides"` | `isError`: "type is required: one of guide, comparison, stack, skill" | Types are singular |
| `get_entry` with a guessed id | `isError` with `suggestions` | Pick from the suggestions or `search` first |
| `initialize` under `2026-07-28` | HTTP 404, `-32601 Method not found: initialize` | Under the stateless version, skip `initialize`, or use `server/discover` |

Unknown tool names are a **protocol** error (`-32602` with HTTP 200), as the MCP Tools specification prescribes, so many SDKs throw instead of returning a result. Since 2026-10-24, the error's `data` includes `requested`, `valid_tools` and, when the server can guess, `suggestion`. A client or agent can read `data.suggestion` and retry once. The server never runs a suggested tool on its own.

## Call it from code

This script (`ia-client.mjs`, in a folder with `"type": "module"` in package.json) uses the [MCP TypeScript SDK](entry:mcp-typescript-sdk) v2 client (`@modelcontextprotocol/client` 2.3.1). It lists the tools, runs a search, shows a missing-id tool error and catches the unknown-tool exception:

```js
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

const client = new Client({ name: "ia-example", version: "1.0.0" }, { versionNegotiation: { mode: "auto" } });
await client.connect(new StreamableHTTPClientTransport(new URL("https://mcp.indexagentica.com/mcp")));

const { tools } = await client.listTools();
console.log(tools.map((t) => t.name).join(", "));

const found = await client.callTool({ name: "search", arguments: { query: "sandbox", type: "comparison", limit: 3 } });
for (const r of found.structuredContent.results) console.log(r.type, r.id, r.score);

const missing = await client.callTool({ name: "get_entry", arguments: { id: "github-mcp" } });
console.log(missing.isError, JSON.parse(missing.content[0].text).suggestions.slice(0, 2));

try {
  await client.callTool({ name: "search_entries", arguments: { query: "sandbox" } });
} catch (e) {
  console.log("unknown tool throws:", e.message);
}
await client.close();
```

Output on 2026-10-24 with Node.js 22.23.2:

```text
search, get_entry, get_content, list_categories, request_listing
comparison self-hosted-agent-sandboxes 12
comparison code-sandboxes 10
comparison coding-agent-harnesses 4
true [ 'github-mcp-server', 'github-mcp-registry' ]
unknown tool throws: Unknown tool: search_entries. Valid tools: search, get_entry, get_content, list_categories, request_listing. Did you mean "search"? Call tools/list for their input schemas.
```

For interactive poking, [MCP Inspector](entry:mcp-inspector) works against the same URL. [Test your MCP server](guide:test-your-mcp-server) covers its CLI mode.

## What the usage numbers show

`/v1/usage` publishes `tool_calls_by_tool` for the last 24 hours, the last 7 days and all time. It reports only the server's own tool names, and everything else is counted as `unknown_tool`, so the invented names themselves aren't public. On 2026-10-24 at 07:08 CEST, the stats read:

| Window | Calls | `unknown_tool` | `search` | `list_categories` | `get_entry` | `get_content` |
|---|---|---|---|---|---|---|
| Last 24 h | 25 | 8 | 7 | 4 | 3 | 3 |
| Last 7 days | 89 | 25 | 25 | 27 | 6 | 6 |
| All time | 263 | 39 | 60 | 91 | 35 | 38 |

Read these numbers with one caveat. Until a server change on 2026-10-24, the stats code left `request_listing` out of its list of known tools, so real `request_listing` calls were also counted as `unknown_tool`. The `unknown_tool` figures above therefore include some valid calls. The same change made the unknown-tool error list the valid tools and suggest the closest one, as shown in the table above.

## Checklist

- Call `tools/list` once and use those five names exactly.
- Use `query` in MCP and `q` in REST. Pass tags as an array in MCP and as a comma-separated string in REST.
- Use `get_entry` for directory entries and `get_content` with a singular `type` for everything else.
- Treat `isError: true` as "fix the arguments", and `-32602` as "fix the tool name". Read `data.suggestion`.
- Call `request_listing` only when a user wants something added and `search` found nothing.
