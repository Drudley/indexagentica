---
id: coding-agent-harnesses
type: comparison
title: Terminal coding agents compared
summary: Claude Code, Codex CLI, Gemini CLI, GitHub Copilot CLI, OpenCode, Cline, goose and Aider compared on license, model access, instruction files, sandboxing, headless mode, MCP and Agent Skills support.
description: "A primary-source comparison of eight coding agents you can run in a terminal, checked against each project's documentation and GitHub repository on 2026-10-02. It focuses on the things that decide whether a harness fits your workflow and your security posture: which models you can use and how you pay, which instruction files it reads, what its sandbox actually restricts by default, and how it runs unattended in CI."
author: Agentica Author
tags: [coding-agents, harnesses, cli, mcp, agent-skills, sandboxing]
entries: [claude-code, codex-cli, gemini-cli, github-copilot-cli, opencode, cline, goose, aider, agents-md, agent-skills-spec, model-context-protocol]
subjects: [claude-code, codex-cli, gemini-cli, github-copilot-cli, opencode, cline, goose, aider]
criteria:
  - License
  - Models and access
  - Instruction files
  - Sandbox and approvals
  - Headless mode
  - MCP
  - Agent Skills
  - Latest release
rows:
  claude-code:
    License: Proprietary (Anthropic Commercial Terms)
    Models and access: "Claude models; needs a Pro, Max, Team, Enterprise or Console account (not the free plan), or Bedrock, Google Cloud or Microsoft providers"
    Instruction files: "CLAUDE.md; also reads AGENTS.md; auto memory"
    Sandbox and approvals: "Permission modes plus an OS-enforced Bash sandbox (macOS, Linux, WSL2), off by default; sandboxed network goes through a domain allowlist proxy"
    Headless mode: "claude -p, plus the Agent SDK for Python and TypeScript"
    MCP: Yes (stdio and HTTP; remote OAuth)
    Agent Skills: "Yes"
    Latest release: "v2.1.287 (2026-10-01)"
  codex-cli:
    License: Apache-2.0
    Models and access: "OpenAI models; sign in with ChatGPT (Free, Go, Plus, Pro, Business, Edu, Enterprise) or use an API key"
    Instruction files: AGENTS.md
    Sandbox and approvals: "Sandbox on by default (Seatbelt on macOS, bubblewrap on Linux/WSL2); modes read-only, workspace-write (default), danger-full-access; approvals on-request or never, optional auto-review agent"
    Headless mode: codex exec
    MCP: "Yes, as a client. The codex mcp-server command was removed; integrations use the app server"
    Agent Skills: "Yes (custom prompts deprecated in favor of skills)"
    Latest release: "rust-v0.160.0 (2026-10-01)"
  gemini-cli:
    License: Apache-2.0
    Models and access: "Gemini models; free tier with a personal Google account (60 requests/min, 1,000/day), API key or Vertex AI"
    Instruction files: "GEMINI.md by default; context file name configurable (e.g. AGENTS.md)"
    Sandbox and approvals: "Opt-in sandbox (-s or GEMINI_SANDBOX): macOS Seatbelt, Docker, Podman, gVisor (runsc) or LXC"
    Headless mode: gemini -p
    MCP: Yes
    Agent Skills: "Yes, enabled by default"
    Latest release: "v0.62.0 (2026-09-29)"
  github-copilot-cli:
    License: "Proprietary (GitHub Copilot CLI License; redistribution of unmodified copies allowed)"
    Models and access: "Several models selectable with /model; needs an active Copilot subscription; usage consumes AI credits by tokens"
    Instruction files: "AGENTS.md, .github/copilot-instructions.md, CLAUDE.md, GEMINI.md and *.instructions.md, all combined"
    Sandbox and approvals: "Tool approvals (--allow-tool); local sandbox via /sandbox enable and cloud sandboxes, both public preview"
    Headless mode: "copilot -p"
    MCP: Yes; ships with GitHub's MCP server by default
    Agent Skills: "Yes"
    Latest release: "v1.0.91 (2026-10-01)"
  opencode:
    License: MIT
    Models and access: "75+ providers via the AI SDK and Models.dev, plus local models; bring your own keys"
    Instruction files: "AGENTS.md (project and global); falls back to CLAUDE.md and reads .claude/skills"
    Sandbox and approvals: "Per-tool allow, ask or deny rules, with a read-only plan agent and an --auto mode; no OS sandbox documented in the sources used"
    Headless mode: "opencode run, and opencode serve for a headless server"
    MCP: Yes
    Agent Skills: "Yes"
    Latest release: "v1.18.34 (2026-09-30); site announces OpenCode v2"
  cline:
    License: "Apache-2.0 (JetBrains plugin not open source)"
    Models and access: "Many providers (Anthropic, OpenAI, Bedrock, Gemini, OpenRouter, local), Claude Code or Codex subscriptions, or Cline's own usage billing"
    Instruction files: ".clinerules/ or .cline/rules/, AGENTS.md, .cursorrules, .windsurfrules"
    Sandbox and approvals: "Plan and Act modes; the CLI starts in act mode with auto-approve on by default; CLINE_SANDBOX env var enables a sandbox mode"
    Headless mode: "cline \"prompt\" with --json output; also an SDK"
    MCP: Yes
    Agent Skills: "Yes"
    Latest release: "Monorepo with per-app releases (desktop-v0.0.42 on 2026-10-02)"
  goose:
    License: "Apache-2.0 per the GitHub repo (the docs' llms.txt says MIT)"
    Models and access: "15+ providers (Anthropic, OpenAI, Google, Ollama, OpenRouter, Azure, Bedrock), or existing Claude, ChatGPT or Gemini subscriptions via ACP"
    Instruction files: ".goosehints (docs also mention AGENT.md)"
    Sandbox and approvals: Not compared; check goose's permission docs
    Headless mode: "goose run (instructions file or recipe)"
    MCP: "Yes; extensions are MCP servers"
    Agent Skills: "Yes (SKILL.md in ~/.agents/skills)"
    Latest release: "v1.52.0 (2026-09-23)"
  aider:
    License: Apache-2.0
    Models and access: "Almost any LLM, cloud or local; bring your own keys"
    Instruction files: "No fixed file; load e.g. CONVENTIONS.md with /read or read: in .aider.conf.yml"
    Sandbox and approvals: "No sandbox; edits are auto-committed to git by default (--no-auto-commits to disable)"
    Headless mode: "aider --message or --message-file"
    MCP: Not documented
    Agent Skills: Not documented
    Latest release: "v0.86.0 (2025-08-09)"
verdict: "Pick by model access first: Claude Code for Claude, Codex CLI for a ChatGPT plan, Gemini CLI for a free tier, Copilot CLI if your org already pays for Copilot, and OpenCode, Cline or goose to bring your own provider. For unattended runs, Codex CLI has the strictest out-of-the-box sandbox; Claude Code's and Gemini CLI's are strong but opt-in, and Cline's CLI auto-approves by default. Aider is still useful for git-centric pair programming but has had no release since August 2025."
sources:
  - title: Claude Code docs, Set up Claude Code
    url: https://code.claude.com/docs/en/setup
    accessed: 2026-10-02
  - title: Claude Code docs, Configure the sandboxed Bash tool
    url: https://code.claude.com/docs/en/sandboxing
    accessed: 2026-10-02
  - title: Claude Code docs, Memory (CLAUDE.md and AGENTS.md)
    url: https://code.claude.com/docs/en/memory
    accessed: 2026-10-02
  - title: Claude Code docs, Run Claude Code programmatically
    url: https://code.claude.com/docs/en/headless
    accessed: 2026-10-02
  - title: anthropics/claude-code repository and LICENSE
    url: https://github.com/anthropics/claude-code
    accessed: 2026-10-02
  - title: openai/codex repository
    url: https://github.com/openai/codex
    accessed: 2026-10-02
  - title: Codex docs, Sandbox
    url: https://learn.chatgpt.com/docs/sandboxing
    accessed: 2026-10-02
  - title: Codex docs, Codex MCP server removal
    url: https://learn.chatgpt.com/docs/mcp-server
    accessed: 2026-10-02
  - title: Codex docs, Pricing
    url: https://learn.chatgpt.com/docs/pricing
    accessed: 2026-10-02
  - title: Codex docs index (llms.txt)
    url: https://learn.chatgpt.com/docs/llms.txt
    accessed: 2026-10-02
  - title: google-gemini/gemini-cli repository
    url: https://github.com/google-gemini/gemini-cli
    accessed: 2026-10-02
  - title: Gemini CLI docs, Sandboxing
    url: https://geminicli.com/docs/cli/sandbox
    accessed: 2026-10-02
  - title: GitHub Docs, About GitHub Copilot CLI
    url: https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli
    accessed: 2026-10-02
  - title: GitHub Docs, Adding custom instructions for Copilot CLI
    url: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions
    accessed: 2026-10-02
  - title: github/copilot-cli repository
    url: https://github.com/github/copilot-cli
    accessed: 2026-10-02
  - title: OpenCode docs, Rules
    url: https://opencode.ai/docs/rules/
    accessed: 2026-10-02
  - title: OpenCode docs, Providers
    url: https://opencode.ai/docs/providers/
    accessed: 2026-10-02
  - title: OpenCode docs, Permissions
    url: https://opencode.ai/docs/permissions/
    accessed: 2026-10-02
  - title: OpenCode docs, CLI
    url: https://opencode.ai/docs/cli/
    accessed: 2026-10-02
  - title: cline/cline repository
    url: https://github.com/cline/cline
    accessed: 2026-10-02
  - title: Cline docs, Cline Rules
    url: https://docs.cline.bot/customization/cline-rules
    accessed: 2026-10-02
  - title: Cline docs, CLI reference
    url: https://docs.cline.bot/cli/cli-reference
    accessed: 2026-10-02
  - title: aaif-goose/goose repository
    url: https://github.com/aaif-goose/goose
    accessed: 2026-10-02
  - title: goose docs, Using skills
    url: https://goose-docs.ai/docs/guides/context-engineering/using-skills
    accessed: 2026-10-02
  - title: goose docs, CLI commands
    url: https://goose-docs.ai/docs/guides/goose-cli-commands
    accessed: 2026-10-02
  - title: Aider-AI/aider repository
    url: https://github.com/Aider-AI/aider
    accessed: 2026-10-02
  - title: Aider docs, Specifying coding conventions
    url: https://aider.chat/docs/usage/conventions.html
    accessed: 2026-10-02
  - title: Aider docs, Options reference
    url: https://aider.chat/docs/config/options.html
    accessed: 2026-10-02
related: [coding-agent-starter, add-mcp-servers-to-claude-code, connect-an-agent-to-a-remote-mcp-server, run-untrusted-code-in-a-sandbox]
last_verified: 2026-10-02
published: 2026-10-02
---

## What actually differs

All eight read your repository, edit files, run shell commands and loop until the task is done. The differences that matter in practice are narrower than the feature lists suggest:

- **How you pay for the model.** [Claude Code](entry:claude-code), [Codex CLI](entry:codex-cli), [Gemini CLI](entry:gemini-cli) and [Copilot CLI](entry:github-copilot-cli) are each tied to one vendor's account, which usually means a flat subscription instead of per-token bills. [OpenCode](entry:opencode), [Cline](entry:cline), [goose](entry:goose) and [Aider](entry:aider) take any provider key, including local models, and several of them can also reuse a Claude, ChatGPT or Gemini subscription.
- **What the sandbox does by default.** This is the biggest difference for unattended use, and it's covered below.
- **Which instruction file it reads.** [AGENTS.md](entry:agents-md) has become the common denominator: Codex, OpenCode, Cline and Copilot read it directly, Claude Code reads it alongside CLAUDE.md, and Gemini CLI can be configured to. If you maintain one file for several agents, make it AGENTS.md.
- **Extensibility.** Every tool here except Aider documents [MCP](entry:model-context-protocol) support, and all of them except Aider now load [Agent Skills](entry:agent-skills-spec) (folders with a `SKILL.md`), so a skill written once works across most harnesses.

## Sandboxing and approvals, read carefully

"Has a sandbox" means very different things:

- **Codex CLI** sandboxes by default. Commands run under Seatbelt on macOS or bubblewrap on Linux and WSL2 (you install `bubblewrap` yourself), in `workspace-write` mode: edits inside the workspace, routine commands, and approval when it needs to go further. `danger-full-access` with approval policy `never` removes all limits.
- **Claude Code** combines permission modes with an OS-enforced Bash sandbox built on Anthropic's open-source `sandbox-runtime`. It is **off by default** (`/sandbox` turns it on). When on, writes are limited to the working directory and network goes through a local proxy with an allowlist that starts empty. Note the documented defaults: sandboxed commands can still **read** most of the machine, including `~/.ssh` and `~/.aws/credentials`, until you add `denyRead` or credential rules, and file tools, MCP servers and hooks run outside the sandbox. Native Windows runs commands unsandboxed; use WSL2.
- **Gemini CLI** offers the widest choice of backends (Seatbelt, Docker, Podman, gVisor, LXC) but only when you pass `-s` or set `GEMINI_SANDBOX`.
- **Copilot CLI** relies on tool approvals (`--allow-tool='shell(git)'`) and added local and cloud sandboxes, both in public preview.
- **OpenCode** uses allow, ask and deny rules per tool and per command pattern, plus a read-only `plan` agent. No OS-level sandbox was documented in the pages used here.
- **Cline's CLI** starts a prompt in act mode with auto-approve **on** by default (`--auto-approve false` to change that). Fine inside a container; risky on your workstation.
- **Aider** has no sandbox; its safety net is that every edit is a git commit you can undo.

For unattended runs in CI, or anywhere the agent reads untrusted input such as issues, web pages or dependencies, run the harness itself inside a disposable environment. The [sandboxing guide](guide:run-untrusted-code-in-a-sandbox) and [code sandboxes comparison](comparison:code-sandboxes) cover the options.

## Recent changes worth knowing

- **Codex CLI** removed `codex mcp-server` and the standalone `codex-mcp-server` binary; integrations must move to the Codex app server's own JSON-RPC protocol. The `untrusted` approval policy is retired, custom prompts are deprecated in favor of skills, and the docs moved to learn.chatgpt.com.
- **Claude Code's** npm package is deprecated as an install method; use the native installer, Homebrew or WinGet. Claude Code now reads AGENTS.md.
- **Copilot CLI** bills by AI credits consumed per token rather than per request, and combines all instruction files instead of picking one by priority.
- **goose** moved from Block to the Agentic AI Foundation at the Linux Foundation; the repository is now `aaif-goose/goose`.
- **OpenCode's** repository is `anomalyco/opencode`, and its site announces OpenCode v2.
- **Aider's** last tagged release is v0.86.0 from 2025-08-09, and its README still recommends models from early 2025.

## Not in this table

[Cursor](entry:cursor) (an IDE with a CLI), [Amp](entry:amp), [Kiro](entry:kiro), [Qwen Code](entry:qwen-code) (a Gemini CLI fork for Qwen models) and [OpenHands](entry:openhands) are also strong options, but they weren't re-verified for this page. To set up any of these harnesses with tools, see the [coding agent starter stack](stack:coding-agent-starter) and the guide to [adding MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code).
