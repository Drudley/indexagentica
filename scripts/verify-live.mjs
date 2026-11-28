#!/usr/bin/env node
// Live post-deploy verifier for indexagentica.com. Never modifies content and is not part of
// the site build (scripts/ stays out of dist/). Zero dependencies; Node >= 18.
//
// Checks, with X-Indexagentica-Internal: 1 and User-Agent indexagentica-builder/1:
//   - each entry and long-form item: page + .md return HTTP 200
//   - /llms.txt lists them
//   - /api/index.json and /api/longform.json totals match --expect-* (optional type counts)
//   - MCP (https://mcp.indexagentica.com/mcp) get_entry / get_content / search find them
//
// Usage:
//   node scripts/verify-live.mjs \
//     --entry id,id \
//     --longform comparison:id,guide:id,stack:id,skill:id \
//     --expect-entries 754 --expect-longform 83 --expect-comparisons 41 \
//     --mcp-wait-ms 600000 --mcp-retry-ms 30000
//
// --entry and --longform may be repeated. --mcp-wait-ms retries MCP only (pages/APIs run once).
// Exit 0 if every check passes; 1 otherwise. Does not print secrets or response bodies.

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const flag = (k) => process.argv.includes(k);
const split = (s) => String(s || '').split(/[\s,]+/).map((x) => x.trim()).filter(Boolean);
const collect = (k) => {
  const out = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === k && process.argv[i + 1]) out.push(...split(process.argv[++i]));
  }
  return out;
};

const ROUTES = { comparison: 'compare', guide: 'guides', stack: 'stacks', skill: 'skills' };
const BASE = (arg('--base', 'https://indexagentica.com')).replace(/\/$/, '');
const MCP_URL = arg('--mcp', 'https://mcp.indexagentica.com/mcp');
const TIMEOUT = +(arg('--timeout-ms', process.env.VERIFY_TIMEOUT_MS || '20000'));
const MCP_WAIT = +(arg('--mcp-wait-ms', '0'));
const MCP_RETRY = +(arg('--mcp-retry-ms', '30000'));
const EXPECT_ENTRIES = arg('--expect-entries', '');
const EXPECT_LONGFORM = arg('--expect-longform', '');
const EXPECT_COMPARISONS = arg('--expect-comparisons', '');
const EXPECT_GUIDES = arg('--expect-guides', '');
const EXPECT_STACKS = arg('--expect-stacks', '');
const EXPECT_SKILLS = arg('--expect-skills', '');
const UA = 'indexagentica-builder/1';
const HDRS = { 'X-Indexagentica-Internal': '1', 'User-Agent': UA, Accept: 'text/html,text/plain,application/json;q=0.9,*/*;q=0.8' };
const MCP_HDRS = { ...HDRS, 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };

const entries = collect('--entry');
const longformRaw = collect('--longform');
if (flag('--help') || flag('-h') || (!entries.length && !longformRaw.length && !EXPECT_ENTRIES && !EXPECT_LONGFORM)) {
  console.log(`Usage: node scripts/verify-live.mjs --entry id,id --longform comparison:id,guide:id \\
         --expect-entries N --expect-longform N [--expect-comparisons N] \\
         [--mcp-wait-ms 600000] [--mcp-retry-ms 30000] [--base URL] [--mcp URL]

  --entry              Directory entry ids (repeatable or comma-separated)
  --longform           type:id items; type is comparison, guide, stack, or skill
  --expect-entries     Required /api/index.json counts.total (or entries length)
  --expect-longform    Required /api/longform.json counts.total
  --expect-comparisons / --expect-guides / --expect-stacks / --expect-skills
  --mcp-wait-ms        Max time to retry MCP after a miss (pages and APIs run once)
  --mcp-retry-ms       Sleep between MCP retries (default 30000)
  --timeout-ms         Per-request timeout (default 20000)
  Internal traffic: header X-Indexagentica-Internal: 1, UA ${UA}`);
  process.exit(flag('--help') || flag('-h') ? 0 : 2);
}

const longform = [];
for (const raw of longformRaw) {
  const i = raw.indexOf(':');
  if (i < 1) { console.error(`Bad --longform value ${raw} (want type:id)`); process.exit(2); }
  const type = raw.slice(0, i);
  const id = raw.slice(i + 1);
  if (!ROUTES[type] || !id) { console.error(`Bad --longform value ${raw}`); process.exit(2); }
  longform.push({ type, id, route: ROUTES[type], path: `/${ROUTES[type]}/${id}/` });
}

const failures = [];
const notes = [];
const pass = (msg) => console.log(`OK  ${msg}`);
const fail = (msg) => { console.log(`FAIL  ${msg}`); failures.push(msg); };

const withTimeout = async (ms, fn) => {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await fn(ac.signal); }
  finally { clearTimeout(t); }
};

async function get(url, extra = {}) {
  try {
    return await withTimeout(TIMEOUT, async (signal) => {
      const res = await fetch(url, { headers: { ...HDRS, ...extra }, signal, redirect: 'follow' });
      const buf = Buffer.from(await res.arrayBuffer());
      return { status: res.status, body: buf.toString('utf8'), type: res.headers.get('content-type') || '' };
    });
  } catch (err) {
    return { status: 0, body: '', error: err.name === 'AbortError' ? 'timeout' : (err.message || String(err)) };
  }
}

const listedInLlms = (llms, { id, page, md, path, route }) => {
  if (!llms) return false;
  const paths = [page, md, path].filter(Boolean);
  for (const p of paths) {
    if (llms.includes(p) || llms.includes(p.replace(/\/$/, ''))) return true;
  }
  if (llms.includes(`/${route}/${id}.md`) || llms.includes(`/${route}/${id}`)) return true;
  if (route === 'entries' && (llms.includes(`/entries/${id}/`) || llms.includes(`/entries/${id}.md`) || llms.includes(`/entries/${id}`))) return true;
  return llms.includes(id);
};

console.log(`Verifying ${BASE} (${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}, ${longform.length} long-form)`);

const pageChecks = [];
for (const e of entries) {
  pageChecks.push({ kind: 'entry', id: e, page: `/entries/${e}/`, md: `/entries/${e}.md`, route: 'entries' });
}
for (const x of longform) {
  pageChecks.push({ kind: x.type, id: x.id, page: x.path, md: `/${x.route}/${x.id}.md`, route: x.route });
}

for (const c of pageChecks) {
  for (const [label, path] of [['page', c.page], ['.md', c.md]]) {
    const r = await get(BASE + path);
    if (r.status === 200 && r.body.length) pass(`${c.kind} ${c.id} ${label} 200 (${r.body.length} bytes)`);
    else fail(`${c.kind} ${c.id} ${label} ${r.error || r.status || 'empty'}`);
  }
}

const llms = await get(BASE + '/llms.txt');
if (llms.status !== 200 || !llms.body) fail(`/llms.txt ${llms.error || llms.status || 'empty'}`);
else {
  pass(`/llms.txt 200 (${llms.body.length} bytes)`);
  for (const c of pageChecks) {
    if (listedInLlms(llms.body, c)) pass(`llms.txt lists ${c.kind} ${c.id}`);
    else fail(`llms.txt does not list ${c.kind} ${c.id}`);
  }
}

const parseJson = (r, path) => {
  if (r.status !== 200 || !r.body) { fail(`${path} ${r.error || r.status || 'empty'}`); return null; }
  try { return JSON.parse(r.body); }
  catch (err) { fail(`${path} invalid JSON: ${err.message}`); return null; }
};

const index = parseJson(await get(BASE + '/api/index.json'), '/api/index.json');
const longformApi = parseJson(await get(BASE + '/api/longform.json'), '/api/longform.json');

const indexTotal = index ? (index.counts?.total ?? (Array.isArray(index.entries) ? index.entries.length : undefined)) : undefined;
const lfCounts = longformApi?.counts || {};
const lfTotal = lfCounts.total ?? (Array.isArray(longformApi?.items) ? longformApi.items.length : undefined);
if (index && indexTotal != null) pass(`/api/index.json total ${indexTotal}`);
if (longformApi && lfTotal != null) pass(`/api/longform.json total ${lfTotal} (${JSON.stringify(lfCounts.by_type || {})})`);

const expectNum = (label, got, want) => {
  if (want === '' || want == null) return;
  const n = +want;
  if (!Number.isFinite(n)) { fail(`bad ${label} expected value ${want}`); return; }
  if (got === n) pass(`${label} ${got} matches expected`);
  else fail(`${label} ${got} != expected ${n}`);
};
expectNum('entries', indexTotal, EXPECT_ENTRIES);
expectNum('long-form', lfTotal, EXPECT_LONGFORM);
expectNum('comparisons', lfCounts.by_type?.comparison, EXPECT_COMPARISONS);
expectNum('guides', lfCounts.by_type?.guide, EXPECT_GUIDES);
expectNum('stacks', lfCounts.by_type?.stack, EXPECT_STACKS);
expectNum('skills (long-form)', lfCounts.by_type?.skill, EXPECT_SKILLS);

if (index && Array.isArray(index.entries)) {
  const ids = new Set(index.entries.map((e) => e.id || e));
  for (const e of entries) {
    if (ids.has(e)) pass(`/api/index.json has entry ${e}`);
    else fail(`/api/index.json missing entry ${e}`);
  }
}
if (longformApi && Array.isArray(longformApi.items)) {
  const by = new Map(longformApi.items.map((it) => [`${it.type}:${it.id}`, it]));
  for (const x of longform) {
    if (by.has(`${x.type}:${x.id}`)) pass(`/api/longform.json has ${x.type}:${x.id}`);
    else fail(`/api/longform.json missing ${x.type}:${x.id}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const mcpSse = (raw) => {
  if (typeof raw !== 'string') return raw;
  if (raw.startsWith('event:') || raw.slice(0, 40).includes('data:')) {
    for (const line of raw.split(/\r?\n/)) {
      if (line.startsWith('data:')) return line.slice(5).trim();
    }
  }
  return raw;
};

async function mcpRpc(method, params, session, mid) {
  const body = { jsonrpc: '2.0', id: mid, method };
  if (params !== undefined) body.params = params;
  const headers = { ...MCP_HDRS };
  if (session) headers['Mcp-Session-Id'] = session;
  try {
    return await withTimeout(TIMEOUT, async (signal) => {
      const res = await fetch(MCP_URL, { method: 'POST', headers, body: JSON.stringify(body), signal });
      const sess = res.headers.get('Mcp-Session-Id') || session;
      const raw = await res.text();
      const data = mcpSse(raw);
      let parsed;
      try { parsed = JSON.parse(data); }
      catch { parsed = { error: { message: `non-JSON MCP response (${res.status})` } }; }
      return { status: res.status, parsed, session: sess };
    });
  } catch (err) {
    return { status: 0, parsed: { error: { message: err.name === 'AbortError' ? 'timeout' : (err.message || String(err)) } }, session };
  }
}

const toolText = (parsed) => {
  if (!parsed) return '';
  const r = parsed.result || parsed;
  if (parsed.error) return JSON.stringify(parsed.error);
  const content = r.content;
  if (Array.isArray(content)) return content.map((c) => (c && typeof c === 'object' ? (c.text || '') : String(c))).join('\n');
  return typeof r === 'string' ? r : JSON.stringify(r);
};

async function mcpRound(deadline) {
  const mcpFails = [];
  const mcpOk = (msg) => pass(msg);
  const mcpFail = (msg) => { notes.push(msg); mcpFails.push(msg); };
  let mid = 1;
  const init = await mcpRpc('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'indexagentica-builder', version: '1' },
  }, null, mid++);
  let session = init.session;
  if (init.status >= 200 && init.status < 300 && init.parsed?.result) mcpOk(`MCP initialize ${init.status}`);
  else {
    mcpFail(`MCP initialize ${init.parsed?.error?.message || init.status}`);
    return mcpFails;
  }
  // notifications/initialized has no id
  try {
    await withTimeout(TIMEOUT, async (signal) => {
      const headers = { ...MCP_HDRS };
      if (session) headers['Mcp-Session-Id'] = session;
      await fetch(MCP_URL, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }), signal });
    });
  } catch { /* notify is best-effort */ }

  const found = (text, id) => text.includes(id);

  for (const e of entries) {
    const call = await mcpRpc('tools/call', { name: 'get_entry', arguments: { id: e } }, session, mid++);
    if (call.session) session = call.session;
    const text = toolText(call.parsed);
    if (!call.parsed?.error && found(text, e)) mcpOk(`MCP get_entry ${e}`);
    else mcpFail(`MCP get_entry ${e}: ${call.parsed?.error?.message || 'not found'}`);
  }
  for (const x of longform) {
    const call = await mcpRpc('tools/call', { name: 'get_content', arguments: { type: x.type, id: x.id } }, session, mid++);
    if (call.session) session = call.session;
    const text = toolText(call.parsed);
    if (!call.parsed?.error && found(text, x.id)) mcpOk(`MCP get_content ${x.type}:${x.id}`);
    else mcpFail(`MCP get_content ${x.type}:${x.id}: ${call.parsed?.error?.message || 'not found'}`);
  }
  const searches = [
    ...entries.map((id) => ({ query: id, expect: id, label: `entry ${id}` })),
    ...longform.map((x) => ({ query: x.id, expect: x.id, label: `${x.type} ${x.id}` })),
  ];
  for (const s of searches) {
    const call = await mcpRpc('tools/call', { name: 'search', arguments: { query: s.query } }, session, mid++);
    if (call.session) session = call.session;
    const text = toolText(call.parsed);
    if (!call.parsed?.error && found(text, s.expect)) mcpOk(`MCP search ${s.label}`);
    else mcpFail(`MCP search ${s.label}: ${call.parsed?.error?.message || 'not found'}`);
  }
  void deadline;
  return mcpFails;
};

if (entries.length || longform.length) {
  const start = Date.now();
  const deadline = start + MCP_WAIT;
  let leftover = [];
  for (;;) {
    leftover = await mcpRound(deadline);
    if (!leftover.length) break;
    const now = Date.now();
    if (now >= deadline || MCP_WAIT <= 0) {
      leftover.forEach(fail);
      break;
    }
    const wait = Math.min(MCP_RETRY, deadline - now);
    console.log(`MCP not ready (${leftover.length} miss(es)); retrying in ${Math.round(wait / 1000)}s...`);
    await sleep(wait);
  }
}

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll live checks passed.');
