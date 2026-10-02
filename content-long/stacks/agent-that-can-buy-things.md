---
id: agent-that-can-buy-things
type: stack
title: Agent that can buy things
summary: The pieces for an agent that pays for APIs per call with x402 stablecoins and buys from merchants with controlled virtual cards, with spend limits, proof of user intent and a full audit trail.
description: "Two payment paths cover most of what an agent needs to buy. Machine payments (x402) handle per-request charges for APIs and MCP tools from a dedicated stablecoin wallet. Card payments handle merchants, through agent-checkout protocols where they exist and a browser where they don't, using single-use or per-agent virtual cards. This stack lists a component for each job and the guardrails to put around it."
author: Agentica Author
use_case: Let an agent pay for metered APIs and tools on its own and complete merchant purchases for a user, within budgets you set and with a record of who authorized what.
components:
  - role: Agent harness
    entry: claude-agent-sdk
    why: "Runs the agent loop with tools, skills and MCP in your own app, so payment tools sit behind code you control rather than prompts. Any harness with tool calling works."
  - role: Machine payment protocol
    entry: x402
    why: "Pay per request for HTTP APIs and MCP tools: the server answers 402 with a price, the agent signs a stablecoin payment and retries. SDKs default to USD stablecoins and a $1 cap per payment."
  - role: Agent wallet
    entry: coinbase-agentic-wallet
    why: "A wallet built for agents, as the awal CLI with skills or as an MCP server (npx @coinbase/payments-mcp), that pays x402 services with guardrails such as a per-call maximum amount."
  - role: Settlement currency
    entry: usdc
    why: "The stablecoin most x402 services price in. Fund the agent's wallet with only what it may spend, and test on Base Sepolia with faucet USDC first."
  - role: Service discovery
    entry: x402-bazaar
    why: "A public index of x402-payable endpoints with prices and schemas, so the agent can find a paid API without a human signing up for keys."
  - role: Card credentials
    entry: stripe-issuing-for-agents
    why: "Single-use or per-agent virtual cards with spend limits, merchant-category controls and real-time authorization webhooks, usable for programmatic checkout (MPP, UCP, Shared Payment Tokens) or in a browser."
  - role: Merchant checkout protocol
    entry: agentic-commerce-protocol
    why: "OpenAI and Stripe's open checkout standard (beta); lets an agent complete a purchase through a merchant's agent-ready checkout with a delegated payment token."
  - role: Merchant checkout protocol (alternative)
    entry: universal-commerce-protocol
    why: "Capability-based commerce standard over REST, MCP or A2A, covering checkout, identity linking and orders, with support for AP2 mandates."
  - role: Proof of user intent
    entry: agent-payments-protocol
    why: "Signed Checkout and Payment Mandates record what the user authorized, either a specific purchase or constraints like a budget, giving merchants and you an audit trail."
  - role: Browser for non-agent checkouts
    entry: browserbase
    why: "A hosted browser for merchants without an agent-checkout API, kept apart from your own machine and sessions."
  - role: Tracing
    entry: langfuse
    why: "Records every tool call and payment decision so you can reconcile spend against what the agent did and why."
tags: [payments, agent-commerce, x402, stablecoins, cards, guardrails]
entries: [claude-agent-sdk, x402, coinbase-agentic-wallet, usdc, x402-bazaar, cdp-x402, stripe-issuing-for-agents, agentic-commerce-protocol, universal-commerce-protocol, agent-payments-protocol, stripe-agentic-commerce, machine-payments-protocol, browserbase, langfuse]
sources:
  - title: x402 Protocol Specification v2
    url: https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md
    accessed: 2026-10-02
  - title: x402 docs, Quickstart for Buyers
    url: https://docs.x402.org/getting-started/quickstart-for-buyers
    accessed: 2026-10-02
  - title: Coinbase CDP, Agentic Wallet overview
    url: https://docs.cdp.coinbase.com/agentic-wallet/welcome
    accessed: 2026-10-02
  - title: x402 docs, Bazaar (Discovery Layer)
    url: https://docs.x402.org/extensions/bazaar
    accessed: 2026-10-02
  - title: Stripe docs, Issuing for agents
    url: https://docs.stripe.com/issuing/agents
    accessed: 2026-10-02
  - title: Agentic Commerce Protocol repository
    url: https://github.com/agentic-commerce-protocol/agentic-commerce-protocol
    accessed: 2026-10-02
  - title: Universal Commerce Protocol repository
    url: https://github.com/Universal-Commerce-Protocol/ucp
    accessed: 2026-10-02
  - title: AP2 documentation
    url: https://ap2-protocol.org/
    accessed: 2026-10-02
related: [pay-for-an-api-with-x402, pay-with-x402, agent-payment-rails, run-untrusted-code-in-a-sandbox]
last_verified: 2026-10-02
published: 2026-10-02
---

## Two ways an agent pays

**Per call, in stablecoins.** For APIs and MCP tools that charge per request, the agent holds a small [USDC](entry:usdc) balance in an [agent wallet](entry:coinbase-agentic-wallet) and pays with [x402](entry:x402): request, get 402 with a price, sign, retry. There are no accounts or API keys to create, and each payment is capped. The [x402 guide](guide:pay-for-an-api-with-x402) walks through it, and the [pay-with-x402 skill](skill:pay-with-x402) teaches a coding agent to do it safely.

**At a merchant, by card.** For physical goods, subscriptions and anything sold through a normal checkout, the agent uses a card you control: a single-use or per-agent virtual card from [Stripe Issuing for agents](entry:stripe-issuing-for-agents). Where the merchant supports an agent-checkout protocol ([ACP](entry:agentic-commerce-protocol) or [UCP](entry:universal-commerce-protocol)), the card travels as a delegated token and the agent never sees the number. Where it doesn't, the agent fills in the checkout in a hosted browser ([Browserbase](entry:browserbase)).

The [agent payment protocols comparison](comparison:agent-payment-rails) explains how these protocols relate, including [MPP](entry:machine-payments-protocol), which can serve both stablecoin and card payments on one endpoint.

## Guardrails to set before the first purchase

- **Separate money.** Give the agent its own wallet and its own cards. Fund the wallet with only what it may spend; never connect it to a treasury or a personal wallet.
- **Caps at every layer.** x402 SDKs default to a $1 maximum per payment; keep a low cap and add a daily budget in your own tool code. On cards, use single-use cards per task, per-agent spend limits and merchant-category restrictions, and decline anything unexpected in Stripe's real-time authorization webhook.
- **Human approval above a threshold.** Let the agent pay small metered charges on its own, and require a person to confirm purchases above an amount you choose. AP2 mandates are a standard way to record that confirmation, or the user's standing constraints for unattended purchases.
- **Treat inputs as hostile.** Product pages, emails and API responses can carry prompt injections that try to trigger a purchase. Keep payment tools out of agents that browse untrusted content without a confirmation step, and check the recipient and amount in code, not in the prompt.
- **Test first.** Use Base Sepolia and faucet USDC for x402, and Stripe test mode for cards, until the traces show the agent behaving as intended.
- **Reconcile.** Trace every payment tool call with [Langfuse](entry:langfuse) and match it against wallet transactions and card authorizations.
