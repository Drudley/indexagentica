---
id: llm-gateways
type: comparison
title: "LLM gateways compared: OpenRouter vs Vercel AI Gateway vs Cloudflare AI Gateway vs Portkey vs LiteLLM"
summary: "Five ways to put one endpoint between your agents and many model providers: two hosted model marketplaces (OpenRouter, Vercel AI Gateway), Cloudflare's proxy, and two open-source gateways you can self-host (Portkey, LiteLLM). Covers API, fallback, caching, spend controls, MCP, pricing and license."
description: "A primary-source comparison of LLM (model) gateways, checked on 2026-10-25 against each vendor's docs, pricing page and README. It sets hosted gateways that resell tokens apart from proxies and self-hosted gateways that use your own provider keys, and lists what each one charges on top of tokens. MCP tool gateways are compared separately in 'MCP gateways compared'. None of the five was load-tested here, and latency claims are the vendors' own."
author: Agentica Author
tags: [llm-gateway, routing, fallback, caching, budgets, byok, self-hosted, mcp, cost]
entries: [openrouter, vercel-ai-gateway, cloudflare-ai-gateway, portkey-ai-gateway, litellm-mcp-gateway, kong-ai-gateway, helicone, openrouter-rankings, models-dev, vercel-ai-sdk, model-context-protocol]
related: [mcp-gateways, agent-observability-platforms, coding-agent-harnesses, agent-payment-rails, bridge-stdio-and-remote-mcp-servers, evaluate-an-ai-agent]
subjects: [openrouter, vercel-ai-gateway, cloudflare-ai-gateway, portkey-ai-gateway, litellm-mcp-gateway]
criteria:
  - What it is
  - Run it where
  - API
  - Routing and fallback
  - Caching
  - Spend and access controls
  - MCP tools
  - Pricing (2026-10-25)
  - License
rows:
  openrouter:
    What it is: "Hosted marketplace API: 500+ models from 80+ providers behind one key, billed from prepaid credits"
    Run it where: "OpenRouter-hosted only; eu.openrouter.ai and us.openrouter.ai keep inference in-region on Business and Enterprise"
    API: "OpenAI-compatible (change base URL and model names); tool calling passes through when the model supports it"
    Routing and fallback: "models array tries the next model on error; openrouter/auto auto-routing; provider fallback on rate limits. Failed attempts are not billed (Zero Completion Insurance)"
    Caching: "Provider prompt caching on Standard and above; no response cache documented on the pricing page"
    Spend and access controls: "Budgets and spend controls on Standard and above; per-key credit caps; workspaces (5, or 1,000 on Business); SSO/SAML on Enterprise"
    MCP tools: "Not part of the gateway pages we checked"
    Pricing (2026-10-25): "Tokens at provider list price. Fee on credit purchases: 5.5% Standard, 8% Business. BYOK free up to $25,000/month of list-price inference, then 5%. Free tier: 25+ free models, 50 requests/day"
    License: "Proprietary"
  vercel-ai-gateway:
    What it is: "Vercel's managed gateway for calling models across providers from any infrastructure (your app need not run on Vercel)"
    Run it where: "Vercel-hosted; authenticate with an AI Gateway API key, or OIDC from Vercel deployments"
    API: "AI SDK, OpenAI Chat Completions, OpenAI Responses and Anthropic Messages formats at ai-gateway.vercel.sh"
    Routing and fallback: "Routes a model across healthy providers; ordered provider and model fallbacks; routing rules; request logs record every routing attempt"
    Caching: "'Automatic caching' listed under Models & Providers"
    Spend and access controls: "Budgets per team, project, API key or member (cover system-credential spend only, not BYOK); request logs; paid add-ons for team-wide provider allowlist and ZDR"
    MCP tools: "Not part of the gateway pages we checked"
    Pricing (2026-10-25): "No markup or platform fee on tokens, including BYOK; prepaid credits; monthly free credit limited to a subset of models with lower rate limits. BYOK needs purchased credits. Add-ons: Custom Reporting $0.075/1,000 writes and $5/1,000 queries; team-wide ZDR or provider allowlist $0.10/1,000 requests"
    License: "Proprietary"
  cloudflare-ai-gateway:
    What it is: "Proxy in front of your AI providers that adds analytics, logs, caching, rate limiting, retries and model fallback"
    Run it where: "Cloudflare's network; available on all plans, created automatically on first request to the default gateway"
    API: "Provider-native endpoints through the gateway, plus an OpenAI-compatible REST API (/ai/v1/chat/completions); the older /compat endpoint is deprecated for single-model calls"
    Routing and fallback: "Request retry and model fallback via dynamic routes"
    Caching: "Response caching served from Cloudflare's cache (core feature)"
    Spend and access controls: "Rate limiting (core feature); free DLP scanning; Guardrails using Llama Guard on Workers AI"
    MCP tools: "Not part of the gateway pages we checked"
    Pricing (2026-10-25): "Core features (analytics, caching, rate limiting) free. Logs: Workers Logs pricing for accounts whose first gateway dates from 2026-09-24 on, else Legacy Logs limits. Unified Billing: 5% fee on credits, tokens without markup. Guardrails billed as Workers AI inference"
    License: "Proprietary"
  portkey-ai-gateway:
    What it is: "Open-source gateway (npx @portkey-ai/gateway) plus a hosted platform with logs, guardrails and prompt management. Palo Alto Networks completed its acquisition of Portkey and is integrating it as Prisma AIRS AI Gateway"
    Run it where: "Self-host (Node; local on :8787 with a console), Portkey-hosted SaaS, or enterprise private-cloud/VPC deployments"
    API: "OpenAI-compatible client; provider chosen per request or through configs"
    Routing and fallback: "Configs: retries, fallbacks, load balancing, conditional routing, timeouts (all in the open-source gateway)"
    Caching: "Simple caching on the hosted Developer plan; simple and semantic caching on Production"
    Spend and access controls: "Virtual keys with budgeting; RBAC and service-account keys on Production; granular budgets, rate limits and SSO on Enterprise; guardrails"
    MCP tools: "Yes: Portkey MCP Gateway for central auth, per-server/per-tool access, identity forwarding and tool-call logs"
    Pricing (2026-10-25): "Open source free. Developer free (10k recorded logs/month, 3-day log retention). Production $49/month (100k logs, +$9 per extra 100k up to 3M). Enterprise custom"
    License: "MIT (open-source gateway)"
  litellm-mcp-gateway:
    What it is: "LiteLLM AI Gateway (the LiteLLM Proxy): self-hosted server with one OpenAI-compatible endpoint for 100+ providers, MCP tools and A2A agents. Listed here as LiteLLM MCP Gateway"
    Run it where: "Self-hosted only: Docker, Helm or Terraform with a Postgres database; Admin UI at /ui"
    API: "OpenAI format for every provider; existing OpenAI clients work by changing base URL and key"
    Routing and fallback: "Load balancing, fallbacks and retries across deployments"
    Caching: "Redis/Valkey, semantic, and S3/GCS caches"
    Spend and access controls: "Virtual keys per user, team or project, each with models, budgets and rate limits; spend tracking by key, team, user and tag; guardrails; SSO for the Admin UI"
    MCP tools: "Yes: MCP Gateway on the same keys and spend records (HTTP, SSE and stdio servers; REST tool API)"
    Pricing (2026-10-25): "Free to self-host; you pay providers directly and run the infrastructure. Enterprise features are under a separate license"
    License: "MIT, except the enterprise/ directory"
verdict: "Want hundreds of models on one key with no infrastructure? OpenRouter or Vercel AI Gateway. Both charge provider list prices: OpenRouter takes a fee when you buy credits, and Vercel charges for add-ons. Already on Cloudflare and mostly need caching, rate limits and logs in front of your own provider keys? Cloudflare AI Gateway's core features are free. Need to self-host with per-team virtual keys and budgets, and want MCP tools governed by the same keys? LiteLLM, or Portkey's open-source gateway with its hosted or enterprise tiers."
sources:
  - {title: OpenRouter pricing and FAQ, url: "https://openrouter.ai/pricing", accessed: 2026-10-25}
  - {title: "OpenRouter docs: Model Fallbacks", url: "https://openrouter.ai/docs/guides/routing/model-fallbacks", accessed: 2026-10-25}
  - {title: "Vercel AI Gateway docs", url: "https://vercel.com/docs/ai-gateway", accessed: 2026-10-25}
  - {title: "Vercel AI Gateway pricing", url: "https://vercel.com/docs/ai-gateway/pricing", accessed: 2026-10-25}
  - {title: "Vercel AI Gateway: Models and Providers", url: "https://vercel.com/docs/ai-gateway/models-and-providers", accessed: 2026-10-25}
  - {title: "Cloudflare AI Gateway docs", url: "https://developers.cloudflare.com/ai-gateway/", accessed: 2026-10-25}
  - {title: "Cloudflare AI Gateway pricing", url: "https://developers.cloudflare.com/ai-gateway/reference/pricing/", accessed: 2026-10-25}
  - {title: "Cloudflare AI Gateway: Unified API (OpenAI compat)", url: "https://developers.cloudflare.com/ai-gateway/usage/chat-completion/", accessed: 2026-10-25}
  - {title: "Cloudflare AI Gateway: Request retry and fallback (dynamic routing)", url: "https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/", accessed: 2026-10-25}
  - {title: "Portkey AI Gateway README", url: "https://github.com/Portkey-AI/gateway", accessed: 2026-10-25}
  - {title: Portkey pricing, url: "https://portkey.ai/pricing", accessed: 2026-10-25}
  - {title: "Portkey docs: MCP Gateway", url: "https://portkey.ai/docs/product/mcp-gateway", accessed: 2026-10-25}
  - {title: "Palo Alto Networks: Completes Acquisition of Portkey (blog, 2026-05-29)", url: "https://www.paloaltonetworks.com/blog/ai-security/securing-and-governing-ai-agents-at-scale-through-a-unified-ai-gateway/", accessed: 2026-10-25}
  - {title: "LiteLLM docs: LiteLLM AI Gateway", url: "https://docs.litellm.ai/docs/simple_proxy", accessed: 2026-10-25}
  - {title: "LiteLLM docs: Caching", url: "https://docs.litellm.ai/docs/proxy/caching", accessed: 2026-10-25}
  - {title: "LiteLLM docs: MCP Gateway", url: "https://docs.litellm.ai/docs/mcp", accessed: 2026-10-25}
  - {title: "LiteLLM LICENSE", url: "https://raw.githubusercontent.com/BerriAI/litellm/main/LICENSE", accessed: 2026-10-25}
  - {title: "LiteLLM releases", url: "https://github.com/BerriAI/litellm/releases", accessed: 2026-10-25}
last_verified: 2026-10-25
published: 2026-10-25
---

An LLM gateway sits between your agents and the model providers. Your code talks to one endpoint, and the gateway handles keys, routing, retries, caching, logging and spend limits. For agents that loop dozens of times per task, it is where you stop runaway costs and survive a provider outage without code changes.

This page is about **model traffic**. To put one controlled endpoint in front of many *MCP tool servers*, see [MCP gateways compared](comparison:mcp-gateways). Two of the gateways here (Portkey and LiteLLM) now do both.

## Three kinds of gateway

```mermaid
flowchart LR
  A((agent)) --> M[Hosted marketplace<br/>OpenRouter, Vercel]
  M -- their accounts or your BYOK --> P1[(providers)]
  A --> C[Proxy in front of your keys<br/>Cloudflare AI Gateway]
  C -- your keys or Unified Billing --> P2[(providers)]
  A --> S[Self-hosted gateway<br/>LiteLLM, Portkey OSS]
  S -- your keys --> P3[(providers)]
```

- **Hosted marketplaces** ([OpenRouter](entry:openrouter), [Vercel AI Gateway](entry:vercel-ai-gateway)) sell you tokens from many providers on one bill. Both say they charge provider list prices with no markup per token. OpenRouter charges a fee when you buy credits (5.5% or 8%). Vercel charges for optional add-ons. Both also accept your own provider keys (BYOK).
- **Cloudflare AI Gateway** ([entry](entry:cloudflare-ai-gateway)) is mainly a proxy for the provider accounts you already have, with free analytics, caching and rate limiting. It now also offers Unified Billing (5% fee on credits) if you'd rather not hold provider accounts.
- **Self-hosted gateways** ([LiteLLM](entry:litellm-mcp-gateway), the open-source [Portkey](entry:portkey-ai-gateway) gateway) run in your infrastructure with your keys. You get virtual keys, budgets and logs without sending prompts through a third party, but you run the database and the uptime.

## What matters for agents

**Fallback that doesn't bill you twice.** Agent loops hit rate limits. OpenRouter retries other models from a `models` array and says failed attempts aren't charged. Vercel records every routing attempt in its request logs. Cloudflare, Portkey and LiteLLM all have configurable retries and fallbacks.

**Hard spend caps.** Budgets come in different shapes. Vercel budgets apply per team, project, API key or member, but only to spend on Vercel's own credentials: BYOK spend doesn't count, and a failed BYOK request can fall back to system credentials. LiteLLM and Portkey budgets attach to virtual keys, so you can give each agent or user its own capped key. OpenRouter allows a credit cap per API key. Cloudflare's documented control is rate limiting rather than budgets.

**Caching.** Cloudflare, Portkey and LiteLLM can return cached responses for identical requests, and Portkey (Production) and LiteLLM also offer semantic caching. Be careful with caching for agents: a cached tool-planning step can replay a stale decision. Scope caches to read-only, deterministic calls.

**One key layer for models and tools.** LiteLLM's MCP gateway and Portkey's MCP Gateway put tool calls behind the same keys, logs and access rules as model calls. Want that without adopting either? [Kong AI Gateway](entry:kong-ai-gateway) has an AI MCP Proxy plugin, which needs Kong's AI license. Or bridge stdio servers yourself (see [Bridge stdio and remote MCP servers](guide:bridge-stdio-and-remote-mcp-servers)).

**Observability.** Every gateway here logs requests. For traces of whole agent runs, evals and prompt management, pair it with a tracing tool from [Agent observability platforms](comparison:agent-observability-platforms). [Helicone](entry:helicone), also listed in the directory, combines a gateway with observability.

## Ownership and licensing notes

- **Portkey** was acquired by Palo Alto Networks. The deal closed per a Palo Alto Networks blog post dated 2026-05-29, and Portkey's AI Gateway is being integrated into Prisma AIRS. The open-source gateway repo is still MIT, and its README announces a Gateway 2.0 pre-release that merges Portkey's enterprise gateway into the open-source project.
- **LiteLLM** is MIT except for the `enterprise/` directory. Check which features you rely on before assuming they are free. The latest release on 2026-10-25 was v1.106.3 (published 2026-10-24).
- **OpenRouter, Vercel and Cloudflare** are proprietary hosted services. Their pricing pages are the source of truth and change often.

## Picking models

A gateway only helps if you route to the right model. [OpenRouter Rankings](entry:openrouter-rankings) shows real usage by model, and [models.dev](entry:models-dev) lists model specs and prices across providers. Re-check prices on the gateway's own model list before you set budgets.
