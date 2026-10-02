---
id: agent-payment-rails
type: comparison
title: Agent payment protocols compared
summary: x402, MPP, L402, ACP, AP2 and UCP compared on what each standardizes, payment rails, wire format, governance, spec status and SDKs, so you can tell machine-payment protocols from agent-checkout protocols.
description: "Six open protocols get called 'agent payments', but they solve two different problems. x402, MPP and L402 put a price on an HTTP request or tool call so software can pay per use. ACP, UCP and AP2 let an agent check out with a merchant on a user's behalf, carrying cards and proof of the user's intent. This page compares them from their specifications and official sites as of 2026-10-02."
author: Agentica Author
tags: [payments, agent-commerce, x402, http-402, protocols, stablecoins]
entries: [x402, x402-bazaar, machine-payments-protocol, l402, agentic-commerce-protocol, agent-payments-protocol, universal-commerce-protocol, cdp-x402, stripe-agentic-commerce, stripe-issuing-for-agents, visa-intelligent-commerce, mastercard-agent-suite, coinbase-agentic-wallet]
subjects: [x402, machine-payments-protocol, l402, agentic-commerce-protocol, universal-commerce-protocol, agent-payments-protocol]
criteria:
  - What it standardizes
  - Payment rails
  - Wire format
  - Governance
  - Spec status
  - SDKs and reference code
rows:
  x402:
    What it standardizes: Paying for an HTTP resource or MCP tool call in the same request (machine payments)
    Payment rails: "Stablecoins and tokens on EVM chains and Solana, identified by CAIP-2 network IDs; schemes exact, upto, batch-settlement and auth-capture"
    Wire format: "HTTP 402 with PAYMENT-REQUIRED, PAYMENT-SIGNATURE and PAYMENT-RESPONSE headers (v1 used X-PAYMENT); MCP via _meta x402/payment"
    Governance: x402 Foundation under the Linux Foundation (operational launch July 2026); repo x402-foundation/x402
    Spec status: "v2 (spec dated 2025-12-09)"
    SDKs and reference code: "Official TypeScript, Python and Go SDKs; hosted facilitators such as Coinbase CDP"
  machine-payments-protocol:
    What it standardizes: Paying for an HTTP resource, tool call or stream in the same request (machine payments), with one-time, session and subscription intents
    Payment rails: "Method-neutral: Tempo stablecoins, Stripe and card methods, EVM, Lightning, Solana, Stellar, XRPL and others, each specified by its rail"
    Wire format: "HTTP 402 with a WWW-Authenticate: Payment challenge, a payment Credential on retry and a Payment-Receipt; also JSON-RPC/MCP and WebSocket transports"
    Governance: Co-authored by Tempo and Stripe; core submitted to the IETF as the Payment HTTP Authentication Scheme; payment methods owned by each rail
    Spec status: IETF Internet-Draft (draft-httpauth-payment); docs at mpp.dev
    SDKs and reference code: "Official TypeScript (mppx), Python, Rust, Go and Ruby SDKs"
  l402:
    What it standardizes: Paying for and authenticating to an API with a Lightning payment (machine payments)
    Payment rails: Bitcoin over the Lightning Network
    Wire format: "HTTP 402 with WWW-Authenticate carrying a macaroon and a Lightning invoice; the client presents the macaroon with the payment preimage"
    Governance: Lightning Labs
    Spec status: Published by Lightning Labs; implemented by the Aperture proxy
    SDKs and reference code: Aperture reverse proxy (MIT)
  agentic-commerce-protocol:
    What it standardizes: "Checkout between a buyer's AI agent and a merchant: carts, checkout sessions, fulfillment, orders, delegated payment tokens"
    Payment rails: "Cards and other methods through the merchant's PSP; Stripe Shared Payment Token was the first compatible PSP token"
    Wire format: REST (OpenAPI and JSON Schema) or MCP
    Governance: Maintained by OpenAI and Stripe; Apache-2.0; CLA required
    Spec status: "Beta; latest stable 2026-04-17 (cart, feed, orders, authentication, MCP)"
    SDKs and reference code: "OpenAPI and JSON Schema per version, RFCs and examples; ChatGPT was the first agent platform"
  universal-commerce-protocol:
    What it standardizes: "Commerce capabilities a business declares for agents and apps: checkout, identity linking (OAuth 2.0), orders, payment token exchange, plus extensions"
    Payment rails: Payment-method neutral; PSPs and credential providers exchange tokens; supports AP2 mandates
    Wire format: "Transport-agnostic: REST, MCP or A2A, with a discoverable business profile"
    Governance: "Open source (Apache-2.0, 'UCP Authors'), with retail, travel and platform companies shown on ucp.dev"
    Spec status: Dated stable releases; latest 2026-08-25
    SDKs and reference code: "SDKs, samples and conformance tests in the Universal-Commerce-Protocol GitHub org"
  agent-payments-protocol:
    What it standardizes: "Proof that a user authorized an agent's purchase: signed Checkout and Payment Mandates (verifiable digital credentials), human-present or not"
    Payment rails: "Cards first; roadmap adds e-wallets, real-time bank transfers and digital currencies; x402 samples exist"
    Wire format: Extension for A2A and UCP (also positioned for MCP)
    Governance: Created by Google; donated to the FIDO Alliance, where standardization continues in its working groups
    Spec status: v0.2
    SDKs and reference code: "Python SDK; Python, Go and Android samples (Apache-2.0)"
verdict: "If your agent needs to pay per API call or tool call, choose between x402 and MPP: x402 has the larger live ecosystem and Linux Foundation governance, MPP is method-neutral (cards and many chains) and on the IETF track, and MPP documents serving x402 clients from the same endpoint. Use L402 only if you want Bitcoin Lightning. If your agent buys from merchants on a user's behalf, you will meet ACP (ChatGPT, Stripe) and UCP (retail, travel and platform participants), with AP2 mandates as the evidence layer for user intent."
sources:
  - title: x402 Protocol Specification v2
    url: https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md
    accessed: 2026-10-02
  - title: x402 HTTP transport v2
    url: https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/http.md
    accessed: 2026-10-02
  - title: x402.org
    url: https://www.x402.org/
    accessed: 2026-10-02
  - title: MPP, What is MPP?
    url: https://mpp.dev/overview
    accessed: 2026-10-02
  - title: MPP, Governance
    url: https://mpp.dev/governance
    accessed: 2026-10-02
  - title: MPP, HTTP 402
    url: https://mpp.dev/protocol/http-402
    accessed: 2026-10-02
  - title: MPP, Payment methods
    url: https://mpp.dev/payment-methods
    accessed: 2026-10-02
  - title: IETF draft, The Payment HTTP Authentication Scheme
    url: https://datatracker.ietf.org/doc/draft-httpauth-payment/
    accessed: 2026-10-02
  - title: Lightning Labs docs, L402
    url: https://docs.lightning.engineering/the-lightning-network/l402
    accessed: 2026-10-02
  - title: lightninglabs/aperture
    url: https://github.com/lightninglabs/aperture
    accessed: 2026-10-02
  - title: Agentic Commerce Protocol repository
    url: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
    accessed: 2026-10-02
  - title: agenticcommerce.dev
    url: https://www.agenticcommerce.dev/
    accessed: 2026-10-02
  - title: Universal Commerce Protocol repository
    url: https://github.com/Universal-Commerce-Protocol/ucp
    accessed: 2026-10-02
  - title: ucp.dev documentation index
    url: https://ucp.dev/llms.txt
    accessed: 2026-10-02
  - title: AP2 documentation
    url: https://ap2-protocol.org/
    accessed: 2026-10-02
  - title: AP2 repository
    url: https://github.com/google-agentic-commerce/AP2
    accessed: 2026-10-02
related: [pay-for-an-api-with-x402, pay-with-x402, agent-that-can-buy-things]
last_verified: 2026-10-02
published: 2026-10-02
---

## Two problems, six protocols

"Agent payments" covers two different jobs, and most confusion comes from mixing them up.

**Machine payments** put a price on a request. An agent calls an API or an MCP tool, gets HTTP 402 Payment Required with a price, pays, and retries. There is no merchant checkout, no cart and often no human in the loop; amounts are often fractions of a cent. [x402](entry:x402), the [Machine Payments Protocol](entry:machine-payments-protocol) (MPP) and [L402](entry:l402) live here.

**Agent checkout** lets an agent buy from a merchant for a person: products, carts, shipping, taxes, card networks, refunds, and evidence that the person really authorized it. The [Agentic Commerce Protocol](entry:agentic-commerce-protocol) (ACP), the [Universal Commerce Protocol](entry:universal-commerce-protocol) (UCP) and the [Agent Payments Protocol](entry:agent-payments-protocol) (AP2) live here. They are complementary more than competing: ACP and UCP describe the checkout conversation, and AP2 describes signed mandates that prove intent, which UCP explicitly supports.

## Machine payments: x402, MPP and L402

All three reuse HTTP 402, and the flows look alike: challenge, pay, retry with proof, receive the resource and a receipt. The differences are in rails and governance.

- **x402** carries its payment terms and proofs in its own headers (`PAYMENT-REQUIRED`, `PAYMENT-SIGNATURE`, `PAYMENT-RESPONSE`) and settles in stablecoins on EVM chains and Solana, usually through a facilitator such as [Coinbase CDP](entry:cdp-x402). Since July 2026 it has been governed by the x402 Foundation under the Linux Foundation. x402.org showed about 75 million transactions in the last 30 days when checked. The [x402 guide](guide:pay-for-an-api-with-x402) walks through a full payment.
- **MPP** frames payment as an HTTP authentication scheme (`WWW-Authenticate: Payment`, then a Credential, then a `Payment-Receipt`) and submits that core to the IETF. It leaves the rails to "payment methods" owned by each rail, so one endpoint can accept Tempo stablecoins, cards through Stripe, Lightning and several chains. It adds session and subscription intents for metered and recurring billing. MPP's docs include a guide to serving x402 clients from the same endpoint, so choosing MPP on the server doesn't lock out x402 buyers.
- **L402** binds a macaroon (a bearer token with caveats) to a Lightning invoice; paying the invoice reveals the preimage that makes the token valid, so the server verifies payment without a database lookup. It is the oldest of the three and the natural choice if you already run Lightning.

For an agent builder the practical questions are which services you want to call and what they accept (the [x402 Bazaar](entry:x402-bazaar) is a public discovery index for x402 services), which wallet the agent holds, and whether you need card or fiat rails (MPP's card and Stripe methods).

## Agent checkout: ACP, UCP and AP2

- **ACP** is maintained by OpenAI and Stripe and is still marked beta, with dated releases (the latest stable is 2026-04-17, which added carts, product feeds, orders, authentication and MCP). The merchant stays merchant of record and can accept or decline per agent. Payment credentials travel as delegated tokens; Stripe's Shared Payment Token was the first. ChatGPT was the first agent platform to implement it.
- **UCP** breaks commerce into capabilities a business declares in a discoverable profile: checkout, identity linking over OAuth 2.0, orders and payment token exchange, with extensions such as discounts, fulfillment and loyalty. It is transport-agnostic (REST, MCP or A2A) and ships conformance tests. Its latest stable release is dated 2026-08-25.
- **AP2** doesn't run the checkout; it proves authority. A Checkout Mandate captures what is being bought and a Payment Mandate authorizes a specific instrument, each in an "open" form (constraints for autonomous buying, like a budget) or a "closed" form (a specific, final purchase). The mandates are signed verifiable digital credentials, chained into an audit trail. **Recent change:** AP2 v0.2 (released 2026-04-28) focuses on human-not-present flows, and Google donated AP2 to the FIDO Alliance, where standardization continues.

## Recent changes worth knowing

- x402's canonical repository moved to `x402-foundation/x402`; `coinbase/x402` is now a development fork.
- x402 v2 renamed its headers; older v1 code that sends `X-PAYMENT` needs the migration guide.
- AP2's documentation now describes Checkout and Payment Mandates, each with open and closed stages. The v0.1 material (September 2025) described Intent, Cart and Payment Mandates, so older tutorials use different names.
- ACP moved from a single spec to dated versions with capability negotiation, extensions and an MCP binding.

## Where card networks and Stripe fit

Card networks and processors run their own agent programs on top of or beside these protocols, including [Visa Intelligent Commerce](entry:visa-intelligent-commerce), the [Mastercard Agent Suite](entry:mastercard-agent-suite), [Stripe's agentic commerce tools](entry:stripe-agentic-commerce) and [Stripe Issuing for agents](entry:stripe-issuing-for-agents). Their exact terms weren't compared here; check each entry's sources. To assemble these pieces into a working agent, see the [agent that can buy things stack](stack:agent-that-can-buy-things).
