---
id: payment-processor-mcp-servers
type: comparison
title: Payment processor MCP servers compared
summary: The official MCP servers from Stripe, Square, PayPal, Razorpay and Adyen compared on hosting, authentication, what they cover, licence and maturity, so you can wire an agent to the processor you already use.
description: "Five payment processors ship their own MCP servers. They differ in whether they are hosted or local, how they authenticate (OAuth, merchant token or API key) and how much of the processor's API they expose. This page compares them from each vendor's docs and repository as of 2026-10-29."
author: Agentica Author
last_verified: 2026-10-29
published: 2026-10-29
updated: 2026-10-31
tags: [payments, mcp, remote-mcp, checkout, refunds]
entries: [stripe-mcp, square-mcp, paypal-agent-toolkit, razorpay-mcp-server, adyen-mcp, stripe-agents, rfc-9728]
related: [agent-payment-rails, agent-identity-and-mcp-auth]
subjects: [stripe-mcp, square-mcp, paypal-agent-toolkit, razorpay-mcp-server, adyen-mcp]
criteria:
  - Hosting
  - Auth
  - What it covers
  - Licence
  - Maturity
rows:
  stripe-mcp:
    Hosting: "Hosted remote server at https://mcp.stripe.com"
    Auth: OAuth
    What it covers: Stripe API and Stripe documentation
    Licence: "MIT (stripe/ai repo)"
    Maturity: Active, maintained by Stripe
  square-mcp:
    Hosting: "Hosted remote server at https://mcp.squareup.com/mcp"
    Auth: "OAuth with Square permission scopes; publishes RFC 9728 protected-resource metadata"
    What it covers: Square seller data and APIs
    Licence: unknown (hosted service)
    Maturity: Active, maintained by Block
  paypal-agent-toolkit:
    Hosting: "TypeScript toolkit you run yourself, plus documented remote endpoints (mcp.paypal.com/http and /sse; sandbox host available)"
    Auth: "unknown (check PayPal's MCP docs)"
    What it covers: "PayPal APIs such as invoicing, for MCP and for OpenAI Agents SDK, LangChain and Vercel AI SDK"
    Licence: Apache-2.0
    Maturity: Active; our unauthenticated probe of the remote /http endpoint returned 404 on 2026-10-02
  razorpay-mcp-server:
    Hosting: "Hosted remote server at https://mcp.razorpay.com/mcp, or local via Docker (razorpay/mcp) or Go source"
    Auth: "Remote: Basic merchant token (base64 of key ID and secret). Local: key ID and secret"
    What it covers: "Payments, orders, payment links (incl. UPI), refunds, QR codes, settlements, payouts and saved tokens; a few write tools are local-only"
    Licence: MIT
    Maturity: "Active; release v1.2.1 (Sep 2026)"
  adyen-mcp:
    Hosting: "Local only, via npx -y @adyen/mcp against TEST or LIVE"
    Auth: "ADYEN_API_KEY from a dedicated webservice user"
    What it covers: "Checkout sessions, payment links, cancels and refunds; Management API for merchants, terminals, webhooks, users, API credentials"
    Licence: MIT
    Maturity: Alpha
verdict: "Use the server from the processor you already have an account with; none of them replaces the processor. Stripe and Square are the simplest to connect because they are hosted with OAuth. Razorpay is the only one here with both a hosted and a self-run option, and the obvious pick for UPI and Indian merchants. Adyen is local and alpha, but it is the one that reaches point-of-sale terminals. For an agent that pays others per request, look at the protocols in the agent payment protocols comparison instead."
sources:
  - title: Stripe MCP docs
    url: https://docs.stripe.com/mcp
    accessed: 2026-10-16
  - title: stripe/ai repository
    url: https://github.com/stripe/ai
    accessed: 2026-10-16
  - title: Square MCP docs
    url: https://developer.squareup.com/docs/mcp
    accessed: 2026-10-16
  - title: Square MCP protected-resource metadata
    url: https://mcp.squareup.com/.well-known/oauth-protected-resource
    accessed: 2026-10-16
  - title: PayPal MCP server docs
    url: https://developer.paypal.com/ai-tools/mcp-server
    accessed: 2026-10-02
  - title: paypal/agent-toolkit repository
    url: https://github.com/paypal/agent-toolkit
    accessed: 2026-10-02
  - title: razorpay/razorpay-mcp-server repository
    url: https://github.com/razorpay/razorpay-mcp-server
    accessed: 2026-10-29
  - title: Razorpay MCP server docs (LLM-ready Markdown)
    url: https://razorpay.com/docs/build/llm-docs/mcp-server.md
    accessed: 2026-10-31
  - title: Adyen/adyen-mcp repository
    url: https://github.com/Adyen/adyen-mcp
    accessed: 2026-10-29
  - title: Adyen MCP server docs
    url: https://docs.adyen.com/development-resources/mcp-server/
    accessed: 2026-10-29
---

## What these servers are for

A payment processor MCP server lets an agent act on **your own merchant account**: look up payments, create payment links or orders, issue refunds, check settlements. That is different from an agent paying for something itself, which is what [x402](entry:x402) and the other protocols in the [agent payment protocols comparison](comparison:agent-payment-rails) handle.

## Hosted with OAuth: Stripe and Square

[Stripe](entry:stripe-mcp) and [Square](entry:square-mcp) run remote servers you add by URL, and the user signs in with OAuth, so no long-lived secret sits in the agent's config. Square also publishes [RFC 9728](entry:rfc-9728) protected-resource metadata, so a compliant client can discover which scopes it needs. If you want a broader Stripe integration in agent frameworks, see the [Stripe agent toolkit](entry:stripe-agents).

## Hosted or local: Razorpay

The [Razorpay MCP Server](entry:razorpay-mcp-server) has the widest documented tool list here: payments (including capture and OTP flows), orders, standard and UPI payment links, refunds, QR codes, settlements, instant settlements, payouts and saved-payment tokens. The hosted server at `mcp.razorpay.com/mcp` takes a Basic merchant token, which is a base64 of your key ID and secret, so treat it like the secret itself. Some write tools, such as `create_refund`, `close_qr_code` and `create_instant_settlement`, are marked as not available on the remote server, so run it locally (Docker or Go) if you need them.

## Local and alpha: Adyen

The [Adyen MCP Server](entry:adyen-mcp) runs only on your machine through `npx` and is labelled alpha. Besides Checkout (sessions, payment links, cancels, refunds) it exposes a large slice of the Management API, including point-of-sale terminals, terminal settings and webhooks. Adyen's advice is sound for all five servers: create a dedicated API user, give it only the roles for the tools you enable, and limit the tool set with `--tools=`.

## PayPal

The [PayPal Agent Toolkit](entry:paypal-agent-toolkit) is a TypeScript library that exposes PayPal APIs such as invoicing to several agent frameworks and to MCP. PayPal's docs also list hosted endpoints; when we last probed the HTTP endpoint without credentials (2026-10-02) it returned 404, so check the current docs before relying on it.

## Safety checklist

- Start in test or sandbox mode; Adyen (`--env=TEST`) and PayPal (sandbox host) make this explicit.
- Expose read tools first and add refunds or payouts only when you need them; these move real money.
- Keep a human approval step for refunds, payouts and anything that charges a customer.
- Don't run unknown community MCP servers in the same client session as a payments server, since a prompt injection in one tool's output can trigger another server's tools.
