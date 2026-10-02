#!/usr/bin/env node
// Zero-dependency validator for content/<category>/<id>.json entries.
// Interprets the subset of JSON Schema 2020-12 used by schema/entry.schema.json
// (type, required, properties, additionalProperties:false, enum, pattern,
// minLength, maxLength, items, uniqueItems, maxItems, format uri/date),
// then runs cross-file checks: id == filename, category == folder, unique ids,
// every `related` id exists, and generated files are in sync with schema/categories.json.
//
// Usage: node scripts/validate.mjs [file-or-dir ...]   (default: all of content/)
// In GitHub Actions (GITHUB_ACTIONS=true) it also emits ::error annotations and a job summary.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SCHEMA_PATH, loadCategories } from './lib/categories.mjs';
import { checkSync } from './sync.mjs';

const SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
const CONTENT = path.join(ROOT, 'content');
const CATEGORIES = loadCategories().map((c) => c.slug);
const ID_HINT = 'use lowercase letters, digits and single hyphens, e.g. "my-tool"';

function typeOf(v) {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
}

function checkFormat(fmt, v) {
  if (fmt === 'uri') {
    try { const u = new URL(v); return !!u.protocol && !/\s/.test(v); } catch { return false; }
  }
  if (fmt === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
    const d = new Date(v + 'T00:00:00Z');
    return !isNaN(d) && d.toISOString().slice(0, 10) === v;
  }
  return true;
}

const fieldName = (at) => at.replace(/^\$\.?/, '') || '(root)';
const today = () => new Date().toISOString().slice(0, 10);

// Returns [{ field, message, hint }]
export function validateAgainst(schema, value, at = '$', errors = []) {
  const field = fieldName(at);
  const push = (message, hint) => errors.push({ field, message, hint });
  if (schema.type) {
    const t = typeOf(value);
    const ok = schema.type === t || (schema.type === 'number' && t === 'integer');
    if (!ok) { push(`expected ${schema.type === 'array' ? 'an array' : schema.type === 'object' ? 'an object' : `a ${schema.type}`}, got ${t}`, schema.type === 'array' ? `wrap the value in [ ], e.g. ["value"]` : `change "${field}" to a ${schema.type}`); return errors; }
  }
  if (schema.enum && !schema.enum.includes(value)) push(`${JSON.stringify(value)} is not an allowed value`, `use one of: ${schema.enum.join(', ')}`);
  if (typeof value === 'string') {
    const n = [...value].length;
    if (schema.minLength != null && n < schema.minLength) push(`too short (${n} chars, minimum ${schema.minLength})`, `write at least ${schema.minLength} characters`);
    if (schema.maxLength != null && n > schema.maxLength) push(`too long (${n} chars, maximum ${schema.maxLength})`, `shorten by ${n - schema.maxLength} characters`);
    if (schema.format && !checkFormat(schema.format, value)) push(`${JSON.stringify(value)} is not a valid ${schema.format}`, schema.format === 'date' ? `use YYYY-MM-DD, e.g. ${today()}` : 'use a full absolute URL, e.g. https://example.com/page');
    else if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) {
      const isSlug = schema.pattern.startsWith('^[a-z0-9]+');
      const isUrl = schema.pattern.includes('https?');
      push(`${JSON.stringify(value)} does not match the required format`, isSlug ? ID_HINT : isUrl ? `URL must start with ${schema.pattern.includes('wss') ? 'http://, https://, ws:// or wss://' : 'http:// or https://'}` : `must match ${schema.pattern}`);
    }
  }
  if (Array.isArray(value)) {
    if (schema.maxItems != null && value.length > schema.maxItems) push(`has ${value.length} items (maximum ${schema.maxItems})`, `remove ${value.length - schema.maxItems} item(s)`);
    if (schema.uniqueItems) {
      const seen = new Set(); const dups = new Set();
      value.forEach((x) => { const k = JSON.stringify(x); if (seen.has(k)) dups.add(k); seen.add(k); });
      if (dups.size) push(`contains duplicates: ${[...dups].join(', ')}`, 'remove the duplicate items');
    }
    if (schema.items) value.forEach((x, i) => validateAgainst(schema.items, x, `${at}[${i}]`, errors));
  }
  if (typeOf(value) === 'object') {
    const props = schema.properties || {};
    for (const r of schema.required || []) if (!(r in value)) errors.push({ field: at === '$' ? r : `${field}.${r}`, message: 'required field is missing', hint: requiredHint(r) });
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) validateAgainst(props[k], v, at === '$' ? `$.${k}` : `${at}.${k}`, errors);
      else if (schema.additionalProperties === false) errors.push({ field: at === '$' ? k : `${field}.${k}`, message: 'unknown field', hint: `remove it or fix the spelling; allowed fields: ${Object.keys(props).filter((p) => p !== '$schema').join(', ')}` });
    }
  }
  return errors;
}

function requiredHint(r) {
  return {
    id: 'add "id": "<filename-without-.json>"',
    name: 'add "name": "Display Name"',
    category: `add "category": "<folder name>" (one of ${CATEGORIES.join(', ')})`,
    summary: 'add "summary": "One neutral line, 10-200 characters."',
    url: 'add "url": "https://homepage.example"',
    added: `add "added": "${today()}"`,
  }[r] || `add "${r}"`;
}

export function loadEntries(dir = CONTENT) {
  const out = [];
  for (const cat of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(dir, cat.name))) if (f.endsWith('.json')) out.push(path.join(dir, cat.name, f));
  }
  return out.sort();
}

// Validate one parsed entry in context. Returns [{ field, message, hint }].
export function validateEntry(data, { slug, folder, idsElsewhere = new Set() } = {}) {
  const errs = validateAgainst(SCHEMA, data);
  if (slug != null && data.id !== slug) errs.push({ field: 'id', message: `"${data.id}" does not match the filename "${slug}.json"`, hint: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? `rename the file to ${data.id}.json or set "id": "${slug}"` : `rename the file to ${data.id}.json (filenames must be kebab-case and equal the id)` });
  if (folder != null && data.category !== folder) errs.push({ field: 'category', message: `"${data.category}" does not match the folder "${folder}"`, hint: CATEGORIES.includes(data.category) ? `move the file to content/${data.category}/ or set "category": "${folder}"` : `set "category": "${folder}"` });
  for (const r of Array.isArray(data.related) ? data.related : []) {
    if (r === data.id) errs.push({ field: 'related', message: 'an entry cannot list itself as related', hint: `remove "${r}"` });
    else if (typeof r === 'string' && !idsElsewhere.has(r)) errs.push({ field: 'related', message: `unknown entry id "${r}"`, hint: 'remove it, or add that entry first (ids are filenames under content/; list: https://indexagentica.com/api/index.json)' });
  }
  const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  if (isDate(data.last_verified) && isDate(data.added) && data.last_verified < data.added) errs.push({ field: 'last_verified', message: `${data.last_verified} is before added (${data.added})`, hint: 'set "last_verified" to the date you checked the facts (on or after added)' });
  if (isDate(data.updated) && isDate(data.added) && data.updated < data.added) errs.push({ field: 'updated', message: `${data.updated} is before added (${data.added})`, hint: 'set "updated" to the date of the latest change' });
  return errs;
}

function lineOf(text, field) {
  if (!text) return 1;
  const key = String(field).split('.').pop().replace(/\[\d+\]$/, '');
  const lines = text.split('\n');
  const i = lines.findIndex((l) => l.includes(`"${key}"`));
  return i === -1 ? 1 : i + 1;
}

const ghEscape = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const ghProp = (s) => ghEscape(s).replace(/:/g, '%3A').replace(/,/g, '%2C');

function main() {
  const args = process.argv.slice(2);
  const all = loadEntries();
  const walk = (p) => fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((f) => walk(path.join(p, f))) : p.endsWith('.json') ? [p] : [];
  const targets = args.length ? [...new Set(args.flatMap((a) => walk(path.resolve(a))))].sort() : all;
  const problems = []; // { file, line, field, message, hint }

  for (const e of fs.readdirSync(CONTENT, { withFileTypes: true })) {
    if (e.isDirectory() && !CATEGORIES.includes(e.name)) problems.push({ file: `content/${e.name}/`, line: 1, field: '(folder)', message: `unknown category folder "${e.name}"`, hint: `move entries into one of: ${CATEGORIES.join(', ')}; or add the category to schema/categories.json and run node scripts/sync.mjs` });
  }
  for (const p of checkSync()) problems.push({ file: p.file, line: 1, field: '(generated)', message: p.message, hint: p.hint.replace(/^Run: /, 'run ') });

  const texts = new Map();
  const parsed = new Map();
  for (const file of new Set([...all, ...targets])) {
    const text = fs.readFileSync(file, 'utf8');
    texts.set(file, text);
    try { parsed.set(file, JSON.parse(text)); } catch (e) { parsed.set(file, e); }
  }
  const byId = new Map();
  for (const file of all) {
    const d = parsed.get(file);
    if (d instanceof Error || typeof d?.id !== 'string') continue;
    if (!byId.has(d.id)) byId.set(d.id, []);
    byId.get(d.id).push(file);
  }
  const ids = new Set(byId.keys());

  for (const file of targets) {
    const rel = path.relative(ROOT, file);
    const data = parsed.get(file);
    if (data instanceof Error) {
      const m = data.message.match(/position (\d+)/);
      const line = m ? texts.get(file).slice(0, +m[1]).split('\n').length : 1;
      problems.push({ file: rel, line, field: '(json)', message: `invalid JSON: ${data.message}`, hint: 'check for trailing commas, missing quotes or unbalanced braces' });
      continue;
    }
    const errs = validateEntry(data, { slug: path.basename(file, '.json'), folder: path.basename(path.dirname(file)), idsElsewhere: ids });
    if (byId.get(data.id)?.length > 1) errs.push({ field: 'id', message: `duplicate id "${data.id}", also used by ${byId.get(data.id).filter((f) => f !== file).map((f) => path.relative(ROOT, f)).join(', ')}`, hint: 'choose a unique id (and rename the file to match)' });
    for (const e of errs) problems.push({ file: rel, line: lineOf(texts.get(file), e.field), ...e });
  }

  // The copy-paste template must stay valid as the schema evolves.
  const tplPath = path.join(ROOT, 'schema/entry.template.json');
  if (!args.length && fs.existsSync(tplPath)) {
    const tplText = fs.readFileSync(tplPath, 'utf8');
    for (const e of validateEntry(JSON.parse(tplText), { idsElsewhere: ids })) problems.push({ file: 'schema/entry.template.json', line: lineOf(tplText, e.field), ...e });
  }

  const files = new Set(problems.map((p) => p.file));
  const n = targets.length;
  const byFile = {};
  problems.forEach((p) => (byFile[p.file] ||= []).push(p));
  for (const [file, ps] of Object.entries(byFile)) {
    console.error(`✗ ${file}`);
    ps.forEach((p) => console.error(`    line ${p.line}  ${p.field}: ${p.message}\n             fix: ${p.hint}`));
  }

  if (process.env.GITHUB_ACTIONS === 'true') {
    for (const p of problems) console.log(`::error file=${ghProp(p.file)},line=${p.line},title=${ghProp(`${p.field}: ${p.message}`.slice(0, 200))}::${ghEscape(`${p.field}: ${p.message}\nHow to fix: ${p.hint}`)}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const md = problems.length
        ? [`## ✗ Content validation failed`, '', `${problems.length} problem(s) in ${files.size} file(s) (${n} entries checked).`, '', '| File | Line | Field | Problem | How to fix |', '|---|---|---|---|---|',
          ...problems.map((p) => `| \`${esc(p.file)}\` | ${p.line} | \`${esc(p.field)}\` | ${esc(p.message)} | ${esc(p.hint)} |`), '',
          'Rules: [content/README.md](https://github.com/Drudley/indexagentica/blob/main/content/README.md) · Schema: https://indexagentica.com/schema/ · Run locally: `node scripts/validate.mjs`']
        : [`## ✓ Content validation passed`, '', `${n} entries valid across ${CATEGORIES.length} categories.`];
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join('\n') + '\n');
    }
  }

  if (problems.length) { console.error(`\n${problems.length} problem(s) in ${files.size} file(s); ${n} entr${n === 1 ? 'y' : 'ies'} checked.`); process.exit(1); }
  console.log(`✓ ${n} entr${n === 1 ? 'y' : 'ies'} valid (${ids.size} unique ids across ${CATEGORIES.length} categories).`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
