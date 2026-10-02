---
id: web-search-apis
type: comparison
title: Web search APIs for agents
summary: Tavily, Exa, Brave Search, Parallel and Perplexity compared on endpoints, index, list price per 1,000 searches, free allowance and MCP support, for agents that need fresh web results.
description: "List prices and free allowances are from each vendor's pricing page on 2026-10-02 and change often; the per-request figures are for a basic search, and deeper modes cost more. Result quality isn't compared here: run your own queries through two or three of these before you choose."
author: Agentica Author
tags: [web-search, apis, mcp, research]
entries: [tavily-api, exa-api, brave-search-api, parallel-api, perplexity-api, tavily-mcp, exa-mcp-server, brave-search-mcp-server]
subjects: [tavily-api, exa-api, brave-search-api, parallel-api, perplexity-api]
criteria:
  - Endpoints
  - Index
  - Search price
  - Free allowance
  - MCP server
  - Agent extras
rows:
  tavily-api:
    Endpoints: "Search, Extract, Crawl, Map, Research"
    Index: Not stated in the sources used
    Search price: "Credit-based; credits per call depend on the endpoint and depth"
    Free allowance: "1,000 API credits per month, no card; free for students"
    MCP server: "Yes, remote at mcp.tavily.com/mcp with OAuth or an API key (tavily-mcp)"
    Agent extras: "tvly CLI that also installs Agent Skills; docs MCP server"
  exa-api:
    Endpoints: "Search (several depths), Contents, Answer, Monitors, Exa Agent"
    Index: Own web index
    Search price: "From $4 per 1,000 requests (up to 10 results); contents $1 per 1,000 pages"
    Free allowance: "$10 of credits per month plus a $10 onboarding bonus, no payment method"
    MCP server: "Yes, hosted at mcp.exa.ai/mcp, no API key needed to start; open source (exa-mcp-server)"
    Agent extras: "Agent Skills (npx skills add exa-labs/agent-skills), Claude connector"
  brave-search-api:
    Endpoints: "Web, news, images, videos, local and LLM context; Answers; spellcheck and autosuggest"
    Index: "Own independent index, 40+ billion pages"
    Search price: "$5 per 1,000 requests; Answers $4 per 1,000 queries plus tokens"
    Free allowance: $5 of credits every month
    MCP server: "Yes, brave-search-mcp-server (stdio by default, HTTP optional)"
    Agent extras: Goggles to re-rank or exclude domains
  parallel-api:
    Endpoints: "Search, Extract, Task (deep research), Responses, Monitor, FindAll"
    Index: Not stated in the sources used
    Search price: "$0.001 to $0.005 per request for 10 results ($1 to $5 per 1,000)"
    Free allowance: "Up to 5,000 requests per month free; $5 monthly credit and up to $80 at signup"
    MCP server: Yes (Search MCP and Task MCP)
    Agent extras: "Compressed excerpts sized for LLM context; structured outputs with citations and confidence on Task"
  perplexity-api:
    Endpoints: "Search API (raw results), Sonar and Agent APIs (grounded answers), Embeddings"
    Index: Not stated in the sources used
    Search price: "$5 per 1,000 requests, no token costs"
    Free allowance: Not stated in the sources used
    MCP server: Yes (Perplexity API MCP server)
    Agent extras: Multi-provider Agent API for web-grounded answers
verdict: "For raw results to feed your own agent, Exa, Brave and Parallel are the most transparent on price, and Brave is the only one stating index size. Tavily is the easiest all-in-one (search, extract, crawl and research behind one key and an OAuth MCP server). Choose Perplexity or Parallel's Task API when you want the provider to do the research and return a cited answer."
sources:
  - title: Tavily docs index (llms.txt)
    url: https://docs.tavily.com/llms.txt
    accessed: 2026-10-02
  - title: Tavily pricing
    url: https://www.tavily.com/pricing
    accessed: 2026-10-02
  - title: Exa docs index (llms.txt)
    url: https://exa.ai/docs/llms.txt
    accessed: 2026-10-02
  - title: Exa pricing
    url: https://exa.ai/pricing
    accessed: 2026-10-02
  - title: Exa docs, Exa MCP
    url: https://exa.ai/docs/get-started/exa-mcp
    accessed: 2026-10-02
  - title: Brave Search API
    url: https://brave.com/search/api/
    accessed: 2026-10-02
  - title: Brave Search API pricing
    url: https://api-dashboard.search.brave.com/documentation/pricing
    accessed: 2026-10-02
  - title: Brave Search MCP server README
    url: https://github.com/brave/brave-search-mcp-server
    accessed: 2026-10-02
  - title: Parallel pricing
    url: https://parallel.ai/pricing
    accessed: 2026-10-02
  - title: Parallel docs index (llms.txt)
    url: https://docs.parallel.ai/llms.txt
    accessed: 2026-10-02
  - title: Perplexity docs, Pricing
    url: https://docs.perplexity.ai/docs/getting-started/pricing
    accessed: 2026-10-02
  - title: Perplexity docs index (llms.txt)
    url: https://docs.perplexity.ai/llms.txt
    accessed: 2026-10-02
related: [research-agent, connect-an-agent-to-a-remote-mcp-server, coding-agent-starter]
last_verified: 2026-10-02
published: 2026-10-02
---

## What these APIs are for

A model's training data is months old, and a general web search engine returns pages built for people. These APIs return results built for a model: clean text or excerpts, sometimes full page contents, in one call, priced per request. All five offer an MCP server, so a harness such as Claude Code or Codex can use them without custom code; see the [remote MCP guide](guide:connect-an-agent-to-a-remote-mcp-server).

They split into two groups:

- **Search primitives** return ranked results and excerpts, and your agent does the reading and reasoning: [Exa](entry:exa-api) Search, [Brave Search](entry:brave-search-api), [Parallel](entry:parallel-api) Search, the [Perplexity](entry:perplexity-api) Search API and [Tavily](entry:tavily-api) Search.
- **Research endpoints** run a multi-step search and return a cited answer or a structured result: Tavily Research, Exa Answer and Exa Agent, Parallel Task, Perplexity Sonar and Agent APIs, and Brave Answers. They save agent turns but hide the intermediate steps, which makes them harder to audit.

## Choosing

- **Price per search** ranges from about $1 to $5 per 1,000 basic requests among the vendors that publish per-request prices; deeper modes, more results and page contents add to that. Tavily prices in credits whose cost depends on the endpoint and depth.
- **Index.** Brave and Exa run their own indexes, and Brave publishes a size (40+ billion pages, with 100+ million page updates a day). The others don't state where results come from in the pages used here.
- **Reading pages.** If your agent needs full text, check whether contents come in the same call (Exa Contents, Tavily Extract, Parallel Extract) or need a separate reader such as [Firecrawl](entry:firecrawl-api) or [Jina Reader](entry:jina-reader).
- **MCP auth.** Exa's hosted server works without a key to start, and Tavily's supports OAuth, which keeps keys out of config files. Brave's server now defaults to stdio and needs `BRAVE_MCP_TRANSPORT=http` for HTTP.
- **Evaluate on your own queries.** Quality varies by domain (news, code, academic, local). Run a fixed set of 20 to 50 real queries through two or three APIs and compare what your agent does with the results.

For a full research setup built on these, see the [research agent stack](stack:research-agent).
