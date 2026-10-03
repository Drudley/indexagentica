// Footer "Usage" block + the site's only script: a tiny, cookieless inline beacon and stats renderer.
//
// Beacon (POST https://mcp.indexagentica.com/hit via navigator.sendBeacon, text/plain, no preflight):
//   page view       {t:"pageview", p:<canonical path of this page>}
//   outbound click  {t:"click", p, id:<entry id>, h:<destination host>}  links marked data-out on entry pages
//   skill download  {t:"download", p, id:<skill id>, k:"zip"|"skill_md"}
// Nothing is sent when navigator.webdriver is set or Do Not Track / Global Privacy Control is on.
// No cookies, no localStorage, no identifiers, no referrer, no query strings, no third-party code.
// The page works fully without it; the plain link to /stats stays visible as the no-JS fallback.

const MCP_BASE = 'https://mcp.indexagentica.com';
export const STATS_URL = `${MCP_BASE}/stats`;

// Kept readable on purpose (it is the only script on the site); whitespace is collapsed at build time.
const SRC = `(function(){
var S=${JSON.stringify(MCP_BASE)},P=__PATH__,V=__PRIVACY__,n=navigator,w=window,d=document;
var off=n.webdriver||n.globalPrivacyControl||n.doNotTrack=="1"||w.doNotTrack=="1";
function b(o){if(off||!n.sendBeacon)return;o.p=P;try{n.sendBeacon(S+"/hit",JSON.stringify(o))}catch(e){}}
b({t:"pageview"});
var m=/^\\/entries\\/([a-z0-9-]+)\\/$/.exec(P),E=m&&m[1];
function c(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;var u;try{u=new URL(a.href,location.href)}catch(x){return}
var k=u.origin===location.origin&&/^\\/skills\\/([a-z0-9-]+)(\\.zip|\\/SKILL\\.md)$/.exec(u.pathname);
if(k)b({t:"download",id:k[1],k:k[2]===".zip"?"zip":"skill_md"});else if(E&&a.hasAttribute("data-out"))b({t:"click",id:E,h:u.hostname})}
d.addEventListener("click",c,true);d.addEventListener("auxclick",function(e){if(e.button===1)c(e)},true);
var o=d.getElementById("ia-usage-out");if(!o||!w.fetch)return;
function f(x){return Number(x||0).toLocaleString("en")}
function t(x){var z=new Date(x);return isNaN(z)?"?":z.toISOString().slice(0,16).replace("T"," ")+" UTC"}
function A(u,s){var a=d.createElement("a");a.href=u;a.textContent=s;return a}
function T(s){return d.createTextNode(s)}
fetch(S+"/stats").then(function(r){return r.json()}).then(function(s){o.textContent="";
var p=d.createElement("p");
if(s.status!=="ok"){p.appendChild(T("Usage stats are "+(s.status==="collecting"?"collecting":"temporarily unavailable")+" (site counts since "+t(s.since&&s.since.site_beacon)+", MCP/API since "+t(s.since&&s.since.mcp_api)+"). "));}
else{var W=s.windows,C=["last_24h","last_7d","all_time"],R=[
["Page views",function(x){return x.site.page_views}],["Outbound clicks",function(x){return x.site.outbound_clicks}],["Skill downloads",function(x){return x.site.downloads.total}],
["MCP tool calls",function(x){return x.mcp.tool_calls}],["REST/API requests",function(x){return x.api.requests}],
["MCP + API by agents",function(x){return x.agent_vs_human.agent}],["MCP + API by humans (browsers)",function(x){return x.agent_vs_human.human}]];
var h='<table class="usage"><thead><tr><th scope="col">Counted</th><th scope="col">24 h</th><th scope="col">7 days</th><th scope="col">All time</th></tr></thead><tbody>';
R.forEach(function(r){h+="<tr><th scope=\\"row\\">"+r[0]+"</th>";C.forEach(function(c){h+="<td>"+f(r[1](W[c]))+"</td>"});h+="</tr>"});
o.innerHTML=h+"</tbody></table>";
var B=W.all_time.mcp.tool_calls_by_tool||{},K=Object.keys(B).sort(function(a,z){return B[z]-B[a]});
p.appendChild(T("Site counts since "+t(s.since.site_beacon)+"; MCP/API since "+t(s.since.mcp_api)+". "+(K.length?"MCP tool calls by tool (all time): "+K.map(function(k){return k.replace(/[^a-z_]/g,"")+" "+f(B[k])}).join(", ")+". ":"")+"Browser page views with JavaScript only, so crawlers and agents reading pages directly are not counted. Updated "+t(s.generated)+". "));}
p.appendChild(A(S+"/stats","JSON"));p.appendChild(T(" · "));p.appendChild(A(V,"What is counted"));o.appendChild(p)}).catch(function(){})
})();`;

const MIN = SRC.split('\n').map((l) => l.trim()).join('');

/** Footer block (visible no-JS fallback included) + inline script for one page. */
export function usageFooter({ pathName, privacyHref, esc }) {
  const js = MIN.replace('__PATH__', JSON.stringify(pathName)).replace('__PRIVACY__', JSON.stringify(privacyHref)).replace(/<\//g, '<\\/');
  return `<section class="usage" aria-label="Usage">
<p><strong>Usage</strong></p>
<div id="ia-usage-out"><p>Live usage stats: <a href="${STATS_URL}">${STATS_URL}</a> (JSON; no cookies, no IPs stored). <a href="${esc(privacyHref)}">What is counted</a>.</p></div>
</section>
<script id="ia-usage">${js}</script>`;
}
