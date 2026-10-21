---
id: database-mcp-servers
type: comparison
title: Database MCP servers compared
summary: "Google's MCP Toolbox for Databases and the MongoDB, Neon and Supabase MCP servers compared on what they connect to, where they run, how they authenticate, how read-only mode and scoping work, and what guards their write tools."
description: "A primary-source comparison of four MCP servers that give an agent a database: MCP Toolbox for Databases (many engines, self-hosted, custom tools), the MongoDB MCP Server (MongoDB and Atlas), the Neon MCP Server (hosted, Neon Postgres) and the Supabase MCP Server (hosted, Supabase projects). It covers transports, auth, read-only modes and what they actually enforce, project and tool scoping, confirmation prompts, and each vendor's stated intended use. Tool lists were checked by running Toolbox 1.14.0 against a local Postgres and MongoDB MCP Server 3.1.0 in dry-run mode, and by querying Neon's public tool-list endpoint, on 2026-10-18."
author: Agentica Author
tags: [mcp, database, postgres, mongodb, read-only, security, mcp-servers]
entries: [mcp-toolbox-databases, mongodb-mcp-server, neon-mcp-server, supabase-mcp, postgres-mcp-pro, neon-agent-skills, supabase-agent-skills, mcp-inspector, mcp-authorization, gemini-cli, google-antigravity, pgvector]
related: [connect-an-agent-to-a-remote-mcp-server, agent-auth-and-delegated-access, agent-identity-and-mcp-auth, pick-an-mcp-server, vector-databases-for-agents, add-mcp-servers-to-claude-code, data-analysis-agent, devops-mcp-servers]
subjects: [mcp-toolbox-databases, mongodb-mcp-server, neon-mcp-server, supabase-mcp]
criteria:
  - Connects to
  - Where it runs
  - Auth
  - Read-only mode
  - Scoping and tool filters
  - Write safeguards
  - Intended use
  - License
rows:
  mcp-toolbox-databases:
    Connects to: "Many engines: AlloyDB, BigQuery, Cloud SQL (PostgreSQL, MySQL, SQL Server), Spanner, Firestore, PostgreSQL, MySQL, SQL Server, Oracle, MongoDB, Redis, Elasticsearch, ClickHouse, Neo4j, Snowflake and more"
    Where it runs: "You run it: binary, container, Homebrew or npx @toolbox-sdk/server; stdio (--stdio) or HTTP at :5000/mcp; deployable to Cloud Run. Google also offers managed Google Cloud MCP servers"
    Auth: "Database credentials in tools.yaml or env vars; optional auth services (Google Sign-In, generic OIDC) for authorized tool calls and parameters filled from token claims; OAuth 2.1 resource-server mode for the whole MCP endpoint"
    Read-only mode: "Engine-level session lock, write-tool pruning and readOnlyHint for Cloud SQL PostgreSQL and MySQL, AlloyDB and BigQuery (env var or readOnly: true on a source). For other engines, use a SELECT-only database user"
    Scoping and tool filters: "Prebuilt toolsets (--prebuilt=postgres/data loads 8 of 29 tools); custom tools.yaml with fixed, parameterized SQL; toolsets served at /mcp/<toolset>"
    Write safeguards: "readOnlyHint annotations for client approval, which the docs say are not a security boundary; optional screening of traffic with Google Cloud Model Armor; the docs recommend database permissions and parameterized tools"
    Intended use: "Prebuilt configs are for build-time use with trusted developers; custom tools are the path for production agents"
    License: "Apache-2.0"
  mongodb-mcp-server:
    Connects to: "MongoDB (any cluster by connection string) and the MongoDB Atlas admin API"
    Where it runs: "Local: npx mongodb-mcp-server or Docker; stdio by default, HTTP bound to 127.0.0.1. For Atlas, MongoDB recommends its hosted Atlas MCP server over OAuth (the mongodb-atlas plugin)"
    Auth: "Connection string; Atlas service-account client ID and secret for Atlas tools; OAuth on the Atlas-managed server"
    Read-only mode: "--readOnly (MDB_MCP_READ_ONLY) keeps only read, connect and metadata tools; without Atlas credentials that took the tool count from 27 to 18 in our dry run"
    Scoping and tool filters: "--disabledTools by name, operation type or category; result caps of 100 documents and 16 MiB per query by default; optional indexCheck rejects collection scans"
    Write safeguards: "Confirmation through MCP elicitation for drop-database, drop-collection, delete-many, drop-index and some Atlas tools, and for $out or $merge pipelines; runs without confirmation if the client lacks elicitation. Results are wrapped with a prompt-injection warning by default"
    Intended use: "Runs next to one agent or IDE by default; for shared servers MongoDB points to the Atlas-managed server or building on its library"
    License: "Apache-2.0"
  neon-mcp-server:
    Connects to: "Neon serverless Postgres: SQL plus the Neon Management API (projects, branches, computes, roles, migrations, logs)"
    Where it runs: "Hosted only, at https://mcp.neon.tech/mcp (Streamable HTTP; SSE at /sse is deprecated). The repository is the remote server's source"
    Auth: "OAuth with read and write scopes, or a Neon API key as a Bearer header; neon init can set it up"
    Read-only mode: "readonly=true on the URL, or untick Allow writes on the OAuth consent page; run_sql then runs each query in a READ ONLY transaction and connection strings are withheld (119 tools published unfiltered, 51 read-only)"
    Scoping and tool filters: "projectId, category and roleName URL parameters (roleName pins the Postgres login role for SQL); with OAuth they are fixed at consent. /api/list-tools previews the tool set without auth"
    Write safeguards: "Branch-based migrations (prepare, then complete); README asks you to review every action before it runs"
    Intended use: "Local development and IDE integrations only; Neon does not recommend it in production"
    License: "MIT"
  supabase-mcp:
    Connects to: "Supabase projects: Postgres SQL and migrations, logs and advisors, Edge Functions, branching, storage config, docs search and account tools"
    Where it runs: "Hosted at https://mcp.supabase.com/mcp; also built into the Supabase CLI (localhost:54321/mcp) and self-hosted Supabase, each with a subset of tools and no OAuth 2.1; npm package can serve your own endpoint"
    Auth: "OAuth 2.1 with dynamic client registration; a scoped personal access token in the Authorization header for CI; or a manual OAuth app"
    Read-only mode: "read_only=true runs all queries as a read-only Postgres user and drops mutating tools"
    Scoping and tool filters: "project_ref scopes to one project and hides account tools; features= picks tool groups (storage is off by default)"
    Write safeguards: "Elicitation forms confirm destructive SQL and paid project or branch creation when the client supports them; SQL results are wrapped with anti-injection instructions"
    Intended use: "A developer tool; Supabase says not to give it to your customers or end users"
    License: "Apache-2.0"
verdict: "For a coding agent on a Neon or Supabase project, the vendor's hosted server with read-only mode and one-project scoping is the least setup. For MongoDB, run the MongoDB server with --readOnly. For other engines, or for agents that run unattended in production, use MCP Toolbox with custom parameterized tools and a least-privilege database user, because a read-only flag on raw SQL is only as strong as what the database itself enforces."
sources:
  - {title: MCP Toolbox for Databases README, url: "https://github.com/googleapis/mcp-toolbox", accessed: 2026-10-18}
  - {title: "MCP Toolbox, Introduction", url: "https://mcp-toolbox.dev/documentation/introduction/", accessed: 2026-10-18}
  - {title: "MCP Toolbox, Prebuilt configs", url: "https://mcp-toolbox.dev/documentation/configuration/prebuilt-configs/", accessed: 2026-10-18}
  - {title: "MCP Toolbox, Read-only tools", url: "https://mcp-toolbox.dev/documentation/configuration/security/read-only/", accessed: 2026-10-18}
  - {title: "MCP Toolbox, Authentication", url: "https://mcp-toolbox.dev/documentation/configuration/authentication/", accessed: 2026-10-18}
  - {title: "MCP Toolbox, Security", url: "https://mcp-toolbox.dev/documentation/configuration/security/", accessed: 2026-10-18}
  - {title: "MCP Toolbox, Toolbox with MCP Authorization", url: "https://mcp-toolbox.dev/documentation/configuration/toolbox_mcp_auth/", accessed: 2026-10-18}
  - {title: MongoDB MCP Server README, url: "https://github.com/mongodb-js/mongodb-mcp-server", accessed: 2026-10-18}
  - {title: MongoDB MCP Server docs, url: "https://www.mongodb.com/docs/mcp-server/", accessed: 2026-10-18}
  - {title: Neon MCP Server README, url: "https://github.com/neondatabase/mcp-server-neon", accessed: 2026-10-18}
  - {title: Neon MCP Server docs, url: "https://neon.com/docs/ai/neon-mcp-server", accessed: 2026-10-18}
  - {title: "Neon MCP tool list (read-only)", url: "https://mcp.neon.tech/api/list-tools?readonly=true", accessed: 2026-10-18}
  - {title: Supabase MCP Server README, url: "https://github.com/supabase/mcp", accessed: 2026-10-18}
  - {title: Supabase MCP Server docs, url: "https://supabase.com/docs/guides/ai-tools/mcp", accessed: 2026-10-21}
  - {title: Postgres MCP Pro README, url: "https://github.com/crystaldba/postgres-mcp", accessed: 2026-10-18}
  - {title: "MCP specification, Elicitation", url: "https://modelcontextprotocol.io/specification/draft/client/elicitation", accessed: 2026-10-18}
last_verified: 2026-10-18
published: 2026-10-18
---

## What this covers

A database MCP server lets an agent look at schemas, run queries and, if you allow it, change data. The four here are the ones most agents meet: Google's engine-agnostic [MCP Toolbox for Databases](entry:mcp-toolbox-databases), and the vendor servers for [MongoDB](entry:mongodb-mcp-server), [Neon](entry:neon-mcp-server) and [Supabase](entry:supabase-mcp).

What was checked by running things on 2026-10-18:

- **MCP Toolbox 1.14.0** with `--prebuilt=postgres` against a local PostgreSQL, listed and called through the [MCP Inspector](entry:mcp-inspector) CLI. It published 29 tools, and `--prebuilt=postgres/data` cut that to 8. Connected as a role with only `SELECT` on a table, `execute_sql` returned rows for a `SELECT` and `permission denied for table notes (SQLSTATE 42501)` for an `INSERT`.
- **MongoDB MCP Server 3.1.0** with `--dryRun`, which prints the configuration and enabled tools without starting the server. With no Atlas credentials it enabled 27 tools; adding `--readOnly` left 18.
- **Neon's public endpoint** `https://mcp.neon.tech/api/list-tools`, which needs no auth. It listed 119 tools unfiltered, 51 with `readonly=true`, and 7 with `readonly=true&category=querying`.
- **Supabase** was not run, because its hosted server needs an account. Everything in its row comes from the docs.

## What "read-only" actually enforces

The flag has the same name everywhere but works differently in each server:

- **Enforced by the database.** Supabase runs queries "as a read-only Postgres user". Neon runs each `run_sql` call in a `READ ONLY` transaction and removes `run_sql_transaction`, because a `COMMIT` inside a multi-statement call could end the read-only transaction. Toolbox locks the session in the connection string for Cloud SQL and AlloyDB, uses a read-only connection for Cloud SQL MySQL, and uses BigQuery dry runs. Its docs explain why this matters: a check that a query starts with `SELECT` misses `WITH d AS (DELETE ...) SELECT ...` and functions that write.
- **Enforced by hiding tools.** MongoDB's `--readOnly` keeps only tools whose operation type is read, connect or metadata. Every server above also prunes its write tools, which saves context tokens.
- **Not covered.** Toolbox's read-only matrix lists only the Google Cloud engines and BigQuery. For self-managed Postgres, MySQL and the rest, its prebuilt-config docs tell you to connect as a dedicated user with only the privileges the agent needs. That is what our `SELECT`-only test did. Neon's `roleName` URL parameter does the same for Neon: SQL runs as the Postgres role you pin. It does not limit the Management API tools.

Whichever server you use, the strongest control is the database role the server connects as.

## Confirmation prompts depend on the client

MongoDB and Supabase can pause a risky tool call and ask the human through MCP [elicitation](https://modelcontextprotocol.io/specification/draft/client/elicitation). MongoDB asks before `drop-database`, `drop-collection`, `delete-many`, `drop-index`, some Atlas tools, and aggregation pipelines with `$out` or `$merge`. Supabase asks before destructive SQL and before creating paid projects or branches. Both docs add caveats. If the client does not support elicitation, MongoDB runs the tool without asking, and Supabase calls its prompts "a guardrail, not a guarantee", since some clients can answer them automatically. Supabase's `skip_elicitations` URL parameter turns specific prompts off. Treat these prompts as a convenience on top of read-only mode and scoping, not as a replacement.

## Scoping an agent to one project

- **Neon:** `?readonly=true&projectId=<id>&category=querying&category=schema&roleName=app_reader` on the MCP URL. With OAuth, the grant is fixed when you authorize and changing the URL later does not widen it. With an API key, the URL is read on every request. Neon's README warns that anyone who can edit that URL can remove the limits, so keep it in configuration the agent cannot change.
- **Supabase:** `?project_ref=<ref>&read_only=true&features=database,docs`. Project scoping hides the account-level tools.
- **MongoDB:** connect with a connection string for one database user, and add `--readOnly` and `--disabledTools`. Atlas tools only appear when you supply service-account credentials, and MongoDB asks you to give that account the minimum permissions.
- **Toolbox:** load one toolset (`--prebuilt=postgres/data`, or `/mcp/<toolset>` over HTTP), or write `tools.yaml` tools that each run one fixed, parameterized statement. Toolbox can also require a signed-in user per tool and fill parameters such as a user id from the token's claims, so the model never supplies them.

## Untrusted data in results

Rows can contain text written by your users, and a prompt-injection payload in a support ticket is Supabase's own example of the risk. Supabase wraps SQL results with instructions telling the model not to follow commands in the data. MongoDB wraps results in delimiters with a warning unless you set `disableUntrustedDataWarning`. Neither is foolproof, so combine them with read-only access and human review of writes. [Agent auth and delegated access](guide:agent-auth-and-delegated-access) covers giving an agent narrower credentials than your own.

## Other things to know

- **Telemetry:** the MongoDB server's configuration has telemetry `enabled` by default. Turn it off with `MDB_MCP_TELEMETRY=disabled` or `DO_NOT_TRACK=1`.
- **Skills:** Neon and Supabase also publish agent skills ([Neon](entry:neon-agent-skills), [Supabase](entry:supabase-agent-skills)), and `neon init` installs Neon's skills next to the MCP server. Toolbox can turn a toolset into an Agent Skill with `toolbox skills-generate`.
- **Clients:** Toolbox prebuilt configs can be installed with one click from the [Google Antigravity](entry:google-antigravity) MCP Store and as [Gemini CLI](entry:gemini-cli) extensions. All four work with any MCP client. See [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code) for one example.
- **Plain Postgres, one server:** [Postgres MCP Pro](entry:postgres-mcp-pro) (MIT, not compared above) is a single-database alternative to Toolbox for self-managed Postgres. Its README describes an `--access-mode=restricted` setting that limits the server to read-only transactions and caps execution time, plus index tuning and health-check tools.
- **Vectors:** if the agent needs similarity search too, the [vector database comparison](comparison:vector-databases-for-agents) covers [pgvector](entry:pgvector) on the Postgres-based options, and MongoDB's server can create Atlas Local deployments with automatic embedding through a Voyage AI key.
