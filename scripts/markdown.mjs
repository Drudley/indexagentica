// Tiny, safe markdown -> HTML renderer (zero deps). Supports headings, paragraphs, fenced code
// (with language class; ```mermaid becomes <pre class="mermaid"> with the source visible, no JS),
// GFM tables, inline code, bold, italic, links, images, bullet/numbered lists, blockquotes, hr.
// All input is HTML-escaped first; only http(s)/mailto/relative links are emitted.
// Options:
//   shift        number added to heading levels (default 2: entry descriptions sit under h1/h2)
//   minHeading   lowest heading level allowed (default 1)
//   resolveLink  (href) => href|null, called first; lets callers map custom schemes (entry:id, guide:id)
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function makeInline(opts) {
  const safe = (h) => {
    const r = opts.resolveLink ? opts.resolveLink(h) : null;
    const v = r ?? h;
    return /^(https?:|mailto:|\/|#|\.)/i.test(v) ? v : null;
  };
  return function inline(s) {
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
    s = esc(s);
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
      const h = safe(src.replace(/&amp;/g, '&'));
      return h && /^https?:|^\//.test(h) ? `<img src="${esc(h)}" alt="${alt}" loading="lazy">` : alt;
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, href) => {
      const h = safe(href.replace(/&amp;/g, '&'));
      return h ? `<a href="${esc(h)}">${text}</a>` : text;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>').replace(/(^|\W)_([^_\s][^_]*)_(?=\W|$)/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
  };
}

const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
const isSep = (line) => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(line) && line.includes("-");

export function markdown(src = '', opts = {}) {
  const o = { shift: 2, minHeading: 1, ...opts };
  const inline = makeInline(o);
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const startsBlock = (l, next) => /^(#{1,6}\s|```|~~~|>|\s*([-*+]|\d+\.)\s+)/.test(l) || (/\|/.test(l) && next !== undefined && isSep(next));
  while (i < lines.length) {
    const line = lines[i];
    const fence = line.match(/^\s*(```+|~~~+)\s*([\w+-]*)/);
    if (fence) {
      const lang = fence[2];
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) buf.push(lines[i++]);
      i++;
      if (lang === 'mermaid') out.push(`<figure class="diagram"><pre class="mermaid">${esc(buf.join('\n'))}</pre><figcaption>Mermaid diagram (source shown; not rendered client-side)</figcaption></figure>`);
      else out.push(`<pre><code${lang ? ` class="language-${esc(lang)}"` : ''}>${esc(buf.join('\n'))}</code></pre>`);
    } else if (/^\s*$/.test(line)) {
      i++;
    } else if (/^#{1,6}\s/.test(line)) {
      const lvl = Math.max(o.minHeading, Math.min(6, line.match(/^#+/)[0].length + o.shift));
      out.push(`<h${lvl}>${inline(line.replace(/^#+\s*/, '').replace(/\s+#+\s*$/, ''))}</h${lvl}>`);
      i++;
    } else if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      out.push('<hr>');
      i++;
    } else if (/\|/.test(line) && i + 1 < lines.length && isSep(lines[i + 1])) {
      const head = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) => (c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : null));
      i += 2;
      const rows = [];
      while (i < lines.length && /\|/.test(lines[i]) && lines[i].trim()) rows.push(splitRow(lines[i++]));
      const cell = (tag, c, k) => `<${tag}${aligns[k] ? ` style="text-align:${aligns[k]}"` : ''}${tag === 'th' ? ' scope="col"' : ''}>${inline(c || '')}</${tag}>`;
      out.push(`<table><thead><tr>${head.map((c, k) => cell('th', c, k)).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${head.map((_, k) => cell('td', r[k], k)).join('')}</tr>`).join('')}</tbody></table>`);
    } else if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${markdown(buf.join('\n'), o)}</blockquote>`);
    } else if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        let item = lines[i++].replace(/^\s*([-*+]|\d+\.)\s+/, '');
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])) item += ' ' + lines[i++].trim();
        items.push(`<li>${inline(item.replace(/^\[([ xX])\]\s+/, (m, c) => (c === ' ' ? '☐ ' : '☑ ')))}</li>`);
      }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
    } else {
      const buf = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !startsBlock(lines[i], lines[i + 1])) buf.push(lines[i++]);
      if (!buf.length) buf.push(lines[i++]);
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    }
  }
  return out.join('\n');
}

// Rewrite custom-scheme links in raw markdown (for .md / llms outputs).
export function rewriteLinks(src, resolve) {
  return String(src).replace(/\]\(\s*(entry|guide|comparison|stack|skill):([^)\s]*)\s*\)/g, (m, scheme, id) => {
    const h = resolve(`${scheme}:${id}`);
    return h ? `](${h})` : m;
  });
}
