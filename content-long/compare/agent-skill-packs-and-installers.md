---
id: agent-skill-packs-and-installers
type: comparison
title: Agent skill packs, skills CLIs and registries
summary: "How Agent Skills are installed, discovered and shared across Claude Code, Codex, Gemini CLI, Cursor and Copilot, and how the main installers (skills CLI, plugin marketplaces) and skill packs compare on format, harness support, licence and install command."
description: "Agent Skills (a folder with a SKILL.md) have become a shared format, but each harness finds skills in different directories and distributes them in its own way. This comparison maps the discovery paths of five harnesses, then compares the skills CLI and eight widely used skill packs. Everything comes from each project's README or docs and the GitHub API, checked on 2026-10-14."
author: Agentica Author
tags: [agent-skills, skills, claude-code, codex, gemini-cli, cursor, copilot]
entries: [agent-skills-spec, skills-cli, skills-sh, anthropic-skills, vercel-agent-skills, mattpocock-skills, superpowers, huggingface-skills, emilkowalski-skills, google-agents-cli, claude-code, codex-cli, gemini-cli, cursor, github-copilot-cli, opencode, awesome-claude-skills, awesome-claude-skills-travisvn]
related: [ide-and-cloud-coding-agents, game-engine-agent-tooling, coding-agent-harnesses, indexagentica-lookup, add-mcp-servers-to-claude-code, personal-agent-runtimes]
subjects: [skills-cli, anthropic-skills, vercel-agent-skills, mattpocock-skills, superpowers, huggingface-skills, emilkowalski-skills, google-agents-cli]
criteria:
  - What it is
  - Format
  - Harness support
  - Licence
  - Install command
rows:
  skills-cli:
    What it is: "Vercel's open installer and manager (add, use, list, find, update, remove, init); its directory is skills.sh"
    Format: "Installs any Agent Skills folder from GitHub, GitLab, Azure DevOps, any git URL, a local path or a download URL"
    Harness support: "OpenCode, Claude Code, Codex, Cursor and 75 more per its README; target agents with -a. Symlinks one canonical copy into each agent, or copies with --copy"
    Licence: MIT
    Install command: "npx skills add <owner/repo> [--skill name] [-a claude-code] [-g]"
  anthropic-skills:
    What it is: "Anthropic's example and document skills (for example pdf and skill-creator)"
    Format: "Agent Skills, packaged as Claude Code plugins through a marketplace"
    Harness support: "Claude Code, Claude.ai (already available on paid plans) and the Claude API"
    Licence: "Mixed, set per skill: example skills such as skill-creator are Apache-2.0; document skills such as pdf are proprietary (all rights reserved). No repo-level licence"
    Install command: "/plugin marketplace add anthropics/skills, then /plugin install document-skills@anthropic-agent-skills"
  vercel-agent-skills:
    What it is: "Vercel's skills for React and Next.js best practices, web design guidelines and Vercel deploys"
    Format: "Agent Skills (SKILL.md plus optional scripts/ and references/)"
    Harness support: "Any agent the skills CLI supports"
    Licence: "MIT according to the README; GitHub detects no licence file"
    Install command: "npx skills add vercel-labs/agent-skills"
  mattpocock-skills:
    What it is: "Engineering and productivity skills (tdd, code-review and more)"
    Format: "Agent Skills, also shipped as plugins for several harnesses"
    Harness support: "Native plugins for Claude Code, Codex, Copilot and VS Code; Gemini CLI via gemini skills install; Cursor, OpenCode, Windsurf and others via the skills CLI"
    Licence: MIT
    Install command: "claude plugin install mattpocock-skills@claude-plugins-official, or npx skills@latest add mattpocock/skills -a <agent>"
  superpowers:
    What it is: "A methodology built from composable skills (brainstorming, TDD, systematic debugging)"
    Format: "Agent Skills distributed as a plugin"
    Harness support: "Claude Code and Codex (official marketplaces), Cursor, Antigravity, Devin CLI and others; installed separately per harness"
    Licence: MIT
    Install command: "/plugin install superpowers@claude-plugins-official (Claude Code); /add-plugin superpowers (Cursor)"
  huggingface-skills:
    What it is: "Skills for AI/ML work on the Hugging Face Hub; hf-cli is the bootstrap skill"
    Format: "Agent Skills, with Claude, Cursor and Codex plugin manifests and a Gemini CLI extension"
    Harness support: "Claude Code, Codex, Gemini CLI, Cursor"
    Licence: Apache-2.0
    Install command: "/plugin marketplace add huggingface/skills, then /plugin install hf-cli@huggingface/skills; more skills with hf skills add <name>"
  emilkowalski-skills:
    What it is: "Design-engineering skills focused on animation (emil-design-eng, animate, review-animations and more)"
    Format: "Agent Skills"
    Harness support: "Any agent the skills CLI supports"
    Licence: "MIT (GitHub repo emilkowalski/skills)"
    Install command: "npx skills add emilkowalski/skill"
  google-agents-cli:
    What it is: "A CLI plus skills for building, evaluating and deploying agents on Google Cloud"
    Format: "Agent Skills plus a companion CLI (agents-cli)"
    Harness support: "Installs its skills into coding agents (agents-cli setup); also available through the skills CLI"
    Licence: Apache-2.0
    Install command: "uvx google-agents-cli setup, or npx skills add google/agents-cli"
verdict: "Write skills once in the Agent Skills format and commit them to .agents/skills/. Codex, Gemini CLI, Cursor and Copilot all read that path; Claude Code reads .claude/skills/. For a cross-harness install, use npx skills add; it symlinks one copy into each agent. Use a harness's plugin marketplace when you want automatic updates. Check licences per skill: Anthropic's document skills are not open source."
sources:
  - {title: Agent Skills specification, url: "https://agentskills.io/specification", accessed: 2026-10-14}
  - {title: skills CLI README, url: "https://github.com/vercel-labs/skills", accessed: 2026-10-14}
  - {title: "Claude Code docs, Skills", url: "https://code.claude.com/docs/en/skills", accessed: 2026-10-14}
  - {title: "ChatGPT and Codex docs, Build skills", url: "https://learn.chatgpt.com/docs/build-skills", accessed: 2026-10-21}
  - {title: "Gemini CLI docs, Skills", url: "https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/skills.md", accessed: 2026-10-14}
  - {title: "Cursor docs, Agent Skills", url: "https://cursor.com/docs/skills", accessed: 2026-10-21}
  - {title: "GitHub Docs, Agent skills", url: "https://docs.github.com/en/copilot/concepts/customizations/agent-skills", accessed: 2026-10-21}
  - {title: anthropics/skills README, url: "https://github.com/anthropics/skills", accessed: 2026-10-14}
  - {title: anthropics/skills pdf LICENSE, url: "https://github.com/anthropics/skills/blob/main/skills/pdf/LICENSE.txt", accessed: 2026-10-14}
  - {title: anthropics/skills skill-creator LICENSE, url: "https://github.com/anthropics/skills/blob/main/skills/skill-creator/LICENSE.txt", accessed: 2026-10-14}
  - {title: vercel-labs/agent-skills README, url: "https://github.com/vercel-labs/agent-skills", accessed: 2026-10-14}
  - {title: mattpocock/skills README, url: "https://github.com/mattpocock/skills", accessed: 2026-10-14}
  - {title: obra/superpowers README, url: "https://github.com/obra/superpowers", accessed: 2026-10-14}
  - {title: huggingface/skills README, url: "https://github.com/huggingface/skills", accessed: 2026-10-14}
  - {title: "Emil Kowalski, AI Skills for Design Engineers", url: "https://emilkowal.ski/skill", accessed: 2026-10-14}
  - {title: emilkowalski/skills repository, url: "https://github.com/emilkowalski/skills", accessed: 2026-10-14}
  - {title: google/agents-cli README, url: "https://github.com/google/agents-cli", accessed: 2026-10-14}
last_verified: 2026-10-14
published: 2026-10-14
---

## The format

The [Agent Skills spec](entry:agent-skills-spec) defines a skill as a folder with a `SKILL.md`. Its YAML front matter needs `name` (at most 64 characters: lowercase letters, digits and hyphens) and `description` (at most 1024 characters, saying what the skill does and when to use it). Optional fields are `license`, `compatibility`, `metadata` and the experimental `allowed-tools`. Scripts, references and assets can sit alongside. The spec advises keeping `SKILL.md` under 500 lines. Harnesses load only the name and description up front and read the body when the skill becomes relevant (progressive disclosure).

## Where each harness looks

| Harness | Project skills | Personal skills | Sharing and distribution |
|---|---|---|---|
| [Claude Code](entry:claude-code) | `.claude/skills/` (cwd and parent directories) | `~/.claude/skills/` | Plugins and marketplaces (`/plugin`); skills synced from claude.ai; enterprise managed settings |
| [Codex](entry:codex-cli) | `.agents/skills/` from cwd up to the repo root | `$HOME/.agents/skills/`; admin `/etc/codex/skills` | Plugins in the plugin directory shared by ChatGPT and Codex; `/skills` or `$` to mention a skill |
| [Gemini CLI](entry:gemini-cli) | `.gemini/skills/` or `.agents/skills/` (the alias wins) | `~/.gemini/skills/` or `~/.agents/skills/` | Extension-bundled skills; `gemini skills install <git-url>`, `list`, `uninstall`; the model activates a skill with `activate_skill` |
| [Cursor](entry:cursor) | `.agents/skills/`, `.cursor/skills/` | `~/.agents/skills/`, `~/.cursor/skills/` | Also loads `.claude/skills/` and `.codex/skills/` (project and home); plugin marketplace; `/` to invoke |
| GitHub Copilot ([CLI](entry:github-copilot-cli)) | `.github/skills/`, `.claude/skills/`, `.agents/skills/` | `~/.copilot/skills/`, `~/.agents/skills/` | `gh skill` in GitHub CLI to discover and install from GitHub repos; the community collection github/awesome-copilot |

So `.agents/skills/` is the closest thing to a portable path: Codex, Gemini CLI, Cursor and Copilot read it. Claude Code documents only `.claude/skills/`, which Cursor and Copilot also read. A repo that wants to serve every harness can keep its skills in one place and symlink the other path, which is what the [skills CLI](entry:skills-cli) does for you.

## Installers and registries

- **[skills CLI](entry:skills-cli)** (`npx skills`) is harness-neutral. It installs from any git source, lists a repo's skills (`--list`), installs project-level or globally (`-g`), targets agents (`-a`), and updates or removes them. `npx skills use` runs a skill without installing it. Its directory, [skills.sh](entry:skills-sh), ranks skills by installs.
- **Plugin marketplaces** in Claude Code, Codex, Cursor, Copilot and VS Code bundle skills with other extensions (MCP servers, hooks) and update them automatically. Matt Pocock's README warns against using both routes for the same agent: the plugin updates itself, while skills.sh copies editable files that you update by hand.
- **Harness CLIs**: `gemini skills install` (Gemini CLI) and `gh skill` (GitHub CLI).
- **Curated lists** such as [awesome-claude-skills](entry:awesome-claude-skills) and [travisvn/awesome-claude-skills](entry:awesome-claude-skills-travisvn) help discovery but don't install anything.

## Notes on the packs

- Anthropic's repo mixes licences. Read each skill's `LICENSE.txt` before redistributing.
- Several packs ship a bootstrap skill: Hugging Face's `hf-cli` and Matt Pocock's `setup-matt-pocock-skills`.
- Skills run with your agent's permissions. Review scripts in third-party packs as you would any dependency.

For a feature-level comparison of the harnesses themselves, see [Coding agent harnesses](comparison:coding-agent-harnesses).
