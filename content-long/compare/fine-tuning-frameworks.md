---
id: fine-tuning-frameworks
type: comparison
title: "Fine-tuning frameworks compared — Axolotl, LLaMA-Factory and Unsloth"
summary: "Compare Axolotl, LLaMA-Factory and Unsloth as SFT, LoRA/QLoRA and preference-tuning frameworks for tool-use models: documented methods, config style, chat/tool datasets, hardware backends, licences and current versions. Cross-links the agent RL stacks comparison."
description: "A source-checked comparison of Axolotl, LLaMA-Factory and Unsloth for post-training tool-use and chat models. Covers documented methods (SFT, LoRA/QLoRA, DPO/ORPO/KTO, GRPO only where each project lists it), YAML/CLI/Python/UI config style, multi-turn chat-template and tool-calling dataset support, hardware backends, licences (including Unsloth's Apache-2.0/AGPL-3.0 split) and PyPI versions checked 2026-11-11. Positioned against the agent reinforcement-learning stacks comparison rather than as a substitute. No training run; vendor speed and VRAM figures are not treated as independent measurements."
author: Agentica Author
tags: [fine-tuning, training, lora, tool-calling, python]
entries: [axolotl, llama-factory, unsloth]
related: [agent-reinforcement-learning-stacks]
subjects: [axolotl, llama-factory, unsloth]
criteria:
  - Config style
  - Documented methods
  - Tool-calling and chat data
  - Hardware and backends
  - License and versions
rows:
  axolotl:
    Config style: "YAML configs reused across preprocess, train, eval, quantization and inference, driven by the axolotl CLI (train, fetch, agent-docs, config-schema). Docker images and a PyPI package are documented."
    Documented methods: "Full fine-tuning, LoRA, QLoRA, GPTQ, QAT (int8/int4/FP8/NVFP4/MXFP4), preference tuning (DPO, IPO, KTO, ORPO), RL (GRPO, GDPO), and reward / process reward modelling. The agent-docs CLI also lists SimPO under preference tuning."
    Tool-calling and chat data: "Conversation datasets via chat_template: ShareGPT or OpenAI-style messages, tokenizer or custom Jinja templates, multi-turn versus single-turn instruct. Tool use is documented with a tools column and assistant tool_calls / tool roles (JSON Schema tools)."
    Hardware and backends: "README: NVIDIA GPU (Ampere or newer for bf16 and Flash Attention) or AMD GPU; Python >=3.12; PyTorch >=2.13.0. Multi-GPU via FSDP2 and DeepSpeed; multi-node via Torchrun or Ray. Docker is documented."
    License and versions: "Apache-2.0 (LICENSE); PyPI axolotl 0.21.1 and GitHub release v0.21.1; Python >=3.12 (checked 2026-11-11)"
  llama-factory:
    Config style: "Zero-code CLI (llamafactory-cli train, chat, export) with YAML examples, plus the LLaMA Board Gradio web UI (llamafactory-cli webui). Custom datasets are registered in data/dataset_info.json."
    Documented methods: "README table: pre-training, SFT, reward modeling, PPO, DPO, KTO, ORPO and SimPO, each with full, freeze, LoRA, QLoRA, OFT and QOFT. GRPO is not in that table; the changelog points to a separate EasyR1 project for GRPO."
    Tool-calling and chat data: "Alpaca and ShareGPT formats (OpenAI messages are documented as a ShareGPT special case). ShareGPT documents human/gpt/observation/function_call roles and an optional tools column; Glaive Function Calling and AgentInstruct are listed SFT datasets."
    Hardware and backends: "Python >=3.11. Optional CUDA (min 11.6, recommend 12.2), DeepSpeed, bitsandbytes, vLLM and FlashAttention. Docker paths for CUDA, AMD ROCm and Ascend NPU. The README includes an estimated VRAM table, marked as estimated."
    License and versions: "Apache-2.0 (LICENSE); PyPI llamafactory 0.9.5 and GitHub release v0.9.5; Python >=3.11 (checked 2026-11-11). Model-weight licences are separate, as the README states."
  unsloth:
    Config style: "Three documented surfaces: the Unsloth Desktop app, Unsloth Studio web UI (unsloth studio), and Unsloth Core (Python: uv pip install unsloth --torch-backend=auto; FastLanguageModel)."
    Documented methods: "README and docs list LoRA, QLoRA, full fine-tuning, pretraining, FP8, and RL including GRPO (GSPO via GRPOConfig). A preference page documents DPO, ORPO and KTO, and also mentions PPO and a SimPO notebook."
    Tool-calling and chat data: "The datasets guide covers raw corpus (CPT), instruct (SFT) and multi-turn conversation (SFT) in ShareGPT or ChatML/OpenAI messages, with standardize_sharegpt. Tool calling is documented mainly as a runtime/API loop, not as a dedicated training schema."
    Hardware and backends: "README: Windows, Linux, WSL and macOS; NVIDIA, AMD and Intel GPUs, CPUs and Vulkan. Multi-GPU is described via Accelerate/DeepSpeed (FSDP, DDP), with a note that official multi-GPU support is still being announced. AMD image: unsloth/unsloth-rocm."
    License and versions: "Dual licence: core Apache-2.0 (LICENSE; PyPI license_expression Apache-2.0); optional Studio UI AGPL-3.0 (studio/LICENSE.AGPL-3.0). PyPI unsloth 2026.11.3; Python >=3.9,<3.15 (checked 2026-11-11)."
verdict: "Choose by workflow, not by unverified speed claims. Use Axolotl when you want a YAML/CLI pipeline that documents SFT, (Q)LoRA, preference tuning and GRPO in one project. Use LLaMA-Factory when you want a zero-code CLI or Gradio UI and an explicit ShareGPT tool-call dataset schema; treat EasyR1 as a separate GRPO project. Use Unsloth for a Python, Desktop or Studio workflow with documented LoRA/QLoRA and GRPO/DPO—and read the Apache-2.0/AGPL-3.0 split if you ship Studio UI. For multi-turn agent RL infrastructure, see the agent RL stacks comparison; these three are post-training frameworks."
sources:
  - title: "Axolotl README (raw)"
    url: https://raw.githubusercontent.com/axolotl-ai-cloud/axolotl/main/README.md
    accessed: 2026-11-11
  - title: "Axolotl LICENSE (raw)"
    url: https://raw.githubusercontent.com/axolotl-ai-cloud/axolotl/main/LICENSE
    accessed: 2026-11-11
  - title: "axolotl 0.21.1 on PyPI"
    url: https://pypi.org/project/axolotl/0.21.1/
    accessed: 2026-11-11
  - title: "Axolotl conversation dataset formats"
    url: https://docs.axolotl.ai/docs/dataset-formats/conversation.html
    accessed: 2026-11-11
  - title: "Axolotl dataset formats index"
    url: https://docs.axolotl.ai/docs/dataset-formats/
    accessed: 2026-11-11
  - title: "Axolotl multi-GPU training"
    url: https://docs.axolotl.ai/docs/multi-gpu.html
    accessed: 2026-11-11
  - title: "LLaMA-Factory README (raw)"
    url: https://raw.githubusercontent.com/hiyouga/LlamaFactory/main/README.md
    accessed: 2026-11-11
  - title: "LLaMA-Factory LICENSE (raw)"
    url: https://raw.githubusercontent.com/hiyouga/LlamaFactory/main/LICENSE
    accessed: 2026-11-11
  - title: "LLaMA-Factory data README (raw)"
    url: https://raw.githubusercontent.com/hiyouga/LlamaFactory/main/data/README.md
    accessed: 2026-11-11
  - title: "llamafactory 0.9.5 on PyPI"
    url: https://pypi.org/project/llamafactory/0.9.5/
    accessed: 2026-11-11
  - title: "Unsloth README (raw)"
    url: https://raw.githubusercontent.com/unslothai/unsloth/main/README.md
    accessed: 2026-11-11
  - title: "Unsloth LICENSE (raw, Apache-2.0)"
    url: https://raw.githubusercontent.com/unslothai/unsloth/main/LICENSE
    accessed: 2026-11-11
  - title: "Unsloth Studio LICENSE.AGPL-3.0 (raw)"
    url: https://raw.githubusercontent.com/unslothai/unsloth/main/studio/LICENSE.AGPL-3.0
    accessed: 2026-11-11
  - title: "unsloth 2026.11.3 on PyPI"
    url: https://pypi.org/project/unsloth/2026.11.3/
    accessed: 2026-11-11
  - title: "Unsloth datasets guide (Markdown)"
    url: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/datasets-guide.md
    accessed: 2026-11-11
  - title: "Unsloth fine-tuning LLMs guide (Markdown)"
    url: https://unsloth.ai/docs/get-started/fine-tuning-llms-guide.md
    accessed: 2026-11-11
  - title: "Unsloth chat templates (Markdown)"
    url: https://unsloth.ai/docs/basics/chat-templates.md
    accessed: 2026-11-11
  - title: "Unsloth tool calling guide (Markdown)"
    url: https://unsloth.ai/docs/basics/tool-calling-guide-for-local-llms.md
    accessed: 2026-11-11
  - title: "Unsloth RL guide (Markdown)"
    url: https://unsloth.ai/docs/get-started/reinforcement-learning-rl-guide.md
    accessed: 2026-11-11
  - title: "Unsloth preference training — DPO, ORPO and KTO (Markdown)"
    url: https://unsloth.ai/docs/get-started/reinforcement-learning-rl-guide/preference-dpo-orpo-and-kto.md
    accessed: 2026-11-11
  - title: "Unsloth multi-GPU fine-tuning (Markdown)"
    url: https://unsloth.ai/docs/basics/multi-gpu-training-with-unsloth.md
    accessed: 2026-11-11
  - title: "axolotl-ai-cloud/axolotl latest GitHub release"
    url: https://api.github.com/repos/axolotl-ai-cloud/axolotl/releases/latest
    accessed: 2026-11-11
  - title: "hiyouga/LlamaFactory latest GitHub release"
    url: https://api.github.com/repos/hiyouga/LlamaFactory/releases/latest
    accessed: 2026-11-11
  - title: "unslothai/unsloth latest GitHub release"
    url: https://api.github.com/repos/unslothai/unsloth/releases/latest
    accessed: 2026-11-11
last_verified: 2026-11-11
published: 2026-11-11
updated: 2026-11-11
---
## SFT and LoRA trainers, not agent RL stacks

[Agent RL stacks compared](comparison:agent-reinforcement-learning-stacks) covers distributed training engines and harness gateways — [verl](entry:verl), [SkyRL](entry:skyrl), [Agent Lightning](entry:agent-lightning) and [OpenPipe ART](entry:openpipe-art) — whose job is multi-turn agent reinforcement learning. This page is one layer down the training stack: **post-training frameworks** you use to run supervised fine-tuning, LoRA/QLoRA and preference optimization on chat and tool-use models.

The three directory entries are [Axolotl](entry:axolotl), [LLaMA-Factory](entry:llama-factory) and [Unsloth](entry:unsloth). They overlap on (Q)LoRA and chat data, and some also document GRPO or PPO, but they are not drop-in substitutes for those RL stacks. LLaMA-Factory’s README also lists Unsloth among optional training “tricks,” so the libraries can compose.

The comparison table is generated from the front matter. README and docs include vendor speed or VRAM figures (for example Unsloth’s “2× faster / 70% less VRAM” wording, or LLaMA-Factory’s starred estimated memory table). Those numbers are not independently verified here and are not used as selection criteria.

## How you configure them

**Axolotl** is YAML-first. The README says a single configuration file can be reused across dataset preprocessing, training, evaluation, quantization and inference. The CLI entry points include `axolotl train` (for example `axolotl train examples/llama-3/lora-1b.yml`), `axolotl fetch` for example configs, `axolotl agent-docs` for bundled method references, and `axolotl config-schema`. Installation is documented via `uv pip install axolotl[deepspeed]` after a pinned PyTorch, or with the `axolotlai/axolotl` Docker image.

**LLaMA-Factory** advertises “zero-code” CLI and a Gradio **LLaMA Board** UI. The documented commands are `llamafactory-cli train`, `chat` and `export` on YAML files under `examples/`, plus `llamafactory-cli webui`. Custom datasets are registered in `data/dataset_info.json`; the data README is the format specification.

**Unsloth** documents three surfaces: a native **Desktop** app (platform installers), **Studio** (`unsloth studio`, also install.sh / Homebrew / Docker `unsloth/unsloth`), and **Core**, the Python package installed with `uv pip install unsloth --torch-backend=auto` and used through `FastLanguageModel`. Training examples in the docs are Python (and Colab notebooks), not a project-wide YAML schema like Axolotl.

## Documented methods — only what each project lists

Do not assume every popular acronym is available in all three.

- **Axolotl’s README** lists full fine-tuning, LoRA, QLoRA, GPTQ, QAT (int8/int4/FP8/NVFP4/MXFP4), preference tuning (**DPO, IPO, KTO, ORPO**), RL (**GRPO, GDPO**), and reward / process reward modelling. The bundled `axolotl agent-docs preference_tuning` help also names **SimPO**.
- **LLaMA-Factory’s “Supported Training Approaches” table** lists pre-training, supervised fine-tuning, reward modeling, **PPO, DPO, KTO, ORPO and SimPO**, each available with full, freeze, LoRA, QLoRA, OFT and QOFT. **GRPO is not in that table.** The changelog announces **EasyR1** as a separate “efficient, scalable and multi-modality RL training framework for efficient GRPO training.” Treat EasyR1 as a sibling project, not as a LLaMA-Factory table row.
- **Unsloth’s README** lists reinforcement learning, LoRA, QLoRA, full fine-tuning, pretraining, RL, **GRPO, DPO** and FP8. The fine-tuning guide describes LoRA versus QLoRA versus full fine-tuning. The RL guide documents **GRPO** (including `loss_type` values `gspo`, `grpo` and `dr_grpo` in `GRPOConfig`). A preference page states that **DPO, ORPO, PPO, KTO** “all work with Unsloth” and links Colab notebooks for GRPO, ORPO, DPO, KTO and SimPO.

## Tool-calling and multi-turn chat data

If you are fine-tuning a **tool-use** model, the dataset schema matters as much as the trainer.

- **Axolotl** conversation docs use a `chat_template` dataset type. Older ShareGPT `conversations` / `from` / `value` records can be mapped onto it; newer data typically uses OpenAI-style `messages` with `role` / `content`. Templates may come from the tokenizer, a named template, or a custom Jinja file. A dedicated **“Using tool use”** section documents a top-level `tools` array (JSON Schema function definitions) and assistant `tool_calls` plus `role: tool` turns. The docs warn you to check that the chosen chat template actually supports tools.
- **LLaMA-Factory** supports **alpaca** and **sharegpt** formats (`data/README.md`). Alpaca can carry a multi-turn `history` list. ShareGPT allows extra roles: the defaults include `observation` for tool results and `function_call` for calls, plus an optional `tools` column. OpenAI-style `messages` are documented as a special case of ShareGPT. The README’s SFT dataset list includes **Glaive Function Calling V2** and **AgentInstruct**. Features also name “multi-turn dialogue” and “tool using” as tasks.
- **Unsloth’s datasets guide** documents raw corpus (continued pretraining), instruct (SFT) and **multi-turn conversation** (SFT), with ShareGPT (`from`/`value`) and ChatML/OpenAI (`role`/`content`) examples and a `standardize_sharegpt` helper. The chat-templates page covers Conversational, ChatML, ShareGPT and Alpaca-style formatting in Python. **Tool calling is documented mainly as a runtime capability** (a local-LLM tool-calling guide with OpenAI-style `tool_calls` loops). The fine-tuning guide mentions tool-calling as a behavior you might train with RL and a reward function. This comparison does not treat that as the same kind of first-class SFT tool schema Axolotl and LLaMA-Factory publish.

## Hardware and backends

- **Axolotl** requires a NVIDIA GPU (Ampere or newer for bf16 and Flash Attention) or an AMD GPU, Python **>=3.12**, and PyTorch **≥2.13.0**. Multi-GPU is documented with FSDP2 and DeepSpeed; multi-node with Torchrun or Ray.
- **LLaMA-Factory** requires Python **>=3.11**. Optional packages include CUDA (minimum 11.6, recommended 12.2), DeepSpeed, bitsandbytes, vLLM and FlashAttention. The README documents Docker flows for CUDA, **AMD ROCm** and **Ascend NPU**, plus a Megatron-core backend via `mcore_adapter`. Its hardware table is explicitly marked *estimated*.
- **Unsloth** states that it works on Windows, Linux, WSL and macOS, and that it supports multi-GPU setups, NVIDIA, AMD and Intel GPUs, CPUs and the Vulkan backend. Core install uses `--torch-backend=auto`. An AMD Docker image `unsloth/unsloth-rocm` is documented. The multi-GPU page says Unsloth can already use Accelerate and DeepSpeed, including **FSDP** and **DDP** (`accelerate launch` / `torchrun`), but also that official multi-GPU support is still being announced and the setup is currently manual.

## Licences and versions (11 November 2026)

Checked on PyPI, GitHub latest releases, and each repository’s licence file(s):

| Package | Licence file | PyPI / GitHub | Requires Python |
|---|---|---|---|
| axolotl | Apache License 2.0 (`LICENSE`) | 0.21.1 / v0.21.1 | >=3.12 |
| llamafactory | Apache License 2.0 (`LICENSE`) | 0.9.5 / v0.9.5 | >=3.11 |
| unsloth | Apache License 2.0 (`LICENSE`) for the core package; AGPL-3.0 (`studio/LICENSE.AGPL-3.0`) for optional Studio UI | PyPI 2026.11.3 (GitHub latest release tag v0.1.916-beta, same calendar day) | >=3.9,<3.15 |

Axolotl’s PyPI metadata does not set a licence classifier; the Apache-2.0 text is from the repo `LICENSE`. Unsloth’s PyPI `license_expression` is Apache-2.0, which matches the core package, not the Studio UI. The Unsloth README states this dual-licensing model explicitly. Model weights, GPUs and any hosted extras remain separate from these software licences.

When linking the LLaMA-Factory repository, use [hiyouga/LlamaFactory](https://github.com/hiyouga/LlamaFactory), the canonical path. The hyphenated `hiyouga/LLaMA-Factory` path redirects to it, so don't use that in published links.

## What we ran, and what we did not

We did **not** install these packages or run CLI help against a live install. A useful smoke test (`axolotl config-schema`, `llamafactory-cli help`, or importing `FastLanguageModel`) would pull **PyTorch** and related CUDA/ROCm wheels, which is a large download and is not GPU-free in practice. No fine-tune was run, and no speed, memory or accuracy figure from project blogs or notebooks was reproduced.

## A safe selection sequence

1. **Name the layer.** If you need a multi-turn agent RL *stack* (rollouts, rewards, a training backend), start from [Agent RL stacks compared](comparison:agent-reinforcement-learning-stacks). If you need SFT, (Q)LoRA or preference tuning of a chat/tool model, stay on this page.
2. **List the methods you actually need.** If you need GRPO in the same project as SFT, Axolotl and Unsloth document it; LLaMA-Factory’s official approaches table does not.
3. **Check the dataset schema.** Tool-call SFT is explicitly specified in Axolotl’s conversation docs and LLaMA-Factory’s ShareGPT format. Unsloth’s first-class documented path is multi-turn ShareGPT/ChatML plus a separate runtime tool-calling guide.
4. **Match hardware and licence.** Note Unsloth’s AGPL-3.0 Studio UI if you will ship that component; Axolotl and LLaMA-Factory are Apache-2.0. Confirm CUDA versus ROCm versus NPU install docs before you pin a stack.
5. **Pin versions.** Record the PyPI versions above (or newer pins), the YAML or Python entry point, and any engine flags (DeepSpeed, FSDP, `loss_type` for GRPO).
