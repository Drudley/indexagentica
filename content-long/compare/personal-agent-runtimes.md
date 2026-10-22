---
id: personal-agent-runtimes
type: comparison
title: "OpenClaw vs Hermes Agent vs Pi: open-source agents you run yourself"
summary: "Three fast-moving open-source agent runtimes compared: OpenClaw (gateway-first personal assistant), Hermes Agent (self-improving agent with memory, skills and cron) and Pi (minimal, extensible coding harness). Covers interfaces, models, memory, skills, MCP, automation, safety defaults and license."
description: "A primary-source comparison of OpenClaw (MIT, OpenClaw Foundation), Hermes Agent (MIT, Nous Research) and Pi (MIT, Earendil), checked against their READMEs and documentation on 2026-10-22 (OpenClaw v2026.10.5, Hermes Agent v0.22.4, Pi v1.4.0). It explains where each one runs and how you talk to it, how it remembers things, how it loads skills and MCP servers, and what it does by default before running a shell command. That last point matters most, because none of the three sandboxes tools by default."
author: Agentica Author
tags: [agents, personal-assistant, coding-agent, self-hosted, memory, skills, mcp, security, open-source]
entries: [openclaw, hermes-agent, pi-coding-agent, clawhub, honcho, memu, agent-skills-spec, model-context-protocol, claude-code, codex-cli]
related: [coding-agent-harnesses, agent-memory-layers, agent-skill-packs-and-installers, give-an-agent-long-term-memory, self-hosted-agent-sandboxes, test-an-agent-for-prompt-injection]
subjects: [openclaw, hermes-agent, pi-coding-agent]
criteria:
  - What it is
  - Runtime and install
  - Where you talk to it
  - Models
  - Memory
  - Skills and extensions
  - MCP
  - Scheduling and automation
  - Safety defaults
  - License and latest release
rows:
  openclaw:
    What it is: "Personal AI assistant behind a local Gateway (control plane for sessions, tools, events and channels), with Control UI, CLI, TUI and companion apps"
    Runtime and install: "TypeScript on Node.js (24.16+ or 26.1+, 26 recommended). curl -fsSL https://openclaw.ai/install.sh | bash (or PowerShell) or npm install -g openclaw@latest, then openclaw onboard --install-daemon. macOS, Linux, Windows"
    Where you talk to it: "20+ chat channels (WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Teams, Google Chat and more) plus native apps for macOS, iOS, Android, Windows and Linux"
    Models: "Hosted and local model providers; agent harnesses such as Claude and Codex are swappable plugins"
    Memory: "Plain Markdown in the workspace: USER.md, MEMORY.md, dated daily notes; a background dreaming sweep distills notes into MEMORY.md; built-in SQLite memory search (keyword, vector, hybrid); optional Honcho plugin"
    Skills and extensions: "Tools, skills and plugins; openclaw skills search/install/update; public registry ClawHub for skills and plugins"
    MCP: "Both directions: openclaw mcp add/probe/login manages outbound servers (stdio, SSE/HTTP, Streamable HTTP, OAuth); openclaw mcp serve exposes channel conversations to MCP clients over stdio"
    Scheduling and automation: "Built-in automations: cron-style schedules, inbound webhooks, Gmail Pub/Sub triggers, MCP event subscriptions"
    Safety defaults: "Tools run on the host for the main session; sandboxing is off by default (backends: Docker, Podman, SSH, OpenShell, Crabbox). Unknown DM senders must be paired. One trust boundary per gateway, not multi-tenant. openclaw security audit checks for drift"
    License and latest release: "MIT; OpenClaw Foundation (501(c)(3)); v2026.10.5 (2026-10-18)"
  hermes-agent:
    What it is: "Self-improving agent from Nous Research: terminal UI, desktop app and messaging gateway with a learning loop (agent-curated memory, skills it writes and refines)"
    Runtime and install: "Python (plus TypeScript). curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash on Linux, macOS, WSL2; native Windows via PowerShell; also Docker, Nix and Termux"
    Where you talk to it: "CLI/TUI, Hermes Desktop (macOS, Windows, Linux), web dashboard, and one gateway process for 21+ messaging platforms (19 native, IRC and Teams via plugins) incl. Telegram, Discord, Slack, WhatsApp, Signal"
    Models: "Nous Portal, OpenRouter, OpenAI, Anthropic, Google or any OpenAI-compatible endpoint; switch with hermes model; fallback providers and credential pools"
    Memory: "MEMORY.md (2,200 chars) and USER.md (1,375 chars) in ~/.hermes/memories, injected as a frozen snapshot each session; FTS5 session search; external providers (Honcho, Mem0, Hindsight, Supermemory and others)"
    Skills and extensions: "Skills in ~/.hermes/skills (agentskills.io-compatible), created and improved by the agent; Skills Hub can install official, ClawHub and repo skills with a security scan; plugin catalog"
    MCP: "Client: local stdio and remote HTTP servers in one config, with per-server tool filtering and environment-variable isolation for MCP subprocesses"
    Scheduling and automation: "Built-in cron scheduler in natural language, delivered to any platform; isolated subagents"
    Safety defaults: "Dangerous-command approval in smart mode by default (manual and off available; --yolo bypasses); cron and unattended runs deny dangerous commands by default; seven terminal backends incl. Docker, SSH, Singularity, Modal, Daytona, Vercel Sandbox; DM pairing and allowlists"
    License and latest release: "MIT; Nous Research; v0.22.4 (2026-10-21)"
  pi-coding-agent:
    What it is: "Minimal, extensible coding-agent harness plus a TypeScript toolkit (pi-ai LLM API, agent core, TUI); deliberately ships without sub-agents and plan mode"
    Runtime and install: "TypeScript on Node.js 22.19+. curl -fsSL https://pi.dev/install.sh | sh (pinned deps), PowerShell on Windows, npm install -g --ignore-scripts @earendil-works/pi-coding-agent, or Nix"
    Where you talk to it: "Terminal (interactive), print and JSON modes, JSONL RPC over stdio, and an in-process TypeScript SDK; Slack/chat via the separate pi-chat project"
    Models: "Many hosted providers via /login (OAuth subscription or API key), env-var API keys, Bedrock and Vertex ambient credentials, llama.cpp and custom providers"
    Memory: "Sessions saved as branchable trees (/tree, --continue, --resume) with compaction summaries; no built-in long-term memory store documented"
    Skills and extensions: "Implements the Agent Skills spec; TypeScript extensions (custom tools, renderers, MCP servers), prompt templates, themes; packages via npm or git"
    MCP: "Client: stdio and Streamable HTTP; pi mcp add (user-level ~/.pi/agent/mcp.json or project .pi/mcp.json, read only after project trust); /mcp to inspect and sign in"
    Scheduling and automation: "None built in; drive it from your own scheduler or CI with print/JSON mode, RPC or the SDK"
    Safety defaults: "No built-in permission system and no prompt before tool calls; runs with the launching user's permissions; can ask whether you trust a project folder before loading its resources; docs recommend containerizing (Gondolin micro-VM extension, Docker, OpenShell)"
    License and latest release: "MIT; Earendil (earendil-works); v1.4.0 (2026-10-21)"
verdict: "Pick OpenClaw if you want one always-on assistant you message from your phone across many chat apps, with a big plugin and skill ecosystem (ClawHub). Pick Hermes Agent if you want an agent that keeps learning: bounded curated memory, self-written skills, cron jobs and the most cautious default for shell commands (smart approval). Pick Pi if you want a small, scriptable coding harness that you extend in TypeScript or embed through RPC and the SDK. Whichever you pick, turn on a sandbox or container backend before you let it act unattended or read untrusted messages."
sources:
  - title: OpenClaw README
    url: https://github.com/openclaw/openclaw
    accessed: 2026-10-22
  - title: OpenClaw docs index (llms.txt)
    url: https://docs.openclaw.ai/llms.txt
    accessed: 2026-10-22
  - title: "OpenClaw docs: Memory overview"
    url: https://docs.openclaw.ai/concepts/memory
    accessed: 2026-10-22
  - title: "OpenClaw docs: Sandboxing"
    url: https://docs.openclaw.ai/gateway/sandboxing
    accessed: 2026-10-22
  - title: "OpenClaw docs: Security"
    url: https://docs.openclaw.ai/gateway/security
    accessed: 2026-10-22
  - title: "OpenClaw docs: MCP CLI"
    url: https://docs.openclaw.ai/cli/mcp
    accessed: 2026-10-22
  - title: "OpenClaw docs: Install"
    url: https://docs.openclaw.ai/install
    accessed: 2026-10-22
  - title: Hermes Agent README
    url: https://github.com/NousResearch/hermes-agent
    accessed: 2026-10-22
  - title: Hermes Agent docs index (llms.txt)
    url: https://hermes-agent.nousresearch.com/docs/llms.txt
    accessed: 2026-10-22
  - title: "Hermes Agent docs: Security"
    url: https://hermes-agent.nousresearch.com/docs/user-guide/security
    accessed: 2026-10-22
  - title: "Hermes Agent docs: Persistent memory"
    url: https://hermes-agent.nousresearch.com/docs/user-guide/features/memory
    accessed: 2026-10-22
  - title: "Hermes Agent docs: MCP"
    url: https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp
    accessed: 2026-10-22
  - title: "Hermes Agent docs: Skills system"
    url: https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
    accessed: 2026-10-22
  - title: Pi README (earendil-works/pi)
    url: https://github.com/earendil-works/pi
    accessed: 2026-10-22
  - title: "Pi docs: MCP servers"
    url: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/mcp.md
    accessed: 2026-10-22
  - title: "Pi docs: Sessions and context"
    url: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md
    accessed: 2026-10-22
  - title: "Pi docs: Use Pi in the terminal"
    url: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/usage.md
    accessed: 2026-10-22
  - title: "Pi docs: Skills"
    url: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md
    accessed: 2026-10-22
  - title: "Pi docs: Providers"
    url: https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/providers.md
    accessed: 2026-10-22
last_verified: 2026-10-22
published: 2026-10-22
---

All three projects are MIT-licensed, run on your own machine and work with many model providers, but they aim at different jobs:

- **[OpenClaw](entry:openclaw)** is a *personal assistant platform*. A long-running Gateway connects the agent to the chat apps you already use, and plugins, skills and companion apps add capabilities.
- **[Hermes Agent](entry:hermes-agent)** is a *self-improving agent*. It keeps small curated memory files, writes and refines its own skills, schedules its own jobs and talks to you from a terminal, a desktop app or chat platforms.
- **[Pi](entry:pi-coding-agent)** is a *minimal coding harness and toolkit*. The core stays small, and you add what you need with TypeScript extensions, skills and packages, or embed it in your own app.

They borrow from one another. OpenClaw's README credits Pi. Hermes' Skills Hub can install skills from [ClawHub](entry:clawhub). Both OpenClaw and Hermes offer [Honcho](entry:honcho) as a memory plugin. Third-party memory layers such as [memU](entry:memu) document adapters for OpenClaw and Hermes.

## How they differ in practice

**Reaching it.** OpenClaw and Hermes are built for "message my agent from my phone". Both run a gateway that controls who may message the agent (DM pairing and allowlists; OpenClaw pairs unknown senders by default). Pi lives in a terminal, or inside your program over RPC or the SDK. Chat front ends for Pi are a separate project (pi-chat).

**Memory.** OpenClaw and Hermes both use plain Markdown files the agent writes, `USER.md` and `MEMORY.md`, but they manage them differently. OpenClaw adds daily notes, indexed search and a background "dreaming" pass that distills notes into long-term memory. Hermes keeps both files under hard character limits (2,200 and 1,375) and makes the agent consolidate when a file is full. Pi only keeps resumable, branchable session histories. For memory, add an extension or an external layer (see [Memory layers for AI agents](comparison:agent-memory-layers) and [Give an agent long-term memory](guide:give-an-agent-long-term-memory)).

**Skills and MCP.** All three load [Agent Skills](entry:agent-skills-spec) and act as [MCP](entry:model-context-protocol) clients for local stdio and remote HTTP servers. OpenClaw can also *be* an MCP server (`openclaw mcp serve`), so Claude Code, Codex and other MCP clients can read and send its channel conversations. Hermes is the only one where creating and maintaining skills is a core feature: the agent writes them after complex tasks, and a background Curator reviews their usage and staleness.

**Automation.** OpenClaw and Hermes include schedulers (cron-style automations and natural-language cron jobs) and can deliver results to a chat. Pi leaves scheduling to you. Its print/JSON mode and RPC make it easy to run from cron or CI.

## Safety: read this before you connect a chat app

None of the three sandboxes tool execution by default:

- **OpenClaw** runs tools on the host for the main session until you configure a sandbox backend (Docker, Podman, SSH, OpenShell or Crabbox). Its docs say sandboxing "is not a perfect security boundary". They also say a gateway is one trust boundary and is not meant for mutually untrusted users. Run `openclaw security audit` after you change the config.
- **Hermes Agent** checks every shell command against a list of dangerous patterns, and by default (`approvals.mode: smart`) auto-approves low-risk commands, auto-denies clearly dangerous ones and asks you about the rest. Cron jobs and unattended surfaces deny by default. `--yolo` or `approvals.mode: off` turns all of this off. For isolation, choose a Docker, Singularity, Modal, Daytona or Vercel Sandbox terminal backend.
- **Pi** has no permission system and does not ask before tool calls. Its docs tell you to review its work and to use a container or micro-VM for untrusted or unattended work.

All three read messages, web pages and files written by other people, so treat prompt injection as a when, not an if. Give the agent the fewest tools it needs, keep approvals on for anything with side effects, and test it: [Test a tool-using agent for prompt injection with AgentDojo](guide:test-an-agent-for-prompt-injection) shows how to measure the hijack rate. For isolation options, see [Self-hosted sandboxes for agents compared](comparison:self-hosted-agent-sandboxes).

## Related

If you want a coding agent rather than a personal assistant, [Terminal coding agents compared](comparison:coding-agent-harnesses) covers [Claude Code](entry:claude-code), [Codex CLI](entry:codex-cli) and others. For skill registries and installers, see [Agent skill packs, skills CLIs and registries](comparison:agent-skill-packs-and-installers).
