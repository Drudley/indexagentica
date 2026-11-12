#!/usr/bin/env node
// Post-build sanity checks on dist/: every .json parses, every internal href/src in
// HTML resolves to a file, every URL under SITE_URL in .txt/.xml/.md resolves to a file,
// every HTML page has exactly one <h1>, and every .zip (skill downloads) unpacks with valid CRCs.
// dist/gametest/ is excluded from those rules; it must exist and hash-match static/gametest/ exactly.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, BASE_PATH, GAMETEST_DIR, isGameTestPath } from './site.config.mjs';
import crypto from 'node:crypto';
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
  // /gametest/ is a verbatim studio passthrough: no HTML structure, link, script or JSON rules.
  if (isGameTestPath(rel)) continue;
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
    if (scripts.length !== 1 || !txt.includes('id="ia-usage-out"') || !txt.includes('id="ia-usage-status"')) errors.push(`${rel}: expected exactly one usage counter script and its footer block with a status line`);
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
// static/gametest/ is checked separately by hash so extra files, HTML, and size limits are handled there.
const STATIC = path.resolve(DIST, '../static');
let nStatic = 0;
(function walkStatic(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (d === STATIC && e.isDirectory() && e.name === GAMETEST_DIR) continue;
    if (e.isDirectory()) { walkStatic(p); continue; }
    const rel = path.relative(STATIC, p), out = path.join(DIST, rel);
    nStatic++;
    if (!fs.existsSync(out)) errors.push(`static/${rel}: missing from dist/`);
    else if (!fs.readFileSync(out).equals(fs.readFileSync(p))) errors.push(`static/${rel}: differs in dist/`);
  }
})(STATIC);

const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const walkFiles = (root) => {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) out.push(p);
    }
  };
  walk(root);
  return out;
};
const GT_SRC = path.join(STATIC, GAMETEST_DIR);
const GT_DST = path.join(DIST, GAMETEST_DIR);
if (!fs.existsSync(GT_DST) || !fs.statSync(GT_DST).isDirectory()) {
  errors.push('dist/gametest/: missing (passthrough directory must exist even if static/gametest/ is empty or absent)');
} else {
  const srcFiles = walkFiles(GT_SRC);
  const dstFiles = walkFiles(GT_DST);
  const srcRels = new Map(srcFiles.map((p) => [path.relative(GT_SRC, p).split(path.sep).join('/'), p]));
  const dstRels = new Map(dstFiles.map((p) => [path.relative(GT_DST, p).split(path.sep).join('/'), p]));
  for (const [rel, p] of srcRels) {
    if (!dstRels.has(rel)) errors.push(`static/gametest/${rel}: missing from dist/gametest/`);
    else {
      const a = sha256(p), b = sha256(dstRels.get(rel));
      if (a !== b) errors.push(`static/gametest/${rel}: hash mismatch (static ${a} vs dist ${b})`);
    }
  }
  for (const rel of dstRels.keys()) {
    if (!srcRels.has(rel)) errors.push(`dist/gametest/${rel}: extra file not present in static/gametest/`);
  }
  nStatic += srcFiles.length;
  const WARN_FILE = 100 * 1024 * 1024;
  const WARN_DIR = 300 * 1024 * 1024;
  let total = 0;
  const warn = (m) => console.log(process.env.GITHUB_ACTIONS ? `::warning title=gametest::${m}` : `warning: ${m}`);
  for (const [rel, p] of srcRels) {
    const sz = fs.statSync(p).size;
    total += sz;
    if (sz >= WARN_FILE) warn(`static/gametest/${rel} is ${(sz / (1024 * 1024)).toFixed(1)} MB (>= 100 MB; GitHub's file-size limit)`);
  }
  if (total > WARN_DIR) warn(`static/gametest/ is ${(total / (1024 * 1024)).toFixed(1)} MB (soft budget ~300 MB; GitHub Pages site limit is 1 GB)`);
}

if (errors.length) { errors.forEach((e) => console.error('✗ ' + e)); console.error(`\n${errors.length} problem(s).`); process.exit(1); }
console.log(`✓ dist OK: ${files.length} files (${nStatic} static), ${links} internal links/URLs checked, all JSON parses.`);
