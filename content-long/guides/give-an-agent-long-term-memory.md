---
id: give-an-agent-long-term-memory
type: guide
title: Give an agent long-term memory
summary: How to make an agent remember users, facts and lessons across sessions, choosing between file-based memory, a memory layer such as Mem0, a temporal knowledge graph such as Zep or Graphiti, a stateful agent platform such as Letta, or your own store.
description: "Long-term memory is not one feature but a set of design decisions: what kind of memory you need (facts, experiences or instructions), who writes it (the agent on the hot path or a background job), how it is scoped and searched, and how it is kept correct and private over time. This guide walks through those decisions and maps them to current tools, with verified, minimal examples for the Claude memory tool, Mem0 and the LangGraph store."
author: Agentica Author
difficulty: intermediate
time_estimate: 25 min
prerequisites:
  - An agent loop you control (any SDK or framework)
  - An LLM API key; Mem0 and Graphiti default to OpenAI models for extraction and embeddings
tags: [memory, agents, personalization, knowledge-graphs, vector-search]
entries: [mem0, zep, graphiti, letta, langgraph, cognee, supermemory, pgvector, qdrant]
sources:
  - title: LangChain docs, LangGraph memory overview
    url: https://docs.langchain.com/oss/python/concepts/memory
    accessed: 2026-10-02
  - title: Claude docs, Memory tool
    url: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
    accessed: 2026-10-02
  - title: Mem0 README
    url: https://github.com/mem0ai/mem0
    accessed: 2026-10-02
  - title: Graphiti README
    url: https://github.com/getzep/graphiti
    accessed: 2026-10-02
  - title: Zep documentation
    url: https://help.getzep.com/
    accessed: 2026-10-02
  - title: "Zep: A Temporal Knowledge Graph Architecture for Agent Memory (arXiv 2501.13956)"
    url: https://arxiv.org/abs/2501.13956
    accessed: 2026-10-02
  - title: Letta docs, Memory
    url: https://docs.letta.com/agent-sdk/memory/
    accessed: 2026-10-02
  - title: Letta README (current source moved to letta-ai/letta-code)
    url: https://github.com/letta-ai/letta
    accessed: 2026-10-02
  - title: pgvector README
    url: https://github.com/pgvector/pgvector
    accessed: 2026-10-02
related: [research-agent, coding-agent-starter, connect-an-agent-to-a-remote-mcp-server]
last_verified: 2026-10-02
published: 2026-10-02
---

## What "memory" means here

Every agent already has **short-term memory**: the messages in the current context window, plus whatever state your framework checkpoints for the current thread. This guide is about **long-term memory**, the information that survives the end of a conversation and comes back in a later one, possibly in a different thread, on a different machine or with a different model.

The LangGraph docs give a useful split borrowed from psychology (and the CoALA paper):

| Type | What is stored | Agent example |
|---|---|---|
| Semantic | Facts | "The user's company is on AWS and prefers Terraform." |
| Episodic | Experiences | "Last time, the migration failed because the staging DB was read-only." |
| Procedural | Instructions | An updated system prompt or rules the agent has learned. |

Most products called "agent memory" focus on semantic memory about users. If what you actually need is the agent getting better at a task, you want episodic or procedural memory, and the design looks different (few-shot examples, an evolving instruction file, a skills folder).

## Decision 1: who writes memories, and when

There are two patterns, and LangGraph's docs name them well:

- **On the hot path.** The agent decides, mid-conversation, to save something, usually through a tool call (`remember(...)`, a file write). Memories are available immediately and the agent can tell the user what it saved. The cost is latency and tokens on every turn, and the agent has to judge what's worth keeping while it is also doing the task.
- **In the background.** A separate process reads finished conversations (or batches of them) and extracts, merges and rewrites memories. The main agent stays fast and focused, and the extractor can use a different model and prompt. The cost is that new memories aren't available until the job runs.

Many systems do both. [Letta](entry:letta) agents edit their own memory during work and also run "dreaming": background subagents that review recent conversations and consolidate lessons, triggered after a number of steps or on context compaction.

## Decision 2: how memories are stored and found

| Approach | How retrieval works | Good at | Watch out for |
|---|---|---|---|
| Files the agent reads and writes | The agent lists and opens files itself | Procedural memory, project notes, transparency (you can read and edit the files) | Grows without bound unless the agent prunes it; no ranking |
| Vector store of extracted facts | Embedding similarity, often plus keyword search | "What do I know that's relevant to this message?" over many small facts | Contradictions pile up; similar is not the same as current |
| Temporal knowledge graph | Graph traversal plus semantic and keyword search, with time | Facts that change ("works at X" until March), relationships between entities | More moving parts: a graph database and an LLM extraction step |
| Stateful agent platform | The platform decides what is in context and what is paged in | Long-lived agents with identity and self-edited memory | You adopt the platform's runtime, not just a library |

## Option A: file-based memory (Claude memory tool)

The simplest long-term memory is a directory of notes. Anthropic's **memory tool** formalizes this: you add `{"type": "memory_20250818", "name": "memory"}` to `tools`, and Claude issues file commands (`view`, `create`, `str_replace`, `insert`, `delete`, `rename`) against a `/memories` directory. The tool is **client-side**, so your application executes each command against storage you control and returns the result. The docs say it is available on all Claude 4 and later models.

The Python and TypeScript SDKs include a local filesystem implementation and a tool runner that handles the loop:

```python
import anthropic
from anthropic.tools import BetaLocalFilesystemMemoryTool

client = anthropic.Anthropic()
memory = BetaLocalFilesystemMemoryTool(base_path="./memory")

runner = client.beta.messages.tool_runner(
    model="claude-opus-5-5",  # any Claude 4+ model
    max_tokens=1024,
    messages=[{"role": "user", "content": "Remember that Acme Corp prefers email follow-ups."}],
    tools=[memory],
)
print(runner.until_done().content)
```

If you write your own handler (for example, to store memories in a database per user), the docs are explicit that **you must validate every path**: a request for `/memories/../../secrets.env` must be rejected. Treat each user's memory directory as a separate namespace.

This pattern fits procedural and episodic memory especially well: the agent can keep a `lessons.md` or a project log and read it at the start of each task. Letta's MemFS takes the same idea further, keeping each agent's memory as Markdown files in a git repository: files under `system/` are always in the prompt, and the rest are listed as a tree the agent reads on demand.

## Option B: a memory layer (Mem0)

[Mem0](entry:mem0) (Apache-2.0) sits beside your agent: you pass it conversations, it uses an LLM to extract memories, and you search them before each response. It comes as a Python and npm library, a self-hosted server (`docker compose up`) and a managed platform. The open-source library defaults to OpenAI models for extraction and embeddings, and you can swap in other providers.

```python
from mem0 import Memory

memory = Memory()  # defaults: OpenAI LLM and embeddings; configure others as needed

# after a turn: extract and store memories scoped to this user
memory.add(
    [{"role": "user", "content": "I'm vegetarian and allergic to nuts."},
     {"role": "assistant", "content": "Got it, I'll keep that in mind."}],
    user_id="alice",
)

# before the next response: retrieve what's relevant
hits = memory.search(query="What should I cook for Alice?", filters={"user_id": "alice"}, top_k=3)
context = "\n".join(f"- {h['memory']}" for h in hits["results"])
```

**Recent change:** Mem0 shipped a new memory algorithm in April 2026. Extraction is now a single ADD-only pass (memories accumulate; nothing is updated or deleted in that step), retrieval fuses semantic, BM25 keyword and entity matching, and there is time-aware ranking. Upgrading from OSS v2 has a migration guide. Mem0 publishes benchmark scores for the new algorithm (for example 92.5 on LoCoMo and 94.4 on LongMemEval), but notes they are for its managed platform, which includes optimizations not in the open-source library. Treat them as vendor numbers and evaluate on your own conversations.

Because extraction is append-only, plan for how stale facts lose out: rely on the time-aware ranking, store timestamps, and give users a way to see and delete what was stored.

## Option C: a temporal knowledge graph (Zep and Graphiti)

When facts change over time, plain vector memory struggles: "lives in Berlin" and "moved to Stockholm" are both similar to "where does she live?". [Graphiti](entry:graphiti) (Apache-2.0) builds a **temporal context graph**: entities, relationships with validity windows, and the raw "episodes" every fact came from. When new information contradicts an old fact, the old one is invalidated rather than deleted, so you can ask what is true now or what was true at a given time. Retrieval combines embeddings, BM25 and graph traversal.

Graphiti needs Python 3.10+, an LLM (OpenAI by default; it works best with providers that support structured output) and a graph database: Neo4j 5.26, FalkorDB, or Amazon Neptune with OpenSearch Serverless. Kuzu support is deprecated because the upstream project is no longer maintained. The repo also contains an MCP server.

[Zep](entry:zep) is the managed service built on the same ideas. It now describes itself as a unified context layer that combines business data, documents and conversations into temporal context graphs, with SDKs for Python, TypeScript and Go. Pick Zep when you want the graph without running a graph database; pick Graphiti when you want to self-host.

## Option D: a stateful agent platform (Letta)

[Letta](entry:letta) (formerly MemGPT) treats memory as part of the agent itself: the agent's memory persists across conversations and follows it between models and computers, and the agent edits it as it learns. You define starting memory as labeled blocks at creation, configure dreaming, and run agents through the Letta Harness, the App Server, the desktop app or the TypeScript Agent SDK, locally or on Letta Cloud.

**Recent change:** the original `letta-ai/letta` Python server is retired. Its README points to `letta-ai/letta-code` as the current source, and the V1 API server lives on an archive branch. Older tutorials that `pip install letta` and call the V1 REST API describe the retired server.

## Option E: build it on your own store

If you already run Postgres, [pgvector](entry:pgvector) adds vector columns and HNSW or IVFFlat indexes with cosine, L2, inner product and L1 distance, so memories can live next to your users table with normal row-level permissions. A dedicated vector database such as [Qdrant](entry:qdrant) makes sense at higher scale. Framework stores work too: the [LangGraph](entry:langgraph) store saves memories as JSON documents under a namespace (for example `(user_id, "preferences")`) and key, with optional semantic search:

```python
from langgraph.store.memory import InMemoryStore  # use a DB-backed store in production

store = InMemoryStore()
namespace = ("user-123", "preferences")
store.put(namespace, "style", {"rules": ["Prefers short answers", "Writes Python"]})
item = store.get(namespace, "style")
```

You then write the extraction prompt, the deduplication and the retrieval policy yourself. That's more work, but every decision is visible and testable.

## Doing it responsibly

Long-term memory turns an agent into a system that stores personal data, and it adds a new attack surface.

- **Scope everything.** Key every memory by user (and by tenant). Never run a search without the user filter. Shared "agent" memory should hold only what is safe for every user to see.
- **Memory poisoning is prompt injection with persistence.** If the agent saves text from web pages, emails or tool output, an attacker can plant an instruction that comes back in every future session. Save facts the user stated or confirmed, record where each memory came from (Graphiti's episodes do this), and don't promote retrieved memories to system-prompt authority.
- **Let users see, correct and delete.** Expose what is stored, support deletion end to end (including backups and the extraction provider's retention), and expire memories you no longer need.
- **Measure it.** Build a small set of multi-session conversations with known answers and check recall, wrong recalls and stale facts before and after every change. Published benchmark scores won't tell you how memory behaves on your users' conversations.

## Which one to start with

- Single-user coding or research agent that should learn your preferences and project quirks: file-based memory (the Claude memory tool, or a `memory/` folder your harness reads).
- Consumer or support assistant that should remember facts about many users: Mem0 or a similar memory layer ([Supermemory](entry:supermemory) and [Cognee](entry:cognee) are other open-source options).
- Facts that change and relationships that matter (accounts, org charts, CRM-like data): Zep or Graphiti.
- A long-lived agent with an identity of its own: Letta.
- Strict data-residency or audit needs: your own Postgres with pgvector, or a self-hosted Mem0 or Graphiti.
