#!/usr/bin/env node
// Post-build sanity checks on dist/: every .json parses, every internal href/src in
// HTML resolves to a file, every URL under SITE_URL in .txt/.xml/.md resolves to a file,
// every HTML page has exactly one <h1>, and every .zip (skill downloads) unpacks with valid CRCs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, BASE_PATH } from './site.config.mjs';
import { readZip } from './lib/zip.mjs';

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
  if (f.endsWith('.zip')) {
    try {
      const names = readZip(fs.readFileSync(f)).map((z) => z.name);
      if (!names.some((n) => n.endsWith('/SKILL.md'))) errors.push(`${rel}: zip has no */SKILL.md`);
    } catch (e) { errors.push(`${rel}: bad zip (${e.message})`); }
    continue;
  }
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
    // The only allowed non-JSON-LD script is the inline usage counter (scripts/lib/usage.mjs), once per page.
    const scripts = [...txt.matchAll(/<script(?![^>]*application\/ld\+json)([^>]*)>/g)];
    if (scripts.some(([, attrs]) => attrs.trim() !== 'id="ia-usage"')) errors.push(`${rel}: contains a <script> other than JSON-LD and the usage counter`);
    if (scripts.length !== 1 || !txt.includes('id="ia-usage-out"')) errors.push(`${rel}: expected exactly one usage counter script and its footer block`);
    if (/<script[^>]*\ssrc=/.test(txt)) errors.push(`${rel}: external <script src> is not allowed`);
  }
  if (/\.(txt|xml|md)$/.test(f)) {
    for (const m of txt.matchAll(new RegExp(SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[^\\s)<>"`\'\\]]*', 'g'))) {
      if (/[{<]/.test(txt[m.index + m[0].length] || '') || m[0].includes('{id}')) continue; // URL templates like /api/<category>.json
      const u = m[0].replace(/[.,;:!?*_]+$/, '');
      links++;
      if (!resolve(new URL(u).pathname)) errors.push(`${rel}: broken URL ${u}`);
    }
  }
}
// Every file under static/ (including dotfiles such as .well-known/*) must land in dist/ byte-for-byte.
const STATIC = path.resolve(DIST, '../static');
let nStatic = 0;
(function walkStatic(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walkStatic(p); continue; }
    const rel = path.relative(STATIC, p), out = path.join(DIST, rel);
    nStatic++;
    if (!fs.existsSync(out)) errors.push(`static/${rel}: missing from dist/`);
    else if (!fs.readFileSync(out).equals(fs.readFileSync(p))) errors.push(`static/${rel}: differs in dist/`);
  }
})(STATIC);
if (errors.length) { errors.forEach((e) => console.error('✗ ' + e)); console.error(`\n${errors.length} problem(s).`); process.exit(1); }
console.log(`✓ dist OK: ${files.length} files (${nStatic} static), ${links} internal links/URLs checked, all JSON parses.`);
