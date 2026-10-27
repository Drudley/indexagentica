---
id: agent-environment-frameworks
type: comparison
title: "Agent environment frameworks compared: Harbor vs AgentEnv Framework vs Seahaven"
summary: "Three open-source Python frameworks for building the environments agent evals and RL runs happen in: Harbor (container tasks), Scale AI's AgentEnv Framework and Kiln AI's Seahaven (synthetic SQLite worlds). Covers tasks, grading, compute, agent interface, interop and license."
description: "A primary-source comparison of three agent environment frameworks, checked on 2026-10-27 against each project's GitHub README, documentation and PyPI release. It describes how each framework models an environment and grades an agent. None was benchmarked here, and scale claims are the projects' own."
author: Agentica Author
tags: [evals, reinforcement-learning, environments, benchmarks, sandboxes, openenv, mcp]
entries: [harbor, agentenv-framework, seahaven, terminal-bench, swe-bench, tau-bench, appworld, daytona, modal, claude-code, codex-cli, open-swe-traces]
related: [agent-benchmarks, evaluate-an-ai-agent, code-sandboxes, self-hosted-agent-sandboxes, run-untrusted-code-in-a-sandbox, test-an-agent-for-prompt-injection]
subjects: [harbor, agentenv-framework, seahaven]
criteria:
  - Unit of work
  - Grading
  - Where runs execute
  - Agent interface
  - Interop
  - Install
  - License
rows:
  harbor:
    Unit of work: "A task folder: instruction.md, task.toml, an environment (container definition) and tests; tasks group into versioned datasets such as terminal-bench@2.0"
    Grading: "The task's tests check the container after the agent finishes"
    Where runs execute: "Local Docker by default; --env switches to cloud sandboxes (Daytona, Modal, LangSmith, Blaxel, Novita, Tensorlake, Runta, Sail) for thousands of parallel runs"
    Agent interface: "Runs real agent harnesses (Claude Code, OpenHands, Codex CLI and more) inside the environment, plus a model flag"
    Interop: "Official harness for Terminal-Bench 2.0; harbor datasets list includes third-party benchmarks such as SWE-Bench and Aider Polyglot; generates rollouts for RL"
    Install: "uv tool install harbor (PyPI 0.25.0, Python 3.12+)"
    License: "Apache-2.0"
  agentenv-framework:
    Unit of work: "An environment (containerized server speaking agentenv-framework-protocol) plus tasks that run against it, built into versioned images and shared through a registry"
    Grading: "Tasks score what the agent did in the environment"
    Where runs execute: "Local Docker by default; other sandbox providers (including Modal and E2B, per the docs) and custom ones via plugins; optional AWS and GCP store backends"
    Agent interface: "Agents are deployed into sandboxes and described with A2A Agent Cards; they reach the environment through a gateway"
    Interop: "Every task in a bundle can be served as an OpenEnv env (openenv extra); plugins add env types, providers, task steps and stores"
    Install: "uv tool install agentenv-framework, then agent-env run hello (PyPI 0.9.1364, Python 3.11.4+)"
    License: "Apache-2.0"
  seahaven:
    Unit of work: "A world: SQLite tables plus Python tool functions, with frozen fixtures as starting states; worlds compose (for example Kiln's Stripe World)"
    Grading: "On final state, not transcripts: every row the agent changed is logged for the grader"
    Where runs execute: "In-process: hundreds of world instances per process, each with its own SQLite database; no containers needed"
    Agent interface: "Tool calls against mocked APIs (tools, REST, sandboxed SQL, search); seahaven mcp serves one world to an MCP client"
    Interop: "seahaven serve is an OpenEnv environment with a web console; worlds can be published to Hugging Face"
    Install: "uvx seahaven new <world> scaffolds a project (PyPI 0.6.0, Python 3.14+)"
    License: "MIT"
verdict: "Evaluating real coding agents on terminal tasks, or running existing benchmarks such as Terminal-Bench 2.0 and SWE-Bench at scale? Use Harbor. Building a fleet of containerized environments for RL with a registry, plugins and A2A-described agents? AgentEnv Framework is Scale's production stack. Need a fast, reproducible fake of a SaaS app (CRM, billing) so tool-calling agents can be graded on what they changed? Seahaven worlds are just Python and SQLite and need no containers."
sources:
  - {title: "Harbor README", url: "https://github.com/harbor-framework/harbor", accessed: 2026-10-27}
  - {title: "Harbor example task (examples/tasks)", url: "https://github.com/harbor-framework/harbor/tree/main/examples/tasks", accessed: 2026-10-27}
  - {title: "PyPI: harbor", url: "https://pypi.org/project/harbor/", accessed: 2026-10-27}
  - {title: "AgentEnv Framework README", url: "https://github.com/scaleapi/agentenv-framework", accessed: 2026-10-27}
  - {title: "AgentEnv Framework docs", url: "https://www.agentenvframework.com/docs", accessed: 2026-10-27}
  - {title: "PyPI: agentenv-framework", url: "https://pypi.org/project/agentenv-framework/", accessed: 2026-10-27}
  - {title: "Seahaven README", url: "https://github.com/Kiln-AI/Seahaven", accessed: 2026-10-27}
  - {title: "PyPI: seahaven", url: "https://pypi.org/project/seahaven/", accessed: 2026-10-27}
last_verified: 2026-10-27
published: 2026-10-27
---

A benchmark is a fixed set of tasks and a score. An environment framework is what you use to build and run those tasks: it starts a clean world for each attempt, connects an agent, and checks the result. The same framework serves evals (score a model or harness) and reinforcement learning (generate thousands of graded rollouts). For the benchmarks themselves, see [Agent benchmarks compared](comparison:agent-benchmarks).

The three frameworks here model "the world" in different ways, and that choice decides most of the rest.

## Three ways to model the world

**A container per task ([Harbor](entry:harbor)).** Each task is a folder with an instruction, a container environment and tests. The agent, a real harness such as [Claude Code](entry:claude-code) or [Codex CLI](entry:codex-cli), works inside the container, and the tests check what's left behind. This is how [Terminal-Bench](entry:terminal-bench) works. Harbor is its official harness, so it fits anything a shell can reach: repos, builds, files and services. It is also the heaviest option, because every attempt is a container.

**A containerized environment server ([AgentEnv Framework](entry:agentenv-framework)).** Scale AI's framework splits the environment (a long-running server that speaks an open protocol) from the tasks that run against it. Environments are built into versioned images and deployed behind a gateway, and agents are deployed into sandboxes and described with A2A Agent Cards. That's more structure than Harbor. It pays off when many teams share environments through a registry, and when one environment backs many tasks.

**A synthetic world in a database ([Seahaven](entry:seahaven)).** Kiln AI's framework doesn't run containers. A world is a set of SQLite tables plus Python functions that act as the agent's tools, for example a fake CRM or a fake Stripe. Each run copies a frozen fixture, so it starts from a known state with a fixed clock and seed. Seahaven logs every row the agent changes, so you grade the final state instead of reading transcripts. Hundreds of instances fit in one process. This suits tool-calling agents in the style of [τ-bench](entry:tau-bench) or [AppWorld](entry:appworld), where the work is API calls rather than shell commands.

## Where the compute goes

Harbor and AgentEnv start on local Docker and scale out through sandbox providers. Harbor lists Daytona, Modal, LangSmith, Blaxel and others behind one `--env` flag, and AgentEnv adds providers through plugins. If you're picking a provider, [Code sandboxes compared](comparison:code-sandboxes) covers [Daytona](entry:daytona), [Modal](entry:modal) and the rest, and [Self-hosted agent sandboxes](comparison:self-hosted-agent-sandboxes) covers running your own. Seahaven skips this layer entirely, which makes it cheap to run but limits it to what you can mock in Python.

## Interop: OpenEnv and MCP

AgentEnv and Seahaven can both serve environments through OpenEnv, an open interface for RL environments, so an OpenEnv-based trainer can drive either. Seahaven can also expose a world over MCP (`seahaven mcp`), which is useful when you want to try a world by hand from an editor or chat client before you automate it. Harbor's interop is with benchmarks: `harbor datasets list` shows third-party datasets such as [SWE-Bench](entry:swe-bench) and Aider Polyglot that run under the same CLI.

## Getting started cheaply

- Harbor: run one Terminal-Bench 2.0 task locally with `--n-concurrent 1` before you pay for cloud sandboxes.
- AgentEnv: `uvx --from agentenv-framework agent-env run hello` runs a built-in task with no Docker, model or config.
- Seahaven: `uvx seahaven new crm_world` scaffolds a world with tests, a fixture generator and an `AGENTS.md`, so a coding agent can build the rest. `seahaven check` reports fixes for authoring mistakes.

For how evals fit with tracing and observability, see [Evaluate an AI agent](guide:evaluate-an-ai-agent). To train or fine-tune on agent trajectories instead of generating them, NVIDIA's [Open SWE Traces](entry:open-swe-traces) is an open dataset of software-engineering agent trajectories (CC BY 4.0).
