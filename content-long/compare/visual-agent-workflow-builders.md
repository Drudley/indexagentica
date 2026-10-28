---
id: visual-agent-workflow-builders
type: comparison
title: "Visual agent workflow builders compared: Langflow vs Dify vs n8n"
summary: "Three self-hostable visual canvases for building agents and AI workflows, compared on license, self-hosting, MCP support in both directions, code escape hatches, hosted options and what each is best at. Includes a note on Flowise, whose repo is archived."
description: "A primary-source comparison of Langflow, Dify and n8n, checked on 2026-10-28 against each project's GitHub README, LICENSE file, latest release and official docs (including their llms.txt indexes). Prices for hosted plans change often, so we link the pricing pages instead of quoting them. Star counts and feature claims are as published by the projects."
author: Agentica Author
tags: [visual-builder, low-code, workflows, agents, mcp, self-hosted, rag, automation]
entries: [langflow, dify, n8n, langgraph, llamaindex, zapier-mcp, pipedream-mcp, fastmcp, langsmith, langfuse]
related: [coding-agent-harnesses, publish-an-mcp-server, connect-an-agent-to-a-remote-mcp-server, mcp-server-frameworks, agent-observability-platforms, research-agent]
subjects: [langflow, dify, n8n]
criteria:
  - Best at
  - License
  - Self-host
  - Use MCP servers
  - Expose as MCP / API
  - Code escape hatch
  - Hosted option
  - Latest release
rows:
  langflow:
    Best at: "Prototyping agent and RAG flows in Python, then serving them as APIs or MCP tools"
    License: "MIT"
    Self-host: "uv pip install langflow, then uv run langflow run (Python 3.10-3.14, port 7860); Langflow Desktop for Windows and macOS"
    Use MCP servers: "Yes, as an MCP client inside flows"
    Expose as MCP / API: "Every flow as a REST API endpoint or as tools on Langflow's built-in MCP server; flows also export as JSON"
    Code escape hatch: "Edit any component's Python source"
    Hosted option: "None described in the README; Langflow Desktop is a local app"
    Latest release: "v1.13.0 (2026-10-22)"
  dify:
    Best at: "Shipping LLM apps with RAG, a prompt IDE, logs and annotations for a team"
    License: "Dify Open Source License: Apache 2.0 plus conditions (no multi-tenant service without permission; keep the console logo and copyright)"
    Self-host: "docker compose up -d from the docker/ folder (Docker Compose v2.24.0+)"
    Use MCP servers: "Yes, agents can use MCP servers alongside Dify Marketplace tools and skills"
    Expose as MCP / API: "Every app has an API (backend-as-a-service); apps can be published as MCP servers"
    Code escape hatch: "Sandboxed agents run commands, install software and handle files; tools and plugins from Dify Marketplace"
    Hosted option: "Dify Cloud (plans at dify.ai/pricing) and Dify Enterprise"
    Latest release: "1.18.0 (2026-10-23)"
  n8n:
    Best at: "Connecting agents to business systems: 1,500+ integrations, triggers, approvals and schedules"
    License: "Sustainable Use License (fair-code, not OSI open source); .ee files need an Enterprise License"
    Self-host: "docker run -p 5678:5678 docker.n8n.io/n8nio/n8n, or the get.n8n.io install script"
    Use MCP servers: "Yes, MCP Client node, plus one-click servers from n8n's MCP registry"
    Expose as MCP / API: "MCP Server Trigger node turns a workflow into an MCP server; instance-level MCP lets Claude, Codex and others search, run, create and edit workflows (create/edit from 2.13)"
    Code escape hatch: "JavaScript and Python code nodes with npm packages"
    Hosted option: "n8n Cloud with a free trial, then Starter, Pro or Enterprise plans"
    Latest release: "n8n@2.45.4 (2026-10-26)"
verdict: "Want an MIT-licensed builder for agent and RAG logic that becomes an API or MCP server? Langflow. Want a team platform for LLM apps with RAG, prompt tooling, logs and a managed cloud? Dify, but read its license if you plan to offer it to multiple customers as a service. Want agents that act across many SaaS systems with triggers, schedules and human approvals, or want Claude and Codex to build workflows for you? n8n, which is fair-code rather than open source. All three can both use MCP servers and be used from MCP clients."
sources:
  - {title: "Langflow README", url: "https://github.com/langflow-ai/langflow", accessed: 2026-10-28}
  - {title: "Langflow v1.13.0 release", url: "https://github.com/langflow-ai/langflow/releases/tag/v1.13.0", accessed: 2026-10-28}
  - {title: "Langflow docs index (llms.txt)", url: "https://docs.langflow.org/llms.txt", accessed: 2026-10-28}
  - {title: "Dify README", url: "https://github.com/langgenius/dify", accessed: 2026-10-28}
  - {title: "Dify LICENSE", url: "https://github.com/langgenius/dify/blob/main/LICENSE", accessed: 2026-10-28}
  - {title: "Dify docs: publish an app as an MCP server", url: "https://docs.dify.ai/en/cloud/use-dify/publish/publish-mcp.md", accessed: 2026-10-28}
  - {title: "Dify 1.18.0 release", url: "https://github.com/langgenius/dify/releases/tag/1.18.0", accessed: 2026-10-28}
  - {title: "n8n README", url: "https://github.com/n8n-io/n8n", accessed: 2026-10-28}
  - {title: "n8n LICENSE.md", url: "https://github.com/n8n-io/n8n/blob/master/LICENSE.md", accessed: 2026-10-28}
  - {title: "n8n docs: Use n8n MCP server", url: "https://docs.n8n.io/build/ways-of-building-workflows/connect-to-n8n-mcp-server.md", accessed: 2026-10-28}
  - {title: "n8n docs index (llms.txt)", url: "https://docs.n8n.io/llms.txt", accessed: 2026-10-28}
  - {title: "Flowise repository (archived)", url: "https://github.com/FlowiseAI/Flowise", accessed: 2026-10-28}
last_verified: 2026-10-28
published: 2026-10-28
---

All three give you a canvas where you wire models, tools, memory and data into an agent or workflow, and all three self-host with one command. They come from different starting points, and that still shows. [Langflow](entry:langflow) started as a visual front end for LLM chains in Python. [Dify](entry:dify) is an app platform for LLM products, with RAG, prompt tooling and logs. [n8n](entry:n8n) is a workflow automation tool, like Zapier, that added AI agents.

If you'd rather write the agent in code, see the frameworks in [Coding agent harnesses compared](comparison:coding-agent-harnesses) and entries such as [LangGraph](entry:langgraph) and [LlamaIndex](entry:llamaindex). The builders here are for teams that want a canvas, faster iteration, or non-developers editing flows.

## MCP works in both directions

This is the most useful recent change across all three:

- **Using MCP servers.** Langflow flows, Dify agents and n8n's MCP Client node can all call external MCP servers. Any server in this directory can be a tool on the canvas.
- **Being an MCP server.** Langflow serves flows as tools on its built-in MCP server. Dify can publish an app as an MCP server. n8n's MCP Server Trigger node exposes a workflow, and its instance-level MCP server goes further: an MCP client like Claude or Codex can search and run workflows, and from n8n 2.13 create and edit them. So a coding agent can build the automation for you.

That makes these tools a quick way to put a custom, multi-step tool behind MCP without writing a server. If you need full control over the tool schema, auth and hosting, write a server instead ([MCP server frameworks compared](comparison:mcp-server-frameworks), [Publish an MCP server](guide:publish-an-mcp-server)).

## Licenses differ more than the canvases do

- **Langflow** is MIT. No conditions.
- **Dify** uses its own "Open Source License": Apache 2.0 plus two conditions. You can't run a multi-tenant service from the source (one tenant = one workspace) without written permission, and you can't remove the logo or copyright from the console. Internal use and use as a backend are allowed. GitHub can't classify it, so it shows as NOASSERTION.
- **n8n** is under the Sustainable Use License, which n8n calls "fair-code". The source is public, but it isn't an OSI open-source license. Files with `.ee.` in the name need an n8n Enterprise License.

If you plan to resell hosted access to a builder, this is the first thing to check, not the last.

## Hosted options

Dify Cloud and n8n Cloud are first-party hosted versions with free starting points (see [dify.ai/pricing](https://dify.ai/pricing) and n8n's "Choose how to use n8n" docs). The Langflow README describes local installs and Langflow Desktop, not a hosted service. We left prices out because they change often.

## Observability

Langflow lists [LangSmith](entry:langsmith) and [Langfuse](entry:langfuse) integrations. Dify has built-in logs and annotations ("LLMOps"). n8n's README lists full observability for AI workflows. For tracing across tools, see [Agent observability platforms compared](comparison:agent-observability-platforms).

## What about Flowise?

Flowise, another popular visual agent builder, has an archived GitHub repository (checked 2026-10-28), so it isn't compared here. If you're starting fresh, pick one of the three above. If you run Flowise now, plan a migration.
