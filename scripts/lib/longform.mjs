// Long-form content (guides, comparisons, stacks, skills) in content-long/.
//   content-long/guides/<id>.md        type: guide
//   content-long/compare/<id>.md       type: comparison
//   content-long/stacks/<id>.md        type: stack
//   content-long/skills/<id>/SKILL.md  Agent Skills format; extra files in the folder ship in the zip
// Markdown body: GFM. Link to directory entries with [text](entry:<id>) and to long-form items with
// [text](guide:<id>) / (comparison:<id>) / (stack:<id>) / (skill:<id>); the build rewrites them to URLs.
// SKILL.md bodies are consumed raw by agents, so they must use absolute https:// links instead.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './categories.mjs';
import { parseFrontMatter, YamlError } from './yaml.mjs';
import { validateAgainst } from '../validate.mjs';

export const LONGFORM_DIR = path.join(ROOT, 'content-long');
export const TYPES = {
  guide: { folder: 'guides', route: 'guides' },
  comparison: { folder: 'compare', route: 'compare' },
  stack: { folder: 'stacks', route: 'stacks' },
  skill: { folder: 'skills', route: 'skills' },
};
const SCHEMAS = Object.fromEntries(Object.keys(TYPES).map((t) => [t, JSON.parse(fs.readFileSync(path.join(ROOT, `schema/longform/${t}.schema.json`), 'utf8'))]));
const LINK_RE = /\]\(\s*(entry|guide|comparison|stack|skill):([^)\s]*)\s*\)/g;
const list = (s, sep = ',') => (typeof s === 'string' && s.trim() ? s.split(sep === ',' ? /\s*,\s*/ : /\s+/).map((x) => x.trim()).filter(Boolean) : []);
const today = () => new Date().toISOString().slice(0, 10);

// Discover files. Returns [{ type, file (abs), rel, slug }]
export function findLongform() {
  const out = [];
  for (const [type, { folder }] of Object.entries(TYPES)) {
    const dir = path.join(LONGFORM_DIR, folder);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      if (type === 'skill') {
        if (f.isDirectory()) out.push({ type, file: path.join(dir, f.name, 'SKILL.md'), slug: f.name });
      } else if (f.isFile() && f.name.endsWith('.md')) out.push({ type, file: path.join(dir, f.name), slug: f.name.slice(0, -3) });
    }
  }
  return out.map((x) => ({ ...x, rel: path.relative(ROOT, x.file) }));
}

// Normalize any type to a common shape (skills: metadata strings -> arrays) for cross-checks and the build.
export function normalize(type, data, slug) {
  if (type !== 'skill') return { ...data, id: data.id, status: data.status || 'published' };
  const m = data.metadata || {};
  return {
    id: data.name, type: 'skill', title: m.title || data.name, summary: m.summary || data.description, description: data.description,
    author: m.author, tags: list(m.tags), entries: list(m.entries), related: list(m.related),
    sources: list(m.sources, ' ').map((url) => ({ url })), last_verified: m.last_verified, published: m.published, updated: m.updated,
    status: m.status || 'published', license: data.license, compatibility: data.compatibility, version: m.version, slug,
  };
}

export function loadLongform() {
  return findLongform().map((x) => {
    const text = fs.readFileSync(x.file, 'utf8');
    const { data, body } = parseFrontMatter(text);
    return { ...x, text, data, body, item: normalize(x.type, data, x.slug) };
  });
}

function lineOfKey(text, field) {
  const key = String(field).split('.').filter((k) => !/^\[?\d+\]?$/.test(k)).pop()?.replace(/\[\d+\]$/, '');
  const i = key ? text.split('\n').findIndex((l) => new RegExp(`^\\s*-?\\s*["']?${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']?\\s*:`).test(l)) : -1;
  return i === -1 ? 1 : i + 1;
}

export function validateLongform({ entryIds, only = null }) {
  const problems = [];
  const files = findLongform();
  const add = (x, field, message, hint, line) => problems.push({ file: x.rel, line: line || lineOfKey(x.text || '', field), field, message, hint });

  // Unknown folders / stray files
  if (fs.existsSync(LONGFORM_DIR)) {
    const folders = Object.values(TYPES).map((t) => t.folder);
    for (const f of fs.readdirSync(LONGFORM_DIR, { withFileTypes: true })) {
      if (f.isDirectory() && !folders.includes(f.name)) problems.push({ file: `content-long/${f.name}/`, line: 1, field: '(folder)', message: `unknown folder "${f.name}"`, hint: `use one of: ${folders.join(', ')}` });
    }
  }

  const parsed = [];
  for (const x of files) {
    if (!fs.existsSync(x.file)) { problems.push({ file: path.relative(ROOT, path.dirname(x.file)) + '/', line: 1, field: '(skill)', message: 'skill folder has no SKILL.md', hint: 'add SKILL.md with name/description front matter' }); continue; }
    x.text = fs.readFileSync(x.file, 'utf8');
    try {
      const { data, body, bodyLine } = parseFrontMatter(x.text);
      parsed.push({ ...x, data, body, bodyLine, item: normalize(x.type, data, x.slug) });
    } catch (e) {
      if (!(e instanceof YamlError)) throw e;
      add(x, '(front matter)', e.message.replace(/^line \d+: /, ''), 'see the YAML subset rules in content-long/README.md (quote values containing ": ", use spaces not tabs)', e.line || 1);
    }
  }
  const idCount = new Map();
  parsed.forEach((p) => idCount.set(p.item.id, (idCount.get(p.item.id) || 0) + 1));
  const lfIds = new Set(parsed.map((p) => p.item.id));
  const lfTypes = new Map(parsed.map((p) => [p.item.id, p.type]));

  for (const p of parsed) {
    if (only && !only.some((o) => p.file === o || p.file.startsWith(o + path.sep))) continue;
    const { type, data, item, slug } = p;
    for (const e of validateAgainst(SCHEMAS[type], data)) {
      const hint = type === 'skill' && e.message === 'unknown field' && !e.field.startsWith('metadata.')
        ? 'the Agent Skills spec only allows name, description, license, compatibility, allowed-tools and metadata at the top level; put Index Agentica fields under metadata as strings (lists comma-separated, sources space-separated)'
        : e.hint;
      add(p, e.field, e.message, hint);
    }
    const idField = type === 'skill' ? 'name' : 'id';
    if (typeof item.id === 'string' && item.id !== slug) add(p, idField, `"${item.id}" does not match the ${type === 'skill' ? 'folder' : 'file'} name "${slug}"`, type === 'skill' ? `set name: ${slug} (Agent Skills spec: name must equal the folder)` : `rename the file to ${item.id}.md or set id: ${slug}`);
    if (idCount.get(item.id) > 1) add(p, idField, `id "${item.id}" is used by more than one long-form item`, 'ids must be unique across guides, comparisons, stacks and skills');
    const mfx = type === 'skill' ? 'metadata.' : '';
    const checkEntries = (ids, field) => ids.forEach((id) => { if (typeof id === 'string' && !entryIds.has(id)) add(p, field, `unknown entry id "${id}"`, 'use an existing id from content/<category>/<id>.json (list: https://indexagentica.com/api/index.json)'); });
    checkEntries(item.entries || [], `${mfx}entries`);
    (item.related || []).forEach((id) => { if (!lfIds.has(id)) add(p, `${mfx}related`, `unknown long-form id "${id}"`, 'use the id of an existing guide, comparison, stack or skill'); else if (id === item.id) add(p, `${mfx}related`, 'an item cannot list itself as related', `remove "${id}"`); });
    // dates
    const isDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
    const t = today();
    for (const k of ['published', 'updated', 'last_verified']) if (isDate(item[k]) && item[k] > t) add(p, `${mfx}${k}`, `${item[k]} is in the future`, `use a date on or before ${t}`);
    if (isDate(item.published) && isDate(item.updated) && item.updated < item.published) add(p, `${mfx}updated`, `${item.updated} is before published (${item.published})`, 'updated must be on or after published');
    if (isDate(item.published) && isDate(item.last_verified) && item.last_verified < item.published) add(p, `${mfx}last_verified`, `${item.last_verified} is before published (${item.published})`, 'last_verified must be on or after published');
    if (type !== 'skill') (Array.isArray(data.sources) ? data.sources : []).forEach((s, i) => { if (isDate(s?.accessed) && s.accessed > t) add(p, `sources[${i}].accessed`, `${s.accessed} is in the future`, `use a date on or before ${t}`); });
    // type-specific
    if (type === 'comparison' && Array.isArray(data.subjects) && Array.isArray(data.criteria) && data.rows && typeof data.rows === 'object') {
      checkEntries(data.subjects, 'subjects');
      for (const s of data.subjects) if (!(s in data.rows)) add(p, 'rows', `no row for subject "${s}"`, `add rows.${s} with a value for each criterion`);
      for (const [k, row] of Object.entries(data.rows)) {
        if (!data.subjects.includes(k)) add(p, 'rows', `row "${k}" is not in subjects`, `add "${k}" to subjects or remove the row`);
        if (!row || typeof row !== 'object') continue;
        for (const c of data.criteria) if (!(c in row)) add(p, 'rows', `row "${k}" is missing criterion "${c}"`, 'add it (use "n/a" or "unknown" if needed)');
        for (const c of Object.keys(row)) if (!data.criteria.includes(c)) add(p, 'rows', `row "${k}" has "${c}", which is not in criteria`, `add "${c}" to criteria or fix the spelling (criteria: ${data.criteria.join(', ')})`);
      }
    }
    if (type === 'stack' && Array.isArray(data.components)) checkEntries(data.components.map((c) => c?.entry).filter(Boolean), 'components');
    // body links
    const lines = p.body.split('\n');
    let fence = false;
    lines.forEach((l, i) => {
      if (/^\s*(```|~~~)/.test(l)) { fence = !fence; return; }
      if (fence) return;
      for (const m of l.matchAll(LINK_RE)) {
        const [, scheme, id] = m;
        const line = p.bodyLine + i;
        if (type === 'skill') { add(p, '(body)', `"${scheme}:${id}" link in SKILL.md`, `SKILL.md is used raw by agents; use an absolute URL such as https://indexagentica.com/${scheme === 'entry' ? 'entries' : TYPES[scheme].route}/${id}/`, line); continue; }
        if (scheme === 'entry') { if (!entryIds.has(id)) add(p, '(body)', `link to unknown entry "${id}"`, 'use an existing entry id', line); }
        else if (!lfIds.has(id)) add(p, '(body)', `link to unknown ${scheme} "${id}"`, `create it, or check the id (existing: ${[...lfIds].join(', ') || 'none'})`, line);
        else if (lfTypes.get(id) !== scheme) add(p, '(body)', `"${id}" is a ${lfTypes.get(id)}, not a ${scheme}`, `use (${lfTypes.get(id)}:${id})`, line);
      }
    });
    if (fence) add(p, '(body)', 'unclosed code fence', 'close it with ```', p.bodyLine + lines.length - 1);
    if (!p.body.trim()) add(p, '(body)', 'body is empty', 'write the content below the front matter', p.bodyLine);
  }
  return { problems, count: parsed.length };
}
