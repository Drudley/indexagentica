// Tiny zero-dependency parser for the YAML subset allowed in Index Agentica front matter.
// Supported: block mappings and sequences (any nesting), "- key: value" sequence items,
// flow sequences/mappings ([a, b], {k: v}) of scalars or nested flow, plain / 'single' / "double"
// quoted scalars, block scalars (| |- > >-), full-line and inline " #" comments.
// ALL scalar values are returned as strings (no numbers/booleans/null coercion); empty value => null.
// Rejected with a clear error: tabs for indentation, anchors (&), aliases (*), tags (!), multiple
// documents, complex keys (?), duplicate keys, and plain scalars containing ": ".
export class YamlError extends Error {
  constructor(message, line) { super(line ? `line ${line}: ${message}` : message); this.line = line; }
}

const indentOf = (s) => s.match(/^ */)[0].length;
const isBlank = (s) => /^\s*(#.*)?$/.test(s);

function unquoteDouble(s, line) {
  try { return JSON.parse(s.replace(/\\'/g, "'").replace(/\t/g, '\\t')); } catch { throw new YamlError(`invalid double-quoted string ${s}`, line); }
}

function scalar(raw, line) {
  let s = raw.trim();
  if (s.startsWith('"')) {
    const m = s.match(/^"((?:[^"\\]|\\.)*)"\s*(#.*)?$/);
    if (!m) throw new YamlError(`unterminated or trailing text after double-quoted string: ${s}`, line);
    return unquoteDouble(`"${m[1]}"`, line);
  }
  if (s.startsWith("'")) {
    const m = s.match(/^'((?:[^']|'')*)'\s*(#.*)?$/);
    if (!m) throw new YamlError(`unterminated or trailing text after single-quoted string: ${s}`, line);
    return m[1].replace(/''/g, "'");
  }
  s = s.replace(/\s+#.*$/, '').trim();
  if (s === '' || s === '~' || s === 'null') return null;
  if (/^[&*!%@`]/.test(s)) throw new YamlError(`unsupported YAML feature or reserved character at start of "${s}" (quote the value)`, line);
  if (/^[|>]/.test(s)) throw new YamlError(`block scalar indicator must be the whole value: "${s}"`, line);
  if (/:\s/.test(s) || s.endsWith(':')) throw new YamlError(`plain value contains ": " — wrap it in quotes: "${s.replace(/"/g, '\\"')}"`, line);
  return s;
}

// ---- flow collections ----
function parseFlow(src, line) {
  let i = 0;
  const ws = () => { while (i < src.length && /\s/.test(src[i])) i++; };
  const value = () => {
    ws();
    if (src[i] === '[') { i++; const arr = []; ws(); if (src[i] === ']') { i++; return arr; } for (;;) { arr.push(value()); ws(); if (src[i] === ',') { i++; ws(); if (src[i] === ']') { i++; return arr; } continue; } if (src[i] === ']') { i++; return arr; } throw new YamlError(`expected "," or "]" in flow sequence: ${src}`, line); } }
    if (src[i] === '{') { i++; const obj = {}; ws(); if (src[i] === '}') { i++; return obj; } for (;;) { const k = atom(true); ws(); if (src[i] !== ':') throw new YamlError(`expected ":" after key "${k}" in flow mapping: ${src}`, line); i++; if (k in obj) throw new YamlError(`duplicate key "${k}"`, line); obj[k] = value(); ws(); if (src[i] === ',') { i++; ws(); if (src[i] === '}') { i++; return obj; } continue; } if (src[i] === '}') { i++; return obj; } throw new YamlError(`expected "," or "}" in flow mapping: ${src}`, line); } }
    return atom(false);
  };
  const atom = (isKey) => {
    ws();
    if (src[i] === '"') { const m = src.slice(i).match(/^"((?:[^"\\]|\\.)*)"/); if (!m) throw new YamlError(`unterminated string in ${src}`, line); i += m[0].length; return unquoteDouble(m[0], line); }
    if (src[i] === "'") { const m = src.slice(i).match(/^'((?:[^']|'')*)'/); if (!m) throw new YamlError(`unterminated string in ${src}`, line); i += m[0].length; return m[1].replace(/''/g, "'"); }
    const start = i;
    while (i < src.length && !/[,\]\}]/.test(src[i]) && !(src[i] === ':' && (isKey || /\s/.test(src[i + 1] || ' ')))) i++;
    const s = src.slice(start, i).trim();
    if (/^[&*!%@`|>\[{]/.test(s)) throw new YamlError(`unsupported value "${s}" in flow collection (quote it)`, line);
    return s === '' || s === '~' || s === 'null' ? null : s;
  };
  const v = value(); ws();
  if (src.slice(i).replace(/^#.*$/, '').trim()) throw new YamlError(`unexpected text after flow collection: ${src.slice(i)}`, line);
  return v;
}

const KEY_RE = /^(?:"((?:[^"\\]|\\.)*)"|'((?:[^']|'')*)'|([^\s#'"\[\]{},&*!|>%@`?-][^:#]*?|-[^\s:#][^:#]*?))\s*:(?:[ \t]+(.*))?$/;

export function parseYaml(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  lines.forEach((l, n) => { if (/^\t| \t/.test(l.match(/^[ \t]*/)[0])) throw new YamlError('tabs are not allowed for indentation; use spaces', n + 1); });
  let i = 0;
  const skip = () => { while (i < lines.length && isBlank(lines[i])) i++; };

  function blockScalar(indicator, parentIndent) {
    const folded = indicator[0] === '>';
    const strip = indicator.includes('-');
    const buf = [];
    let ind = null;
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === '') { buf.push(''); i++; continue; }
      const n = indentOf(l);
      if (n <= parentIndent) break;
      if (ind === null) ind = n;
      if (n < ind) break;
      buf.push(l.slice(ind)); i++;
    }
    while (buf.length && buf[buf.length - 1] === '') buf.pop();
    let s = folded ? buf.reduce((acc, l, k) => (k === 0 ? l : acc + (l === '' || buf[k - 1] === '' || /^\s/.test(l) ? '\n' : ' ') + l), '') : buf.join('\n');
    if (folded) s = s.replace(/\n\n/g, '\n');
    return strip ? s : s + '\n';
  }

  function value(rest, parentIndent, lineNo) {
    const r = (rest || '').trim();
    if (/^[|>][+-]?\s*(#.*)?$/.test(r)) return blockScalar(r.replace(/\s*#.*$/, ''), parentIndent);
    if (r === '' || r.startsWith('#')) {
      skip();
      if (i >= lines.length) return null;
      const n = indentOf(lines[i]);
      if (n > parentIndent) return block(n);
      if (n === parentIndent && /^-(\s|$)/.test(lines[i].trim())) return block(n); // list at same indent as key
      return null;
    }
    if (r.startsWith('[') || r.startsWith('{')) return parseFlow(r, lineNo);
    return scalar(r, lineNo);
  }

  function mapping(indent) {
    const obj = {};
    for (;;) {
      skip();
      if (i >= lines.length) break;
      const l = lines[i];
      const n = indentOf(l);
      if (n < indent) break;
      if (n > indent) throw new YamlError(`unexpected indentation (expected ${indent} spaces, found ${n})`, i + 1);
      const t = l.slice(n);
      if (/^-(\s|$)/.test(t)) break;
      if (t.startsWith('? ')) throw new YamlError('complex keys (?) are not supported', i + 1);
      if (t === '---' || t === '...') throw new YamlError('multiple YAML documents are not supported', i + 1);
      const m = t.match(KEY_RE);
      if (!m) throw new YamlError(`expected "key: value", got "${t}"`, i + 1);
      const key = m[1] !== undefined ? unquoteDouble(`"${m[1]}"`, i + 1) : m[2] !== undefined ? m[2].replace(/''/g, "'") : m[3].trim();
      if (Object.prototype.hasOwnProperty.call(obj, key)) throw new YamlError(`duplicate key "${key}"`, i + 1);
      const lineNo = i + 1;
      i++;
      obj[key] = value(m[4], indent, lineNo);
    }
    return obj;
  }

  function sequence(indent) {
    const arr = [];
    for (;;) {
      skip();
      if (i >= lines.length) break;
      const l = lines[i];
      const n = indentOf(l);
      if (n < indent) break;
      if (n > indent) throw new YamlError(`unexpected indentation in list (expected ${indent} spaces, found ${n})`, i + 1);
      const t = l.slice(n);
      if (!/^-(\s|$)/.test(t)) break;
      const rest = t.replace(/^-\s*/, '');
      const offset = n + (t.length - rest.length);
      if (rest === '' || rest.startsWith('#')) { const lineNo = i + 1; i++; arr.push(value('', n, lineNo)); continue; }
      if (!rest.startsWith('"') && !rest.startsWith("'") && !rest.startsWith('[') && !rest.startsWith('{') && KEY_RE.test(rest) || (/^["'][^"']*["']\s*:(\s|$)/.test(rest))) {
        lines[i] = ' '.repeat(offset) + rest; // treat "- key: v" as a mapping indented at the key
        arr.push(mapping(offset));
        continue;
      }
      const lineNo = i + 1;
      i++;
      if (/^[|>]/.test(rest)) { arr.push(blockScalar(rest, n)); continue; }
      arr.push(rest.startsWith('[') || rest.startsWith('{') ? parseFlow(rest, lineNo) : scalar(rest, lineNo));
    }
    return arr;
  }

  function block(indent) {
    skip();
    if (i >= lines.length) return null;
    return /^-(\s|$)/.test(lines[i].slice(indentOf(lines[i]))) ? sequence(indent) : mapping(indent);
  }

  skip();
  if (i >= lines.length) return {};
  const root = block(indentOf(lines[i]));
  skip();
  if (i < lines.length) throw new YamlError(`unexpected content "${lines[i].trim()}"`, i + 1);
  return root;
}

// Split "---\n<yaml>\n---\n<body>". Returns { data, body, bodyLine } or throws YamlError.
export function parseFrontMatter(text) {
  const src = String(text).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!src.startsWith('---\n')) throw new YamlError('file must start with a "---" front-matter line', 1);
  const end = src.indexOf('\n---', 3);
  const close = src.slice(4).search(/^---[ \t]*$/m);
  if (end === -1 || close === -1) throw new YamlError('front matter is not closed with a "---" line', 1);
  const yaml = src.slice(4, 4 + close);
  const after = src.slice(4 + close).replace(/^---[ \t]*\n?/, '');
  let data;
  try { data = parseYaml(yaml); } catch (e) { if (e instanceof YamlError && e.line) throw new YamlError(e.message.replace(/^line \d+: /, ''), e.line + 1); throw e; }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) throw new YamlError('front matter must be a mapping of key: value pairs', 2);
  return { data, body: after, bodyLine: yaml.split('\n').length + 3 };
}
