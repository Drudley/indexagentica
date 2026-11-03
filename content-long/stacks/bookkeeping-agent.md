---
id: bookkeeping-agent
type: stack
title: Bookkeeping agent stack
summary: "An agent that reconciles Stripe or Paddle revenue against the books in Xero, reads receipts and statements, and prepares draft entries for an accountant. It runs on read-only credentials, and every write needs a human."
description: "A component list for a bookkeeping or month-end close agent built on the official Xero, Stripe and Paddle MCP servers, the Xero and Paddle ones added to the directory on 2026-11-01. It covers the read-only settings each server really supports (Xero OAuth scopes, Stripe agent-tagged restricted keys and approval rules, Paddle's read-only tool filter and API key permissions), a Claude Agent SDK allowlist that hides every write tool, which Xero writes create drafts and which post at once, and a tested matching snippet for Stripe payouts."
author: Agentica Author
use_case: "Match payouts and invoices from Stripe or Paddle to what is recorded in Xero each month, explain every difference with the IDs behind it, and draft (never post) the fixes, with read-only credentials and a human approving any write."
components:
  - role: Agent harness
    entry: claude-agent-sdk
    why: "Connects the MCP servers and decides which tool calls run. An allowlist plus dontAsk mode lets read tools run without prompts and denies everything else, and a deny rule can hide whole groups of write tools from the model."
  - role: Accounting ledger
    entry: xero-mcp
    why: "Xero's official local server covers invoices, payments, bank transactions, contacts, the chart of accounts and reports. It has no read-only switch, but it requests exactly the OAuth scopes in XERO_SCOPES, so read-only scopes keep it read-only at Xero's end."
  - role: Card payments and invoices
    entry: stripe-mcp
    why: "Stripe's hosted server reads payouts, balance transactions, charges, refunds, invoices and subscriptions through one stripe_api_read tool, with writes in a separate stripe_api_write tool you can deny. Agent-tagged restricted keys are subject to Stripe's approval rules."
  - role: Subscription billing (merchant of record)
    entry: paddle-mcp
    why: "For businesses that sell through Paddle Billing. --tools=read-only loads only read tools, and Paddle API key permissions return 403 for anything the key was not granted."
  - role: Reconciliation sandbox
    entry: e2b
    why: "Runs the matching and totals code on exported data, so the model does not do arithmetic in its head. Turn its internet access off once the data is loaded."
  - role: Receipts and statements
    entry: markitdown
    why: "Turns PDF and Excel statements, receipts and CSV exports into Markdown the agent can read, for documents that are not in any API."
  - role: Tracing
    entry: langfuse
    why: "Keeps every tool call and result, so an accountant can see which Stripe and Xero records each proposed entry came from."
tags: [bookkeeping, accounting, reconciliation, finance, mcp, xero, stripe, paddle, read-only, human-in-the-loop]
entries: [claude-agent-sdk, xero-mcp, xero-remote-mcp, stripe-mcp, paddle-mcp, e2b, markitdown, langfuse, plaid-mcp]
related: [payment-processor-mcp-servers, agent-payment-rails, agent-that-can-buy-things, data-analysis-agent, agent-identity-and-mcp-auth, run-untrusted-code-in-a-sandbox, convert-documents-to-markdown-for-agents, agent-observability-platforms, add-mcp-servers-to-claude-code]
sources:
  - {title: Xero MCP Server README, url: "https://github.com/XeroAPI/xero-mcp-server", accessed: 2026-11-03}
  - {title: "Xero MCP Server, client credentials and scopes (xero-client.ts)", url: "https://github.com/XeroAPI/xero-mcp-server/blob/main/src/clients/xero-client.ts", accessed: 2026-11-03}
  - {title: "Xero MCP Server, create-manual-journal tool", url: "https://github.com/XeroAPI/xero-mcp-server/blob/main/src/tools/create/create-manual-journal.tool.ts", accessed: 2026-11-03}
  - {title: Xero Developer changelog, url: "https://developer.xero.com/changelog", accessed: 2026-11-02}
  - {title: Xero granular scopes FAQ, url: "https://developer.xero.com/faq/granular-scopes", accessed: 2026-11-03}
  - {title: Stripe MCP docs, url: "https://docs.stripe.com/mcp", accessed: 2026-11-03}
  - {title: "Stripe API keys, agent-tagged keys", url: "https://docs.stripe.com/keys#agent-keys", accessed: 2026-11-02}
  - {title: Stripe two-party approvals, url: "https://docs.stripe.com/account/approvals", accessed: 2026-11-02}
  - {title: "Stripe API, list balance transactions", url: "https://docs.stripe.com/api/balance_transactions/list", accessed: 2026-11-02}
  - {title: "Stripe API, the payout object", url: "https://docs.stripe.com/api/payouts/object", accessed: 2026-11-02}
  - {title: Stripe supported currencies, url: "https://docs.stripe.com/currencies", accessed: 2026-11-02}
  - {title: Paddle MCP Server README, url: "https://github.com/PaddleHQ/paddle-mcp-server", accessed: 2026-11-03}
  - {title: "Paddle MCP server, Toolkit source (metrics tools skipped in sandbox)", url: "https://github.com/PaddleHQ/paddle-mcp-server/blob/main/src/toolkit.ts", accessed: 2026-11-03}
  - {title: "Paddle developer docs, Paddle MCP (hosted servers)", url: "https://developer.paddle.com/sdks/ai/paddle-mcp", accessed: 2026-11-03}
  - {title: "Paddle changelog, OAuth for the live Paddle MCP server", url: "https://developer.paddle.com/changelog/2026/paddle-mcp-oauth", accessed: 2026-11-03}
  - {title: Xero Remote MCP FAQs, url: "https://developer.xero.com/faq/remote-mcp", accessed: 2026-11-03}
  - {title: Paddle API key permissions, url: "https://developer.paddle.com/api-reference/about/permissions", accessed: 2026-11-02}
  - {title: "Claude Agent SDK, configure permissions", url: "https://code.claude.com/docs/en/agent-sdk/permissions", accessed: 2026-11-02}
  - {title: "Claude Agent SDK, MCP", url: "https://code.claude.com/docs/en/agent-sdk/mcp", accessed: 2026-11-02}
  - {title: "E2B docs, internet access", url: "https://docs.e2b.dev/network/internet-access", accessed: 2026-11-02}
  - {title: MarkItDown README, url: "https://github.com/microsoft/markitdown", accessed: 2026-11-02}
  - {title: Langfuse README, url: "https://github.com/langfuse/langfuse", accessed: 2026-11-02}
  - {title: Plaid Dashboard MCP docs, url: "https://plaid.com/docs/resources/mcp/", accessed: 2026-11-02}
last_verified: 2026-11-03
published: 2026-11-02
updated: 2026-11-03
---

## How the pieces fit

Month-end bookkeeping is mostly matching. Money arrives through Stripe or Paddle, it lands in the bank, and it should show up in Xero as paid invoices and bank transactions. The agent's job is to find what doesn't match and explain why: a fee that wasn't booked, a refund with no credit note, a payout split across two bank lines. An accountant then decides what to post.

1. **Pull the month's money movements.** From [Stripe](entry:stripe-mcp), list payouts, then the balance transactions in each one. The list endpoint takes a `payout` filter, which works for automatic payouts only. The payout object says so in `reconciliation_status`, which is `completed` when that list is available. Each balance transaction has `amount`, `fee` and `net`, where `net` is `amount` minus `fee`. From [Paddle](entry:paddle-mcp), list transactions and adjustments (refunds and credits), or read an existing CSV report.
2. **Pull what the books say.** From [Xero](entry:xero-mcp), list invoices, payments, bank transactions (each is marked reconciled or unreconciled), the chart of accounts and tax rates, and a trial balance or P&L for the period.
3. **Match outside the model.** Export both sides to files and run the matching in the [E2B](entry:e2b) sandbox, not in the conversation. The snippet below is a starting point.
4. **Read the documents that have no API.** Bank statement PDFs, supplier receipts and spreadsheets go through [MarkItDown](entry:markitdown).
5. **Report, then draft.** The output is a list of matched items, unmatched items with the IDs on both sides, and proposed entries. Writing those entries is a separate, approved step (see below). [Langfuse](entry:langfuse) keeps the trace, so each proposal can be checked against the records it came from.

## Keep it read-only

Each of the three servers handles "read-only" differently, so set it up at both ends: in the credential, and in the harness.

- **Xero: scopes.** The server has no read-only flag; on a test run it listed 51 tools, 25 of which create, update, add, approve, revert or delete. Without `XERO_SCOPES`, it asks Xero for its default scope list, which includes read-write scopes such as `accounting.invoices` and `accounting.payments`. When `XERO_SCOPES` is set, it requests exactly those scopes and nothing else. The server's README lists the `.read` versions of the invoice, payment, bank transaction and report scopes. Create the Custom Connection with read scopes only and set `XERO_SCOPES` to the same list. Xero's FAQ says a call that needs a scope you haven't been granted gets a 401 with an insufficient-scope `WWW-Authenticate` header. Test with a Demo Company first.
- **Xero: older connections.** The server's README says Custom Connections created before 29 April 2026 use the older bundled scopes (such as `accounting.transactions`), and ones created from that date use granular scopes, the kind listed below. When `XERO_SCOPES` is unset the server tries the bundled list first and falls back to the granular one on `invalid_scope`; when it is set, it requests only your list. So on an older connection, check which scopes it was granted before using the granular read list. Xero's own FAQ gives a different date for apps: those created before 2 March 2026 have until September 2027 to move to granular scopes. We did not find the 29 April date in Xero's documentation.
- **Stripe: agent key and approval rules.** Stripe recommends OAuth for interactive clients. For an unattended agent, use an agent-tagged restricted key with read permissions on the resources you need. From December 2026, the MCP server stops accepting full-access secret keys and restricted keys without the Agent tag. Agent-tagged keys are subject to approval rules, and Stripe adds default rules for refunds, subscription cancellations and outbound payments. You can add rules (approve or block) for payouts, credit notes, customer balance transactions and more.
- **Paddle: tool filter and key permissions.** The default `--tools` setting is `non-destructive`, and that is not read-only. It loads create tools such as `create_transaction`, `create_adjustment` (refunds and credits) and `create_subscription_charge`. Tool counts depend on `PADDLE_ENVIRONMENT`, because the server skips its 7 metrics tools in sandbox. Listing the tools of version 0.1.6 offline gave 90 tools in production (70 with `non-destructive`, 48 with `read-only`) and 83 in sandbox (63 and 41). Use `--tools=read-only` and give the API key only `.read` permissions. Note that `create_report` is not a read-only tool. If you want the agent to start new CSV exports, add `create_report` to an explicit comma-separated list of the read-only tools (49 tools in production, 42 in sandbox), or let a person create the report and have the agent read it.

In the harness, auto-approve only read tools and hide the write tools. MCP tools are named `mcp__<server>__<tool>`. Allow rules accept a glob after the server name, and deny rules both block calls and remove the tool definitions. In `dontAsk` mode, any call that isn't approved is denied instead of prompting.

```python
import os
from claude_agent_sdk import ClaudeAgentOptions

# Read-only Xero scopes. Give the Custom Connection only these, too.
XERO_READ_SCOPES = " ".join([
    "accounting.invoices.read", "accounting.payments.read",
    "accounting.banktransactions.read", "accounting.contacts.read",
    "accounting.settings.read", "accounting.reports.profitandloss.read",
    "accounting.reports.trialbalance.read",
])

options = ClaudeAgentOptions(
    mcp_servers={
        "xero": {
            "command": "npx",
            "args": ["-y", "@xeroapi/xero-mcp-server@0.0.17"],
            "env": {
                "XERO_CLIENT_ID": os.environ["XERO_CLIENT_ID"],
                "XERO_CLIENT_SECRET": os.environ["XERO_CLIENT_SECRET"],
                "XERO_SCOPES": XERO_READ_SCOPES,
            },
        },
        "stripe": {
            "type": "http",
            "url": "https://mcp.stripe.com",
            # An agent-tagged restricted key with read permissions only
            "headers": {"Authorization": f"Bearer {os.environ['STRIPE_AGENT_KEY']}"},
        },
    },
    allowed_tools=[
        "mcp__xero__list-*", "mcp__xero__get-*",
        "mcp__stripe__stripe_api_search", "mcp__stripe__stripe_api_details",
        "mcp__stripe__stripe_api_read",
    ],
    disallowed_tools=[
        "mcp__xero__create-*", "mcp__xero__update-*", "mcp__xero__delete-*",
        "mcp__xero__approve-*", "mcp__xero__revert-*", "mcp__xero__add-*",
        "mcp__stripe__stripe_api_write", "mcp__stripe__send_money",
        "mcp__stripe__transfer_money", "mcp__stripe__convert_currency",
        "mcp__stripe__setup_recipient", "mcp__stripe__atlas_company_formation",
    ],
    permission_mode="dontAsk",
)
```

The Stripe deny list names the tools in Stripe's MCP tool table that write data, move money or start an account process: `stripe_api_write`, the Treasury tools `send_money`, `transfer_money`, `convert_currency` and `setup_recipient` (which sets up a payee), and `atlas_company_formation` (which starts or resumes a company formation). Stripe marks `send_money`, `transfer_money` and `convert_currency` as needing human confirmation, but not `setup_recipient` or `atlas_company_formation`. Other tools that aren't in `allowed_tools` are denied by `dontAsk` anyway.

For Paddle, add a server running `npx -y @paddle/paddle-mcp@0.1.6 --tools=read-only` with `PADDLE_API_KEY` and `PADDLE_ENVIRONMENT` in its `env`. Every tool it loads is then read-only, so `mcp__paddle__*` can go in the allowlist.

## Writes: drafts first, and a human for each one

When the report is accepted, the fixes can be written, but not by the same unattended run. Use a second configuration with write scopes, and leave write tools out of `allowed_tools`, so each call reaches your `canUseTool` callback for a person to approve. That only works in `default` mode; `dontAsk` denies the call instead. Know what each Xero write does. In version 0.0.17 of the server:

- `create-invoice`, `create-credit-note` and `create-quote` always create **drafts**, and `create-manual-journal` defaults to draft. An accountant can review and approve these in Xero.
- `create-manual-journal` also takes an optional `status` (`DRAFT`, `POSTED`, `DELETED`, `VOIDED` or `ARCHIVED`). An approved call with `status: POSTED` posts the journal at once, so read the arguments before you approve, not only the tool name. `update-manual-journal` takes a `status` too.
- `create-bank-transaction` creates the transaction as **authorised**, and `create-payment` records a payment against an authorised invoice straight away. Treat these as posting entries.
- The server has no tool for bank statement lines or for reconciling them. Matching a statement line in Xero stays a job for a person in Xero itself.

On the Stripe side, writes go through `stripe_api_write`. Stripe can require human confirmation in the Dashboard for some actions, such as refunds, and your own approval rules can add others or block them outright.

## Match payouts outside the model

The snippet below matches Stripe payouts to Xero bank transactions that receive money. A match needs the exact amount and an arrival date within a few days. Anything with zero or several candidates is sent to a person instead of being guessed. Stripe amounts are integers in the currency's minor unit, so it divides by 100. That is only right for two-decimal currencies; [zero-decimal currencies](https://docs.stripe.com/currencies#zero-decimal) such as JPY need no division.

```python
from decimal import Decimal

def match_payouts(payouts, bank_lines, days=3):
    """payouts: Stripe payout dicts (amount in minor units, arrival_date as a date).
    bank_lines: Xero RECEIVE bank transactions as dicts with total (Decimal), date and id.
    Returns (matches, unmatched_payouts, unmatched_lines). Exact amount, date within +-days."""
    free = list(bank_lines)
    matches, missing = [], []
    for p in sorted(payouts, key=lambda p: p["arrival_date"]):
        want = Decimal(p["amount"]) / 100  # two-decimal currencies only
        hits = [b for b in free if b["total"] == want
                and abs((b["date"] - p["arrival_date"]).days) <= days]
        if len(hits) == 1:
            matches.append((p["id"], hits[0]["id"]))
            free.remove(hits[0])
        else:
            missing.append((p["id"], f"{len(hits)} candidate lines"))
    return matches, missing, [b["id"] for b in free]
```

For each payout that matches, check the next level down: the payout's balance transactions against the Xero invoices and payments for the same customers. That is where unbooked fees and refunds show up.

Xero's `list-bank-transactions` tool returns 10 transactions per page as text, newest first. A busy month takes many calls, and every result passes through the model's context. Have the agent page through once, write what it reads to a file, and do the rest of the work in the sandbox.

## Test before you connect live books

- **Xero:** start with the Demo Company, as Xero's README recommends. It comes with sample data and can be reset.
- **Stripe:** use a sandbox. OAuth consent lets you grant sandboxes and live accounts separate permissions.
- **Paddle:** set `PADDLE_ENVIRONMENT=sandbox` with a sandbox key.
- Keep a month you have already closed by hand as a fixed test case. Rerun the agent on it whenever you change the prompt, the model or a server version, and compare its list of differences with the one your accountant produced.

## Variations

- **Xero's hosted server.** On 2026-10-15 Xero launched a Developer Remote MCP, listed here as [xero-remote-mcp](entry:xero-remote-mcp), with 39 tools across invoicing, accounting, reporting and payments, for commercial apps on the Core tier or above. Starter apps can use it with the demo organisation only. It is at `https://api.xero.com/mcp/v1` and signs in with OAuth 2.0 and PKCE. Custom Connections aren't eligible, so the unattended setup above doesn't carry over as is. Request only the scopes for the tools you want. Xero says its V1 tools don't ask for confirmation before writing, so the harness rules still matter. The local server above needs no app tier, only a Custom Connection or a bearer token.
- **Paddle's hosted server.** Paddle documents `https://mcp.paddle.com/mcp` (live, OAuth or an API key) and `https://sandbox-mcp.paddle.com/mcp` (sandbox, API key only). Instead of one tool per API call, it has three tools: `search`, `execute` (which runs chained API calls) and `report_missing_tool`. Paddle says it doesn't gate destructive operations, so you can't allow its reads and deny its writes by tool name. Read-only then rests on the API key's permissions or the OAuth connection's read access, which is the default for live OAuth connections. Paddle also recommends approving each `execute` call.
- **Bank data.** The [Plaid Dashboard MCP](entry:plaid-mcp) is for diagnosing a Plaid integration (Items, Link conversion, usage), not for reading account transactions, so it is not a bank feed for this stack.
- **Other processors.** Square, PayPal, Razorpay and Adyen have their own MCP servers; the [payment processor MCP servers comparison](comparison:payment-processor-mcp-servers) covers what each can read and write.
- **Agents that spend money** are a different stack: see [Agent that can buy things](stack:agent-that-can-buy-things).
