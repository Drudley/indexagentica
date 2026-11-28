---
id: database-and-search-skill-packs
type: comparison
title: Skill packs for databases and search compared
summary: "ClickHouse, Elastic, Weaviate, MongoDB and Redis official Agent Skills packs compared on install steps, scope, licence and what each README says about approvals, credentials and test modes. Read the skills before you install them; none of these packs is a security boundary."
description: "A source-checked comparison of five official Agent Skills packs for data platforms: ClickHouse, Elastic, Weaviate, MongoDB and Redis. It records each pack's licence, documented install commands, what the skills cover, and what the vendor's own README or docs say about approvals, destructive operations, credentials and test modes. Where a vendor is silent, the cell says so. It complements the official vendor skill packs comparison; no installer was run and no account, key or paid service was used. Checked 2026-11-28."
author: Agentica Author
tags: [agent-skills, databases, search, vendor, safety, mcp]
entries: [clickhouse-agent-skills, elastic-agent-skills, weaviate-agent-skills, mongodb-agent-skills, redis-agent-skills, mongodb-mcp-server, redis-mcp-server, clickhouse-mcp-server, elastic-agent-builder-mcp, weaviate, agent-skills-spec, skills-cli]
related: [official-vendor-skill-packs, install-and-vet-a-vendor-skill-pack, agent-skill-packs-and-installers, database-mcp-servers, vector-databases-for-agents]
subjects: [clickhouse-agent-skills, elastic-agent-skills, weaviate-agent-skills, mongodb-agent-skills, redis-agent-skills]
criteria:
  - How to install
  - Scope and surfaces
  - Approvals and destructive ops
  - Credentials and sandbox modes
rows:
  clickhouse-agent-skills:
    How to install: "`npx skills add clickhouse/agent-skills` (detects installed agents and prompts) or `clickhousectl skills` with the ClickHouse CLI. The README documents no plugin-marketplace command."
    Scope and surfaces: "Apache-2.0. Eight skills: best-practices (36 rules), architecture-advisor, JS/Node troubleshooting, chdb DataStore, chdb SQL, infra-clickhouse, infra-postgres (Cloud Postgres is beta), clickstack-otel-collector. For open-source ClickHouse and ClickHouse Cloud."
    Approvals and destructive ops: "No pack-level approval model in the README. Best-practices has a rule category named “Agent Connectivity, Discovery, and Safety” (3 rules). The infra skills can set up and manage ClickHouse Cloud services through `clickhousectl`; no confirmation step is described."
    Credentials and sandbox modes: "Not documented in the README: no credential setup, read-only default or sandbox mode. Cloud workflows run through `clickhousectl`; read its own docs for authentication and use a scoped key on a non-production service."
  elastic-agent-skills:
    How to install: "Claude Code: `claude plugin marketplace add https://github.com/elastic/agent-skills`, then `claude plugin install elastic-elasticsearch@elastic-agent-skills` (also kibana, observability, security, cloud). Or `npx skills add elastic/agent-skills`, or the bundled bash installer."
    Scope and surfaces: "Apache-2.0; README marks it Technical Preview (expect changes). Its tables list 32 skills: Cloud 2, Elasticsearch 10, Kibana 7, Observability 6, Security 7. It advises installing only the cloud and elasticsearch auth skills plus those you need."
    Approvals and destructive ops: "No pack-level approval gate. README security section: agents hold real credentials and process attacker-controlled input (alerts, event fields); scope keys minimally, keep read-only until validated, restrict tools and network. cloud-provisioning can create and delete Serverless projects."
    Credentials and sandbox modes: "cloud-onboarding configures the `elastic` CLI Cloud context and API key and can create or revoke Cloud API keys. README: start in a Serverless trial project, dev cluster or isolated Kibana space before live security data. No built-in sandbox mode documented."
  weaviate-agent-skills:
    How to install: "`npx skills add weaviate/agent-skills`; Claude Code `/plugin marketplace add weaviate/agent-skills` then `/plugin install weaviate@weaviate-plugins`; or clone and run `claude --plugin-dir .`. `/weaviate:quickstart` runs interactive onboarding."
    Scope and surfaces: "BSD-3-Clause. Skills to create, explore and query collections (keyword, vector, hybrid, filters), import data (multi-vector, PDF) and use Query Agent; cookbooks (PDF ingestion, RAG, chatbot); weaviate-best-practices. The Claude Code plugin adds `/weaviate:*` commands."
    Approvals and destructive ops: "No approval model documented. The skills can create collections and import data, and the README describes no confirm step or read-only mode. Its Security Note disclaims third-party packages in scripts and cookbooks and tells you to run your own security scans first."
    Credentials and sandbox modes: "Needs `WEAVIATE_URL` and `WEAVIATE_API_KEY` in the environment; external provider keys are auto-detected from env vars. README suggests a free Weaviate Cloud cluster for onboarding. No test-mode switch documented; use a scoped key on a non-production cluster."
  mongodb-agent-skills:
    How to install: "Plugins: Claude `/plugin install mongodb-atlas`; Cursor `/add-plugin mongodb-atlas`; Codex `/plugins`; Copilot CLI `copilot plugin marketplace add mongodb/agent-skills`; VS Code; Grok. Skills only: `npx skills add mongodb/agent-skills`. Self-managed: the `mongodb` plugin."
    Scope and surfaces: "Apache-2.0. Docs list nine skills: Entry Point, MCP Setup, Connection, Schema Design, Atlas Stream Processing, Natural Language Querying, Query Optimizer, Queryable Encryption Size Estimation, Search and AI Recommendations. Plugins bundle the MongoDB MCP server; some skills work without it."
    Approvals and destructive ops: "No pack-level approval model or read-only default in the README or docs page. Atlas Stream Processing is described as covering workspace provisioning and processor lifecycle. Check the MongoDB MCP server docs and your Atlas role for limits."
    Credentials and sandbox modes: "`mongodb-atlas` signs in to the hosted Atlas MCP server with OAuth in your browser on first use. The `mongodb` plugin runs the MCP server locally against your own deployment. `npx skills` installs skip MCP; `npx mongodb-mcp-server@1 setup` configures it."
  redis-agent-skills:
    How to install: "`npx skills add redis/agent-skills`; Claude Code `/plugin install redis-development@claude-plugins-official`; Cursor `/add-plugin redis`. A ChatGPT/Codex plugin package is in `plugins/redis-development/`; the README steps there describe submission, not install."
    Scope and surfaces: "MIT. Fourteen skills: eight for Redis development (core, connections, search, semantic-cache, clustering, security, observability, docs-mcp) and six for Redis Iris. Plugins bundle the redis.io docs MCP server; `npx skills` installs do not."
    Approvals and destructive ops: "No approval model documented. The bundled docs MCP has three read-only tools (search, fetch, ask). Iris skills provision with the `iris` CLI, and the README describes no gate. The redis-security skill teaches ACL-based least privilege."
    Credentials and sandbox modes: "Docs MCP at redis.io/mcp needs no credentials or local Redis, but each call sends the agent's query text to redis.io; disable `redis-docs` in client MCP settings if that conflicts with your data policy. Iris credentials are not described in the README."
verdict: "None of these five publishes a pack-wide approval gate or read-only default, so treat that as not documented, not as safe. Elastic’s README has the fullest security guidance (least-privilege keys, attacker-controlled input, non-production first). MongoDB and Redis bundle MCP servers in their plugins, which are separate trust decisions. Pin each pack, read scripts first, and use scoped keys on a non-production cluster. Not a quality ranking."
sources:
  - title: "ClickHouse agent-skills README"
    url: https://raw.githubusercontent.com/ClickHouse/agent-skills/main/README.md
    accessed: 2026-11-28
  - title: "ClickHouse agent-skills LICENSE"
    url: https://raw.githubusercontent.com/ClickHouse/agent-skills/main/LICENSE
    accessed: 2026-11-28
  - title: "Elastic agent-skills README"
    url: https://raw.githubusercontent.com/elastic/agent-skills/main/README.md
    accessed: 2026-11-28
  - title: "Elastic agent-skills LICENSE"
    url: https://raw.githubusercontent.com/elastic/agent-skills/main/LICENSE
    accessed: 2026-11-28
  - title: "Weaviate agent-skills README"
    url: https://raw.githubusercontent.com/weaviate/agent-skills/main/README.md
    accessed: 2026-11-28
  - title: "Weaviate agent-skills LICENSE"
    url: https://raw.githubusercontent.com/weaviate/agent-skills/main/LICENSE
    accessed: 2026-11-28
  - title: "MongoDB agent-skills README"
    url: https://raw.githubusercontent.com/mongodb/agent-skills/main/README.md
    accessed: 2026-11-28
  - title: "MongoDB Agent Skills docs"
    url: https://www.mongodb.com/docs/agent-skills/
    accessed: 2026-11-28
  - title: "MongoDB agent-skills LICENSE"
    url: https://raw.githubusercontent.com/mongodb/agent-skills/main/LICENSE
    accessed: 2026-11-28
  - title: "Redis agent-skills README"
    url: https://raw.githubusercontent.com/redis/agent-skills/main/README.md
    accessed: 2026-11-28
  - title: "Redis agent-skills LICENSE"
    url: https://raw.githubusercontent.com/redis/agent-skills/main/LICENSE
    accessed: 2026-11-28
last_verified: 2026-11-28
published: 2026-11-28
---

## What this compares

Five official Agent Skills packs from data-platform vendors: [ClickHouse](entry:clickhouse-agent-skills), [Elastic](entry:elastic-agent-skills), [Weaviate](entry:weaviate-agent-skills), [MongoDB](entry:mongodb-agent-skills) and [Redis](entry:redis-agent-skills). All five are open-source repositories in the vendor's own GitHub organisation and none is archived. Licences, from each LICENSE file: ClickHouse, Elastic and MongoDB Apache-2.0, Weaviate BSD-3-Clause, Redis MIT. Last pushes per GitHub (Europe/Stockholm): MongoDB 2026-11-27 06:39, Weaviate 2026-11-26 10:08, Elastic 2026-11-25 13:11, ClickHouse 2026-11-24 16:58, Redis 2026-11-05 16:01.

It is a companion to [Official vendor Agent Skills packs compared](comparison:official-vendor-skill-packs), which holds the other vendor packs. It is not a comparison of the databases themselves (see [Vector databases for agents](comparison:vector-databases-for-agents) and [Database MCP servers](comparison:database-mcp-servers)) and not a ranking: the packs cover different products, and a skill count says nothing about quality.

## How this was checked

Everything comes from each vendor's README, LICENSE file and, for MongoDB, its docs page, fetched on 2026-11-28. Where those are silent the cell says not documented. No installer was run; commands are copied from the READMEs. No account, API key, cluster or paid service was used, and no skill was executed.

## Treat every pack as third-party code you have not read

- **Pin and review.** Pin to a commit or tag when the installer allows it, and read `SKILL.md` plus scripts, hooks and any bundled MCP config in a throwaway clone before installing. [Install and vet a vendor skill pack](guide:install-and-vet-a-vendor-skill-pack) is the checklist. Weaviate's README says its scripts and cookbooks rely on widely used third-party packages and tells you to run your own security scans before executing any code.
- **Skills are not the whole attack surface.** MongoDB and Redis plugins bundle MCP servers, and `npx skills add` installs skip them (both READMEs say so). Each server is its own trust decision; see [MongoDB MCP server](entry:mongodb-mcp-server), [Redis MCP server](entry:redis-mcp-server), [ClickHouse MCP server](entry:clickhouse-mcp-server) and [Elastic Agent Builder MCP](entry:elastic-agent-builder-mcp). Redis's bundled docs MCP sends each query to redis.io.
- **Untrusted input.** Elastic's README says its security skills process attacker-controlled alerts, event fields and file contents, and that prompt injection is "an inherent property of the operating environment." The same caution applies to any document or row a database skill reads back and puts in the model's context.
- **Least privilege.** Elastic advises minimum-privilege API keys, read-only until validated, restricted tool and network access, and a trial or dev environment first. Redis ships a `redis-security` skill about ACL-based least privilege. ClickHouse, Weaviate and MongoDB do not say; give those skills a scoped key on a non-production service.
- **Skills that can change things.** Elastic's cloud-provisioning can create and delete Serverless projects; Weaviate's can create collections and import data; ClickHouse's infra skills can manage ClickHouse Cloud services through `clickhousectl`; MongoDB's Atlas Stream Processing skill covers workspace provisioning and processor lifecycle. None of the READMEs describes a confirm step for these.
- **Spend.** Cloud services behind these packs bill separately from the packs. No spend cap is documented in the READMEs, so set one in the vendor's console before you let an agent provision anything.

## Differences worth knowing

- **Maturity.** Elastic labels its pack Technical Preview and expects changes. Weaviate's cookbooks are described as blueprints, and ClickHouse marks Cloud Postgres as beta.
- **Counts.** Elastic's README tables now list 32 skills (Cloud 2, Elasticsearch 10, Kibana 7, Observability 6, Security 7); the directory entry says 31. ClickHouse lists eight skills and MongoDB's docs list nine. Redis lists fourteen: eight for Redis development and six for Redis Iris.
- **Install breadth.** Redis, MongoDB, Weaviate and Elastic document a Claude Code plugin path; ClickHouse documents only `npx skills add` and `clickhousectl skills`. Elastic advises installing only the skills you need, since every installed skill adds routing context.
