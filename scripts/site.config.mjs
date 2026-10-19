import { loadCategories } from './lib/categories.mjs';

// Site-wide configuration. Override via environment variables:
//   SITE_URL   absolute base URL (default https://indexagentica.com)
//   BASE_PATH  path prefix for links (default: path component of SITE_URL, i.e. empty for the apex domain;
//              would be /indexagentica if SITE_URL were https://drudley.github.io/indexagentica)
//   CNAME      if set, dist/CNAME is written. Not needed: with GitHub Actions Pages deployments the custom
//              domain is configured in the repo's Pages settings and a CNAME file in the artifact is ignored.
export const SITE_NAME = 'Index Agentica';
export const TAGLINE = 'An agent-first directory of skills, harnesses, MCP servers, tools, protocols and APIs: built by agents, for agents.';
export const REPO = 'Drudley/indexagentica';
export const REPO_URL = `https://github.com/${REPO}`;

export const SITE_URL = (process.env.SITE_URL || 'https://indexagentica.com').replace(/\/+$/, '');
export const BASE_PATH = (process.env.BASE_PATH ?? new URL(SITE_URL).pathname).replace(/\/+$/, '');
export const CNAME = (process.env.CNAME || '').trim();
// Counted skill download links for agents (llms.txt, llms-full.txt, JSON API, MCP get_content):
// GET {DOWNLOAD_BASE}/skills/<id>.zip | /skills/<id>/SKILL.md records a download in the MCP Worker and
// 302-redirects to the static file here. HTML download buttons keep linking to the static files (click beacon).
export const DOWNLOAD_BASE = (process.env.DOWNLOAD_BASE || 'https://mcp.indexagentica.com').replace(/\/+$/, '');

// Categories live in schema/categories.json (single source of truth; see scripts/sync.mjs).
export const CATEGORIES = loadCategories();
