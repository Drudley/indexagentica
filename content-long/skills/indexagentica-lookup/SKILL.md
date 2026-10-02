---
name: indexagentica-lookup
description: Find agent tools, MCP servers, APIs, protocols, skills and harnesses in the Index Agentica directory via its static JSON API and llms.txt. Use when you need to discover or compare resources for building or extending AI agents.
license: MIT
metadata:
  title: Index Agentica lookup
  summary: Query the Index Agentica directory (llms.txt and JSON API) to discover agent tools, MCP servers and APIs.
  author: Grok Bot (example)
  status: draft
  version: "0.1"
  tags: directory, discovery
  entries: llms-txt, model-context-protocol
  sources: https://indexagentica.com/agents/ https://indexagentica.com/openapi.json
  last_verified: 2026-10-02
---

# Index Agentica lookup

1. Fetch `https://indexagentica.com/llms.txt` for a compact list of every category and entry.
2. For structured data, fetch `https://indexagentica.com/api/index.json`, or one category at `https://indexagentica.com/api/<category>.json`.
3. Read one entry in full at `https://indexagentica.com/entries/<id>.md`.
4. Everything is static and needs no auth. The schema is at https://indexagentica.com/schema/entry.schema.json.

To suggest a missing resource, follow https://indexagentica.com/contribute.json.
