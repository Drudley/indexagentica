#!/usr/bin/env node
// Zero-dependency static site generator for Index Agentica.
// Reads content/<category>/<id>.json and writes dist/.
// Usage: node scripts/build.mjs   (env: SITE_URL, BASE_PATH, CNAME; see scripts/site.config.mjs;
//        INCLUDE_DRAFTS=1 also publishes long-form drafts, for local previews only)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_NAME, TAGLINE, REPO, REPO_URL, SITE_URL, BASE_PATH, CNAME, CATEGORIES } from './site.config.mjs';
import { markdown, esc } from './markdown.mjs';
import { loadEntries, validateAgainst } from './validate.mjs';
import { issueBodyTemplate, formFields } from './lib/forms.mjs';
import { prepareLongform } from './build-longform.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SCHEMA_PATH = path.join(ROOT, 'schema/entry.schema.json');
const SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const GENERATED = process.env.SOURCE_DATE_EPOCH ? new Date(+process.env.SOURCE_DATE_EPOCH * 1000).toISOString() : new Date().toISOString();
const VERSION = '0.1';
const plural = (n, w) => `${n} ${w}${n === 1 ? 'y' : 'ies'}`; // entr-y/ies

// ---------- load ----------
const entries = loadEntries().map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));
const bad = entries.filter((e) => validateAgainst(SCHEMA, e).length);
if (bad.length) { console.error(`Refusing to build: ${bad.length} invalid entr(ies). Run: node scripts/validate.mjs`); process.exit(1); }
entries.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
const byCat = Object.fromEntries(CATEGORIES.map((c) => [c.slug, entries.filter((e) => e.category === c.slug)]));
const catName = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.name]));

// ---------- url helpers ----------
const href = (p) => `${BASE_PATH}${p}`;          // site-relative link with base path
const abs = (p) => `${SITE_URL}${p}`;            // absolute URL
const P = {
  home: '/', agents: '/agents/', schema: '/schema/', schemaJson: '/schema/entry.schema.json',
  category: (c) => `/categories/${c}/`, entry: (id) => `/entries/${id}/`, entryMd: (id) => `/entries/${id}.md`,
  api: '/api/index.json', apiCat: (c) => `/api/${c}.json`, apiEntry: (id) => `/api/entries/${id}.json`, apiCats: '/api/categories.json',
  contribute: '/contribute.json', longform: '/api/longform.json', openapi: '/openapi.json', llms: '/llms.txt', llmsFull: '/llms-full.txt', sitemap: '/sitemap.xml', robots: '/robots.txt',
};

// ---------- long-form ----------
const LONG = prepareLongform({ ROOT, entryIds: new Set(entries.map((e) => e.id)), byId, href, abs, P, REPO_URL, includeDrafts: process.env.INCLUDE_DRAFTS === '1' });
const { LF, LP } = LONG;

// ---------- fs helpers ----------
const written = [];
function write(rel, data) {
  const f = path.join(DIST, rel.replace(/\/$/, '/index.html'));
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
  written.push(rel);
}
const json = (o) => JSON.stringify(o, null, 2) + '\n';
// static/ is copied verbatim (dotfiles and dot-directories such as .well-known included) after
// everything else is generated; a static file may not shadow a generated one.
const STATIC = path.join(ROOT, 'static');
function copyStatic(dir = STATIC) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, e.name);
    if (e.isDirectory()) { n += copyStatic(src); continue; }
    if (!e.isFile()) continue;
    const rel = '/' + path.relative(STATIC, src).split(path.sep).join('/');
    if (fs.existsSync(path.join(DIST, rel))) { console.error(`static${rel} would overwrite a generated file; rename or remove it.`); process.exit(1); }
    fs.mkdirSync(path.dirname(path.join(DIST, rel)), { recursive: true });
    fs.copyFileSync(src, path.join(DIST, rel));
    written.push(rel);
    n++;
  }
  return n;
}

// ---------- html ----------
const CSS = `:root{--fg:#1a1a1a;--muted:#555;--bg:#fdfdfc;--card:#f3f3f0;--link:#0645ad;--accent:#6b3fa0}
@media (prefers-color-scheme:dark){:root{--fg:#e8e8e6;--muted:#a8a8a4;--bg:#141414;--card:#1f1f1f;--link:#8ab4f8;--accent:#c39bff}}
*{box-sizing:border-box}html{font:17px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--fg);background:var(--bg)}
body{max-width:52rem;margin:0 auto;padding:1rem 1.25rem 3rem}a{color:var(--link)}a:hover{text-decoration:none}
header.site{display:flex;flex-wrap:wrap;gap:.5rem 1.25rem;align-items:baseline;border-bottom:2px solid var(--accent);padding-bottom:.6rem;margin-bottom:1.5rem}
header.site .brand{font-weight:700;font-size:1.25rem;color:var(--fg);text-decoration:none}header.site nav ul{display:flex;flex-wrap:wrap;gap:.25rem 1rem;list-style:none;margin:0;padding:0}
h1{font-size:1.9rem;line-height:1.2;margin:.2rem 0 .6rem}h2{font-size:1.35rem;margin-top:2rem}h3{font-size:1.1rem}
.lede{font-size:1.1rem;color:var(--muted)}code,pre{font:.88em/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--card);border-radius:4px}
code{padding:.1em .3em}pre{padding:.8rem 1rem;overflow:auto}pre code{padding:0;background:none}
ul.entries,ul.cats{list-style:none;padding:0}ul.entries li,ul.cats li{background:var(--card);border-radius:6px;padding:.6rem .9rem;margin:.5rem 0}
ul.entries li p,ul.cats li p{margin:.15rem 0 0;color:var(--muted)}.count{color:var(--muted);font-weight:400}
dl.meta{display:grid;grid-template-columns:max-content 1fr;gap:.3rem 1rem}dl.meta dt{font-weight:600}dl.meta dd{margin:0;overflow-wrap:anywhere}
.tags{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:.35rem}.tags li{background:var(--card);border-radius:999px;padding:.05rem .6rem;font-size:.85rem}
table{border-collapse:collapse;width:100%;font-size:.92rem}caption{text-align:left;font-weight:600;padding:.3rem 0}.table-wrap{overflow-x:auto}
figure.diagram{margin:1rem 0}figure.diagram pre{background:var(--card);padding:.75rem;overflow-x:auto}figure.diagram figcaption{color:var(--muted);font-size:.85rem}
th,td{text-align:left;border-bottom:1px solid var(--card);padding:.35rem .5rem;vertical-align:top}
footer.site{margin-top:3rem;border-top:1px solid var(--card);padding-top:1rem;color:var(--muted);font-size:.9rem}
nav.crumbs ol{list-style:none;padding:0;margin:0 0 .5rem;display:flex;flex-wrap:wrap;gap:.4rem;font-size:.9rem}nav.crumbs li+li::before{content:"›";margin-right:.4rem;color:var(--muted)}
`;

function page({ title, description, pathName, body, crumbs = [], jsonld, alternates = [] }) {
  const fullTitle = pathName === '/' ? `${SITE_NAME}: agent-first directory` : `${title} | ${SITE_NAME}`;
  const crumbHtml = crumbs.length
    ? `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${href('/')}">Home</a></li>${crumbs.map(([t, p]) => p ? `<li><a href="${href(p)}">${esc(t)}</a></li>` : `<li aria-current="page">${esc(t)}</li>`).join('')}</ol></nav>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(abs(pathName))}">
<link rel="stylesheet" href="${href('/style.css')}">
<link rel="alternate" type="text/plain" title="llms.txt" href="${href(P.llms)}">
<link rel="alternate" type="application/json" title="Full JSON index" href="${href(P.api)}">
${alternates.map(([type, t, p]) => `<link rel="alternate" type="${type}" title="${esc(t)}" href="${href(p)}">`).join('\n')}
<link rel="describedby" type="application/schema+json" href="${href(P.schemaJson)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(abs(pathName))}">
<meta property="og:type" content="website">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<header class="site">
<a class="brand" href="${href('/')}">${SITE_NAME}</a>
<nav aria-label="Main"><ul>
<li><a href="${href('/#categories')}">Categories</a></li>
${LONG.ORDER.map((t) => `<li><a href="${href(LP.index(t))}">${t === 'comparison' ? 'Compare' : LF[t].name}</a></li>`).join('\n')}
<li><a href="${href(P.agents)}">For agents</a></li>
<li><a href="${href(P.llms)}">llms.txt</a></li>
<li><a href="${href(P.api)}">JSON API</a></li>
<li><a href="${href(P.schema)}">Schema</a></li>
<li><a href="${REPO_URL}">GitHub</a></li>
</ul></nav>
</header>
<main id="main">
${crumbHtml}
${body}
</main>
<footer class="site">
<p>${SITE_NAME}: ${esc(TAGLINE)} ${plural(entries.length, 'entr')}. Generated ${GENERATED.slice(0, 10)}.
Machine-readable: <a href="${href(P.llms)}">llms.txt</a> · <a href="${href(P.llmsFull)}">llms-full.txt</a> · <a href="${href(P.api)}">api/index.json</a> · <a href="${href(P.openapi)}">openapi.json</a> · <a href="${href(P.sitemap)}">sitemap.xml</a>.
Contribute via pull request at <a href="${REPO_URL}">${REPO}</a>.</p>
</footer>
</body>
</html>
`;
}

const entryList = (list) => list.length
  ? `<ul class="entries">${list.map((e) => `<li><a href="${href(P.entry(e.id))}"><strong>${esc(e.name)}</strong></a>${e.status && e.status !== 'active' ? ` <small>(${esc(e.status)})</small>` : ''}<p>${esc(e.summary)}</p></li>`).join('')}</ul>`
  : `<p>No entries yet. <a href="${href(P.agents)}#contribute">Submit one</a>.</p>`;

const link = (u) => `<a href="${esc(u)}" rel="noopener">${esc(u)}</a>`;

// ---------- data shapes ----------
function apiEntry(e) {
  return {
    ...e,
    longform: LONG.backrefs(e.id),
    links: { html: abs(P.entry(e.id)), markdown: abs(P.entryMd(e.id)), json: abs(P.apiEntry(e.id)), source: `${REPO_URL}/blob/main/content/${e.category}/${e.id}.json` },
  };
}
const meta = (extra = {}) => ({
  name: SITE_NAME, description: TAGLINE, version: VERSION, generated: GENERATED, site_url: SITE_URL,
  schema: abs(P.schemaJson), openapi: abs(P.openapi), llms_txt: abs(P.llms), repository: REPO_URL,
  contribute_url: abs(P.contribute), longform: abs(P.longform), license: { content: 'CC-BY-4.0', code: 'MIT' }, ...extra,
});
const categorySummary = () => CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, description: c.description, count: byCat[c.slug].length, html: abs(P.category(c.slug)), json: abs(P.apiCat(c.slug)) }));

function entryMarkdown(e, level = 1) {
  const h = '#'.repeat(level);
  const L = [`${h} ${e.name}`, '', `> ${e.summary}`, ''];
  const kv = [
    ['id', `\`${e.id}\``], ['category', `${catName[e.category]} (\`${e.category}\`)`], ['url', e.url], ['repo', e.repo], ['docs', e.docs],
    ['status', e.status], ['pricing', e.pricing], ['license', e.license], ['tags', e.tags?.length ? e.tags.join(', ') : null],
    ['llms.txt', e.agent_access?.llms_txt], ['openapi', e.agent_access?.openapi], ['mcp endpoint', e.agent_access?.mcp_endpoint],
    ['auth', e.agent_access?.auth], ['access notes', e.agent_access?.notes],
    ['related', e.related?.length ? e.related.map((r) => `${byId[r]?.name || r} (${abs(P.entry(r))})`).join('; ') : null],
    ['sources', e.sources?.length ? e.sources.join(' , ') : null], ['added', e.added], ['updated', e.updated], ['last verified', e.last_verified],
    ['featured in', LONG.backrefs(e.id).map((r) => `${r.title} (${r.url})`).join('; ') || null],
    ['maintainer', e.maintainer], ['submitted by', e.submitted_by], ['page', abs(P.entry(e.id))], ['json', abs(P.apiEntry(e.id))],
  ].filter(([, v]) => v);
  kv.forEach(([k, v]) => L.push(`- ${k}: ${v}`));
  if (e.description) L.push('', e.description.trim().replace(/^(#{1,4})\s/gm, (m, hs) => '#'.repeat(Math.min(6, hs.length + level)) + ' '));
  return L.join('\n') + '\n';
}

// ---------- contribution info (single source for /contribute.json, /api/index.json, /agents/, llms*.txt) ----------
const TEMPLATE = JSON.parse(fs.readFileSync(path.join(ROOT, 'schema/entry.template.json'), 'utf8'));
const ISSUE_FORM_URL = `${REPO_URL}/issues/new?template=new-entry.yml`;
const CORRECTION_FORM_URL = `${REPO_URL}/issues/new?template=correction.yml`;
const ISSUE_BODY = issueBodyTemplate();
const CONTRIBUTE = {
  summary: `Add or fix entries via a pull request (preferred) or a structured GitHub issue. Agents are first-class contributors; say that you are an agent and who you act for. Merges are always done by a human maintainer.`,
  repository: REPO_URL,
  schema: abs(P.schemaJson),
  schema_docs: abs(P.schema),
  categories: CATEGORIES.map((c) => c.slug),
  file_path: 'content/{category}/{id}.json',
  rules: [
    'One entry per file at content/{category}/{id}.json; id is kebab-case, unique across all categories, and equals the filename.',
    'category equals the folder name.',
    `Required fields: ${SCHEMA.required.join(', ')}. Unknown fields are rejected (additionalProperties: false).`,
    'summary is one neutral line, 10-200 characters; no marketing copy.',
    'List the URLs you used to verify facts in sources; omit any field you cannot verify.',
    'Every id in related must already exist.',
  ],
  entry_template: TEMPLATE,
  pull_request: {
    steps: [
      `Fork ${REPO_URL} and create a branch.`,
      'Copy entry_template to content/{category}/{id}.json and fill it in (delete optional fields you cannot verify; set added to today, YYYY-MM-DD).',
      'Run: node scripts/validate.mjs   (Node >= 18, zero dependencies; must print a check mark and exit 0).',
      `Open a pull request against main using the PR template. CI validates and posts file/line annotations with fixes.`,
    ],
    validate_command: 'node scripts/validate.mjs',
    pr_template: `${REPO_URL}/blob/main/.github/pull_request_template.md`,
    guide: `${REPO_URL}/blob/main/CONTRIBUTING.md`,
  },
  issue: {
    form_url: ISSUE_FORM_URL,
    api: {
      method: 'POST',
      url: `https://api.github.com/repos/${REPO}/issues`,
      title: '[New entry]: {name}',
      body_format: 'Markdown sections "### <Label>" followed by the value, exactly as in body_template; use "_No response_" for empty optional fields. Lists: comma-separated (Tags, Related entry ids) or one URL per line (Sources).',
      body_template: ISSUE_BODY,
      gh_cli: `gh issue create -R ${REPO} --title "[New entry]: <name>" --body-file body.md`,
      fields: formFields().map((f) => ({ label: f.label, field: f.key, required: !!f.required, ...(f.options ? { options: f.options } : {}), ...(f.list ? { list: f.list === 'comma' ? 'comma-separated' : 'one per line' } : {}) })),
    },
    review: 'A maintainer reviews the issue. Adding the `approved` label (write access required) runs a workflow that writes content/{category}/{id}.json, validates it, and opens a pull request that closes the issue. If validation fails, the workflow comments the errors on the issue instead. A human merges the PR.',
  },
  corrections: { form_url: CORRECTION_FORM_URL, note: 'Report wrong facts, broken links or request removal. Or edit the JSON file directly in a PR and set updated.' },
  policy: ['Useful to AI agents or people building them.', 'Publicly reachable; facts verifiable from the listed sources.', 'No spam, affiliate links or SEO-only pages; disclose any affiliation.'],
  longform: { note: 'Guides, comparisons, stacks and skills are written by maintainers. There is no issue form for them yet; to suggest a topic or report a problem, use the correction form or open a regular issue.', file_paths: ['content-long/guides/{id}.md', 'content-long/compare/{id}.md', 'content-long/stacks/{id}.md', 'content-long/skills/{id}/SKILL.md'], docs: `${REPO_URL}/blob/main/content-long/README.md` },
};

// ---------- build ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
write('/style.css', CSS);
write('/.nojekyll', '');
if (CNAME) write('/CNAME', CNAME + '\n');

// Home
write('/', page({
  title: SITE_NAME, description: TAGLINE, pathName: '/',
  jsonld: { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: abs('/'), description: TAGLINE },
  body: `<h1>${SITE_NAME}</h1>
<p class="lede">${esc(TAGLINE)}</p>
<p>This site is designed to be read by AI agents first: every page is plain semantic HTML with no JavaScript, and the whole directory is also available as <a href="${href(P.llms)}">llms.txt</a>, <a href="${href(P.llmsFull)}">llms-full.txt</a>, a <a href="${href(P.api)}">JSON API</a> described by <a href="${href(P.openapi)}">OpenAPI</a>, and per-entry markdown. Agents can contribute entries by pull request. See <a href="${href(P.agents)}">For agents</a>.</p>
<section aria-labelledby="categories"><h2 id="categories">Categories</h2>
<ul class="cats">${CATEGORIES.map((c) => `<li><a href="${href(P.category(c.slug))}"><strong>${esc(c.name)}</strong></a> <span class="count">(${byCat[c.slug].length})</span><p>${esc(c.description)}</p></li>`).join('')}</ul>
</section>
<section aria-labelledby="longform"><h2 id="longform">Guides, comparisons, stacks and skills</h2>
<ul class="cats">${LONG.ORDER.map((t) => `<li><a href="${href(LP.index(t))}"><strong>${LF[t].name}</strong></a> <span class="count">(${LONG.counts()[t]})</span><p>${esc(LF[t].description)}</p></li>`).join('')}</ul>
${LONG.items.length ? `<ul>${LONG.items.slice(0, 8).map((x) => `<li><a href="${href(LP.page(x.type, x.item.id))}">${esc(x.item.title)}</a> (${LF[x.type].singular}): ${esc(x.item.summary || x.item.description || '')}</li>`).join('')}</ul>` : ''}
</section>
<section aria-labelledby="recent"><h2 id="recent">Recently added</h2>
${entryList([...entries].sort((a, b) => (b.updated || b.added).localeCompare(a.updated || a.added) || a.name.localeCompare(b.name)).slice(0, 20))}
</section>`,
}));

// Categories
for (const c of CATEGORIES) {
  const list = byCat[c.slug];
  write(P.category(c.slug), page({
    title: c.name, description: c.description, pathName: P.category(c.slug), crumbs: [[c.name]],
    alternates: [['application/json', `${c.name} JSON`, P.apiCat(c.slug)]],
    jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${c.name} | ${SITE_NAME}`, url: abs(P.category(c.slug)), description: c.description,
      mainEntity: { '@type': 'ItemList', numberOfItems: list.length, itemListElement: list.map((e, i) => ({ '@type': 'ListItem', position: i + 1, name: e.name, url: abs(P.entry(e.id)) })) } },
    body: `<h1>${esc(c.name)} <span class="count">(${list.length})</span></h1>
<p class="lede">${esc(c.description)}</p>
<p>Machine-readable: <a href="${href(P.apiCat(c.slug))}"><code>/api/${c.slug}.json</code></a>.</p>
${entryList(list)}`,
  }));
  write(P.apiCat(c.slug), json({ ...meta(), category: { slug: c.slug, name: c.name, description: c.description }, count: list.length, entries: list.map(apiEntry) }));
}

// Entries
const SOFTWARE = new Set(['skills', 'harnesses', 'mcp-servers', 'tools']);
for (const e of entries) {
  const aa = e.agent_access || {};
  const rows = [
    ['Category', `<a href="${href(P.category(e.category))}">${esc(catName[e.category])}</a>`],
    ['Website', link(e.url)], e.repo && ['Repository', link(e.repo)], e.docs && ['Docs', link(e.docs)],
    e.status && ['Status', esc(e.status)], e.pricing && ['Pricing', esc(e.pricing)], e.license && ['License', esc(e.license)],
    e.maintainer && ['Maintainer', esc(e.maintainer)], ['Added', `<time datetime="${e.added}">${e.added}</time>`],
    e.updated && ['Updated', `<time datetime="${e.updated}">${e.updated}</time>`],
    e.last_verified && ['Last verified', `<time datetime="${e.last_verified}">${e.last_verified}</time>`], e.submitted_by && ['Submitted by', esc(e.submitted_by)],
  ].filter(Boolean);
  const accessRows = [
    aa.llms_txt && ['llms.txt', link(aa.llms_txt)], aa.openapi && ['OpenAPI', link(aa.openapi)],
    aa.mcp_endpoint && ['MCP endpoint', `<code>${esc(aa.mcp_endpoint)}</code>`], aa.auth && ['Auth', esc(aa.auth)], aa.notes && ['Notes', esc(aa.notes)],
  ].filter(Boolean);
  const dl = (r) => `<dl class="meta">${r.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': SOFTWARE.has(e.category) ? 'SoftwareApplication' : e.category === 'apis' ? 'WebAPI' : 'CreativeWork',
    name: e.name, description: e.summary, url: e.url, sameAs: [e.repo, e.docs].filter(Boolean), keywords: e.tags?.join(', '),
    license: e.license, dateCreated: e.added, dateModified: e.updated || e.added, ...(SOFTWARE.has(e.category) ? { applicationCategory: catName[e.category] } : {}),
  };
  write(P.entry(e.id), page({
    title: e.name, description: e.summary, pathName: P.entry(e.id), crumbs: [[catName[e.category], P.category(e.category)], [e.name]], jsonld: ld,
    alternates: [['application/json', `${e.name} JSON`, P.apiEntry(e.id)], ['text/markdown', `${e.name} markdown`, P.entryMd(e.id)]],
    body: `<article>
<h1>${esc(e.name)}</h1>
<p class="lede">${esc(e.summary)}</p>
${dl(rows)}
${e.tags?.length ? `<h2>Tags</h2><ul class="tags">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
${e.description ? `<h2>Description</h2>\n${markdown(e.description)}` : ''}
${accessRows.length ? `<h2>Agent access</h2>${dl(accessRows)}` : ''}
${e.related?.length ? `<h2>Related</h2><ul>${e.related.map((r) => `<li><a href="${href(P.entry(r))}">${esc(byId[r].name)}</a>: ${esc(byId[r].summary)}</li>`).join('')}</ul>` : ''}
${LONG.entryHtml(e.id)}
${e.sources?.length ? `<h2>Sources</h2><ul>${e.sources.map((s) => `<li>${link(s)}</li>`).join('')}</ul>` : ''}
<h2>Machine-readable</h2>
<ul><li><a href="${href(P.apiEntry(e.id))}">JSON</a></li><li><a href="${href(P.entryMd(e.id))}">Markdown</a></li><li><a href="${REPO_URL}/blob/main/content/${e.category}/${e.id}.json">Source file on GitHub</a> (edit via pull request)</li></ul>
</article>`,
  }));
  write(P.apiEntry(e.id), json(apiEntry(e)));
  write(P.entryMd(e.id), entryMarkdown(e));
}

// Long-form pages, raw markdown, skill files/zips and API
LONG.writePages({ write, page });
const lfCounts = LONG.writeApi({ write, json, meta });

// API index
write(P.contribute, json({ ...meta(), contribute: CONTRIBUTE }));
write(P.api, json({ ...meta(), contribute: CONTRIBUTE, counts: { total: entries.length, by_category: Object.fromEntries(CATEGORIES.map((c) => [c.slug, byCat[c.slug].length])), longform: { total: LONG.items.length, by_type: lfCounts } }, categories: categorySummary(), entries: entries.map(apiEntry) }));
write(P.apiCats, json({ ...meta(), categories: categorySummary() }));

// Schema
write(P.schemaJson, fs.readFileSync(SCHEMA_PATH));
const sp = SCHEMA.properties;
const typeDesc = (s) => s.enum ? s.enum.map((v) => `<code>${esc(v)}</code>`).join(' | ') : s.type === 'array' ? `array of ${s.items?.format || s.items?.type || 'any'}` : s.type === 'object' ? `object (${Object.keys(s.properties).map((k) => `<code>${k}</code>`).join(', ')})` : (s.format || s.type);
write(P.schema, page({
  title: 'Entry schema', description: 'JSON Schema (draft 2020-12) for Index Agentica directory entries.', pathName: P.schema, crumbs: [['Schema']],
  alternates: [['application/schema+json', 'Entry JSON Schema', P.schemaJson]],
  body: `<h1>Entry schema</h1>
<p class="lede">Every entry is one JSON file at <code>content/&lt;category&gt;/&lt;id&gt;.json</code> in <a href="${REPO_URL}">${REPO}</a>, validated against this JSON Schema (draft 2020-12).</p>
<p>Download: <a href="${href(P.schemaJson)}"><code>/schema/entry.schema.json</code></a>. Unknown properties are rejected (<code>additionalProperties: false</code>).</p>
<h2>Rules beyond the schema</h2>
<ul><li><code>id</code> must equal the filename (without <code>.json</code>) and be unique across all categories.</li><li><code>category</code> must equal the folder name.</li><li>Every id in <code>related</code> must exist.</li><li><code>updated</code> and <code>last_verified</code> must not be before <code>added</code>.</li><li>Run <code>node scripts/validate.mjs</code> (zero dependencies) before opening a pull request.</li></ul>
<h2>Fields</h2>
<table><thead><tr><th scope="col">Field</th><th scope="col">Required</th><th scope="col">Type</th><th scope="col">Notes</th></tr></thead><tbody>
${Object.entries(sp).filter(([k]) => k !== '$schema').map(([k, s]) => `<tr><th scope="row"><code>${k}</code></th><td>${SCHEMA.required.includes(k) ? 'yes' : ''}</td><td>${typeDesc(s)}</td><td>${esc([s.description, s.maxLength && s.type === 'string' ? `max ${s.maxLength} chars` : '', s.pattern && !s.format ? `pattern ${s.pattern}` : ''].filter(Boolean).join('. '))}</td></tr>`).join('\n')}
</tbody></table>
<h2>Categories</h2>
<ul>${CATEGORIES.map((c) => `<li><code>${c.slug}</code>: ${esc(c.description)}</li>`).join('')}</ul>
<h2>Example</h2>
<pre><code class="language-json">${esc(JSON.stringify(entries.find((e) => e.id === 'model-context-protocol') || entries[0] || {}, null, 2))}</code></pre>`,
}));

// Agents page
write(P.agents, page({
  title: 'For agents', description: 'How AI agents consume and contribute to Index Agentica: llms.txt, JSON API, schema, OpenAPI and PR-based submissions.', pathName: P.agents, crumbs: [['For agents']],
  body: `<h1>For agents</h1>
<p class="lede">${SITE_NAME} is built by agents, for agents. Everything here is static, unauthenticated, free to crawl, and has no JavaScript and no rate-limited backend.</p>
<h2 id="consume">Consuming the directory</h2>
<table><thead><tr><th scope="col">Resource</th><th scope="col">URL</th><th scope="col">Use it for</th></tr></thead><tbody>
<tr><td>llms.txt</td><td><a href="${href(P.llms)}"><code>${P.llms}</code></a></td><td>Compact index of every category and entry (<a href="https://llmstxt.org/">llmstxt.org</a> format). Start here.</td></tr>
<tr><td>llms-full.txt</td><td><a href="${href(P.llmsFull)}"><code>${P.llmsFull}</code></a></td><td>Every entry in full markdown, in one file, for loading into context.</td></tr>
<tr><td>JSON index</td><td><a href="${href(P.api)}"><code>${P.api}</code></a></td><td>All entries plus metadata, counts and generation timestamp.</td></tr>
<tr><td>Categories</td><td><a href="${href(P.apiCats)}"><code>${P.apiCats}</code></a></td><td>Category list with counts.</td></tr>
<tr><td>Per category</td><td><code>/api/&lt;category&gt;.json</code></td><td>e.g. <a href="${href(P.apiCat('mcp-servers'))}"><code>/api/mcp-servers.json</code></a></td></tr>
<tr><td>Per entry</td><td><code>/api/entries/&lt;id&gt;.json</code>, <code>/entries/&lt;id&gt;.md</code></td><td>Single entry as JSON or markdown.</td></tr>
<tr><td>Long-form index</td><td><a href="${href(LP.api)}"><code>${LP.api}</code></a></td><td>Every published guide, comparison, stack and skill with metadata and links. Per type: ${LONG.ORDER.map((t) => `<a href="${href(LP.apiType(t))}"><code>${LP.apiType(t)}</code></a>`).join(', ')}.</td></tr>
<tr><td>Per long-form item</td><td><code>/api/longform/&lt;route&gt;/&lt;id&gt;.json</code>, <code>/&lt;route&gt;/&lt;id&gt;.md</code></td><td>Front matter, raw markdown, rendered HTML, comparison rows or stack components, and links. Routes: ${LONG.ORDER.map((t) => `<code>${LF[t].route}</code>`).join(', ')}.</td></tr>
<tr><td>OpenAPI</td><td><a href="${href(P.openapi)}"><code>${P.openapi}</code></a></td><td>OpenAPI 3.1 description of the read-only JSON endpoints.</td></tr>
<tr><td>Schema</td><td><a href="${href(P.schemaJson)}"><code>${P.schemaJson}</code></a></td><td>JSON Schema for one entry (<a href="${href(P.schema)}">human-readable</a>).</td></tr>
<tr><td>Contribute</td><td><a href="${href(P.contribute)}"><code>${P.contribute}</code></a></td><td>How to submit entries: rules, template, PR and issue paths.</td></tr>
<tr><td>Sitemap</td><td><a href="${href(P.sitemap)}"><code>${P.sitemap}</code></a></td><td>Every HTML page.</td></tr>
</tbody></table>
<p>Base URL: <code>${esc(SITE_URL)}</code>. All responses are static files served by GitHub Pages; please cache and use conditional requests. Crawling is explicitly welcome; see <a href="${href(P.robots)}"><code>robots.txt</code></a>.</p>
<h2 id="skills-download">Downloading skills</h2>
<p><a href="${href(LP.index('skill'))}">Skills</a> are <a href="https://agentskills.io/specification">Agent Skills</a>: a folder with a <code>SKILL.md</code> (YAML front matter plus instructions). Each published skill is available three ways:</p>
<ul>
<li>Raw: <code>/skills/&lt;id&gt;/SKILL.md</code> (and any other files in the folder at <code>/skills/&lt;id&gt;/&lt;file&gt;</code>).</li>
<li>Zip of the whole folder: <code>/skills/&lt;id&gt;.zip</code> (unpacks to <code>&lt;id&gt;/SKILL.md</code>).</li>
<li>JSON with metadata and the raw markdown: <code>/api/longform/skills/&lt;id&gt;.json</code>.</li>
</ul>
<p>Install for Claude Code (personal skills directory; use <code>.claude/skills/</code> inside a project to scope it to that project):</p>
<pre><code class="language-sh">mkdir -p ~/.claude/skills
curl -fsSL ${esc(SITE_URL)}/skills/&lt;id&gt;.zip -o /tmp/skill.zip
unzip -o /tmp/skill.zip -d ~/.claude/skills/</code></pre>
<p>Or fetch just the file: <code>mkdir -p ~/.claude/skills/&lt;id&gt; &amp;&amp; curl -fsSL ${esc(SITE_URL)}/skills/&lt;id&gt;/SKILL.md -o ~/.claude/skills/&lt;id&gt;/SKILL.md</code>. Other agents that support Agent Skills load the same folder from their own skills directory. Read a skill before installing it.</p>
<h2 id="contribute">Contributing</h2>
<p>${esc(CONTRIBUTE.summary)} Machine-readable version of this section: <a href="${href(P.contribute)}"><code>${P.contribute}</code></a> (also embedded in <a href="${href(P.api)}"><code>${P.api}</code></a> as <code>contribute</code>).</p>
<h3 id="rules">Rules</h3>
<ul>${CONTRIBUTE.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
<p>Categories: ${CATEGORIES.map((c) => `<code>${c.slug}</code>`).join(', ')}. Schema: <a href="${href(P.schemaJson)}"><code>${P.schemaJson}</code></a> (<a href="${href(P.schema)}">field reference</a>).</p>
<h3 id="contribute-pr">Path A: pull request (preferred)</h3>
<ol>${CONTRIBUTE.pull_request.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
<p>Guide: <a href="${CONTRIBUTE.pull_request.guide}">CONTRIBUTING.md</a>. Fixing an existing entry: edit its file and set <code>updated</code>.</p>
<h4 id="entry-template">Entry template (copy, then delete what you can't verify)</h4>
<pre><code class="language-json">${esc(JSON.stringify(TEMPLATE, null, 2))}</code></pre>
<h3 id="contribute-issue">Path B: structured issue</h3>
<ol>
<li>Humans: open the <a href="${ISSUE_FORM_URL}">New entry form</a>.</li>
<li>Agents via API: <code>POST https://api.github.com/repos/${REPO}/issues</code> with title <code>[New entry]: &lt;name&gt;</code> and the body below (sections <code>### &lt;Label&gt;</code>; <code>_No response_</code> for empty optional fields), e.g. <code>${esc(CONTRIBUTE.issue.api.gh_cli)}</code>.</li>
<li>${esc(CONTRIBUTE.issue.review)}</li>
</ol>
<h4 id="issue-body-template">Issue body template</h4>
<pre><code class="language-markdown">${esc(ISSUE_BODY)}</code></pre>
<h3 id="contribute-longform">Guides, comparisons, stacks and skills</h3>
<p>${esc(CONTRIBUTE.longform.note)} Format reference: <a href="${CONTRIBUTE.longform.docs}">content-long/README.md</a>.</p>
<h3 id="corrections">Corrections and removals</h3>
<p>Use the <a href="${CORRECTION_FORM_URL}">Correction / removal form</a>, or edit the JSON in a pull request.</p>
<h2 id="policy">Inclusion policy</h2>
<ul><li>Useful to AI agents or people building them.</li><li>Publicly reachable; facts verifiable from the listed sources.</li><li>No spam, affiliate links, or SEO-only pages. Summaries are neutral, not marketing copy.</li></ul>`,
}));

// llms.txt
const lfHeading = (t) => (t === 'skill' ? 'Downloadable skills (Agent Skills)' : LF[t].name); // avoid clashing with the "Skills" entry category
const llms = [`# ${SITE_NAME}`, '', `> ${TAGLINE} ${plural(entries.length, 'entr')} across ${CATEGORIES.length} categories. Static, no auth, crawl freely. Contribute via pull request to ${REPO_URL}.`, '',
  `Each entry is available as HTML (${SITE_URL}/entries/{id}/), markdown (${SITE_URL}/entries/{id}.md) and JSON (${SITE_URL}/api/entries/{id}.json).`, '',
  '## Machine-readable', '',
  `- [llms-full.txt](${abs(P.llmsFull)}): every entry in full markdown`,
  `- [JSON index](${abs(P.api)}): all entries with metadata and counts`,
  `- [OpenAPI](${abs(P.openapi)}): OpenAPI 3.1 description of the JSON endpoints`,
  `- [Entry schema](${abs(P.schemaJson)}): JSON Schema (draft 2020-12) for one entry`,
  `- [Long-form index](${abs(LP.api)}): guides, comparisons, stacks and skills with metadata (per item: ${SITE_URL}/api/longform/{route}/{id}.json)`,
  `- [For agents](${abs(P.agents)}): how to consume and contribute`, '',
  '## Contribute', '',
  `- [contribute.json](${abs(P.contribute)}): machine-readable contribution guide: rules, entry template, PR steps, issue body template`,
  `- [Pull request path](${abs(P.agents)}#contribute-pr): add content/{category}/{id}.json to ${REPO_URL}, run node scripts/validate.mjs, open a PR`,
  `- [Issue path](${abs(P.agents)}#contribute-issue): open a structured "New entry" issue (form: ${ISSUE_FORM_URL}); a maintainer's approved label turns it into a PR`,
  `- [Entry template](${REPO_URL}/blob/main/schema/entry.template.json): copy-paste JSON`,
  `- [Corrections / removals](${CORRECTION_FORM_URL})`,
  `- Guides, comparisons, stacks and skills are written by maintainers (no issue form yet)`, ''];
for (const t of LONG.ORDER) {
  const list = LONG.items.filter((x) => x.type === t);
  llms.push(`## ${lfHeading(t)}`, '', `${LF[t].description} HTML: ${abs(LP.index(t))} JSON: ${abs(LP.apiType(t))}`, '');
  list.forEach((x) => llms.push(`- [${x.item.title}](${abs(LP.md(t, x.item.id))}): ${x.item.summary || x.item.description}${t === 'skill' ? ` (zip: ${abs(LP.zip(x.item.id))})` : ''}`));
  if (!list.length) llms.push('- (nothing published yet)');
  llms.push('');
}
for (const c of CATEGORIES) {
  llms.push(`## ${c.name}`, '', `${c.description} JSON: ${abs(P.apiCat(c.slug))}`, '');
  byCat[c.slug].forEach((e) => llms.push(`- [${e.name}](${abs(P.entryMd(e.id))}): ${e.summary}`));
  if (!byCat[c.slug].length) llms.push('- (no entries yet)');
  llms.push('');
}
llms.push('## Optional', '', `- [Contributing guide](${REPO_URL}/blob/main/CONTRIBUTING.md): PR-based submission process`, `- [Sitemap](${abs(P.sitemap)})`, '');
write(P.llms, llms.join('\n'));

const full = [`# ${SITE_NAME}: full directory`, '', `> ${TAGLINE}`, '', `Generated: ${GENERATED}. Entries: ${entries.length}. Source: ${REPO_URL}. JSON: ${abs(P.api)}`, '',
  '## Contributing', '', CONTRIBUTE.summary, '', `Machine-readable: ${abs(P.contribute)}`, '', '### Rules', '', ...CONTRIBUTE.rules.map((r) => `- ${r}`), '',
  '### Pull request path', '', ...CONTRIBUTE.pull_request.steps.map((x, i) => `${i + 1}. ${x}`), '', 'Entry template:', '', '```json', JSON.stringify(TEMPLATE, null, 2), '```', '',
  '### Issue path', '', `Form: ${ISSUE_FORM_URL}. API: POST https://api.github.com/repos/${REPO}/issues with title "[New entry]: <name>" and this body:`, '', '```markdown', ISSUE_BODY.trim(), '```', '', CONTRIBUTE.issue.review, '',
  `Corrections and removals: ${CORRECTION_FORM_URL}`, '', CONTRIBUTE.longform.note, ''];
for (const t of LONG.ORDER) {
  const list = LONG.items.filter((x) => x.type === t);
  full.push(`## ${lfHeading(t)}`, '', LF[t].description, '');
  list.forEach((x) => full.push(LONG.itemMarkdown(x, 3)));
  if (!list.length) full.push('(nothing published yet)', '');
}
for (const c of CATEGORIES) {
  full.push(`## ${c.name} (${c.slug})`, '', c.description, '');
  byCat[c.slug].forEach((e) => full.push(entryMarkdown(e, 3)));
  if (!byCat[c.slug].length) full.push('(no entries yet)', '');
}
write(P.llmsFull, full.join('\n'));

// OpenAPI
const ref = (n) => ({ $ref: `#/components/schemas/${n}` });
const metaProps = { name: { type: 'string' }, description: { type: 'string' }, version: { type: 'string' }, generated: { type: 'string', format: 'date-time' }, site_url: { type: 'string', format: 'uri' }, schema: { type: 'string', format: 'uri' }, openapi: { type: 'string', format: 'uri' }, llms_txt: { type: 'string', format: 'uri' }, repository: { type: 'string', format: 'uri' }, contribute_url: { type: 'string', format: 'uri' }, longform: { type: 'string', format: 'uri' }, license: { type: 'object' } };
const lfRoute = { name: 'route', in: 'path', required: true, schema: { type: 'string', enum: LONG.ORDER.map((t) => LF[t].route) } };
const lfId = { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$' } };
const { $schema: _s, $id: _i, ...entrySchema } = SCHEMA;
const entryOut = { ...entrySchema, properties: { ...entrySchema.properties, longform: { type: 'array', description: 'Published long-form items that reference this entry', items: { type: 'object', properties: { type: { type: 'string' }, id: { type: 'string' }, title: { type: 'string' }, url: { type: 'string', format: 'uri' }, json: { type: 'string', format: 'uri' } } } }, links: { type: 'object', properties: { html: { type: 'string', format: 'uri' }, markdown: { type: 'string', format: 'uri' }, json: { type: 'string', format: 'uri' }, source: { type: 'string', format: 'uri' } } } } };
delete entryOut.properties.$schema;
const ok = (schema, desc, type = 'application/json') => ({ 200: { description: desc, content: { [type]: { schema } } }, ...(type === 'application/json' ? { 404: { description: 'Not found' } } : {}) });
write(P.openapi, json({
  openapi: '3.1.0',
  info: { title: `${SITE_NAME} API`, version: VERSION, summary: 'Static, read-only JSON API for the Index Agentica directory.', description: `${TAGLINE}\n\nAll endpoints are static files (GET only, no auth, no rate-limited backend). Writes happen via pull requests to ${REPO_URL}.`, license: { name: 'CC-BY-4.0 (content), MIT (code)', identifier: 'CC-BY-4.0' } },
  externalDocs: { description: 'For agents', url: abs(P.agents) },
  servers: [{ url: SITE_URL }],
  paths: {
    '/api/index.json': { get: { operationId: 'getIndex', summary: 'All entries, categories, counts and metadata', responses: ok(ref('Index'), 'Full index') } },
    '/api/categories.json': { get: { operationId: 'listCategories', summary: 'Category list with counts', responses: ok({ type: 'object', properties: { ...metaProps, categories: { type: 'array', items: ref('CategorySummary') } } }, 'Categories') } },
    '/api/{category}.json': { get: { operationId: 'getCategory', summary: 'All entries in one category', parameters: [{ name: 'category', in: 'path', required: true, schema: { type: 'string', enum: CATEGORIES.map((c) => c.slug) } }], responses: ok(ref('CategoryResponse'), 'Category entries') } },
    '/api/entries/{id}.json': { get: { operationId: 'getEntry', summary: 'One entry by id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: SCHEMA.properties.id.pattern } }], responses: ok(ref('Entry'), 'Entry') } },
    '/entries/{id}.md': { get: { operationId: 'getEntryMarkdown', summary: 'One entry as markdown', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: ok({ type: 'string' }, 'Markdown', 'text/markdown') } },
    '/api/longform.json': { get: { operationId: 'getLongformIndex', summary: 'All published guides, comparisons, stacks and skills (metadata only)', responses: ok(ref('LongformIndex'), 'Long-form index') } },
    '/api/longform/{route}.json': { get: { operationId: 'getLongformType', summary: 'Published long-form items of one type', parameters: [lfRoute], responses: ok({ type: 'object', properties: { ...metaProps, type: { type: 'string', enum: LONG.ORDER }, name: { type: 'string' }, count: { type: 'integer' }, items: { type: 'array', items: ref('LongformSummary') } } }, 'Long-form items of one type') } },
    '/api/longform/{route}/{id}.json': { get: { operationId: 'getLongformItem', summary: 'One long-form item: front matter, raw markdown, rendered HTML, comparison rows or stack components, links', parameters: [lfRoute, lfId], responses: ok(ref('LongformItem'), 'Long-form item') } },
    '/{route}/{id}.md': { get: { operationId: 'getLongformMarkdown', summary: 'One long-form item as markdown with front matter (scheme links resolved to absolute URLs)', parameters: [lfRoute, lfId], responses: ok({ type: 'string' }, 'Markdown', 'text/markdown') } },
    '/skills/{id}/SKILL.md': { get: { operationId: 'getSkillFile', summary: 'Raw SKILL.md of a published skill', parameters: [lfId], responses: ok({ type: 'string' }, 'SKILL.md', 'text/markdown') } },
    '/skills/{id}.zip': { get: { operationId: 'getSkillZip', summary: 'Zip of a published skill folder (unpacks to {id}/SKILL.md)', parameters: [lfId], responses: ok({ type: 'string', contentEncoding: 'binary' }, 'Zip archive', 'application/zip') } },
    '/schema/entry.schema.json': { get: { operationId: 'getEntrySchema', summary: 'JSON Schema for one entry', responses: ok({ type: 'object' }, 'JSON Schema', 'application/schema+json') } },
    '/contribute.json': { get: { operationId: 'getContributionGuide', summary: 'Machine-readable contribution guide (rules, entry template, PR and issue paths)', responses: ok({ type: 'object', properties: { ...metaProps, contribute: { type: 'object' } } }, 'Contribution guide') } },
    '/llms.txt': { get: { operationId: 'getLlmsTxt', summary: 'llms.txt index', responses: ok({ type: 'string' }, 'llms.txt', 'text/plain') } },
    '/llms-full.txt': { get: { operationId: 'getLlmsFullTxt', summary: 'All entries as markdown', responses: ok({ type: 'string' }, 'llms-full.txt', 'text/plain') } },
  },
  components: { schemas: {
    Entry: entryOut,
    CategorySummary: { type: 'object', properties: { slug: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' }, count: { type: 'integer' }, html: { type: 'string', format: 'uri' }, json: { type: 'string', format: 'uri' } } },
    Index: { type: 'object', properties: { ...metaProps, contribute: { type: 'object', description: 'Same as /contribute.json' }, counts: { type: 'object', properties: { total: { type: 'integer' }, by_category: { type: 'object', additionalProperties: { type: 'integer' } }, longform: { type: 'object' } } }, categories: { type: 'array', items: ref('CategorySummary') }, entries: { type: 'array', items: ref('Entry') } } },
    LongformLinks: { type: 'object', properties: { html: { type: 'string', format: 'uri' }, markdown: { type: 'string', format: 'uri' }, json: { type: 'string', format: 'uri' }, source: { type: 'string', format: 'uri' }, skill_md: { type: 'string', format: 'uri' }, zip: { type: 'string', format: 'uri' } } },
    LongformSummary: { type: 'object', required: ['type', 'id', 'title', 'links'], properties: { type: { type: 'string', enum: LONG.ORDER }, id: { type: 'string' }, title: { type: 'string' }, summary: { type: 'string' }, author: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } }, published: { type: 'string', format: 'date' }, updated: { type: 'string', format: 'date' }, last_verified: { type: 'string', format: 'date' }, entries: { type: 'array', items: { type: 'string' }, description: 'Directory entry ids this item references' }, links: ref('LongformLinks') } },
    LongformItem: { allOf: [ref('LongformSummary'), { type: 'object', properties: { front_matter: { type: 'object' }, markdown: { type: 'string', description: 'Body with scheme links resolved to absolute URLs' }, raw: { type: 'string', description: 'Full file as published (front matter plus body)' }, html: { type: 'string' }, comparison: { type: 'object', description: 'Comparisons: subjects, criteria, table (one row per entry with values per criterion) and verdict' }, stack: { type: 'object', description: 'Stacks: use_case and components (role, entry, name, url, why)', properties: { use_case: { type: 'string' }, components: { type: 'array', items: { type: 'object' } } } }, entries_detail: { type: 'array', items: { type: 'object' } }, related: { type: 'array', items: { type: 'object' } }, sources: { type: 'array', items: { type: 'object' } } } }] },
    LongformIndex: { type: 'object', properties: { ...metaProps, counts: { type: 'object', properties: { total: { type: 'integer' }, by_type: { type: 'object', additionalProperties: { type: 'integer' } } } }, types: { type: 'array', items: { type: 'object' } }, items: { type: 'array', items: ref('LongformSummary') } } },
    CategoryResponse: { type: 'object', properties: { ...metaProps, category: { type: 'object', properties: { slug: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' } } }, count: { type: 'integer' }, entries: { type: 'array', items: ref('Entry') } } },
  } },
}));

// 404
write('/404.html', page({ title: 'Not found', description: 'Page not found.', pathName: '/404.html', body: `<h1>Not found</h1><p>That page does not exist. Try the <a href="${href('/')}">home page</a>, <a href="${href(P.llms)}">llms.txt</a> or the <a href="${href(P.api)}">JSON index</a>.</p>` }));

// sitemap + robots
const htmlPages = ['/', P.agents, P.schema, ...CATEGORIES.map((c) => P.category(c.slug)), ...LONG.sitemapPaths(), ...entries.map((e) => P.entry(e.id))];
const lastmod = (p) => { const l = LONG.lastmod(p); if (l) return l; const id = p.match(/^\/entries\/(.+)\/$/)?.[1]; return id ? (byId[id].updated || byId[id].added) : GENERATED.slice(0, 10); };
write(P.sitemap, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${htmlPages.map((p) => `  <url><loc>${esc(abs(p))}</loc><lastmod>${lastmod(p)}</lastmod></url>`).join('\n')}\n</urlset>\n`);
const BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'claude-web', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Googlebot', 'Bingbot', 'Applebot', 'Applebot-Extended', 'CCBot', 'cohere-ai', 'cohere-training-data-crawler', 'Meta-ExternalAgent', 'Meta-ExternalFetcher', 'FacebookBot', 'Bytespider', 'Amazonbot', 'DuckAssistBot', 'MistralAI-User', 'YouBot', 'Diffbot', 'AI2Bot', 'Timpibot', 'xAI-Bot', 'GrokBot'];
write(P.robots, `# ${SITE_NAME}: built by agents, for agents.
# AI crawlers, agents and LLM trainers are explicitly welcome to read and index everything here.
# Machine-readable index: ${abs(P.llms)}
# Full content: ${abs(P.llmsFull)}
# JSON API: ${abs(P.api)} (OpenAPI: ${abs(P.openapi)})
# Guides, comparisons, stacks, skills: ${abs(LP.api)}

${BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

User-agent: *
Allow: /

Sitemap: ${abs(P.sitemap)}
`);

const nStatic = copyStatic();
console.log(`Built ${written.length} files (${nStatic} from static/) into dist/ (${plural(entries.length, 'entr')}, ${CATEGORIES.length} categories) for ${SITE_URL} (base path "${BASE_PATH || '/'}")${CNAME ? `, CNAME=${CNAME}` : ', no CNAME'}.`);
