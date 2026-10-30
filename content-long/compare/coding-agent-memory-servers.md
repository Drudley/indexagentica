---
id: coding-agent-memory-servers
type: comparison
title: "Memory servers for coding agents compared: m3 Memory vs agentmemory vs Basic Memory vs MCP Memory Service"
summary: "Four self-hosted memory servers that give Claude Code, Codex, Cursor and other MCP clients one shared memory across sessions and tools. Covers install, storage, search, how memories get captured, hosted options and license."
description: "A primary-source comparison of four local-first memory servers for coding agents, checked on 2026-10-27 against each project's GitHub README and package registry (PyPI and npm). All four are open source and reach agents over MCP. Benchmark and performance figures are the projects' own claims and were not reproduced here."
author: Agentica Author
tags: [memory, mcp, coding-agents, self-hosted, local-first, claude-code, codex]
entries: [m3-memory, agentmemory, basic-memory, mcp-memory-service, claude-code, codex-cli, cursor, gemini-cli, mem0, letta, graphiti, omnimemeval]
related: [agent-memory-layers, give-an-agent-long-term-memory, coding-agent-harnesses, add-mcp-servers-to-claude-code, pick-an-mcp-server, research-memory-libraries]
subjects: [m3-memory, agentmemory, basic-memory, mcp-memory-service]
criteria:
  - Install
  - Storage
  - Search
  - How memories get in
  - Hosted option
  - License
rows:
  m3-memory:
    Install: "pipx install m3-memory, then m3 setup (detects agents and wires them up) and m3 doctor. PyPI 2026.10.25.0, Python 3.12+"
    Storage: "One SQLite file by default; PostgreSQL 16-18 as an alternative (pgvector optional), shared directly or synced hourly hub-and-spoke"
    Search: "Hybrid keyword plus vector; knowledge-graph links up to 3 hops; supersession keeps earlier versions when a decision changes"
    How memories get in: "Agents call MCP tools (only 6 of 100+ load at startup); chat-log capture saves turns before compaction for Claude Code, Codex, Gemini CLI, Antigravity, OpenCode, OpenClaw and Aider"
    Hosted option: "None; runs on your machine, works offline"
    License: "Apache-2.0"
  agentmemory:
    Install: "npx -y @agentmemory/agentmemory@latest (interactive setup; Node.js 20+). npm 0.9.31"
    Storage: "Local data directory outside the repo (state_store.db); API on localhost:3111, viewer on :3113"
    Search: "BM25 keyword search with no API key (keyless mode); local or remote embeddings add semantic search; graph matches fused in smart search"
    How memories get in: "Lifecycle hooks and native plugins capture sessions automatically (12 hooks in Claude Code, 6 in Codex), with secret scrubbing; 54 MCP tools plus REST"
    Hosted option: "None; local server, or self-host it remotely behind a secret"
    License: "Apache-2.0"
  basic-memory:
    Install: "uv tool install basic-memory --prerelease=allow (Python 3.12+; needs a FastMCP 4 pre-release). PyPI 0.24.1"
    Storage: "Plain Markdown files on disk with a local SQLite index; Postgres (optionally with Milvus vectors) for larger deployments"
    Search: "Hybrid full-text plus vector (FastEmbed) with optional cross-encoder reranking; wikilinks and observations form a knowledge graph"
    How memories get in: "The AI writes and edits notes through MCP tools, and humans edit the same Markdown (for example in Obsidian); a Claude Code plugin adds hooks and skills"
    Hosted option: "Basic Memory Cloud: $15/month (7-day trial), cross-device sync, Teams workspaces"
    License: "AGPL-3.0"
  mcp-memory-service:
    Install: "pip install mcp-memory-service, then memory server (stdio) or memory server --http. PyPI 12.4.0, Python 3.10+"
    Storage: "SQLite locally, Cloudflare for multi-device sync, or Hybrid (local reads with background sync to Cloudflare or another instance); Milvus option"
    Search: "Semantic search with local ONNX embeddings, tag search and a typed knowledge graph (causes, fixes, contradicts); scheduled consolidation"
    How memories get in: "MCP tools, a REST API (POST /api/memories) with X-Agent-ID tagging, and optional hooks for Claude Code and Codex that retrieve and store context"
    Hosted option: "None official; self-host, including remote MCP over HTTPS with OAuth 2.0 for claude.ai and ChatGPT"
    License: "Apache-2.0"
verdict: "Want a memory you can read and edit yourself? Basic Memory keeps everything as Markdown, but note the AGPL license and the pre-release install flag. Want capture with no effort in Claude Code or Codex? agentmemory's hooks record sessions automatically and work without an API key. Want one store for several agents and machines, with version history and a small startup tool footprint? m3 Memory with SQLite or PostgreSQL. Building a multi-agent pipeline (LangGraph, CrewAI) that needs plain REST plus MCP and OAuth? MCP Memory Service."
sources:
  - {title: "m3 Memory README", url: "https://github.com/skynetcmd/m3-memory", accessed: 2026-10-27}
  - {title: "PyPI: m3-memory", url: "https://pypi.org/project/m3-memory/", accessed: 2026-10-27}
  - {title: "agentmemory README", url: "https://github.com/rohitg00/agentmemory", accessed: 2026-10-27}
  - {title: "npm: @agentmemory/agentmemory", url: "https://www.npmjs.com/package/@agentmemory/agentmemory", accessed: 2026-10-27}
  - {title: "Basic Memory README", url: "https://github.com/basicmachines-co/basic-memory", accessed: 2026-10-27}
  - {title: "PyPI: basic-memory", url: "https://pypi.org/project/basic-memory/", accessed: 2026-10-27}
  - {title: "MCP Memory Service README", url: "https://github.com/doobidoo/mcp-memory-service", accessed: 2026-10-27}
  - {title: "PyPI: mcp-memory-service", url: "https://pypi.org/project/mcp-memory-service/", accessed: 2026-10-27}
last_verified: 2026-10-27
published: 2026-10-27
---

Coding agents forget everything between sessions. These four servers fix that in the same basic way: a local process stores memories, and every agent you use reaches it over MCP, so a decision you made in [Claude Code](entry:claude-code) on Monday is there when you open [Codex](entry:codex-cli) or [Cursor](entry:cursor) on Friday. They differ in how memories get captured, what the store looks like, and how far they scale beyond one laptop.

These are not the same thing as the memory SDKs in [Agent memory layers compared](comparison:agent-memory-layers) ([Mem0](entry:mem0), [Letta](entry:letta), [Graphiti](entry:graphiti) and others). Those are libraries you build into your own agent. The servers here are for agents you already use and can't change.

## Capture: tools, hooks or files

This is the biggest practical difference.

- **Explicit tool calls.** By default the agent decides when to save or search, through MCP tools. Every option here supports this. It costs nothing to set up, but the agent can forget to remember.
- **Hooks.** [agentmemory](entry:agentmemory) is built around lifecycle hooks (`SessionStart`, `PostToolUse`, `PreCompact`, `Stop` and others) that record sessions without the agent asking. [MCP Memory Service](entry:mcp-memory-service) has optional hooks for Claude Code and Codex. [m3 Memory](entry:m3-memory) captures chat turns before an agent compacts its context, for seven agents. Hooks run code on every event, so review what they send and where.
- **Files you can edit.** [Basic Memory](entry:basic-memory) stores each memory as a Markdown note. You can open, fix or delete it in any editor, and the index re-syncs. That's the easiest store to audit by hand.

## Context cost

A memory server with dozens of tools can use a lot of the context window before the agent does anything. m3 Memory says it registers only 6 of its 100+ tools at startup (about 3,200 tokens by its own count) and loads the rest on demand. agentmemory exposes 54 MCP tools and ships skills that tell the agent when to use them. If your client supports per-server tool filtering, use it. If you're on Claude Code, [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code) covers the config.

## One laptop or a team

All four run locally with SQLite or local files. To share memory across machines:

- m3 Memory can point every machine at one PostgreSQL database, or keep SQLite on each and sync hourly through a PostgreSQL hub.
- MCP Memory Service's Hybrid backend reads locally and syncs in the background to Cloudflare or another instance. It can also run as a remote MCP server with OAuth, which claude.ai and ChatGPT can connect to.
- Basic Memory Cloud is the only paid hosted option here ($15/month, with Teams workspaces). Self-hosted users sync the Markdown with Git or Syncthing.
- agentmemory can run as a remote, secret-protected server (`AGENTMEMORY_URL` plus `AGENTMEMORY_SECRET`), and it has team-memory tools (namespaced shared and private memories) and a `memory_mesh_sync` tool for peer-to-peer sync between instances.

## Claims to treat with care

Each README reports its own benchmark results (for example m3 Memory's "right session first for 91.8% of questions" and agentmemory's LongMemEval numbers). They were not reproduced here, and they use different setups. To compare memory systems on your own terms, [OmniMemEval](entry:omnimemeval) is an open evaluation framework for memory backends (LoCoMo, LongMemEval and others), and [Give an agent long-term memory](guide:give-an-agent-long-term-memory) covers the design trade-offs.

## Before you install

- **Licenses.** Three are Apache-2.0. Basic Memory is AGPL-3.0, which matters if you modify it and offer it as a network service.
- **Secrets.** Hooks capture whatever passes through a session. agentmemory scrubs secrets on capture. For the others, keep API keys out of prompts or check what gets stored.
- **Ports.** agentmemory and MCP Memory Service run local HTTP servers (3111/3113 and 8000). agentmemory binds to loopback by default. MCP Memory Service's `MCP_ALLOW_ANONYMOUS_ACCESS=true` quick start should never be exposed beyond localhost.
