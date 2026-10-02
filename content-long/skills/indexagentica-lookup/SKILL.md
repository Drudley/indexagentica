---
name: indexagentica-lookup
description: Search the Index Agentica directory of agent tools, MCP servers, APIs, protocols, skills, harnesses, sandboxes and payment rails through its static JSON API, llms.txt and per-entry markdown. Use when you need to find, shortlist or compare resources for building or extending an AI agent, look up a tool's MCP endpoint, docs or auth method, or suggest a missing entry.
license: MIT
compatibility: Needs HTTPS access to indexagentica.com. curl and jq are optional but make filtering easy. No auth or API key.
metadata:
  title: Index Agentica lookup
  summary: Query the Index Agentica directory (llms.txt, JSON API, per-entry JSON and markdown) to discover agent tools, MCP servers and APIs, and to propose new entries.
  author: Agentica Author
  version: "1.0"
  last_verified: 2026-10-02
  published: 2026-10-02
  tags: directory, discovery, llms-txt, json-api
  entries: llms-txt, model-context-protocol, openapi
  related: connect-an-agent-to-a-remote-mcp-server, connect-remote-mcp
  sources: https://indexagentica.com/agents/ https://indexagentica.com/openapi.json https://indexagentica.com/api/index.json https://indexagentica.com/llms.txt https://indexagentica.com/contribute.json https://indexagentica.com/schema/entry.schema.json
---

# Index Agentica lookup

Index Agentica (https://indexagentica.com) is a static, agent-first directory with no auth, no JavaScript and open CORS. Crawling is explicitly allowed. Every entry is one JSON object validated against https://indexagentica.com/schema/entry.schema.json.

## Pick the right endpoint

| Need | Fetch | Size, notes |
|---|---|---|
| Skim everything cheaply | https://indexagentica.com/llms.txt | About 50 KB of markdown: one line per entry, grouped by category |
| Everything in full, for context | https://indexagentica.com/llms-full.txt | About 220 KB, so only load it when you need it |
| Structured search | https://indexagentica.com/api/index.json | About 340 KB JSON: `counts`, `categories[]`, `entries[]` |
| One category | `https://indexagentica.com/api/<category>.json` | Same shape, filtered. Has `category`, `count`, `entries[]` |
| Category list | https://indexagentica.com/api/categories.json | Slugs, names, counts |
| One entry | `https://indexagentica.com/api/entries/<id>.json` or `https://indexagentica.com/entries/<id>.md` | The `.md` version is the most compact for reading |
| API description | https://indexagentica.com/openapi.json | OpenAPI 3.1 |

Category slugs: `skills`, `harnesses`, `mcp-servers`, `tools`, `protocols`, `apis`, `information`, `finance-payments`, `directories`, `infrastructure` (hosting and sandboxes), `evals-observability`.

Responses are served with `cache-control: max-age=600` and an `ETag`. Cache them, and send `If-None-Match` when you refetch.

## Entry fields you will use

`id`, `name`, `category`, `summary` (one neutral line), `description` (markdown), `url`, `repo`, `docs`, `tags[]`, `license`, `pricing` (`free` / `freemium` / `paid` / `open-source` / `unknown`), `status` (`active` / `beta` / `deprecated` / `unknown`), `agent_access` (`llms_txt`, `openapi`, `mcp_endpoint`, `auth`, `notes`), `related[]` (other entry ids), `sources[]` (the URLs the facts were checked against), `last_verified`, and `links` (`html`, `markdown`, `json`). Optional fields are omitted when unverified. A missing field means unknown, not "no".

## Recipes

Keyword search over id, name, summary and tags:

```bash
curl -s https://indexagentica.com/api/index.json | jq -r --arg q "sandbox" '
  .entries[] | select((.id+" "+.name+" "+.summary+" "+((.tags//[])|join(" "))) | ascii_downcase | contains($q))
  | "\(.id)\t\(.category)\t\(.url)"'
```

Everything with a given tag:

```bash
curl -s https://indexagentica.com/api/index.json | jq -r '.entries[] | select((.tags//[]) | index("x402")) | "\(.id)\t\(.summary)"'
```

Remote MCP servers and their auth method:

```bash
curl -s https://indexagentica.com/api/index.json | jq -r '.entries[] | select(.agent_access.mcp_endpoint) | "\(.id)\t\(.agent_access.mcp_endpoint)\t\(.agent_access.auth // "unknown")"'
```

Read one entry, then follow its `related` ids:

```bash
curl -s https://indexagentica.com/entries/e2b.md
curl -s https://indexagentica.com/api/entries/e2b.json | jq -r '.related[]?'
```

Without a shell, fetch `llms.txt`, find candidate ids in the relevant `## <Category>` section, then fetch `/entries/<id>.md` for each.

## How to use results well

- Shortlist from `summary`, then confirm against the entry's `docs` or `sources` before you recommend anything. The directory is a starting point, not the final authority. Check `last_verified`.
- Prefer `status: active`. Flag `beta` and `deprecated` entries.
- When the user wants something an agent can call directly, look at `agent_access` (MCP endpoint, OpenAPI, llms.txt, auth).
- Cite entries by their `links.html` URL, `https://indexagentica.com/entries/<id>/`.

## MCP server (when deployed)

A read-only remote MCP server with `search(query, category?, tags?, limit?)`, `get_entry(id)` and `list_categories()` is planned at `https://mcp.indexagentica.com/mcp` (Streamable HTTP, no auth, about 120 requests per minute per IP). As of 2026-10-02 it is **not live**. Check `https://mcp.indexagentica.com/health` first and use the static API above if it doesn't respond.

## Suggest a missing entry

Read https://indexagentica.com/contribute.json for the rules and template. There are two paths, both merged by a human:

1. A pull request adding `content/<category>/<id>.json` to https://github.com/Drudley/indexagentica. Run `node scripts/validate.mjs` first.
2. A "New entry" issue (title `[New entry]: <name>`), using the issue body template in `contribute.json`.

Summaries must be neutral (10-200 characters). List your verification URLs in `sources`, and say that you are an agent and who you act for. Only open an issue or PR when your user has asked you to.
