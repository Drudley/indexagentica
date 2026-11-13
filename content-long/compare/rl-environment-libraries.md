---
id: rl-environment-libraries
type: comparison
title: "RL environment libraries compared — NeMo Gym, OpenEnv and Verifiers"
summary: "Compare NeMo Gym, OpenEnv and Verifiers as libraries for writing and running RL environments: authoring model, isolation, documented trainers, install paths, licences and current versions. Distinct from Harbor/AgentEnv/Seahaven and from the agent RL stacks comparison."
description: "A source-checked comparison of three RL environment libraries added to the directory on 2026-11-12: NVIDIA NeMo Gym (PyPI 0.7.0, Apache-2.0), OpenEnv (PyPI 0.13.0, BSD-3-Clause) and Prime Intellect's verifiers (PyPI 0.4.1, MIT). Covers authoring models, runtimes, documented trainer integrations (including prime-rl and NeMo RL as consumers, not subjects), and install pins checked 2026-11-13. A CPU-only OpenEnv init plus static validate was run; NeMo Gym's official Python pin and GPU trainers were not. No unbacked performance numbers."
author: Agentica Author
tags: [reinforcement-learning, environments, evals, training, python]
entries: [nemo-gym, openenv, verifiers, prime-rl, nemo-rl, harbor, trl, skyrl, unsloth, openpipe-art, verl]
related: [agent-environment-frameworks, agent-reinforcement-learning-stacks, post-training-tool-use-model]
subjects: [nemo-gym, openenv, verifiers]
criteria:
  - Authoring model
  - Runtime and isolation
  - Training integrations
  - Official install and versions
  - License
rows:
  nemo-gym:
    Authoring model: "An environment is a dataset of tasks, an agent harness, a verifier, and per-task state. Tutorials cover single-step and multi-step tool calling, session state, and multi-reward verification. The documented CLI includes gym env start and gym eval run."
    Runtime and isolation: "Local coordinating servers for resources, agent and model. Release notes document multiple sandbox providers. A GPU is not required for the library itself; particular resource servers or inference may need one, and the official quick start uses a model API key."
    Training integrations: "Official training tutorials cover NeMo RL, Unsloth and VeRL. The ecosystem docs also describe combining Harbor, OpenEnv, Reasoning Gym and Verifiers environments with NeMo Gym's own."
    Official install and versions: "Official quick start is git clone, then uv venv --python 3.13.14 && uv sync (Python >=3.13.14), not a pip one-liner. PyPI nemo-gym 0.7.0 matches GitHub v0.7.0 (12 October 2026)."
    License: "Apache License 2.0 (repository LICENSE)"
  openenv:
    Authoring model: "Subclass Environment and implement reset(), step() and state, plus Action/Observation models. Scaffold with openenv init. Rewards are computed in the environment (observation fields or a rubric). openenv import can wrap a Verifiers or AgentEnv source."
    Runtime and isolation: "Each environment is documented as a Docker image that can run locally, on a cloud sandbox, or as a Hugging Face Space, over a Gymnasium-style reset/step/state API on WebSocket/HTTP. openenv serve runs on the host for local development; use Docker or Spaces for isolated training."
    Training integrations: "The README and training guide list TRL (environment_factory on GRPOTrainer, and Harbor traces with AsyncGRPOTrainer), Unsloth, SkyRL, ART, Oumi, torchforge, Miles and others. Training stays in the framework; the environment supplies tools and the reward."
    Official install and versions: "pip install openenv (Python >=3.10). PyPI and GitHub latest are 0.13.0 (12 November 2026). The project notes that it is in early development and APIs may change."
    License: "BSD 3-Clause (repository LICENSE; copyright 2026, Hugging Face, Inc.)"
  verifiers:
    Authoring model: "A Taskset.load() builds Task objects from TaskData (prompt, files, scoring). Most packages need only a Taskset and Task; a custom Env is for bespoke multi-agent control flow. Score with @vf.reward. Isolated grading uses ScoringConfig(mode=\"isolated\")."
    Runtime and isolation: "An evaluator process plus optional agent and grading sandboxes (Docker and other runtimes are documented). vf-validate can check task setup or a gold solution without calling a model. vf-run runs a few in-process episodes."
    Training integrations: "Documented as tightly integrated with prime-rl (the orchestrator drives verifiers environments) and Prime Intellect's Environments Hub and Hosted Training (account and compute cost possible). OpenEnv can import a Verifiers source; NeMo Gym documents a Verifiers agent integration."
    Official install and versions: "Getting started is git clone and uv sync (example vf-validate reverse-text -n 1). PyPI verifiers 0.4.1 matches GitHub v0.4.1 (3 November 2026), Python >=3.11,<3.15. The README also recommends the Prime CLI (uv tool install prime)."
    License: "MIT (repository LICENSE; copyright 2026 Prime Intellect)"
verdict: "Need a Gymnasium-style reset/step/state service you can package as Docker or a Hugging Face Space and call from several trainers? Start with OpenEnv (and openenv import if you already have a Verifiers or AgentEnv source). Need NVIDIA's environment servers (dataset, harness and verifier) and the documented path into NeMo RL, or its VeRL and Unsloth tutorials? Use NeMo Gym. Need Prime Intellect's taskset/harness/trace model and prime-rl? Use Verifiers. This is a different layer from Harbor, AgentEnv Framework and Seahaven, and from the training engines on the agent RL stacks page."
sources:
  - title: "NVIDIA-NeMo/Gym README"
    url: https://raw.githubusercontent.com/NVIDIA-NeMo/Gym/main/README.md
    accessed: 2026-11-13
  - title: "NVIDIA-NeMo/Gym LICENSE"
    url: https://raw.githubusercontent.com/NVIDIA-NeMo/Gym/main/LICENSE
    accessed: 2026-11-13
  - title: "nemo-gym PyPI metadata"
    url: https://pypi.org/pypi/nemo-gym/json
    accessed: 2026-11-13
  - title: "NVIDIA-NeMo/Gym latest GitHub release"
    url: https://api.github.com/repos/NVIDIA-NeMo/Gym/releases/latest
    accessed: 2026-11-13
  - title: "NeMo Gym documentation, About"
    url: https://docs.nvidia.com/nemo/gym/main/about/
    accessed: 2026-11-13
  - title: "NeMo Gym environment tutorials"
    url: https://docs.nvidia.com/nemo/gym/main/environment-tutorials
    accessed: 2026-11-13
  - title: "NeMo Gym training tutorials"
    url: https://docs.nvidia.com/nemo/gym/tutorials/training-tutorials
    accessed: 2026-11-13
  - title: "NeMo Gym tutorial, NeMo RL GRPO"
    url: https://docs.nvidia.com/nemo/gym/tutorials/training-tutorials/nemo-rl-grpo
    accessed: 2026-11-13
  - title: "NeMo Gym ecosystem"
    url: https://docs.nvidia.com/nemo/gym/main/about/ecosystem
    accessed: 2026-11-13
  - title: "openenv/OpenEnv README"
    url: https://raw.githubusercontent.com/openenv/OpenEnv/main/README.md
    accessed: 2026-11-13
  - title: "openenv/OpenEnv LICENSE"
    url: https://raw.githubusercontent.com/openenv/OpenEnv/main/LICENSE
    accessed: 2026-11-13
  - title: "openenv PyPI metadata"
    url: https://pypi.org/pypi/openenv/json
    accessed: 2026-11-13
  - title: "openenv/OpenEnv latest GitHub release"
    url: https://api.github.com/repos/openenv/OpenEnv/releases/latest
    accessed: 2026-11-13
  - title: "OpenEnv documentation index"
    url: https://huggingface.co/docs/openenv/index
    accessed: 2026-11-13
  - title: "OpenEnv, Your First Environment"
    url: https://huggingface.co/docs/openenv/guides/first-environment
    accessed: 2026-11-13
  - title: "OpenEnv, Core Concepts"
    url: https://huggingface.co/docs/openenv/guides/concepts
    accessed: 2026-11-13
  - title: "OpenEnv, Training with OpenEnv"
    url: https://huggingface.co/docs/openenv/guides/training
    accessed: 2026-11-13
  - title: "OpenEnv CLI reference"
    url: https://huggingface.co/docs/openenv/reference/cli
    accessed: 2026-11-13
  - title: "OpenEnv environment catalog"
    url: https://huggingface.co/docs/openenv/environments
    accessed: 2026-11-13
  - title: "TRL documentation, OpenEnv"
    url: https://huggingface.co/docs/trl/openenv
    accessed: 2026-11-13
  - title: "PrimeIntellect-ai/verifiers README"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/verifiers/main/README.md
    accessed: 2026-11-13
  - title: "PrimeIntellect-ai/verifiers LICENSE"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/verifiers/main/LICENSE
    accessed: 2026-11-13
  - title: "verifiers PyPI metadata"
    url: https://pypi.org/pypi/verifiers/json
    accessed: 2026-11-13
  - title: "PrimeIntellect-ai/verifiers latest GitHub release"
    url: https://api.github.com/repos/PrimeIntellect-ai/verifiers/releases/latest
    accessed: 2026-11-13
  - title: "verifiers docs, Overview"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/verifiers/main/docs/overview.md
    accessed: 2026-11-13
  - title: "verifiers docs, Getting started"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/verifiers/main/docs/getting_started.md
    accessed: 2026-11-13
  - title: "verifiers docs, Building environments"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/verifiers/main/docs/building-environments.md
    accessed: 2026-11-13
  - title: "PrimeIntellect-ai/prime-rl README"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/prime-rl/main/README.md
    accessed: 2026-11-13
  - title: "PrimeIntellect-ai/prime-rl LICENSE"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/prime-rl/main/LICENSE
    accessed: 2026-11-13
  - title: "prime-rl docs, Overview"
    url: https://raw.githubusercontent.com/PrimeIntellect-ai/prime-rl/main/docs/overview.md
    accessed: 2026-11-13
  - title: "PrimeIntellect-ai/prime-rl latest GitHub release"
    url: https://api.github.com/repos/PrimeIntellect-ai/prime-rl/releases/latest
    accessed: 2026-11-13
  - title: "NVIDIA-NeMo/RL README"
    url: https://raw.githubusercontent.com/NVIDIA-NeMo/RL/main/README.md
    accessed: 2026-11-13
  - title: "NVIDIA-NeMo/RL LICENSE"
    url: https://raw.githubusercontent.com/NVIDIA-NeMo/RL/main/LICENSE
    accessed: 2026-11-13
  - title: "NVIDIA-NeMo/RL latest GitHub release"
    url: https://api.github.com/repos/NVIDIA-NeMo/RL/releases/latest
    accessed: 2026-11-13
  - title: "NeMo RL documentation index"
    url: https://docs.nvidia.com/nemo/rl/latest/index.html
    accessed: 2026-11-13
  - title: "nemo-rl PyPI metadata"
    url: https://pypi.org/pypi/nemo-rl/json
    accessed: 2026-11-13
last_verified: 2026-11-13
published: 2026-11-13
updated: 2026-11-13
---
## Gym libraries, not training stacks or eval-task frameworks

[Agent RL stacks compared](comparison:agent-reinforcement-learning-stacks) covers training engines and harness gateways — [verl](entry:verl), [SkyRL](entry:skyrl), [Agent Lightning](entry:agent-lightning) and [OpenPipe ART](entry:openpipe-art). [Post-training a tool-use model](stack:post-training-tool-use-model) is a recommended SFT/LoRA/DPO/GRPO path on [TRL](entry:trl) and PEFT. [Agent environment frameworks compared](comparison:agent-environment-frameworks) is one layer over, covering [Harbor](entry:harbor), [AgentEnv Framework](entry:agentenv-framework) and [Seahaven](entry:seahaven) as task- and world-authoring frameworks; that page already notes that AgentEnv and Seahaven can *serve* environments through OpenEnv.

This page compares the three **RL environment libraries** now in the directory: [NeMo Gym](entry:nemo-gym), [OpenEnv](entry:openenv) and [verifiers](entry:verifiers). They are what you use to define tasks, rewards and (often) isolated runtimes that a trainer can call. [prime-rl](entry:prime-rl) and [NeMo RL](entry:nemo-rl) appear here only as documented consumers of those environments, not as subjects.

The comparison table is generated from the front matter. Project READMEs include scale or catalog wording (for example OpenEnv's "40+ ready-to-use environments", NeMo Gym's "thousands of concurrent environments", or prime-rl's large-cluster claims). Those figures are the projects' own and are not independently counted or measured here.

## How each library models an environment

**NeMo Gym** defines an environment as the complete system an agent interacts with: a dataset of tasks, an agent harness, a verifier, and per-task state. You start coordinating servers with `gym env start` and score rollouts with `gym eval run`. [Environment tutorials](https://docs.nvidia.com/nemo/gym/main/environment-tutorials) walk through single-step and multi-step tool calling, session state, and multi-reward verification. The official docs are at [docs.nvidia.com/nemo/gym/main/about/](https://docs.nvidia.com/nemo/gym/main/about/).

**OpenEnv** is a client-server layer inspired by Gymnasium. You subclass `Environment` and implement `reset()`, `step()` and `state`; `step()` returns an observation that already carries `done` and `reward`, not a Gymnasium-style tuple. [Your First Environment](https://huggingface.co/docs/openenv/guides/first-environment) scaffolds this with `openenv init`. The README documents a catalog of ready-to-use environments (Echo, coding, TextArena, OpenSpiel, BrowserGym, Harbor and others) at the [environment catalog](https://huggingface.co/docs/openenv/environments). Official docs: [huggingface.co/docs/openenv/index](https://huggingface.co/docs/openenv/index). The documentation root without `/index` redirects, so do not use that shorter path in published links. The canonical repository is [openenv/OpenEnv](https://github.com/openenv/OpenEnv); older GitHub paths under `huggingface/` and `meta-pytorch/` redirect to it.

**verifiers** is organised around a **taskset** that loads `Task` objects from serialisable `TaskData`, a **harness** (for example Claude Code, Codex or mini-swe-agent), an **agent** (harness × model × runtime policy) that produces a `Trace`, and an **environment** that defines control flow across an episode. Most packages only need a `Taskset` and `Task`; you write a custom `Env` when you want bespoke multi-agent flow. The [building environments](https://raw.githubusercontent.com/PrimeIntellect-ai/verifiers/main/docs/building-environments.md) guide shows `verifiers.v1` hooks such as `setup` and `@vf.reward`, including isolated grading with `ScoringConfig(mode="isolated")`. In-tree docs live under [docs/](https://github.com/PrimeIntellect-ai/verifiers/tree/main/docs); there is no separate docs hostname.

## Runtime and isolation

NeMo Gym's quick start runs local servers on a development machine (Linux, macOS, or Windows via WSL2). A GPU is not required for the library itself. The official example configures a model endpoint (OpenAI is the documented quick-start case; other providers, including vLLM, are listed in the docs). Release notes describe several sandbox providers; treat any environment that executes agent or task code as a potentially destructive sandbox.

OpenEnv packages each environment as a Docker image that the docs say can run locally, on a cloud sandbox, or as a Hugging Face Space, speaking `reset` / `step` / `state` over WebSocket or HTTP, with optional MCP tool serving in production mode. For local authoring, `openenv serve` runs on the host after you install the environment's dependencies; the README says to use Docker or Spaces for isolated training and deployment. `openenv push` deploys to Spaces — we did not run that.

verifiers splits work across an evaluator process and optional agent and grading sandboxes. Isolated scoring copies only declared artifacts into a fresh grading container. [Getting started](https://raw.githubusercontent.com/PrimeIntellect-ai/verifiers/main/docs/getting_started.md) documents `vf-validate` as a local check that does not call a model, and `vf-run` for a few in-process episodes. Harbor-based tasksets need Python 3.12+ and the `harbor` extra.

## Which trainers they document

These libraries are not substitutes for a training engine. Use them to produce graded rollouts; pick the trainer separately.

- **OpenEnv** keeps training in the caller's framework. The [training guide](https://huggingface.co/docs/openenv/guides/training) and README name [TRL](entry:trl) ([OpenEnv guide](https://huggingface.co/docs/trl/openenv), including `GRPOTrainer` with `environment_factory` and Harbor traces via `AsyncGRPOTrainer`), [Unsloth](entry:unsloth), [SkyRL](entry:skyrl), [ART](entry:openpipe-art), Oumi, torchforge, Miles and others. `openenv import` can wrap an existing Verifiers environment or an AgentEnv bundle. [Harbor](entry:harbor) integration is documented for running real coding-agent harnesses and capturing tokens for RL.
- **NeMo Gym** publishes [training tutorials](https://docs.nvidia.com/nemo/gym/tutorials/training-tutorials), including a [NeMo RL GRPO](https://docs.nvidia.com/nemo/gym/tutorials/training-tutorials/nemo-rl-grpo) path, plus Unsloth and VeRL. The [ecosystem](https://docs.nvidia.com/nemo/gym/main/about/ecosystem) page describes combining environments from Harbor, OpenEnv, Reasoning Gym and Verifiers. [NeMo RL](entry:nemo-rl) itself is an Apache-2.0 trainer: GitHub latest is **v0.8.0** (6 November 2026). Its PyPI package `nemo-rl` is still **0.0.0** (uploaded 3 June 2025) and is not the current install path — official docs use the NGC container or a git checkout.
- **verifiers** is documented as tightly integrated with [prime-rl](entry:prime-rl). prime-rl's [overview](https://raw.githubusercontent.com/PrimeIntellect-ai/prime-rl/main/docs/overview.md) describes an orchestrator that owns the data plane across verifiers training and eval environments. GitHub latest is **v0.10.0** (13 October 2026). There is still **no** PyPI package named `prime-rl` or `prime_rl` (HTTP 404 on 13 November 2026). The README documents a git/uv install and a curl of `scripts/install.sh` (not executed here) and states that you currently need at least one NVIDIA GPU. The Environments Hub and Hosted Training are Prime Intellect products that may require an account and can incur compute cost; they were not used here.

## Official install, licences and versions (13 November 2026)

| Package | Licence file | Official install documented as | PyPI / GitHub latest | Requires Python |
|---|---|---|---|---|
| nemo-gym | Apache License 2.0 | `git clone` and `uv venv --python 3.13.14 && uv sync` | 0.7.0 / v0.7.0 | >=3.13.14 |
| openenv | BSD 3-Clause | `pip install openenv` | 0.13.0 / v0.13.0 | >=3.10 |
| verifiers | MIT | `git clone` and `uv sync`; README also recommends `uv tool install prime` | 0.4.1 / v0.4.1 | >=3.11,<3.15 |
| prime-rl (trainer, not a subject) | Apache License 2.0 | git/uv (or the project's install script) | no PyPI package / v0.10.0 | (see prime-rl docs; GPU required) |
| nemo-rl (trainer, not a subject) | Apache License 2.0 | NGC container or git clone, not the 0.0.0 PyPI wheel | PyPI 0.0.0; GitHub v0.8.0 | (see NeMo RL install docs) |

When linking repositories, use the canonical paths above. Do not use redirecting GitHub URLs such as `huggingface/openenv`, `meta-pytorch/OpenEnv`, or `willccbb/verifiers`.

## A minimal OpenEnv check we ran

The following commands are the official scaffold and static contract check from the OpenEnv README and [CLI reference](https://huggingface.co/docs/openenv/reference/cli). We ran them on the box with PyPI **openenv 0.13.0** in a Python 3.13.5 virtualenv, without Docker and without calling a hosted Space or a model:

```bash
pip install openenv==0.13.0
openenv init my_env
openenv validate my_env --level static --skip-build
```

`openenv init` created 12 files (including `server/my_env_environment.py`, `models.py`, `openenv.yaml` and a `server/Dockerfile`). `openenv validate` reported `policy v1`, level `static`, `PASS static.manifest`, and verdict `PASS`. We did not run `openenv serve`, `openenv build`, `openenv push`, or a runtime/semantic validate.

## What we did not run

We did not install [NeMo Gym](entry:nemo-gym): the official pin is Python **>=3.13.14**, and this box has Python 3.13.5. We did not clone verifiers or run `vf-validate reverse-text`, and we did not install or run prime-rl or NeMo RL (both are GPU training stacks; prime-rl's docs say you currently need at least one NVIDIA GPU; NeMo RL's official path uses an NGC container or a full checkout). No environment server was left listening, and no API keys, Spaces deploys or paid compute were used.
