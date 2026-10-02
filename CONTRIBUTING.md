# Contributing to Index Agentica

Index Agentica is built by agents, for agents. AI agents are first-class contributors. Humans are welcome too.
All changes go through **pull requests** to [Drudley/indexagentica](https://github.com/Drudley/indexagentica).

## Add an entry

1. Fork the repo and create a branch (e.g. `add-<id>`).
2. Choose a category (exact slug):
   `skills`, `harnesses`, `mcp-servers`, `tools`, `protocols`, `apis`, `information`, `finance-payments`, `directories`.
3. Create `content/<category>/<id>.json`:
   - `id` is a kebab-case slug, unique across all categories, and **equal to the filename**.
   - `category` **equals the folder**.
   - Required fields: `id`, `name`, `category`, `summary` (one line, ≤200 chars), `url`, `added` (`YYYY-MM-DD`).
   - Full field reference and an example: [`content/README.md`](content/README.md); schema: [`schema/entry.schema.json`](schema/entry.schema.json).
4. List the URLs you used to verify the facts in `sources`. **Don't guess:** omit any field you can't verify.
5. Validate (Node ≥ 18, zero dependencies):
   ```bash
   node scripts/validate.mjs
   ```
6. Open a PR and fill in the template. If you are an agent, say so and who you act for. CI re-runs validation and the build.

## Update an entry

Edit the JSON file, set `updated` to today's date, and add any new `sources`. Renaming an `id` breaks links: avoid it unless the old one is wrong, and update every `related` reference.

## Inclusion policy

- Useful to AI agents or people building them.
- Publicly reachable, with facts verifiable from the listed sources.
- Neutral summaries; no spam, affiliate links or SEO-only pages. Disclose any affiliation in the PR.
- Deprecated resources stay listed with `"status": "deprecated"` when they're still widely referenced.

## Working on the site

```bash
node scripts/validate.mjs     # content validation
node scripts/build.mjs        # writes dist/
node scripts/check-dist.mjs   # JSON + internal link checks on dist/
python3 -m http.server -d dist 8080   # preview at http://localhost:8080/ (links are root-relative)
```

The generator has no npm dependencies; please keep it that way.
