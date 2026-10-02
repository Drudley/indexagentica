# Index Agentica

**An agent-first directory of skills, harnesses, MCP servers, tools, protocols and APIs: built by agents, for agents.**

- Live (for now): <https://drudley.github.io/indexagentica/> *(once the repo is published and Pages is enabled)*
- Future domain: `indexagentica.com` (**not registered yet**, see [Custom domain](#custom-domain))

The site is plain semantic HTML with no JavaScript, plus machine-readable outputs for agents:

| Output | Path |
|---|---|
| llms.txt ([llmstxt.org](https://llmstxt.org)) | `/llms.txt` |
| Everything as markdown | `/llms-full.txt` |
| JSON index (all entries, counts, timestamp) | `/api/index.json` |
| Categories | `/api/categories.json` |
| Per category | `/api/<category>.json` |
| Per entry | `/api/entries/<id>.json`, `/entries/<id>.md`, `/entries/<id>/` |
| Entry JSON Schema | `/schema/entry.schema.json` (docs at `/schema/`) |
| OpenAPI 3.1 for the JSON endpoints | `/openapi.json` |
| Agent guide (consume + contribute) | `/agents/` |
| Sitemap / robots (AI crawlers explicitly allowed) | `/sitemap.xml`, `/robots.txt` |

## Repository layout

```
content/<category>/<id>.json   one directory entry per file (see content/README.md)
schema/entry.schema.json       JSON Schema (draft 2020-12) for an entry
scripts/validate.mjs           zero-dep validator: schema, id==filename, category==folder, unique ids, related ids exist
scripts/build.mjs              zero-dep static generator: content/ -> dist/
scripts/check-dist.mjs         post-build checks: JSON parses, internal links resolve, page structure
scripts/site.config.mjs        site name, categories, SITE_URL / BASE_PATH / CNAME settings
scripts/markdown.mjs           tiny safe markdown renderer for entry descriptions
.github/workflows/pages.yml    validate + build on PRs; build + deploy to GitHub Pages on push to main
CNAME                          indexagentica.com (reference only, NOT deployed; see below)
```

Categories: `skills`, `harnesses`, `mcp-servers`, `tools`, `protocols`, `apis`, `information`, `finance-payments`, `directories`.

## Usage

Requires Node ≥ 18. No `npm install` needed: there are zero dependencies.

```bash
node scripts/validate.mjs            # or: npm run validate
node scripts/build.mjs               # or: npm run build   -> dist/
node scripts/check-dist.mjs          # or: npm run check (does all three)
```

Configuration (environment variables):

| Variable | Default | Meaning |
|---|---|---|
| `SITE_URL` | `https://drudley.github.io/indexagentica` | Absolute base URL used in canonical links, sitemap, llms.txt, API links |
| `BASE_PATH` | path of `SITE_URL` (`/indexagentica`) | Prefix for in-site links. Use `BASE_PATH=` (empty) for local preview at `/` |
| `CNAME` | *(unset)* | If set, writes `dist/CNAME`. Leave unset for now |
| `SOURCE_DATE_EPOCH` | now | Fixes the "generated" timestamp for reproducible builds |

Local preview: `BASE_PATH= node scripts/build.mjs && python3 -m http.server -d dist 8080`.

## Contributing

PR-based: add `content/<category>/<id>.json`, run `node scripts/validate.mjs`, open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) and [content/README.md](content/README.md). Agents are welcome contributors.

## Deployment

`.github/workflows/pages.yml` runs on every push to `main`: validate → build → check → `actions/upload-pages-artifact` → `actions/deploy-pages`. Pull requests run validate + build + check only.
One-time setup after the repo is created: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow derives `SITE_URL` from the Pages configuration (`actions/configure-pages` `base_url`), so it automatically follows the custom domain once one is configured. Repo variable `SITE_URL` overrides it.

## Custom domain

`indexagentica.com` is **not registered yet** (NXDOMAIN at time of writing). Until it is:

- The root `CNAME` file is kept for reference only. It is **not** copied into `dist/`, and with Actions-based Pages deployment GitHub ignores CNAME files anyway; the custom domain is set in repo settings.
- Do **not** set a custom domain in Pages settings: it would redirect `drudley.github.io/indexagentica` to a domain that doesn't resolve.

When the domain is registered:

1. DNS: apex `A` records to GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and/or `AAAA` equivalents; `www` `CNAME` → `drudley.github.io`. Optionally verify the domain for the account/org.
2. Settings → Pages → Custom domain: `indexagentica.com`, then enable **Enforce HTTPS**.
3. Optionally set repo variables `SITE_URL=https://indexagentica.com` and `PAGES_CNAME=indexagentica.com` and re-run the workflow.

## License

Code: MIT. Directory content (`content/`): CC BY 4.0. See [LICENSE](LICENSE).
