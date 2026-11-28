---
id: official-vendor-skill-packs
type: comparison
title: Official vendor Agent Skills packs compared
summary: "Compare 12 official vendor Agent Skills packs (AWS, Microsoft, Stripe, Playwright, PlanetScale, Notion, PostHog, Firecrawl, ElevenLabs, CrewAI, Mastra, Adobe) on documented install steps, scope, and how each handles approvals, credentials and sandbox or test modes."
description: "A source-checked comparison of official vendor Agent Skills packs listed in the directory (eleven on 16 November 2026, adobe-skills checked on 28 November 2026): aws-skills, microsoft-skills, stripe-skills, playwright-skills, planetscale-skills, notion-skills, posthog-skills, firecrawl-skills, elevenlabs-skills, crewai-skills, mastra-skills and adobe-skills. For each pack it records the install commands or steps published in official docs or the official repo, how narrowly the pack is scoped (what the skills cover, any published count, and which surfaces — plugins, CLI, MCP, well-known indexes), and what those same sources say about approvals, destructive operations, credentials, and test or sandbox modes. Where a vendor is silent, the cell says not documented. It does not repeat the installers-and-registries comparison, invent skill totals, or run the installers. Distinct from MCP-server comparisons."
author: Agentica Author
tags: [agent-skills, vendor, plugins, install, safety, approvals]
entries: ["aws-skills", "microsoft-skills", "stripe-skills", "playwright-skills", "planetscale-skills", "notion-skills", "posthog-skills", "firecrawl-skills", "elevenlabs-skills", "crewai-skills", "mastra-skills", "adobe-skills", "agent-skills-spec", "skills-cli", "aws-mcp-servers", "stripe-mcp", "notion-mcp", "playwright-mcp", "azure-skills", crewai, mastra]
related: [agent-skill-packs-and-installers, install-and-vet-a-vendor-skill-pack, add-mcp-servers-to-claude-code, connect-an-agent-to-a-remote-mcp-server, connect-remote-mcp, pick-an-mcp-server, discover-agent-interfaces, give-your-coding-agent-up-to-date-docs, payment-processor-mcp-servers, work-management-mcp-servers, database-mcp-servers, database-and-search-skill-packs]
subjects: ["aws-skills", "microsoft-skills", "stripe-skills", "playwright-skills", "planetscale-skills", "notion-skills", "posthog-skills", "firecrawl-skills", "elevenlabs-skills", "crewai-skills", "mastra-skills", "adobe-skills"]
criteria:
  - How to install
  - Scope and surfaces
  - Approvals and destructive ops
  - Credentials and sandbox modes
rows:
  aws-skills:
    How to install: "Claude Code official marketplace: `/plugin install aws-core@claude-plugins-official` (related plugins in the AWS README). Codex: `codex plugin marketplace add aws/agent-toolkit-for-aws` then `/plugins`. CLI: `aws configure agent-toolkit`. Or `npx skills add aws/agent-toolkit-for-aws/skills`."
    Scope and surfaces: "Marked GA. Five plugins; start with aws-core. Skills are core (bundled with aws-core) or specialized by service category. No single skill total is published. Plugins bundle AWS MCP Server config; runtime skill discovery via that server is documented."
    Approvals and destructive ops: "No pack-level approval-class model is documented. Official docs: the agent uses your IAM credentials; the AWS MCP Server adds `aws:ViaAWSMCPService` and `aws:CalledViaAWSMCP` so policies can apply only to agents, including read-only limits. Mutations are whatever those credentials allow."
    Credentials and sandbox modes: "API calls and script execution need local AWS credentials; docs search and skill discovery do not. Docs: MCP `aws___run_script` runs Python with AWS API access in a sandbox under your IAM credentials. User guide: no additional toolkit charge; you pay for resources the agent uses."
  microsoft-skills:
    How to install: "README: `npx skills add microsoft/skills` and pick skills in the wizard. Manual: clone `microsoft/skills` and copy or symlink folders. Copilot CLI: `/plugin marketplace add microsoft/skills` then `/plugin install azure@skills` or `deep-wiki@skills`. Explorer: https://microsoft.github.io/skills/."
    Scope and surfaces: "Azure SDK and Microsoft AI Foundry skills, plus plugins, agents, AGENTS.md and MCP configs. README table: Core 11, Foundry 11, Python 39, .NET 28, TypeScript 25, Java 25, Rust 7; it also says “175 skills” and “174 Skills” (17 Nov 2026), which disagree. Load skills selectively."
    Approvals and destructive ops: "not documented as a pack-level approval or destructive-operation contract. Foundry skills include governance and identity topics, but the README does not say the markdown pack confirms mutations before they run. It does warn that loading all skills causes context rot."
    Credentials and sandbox modes: "Pack-level key handling is not documented in the README beyond Azure/Foundry auth used by the skills and bundled MCP servers (azure and foundry-mcp for the azure plugin). A test harness can run in mock mode for CI (`pnpm harness <skill> --mock`). That tests skill output, not a live-Azure sandbox."
  stripe-skills:
    How to install: "Recommended: install the Stripe CLI as the skills docs show, then `stripe agent setup`. Official plugins for Claude Code, Codex and Cursor are also documented. Manual: `npx skills add https://docs.stripe.com` (does not auto-update). The documented CLI install scripts were not executed here."
    Scope and surfaces: "Published index at https://docs.stripe.com/.well-known/skills/index.json lists 11 skills on 17 Nov 2026, including stripe-best-practices, stripe-docs, stripe-projects and stripe-pay. Plugins also configure Stripe MCP. The markdown pack is MIT in the stripe/ai repository."
    Approvals and destructive ops: "not documented as a pack-level confirmation model on the skills page. The official index includes stripe-pay, described as helping users send funds to another Stripe business. Live account data goes through the official MCP/plugin path. Treat missing spend-approval docs as a gap, not as permission."
    Credentials and sandbox modes: "Skills page: to access live account data, also set up Stripe MCP (hosted OAuth is on the MCP docs). The stripe-best-practices skill covers test-environment planning, including separate sandboxes vs shared test-mode sandbox. No required test-mode default or pack-level key storage is documented there."
  playwright-skills:
    How to install: "Official docs: `playwright-cli install --skills` copies the skill to `.claude/skills/playwright-cli`. Use `--skills=agents` for `.agents/skills`, and `-g` for the home path. Listed clients: Claude Code, GitHub Copilot, Cursor, and any local-skills agent. Skills-less use: `playwright-cli --help`."
    Scope and surfaces: "One installed skill, `playwright-cli`, covering the CLI surface (interactions, snapshots, sessions, raw output, open/attach) plus guides for tests, mocking, run-code, storage, test generation, tracing, video and attributes. This is CLI skills, not a substitute for the Playwright MCP server."
    Approvals and destructive ops: "not documented. The official skills page does not describe confirmation prompts, a read-only default, or destructive-operation gates. The CLI can drive a real browser; do not infer a safety model the docs do not state."
    Credentials and sandbox modes: "Pack-level API-key handling is not documented (the skill is about the local CLI). The CLI documents headed vs headless operation and sessions. `PLAYWRIGHT_MCP_SANDBOX` appears in the CLI/MCP config table; it is not a skill-pack test-mode switch. Examples use https://demo.playwright.dev/todomvc/."
  planetscale-skills:
    How to install: "Recommended: clone the official repo and run `script/setup` (to `~/.cursor/skills/`, `~/.claude/skills/`, `~/.agents/skills/`, or a path you pass). Skills CLI: `npx skills add planetscale/skills -g -y`. Manual: copy sibling `planetscale-*` folders. Needs authenticated `pscale` CLI; MCP is optional."
    Scope and surfaces: "Official README lists 15 skills for assessing and, with approval, operating a PlanetScale database (orchestrator, inventory, safety reviews, insights, change-gates, autonomous mode, pscale automation, and related reporting and schema-loop skills). Plain SKILL.md; no vendor plugin required."
    Approvals and destructive ops: "Documented Class A–E model. A (read-only) and B (reviewable proposals) run freely; C needs approval or authorization; D needs approval, a named target and a rollback plan; E is never executed autonomously. First assessment is read-only. Full autonomy is opt-in (explicit risk acknowledgment)."
    Credentials and sandbox modes: "Live ops use an authenticated `pscale` CLI (`pscale auth check --format json`). An insights-only MCP is optional, with fallback to `pscale`. Standing authorization is documented for scheduled automation. No pack-level “sandbox” flag is named; Class B workflows are the gates."
  notion-skills:
    How to install: "Official README recommends the skills CLI: `npx skills add makenotion/skills` for all skills, or `npx skills add makenotion/skills --skill notion-cli` for one skill. No plugin marketplace or vendor-CLI setup is documented in that README."
    Scope and surfaces: "Official table lists two skills: `notion-cli` (Notion CLI `ntn` for workers, public API requests and file uploads) and `notion-apps` (scaffold and build Notion Apps, including workflows and database syncs). This pack is not the Notion MCP server (notion-mcp)."
    Approvals and destructive ops: "not documented. The official README does not describe confirmation prompts, a read-only default, or destructive-operation guidance for these skills."
    Credentials and sandbox modes: "not documented in the README. Live CLI or API use implies a Notion account, but the pack README does not say how keys are stored, or document a test-workspace or sandbox mode."
  posthog-skills:
    How to install: "Claude Code: `/plugin marketplace add PostHog/skills`, then `/plugin install posthog-integration@posthog-skills`, `posthog-feature-flags@posthog-skills`, or `posthog-all@posthog-skills`. Manual: copy a skill directory into `.claude/skills/`. No skills-CLI command is documented in the README."
    Scope and surfaces: "GitHub repo description: “PostHog skills (under construction).” README: official platform skills (analytics, feature flags, error tracking, LLM analytics; generated by context-mill), plus team, community and .meta skills. No published skill total. Plugins: integration, feature-flags, posthog-all."
    Approvals and destructive ops: "not documented. The official README does not describe confirmation prompts, read-only defaults, or destructive-operation guidance for the pack. The official GitHub repo still describes itself as “PostHog skills (under construction).”"
    Credentials and sandbox modes: "not documented in the README. How API keys are stored, and whether a pack-level test or sandbox project is required, are not stated there."
  firecrawl-skills:
    How to install: "Catalog README: `npx skills add firecrawl/skills` (picker without `-y`) or `--skill firecrawl-build`. CLI onboarding: `npx -y firecrawl-cli@latest init` (CLI plus core skills, optional workflows). The repo also ships Claude Code, Cursor and Codex plugin metadata for core and build skills."
    Scope and surfaces: "A CI-synced catalog in three groups: core (CLI primitives for live web work, plus research and developer index skills), build (API/SDK integration) and workflows (recipes such as lead gen and deep research). Named core and build skills are tabulated; no single total is published."
    Approvals and destructive ops: "not documented. The official catalog README does not describe confirmation prompts, a read-only default, or destructive-operation gates for scraping, crawling or workflow skills."
    Credentials and sandbox modes: "Cloud use: store an API key in `FIRECRAWL_API_KEY` (or use a self-hosted deployment). `firecrawl-build-onboarding` is documented to get the key into a project and includes a browser authorization flow. A pack-level test-mode or sandbox-key default is not documented in the catalog README."
  elevenlabs-skills:
    How to install: "Official README: `npx skills add elevenlabs/skills`. No plugin-marketplace or vendor-CLI setup command is documented there."
    Scope and surfaces: "Official table lists 12 skills: text-to-speech, speech-to-text, speech-engine, realtime, agents, sound-effects, music, voice-changer, voice-isolator, dubbing, onboarding and setup-api-key. They target ElevenLabs developer products, with Python, JS/TS (`@elevenlabs/elevenlabs-js`) and CLI examples."
    Approvals and destructive ops: "not documented. The official README does not describe confirmation prompts, a read-only default, or destructive-operation guidance (for example before paid generation calls)."
    Credentials and sandbox modes: "All skills require `ELEVENLABS_API_KEY`. The `onboarding` skill is documented to put a key in the project’s env file; `setup-api-key` helps with an existing key. Evals can run in an isolated workspace and do not modify skill sources. No pack-level live-vs-test key switch is documented."
  crewai-skills:
    How to install: "Official README documents only a Claude Code marketplace install: `/plugin marketplace add crewAIInc/skills` then `/plugin install crewai-skills@crewai-plugins`. Pin a branch with `/plugin marketplace add crewAIInc/skills#<branch-or-tag>`. No skills-CLI or other-harness command is documented there."
    Scope and surfaces: "Official README lists 10 skills: getting-started, design-agent, design-task, ask-docs, check-crewai-api, build-flow, connect-tools-and-mcp, test-crewai-project, deploy-to-amp and call-deployed-crew. Scope is the CrewAI framework and CrewAI AMP deploy/kickoff, plus docs lookup."
    Approvals and destructive ops: "not documented as a pack-level approval model. Some skills teach CrewAI features such as task guardrails and human-in-the-loop review; that is framework guidance, not a pack gate. `deploy-to-amp` and `call-deployed-crew` can target hosted AMP; the README does not require a confirmation first."
    Credentials and sandbox modes: "not documented in the README. How AMP or API credentials are stored, and whether a pack-level sandbox or dry-run deploy is required, are not stated there. A `test-crewai-project` skill covers testing a CrewAI project; that is not described as a live-AMP sandbox mode."
  mastra-skills:
    How to install: "Official README: `npx skills add mastra-ai/skills`, or `npx skills add https://mastra.ai/` via `.well-known` discovery. Factory only: `--skill mastra-factory`. Manual: clone the repo and point the agent at it. Global installs may need `--agent <agent> -g`; verify with `npx skills list`."
    Scope and surfaces: "Two official skills, also at https://mastra.ai/.well-known/skills/. `mastra` is a comprehensive framework skill (setup, docs lookup, troubleshooting, migrations, API CLI, Platform deploy, traces). `mastra-factory` covers the Factory CLI: connection, inspection and user-authorized operations."
    Approvals and destructive ops: "The main `mastra` skill has no pack-level approval contract in the README. `mastra-factory` is documented to cover user-authorized operations and “safe mutations” (details in its factory-cli reference). That is specific to Factory, not a general gate for every Mastra action."
    Credentials and sandbox modes: "Factory notes in the README include first-use CLI/login checks and connecting to your own deployment. A pack-level test-mode or sandbox-key default for Mastra Platform is not documented in the README."
  adobe-skills:
    How to install: "Claude Code: `/plugin marketplace add adobe/skills`, then `/plugin install aem-edge-delivery-services@adobe-skills`. Copilot CLI: `copilot plugin marketplace add adobe/skills`. Any agent: `npx skills add adobe/skills --list`, `--skill <name>` or `--all`. Antigravity uses `agy plugin install <URL>`."
    Scope and surfaces: "Apache-2.0 monorepo with 19 marketplace plugins by product or job (AEM Edge Delivery, AEM Cloud Service, App Builder, Commerce, Analytics, CJA, Firefly workflow, Workfront, Semrush and more). The README does not list individual skills; `--list` prints them."
    Approvals and destructive ops: "No pack-wide approval model. Per the README, adobe-for-developers asks for approval before destructive Developer Console tools run, but the hook that enforces it runs in Claude Code and Copilot CLI only, not Antigravity (issue #666)."
    Credentials and sandbox modes: "Hosted MCP servers use Adobe IMS or vendor OAuth; Analytics and CJA need IMS headers on every request; run-workflow needs an enterprise Firefly entitlement. `npx skills` installs skills only, without MCP servers or hooks. No test mode documented."
verdict: "If you need a documented approval model, start with PlanetScale’s Class A–E contract and read-only first pass; no other pack in this set publishes a comparable pack-wide gate (Adobe documents an approval hook for destructive Developer Console tools in two clients). For everything else, use only the vendor’s official install steps, and treat silence on approvals, keys and test modes as not documented. Stripe, AWS and similar packs can reach live accounts; install selectively, pin, and read scripts first. Not a quality ranking."
sources:
  - title: AWS Agent Toolkit README
    url: https://raw.githubusercontent.com/aws/agent-toolkit-for-aws/main/README.md
    accessed: 2026-11-17
  - title: AWS Agent Skills README
    url: https://raw.githubusercontent.com/aws/agent-toolkit-for-aws/main/skills/README.md
    accessed: 2026-11-17
  - title: "What is the Agent Toolkit for AWS?"
    url: https://docs.aws.amazon.com/agent-toolkit/latest/userguide/what-is-agent-toolkit.html
    accessed: 2026-11-17
  - title: AWS CLI integration for the Agent Toolkit
    url: https://docs.aws.amazon.com/agent-toolkit/latest/userguide/aws-cli.html
    accessed: 2026-11-17
  - title: Microsoft skills README
    url: https://raw.githubusercontent.com/microsoft/skills/main/README.md
    accessed: 2026-11-17
  - title: Microsoft Skill Explorer
    url: https://microsoft.github.io/skills/
    accessed: 2026-11-17
  - title: Stripe skills for agents
    url: https://docs.stripe.com/skills
    accessed: 2026-11-17
  - title: Stripe skills markdown docs
    url: https://docs.stripe.com/skills.md
    accessed: 2026-11-17
  - title: Stripe official skills index
    url: https://docs.stripe.com/.well-known/skills/index.json
    accessed: 2026-11-17
  - title: Stripe AI repository README
    url: https://raw.githubusercontent.com/stripe/ai/main/README.md
    accessed: 2026-11-17
  - title: Playwright CLI skills page
    url: https://playwright.dev/agent-cli/skills
    accessed: 2026-11-17
  - title: Playwright CLI README
    url: https://raw.githubusercontent.com/microsoft/playwright-cli/main/README.md
    accessed: 2026-11-17
  - title: PlanetScale skills README
    url: https://raw.githubusercontent.com/planetscale/skills/main/README.md
    accessed: 2026-11-17
  - title: Notion skills README
    url: https://raw.githubusercontent.com/makenotion/skills/main/README.md
    accessed: 2026-11-17
  - title: PostHog skills README
    url: https://raw.githubusercontent.com/PostHog/skills/main/README.md
    accessed: 2026-11-17
  - title: PostHog skills GitHub repository
    url: https://api.github.com/repos/PostHog/skills
    accessed: 2026-11-17
  - title: Firecrawl skills README
    url: https://raw.githubusercontent.com/firecrawl/skills/main/README.md
    accessed: 2026-11-17
  - title: ElevenLabs skills README
    url: https://raw.githubusercontent.com/elevenlabs/skills/main/README.md
    accessed: 2026-11-17
  - title: CrewAI skills README
    url: https://raw.githubusercontent.com/crewAIInc/skills/main/README.md
    accessed: 2026-11-17
  - title: Mastra skills README
    url: https://raw.githubusercontent.com/mastra-ai/skills/main/README.md
    accessed: 2026-11-17
  - title: "Mastra well-known skills index"
    url: https://mastra.ai/.well-known/skills/index.json
    accessed: 2026-11-17
  - title: "Adobe skills README"
    url: https://raw.githubusercontent.com/adobe/skills/main/README.md
    accessed: 2026-11-28
  - title: "Adobe skills LICENSE"
    url: https://raw.githubusercontent.com/adobe/skills/main/LICENSE
    accessed: 2026-11-28
last_verified: 2026-11-28
published: 2026-11-17
---


## Who this is for

This page compares **official vendor Agent Skills packs** — folders of `SKILL.md` files (and, in some cases, plugins or CLI installers) published by the product vendor. The first eleven subjects are the vendor packs added to the directory on 16 November 2026: [AWS](entry:aws-skills), [Microsoft](entry:microsoft-skills), [Stripe](entry:stripe-skills), [Playwright](entry:playwright-skills), [PlanetScale](entry:planetscale-skills), [Notion](entry:notion-skills), [PostHog](entry:posthog-skills), [Firecrawl](entry:firecrawl-skills), [ElevenLabs](entry:elevenlabs-skills), [CrewAI](entry:crewai-skills) and [Mastra](entry:mastra-skills). [Adobe](entry:adobe-skills) was added on 28 November 2026. The data-platform packs (ClickHouse, Elastic, Weaviate, MongoDB, Redis) are compared in [Skill packs for databases and search](comparison:database-and-search-skill-packs); a comparison holds at most 12 subjects.

It is not a comparison of skill *installers*, registries or harness search paths. That is [Agent skill packs, skills CLIs and registries](comparison:agent-skill-packs-and-installers), which covers the [Agent Skills](entry:agent-skills-spec) format, [skills CLI](entry:skills-cli), and community or first-party packs such as Anthropic’s and Vercel’s. How to add a *remote MCP server* to a client is a different job: see [Connect a remote MCP server](skill:connect-remote-mcp), [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server) and [Add MCP servers to Claude Code](guide:add-mcp-servers-to-claude-code). Several packs here *bundle* MCP config; that does not make this an MCP-server comparison ([Pick an MCP server](skill:pick-an-mcp-server) is the workflow for that).

A short checklist for reading a pack before you install it is [Install and vet a vendor skill pack](guide:install-and-vet-a-vendor-skill-pack).

The build renders the comparison table from the front matter. The notes below only add what the cells cannot: how the sources were used, which published counts to distrust, and which safety claims were *not* found.

## How this was checked

Facts come from official vendor docs or the official repository, fetched on 17 November 2026. Where a README or docs page is silent, the cell says **not documented**. The first eleven packs were checked on 17 November 2026 and Adobe on 28 November 2026 (README and LICENSE file; Apache-2.0, last pushed 2026-11-28 04:34 Europe/Stockholm). Directory entries for the first eleven were last verified on 16 November 2026; anything that changed in the official sources overnight is called out.

No installer was run. Commands are copied from official pages, not from a trial install. That includes documented `curl | sh` and `install.ps1` snippets (Stripe CLI): they are quoted as the vendor wrote them, not executed here. No API keys, cloud accounts or paid calls were used.

Skill *totals* are stated only when the vendor published them. A raw file count in a git tree is not a published total, and this page does not invent one. Microsoft’s own README currently prints more than one total; the Scope cell records that disagreement rather than picking a number.

## Official install commands worth opening

Most packs support at least one of: `npx skills add <org/repo>` (or a docs origin such as `https://docs.stripe.com` or `https://mastra.ai/`); a vendor or official harness plugin; or a product CLI that also drops skills (`playwright-cli install --skills`, `aws configure agent-toolkit`, Firecrawl’s `firecrawl-cli init`, PlanetScale’s `script/setup`).

A few commands are easy to miss in the table cells:

- AWS also documents `/plugin install aws-agents@claude-plugins-official`, `aws-data-analytics` and `aws-agents-for-devsecops`, and installing `aws-startup-advisor` from `aws/agent-toolkit-for-aws`. Cursor setup is “import the repo as a team marketplace,” then install aws-core.
- Stripe’s recommended path is: install the Stripe CLI as shown on [Skills for agents](https://docs.stripe.com/skills), then `stripe agent setup`. The repo also lists `claude plugin install stripe@claude-plugins-official`, `codex plugin add stripe@openai-curated` and Cursor `/add-plugin stripe`.
- CrewAI’s official README documents only the Claude Code marketplace path. If you use another harness, that gap is not filled in here.

[skills CLI](entry:skills-cli) behaviour, harness skill directories and how to symlink `.agents/skills/` are documented on the [installers page](comparison:agent-skill-packs-and-installers). This table only records what *each vendor* documents for its own pack.

Well-known discovery appears where the vendor published it: Stripe at `https://docs.stripe.com/.well-known/skills/index.json` (11 skills on 17 November 2026) and Mastra at `https://mastra.ai/.well-known/skills/`. [Discover a site's agent interfaces](skill:discover-agent-interfaces) is the general probe for those files.

## Adobe, added 28 November 2026

[Adobe’s pack](entry:adobe-skills) is a monorepo of 19 marketplace plugins, several of which register hosted MCP servers that need Adobe sign-in. `npx skills` and `gh upskill` copy skills only, without MCP servers or hooks, so a destructive-tool approval hook the README describes for `adobe-for-developers` does not travel with them. Treat the pack as third-party code: pin to a commit, read `SKILL.md` and plugin hooks in a throwaway clone, and use a least-privilege Adobe role. See [Install and vet a vendor skill pack](guide:install-and-vet-a-vendor-skill-pack).

## Approvals, credentials and what “not documented” means

[PlanetScale](entry:planetscale-skills) is the only pack in this set that publishes a full approval contract (Class A–E), a read-only first assessment, and an explicit opt-in for autonomy. Cite that README if you need a model to compare others against. Silence in another vendor’s README is not the same as “the pack is read-only” or “the pack will ask first.”

Several packs reach a live account through something *other* than the markdown files: [AWS MCP](entry:aws-mcp-servers) under your IAM credentials, [Stripe MCP](entry:stripe-mcp) for live account data (the official index includes a `stripe-pay` skill described as helping send funds), Playwright’s local CLI driving a browser, ElevenLabs and Firecrawl API keys in the environment, CrewAI AMP deploy skills, Notion’s `ntn` CLI. For those, use the vendor’s IAM, OAuth or key docs, and the MCP guides above, rather than assuming the skill pack itself enforces a gate.

Microsoft’s catalog is large (Azure SDK and Foundry). Its README also says the repository is a work in progress and warns against loading every skill at once. The published “174” / “175” totals in that README do not agree with each other; do not cache a single figure.

## What this page does not claim

No quality, latency or “best pack” ranking. No unofficial skill counts. No claim that a documented eval harness or mock test (`pnpm harness … --mock` in Microsoft’s README, ElevenLabs isolated evals) is a live-production sandbox. Entry last_verified dates are the Curator’s, not this page’s. No accounts were created and no installers were executed for this page.
