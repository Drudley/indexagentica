// Long-form content (guides, comparisons, stacks, skills) for the static build.
// Used by scripts/build.mjs; all helpers come in through ctx so URL/base-path handling stays in one place.
import fs from 'node:fs';
import path from 'node:path';
import { loadLongform, validateLongform } from './lib/longform.mjs';
import { createZip } from './lib/zip.mjs';
import { markdown, rewriteLinks, esc } from './markdown.mjs';

export const LF = {
  guide: { route: 'guides', name: 'Guides', singular: 'Guide', description: 'Step-by-step guides for building with and for AI agents.' },
  comparison: { route: 'compare', name: 'Comparisons', singular: 'Comparison', description: 'Side-by-side comparisons of directory entries on concrete criteria.' },
  stack: { route: 'stacks', name: 'Stacks', singular: 'Stack', description: 'Curated combinations of tools for a specific agent use case.' },
  skill: { route: 'skills', name: 'Skills', singular: 'Skill', description: 'Downloadable Agent Skills (SKILL.md folders), served raw and as zip archives.' },
};
const ORDER = ['guide', 'comparison', 'stack', 'skill'];
export const LP = {
  index: (t) => `/${LF[t].route}/`, page: (t, id) => `/${LF[t].route}/${id}/`, md: (t, id) => `/${LF[t].route}/${id}.md`,
  api: '/api/longform.json', apiType: (t) => `/api/longform/${LF[t].route}.json`, apiItem: (t, id) => `/api/longform/${LF[t].route}/${id}.json`,
  skillMd: (id) => `/skills/${id}/SKILL.md`, zip: (id) => `/skills/${id}.zip`, skillFile: (id, f) => `/skills/${id}/${f}`,
};
const BODY_LINK = /\]\(\s*entry:([a-z0-9-]+)\s*\)/g;

export function prepareLongform(ctx) {
  const { ROOT, entryIds, byId, href, abs, P, REPO_URL, includeDrafts } = ctx;
  const check = validateLongform({ entryIds });
  if (check.problems.length) { console.error(`Refusing to build: ${check.problems.length} long-form problem(s). Run: node scripts/validate.mjs`); process.exit(1); }
  const all = loadLongform();
  const items = all.filter((x) => includeDrafts || x.item.status !== 'draft')
    .sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || (b.item.updated || b.item.published || b.item.last_verified || '').localeCompare(a.item.updated || a.item.published || a.item.last_verified || '') || a.item.title.localeCompare(b.item.title));
  const byKey = new Map(items.map((x) => [x.item.id, x]));
  const published = (id) => byKey.get(id);

  // ---- link resolution (unpublished targets resolve to null -> rendered as plain text) ----
  const target = (h) => {
    const m = String(h).match(/^(entry|guide|comparison|stack|skill):([a-z0-9-]+)$/);
    if (!m) return null;
    if (m[1] === 'entry') return byId[m[2]] ? P.entry(m[2]) : null;
    const x = published(m[2]);
    return x && x.type === m[1] ? LP.page(x.type, m[2]) : null;
  };
  const resolveHtml = (h) => { const t = target(h); return t ? href(t) : (/^(entry|guide|comparison|stack|skill):/.test(h) ? '' : null); };
  const resolveAbs = (h) => { const t = target(h); return t ? abs(t) : null; };
  // SKILL.md bodies usually start at '#' and sit under an h2 "SKILL.md" section; other bodies start at '##'.
  const renderBody = (body, type) => markdown(body, type === 'skill' ? { shift: 2, minHeading: 3, resolveLink: resolveHtml } : { shift: 0, minHeading: 2, resolveLink: resolveHtml });
  const absBody = (body) => rewriteLinks(body, resolveAbs);

  // ---- references: entries ∪ subjects ∪ components ∪ body entry: links ----
  for (const x of items) {
    const d = x.data;
    const ids = new Set([...(x.item.entries || [])]);
    if (x.type === 'comparison') (d.subjects || []).forEach((i) => ids.add(i));
    if (x.type === 'stack') (d.components || []).forEach((c) => ids.add(c.entry));
    for (const m of x.body.matchAll(BODY_LINK)) ids.add(m[1]);
    x.refs = [...ids].filter((i) => byId[i]);
    x.related = (x.item.related || []).map(published).filter(Boolean);
    if (x.type === 'skill') {
      const dir = path.dirname(x.file);
      const files = [];
      (function walk(d, pre) { for (const f of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { if (f.name.startsWith('.')) continue; const p = path.join(d, f.name); f.isDirectory() ? walk(p, pre + f.name + '/') : files.push(pre + f.name); } })(dir, '');
      if (files.includes('index.html')) { console.error(`${x.rel}: a skill folder must not contain index.html (reserved for the skill page)`); process.exit(1); }
      x.files = files;
      x.dir = dir;
    }
  }
  const refsByEntry = {};
  for (const x of items) for (const id of x.refs) (refsByEntry[id] ||= []).push(x);

  const summaryOf = (x) => ({
    type: x.type, id: x.item.id, title: x.item.title, summary: x.item.summary, author: x.item.author, tags: x.item.tags || [],
    published: x.item.published, updated: x.item.updated, last_verified: x.item.last_verified,
    ...(x.type === 'guide' ? { difficulty: x.data.difficulty, time_estimate: x.data.time_estimate } : {}),
    entries: x.refs,
    links: {
      html: abs(LP.page(x.type, x.item.id)), markdown: abs(LP.md(x.type, x.item.id)), json: abs(LP.apiItem(x.type, x.item.id)),
      ...(x.type === 'skill' ? { skill_md: abs(LP.skillMd(x.item.id)), zip: abs(LP.zip(x.item.id)) } : {}),
      source: `${REPO_URL}/blob/main/${x.rel}`,
    },
  });
  const backref = (x) => ({ type: x.type, id: x.item.id, title: x.item.title, url: abs(LP.page(x.type, x.item.id)), json: abs(LP.apiItem(x.type, x.item.id)) });
  const entryRef = (id) => ({ id, name: byId[id].name, summary: byId[id].summary, url: abs(P.entry(id)), json: abs(P.apiEntry(id)) });
  const sourcesOf = (x) => (x.type === 'skill' ? x.item.sources : x.data.sources || []);

  function comparisonData(x) {
    const d = x.data;
    return { subjects: d.subjects.map(entryRef), criteria: d.criteria, rows: d.rows, table: d.subjects.map((s) => ({ entry: s, name: byId[s].name, url: abs(P.entry(s)), values: Object.fromEntries(d.criteria.map((c) => [c, d.rows[s][c]])) })), verdict: d.verdict };
  }
  function stackData(x) {
    return { use_case: x.data.use_case, components: x.data.components.map((c) => ({ role: c.role, entry: c.entry, name: byId[c.entry].name, url: abs(P.entry(c.entry)), why: c.why })) };
  }
  function rawMd(x) { return x.type === 'skill' ? x.text : absBody(x.text); }
  const mdCell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

  // Markdown block for llms-full.txt / API markdown: headings shifted so the item title is at `level`.
  function itemMarkdown(x, level = 1) {
    const h = '#'.repeat(level);
    const it = x.item;
    const L = [`${h} ${it.title}`, '', `> ${it.summary}`, '',
      `- type: ${x.type}`, `- id: \`${it.id}\``, `- author: ${it.author}`,
      it.published && `- published: ${it.published}`, it.updated && `- updated: ${it.updated}`, `- last verified: ${it.last_verified}`,
      x.type === 'guide' && x.data.difficulty && `- difficulty: ${x.data.difficulty}`, x.type === 'guide' && x.data.time_estimate && `- time: ${x.data.time_estimate}`,
      it.tags?.length && `- tags: ${it.tags.join(', ')}`,
      x.refs.length && `- entries: ${x.refs.map((i) => `${byId[i].name} (${abs(P.entry(i))})`).join('; ')}`,
      `- page: ${abs(LP.page(x.type, it.id))}`, `- markdown: ${abs(LP.md(x.type, it.id))}`,
      x.type === 'skill' && `- download: ${abs(LP.zip(it.id))} (zip), ${abs(LP.skillMd(it.id))} (SKILL.md)`,
    ].filter(Boolean);
    if (x.type === 'guide' && x.data.prerequisites?.length) L.push('', 'Prerequisites:', '', ...x.data.prerequisites.map((p) => `- ${p}`));
    if (x.type === 'comparison') {
      const c = comparisonData(x);
      L.push('', `| | ${c.criteria.map(mdCell).join(' | ')} |`, `|---|${c.criteria.map(() => '---').join('|')}|`, ...c.table.map((r) => `| [${mdCell(r.name)}](${r.url}) | ${c.criteria.map((k) => mdCell(r.values[k])).join(' | ')} |`));
      if (c.verdict) L.push('', `Verdict: ${c.verdict}`);
    }
    if (x.type === 'stack') {
      const s = stackData(x);
      L.push('', `Use case: ${s.use_case}`, '', '| Role | Component | Why |', '|---|---|---|', ...s.components.map((c) => `| ${mdCell(c.role)} | [${mdCell(c.name)}](${c.url}) | ${mdCell(c.why)} |`));
    }
    const body = (x.type === 'skill' ? x.body : absBody(x.body)).trim().replace(/^(#{1,6})\s/gm, (m, hs) => '#'.repeat(Math.min(6, Math.max(hs.length, 2) + level - 1)) + ' ');
    L.push('', body);
    const src = sourcesOf(x);
    if (src?.length) L.push('', 'Sources:', '', ...src.map((s) => `- ${s.title ? `${s.title}: ` : ''}${s.url}${s.accessed ? ` (accessed ${s.accessed})` : ''}`));
    return L.join('\n') + '\n';
  }

  function itemJson(x) {
    const it = x.item;
    return {
      ...summaryOf(x), status: it.status,
      ...(x.type === 'guide' ? { prerequisites: x.data.prerequisites || [] } : {}),
      ...(x.type === 'comparison' ? { comparison: comparisonData(x) } : {}),
      ...(x.type === 'stack' ? { stack: stackData(x) } : {}),
      ...(x.type === 'skill' ? { skill: { name: it.id, description: x.data.description, license: x.data.license, compatibility: x.data.compatibility, version: it.version, files: x.files.map((f) => ({ path: f, url: abs(LP.skillFile(it.id, f)) })), skill_md: abs(LP.skillMd(it.id)), zip: abs(LP.zip(it.id)) } } : {}),
      entries_detail: x.refs.map(entryRef),
      related: x.related.map(backref),
      sources: sourcesOf(x) || [],
      front_matter: x.data,
      markdown: x.type === 'skill' ? x.body : absBody(x.body),
      raw: rawMd(x),
      html: renderBody(x.body, x.type),
    };
  }

  // ---- HTML ----
  const lfList = (list) => list.length
    ? `<ul class="entries">${list.map((x) => `<li><a href="${href(LP.page(x.type, x.item.id))}"><strong>${esc(x.item.title)}</strong></a> <small>${esc(LF[x.type].singular)}</small><p>${esc(x.item.summary)}</p></li>`).join('')}</ul>`
    : '<p>Nothing published yet.</p>';
  const time = (d) => `<time datetime="${d}">${d}</time>`;
  const dl = (rows) => `<dl class="meta">${rows.filter(Boolean).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

  function writePages({ write, page }) {
    for (const t of ORDER) {
      const list = items.filter((x) => x.type === t);
      write(LP.index(t), page({
        title: LF[t].name, description: LF[t].description, pathName: LP.index(t), crumbs: [[LF[t].name]],
        alternates: [['application/json', `${LF[t].name} JSON`, LP.apiType(t)]],
        body: `<h1>${LF[t].name} <span class="count">(${list.length})</span></h1>
<p class="lede">${esc(LF[t].description)}</p>
<p>Machine-readable: <a href="${href(LP.apiType(t))}"><code>${LP.apiType(t)}</code></a>${t === 'skill' ? '. Each skill is also downloadable as a zip and as a raw <code>SKILL.md</code>' : ''}.</p>
${lfList(list)}`,
      }));
    }
    for (const x of items) {
      const it = x.item, d = x.data, t = x.type;
      const rows = [
        ['Type', `<a href="${href(LP.index(t))}">${LF[t].singular}</a>`], ['Author', esc(it.author)],
        it.published && ['Published', time(it.published)], it.updated && ['Updated', time(it.updated)], ['Last verified', time(it.last_verified)],
        t === 'guide' && d.difficulty && ['Difficulty', esc(d.difficulty)], t === 'guide' && d.time_estimate && ['Time', esc(d.time_estimate)],
        t === 'skill' && it.version && ['Version', esc(it.version)], t === 'skill' && it.license && ['License', esc(it.license)],
        t === 'skill' && it.compatibility && ['Compatibility', esc(it.compatibility)],
      ];
      let typeBlock = '';
      if (t === 'guide' && d.prerequisites?.length) typeBlock = `<h2>Prerequisites</h2><ul>${d.prerequisites.map((p) => `<li>${markdown(p, { resolveLink: resolveHtml }).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>`;
      if (t === 'comparison') {
        const c = comparisonData(x);
        typeBlock = `<h2>Comparison</h2><div class="table-wrap"><table><caption>${esc(it.title)}</caption><thead><tr><th scope="col">Entry</th>${c.criteria.map((k) => `<th scope="col">${esc(k)}</th>`).join('')}</tr></thead><tbody>${c.table.map((r) => `<tr><th scope="row"><a href="${href(P.entry(r.entry))}">${esc(r.name)}</a></th>${c.criteria.map((k) => `<td>${esc(r.values[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${c.verdict ? `<p><strong>Verdict:</strong> ${esc(c.verdict)}</p>` : ''}`;
      }
      if (t === 'stack') {
        const s = stackData(x);
        typeBlock = `<h2>Use case</h2><p>${esc(s.use_case)}</p><h2>Components</h2><table><thead><tr><th scope="col">Role</th><th scope="col">Component</th><th scope="col">Why</th></tr></thead><tbody>${s.components.map((c) => `<tr><td>${esc(c.role)}</td><td><a href="${href(P.entry(c.entry))}">${esc(c.name)}</a></td><td>${esc(c.why)}</td></tr>`).join('')}</tbody></table>`;
      }
      if (t === 'skill') {
        typeBlock = `<h2>Download</h2><ul><li><a href="${href(LP.zip(it.id))}" download>${esc(it.id)}.zip</a> (the whole skill folder)</li><li><a href="${href(LP.skillMd(it.id))}">SKILL.md</a> (raw)</li></ul>
<p>Install by unzipping into your agent's skills directory, e.g. for Claude Code: <code>curl -sLO ${esc(abs(LP.zip(it.id)))} &amp;&amp; unzip -o ${esc(it.id)}.zip -d ~/.claude/skills/</code></p>
<h3>Files</h3><ul>${x.files.map((f) => `<li><a href="${href(LP.skillFile(it.id, f))}"><code>${esc(f)}</code></a></li>`).join('')}</ul>
<h3>Description</h3><p>${esc(d.description)}</p>`;
      }
      const src = sourcesOf(x) || [];
      write(LP.page(t, it.id), page({ ogType: 'article',
        title: it.title, description: it.summary, pathName: LP.page(t, it.id), crumbs: [[LF[t].name, LP.index(t)], [it.title]],
        alternates: [['application/json', `${it.title} JSON`, LP.apiItem(t, it.id)], ['text/markdown', `${it.title} markdown`, LP.md(t, it.id)]],
        jsonld: { '@context': 'https://schema.org', '@type': t === 'guide' ? 'HowTo' : t === 'skill' ? 'SoftwareSourceCode' : 'Article', name: it.title, headline: it.title, description: it.summary, author: { '@type': 'Organization', name: it.author }, ...(it.published ? { datePublished: it.published } : {}), dateModified: it.updated || it.last_verified, keywords: (it.tags || []).join(', '), url: abs(LP.page(t, it.id)) },
        body: `<article>
<h1>${esc(it.title)}</h1>
<p class="lede">${esc(it.summary)}</p>
${dl(rows)}
${it.tags?.length ? `<ul class="tags">${it.tags.map((g) => `<li>${esc(g)}</li>`).join('')}</ul>` : ''}
${typeBlock}
${t === 'skill' ? '<h2>SKILL.md</h2>' : ''}
${renderBody(x.body, x.type)}
${x.refs.length ? `<h2>Directory entries in this ${LF[t].singular.toLowerCase()}</h2><ul>${x.refs.map((i) => `<li><a href="${href(P.entry(i))}">${esc(byId[i].name)}</a>: ${esc(byId[i].summary)}</li>`).join('')}</ul>` : ''}
${x.related.length ? `<h2>Related</h2><ul>${x.related.map((r) => `<li><a href="${href(LP.page(r.type, r.item.id))}">${esc(r.item.title)}</a> (${LF[r.type].singular})</li>`).join('')}</ul>` : ''}
${src.length ? `<h2>Sources</h2><ul>${src.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.title || s.url)}</a>${s.accessed ? `, accessed ${time(s.accessed)}` : ''}</li>`).join('')}</ul>` : ''}
<h2>Machine-readable</h2>
<ul><li><a href="${href(LP.apiItem(t, it.id))}">JSON</a></li><li><a href="${href(LP.md(t, it.id))}">Markdown</a></li>${t === 'skill' ? `<li><a href="${href(LP.skillMd(it.id))}">SKILL.md</a></li><li><a href="${href(LP.zip(it.id))}">Zip</a></li>` : ''}<li><a href="${REPO_URL}/blob/main/${x.rel}">Source on GitHub</a></li></ul>
</article>`,
      }));
      write(LP.md(t, it.id), rawMd(x));
      if (t === 'skill') {
        for (const f of x.files) write(LP.skillFile(it.id, f), fs.readFileSync(path.join(x.dir, f)));
        write(LP.zip(it.id), createZip(x.files.map((f) => ({ name: `${it.id}/${f}`, data: fs.readFileSync(path.join(x.dir, f)) })), it.updated || it.last_verified));
      }
    }
  }

  function writeApi({ write, json, meta }) {
    const counts = Object.fromEntries(ORDER.map((t) => [t, items.filter((x) => x.type === t).length]));
    write(LP.api, json({ ...meta(), counts: { total: items.length, by_type: counts }, types: ORDER.map((t) => ({ type: t, name: LF[t].name, description: LF[t].description, count: counts[t], html: abs(LP.index(t)), json: abs(LP.apiType(t)) })), items: items.map(summaryOf) }));
    for (const t of ORDER) write(LP.apiType(t), json({ ...meta(), type: t, name: LF[t].name, count: counts[t], items: items.filter((x) => x.type === t).map(summaryOf) }));
    for (const x of items) write(LP.apiItem(x.type, x.item.id), json(itemJson(x)));
    return counts;
  }

  return {
    items, refsByEntry, ORDER, LF, LP, itemMarkdown, writePages, writeApi,
    backrefs: (id) => (refsByEntry[id] || []).map(backref),
    counts: () => Object.fromEntries(ORDER.map((t) => [t, items.filter((x) => x.type === t).length])),
    sitemapPaths: () => [...ORDER.map(LP.index), ...items.map((x) => LP.page(x.type, x.item.id))],
    lastmod: (p) => { const x = items.find((i) => LP.page(i.type, i.item.id) === p); return x ? (x.item.updated || x.item.last_verified) : null; },
    entryHtml: (id) => {
      const list = refsByEntry[id] || [];
      return list.length ? `<h2>Guides &amp; comparisons</h2><ul>${list.map((x) => `<li><a href="${href(LP.page(x.type, x.item.id))}">${esc(x.item.title)}</a> (${LF[x.type].singular}): ${esc(x.item.summary)}</li>`).join('')}</ul>` : '';
    },
  };
}
