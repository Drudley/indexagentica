---
id: mcp-gateways
type: comparison
title: MCP gateways compared
summary: "Docker MCP Gateway, Stacklok ToolHive and Arcade MCP Gateways compared on where they run, how they isolate MCP servers, how clients authenticate, tool filtering and context control, policy, audit and rate limits, and licensing."
description: "A primary-source comparison of three ways to put one controlled endpoint in front of many MCP servers: Docker's open-source gateway that runs servers as containers, ToolHive's container runtime plus its vMCP aggregator, and Arcade's hosted (or self-hosted) gateway that federates its own and remote tools behind OIDC sign-in. Facts come from each project's docs and README, checked on 2026-10-21. None of the three was run for this piece."
author: Agentica Author
tags: [mcp, gateway, proxy, security, governance, self-hosted, containers, rate-limiting, audit]
entries: [docker-mcp-gateway, toolhive, arcade, arcade-mcp, docker-mcp-catalog, docker-sandboxes, model-context-protocol, mcp-authorization, rfc-8707, rfc-8693, oauth-client-id-metadata-document, mcp-inspector]
related: [test-your-mcp-server, self-hosted-agent-sandboxes, agent-identity-and-mcp-auth, add-oauth-to-your-mcp-server, connect-an-agent-to-a-remote-mcp-server, devops-mcp-servers, pick-an-mcp-server, bridge-stdio-and-remote-mcp-servers, llm-gateways, work-management-mcp-servers, mcp-server-frameworks]
subjects: [docker-mcp-gateway, toolhive, arcade]
criteria:
  - What it is
  - Where it runs
  - Server isolation
  - Client authentication
  - Tool filtering and context
  - Policy, audit and limits
  - License and cost
rows:
  docker-mcp-gateway:
    What it is: "The docker mcp CLI plugin that runs MCP servers as containers behind one endpoint; the engine behind Docker Desktop's MCP Toolkit. Profiles group servers from the Docker MCP Catalog, the MCP Registry, docker:// images or local files"
    Where it runs: "Docker Desktop 4.59+ (README prerequisite), or as a standalone CLI plugin or the docker/mcp-gateway Compose image with the Docker socket mounted. Transports: stdio (default), SSE or streaming"
    Server isolation: "Starts each server as a container on demand with restricted privileges, network and resources. Defaults: 1 CPU and 2Gb memory per server, signature verification on, secret blocking on; --block-network is off by default"
    Client authentication: "No OAuth layer for clients. On HTTP transports, unauthenticated requests are refused unless --allow-unauthenticated is set, and MCP_GATEWAY_AUTH_TOKEN guards localhost against DNS rebinding. Upstream, the README says it handles OAuth flows for servers that need access tokens"
    Tool filtering and context: "Per-profile tool allowlists (docker mcp profile tools ... --enable server.tool) and --servers / --tools flags at run time; the README also lists dynamic tool discovery and configuration"
    Policy, audit and limits: "--log-calls on by default, --verbose; interceptors run your own scripts before or after calls (when:type:path); no built-in rate limiting documented"
    License and cost: "MIT, open source. The enterprise MCP Gateway in Docker AI Governance is invite-only"
  toolhive:
    What it is: "Stacklok's runtime for MCP servers (thv CLI, desktop UI, Kubernetes operator) plus vMCP, which aggregates a group of servers into one endpoint"
    Where it runs: "Local with Docker, Podman or Colima; vMCP locally via thv vmcp serve or on Kubernetes via the operator. Can also proxy remote MCP servers"
    Server isolation: "Each server in a container. Network isolation is on by default since v0.30.1: egress proxy (Squid, or Envoy), DNS and ingress containers enforce the permission profile's allowed hosts and ports. HTTP and HTTPS only; opt out with --isolate-network=false"
    Client authentication: "OIDC token validation on thv run (--oidc-issuer, --oidc-audience). vMCP uses a two-boundary model (client auth separate from backend auth), an optional embedded authorization server and RFC 8693 token exchange to backends"
    Tool filtering and context: "--tools filter and --tools-override; vMCP prefixes clashing tool names (github_create_issue), adds composite tools and Starlark code mode, and an optimizer that replaces the tool list with find_tool and call_tool"
    Policy, audit and limits: "Cedar authorization policies (--authz-config), audit logging (--enable-audit), OpenTelemetry and Prometheus. No rate-limiting option in the thv run reference"
    License and cost: "Apache-2.0, open source; latest release v0.55.2 (2026-10-19)"
  arcade:
    What it is: "A gateway inside Arcade's tool platform that federates Arcade-built tools and registered remote MCP servers into one Streamable HTTP URL, https://api.arcade.dev/mcp/{slug}"
    Where it runs: "Arcade Cloud, Azure Marketplace, AWS (private offer), GCP listed as coming soon, or self-hosted with Helm on Kubernetes 1.30+ with PostgreSQL, Redis and an OIDC identity provider"
    Server isolation: "Not a container sandbox: Arcade hosts its own tools, and remote MCP servers run wherever their owners host them"
    Client authentication: "OAuth sign-in through Arcade Auth or your own OIDC user source (Auth0, Clerk, Entra ID, Okta, Stytch), or API key plus Arcade-User-ID headers. CIMD client IDs can be allowlisted to skip consent"
    Tool filtering and context: "Pick allowed tools per gateway; Tool Recommendation (default for new gateways in orgs that have it) lists a few tools and returns matching allowed tools per task; gateway LLM instructions"
    Policy, audit and limits: "Native rate limits (tool matcher, limit, window; counters per tool and per org or project, not per user), Contextual Access hooks, audit logs with a REST API"
    License and cost: "Proprietary platform with a free tier (no credit card); the arcade-mcp server framework is MIT"
verdict: "For a developer machine, Docker MCP Gateway is the shortest route if you already use Docker Desktop: catalog servers, containers, tool allowlists. Pick ToolHive when servers must not reach arbitrary hosts (egress allowlists are the default) or you need OIDC, Cedar policy and one aggregated vMCP endpoint on Kubernetes. Pick Arcade when end users sign in and you want per-user OAuth to SaaS tools, rate limits and audit logs without running it."
sources:
  - {title: Docker MCP Gateway README, url: "https://github.com/docker/mcp-gateway", accessed: 2026-10-21}
  - {title: "Docker docs, MCP Gateway", url: "https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/", accessed: 2026-10-21}
  - {title: "docker mcp gateway run reference (docs/generator/reference/docker_mcp_gateway_run.yaml)", url: "https://github.com/docker/mcp-gateway/blob/main/docs/generator/reference/docker_mcp_gateway_run.yaml", accessed: 2026-10-21}
  - {title: ToolHive README, url: "https://github.com/stacklok/toolhive", accessed: 2026-10-21}
  - {title: ToolHive releases, url: "https://github.com/stacklok/toolhive/releases", accessed: 2026-10-21}
  - {title: "ToolHive docs, CLI quickstart", url: "https://docs.stacklok.com/toolhive/guides-cli/quickstart", accessed: 2026-10-21}
  - {title: "ToolHive docs, Network isolation", url: "https://docs.stacklok.com/toolhive/guides-cli/network-isolation", accessed: 2026-10-21}
  - {title: "ToolHive docs, Authentication and authorization (CLI)", url: "https://docs.stacklok.com/toolhive/guides-cli/auth", accessed: 2026-10-21}
  - {title: "ToolHive docs, thv run reference", url: "https://docs.stacklok.com/toolhive/reference/cli/thv_run", accessed: 2026-10-21}
  - {title: "ToolHive docs, Virtual MCP Server concepts", url: "https://docs.stacklok.com/toolhive/concepts/vmcp", accessed: 2026-10-21}
  - {title: "ToolHive docs, Run vMCP locally with the CLI", url: "https://docs.stacklok.com/toolhive/guides-vmcp/local-cli", accessed: 2026-10-21}
  - {title: "Arcade docs, MCP Gateways", url: "https://docs.arcade.dev/en/operate/governance/mcp-gateways", accessed: 2026-10-21}
  - {title: "Arcade docs, Create an MCP Gateway via the Dashboard", url: "https://docs.arcade.dev/en/operate/governance/mcp-gateways/create-via-dashboard", accessed: 2026-10-21}
  - {title: "Arcade docs, Rate limiting", url: "https://docs.arcade.dev/en/operate/governance/contextual-access/rate-limiting", accessed: 2026-10-21}
  - {title: "Arcade docs, Audit logs", url: "https://docs.arcade.dev/en/operate/governance/audit-logs", accessed: 2026-10-21}
  - {title: "Arcade docs, Deploy", url: "https://docs.arcade.dev/en/operate/deploy", accessed: 2026-10-21}
  - {title: "Arcade docs, Self-host with Helm", url: "https://docs.arcade.dev/en/operate/deploy/helm", accessed: 2026-10-21}
last_verified: 2026-10-21
published: 2026-10-21
---

Once an agent uses more than a few [MCP](entry:model-context-protocol) servers, you run into the same problems on every machine. Each client needs each server configured. Every server sees whatever the host can reach. The model is shown every tool's description. Nobody has a record of which tool was called, or by whom. An MCP gateway gives the client one endpoint, and enforces policy between the client and the servers.

The three gateways here solve different parts of that problem:

- **[Docker MCP Gateway](entry:docker-mcp-gateway)** is about running servers safely on a developer machine.
- **[ToolHive](entry:toolhive)** is about running servers in isolation, and putting identity and policy on top, from a laptop up to Kubernetes.
- **[Arcade](entry:arcade)** is about end users signing in and calling SaaS tools on their own behalf.

Every fact below comes from each project's own README or docs, as of 2026-10-21. **None of the three was run for this piece.** The box used for research has no container runtime, and Arcade is an account-based service. Defaults are quoted from flag references and docs.

## How they differ

**Where the servers run.** Docker and ToolHive both *run* MCP servers for you, as containers. Docker starts each server on demand. By default it limits each one to 1 CPU and 2Gb of memory, verifies image signatures, and blocks secrets from being sent to or from tools. Network blocking (`--block-network`) is **off** by default. ToolHive takes the opposite default. Since v0.30.1, every `thv run` gets an egress proxy, a DNS container and an ingress proxy. Only the hosts and ports in the server's permission profile are reachable. The catch is that isolation covers HTTP and HTTPS only. A database server that needs raw TCP has to opt out with `--isolate-network=false`. Arcade doesn't sandbox servers at all. It hosts its own tools, and any remote MCP server you register keeps running wherever its owner runs it. If what you need is sandboxing rather than a gateway, see [Self-hosted sandboxes for agents compared](comparison:self-hosted-agent-sandboxes).

**Who the client is.** Docker's gateway has no OAuth layer for clients. Over HTTP it refuses unauthenticated requests unless `--allow-unauthenticated` is set, and it uses `MCP_GATEWAY_AUTH_TOKEN` to protect localhost against DNS rebinding. On the server side, its README says it runs the OAuth flows for servers that need access tokens. That is enough for one developer, but it gives you no per-user identity for clients. ToolHive validates OIDC tokens on each server (`--oidc-issuer`, `--oidc-audience`), and authorizes calls with Cedar policies. Its vMCP aggregator splits client auth from backend auth (the docs call this a "two-boundary" model). It can also run an embedded authorization server and exchange tokens for backends with [RFC 8693](entry:rfc-8693). For remote servers that ToolHive proxies, `--remote-auth-resource` sets the [RFC 8707](entry:rfc-8707) resource. Arcade is built around end users. They sign in with Arcade or with your own OIDC provider (Auth0, Clerk, Entra ID, Okta or Stytch). Clients that can't run a browser flow can send an API key plus an `Arcade-User-ID` header instead. You can allowlist [CIMD](entry:oauth-client-id-metadata-document) client IDs, such as Claude's and VS Code's, so those users skip the consent screen. The client half of this is covered in [Agent identity and MCP auth compared](comparison:agent-identity-and-mcp-auth).

**What the model sees.** All three let you restrict which tools are exposed:

- Docker sets tool allowlists per profile, or at run time with `--tools server:tool`.
- ToolHive has `--tools` and `--tools-override` on each server.
- Arcade has a per-gateway list of allowed tools.

Two of them go further than listing tools. ToolHive's vMCP optimizer replaces the whole tool list with two primitives, `find_tool` and `call_tool`. Its README claims semantic tool search can cut token usage "by up to 85%". That is a vendor figure and was not measured here. vMCP also prefixes clashing names (`github_create_issue`, `jira_create_issue`), and adds composite tools and Starlark "code mode" scripts. Arcade's Tool Recommendation is on by default for new gateways in orgs that have it. It lists a few tools, and returns the allowed tools that fit each task the agent describes.

**What gets recorded and limited.** Docker logs calls by default (`--log-calls`), and its interceptors let you run your own script before or after a call. ToolHive has an audit log (`--enable-audit`) and Cedar policies, which deny by default once configured, and exports OpenTelemetry and Prometheus. Arcade is the only one of the three with native **rate limits**. Each rule is a tool matcher, a limit and a window. The counters are per tool, and are scoped to an organization or project. The docs note they are "not per user": everyone calling through the scope shares one counter. Arcade also keeps audit logs, which you can read through a REST API. If you need cost control per user or per agent, you have to build it on top of these.

## Choosing

- **You use Docker Desktop and want your coding agent's servers contained.** Use Docker MCP Gateway. Turn on `--block-network` if the servers don't need the internet, and use profile tool allowlists to keep the tool list short. Background on adding servers to a client is in [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code).
- **Servers must reach only declared hosts, or you need identity and policy on Kubernetes.** Use ToolHive. Its default egress allowlist and Cedar policies are the strictest combination here. vMCP gives a team one endpoint with per-user backend auth.
- **End users sign in, and the tools act on their SaaS accounts.** Use Arcade. It handles per-user OAuth to the SaaS services, gives you a hosted endpoint, and has rate limits and audit logs built in. You can self-host it with Helm if you need data residency.
- **You are building the server yourself.** A gateway can rename, filter or hide your tools. Run your contract tests and Inspector checks against the gateway endpoint as well as the bare server, as described in [Test your MCP server](guide:test-your-mcp-server).

## Caveats

- Docker's docs describe an enterprise "MCP Gateway as part of Docker AI Governance" that is "an invite-only feature". This comparison covers the open-source `docker mcp gateway` only.
- I couldn't retrieve the latest Docker MCP Gateway release tag. The README's Docker Desktop 4.59+ requirement is the only version floor given here.
- ToolHive moves fast: v0.55.2 was released on 2026-10-19. Check flag names against `thv run --help` for your version.
- Arcade's docs pages were last updated on 2026-10-19. Features are enabled per organization, and Tool Recommendation in particular is the default only "in organizations with Tool Recommendation".
- There are other gateways and proxies that are not compared here because Index Agentica doesn't list them yet, such as agentgateway, MetaMCP, LiteLLM's MCP gateway and the mcp-proxy projects.
