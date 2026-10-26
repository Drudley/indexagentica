---
id: work-management-mcp-servers
type: comparison
title: "Work-management MCP servers compared: Asana vs monday.com vs Linear vs Notion vs Atlassian"
summary: "The official hosted MCP servers for five work-management tools (Asana, monday.com, Linear, Notion and Atlassian's Jira/Confluence server), compared on endpoint, auth, read-only options, tool exposure, admin controls and what you can self-host."
description: "A primary-source comparison of the official remote MCP servers from Asana, monday.com, Linear, Notion and Atlassian, checked on 2026-10-26 against each vendor's MCP documentation and GitHub README. It covers endpoint URLs, transport, authentication (OAuth versus API tokens), read-only options, how tools are exposed, admin controls and open-source local servers. Pricing is not compared because none of the MCP docs we checked states a separate MCP price; access follows your plan in each product."
author: Agentica Author
tags: [mcp, remote-mcp, project-management, task-management, oauth, read-only, work-management]
entries: [asana-mcp, monday-mcp, linear-mcp, notion-mcp, atlassian-rovo-mcp, mcp-remote, model-context-protocol, mcp-authorization]
related: [connect-an-agent-to-a-remote-mcp-server, agent-identity-and-mcp-auth, devops-mcp-servers, database-mcp-servers, mcp-gateways, pick-an-mcp-server, bridge-stdio-and-remote-mcp-servers]
subjects: [asana-mcp, monday-mcp, linear-mcp, notion-mcp, atlassian-rovo-mcp]
criteria:
  - Covers
  - Endpoint
  - Auth
  - Read-only option
  - How tools are exposed
  - Admin controls
  - Self-host / open source
rows:
  asana-mcp:
    Covers: "Asana Work Graph: tasks, projects, sections, status and reports"
    Endpoint: "https://mcp.asana.com/v2/mcp (Streamable HTTP). The beta https://mcp.asana.com/sse is deprecated, with a documented shutdown date of 05/11/2026"
    Auth: "OAuth with your Asana account; some clients need a client ID and secret from Asana's integration guide"
    Read-only option: "Not documented on the MCP page"
    How tools are exposed: "Standard tools/list; Asana points to its API changelog for tool changes"
    Admin controls: "Enterprise+ and Legacy Enterprise: allow or block each MCP client app via app management; other tiers ask Asana Support"
    Self-host / open source: "None documented; hosted only"
  monday-mcp:
    Covers: "Boards, items, groups, columns, updates, users and teams, WorkForms; optional Apps Framework tools and beta dynamic GraphQL tools"
    Endpoint: "https://mcp.monday.com/mcp (hosted)"
    Auth: "OAuth via the monday MCP marketplace app (with workspace controls), or a Bearer API token; local server takes MONDAY_TOKEN"
    Read-only option: "Local server --read-only flag (not compatible with dynamic API tools)"
    How tools are exposed: "Fixed tool set; --mode apps swaps in Apps Framework tools; --enable-dynamic-api-tools adds all_monday_api (beta, off by default)"
    Admin controls: "Workspace controls through the marketplace app (limit access to specific workspaces)"
    Self-host / open source: "Yes: @mondaydotcomorg/monday-api-mcp and agent-toolkit, MIT"
  linear-mcp:
    Covers: "Issues, projects, comments and other Linear objects (find, create, update)"
    Endpoint: "https://mcp.linear.app/mcp (Streamable HTTP); https://mcp.linear.app/sse is a deprecated fallback"
    Auth: "OAuth 2.1 with dynamic client registration, or a Bearer OAuth token or Linear API key"
    Read-only option: "Yes: https://mcp.linear.app/mcp/readonly, or request only the read OAuth scope, or use a read-only API key"
    How tools are exposed: "Standard tool list"
    Admin controls: "Okta enterprise-managed authorization for MCP (after SAML via Okta)"
    Self-host / open source: "None documented; hosted only"
  notion-mcp:
    Covers: "Search Notion and connected sources; read, create and update pages; create databases"
    Endpoint: "https://mcp.notion.com/mcp (remote, hosted by Notion)"
    Auth: "OAuth; the client acts with the content you can access in the selected workspace"
    Read-only option: "Not documented on the overview or setup pages"
    How tools are exposed: "Standard tool list (see Notion's Supported tools page)"
    Admin controls: "Workspace owners manage MCP clients in Settings; restricting which clients members can connect needs Enterprise; Admin API can list and revoke connections"
    Self-host / open source: "makenotion/notion-mcp-server (MIT) exists but gets limited support; Notion recommends the remote server"
  atlassian-rovo-mcp:
    Covers: "Jira, Confluence, Jira Service Management, Bitbucket Cloud, Compass, Loom, Goals, Projects, Teams and Teamwork Graph"
    Endpoint: "https://mcp.atlassian.com/v2/mcp (Atlassian Cloud); also listed in the MCP Registry as com.atlassian"
    Auth: "OAuth 2.1 or API token, per product (JSM is API-token only, Compass OAuth only)"
    Read-only option: "Permission groups (read_*, write_*, search_*) that admins grant or revoke; delete_jira and manage_jira are off by default"
    How tools are exposed: "A few primary tools plus on-demand discovery of the rest; ?tools=all returns a flat paginated list for gateways"
    Admin controls: "Org admins grant or revoke permission groups; admin-enabled destructive groups; API-token auth must be enabled by an admin"
    Self-host / open source: "Server is cloud-hosted; the repo (Apache-2.0) holds plugins, skills and registry metadata"
verdict: "All five are vendor-hosted and use OAuth, so the choice is mostly made by which tool your team already uses. If you want to hand an agent read access only, Linear (a /readonly endpoint or read scope) and Atlassian (admin-granted read permission groups) give you the clearest controls. monday.com is the only one with a full open-source local server and a --read-only flag. Asana and Notion document admin client controls but no read-only mode on the pages we checked. Plan around Asana's SSE shutdown if your client still uses the beta URL."
sources:
  - {title: "Asana: Using Asana's MCP Server", url: "https://developers.asana.com/docs/using-asanas-mcp-server", accessed: 2026-10-26}
  - {title: "monday.com MCP (GitHub README)", url: "https://github.com/mondaycom/mcp", accessed: 2026-10-26}
  - {title: "monday MCP landing page", url: "https://monday.com/w/mcp", accessed: 2026-10-26}
  - {title: "Linear docs: MCP server", url: "https://linear.app/docs/mcp", accessed: 2026-10-26}
  - {title: "Notion MCP overview", url: "https://developers.notion.com/guides/mcp/overview.md", accessed: 2026-10-26}
  - {title: "Connect to Notion MCP", url: "https://developers.notion.com/guides/mcp/get-started-with-mcp.md", accessed: 2026-10-26}
  - {title: "Atlassian MCP Server (GitHub README)", url: "https://github.com/atlassian/atlassian-mcp-server", accessed: 2026-10-26}
last_verified: 2026-10-26
published: 2026-10-26
---

Project and work trackers are where agents pick up assignments and report progress, so they are among the first MCP servers teams connect. All five vendors here run an official **hosted** MCP server. You add a URL to your client and sign in with OAuth, and the agent acts with your permissions. They differ in what they let you restrict.

For how to add a remote server to Claude Code, Codex, Cursor and others, see [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server). For clients that only speak stdio, [mcp-remote](entry:mcp-remote) bridges to these URLs, and Linear, Atlassian and monday.com all show it in their docs.

## Setup in one line

Every server here takes the same shape of command in Claude Code:

```bash
claude mcp add --transport http linear    https://mcp.linear.app/mcp
claude mcp add --transport http notion    https://mcp.notion.com/mcp
claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp
```

Then run `/mcp` in a session to finish the OAuth flow. Asana (`https://mcp.asana.com/v2/mcp`) and monday.com (`https://mcp.monday.com/mcp`) use the same pattern in any client that supports Streamable HTTP and OAuth. Asana notes that some clients also need a client ID and secret.

## What matters for agents

**Least privilege.** An agent that only summarizes work shouldn't be able to close issues. [Linear](entry:linear-mcp) is the simplest: point it at `/mcp/readonly` and the agent only ever sees read tools. You can also request only the `read` scope. [Atlassian](entry:atlassian-rovo-mcp) organizes tools into permission groups (`read_jira`, `write_jira`, `search_confluence`, ...) that org admins grant or revoke. Destructive `delete_jira` and `manage_jira` are disabled until an admin turns them on. [monday.com](entry:monday-mcp)'s self-hosted server has a `--read-only` flag. The Asana and Notion pages we checked don't document a read-only mode. With those two, scope the agent through the user account it signs in as.

**Headless agents.** OAuth in a browser is fine on a laptop but awkward in CI or a background worker. Linear accepts a Bearer API key or OAuth token directly, which also lets an agent act as a Linear `app` user. Atlassian accepts API tokens, and they are the only option for Jira Service Management tools. monday.com accepts a Bearer token on the hosted endpoint, and its local server takes `MONDAY_TOKEN`. For the identity side of this, see [Agent identity and MCP auth compared](comparison:agent-identity-and-mcp-auth).

**Context budget.** Atlassian's server exposes only a few primary tools and lets the client discover the rest on demand, which keeps tool definitions out of your context window. MCP gateways that need every tool up front can append `?tools=all`. monday.com goes the other way with an opt-in `all_monday_api` tool that writes arbitrary GraphQL. It is powerful, but it needs full API access, so don't enable it for an untrusted agent.

**Admin visibility.** Notion workspace owners can see and manage connected MCP clients, and organization owners can list and revoke members' connections via the Admin API. Restricting which clients members may connect needs the Enterprise plan. Asana Enterprise+ admins can allow or block each MCP client app. Linear supports Okta enterprise-managed authorization for MCP clients.

**Deprecations.** Asana's beta SSE endpoint (`https://mcp.asana.com/sse`) is deprecated, and Asana's docs give a shutdown date of 05/11/2026. Linear's `/sse` endpoint is also a deprecated fallback. Use the Streamable HTTP URLs above in new setups.

## Self-hosting

Only monday.com ships a full open-source server you can run yourself (`npx @mondaydotcomorg/monday-api-mcp`, MIT). Notion's open-source `notion-mcp-server` (MIT) still exists, but Notion says it gets limited support and recommends the hosted server. Atlassian's GitHub repo (Apache-2.0) packages the hosted server as plugins and skills for Claude Code, Cursor, Gemini CLI and Agent Plugins clients, but the server itself runs on Atlassian Cloud. Asana and Linear are hosted only.

To put several of these behind one governed endpoint with shared logging and per-tool policies, see [MCP gateways compared](comparison:mcp-gateways).
