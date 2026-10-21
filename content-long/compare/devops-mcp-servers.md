---
id: devops-mcp-servers
type: comparison
title: DevOps and observability MCP servers compared
summary: "Eight official MCP servers for infrastructure and operations work (Kubernetes, Terraform, Buildkite, Azure DevOps, Heroku, Datadog, Grafana and Sentry) compared on what they cover, where they run, how they authenticate and how far their read-only modes actually go."
description: "A primary-source comparison of MCP servers that let an agent look at, and sometimes change, clusters, infrastructure, CI pipelines, deployments and production telemetry. Tool counts for five servers were checked on 2026-10-20 by starting them and calling tools/list with and without their read-only settings; Azure DevOps, Heroku and Datadog are described from their docs."
author: Agentica Author
tags: [mcp, devops, sre, observability, kubernetes, ci-cd, read-only, security, mcp-servers]
entries: [kubernetes-mcp-server, terraform-mcp-server, buildkite-mcp-server, azure-devops-mcp-server, heroku-mcp-server, datadog-mcp-server, grafana-mcp, sentry-mcp, github-mcp-server, gitlab-mcp-server, aws-mcp-servers, cloudflare-mcp, kubernetes-agent-sandbox, mcp-authorization, toolathlon]
related: [pick-an-mcp-server, database-mcp-servers, connect-an-agent-to-a-remote-mcp-server, agent-auth-and-delegated-access, agent-identity-and-mcp-auth, add-mcp-servers-to-claude-code, agent-observability-platforms, self-hosted-agent-sandboxes, mcp-gateways]
subjects: [kubernetes-mcp-server, terraform-mcp-server, buildkite-mcp-server, azure-devops-mcp-server, heroku-mcp-server, datadog-mcp-server, grafana-mcp, sentry-mcp]
criteria:
  - Covers
  - Where it runs
  - Auth
  - Read-only and write controls
  - Tools we counted
  - License
rows:
  kubernetes-mcp-server:
    Covers: "Any Kubernetes or OpenShift resource (generic CRUD), pods (logs, exec, run, top), events, namespaces, nodes; optional toolsets for Helm, Tekton, KubeVirt, Kiali and more"
    Where it runs: "You run it: single Go binary, npx, uvx or container; stdio by default, Streamable HTTP at /mcp when port is set; uses your kubeconfig or in-cluster config"
    Auth: "Kubernetes credentials from kubeconfig or the pod's ServiceAccount; optional OAuth in HTTP mode"
    Read-only and write controls: "TOML read_only = true keeps only readOnlyHint tools; disable_destructive = true drops delete/update tools but keeps pods_run; toolsets limit what is loaded"
    Tools we counted: "v0.0.67, default toolsets: 20 tools; read_only: 14; disable_destructive: 15"
    License: "Apache-2.0"
  terraform-mcp-server:
    Covers: "Terraform Registry search (providers, modules, policies); with a token, HCP Terraform / Terraform Enterprise orgs, workspaces, variables, runs, plans, state and teams"
    Where it runs: "You run it: binary or Docker; stdio or Streamable HTTP, with an organization allowlist and token pass-through for central deployments"
    Auth: "None for the public registry; TFE_TOKEN for HCP Terraform / Enterprise"
    Read-only and write controls: "No token means registry-only (read). ENABLE_TF_OPERATIONS (default false) gates the tools that need explicit approval; in our run it added action_run, delete_project, delete_team, delete_workspace_safely and force_unlock_workspace"
    Tools we counted: "v1.3.0: 9 tools with no token; 56 with a token; 61 with a token and ENABLE_TF_OPERATIONS=true"
    License: "MPL-2.0"
  buildkite-mcp-server:
    Covers: "Pipelines, builds, jobs, logs, artifacts, annotations, clusters and queues, Test Engine runs and tests; build comparison and failure summaries"
    Where it runs: "Hosted by Buildkite at mcp.buildkite.com (recommended), or run the Go server yourself over stdio or HTTP"
    Auth: "Hosted: OAuth at /mcp, or a Buildkite API token as a bearer token at /direct. Local: BUILDKITE_API_TOKEN"
    Read-only and write controls: "Hosted read-only endpoint /mcp/readonly; local --read-only; --enabled-toolsets (a retries toolset can retry jobs without write_builds); token scopes still apply"
    Tools we counted: "v1.28.0 local: 72 tools; with --read-only: 49"
    License: "MIT"
  azure-devops-mcp-server:
    Covers: "Projects, teams, repos and pull requests, work items, pipelines and builds, wikis, test plans, iterations, Advanced Security alerts"
    Where it runs: "Hosted remote server at mcp.dev.azure.com/{organization} (recommended; will replace the local one) or local stdio via npx @azure-devops/mcp (Node.js 20+)"
    Auth: "Remote: Microsoft Entra ID (OAuth); local: PAT or Entra ID. Docs say Claude Desktop and Codex need the local server, and Cursor and Claude Code need a custom Entra app registration for the remote one"
    Read-only and write controls: "X-MCP-Readonly header restricts the remote server to read-only tools; local server can load selected domains only"
    Tools we counted: "Not counted: the local server would not start here (its keytar dependency needs libsecret); see Microsoft's tool tables"
    License: "MIT"
  heroku-mcp-server:
    Covers: "Apps (create, deploy, info), dynos and scaling, add-ons, logs and maintenance mode, pipelines, teams and Private Spaces, Heroku Postgres"
    Where it runs: "You run it locally over stdio; needs the Heroku CLI 10.8.1 or later"
    Auth: "heroku mcp:start reuses the CLI login; npx @heroku/mcp-server takes HEROKU_API_KEY"
    Read-only and write controls: "No read-only switch documented in the README; limit what the logged-in account can do. Heroku calls the server early development"
    Tools we counted: "Not counted (needs the Heroku CLI)"
    License: "Apache-2.0"
  datadog-mcp-server:
    Covers: "Logs, metrics, traces/APM, monitors, dashboards, incidents, security signals and more, grouped into toolsets"
    Where it runs: "Managed by Datadog only; one endpoint per Datadog site (US1 mcp.datadoghq.com/v1/mcp, EU mcp.datadoghq.eu); not on GovCloud sites"
    Auth: "OAuth, or a personal/service access token, or API + application keys as headers"
    Read-only and write controls: "Runs with the signed-in user's permissions, so RBAC and data access controls apply; write tools need the matching permission (e.g. monitors_write); toolsets and omit_tools trim the list; every call is in Audit Trail"
    Tools we counted: "Not counted (needs a Datadog account). Fair-use limits: 50 requests per 10 s, 100,000 tool calls a month"
    License: "Not stated (hosted service; the GitHub repo holds examples)"
  grafana-mcp:
    Covers: "Dashboards, data sources, Prometheus, Loki, Tempo and Pyroscope queries, alerting, incidents, OnCall, Sift investigations, annotations, snapshots, plugins"
    Where it runs: "You run it: Go binary, Docker or Helm; stdio, SSE or Streamable HTTP; works with self-hosted Grafana and Grafana Cloud"
    Auth: "Grafana service account token (or per-request headers over Streamable HTTP)"
    Read-only and write controls: "--disable-write removes create/update/delete tools and switches alerting tools and grafana_api_request to read-only (GET only); --disable-<category> and --enable-write-tools fine-tune it"
    Tools we counted: "v1.6.3: 81 tools; with --disable-write: 65, all annotated readOnlyHint"
    License: "Apache-2.0"
  sentry-mcp:
    Covers: "Organizations, projects, issues and events search, issue updates, Seer analysis; built for human-in-the-loop debugging in coding agents rather than all of Sentry"
    Where it runs: "Hosted by Sentry at mcp.sentry.dev/mcp, or stdio via npx @sentry/mcp-server (also for self-hosted Sentry with --host)"
    Auth: "Hosted: OAuth, or a Sentry token sent as Sentry-Bearer; local: a user auth token"
    Read-only and write controls: "Skills select tool groups (--skills / ?skills=, e.g. inspect without triage drops update_issue); --disable-skills removes groups; token scopes still apply"
    Tools we counted: "v0.42.0 stdio: 9 tools by default; --skills=inspect: 7; --skills=inspect,triage: 8"
    License: "FSL-1.1-Apache-2.0"
verdict: "For an investigation or on-call agent, start read-only everywhere: Grafana with --disable-write, Buildkite's /mcp/readonly, Azure DevOps with X-MCP-Readonly, Kubernetes with read_only = true and a read-only ServiceAccount, Terraform without ENABLE_TF_OPERATIONS, Sentry with the inspect skill. Datadog and Heroku have no server-side read-only switch, so their safety comes from the user or account you connect as. Add write access one tool group at a time, and only where a human approves the call."
sources:
  - {title: Kubernetes MCP Server README, url: "https://github.com/containers/kubernetes-mcp-server", accessed: 2026-10-20}
  - {title: Kubernetes MCP Server configuration reference, url: "https://github.com/containers/kubernetes-mcp-server/blob/main/docs/configuration.md", accessed: 2026-10-20}
  - {title: Terraform MCP Server README, url: "https://github.com/hashicorp/terraform-mcp-server", accessed: 2026-10-20}
  - {title: Terraform MCP Server docs, url: "https://developer.hashicorp.com/terraform/mcp-server", accessed: 2026-10-20}
  - {title: Buildkite MCP server overview, url: "https://buildkite.com/docs/apis/mcp-server", accessed: 2026-10-20}
  - {title: Buildkite MCP Server README, url: "https://github.com/buildkite/buildkite-mcp-server", accessed: 2026-10-20}
  - {title: Azure DevOps remote MCP Server, url: "https://learn.microsoft.com/en-us/azure/devops/mcp-server/remote-mcp-server?view=azure-devops", accessed: 2026-10-20}
  - {title: Azure DevOps MCP Server README, url: "https://github.com/microsoft/azure-devops-mcp", accessed: 2026-10-20}
  - {title: Heroku MCP Server README, url: "https://github.com/heroku/heroku-mcp-server", accessed: 2026-10-20}
  - {title: "Heroku Dev Center, Heroku MCP Server", url: "https://devcenter.heroku.com/articles/heroku-mcp-server", accessed: 2026-10-20}
  - {title: Datadog MCP Server, url: "https://docs.datadoghq.com/mcp_server/", accessed: 2026-10-20}
  - {title: Set Up the Datadog MCP Server, url: "https://docs.datadoghq.com/mcp_server/setup/", accessed: 2026-10-20}
  - {title: Grafana MCP server README, url: "https://github.com/grafana/mcp-grafana", accessed: 2026-10-20}
  - {title: "Sentry Toolkit README (Sentry MCP)", url: "https://github.com/getsentry/toolkit", accessed: 2026-10-20}
  - {title: Sentry Toolkit license, url: "https://github.com/getsentry/toolkit/blob/main/LICENSE.md", accessed: 2026-10-20}
last_verified: 2026-10-20
published: 2026-10-20
---

## What this covers

These are the official MCP servers an operations or on-call agent is most likely to be given: the cluster ([Kubernetes MCP Server](entry:kubernetes-mcp-server)), infrastructure as code ([Terraform](entry:terraform-mcp-server)), CI ([Buildkite](entry:buildkite-mcp-server), [Azure DevOps](entry:azure-devops-mcp-server)), a PaaS ([Heroku](entry:heroku-mcp-server)) and production telemetry ([Datadog](entry:datadog-mcp-server), [Grafana](entry:grafana-mcp), [Sentry](entry:sentry-mcp)). For source hosting and pull requests, see the [GitHub](entry:github-mcp-server) and [GitLab](entry:gitlab-mcp-server) servers. For cloud accounts, see [AWS MCP Servers](entry:aws-mcp-servers) and [Cloudflare's servers](entry:cloudflare-mcp).

What was checked by running things on 2026-10-20: we started five of the servers on a Linux box and called `initialize` and `tools/list` with a small stdio client, with and without each read-only setting. We used dummy credentials and called no tools, so these numbers show which tools a client sees. They do not show what the backend would allow.

- **Kubernetes MCP Server v0.0.67** (npx) with a kubeconfig pointing at an unreachable cluster: 20 tools with the default `core` and `config` toolsets, 14 with `read_only = true`, 15 with `disable_destructive = true`.
- **Terraform MCP Server v1.3.0** (built with `go install`): 9 registry tools with no token, 56 with `TFE_TOKEN` set, 61 with `ENABLE_TF_OPERATIONS=true` as well.
- **Buildkite MCP Server v1.28.0**: 72 tools, 49 with `--read-only`.
- **Grafana MCP v1.6.3**: 81 tools, 65 with `--disable-write`.
- **Sentry MCP 0.42.0** (`npx @sentry/mcp-server`): 9 tools, 7 with `--skills=inspect`.
- **Not run:** Azure DevOps' local server failed to start because a native dependency (keytar) needs `libsecret`, which was not installed. Heroku needs the Heroku CLI, and Datadog is hosted-only and needs an account. Their rows come from the docs.

## What "read-only" means in each server

Read-only switches mostly work by hiding tools from the model. The cluster or service still enforces only what the credential allows, so treat the switch as one layer and the credential as the real boundary.

- **Hiding tools by annotation.** Kubernetes' `read_only` keeps only tools annotated `readOnlyHint`. Grafana's `--disable-write` and Buildkite's `--read-only` drop their mutating tools. In our runs, every tool left after each switch carried `readOnlyHint`.
- **"Not destructive" is not "read-only".** Kubernetes' `disable_destructive` removed `pods_delete`, `pods_exec`, `resources_create_or_update`, `resources_delete` and `resources_scale`. It kept `pods_run`, which starts a container in your cluster. Use `read_only` when you mean read-only.
- **Tools that change behavior.** With `--disable-write`, Grafana keeps `alerting_manage_rules`, `alerting_manage_silences` and `grafana_api_request`, but each tool's description and annotations say it is read-only (list and get only, or GET requests only).
- **Gated by default.** Terraform's dangerous tools are off unless you set `ENABLE_TF_OPERATIONS`. With a token but without that flag, we still saw write tools such as `create_run`, `update_workspace` and `create_workspace_variable`. So a token alone gives the agent more than read access. For a registry-only research agent, run it without a token.
- **Choosing at the endpoint.** Buildkite (`/mcp/readonly`) and Azure DevOps (`X-MCP-Readonly`) let you choose read-only on the hosted server itself, without running anything locally. Keep that URL or header somewhere the agent cannot edit.
- **No switch.** Datadog has no server-side read-only flag. Instead, the server runs as the signed-in user and checks write permissions such as `monitors_write` on every call. Use a read-only role or a scoped service account. Heroku's README documents no read-only mode, so limit the account behind the CLI login or API key.

## Credentials: who the agent is

The hosted servers (Buildkite, Azure DevOps, Datadog, Sentry, and Mapbox outside this list) use OAuth for interactive clients. Most also accept a token header for headless agents: Buildkite's `/direct` with a bearer token, Datadog's access tokens or API and application keys, and Sentry's `Sentry-Bearer` header. Sentry keeps `Bearer` reserved for MCP OAuth tokens. For a background agent, create a dedicated service account with the narrowest role rather than reusing a person's token. Datadog records every call in Audit Trail and tags it as an MCP action, which helps reviews. [Agent auth and delegated access](guide:agent-auth-and-delegated-access) and [agent identity and MCP auth](comparison:agent-identity-and-mcp-auth) cover the patterns, and the [MCP authorization spec](entry:mcp-authorization) defines the OAuth flow these hosted servers use.

For Kubernetes, the server's README links a setup guide for a dedicated ServiceAccount with read-only access. That is worth doing even with `read_only = true`, because the RBAC role is what the API server enforces.

## Keeping the tool list small

Large tool lists cost context and make wrong picks more likely. With a token, Terraform offers 56 tools and Grafana 81 by default. All eight servers can be trimmed. Kubernetes and Buildkite use toolsets, Grafana uses `--disable-<category>` flags, Datadog uses the `toolsets` URL parameter or header (and `omit_tools`), Sentry uses skills, and Azure DevOps' local server loads selected domains. Datadog also truncates long responses and gives most tools a `max_tokens` parameter. The [Toolathlon](entry:toolathlon) benchmark found that most models lose accuracy when tool output is very long.

## A read-only investigation setup

1. Telemetry: Grafana with `--disable-write`, or Datadog as a read-only user, plus Sentry with `--skills=inspect`.
2. Changes and CI: Buildkite at `https://mcp.buildkite.com/mcp/readonly`, or Azure DevOps with `X-MCP-Readonly: true`, plus the GitHub server in read-only mode.
3. Cluster: the Kubernetes MCP Server with `read_only = true` and a read-only ServiceAccount kubeconfig.
4. Let the agent propose fixes, such as a rollback, a retried job or a silence, as text or a pull request, and have a human approve the action. If you later enable a write tool, enable one group at a time (for example Buildkite's `retries` toolset, which can retry jobs without `write_builds`).

To choose servers in general, see [pick an MCP server](skill:pick-an-mcp-server). To run untrusted code that the agent writes during an investigation, see [self-hosted agent sandboxes](comparison:self-hosted-agent-sandboxes).
