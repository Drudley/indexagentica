---
id: agent-skill-directories
type: comparison
title: Agent skill directories compared
summary: "AgentSkillsDir and Agent Skills Hub compared on who runs them, what they list, how listings are made, security claims, pricing and licence. A listing or a README-based grade is not a substitute for reviewing and pinning a skill before you install it."
description: "A primary-source comparison of two web directories for finding Agent Skills and MCP servers. AgentSkillsDir is a small, editorially summarized catalog that pins repository commits. Agent Skills Hub is a large, automatically refreshed GitHub index with rule-based security grades that, by its own docs, read the README rather than the code. Counts and prices were checked on 2026-11-25. Neither directory was used as an installer, and no account or paid plan was created."
author: Agentica Author
tags: [agent-skills, directories, mcp, security, discovery]
entries: [agentskillsdir, agent-skills-hub, skills-sh, agent-skills-spec, skills-cli, awesome-claude-skills]
subjects: [agentskillsdir, agent-skills-hub]
criteria:
  - Operator
  - What's listed
  - Catalog size
  - How listings are made
  - Security review
  - Pricing
  - Licence
rows:
  agentskillsdir:
    Operator: "Orbitlane Labs LLC, 30 N Gould St Ste R, Sheridan, Wyoming 82801, United States. Official terms: an independent directory, not affiliated with or endorsed by the listed publishers. No public source repository was found."
    What's listed: "Claude skills, MCP servers, plugins, agents, applications, and source-linked model notes. Official About: short editorial summaries from pinned public repositories or, for hosted MCP, official Registry metadata and publisher documentation."
    Catalog size: "As of 2026-11-25, official About and footer: 345 Claude skills, 42 MCP servers, 10 plugins, 2 agents, 4 applications and 3 model notes. The homepage says 403 source-checked Claude skills, MCP servers, plugins and agents (345+42+10+2+4)."
    How listings are made: "Operators write their own summaries, record the date checked, and do not install or execute entries. Repository commits pin source; Registry versions identify metadata, not server code. Submissions are free and reviewed twice a week; listing is not guaranteed, and paid placements are not accepted."
    Security review: "Official About: \"Listed ≠ audited: a listing is not a security review.\" Terms: entries are editorial summaries, not security audits; inspect the pinned original sources, requirements, permissions and licenses before use. They do not show or rank by star, download or install counts."
    Pricing: "Official terms (updated 19 October 2026) and refund policy (17 October 2026): the current service is free; no payments or ads are active; submitting and listing are free; they do not sell placements. There is no purchase or refund workflow."
    Licence: "No public source repository was found. The catalogued listing treats the hosted directory as proprietary. Official llms.txt: production service; payments and advertising are inactive."
  agent-skills-hub:
    Operator: "BRICKAI / GoSailGlobal LLC; founded by Jason Zhu on 2026-03-08. Canonical domain agentskillshub.top. Official pages say it is not affiliated with similarly named domains. GitHub: zhuyansen/agent-skills-hub."
    What's listed: "Open-source AI agent skills, MCP servers, Claude Code skills, Codex skills and agent tools indexed from GitHub. Official ai-info positioning: a security-graded directory, scenario benchmarks and enterprise pre-deployment audit."
    Catalog size: "As of 2026-11-25, official llms.txt and /ai-info/ (updated that day): 285,000+ indexed and 144,000+ security-graded, covering 99% of skills over 100 and 1,000 stars, refreshed every 8 hours. The GitHub README still says 267,000+. Zenodo describes 130,000+ items (Hub pages say 130,173)."
    How listings are made: "An automated 6-phase GitHub pipeline, official refresh every 8 hours. The README: community submissions via the homepage form or a GitHub issue land in the next sync; weekday syncs are incremental, Sundays are full. Documented npx CLI and MCP installs were not run."
    Security review: "44 published rules; grades Safe, Caution, Unsafe or Reject (Unaudited: \"Treat it as unknown, not as safe\"). Official how-we-grade (updated 2026-11-21): they read the first 15,000 characters of the README plus standing metadata, and \"do not run the code.\" Official wording: \"A grade is not an audit.\""
    Pricing: "Official /enterprise/ table: Free $0 forever, no card; Pro $29/year early supporter (standard $49/year); Team CI Gate $49/month (3–20 engineers); Enterprise $10K–$30K/year per department, or from $50K/year for 200+ engineers or regulated industries. /ai-info/ lists other paid prices (see body)."
    Licence: "Source code is MIT (Copyright (c) 2026 Jason Zhu). Official NOTICE.md: catalog data, the hosted API and database, and the Agent Skills Hub name are not under that MIT license; listed repositories keep their own licenses. The Zenodo snapshot is CC-BY-4.0."
verdict: "Use AgentSkillsDir when you want a small, editorially summarized catalog with commits pinned and no paid listings. Use Agent Skills Hub when you want a large, automatically refreshed GitHub index and a rule-based grade. Hub grades read only the README (first 15,000 characters) plus standing metadata; official docs say they do not run the code and that a grade is not an audit. On both directories, review the upstream source, pin the install, and use least-privilege credentials. This is not a ranking of skill quality."
sources:
  - title: AgentSkillsDir homepage
    url: https://agentskillsdir.com/
    accessed: 2026-11-25
  - title: AgentSkillsDir llms.txt
    url: https://agentskillsdir.com/llms.txt
    accessed: 2026-11-25
  - title: AgentSkillsDir About
    url: https://agentskillsdir.com/about
    accessed: 2026-11-25
  - title: AgentSkillsDir Terms of Use
    url: https://agentskillsdir.com/terms
    accessed: 2026-11-25
  - title: AgentSkillsDir Refund policy
    url: https://agentskillsdir.com/refund
    accessed: 2026-11-25
  - title: AgentSkillsDir Submit
    url: https://agentskillsdir.com/submit
    accessed: 2026-11-25
  - title: Agent Skills Hub homepage
    url: https://agentskillshub.top/
    accessed: 2026-11-25
  - title: Agent Skills Hub llms.txt
    url: https://agentskillshub.top/llms.txt
    accessed: 2026-11-25
  - title: Agent Skills Hub official AI info
    url: https://agentskillshub.top/ai-info/
    accessed: 2026-11-25
  - title: Agent Skills Hub, How we grade
    url: https://agentskillshub.top/how-we-grade/
    accessed: 2026-11-25
  - title: Agent Skills Hub Enterprise pricing
    url: https://agentskillshub.top/enterprise/
    accessed: 2026-11-25
  - title: zhuyansen/agent-skills-hub repository
    url: https://github.com/zhuyansen/agent-skills-hub
    accessed: 2026-11-25
  - title: agent-skills-hub README
    url: https://raw.githubusercontent.com/zhuyansen/agent-skills-hub/main/README.md
    accessed: 2026-11-25
  - title: agent-skills-hub LICENSE
    url: https://raw.githubusercontent.com/zhuyansen/agent-skills-hub/main/LICENSE
    accessed: 2026-11-25
  - title: agent-skills-hub NOTICE.md
    url: https://raw.githubusercontent.com/zhuyansen/agent-skills-hub/main/NOTICE.md
    accessed: 2026-11-25
  - title: "Zenodo record 21292799, AI Agent Skills Security Grades (130K)"
    url: https://zenodo.org/records/21292799
    accessed: 2026-11-25
related: [official-vendor-skill-packs, agent-skill-packs-and-installers, install-and-vet-a-vendor-skill-pack, pick-an-mcp-server]
last_verified: 2026-11-25
published: 2026-11-25
---

## How to read this table

These are directories for finding Agent Skills and MCP servers, not installers and not official vendor packs. For how packs are installed across harnesses, see [agent skill packs, skills CLIs and registries](comparison:agent-skill-packs-and-installers). For official vendor packs, see [official vendor Agent Skills packs](comparison:official-vendor-skill-packs).

- **Counts move.** The catalog figures in the table were copied from each site on 2026-11-25. Agent Skills Hub says it refreshes every 8 hours; its GitHub README still said 267,000+ on that day, behind the 285,000+ on `/llms.txt` and `/ai-info/`. The Zenodo snapshot is a deposit, not the live index: the record is titled "AI Agent Skills Security Grades (130K)" and describes 130,000+ items (published 2026-07-10, last updated 2026-11-22 02:39 Europe/Stockholm). Hub pages describe that deposit as 130,173 graded items.
- **A listing is not an install.** Neither operator's documented install path was run for this page. Agent Skills Hub documents `npx -y @agentskillshub/mcp` and `npx @agentskillshub/cli`; those commands were not executed. Review third-party skills and pin them yourself, as in [Install and vet a vendor skill pack](guide:install-and-vet-a-vendor-skill-pack).
- **Hub also publishes its own directory comparison** at [https://agentskillshub.top/agent-skills-directories/](https://agentskillshub.top/agent-skills-directories/). The facts here come from each directory's official pages, not from that table.

## What a listing or a grade does not do

Third-party skills are untrusted input until you have read them. Pin the install to a commit or a published tag when the installer allows it, read `SKILL.md` plus any scripts, hooks and other executables, and give the skill the least privilege it needs (scoped or test credentials, not a production key).

[AgentSkillsDir](entry:agentskillsdir) is explicit. Its About page says "Listed ≠ audited: a listing is not a security review." Its Terms of Use (last updated 19 October 2026) call entries "editorial summaries, not security audits" and tell you to inspect the pinned original sources, current requirements, permissions and licenses before using third-party software. The operators say they record the date checked and do not install or execute entries. Repository commits pin source; for hosted MCP services, Registry versions identify metadata, not server code. The Submit page says every submission is manually reviewed twice a week, listing is not guaranteed, and they do not accept paid listings.

[Agent Skills Hub](entry:agent-skills-hub) publishes 44 rules and four grades (Safe, Caution, Unsafe, Reject). Unaudited items, official wording, should be treated "as unknown, not as safe." The [how-we-grade](https://agentskillshub.top/how-we-grade/) page (last updated 2026-11-21) is also explicit about the boundary:

- It reads the first 15,000 characters of the README as GitHub serves it, plus the project's standing (owner, stars, license and homepage).
- "We do not run the code, and we do not read the repository's other files. A grade describes what the README tells you, or your agent, to do."
- "A grade is not an audit. For anything that will run on your machine with your keys, read what it runs."
- Known limits include scripts the README never mentions, and most risky commands shown only as fenced examples (download-and-execute from an unknown host is called out as a partial exception).

A Safe grade, on those terms, is not a reason to skip reading the skill. The Team CI Gate plan text on `/enterprise/` says "43 SlowMist-aligned security checks," which differs from the 44 published rules on `/how-we-grade/` and `/ai-info/`.

## Prices on Agent Skills Hub do not all agree

The `/enterprise/` page is the pricing table used in the comparison. On 2026-11-25 it listed Free at $0 forever with no card, Pro at $29/year as an early-supporter price (standard $49/year), Team CI Gate at $49/month for 3–20 engineers, and Enterprise at $10K–$30K/year per department (Starter $10K, Standard $20K, Business $30K; 200+ engineers or regulated industries start at $50K/year). The same page lists a $5,000 proof-of-concept fee, fully credited toward an annual plan.

The `/ai-info/` page, which says it was last verified and updated on 2026-11-25, still describes paid plans from $39/year (Pro Deep Search), a Fast-Track Security Audit at $49 per skill, and Team CI Skill Gate at $29/month. Those figures conflict with `/enterprise/`. This page does not pick a winner; it reports both and uses `/enterprise/` as the pricing page.

[AgentSkillsDir](entry:agentskillsdir) is simpler: terms and the refund policy (last updated 17 October 2026) say the current service is free, payments and ads are inactive, and there is no purchase or refund workflow.

## Picking one

Start from the job, not the bigger number.

- **A short, pinned set you will still vet yourself:** [AgentSkillsDir](entry:agentskillsdir). The catalog is small and editorially summarized, commits are pinned, and listings are not sold.
- **A broad GitHub index plus a README-based grade:** [Agent Skills Hub](entry:agent-skills-hub). Use the grade as a first filter, then read the upstream repository. Treat Unaudited as unknown.

If you already know the vendor, go to the official pack and the [install-and-vet guide](guide:install-and-vet-a-vendor-skill-pack) instead of starting in a directory. [skills.sh](entry:skills-sh) and the skills CLI belong with installers, not with these two catalogs; they are covered in [agent skill packs, skills CLIs and registries](comparison:agent-skill-packs-and-installers).
