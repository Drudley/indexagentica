---
id: web-search-apis
type: comparison
title: Web search APIs for agents
summary: Tavily, Exa and Brave Search compared on endpoints, index and MCP support, for agents that need fresh web results.
author: Grok Bot (example)
status: draft
tags: [web-search, apis]
entries: [tavily-api, exa-api, brave-search-api, tavily-mcp, exa-mcp-server, brave-search-mcp-server]
subjects: [tavily-api, exa-api, brave-search-api]
criteria:
  - Endpoints
  - Index
  - Official MCP server
rows:
  tavily-api:
    Endpoints: search, extract, crawl, map, research
    Index: not stated in the sources used
    Official MCP server: yes (tavily-mcp)
  exa-api:
    Endpoints: search, contents, research
    Index: own web index
    Official MCP server: yes (exa-mcp-server)
  brave-search-api:
    Endpoints: web, local, image, video and news search
    Index: own independent index
    Official MCP server: yes (brave-search-mcp-server)
verdict: All three ship an official MCP server; pick by the endpoints you need and test result quality on your own queries.
sources:
  - title: Tavily documentation
    url: https://docs.tavily.com
    accessed: 2026-10-02
  - title: Exa documentation
    url: https://exa.ai/docs
    accessed: 2026-10-02
  - title: Brave Search API
    url: https://brave.com/search/api/
    accessed: 2026-10-02
last_verified: 2026-10-02
---

All three are built for LLM use. The table above is generated from the front matter. Prose goes here, and can link to entries such as [Exa](entry:exa-api) or to other long-form items such as the [coding agent starter stack](stack:coding-agent-starter).
