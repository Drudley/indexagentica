---
id: research-memory-libraries
type: comparison
title: "Research memory libraries compared: A-MEM vs MemoryOS vs MemOS vs LightRAG"
summary: "Four open-source memory systems that started as research papers. What each one stores, how many LLM calls a write costs, whether memories survive a restart, and how close each is to something you can run in an agent today."
description: "A primary-source comparison of A-MEM, MemoryOS, MemOS and LightRAG, checked on 2026-10-30 against each project's README, source, package registry and arXiv paper. A-MEM, MemoryOS and LightRAG were installed and run offline with a stubbed LLM to count LLM calls and test persistence; MemOS was not run. Benchmark figures are the projects' own claims."
author: Agentica Author
tags: [memory, research, rag, knowledge-graph, python, self-hosted]
entries: [a-mem, memoryos, memos, lightrag, mem0, zep, letta, chroma, qdrant, openclaw, hermes-agent, deepseek-harness, omnimemeval]
related: [agent-memory-layers, give-an-agent-long-term-memory, coding-agent-memory-servers, vector-databases-for-agents]
subjects: [a-mem, memoryos, memos, lightrag]
criteria:
  - What it stores
  - Install
  - Persistence
  - LLM cost of a write
  - Agent access
  - Maturity
  - License
rows:
  a-mem:
    What it stores: "Zettelkasten-style notes with keywords, tags, context and links; adding a note can rewrite its neighbours' tags and context (memory evolution)"
    Install: "From source only (git clone, pip install .). The PyPI name agentic-memory belongs to an unrelated project"
    Persistence: "None in the main class: AgenticMemorySystem keeps notes in a Python dict and an in-memory Chroma client that it resets on start. A PersistentChromaRetriever exists but is not wired in"
    LLM cost of a write: "One LLM call per add_note once there are neighbours (the evolution decision); none for the first note"
    Agent access: "Python API only (add_note, search_agentic, update, delete)"
    Maturity: "Library companion to a NeurIPS 2025 paper; last commit Dec 2025, no releases"
    License: "MIT"
  memoryos:
    What it stores: "Per-user short-term QA pairs, mid-term topic sessions scored by heat, and a long-term user profile plus user and assistant knowledge"
    Install: "pip install memoryos-pro (0.1.0, Jul 2025) pins numpy 1.24 and faiss-gpu; it failed to build on Python 3.13 and installed on 3.10. The GitHub code is newer than the PyPI package"
    Persistence: "JSON files per user under data_storage_path; a new instance reloaded them. A ChromaDB variant is in the repo"
    LLM cost of a write: "None until short-term is full, then five or six calls per add (continuity, summaries, keywords) in our stub run; profile and knowledge updates fire when a session's heat passes the threshold"
    Agent access: "Python API, and MemoryOS-MCP with add_memory, retrieve_memory and get_user_profile tools; any OpenAI-compatible LLM endpoint"
    Maturity: "EMNLP 2025 paper; last commit Jul 2026; PyPI package not updated since Jul 2025"
    License: "Apache-2.0 (the PyPI metadata says MIT and still has template project links)"
  memos:
    What it stores: "MemCubes: plaintext memory plus, in the paper, activation (KV cache) and parameter-level memory, with provenance and versions"
    Install: "Hosted Cloud API (key), self-host with docker compose (MemOS API, Neo4j, Qdrant), or npm local plugins for OpenClaw, Hermes Agent and DeepSeek Harness. PyPI package is named MemoryOS (2.0.33)"
    Persistence: "Neo4j plus Qdrant when self-hosted; SQLite in the local plugins; MemOS Cloud when hosted"
    LLM cost of a write: "Not measured here; the server uses a configured LLM and embedder for extraction"
    Agent access: "REST API (add/message, search/memory), and plugins that recall before and save after each agent turn"
    Maturity: "Most active of the four: release v2.0.34 on 2026-09-23, commits this week, a company (MemTensor) behind it"
    License: "Apache-2.0"
  lightrag:
    What it stores: "Documents split into chunks, plus an entity-relation knowledge graph extracted from them, each with vector indexes"
    Install: "pip install lightrag-hku (1.5.7, Python 3.10+); add the [api] extra for lightrag-server and web UI; Docker Compose and a setup wizard"
    Persistence: "Local JSON, NanoVectorDB and NetworkX files by default (in RAM, for testing only); PostgreSQL, MongoDB or OpenSearch for production, or Milvus, Qdrant, Neo4j, Memgraph per store"
    LLM cost of a write: "Two calls per chunk by default (extraction plus one gleaning pass); deletion rebuilds from cache"
    Agent access: "Python API, REST server with an Ollama-compatible API, and a web UI; no official MCP server"
    Maturity: "Large and active: about 40k stars, releases every few weeks through 2026 (latest v1.5.7, 2026-09-02), commits this week"
    License: "MIT"
verdict: "None of these is a drop-in Mem0 or Zep. Building a chat assistant that should learn a user's preferences over months? MemoryOS has the clearest model for it and an MCP server, but plan to install from GitHub on Python 3.10. Want the most production-ready option with a hosted fallback, or memory for OpenClaw or Hermes Agent? MemOS. Your agent's memory is really a growing pile of documents and you need questions that span them? LightRAG, with PostgreSQL behind it. A-MEM is worth reading and borrowing ideas from, but its main class keeps nothing after exit, so treat it as research code."
sources:
  - {title: "A-MEM README (agiresearch/A-mem)", url: "https://github.com/agiresearch/A-mem", accessed: 2026-10-30}
  - {title: "A-MEM source, memory_system.py", url: "https://github.com/agiresearch/A-mem/blob/main/agentic_memory/memory_system.py", accessed: 2026-10-30}
  - {title: "arXiv 2502.12110: A-MEM, Agentic Memory for LLM Agents", url: "https://arxiv.org/abs/2502.12110", accessed: 2026-10-30}
  - {title: "MemoryOS README (BAI-LAB/MemoryOS)", url: "https://github.com/BAI-LAB/MemoryOS", accessed: 2026-10-30}
  - {title: "PyPI: memoryos-pro", url: "https://pypi.org/project/memoryos-pro/", accessed: 2026-10-30}
  - {title: "arXiv 2506.06326: Memory OS of AI Agent", url: "https://arxiv.org/abs/2506.06326", accessed: 2026-10-30}
  - {title: "MemOS README (MemTensor/MemOS)", url: "https://github.com/MemTensor/MemOS", accessed: 2026-10-30}
  - {title: "PyPI: MemoryOS (MemTensor MemOS)", url: "https://pypi.org/project/MemoryOS/", accessed: 2026-10-30}
  - {title: "arXiv 2507.03724: MemOS, A Memory OS for AI System", url: "https://arxiv.org/abs/2507.03724", accessed: 2026-10-30}
  - {title: "LightRAG README (HKUDS/LightRAG)", url: "https://github.com/HKUDS/LightRAG", accessed: 2026-10-30}
  - {title: "PyPI: lightrag-hku", url: "https://pypi.org/project/lightrag-hku/", accessed: 2026-10-30}
  - {title: "arXiv 2410.05779: LightRAG, Simple and Fast Retrieval-Augmented Generation", url: "https://arxiv.org/abs/2410.05779", accessed: 2026-10-30}
last_verified: 2026-10-30
published: 2026-10-30
updated: 2026-10-31
---

Most agent memory products you will meet ([Mem0](entry:mem0), [Zep](entry:zep), [Letta](entry:letta) and the rest in [Agent memory layers compared](comparison:agent-memory-layers)) are built as products first. The four here started as papers, and each one bets on a different idea of what memory is:

- [A-MEM](entry:a-mem): memory as a **linked notebook** that reorganises itself.
- [MemoryOS](entry:memoryos): memory as an **operating-system hierarchy**, from recent turns to a long-term user profile.
- [MemOS](entry:memos): memory as a **managed system resource**, from plain text up to model weights.
- [LightRAG](entry:lightrag): memory as a **knowledge graph over documents**.

Papers report results on their own benchmarks; the code you can install is a separate question. This page is about the code: what installs, what persists, what an LLM call costs you, and how an agent reaches it. If you just need memory working in an agent this week, start with [Give an agent long-term memory](guide:give-an-agent-long-term-memory) instead.

## What we ran

On 2026-10-30 we installed three of the four and ran them **offline**: the LLM was replaced by a stub that counts calls and returns an empty or neutral answer, and embeddings were a real local model (A-MEM, MemoryOS) or a hashing stand-in (LightRAG). That tells you how much LLM work each write triggers and what is stored where. It says nothing about answer quality, and the call counts depend partly on what the stub returned. MemOS needs Neo4j, Qdrant and LLM keys to self-host, so it is covered from its README and paper only.

| | Installed | Version run | Result |
|---|---|---|---|
| A-MEM | from source on Python 3.13 | commit ceffb86 (2025-12-12) | worked; nothing persisted |
| MemoryOS | `memoryos-pro` 0.1.0 | failed on Python 3.13, worked on 3.10 | worked; JSON files persisted |
| LightRAG | `lightrag-hku` 1.5.7 on Python 3.13 | 1.5.7 | worked; files persisted; delete worked |
| MemOS | not installed | | |

## A-MEM: good ideas, research-grade code

The paper (NeurIPS 2025) writes each memory as a structured note and links it to similar notes, Zettelkasten-style. When a new note arrives, an LLM looks at its nearest neighbours and decides whether to strengthen links or rewrite the neighbours' tags and context. The README says plainly that this repository is the library version and points to a separate repository for reproducing the paper.

What the code does today:

- **One LLM call per write** after the first note: the evolution decision, made with the neighbours retrieved from Chroma. Our three `add_note()` calls made two LLM calls.
- **Nothing persists.** `AgenticMemorySystem` keeps notes in a Python dict and uses an in-memory Chroma client, and its constructor resets that client. A second instance saw 0 notes. Worse, creating the second instance broke the first one in the same process: its next search raised `NotFoundError: Collection ... does not exist`. The repo has a `PersistentChromaRetriever` class, but the main class does not use it.
- **Install from source.** `pip install agentic-memory` installs an unrelated project ("A Graph-Theoretic Memory Kernel", from a different author). Clone the repo and run `pip install .`. It pulls in sentence-transformers and therefore PyTorch.
- LLM backends are OpenAI, or Ollama through LiteLLM.

Use it to study the evolution idea, or fork it and wire in the persistent retriever. Don't put it behind a long-running agent as is.

## MemoryOS: a clear model for personal assistants

MemoryOS (EMNLP 2025) is built for one assistant talking to one user over a long time. New turns go into short-term memory. When that fills, they are grouped into mid-term topic sessions. Sessions that get revisited build up "heat", and once a session passes the heat threshold, an LLM distils it into a long-term user profile and knowledge entries. Retrieval pulls from all three levels.

What we saw with `short_term_capacity=3`:

- The first two writes made no LLM calls. From the third on, each `add_memory()` made five or six: a continuity check, a meta-summary, a multi-topic summary and keyword extraction.
- One `get_response()` made nine LLM calls in our run. That included a profile analysis and knowledge extraction, because the session had just crossed the heat threshold, as well as the answer itself.
- State is three JSON files per user (`short_term.json`, `mid_term.json`, `long_term_user.json`), and a new instance loaded them back.

Install friction is the main catch. The PyPI package `memoryos-pro` 0.1.0 dates from July 2025, pins `numpy==1.24.*` and `faiss-gpu`, and failed to build on Python 3.13; it installed on 3.10. Its metadata still carries template values (author "Your Name", links to `pypa/sampleproject`) and says MIT, while the repository is Apache-2.0. The README describes a newer API than the package: its example passes `embedding_model_name`, which 0.1.0's `Memoryos()` does not accept. Install from the GitHub `memoryos-pypi` folder if you want what the README shows.

For agents, the repo's MemoryOS-MCP server exposes `add_memory`, `retrieve_memory` and `get_user_profile`, and all model calls go through an OpenAI-compatible endpoint, and the README lists vLLM for local models. Note that a write is LLM-heavy once the short-term buffer is full, so put a cheap model on it.

## MemOS: the one that became a product

MemOS (arXiv 2507.03724, from MemTensor) has the broadest idea: a MemCube unit that can hold plain-text memory, activation memory (KV cache) or parameter-level memory, with provenance and versions, and move between them. The code you can deploy today is mostly the plain-text part, packaged four ways:

- a hosted **Cloud API** (`mpg-` keys, `add/message` and `search/memory` endpoints),
- **self-hosting** with `docker compose up` (the MemOS API plus Neo4j and Qdrant) or uvicorn,
- a **Cloud plugin** for OpenClaw and [DeepSeek Harness](entry:deepseek-harness),
- a **local plugin** for [OpenClaw](entry:openclaw), [Hermes Agent](entry:hermes-agent) and DeepSeek Harness that keeps everything in local SQLite with hybrid FTS5 plus vector search.

The plugins recall memories before each agent turn and save the new messages after it, so the agent does not need to call a tool. That is the main practical difference from the other three.

It is the most actively maintained of the four (GitHub release v2.0.34 on 2026-09-23 and commits this week). The README's benchmark table (LoCoMo 88.83, LongMemEval 89.20, and results on [OmniMemEval](entry:omnimemeval), MemTensor's own evaluation) is the project's claim and was not reproduced here.

One naming trap: MemOS's PyPI package is called **`MemoryOS`** (2.0.33). That is not BAI-LAB's MemoryOS above, whose package is `memoryos-pro`. MemOS imports as `memos` and BAI-LAB's as `memoryos`, so check which one you installed.

## LightRAG: memory as documents plus a graph

LightRAG is a retrieval framework rather than a conversation memory. You insert documents; it chunks them, has an LLM extract entities and relations into a knowledge graph, and indexes chunks, entities and relations as vectors. Queries run in five modes: `naive` (chunks only), `local` (entities), `global` (relations), `hybrid`, and `mix`, the default. It fits agents whose memory is a growing body of notes, tickets or reports, and questions span many of them.

What we saw on 1.5.7:

- **Two LLM calls per chunk** at insert: extraction plus one "gleaning" pass (`entity_extract_max_gleaning` defaults to 1). Two short documents made four calls.
- Default storage is nine local files (JSON key-value stores, NanoVectorDB vector files and a GraphML graph). The README says these defaults hold everything in RAM and are for testing only, and recommends PostgreSQL for production. MongoDB and OpenSearch also cover all four stores, or mix Milvus or [Qdrant](entry:qdrant) for vectors with Neo4j or Memgraph for the graph.
- A `naive` query with `only_need_context=True` returned the right chunk without calling the LLM. After `adelete_by_doc_id()`, the same query no longer found it, and the deletion made no LLM calls in our run.
- Pick the embedding model up front. The README warns that changing it means re-embedding everything, and there is no re-embedding tool.

`lightrag-server` (the `[api]` extra or Docker) adds a REST API, an Ollama-compatible chat API and a web UI. It **binds to 0.0.0.0 with no authentication by default**. Set `LIGHTRAG_API_KEY` (or accounts with a token secret), and note that the Ollama-compatible `/api/*` routes stay open unless you also set `WHITELIST_PATHS=/health`. There is no official MCP server; agents call the REST API or the Python library.

## How to choose

- **Personal assistant that should learn about one user over months:** MemoryOS's three-level design matches the problem, and it has an MCP server. Budget for LLM calls on writes, and install from GitHub.
- **You want something maintained, with a hosted option or OpenClaw/Hermes integration:** MemOS.
- **Your memory is mostly documents and you need cross-document answers:** LightRAG, on PostgreSQL, with auth turned on.
- **You want to experiment with self-organising memory:** read A-MEM's code and paper, then add persistence yourself.
- **You want a product, not a paper:** see [Agent memory layers compared](comparison:agent-memory-layers), or [memory servers for coding agents](comparison:coding-agent-memory-servers) if the agent is Claude Code, Codex or Cursor.

## The offline probes

These are the scripts behind the numbers above. They need no API keys. Each replaces the LLM with a stub, so they measure plumbing, not quality.

LightRAG (`pip install lightrag-hku==1.5.7`):

```python
import asyncio, hashlib, os, shutil, numpy as np
from lightrag import LightRAG, QueryParam
from lightrag.utils import EmbeddingFunc

WD = "./lr_probe"; shutil.rmtree(WD, ignore_errors=True)
calls = []

async def stub_llm(prompt, system_prompt=None, history_messages=[], **kw):
    calls.append(prompt[:60]); return ""          # extract nothing

async def hash_embed(texts):                      # stand-in for a real embedder
    out = []
    for t in texts:
        v = np.zeros(256)
        for w in t.lower().split():
            v[int(hashlib.md5(w.encode()).hexdigest(), 16) % 256] += 1
        out.append(v / (np.linalg.norm(v) or 1))
    return np.array(out)

async def main():
    rag = LightRAG(working_dir=WD, llm_model_func=stub_llm,
                   embedding_func=EmbeddingFunc(embedding_dim=256, func=hash_embed))
    await rag.initialize_storages()
    await rag.ainsert(["Niko prefers window seats on long flights.",
                       "The staging database is Postgres 16 on port 5433."], ids=["pref-1", "infra-1"])
    print("LLM calls during insert:", len(calls))  # 4
    print("files:", sorted(os.listdir(WD)))
    q = QueryParam(mode="naive", only_need_context=True, chunk_top_k=1)
    print("found:", "5433" in str(await rag.aquery("staging database port", param=q)))   # True
    await rag.adelete_by_doc_id("infra-1")
    print("after delete:", "5433" in str(await rag.aquery("staging database port", param=q)))  # False
    await rag.finalize_storages()

asyncio.run(main())
```

A-MEM (clone `agiresearch/A-mem`, `pip install .`):

```python
import json, os
os.environ.setdefault("OPENAI_API_KEY", "sk-offline-stub")   # the constructor builds an OpenAI client
from agentic_memory.memory_system import AgenticMemorySystem

calls = []
def stub(prompt, response_format=None, temperature=0.7):
    calls.append(prompt[:80])
    return json.dumps({"should_evolve": False, "actions": [], "suggested_connections": [],
                       "tags_to_update": [], "new_context_neighborhood": [], "new_tags_neighborhood": []})

m = AgenticMemorySystem(model_name="all-MiniLM-L6-v2", llm_backend="openai")
m.llm_controller.llm.get_completion = stub
for t in ["Niko prefers window seats on long flights.",
          "The staging database is Postgres 16 on port 5433.",
          "Niko's flight to Berlin leaves on Friday."]:
    m.add_note(t)
print("LLM calls:", len(calls))                                   # 2
print(m.search("staging db port", k=1)[0]["content"])             # the Postgres note
m2 = AgenticMemorySystem(model_name="all-MiniLM-L6-v2", llm_backend="openai")
print("second instance sees:", len(m2.memories))                  # 0
m.search("staging db port", k=1)                                  # raises NotFoundError
```

MemoryOS (`pip install memoryos-pro==0.1.0` on Python 3.10):

```python
import os, shutil
import memoryos.utils as u
calls = []
def stub(self, model, messages, temperature=0.7, max_tokens=2000):
    calls.append(messages[-1]["content"][:60]); return "stub"
u.OpenAIClient.chat_completion = stub
from memoryos import Memoryos

D = "./mo_probe"; shutil.rmtree(D, ignore_errors=True)
mk = lambda: Memoryos(user_id="niko", openai_api_key="sk-offline-stub",
                      data_storage_path=D, short_term_capacity=3)
m = mk()
for q, a in [("I prefer window seats on long flights.", "Noted."),
             ("Our staging database is Postgres 16 on port 5433.", "Got it."),
             ("My flight to Berlin leaves Friday.", "Have a good trip."),
             ("I'm vegetarian.", "Noted."),
             ("Remind me the staging port later.", "Will do.")]:
    m.add_memory(user_input=q, agent_response=a)
    print("LLM calls so far:", len(calls))                       # 0, 0, 6, 11, 16
n = len(calls); m.get_response(query="Which port is staging on?")
print("get_response calls:", len(calls) - n)                    # 9
print(sorted(os.path.relpath(os.path.join(r, f), D) for r, _, fs in os.walk(D) for f in fs))
print("reloaded short-term items:", len(mk().short_term_memory.get_all()))   # 2
```
