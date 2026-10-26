---
id: mcp-server-frameworks
type: comparison
title: "MCP server frameworks compared: FastMCP vs mcp-use vs the official Python and TypeScript SDKs"
summary: "Four ways to build an MCP server in 2026: the official Python SDK (v2) and TypeScript SDK (v2), Prefect's FastMCP and Manufact's mcp-use. Covers languages, schemas, transports, auth, MCP Apps (UI), local testing, deployment and license."
description: "A primary-source comparison of MCP server frameworks, checked on 2026-10-26 against each project's README, documentation index and package registry (PyPI and npm). It covers the two official SDKs and the two most visible higher-level frameworks. Download and adoption figures are the projects' own claims. No framework was benchmarked here."
author: Agentica Author
tags: [mcp, sdk, framework, python, typescript, mcp-apps, oauth, server-development]
entries: [mcp-python-sdk, mcp-typescript-sdk, fastmcp, mcp-use, mcp-go-sdk, mcp-inspector, model-context-protocol, mcp-authorization, fast-agent]
related: [publish-an-mcp-server, test-your-mcp-server, add-oauth-to-your-mcp-server, bridge-stdio-and-remote-mcp-servers, connect-an-agent-to-a-remote-mcp-server, mcp-gateways, work-management-mcp-servers]
subjects: [mcp-python-sdk, mcp-typescript-sdk, fastmcp, mcp-use]
criteria:
  - Language and package
  - Defining a tool
  - Transports
  - Server auth
  - MCP Apps (UI)
  - Local testing
  - Deploy story
  - License
rows:
  mcp-python-sdk:
    Language and package: "Python; PyPI mcp 2.3.0 (README: Python 3.11+). v2 API: from mcp.server import MCPServer"
    Defining a tool: "@mcp.tool() on a type-hinted function; schema and validation generated from the hints"
    Transports: "stdio, Streamable HTTP and SSE; the same package includes a full Client"
    Server auth: "Resource-server pattern: implement TokenVerifier to check OAuth 2.1 bearer tokens; client-side OAuth helpers"
    MCP Apps (UI): "Yes, as the built-in Apps extension (io.modelcontextprotocol/ui)"
    Local testing: "mcp dev server.py opens the server in MCP Inspector (cli extra)"
    Deploy story: "Any host that runs a Python web service; mcp run --transport streamable-http"
    License: "MIT"
  mcp-typescript-sdk:
    Language and package: "TypeScript on Node.js, Bun and Deno; v2 @modelcontextprotocol/server 2.4.0 and @modelcontextprotocol/client (Node >=20). v1 @modelcontextprotocol/sdk 1.32.2 on the v1.x branch"
    Defining a tool: "server.registerTool(name, {inputSchema}, handler); schemas via Standard Schema (Zod v4, Valibot, ArkType)"
    Transports: "stdio and Streamable HTTP; thin middleware for Node http, Express, Fastify and Hono"
    Server auth: "Bearer-token verification with protected-resource metadata and per-operation scopes; client OAuth and machine auth (client credentials, private-key JWT, cross-app access)"
    MCP Apps (UI): "Not listed in the v2 docs index"
    Local testing: "None built in; use MCP Inspector"
    Deploy story: "Any JS runtime; you wire the HTTP framework"
    License: "Apache-2.0 for v2 (repo is moving from MIT to Apache-2.0; v1 package MIT)"
  fastmcp:
    Language and package: "Python; PyPI fastmcp 4.1.3 (Python >=3.10). TypeScript counterpart: @prefecthq/fastmcp-ts"
    Defining a tool: "@mcp.tool on a plain function; schema, validation and docs generated"
    Transports: "stdio and HTTP; clients connect by URL with transport negotiation handled"
    Server auth: "API keys up to full OAuth 2.1: token verification, remote OAuth (Descope, WorkOS, Auth0, SSO), OAuth and OIDC proxies, a full OAuth server, multiple auth sources, component-level authorization"
    MCP Apps (UI): "Yes (Apps pillar: interactive UIs rendered in the conversation)"
    Local testing: "FastMCP Client connects to any server, programmatically or from the CLI; docs cover AI-assisted development"
    Deploy story: "HTTP deployment, fastmcp.json project config; Prefect Horizon (commercial gateway and hosting from the same team)"
    License: "Apache-2.0"
  mcp-use:
    Language and package: "TypeScript first (npm mcp-use 2.11.2, Node >=22.22.2; scaffold with create-mcp-use-app) plus a Python package (PyPI mcp-use 1.7.1)"
    Defining a tool: "server.tool({name, inputSchema, outputSchema, view}, handler) with Zod; typed structured results"
    Transports: "Streamable HTTP servers; Redis-backed session storage for distributed deployments"
    Server auth: "OAuth providers: Auth0, Better Auth, Clerk, Keycloak, Supabase, WorkOS, an OAuth proxy, or custom DCR"
    MCP Apps (UI): "Yes: React Views bound to tools (ChatGPT apps, Claude connectors)"
    Local testing: "Built-in Inspector at /mcp/inspector in dev, plus a hosted Inspector and headless CLI"
    Deploy story: "Manufact Cloud (one-click), Google Cloud Run and other hosts"
    License: "MIT"
verdict: "Writing Python and want the reference implementation with few dependencies? Use the official SDK v2, which now has MCPServer, a client and MCP Apps. Need production auth (OAuth proxies, SSO, multiple token sources) in Python? FastMCP has the most auth options. In TypeScript, use the official v2 SDK when you want Standard Schema and your own HTTP framework. Pick mcp-use when you're building an MCP App with React views and want an inspector and deploy flow out of the box."
sources:
  - {title: "MCP Python SDK README", url: "https://github.com/modelcontextprotocol/python-sdk", accessed: 2026-10-26}
  - {title: "MCP Python SDK docs: MCP Apps", url: "https://py.sdk.modelcontextprotocol.io/advanced/apps/index.md", accessed: 2026-10-26}
  - {title: "MCP Python SDK docs: Authorization", url: "https://py.sdk.modelcontextprotocol.io/run/authorization/index.md", accessed: 2026-10-26}
  - {title: "PyPI: mcp", url: "https://pypi.org/project/mcp/", accessed: 2026-10-26}
  - {title: "MCP TypeScript SDK README", url: "https://github.com/modelcontextprotocol/typescript-sdk", accessed: 2026-10-26}
  - {title: "MCP TypeScript SDK v2 docs index", url: "https://ts.sdk.modelcontextprotocol.io/v2/llms.txt", accessed: 2026-10-26}
  - {title: "npm: @modelcontextprotocol/server", url: "https://www.npmjs.com/package/@modelcontextprotocol/server", accessed: 2026-10-26}
  - {title: "FastMCP README", url: "https://github.com/PrefectHQ/fastmcp", accessed: 2026-10-26}
  - {title: "FastMCP docs index", url: "https://gofastmcp.com/llms.txt", accessed: 2026-10-26}
  - {title: "PyPI: fastmcp", url: "https://pypi.org/project/fastmcp/", accessed: 2026-10-26}
  - {title: "mcp-use README", url: "https://github.com/mcp-use/mcp-use", accessed: 2026-10-26}
  - {title: "mcp-use docs index", url: "https://docs.mcp-use.com/llms.txt", accessed: 2026-10-26}
  - {title: "npm: mcp-use", url: "https://www.npmjs.com/package/mcp-use", accessed: 2026-10-26}
last_verified: 2026-10-26
published: 2026-10-26
---

Each of these four turns a function into an MCP tool. They differ in everything around that: auth, UI, testing and deployment. The official SDKs track the spec and keep dependencies light. FastMCP and mcp-use add batteries on top.

## The official SDKs grew up

Both official SDKs shipped a v2 in 2026, and they look much more like the frameworks than v1 did:

- The [Python SDK](entry:mcp-python-sdk) v2 has an `MCPServer` class with decorator tools (`@mcp.tool()`), a `Client` that takes a URL, `mcp dev` to open the server in [MCP Inspector](entry:mcp-inspector), and MCP Apps as a built-in extension. Server auth is deliberately minimal. Your server is an OAuth resource server, and you implement a `TokenVerifier`.
- The [TypeScript SDK](entry:mcp-typescript-sdk) v2 splits into `@modelcontextprotocol/server` and `@modelcontextprotocol/client`, implements the 2026-07-28 spec, and accepts any Standard Schema library (Zod v4, Valibot, ArkType). Thin middleware packages connect it to Node `http`, Express, Fastify or Hono. v1 (`@modelcontextprotocol/sdk`) still gets bug and security fixes for at least six months after the v2 release on 2026-07-27, so plan your migration.

There is also an official [Go SDK](entry:mcp-go-sdk), maintained with Google, if Go is your server language.

## When a framework earns its keep

**Auth.** This is the biggest gap. [FastMCP](entry:fastmcp) documents token verification, remote OAuth with external identity providers (Descope, WorkOS, Auth0, corporate SSO), OAuth and OIDC proxies for providers that don't support MCP's flow, a self-contained OAuth server, multiple auth sources and per-component authorization. [mcp-use](entry:mcp-use) has ready-made providers for Auth0, Better Auth, Clerk, Keycloak, Supabase and WorkOS. With the official SDKs you put the authorization server together yourself. For the steps, see [Add OAuth to your MCP server](guide:add-oauth-to-your-mcp-server).

**UI (MCP Apps).** An MCP App is a tool plus a `ui://` HTML resource that the host renders in a sandboxed iframe. mcp-use is built around this, with React "Views" bound to tools and typed props. FastMCP has Apps as one of its three pillars, and the Python SDK ships an Apps extension. The TypeScript SDK's v2 docs index doesn't list it.

**Testing.** mcp-use serves an Inspector at `/mcp/inspector` while you develop, and the Python SDK's `mcp dev` opens MCP Inspector. Every option can be tested with a scripted client, as in [Test your MCP server](guide:test-your-mcp-server).

**Deploying.** All four can run as a plain HTTP service. The two frameworks also sell hosting: Prefect Horizon from the FastMCP team (gateway, registry, SSO and RBAC) and Manufact Cloud from the mcp-use team. Both are optional. Once the server is up, [Publish an MCP server](guide:publish-an-mcp-server) covers registries and listings. If you need a stdio server reachable over HTTP, or the other way round, see [Bridge stdio and remote MCP servers](guide:bridge-stdio-and-remote-mcp-servers).

## Adoption claims, with care

FastMCP's README says FastMCP 1.0 was folded into the official Python SDK in 2024 and that "some version of FastMCP powers 70% of MCP servers across all languages". These are the project's own figures and were not checked here. mcp-use publishes MCP conformance badges for its Python server and client. Treat both as signals, not benchmarks.

## A client to test against

To drive your server from an agent rather than an inspector, [fast-agent](entry:fast-agent) connects to stdio or Streamable HTTP servers with `/connect`, supports sampling and elicitation, and includes transport diagnostics. That makes it handy for checking that a new server works end to end.
