#!/usr/bin/env node
// Curator helper for the listing-request queue (Worker: mcp.indexagentica.com, D1 indexagentica-requests).
// Token: REQUESTS_ADMIN_TOKEN env var, or the file in REQUESTS_ADMIN_TOKEN_FILE
// (default /home/box/.secrets/indexagentica/requests-admin-token). Never commit or print it.
//
//   node scripts/requests-review.mjs list [pending|verified|listed|rejected|all]   (default pending)
//   node scripts/requests-review.mjs show <id>
//   node scripts/requests-review.mjs verify <id> [note]
//   node scripts/requests-review.mjs listed <id> <entry-id> [note]     (after the entry is live)
//   node scripts/requests-review.mjs reject <id> [note]
//   node scripts/requests-review.mjs delete <id>                        (test/spam only)
//
// Workflow (content/README.md#listing-requests): review pending daily; verify independently
// (never trust the requester's URL or reason); add the entry; mark listed with its id, or reject.
import fs from 'node:fs';

const BASE = process.env.REQUESTS_BASE || 'https://mcp.indexagentica.com';
const TOKEN_FILE = process.env.REQUESTS_ADMIN_TOKEN_FILE || '/home/box/.secrets/indexagentica/requests-admin-token';
const token = (process.env.REQUESTS_ADMIN_TOKEN || (fs.existsSync(TOKEN_FILE) ? fs.readFileSync(TOKEN_FILE, 'utf8') : '')).trim();
if (!token) { console.error(`No admin token (set REQUESTS_ADMIN_TOKEN or create ${TOKEN_FILE}).`); process.exit(2); }
const H = { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'indexagentica-curator/1', 'x-indexagentica-internal': '1' };

async function call(method, path, body) {
  const r = await fetch(BASE + path, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { console.error(`HTTP ${r.status}: ${j.error ? j.error.message : JSON.stringify(j)}`); process.exit(1); }
  return j;
}
const setStatus = (id, body) => call('POST', `/v1/requests/${Number(id)}/status`, body);
const [cmd = 'list', a, b, ...rest] = process.argv.slice(2);
const oneLine = (s) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ');

if (cmd === 'list') {
  const j = await call('GET', `/v1/requests/admin?status=${encodeURIComponent(a || 'pending')}`);
  if (!j.requests.length) console.log('(none)');
  for (const r of j.requests) {
    console.log(`#${r.id}  [${r.status}] ${r.votes} vote(s)  ${r.category}  ${oneLine(r.wanted)}${r.internal ? '  (internal)' : ''}`);
    if (r.url) console.log(`      url (unverified): ${oneLine(r.url)}`);
    for (const x of r.reasons) console.log(`      reason: ${oneLine(x)}`);
    if (r.requesters.length) console.log(`      requesters: ${r.requesters.map(oneLine).join(', ')}`);
    console.log(`      first ${r.first_seen}  last ${r.last_seen}${r.entry_id ? `  entry ${r.entry_id}` : ''}${r.note ? `  note: ${oneLine(r.note)}` : ''}`);
  }
} else if (cmd === 'show') {
  const j = await call('GET', '/v1/requests/admin?status=all');
  console.log(JSON.stringify(j.requests.find((r) => r.id === Number(a)) || null, null, 2));
} else if (cmd === 'verify') console.log(JSON.stringify(await setStatus(a, { status: 'verified', note: [b, ...rest].filter(Boolean).join(' ') || null }), null, 2));
else if (cmd === 'listed') {
  if (!b) { console.error('usage: listed <id> <entry-id> [note]'); process.exit(2); }
  console.log(JSON.stringify(await setStatus(a, { status: 'listed', entry_id: b, note: rest.join(' ') || null }), null, 2));
} else if (cmd === 'reject') console.log(JSON.stringify(await setStatus(a, { status: 'rejected', note: [b, ...rest].filter(Boolean).join(' ') || null }), null, 2));
else if (cmd === 'delete') console.log(JSON.stringify(await setStatus(a, { delete: true }), null, 2));
else { console.error('commands: list [status] | show <id> | verify <id> [note] | listed <id> <entry-id> [note] | reject <id> [note] | delete <id>'); process.exit(2); }
