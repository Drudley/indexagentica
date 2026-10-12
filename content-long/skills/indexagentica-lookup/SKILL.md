---
name: indexagentica-lookup
description: Search the Index Agentica directory of agent tools, MCP servers, APIs, protocols, skills, harnesses, sandboxes, evals and payment rails, plus its guides, comparisons, stacks and downloadable skills. Uses the live remote MCP server or REST API at mcp.indexagentica.com, with the static JSON API and llms.txt as a fallback. Use when you need to find, shortlist or compare resources for building or extending an AI agent, look up a tool's MCP endpoint, docs or auth method, fetch a guide or skill, or suggest a missing entry.
license: MIT
compatibility: Needs HTTPS access to mcp.indexagentica.com or indexagentica.com. An MCP client is optional; curl and jq are enough. No auth or API key.
metadata:
  title: Index Agentica lookup
  summary: Query Index Agentica through its live MCP server (search, get_entry, get_content, list_categories), its REST mirror, or the static JSON API and llms.txt, to discover agent tools, MCP servers, APIs and long-form guides, and to propose new entries.
  author: Agentica Author
  version: "1.1"
  last_verified: 2026-10-12
  published: 2026-10-02
  updated: 2026-10-12
  tags: directory, discovery, mcp, llms-txt, json-api
  entries: indexagentica-mcp, llms-txt, model-context-protocol, openapi
  related: connect-an-agent-to-a-remote-mcp-server, connect-remote-mcp
  sources: https://indexagentica.com/agents/ https://mcp.indexagentica.com/openapi.json https://mcp.indexagentica.com/.well-known/mcp/server-card.json https://github.com/Drudley/indexagentica-mcp https://indexagentica.com/openapi.json https://indexagentica.com/api/index.json https://indexagentica.com/llms.txt https://indexagentica.com/contribute.json https://indexagentica.com/schema/entry.schema.json
---

# Index Agentica lookup

Index Agentica (https://indexagentica.com) is an agent-first directory of agent tools, MCP servers, APIs and protocols, plus long-form guides, comparisons, stacks and downloadable Agent Skills. It needs no auth, works without JavaScript and has open CORS. Crawling is explicitly allowed. Every entry is one JSON object validated against https://indexagentica.com/schema/entry.schema.json.

There are three ways in. All are read-only and need no key:

1. **Remote MCP server** at `https://mcp.indexagentica.com/mcp`, the best choice if your harness speaks MCP.
2. **REST mirror** on the same host (`/search`, `/entries/{id}`, `/content`, `/categories`), for ranked search with plain HTTP.
3. **Static files** on `https://indexagentica.com` (`llms.txt`, `/api/*.json`, `/entries/<id>.md`). These are the fallback: plain files on GitHub Pages with no rate limit.

All three serve the same published data. The MCP server and REST mirror refresh from `https://indexagentica.com/api/index.json` about every 10 minutes, so they can lag the static files slightly right after a deploy.

## 1. MCP server

- Endpoint: `https://mcp.indexagentica.com/mcp`, Streamable HTTP, `POST` only (a `GET` returns 405, so there is no SSE stream). It is stateless: no `Mcp-Session-Id` is issued, so no session handling is needed.
- No auth (`authentication.required: false` in the server card at https://mcp.indexagentica.com/.well-known/mcp/server-card.json).
- Protocol versions listed in the server card: `2026-07-28`, `2025-11-25`, `2025-06-18`, `2025-03-26`.
- Rate limit: 120 requests per minute per IP. Over the limit you get HTTP 429 with `Retry-After`. Every response carries `x-ratelimit-limit: 120` and `x-ratelimit-period: 60`.
- Health check: `https://mcp.indexagentica.com/health` returns `{"ok": true, "version": "..."}`.

Client config (Claude Code `.mcp.json` and similar; Claude Code requires `"type": "http"` for remote servers):

```json
{
  "mcpServers": {
    "indexagentica": {
      "type": "http",
      "url": "https://mcp.indexagentica.com/mcp"
    }
  }
}
```

Other clients use their own name for Streamable HTTP. Cline, for example, uses `"type": "streamableHttp"`, and some clients accept just `"url"`. With the Claude Code CLI: `claude mcp add --transport http indexagentica https://mcp.indexagentica.com/mcp`.

### Tools

All four tools are annotated `readOnlyHint: true`, `idempotentHint: true`, `destructiveHint: false`. Each returns the same JSON twice: as a text content block and as `structuredContent`. `get_entry` wraps its result as `{"entry": {...}}` and `get_content` as `{"content": {...}}`; `search` and `list_categories` are not wrapped.

| Tool | Arguments | Returns |
|---|---|---|
| `search` | `query` (string, max 200 chars, may be empty if a filter is given), `type` (`entry` / `guide` / `comparison` / `stack` / `skill` / `all`, default `all`), `category` (entry category slug, implies `type: entry`), `tags` (array of up to 10 tag slugs; **all** must match), `limit` (1-50, default 10) | `{query, type, tags, limit, total, results[]}`. Each result has `type`, `id`, `name`, `summary`, `url`, `tags`, `score` and `links` (`html`, `markdown`, `json`, `source`; skills also have `skill_md` and `zip`). Entry results also have `category`, `status` and, when known, `pricing` |
| `get_entry` | `id` (kebab-case entry id) | `{entry}`: the full entry, with `name`, `category`, `summary`, `description`, `url`, `repo`, `docs`, `tags`, `license`, `pricing`, `status`, `agent_access`, `related`, `sources`, dates, `links`, and `longform` (the guides and comparisons that reference it) |
| `get_content` | `type` (`guide` / `comparison` / `stack` / `skill`), `id`, optional `include_html` (boolean, default false) | `{content}`: metadata (`title`, `summary`, `author`, `tags`, dates, `entries_detail`, `related`, `sources`, `links`) plus `markdown` with scheme links resolved to absolute URLs. Comparisons add the table (criteria, rows, verdict). Stacks add the use case and components. Skills add `skill_md` (the full SKILL.md) and `skill.files`, `links.zip`, `links.skill_md` |
| `list_categories` | none | `{total, generated, categories[]}`, each with `slug`, `name`, `description`, `count`, `html`, `json` |

An unknown id returns a tool result with `isError: true` and a JSON text like `{"error": "no entry with id \"...\"", "suggestions": [...]}`. Check `suggestions` before giving up.

Raw JSON-RPC, if you have no MCP client:

```bash
curl -s https://mcp.indexagentica.com/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -H 'mcp-protocol-version: 2025-06-18' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search","arguments":{"query":"browser automation","type":"entry","limit":5}}}' \
  | jq '.result.structuredContent.results[] | {id, category, summary}'
```

Typical flow: `search` to shortlist, then `get_entry` for an entry or `get_content` for a guide, comparison, stack or skill. Use `list_categories` only when you need the slugs. They are also listed in the `search` tool description.

## 2. REST mirror

Same host, same data, described by https://mcp.indexagentica.com/openapi.json (OpenAPI 3.1). Same rate limit. JSON responses use `cache-control: public, max-age=300`.

| Request | Parameters | Response |
|---|---|---|
| `GET /search` | `q` (max 200 chars), `type` (`entry` / `guide` / `comparison` / `stack` / `skill` / `all`), `category`, `tags` (**comma-separated**; all must match), `limit` (1-50, default 10). At least one of `q`, `type`, `category`, `tags` is required, or you get a 400 | Same shape as the MCP `search` result |
| `GET /entries/{id}` | | The entry object itself (not wrapped in `entry`) |
| `GET /entries` | | `{total, ids[]}`: every entry id, with no other fields (not in the OpenAPI document) |
| `GET /content` | `type` (optional) | `{total, generated, items[]}`: metadata only (`type`, `id`, `name`, `summary`, `url`, `tags`, `author`, `last_verified`, `entries`, `links`) |
| `GET /content/{type}/{id}` | `include_html` (boolean) | The item object itself (not wrapped in `content`) |
| `GET /categories` | | Same as `list_categories` |

Errors are JSON: `{"error": {"status": 404, "code": "not_found", "message": "...", "suggestions": []}}`. A bad parameter gives a 400 with `code: "bad_request"`.

```bash
# Sandboxes in the infrastructure category
curl -s 'https://mcp.indexagentica.com/search?category=infrastructure&tags=sandbox&limit=20' | jq -r '.results[] | "\(.id)\t\(.summary)"'

# Long-form only: guides about MCP
curl -s 'https://mcp.indexagentica.com/search?q=mcp&type=guide' | jq -r '.results[] | "\(.id)\t\(.links.html)"'

# One comparison, as markdown
curl -s https://mcp.indexagentica.com/content/comparison/code-sandboxes | jq -r '.markdown'
```

## 3. Static fallback (no rate limit)

Use these when the MCP host is unreachable or returns 429, or when you want the whole index in one fetch.

| Need | Fetch | Notes |
|---|---|---|
| Skim everything cheaply | https://indexagentica.com/llms.txt | About 57 KB of markdown: one line per entry and long-form item, grouped by section |
| Everything in full | https://indexagentica.com/llms-full.txt | About 400 KB, so only load it when you need it |
| Whole index as JSON | https://indexagentica.com/api/index.json | About 400 KB: `counts`, `categories[]`, `entries[]` |
| One category | `https://indexagentica.com/api/<category>.json` | Has `category`, `count`, `entries[]` |
| Category list | https://indexagentica.com/api/categories.json | Slugs, names, counts |
| One entry | `https://indexagentica.com/api/entries/<id>.json` or `https://indexagentica.com/entries/<id>.md` | The `.md` version is the most compact for reading |
| Long-form items | https://indexagentica.com/api/longform.json, `https://indexagentica.com/api/longform/<route>/<id>.json`, `https://indexagentica.com/<route>/<id>.md` | `<route>` is `guides`, `compare`, `stacks` or `skills` |
| A skill to install | `https://indexagentica.com/skills/<id>/SKILL.md` or `https://indexagentica.com/skills/<id>.zip` | The zip unpacks to `<id>/...` |
| API description | https://indexagentica.com/openapi.json | OpenAPI 3.1 for the static files |

Static files are served with `cache-control: max-age=600` and an `ETag`. Cache them, and send `If-None-Match` when you refetch.

Keyword search over the static index with jq:

```bash
curl -s https://indexagentica.com/api/index.json | jq -r --arg q "sandbox" '
  .entries[] | select((.id+" "+.name+" "+.summary+" "+((.tags//[])|join(" "))) | ascii_downcase | contains($q))
  | "\(.id)\t\(.category)\t\(.url)"'
```

Remote MCP servers in the directory and their auth method:

```bash
curl -s https://indexagentica.com/api/index.json | jq -r '.entries[] | select(.agent_access.mcp_endpoint) | "\(.id)\t\(.agent_access.mcp_endpoint)\t\(.agent_access.auth // "unknown")"'
```

Without a shell or an MCP client, fetch `llms.txt`, find candidate ids in the relevant section, then fetch `/entries/<id>.md` for each.

## Categories and entry fields

Category slugs: `skills`, `harnesses`, `mcp-servers`, `tools`, `protocols`, `apis`, `information`, `finance-payments`, `directories`, `infrastructure` (hosting and sandboxes), `evals-observability`.

Entry fields: `id`, `name`, `category`, `summary` (one neutral line), `description` (markdown), `url`, `repo`, `docs`, `tags[]`, `license`, `pricing` (`free` / `freemium` / `paid` / `open-source` / `unknown`), `status` (`active` / `beta` / `deprecated` / `unknown`), `agent_access` (`llms_txt`, `openapi`, `mcp_endpoint`, `auth`, `notes`), `related[]` (other entry ids), `sources[]` (the URLs the facts were checked against), `last_verified`, and `links` (`html`, `markdown`, `json`, `source`). Optional fields are left out when unverified, so a missing field means unknown, not "no".

## How to use results well

- Shortlist from `summary`, then check the entry's `docs` or `sources` before you recommend anything. The directory is a starting point, not the final authority. Check `last_verified`.
- Prefer `status: active`. Flag `beta` and `deprecated` entries.
- If the user wants something an agent can call directly, look at `agent_access` (MCP endpoint, OpenAPI, llms.txt, auth).
- Before you write your own comparison, look for one that already exists with `search` and `type: comparison`.
- Cite entries by their `links.html` URL, `https://indexagentica.com/entries/<id>/`.

## Usage stats

Public usage counts are at https://mcp.indexagentica.com/stats as JSON (alias `/v1/usage`, cached 10 minutes). They cover site page views, outbound clicks, skill downloads, MCP tool calls per tool, REST requests and an agent/human split, for the last 24 hours, the last 7 days and all time. The agent/human split is a User-Agent heuristic.

## Suggest a missing entry

Read https://indexagentica.com/contribute.json for the rules and template. There are two paths, and a human merges both:

1. A pull request adding `content/<category>/<id>.json` to https://github.com/Drudley/indexagentica. Run `node scripts/validate.mjs` first.
2. A "New entry" issue (title `[New entry]: <name>`), using the issue body template in `contribute.json`.

Summaries must be neutral (10-200 characters). List your verification URLs in `sources`, and say that you are an agent and who you act for. Only open an issue or PR when your user has asked you to.
