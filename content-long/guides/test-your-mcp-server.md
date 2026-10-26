---
id: test-your-mcp-server
type: guide
title: Test your MCP server with in-process tests and Inspector CI checks
summary: "Automated tests for a TypeScript MCP server: call tools in-process through the SDK's handler.fetch, assert on structuredContent and isError, snapshot the tool list so schema changes fail review, test the bearer-token gate, spawn the stdio build, and add MCP Inspector CLI checks to CI."
description: "A testing guide for people who build MCP servers. Using the MCP TypeScript SDK v2 testing pattern, it runs a real client against the server in the same process with no port, covers happy paths, tool errors, schema rejection, a tool-contract snapshot, the auth gate and the stdio entry point, then adds MCP Inspector CLI smoke checks with their exit codes. Every test and command here was run on 2026-10-21 with @modelcontextprotocol/server and client 2.3.1 and Inspector 2.11.0. The GitHub Actions workflow was not run."
author: Agentica Author
difficulty: intermediate
time_estimate: 40 min
prerequisites:
  - "A TypeScript or JavaScript MCP server built on the MCP TypeScript SDK v2 (@modelcontextprotocol/server), or the small one below"
  - "Node.js 22.19 or later if you use the MCP Inspector CLI (the SDK itself needs Node.js 20 or later)"
  - "Basic familiarity with node:test or another test runner such as Vitest"
tags: [mcp, testing, ci, mcp-inspector, typescript, streamable-http, stdio]
entries: [mcp-typescript-sdk, mcp-inspector, model-context-protocol, mcp-authorization, fastmcp, mcp-python-sdk]
sources:
  - title: MCP TypeScript SDK v2, Testing
    url: https://ts.sdk.modelcontextprotocol.io/v2/testing.md
    accessed: 2026-10-21
  - title: MCP TypeScript SDK v2, Require authorization
    url: https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization.md
    accessed: 2026-10-21
  - title: MCP TypeScript SDK v2, Fastify (createMcpHandler and toNodeHandler)
    url: https://ts.sdk.modelcontextprotocol.io/v2/serving/fastify.md
    accessed: 2026-10-21
  - title: MCP TypeScript SDK v2 documentation index (llms.txt)
    url: https://ts.sdk.modelcontextprotocol.io/v2/llms.txt
    accessed: 2026-10-21
  - title: MCP TypeScript SDK (modelcontextprotocol/typescript-sdk)
    url: https://github.com/modelcontextprotocol/typescript-sdk
    accessed: 2026-10-21
  - title: MCP Inspector CLI README
    url: https://github.com/modelcontextprotocol/inspector/blob/main/clients/cli/README.md
    accessed: 2026-10-21
  - title: "@modelcontextprotocol/inspector npm registry metadata (latest: version and engines)"
    url: https://registry.npmjs.org/@modelcontextprotocol/inspector/latest
    accessed: 2026-10-21
  - title: Node.js test runner (node:test)
    url: https://nodejs.org/api/test.html
    accessed: 2026-10-21
related: [publish-an-mcp-server, add-oauth-to-your-mcp-server, connect-an-agent-to-a-remote-mcp-server, evaluate-an-ai-agent, llm-red-teaming-tools, mcp-gateways, pick-an-mcp-server, use-the-indexagentica-mcp-server, mcp-server-frameworks]
last_verified: 2026-10-21
published: 2026-10-21
---

Clicking through the [MCP Inspector](entry:mcp-inspector) is how most people check an MCP server. That doesn't catch regressions. A renamed tool, a tightened schema or a broken auth gate goes unnoticed until a client fails. This guide sets up tests that run on every commit:

1. In-process client-to-server tests with the [MCP TypeScript SDK](entry:mcp-typescript-sdk) v2, with no port and no child process.
2. A snapshot of the tool contract, so that changes to the schema or description show up in review.
3. Tests for the bearer-token gate.
4. One test that spawns the real stdio entry point.
5. MCP Inspector CLI checks for CI, using its exit codes.

What was actually run, on 2026-10-21: every file below, on Node.js 22.23.2, with `@modelcontextprotocol/server` 2.3.1, `@modelcontextprotocol/client` 2.3.1, `@modelcontextprotocol/node` 2.1.1, zod 4.6.7 and `@modelcontextprotocol/inspector` 2.11.0. The result was 8 of 8 tests passing. I also changed one tool description to confirm that the snapshot test fails. The GitHub Actions workflow at the end was **not** run.

If you are still at "does it start", run the basic Inspector calls in [Publish an MCP server](guide:publish-an-mcp-server) first. This guide picks up from there.

## The setup

```bash
mkdir mcp-tests && cd mcp-tests && npm init -y && npm pkg set type=module
npm install @modelcontextprotocol/server @modelcontextprotocol/client @modelcontextprotocol/node zod
```

The server under test exports a **factory** rather than a running server. The SDK's `createMcpHandler(createServer)` turns that factory into a web-standard HTTP handler, so the same code can be served over HTTP in production and called directly in tests. The tool is the SDK testing doc's `apply-discount` example, with an output schema and a deliberate error path:

```js
// src/server.mjs
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

export function createServer() {
  const server = new McpServer({ name: "pricing", version: "1.0.0" });
  server.registerTool(
    "apply-discount",
    {
      description: "Apply a percentage discount to a price",
      inputSchema: z.object({ price: z.number(), percent: z.number().min(0).max(100) }),
      outputSchema: z.object({ total: z.number() }),
      annotations: { readOnlyHint: true },
    },
    async ({ price, percent }) => {
      if (price < 0) return { content: [{ type: "text", text: "price must be >= 0" }], isError: true };
      const total = price * (1 - percent / 100);
      return { content: [{ type: "text", text: `$${total}` }], structuredContent: { total } };
    },
  );
  return server;
}
```

There are two thin entry points, one for each transport:

```js
// src/stdio.mjs
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { createServer } from "./server.mjs";
await createServer().connect(new StdioServerTransport());
```

```js
// src/http.mjs  (Streamable HTTP on 127.0.0.1:3000/mcp)
import http from "node:http";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "./server.mjs";
const node = toNodeHandler(createMcpHandler(createServer));
http.createServer((req, res) => (req.url === "/mcp" ? node(req, res) : res.writeHead(404).end()))
  .listen(3000, "127.0.0.1", () => console.error("http://127.0.0.1:3000/mcp"));
```

## 1. In-process tests through handler.fetch

The SDK's testing page recommends a specific approach. Build the handler, then give the client's `StreamableHTTPClientTransport` a custom `fetch` that calls `handler.fetch` directly. The client and server then go through the real protocol, including initialization, version negotiation and JSON-RPC, but no socket is ever opened. Tests stay fast and don't compete for ports.

```js
// test/server.test.mjs  (run with: node --test)
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler } from "@modelcontextprotocol/server";
import { createServer } from "../src/server.mjs";

let handler, client;

beforeEach(async () => {
  handler = createMcpHandler(createServer);
  const transport = new StreamableHTTPClientTransport(new URL("http://test.local/mcp"), {
    fetch: (url, init) => handler.fetch(new Request(url, init)), // in-process: no port, no socket
  });
  client = new Client({ name: "test-harness", version: "1.0.0" }, { versionNegotiation: { mode: "auto" } });
  await client.connect(transport);
});

afterEach(async () => {
  await client.close();  // client first,
  await handler.close(); // then the handler
});

test("happy path returns structured content", async () => {
  const r = await client.callTool({ name: "apply-discount", arguments: { price: 80, percent: 25 } });
  assert.deepEqual(r.structuredContent, { total: 60 });
});

test("handler failure is a result with isError, not a throw", async () => {
  const r = await client.callTool({ name: "apply-discount", arguments: { price: -5, percent: 25 } });
  assert.equal(r.isError, true);
  assert.match(r.content[0].text, /price must be >= 0/);
});

test("schema-invalid arguments are rejected", async () => {
  const r = await client.callTool({ name: "apply-discount", arguments: { price: 80, percent: 150 } });
  assert.equal(r.isError, true);
});
```

There are three behaviours to design your assertions around. All three come from the SDK's testing page, and all three were confirmed by the run:

- **Tool failures don't throw.** The SDK reports a handler that returns an error, and also arguments that the input schema rejects, as an ordinary result with `isError: true`. A test that wraps `callTool` in `assert.rejects` will never catch them. Check `isError` instead, plus the text the model will actually see.
- **Assert on `structuredContent`** for the happy path. Text content is written for the model. The structured output is your contract with code.
- **Close the client first, then the handler,** in `afterEach`. According to the docs, `handler.close()` aborts any exchange that is still in flight, so a hung tool call can't leak into the next test.

There is also `InMemoryTransport.createLinkedPair()` in `@modelcontextprotocol/client`, which is the older way to wire up an in-memory pair. The testing page says it "connects 2025-era instances only". It names `handler.fetch` as the in-process route for 2026-07-28 coverage, which is why this guide uses `handler.fetch`.

## 2. Snapshot the tool contract

Clients and models depend on tool names, descriptions and JSON Schemas. A model chooses tools by reading their descriptions, so an innocent-looking edit there changes agent behaviour. This test, which was added to the same file, stores `tools/list` output as JSON in the repo and fails when it changes:

```js
test("tool contract matches the committed snapshot", async () => {
  const { tools } = await client.listTools();
  const current = JSON.stringify(tools, null, 2);
  const path = new URL("./tools.snapshot.json", import.meta.url);
  if (process.env.UPDATE_SNAPSHOT) await writeFile(path, current);
  assert.equal(current, await readFile(path, "utf8"), "tool names, descriptions or schemas changed");
});
```

Create the snapshot with `UPDATE_SNAPSHOT=1 node --test`, commit `test/tools.snapshot.json`, and from then on run plain `node --test`. The snapshot holds the JSON Schema that the SDK generates from the zod schema. For this server, that includes `"minimum": 0, "maximum": 100` on `percent` and `"additionalProperties": false` on the output, so tightening a bound shows up in the diff. I checked this by shortening the tool's description: the test failed with the message above. When a change is intentional, re-run with `UPDATE_SNAPSHOT=1` and review the JSON diff the way you would review an API change.

## 3. Test the auth gate

If the server sits behind OAuth (see [Add OAuth authorization to your own MCP server](guide:add-oauth-to-your-mcp-server)), the in-process approach still works. Put the SDK's web-standard `requireBearerAuth` gate in front of `handler.fetch`, exactly as the authorization doc does, and use a stub verifier so no identity provider is needed:

```js
// test/auth.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { createMcpHandler, OAuthError, OAuthErrorCode, requireBearerAuth } from "@modelcontextprotocol/server";
import { createServer } from "../src/server.mjs";

const url = new URL("http://test.local/mcp");
const verifier = {
  async verifyAccessToken(token) {
    if (token !== "good-token") throw new OAuthError(OAuthErrorCode.InvalidToken, "unknown token");
    return { token, clientId: "test", scopes: ["mcp"], expiresAt: Math.floor(Date.now() / 1000) + 60, resource: url };
  },
};
const gate = requireBearerAuth({ verifier, requiredScopes: ["mcp"], expectedResource: url });
const handler = createMcpHandler(createServer);
const app = async (request) => {
  const auth = await gate(request);
  return auth instanceof Response ? auth : handler.fetch(request, { authInfo: auth });
};

test("no token: raw request gets 401 with a WWW-Authenticate challenge", async () => {
  const res = await app(new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }));
  assert.equal(res.status, 401);
  assert.match(res.headers.get("www-authenticate"), /^Bearer /);
});

test("no token: the SDK client fails to connect", async () => {
  const client = new Client({ name: "t", version: "1" });
  const transport = new StreamableHTTPClientTransport(url, { fetch: (u, i) => app(new Request(u, i)) });
  await assert.rejects(client.connect(transport));
});

test("valid token: tools work", async () => {
  const client = new Client({ name: "t", version: "1" }, { versionNegotiation: { mode: "auto" } });
  const transport = new StreamableHTTPClientTransport(url, {
    fetch: (u, i) => app(new Request(u, i)),
    requestInit: { headers: { authorization: "Bearer good-token" } },
  });
  await client.connect(transport);
  const r = await client.callTool({ name: "apply-discount", arguments: { price: 100, percent: 10 } });
  assert.deepEqual(r.structuredContent, { total: 90 });
  await client.close();
});
```

In the run, the rejected connect threw an `SdkHttpError` whose message carried the server's `invalid_token` body. Assert that it rejects, not on the exact error class, because the class is the part most likely to change between SDK releases. Add cases that match your real verifier too: an expired token, a token for a different resource, and a token that is missing a scope (which should get 403). The OAuth guide's test section does this with locally minted JWTs.

## 4. Spawn the stdio build once

For stdio there is no in-process shortcut. The SDK's testing page says to spawn the real process with `StdioClientTransport`. One test is enough to prove that the entry point boots, writes nothing but JSON-RPC to stdout, and answers:

```js
// test/stdio.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

test("stdio entry point starts and answers", async () => {
  const client = new Client({ name: "t", version: "1" });
  await client.connect(new StdioClientTransport({ command: "node", args: ["src/stdio.mjs"] }));
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name), ["apply-discount"]);
  await client.close(); // also shuts the child process down
});
```

If you publish a build, point `args` at the built file (the docs use `dist/server.js`), so that the test covers what users actually run.

Output of `node --test` for all three files:

```text
ok 1 - no token: raw request gets 401 with a WWW-Authenticate challenge
ok 2 - no token: the SDK client fails to connect
ok 3 - valid token: tools work
ok 4 - happy path returns structured content
ok 5 - handler failure is a result with isError, not a throw
ok 6 - schema-invalid arguments are rejected
ok 7 - tool contract matches the committed snapshot
ok 8 - stdio entry point starts and answers
# pass 8
# fail 0
```

## 5. Inspector CLI checks for CI

The SDK tests check your code. The [MCP Inspector](entry:mcp-inspector) CLI checks the server from the outside, as an independent client, and it works for servers written in any language. That includes Python servers built on [FastMCP](entry:fastmcp) or the [MCP Python SDK](entry:mcp-python-sdk). Its exit codes are what make it useful in CI. The CLI README documents these:

| Situation | Exit code |
|---|---|
| Call succeeded | `0` |
| `tools/call` returned `isError: true` | `5` |
| `tools/list --strict` found an error-severity schema portability problem | `6` |
| `--verify` (skills) found a failing skill | `7` |

Runs against this server (Inspector 2.11.0, which declares Node.js 22.19 or later in its npm `engines` field):

```bash
I="npx -y @modelcontextprotocol/inspector@2.11.0 --cli"

# stdio: list, call, expect a structured result
$I node src/stdio.mjs --method tools/list
$I node src/stdio.mjs --method tools/call --tool-name apply-discount \
  --tool-arg price=80 --tool-arg percent=25 --format json
# -> {"result":{"content":[{"type":"text","text":"$60"}],"structuredContent":{"total":60}}}

# the error path really is an error: exit code 5
$I node src/stdio.mjs --method tools/call --tool-name apply-discount --tool-arg price=-1 --tool-arg percent=25; echo $?
# -> 5

# schemas that strict clients will accept: exit 0 here, 6 if not
$I node src/stdio.mjs --method tools/list --strict

# HTTP: a connect-only probe that reports what was negotiated
node src/http.mjs &
$I http://127.0.0.1:3000/mcp --method initialize --format json
# -> {"result":{"serverInfo":{"name":"pricing","version":"1.0.0"},"protocolVersion":"2025-11-25","capabilities":{"tools":{"listChanged":true}}}}
```

Some notes on these commands:

- **Pin the Inspector version** in CI (`@2.11.0` here). The README warns that exit codes, argument order and the `--` separator changed between the v1 and v2 CLIs.
- **`--tool-arg` coerces values** by JSON-parsing them, so `price=80` becomes a number. Use `--tool-args-json '{"zip":"012"}'` when a value must stay a string.
- **`--strict`** is the one check you can't easily get from your own tests. The README describes it as naming schema constructs that are "perfectly legal JSON Schema" but are refused by some clients, and printing a fix for each. It prints them on stderr.
- **Protocol version.** In this run the Inspector negotiated `2025-11-25` with the 2.3.1 server. The SDK client in step 1, with `versionNegotiation: { mode: "auto" }`, is the route the SDK documents for 2026-07-28 coverage. Running both gives you coverage on each side of the spec change.
- For a deployed server, add `--header "Authorization: Bearer $TOKEN"` and a test-only token. Never use a real user's token.

### A CI job (not run)

This workflow wasn't executed for this guide. It only chains the commands that were run above:

```yaml
# .github/workflows/mcp-tests.yml
name: mcp-tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: node --test
      - run: npx -y @modelcontextprotocol/inspector@2.11.0 --cli node src/stdio.mjs --method tools/list --strict
      - name: error path must report isError (exit 5)
        run: |
          set +e
          npx -y @modelcontextprotocol/inspector@2.11.0 --cli node src/stdio.mjs \
            --method tools/call --tool-name apply-discount --tool-arg price=-1 --tool-arg percent=25
          test $? -eq 5
```

## What to test, in order

1. **Every tool: one happy path and one failure.** Assert on `structuredContent` and on `isError`, not on thrown errors.
2. **Schema edges.** Make sure out-of-range and missing arguments come back as `isError` results, not crashes.
3. **The tool contract snapshot.** Review the diff whenever it changes.
4. **The auth gate.** No token should give 401 with a `Bearer` challenge, and a good token should work. Add expired, wrong-audience and missing-scope cases for your real verifier.
5. **Each shipped transport, once.** That means spawning the stdio build, and probing HTTP with Inspector `--method initialize`.
6. **Strict schema portability** with Inspector `--strict`.

These tests cover correctness. They don't cover whether a model uses your tools well, or whether a hostile prompt can misuse them. For the first, see [Evaluate an AI agent](guide:evaluate-an-ai-agent). For the second, see [LLM red-teaming tools compared](comparison:llm-red-teaming-tools). If you put the server behind a gateway, run the Inspector checks against the gateway endpoint too. The [MCP gateways comparison](comparison:mcp-gateways) explains why tool names and schemas can change there.

## Troubleshooting

- **`connect` hangs or the test runner never exits.** A client or handler is still open. Close both in `afterEach`, client first.
- **A test expects a throw but gets a result.** That is how the SDK is meant to work: tool errors and schema rejections resolve with `isError: true`.
- **`Cannot find module` when you run `node --test test/`.** On Node.js 22.23.2 a bare directory argument was treated as a module path and failed. Run `node --test` with no arguments, since its default patterns pick up `*.test.mjs` files, or pass the files or a glob.
- **The Inspector refuses to start.** Check `node --version`: Inspector 2.x requires Node.js 22.19 or later.
- **The stdio test fails but the HTTP tests pass.** Something in the entry point is writing to stdout, such as a `console.log`. On stdio, stdout is the protocol channel, so log to stderr.
