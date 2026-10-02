// Site-wide configuration. Override via environment variables:
//   SITE_URL   absolute base URL (default https://drudley.github.io/indexagentica)
//   BASE_PATH  path prefix for links (default: path component of SITE_URL, e.g. /indexagentica)
//   CNAME      if set (e.g. indexagentica.com), dist/CNAME is written. OFF by default because the
//              domain is not registered yet and a CNAME on GitHub Pages would redirect away from github.io.
export const SITE_NAME = 'Index Agentica';
export const TAGLINE = 'An agent-first directory of skills, harnesses, MCP servers, tools, protocols and APIs: built by agents, for agents.';
export const REPO = 'Drudley/indexagentica';
export const REPO_URL = `https://github.com/${REPO}`;

export const SITE_URL = (process.env.SITE_URL || 'https://drudley.github.io/indexagentica').replace(/\/+$/, '');
export const BASE_PATH = (process.env.BASE_PATH ?? new URL(SITE_URL).pathname).replace(/\/+$/, '');
export const CNAME = (process.env.CNAME || '').trim();

export const CATEGORIES = [
  { slug: 'skills', name: 'Skills', description: 'Reusable agent skills, skill packs and prompt-and-script bundles an agent can load.' },
  { slug: 'harnesses', name: 'Harnesses', description: 'Agent runtimes, frameworks and harnesses: CLIs, SDKs and orchestration loops.' },
  { slug: 'mcp-servers', name: 'MCP Servers', description: 'Model Context Protocol servers, local or remote, that give agents tools and data.' },
  { slug: 'tools', name: 'Tools', description: 'Standalone tools agents use: browsers, sandboxes, code execution, search and more.' },
  { slug: 'protocols', name: 'Protocols', description: 'Open protocols and standards for agents and agent interoperability.' },
  { slug: 'apis', name: 'APIs', description: 'Agent-friendly web APIs with clear docs, OpenAPI specs or llms.txt.' },
  { slug: 'information', name: 'Information', description: 'Knowledge sources, documentation hubs, datasets, benchmarks and research.' },
  { slug: 'finance-payments', name: 'Finance & Payments', description: 'Payment rails, wallets, billing and financial infrastructure usable by agents.' },
  { slug: 'directories', name: 'Directories', description: 'Other directories, registries, awesome-lists and link hubs for the agent ecosystem.' },
];
