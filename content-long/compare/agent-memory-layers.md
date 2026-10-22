---
id: agent-memory-layers
type: comparison
title: Memory layers for AI agents
summary: Mem0, LangMem, the Claude memory tool, Graphiti, Zep, Cognee and Letta compared on memory model, who writes memories, self-hosting and license, hosted pricing, MCP servers, SDK languages and framework ties.
description: "A primary-source comparison of seven ways to give an agent long-term memory, from a file directory the model edits itself to managed temporal knowledge graphs. Licenses, prices and MCP endpoints were checked against each project's repository, docs and pricing page on 2026-10-13. Vendors meter different things (requests, credits per episode, tokens, agents), so model your own traffic before comparing on price."
author: Agentica Author
tags: [memory, agents, knowledge-graphs, vector-search, mcp]
entries: [mem0, langmem, claude-memory-tool, graphiti, zep, cognee, letta, graphiti-mcp-server, langgraph, supermemory, pgvector, qdrant]
related: [give-an-agent-long-term-memory, vector-databases-for-agents, connect-an-agent-to-a-remote-mcp-server, agent-identity-and-mcp-auth, personal-agent-runtimes]
subjects: [mem0, langmem, claude-memory-tool, graphiti, zep, cognee, letta]
criteria:
  - Memory model
  - How memories are written
  - Self-host and license
  - Hosted pricing
  - MCP server
  - SDK languages
  - Framework ties
rows:
  mem0:
    Memory model: "Extracted facts in a vector store, scoped by user_id, agent_id and run_id. Graph memory has been removed from the open-source package and is Platform-only"
    How memories are written: "Your app calls add() and an LLM extracts facts. The Platform adds background consolidation (Dream), memory decay and webhooks"
    Self-host and license: "Apache-2.0. Use as a library or run the self-hosted server with docker compose (auth on by default)"
    Hosted pricing: "Hobby free (10k adds and 1k retrievals per month); Starter $19/mo; Pro $249/mo. Graph memory and Dream are listed on Pro and above"
    MCP server: "Hosted at https://mcp.mem0.ai/mcp, with OAuth sign-in or an API key as a bearer token"
    SDK languages: "Python (mem0ai) and Node (mem0ai), plus a CLI"
    Framework ties: "Framework-agnostic, with a LangGraph integration"
  langmem:
    Memory model: "Memories stored as items in a LangGraph BaseStore (for example InMemoryStore or AsyncPostgresStore), searched by namespace"
    How memories are written: "Both: hot-path manage and search tools the agent calls, and a background memory manager. Also does prompt optimization"
    Self-host and license: "MIT library; you run it with your own store"
    Hosted pricing: "No hosted service of its own"
    MCP server: "None found"
    SDK languages: Python
    Framework ties: "Built for LangGraph, through its long-term memory store"
  claude-memory-tool:
    Memory model: "Files under a /memories directory that Claude reads and edits"
    How memories are written: "In the conversation: Claude issues view, create, str_replace, insert, delete and rename commands, and your app executes them"
    Self-host and license: "Client-side tool, so storage is whatever backend you implement. Your code must reject paths outside /memories"
    Hosted pricing: "No separate fee; it is a tool type in the Claude API"
    MCP server: "Not applicable; it is a Claude API tool (type memory_20250818)"
    SDK languages: "Helpers in Python, TypeScript, C# and Java; a local filesystem helper in Python and TypeScript. No helper in Go or Ruby"
    Framework ties: "Claude 4 and later models only"
  graphiti:
    Memory model: "Temporal knowledge graph with bi-temporal tracking; outdated facts are invalidated, not deleted"
    How memories are written: "Your app ingests episodes and Graphiti extracts entities and facts incrementally"
    Self-host and license: "Apache-2.0, self-hosted only. Needs Neo4j, FalkorDB or Amazon Neptune"
    Hosted pricing: "None for Graphiti itself; Zep is the managed product from the same team"
    MCP server: "Experimental Graphiti MCP server: HTTP at localhost:8000/mcp/ or stdio, Docker Compose with FalkorDB by default"
    SDK languages: "Python 3.10+"
    Framework ties: "Framework-agnostic"
  zep:
    Memory model: "Managed context graph built on a proprietary engine (temporal knowledge graph)"
    How memories are written: "Your app sends messages or data as episodes; Zep builds the graph in the background"
    Self-host and license: "Managed SaaS or BYOC; proprietary. The getzep/zep repo now holds examples only"
    Hosted pricing: "Free trial 10k credits/month; Flex $125/mo (50k credits); Flex Plus $375/mo (200k). One credit per episode up to 350 bytes; retrieval and storage free"
    MCP server: "Context MCP server at https://api.getzep.com/mcp, with end-user sign-in through your IdP; seats vary by plan"
    SDK languages: "Python, TypeScript and Go"
    Framework ties: "Framework-agnostic"
  cognee:
    Memory model: "Combined graph, vector and relational memory"
    How memories are written: "Your app calls remember, recall and improve; can run on local models when no LLM key is set"
    Self-host and license: "Apache-2.0. API, UI and MCP run locally. Using Postgres as the graph store is for demos; the production option is licensed"
    Hosted pricing: "Cloud Free $0 (1M tokens, 1 workspace); Standard $1 per 1M tokens plus $5 per extra workspace; Enterprise BYOC"
    MCP server: "Cognee MCP server (Docker quickstart, port 8001 by default) for Claude Code, Cursor, Codex and others"
    SDK languages: "Python; also an OpenClaw plugin on npm"
    Framework ties: "Framework-agnostic"
  letta:
    Memory model: "MemFS: a git-versioned memory filesystem"
    How memories are written: "The agent edits its own memory in the conversation, plus background dreaming"
    Self-host and license: "Apache-2.0 (letta-code). Runs locally without an account, or as a self-hosted App Server. The old letta-ai/letta server is retired"
    Hosted pricing: "Free (BYOK, up to 3 stateful agents); Pro $20/mo (up to 20 agents); developer API plans are usage-based"
    MCP server: "Hosted Letta MCP server; agents can also connect to stdio, HTTP and SSE MCP servers"
    SDK languages: "TypeScript (Agent SDK); CLI on npm (Node 22.19+)"
    Framework ties: "A full stateful agent runtime, not a plug-in layer"
verdict: "Inside LangGraph, use LangMem. On Claude, the memory tool is the simplest option and the data stays in your storage. Mem0 is the most portable layer, with a free tier and a hosted MCP endpoint, but graph memory is now paid-only. For facts that change over time, use Graphiti (self-hosted) or Zep (managed, metered per episode). Cognee mixes graph and vector memory and runs on local models. Letta is a whole agent runtime that edits its own memory."
sources:
  - {title: Mem0 README, url: "https://github.com/mem0ai/mem0", accessed: 2026-10-13}
  - {title: Mem0 pricing, url: "https://mem0.ai/pricing", accessed: 2026-10-13}
  - {title: Mem0 documentation, url: "https://docs.mem0.ai/llms.txt", accessed: 2026-10-13}
  - {title: LangMem README, url: "https://github.com/langchain-ai/langmem", accessed: 2026-10-13}
  - {title: "Claude docs, Memory tool", url: "https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool", accessed: 2026-10-13}
  - {title: Graphiti README, url: "https://github.com/getzep/graphiti", accessed: 2026-10-13}
  - {title: Graphiti MCP server, url: "https://github.com/getzep/graphiti/tree/main/mcp_server", accessed: 2026-10-13}
  - {title: Zep pricing, url: "https://www.getzep.com/pricing", accessed: 2026-10-13}
  - {title: Zep documentation, url: "https://help.getzep.com/llms.txt", accessed: 2026-10-13}
  - {title: Cognee README, url: "https://github.com/topoteretes/cognee", accessed: 2026-10-13}
  - {title: Cognee pricing, url: "https://www.cognee.ai/pricing", accessed: 2026-10-13}
  - {title: Letta Code repository, url: "https://github.com/letta-ai/letta-code", accessed: 2026-10-13}
  - {title: Letta documentation, url: "https://docs.letta.com/llms.txt", accessed: 2026-10-13}
last_verified: 2026-10-13
published: 2026-10-13
---

## How to read this table

Ask two questions first: what shape does a memory take, and who writes it? File-based memory ([Claude memory tool](entry:claude-memory-tool), [Letta](entry:letta)'s MemFS) lets the model curate plain text itself. A fact-extraction layer ([Mem0](entry:mem0), [LangMem](entry:langmem)) turns conversations into short searchable facts. A temporal graph ([Graphiti](entry:graphiti), [Zep](entry:zep), [Cognee](entry:cognee)) also records how facts relate and when they stopped being true.

Writing memories during the conversation (the agent calls a tool) makes them visible and easy to debug, but it adds latency and costs tokens. Background writing (a manager, consolidation or "dreaming" job) keeps the response fast, but the memories show up later. LangMem, Mem0 Platform and Letta offer both.

## Standout findings

- **Mem0 open source no longer includes graph memory.** It is a Platform feature, listed on the Pro tier ($249/mo) and above.
- **Letta's original server repo is retired.** Current development is in `letta-code` (Apache-2.0), built around a git-versioned memory filesystem.
- **Zep is managed or BYOC only.** For a self-hosted temporal graph, use [Graphiti](entry:graphiti) directly, with its experimental [MCP server](entry:graphiti-mcp-server).
- **The Claude memory tool runs on your side.** Anthropic stores nothing for it. Your handler decides where the files live and must block path traversal.

## Choosing

For a step-by-step build with these tools, see [Give an agent long-term memory](guide:give-an-agent-long-term-memory). If you only need a vector store you control, [pgvector](entry:pgvector) or [Qdrant](entry:qdrant) under your own extraction logic may be enough. [Supermemory](entry:supermemory) is another hosted option that this table does not cover.
