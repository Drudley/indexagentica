---
id: ide-and-cloud-coding-agents
type: comparison
title: IDE and cloud coding agents compared
summary: "Cursor, VS Code agent mode, Google Antigravity, Devin and Kiro compared on local versus cloud execution, background tasks, pull-request workflow, model choice, MCP and skills, pricing, and enterprise and privacy controls."
description: "This comparison covers editor- and cloud-centred coding agents: where the agent runs, whether it keeps working when you close the laptop, and how its work reaches a pull request. It complements the comparison of terminal coding agents. Facts come from each vendor's docs and pricing pages, checked on 2026-10-16. Plans and model lists change often, so recheck before buying."
author: Agentica Author
tags: [coding-agents, ide, cloud-agents, background-agents, mcp, agent-skills]
entries: [cursor, vscode-agents, google-antigravity, devin-cli, kiro, github-copilot-cli, deepwiki-mcp, agent-skills-spec, model-context-protocol]
related: [coding-agent-harnesses, agent-skill-packs-and-installers, code-sandboxes, coding-agent-starter]
subjects: [cursor, vscode-agents, google-antigravity, devin-cli, kiro]
criteria:
  - Where it runs
  - Background and async work
  - PR workflow
  - Model choice
  - MCP and skills
  - Pricing
  - Enterprise and privacy
rows:
  cursor:
    Where it runs: "Local agent in the Cursor editor and CLI; Cloud Agents in isolated Cursor VMs; or Self-Hosted Machines that run the tools on your own workers while Cursor runs the agent loop"
    Background and async work: "Run many Cloud Agents in parallel without your machine online. Start them from desktop, web, iOS, Slack, GitHub or Bitbucket comments, Linear or the API; Automations"
    PR workflow: "Cloud agents clone from GitHub, GitLab, Azure DevOps or Bitbucket, work on a branch and open pull requests, including multi-repo; Bugbot reviews PRs"
    Model choice: "Cursor models (Composer, Grok) plus OpenAI, Anthropic and Google models; Cloud Agents use a curated subset"
    MCP and skills: "MCP over HTTP and stdio with OAuth, locally and in Cloud Agents; Agent Skills from .agents/.cursor/.claude/.codex skills folders"
    Pricing: "Free; Plus $8/mo; Premium $30; Super $100; Ultra $200; Teams $30–$200 per seat; Enterprise custom. Third-party models billed at API list price"
    Enterprise and privacy: "Privacy Mode (no training by Cursor or providers, on by default for Enterprise), team enforcement, allowed team IDs, network allowlists, private connectivity, enterprise hooks"
  vscode-agents:
    Where it runs: "In the editor (Local or Copilot harness), in worktrees, or the Cloud target on provider-managed infrastructure; Claude and Codex harnesses also available"
    Background and async work: "Agents window manages multiple sessions; Copilot CLI and the Codex harness support background work; cloud sessions keep running remotely"
    PR workflow: "The Cloud target works against a GitHub repository and returns a pull request; local sessions leave diffs for you to review and commit"
    Model choice: "Models from your Copilot plan, your own API key (BYOK) or a supported local model; the harness and model are separate choices"
    MCP and skills: "MCP servers; Agent Skills from .github/.claude/.agents skills and ~/.copilot/skills"
    Pricing: "The editor is free; agent usage depends on your GitHub Copilot plan or BYOK provider (plan prices not covered here)"
    Enterprise and privacy: "Enterprise AI policies can restrict agents, models and tools on managed devices; permissions and approvals; terminal sandboxing options"
  google-antigravity:
    Where it runs: "Locally in the Antigravity App, IDE, CLI and IDE extensions (VS Code, JetBrains, Visual Studio, Zed, Xcode), with a terminal sandbox"
    Background and async work: "The App manages background agents and subagents, with /schedule and /goal; Remote Control lets you drive desktop and CLI sessions from a browser"
    PR workflow: "Not documented on the pages checked; review happens through artifacts (plans, walkthroughs, screenshots)"
    Model choice: "Gemini models plus Claude Sonnet and Opus and GPT-OSS 120B, with low, medium and high thinking levels; availability depends on plan"
    MCP and skills: "MCP in the App, CLI and IDE; Agent Skills (SKILL.md folders), rules, plugins, hooks and a marketplace"
    Pricing: "Individual $0 with basic weekly limits; higher limits with Google AI Pro or Ultra; business via Google Cloud (Gemini Enterprise from $30 per seat per month, or pay-as-you-go)"
    Enterprise and privacy: "Google Cloud Terms of Service on business plans, spend caps, centralised admin controls; permissions and sandbox"
  devin-cli:
    Where it runs: "Devin cloud sessions on Cognition VMs; Devin CLI runs locally and hands off to cloud; Outposts run session commands on your own infrastructure while inference stays in Devin's cloud"
    Background and async work: "Fully asynchronous sessions started from the web app, Slack, Teams, Linear, Jira, PagerDuty and others; parallel managed sessions; playbooks"
    PR workflow: "Creates PRs and MRs on GitHub, GitLab and Bitbucket, responds to review comments, stacked PRs, PR templates; Devin Review"
    Model choice: "In the CLI, a model picker plus Adaptive routing and Fusion pairings; a ChatGPT plan can be linked to bill GPT usage"
    MCP and skills: "MCP marketplace plus custom stdio, SSE and HTTP servers; Skills from .agents/skills (recommended) or .devin/skills"
    Pricing: "Free; Pro $20/mo; Max $200/mo; Teams from $80/mo (up to 200 users); Enterprise via contract with ACU limits"
    Enterprise and privacy: "SOC 2 Type II; paid plans can opt out of training, Enterprise is never trained on without consent; security profiles restrict network, MCP and git; self-hosted SCM"
  kiro:
    Where it runs: "Kiro IDE and CLI locally, or cloud sessions in a managed sandbox that the IDE, CLI, web and mobile can attach to"
    Background and async work: "Up to 10 concurrent cloud sessions that keep running when clients disconnect; autonomous mode; scheduled automations on web"
    PR workflow: "Kiro Web opens pull requests or merge requests; autonomous mode runs from plan to PR"
    Model choice: "Auto plus Claude, GPT and open-weight models; the free tier is limited to Claude Sonnet 4.5 and open-weight models"
    MCP and skills: "MCP (with enterprise MCP governance); skills in .kiro/skills and ~/.kiro/skills"
    Pricing: "Free tier with 50 credits; paid Pro, Pro+, Pro Max and Power tiers on a credit model; cloud sessions add no compute charge"
    Enterprise and privacy: "Enterprise governance for models, MCP, permissions and sign-in, IdP integration, customer-managed KMS keys; individual content may be used for service improvement unless you opt out"
verdict: "For the most ways to run in the cloud, from managed VMs to your own machines, use Cursor. To stay inside your editor and Copilot plan, use VS Code agent mode; it can also run Claude and Codex. Antigravity is local-first, with a free tier and strong artifact review, but no documented PR flow. Devin is the most fully asynchronous cloud teammate, with deep ticket-to-PR integrations. Kiro bundles cloud sessions into its credit plans. All five support MCP and Agent Skills."
sources:
  - {title: Cursor Cloud Agents, url: "https://cursor.com/docs/cloud-agent", accessed: 2026-10-16}
  - {title: Cursor Self-Hosted Machines, url: "https://cursor.com/docs/cloud-agent/self-hosted", accessed: 2026-10-16}
  - {title: Cursor models and pricing, url: "https://cursor.com/docs/models-and-pricing", accessed: 2026-10-16}
  - {title: Cursor privacy and data governance, url: "https://cursor.com/docs/enterprise/privacy-and-data-governance", accessed: 2026-10-16}
  - {title: Cursor MCP, url: "https://cursor.com/docs/mcp", accessed: 2026-10-16}
  - {title: "VS Code, Build with AI", url: "https://code.visualstudio.com/docs/agents/overview", accessed: 2026-10-16}
  - {title: VS Code agent harnesses, url: "https://code.visualstudio.com/docs/agents/run/agent-harnesses", accessed: 2026-10-16}
  - {title: VS Code Agent Skills, url: "https://code.visualstudio.com/docs/agent-customization/agent-skills", accessed: 2026-10-16}
  - {title: Antigravity pricing, url: "https://antigravity.google/pricing", accessed: 2026-10-16}
  - {title: "Antigravity, Choose a model", url: "https://antigravity.google/docs/models", accessed: 2026-10-16}
  - {title: Antigravity MCP, url: "https://antigravity.google/docs/mcp", accessed: 2026-10-16}
  - {title: Antigravity Agent skills, url: "https://antigravity.google/docs/skills", accessed: 2026-10-16}
  - {title: Antigravity Remote Control, url: "https://antigravity.google/docs/remote-control", accessed: 2026-10-16}
  - {title: Antigravity llms.txt, url: "https://antigravity.google/llms.txt", accessed: 2026-10-16}
  - {title: Devin docs index, url: "https://docs.devin.ai/llms.txt", accessed: 2026-10-16}
  - {title: Devin self-serve plans, url: "https://docs.devin.ai/admin/billing/self-serve", accessed: 2026-10-16}
  - {title: Devin CLI, url: "https://docs.devin.ai/cli", accessed: 2026-10-16}
  - {title: Devin Outposts, url: "https://docs.devin.ai/cloud/outposts/overview", accessed: 2026-10-16}
  - {title: Devin Skills, url: "https://docs.devin.ai/product-guides/skills", accessed: 2026-10-16}
  - {title: Security at Cognition, url: "https://docs.devin.ai/admin/security", accessed: 2026-10-16}
  - {title: Kiro cloud sessions, url: "https://kiro.dev/docs/cloud-sessions", accessed: 2026-10-16}
  - {title: Kiro Web, url: "https://kiro.dev/docs/web", accessed: 2026-10-16}
  - {title: Kiro skills, url: "https://kiro.dev/docs/skills", accessed: 2026-10-16}
  - {title: Kiro pricing, url: "https://kiro.dev/pricing/", accessed: 2026-10-16}
  - {title: Kiro data protection, url: "https://kiro.dev/docs/privacy-and-security/data-protection", accessed: 2026-10-16}
last_verified: 2026-10-16
published: 2026-10-16
---

## The axis this covers

The [terminal coding agents comparison](comparison:coding-agent-harnesses) is about CLIs on your machine. This one asks three different questions:

1. **Where does the agent run?** In your editor on your laptop, in a vendor VM, or on a machine you own.
2. **Does it keep working when you leave?** Background and cloud sessions survive a closed laptop, and you check in from web, mobile or chat.
3. **How does work come back?** As a diff in your editor, or as a pull request on GitHub, GitLab or Bitbucket.

## Execution models

- **Editor-local:** VS Code agent mode, the Antigravity App and IDE, Kiro IDE, and Cursor's local agent. They have fast feedback and full access to your environment, but they stop when the machine sleeps. Antigravity's Remote Control lets you drive local sessions from a browser.
- **Vendor cloud:** Cursor Cloud Agents, Devin sessions, Kiro cloud sessions, and VS Code's Cloud target. You get parallel tasks, PRs as output, and triggers from Slack, issue trackers or an API. Your environment setup decides whether the agent can actually test its work.
- **Hybrid, on your hardware:** Cursor Self-Hosted Machines and Devin Outposts keep execution (checkout, builds, credentials) on your machines while the agent loop runs in the vendor cloud. Use them for private networks or special hardware.

## Notes

- **Skills are portable.** Every product here reads `SKILL.md` skills (see [Agent Skills](entry:agent-skills-spec)). Cursor, VS Code and Devin all read `.agents/skills/`; Kiro uses `.kiro/skills/`. Installers and packs are covered in [Agent skill packs, skills CLIs and registries](comparison:agent-skill-packs-and-installers).
- **Privacy defaults differ.** Cursor turns Privacy Mode on by default only for Enterprise. Devin and Kiro may use individual users' content unless you opt out (Devin: paid plans can opt out).
- **Not covered:** GitHub Copilot coding agent, Windsurf and Jules have no entries in the index yet. VS Code's Cloud target is the documented way to reach a GitHub cloud agent from the editor.
