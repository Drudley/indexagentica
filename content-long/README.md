# Long-form content

Guides, comparisons, stacks and downloadable skills. Each item is one Markdown file with YAML front matter. Directory entries in `content/` are separate and stay as they are.

| Type (`type:`) | Folder (locked) | Route | File |
|---|---|---|---|
| `guide` | `content-long/guides/` | `/guides/<id>/` | `<id>.md` |
| `comparison` | `content-long/compare/` | `/compare/<id>/` | `<id>.md` |
| `stack` | `content-long/stacks/` | `/stacks/<id>/` | `<id>.md` |
| `skill` | `content-long/skills/` | `/skills/<id>/` (+ raw `SKILL.md` and a `.zip`) | `<id>/SKILL.md` plus optional files (`scripts/`, `references/`, `assets/`, ...) that ship in the zip |

- `id` is a kebab-case slug (`^[a-z0-9]+(-[a-z0-9]+)*$`). It must equal the filename (or the skill folder name) and be **unique across all four types**.
- `status: draft` items are validated but not published. If `status` is omitted, the item is published.
- Validate before finishing: `node scripts/validate.mjs` (validates everything; zero dependencies). You can also pass a path: `node scripts/validate.mjs content-long/guides/my-guide.md`.
- Schemas: [`schema/longform/`](../schema/longform/) (`guide`, `comparison`, `stack`, `skill`).

## Front matter: fields shared by guide, comparison and stack

| Field | Required | Notes |
|---|---|---|
| `id` | yes | == filename |
| `type` | yes | `guide` / `comparison` / `stack`; must match the folder |
| `title` | yes | 3-120 chars |
| `summary` | yes | 1-2 sentences, plain text, 20-300 chars |
| `author` | yes | e.g. `Agentica Author` |
| `last_verified` | yes | `YYYY-MM-DD`; when the facts were last checked against the sources |
| `sources` | yes for guide and comparison (≥1); optional for stack | list of `{title, url, accessed}`; `accessed` is `YYYY-MM-DD` |
| `tags` | no | kebab-case list |
| `entries` | no | directory entry ids discussed (each must exist); drives "Featured in" links on entry pages |
| `related` | no | ids of other long-form items (each must exist) |
| `published`, `updated` | no | `YYYY-MM-DD`; order: published ≤ updated, published ≤ last_verified; no future dates |
| `status` | no | `draft` or `published` (default) |
| `description` | no | plain text ≤1000 chars, for meta tags |

**guide** also: `difficulty` (`beginner`/`intermediate`/`advanced`), `prerequisites` (list of strings), `time_estimate` (`"20 min"`, `"1.5 h"`). All optional.

**comparison** also (all required except `verdict`):
- `subjects`: ≥2 entry ids being compared.
- `criteria`: column names, in display order.
- `rows`: `{<subject id>: {<criterion>: "value"}}`. There must be exactly one row per subject, and each row needs exactly the criteria as keys (use `"n/a"` or `"unknown"` where needed).
- `verdict`: optional bottom line.
- The build emits the table as JSON in the API and renders it as an HTML table, so don't repeat it in the body.

**stack** also: `use_case` (required, 1-2 sentences) and `components` (required, ≥1): a list of `{role, entry, why}`, where `entry` must exist.

## Skills (`content-long/skills/<id>/SKILL.md`)

These follow the [Agent Skills spec](https://agentskills.io/specification). The reference validator rejects any top-level key other than `name`, `description`, `license`, `compatibility`, `allowed-tools` and `metadata`, so **Index Agentica fields go under `metadata`**. The spec says metadata values must be **strings**.

| Field | Required | Notes |
|---|---|---|
| `name` | yes | spec: ≤64 chars, lowercase/digits/single hyphens, **== folder name**. This is the id |
| `description` | yes | spec: ≤1024 chars; what it does and when to use it |
| `license`, `compatibility`, `allowed-tools` | no | spec fields |
| `metadata.author` | yes | string |
| `metadata.last_verified` | yes | `YYYY-MM-DD` |
| `metadata.title`, `metadata.summary` | no | defaults: `name`, `description` |
| `metadata.tags`, `metadata.entries`, `metadata.related` | no | **comma-separated** strings, e.g. `entries: llms-txt, model-context-protocol` |
| `metadata.sources` | no | **space-separated** URLs |
| `metadata.version`, `metadata.status`, `metadata.published`, `metadata.updated` | no | strings; quote versions (`"1.0"`) |

Other string keys under `metadata` are allowed. The SKILL.md body is served raw to agents, so it must use **absolute `https://` links** instead of the `entry:` scheme below.

## Body (guide, comparison, stack)

- GitHub-flavored Markdown: headings (start at `##`, because the title is rendered as the page's `h1`), lists, tables, and fenced code with a language tag (```` ```bash ````).
- Diagrams: ```` ```mermaid ```` fences. The site has no JavaScript, so they render as `<pre class="mermaid">` with the source visible.
- **Linking:** `[text](entry:<entry-id>)` links a directory entry. `[text](guide:<id>)`, `(comparison:<id>)`, `(stack:<id>)` and `(skill:<id>)` link long-form items. Validate checks that every target exists and has the right type. The build rewrites them to site URLs. Normal `https://` links are fine too.
- The raw `.md` of every item is served at `/<route>/<id>.md` with its front matter; scheme links are rewritten to absolute `https://indexagentica.com/...` URLs there, in the API and in llms-full.txt.

## Where it is published

Drafts appear nowhere (pages, raw files, API, llms*.txt, sitemap). Published items get:

| Output | Path |
|---|---|
| Index pages | `/guides/`, `/compare/`, `/stacks/`, `/skills/` |
| Item page (no-JS HTML; comparison table and stack components rendered from front matter) | `/<route>/<id>/` |
| Raw markdown with front matter | `/<route>/<id>.md` |
| Skill files | `/skills/<id>/SKILL.md` (plus any other files in the folder), `/skills/<id>.zip` (unpacks to `<id>/...`) |
| JSON | `/api/longform.json` (all items), `/api/longform/<route>.json` (per type), `/api/longform/<route>/<id>.json` (front matter, raw markdown, HTML, comparison rows / stack components, links) |
| llms.txt / llms-full.txt | one section per type; llms-full.txt has the full markdown |

Entry pages list the published items that reference them (`entries`, comparison `subjects`, stack `components`, and `entry:` links in the body) under **Guides & comparisons**, and `/api/entries/<id>.json` has the same list as `longform`.

Long-form is written by maintainers; there is no issue form for it. Preview drafts locally with `INCLUDE_DRAFTS=1 node scripts/build.mjs` (never set this in CI). The daily upkeep check also covers published items: their `sources`, external links in the body, and freshness (`last_verified`, else `updated`, else `published`, older than 90 days).

## YAML subset (zero-dependency parser: `scripts/lib/yaml.mjs`)

- Allowed: nested block mappings and lists; `- key: value` list items; flow lists and maps (`[a, b]`, `{k: v}`); plain, `'single'` and `"double"` quoted strings; block scalars `|` `|-` `>` `>-`; `#` comments.
- Every scalar is a **string**. `yes` and `10` stay strings, and an empty value is null.
- Quote any value that contains `: ` or starts with one of `& * ! % @ \` [ { | > ' "` (when not meant as YAML syntax). Indent with spaces, not tabs.
- Not supported: anchors and aliases, tags, multiple documents, complex `?` keys. Duplicate keys are rejected.

## Examples (all `status: draft`)

- Guide: [`guides/add-mcp-servers-to-claude-code.md`](guides/add-mcp-servers-to-claude-code.md)
- Comparison: [`compare/web-search-apis.md`](compare/web-search-apis.md)
- Stack: [`stacks/coding-agent-starter.md`](stacks/coding-agent-starter.md)
- Skill: [`skills/indexagentica-lookup/SKILL.md`](skills/indexagentica-lookup/SKILL.md)

Minimal comparison front matter:

```yaml
---
id: example-comparison
type: comparison
title: Example A vs B
summary: One or two sentences on what is compared and for whom.
author: Agentica Author
subjects: [tavily-api, exa-api]
criteria: [Endpoints, Official MCP server]
rows:
  tavily-api: {Endpoints: "search, extract", Official MCP server: "yes"}
  exa-api:
    Endpoints: search, contents
    Official MCP server: "yes"
sources:
  - {title: Tavily docs, url: "https://docs.tavily.com", accessed: 2026-10-02}
last_verified: 2026-10-02
---
```
