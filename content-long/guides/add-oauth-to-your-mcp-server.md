---
id: add-oauth-to-your-mcp-server
type: guide
title: Add OAuth authorization to your own MCP server
summary: "A server-side walkthrough of the MCP 2026-07-28 authorization spec: publish RFC 9728 protected resource metadata, answer 401 and 403 challenges, verify JWT audience per RFC 8707, enforce per-tool scopes, and never pass tokens through. Tested with the MCP TypeScript SDK v2."
description: "How to turn a remote MCP server into an OAuth 2.1 resource server. It covers what the spec requires of servers, the RFC 9728 metadata document and WWW-Authenticate challenge, audience-bound token validation (RFC 8707), scope challenges and step-up, calling upstream APIs with RFC 8693 token exchange instead of token passthrough, and a complete Express server built on @modelcontextprotocol/server, @modelcontextprotocol/express and jose, tested end to end against a local test authorization server."
author: Agentica Author
difficulty: intermediate
time_estimate: 45 min
prerequisites:
  - A remote MCP server on Streamable HTTP, or the willingness to build the small one below
  - Node.js 20 or later (the code was tested on Node.js 20.19.2)
  - An authorization server that issues JWT access tokens and publishes RFC 8414 metadata, such as your identity provider
tags: [mcp, oauth, authorization, security, rfc-9728, rfc-8707, resource-server, typescript]
entries: [mcp-authorization, rfc-9728, rfc-8707, rfc-8693, mcp-ext-auth, oauth-client-id-metadata-document, cross-app-access, model-context-protocol, square-mcp, workos-authkit-mcp, auth0-for-ai-agents, descope-agentic-identity, stytch-connected-apps]
sources:
  - title: MCP specification 2026-07-28, Authorization
    url: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization
    accessed: 2026-10-21
  - title: MCP specification 2026-07-28, Authorization Server Discovery
    url: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/authorization-server-discovery
    accessed: 2026-10-21
  - title: MCP specification 2026-07-28, Authorization Security Considerations
    url: https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations
    accessed: 2026-10-21
  - title: "RFC 9728: OAuth 2.0 Protected Resource Metadata"
    url: https://www.rfc-editor.org/rfc/rfc9728.html
    accessed: 2026-10-21
  - title: "RFC 8707: Resource Indicators for OAuth 2.0"
    url: https://www.rfc-editor.org/rfc/rfc8707.html
    accessed: 2026-10-21
  - title: "RFC 8693: OAuth 2.0 Token Exchange"
    url: https://www.rfc-editor.org/rfc/rfc8693.html
    accessed: 2026-10-21
  - title: MCP Authorization Extensions (modelcontextprotocol/ext-auth)
    url: https://github.com/modelcontextprotocol/ext-auth
    accessed: 2026-10-21
  - title: MCP TypeScript SDK v2, Require authorization
    url: https://ts.sdk.modelcontextprotocol.io/v2/serving/authorization.md
    accessed: 2026-10-21
  - title: MCP TypeScript SDK (modelcontextprotocol/typescript-sdk)
    url: https://github.com/modelcontextprotocol/typescript-sdk
    accessed: 2026-10-21
  - title: MCP TypeScript SDK bearer-auth example (examples/bearer-auth/server.ts)
    url: https://github.com/modelcontextprotocol/typescript-sdk/blob/main/examples/bearer-auth/server.ts
    accessed: 2026-10-21
  - title: jose (panva/jose)
    url: https://github.com/panva/jose
    accessed: 2026-10-21
  - title: Square MCP protected resource metadata (live response)
    url: https://mcp.squareup.com/.well-known/oauth-protected-resource
    accessed: 2026-10-21
related: [agent-auth-and-delegated-access, agent-identity-and-mcp-auth, publish-an-mcp-server, connect-an-agent-to-a-remote-mcp-server, pick-an-mcp-server, connect-remote-mcp, llm-red-teaming-tools, test-your-mcp-server, mcp-gateways]
last_verified: 2026-10-21
published: 2026-10-21
---

The [MCP authorization spec](entry:mcp-authorization) has two halves. Clients run the OAuth flow; servers have to check what clients bring. Most write-ups cover the client side. This guide covers the server: what a remote MCP server has to publish, check and refuse so that any spec-compliant client can sign in to it, and so that a token meant for somebody else is turned away.

Authorization is optional in MCP. When you add it, the spec says HTTP-based servers **SHOULD** follow it. STDIO servers **SHOULD NOT** follow it, and should read credentials from the environment instead. So this guide is about servers on Streamable HTTP.

Everything below was checked against the 2026-07-28 revision of the spec. The server code was run end to end against a local test authorization server, and the outputs shown are the real ones.

## What the spec asks of your server

Your MCP server is an OAuth 2.1 **resource server**. It does not issue tokens. An authorization server does that, and that can be your identity provider or a product built for it (see [Agent identity and MCP authorization platforms](comparison:agent-identity-and-mcp-auth)). The server's own duties are:

| Duty | Spec level | Source |
|---|---|---|
| Publish Protected Resource Metadata with at least one `authorization_servers` entry | MUST | MCP spec, [RFC 9728](entry:rfc-9728) |
| Point clients at it, either with `resource_metadata` in the `WWW-Authenticate` header of a 401 or at a well-known URI | MUST (one of the two) | Authorization Server Discovery |
| Validate access tokens as OAuth 2.1 Section 5.2 describes | MUST | Token Handling |
| Accept only tokens issued for this server, checked through the audience | MUST | [RFC 8707](entry:rfc-8707) Section 2, Security Considerations |
| Return 401 for missing, invalid or expired tokens | MUST | Token Handling |
| Return 403 with `error="insufficient_scope"` when scope is missing | SHOULD | Scope Challenge Handling |
| Include a `scope` parameter in the challenge | SHOULD | Scope Selection Strategy |
| Never pass the client's token on to upstream APIs | MUST NOT | Security Considerations |
| Leave `offline_access` out of the challenge and `scopes_supported` | SHOULD NOT include it | Refresh Tokens |

The client side, covering PKCE, `resource` in both requests, issuer checks and client registration through [Client ID Metadata Documents](entry:oauth-client-id-metadata-document), is covered in [Agent auth and delegated access, step by step](guide:agent-auth-and-delegated-access).

```mermaid
sequenceDiagram
  participant C as MCP client
  participant M as Your MCP server (resource server)
  participant A as Authorization server
  C->>M: POST /mcp (no token)
  M-->>C: 401, WWW-Authenticate: Bearer resource_metadata="...", scope="notes:read"
  C->>M: GET /.well-known/oauth-protected-resource/mcp
  M-->>C: {"resource": ".../mcp", "authorization_servers": ["https://auth..."]}
  C->>A: discovery, then authorization code + PKCE with resource=.../mcp
  A-->>C: access token (aud = .../mcp)
  C->>M: POST /mcp, Authorization: Bearer ...
  M->>M: verify signature, issuer, expiry, audience, scope
  M-->>C: MCP response
```

## Step 1: pick the canonical URI

Everything hangs on one string: your server's **canonical URI**. It is the `resource` value in your metadata, the `resource` parameter clients send, and the audience your tokens must carry. The spec gives `https://mcp.example.com/mcp` and `https://mcp.example.com` as valid examples. It rules out a missing scheme or a fragment, and it says to drop the trailing slash unless the slash means something. Pick one and use it everywhere.

## Step 2: publish protected resource metadata (RFC 9728)

The metadata document is JSON at a well-known path. RFC 9728 puts `/.well-known/oauth-protected-resource` between the host and any path, so an endpoint at `https://mcp.example.com/mcp` publishes at `https://mcp.example.com/.well-known/oauth-protected-resource/mcp`. The fields that matter for MCP:

| Field | RFC 9728 | Notes |
|---|---|---|
| `resource` | REQUIRED | Your canonical URI. Clients MUST NOT use the document if it is not identical to the URL they used (RFC 9728 Section 3.3) |
| `authorization_servers` | OPTIONAL in RFC 9728, but the MCP spec requires at least one | Issuer identifiers of the authorization servers clients can use |
| `scopes_supported` | RECOMMENDED | The MCP spec treats it as the minimal set for basic use. Ask for more through step-up |
| `resource_name` | RECOMMENDED | Human-readable name |
| `bearer_methods_supported` | OPTIONAL | MCP only allows the `Authorization` header. Tokens MUST NOT go in the query string |

A real one is Square's ([Square MCP](entry:square-mcp)), fetched on 2026-10-21. It has `"resource": "https://mcp.squareup.com/mcp"`, `"authorization_servers": ["https://mcp.squareup.com"]` and a long `scopes_supported` list such as `PAYMENTS_READ` and `ORDERS_WRITE`.

## Step 3: challenge, verify, scope

Three responses do the work:

- **No token, or a bad one:** `401` with `WWW-Authenticate: Bearer resource_metadata="<metadata URL>"`, plus `scope="..."` for what this request needs. This header is what starts the client's OAuth flow.
- **Valid token, wrong audience:** also `401` (`invalid_token`). A token for another server is not a valid token here.
- **Valid token, too little scope:** `403` with `error="insufficient_scope"`, the `scope` the operation needs and `resource_metadata` again. The spec asks you to name *all* scopes the operation needs in one challenge, not one at a time. It also says you must account for scope hierarchies when a broader scope implies a narrower one.

## Step 4: build it with the TypeScript SDK

The MCP TypeScript SDK v2 (`@modelcontextprotocol/server`, Apache-2.0) has the resource-server half built in. The SDK's own docs say the old v1 authorization-server helpers are frozen in `@modelcontextprotocol/server-legacy/auth`, and recommend a dedicated identity provider for new servers.

```bash
npm install @modelcontextprotocol/server @modelcontextprotocol/express @modelcontextprotocol/node express jose zod
```

Tested with `@modelcontextprotocol/server` 2.3.1, `@modelcontextprotocol/express` 2.0.2, `@modelcontextprotocol/node` 2.1.1, `express` 5.3.0, `jose` 6.2.13 and `zod` 4.6.7. Upgrade `@modelcontextprotocol/express` together with `@modelcontextprotocol/server`. The SDK docs warn that `@modelcontextprotocol/express` 2.0.1 does not pass `expectedResource` on, so no audience check happens.

```js
// server.mjs: an MCP server that is an OAuth 2.1 resource server (MCP authorization spec 2026-07-28).
import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  createMcpExpressApp,
  getOAuthProtectedResourceMetadataUrl,
  mcpAuthMetadataRouter,
  requireBearerAuth,
} from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler, McpServer, OAuthError, OAuthErrorCode, requireScopes } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const PORT = Number(process.env.PORT ?? 3000);
const mcpServerUrl = new URL(process.env.MCP_URL ?? `http://localhost:${PORT}/mcp`); // canonical URI = token audience
const issuer = process.env.AS_ISSUER;                                                // e.g. https://auth.example.com

// 1. Your authorization server's RFC 8414 metadata (fetched once at startup).
const oauthMetadata = await (await fetch(new URL("/.well-known/oauth-authorization-server", issuer))).json();
if (oauthMetadata.issuer !== issuer) throw new Error("AS metadata issuer mismatch");
const jwks = createRemoteJWKSet(new URL(oauthMetadata.jwks_uri));

// 2. Verify a JWT access token: signature, issuer, expiry and audience (RFC 8707).
async function verifyAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, jwks, { issuer, audience: mcpServerUrl.href });
    return {
      token,
      clientId: payload.client_id ?? payload.sub,
      scopes: typeof payload.scope === "string" ? payload.scope.split(" ") : [],
      expiresAt: payload.exp,
      resource: mcpServerUrl, // jwtVerify already checked aud; report it so expectedResource matches
    };
  } catch (e) {
    throw new OAuthError(OAuthErrorCode.InvalidToken, e.code ?? "invalid token");
  }
}

// 3. The MCP server, with a per-tool scope on the write tool.
const notes = [];
function buildServer() {
  const server = new McpServer({ name: "notes", version: "1.0.0" });
  server.registerTool("list-notes", { description: "List notes", inputSchema: z.object({}) }, async () => ({
    content: [{ type: "text", text: JSON.stringify(notes) }],
  }));
  server.registerTool(
    "add-note",
    { description: "Add a note", inputSchema: z.object({ text: z.string() }), scopeChallenge: requireScopes("notes:write") },
    async ({ text }) => { notes.push(text); return { content: [{ type: "text", text: "ok" }] }; },
  );
  return server;
}

// 4. Wire it up: RFC 9728 metadata + bearer gate in front of /mcp.
const app = createMcpExpressApp({ host: "0.0.0.0", allowedHosts: [mcpServerUrl.hostname] });
app.use(mcpAuthMetadataRouter({
  oauthMetadata,
  resourceServerUrl: mcpServerUrl,
  scopesSupported: ["notes:read", "notes:write"],
  resourceName: "Notes MCP",
}));
const auth = requireBearerAuth({
  verifier: { verifyAccessToken },
  requiredScopes: ["notes:read"],
  resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(mcpServerUrl),
  expectedResource: mcpServerUrl,
});
const node = toNodeHandler(createMcpHandler(buildServer));
app.all("/mcp", auth, (req, res) => void node(req, res, req.body));
app.listen(PORT, () => console.error(`MCP server on ${mcpServerUrl}`));
```

What each piece does:

- `mcpAuthMetadataRouter` serves the RFC 9728 document at the path-aware location (`/.well-known/oauth-protected-resource/mcp`). It also mirrors your authorization server's metadata at `/.well-known/oauth-authorization-server` for clients that probe your origin.
- `requireBearerAuth` answers `401 invalid_token` for missing, malformed or expired tokens and `403 insufficient_scope` when `requiredScopes` is not met. Both carry the `resource_metadata` challenge. It also rejects a token whose `expiresAt` is unset, so always fill it in.
- `jwtVerify` with `issuer` and `audience` is the audience check the spec requires. `expectedResource` is the SDK's own second check on the `resource` your verifier reports.
- `scopeChallenge: requireScopes("notes:write")` gives one tool a stricter scope. The SDK runs it before the tool, and before input validation. Scope hierarchies are your job: the SDK docs say it "does not infer hierarchies".
- If your tokens are opaque rather than JWTs, replace `jwtVerify` with an RFC 7662 introspection call. Check `active`, `aud` and `exp` from the response, the same way.

On Cloudflare Workers, Deno, Bun or Hono, the same gate is `requireBearerAuth` from `@modelcontextprotocol/server`. It works on web-standard `Request` and `Response`, and `oauthMetadataResponse` serves the metadata.

## Step 5: test it without a real identity provider

To test, you need an authorization server that publishes metadata and a JWKS and can mint tokens. This short stand-in (test only, never deploy it) does exactly that with `jose`:

```js
// fake-as.mjs: test-only stand-in for an authorization server (RFC 8414 metadata + JWKS + a /mint endpoint).
import http from "node:http";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
const { publicKey, privateKey } = await generateKeyPair("RS256");
const jwk = { ...(await exportJWK(publicKey)), kid: "k1", alg: "RS256", use: "sig" };
const issuer = "http://localhost:9000";
http.createServer(async (req, res) => {
  const u = new URL(req.url, issuer);
  const json = (o) => { res.setHeader("content-type", "application/json"); res.end(JSON.stringify(o)); };
  if (u.pathname === "/.well-known/oauth-authorization-server") return json({
    issuer, authorization_endpoint: issuer + "/authorize", token_endpoint: issuer + "/token",
    jwks_uri: issuer + "/jwks.json", response_types_supported: ["code"], code_challenge_methods_supported: ["S256"] });
  if (u.pathname === "/jwks.json") return json({ keys: [jwk] });
  if (u.pathname === "/mint") {  // ?aud=...&scope=...
    const t = await new SignJWT({ scope: u.searchParams.get("scope"), client_id: "test-client" })
      .setProtectedHeader({ alg: "RS256", kid: "k1" }).setIssuer(issuer).setSubject("user-1")
      .setAudience(u.searchParams.get("aud")).setIssuedAt().setExpirationTime("5m").sign(privateKey);
    res.end(t); return;
  }
  res.statusCode = 404; res.end();
}).listen(9000);
```

```bash
node fake-as.mjs &
AS_ISSUER=http://localhost:9000 node server.mjs &
M=http://localhost:3000/mcp
H=(-H 'content-type: application/json' -H 'accept: application/json, text/event-stream')
INIT='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}'

curl -si -X POST $M "${H[@]}" -d "$INIT"                                   # 1. no token
curl -s http://localhost:3000/.well-known/oauth-protected-resource/mcp      # 2. metadata
T=$(curl -s "http://localhost:9000/mint?aud=https://other.example.com&scope=notes:read")
curl -si -X POST $M "${H[@]}" -H "authorization: Bearer $T" -d "$INIT"     # 3. wrong audience
```

The real responses, from a run on 2026-10-21:

```http
# 1. no token
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="Missing Authorization header", scope="notes:read", resource_metadata="http://localhost:3000/.well-known/oauth-protected-resource/mcp"

# 2. metadata
{"resource":"http://localhost:3000/mcp","authorization_servers":["http://localhost:9000"],"scopes_supported":["notes:read","notes:write"],"resource_name":"Notes MCP"}

# 3. token minted for https://other.example.com
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="ERR_JWT_CLAIM_VALIDATION_FAILED", scope="notes:read", resource_metadata="http://localhost:3000/.well-known/oauth-protected-resource/mcp"

# 4. right audience, scope "profile" only
HTTP/1.1 403 Forbidden
WWW-Authenticate: Bearer error="insufficient_scope", error_description="Insufficient scope", scope="notes:read", resource_metadata="..."

# 5. notes:read token: initialize and list-notes return 200

# 6. notes:read token calling add-note
HTTP/1.1 403 Forbidden
www-authenticate: Bearer error="insufficient_scope", error_description="Insufficient scope", scope="notes:write", resource_metadata="..."

# 7. token with "notes:read notes:write": add-note returns 200 {"result":{"content":[{"type":"text","text":"ok"}]}}
```

For a full client-side check, point the MCP Inspector or a client from [Connect an agent to a remote MCP server](guide:connect-an-agent-to-a-remote-mcp-server) at it once a real authorization server is behind it. The test server above has no `/authorize` or `/token`, so it cannot complete a browser flow.

## Step 6: calling upstream APIs without token passthrough

Many MCP servers wrap another API. The spec is blunt here. The token the client sent you is for *you*. You **MUST NOT** pass it through, and the upstream API needs "a separate token, issued by the upstream authorization server". You have two options:

1. **Your server is an OAuth client of the upstream API.** Store the user's upstream tokens server-side, for example in a vault, keyed to the MCP user. [Agent auth and delegated access](guide:agent-auth-and-delegated-access) shows this pattern.
2. **Token exchange ([RFC 8693](entry:rfc-8693)), when the same authorization server, or a federated one, protects both.** Your server trades the inbound token for a new one aimed at the upstream resource. The RFC's own example request:

```http
POST /as/token.oauth2 HTTP/1.1
Host: as.example.com
Authorization: Basic cnMwODpsb25nLXNlY3VyZS1yYW5kb20tc2VjcmV0
Content-Type: application/x-www-form-urlencoded

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Atoken-exchange
&resource=https%3A%2F%2Fbackend.example.com%2Fapi
&subject_token=accVkjcJyb4BWCxGsndESCJQbdFMogUC5PbRDqceLTC
&subject_token_type=urn%3Aietf%3Aparams%3Aoauth%3Atoken-type%3Aaccess_token
```

The `resource` (or `audience`) parameter names the upstream service, so the new token is bound to it. Whether your authorization server supports token exchange, and for which clients, depends on the product. Check before you design around it. [Cross App Access](entry:cross-app-access) (ID-JAG), for enterprise SSO, is built on token exchange.

## Beyond the core: authorization extensions

The MCP project keeps optional, composable extensions in [MCP Authorization Extensions](entry:mcp-ext-auth). On 2026-10-21 the repo listed **Enterprise-Managed Authorization** as stable and **Client Credentials** (machine-to-machine, no user present) as a draft. Neither changes what your server must do as a resource server. They change how clients get tokens.

## Test it like an attacker

Once the auth works, try to break the tools behind it: prompt injection that makes an authorized user's agent misuse a tool, or object-level authorization gaps between users. [Open-source red-teaming tools for LLM apps and agents](comparison:llm-red-teaming-tools) compares tools that automate this, including MCP-specific tests.

## Checklist

- [ ] One canonical URI, used as `resource`, in the metadata and as the token audience.
- [ ] RFC 9728 document served at the path-aware well-known URL, with `resource` exactly equal to the endpoint URL and at least one `authorization_servers` entry.
- [ ] `401` with `resource_metadata` and `scope` for missing, invalid, expired or wrong-audience tokens.
- [ ] Signature, issuer, `exp` and `aud` checked on every request (or introspection with the same checks).
- [ ] `403 insufficient_scope` naming every scope the operation needs, with per-tool scopes where writes are riskier than reads.
- [ ] No `offline_access` in `scopes_supported` or challenges.
- [ ] Tokens never logged, never in query strings, never forwarded upstream.
- [ ] HTTPS everywhere outside local testing. The spec requires HTTPS for all authorization server endpoints.
- [ ] Host header validation on (`allowedHosts` in `createMcpExpressApp`).

## Troubleshooting

- **Client never starts the OAuth flow:** the 401 is missing `WWW-Authenticate` or `resource_metadata`, or a proxy strips the header. Check with `curl -i`.
- **Client rejects your metadata:** `resource` differs from the URL the client used, often because of a trailing slash or `http` versus `https` behind a proxy. Set `MCP_URL` to the public URL.
- **Every token gets `invalid_token`:** the audience in tokens does not equal your canonical URI. Configure the authorization server to put the `resource` value into `aud`, or set its default resource. Also check that `exp` is present.
- **Audience check silently not happening (Express):** `@modelcontextprotocol/express` is older than your `@modelcontextprotocol/server`. Upgrade both together.
