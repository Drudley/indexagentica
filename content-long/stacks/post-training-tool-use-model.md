---
id: post-training-tool-use-model
type: stack
title: "Post-training a tool-use model — TRL, PEFT, and scale-out RL"
summary: "A recommended post-training stack for chat and tool-use models: TRL and PEFT for SFT, LoRA/QLoRA, DPO and GRPO, with OpenRLHF and AReaL as the distributed and asynchronous RL options. Cross-links the fine-tuning frameworks and agent RL stacks comparisons."
description: "Use Hugging Face TRL (PyPI 1.17.1, Apache-2.0) and PEFT (0.21.2, Apache-2.0) as the library layer for supervised fine-tuning, LoRA/QLoRA, DPO, KTO, reward modelling and GRPO, including TRL's documented tool-calling SFT dataset format. Scale out with OpenRLHF (0.11.2, Apache-2.0; Ray, vLLM, DeepSpeed ZeRO-3, agent executors, async RL) or AReaL (GitHub latest v2.1.1; PyPI package still 1.0.4 as of 12 November 2026; fully asynchronous and agentic RL, Megatron/FSDP/Archon, vLLM/SGLang). Mentions torchtune only as deprecated. Official TRL+PEFT SFT sample included; no training run and no unbacked performance numbers."
author: Agentica Author
use_case: "Start with TRL and PEFT for supervised fine-tuning, LoRA or QLoRA, and library-level DPO or GRPO on a chat or tool-use model. Add OpenRLHF or AReaL when you need distributed or fully asynchronous agentic RL."
components:
  - role: Library trainers for SFT, DPO and GRPO
    entry: trl
    why: "Transformers Trainer wrappers. The README documents SFTTrainer, GRPOTrainer, DPOTrainer, KTOTrainer and RewardTrainer, plus a CLI (trl sft, trl dpo, trl kto). Trainers natively support Accelerate DDP, DeepSpeed ZeRO and FSDP, and accept a PEFT peft_config for LoRA/QLoRA. The SFT docs also describe a tool-calling dataset format."
  - role: LoRA and QLoRA adapters
    entry: peft
    why: "Adapter library used with Transformers and TRL. The official LoRA path is LoraConfig plus get_peft_model, or SFTTrainer(peft_config=LoraConfig()). TRL's PEFT integration docs show combining peft_config with a BitsAndBytes quantization_config for QLoRA."
  - role: Ray-based distributed RLHF
    entry: openrlhf
    why: "Scale-out RLHF option built on Ray, vLLM generation and DeepSpeed ZeRO-3, with a Hybrid Engine and Hugging Face Transformers models. Documents SingleTurnExecutor and MultiTurnExecutor, async training via --train.async_enable, and algorithms including PPO, REINFORCE++, GRPO (group_norm), RLOO, Dr. GRPO and FlashREINFORCE."
  - role: Asynchronous agentic RL
    entry: areal
    why: "Scale-out option for fully asynchronous RL, including documented agentic RL examples. The support matrix lists GRPO, GSPO, PPO, DAPO, LitePPO, Dr.GRPO, REINFORCE++, RLOO, SAPO, IcePop, KPop, M2PO, DPO, reward modelling, SFT and distillation; training backends Megatron, PyTorch FSDP and PyTorch Archon; inference backends vLLM and SGLang. Pin carefully: PyPI areal is 1.0.4; GitHub latest is v2.1.1."
tags: [fine-tuning, training, lora, reinforcement-learning, tool-calling, python]
entries: [trl, peft, openrlhf, areal]
related: [fine-tuning-frameworks, agent-reinforcement-learning-stacks]
sources:
  - title: "TRL PEFT integration"
    url: https://huggingface.co/docs/trl/peft_integration
    accessed: 2026-11-12
  - title: "huggingface/trl README"
    url: https://raw.githubusercontent.com/huggingface/trl/main/README.md
    accessed: 2026-11-12
  - title: "huggingface/trl LICENSE"
    url: https://raw.githubusercontent.com/huggingface/trl/main/LICENSE
    accessed: 2026-11-12
  - title: "TRL PyPI metadata"
    url: https://pypi.org/pypi/trl/json
    accessed: 2026-11-12
  - title: "huggingface/trl latest GitHub release"
    url: https://api.github.com/repos/huggingface/trl/releases/latest
    accessed: 2026-11-12
  - title: "TRL documentation index"
    url: https://huggingface.co/docs/trl/index
    accessed: 2026-11-12
  - title: "TRL SFT Trainer documentation"
    url: https://huggingface.co/docs/trl/sft_trainer
    accessed: 2026-11-12
  - title: "TRL dataset formats"
    url: https://huggingface.co/docs/trl/dataset_formats
    accessed: 2026-11-12
  - title: "huggingface/peft README"
    url: https://raw.githubusercontent.com/huggingface/peft/main/README.md
    accessed: 2026-11-12
  - title: "huggingface/peft LICENSE"
    url: https://raw.githubusercontent.com/huggingface/peft/main/LICENSE
    accessed: 2026-11-12
  - title: "PEFT PyPI metadata"
    url: https://pypi.org/pypi/peft/json
    accessed: 2026-11-12
  - title: "huggingface/peft latest GitHub release"
    url: https://api.github.com/repos/huggingface/peft/releases/latest
    accessed: 2026-11-12
  - title: "PEFT documentation index"
    url: https://huggingface.co/docs/peft/index
    accessed: 2026-11-12
  - title: "OpenRLHF/OpenRLHF README"
    url: https://raw.githubusercontent.com/OpenRLHF/OpenRLHF/main/README.md
    accessed: 2026-11-12
  - title: "OpenRLHF/OpenRLHF LICENSE"
    url: https://raw.githubusercontent.com/OpenRLHF/OpenRLHF/main/LICENSE
    accessed: 2026-11-12
  - title: "OpenRLHF PyPI metadata"
    url: https://pypi.org/pypi/openrlhf/json
    accessed: 2026-11-12
  - title: "OpenRLHF/OpenRLHF latest GitHub release"
    url: https://api.github.com/repos/OpenRLHF/OpenRLHF/releases/latest
    accessed: 2026-11-12
  - title: "OpenRLHF documentation"
    url: https://openrlhf.readthedocs.io/en/latest/
    accessed: 2026-11-12
  - title: "areal-project/AReaL README"
    url: https://raw.githubusercontent.com/areal-project/AReaL/main/README.md
    accessed: 2026-11-12
  - title: "areal-project/AReaL LICENSE"
    url: https://raw.githubusercontent.com/areal-project/AReaL/main/LICENSE
    accessed: 2026-11-12
  - title: "AReaL PyPI metadata"
    url: https://pypi.org/pypi/areal/json
    accessed: 2026-11-12
  - title: "areal-project/AReaL latest GitHub release"
    url: https://api.github.com/repos/areal-project/AReaL/releases/latest
    accessed: 2026-11-12
  - title: "AReaL documentation, Introduction"
    url: https://areal-ai.io/docs/en/intro.html
    accessed: 2026-11-12
  - title: "AReaL documentation, Agentic RL"
    url: https://areal-ai.io/docs/en/tutorial/agentic_rl.html
    accessed: 2026-11-12
  - title: "AReaL documentation, Asynchronous RL"
    url: https://areal-ai.io/docs/en/algorithms/async.html
    accessed: 2026-11-12
  - title: "meta-pytorch/torchtune README"
    url: https://raw.githubusercontent.com/meta-pytorch/torchtune/main/README.md
    accessed: 2026-11-12
  - title: "The future of torchtune (GitHub issue #2883)"
    url: https://github.com/meta-pytorch/torchtune/issues/2883
    accessed: 2026-11-12
  - title: "torchtune PyPI metadata"
    url: https://pypi.org/pypi/torchtune/json
    accessed: 2026-11-12
last_verified: 2026-11-12
published: 2026-11-12
updated: 2026-11-12
---
## Start at the library layer, then scale out

When you need to post-train a chat or tool-use model, start with [TRL](entry:trl) and [PEFT](entry:peft). TRL's trainers are documented as light wrappers around the Hugging Face Transformers Trainer. The project README lists [`SFTTrainer`](https://huggingface.co/docs/trl/sft_trainer), [`GRPOTrainer`](https://huggingface.co/docs/trl/grpo_trainer), [`DPOTrainer`](https://huggingface.co/docs/trl/dpo_trainer), [`KTOTrainer`](https://huggingface.co/docs/trl/kto_trainer) and [`RewardTrainer`](https://huggingface.co/docs/trl/reward_trainer), plus a CLI (`trl sft`, `trl dpo`, `trl kto`). The trainers natively support distributed training with Accelerate DDP, DeepSpeed ZeRO and FSDP, and the README states full integration with PEFT for quantization and LoRA/QLoRA. That TRL+PEFT combination is the recommended core of this stack.

YAML- and UI-oriented SFT/LoRA frameworks ([Axolotl](entry:axolotl), [LLaMA-Factory](entry:llama-factory), [Unsloth](entry:unsloth)) are compared separately in [Fine-tuning frameworks compared](comparison:fine-tuning-frameworks). Distributed agent RL engines such as [verl](entry:verl) and [SkyRL](entry:skyrl) are compared in [Agent RL stacks compared](comparison:agent-reinforcement-learning-stacks). Use those pages to choose a framework family. Use this stack when you want the Hugging Face trainer layer first, then a documented path to scale-out or asynchronous agentic RL.

[OpenRLHF](entry:openrlhf) and [AReaL](entry:areal) are the scale-out options in this stack. They are alternatives, not a requirement to run both at once.

## What each project documents

**TRL** (PyPI and GitHub latest **1.17.1**, Apache-2.0, Python >=3.11; docs at [huggingface.co/docs/trl/index](https://huggingface.co/docs/trl/index)) is the trainer library. Besides the trainers above, the [SFT trainer documentation](https://huggingface.co/docs/trl/sft_trainer) has a section on training adapters with PEFT (`peft_config=LoraConfig()`) and notes that you can pass an already-loaded `PeftModel` without `peft_config`. The [PEFT integration page](https://huggingface.co/docs/trl/peft_integration) documents QLoRA by combining `peft_config` with `quantization_config` (`BitsAndBytesConfig`). A separate "Tool Calling with SFT" section, together with the [dataset formats](https://huggingface.co/docs/trl/dataset_formats) page, specifies that each example should include conversation messages (with `tool_calls` and `tool` role messages) and a `tools` column of JSON schemas. The README also mentions optional Unsloth kernels; if you want Unsloth as a user-facing fine-tuning product, use the frameworks comparison rather than this stack.

**PEFT** (PyPI and GitHub latest **0.21.2**, Apache-2.0, Python >=3.10; docs at [huggingface.co/docs/peft/index](https://huggingface.co/docs/peft/index)) is the adapter library. The README quickstart wraps a causal LM with `LoraConfig` (`r`, `lora_alpha`, `task_type=TaskType.CAUSAL_LM`) and `get_peft_model`. In this stack you typically let TRL apply that config through `SFTTrainer` rather than wrapping the model yourself, unless you are continuing an existing `PeftModel`.

**OpenRLHF** (PyPI and GitHub latest **0.11.2**, Apache-2.0 in the repository `LICENSE`, Python >=3.10; docs at [openrlhf.readthedocs.io/en/latest/](https://openrlhf.readthedocs.io/en/latest/)) is the Ray-based scale-out RLHF option. The README describes a Ray scheduler that can place Actor, Reward, Reference and Critic models on separate GPUs, a Hybrid Engine, generation with vLLM, and training with DeepSpeed ZeRO-3, deepcompile, AutoTP and RingAttention, on Hugging Face Transformers models. Agent execution uses `AgentExecutorBase` with `SingleTurnExecutor` and `MultiTurnExecutor`; the README says algorithms are decoupled from execution mode. Async RLHF is documented via `--train.async_enable`, and custom or multi-turn agents via `--train.agent_func_path`. The algorithm table lists **PPO** (default), **REINFORCE++** (`reinforce`), **RLOO** (`rloo`), **GRPO** (`group_norm`), **Dr. GRPO** (`dr_grpo`) and **FlashREINFORCE** (`flash_reinforce`); the surrounding text also names **REINFORCE++-baseline**. The project additionally documents SFT, DPO/IPO/cDPO and reward-model scripts. Project wording such as "the first RLHF framework" and claims about generation-time share or model scale are vendor statements and are not used as facts here.

**AReaL** is the asynchronous / agentic RL option. The project README presents it as a large-scale asynchronous reinforcement learning system, "built on a fully asynchronous RL training paradigm," with a documented [agentic RL](https://areal-ai.io/docs/en/tutorial/agentic_rl.html) tutorial and an [asynchronous RL](https://areal-ai.io/docs/en/algorithms/async.html) guide. The README says all listed RL algorithms support asynchronous and synchronous versions by setting `max_head_offpolicyness=0`. The **support matrix** (checked on the `main` README on 12 November 2026) lists algorithms **GRPO, GSPO, PPO, DAPO, LitePPO, Dr.GRPO, REINFORCE++, RLOO, SAPO, IcePop, KPop, M2PO, DPO**, plus reward modelling, SFT and distillation; training backends **Megatron**, **PyTorch FSDP** and **PyTorch Archon**; and inference backends **vLLM** and **SGLang**. Documented agentic examples include a general agent workflow, tool-integrated reasoning, a search agent, coding-agent RL, and integrations with agent frameworks. Official docs live at [areal-ai.io/docs/en/intro.html](https://areal-ai.io/docs/en/intro.html). Do not use the older `areal-project.github.io` documentation URLs, which redirect, or treat the stale documentation URL still listed on PyPI as the current docs location.

Pin AReaL carefully: the latest **GitHub release** on 12 November 2026 is **v2.1.1** (published 4 November 2026). The latest **PyPI** package `areal` is still **1.0.4** (uploaded 10 June 2026, Apache-2.0, Python >=3.11,<3.13). That wheel predates the README's AReaL 2.0 notes (1 July 2026) and there is no 2.x series on PyPI. Install from the project's current docs, not from an assumption that `pip install areal` matches `main`.

## A minimal SFT + LoRA example

This sample is copied from the official [SFT trainer](https://huggingface.co/docs/trl/sft_trainer) section "Train adapters with PEFT." It is the documented way to combine TRL and PEFT for LoRA SFT:

```python
from datasets import load_dataset
from trl import SFTTrainer
from peft import LoraConfig

dataset = load_dataset("trl-lib/Capybara", split="train")

trainer = SFTTrainer(
    "Qwen/Qwen3-0.6B",
    train_dataset=dataset,
    peft_config=LoraConfig(),
)

trainer.train()
```

The same page documents passing a trainable `PeftModel` instead of `peft_config` when you continue an existing adapter. For QLoRA, the [PEFT integration page](https://huggingface.co/docs/trl/peft_integration) shows combining `peft_config` with `quantization_config`. For tool-use SFT, keep this trainer wiring and follow the tool-calling dataset format on the [dataset formats](https://huggingface.co/docs/trl/dataset_formats) page rather than inventing a schema. The CLI equivalent for plain SFT (without the PEFT argument shown above) is documented in the TRL README as `trl sft`.

## When to add OpenRLHF or AReaL

Stay on TRL+PEFT while you are doing single-process or Accelerate-managed SFT, LoRA, DPO or GRPO and the official trainers cover the method. Move to **OpenRLHF** when you want that library's Ray + vLLM + DeepSpeed layout, its single-turn or multi-turn agent executors, or its async flag. Move to **AReaL** when you want the project's fully asynchronous training loop and the agentic RL examples and backends in its support matrix (including Megatron or SGLang, which OpenRLHF's README does not present as first-class in the same way). For other agent RL engines, start from [Agent RL stacks compared](comparison:agent-reinforcement-learning-stacks) instead of forcing them into this stack.

## Deprecated: do not start with torchtune

[torchtune](entry:torchtune) is listed here only so it is not mistaken for a current recommendation. Its README states that it is no longer actively maintained and that development wound down in 2025, pointing at GitHub issue [#2883](https://github.com/meta-pytorch/torchtune/issues/2883) ("The future of torchtune"), which was still open on 12 November 2026. PyPI remains at **0.6.1** (BSD-3-Clause, uploaded 7 April 2025). The repository is not archived. Do not start a new post-training stack with it.

## Licences and versions (12 November 2026)

Checked on PyPI, GitHub latest releases, and each repository's licence file:

| Package | Licence file | PyPI / GitHub latest | Requires Python |
|---|---|---|---|
| trl | Apache License 2.0 (`LICENSE`) | 1.17.1 / v1.17.1 | >=3.11 |
| peft | Apache License 2.0 (`LICENSE`) | 0.21.2 / v0.21.2 | >=3.10 |
| openrlhf | Apache License 2.0 (`LICENSE`) | 0.11.2 / v0.11.2 | >=3.10 |
| areal | Apache License 2.0 (`LICENSE`) | PyPI 1.0.4; GitHub latest v2.1.1 | PyPI 1.0.4: >=3.11,<3.13 |

OpenRLHF's PyPI metadata does not set a licence field; the Apache-2.0 text is from the repo `LICENSE`. Model weights, GPUs, and any hosted inference remain separate from these software licences.

## What we ran, and what we did not

We did **not** install TRL, PEFT, PyTorch, OpenRLHF or AReaL, and we did not run the official SFT+LoRA sample. That sample loads `Qwen/Qwen3-0.6B` and the `trl-lib/Capybara` training split; a useful CPU-only smoke test was not feasible here because PyTorch was not already present, installing it is a large download, and the documented example is not a tiny CPU model. No fine-tune was run, and no speed, memory or accuracy figure from project READMEs or blogs was reproduced.
