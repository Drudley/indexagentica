// Footer "Usage" block + the site's only script (a tiny, cookieless inline beacon and stats refresher).
//
// Build time: build.mjs calls fetchStats() and the last known numbers are baked into every page
// ("As of <time> UTC"), so the footer is never empty and works without JavaScript. If the build can't
// reach the stats endpoint, the block shows the heading and a link to the JSON; no numbers are invented.
//
// In the browser the script only refreshes the numbers in place when a live fetch succeeds:
// mcp.indexagentica.com/v1/usage, then the workers.dev host of the same Worker (4 s timeout each).
// On total failure it keeps the baked numbers and says "Live refresh unavailable" with links.
//
// Beacon (POST /v1/e, text/plain, no preflight; same fallback host order):
//   page view       {t:"pageview", p:<canonical path of this page>}
//   outbound click  {t:"click", p, id:<entry id>, h:<destination host>}  links marked data-out on entry pages
//   skill download  {t:"download", p, id:<skill id>, k:"zip"|"skill_md"}
// Nothing is sent when navigator.webdriver is set or Do Not Track / Global Privacy Control is on.
// No cookies, no localStorage, no identifiers, no referrer, no query strings, no third-party code.

export const MCP_BASE = 'https://mcp.indexagentica.com';
export const MIRROR_BASE = 'https://indexagentica-mcp.indexagentica.workers.dev';
export const STATS_URL = `${MCP_BASE}/stats`;
const STATS_PATH = '/v1/usage'; // aliases of /stats and /hit, less likely to be on blocker lists
const HIT_PATH = '/v1/e';

// Shared renderer: evaluated in Node at build time AND embedded in the inline script, so the baked
// and live tables are identical. Outputs only numbers, fixed labels, ISO dates and [a-z_] tool names.
const RENDER = `function f(x){return Number(x||0).toLocaleString("en")}
function t(x){var z=new Date(x);return isNaN(z)?"?":z.toISOString().slice(0,16).replace("T"," ")+" UTC"}
function R(s){var W=s.windows,C=["last_24h","last_7d","all_time"],L=[
["Page views",function(x){return x.site.page_views}],["Outbound clicks",function(x){return x.site.outbound_clicks}],["Skill downloads",function(x){return x.site.downloads.total}],
["MCP tool calls",function(x){return x.mcp.tool_calls}],["REST/API requests",function(x){return x.api.requests}],
["MCP + API by agents",function(x){return x.agent_vs_human.agent}],["MCP + API by humans (browsers)",function(x){return x.agent_vs_human.human}]];
var h='<table class="usage"><thead><tr><th scope="col">Counted</th><th scope="col">24 h</th><th scope="col">7 days</th><th scope="col">All time</th></tr></thead><tbody>';
L.forEach(function(r){h+='<tr><th scope="row">'+r[0]+"</th>";C.forEach(function(c){h+="<td>"+f(r[1](W[c]))+"</td>"});h+="</tr>"});
var B=W.all_time.mcp.tool_calls_by_tool||{},K=Object.keys(B).sort(function(a,z){return B[z]-B[a]||(a<z?-1:1)});
return h+'</tbody></table><p id="ia-usage-note">Site counts since '+t(s.since.site_beacon)+"; MCP/API since "+t(s.since.mcp_api)+". "+(K.length?"MCP tool calls by tool (all time): "+K.map(function(k){return k.replace(/[^a-z_]/g,"")+" "+f(B[k])}).join(", ")+". ":"")+"Browser page views with JavaScript only, so crawlers and agents reading pages directly are not counted.</p>"}`;

const render = new Function(`${RENDER}\nreturn { R: R, t: t };`)();

const SRC = `(function(){
var M=${JSON.stringify(MCP_BASE)},F=${JSON.stringify(MIRROR_BASE)},SP=${JSON.stringify(STATS_PATH)},HP=${JSON.stringify(HIT_PATH)},P=__PATH__,V=__PRIVACY__,BK=__BAKED__,n=navigator,w=window,d=document;
${RENDER}
var off=n.webdriver||n.globalPrivacyControl||n.doNotTrack=="1"||w.doNotTrack=="1";
function sb(u,j){try{return !!(n.sendBeacon&&n.sendBeacon(u,j))}catch(e){return false}}
function b(o){if(off)return;o.p=P;var j=JSON.stringify(o);
if(w.fetch){fetch(M+HP,{method:"POST",body:j,keepalive:true}).catch(function(){fetch(F+HP,{method:"POST",body:j,keepalive:true}).catch(function(){sb(F+HP,j)})})}else if(!sb(M+HP,j))sb(F+HP,j)}
b({t:"pageview"});
var m=/^\\/entries\\/([a-z0-9-]+)\\/$/.exec(P),E=m&&m[1];
function c(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;var u;try{u=new URL(a.href,location.href)}catch(x){return}
var k=u.origin===location.origin&&/^\\/skills\\/([a-z0-9-]+)(\\.zip|\\/SKILL\\.md)$/.exec(u.pathname);
if(k)b({t:"download",id:k[1],k:k[2]===".zip"?"zip":"skill_md"});else if(E&&a.hasAttribute("data-out"))b({t:"click",id:E,h:u.hostname})}
d.addEventListener("click",c,true);d.addEventListener("auxclick",function(e){if(e.button===1)c(e)},true);
var o=d.getElementById("ia-usage-out"),st=d.getElementById("ia-usage-status");if(!o||!st)return;
function A(u,s){var a=d.createElement("a");a.href=u;a.textContent=s;return a}
function line(x){st.textContent="";x.forEach(function(y){st.appendChild(typeof y==="string"?d.createTextNode(y):y)})}
function fail(){line(["Live refresh unavailable \\u2014 see ",A(M+"/stats","JSON")," (",A(F+"/stats","mirror"),")."+(BK?" Numbers as of "+BK+".":"")+" \\u00b7 ",A(V,"What is counted")])}
function g(u){return new Promise(function(ok,no){var ac=w.AbortController?new AbortController():null,tm=setTimeout(function(){if(ac)ac.abort();no()},4000);
fetch(u,ac?{signal:ac.signal}:{}).then(function(r){return r.json()}).then(function(s){clearTimeout(tm);if(s&&s.status==="ok"&&s.windows)ok(s);else no()},function(){clearTimeout(tm);no()})})}
if(!w.fetch||!w.Promise){fail();return}
g(M+SP).catch(function(){return g(F+SP)}).then(function(s){o.innerHTML=R(s);line(["Updated "+t(s.generated)+" (live). ",A(M+"/stats","JSON")," \\u00b7 ",A(V,"What is counted")])},fail)
})();`;

const MIN = SRC.split('\n').map((l) => l.trim()).join('');

async function getJson(url, ms) {
  const ac = new AbortController();
  const tm = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal, headers: { accept: 'application/json', 'user-agent': 'indexagentica-build (+https://indexagentica.com)' } });
    const j = await r.json();
    if (j && j.status === 'ok' && j.windows) return j;
    throw new Error(`status ${j && j.status} (HTTP ${r.status})`);
  } finally { clearTimeout(tm); }
}

/** Last known stats for baking, or null (never invented). Set STATS_BAKE=0 to skip (offline builds). */
export async function fetchStats(log = console.log) {
  if (process.env.STATS_BAKE === '0') { log('Usage stats: baking skipped (STATS_BAKE=0)'); return null; }
  for (const base of [MCP_BASE, MIRROR_BASE]) {
    try {
      const s = await getJson(base + STATS_PATH, 8000);
      log(`Usage stats: baked numbers from ${base}${STATS_PATH} (generated ${s.generated})`);
      return s;
    } catch (e) { log(`Usage stats: ${base}${STATS_PATH} failed (${e.message || e})`); }
  }
  log('Usage stats: no numbers baked; footers show the heading and a link to the JSON');
  return null;
}

/** Footer block for one page: baked numbers (if any), status line, noscript note, inline script. */
export function usageFooter({ pathName, privacyHref, esc, stats }) {
  const baked = stats ? render.t(stats.generated) : '';
  const js = MIN.replace('__PATH__', JSON.stringify(pathName)).replace('__PRIVACY__', JSON.stringify(privacyHref))
    .replace('__BAKED__', JSON.stringify(baked)).replace(/<\//g, '<\\/');
  const status = stats
    ? `As of ${baked} (numbers from the last site build). <a href="${STATS_URL}">JSON</a> · <a href="${esc(privacyHref)}">What is counted</a>`
    : `Live usage stats: <a href="${STATS_URL}">${STATS_URL}</a> (JSON; no cookies, no IPs stored). <a href="${esc(privacyHref)}">What is counted</a>`;
  return `<section class="usage" aria-label="Usage">
<p><strong>Usage</strong></p>
<div id="ia-usage-out">${stats ? render.R(stats) : ''}</div>
<p id="ia-usage-status">${status}</p>
<noscript><p>Live usage stats: <a href="${STATS_URL}">${STATS_URL}</a></p></noscript>
</section>
<script id="ia-usage">${js}</script>`;
}
