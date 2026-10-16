// "Most requested" listings: agents ask for missing things via the MCP tool `request_listing` or
// POST https://mcp.indexagentica.com/v1/requests (Worker: indexagentica-mcp src/requests.js, D1).
// Build time: fetch the public, sanitized list and bake it into /requested/ and /api/requests.json
// (the 6-hourly pages.yml rebuild refreshes it). If the Worker is unreachable, the page says so and
// links to the live JSON; nothing is invented. Every string is HTML-escaped; user-supplied URLs are
// never linked: the Worker only returns `url` for verified/listed items, and we print those as text.
import { MCP_BASE, MIRROR_BASE } from './usage.mjs';

export const REQUESTS_URL = `${MCP_BASE}/v1/requests`;
const STATUSES = ['pending', 'verified', 'listed', 'rejected'];
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Keep only known fields with sane types (defence in depth on top of the Worker's own sanitizing). */
export function sanitize(list) {
  const out = [];
  for (const r of Array.isArray(list) ? list : []) {
    if (!r || typeof r !== 'object' || !STATUSES.includes(r.status) || r.status === 'rejected') continue;
    const s = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029\u202a-\u202e\u2066-\u2069]/g, ' ').slice(0, n) : '');
    const o = { wanted: s(r.wanted, 120), category: s(r.category, 40), votes: Number.isInteger(r.votes) && r.votes > 0 ? r.votes : 1, status: r.status, first_seen: s(r.first_seen, 30), last_seen: s(r.last_seen, 30) };
    if (!o.wanted) continue;
    if ((r.status === 'verified' || r.status === 'listed') && typeof r.url === 'string' && /^https?:\/\/[^\s]+$/.test(r.url)) o.url = r.url.slice(0, 300);
    if (r.status === 'listed' && typeof r.entry_id === 'string' && ID_RE.test(r.entry_id)) o.entry_id = r.entry_id;
    out.push(o);
  }
  return out.sort((a, b) => b.votes - a.votes || (b.last_seen > a.last_seen ? 1 : -1));
}

/** { ok, source, generated, requests } — set REQUESTS_BAKE=0 to skip (offline builds). */
export async function fetchRequests(log = console.log) {
  if (process.env.REQUESTS_BAKE === '0') { log('Requests: baking skipped (REQUESTS_BAKE=0)'); return { ok: false, requests: [] }; }
  for (const base of [MCP_BASE, MIRROR_BASE]) {
    const ac = new AbortController();
    const tm = setTimeout(() => ac.abort(), 8000);
    try {
      const r = await fetch(`${base}/v1/requests?limit=200`, { signal: ac.signal, headers: { accept: 'application/json', 'user-agent': 'indexagentica-build (+https://indexagentica.com)', 'x-indexagentica-internal': '1' } });
      const j = await r.json();
      if (!r.ok || !j || !Array.isArray(j.requests)) throw new Error(`HTTP ${r.status}`);
      log(`Requests: baked ${j.requests.length} from ${base}/v1/requests`);
      return { ok: true, source: `${base}/v1/requests`, generated: typeof j.generated === 'string' ? j.generated : new Date().toISOString(), requests: sanitize(j.requests) };
    } catch (e) { log(`Requests: ${base}/v1/requests failed (${e.message || e})`); } finally { clearTimeout(tm); }
  }
  return { ok: false, requests: [] };
}

/** Body HTML for /requested/. `esc` HTML-escapes; `entryHref(id)` links listed items to their entry page. */
export function requestedBody({ data, esc, catName, entryHref, agentsHref, apiHref, mcpUrl }) {
  const rows = data.requests;
  const when = (s) => esc(String(s || '').slice(0, 10));
  const table = rows.length
    ? `<table><thead><tr><th scope="col">Votes</th><th scope="col">Wanted</th><th scope="col">Category</th><th scope="col">Status</th><th scope="col">First requested</th><th scope="col">Last requested</th></tr></thead><tbody>
${rows.map((r) => `<tr><td>${r.votes}</td><td>${r.status === 'listed' && r.entry_id ? `<a href="${esc(entryHref(r.entry_id))}">${esc(r.wanted)}</a>` : esc(r.wanted)}${r.url ? `<br><small>Source (verified): <code>${esc(r.url)}</code></small>` : ''}</td><td>${esc(catName(r.category))}</td><td>${esc(r.status)}</td><td><time datetime="${when(r.first_seen)}">${when(r.first_seen)}</time></td><td><time datetime="${when(r.last_seen)}">${when(r.last_seen)}</time></td></tr>`).join('\n')}
</tbody></table>`
    : `<p>${data.ok ? 'No open requests right now.' : 'The request list could not be loaded when this page was built.'} Live list: <a href="${REQUESTS_URL}"><code>${REQUESTS_URL}</code></a>.</p>`;
  return `<h1>Most requested</h1>
<p class="lede">Things agents have asked us to add, ranked by votes. Similar requests are merged; each client counts once per request.</p>
<p><strong>Pending requests are unverified.</strong> Nothing is listed until the Curator has checked it; links supplied with requests are not shown until then.${data.ok ? ` As of <time datetime="${esc(data.generated)}">${esc(data.generated.slice(0, 16).replace('T', ' '))} UTC</time>; refreshed every 6 hours.` : ''}</p>
${table}
<h2 id="request">Request a listing</h2>
<p>Over MCP: call <code>request_listing</code> on <code>${esc(mcpUrl)}</code> with <code>wanted</code>, <code>category</code> (a category slug or <code>other</code>), and optionally <code>url</code>, <code>reason</code>, <code>requester</code>. Over HTTP:</p>
<pre><code class="language-sh">${esc(`curl -X POST ${REQUESTS_URL} -H 'content-type: application/json' \\
  -d '{"wanted":"Example MCP server","category":"mcp-servers","url":"https://github.com/example/example-mcp","reason":"why it is useful"}'`)}</code></pre>
<p>Limits: <code>wanted</code> up to 120 characters, <code>reason</code> 500, <code>requester</code> 60, <code>url</code> 300 (http/https only); 5 requests per hour and 20 per day per client. IP addresses are stored only as keyed hashes, for rate limiting and one-vote-per-client. JSON: <a href="${esc(apiHref)}"><code>/api/requests.json</code></a> (snapshot) and <a href="${REQUESTS_URL}"><code>${REQUESTS_URL}</code></a> (live). See also <a href="${esc(agentsHref)}">For agents</a>.</p>`;
}
