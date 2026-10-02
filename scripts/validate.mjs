#!/usr/bin/env node
// Zero-dependency validator for content/<category>/<id>.json entries.
// Interprets the subset of JSON Schema 2020-12 used by schema/entry.schema.json
// (type, required, properties, additionalProperties:false, enum, pattern,
// minLength, maxLength, items, uniqueItems, maxItems, format uri/date),
// then runs cross-file checks: id == filename, category == folder,
// unique ids, and that every `related` id exists.
//
// Usage: node scripts/validate.mjs [file-or-dir ...]   (default: content/)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'schema/entry.schema.json'), 'utf8'));
const CONTENT = path.join(ROOT, 'content');
const CATEGORIES = SCHEMA.properties.category.enum;

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

export function validateAgainst(schema, value, at = '$', errors = []) {
  if (schema.type) {
    const t = typeOf(value);
    const ok = schema.type === t || (schema.type === 'number' && t === 'integer');
    if (!ok) { errors.push(`${at}: expected ${schema.type}, got ${t}`); return errors; }
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: must be one of ${schema.enum.join(', ')} (got ${JSON.stringify(value)})`);
  if (typeof value === 'string') {
    if (schema.minLength != null && [...value].length < schema.minLength) errors.push(`${at}: shorter than ${schema.minLength} chars`);
    if (schema.maxLength != null && [...value].length > schema.maxLength) errors.push(`${at}: longer than ${schema.maxLength} chars (${[...value].length})`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${at}: does not match pattern ${schema.pattern}`);
    if (schema.format && !checkFormat(schema.format, value)) errors.push(`${at}: not a valid ${schema.format}`);
  }
  if (Array.isArray(value)) {
    if (schema.maxItems != null && value.length > schema.maxItems) errors.push(`${at}: more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((x) => JSON.stringify(x))).size !== value.length) errors.push(`${at}: items must be unique`);
    if (schema.items) value.forEach((x, i) => validateAgainst(schema.items, x, `${at}[${i}]`, errors));
  }
  if (typeOf(value) === 'object') {
    for (const r of schema.required || []) if (!(r in value)) errors.push(`${at}: missing required property "${r}"`);
    const props = schema.properties || {};
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) validateAgainst(props[k], v, `${at}.${k}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${at}: unknown property "${k}"`);
    }
  }
  return errors;
}

export function loadEntries(dir = CONTENT) {
  const out = [];
  for (const cat of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    for (const f of fs.readdirSync(path.join(dir, cat.name))) {
      if (f.endsWith('.json')) out.push(path.join(dir, cat.name, f));
    }
  }
  return out.sort();
}

function main() {
  const args = process.argv.slice(2);
  const all = loadEntries();
  const walk = (p) => fs.statSync(p).isDirectory()
    ? fs.readdirSync(p).flatMap((f) => walk(path.join(p, f)))
    : p.endsWith('.json') ? [p] : [];
  const targets = args.length ? [...new Set(args.flatMap((a) => walk(path.resolve(a))))].sort() : all;
  let failed = 0;
  const report = (file, msgs) => { failed++; console.error(`✗ ${path.relative(ROOT, file)}`); msgs.forEach((m) => console.error(`    ${m}`)); };

  // Stray files / unknown folders
  for (const e of fs.readdirSync(CONTENT, { withFileTypes: true })) {
    if (e.isDirectory() && !CATEGORIES.includes(e.name)) report(path.join(CONTENT, e.name), [`unknown category folder "${e.name}" (allowed: ${CATEGORIES.join(', ')})`]);
  }

  // Parse everything (needed for cross-file checks)
  const byId = new Map();
  const parsed = new Map();
  for (const file of all) {
    try { parsed.set(file, JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (e) { parsed.set(file, e); }
  }
  for (const [file, data] of parsed) {
    if (data instanceof Error || typeof data?.id !== 'string') continue;
    if (!byId.has(data.id)) byId.set(data.id, []);
    byId.get(data.id).push(file);
  }

  for (const file of targets) {
    const data = parsed.has(file) ? parsed.get(file) : (() => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return e; } })();
    if (data instanceof Error) { report(file, [`invalid JSON: ${data.message}`]); continue; }
    const errs = validateAgainst(SCHEMA, data);
    const slug = path.basename(file, '.json');
    const folder = path.basename(path.dirname(file));
    if (data.id !== slug) errs.push(`id "${data.id}" must equal filename "${slug}"`);
    if (data.category !== folder) errs.push(`category "${data.category}" must equal folder "${folder}"`);
    if (byId.get(data.id)?.length > 1) errs.push(`duplicate id "${data.id}" also in: ${byId.get(data.id).filter((f) => f !== file).map((f) => path.relative(ROOT, f)).join(', ')}`);
    for (const r of data.related || []) {
      if (r === data.id) errs.push(`related: cannot reference itself`);
      else if (!byId.has(r)) errs.push(`related: unknown entry id "${r}"`);
    }
    if (data.updated && data.added && data.updated < data.added) errs.push(`updated (${data.updated}) is before added (${data.added})`);
    if (errs.length) report(file, errs);
  }

  const n = targets.length;
  if (failed) { console.error(`\n${failed} problem file(s) out of ${n} checked.`); process.exit(1); }
  console.log(`✓ ${n} entr${n === 1 ? 'y' : 'ies'} valid (${byId.size} unique ids across ${CATEGORIES.length} categories).`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
