---
id: agent-identity-and-mcp-auth
type: comparison
title: Agent identity and MCP authorization platforms
summary: Descope, Stytch Connected Apps, Auth0 for AI Agents, WorkOS AuthKit and Arcade compared on their role in MCP OAuth, DCR and CIMD support, delegated tokens for third-party APIs, human approval, pricing and SDKs.
description: "Securing an agent involves two separate jobs: the authorization server that issues tokens for your MCP server, and the vault or gateway that holds users' tokens for third-party APIs. This comparison maps five vendors onto those roles against the MCP 2026-07-28 authorization spec, where CIMD is SHOULD and DCR is MAY and deprecated. Everything was checked in vendor docs and pricing pages on 2026-10-13."
author: Agentica Author
tags: [mcp, oauth, auth, identity, agents, security]
entries: [descope-agentic-identity, stytch-connected-apps, auth0-for-ai-agents, workos-authkit-mcp, arcade, mcp-authorization, model-context-protocol, composio, fastmcp, mcp-inspector]
related: [connect-an-agent-to-a-remote-mcp-server, connect-remote-mcp, agent-memory-layers]
subjects: [descope-agentic-identity, stytch-connected-apps, auth0-for-ai-agents, workos-authkit-mcp, arcade]
criteria:
  - Role in MCP OAuth
  - DCR and CIMD
  - Delegated third-party tokens
  - Human-in-the-loop approval
  - Pricing and free tier
  - SDKs
rows:
  descope-agentic-identity:
    Role in MCP OAuth: "Authorization server for your MCP server, plus a token vault (Connections / Outbound Apps)"
    DCR and CIMD: "Both, plus pre-registration and JWT Bearer for cloud workloads"
    Delegated third-party tokens: "Yes: stores OAuth tokens and API keys per user or tenant and refreshes them"
    Human-in-the-loop approval: "CIBA for confidential clients (off by default), with out-of-band approval such as email"
    Pricing and free tier: "Free Forever: 7,500 MAU, 2,000 monthly active consents, 2,000 monthly active tokens. Pro from $249/mo, Growth from $799/mo (billed annually)"
    SDKs: "MCP SDKs for Express and Python; FastMCP DescopeProvider; gateway integrations such as Portkey"
  stytch-connected-apps:
    Role in MCP OAuth: "Turns your app into an OAuth/OIDC authorization server, with your own hosted authorization page (React IdentityProvider component)"
    DCR and CIMD: "DCR is opt-in in the dashboard (DCR clients count as third-party). CIMD is not documented"
    Delegated third-party tokens: "No token vault found; supports Cross App Access"
    Human-in-the-loop approval: "OAuth consent screen; no async approval flow found"
    Pricing and free tier: "Pay as you go, $0 base, with 10,000 monthly active members and agents and 1,000 M2M tokens included"
    SDKs: "Frontend and backend SDKs with React components; MCP guides for Cloudflare and Vercel"
  auth0-for-ai-agents:
    Role in MCP OAuth: "Authorization server (Auth for MCP), plus Token Vault"
    DCR and CIMD: "DCR supported. CIMD only by manually importing a hosted metadata document, for third-party apps"
    Delegated third-party tokens: "Token Vault calls third-party APIs on the user's behalf. The Free plan allows 2 Token Vault connections; the add-on makes it unlimited"
    Human-in-the-loop approval: "Asynchronous authorization through CIBA with RAR (push, SMS or email). Not on Free; an add-on on paid plans"
    Pricing and free tier: "Free up to 25,000 MAU. The AI Agents add-on costs 50% of the base plan price (for example $18/mo on Essentials at 500 MAU)"
    SDKs: "JavaScript and Python, with integrations for LangChain/LangGraph, LlamaIndex, Vercel AI, Cloudflare Agents and Genkit"
  workos-authkit-mcp:
    Role in MCP OAuth: "Authorization server; your MCP server is the resource server"
    DCR and CIMD: "CIMD supported (off by default; enable it in the dashboard). DCR can be enabled for backwards compatibility"
    Delegated third-party tokens: "Not covered by AuthKit for MCP. WorkOS Vault is encrypted key storage, not an OAuth token broker"
    Human-in-the-loop approval: "OAuth consent; no async approval flow found"
    Pricing and free tier: "AuthKit free for the first 1M MAU, then $2,500/mo per additional 1M"
    SDKs: "WorkOS SDKs; works with the official MCP SDKs. Resource indicators set aud on tokens"
  arcade:
    Role in MCP OAuth: "Tool-calling runtime and MCP gateway. It handles users' OAuth to third-party services and federates tools behind one gateway URL"
    DCR and CIMD: "Not documented. Gateways accept browser OAuth or, as a fallback, an API key plus a user-ID header. Self-hosted arcade-mcp servers accept tokens from an external authorization server such as WorkOS, Auth0 or Descope"
    Delegated third-party tokens: "Yes, the core feature: built-in auth providers (Google, Microsoft, Slack and more) or raw tokens for direct API calls"
    Human-in-the-loop approval: "Users authorize tool scopes interactively. Contextual Access webhooks can validate or filter each tool call"
    Pricing and free tier: "Free: 2,000 auth events and 2,000 tool calls per month. Team $25/mo plus $0.10 per auth event and $0.01 per tool call. Enterprise custom (VPC or air-gapped)"
    SDKs: "Python (arcadepy), JavaScript (@arcadeai/arcadejs) and Java clients; arcade-mcp server framework (MIT); integrations for LangChain, OpenAI Agents, Google ADK, Vercel AI, Mastra and others"
verdict: "To issue tokens for your own MCP server, WorkOS AuthKit has the cleanest fit with the current spec (CIMD, resource indicators) and is free to 1M MAU. Descope supports both CIMD and DCR and adds a token vault and CIBA in one free tier. Auth0 suits existing Auth0 tenants, but Token Vault and CIBA need the paid add-on. Stytch is a simple DCR-based authorization server. Arcade sits on the other side: it holds users' third-party tokens and runs the tools."
sources:
  - {title: "MCP specification 2026-07-28, Authorization", url: "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", accessed: 2026-10-13}
  - {title: Descope Agentic Identity Hub docs, url: "https://docs.descope.com/llms.txt", accessed: 2026-10-13}
  - {title: Descope pricing, url: "https://www.descope.com/pricing", accessed: 2026-10-13}
  - {title: Stytch Connected Apps docs, url: "https://stytch.com/docs/llms.txt", accessed: 2026-10-13}
  - {title: Stytch pricing, url: "https://stytch.com/pricing", accessed: 2026-10-13}
  - {title: Auth0 for AI Agents docs, url: "https://auth0.com/ai/docs/intro/overview", accessed: 2026-10-13}
  - {title: Auth0 documentation index, url: "https://auth0.com/llms.txt", accessed: 2026-10-13}
  - {title: Auth0 pricing, url: "https://auth0.com/pricing.md", accessed: 2026-10-13}
  - {title: WorkOS AuthKit MCP docs, url: "https://workos.com/docs/authkit/mcp.md", accessed: 2026-10-13}
  - {title: WorkOS pricing, url: "https://workos.com/pricing.md", accessed: 2026-10-13}
  - {title: WorkOS Vault docs, url: "https://workos.com/docs/vault.md", accessed: 2026-10-13}
  - {title: Arcade docs index, url: "https://docs.arcade.dev/llms.txt", accessed: 2026-10-13}
  - {title: Arcade pricing, url: "https://www.arcade.dev/pricing", accessed: 2026-10-13}
  - {title: Arcade MCP Gateways, url: "https://docs.arcade.dev/en/operate/governance/mcp-gateways", accessed: 2026-10-13}
  - {title: "Arcade, Add Resource Server auth", url: "https://docs.arcade.dev/en/build/create-tools/secure-your-server/secure-your-mcp-server", accessed: 2026-10-13}
  - {title: arcade-mcp repository, url: "https://github.com/ArcadeAI/arcade-mcp", accessed: 2026-10-13}
last_verified: 2026-10-13
published: 2026-10-13
---

## Two different jobs

[MCP authorization](entry:mcp-authorization) makes your MCP server an OAuth protected resource. The server publishes Protected Resource Metadata, clients send a `resource` indicator, and the server checks the token audience. The spec also bans token passthrough: a client may only send the MCP server tokens issued by that server's authorization server. So if a tool needs a user's Gmail or GitHub token, that token has to come from somewhere else. That is the **token vault** or **tool-calling gateway**.

- **Authorization server:** WorkOS AuthKit, Stytch Connected Apps, Descope, Auth0.
- **Delegated-token vault:** Descope Connections, Auth0 Token Vault.
- **Tool-calling runtime/gateway:** Arcade (and [Composio](entry:composio), not covered here).

## Client registration in 2026

The 2026-07-28 spec tells authorization servers to support Client ID Metadata Documents (CIMD) and keeps Dynamic Client Registration (DCR) only for backwards compatibility. Descope and WorkOS support CIMD. Auth0 supports it only through a manual import. Stytch documents DCR only. If you want clients such as Claude Code or Cursor to connect without pre-registration, test the flow with [MCP Inspector](entry:mcp-inspector).

## Standout findings

- **Auth0's free plan covers 25,000 MAU but not CIBA.** The AI Agents add-on, priced at 50% of the base plan, unlocks unlimited Token Vault and CIBA.
- **WorkOS AuthKit ships CIMD switched off.** Enable it in the dashboard, and set a default Resource Indicator for clients that omit `resource`.
- **Arcade meters auth events and tool calls, not seats.** Its MIT-licensed `arcade-mcp` framework can validate tokens from WorkOS, Auth0 or Descope.

For the client side of the flow, see [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server). If you build with [FastMCP](entry:fastmcp), Descope ships a provider for it.
