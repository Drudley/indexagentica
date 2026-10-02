#!/usr/bin/env node
// Post-build sanity checks on dist/: every .json parses, every internal href/src in
// HTML resolves to a file, every sitemap/llms.txt URL under SITE_URL resolves to a file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, BASE_PATH } from './site.config.mjs';

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p) : files.push(p); } })(DIST);
const errors = [];
const resolve = (urlPath) => {
  let p = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (BASE_PATH && !p.startsWith(BASE_PATH + '/') && p !== BASE_PATH) return null;
  p = p.slice(BASE_PATH.length) || '/';
  const f = path.join(DIST, p.endsWith('/') ? p + 'index.html' : p);
  return fs.existsSync(f) && fs.statSync(f).isFile() ? f : false;
};
let links = 0;
for (const f of files) {
  const rel = path.relative(DIST, f);
  const txt = fs.readFileSync(f, 'utf8');
  if (f.endsWith('.json')) { try { JSON.parse(txt); } catch (e) { errors.push(`${rel}: invalid JSON (${e.message})`); } }
  if (f.endsWith('.html')) {
    for (const [, u] of txt.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:)/.test(u) && !u.startsWith(SITE_URL)) continue;
      const p = u.startsWith(SITE_URL) ? new URL(u).pathname : u;
      if (!p.startsWith('/')) { errors.push(`${rel}: relative link "${u}" (use base-path absolute links)`); continue; }
      links++;
      const r = resolve(p);
      if (r === null) errors.push(`${rel}: link "${u}" missing base path "${BASE_PATH}"`);
      else if (!r) errors.push(`${rel}: broken link "${u}"`);
    }
    for (const tag of ['main', 'header', 'footer', 'html', 'body']) {
      const o = (txt.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length, c = (txt.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      if (o !== 1 || c !== 1) errors.push(`${rel}: expected exactly one <${tag}> (open ${o}, close ${c})`);
    }
    if ((txt.match(/<h1[\s>]/g) || []).length !== 1) errors.push(`${rel}: expected exactly one <h1>`);
    if (/<script(?![^>]*application\/ld\+json)/.test(txt)) errors.push(`${rel}: contains non-JSON-LD <script>`);
  }
  if (/\.(txt|xml|md)$/.test(f)) {
    for (const [u] of txt.matchAll(new RegExp(SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\s)<>"]*', 'g'))) {
      if (u.includes('{id}')) continue;
      links++;
      if (!resolve(new URL(u).pathname)) errors.push(`${rel}: broken URL ${u}`);
    }
  }
}
if (errors.length) { errors.forEach((e) => console.error('✗ ' + e)); console.error(`\n${errors.length} problem(s).`); process.exit(1); }
console.log(`✓ dist OK: ${files.length} files, ${links} internal links/URLs checked, all JSON parses.`);
