---
id: research-agent
type: stack
title: Research agent stack
summary: An agent that searches the web and the scholarly record, reads full sources, runs analysis code in a sandbox and cites what it found, with tracing so you can audit how it got there.
description: "A component list for a deep-research style agent, with the reason each piece is there and the limits that matter when you wire it up (rate limits, free tiers, authentication). Every component is swappable; the alternatives named in the notes are directory entries too."
author: Agentica Author
use_case: Answer open research questions with cited sources by searching the web and academic indexes, reading full texts, running analysis in a sandbox and logging every step for review.
components:
  - role: Agent harness
    entry: claude-agent-sdk
    why: "Gives you Claude Code's agent loop, tools and context management as a Python or TypeScript library, with MCP support, so the research loop runs in your own app or CI."
  - role: Web search
    entry: exa-api
    why: "Search built for agents on Exa's own index, with page contents in the same call. A hosted MCP server at mcp.exa.ai/mcp works without an API key to start."
  - role: Web search (alternative)
    entry: tavily-api
    why: "Search plus extract, crawl and map endpoints returning LLM-ready content; a good second source when you want to cross-check results across indexes."
  - role: Page reading
    entry: firecrawl-api
    why: "Scrapes pages to clean Markdown, with browser actions for dynamic pages, plus crawl and map endpoints; open source (AGPL-3.0) if you need to self-host."
  - role: Quick page reading
    entry: jina-reader
    why: "Prefix any URL with r.jina.ai to get Markdown. Use an API key; anonymous requests are rate-limited and can be refused from cloud networks."
  - role: Scholarly metadata
    entry: openalex-api
    why: "Open catalog of works, authors, institutions and citations with CC0 data. A free account's API key includes $1 of usage per day; paid plans add more."
  - role: Papers and citations
    entry: semantic-scholar-api
    why: "Paper search, citation graphs and author data. Most endpoints work without a key on a shared, throttled pool; a free key gives higher limits."
  - role: Preprints
    entry: arxiv-api
    why: "Search and metadata for arXiv preprints. The terms allow one request every three seconds on a single connection, so queue and cache calls."
  - role: Browser
    entry: playwright-mcp
    why: "A real browser for pages that block simple fetches or need clicking; works from accessibility snapshots rather than screenshots."
  - role: Analysis sandbox
    entry: e2b
    why: "Runs the agent's pandas or plotting code in a disposable microVM, with the network turned off once data is loaded."
  - role: Tracing and evals
    entry: langfuse
    why: "Open-source tracing of every model call and tool call (MIT outside its enterprise directories), so you can check which sources an answer really came from and build evals."
tags: [research, web-search, academic, agents, citations]
entries: [claude-agent-sdk, exa-api, exa-mcp-server, tavily-api, firecrawl-api, jina-reader, openalex-api, semantic-scholar-api, arxiv-api, playwright-mcp, e2b, langfuse, brave-search-api, parallel-api, openai-agents-sdk, langgraph]
sources:
  - title: Claude Code docs, Run Claude Code programmatically (Agent SDK)
    url: https://code.claude.com/docs/en/headless
    accessed: 2026-10-02
  - title: Exa docs, Exa MCP
    url: https://exa.ai/docs/get-started/exa-mcp
    accessed: 2026-10-02
  - title: Jina Reader
    url: https://jina.ai/reader
    accessed: 2026-10-02
  - title: OpenAlex Help, Pricing overview
    url: https://help.openalex.org/access/pricing
    accessed: 2026-10-02
  - title: Semantic Scholar API
    url: https://www.semanticscholar.org/product/api
    accessed: 2026-10-02
  - title: arXiv, Terms of Use for arXiv APIs
    url: https://info.arxiv.org/help/api/tou.html
    accessed: 2026-10-02
  - title: Langfuse LICENSE
    url: https://github.com/langfuse/langfuse/blob/main/LICENSE
    accessed: 2026-10-02
  - title: E2B docs, Internet access
    url: https://docs.e2b.dev/network/internet-access
    accessed: 2026-10-02
related: [web-search-apis, run-untrusted-code-in-a-sandbox, code-sandboxes, give-an-agent-long-term-memory, connect-an-agent-to-a-remote-mcp-server]
last_verified: 2026-10-02
published: 2026-10-02
---

## How the pieces fit

A research agent runs the same loop over and over: plan the question, search, read, take notes, check, write. The stack above maps one component to each step.

1. **Search wide, then deep.** Start with a web search API ([Exa](entry:exa-api), with [Tavily](entry:tavily-api), [Brave Search](entry:brave-search-api) or [Parallel](entry:parallel-api) as alternatives) for recent and general sources, and the scholarly APIs ([OpenAlex](entry:openalex-api), [Semantic Scholar](entry:semantic-scholar-api), [arXiv](entry:arxiv-api)) for peer-reviewed work and citation trails. Search results are snippets; don't let the agent cite a snippet.
2. **Read the source.** Fetch full pages as Markdown with [Firecrawl](entry:firecrawl-api) or [Jina Reader](entry:jina-reader), and fall back to a real browser ([Playwright MCP](entry:playwright-mcp)) when a page needs JavaScript or interaction.
3. **Compute in a sandbox.** When the question needs numbers, have the agent write analysis code and run it in [E2B](entry:e2b), not on your machine. Load the data, then cut the network. The [sandboxing guide](guide:run-untrusted-code-in-a-sandbox) explains why.
4. **Trace everything.** Send every model call and tool call to [Langfuse](entry:langfuse). For a research agent the trace is the audit trail: it shows which fetched document each claim came from.

The harness here is the [Claude Agent SDK](entry:claude-agent-sdk); the [OpenAI Agents SDK](entry:openai-agents-sdk) or [LangGraph](entry:langgraph) work the same way if you prefer them. If your harness speaks MCP, most of these components can be connected as MCP servers instead of custom tools; see the [remote MCP guide](guide:connect-an-agent-to-a-remote-mcp-server).

## Practical limits to plan for

- **Rate limits.** arXiv asks for at most one request every three seconds across all your machines. Semantic Scholar's unauthenticated pool is shared and throttled. OpenAlex's free tier is a daily usage budget tied to an API key. Put a queue and a cache in front of the scholarly APIs, and give each its own key.
- **Prompt injection.** Every page the agent reads is untrusted input. Keep the browser and fetch tools away from credentials, and don't give the same agent a tool that can send email or spend money.
- **Citation hygiene.** Require a URL or DOI for every claim, and have a final pass re-fetch each cited source and check that the quoted text is there. Search snippets and model memory are not sources.
- **Memory across sessions.** For long projects, keep notes in files the agent re-reads, or add a memory layer; see [giving an agent long-term memory](guide:give-an-agent-long-term-memory).

To choose between the search APIs, see the [web search APIs comparison](comparison:web-search-apis).
