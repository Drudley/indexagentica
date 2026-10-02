#!/usr/bin/env node
// Zero-dependency link & freshness checker for all entries. Never modifies content.
// Checks url, repo, docs, agent_access.{llms_txt,openapi,mcp_endpoint} and sources.
//   - HEAD first, GET fallback; redirects followed manually (max 10) so permanent moves are visible
//   - timeout per request, one retry for timeouts / network errors / 5xx / 429
//   - global + per-host concurrency limits, browser-like User-Agent (honestly suffixed)
//   - 401/403/429/999 and bot challenges => "unverified" (not counted as broken)
//   - entries whose `updated` (or `added`) is older than STALE_DAYS => "stale"
// Usage: node scripts/linkcheck.mjs [--out dir] [--only id,id] [--limit N]
// Writes <out>/report.md and <out>/result.json; sets GITHUB_OUTPUT problems=<n>.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/categories.mjs';
import { loadEntries } from './validate.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', 'upkeep'));
const ONLY = arg('--only', '') ? new Set(arg('--only').split(',')) : null;
const LIMIT = +arg('--limit', 0);
const STALE_DAYS = +(process.env.STALE_DAYS || 90);
const TIMEOUT = +(process.env.LINK_TIMEOUT_MS || 20000);
const CONCURRENCY = 8, PER_HOST = 2, MAX_HOPS = 10;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 IndexAgenticaLinkCheck/1.0 (+https://indexagentica.com/agents/)';
const HEADERS = { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7', 'accept-language': 'en-US,en;q=0.9' };
const RUN_URL = process.env.RUN_URL || '';
const now = new Date();
const today = now.toISOString().slice(0, 10);

// ---------- collect ----------
let entries = loadEntries().map((f) => ({ file: path.relative(ROOT, f), data: JSON.parse(fs.readFileSync(f, 'utf8')) }));
if (ONLY) entries = entries.filter((e) => ONLY.has(e.data.id));
const refs = new Map(); // url -> [{ entry, field }]
const add = (url, entry, field) => { if (typeof url !== 'string' || !url) return; if (!refs.has(url)) refs.set(url, []); refs.get(url).push({ entry, field }); };
for (const e of entries) {
  const d = e.data;
  add(d.url, e, 'url'); add(d.repo, e, 'repo'); add(d.docs, e, 'docs');
  for (const k of ['llms_txt', 'openapi', 'mcp_endpoint']) add(d.agent_access?.[k], e, `agent_access.${k}`);
  (d.sources || []).forEach((s, i) => add(s, e, `sources[${i}]`));
}
let urls = [...refs.keys()];
if (LIMIT) urls = urls.slice(0, LIMIT);

// ---------- fetch ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function attempt(url, method) {
  const hops = [];
  let current = url;
  for (let i = 0; i <= MAX_HOPS; i++) {
    let res;
    try {
      res = await fetch(current, { method, redirect: 'manual', headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT) });
    } catch (e) {
      const code = e?.cause?.code || e?.name || 'ERROR';
      return { error: code === 'TimeoutError' || code === 'AbortError' ? 'timeout' : code, detail: e?.cause?.message || e?.message, hops, finalUrl: current };
    }
    try { await res.body?.cancel(); } catch {}
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) {
      const next = new URL(loc, current).toString();
      hops.push({ status: res.status, from: current, to: next });
      current = next;
      continue;
    }
    return { status: res.status, hops, finalUrl: current, server: res.headers.get('server') || '', cfMitigated: res.headers.get('cf-mitigated') || '' };
  }
  return { error: 'too-many-redirects', hops, finalUrl: current };
}

const transient = (r) => r.error === 'timeout' || (r.error && !['ENOTFOUND', 'too-many-redirects', 'ERR_INVALID_URL'].includes(r.error)) || r.status === 429 || r.status >= 500;

async function check(url, isMcp) {
  let u;
  try { u = new URL(url); } catch { return { url, kind: 'broken', reason: 'invalid URL' }; }
  if (!/^https?:$/.test(u.protocol)) return { url, kind: 'skipped', reason: `${u.protocol} not checked` };
  let r = await attempt(url, 'HEAD');
  if (r.error || r.status >= 400) r = await attempt(url, 'GET'); // many servers mishandle HEAD
  if (transient(r)) { await sleep(3000); r = await attempt(url, 'GET'); }
  return classify(url, r, isMcp);
}

const norm = (s) => { try { const u = new URL(s); return `${u.hostname.replace(/^www\./, '').toLowerCase()}${u.port && !['80', '443'].includes(u.port) ? ':' + u.port : ''}${u.pathname.replace(/\/+$/, '') || ''}${u.search}`; } catch { return s; } };

// A site root or section redirecting deeper into itself (e.g. docs.example.com -> /introduction) is a
// landing page, not a move: the shorter URL is the better canonical link, so don't flag it.
function isLanding(from, to) {
  try {
    const a = new URL(from), b = new URL(to);
    if (a.hostname.replace(/^www\./, '') !== b.hostname.replace(/^www\./, '')) return false;
    const ap = a.pathname.replace(/\/+$/, ''), bp = b.pathname.replace(/\/+$/, '');
    return ap === '' || bp.startsWith(ap + '/');
  } catch { return false; }
}

function classify(url, r, isMcp) {
  const base = { url, finalUrl: r.finalUrl, hops: r.hops };
  if (r.error) {
    if (r.error === 'timeout') return { ...base, kind: 'unverified', reason: `timeout after ${TIMEOUT / 1000}s (twice)` };
    return { ...base, kind: 'broken', reason: `${r.error}${r.detail && r.detail !== r.error ? `: ${r.detail}` : ''}`.slice(0, 160) };
  }
  const s = r.status;
  const cf = r.cfMitigated || (/cloudflare/i.test(r.server) && (s === 403 || s === 503));
  let kind, reason = `HTTP ${s}`;
  if (s < 400) kind = 'ok';
  else if (isMcp && [400, 401, 403, 405, 406, 415].includes(s)) { kind = 'ok'; reason = `HTTP ${s} (MCP endpoint responds; expected without an MCP client)`; }
  else if (cf) { kind = 'unverified'; reason = `HTTP ${s} (bot protection challenge)`; }
  else if ([401, 403, 429, 999].includes(s)) { kind = 'unverified'; reason = `HTTP ${s} (${s === 401 ? 'auth required' : s === 429 ? 'rate limited' : 'blocked for automated clients'})`; }
  else if ([404, 410].includes(s)) { kind = 'broken'; reason = `HTTP ${s} ${s === 404 ? 'Not Found' : 'Gone'}`; }
  else if (s >= 500) { kind = 'broken'; reason = `HTTP ${s} (server error, persisted after retry)`; }
  else { kind = 'unverified'; reason = `HTTP ${s}`; }
  const first = r.hops[0];
  if (kind === 'ok' && first && [301, 308].includes(first.status) && norm(url) !== norm(r.finalUrl) && !isLanding(url, r.finalUrl)) {
    return { ...base, kind: 'moved', reason: `${first.status} permanent redirect`, target: r.finalUrl };
  }
  return { ...base, kind, reason };
}

async function runAll(list) {
  const results = new Map();
  const hostActive = new Map();
  const queue = [...list];
  let active = 0;
  return new Promise((resolve) => {
    const pump = () => {
      if (!queue.length && !active) return resolve(results);
      for (let i = 0; i < queue.length && active < CONCURRENCY; i++) {
        const url = queue[i];
        let host; try { host = new URL(url).host; } catch { host = url; }
        if ((hostActive.get(host) || 0) >= PER_HOST) continue;
        queue.splice(i--, 1);
        active++; hostActive.set(host, (hostActive.get(host) || 0) + 1);
        const isMcp = refs.get(url).some((r) => r.field === 'agent_access.mcp_endpoint');
        check(url, isMcp).catch((e) => ({ url, kind: 'unverified', reason: `checker error: ${e.message}` })).then((res) => {
          results.set(url, res);
          active--; hostActive.set(host, hostActive.get(host) - 1);
          pump();
        });
      }
    };
    pump();
  });
}

const t0 = Date.now();
const results = await runAll(urls);

// ---------- aggregate per entry ----------
const perEntry = new Map(); // file -> { entry, items: [] }
const item = (e, obj) => { if (!perEntry.has(e.file)) perEntry.set(e.file, { e, items: [] }); perEntry.get(e.file).items.push(obj); };
const counts = { broken: 0, moved: 0, stale: 0, unverified: 0, ok: 0, skipped: 0 };
for (const [url, res] of results) {
  counts[res.kind]++;
  if (['broken', 'moved', 'unverified'].includes(res.kind)) for (const ref of refs.get(url)) item(ref.entry, { kind: res.kind, field: ref.field, url, reason: res.reason, target: res.target });
}
for (const e of entries) {
  const last = e.data.updated || e.data.added;
  const days = Math.floor((now - new Date(last + 'T00:00:00Z')) / 86400000);
  if (days > STALE_DAYS) { counts.stale++; item(e, { kind: 'stale', field: e.data.updated ? 'updated' : 'added', reason: `last ${e.data.updated ? 'updated' : 'added'} ${last} (${days} days ago)` }); }
}
const problemItems = [...perEntry.values()].flatMap((p) => p.items).filter((i) => i.kind !== 'unverified');
const problems = problemItems.length;
const problemEntries = [...perEntry.values()].filter((p) => p.items.some((i) => i.kind !== 'unverified'));

// ---------- report ----------
const ICON = { broken: '❌ **broken**', moved: '↪️ **moved**', stale: '🕰️ **stale**', unverified: '❔ unverified' };
const line = (i) => i.kind === 'stale' ? `- ${ICON.stale}: ${i.reason}; re-verify the facts and set \`updated\``
  : i.kind === 'moved' ? `- ${ICON.moved} \`${i.field}\`: ${i.url} → ${i.target} (${i.reason}); update the link`
  : `- ${ICON[i.kind]} \`${i.field}\`: ${i.url} (${i.reason})`;
const sortP = (a, b) => a.e.data.name.localeCompare(b.e.data.name);
const head = [
  '<!-- upkeep-report -->',
  `**${problems} problem(s) in ${problemEntries.length} entr${problemEntries.length === 1 ? 'y' : 'ies'}.** Checked ${results.size} unique URLs across ${entries.length} entries on ${today} (UTC) in ${Math.round((Date.now() - t0) / 1000)}s${RUN_URL ? ` · [workflow run](${RUN_URL})` : ''}.`, '',
  '| Check | Count |', '|---|---|',
  `| ❌ Broken links (404/410, DNS/TLS/connection errors, persistent 5xx) | ${counts.broken} |`,
  `| ↪️ Permanent redirects (301/308 to a different URL) | ${counts.moved} |`,
  `| 🕰️ Stale entries (\`updated\`/\`added\` older than ${STALE_DAYS} days) | ${counts.stale} |`,
  `| ❔ Unverified (bot protection, auth, rate limit, timeout; not counted as problems) | ${counts.unverified} |`,
  `| ✅ OK | ${counts.ok} |`, '',
];
const body = [];
if (problemEntries.length) {
  body.push('## Problems by entry', '');
  for (const p of problemEntries.sort(sortP)) body.push(`### ${p.e.data.name} · [\`${p.e.file}\`](../blob/main/${p.e.file})`, '', ...p.items.filter((i) => i.kind !== 'unverified').map(line), '');
}
const unv = [...perEntry.values()].filter((p) => p.items.some((i) => i.kind === 'unverified')).sort(sortP);
if (unv.length) {
  body.push(`<details><summary>Unverified links (${counts.unverified} URLs): could not be confirmed automatically; check manually if in doubt</summary>`, '');
  for (const p of unv) body.push(`- **${p.e.data.name}** (\`${p.e.file}\`)`, ...p.items.filter((i) => i.kind === 'unverified').map((i) => `  - \`${i.field}\`: ${i.url} (${i.reason})`));
  body.push('', '</details>', '');
}
const foot = ['---', `_Maintained by the [upkeep workflow](../blob/main/.github/workflows/upkeep.yml): this issue is updated in place on each run and closed automatically when everything passes. Entries are never edited or deleted automatically; fix them with a pull request (see [CONTRIBUTING.md](../blob/main/CONTRIBUTING.md))._`];
let report = [...head, ...body, ...foot].join('\n');
if (report.length > 60000) report = [...head, body.join('\n').slice(0, 55000), '', `_Report truncated; full report in the workflow run artifacts${RUN_URL ? `: ${RUN_URL}` : ''}._`, '', ...foot].join('\n');
// Issue bodies resolve "../blob/main" relative to /issues/N; make links absolute for safety.
report = report.replace(/\]\(\.\.\/blob\/main\//g, '](https://github.com/Drudley/indexagentica/blob/main/');

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'report.md'), report + '\n');
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify({ generated: now.toISOString(), problems, counts, entries: entries.length, urls: results.size, results: [...results.values()] }, null, 2) + '\n');
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `problems=${problems}\n`);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `# Link & freshness report\n\n${report}\n`);
console.log(`${problems} problem(s): broken ${counts.broken}, moved ${counts.moved}, stale ${counts.stale}; unverified ${counts.unverified}; ok ${counts.ok}; ${results.size} URLs in ${Math.round((Date.now() - t0) / 1000)}s. Report: ${path.relative(process.cwd(), OUT)}/report.md`);
