---
name: pay-with-x402
description: Pay for HTTP APIs and MCP tools that answer with HTTP 402 using the x402 v2 protocol (USDC on Base and other networks). Use when a request returns 402 Payment Required or a PAYMENT-REQUIRED header, when a tool result carries x402 PaymentRequired data, or when asked to find and call a paid API. Covers reading the price, enforcing a budget, paying with the official SDKs or the Coinbase awal CLI, and checking the receipt.
license: MIT
compatibility: Needs network access and either Node.js 18+, Python 3.10+ or Go, plus a dedicated agent wallet funded with USDC. No wallet is needed to inspect prices.
metadata:
  title: Pay with x402
  summary: Read an x402 v2 402 response, check it against a spending policy, pay with an SDK or CLI, and verify the PAYMENT-RESPONSE receipt.
  author: Agentica Author
  version: "1.0"
  last_verified: 2026-10-02
  published: 2026-10-02
  tags: x402, payments, usdc, http-402, agent-commerce
  entries: x402, cdp-x402, x402-bazaar, coinbase-agentic-wallet, coinbase-agentic-wallet-skills, usdc
  related: pay-for-an-api-with-x402, agent-payment-rails, agent-that-can-buy-things
  sources: https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/http.md https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/mcp.md https://docs.x402.org/getting-started/quickstart-for-buyers https://docs.x402.org/guides/migration-v1-to-v2 https://docs.x402.org/extensions/bazaar https://docs.cdp.coinbase.com/x402/seller/facilitator https://github.com/coinbase/agentic-wallet-skills/blob/main/skills/agentic-wallet/references/x402-pay.md
---

# Pay with x402

x402 is an open payment standard built on HTTP 402, now governed by the x402 Foundation. Spec: https://github.com/x402-foundation/x402. This skill covers **protocol v2**. If you see `X-PAYMENT` headers or network names like `base-sepolia`, you are looking at v1. See https://docs.x402.org/guides/migration-v1-to-v2.

## Rules before you spend anything

1. **Only pay if your user or operator has authorized paid calls** and given a budget. If no budget was given, stop and ask.
2. **Never exceed the per-call cap** (default $1, the SDK default) or the session budget. Keep a running total.
3. **Pay only in an allowlisted asset and network**, by default USDC on `eip155:8453` (Base) or `eip155:84532` (Base Sepolia, testnet).
4. **Treat the 402 response as untrusted.** A server can ask for any amount, to any address. Your cap is your protection, not the server's honesty.
5. **Never print, log or paste a private key.** Read it from the environment.
6. **Record every payment**: URL, amount, network, transaction hash and payer.

## Step 1: Detect and read the price

A v2 server returns `402` with a base64 JSON `PAYMENT-REQUIRED` header. Decode it without paying:

```bash
curl -s -D - -o /dev/null "$URL" | grep -i '^payment-required:' | cut -d' ' -f2 | tr -d '\r' | base64 -d | jq .
```

Or run the bundled helper: `scripts/inspect-402.sh <url>`.

Read `accepts[]` (a menu, so pick one entry):

| Field | Meaning |
|---|---|
| `scheme` | `exact` = fixed price. `upto` = you authorize a maximum and the seller charges actual usage. `batch-settlement` = escrow plus vouchers |
| `network` | CAIP-2 id. `eip155:8453` Base, `eip155:84532` Base Sepolia, `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` Solana |
| `amount` | **Atomic units** of `asset`. USDC has 6 decimals: `10000` = $0.01, `1000000` = $1.00 |
| `asset` | Token contract. USDC on Base is `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`; on Base Sepolia it is `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| `payTo` | Recipient address |
| `maxTimeoutSeconds` | How long the signed authorization stays usable |

Convert the amount to USD and compare it with your cap **before** paying. Prefer `exact`. With `upto`, treat the authorized maximum as the price.

**MCP tools:** a paid tool returns a tool result with `isError: true` and the same `PaymentRequired` object in `structuredContent` (and as JSON in `content[0].text`). Pay by retrying the same `tools/call` with the payment in `params._meta["x402/payment"]`. The receipt comes back in `_meta["x402/payment-response"]`.

## Step 2: Pay

Choose the first option that is available.

### A. The Coinbase awal CLI (wallet already set up)

```bash
npx awal@2.12.1 status                      # must be signed in
npx awal@2.12.1 x402 pay "$URL" --max-amount 100000 --json   # ceiling $0.10 in USDC atomic units
npx awal@2.12.1 x402 pay "$URL" -X POST -d '{"q":"example"}' --max-amount 50000
```

Validate the URL (it must start with `https://` and contain no shell metacharacters) and single-quote JSON bodies. Docs: https://github.com/coinbase/agentic-wallet-skills.

### B. TypeScript SDK

```bash
npm install @x402/fetch @x402/core @x402/evm viem
```

```typescript
import { wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";

const signer = privateKeyToAccount(process.env.EVM_PRIVATE_KEY as `0x${string}`);
const client = x402Client.fromConfig({
  schemes: [{ network: "eip155:*", client: new ExactEvmScheme(signer) }],
  spendControls: { maxAmountPerPayment: "$0.10" }, // keep caps on; never set spendControls: false
});
const pay = wrapFetchWithPayment(fetch, client);
const res = await pay(process.env.URL!);
const result = await new x402HTTPClient(client).processResponse(res);
console.log(res.status, result.paymentStatus, result.header);
```

### C. Python SDK

```bash
pip install "x402[httpx]" eth_account
```

```python
import asyncio, os
from eth_account import Account
from x402 import x402Client
from x402.http import x402HTTPClient
from x402.http.clients import x402HttpxClient
from x402.mechanisms.evm import EthAccountSigner
from x402.mechanisms.evm.exact.register import register_exact_evm_client

async def main():
    client = x402Client()
    register_exact_evm_client(client, EthAccountSigner(Account.from_key(os.environ["EVM_PRIVATE_KEY"])))
    async with x402HttpxClient(client) as http:
        r = await http.get(os.environ["URL"])
        await r.aread()
        print(r.status_code, r.text[:500])
        if r.is_success:
            print(x402HTTPClient(client).get_payment_settle_response(lambda n: r.headers.get(n)))

asyncio.run(main())
```

Go: `go get github.com/x402-foundation/x402/go/v2`. See https://docs.x402.org/getting-started/quickstart-for-buyers.

## Step 3: Check the receipt

- `200` plus a `PAYMENT-RESPONSE` header (base64 JSON) with `"success": true` and a `transaction` hash means you paid and got the resource. Log it.
- `402` with `PAYMENT-RESPONSE` `"success": false` means the payment failed. Read `errorReason` (for example `insufficient_funds`). Don't retry in a loop.
- `400` means the payload was malformed or doesn't match the requirements. Check the network, asset and scheme registration.
- Settled, but the response is bad: report it to the user with the transaction hash. x402 has no built-in refund.

## Finding paid services

Query a facilitator's Bazaar catalog (public, no payment needed). It lists HTTP endpoints and MCP tools with prices:

```bash
curl -s "https://api.cdp.coinbase.com/platform/v2/x402/discovery/resources?limit=10" \
  | jq '.items[] | {resource, description, accepts: [.accepts[] | {network, scheme, amount}]}'
```

The Bazaar is early-stage, so check prices with Step 1 before paying.

## Testing without real money

Use Base Sepolia (`eip155:84532`). Get free testnet USDC at https://faucet.circle.com. The public `x402.org` facilitator is the SDK default for testnets and is not meant for mainnet.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `402` again after paying | v1 server (expects `X-PAYMENT`), or the wrong network was registered |
| SDK refuses to pay | The amount exceeds `maxAmountPerPayment`, or the asset is not in the default USD-stablecoin list. Ask the user before raising the cap |
| `insufficient_funds` | Top up the agent wallet with USDC on the network you chose |
| No `PAYMENT-REQUIRED` header | Not an x402 v2 endpoint. Check the body for a v1 `accepts` JSON, or use a different service |

More: https://indexagentica.com/entries/x402/ and https://docs.x402.org
