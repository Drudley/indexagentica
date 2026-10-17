---
id: vector-databases-for-agents
type: comparison
title: Vector databases for agents compared
summary: "Chroma, Pinecone, Qdrant, Weaviate, Milvus, LanceDB, turbopuffer and pgvector compared on how they deploy, license, keyword and hybrid search, filtering and tenant isolation, MCP servers and managed pricing."
description: "A comparison of the vector stores most often put under agent memory and retrieval: embedded libraries, open-source servers, managed services and a Postgres extension. It covers where each one runs, its license, whether it does BM25 or sparse keyword search and hybrid fusion, how it filters and separates tenants, which MCP server lets an agent use it directly, and the entry price of the managed offering. Facts come from each project's own docs, READMEs and pricing pages, checked on 2026-10-17. Prices and plans change often, so recheck before buying."
author: Agentica Author
tags: [vector-database, retrieval, hybrid-search, memory, rag, mcp]
entries: [chroma, pinecone, qdrant, weaviate, milvus, lancedb, turbopuffer, pgvector, neon-mcp-server, mem0, graphiti]
related: [agent-memory-layers, give-an-agent-long-term-memory, research-agent, connect-an-agent-to-a-remote-mcp-server]
subjects: [chroma, pinecone, qdrant, weaviate, milvus, lancedb, turbopuffer, pgvector]
criteria:
  - Deployment
  - License
  - Keyword and hybrid search
  - Filtering and tenants
  - MCP server
  - Managed pricing
rows:
  chroma:
    Deployment: "Embedded in Python (in-memory or PersistentClient on disk), a single-node server, or distributed; Chroma Cloud is managed distributed Chroma, with a single-tenant BYOC option"
    License: "Apache-2.0"
    Keyword and hybrid search: "Full-text $contains and $regex filters on documents everywhere; sparse vectors (SPLADE, BM25) and hybrid RRF ranking through the Search API, which is Chroma Cloud only for now"
    Filtering and tenants: "Metadata where filters; tenant > database > collection model, with access control, quotas and billing scoped to the tenant"
    MCP server: "Official chroma-mcp (Python, run with uvx) with ephemeral, persistent, HTTP and Cloud client modes"
    Managed pricing: "Usage-based: $2.50 per GiB written, $0.33 per GiB-month stored, $0.0075 per TiB queried plus $0.09 per GiB returned; $5 credits for new users"
  pinecone:
    Deployment: "Fully managed on AWS, GCP and Azure; BYOC runs the data plane in your own cloud account. No local emulator since Pinecone Local's end of life on 2026-10-07 (an OpenAPI mock covers request tests)"
    License: "Commercial managed service"
    Keyword and hybrid search: "Dense, sparse and BM25 full-text fields (Lucene syntax, API version 2026-07) in one index; hybrid via a text-match filter plus dense ranking, client-side RRF, or dense plus sparse in one Vectors API index"
    Filtering and tenants: "Metadata filters; one namespace per tenant, from 100 namespaces per index on Starter to 1,000,000 on Enterprise"
    MCP server: "Official @pinecone-database/mcp (npx, API key): docs search, index management, upsert, search, cascading search and rerank; works only with integrated-embedding indexes"
    Managed pricing: "Starter free; Builder $20/month flat; Standard $50/month minimum; Enterprise $500/month minimum; BYOC by quote"
  qdrant:
    Deployment: "Self-hosted (Docker, Kubernetes, binary) or distributed; Qdrant Cloud on AWS, GCP and Azure; Hybrid Cloud in your Kubernetes; air-gapped Private Cloud; Qdrant Edge embedded library for Python and Rust"
    License: "Apache-2.0"
    Keyword and hybrid search: "BM25 through sparse vectors (server-side inference or FastEmbed), plus SPLADE++ and miniCOIL; Query API prefetches fused with RRF or DBSF (v1.10+)"
    Filtering and tenants: "Payload filters; tenants by payload partitioning, user-defined sharding, or tiered (small tenants share a shard, large ones get their own)"
    MCP server: "Official mcp-server-qdrant: qdrant-store and qdrant-find memory tools with FastEmbed embeddings; stdio, SSE or Streamable HTTP"
    Managed pricing: "Free cluster (one node, no credit card, suspended after a week unused); Standard clusters billed on CPU, memory and disk"
  weaviate:
    Deployment: "Weaviate Cloud (shared or dedicated), Docker or Kubernetes; Embedded Weaviate runs from your code but is experimental"
    License: "BSD-3-Clause, except enterprise features in the wl directory, which need a separate license"
    Keyword and hybrid search: "BM25 and hybrid on by default (col.query.hybrid); BM25 uses BlockMaxWAND"
    Filtering and tenants: "Filters with roaring bitmaps (range indexes are opt-in); native multi-tenancy with one shard per tenant; RBAC per collection and tenant"
    MCP server: "Built into the database (preview): Streamable HTTP at /v1/mcp, already on in Weaviate Cloud, MCP_SERVER_ENABLED=true when self-hosting; tools for config, tenants, hybrid query and upsert"
    Managed pricing: "Free plan (100,000 objects, 1 collection, up to 3 tenants, no credit card); Flex from $45/month pay-as-you-go; Premium by contract"
  milvus:
    Deployment: "Milvus Lite (pip, local .db file), Standalone (Docker, RPM/DEB) or Distributed on Kubernetes; managed on Zilliz Cloud (Serverless, Dedicated, BYOC)"
    License: "Apache-2.0 (LF AI & Data Foundation project)"
    Keyword and hybrid search: "Native BM25 full-text search and learned sparse vectors (SPLADE, BGE-M3); dense and sparse in one collection, merged by hybrid_search with one ranker per search"
    Filtering and tenants: "Scalar metadata filtering; multi-tenancy at database, collection, partition or partition-key level"
    MCP server: "mcp-server-milvus from Zilliz (Python, uv): stdio, SSE or Streamable HTTP"
    Managed pricing: "Not checked; the Milvus README says Zilliz Cloud can be tried for free"
  lancedb:
    Deployment: "LanceDB OSS is embedded in your code, on local disk or S3, GCS or Azure Blob; LanceDB Enterprise is managed or BYOC"
    License: "Apache-2.0"
    Keyword and hybrid search: "BM25 full-text index; hybrid vector plus full-text search with RRF as the default reranker, or Cohere, ColBERT and others"
    Filtering and tenants: "SQL-style where filters, pre-filtering by default, scalar indexes; namespaces organise tables in a catalog (no tenant isolation feature on the pages checked)"
    MCP server: "lancedb-mcp-server, a basic reference server (ingest, retrieve, table details); no MCP page in the docs"
    Managed pricing: "OSS is free; Enterprise pricing is not published on the pages checked"
  turbopuffer:
    Deployment: "Managed only, on object storage with an NVMe and memory cache; multi-tenant by default, single-tenant or BYOC on Enterprise"
    License: "Commercial managed service"
    Keyword and hybrid search: "BM25 full-text, dense and sparse vectors and trigram regex; server-side RRF on multi-queries plus native reranking with managed models"
    Filtering and tenants: "Filters on an inverted index; unlimited namespaces; document permissions by filtering on user or group ids (no built-in row-level RBAC)"
    MCP server: "None documented on the pages checked"
    Managed pricing: "Launch $16/month minimum; Scale $256/month minimum; Enterprise from $4,096/month with a 35% usage premium"
  pgvector:
    Deployment: "Postgres extension (Postgres 13+) on your own server, or on the hosted Postgres providers the project lists"
    License: "PostgreSQL License"
    Keyword and hybrid search: "Combine with Postgres full-text search and fuse in your code with RRF or a cross-encoder (examples in pgvector-python); sparsevec type for sparse vectors"
    Filtering and tenants: "SQL WHERE; filters apply after an approximate index scan, so use iterative index scans (0.8.0+); isolate tenants with list partitioning or separate tables"
    MCP server: "No pgvector server; a Postgres MCP server such as Neon's (run_sql) can query it"
    Managed pricing: "Free extension; you pay for the Postgres it runs in"
verdict: "For a local agent or prototype, start embedded (Chroma, LanceDB OSS, Milvus Lite, Qdrant Edge) and move to the same project's server or cloud later. If you already run Postgres, pgvector keeps vectors next to your data, but hybrid fusion is up to you. Qdrant, Weaviate and Milvus are open-source servers with server-side hybrid search, real multitenancy and managed clouds. Pinecone and turbopuffer are managed only: Pinecone has a free plan and an official MCP server, turbopuffer a low minimum spend on object storage. Only Weaviate builds MCP into the database."
sources:
  - {title: "Chroma, Clients", url: "https://docs.trychroma.com/docs/run-chroma/clients", accessed: 2026-10-17}
  - {title: "Chroma, Architecture overview", url: "https://docs.trychroma.com/reference/architecture/overview", accessed: 2026-10-17}
  - {title: "Chroma, Full text search", url: "https://docs.trychroma.com/docs/querying-collections/full-text-search", accessed: 2026-10-17}
  - {title: "Chroma, Search API overview", url: "https://docs.trychroma.com/cloud/search-api/overview", accessed: 2026-10-17}
  - {title: "Chroma, Sparse vector search setup", url: "https://docs.trychroma.com/cloud/schema/sparse-vector-search", accessed: 2026-10-17}
  - {title: "Chroma BM25 embedding function", url: "https://docs.trychroma.com/integrations/embedding-models/chroma-bm25", accessed: 2026-10-17}
  - {title: "Chroma, Hybrid search with RRF", url: "https://docs.trychroma.com/cloud/search-api/hybrid-search", accessed: 2026-10-17}
  - {title: "Chroma Cloud pricing", url: "https://docs.trychroma.com/cloud/pricing", accessed: 2026-10-17}
  - {title: "Chroma, Anthropic MCP", url: "https://docs.trychroma.com/integrations/frameworks/anthropic-mcp", accessed: 2026-10-17}
  - {title: "Chroma, Open source", url: "https://docs.trychroma.com/docs/overview/oss", accessed: 2026-10-17}
  - {title: "Pinecone, Hybrid search overview", url: "https://docs.pinecone.io/guides/search/hybrid-search", accessed: 2026-10-17}
  - {title: "Pinecone, Full-text search overview", url: "https://docs.pinecone.io/guides/search/full-text-search", accessed: 2026-10-17}
  - {title: "Pinecone, Implement multitenancy", url: "https://docs.pinecone.io/guides/index-data/implement-multitenancy", accessed: 2026-10-17}
  - {title: "Pinecone, Use the Pinecone MCP server", url: "https://docs.pinecone.io/guides/operations/mcp-server", accessed: 2026-10-17}
  - {title: "Pinecone, Mock the Pinecone API for testing", url: "https://docs.pinecone.io/guides/operations/local-development", accessed: 2026-10-17}
  - {title: "Pinecone, Bring Your Own Cloud overview", url: "https://docs.pinecone.io/guides/production/bring-your-own-cloud", accessed: 2026-10-17}
  - {title: Pinecone pricing, url: "https://www.pinecone.io/pricing/", accessed: 2026-10-17}
  - {title: "Qdrant, Deploy Qdrant", url: "https://qdrant.tech/documentation/deploy-intro/", accessed: 2026-10-17}
  - {title: "Qdrant, Full-text search", url: "https://qdrant.tech/documentation/search/text-search/full-text-search/", accessed: 2026-10-17}
  - {title: "Qdrant, Hybrid and multi-stage queries", url: "https://qdrant.tech/documentation/search/hybrid-queries/", accessed: 2026-10-17}
  - {title: "Qdrant, Configure multitenancy", url: "https://qdrant.tech/documentation/manage-data/multitenancy/", accessed: 2026-10-17}
  - {title: "Qdrant Edge quickstart", url: "https://qdrant.tech/documentation/edge/edge-quickstart/", accessed: 2026-10-17}
  - {title: "Qdrant Cloud, Create a cluster", url: "https://qdrant.tech/documentation/cloud/create-cluster/", accessed: 2026-10-17}
  - {title: "Qdrant Cloud billing and payments", url: "https://qdrant.tech/documentation/cloud-pricing-payments/", accessed: 2026-10-17}
  - {title: "mcp-server-qdrant README", url: "https://github.com/qdrant/mcp-server-qdrant", accessed: 2026-10-17}
  - {title: Qdrant repository, url: "https://github.com/qdrant/qdrant", accessed: 2026-10-17}
  - {title: Weaviate llms.txt, url: "https://weaviate.io/llms.txt", accessed: 2026-10-17}
  - {title: "Weaviate MCP server", url: "https://docs.weaviate.io/weaviate/configuration/mcp-server", accessed: 2026-10-17}
  - {title: "Embedded Weaviate", url: "https://docs.weaviate.io/deploy/installation-guides/embedded", accessed: 2026-10-17}
  - {title: "Weaviate, Multi-tenancy", url: "https://docs.weaviate.io/weaviate/manage-collections/multi-tenancy", accessed: 2026-10-17}
  - {title: Weaviate pricing, url: "https://weaviate.io/pricing", accessed: 2026-10-17}
  - {title: Weaviate LICENSE, url: "https://github.com/weaviate/weaviate/blob/main/LICENSE", accessed: 2026-10-17}
  - {title: Milvus README, url: "https://github.com/milvus-io/milvus", accessed: 2026-10-17}
  - {title: Milvus llms.txt, url: "https://milvus.io/llms.txt", accessed: 2026-10-17}
  - {title: Milvus Lite README, url: "https://github.com/milvus-io/milvus-lite", accessed: 2026-10-17}
  - {title: "MCP Server for Milvus README", url: "https://github.com/zilliztech/mcp-server-milvus", accessed: 2026-10-17}
  - {title: "LanceDB docs home", url: "https://docs.lancedb.com/", accessed: 2026-10-17}
  - {title: "LanceDB Enterprise", url: "https://docs.lancedb.com/enterprise", accessed: 2026-10-17}
  - {title: "LanceDB, Hybrid search", url: "https://docs.lancedb.com/search/hybrid-search", accessed: 2026-10-17}
  - {title: "LanceDB, Metadata filtering", url: "https://docs.lancedb.com/search/filtering", accessed: 2026-10-17}
  - {title: "LanceDB, Tables and namespaces", url: "https://docs.lancedb.com/tables-and-namespaces", accessed: 2026-10-17}
  - {title: LanceDB llms.txt, url: "https://docs.lancedb.com/llms.txt", accessed: 2026-10-17}
  - {title: LanceDB MCP server, url: "https://github.com/lancedb/lancedb-mcp-server", accessed: 2026-10-17}
  - {title: "turbopuffer, Introduction", url: "https://turbopuffer.com/docs", accessed: 2026-10-17}
  - {title: "turbopuffer, Hybrid search", url: "https://turbopuffer.com/docs/hybrid", accessed: 2026-10-17}
  - {title: "turbopuffer, Permissions", url: "https://turbopuffer.com/docs/permissions", accessed: 2026-10-17}
  - {title: "turbopuffer, Tradeoffs", url: "https://turbopuffer.com/docs/tradeoffs", accessed: 2026-10-17}
  - {title: turbopuffer pricing, url: "https://turbopuffer.com/pricing", accessed: 2026-10-17}
  - {title: pgvector README, url: "https://github.com/pgvector/pgvector", accessed: 2026-10-17}
  - {title: pgvector LICENSE, url: "https://github.com/pgvector/pgvector/blob/master/LICENSE", accessed: 2026-10-17}
  - {title: Neon MCP server README, url: "https://github.com/neondatabase/mcp-server-neon", accessed: 2026-10-17}
last_verified: 2026-10-17
published: 2026-10-17
---

## What this covers

Agents use a vector store in two ways: as **long-term memory** (store a fact, recall it later) and as **retrieval** over documents (RAG, code search, tickets). The [memory layers comparison](comparison:agent-memory-layers) is about the services that decide *what* to remember. This page is about the storage underneath, which those layers and most frameworks plug into.

Three questions matter most for agents:

1. **Where does it run?** In-process next to the agent, as a server you operate, or as a managed API.
2. **Can it match exact words?** Agents search for error strings, ids, names and SKUs. Pure dense vectors miss those, so check for BM25 or sparse vectors and a way to fuse them with dense results.
3. **Can it keep users apart?** A multi-user agent needs every query scoped to one user or workspace, ideally enforced by the database rather than by a filter the agent might forget.

## Deployment shapes

- **Embedded, in your process:** Chroma's `PersistentClient`, [LanceDB](entry:lancedb) OSS, Milvus Lite and Qdrant Edge. There is no server to run, data lives in a local directory (or object storage for LanceDB), and they suit desktop agents, notebooks and tests. Embedded Weaviate exists but is marked experimental.
- **Open-source server:** [Chroma](entry:chroma), [Qdrant](entry:qdrant), [Weaviate](entry:weaviate) and [Milvus](entry:milvus) all run in Docker or Kubernetes, and each has a managed cloud and a bring-your-own-cloud option. Chroma keeps one API across its local, single-node and distributed modes, and Milvus Lite code moves to Standalone, Distributed or Zilliz Cloud with minimal changes, according to their docs.
- **Managed only:** [Pinecone](entry:pinecone) and [turbopuffer](entry:turbopuffer). Pinecone retired its local emulator on 2026-10-07, so local tests now run against an OpenAPI mock or a separate Pinecone project.
- **Inside Postgres:** [pgvector](entry:pgvector) adds vector columns and HNSW or IVFFlat indexes to a database you may already run, with joins, transactions and backups included.

## Hybrid search, briefly

"Hybrid" means different things across these docs, as Pinecone's own hybrid page points out. Three patterns show up:

- **Keyword filter, then dense ranking.** Narrow candidates with a text match, then rank by vector. Chroma's `$contains` filter and Pinecone's `$match_phrase` work this way.
- **Fusion of two ranked lists.** Run BM25 (or sparse) and dense searches, then merge them with reciprocal rank fusion. This runs server-side in Qdrant (RRF or DBSF), Chroma Cloud's Search API, LanceDB (RRF by default), Milvus and turbopuffer. With pgvector and in Pinecone's client-side pattern, you do the fusion in your own code.
- **One weighted query.** Weaviate's `hybrid` query and Pinecone's dense-plus-sparse index blend both signals in one request.

Text-processing defaults differ. Qdrant's BM25 model defaults to English stemming and stop words, and Chroma's full-text filter is case-sensitive. Check this before indexing other languages or ids.

## Giving the agent the database through MCP

Most of these ship an MCP server, so an agent can store and search without glue code (see [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server)):

- **Memory-style tools:** `mcp-server-qdrant` exposes just `qdrant-store` and `qdrant-find`, which is a ready-made semantic memory for one collection.
- **Database-style tools:** Chroma, Pinecone, Milvus and Weaviate expose collection management, upserts and queries. Weaviate's server runs inside the database at `/v1/mcp` and follows its authentication and RBAC, and you have to turn write access on separately.
- **Limits to know:** the Pinecone MCP server works only with indexes that use integrated embedding. LanceDB's MCP server is described as a basic reference. For pgvector, a general Postgres server such as the [Neon MCP server](entry:neon-mcp-server) gives the agent SQL.

Write tools let an agent change or delete stored data, so give production agents a read-only key or role where the product supports one.

## Choosing quickly

| If you need | Look at |
|---|---|
| Zero setup for a local or single-user agent | Chroma (embedded), LanceDB OSS, Milvus Lite, Qdrant Edge |
| Vectors next to existing relational data | pgvector |
| Self-hosted hybrid search with database-enforced tenants | Qdrant, Weaviate, Milvus |
| A managed API with a free tier | Pinecone Starter, Weaviate free plan, Qdrant free cluster, Chroma credits |
| Huge numbers of small namespaces, cost first | turbopuffer |
| An MCP server built into the database | Weaviate |

For the extraction and update logic on top (what to remember, when to forget), pair one of these with a memory layer such as [Mem0](entry:mem0) or [Graphiti](entry:graphiti), or follow [Give an agent long-term memory](guide:give-an-agent-long-term-memory).
