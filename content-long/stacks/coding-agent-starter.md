---
id: coding-agent-starter
type: stack
title: Coding agent starter stack
summary: A terminal coding agent plus current library docs, GitHub access, a real browser and a sandbox, connected over MCP, with the configuration choices that keep it safe.
description: "A minimal, well-supported set of tools to make a terminal coding agent useful on real projects. Claude Code is used as the harness, but every component works with any MCP-capable harness, such as Codex CLI, Gemini CLI, OpenCode or Copilot CLI."
author: Agentica Author
use_case: Give a coding agent current library docs, repository access, a real browser and an isolated place to run code.
components:
  - role: Harness
    entry: claude-code
    why: "Agentic coding in the terminal with a built-in MCP client, Agent Skills and an optional OS-enforced Bash sandbox. Swap in another harness from the comparison if you prefer a different model or license."
  - role: Project instructions
    entry: agents-md
    why: "One AGENTS.md at the repo root that most harnesses read (Claude Code reads it alongside CLAUDE.md), holding build, test and style rules."
  - role: Library docs
    entry: context7
    why: "Pulls up-to-date, version-specific library documentation into context, so the agent stops guessing APIs. Hosted at mcp.context7.com/mcp."
  - role: Repository access
    entry: github-mcp-server
    why: "Issues, pull requests, code search and Actions from the agent, either hosted at api.githubcopilot.com/mcp with a token or as a local Docker server with OAuth."
  - role: Browser
    entry: playwright-mcp
    why: "Drives a real browser through accessibility snapshots, for checking the UI the agent just changed."
  - role: Sandbox
    entry: e2b
    why: "A disposable Firecracker microVM for running untrusted or generated code away from your machine, with outbound network you can switch off."
tags: [coding, mcp, starter]
entries: [claude-code, agents-md, context7, github-mcp-server, playwright-mcp, e2b, codex-cli, gemini-cli, opencode]
sources:
  - title: Claude Code docs, Connect Claude Code to tools via MCP
    url: https://code.claude.com/docs/en/mcp
    accessed: 2026-10-02
  - title: Claude Code docs, Memory (CLAUDE.md and AGENTS.md)
    url: https://code.claude.com/docs/en/memory
    accessed: 2026-10-02
  - title: GitHub MCP server, Install in Claude applications
    url: https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-claude.md
    accessed: 2026-10-02
  - title: Playwright MCP README
    url: https://github.com/microsoft/playwright-mcp
    accessed: 2026-10-02
  - title: E2B docs, Internet access
    url: https://docs.e2b.dev/network/internet-access
    accessed: 2026-10-02
related: [add-mcp-servers-to-claude-code, coding-agent-harnesses, run-untrusted-code-in-a-sandbox, code-sandboxes, connect-an-agent-to-a-remote-mcp-server]
last_verified: 2026-10-02
published: 2026-10-02
---

## Setting it up

Start with the harness and one MCP server, confirm it works, then add the next. With Claude Code:

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
claude mcp add --transport http github https://api.githubcopilot.com/mcp \
  --header "Authorization: Bearer $GITHUB_PAT"
claude mcp add playwright -- npx @playwright/mcp@latest
claude mcp list
```

The [Claude Code MCP guide](guide:add-mcp-servers-to-claude-code) covers scopes, keeping tokens out of `.mcp.json`, and troubleshooting. For other harnesses, see the [remote MCP guide](guide:connect-an-agent-to-a-remote-mcp-server) and the [coding agents comparison](comparison:coding-agent-harnesses).

## Keep it safe

- **Scope the GitHub token.** Use a fine-grained token limited to the repositories the agent works on, with read-only permissions unless it needs to open pull requests.
- **Turn on the harness sandbox.** Claude Code's Bash sandbox is off by default (`/sandbox` enables it); Codex CLI sandboxes by default. Add `denyRead` rules for credential files, since sandboxed commands can still read most of your home directory by default.
- **Review `.mcp.json` in repos you didn't write.** Project-scoped servers load without a prompt in `claude -p` and SDK runs.
- **Run generated code elsewhere.** Send anything that installs packages from the internet or runs untrusted code to the sandbox; the [sandboxing guide](guide:run-untrusted-code-in-a-sandbox) explains how.
