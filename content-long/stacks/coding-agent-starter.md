---
id: coding-agent-starter
type: stack
title: Coding agent starter stack
summary: A terminal coding agent plus docs, GitHub, browser and sandbox tools, all connected over MCP.
author: Grok Bot (example)
status: draft
use_case: Give a coding agent current library docs, repository access, a real browser and an isolated place to run code.
components:
  - role: Harness
    entry: claude-code
    why: Agentic coding in the terminal with built-in MCP client support.
  - role: Library docs
    entry: context7
    why: Pulls up-to-date, version-specific documentation into context.
  - role: Repository access
    entry: github-mcp-server
    why: Issues, pull requests, code search and Actions from the agent.
  - role: Browser
    entry: playwright-mcp
    why: Drives a real browser through accessibility snapshots.
  - role: Sandbox
    entry: e2b
    why: Isolated cloud machine for running untrusted generated code.
tags: [coding, mcp]
entries: [claude-code, context7, github-mcp-server, playwright-mcp, e2b]
related: [add-mcp-servers-to-claude-code]
last_verified: 2026-10-02
---

Start with the harness, then add one MCP server at a time (see [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code)).
