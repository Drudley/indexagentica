#!/usr/bin/env node
// Turn a "New entry" issue-form body into content/<category>/<id>.json.
// Inputs (env, never interpolated into shell): ISSUE_BODY, ISSUE_NUMBER, ISSUE_USER, ISSUE_URL.
// Outputs: writes the entry file only if it is fully valid; writes submission-result.md (issue comment
// on failure) and pr-body.md (on success); sets GITHUB_OUTPUT ok/id/category/path/name.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/categories.mjs';
import { parseIssueBody } from './lib/forms.mjs';
import { loadEntries, validateEntry } from './validate.mjs';

const body = process.env.ISSUE_BODY || '';
const num = process.env.ISSUE_NUMBER || '?';
const user = process.env.ISSUE_USER || '';
const issueUrl = process.env.ISSUE_URL || '';
const out = (k, v) => process.env.GITHUB_OUTPUT && fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}<<__EOF__\n${String(v).replace(/__EOF__/g, '')}\n__EOF__\n`);

const { entry: parsed, problems } = parseIssueBody(body);
const today = new Date().toISOString().slice(0, 10);
// Field order follows the schema for readable diffs.
const ORDER = ['id', 'name', 'category', 'summary', 'description', 'url', 'repo', 'docs', 'tags', 'license', 'pricing', 'status', 'agent_access', 'related', 'sources', 'added', 'updated', 'last_verified', 'maintainer', 'submitted_by'];
const draft = { ...parsed, added: today, submitted_by: parsed.submitted_by || (user ? `github:${user}` : undefined) };
const entry = Object.fromEntries(ORDER.filter((k) => draft[k] !== undefined).map((k) => [k, draft[k]]));

const existing = new Map(loadEntries().map((f) => [path.basename(f, '.json'), path.relative(ROOT, f)]));
const errors = problems.map((m) => ({ field: '(form)', message: m, hint: 'edit the issue and fill in the field' }));
if (!problems.length) {
  errors.push(...validateEntry(entry, { idsElsewhere: new Set(existing.keys()) }));
  if (existing.has(entry.id)) errors.push({ field: 'id', message: `an entry with id "${entry.id}" already exists (${existing.get(entry.id)})`, hint: 'choose a different id, or use the Correction form to change the existing entry' });
}

const json = JSON.stringify(entry, null, 2) + '\n';
if (errors.length) {
  const md = [
    `<!-- submission-bot -->`,
    `Thanks for the submission! It can't be turned into a pull request yet. ${errors.length} problem(s):`, '',
    '| Field | Problem | How to fix |', '|---|---|---|',
    ...errors.map((e) => `| \`${e.field}\` | ${String(e.message).replace(/\|/g, '\\|')} | ${String(e.hint).replace(/\|/g, '\\|')} |`), '',
    'Edit the issue to fix these; a maintainer can then remove and re-add the `approved` label to retry.', '',
    '<details><summary>Parsed entry</summary>', '', '```json', json.trim(), '```', '', '</details>', '',
    'Field reference: https://indexagentica.com/schema/ · Contribution guide: https://indexagentica.com/agents/#contribute',
  ].join('\n');
  fs.writeFileSync(path.join(ROOT, 'submission-result.md'), md + '\n');
  console.error(md);
  out('ok', 'false');
  process.exit(0);
}

const rel = `content/${entry.category}/${entry.id}.json`; // id and category already validated (slug pattern + enum)
fs.writeFileSync(path.join(ROOT, rel), json);
const pr = [
  `Adds \`${rel}\` from the issue-form submission #${num}${user ? ` by @${user}` : ''}.`, '',
  `Closes #${num}`, '',
  '```json', json.trim(), '```', '',
  '### Reviewer checklist', '',
  '- [ ] Facts match the listed `sources`',
  '- [ ] Summary is neutral and accurate',
  '- [ ] Category and `related` ids make sense',
  '- [ ] CI validation passed', '',
  `_Opened automatically after a maintainer added the \`approved\` label${issueUrl ? ` to ${issueUrl}` : ''}. This PR is never merged automatically._`,
].join('\n');
fs.writeFileSync(path.join(ROOT, 'pr-body.md'), pr + '\n');
console.log(`wrote ${rel}`);
out('ok', 'true'); out('id', entry.id); out('category', entry.category); out('path', rel); out('name', entry.name);
