# Index Agentica

**An agent-first directory of skills, harnesses, MCP servers, tools, protocols and APIs: built by agents, for agents.**

- Live: **<https://indexagentica.com/>** (GitHub Pages; `www.` and `drudley.github.io/indexagentica/` redirect here)
- For agents: <https://indexagentica.com/llms.txt> · <https://indexagentica.com/api/index.json> · <https://indexagentica.com/agents/>

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
| Contribution guide (rules, template, PR + issue paths) | `/contribute.json` (also `contribute` in `/api/index.json`) |
| Sitemap / robots (AI crawlers explicitly allowed) | `/sitemap.xml`, `/robots.txt` |

## Repository layout

```
content/<category>/<id>.json   one directory entry per file (see content/README.md)
schema/categories.json         categories: single source of truth (run scripts/sync.mjs after editing)
schema/entry.schema.json       JSON Schema (draft 2020-12) for an entry; category enum generated
schema/entry.template.json     copy-paste entry template (validated in CI)
scripts/validate.mjs           validator: schema, id==filename, category==folder, unique ids, related ids,
                               generated files in sync; GitHub annotations + job summary in Actions
scripts/sync.mjs               regenerates schema enum, issue form, content/README.md table, folders
scripts/build.mjs              static generator: content/ -> dist/
scripts/check-dist.mjs         post-build checks: JSON parses, internal links resolve, page structure
scripts/linkcheck.mjs          link & freshness checker (used by the upkeep workflow)
scripts/issue-to-entry.mjs     issue-form body -> entry JSON (used by the submission workflow)
scripts/lib/                   categories loader, form definition/renderer/parser
scripts/site.config.mjs        site name, SITE_URL / BASE_PATH / CNAME settings
scripts/markdown.mjs           tiny safe markdown renderer for entry descriptions
.github/workflows/pages.yml    push to main: validate, build, deploy to GitHub Pages
.github/workflows/ci.yml       pull requests (and dispatch): validate with annotations, build, check
.github/workflows/upkeep.yml   daily link & freshness check; maintains the "Link & freshness report" issue
.github/workflows/submission.yml  `approved` label on a New entry issue -> PR (never auto-merged)
.github/ISSUE_TEMPLATE/        New entry form (generated), Correction / removal form, config
CNAME                          indexagentica.com (reference only; the domain is set in Pages settings)
```

Categories (from `schema/categories.json`): `skills`, `harnesses`, `mcp-servers`, `tools`, `protocols`, `apis`, `information`, `finance-payments`, `directories`.

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
| `SITE_URL` | `https://indexagentica.com` | Absolute base URL used in canonical links, sitemap, llms.txt, API links |
| `BASE_PATH` | path of `SITE_URL` (empty) | Prefix for in-site links; only needed when hosting under a sub-path, e.g. `SITE_URL=https://drudley.github.io/indexagentica` |
| `CNAME` | *(unset)* | If set, writes `dist/CNAME`. Not needed with Actions deployments (see below) |
| `SOURCE_DATE_EPOCH` | now | Fixes the "generated" timestamp for reproducible builds |

Local preview: `node scripts/build.mjs && python3 -m http.server -d dist 8080`, then open <http://localhost:8080/>.

## Contributing

Two paths, both human-merged: a **pull request** adding `content/<category>/<id>.json` (run `node scripts/validate.mjs` first), or a structured **New entry issue** that a maintainer turns into a PR by adding the `approved` label. See [CONTRIBUTING.md](CONTRIBUTING.md), <https://indexagentica.com/agents/#contribute> and <https://indexagentica.com/contribute.json>.

## Automation

| Workflow | Trigger | What it does |
|---|---|---|
| `pages.yml` | push to `main` | validate → build → check → deploy to GitHub Pages |
| `ci.yml` | pull request, dispatch | validate (file/line annotations + job summary), build, check |
| `upkeep.yml` | daily 04:17 UTC, dispatch | link-check all entry URLs (HEAD→GET, retries, bot-protection aware) + 90-day freshness; creates/updates/closes the single **Link & freshness report** issue; never edits entries |
| `submission.yml` | `approved` label on an issue | parses the New entry form, writes + validates the entry, opens a PR that closes the issue (or comments errors); never merges |

## Deployment

`.github/workflows/pages.yml` runs on every push to `main`: validate → build → check → `actions/upload-pages-artifact` → `actions/deploy-pages`. Pull requests run validate + build + check only.
One-time setup after the repo is created: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow builds for `SITE_URL=https://indexagentica.com` (pinned in the workflow; repo variable `SITE_URL` overrides it). It also logs the `actions/configure-pages` `base_url` for comparison.

## Custom domain

`indexagentica.com` (registered at GoDaddy) is served by GitHub Pages:

- DNS: apex `A` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; apex `AAAA` → `2606:50c0:8000::153` … `2606:50c0:8003::153`; `www` `CNAME` → `drudley.github.io`.
- Repo Settings → Pages: custom domain `indexagentica.com`, **Enforce HTTPS** on (Let's Encrypt certificate covers apex + `www`).
- With Actions-based deployments GitHub ignores CNAME files in the artifact, so the build doesn't write one. The root `CNAME` file is kept only as a human-readable record of the domain.
- The domain should also be verified for the `Drudley` account (github.com/settings/pages) to prevent takeover if Pages is ever disabled.

## License

Code: MIT. Directory content (`content/`): CC BY 4.0. See [LICENSE](LICENSE).
