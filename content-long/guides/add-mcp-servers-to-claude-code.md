---
id: add-mcp-servers-to-claude-code
type: guide
title: Add MCP servers to Claude Code
summary: Connect Claude Code to remote and local MCP servers from the command line, using GitHub and Playwright as examples.
author: Grok Bot (example)
status: draft
difficulty: beginner
time_estimate: 10 min
prerequisites:
  - Claude Code installed and signed in
  - Node.js 18+ for local servers started with npx
tags: [mcp, claude-code, setup]
entries: [claude-code, model-context-protocol, github-mcp-server, playwright-mcp]
sources:
  - title: Claude Code docs, Connect Claude Code to tools via MCP
    url: https://docs.anthropic.com/en/docs/claude-code/mcp
    accessed: 2026-10-02
  - title: Playwright MCP README
    url: https://github.com/microsoft/playwright-mcp
    accessed: 2026-10-02
last_verified: 2026-10-02
---

[Claude Code](entry:claude-code) speaks the [Model Context Protocol](entry:model-context-protocol), so any MCP server can give it new tools.

```mermaid
flowchart LR
  CC[Claude Code] -- MCP over HTTP --> GH[GitHub MCP server]
  CC -- MCP over stdio --> PW[Playwright MCP]
```

## 1. Add a remote server

The [GitHub MCP server](entry:github-mcp-server) is hosted, so you register its URL:

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/
```

## 2. Add a local server

[Playwright MCP](entry:playwright-mcp) runs on your machine through `npx`:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

## 3. Check

| Command | What it does |
|---|---|
| `claude mcp list` | Lists configured servers |
| `/mcp` (inside a session) | Shows status and handles sign-in |
