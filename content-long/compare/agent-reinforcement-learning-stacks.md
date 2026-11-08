---
id: agent-reinforcement-learning-stacks
type: comparison
title: Agent RL stacks compared — verl, SkyRL, Agent Lightning and ART
summary: "Choose an agent reinforcement-learning stack by the layer you need: distributed training, long-horizon environments, an existing-harness gateway, or a trajectory-and-reward client. Backend ownership matters more than a headline benchmark."
description: "A source-checked comparison of verl, SkyRL, Microsoft Agent Lightning v1.0 and OpenPipe ART. Separates training infrastructure from rollout integration and managed backends, covers rewards and operational prerequisites, and flags Agent Lightning's pinned verl stack versus the latest standalone release. No GPU training, throughput measurements, cost estimates or cross-project benchmark ranking."
author: Agentica Author
tags: [reinforcement-learning, agent-training, fine-tuning, infrastructure, evaluation]
entries: [verl, skyrl, agent-lightning, openpipe-art]
related: [agent-environment-frameworks, evaluate-an-ai-agent, newer-agent-eval-sets]
subjects: [verl, skyrl, agent-lightning, openpipe-art]
criteria:
  - Primary layer
  - Agent integration
  - Training and serving
  - Reward responsibility
  - Operational prerequisites
  - Software license
rows:
  verl:
    Primary layer: "Distributed LLM RL training library; open implementation of HybridFlow"
    Agent integration: "Multi-turn tool-calling rollouts; adapt the task and rollout integration rather than assuming an existing agent is drop-in"
    Training and serving: "Pluggable engines including FSDP and Megatron-LM for training, vLLM and SGLang for rollout generation; PPO and GRPO supported"
    Reward responsibility: "Supports model-based and function-based rewards; you supply the task-specific signal and evaluation"
    Operational prerequisites: "Compatible GPU/engine environment and a matching recipe revision; PyPI 0.9.1 requires Python >=3.10,<3.13"
    Software license: "Apache-2.0"
  skyrl:
    Primary layer: "Full stack: unified skyrl training library, skyrl-agent for long-horizon agents and skyrl-gym environments"
    Agent integration: "Use the agent layer for multi-turn pipelines or implement tasks through Gymnasium-style environments; Harbor integration documented"
    Training and serving: "Unified skyrl combines skyrl-train and skyrl-tx; implements a Tinker API backend on hardware you control"
    Reward responsibility: "Environment/task integration remains part of the work; math, coding, search and SQL environments are listed, not a universal reward oracle"
    Operational prerequisites: "Select a matching model recipe and compute setup from development/quickstart docs; source subprojects and historical reproduction pins differ"
    Software license: "Apache-2.0"
  agent-lightning:
    Primary layer: "Harness integration plus training orchestration: Trainer, API Gateway and Rollout Controller (v1.0 architecture)"
    Agent integration: "Proxy model requests through its gateway while retaining the agent's tools, context, control flow and environment; controller runs agents locally or as Kubernetes Jobs"
    Training and serving: "Trainer uses verl and vLLM; this is not an independent alternative training engine to verl"
    Reward responsibility: "Gateway captures training data, not proof of success; supply a task-specific rollout/reward workflow and check for reward hacking"
    Operational prerequisites: "Published installation guide pins supported GPU stacks: verl 0.7.1 or 0.8.0 with CUDA 12.9 or 13.0; W&B logging is on by default"
    Software license: "MIT"
  openpipe-art:
    Primary layer: "Python agent-training framework with a trajectory/reward client and a separate training backend"
    Agent integration: "OpenAI-compatible client; record agent messages in trajectories, assign rewards and submit grouped trajectories for GRPO"
    Training and serving: "README describes a GPU server, LoRA updates and vLLM; separately advertises W&B Training via ServerlessBackend"
    Reward responsibility: "Your rollout assigns a reward; optional RULER provides automatic reward generation, not a substitute for independent held-out evaluation"
    Operational prerequisites: "PyPI openpipe-art 0.5.24 requires Python >=3.12; choose your own GPU backend or a separately provisioned managed service"
    Software license: "Apache-2.0"
verdict: "Start with verl when the training engine is your main customization point; SkyRL when you want its training/agent/environment layers together; Agent Lightning when preserving an existing harness is the constraint; ART when you want a trajectory-and-reward Python integration with a separate backend. Agent Lightning uses verl, and ART's managed service is not the same deployment as its self-hosted server."
sources:
  - title: verl README (pinned source)
    url: https://github.com/verl-project/verl/blob/b17218ba58a6fbcdfb0de32772e3c2a79f88529d/README.md
    accessed: 2026-11-08
  - title: verl license (pinned source)
    url: https://github.com/verl-project/verl/blob/b17218ba58a6fbcdfb0de32772e3c2a79f88529d/LICENSE
    accessed: 2026-11-08
  - title: verl 0.9.1 on PyPI
    url: https://pypi.org/project/verl/0.9.1/
    accessed: 2026-11-08
  - title: SkyRL README (pinned source)
    url: https://github.com/NovaSky-AI/SkyRL/blob/d87004689e3a57e4041991a3c4cf71bed333a44d/README.md
    accessed: 2026-11-08
  - title: SkyRL license (pinned source)
    url: https://github.com/NovaSky-AI/SkyRL/blob/d87004689e3a57e4041991a3c4cf71bed333a44d/LICENSE
    accessed: 2026-11-08
  - title: Agent Lightning README (pinned v1.0 architecture)
    url: https://github.com/microsoft/agent-lightning/blob/bc3a9e80417d731744040df5d37117f9cc48005f/README.md
    accessed: 2026-11-08
  - title: Agent Lightning license (pinned source)
    url: https://github.com/microsoft/agent-lightning/blob/bc3a9e80417d731744040df5d37117f9cc48005f/LICENSE
    accessed: 2026-11-08
  - title: Agent Lightning installation and pinned GPU stack
    url: https://microsoft.github.io/agent-lightning/stable/00-installation/
    accessed: 2026-11-08
  - title: ART README (pinned source)
    url: https://github.com/OpenPipe/ART/blob/023fbb2007fea23575907a07bc0d7b0b44c30937/README.md
    accessed: 2026-11-08
  - title: ART license (pinned source)
    url: https://github.com/OpenPipe/ART/blob/023fbb2007fea23575907a07bc0d7b0b44c30937/LICENSE
    accessed: 2026-11-08
  - title: openpipe-art 0.5.24 on PyPI
    url: https://pypi.org/project/openpipe-art/0.5.24/
    accessed: 2026-11-08
last_verified: 2026-11-08
published: 2026-11-08
updated: 2026-11-08
---

## Choose the missing layer, not a leaderboard winner

An agent RL pipeline needs somewhere to run the agent, a way to capture model interactions, a reward, an optimizer and a way to serve the updated policy. These projects package those responsibilities differently. That is the useful comparison—not which repository advertises the largest score improvement.

The table describes documented capabilities and integration work. The recommendations below are engineering judgments based on those boundaries, not results from a common training run. For environment construction rather than policy training, see [Agent environment frameworks](comparison:agent-environment-frameworks). For evaluation design, start with [Evaluate an AI agent](guide:evaluate-an-ai-agent).

Before choosing, write down four prerequisites: a model whose weights you can train under its own license, a repeatable task/environment, a reward you can audit and access to a supported training backend. The software licenses below do not grant rights to every model or dataset used in an example. A Python client that runs on a laptop does not mean its training backend runs without GPU compute.

## verl: choose the engine when you want to control the training system

[verl](entry:verl) is the closest of these choices to the training-infrastructure layer. Its pinned README documents distributed training backends, generation engines, PPO/GRPO, function- and model-based rewards, and multi-turn tool calling. That breadth is valuable if your team needs to change how optimization and rollout generation fit together rather than only add learning to an application.

The corresponding responsibility is integration: choose a compatible engine stack, connect the task/reward and use a matching recipe. “Supports agentic rollouts” is not a promise that an arbitrary coding harness can be pointed at it without adaptation.

**Version trap:** the checked PyPI release is **0.9.1**, with Python **>=3.10,<3.13**. The current README's recipe section also documents per-recipe `REQUIRED_VERL.txt` compatibility instructions. A release number from PyPI is not enough to establish that a recipe from today's source will run against it. Treat the framework revision, recipe revision and engine dependencies as one reproducibility record.

## SkyRL: choose a stack with explicit agent and environment layers

[SkyRL](entry:skyrl) separates its unified `skyrl` library from `skyrl-agent` and `skyrl-gym`. Its README says the unified library combines the earlier `skyrl-train` and `skyrl-tx` work. The agent layer targets long-horizon multi-turn work, while the Gymnasium-style environment library lists math, coding, search and SQL tasks. Harbor integration is documented as well.

That makes SkyRL worth examining when the environment/agent interface is as important as the optimizer. It is not an excuse to skip environment resets, termination rules or reward design: those still need to represent your task.

**Backend trap:** implementing the **Tinker API on your own hardware** is an interface/backend capability. It is not evidence that you receive a hosted training account, free accelerator capacity or identical service behavior. Decide separately who operates the hardware.

For reproducibility, the README explicitly gives a historical commit for reproducing SkyRL-v0 results. Do not combine that instruction, a newer unified-library quickstart and an unrelated model recipe into one supposedly tested installation. This comparison uses a pinned README snapshot, not a claim that all those paths are interchangeable.

## Agent Lightning: preserve the harness, but still provision a trainer

[Agent Lightning](entry:agent-lightning) v1.0 has three documented pieces: a **Trainer** using verl and vLLM, an **API Gateway** that proxies model requests and captures training data, and a **Rollout Controller** that launches agents locally or as Kubernetes Jobs. Its advertised advantage is keeping the real agent harness—tools, context, control flow and environment—in the loop.

Choose it when replacing the harness would invalidate what you want to train. But distinguish “unchanged agent code” from “no integration work”: you still have to route model requests, run the agent in the chosen environment, obtain rewards and configure the training stack. Capturing a trajectory does not decide whether a patch is correct.

**Compatibility trap:** Agent Lightning is partly a consumer of verl, not simply its competitor. The checked installation guide supports **verl 0.7.1 or 0.8.0**, with CUDA **12.9 or 13.0**, and recommends the 0.8.0/cu130 setup. Do not replace that pin with verl 0.9.1 merely because it is the standalone PyPI release checked above. This is the installation guide's supported setup, not a statement about every possible custom deployment.

**Data-handling trap:** the same guide says tasks upload logs and trajectories to W&B by default. Review that before using private code, prompts or tool output. This comparison did not authenticate to W&B or test an alternative logging configuration. Kubernetes rollout support also does not, by itself, establish a complete security boundary for tool execution.

## ART: integrate trajectories and rewards, then choose the backend

[OpenPipe ART](entry:openpipe-art) puts an OpenAI-compatible client between your Python application and a separate training server. The pinned README describes recording messages into trajectories, assigning each rollout a reward, grouping trajectories for GRPO and reloading updated LoRA checkpoints into vLLM.

This is attractive when you want the application integration to revolve around **trajectories plus rewards** rather than distributed-training internals. It still requires collecting those trajectories correctly: keep task identifiers, policy/checkpoint versions, tool outcomes and reward explanations with your experiment record.

**Deployment trap:** ART's README separately promotes W&B Training through `ServerlessBackend`. That managed path is not the same operational setup as running the described GPU server yourself. Establish backend provisioning, account requirements, data handling and service terms before choosing one. This page makes no pricing or free-tier claim.

**Version trap:** PyPI **openpipe-art 0.5.24** requires Python **>=3.12**, but the README's serverless notebooks explicitly refer to a pinned main revision. A managed-service example on main does not establish that every shown API exists in that PyPI release. No executable API example is included here for that reason.

ART also advertises **RULER** for automatic reward generation. That can be useful when a task lacks a simple test, but an automatic reward remains a training signal. Keep an independent evaluation set rather than presenting the reward generator's own judgment as an external measure of success.

## A practical selection sequence

1. **Fix the experiment first.** Define an isolated task, reset behavior, allowed tools, termination conditions and held-out evaluation. Record failures and side effects as well as the scalar reward. The [newer eval sets comparison](comparison:newer-agent-eval-sets) helps distinguish data-science, terminal and multi-agent-conflict workloads; it does not certify their suitability as training data.
2. **Locate the expensive integration boundary.** If it is distributed optimization, examine verl. If it is long-horizon environments and agent pipelines together, examine SkyRL. If it is preserving an existing harness, examine Agent Lightning. If it is connecting Python rollouts to a separate trainer, examine ART.
3. **Choose backend ownership explicitly.** Self-hosted libraries require operating the selected compute stack. A documented managed backend moves operational work to a service; it does not remove service requirements or charges.
4. **Pin a coherent recipe.** Record the package/source revision, model and tokenizer revisions, optimizer and generation-engine versions, reward definition, environment image and evaluation split. For Agent Lightning, preserve its documented backend compatibility rather than upgrading verl independently.
5. **Run a small, synthetic end-to-end trial before private workloads.** Verify reset isolation, trajectory capture, checkpoint updates and held-out scoring. Keep live messaging, spending and production credentials out of training environments.

There is deliberately no “fastest,” “cheapest” or “best SWE-bench score” row. Different models, datasets, harnesses, evaluators and compute budgets do not form a controlled cross-project comparison.

## Verification and limits

Checked on **2026-11-08**: the four official READMEs and license files at the source commits linked above, PyPI metadata for verl 0.9.1 and openpipe-art 0.5.24, and Agent Lightning's published installation guide. The license files are Apache-2.0 for verl, SkyRL and ART, and MIT for Agent Lightning.

**No GPU training, stack installation, package import, managed-service signup or live rollout was performed.** Package versions are metadata checks, not tested environments. No minimum VRAM, GPU count, throughput, cost or cross-project benchmark result is claimed. Hardware sizing remains a property of the exact model, context lengths, engine and recipe you select.
