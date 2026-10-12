---
id: cloud-browsers-for-agents
type: comparison
title: Cloud browsers for AI agents
summary: Browserbase, Steel, Browserless, Hyperbrowser, Kernel and Anchor Browser compared on how agents connect, MCP servers, pricing, free allowances, login persistence, recordings, self-hosting and whether an agent can get access without a human signing up.
description: "A primary-source comparison of six hosted browser services that agents drive over CDP with Playwright or Puppeteer, or through MCP. Prices and limits are list prices from each vendor's pricing page or docs on 2026-10-12. Units differ (browser hours, 30-second units, per-second rates, credits), so estimate with your own session lengths before choosing on price."
author: Agentica Author
tags: [browser-automation, headless-browser, cloud, mcp, web-agents]
entries: [browserbase, steel, browserless, hyperbrowser, kernel, anchor-browser, stagehand, browser-use, playwright, playwright-mcp, playwright-cli, agent-browser, lightpanda, skyvern, machine-payments-protocol, web-bot-auth]
related: [code-sandboxes, agent-payment-rails, research-agent, connect-an-agent-to-a-remote-mcp-server]
subjects: [browserbase, steel, browserless, hyperbrowser, kernel, anchor-browser]
criteria:
  - How agents connect
  - Official MCP server
  - Browser price
  - Free allowance
  - Login persistence
  - Recordings
  - Open source or self-host
  - Agent access without a human sign-up
rows:
  browserbase:
    How agents connect: "CDP with Playwright, Puppeteer or Selenium; Stagehand SDK (MIT, by Browserbase)"
    Official MCP server: "Hosted Streamable HTTP at mcp.browserbase.com/mcp (API key in the URL), or local stdio via npx @browserbasehq/mcp. Built on Stagehand. The old mcp-server-browserbase repo is archived"
    Browser price: "Developer $20/mo with 100 browser hours, then $0.12/h; Startup $99/mo with 500 h, then $0.10/h. Billed per minute"
    Free allowance: "Free plan: 1 browser hour, 3 concurrent sessions, 15-minute sessions, no proxies or CAPTCHA solving"
    Login persistence: Contexts reuse cookies, auth and app data across sessions
    Recordings: "Session replay (HLS) and MP4 recording downloads; Live View"
    Open source or self-host: "Platform is closed; Stagehand is open source (MIT)"
    Agent access without a human sign-up: "Not documented; API key from the dashboard"
  steel:
    How agents connect: "CDP over WebSocket (wss://connect.steel.dev) with Puppeteer or Playwright; steel-sdk for Node.js and Python; REST API"
    Official MCP server: "steel-mcp-server (MIT): local stdio via npx, a Streamable HTTP build you host yourself, or pointed at self-hosted steel-browser"
    Browser price: "Launch: $0.10/h with no base fee; Scale $250/mo + $0.08/h with $100 monthly credit. Billed per minute"
    Free allowance: "Launch plan: $30 one-time credit valid 90 days (about 300 browser hours), 10 concurrent sessions, 15-minute sessions. CAPTCHA solving and Steel proxies need a $10 deposit"
    Login persistence: "Profiles API (cookies, auth, extensions, credentials); Credentials API on cloud"
    Recordings: Session replays of past sessions; Agent Traces
    Open source or self-host: "steel-browser is open source (Apache-2.0) and runs in Docker; self-hosted Steel runs 1 concurrent session and has no CAPTCHA solving"
    Agent access without a human sign-up: "Not documented; API key from the dashboard"
  browserless:
    How agents connect: "CDP WebSocket for Puppeteer and Playwright connectOverCDP, native Playwright endpoint, BrowserQL (GraphQL), REST APIs and the BAP SDK (TypeScript, Python)"
    Official MCP server: "Hosted at mcp.browserless.io/mcp with OAuth, a Bearer token or a token query parameter"
    Browser price: "Unit-based: 1 unit = up to 30 s of browser time. Prototyping $25/mo (annual) with 20k units, then $0.0020/unit; higher plans to $350/mo"
    Free allowance: "Free plan: 1k units/month, 2 concurrent browsers, 2-minute sessions, 1-day session and replay storage"
    Login persistence: Persisted sessions and saved logged-in browser profiles
    Recordings: "Session replays; screen recording from the Prototyping plan up"
    Open source or self-host: "Source-available under SSPL-1.0 or a commercial license; Docker image. Closed-source commercial or CI use needs the commercial license"
    Agent access without a human sign-up: "Not documented; API token from the dashboard"
  hyperbrowser:
    How agents connect: "CDP with Playwright, Puppeteer or Selenium; official SDKs; HyperAgent framework"
    Official MCP server: "hyperbrowser-mcp (MIT), local stdio via npx with HYPERBROWSER_API_KEY"
    Browser price: "Credits at $0.001 each: browser usage 100 credits/h ($0.10/h), proxy data $10/GB"
    Free allowance: Not stated in the docs used
    Login persistence: Profiles persist browser state across sessions
    Recordings: "rrweb web recording (on by default) and MP4 video recordings"
    Open source or self-host: "Platform is closed; MCP server is open source (MIT)"
    Agent access without a human sign-up: "Not documented; API key from the dashboard"
  kernel:
    How agents connect: "CDP (Playwright, Puppeteer), plus Playwright code executed in the browser's own VM via API"
    Official MCP server: "Hosted Streamable HTTP at mcp.onkernel.com/mcp with OAuth 2.1 (dynamic client registration) or an API key; open-source server code (MIT)"
    Browser price: "Per second: headless about $0.06/h, headful about $0.48/h. Idle browsers go to standby and stop billing. Hobbyist $30/mo, Start-Up $200/mo"
    Free allowance: "Developer plan: free with $5 usage credit per month, 5 concurrent browsers, 1-day replay retention, no configurable proxies"
    Login persistence: "Profiles save and reuse browser state; Managed Auth handles logins and re-authentication (3 connections on the free plan)"
    Recordings: Replays recorded as MP4 via the replays API; live view
    Open source or self-host: "Browser images are open source (kernel-images, Apache-2.0) and run in Docker or on Unikraft unikernels; the managed platform is not"
    Agent access without a human sign-up: "Yes: buy one stealth headful browser for 30 minutes for $0.50 over the Machine Payments Protocol (HTTP 402, paid with Link), with no account or API key"
  anchor-browser:
    How agents connect: "CDP with Playwright or Puppeteer, REST, and natural-language web tasks"
    Official MCP server: "Hosted at api.anchorbrowser.io/v1/mcp (plus /v1/mcp/browser for step-by-step control); sign in or send an API key header. A self-hostable open-source MCP server also exists"
    Browser price: "Credit-based plans: Starter $50/mo with 50 credits, Team $500/mo, then $1.00 per extra credit"
    Free allowance: "Free plan: 5 credits/month, up to 5 concurrent browsers, up to 500 browser sessions"
    Login persistence: "Browser profiles, or managed authentication (applications and identities, including MFA) that re-runs the login before each session"
    Recordings: Session recording on by default; live view
    Open source or self-host: "Platform is closed; bring-your-own-cloud and on-premises on Enterprise"
    Agent access without a human sign-up: "Yes: Agent Access issues an API key after the agent solves a short puzzle (1 credit anonymous, 5 credits with a verified-email OIDC token)"
verdict: "Kernel (pay per browser over MPP, no account) and Anchor (puzzle-based API key) are the only two here that an agent can start without a human creating an account. For self-hosting, Steel's Apache-2.0 steel-browser is the most permissive, but it runs one session at a time; Browserless self-hosting is SSPL or commercial. Browserbase fits teams already on Stagehand. Kernel's per-second billing with free standby suits sessions that idle between steps. Billing units differ, so price your own session lengths."
sources:
  - {title: Browserbase plans, url: "https://docs.browserbase.com/account/billing/plans", accessed: 2026-10-12}
  - {title: Browserbase MCP server, url: "https://docs.browserbase.com/integrations/mcp/introduction", accessed: 2026-10-12}
  - {title: Browserbase MCP server setup, url: "https://docs.browserbase.com/integrations/mcp/setup", accessed: 2026-10-12}
  - {title: Browserbase docs index (llms.txt), url: "https://docs.browserbase.com/llms.txt", accessed: 2026-10-12}
  - {title: browserbase/mcp-server-browserbase (archived), url: "https://github.com/browserbase/mcp-server-browserbase", accessed: 2026-10-12}
  - {title: Stagehand repository, url: "https://github.com/browserbase/stagehand", accessed: 2026-10-12}
  - {title: Steel pricing and limits, url: "https://docs.steel.dev/overview/pricinglimits", accessed: 2026-10-12}
  - {title: Steel Local vs Steel Cloud, url: "https://docs.steel.dev/overview/self-hosting/steel-local-vs-steel-cloud", accessed: 2026-10-12}
  - {title: Steel docs index (llms.txt), url: "https://docs.steel.dev/llms.txt", accessed: 2026-10-12}
  - {title: steel-dev/steel-browser, url: "https://github.com/steel-dev/steel-browser", accessed: 2026-10-12}
  - {title: steel-dev/steel-mcp-server, url: "https://github.com/steel-dev/steel-mcp-server", accessed: 2026-10-12}
  - {title: Browserless pricing, url: "https://www.browserless.io/pricing", accessed: 2026-10-12}
  - {title: Browserless unit consumption, url: "https://docs.browserless.io/overview/unit-consumption", accessed: 2026-10-12}
  - {title: Browserless MCP setup, url: "https://docs.browserless.io/mcp/browserless-mcp-server/setup", accessed: 2026-10-12}
  - {title: Browserless docs index (llms.txt), url: "https://docs.browserless.io/llms.txt", accessed: 2026-10-12}
  - {title: Browserless license, url: "https://github.com/browserless/browserless/blob/main/LICENSE", accessed: 2026-10-12}
  - {title: Hyperbrowser pricing (docs), url: "https://hyperbrowser.ai/docs/pricing", accessed: 2026-10-12}
  - {title: Hyperbrowser MCP, url: "https://hyperbrowser.ai/docs/integrations/model-context-protocol", accessed: 2026-10-12}
  - {title: Hyperbrowser recordings, url: "https://hyperbrowser.ai/docs/sessions/recordings", accessed: 2026-10-12}
  - {title: Hyperbrowser profiles, url: "https://hyperbrowser.ai/docs/sessions/profiles", accessed: 2026-10-12}
  - {title: Kernel pricing, url: "https://kernel.sh/docs/info/pricing", accessed: 2026-10-12}
  - {title: Kernel concurrency and limits, url: "https://kernel.sh/docs/browsers/concurrency-and-limits", accessed: 2026-10-12}
  - {title: Kernel MCP server, url: "https://kernel.sh/docs/reference/mcp-server", accessed: 2026-10-12}
  - {title: Kernel MCP transports, url: "https://kernel.sh/docs/reference/mcp-server/transports", accessed: 2026-10-12}
  - {title: Buy a Kernel browser with MPP, url: "https://kernel.sh/docs/info/mpp", accessed: 2026-10-12}
  - {title: Kernel replays, url: "https://kernel.sh/docs/browsers/replays", accessed: 2026-10-12}
  - {title: kernel/kernel-images, url: "https://github.com/kernel/kernel-images", accessed: 2026-10-12}
  - {title: Anchor pricing, url: "https://anchorbrowser.io/pricing", accessed: 2026-10-12}
  - {title: Anchor Agent Access, url: "https://docs.anchorbrowser.io/quickstart/agent-access", accessed: 2026-10-12}
  - {title: Anchor hosted MCP, url: "https://docs.anchorbrowser.io/advanced/mcp", accessed: 2026-10-12}
  - {title: Anchor session recording, url: "https://docs.anchorbrowser.io/essentials/recording", accessed: 2026-10-12}
  - {title: Anchor managed authentication, url: "https://docs.anchorbrowser.io/essentials/managed-authentication", accessed: 2026-10-12}
last_verified: 2026-10-12
published: 2026-10-12
---

## What this compares

All six services run Chromium in the cloud so your agent doesn't have to manage a browser fleet. The table covers what decides a choice for agent work: how the agent attaches, whether there is an MCP server, what a browser hour costs, what you get free, how logins survive between sessions, whether you can watch a failed run afterwards, and whether you can run it yourself.

Every price and limit comes from the vendor's own pricing page or docs as of 2026-10-12. Vendors bill in different units: Browserbase and Steel in browser hours billed per minute, Browserless in 30-second units, Kernel per second, and Hyperbrowser and Anchor in credits. A one-line hourly comparison would mislead, so work out the cost for your own session lengths.

## Pick by situation

- **The agent has to start without you.** [Kernel](entry:kernel) sells a single browser over the [Machine Payments Protocol](entry:machine-payments-protocol). The agent `POST`s to `https://api.onkernel.com/mpp/browsers`, gets an HTTP `402` offer, pays $0.50 through Stripe's Link CLI for one stealth headful browser for 30 minutes, and gets back a `cdp_ws_url`. No account or API key is involved, but a person still approves the Link payment. [Anchor Browser](entry:anchor-browser)'s Agent Access issues an API key with a small credit allowance to an agent that solves a short puzzle (`GET /v1/agent-access/challenge`, then `POST /v1/agent-access`).
- **You already have Playwright or Puppeteer scripts.** All six accept a CDP connection, so usually only the connect URL changes. Browserless documents it as replacing `launch()` with `connect()` (Puppeteer) or using `connectOverCDP()` (Playwright).
- **You want MCP, not code.** Browserbase, Browserless, Kernel and Anchor run hosted Streamable HTTP endpoints, so there is nothing to install. Steel and Hyperbrowser ship MCP servers you run locally over stdio. For how to wire a remote server into a client, see [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server).
- **You need to self-host.** Steel's `steel-browser` is Apache-2.0 and runs in Docker, but self-hosted Steel runs one session at a time and has no CAPTCHA solving or Credentials API. Browserless self-hosts from Docker under SSPL-1.0, or under a paid commercial license for closed-source or CI use. Kernel open-sources its browser images (`kernel-images`, Apache-2.0), but not the managed platform with pools, profiles and auth.
- **Logins have to persist.** Every service here can reuse cookies and storage across sessions (contexts or profiles). Kernel and Anchor go further with managed authentication that re-runs a login when it expires. Store as little as you can. A saved profile is a live credential.

## Hosted browser or local framework

A cloud browser is infrastructure. You still need something that decides what to click:

- [Playwright](entry:playwright) and [Puppeteer](entry:puppeteer) are deterministic scripting libraries. Every service above accepts their CDP connection.
- [Stagehand](entry:stagehand) (MIT, by Browserbase) and [Browser Use](entry:browser-use) (MIT) add LLM-driven actions and extraction on top of a browser. Both can point at a remote browser.
- [Playwright MCP](entry:playwright-mcp) and [Playwright CLI](entry:playwright-cli) (both Apache-2.0, Microsoft) and Vercel Labs' [agent-browser](entry:agent-browser) (Apache-2.0) give a coding agent a local browser with no cloud account.
- [Skyvern](entry:skyvern) (AGPL-3.0) drives the browser from screenshots. [Lightpanda](entry:lightpanda) (AGPL-3.0) is a headless browser built from scratch rather than a Chromium wrapper.

A local browser is enough for development and for sites that don't block datacenter traffic. Move to a hosted one when you need concurrency, residential proxies, CAPTCHA handling, session recordings, or isolation from the machine your agent runs on. Pages are untrusted input either way. Treat any text a page shows the agent as data, not instructions.

## Notes on the table

- **Free tiers are small on purpose.** Browserbase's free hour, Browserless's 2-minute session cap and Steel's 15-minute Launch sessions are fine for trying an integration, not for running an agent.
- **CAPTCHA solving and proxies are often paid add-ons.** Browserbase has no proxies or CAPTCHA solving on the free plan. Steel requires a $10 deposit on Launch before CAPTCHA solving or Steel proxies work. Kernel's free plan has no configurable proxies.
- **Retention limits debugging.** Replays are kept for 1 day on Kernel's free plan, 1 day of session and replay storage on Browserless Free, and 7 days of data retention on the free plans of Browserbase and Steel. Download a recording you need to keep.
- **Bot identity.** Kernel offers opt-in [Web Bot Auth](entry:web-bot-auth), so sites can verify that its agent traffic is signed rather than guess from fingerprints.

## What we left out

- Hyperbrowser's free allowance and plan prices: its pricing page renders client-side and we could not read the numbers from a primary source. Its docs give the per-credit rates used above.
- Speed and stealth claims ("fastest", "undetectable") and success rates: no vendor publishes a reproducible benchmark we could verify.
- Concurrency limits beyond the free plans, except where the pricing page states them.
