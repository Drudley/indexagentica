# Contributing to Index Agentica

Index Agentica is built by agents, for agents. AI agents are first-class contributors. Humans are welcome too.
There are two ways to submit, and a human maintainer merges everything; nothing is merged automatically.
Machine-readable version of this guide: <https://indexagentica.com/contribute.json>.

## Rules

- One entry per file at `content/<category>/<id>.json`. `id` is kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), unique across all categories, and **equal to the filename**.
- `category` **equals the folder**. Current categories are listed in [`schema/categories.json`](schema/categories.json).
- Required fields: `id`, `name`, `category`, `summary` (one neutral line, 10-200 chars), `url`, `added` (`YYYY-MM-DD`). Unknown fields are rejected.
- List the URLs you used to verify the facts in `sources`. **Don't guess:** omit any field you can't verify.
- Every id in `related` must already exist.
- Field reference: [`content/README.md`](content/README.md) · schema: [`schema/entry.schema.json`](schema/entry.schema.json) · <https://indexagentica.com/schema/>

## Path A: pull request (preferred)

1. Fork [Drudley/indexagentica](https://github.com/Drudley/indexagentica) and create a branch (e.g. `add-<id>`).
2. Copy the template below to `content/<category>/<id>.json`, fill it in, delete optional fields you can't verify, and set `added` to today's date.
3. Validate (Node ≥ 18, zero dependencies):
   ```bash
   node scripts/validate.mjs
   ```
   Every problem is reported with the file, line, field and how to fix it.
4. Open a PR and fill in the template. If you are an agent, say so and who you act for. CI re-runs validation and posts the same errors as annotations on the diff and in the job summary.

### Entry template ([`schema/entry.template.json`](schema/entry.template.json))

```json
{
  "id": "example-tool",
  "name": "Example Tool",
  "category": "tools",
  "summary": "One neutral line (10-200 chars) saying what it does for agents.",
  "description": "Optional longer **markdown** description. Delete fields you cannot verify.",
  "url": "https://example.com",
  "repo": "https://github.com/example/example-tool",
  "docs": "https://example.com/docs",
  "tags": ["example", "web-search"],
  "license": "MIT",
  "pricing": "freemium",
  "status": "active",
  "agent_access": {
    "llms_txt": "https://example.com/llms.txt",
    "openapi": "https://example.com/openapi.json",
    "mcp_endpoint": "https://example.com/mcp",
    "auth": "api-key",
    "notes": "Send the key as a Bearer token."
  },
  "related": ["model-context-protocol"],
  "sources": ["https://example.com", "https://github.com/example/example-tool"],
  "added": "2026-10-02",
  "submitted_by": "ExampleAgent (agent) for @username"
}
```

## Path B: structured issue

- **Humans:** open the [New entry form](https://github.com/Drudley/indexagentica/issues/new?template=new-entry.yml).
- **Agents via the API:** `POST https://api.github.com/repos/Drudley/indexagentica/issues` with title `[New entry]: <name>` and a body made of `### <Label>` sections, exactly as the form renders them (`_No response_` for empty optional fields). The full body template and field list are in [`contribute.json`](https://indexagentica.com/contribute.json) under `contribute.issue.api`. With the GitHub CLI: `gh issue create -R Drudley/indexagentica --title "[New entry]: <name>" --body-file body.md`.
- **Review:** a maintainer reviews the issue and adds the `approved` label (only collaborators can add labels). The [submission workflow](.github/workflows/submission.yml) then writes `content/<category>/<id>.json`, validates it and opens a PR that closes the issue. If validation fails, it comments the problems on the issue and labels it `needs-changes`. Edit the issue, and a maintainer re-adds `approved` to retry.
- **Maintainers:** the bot-opened PR gets a `CI / dispatched` commit status from a CI run the workflow triggers itself. GitHub may also show the regular `pull_request` CI run as "approval required" for bot-created PRs; approving it is optional. Review, then merge by hand.

## Corrections and removals

Use the [Correction / removal form](https://github.com/Drudley/indexagentica/issues/new?template=correction.yml), or edit the JSON in a PR and set `updated` to today. If you only re-checked an entry and it's still correct, set `last_verified` to today. Renaming an `id` breaks links: avoid it unless the old one is wrong, and update every `related` reference.

## Inclusion policy

- Useful to AI agents or people building them.
- Publicly reachable, with facts verifiable from the listed sources.
- Neutral summaries; no spam, affiliate links or SEO-only pages. Disclose any affiliation in the PR.
- Deprecated resources stay listed with `"status": "deprecated"` when they're still widely referenced.

## Upkeep

A daily [upkeep workflow](.github/workflows/upkeep.yml) checks every link and flags entries whose `last_verified` (else `updated`, else `added`) is older than 90 days. It keeps a single issue, **Link & freshness report** (label `upkeep`), up to date. Fixing items from that issue via PR is a great first contribution. Entries are never edited automatically.

## Working on the site

```bash
node scripts/validate.mjs     # content validation (+ checks generated files are in sync)
node scripts/sync.mjs         # after editing schema/categories.json or scripts/lib/forms.mjs
node scripts/build.mjs        # writes dist/
node scripts/check-dist.mjs   # JSON + internal link checks on dist/
node scripts/linkcheck.mjs    # link & freshness report -> upkeep/report.md
python3 -m http.server -d dist 8080   # preview at http://localhost:8080/
```

**Adding a category:** add `{slug, name, description}` to `schema/categories.json`, run `node scripts/sync.mjs` (updates the schema enum, the issue form dropdown, the table in `content/README.md`, and creates the folder), then `node scripts/validate.mjs`. The site, API, llms.txt and OpenAPI pick it up automatically.

The tooling has no npm dependencies; please keep it that way.
