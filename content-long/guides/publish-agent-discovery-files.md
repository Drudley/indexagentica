---
id: publish-agent-discovery-files
type: guide
title: Make your site and API discoverable by agents
summary: "Publish the files agents look for: an RFC 9727 API catalog, an AI Catalog, an MCP Server Card, an Agent Skills index and llms.txt. Minimal valid examples, the headers each spec asks for, each spec's real status, and how to check the result with our discovery probe."
description: "A publisher-side guide to agent discovery files. It gives a minimal, validated example of each file and where it goes: /.well-known/api-catalog (RFC 9727, a Linkset served as application/linkset+json), /.well-known/ai-catalog.json (AI Catalog, application/ai-catalog+json), an MCP Server Card at <mcp-url>/server-card with the required CORS headers, /.well-known/agent-skills/index.json with SHA-256 digests, and llms.txt. It states each spec's status as of 2026-11-03, from IETF Proposed Standard to draft and proposal, and lists the HTTP headers to set. It shows how to check the result: JSON parsing, media types, the Server Card JSON Schema, and the discover-agent-interfaces probe. All examples were served from a local fixture and checked on 2026-11-03."
author: Agentica Author
difficulty: intermediate
time_estimate: 45 min
prerequisites:
  - "Control over your site's web server or CDN headers (media types, Link and CORS headers)"
  - "Python 3 for the probe, and Node.js if you want to validate the Server Card with the official schema"
tags: [discovery, well-known, api-catalog, ai-catalog, mcp, server-card, agent-skills, llms-txt, publishing]
entries: [rfc-9727, ai-catalog, mcp-server-cards, agent-skills-discovery-rfc, llms-txt, agent-skills-spec, a2a-protocol, rfc-9728]
related: [discover-agent-interfaces, publish-an-mcp-server, add-oauth-to-your-mcp-server, connect-an-agent-to-a-remote-mcp-server, give-your-coding-agent-up-to-date-docs]
sources:
  - title: "RFC 9727: api-catalog, a well-known URI and link relation to help discovery of APIs"
    url: https://www.rfc-editor.org/rfc/rfc9727.html
    accessed: 2026-11-03
  - title: RFC 9727 on the IETF Datatracker (status)
    url: https://datatracker.ietf.org/doc/rfc9727/
    accessed: 2026-11-03
  - title: "RFC 9264: Linkset media types"
    url: https://www.rfc-editor.org/rfc/rfc9264.html
    accessed: 2026-11-03
  - title: AI Catalog specification (Agent-Card/ai-catalog)
    url: https://github.com/Agent-Card/ai-catalog/blob/main/specification/ai-catalog.md
    accessed: 2026-11-03
  - title: AI Catalog published draft
    url: https://ai-catalog.io/
    accessed: 2026-11-03
  - title: "SEP-2127: MCP Server Cards"
    url: https://modelcontextprotocol.io/seps/2127-mcp-server-cards
    accessed: 2026-11-03
  - title: "MCP Server Cards extension repository (README, schema, examples)"
    url: https://github.com/modelcontextprotocol/ext-server-card
    accessed: 2026-11-03
  - title: "MCP Server Cards: discovery and HTTP requirements"
    url: https://github.com/modelcontextprotocol/ext-server-card/blob/main/docs/discovery.md
    accessed: 2026-11-03
  - title: MCP Server Card JSON Schema
    url: https://github.com/modelcontextprotocol/ext-server-card/blob/main/schema.json
    accessed: 2026-11-03
  - title: Agent Skills Discovery via Well-Known URIs (v0.2.0 draft)
    url: https://github.com/cloudflare/agent-skills-discovery-rfc
    accessed: 2026-11-03
  - title: Agent Skills specification
    url: https://agentskills.io/specification
    accessed: 2026-11-03
  - title: The /llms.txt file, v2
    url: https://llmstxt.org/
    accessed: 2026-11-03
last_verified: 2026-11-03
published: 2026-11-03
---

## What agents look for

An agent that arrives at your domain has a few well-known places to check. Each file answers a different question:

| File | Answers | Where | Status on 2026-11-03 |
|---|---|---|---|
| [API catalog](entry:rfc-9727) | Which HTTP APIs do you publish, and where are their descriptions? | `/.well-known/api-catalog` | IETF RFC 9727, Proposed Standard (June 2025) |
| [AI Catalog](entry:ai-catalog) | Which agent artifacts (MCP servers, A2A agents, skills, plugins) do you offer? | `/.well-known/ai-catalog.json` (optional), or any URL you link to | `specVersion` 1.0, Agent Card Working Group. Not a standards-body spec; the copy at ai-catalog.io is an editor's draft |
| [MCP Server Card](entry:mcp-server-cards) | How do I connect to your remote MCP server? | `<your MCP URL>/server-card` | SEP-2127 is **Final** (merged 6 Oct 2026). The extension repository's README still says "Experimental", and the `$schema` URL returned 404 when we checked |
| [Agent Skills index](entry:agent-skills-discovery-rfc) | Which [Agent Skills](entry:agent-skills-spec) can I download? | `/.well-known/agent-skills/index.json` | Draft v0.2.0 (updated 2026-03-12) |
| [llms.txt](entry:llms-txt) | Where is the LLM-readable documentation? | `/llms.txt` or a subpath such as `/docs/llms.txt` | A proposal (v2), not a standard |

You don't need all five. If you run a public API, start with the API catalog. If you run a remote MCP server, add a Server Card and an AI Catalog that points to it. Publish a skills index only if you have skills you want agents to install. llms.txt is cheap and helps any documentation site.

The examples below are for a made-up company, `example.com`, with one REST API, one remote MCP server and one skill. They were served together from a local test server and checked as described under "Check your files" below.

## The API catalog (RFC 9727)

A publisher that supports the URI "SHALL resolve an HTTPS GET request to /.well-known/api-catalog and return an API catalog document". It also SHALL answer a HEAD request with a `Link` header using the `api-catalog` relation. The catalog "MUST include hyperlinks to API endpoints" and MUST be a Linkset, `application/linkset+json` (RFC 9264). It SHOULD carry the profile `https://www.rfc-editor.org/info/rfc9727`.

This example combines the RFC's two appendix patterns. The first context lists the APIs as `item` links (Appendix A.2). The second describes one API with the RFC 8631 relations `service-desc`, `service-doc` and `status` (Appendix A.1).

```json
{
  "linkset": [
    {
      "anchor": "https://example.com/.well-known/api-catalog",
      "item": [
        {"href": "https://api.example.com/v1/"}
      ]
    },
    {
      "anchor": "https://api.example.com/v1/",
      "service-desc": [
        {"href": "https://api.example.com/v1/openapi.json", "type": "application/json"}
      ],
      "service-doc": [
        {"href": "https://example.com/docs/api/", "type": "text/html"}
      ],
      "status": [
        {"href": "https://api.example.com/v1/health", "type": "application/json"}
      ]
    }
  ]
}
```

Serve it with:

```http
Content-Type: application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"
Link: </.well-known/api-catalog>; rel="api-catalog"
```

The RFC also lets you point to the catalog from any page with a `Link: </.well-known/api-catalog>; rel="api-catalog"` header or an `<a rel="api-catalog">` link. Keep it to public APIs. The RFC's security section asks publishers to audit a public catalog so that no internal-only APIs or internal domains are included.

## The AI Catalog

An AI Catalog is a JSON document with `specVersion` and `entries`. Each entry has an `identifier`, a `type` (the media type of the artifact) and exactly one of `url` or `data`. That is the spec's Level 1, "Minimal". Adding a `host` object gives Level 2, "Discoverable". Level 3 adds signed trust manifests, which this guide doesn't cover.

```json
{
  "specVersion": "1.0",
  "host": {
    "displayName": "Example Corp"
  },
  "entries": [
    {
      "identifier": "urn:air:example.com:mcp:invoices",
      "type": "application/mcp-server-card+json",
      "url": "https://example.com/mcp/server-card"
    },
    {
      "identifier": "urn:air:example.com:skill:invoice-lookup",
      "type": "application/agent-skills+md",
      "url": "https://example.com/.well-known/agent-skills/invoice-lookup/SKILL.md"
    }
  ]
}
```

Media types in use here: `application/mcp-server-card+json` for a Server Card, and `application/agent-skills+md` for a single `SKILL.md`. The spec notes the `+md` suffix is still "to be registered". It also lists `application/a2a-agent-card+json` for [A2A](entry:a2a-protocol) agents and `+zip` or `+gzip` types for skill bundles. Serve the file as `application/ai-catalog+json`.

Hosts "MAY" use `/.well-known/ai-catalog.json`, and that location is optional. The spec's discovery order for agents is a `Link` header with `rel="ai-catalog"`, then an HTML `<link rel="ai-catalog">`, then the well-known URI. The Server Card extension's discovery flow starts by fetching `/.well-known/ai-catalog.json`. If you publish a Server Card, put the catalog there as well, and add a pointer from your pages:

```html
<!doctype html>
<html><head><title>Example Corp</title>
<link rel="ai-catalog" href="/.well-known/ai-catalog.json" type="application/ai-catalog+json">
<link rel="describedby" href="/llms.txt">
</head><body>
<p><a href="/.well-known/api-catalog" rel="api-catalog">Example Corp APIs</a></p>
</body></html>
```

## The MCP Server Card

A Server Card describes a remote MCP server: its name, version and endpoints. It does not list tools; those come from the server itself. The extension's discovery document reserves `GET <streamable-http-url>/server-card` as the recommended location. Cards are found through AI Catalog entries of type `application/mcp-server-card+json`. The extension considered `/.well-known/mcp/server-card` and did not recommend it, because a single server's card isn't site-wide metadata. Clients SHOULD request the card with `Accept: application/mcp-server-card+json`.

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
  "name": "com.example/invoices",
  "version": "1.4.0",
  "title": "Example Corp Invoices",
  "description": "Read-only MCP server for looking up Example Corp invoices.",
  "websiteUrl": "https://example.com/docs/mcp/",
  "remotes": [
    {
      "type": "streamable-http",
      "url": "https://example.com/mcp",
      "headers": [
        {
          "name": "Authorization",
          "description": "Bearer token from your Example Corp dashboard.",
          "isRequired": true,
          "isSecret": true
        }
      ],
      "supportedProtocolVersions": ["2025-11-25"]
    }
  ]
}
```

`$schema`, `name`, `version` and `description` are required. `headers` lists the headers a client must send. Mark secrets with `isSecret` and never put a real value there. The discovery document says cards MUST NOT include credentials, internal topology or private endpoints, and clients must not treat a card as authoritative for security decisions.

The card endpoint MUST send these CORS headers, and SHOULD send `Cache-Control` and an `ETag` and answer `If-None-Match` with 304:

```http
Content-Type: application/mcp-server-card+json
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
Access-Control-Allow-Headers: Content-Type, If-None-Match
Access-Control-Expose-Headers: ETag
Cache-Control: public, max-age=3600
```

Hosted cards MUST be served over HTTPS (TLS 1.2 or later) in production. If you're also listing the server in the MCP Registry, see [publishing an MCP server](guide:publish-an-mcp-server). The Registry's `server.json` and the Server Card are separate documents.

## The Agent Skills index

Publishers MUST serve the index at `/.well-known/agent-skills/index.json` as `application/json`. It needs a top-level `$schema` and a `skills` array. Each skill has `name`, `type` (`skill-md` or `archive`), `description`, `url` and `digest`. The digest is `sha256:` followed by the SHA-256 of the artifact's raw bytes, in lowercase hex. Clients MUST verify the digest before using the file. Names follow the Agent Skills rules: 1 to 64 lowercase letters, digits and hyphens, with no leading, trailing or double hyphens.

```json
{
  "$schema": "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  "skills": [
    {
      "name": "invoice-lookup",
      "type": "skill-md",
      "description": "Look up an Example Corp invoice by number with the read-only Invoices API. Use when a user asks about the status or total of an Example Corp invoice.",
      "url": "/.well-known/agent-skills/invoice-lookup/SKILL.md",
      "digest": "sha256:7aa74d22d8c80b32667021087950b36e5e273eaee0ca5d5f8f351b10c1210279"
    }
  ]
}
```

The skill it points to, served as `text/markdown`:

```markdown
---
name: invoice-lookup
description: Look up an Example Corp invoice by number with the read-only Invoices API. Use when a user asks about the status or total of an Example Corp invoice.
---

# Invoice lookup

1. Call `GET https://api.example.com/v1/invoices/{number}` with the user's API key.
2. Report `status`, `total` and `due_date`. Never create or change invoices.
```

Compute the digest from the exact bytes you serve, and recompute it whenever the file changes:

```bash
echo "sha256:$(sha256sum .well-known/agent-skills/invoice-lookup/SKILL.md | cut -d' ' -f1)"
```

The `$schema` URI is an opaque identifier, and the draft says it "does not need to be resolvable". Skills with scripts or other files go in a `.tar.gz` or `.zip` with `type: "archive"`, served as `application/gzip` or `application/zip`. The draft says clients SHALL NOT run bundled scripts by default. Agents load skill text straight into their context, so put nothing in a skill you wouldn't want an agent to act on.

## llms.txt

llms.txt is Markdown. The only required part is an H1 with the site or project name. Then come an optional blockquote summary, optional prose, and H2 sections of `[name](url): notes` links. A section named "Optional" holds links an agent can skip. Version 2 of the proposal allows the file at a subpath, where it covers the pages under that path. It suggests markdown copies of pages at `page.html.md` or `page.md`, announced with `rel="alternate" type="text/markdown"`. The covering llms.txt is announced with `rel="describedby"`.

```markdown
# Example Corp

> Example Corp sells invoicing software. This file points agents at the API reference, the MCP server and the agent skill.

## Docs

- [Invoices API reference](https://example.com/docs/api/invoices.md): read-only endpoints, auth and errors
- [MCP server](https://example.com/docs/mcp.md): remote endpoint, tools and scopes

## Optional

- [Changelog](https://example.com/changelog.md)
```

The proposal doesn't set a media type; we served it as `text/markdown`.

## Check your files

1. **Parse every JSON file.** `python3 -m json.tool < .well-known/ai-catalog.json > /dev/null` fails loudly on a stray comma.
2. **Check the headers.** `curl -sI https://example.com/.well-known/api-catalog` should show the Linkset media type with the RFC 9727 profile, and the `Link` header. Run the same check for the card's CORS headers and the AI Catalog's media type.
3. **Validate the Server Card against the official schema.** Clone `modelcontextprotocol/ext-server-card` and run `npm install`. `npm run validate` checks the repository's own examples (7 passed for us). To check your card, compile `#/$defs/ServerCard` from `schema.json` with Ajv 2020, as the repository's `scripts/validate-examples.ts` does. Our card passed. A card without `description` was rejected with "must have required property 'description'".
4. **Recompute skill digests** and compare them with the index.
5. **Run the probe.** The [discover-agent-interfaces](skill:discover-agent-interfaces) skill's `probe_site.py` fetches what an agent would fetch. It treats every result as untrusted.

```bash
python3 scripts/probe_site.py https://example.com --no-mcp-guess
```

Against our local copy of these files, version 1.1.1 of the probe reported:

```text
AI Catalog: http://127.0.0.1:8787/.well-known/ai-catalog.json (specVersion 1.0), 2 entries
  - application/mcp-server-card+json  urn:air:example.com:mcp:invoices  http://127.0.0.1:8787/mcp/server-card
      MCP remote: http://127.0.0.1:8787/mcp (streamable-http)
  - application/agent-skills+md  urn:air:example.com:skill:invoice-lookup  http://127.0.0.1:8787/.well-known/agent-skills/invoice-lookup/SKILL.md
API catalog (RFC 9727): http://127.0.0.1:8787/.well-known/api-catalog  APIs=['https://api.example.com/v1/']  descriptions=['https://api.example.com/v1/openapi.json', 'http://127.0.0.1:8787/docs/api/']
Agent Skills index: http://127.0.0.1:8787/.well-known/agent-skills/index.json  1 skills
  - invoice-lookup (skill-md)  http://127.0.0.1:8787/.well-known/agent-skills/invoice-lookup/SKILL.md
llms.txt: http://127.0.0.1:8787/llms.txt  "Example Corp"  2 sections, 3 links, 407 bytes
```

For the local run, our test server rewrote `https://example.com` to the local address. There was no MCP server behind the card, so the probe also reported "no MCP endpoint found here". The probe counts APIs from `item` links. A catalog that uses only the Appendix A.1 pattern showed `APIs=[]` and listed the descriptions only, which is one more reason to include an `item` list.

## Before you publish

- Everything in these files is public and will be read by machines that act on it. Leave out internal hosts, private endpoints, tokens and anything you wouldn't put on your homepage.
- Each file can go stale: the version in the card, digests in the index, links in llms.txt. Generate them in your build rather than by hand.
- If your API or MCP server uses OAuth, publish protected resource metadata ([RFC 9728](entry:rfc-9728)) as well. See [adding OAuth to an MCP server](guide:add-oauth-to-your-mcp-server).
- Several of these specs are drafts. Check each one again when you update the files.
