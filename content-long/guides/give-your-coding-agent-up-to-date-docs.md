---
id: give-your-coding-agent-up-to-date-docs
type: guide
title: "Give your coding agent up-to-date library docs over MCP (Context7, GitMCP, DeepWiki, Microsoft Learn)"
summary: "Stop your coding agent from guessing at APIs that changed after its training cutoff. Connect free remote docs MCP servers (Context7, GitMCP, DeepWiki, Microsoft Learn) to Claude Code, Codex or Cursor, learn which tool to call for what, and keep a self-hosted fallback for private docs."
description: "A practical guide to documentation MCP servers for coding agents. Every server here was probed on 2026-10-23 with a real MCP initialize and tools/list over Streamable HTTP, and Context7, GitMCP and DeepWiki also answered a live tools/call for the Pipecat repository. The tool names and arguments below are what the servers returned that day. It covers setup for Claude Code, Codex and Cursor, a short AGENTS.md rule that gets the agent to actually use the tools, privacy and prompt-injection caveats, and local options for private or offline docs."
author: Agentica Author
difficulty: beginner
time_estimate: 15 min
prerequisites:
  - "A coding agent that supports remote (Streamable HTTP) MCP servers, such as Claude Code, Codex CLI or Cursor"
  - "Internet access; none of the four hosted servers needs an account (Context7 accepts an optional API key)"
tags: [mcp, documentation, coding-agents, remote-mcp, context, hallucinations]
entries: [context7, gitmcp, deepwiki-mcp, microsoft-learn-mcp, twilio-docs-mcp, grounded-docs-mcp-server, seekstorm-mcp-server, llms-txt, claude-code, codex-cli, cursor, agents-md, model-context-protocol]
related: [connect-an-agent-to-a-remote-mcp-server, add-mcp-servers-to-claude-code, pick-an-mcp-server, test-an-agent-for-prompt-injection, coding-agent-harnesses, voice-agent-platforms]
sources:
  - {title: Context7, url: "https://context7.com", accessed: 2026-10-23}
  - {title: "Twilio docs: Twilio MCP server (docs search)", url: "https://www.twilio.com/docs/ai/mcp", accessed: 2026-10-31}
  - {title: GitMCP README, url: "https://github.com/idosal/git-mcp", accessed: 2026-10-23}
  - {title: "DeepWiki MCP (Devin docs)", url: "https://docs.devin.ai/work-with-devin/deepwiki-mcp", accessed: 2026-10-23}
  - {title: Microsoft Learn MCP Server, url: "https://learn.microsoft.com/en-us/training/support/mcp", accessed: 2026-10-23}
  - {title: Grounded Docs MCP Server, url: "https://grounded.tools", accessed: 2026-10-23}
  - {title: SeekStorm MCP server README, url: "https://github.com/SeekStorm/SeekStorm/blob/main/seekstorm_mcp_server/README.md", accessed: 2026-10-23}
  - {title: "Claude Code docs: Connect Claude Code to tools via MCP", url: "https://code.claude.com/docs/en/mcp", accessed: 2026-10-23}
  - {title: "Cursor docs: Model Context Protocol", url: "https://cursor.com/docs/mcp", accessed: 2026-10-23}
  - {title: The /llms.txt file proposal, url: "https://llmstxt.org/", accessed: 2026-10-23}
last_verified: 2026-10-23
published: 2026-10-23
updated: 2026-10-31
---

Models learn libraries at training time. When a library ships a breaking change afterwards, a coding agent writes code for the old API, and it does so confidently. The fix is to let the agent read current documentation while it works. Several free remote MCP servers do exactly that, and connecting one takes a single command.

## Pick the right server

| Server | Best for | Endpoint | Tools (as returned on 2026-10-23) |
|---|---|---|---|
| [Context7](entry:context7) | Popular libraries and frameworks: curated, versioned snippets | `https://mcp.context7.com/mcp` | `resolve-library-id(libraryName, query)`, then `query-docs(libraryId, query, language)` |
| [GitMCP](entry:gitmcp) | Any public GitHub repo, including niche or brand-new ones | `https://gitmcp.io/{owner}/{repo}` or `https://gitmcp.io/docs` | Per repo: `fetch_<repo>_documentation`, `search_<repo>_documentation(query)`, `search_<repo>_code(query, page)`, `fetch_generic_url_content(url)`. Generic `/docs`: the same with `owner`/`repo` arguments plus `match_common_libs_owner_repo_mapping(library)` |
| [DeepWiki MCP](entry:deepwiki-mcp) | Understanding how a repository works internally | `https://mcp.deepwiki.com/mcp` | `read_wiki_structure(repoName)`, `read_wiki_contents(repoName)`, `ask_wiki_question(repoName, question)` |
| [Microsoft Learn MCP](entry:microsoft-learn-mcp) | Azure, .NET, Microsoft 365 and other Microsoft docs | `https://learn.microsoft.com/api/mcp` | `microsoft_docs_search(query)`, `microsoft_code_sample_search(query, language)`, `microsoft_docs_fetch(url)` |

They differ in where the text comes from:

- **Context7** serves an indexed library catalog, and one library can have several IDs. For Pipecat, `resolve-library-id` returned `/pipecat-ai/docs` (20,214 snippets), `/pipecat-ai/pipecat` (1,721) and an llms.txt-based ID. Let the agent pick the ID that matches the question.
- **GitMCP** reads the repository itself. It prefers the project's [llms.txt](entry:llms-txt), then falls back to `README.md` and other pages, and its code search uses the GitHub search API (exact match). A per-repo URL keeps the agent on one project. The generic `/docs` URL lets the agent choose the repo for each request, which is more flexible but easier to point at the wrong repo.
- **DeepWiki** answers from an AI-generated wiki of the repo. `ask_wiki_question` returns a written answer, and in our test it explained Pipecat's `MCPClient.tools()` flow with a code sample. Treat that answer as a summary and check it against the source.

Some vendors now run the same kind of server for their own docs. [Twilio's docs MCP server](entry:twilio-docs-mcp) at `https://mcp.twilio.com/docs` is in Public Beta and needs no authentication. On 2026-10-31 it returned two tools, `twilio__search` and `twilio__retrieve`, covering Twilio, SendGrid and Segment docs and Twilio's public API operations. It only reads documentation; it cannot call Twilio's APIs.

## Connect them

**Claude Code** (remote HTTP servers, user scope so they work in every project):

```bash
claude mcp add --scope user --transport http context7 https://mcp.context7.com/mcp
claude mcp add --scope user --transport http deepwiki https://mcp.deepwiki.com/mcp
claude mcp add --scope user --transport http mslearn https://learn.microsoft.com/api/mcp
# one GitMCP server per repo you depend on, or the generic one:
claude mcp add --scope user --transport http gitmcp-pipecat https://gitmcp.io/pipecat-ai/pipecat
claude mcp list
```

**Codex CLI:**

```bash
codex mcp add context7 --url https://mcp.context7.com/mcp
codex mcp add deepwiki --url https://mcp.deepwiki.com/mcp
codex mcp add gitmcp --url https://gitmcp.io/docs
```

**Cursor** (`~/.cursor/mcp.json` or `.cursor/mcp.json` in the project):

```json
{
  "mcpServers": {
    "context7": { "url": "https://mcp.context7.com/mcp" },
    "deepwiki": { "url": "https://mcp.deepwiki.com/mcp" },
    "gitmcp-pipecat": { "url": "https://gitmcp.io/pipecat-ai/pipecat" }
  }
}
```

Context7 works without a key. Its entry notes that an optional API key (sent as `Authorization: Bearer ...`) raises rate limits. Keep that key in an environment variable, not in a committed `.mcp.json`. For more on scopes, headers and OAuth, see [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server) and [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code).

## Make the agent actually use them

Agents often skip tools they aren't told about. Add a short rule to the project's [AGENTS.md](entry:agents-md) (or `CLAUDE.md`):

```markdown
## Library docs
Before writing or changing code that uses a third-party library, look up the current API:
- Popular libraries: Context7 (resolve-library-id, then query-docs).
- A specific GitHub repo or a very new library: the gitmcp-* server for that repo.
- How a repo works internally: DeepWiki ask_wiki_question, then confirm in the source.
Quote the version you looked up in the PR description.
```

Check that it works by asking something that changed recently. For example, ask how to add MCP tools to a Pipecat bot. The agent should call a docs tool before it writes code.

## Keep the context budget in check

Each server adds tool definitions to every request, and documentation pages are long. In our test, one GitMCP `search_generic_documentation` call returned about 17,000 characters. So:

- Connect only the servers you use, and prefer per-repo GitMCP URLs to many generic ones.
- Ask narrow questions (`query-docs` with a specific `query`, not the whole manual).
- If your harness supports per-server tool filters, hide tools you don't need, such as `fetch_generic_url_content`.

## Safety and privacy

- **Docs are untrusted input.** A README or doc page can contain text that tries to steer the agent. That is indirect prompt injection, the same risk covered in [Test an agent for prompt injection](guide:test-an-agent-for-prompt-injection). Don't give a docs-reading session permission to push code or reach secrets without review.
- **Your questions leave your machine.** Queries go to the hosted service and can include code identifiers. GitMCP states that it doesn't store queries or collect personal information. Check each provider's policy before you use it on confidential code.
- **Public repos only.** The hosted servers read public sources. For private repos or internal docs, run a server locally (next section).

## Private or offline docs

- [Grounded Docs MCP Server](entry:grounded-docs-mcp-server) scrapes and indexes documentation sites, files and code on your machine (`npx @arabold/docs-mcp-server@latest`) and serves them at a local MCP endpoint. It describes itself as an open-source alternative to Context7.
- [SeekStorm MCP Server](entry:seekstorm-mcp-server) (new in October 2026) is a single Rust binary over stdio that indexes your own documents and PDFs. It supports lexical, vector and hybrid search, with no network or separate search server.
- If you publish a library, add an `llms.txt` to your docs. GitMCP and many agents look for it first.

Browse more servers in the directory under [MCP servers](https://indexagentica.com/categories/mcp-servers/), or use the [pick-an-mcp-server](skill:pick-an-mcp-server) skill to have your agent choose.
