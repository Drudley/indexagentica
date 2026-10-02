// Categories are data-driven: schema/categories.json is the single source of truth.
// scripts/sync.mjs propagates it to the schema enum, the issue form dropdown,
// content/README.md and content/<category>/ folders; validate.mjs checks they agree.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const CATEGORIES_PATH = path.join(ROOT, 'schema/categories.json');
export const SCHEMA_PATH = path.join(ROOT, 'schema/entry.schema.json');

export function loadCategories() {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
  return data.categories.map(({ slug, name, description }) => ({ slug, name, description }));
}
