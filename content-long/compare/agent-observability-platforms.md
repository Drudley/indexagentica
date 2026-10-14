---
id: agent-observability-platforms
type: comparison
title: Observability and eval platforms for AI agents
summary: Langfuse, LangSmith, Arize Phoenix, Braintrust, Opik and Laminar compared on license, self-hosting, OpenTelemetry ingestion, MCP access to your traces, free tiers, paid entry prices and built-in evaluation.
description: "A primary-source comparison of six platforms that trace agent runs and score them. Prices, allowances and retention are from each vendor's pricing page on 2026-10-12. The vendors meter different things (units, base traces, spans, GB of processed data), so convert your own traffic before comparing on price."
author: Agentica Author
tags: [observability, evals, tracing, opentelemetry, mcp]
entries: [langfuse, langsmith, arize-phoenix, braintrust, opik, laminar, helicone, otel-genai-semconv, openllmetry, promptfoo, deepeval, inspect-ai, wandb-weave]
related: [evaluate-an-ai-agent, coding-agent-harnesses, research-agent, connect-an-agent-to-a-remote-mcp-server]
subjects: [langfuse, langsmith, arize-phoenix, braintrust, opik, laminar]
criteria:
  - License
  - Self-host
  - OpenTelemetry ingest
  - MCP access to your data
  - Free cloud tier
  - Paid entry
  - Evaluation built in
rows:
  langfuse:
    License: "MIT for the core; ee/ folders under a separate commercial license"
    Self-host: "Free with no usage limits; Docker Compose for testing, Helm or Terraform (AWS, Azure, GCP) for production. Needs Postgres, ClickHouse, Redis or Valkey, and S3-compatible storage"
    OpenTelemetry ingest: "Yes: OTLP at /api/public/otel with Basic auth (cloud regions or your own host)"
    MCP access to your data: "Native MCP server at /api/public/mcp (Basic auth); read and write tools on by default. Separate public docs MCP"
    Free cloud tier: "Hobby: 50k units/month, 30 days data access, 2 users, no card"
    Paid entry: "Core $29/mo with 100k units, then $8 per 100k (lower with volume); Pro $199/mo"
    Evaluation built in: "LLM-as-a-judge, code evaluators, datasets and experiments (including in CI), human annotation queues"
  langsmith:
    License: "Closed platform; SDKs are open source (MIT)"
    Self-host: "Enterprise add-on only, with a license key"
    OpenTelemetry ingest: "Yes: OTLP at https://api.smith.langchain.com/otel (regional hosts for EU, APAC, AWS)"
    MCP access to your data: "Hosted remote MCP on all cloud regions, OAuth 2.1 or X-Api-Key; also on self-hosted v0.16+. The standalone server repo is archived"
    Free cloud tier: "Developer: 1 seat, 5k base traces/month (base traces kept 14 days)"
    Paid entry: "Plus $39 per seat/month with 10k base traces, then pay as you go"
    Evaluation built in: "Online and offline evals, datasets; Tuned Evaluators billed per run"
  arize-phoenix:
    License: "Elastic License 2.0 (source-available; Arize calls it open source)"
    Self-host: "Free with no feature gates; run locally from the CLI, in Docker or on Kubernetes"
    OpenTelemetry ingest: "Built on OpenTelemetry with OpenInference conventions; OTLP to your Phoenix server (localhost:6006 by default)"
    MCP access to your data: "Remote MCP built into the server at /mcp (beta, Phoenix 19.0.0+); older npm MCP package in maintenance mode"
    Free cloud tier: "Phoenix itself is self-hosted. Arize's managed product AX Free gives 25k spans/month, 1 GB, 15-day retention"
    Paid entry: "AX Pro $50/mo with 50k spans, 10 GB, 30-day retention"
    Evaluation built in: "LLM-as-judge evals (pre-built and custom, client or server side), datasets and experiments"
  braintrust:
    License: "Closed platform; SDKs Apache-2.0, autoevals MIT"
    Self-host: "Enterprise: on-prem or hosted deployment; self-hosted data plane with Terraform modules"
    OpenTelemetry ingest: "Yes: OTLP at https://api.braintrust.dev/otel with a Bearer API key and x-bt-parent header"
    MCP access to your data: "Hosted remote MCP at https://api.braintrust.dev/mcp, OAuth or API key; EU and self-hosted endpoints"
    Free cloud tier: "Starter: 1 GB processed data, 10k scores, 14-day retention, $10 model credits, unlimited users"
    Paid entry: "Pro $249/mo with 5 GB (+$3/GB), 50k scores (+$1.50 per 1k), 30-day retention"
    Evaluation built in: "LLM-as-a-judge, autoevals and custom code scorers; experiments, datasets, playgrounds, human review scores"
  opik:
    License: Apache-2.0
    Self-host: "Free; same codebase as the hosted versions. Docker Compose locally, Helm on Kubernetes"
    OpenTelemetry ingest: "Yes: OTLP at /opik/api/v1/private/otel on Comet cloud, or /api/v1/private/otel self-hosted"
    MCP access to your data: "Hosted MCP at https://www.comet.com/opik/api/v1/mcp with OAuth, or local uvx opik-mcp with an API key"
    Free cloud tier: "Free Cloud: 25k spans/month, 60-day retention, up to 10 team members"
    Paid entry: "Pro Cloud $19/mo with 100k spans/month, up to 50 members"
    Evaluation built in: "Test suites and assertions, datasets and experiments, custom metrics, Agent Playground, prompt optimization"
  laminar:
    License: Apache-2.0
    Self-host: "Free OSS images with Docker Compose, or Helm; Signals and Slack alerts need an enterprise license"
    OpenTelemetry ingest: "Yes: OTLP over gRPC, HTTP/protobuf or HTTP/JSON, cloud and self-hosted"
    MCP access to your data: "Remote MCP at https://api.lmnr.ai/v1/mcp with a project API key; read-only SQL, trace context and an ask-agent tool"
    Free cloud tier: "Free: 1 GB data with no overage, 7-day retention, 1 project, 1 seat"
    Paid entry: "Starter $30/mo with 3 GB, then $2/GB, 30-day retention; Pro $150/mo"
    Evaluation built in: "Evaluations with run comparison (also self-hosted); agent debugger with record and replay"
verdict: "To self-host a permissively licensed platform at no cost, pick Langfuse (MIT core) or Opik (Apache-2.0); Opik also has the cheapest paid cloud tier here. Phoenix is free to self-host with no feature gates, but under ELv2. LangSmith suits LangChain and LangGraph teams that are happy with SaaS. Braintrust centers on evals, and its free tier allows unlimited users. Laminar is built around agent traces and gives agents read-only SQL over MCP. All six accept OTLP, so instrument with OpenTelemetry and keep the option to switch."
sources:
  - {title: Langfuse cloud pricing, url: "https://langfuse.com/pricing", accessed: 2026-10-12}
  - {title: Langfuse self-hosted pricing and license, url: "https://langfuse.com/pricing-self-host", accessed: 2026-10-12}
  - {title: Langfuse self-hosting, url: "https://langfuse.com/self-hosting", accessed: 2026-10-12}
  - {title: Langfuse OpenTelemetry integration, url: "https://langfuse.com/integrations/native/opentelemetry", accessed: 2026-10-12}
  - {title: Langfuse MCP server, url: "https://langfuse.com/docs/api-and-data-platform/features/mcp-server", accessed: 2026-10-12}
  - {title: Langfuse LICENSE, url: "https://github.com/langfuse/langfuse/blob/main/LICENSE", accessed: 2026-10-12}
  - {title: LangSmith pricing, url: "https://www.langchain.com/pricing", accessed: 2026-10-12}
  - {title: LangSmith self-hosted, url: "https://docs.langchain.com/langsmith/self-hosted", accessed: 2026-10-12}
  - {title: Trace with OpenTelemetry (LangSmith), url: "https://docs.langchain.com/langsmith/trace-with-opentelemetry", accessed: 2026-10-12}
  - {title: LangSmith Remote MCP, url: "https://docs.langchain.com/langsmith/langsmith-remote-mcp", accessed: 2026-10-12}
  - {title: "LangSmith MCP Server (standalone, deprecated)", url: "https://docs.langchain.com/langsmith/langsmith-mcp-server", accessed: 2026-10-12}
  - {title: langsmith-sdk repository, url: "https://github.com/langchain-ai/langsmith-sdk", accessed: 2026-10-12}
  - {title: Phoenix license, url: "https://arize.com/docs/phoenix/self-hosting/license", accessed: 2026-10-12}
  - {title: Phoenix LICENSE (Elastic License 2.0), url: "https://github.com/Arize-ai/phoenix/blob/main/LICENSE", accessed: 2026-10-12}
  - {title: Phoenix docs index (llms.txt), url: "https://arize.com/docs/phoenix/llms.txt", accessed: 2026-10-12}
  - {title: Phoenix setup using phoenix.otel, url: "https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing/setup-using-phoenix-otel", accessed: 2026-10-12}
  - {title: Phoenix Remote MCP Server, url: "https://arize.com/docs/phoenix/integrations/remote-mcp", accessed: 2026-10-12}
  - {title: Arize pricing, url: "https://arize.com/pricing/", accessed: 2026-10-12}
  - {title: Braintrust pricing, url: "https://www.braintrust.dev/pricing", accessed: 2026-10-12}
  - {title: Send OpenTelemetry traces and logs to Braintrust, url: "https://braintrust.dev/docs/integrations/sdk-integrations/opentelemetry/send-traces-and-logs", accessed: 2026-10-12}
  - {title: Braintrust MCP, url: "https://braintrust.dev/docs/integrations/developer-tools/mcp", accessed: 2026-10-12}
  - {title: Braintrust docs index (llms.txt), url: "https://www.braintrust.dev/docs/llms.txt", accessed: 2026-10-12}
  - {title: Comet and Opik pricing, url: "https://www.comet.com/site/pricing/", accessed: 2026-10-12}
  - {title: Opik OpenTelemetry integration, url: "https://www.comet.com/docs/opik/integrations/opentelemetry", accessed: 2026-10-12}
  - {title: Opik MCP server advanced setup, url: "https://www.comet.com/docs/opik/mcp-server/advanced-setup", accessed: 2026-10-12}
  - {title: Opik self-hosting overview, url: "https://www.comet.com/docs/opik/self-host/overview", accessed: 2026-10-12}
  - {title: comet-ml/opik repository, url: "https://github.com/comet-ml/opik", accessed: 2026-10-12}
  - {title: Laminar pricing, url: "https://laminar.sh/pricing", accessed: 2026-10-12}
  - {title: Laminar OpenTelemetry, url: "https://laminar.sh/docs/tracing/otel", accessed: 2026-10-12}
  - {title: Laminar MCP server, url: "https://laminar.sh/docs/platform/mcp", accessed: 2026-10-12}
  - {title: Self-hosting Laminar, url: "https://laminar.sh/docs/self-hosting/overview", accessed: 2026-10-12}
  - {title: Helicone is joining Mintlify, url: "https://www.helicone.ai/blog/joining-mintlify", accessed: 2026-10-12}
  - {title: Helicone pricing, url: "https://www.helicone.ai/pricing", accessed: 2026-10-12}
last_verified: 2026-10-12
published: 2026-10-12
---

## What this compares

These six platforms record what an agent did, step by step (model calls, tool calls, retrievals), and let you score those runs, both offline against datasets and online on production traffic. The table covers what decides a choice: whether you can run it yourself and under what license, whether it accepts standard OpenTelemetry, whether your coding agent can read your traces over MCP, and what the free and entry-level plans include.

Prices, allowances and retention come from each vendor's pricing page on 2026-10-12. The vendors meter different things. Langfuse counts units (every trace, observation and score). LangSmith counts base traces. Phoenix's managed sibling Arize AX and Opik count spans. Braintrust and Laminar count GB of processed data. One agent run can be a single LangSmith trace but dozens of Langfuse units or spans, so convert your own traffic before comparing.

## Pick by situation

- **Data must stay on your infrastructure, at no license cost.** [Langfuse](entry:langfuse) (MIT core, no usage limits self-hosted), [Opik](entry:opik) (Apache-2.0, same codebase as its cloud) and [Laminar](entry:laminar) (Apache-2.0, minus Signals and Slack alerts) are permissively licensed. [Arize Phoenix](entry:arize-phoenix) is also free to self-host with no feature gates, but under the Elastic License 2.0, which restricts offering it as a managed service. [LangSmith](entry:langsmith) and [Braintrust](entry:braintrust) self-host only on Enterprise plans.
- **You want your coding agent to debug from traces.** All six now expose an MCP server for your own data. Laminar's is read-only, with SQL scoped to your project. Langfuse's has write tools on by default, so restrict it with a tool allowlist if the agent should only read. LangSmith, Braintrust and Opik offer OAuth for interactive clients. See [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server) for client setup.
- **You expect to switch later.** Every platform here accepts OTLP. Instrument with OpenTelemetry and the [GenAI semantic conventions](entry:otel-genai-semconv), or with [OpenLLMetry](entry:openllmetry) (Apache-2.0), rather than only a vendor SDK, and switching platforms becomes mostly a change of exporter endpoint and headers.
- **A team on a small budget.** Braintrust Starter allows unlimited users, and Opik's Free Cloud allows up to 10 members with 60-day retention. LangSmith Developer is one seat, Laminar Free is one seat and one project, and Langfuse Hobby is two users.

## Tracing an agent harness

Several of these platforms document tracing coding agents directly: Langfuse, Opik and Braintrust each have integration pages for Claude Code, Codex and others, and Phoenix has one for Cursor. That is useful if you run agents from the [coding agent harnesses](comparison:coding-agent-harnesses) comparison and want to see what they did.

## Eval-only tools

If you only need tests in CI and no hosted trace store, a framework may be enough. [promptfoo](entry:promptfoo) (MIT) does evals and red-teaming from config files. [DeepEval](entry:deepeval) (Apache-2.0) is a pytest-style metrics library. [Inspect](entry:inspect-ai) (MIT, UK AI Security Institute) is built for model and agent evaluations. Most of the platforms above can ingest their results or run similar scorers.

## Not in the table

- **[Helicone](entry:helicone)** was acquired by Mintlify in March 2026. Its own announcement says the service stays live "in maintenance mode" with security updates, new models and bug fixes. It is still an option as an LLM gateway with logging (free Hobby plan with 10,000 requests), but weigh that status before you build on it.
- **[W&B Weave](entry:wandb-weave)** (Apache-2.0) is the Weights & Biases tracing and evaluation toolkit. We left it out of the table because we couldn't confirm its current plan limits from a primary source on the day.

## What we left out

- LangSmith's per-trace overage price: the pricing page says "pay as you go" without listing the rate in its static content.
- Ingestion speed, query latency and "best for agents" claims: none of the vendors publish benchmarks we could reproduce.
- Exact MCP tool lists, which change often. Check each vendor's MCP page, linked in the sources.
