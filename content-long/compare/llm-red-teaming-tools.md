---
id: llm-red-teaming-tools
type: comparison
title: Open-source red-teaming tools for LLM apps and agents
summary: "Promptfoo, DeepTeam and Giskard compared as red-teaming tools for LLM apps and agents. Covers interface, what they attack, agent and MCP coverage, multi-turn attacks, framework mappings, CI use, and where attack generation and telemetry go."
description: "A primary-source comparison of the three open-source red-teaming tools with directory entries: Promptfoo (MIT, Node.js CLI with YAML configs), DeepTeam (Apache-2.0, Python, built on DeepEval) and Giskard v3 (Apache-2.0, Python, giskard-scan). It explains how each one generates attacks, which agent-specific risks it covers, how to run it in CI, and which defaults send data to a vendor service."
author: Agentica Author
tags: [red-teaming, security, llm-security, prompt-injection, jailbreak, agents, mcp, evals, ci]
entries: [promptfoo, deepteam, giskard, promptfoo-action, deepeval, model-context-protocol]
related: [evaluate-an-ai-agent, agent-observability-platforms, agent-benchmarks, add-oauth-to-your-mcp-server, pick-an-mcp-server, test-your-mcp-server, test-an-agent-for-prompt-injection, scan-agent-written-code-with-semgrep-mcp]
subjects: [promptfoo, deepteam, giskard]
criteria:
  - Interface
  - How attacks are made
  - Agent and tool risks
  - Multi-turn
  - Framework mappings
  - CI
  - Data leaving your machine
  - License
rows:
  promptfoo:
    Interface: "Node.js CLI (npx promptfoo@latest redteam setup / run / report) with a promptfooconfig.yaml; setup opens a local web UI. Needs Node.js >=22.22.0. Targets: HTTP endpoints, browser, direct model providers, custom code"
    How attacks are made: "Plugins generate adversarial inputs (docs: 50+ vulnerability types); strategies wrap them (static encodings, dynamic jailbreak, jailbreak:meta, multi-turn jailbreak:hydra, indirect prompt injection, retry regression)"
    Agent and tool risks: "Plugins for excessive agency, BOLA, BFLA, data exfiltration, coding agents and an mcp plugin; MCP guide tests a server through a client, tool poisoning with a rogue server (promptfoo/evil-mcp-server), and direct API testing"
    Multi-turn: "Yes: multi-turn strategies (Hydra, Goblin and others) need a stateful target or transcript replay"
    Framework mappings: "redteam.frameworks: owasp:llm, owasp:agentic, owasp:api, nist:ai:measure, mitre:atlas; the docs also list EU AI Act, ISO 42001, GDPR and other pages"
    CI: "promptfoo redteam run -o output.json in any CI; docs show a GitHub Actions job. The promptfoo-action GitHub Action runs evals on PRs and posts a comment"
    Data leaving your machine: "Attack generation uses a Promptfoo remote service by default (PROMPTFOO_DISABLE_REDTEAM_REMOTE_GENERATION=true for local only); usage telemetry on by default (PROMPTFOO_DISABLE_TELEMETRY=1), excluding prompts and outputs"
    License: "MIT (README: Promptfoo is now part of OpenAI and remains MIT)"
  deepteam:
    Interface: "Python library (pip install -U deepteam; red_team(model_callback=..., vulnerabilities=..., attacks=...)) and CLI (deepteam run config.yaml); Python >=3.9,<3.14"
    How attacks are made: "Any LLM you configure simulates attacks (YAML default simulator gpt-3.5-turbo-0125) and judges them (default gpt-4o) with LLM-as-judge metrics; 50+ vulnerabilities, 20+ attack methods"
    Agent and tool risks: "Agentic vulnerabilities such as goal theft, recursive hijacking, excessive agency, indirect instruction, tool orchestration abuse, inter-agent communication compromise; security ones include tool metadata poisoning, SSRF, shell and SQL injection, BOLA, BFLA, RBAC"
    Multi-turn: "Yes: linear, tree, crescendo and sequential jailbreaking, Bad Likert Judge"
    Framework mappings: "OWASPTop10 (LLM 2025), OWASP_ASI_2026 (agents), NIST, MITRE, Aegis, BeaverTails"
    CI: "deepteam run config.yaml for reproducible runs; deepteam scan statically scans code or a git diff and exits 1 on findings, with a GitHub bot for PR comments"
    Data leaving your machine: "Runs locally; attack and judge calls go to the LLM you configure. Telemetry (PostHog, Sentry) unless DEEPTEAM_TELEMETRY_OPT_OUT=YES; optional Confident AI platform for results"
    License: "Apache-2.0"
  giskard:
    Interface: "Python library, v3 (pip install \"giskard[scan]\"; vulnerability_scan(target=..., description=...)), async-first; Python 3.12+. Wraps any sync or async callable as the target"
    How attacks are made: "LLM generators build adversarial scenarios from a plain-language description of the agent; built-in prompt-injection dataset; generators include Crescendo, GOAT, GCG injection, sycophancy, out-of-scope"
    Agent and tool risks: "Scan covers prompt injection, jailbreaks, harmful content and OWASP LLM Top 10 categories; giskard-checks tests multi-turn agent conversations. No MCP-specific tests documented in the README"
    Multi-turn: "Yes, default target_mode is multiturn (singleturn optional)"
    Framework mappings: "OWASP LLM Top 10 threat categories (per README); no other framework presets documented"
    CI: "No CI integration documented in the README; scans and checks are Python code you can run in any test runner"
    Data leaving your machine: "Generation and judging go to the LLM provider you install (default judge openai/gpt-4o-mini); optional aggregated telemetry without prompts or outputs, off with DO_NOT_TRACK=1 or GISKARD_TELEMETRY_DISABLED=1"
    License: "Apache-2.0 (v2 still available but no longer actively maintained)"
verdict: "Pick Promptfoo if you want a config-driven CLI with the broadest agent and MCP coverage and framework reports, but turn off remote generation and telemetry if data must stay local. Pick DeepTeam for a Python-native red team with a large agentic vulnerability list and a code scanner for PRs. Pick Giskard for multi-turn scans in Python; its third_party_scan can also run garak probes and DeepTeam attacks."
sources:
  - title: Promptfoo red team getting started (site/docs/red-team/quickstart.md)
    url: https://github.com/promptfoo/promptfoo/blob/main/site/docs/red-team/quickstart.md
    accessed: 2026-10-21
  - title: Promptfoo red team configuration (site/docs/red-team/configuration.md)
    url: https://github.com/promptfoo/promptfoo/blob/main/site/docs/red-team/configuration.md
    accessed: 2026-10-21
  - title: Promptfoo red team strategies (site/docs/red-team/strategies/index.md)
    url: https://github.com/promptfoo/promptfoo/blob/main/site/docs/red-team/strategies/index.md
    accessed: 2026-10-21
  - title: Promptfoo MCP security testing guide
    url: https://github.com/promptfoo/promptfoo/blob/main/site/docs/red-team/mcp-security-testing.md
    accessed: 2026-10-21
  - title: Promptfoo CI/CD integration docs
    url: https://github.com/promptfoo/promptfoo/blob/main/site/docs/integrations/ci-cd.md
    accessed: 2026-10-21
  - title: Promptfoo GitHub Actions docs
    url: https://github.com/promptfoo/promptfoo/blob/main/site/docs/integrations/github-action.md
    accessed: 2026-10-21
  - title: Promptfoo telemetry docs
    url: https://github.com/promptfoo/promptfoo/blob/main/site/docs/configuration/telemetry.md
    accessed: 2026-10-21
  - title: Promptfoo README
    url: https://github.com/promptfoo/promptfoo
    accessed: 2026-10-21
  - title: Promptfoo llms.txt (docs index, red-team plugin list)
    url: https://www.promptfoo.dev/llms.txt
    accessed: 2026-10-21
  - title: promptfoo-action README
    url: https://github.com/promptfoo/promptfoo-action
    accessed: 2026-10-21
  - title: DeepTeam README (confident-ai/deepteam)
    url: https://github.com/confident-ai/deepteam
    accessed: 2026-10-21
  - title: DeepTeam YAML configurations (docs/content/docs/red-teaming-yaml-cli.mdx)
    url: https://github.com/confident-ai/deepteam/blob/main/docs/content/docs/red-teaming-yaml-cli.mdx
    accessed: 2026-10-21
  - title: DeepTeam code scanning introduction
    url: https://github.com/confident-ai/deepteam/blob/main/docs/content/docs/code-scanning-introduction.mdx
    accessed: 2026-10-21
  - title: DeepTeam telemetry module (deepteam/telemetry.py)
    url: https://github.com/confident-ai/deepteam/blob/main/deepteam/telemetry.py
    accessed: 2026-10-21
  - title: deepteam on PyPI
    url: https://pypi.org/project/deepteam/
    accessed: 2026-10-21
  - title: Giskard OSS README (Giskard-AI/giskard-oss)
    url: https://github.com/Giskard-AI/giskard-oss
    accessed: 2026-10-21
  - title: giskard-scan README
    url: https://github.com/Giskard-AI/giskard-oss/blob/main/libs/giskard-scan/README.md
    accessed: 2026-10-21
  - title: giskard on PyPI
    url: https://pypi.org/project/giskard/
    accessed: 2026-10-21
last_verified: 2026-10-21
published: 2026-10-21
---

## What this covers

Evals ask whether your app does the right thing. Red-teaming asks whether someone can make it do the wrong thing: leak a system prompt or PII, follow injected instructions, call a tool it shouldn't, or be talked out of its rules over several turns. All three tools here generate those attacks automatically, run them against your app, and grade the responses with an LLM judge. That last step means a "pass" is a model's opinion, so read the failing transcripts yourself.

For evals, tracing and CI quality gates, see [Evaluate an AI agent](guide:evaluate-an-ai-agent) and [Agent observability platforms](comparison:agent-observability-platforms). For public capability scores, see [Agent benchmarks](comparison:agent-benchmarks).

## How each one is wired

- **[Promptfoo](entry:promptfoo)** is a CLI. You describe the target and its purpose in `promptfooconfig.yaml`, pick plugins (what to attack) and strategies (how to deliver it), and run `promptfoo redteam run`. It writes the generated probes to `redteam.yaml` and then attacks the target. The target can be any HTTP endpoint, a browser session or a model, so it tests the deployed app, not only the model.
- **[DeepTeam](entry:deepteam)** is a Python library built on [DeepEval](entry:deepeval). You wrap your app in an async `model_callback(input) -> str`, choose vulnerabilities and attacks or a framework such as `OWASPTop10()`, and call `red_team(...)`. `deepteam run config.yaml` does the same from YAML.
- **[Giskard](entry:giskard)** v3 is a Python library. You pass any callable as `target` and a plain-language `description` to `vulnerability_scan(...)`, and it generates the adversarial scenarios. `third_party_scan(tool="garak" | "deepteam")` runs garak probes or DeepTeam attacks through the same target and report format, which the README marks as experimental.

```python
# DeepTeam, from its README: map an OWASP framework to vulnerabilities and attacks
from deepteam import red_team
from deepteam.frameworks import OWASPTop10

async def model_callback(input: str) -> str:
    return await my_agent(input)          # your app

risk_assessment = red_team(model_callback=model_callback, framework=OWASPTop10())
```

```python
# Giskard v3, from the giskard-scan README
from giskard.scan import vulnerability_scan

result = await vulnerability_scan(
    target=my_agent,
    description="Customer support chatbot for an e-commerce store.",
    languages=["en"],
    max_scenarios=20,
)
```

```yaml
# Promptfoo, adapted from its MCP security testing guide: attack an MCP server through a model client
targets:
  - id: openai:gpt-5
    config:
      mcp:
        enabled: true
        servers:
          - name: your-mcp-server
            url: https://your-mcp-server.example.com/mcp
redteam:
  purpose: A payment assistant that must enforce authorization on every tool call.
  plugins: [mcp, pii, bfla, bola, sql-injection]
  strategies: [multi-turn, jailbreak, jailbreak-templates]
```

## What was tested

On 2026-10-21 we installed `deepteam` 1.0.10 and `giskard[scan]` 3.0.1 in a clean Python 3.13 virtualenv. The imports above resolved, `deepteam --help` listed `run`, `scan` and `login`, and `list_scan_items("giskard")` listed the scenario generators named in the table. We did not run any attacks, because every tool needs an LLM API key for generation and judging. Promptfoo 0.124.1 requires Node.js 22.22 or later, and the test box had Node.js 20, so its CLI was not run.

One finding from that install: `deepteam` 1.0.10 failed to import until `sentry-sdk` and `posthog` were installed by hand. Its telemetry module imports them, but the package does not list them as dependencies. If you get `ModuleNotFoundError: No module named 'sentry_sdk'`, run `pip install sentry-sdk posthog`.

## Agent-specific risks

Plain chatbots mostly risk saying something bad. Agents can *do* something bad, so check coverage for:

- **Tool misuse and authorization:** BOLA and BFLA (calling a function or reading an object the user shouldn't), and excessive agency. Promptfoo and DeepTeam both name these.
- **Indirect prompt injection:** instructions hidden in content the agent reads. Promptfoo has indirect-injection strategies, DeepTeam has an Indirect Instruction vulnerability, and Giskard's scan includes prompt injection.
- **Tool poisoning:** a malicious MCP server whose tool descriptions carry instructions. Promptfoo's MCP guide sets this up with its open-source rogue server, and DeepTeam lists Tool Metadata Poisoning.
- **Multi-agent issues:** DeepTeam lists inter-agent communication compromise and agent identity abuse.

Red-teaming finds weaknesses; it doesn't fix them. Pair it with server-side controls such as audience-bound tokens and per-tool scopes on your [MCP](entry:model-context-protocol) servers ([Add OAuth authorization to your own MCP server](guide:add-oauth-to-your-mcp-server)) and with care about which servers you connect ([Pick an MCP server](skill:pick-an-mcp-server)).

## Notes

- **Keep it local if you must.** Promptfoo's best-quality attack generation uses its remote service by default. Its docs warn that local generation quality "depends greatly on the model that you configure". DeepTeam and Giskard send attack and judge prompts to whichever LLM provider you configure. All three have opt-outs for usage telemetry.
- **Cost scales with the matrix.** Vulnerabilities × subtypes × attacks × turns. Start with a small set, then widen.
- **In CI**, store the generated probes and rerun them as a regression suite: Promptfoo's `retry` strategy, or a committed DeepTeam YAML config. Gate on new failures, not on a perfect score.
- **Not compared here:** NVIDIA garak and Microsoft PyRIT have no directory entries yet. Giskard can run garak probes through `third_party_scan`.
