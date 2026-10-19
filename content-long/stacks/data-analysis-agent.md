---
id: data-analysis-agent
type: stack
title: Data analysis agent stack
summary: "An agent that answers questions from your data: it queries DuckDB files, a ClickHouse warehouse or Postgres through read-only MCP servers, runs heavier analysis in a sandbox, reads spreadsheets and PDFs, and is tested and traced so you can trust the numbers."
description: "A component list for an analytics or BI agent, with the reason each piece is there and the safety settings that matter when you connect an agent to real data: read-only defaults, least-privilege database users, write and destructive-statement opt-ins, sandbox network controls, and evaluation in CI. Built around the DuckDB/MotherDuck, ClickHouse and Postgres MCP servers added to the directory on 2026-10-18 and 2026-10-19."
author: Agentica Author
use_case: "Answer business and research questions from tabular data (local files, a cloud warehouse or an operational Postgres) with SQL and Python, show the queries behind every number, and never change the data unless a human allows it."
components:
  - role: Agent harness
    entry: claude-agent-sdk
    why: "Claude Code's agent loop as a Python or TypeScript library, with MCP connections, subagents and permission controls over which tools run automatically and which need approval."
  - role: Local files and lake data
    entry: motherduck-mcp-server
    why: "The open-source local server opens DuckDB files read-only by default, as well as in-memory databases, S3-hosted DuckDB and MotherDuck. The managed remote server at api.motherduck.com/mcp adds OAuth and MotherDuck's Dives, Flights and Guides."
  - role: Warehouse
    entry: clickhouse-mcp-server
    why: "ClickHouse's official server runs queries read-only by default. Writes need CLICKHOUSE_ALLOW_WRITE_ACCESS=true and DROP-style statements need a second flag, and it takes typed query parameters so values are kept apart from SQL."
  - role: Operational Postgres
    entry: postgres-mcp-pro
    why: "Restricted mode limits the server to read-only transactions and caps execution time, and EXPLAIN and index-tuning tools help the agent understand why a query is slow before it runs it."
  - role: Many databases, fixed queries
    entry: mcp-toolbox-databases
    why: "When the agent should only run vetted queries, Toolbox lets you define parameterized SQL tools across many engines instead of handing over raw SQL."
  - role: Analysis sandbox
    entry: e2b
    why: "Runs the agent's pandas, plotting or modeling code in an isolated cloud sandbox instead of on your machine. Internet access is on by default and can be turned off or limited with allow and deny lists."
  - role: Spreadsheets and documents
    entry: markitdown
    why: "Converts Excel, PDF, Word and other files to Markdown so the agent can read tables and reports that are not in a database. It reads with the privileges of its process, so give it only the files it needs."
  - role: Answer testing
    entry: evidently
    why: "Open-source evals with LLM judges and text checks. Turn a Report into a Test Suite with pass/fail conditions and run it in CI against a set of questions with known answers."
  - role: Tracing
    entry: langfuse
    why: "Records every model call, tool call and SQL statement, so a reviewer can see which query produced which number, and so real questions can become test cases."
tags: [data-analysis, sql, analytics, mcp, duckdb, clickhouse, postgres, read-only]
entries: [claude-agent-sdk, motherduck-mcp-server, clickhouse-mcp-server, postgres-mcp-pro, mcp-toolbox-databases, e2b, markitdown, evidently, langfuse, redis-mcp-server, elastic-agent-builder-mcp, pinecone-mcp-server, neon-mcp-server, supabase-mcp, docling]
related: [database-mcp-servers, run-untrusted-code-in-a-sandbox, code-sandboxes, convert-documents-to-markdown-for-agents, evaluate-an-ai-agent, agent-observability-platforms, add-mcp-servers-to-claude-code]
sources:
  - {title: Claude Agent SDK overview, url: "https://code.claude.com/docs/en/agent-sdk/overview", accessed: 2026-10-19}
  - {title: MotherDuck MCP Server docs, url: "https://motherduck.com/docs/sql-reference/mcp/", accessed: 2026-10-19}
  - {title: DuckDB / MotherDuck local MCP server README, url: "https://github.com/motherduckdb/mcp-server-motherduck", accessed: 2026-10-19}
  - {title: ClickHouse MCP Server README, url: "https://github.com/ClickHouse/mcp-clickhouse", accessed: 2026-10-19}
  - {title: Postgres MCP Pro README, url: "https://github.com/crystaldba/postgres-mcp", accessed: 2026-10-19}
  - {title: MCP Toolbox for Databases README, url: "https://github.com/googleapis/mcp-toolbox", accessed: 2026-10-19}
  - {title: "E2B docs, Internet access", url: "https://docs.e2b.dev/network/internet-access", accessed: 2026-10-19}
  - {title: MarkItDown README, url: "https://github.com/microsoft/markitdown", accessed: 2026-10-19}
  - {title: Evidently README, url: "https://github.com/evidentlyai/evidently", accessed: 2026-10-19}
  - {title: Langfuse README, url: "https://github.com/langfuse/langfuse", accessed: 2026-10-19}
last_verified: 2026-10-19
published: 2026-10-19
---

## How the pieces fit

A data analysis agent works in a loop: understand the question, find the right tables, write a query, check the result, maybe compute more in Python, then explain the answer with the query behind it. The stack maps one component to each step and keeps the agent read-only unless a human allows more.

1. **Discover the schema first.** All three database servers have tools for listing databases and tables or reading schema. ClickHouse's `list_tables` is paginated and can leave out column details to keep responses small. ClickHouse also suggests reading an `AGENTS` schema database first if you keep one. MotherDuck's remote server can serve **Guides**: Markdown documents with your metric definitions and join conventions, so the agent stops guessing what "active user" means.
2. **Query where the data lives.** Use [DuckDB/MotherDuck](entry:motherduck-mcp-server) for local files, Parquet on S3 and MotherDuck, [ClickHouse](entry:clickhouse-mcp-server) for the warehouse and [Postgres MCP Pro](entry:postgres-mcp-pro) for the application database. Search indexes and caches have their own servers too: [Elastic Agent Builder](entry:elastic-agent-builder-mcp) for ES|QL and [Redis](entry:redis-mcp-server).
3. **Move big results out of the context.** MotherDuck's docs note that every tool result passes through the model's context. Ask for aggregates, not raw rows. When the agent needs a large extract for modeling, have it write the data to a file and process it in the [E2B](entry:e2b) sandbox with pandas, then return only the summary and the chart.
4. **Read what isn't in a database.** Convert spreadsheets and PDF reports with [MarkItDown](entry:markitdown), or with [Docling](entry:docling) for complex layouts. The [document conversion guide](guide:convert-documents-to-markdown-for-agents) compares the options.
5. **Show the work.** Require the final answer to include the SQL it ran. [Langfuse](entry:langfuse) keeps the full trace, so anyone can re-run the query.

The harness here is the [Claude Agent SDK](entry:claude-agent-sdk). Any MCP-capable harness works; see [adding MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code) for one client's setup.

## Keep it read-only by default

- **Use the server defaults.** The local DuckDB server opens a file read-only unless you pass `--read-write`. ClickHouse runs read-only unless `CLICKHOUSE_ALLOW_WRITE_ACCESS=true`, and `DROP`-style statements need a further opt-in even then. Postgres MCP Pro's `--access-mode=restricted` allows only read-only transactions and limits execution time.
- **Give the server its own database user.** ClickHouse's README is explicit that its write checks are "a best-effort guard against accidents" and that the real security boundary is the ClickHouse user's grants. Its read-only mode is enforced server-side with `readonly=1`. Apply the same rule everywhere: a dedicated user with `SELECT` on the tables the agent needs. The [database MCP servers comparison](comparison:database-mcp-servers) explains what each server's read-only flag really enforces.
- **Pass values as parameters.** ClickHouse's `run_query` accepts a `params` object for `{name:Type}` placeholders, so user-supplied values never get pasted into SQL text. If the agent should only ever run known queries, define them as parameterized tools in [MCP Toolbox](entry:mcp-toolbox-databases) instead of exposing raw SQL.
- **Lock down the sandbox.** E2B sandboxes have internet access by default. Turn it off, or allow only the hosts you need, once the data is loaded, so analysis code cannot send your data anywhere. See [running untrusted code in a sandbox](guide:run-untrusted-code-in-a-sandbox).

## Test the answers, not just the queries

A query can run without errors and still answer the wrong question. Keep a set of questions with known answers, such as last quarter's revenue or this month's sign-ups, and run the agent against them on every prompt or model change. [Evidently](entry:evidently) turns these checks into a Test Suite with pass/fail conditions for CI. Its LLM-judge evals can also grade the written explanation, not just the final number. [Evaluate an AI agent](guide:evaluate-an-ai-agent) covers building that dataset from real traces.

## Variations

- **Postgres on Neon or Supabase:** use their hosted servers with read-only mode and one-project scoping ([Neon](entry:neon-mcp-server), [Supabase](entry:supabase-mcp)).
- **Semantic search over documents:** add a vector store, for example through the [Pinecone MCP server](entry:pinecone-mcp-server). See the [vector databases comparison](comparison:vector-databases-for-agents).
