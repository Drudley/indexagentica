---
name: pick-an-mcp-server
description: Choose the right MCP server for a task by shortlisting candidates from the Index Agentica directory (live REST/MCP at mcp.indexagentica.com), comparing them on remote vs local, auth method, licence, maintainer and freshness, then probing the winner's endpoint before wiring it into the client. Use when a user asks for "an MCP server for X", when you need a capability (database, browser, payments, observability, docs) you don't have, or when choosing between several MCP servers.
license: MIT
compatibility: Needs HTTPS access to mcp.indexagentica.com (no auth, no API key) and the server you probe. The scripts need bash, curl and jq. An MCP client is optional.
metadata:
  title: Pick an MCP server
  summary: A repeatable shortlist-compare-probe workflow for selecting an MCP server from Index Agentica, with two scripts that pull candidates from the live REST API and test a remote endpoint's auth without credentials.
  author: Agentica Author
  version: "1.0"
  last_verified: 2026-10-15
  published: 2026-10-15
  tags: mcp, discovery, mcp-servers, selection, oauth
  entries: indexagentica-mcp, model-context-protocol, mcp-authorization, official-mcp-registry, mcp-inspector
  related: indexagentica-lookup, connect-remote-mcp, connect-an-agent-to-a-remote-mcp-server, agent-auth-and-delegated-access, publish-an-mcp-server, database-mcp-servers, test-your-mcp-server, mcp-gateways, use-the-indexagentica-mcp-server
  sources: https://mcp.indexagentica.com/openapi.json https://mcp.indexagentica.com/.well-known/mcp/server-card.json https://indexagentica.com/api/mcp-servers.json https://indexagentica.com/schema/entry.schema.json https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization https://datatracker.ietf.org/doc/html/rfc9728
---

# Pick an MCP server

Use this skill to go from "I need an MCP server that does X" to one server that is verified, configured and working. It has three steps: **shortlist**, **compare**, **probe**. Then you hand off to the client setup.

The data comes from Index Agentica (https://indexagentica.com), a curated directory where every MCP server entry has a source link and a `last_verified` date. The live API at `https://mcp.indexagentica.com` needs no key and mirrors the static site about every 10 minutes. For general directory search (any category, guides, comparisons), use the companion skill https://indexagentica.com/skills/indexagentica-lookup/.

## 1. Shortlist

Turn the user's need into 1–3 keywords (a product name, or a capability such as `postgres`, `browser`, `payments`, `traces`). Then run:

```bash
bash scripts/shortlist.sh "postgres"        # optional 2nd arg: limit (default 10)
```

It calls `GET /search?category=mcp-servers&q=...`, then `GET /entries/<id>` for each hit, and prints a TSV table:

```
id               status  remote_endpoint               auth   license     maintainer  last_verified
neon-mcp-server  active  https://mcp.neon.tech/mcp     oauth  MIT         Neon        2026-10-02
supabase-mcp     active  https://mcp.supabase.com/mcp  oauth  Apache-2.0  Supabase    2026-10-02
```

(Real output from 2026-10-15.) Without the script:

```bash
curl -s -G https://mcp.indexagentica.com/search --data-urlencode q=postgres \
  --data-urlencode category=mcp-servers | jq -r '.results[] | [.id, .mcp_endpoint // "local"] | @tsv'
curl -s https://mcp.indexagentica.com/entries/neon-mcp-server | jq '{agent_access, license, maintainer, repo, last_verified}'
```

Over MCP, the same calls are the `search` tool (`{"query": "postgres", "category": "mcp-servers"}`) and the `get_entry` tool (`{"id": "neon-mcp-server"}`) on `https://mcp.indexagentica.com/mcp`.

If nothing matches, search without the category filter. Some vendors' MCP endpoints live on entries in `apis` or `finance-payments`. Then try the official MCP Registry (https://registry.modelcontextprotocol.io). Don't invent an endpoint.

## 2. Compare

These are the fields that matter. In the entry JSON they live under `agent_access` unless noted:

| Field | What it tells you | Prefer |
|---|---|---|
| `mcp_endpoint` | A hosted remote server (Streamable HTTP). If missing, it is local only (stdio or self-run); read `notes` and the repo for the launch command | Remote, for zero install; local, when data must stay on the machine |
| `auth` | `oauth` (browser sign-in, scoped tokens), `api-key` (a secret you must store), `none`, or `other` (read `notes`) | `oauth` for user data; `none` only for public data |
| `license` (top level) | Can you self-host or fork it? Missing means unknown | An OSI licence if you may self-host |
| `maintainer` (top level) | Who runs it. If it matches the product vendor (Neon for Neon), the server is first-party | First-party over community servers for anything with write access |
| `status` (top level) | `active`, `beta`, `deprecated`, `unknown` | `active` |
| `last_verified` (top level) | When Index Agentica last checked the sources | Re-check anything older than about 90 days |
| `notes` | Install commands, required scopes, regional endpoints | Read before configuring |

Decision rules:
- **Least privilege.** If two servers fit, pick the one with narrower scopes or a read-only mode (check `notes` and the docs).
- **Avoid passing tokens through.** Prefer OAuth servers whose tokens are issued for the MCP server itself. Don't paste a user's raw third-party token into a server's config unless its docs require that.
- **Write access needs a human.** For servers that can spend money, send messages or change production data, show the shortlist to the user and get a choice before connecting.

## 3. Probe

Before configuring the client, confirm the endpoint is alive and learn how it authenticates:

```bash
bash scripts/probe.sh https://mcp.neon.tech/mcp
```

It sends one unauthenticated MCP `initialize` POST and interprets the answer:
- **200**: the server is open. The first bytes of the reply are shown.
- **401** with `WWW-Authenticate: Bearer ... resource_metadata="..."`: OAuth per the MCP authorization spec. The script fetches the Protected Resource Metadata (RFC 9728) and prints the `resource` and `authorization_servers`. Your client will open a browser sign-in; a human may have to complete it.
- **401 without `resource_metadata`, or 403**: probably an API key or custom header. Read the docs.
- **404/405**: wrong path or not Streamable HTTP. Re-check the URL from the entry.

Real result on 2026-10-15 for Neon: `HTTP 401`, metadata at `https://mcp.neon.tech/.well-known/oauth-protected-resource/mcp`, `resource: https://mcp.neon.tech/mcp`, `authorization_servers: ["https://mcp.neon.tech"]`.

The probe sends no credentials and changes nothing on the server.

## 4. Hand off

Configure the chosen server in the user's client with the skill https://indexagentica.com/skills/connect-remote-mcp/ (Claude Code, Codex, Cursor, Gemini CLI, VS Code). For the OAuth background, see https://indexagentica.com/guides/connect-an-agent-to-a-remote-mcp-server/ and https://indexagentica.com/guides/agent-auth-and-delegated-access/.

Report back to the user:
1. The shortlist table, and why you picked the winner (the field values that decided it).
2. The probe result.
3. Anything unverified: a missing licence, a stale `last_verified`, a community maintainer.

If a server you found elsewhere is missing from Index Agentica, suggest it via https://indexagentica.com/contribute.json.
