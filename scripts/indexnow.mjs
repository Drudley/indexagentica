#!/usr/bin/env node
// IndexNow: tell participating search engines (Bing, Yandex, Seznam, Naver, Yep, ...) which URLs changed.
// Spec: https://www.indexnow.org/documentation . Zero dependencies (Node >= 20, global fetch).
//
//   node scripts/indexnow.mjs diff [dist/sitemap.xml] [indexnow/urls.txt] [--full]
//     Before deploy: fetch the LIVE sitemap, compare with the freshly built one and write the URLs that are
//     new or whose <lastmod> changed (one per line). If the live sitemap cannot be fetched, every URL is listed.
//     --full lists every URL (manual re-submission, e.g. the first ping). Also copies the new sitemap next to the list so the submit step can wait for it to go live.
//   node scripts/indexnow.mjs submit [indexnow/urls.txt] [--dry-run]
//     After deploy: wait until the key file and the new sitemap are live, then POST the list once.
//     Never fails the workflow: 4xx/5xx/429/timeouts are reported as warnings.
//
// Key: the single static/<hex>.txt file whose content equals its name (8-128 chars of [a-zA-Z0-9-] per spec).
// It is public by design (the key file proves ownership of the host); rotate by replacing that file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from './site.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000; // protocol limit per POST
const warn = (m) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=IndexNow::${m}` : `warning: ${m}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, timeoutMs = 20000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { 'cache-control': 'no-cache', 'user-agent': 'indexagentica-indexnow/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}
const bust = (url) => `${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`;

export function parseSitemap(xml) {
  const m = new Map();
  for (const [, block] of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim().replace(/&amp;/g, '&');
    if (loc) m.set(loc, block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() || '');
  }
  return m;
}
export function changedUrls(oldMap, newMap) {
  if (!oldMap) return [...newMap.keys()];
  return [...newMap].filter(([loc, lm]) => !oldMap.has(loc) || oldMap.get(loc) !== lm).map(([loc]) => loc);
}
export function findKey(dir = path.join(ROOT, 'static')) {
  const keys = fs.readdirSync(dir).filter((f) => /^[a-zA-Z0-9-]{8,128}\.txt$/.test(f) && fs.readFileSync(path.join(dir, f), 'utf8').trim() === f.slice(0, -4));
  if (keys.length > 1) throw new Error(`more than one IndexNow key file in static/: ${keys.join(', ')}`);
  return keys[0]?.slice(0, -4) || null;
}

async function diff(newPath = 'dist/sitemap.xml', outPath = 'indexnow/urls.txt', full = false) {
  const newXml = fs.readFileSync(newPath, 'utf8');
  const newMap = parseSitemap(newXml);
  let oldMap = null;
  if (full) console.log('Full re-submission requested: listing every URL.');
  else try { oldMap = parseSitemap(await get(bust(`${SITE_URL}/sitemap.xml`))); }
  catch (e) { warn(`live sitemap unavailable (${e.message}); listing all ${newMap.size} URLs`); }
  const urls = changedUrls(oldMap, newMap);
  const removed = oldMap ? [...oldMap.keys()].filter((u) => !newMap.has(u)) : [];
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, urls.join('\n') + (urls.length ? '\n' : ''));
  fs.copyFileSync(newPath, path.join(path.dirname(outPath), 'sitemap.xml'));
  console.log(`IndexNow diff: ${urls.length} new/changed of ${newMap.size} URLs${oldMap ? ` (live had ${oldMap.size})` : ''}; ${removed.length} removed (not pinged).`);
  for (const u of urls.slice(0, 50)) console.log(`  ${u}`);
  if (urls.length > 50) console.log(`  ... and ${urls.length - 50} more`);
}

async function waitFor(label, url, ok, { tries = 30, every = 10000 } = {}) {
  for (let i = 1; i <= tries; i++) {
    try { if (ok(await get(bust(url)))) { console.log(`${label} is live (attempt ${i}).`); return true; } } catch { /* retry */ }
    if (i < tries) await sleep(every);
  }
  return false;
}

async function submit(listPath = 'indexnow/urls.txt', dryRun = false) {
  const urls = fs.existsSync(listPath) ? fs.readFileSync(listPath, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean) : [];
  if (!urls.length) { console.log('IndexNow: nothing changed, no ping.'); return; }
  const key = findKey();
  if (!key) { warn('no key file in static/ (static/<key>.txt containing the key); skipping'); return; }
  const host = new URL(SITE_URL).host;
  const keyLocation = `${SITE_URL}/${key}.txt`;
  const foreign = urls.filter((u) => new URL(u).host !== host);
  if (foreign.length) { warn(`${foreign.length} URL(s) not on ${host}; skipping ping`); return; }
  const list = urls.slice(0, MAX_URLS);
  if (urls.length > MAX_URLS) warn(`${urls.length} URLs; submitting the first ${MAX_URLS}`);
  if (dryRun) { console.log(`IndexNow dry run: would POST ${list.length} URL(s) for ${host} with key ${keyLocation} to ${ENDPOINT}`); return; }

  // Search engines fetch the key file right away; make sure the new deploy (key + sitemap) is being served.
  if (!(await waitFor('Key file', keyLocation, (t) => t.trim() === key))) { warn(`${keyLocation} not live after waiting; skipping`); return; }
  const sitemapPath = path.join(path.dirname(listPath), 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const want = fs.readFileSync(sitemapPath, 'utf8');
    if (!(await waitFor('New sitemap', `${SITE_URL}/sitemap.xml`, (t) => t === want))) warn('live sitemap still differs from this build (CDN cache?); pinging anyway');
  }

  // A brand-new key returns 403 SiteVerificationNotCompleted until the engine has fetched the key file;
  // retry a few times before giving up.
  let res, body = '';
  for (let attempt = 1; ; attempt++) {
    try {
      res = await fetch(ENDPOINT, { method: 'POST', signal: AbortSignal.timeout(30000), headers: { 'content-type': 'application/json; charset=utf-8', 'user-agent': 'indexagentica-indexnow/1.0' }, body: JSON.stringify({ host, key, keyLocation, urlList: list }) });
    } catch (e) { warn(`request failed: ${e.message}`); return; }
    body = (await res.text().catch(() => '')).slice(0, 300);
    if (!(res.status === 403 && /SiteVerificationNotCompleted/.test(body)) || attempt >= 5) break;
    console.log(`HTTP 403 SiteVerificationNotCompleted (attempt ${attempt}); retrying in 60 s.`);
    await sleep(60000);
  }
  const why = { 400: 'bad request', 403: 'key not valid / key file not found', 422: 'URLs do not belong to host or key mismatch', 429: 'too many requests (rate limited)' }[res.status];
  if (res.status === 200 || res.status === 202) console.log(`IndexNow: submitted ${list.length} URL(s): HTTP ${res.status}${res.status === 202 ? ' (accepted, key validation pending)' : ''}.`);
  // The next push diffs against the then-live sitemap, so these URLs are not re-sent automatically.
  else warn(`HTTP ${res.status}${why ? ` (${why})` : ''}${body ? `: ${body}` : ''}. ${list.length} URL(s) not submitted; to resend, run pages.yml manually with indexnow_full.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, ...rest] = process.argv.slice(2);
  const args = rest.filter((a) => !a.startsWith('--'));
  const run = cmd === 'diff' ? diff(args[0], args[1], rest.includes('--full')) : cmd === 'submit' ? submit(args[0], rest.includes('--dry-run')) : null;
  if (!run) { console.error('usage: indexnow.mjs diff [new-sitemap] [out] [--full] | submit [urls] [--dry-run]'); process.exit(2); }
  run.catch((e) => { warn(`unexpected error: ${e.stack || e}`); });
}
