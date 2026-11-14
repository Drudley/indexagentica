---
id: local-llm-servers-for-agents
type: comparison
title: "Ollama vs llama.cpp for agents — tools, OpenAI APIs, grammars and local serving"
summary: "Compare Ollama and llama.cpp as local model servers for agents: tool and function calling, OpenAI-compatible endpoints, structured output and grammars, how each is served, licences and current versions. Distinct from the structured-output libraries comparison and from LLM gateways."
description: "A source-checked comparison of Ollama (GitHub v0.40.16, MIT) and llama.cpp (GitHub v1.0.0, MIT) for running open models that agents can call locally. Covers native and OpenAI-compatible tool APIs, JSON schema and GBNF constraints, default loopback bind addresses, Ollama Cloud as an optional paid path, and the fact that Ollama documents llama.cpp as its inference backend. The official ollama 0.6.3 Python client was imported; no model was downloaded and no local server was started. No unbacked performance numbers."
author: Agentica Author
tags: [inference, local-models, openai-compatible, tool-calling, structured-output, python]
entries: [ollama, llama-cpp, llguidance, openclaw, claude-code]
related: [structured-output-libraries, personal-agent-runtimes, llm-gateways, coding-agent-harnesses]
subjects: [ollama, llama-cpp]
criteria:
  - What you run
  - Tool and function calling
  - OpenAI-compatible API
  - Structured output and grammars
  - Local serving and cloud
  - License and versions
rows:
  ollama:
    What you run: "An MIT app and local server, plus official Python and JavaScript clients. Installers are documented for macOS, Windows and Linux (including a documented Linux install script, not executed) and the Docker image ollama/ollama. The README lists llama.cpp as its supported inference backend."
    Tool and function calling: "Official docs cover tool calling on /api/chat with OpenAI-style tools and tool result messages (role tool). The Python client can pass functions or a JSON schema in tools. ollama launch is documented for integrations including Claude Code, Codex, Copilot CLI, OpenCode and OpenClaw."
    OpenAI-compatible API: "Local base URL http://localhost:11434/v1 (cloud OpenAI-compat path is /v1 on ollama.com). /v1/chat/completions documents tools as supported and tool_choice as not supported, plus JSON mode and response_format. Also documents /v1/responses, embeddings, audio, and Anthropic-compatible /v1/messages."
    Structured output and grammars: "The structured-outputs guide uses a format field of json or a JSON schema (Python can pass Pydantic model_json_schema()). Official note: Ollama's cloud currently does not support structured outputs. GBNF grammars are not documented as an Ollama API."
    Local serving and cloud: "FAQ: binds 127.0.0.1:11434 by default; change with OLLAMA_HOST (examples use 0.0.0.0:11434 to expose the server). Optional paid Ollama Cloud needs an account and API key; cloud features can be disabled in ~/.ollama/server.json. See ollama.com/pricing; rates are not copied here."
    License and versions: "App/server MIT (repository LICENSE). GitHub latest v0.40.16 (9 November 2026). Official Python client PyPI ollama 0.6.3 (29 September 2026, MIT, Python >=3.8, repo ollama/ollama-python)."
  llama-cpp:
    What you run: "MIT C/C++ library, CLI and HTTP server (`llama serve` in the README; server docs also name `llama-server`). Install via documented binaries, Docker, source, or conda-forge/Homebrew/Winget/MacPorts/Nix. Not the third-party PyPI package llama-cpp-python."
    Tool and function calling: "OpenAI-style function calling, used with --jinja (enabled by default in the current flag list). Native handlers for several model families, plus a generic Jinja fallback. Experimental built-in tools and stdio MCP sit behind --tools / --agent; docs warn not to enable them in untrusted environments."
    OpenAI-compatible API: "Default http://127.0.0.1:9931/v1. Documents /v1/chat/completions, /v1/responses, /v1/completions, /v1/embeddings, /v1/audio/speech, and Anthropic-compatible /v1/messages. The server README says it makes no strong compatibility claims, but that the API has been enough for many apps."
    Structured output and grammars: "Built-in GBNF (--grammar / grammar) and a JSON Schema-to-GBNF path (--json-schema, json_schema, or response_format). Optional llguidance via cmake -DLLAMA_LLGUIDANCE=ON (grammars prefixed %llguidance). See the structured-output libraries comparison for engine-level coverage, not repeated here."
    Local serving and cloud: "Server default is 127.0.0.1:9931 (--host / --port). Docker examples pass --host 0.0.0.0 when publishing a port. llama.app is a desktop app by the llama.cpp team and Hugging Face; this page is the llama.cpp project, not that app. No hosted cloud product is documented in llama.cpp itself."
    License and versions: "MIT (repository LICENSE, copyright 2023-2026 The ggml authors). GitHub latest v1.0.0 (13 November 2026). There is no official first-party PyPI package for this repo."
verdict: "Want an app, a model library, official Python/JS clients, documented coding-agent launchers, and an optional paid cloud path? Start with Ollama, and remember it documents llama.cpp as its inference backend. Want the C/C++ server itself, GBNF or JSON-schema constraints (and optional llguidance), a default loopback server on port 9931, or experimental built-in tools/MCP? Use llama.cpp directly. This is a serving layer choice, not a substitute for the structured-output libraries comparison or for hosted LLM gateways."
sources:
  - title: "ollama/ollama README"
    url: https://raw.githubusercontent.com/ollama/ollama/main/README.md
    accessed: 2026-11-14
  - title: "ollama/ollama LICENSE"
    url: https://raw.githubusercontent.com/ollama/ollama/main/LICENSE
    accessed: 2026-11-14
  - title: "ollama/ollama latest GitHub release"
    url: https://api.github.com/repos/ollama/ollama/releases/latest
    accessed: 2026-11-14
  - title: "Ollama documentation"
    url: https://docs.ollama.com/
    accessed: 2026-11-14
  - title: "Ollama, Tool calling"
    url: https://docs.ollama.com/capabilities/tool-calling
    accessed: 2026-11-14
  - title: "Ollama, Structured Outputs"
    url: https://docs.ollama.com/capabilities/structured-outputs
    accessed: 2026-11-14
  - title: "Ollama, API introduction"
    url: https://docs.ollama.com/api/introduction
    accessed: 2026-11-14
  - title: "Ollama, OpenAI compatibility"
    url: https://docs.ollama.com/api/openai-compatibility
    accessed: 2026-11-14
  - title: "Ollama, Anthropic compatibility"
    url: https://docs.ollama.com/api/anthropic-compatibility
    accessed: 2026-11-14
  - title: "Ollama, Cloud"
    url: https://docs.ollama.com/cloud
    accessed: 2026-11-14
  - title: "Ollama FAQ"
    url: https://docs.ollama.com/faq
    accessed: 2026-11-14
  - title: "Ollama quickstart"
    url: https://docs.ollama.com/quickstart
    accessed: 2026-11-14
  - title: "Ollama CLI reference"
    url: https://docs.ollama.com/cli
    accessed: 2026-11-14
  - title: "Ollama pricing"
    url: https://ollama.com/pricing
    accessed: 2026-11-14
  - title: "ollama PyPI metadata"
    url: https://pypi.org/pypi/ollama/json
    accessed: 2026-11-14
  - title: "ollama/ollama-python"
    url: https://github.com/ollama/ollama-python
    accessed: 2026-11-14
  - title: "ggml-org/llama.cpp README"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/README.md
    accessed: 2026-11-14
  - title: "ggml-org/llama.cpp LICENSE"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/LICENSE
    accessed: 2026-11-14
  - title: "ggml-org/llama.cpp latest GitHub release"
    url: https://api.github.com/repos/ggml-org/llama.cpp/releases/latest
    accessed: 2026-11-14
  - title: "llama.cpp v1.0.0 release"
    url: https://github.com/ggml-org/llama.cpp/releases/tag/v1.0.0
    accessed: 2026-11-14
  - title: "llama.cpp HTTP server README"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/server/README.md
    accessed: 2026-11-14
  - title: "llama.cpp function calling"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/function-calling.md
    accessed: 2026-11-14
  - title: "llama.cpp GBNF guide"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/grammars/README.md
    accessed: 2026-11-14
  - title: "llama.cpp LLGuidance support"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/llguidance.md
    accessed: 2026-11-14
  - title: "llama.cpp install pre-built binaries"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/install.md
    accessed: 2026-11-14
  - title: "llama.cpp build guide"
    url: https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/build.md
    accessed: 2026-11-14
  - title: "llama.app"
    url: https://llama.app/
    accessed: 2026-11-14
last_verified: 2026-11-14
published: 2026-11-14
updated: 2026-11-14
---
## Local servers for agents, not gateways or grammar libraries

[LLM gateways compared](comparison:llm-gateways) covers hosted and self-hosted *proxies* in front of many model providers. [Structured-output libraries compared](comparison:structured-output-libraries) covers constraint engines such as [Outlines](entry:outlines), [XGrammar](entry:xgrammar), [Guidance](entry:guidance) and [llguidance](entry:llguidance), some of which can sit on an Ollama or llama.cpp client. [Personal agent runtimes](comparison:personal-agent-runtimes) mentions llama.cpp as one model backend for Pi. This page is the layer in between: **how you serve an open model locally** so an agent can call tools against it.

The two directory entries are [Ollama](entry:ollama) and [llama.cpp](entry:llama-cpp). They are not unrelated stacks. Ollama's README lists [llama.cpp](https://github.com/ggml-org/llama.cpp) as its supported inference backend. Treat Ollama as the app, API and model-library layer; treat llama.cpp as the C/C++ engine and HTTP server you can also run yourself.

The comparison table is generated from the front matter. Do not read vendor speed claims, token prices or catalog sizes as independent measurements. Ollama Cloud list prices live on [ollama.com/pricing](https://ollama.com/pricing) and are not copied here.

## What you actually install

**Ollama** is an MIT-licensed app and daemon with official macOS, Windows and Linux installers, including a documented Linux install script (not executed here), plus the Docker image `ollama/ollama`. Official clients are [ollama-python](https://github.com/ollama/ollama-python) and [ollama-js](https://github.com/ollama/ollama-js). The docs describe `ollama launch` for wiring [Claude Code](entry:claude-code), Codex, Copilot CLI, OpenCode and [OpenClaw](entry:openclaw), among others.

**llama.cpp** is an MIT-licensed C/C++ library with a CLI and HTTP server. The project README's quick start uses `llama cli` and `llama serve`; the [server](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/tools/server/README.md) and [function-calling](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/function-calling.md) docs still name `llama-server`. Documented install paths include `https://llama.app/install.sh` (not executed), Docker, GitHub release binaries, [building from source](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/build.md), and packages listed in the [install guide](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/install.md) (conda-forge, Homebrew, Winget, MacPorts, Nix). **Do not** treat the third-party PyPI package `llama-cpp-python` (abetlen/llama-cpp-python) as the official install path for this repository. [llama.app](https://llama.app/) is a Mac/Windows desktop app described as being by the llama.cpp team and Hugging Face; this comparison is the llama.cpp project, not a separate listing of that app.

## Tool calling and compatible APIs

**Ollama** documents tool calling on its native [`/api/chat`](https://docs.ollama.com/capabilities/tool-calling) endpoint: a `tools` array of function definitions, assistant `tool_calls`, and follow-up `role: tool` messages. The Python client can pass Python functions or a JSON schema in `tools`. The [OpenAI compatibility](https://docs.ollama.com/api/openai-compatibility) page puts the same local server at `http://localhost:11434/v1`. For `/v1/chat/completions` it marks `tools` as supported and `tool_choice` as **not** supported, and it also documents `/v1/responses` (including tools), embeddings, audio, and an [Anthropic-compatible](https://docs.ollama.com/api/anthropic-compatibility) messages API. Direct cloud access uses the `ollama.com` host with the `/v1` (OpenAI-compatible) or `/api` (native) paths and an API key, as documented in the API introduction.

**llama.cpp** documents an OpenAI-compatible server, defaulting to `http://127.0.0.1:9931`. The server README lists `/v1/chat/completions`, `/v1/responses`, `/v1/completions`, `/v1/embeddings` and `/v1/audio/speech`, plus Anthropic-compatible `/v1/messages`. It states that it makes no strong compatibility claims, but that the API has been enough for many apps. [Function calling](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/docs/function-calling.md) is described as OpenAI-style tool use on `llama-server` with `--jinja`. The current server flag table lists `--jinja` as **enabled by default**. Native format handlers are documented for several model families (including Llama 3.x, Hermes, Qwen 2.5, Mistral Nemo and GPT-OSS); otherwise a generic Jinja handler is used. Parallel tool calls are documented as off by default and enabled with `"parallel_tool_calls": true` on supported templates.

The same server also documents *experimental* built-in agent tools (`--tools`, or `--agent` to turn them all on) and stdio MCP servers. The docs warn not to enable those in untrusted environments, because they can expose file and shell access.

## Structured output and grammars

**Ollama's** [structured outputs](https://docs.ollama.com/capabilities/structured-outputs) guide uses a `format` field: the string `"json"`, or a JSON schema object (the Python examples pass `model_json_schema()` from Pydantic). The same page states that **Ollama's cloud currently does not support structured outputs**. GBNF is not documented as an Ollama request parameter.

**llama.cpp** has a first-class [GBNF](https://raw.githubusercontent.com/ggml-org/llama.cpp/master/grammars/README.md) grammar language (`--grammar` / `--grammar-file`, or a `grammar` field on completions) and a documented path from a **subset** of JSON Schema to GBNF (`--json-schema`, a `json_schema` field, or OpenAI-style `response_format`). The grammars guide notes that a JSON schema used this way constrains sampling and is not injected into the prompt, except for tool calling, where schemas are injected. Optional [llguidance](entry:llguidance) support is built with `cmake -DLLAMA_LLGUIDANCE=ON`; grammars that start with `%llguidance`, and JSON Schema requests, are then handled by llguidance. For engine-level constraint coverage, start from [Structured-output libraries compared](comparison:structured-output-libraries) rather than repeating those matrices here.

## Local bind addresses, and Ollama Cloud

Both projects document a **loopback default**, which matters if you start a server on a shared machine.

- Ollama's FAQ states that it binds **127.0.0.1 port 11434** by default, and that you change the bind address with `OLLAMA_HOST` (its examples use `0.0.0.0:11434` when you intentionally expose the server).
- llama.cpp's server flag table defaults `--host` to **127.0.0.1** and `--port` to **9931**. Docker examples in that README pass `--host 0.0.0.0` when publishing a container port.

[Ollama Cloud](https://docs.ollama.com/cloud) is an optional paid path for running larger models on Ollama's service. It requires an account. Docs say you can keep inference on your own hardware and [disable cloud features](https://docs.ollama.com/faq) with `disable_ollama_cloud` in `~/.ollama/server.json`. Current plan and per-token prices are on [ollama.com/pricing](https://ollama.com/pricing); they were not copied into this article. llama.cpp itself is not documented as a hosted cloud product.

## Licences and versions (14 November 2026)

| Project | Licence file | What to pin | Notes |
|---|---|---|---|
| Ollama app/server | MIT (`LICENSE`, copyright Ollama) | GitHub latest **v0.40.16** (9 November 2026) | Official Python client is a separate package: PyPI **ollama 0.6.3** (29 September 2026, MIT, Python >=3.8) |
| llama.cpp | MIT (`LICENSE`, copyright 2023-2026 The ggml authors) | GitHub latest **v1.0.0** (13 November 2026) | No official first-party PyPI package. Do not confuse this with third-party `llama-cpp-python` |

When linking the llama.cpp repository, use [ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp). The older `ggerganov/llama.cpp` path redirects to it. For Ollama's HTTP API docs, use [docs.ollama.com/api/introduction](https://docs.ollama.com/api/introduction) and [docs.ollama.com/api/openai-compatibility](https://docs.ollama.com/api/openai-compatibility); the short `/api` and `/openai` paths redirect.

## What we ran, and what we did not

We installed the official Python client `ollama==0.6.3` in a virtualenv and imported it (package version 0.6.3; `chat` and `Client` are present). No Ollama or llama.cpp server was running (nothing listened on ports 11434 or 9931).

We did **not** execute `ollama.com/install.sh` or `llama.app/install.sh`, did not install the Ollama app or a llama.cpp binary, did not download a model (including the README's `Qwen3.5-0.8B-GGUF` example), and did not call Ollama Cloud or any paid API. No tool-calling or grammar example was executed against a live model.

## A safe selection sequence

1. **Name the layer.** If you need a multi-provider *gateway*, start from [LLM gateways compared](comparison:llm-gateways). If you need constraint libraries (Outlines, XGrammar, Guidance, llguidance), use [Structured-output libraries compared](comparison:structured-output-libraries). If you need a local OpenAI-compatible server for an agent, stay on this page.
2. **Decide whether you want the app or the engine.** Ollama is the documented app/API layer (and it uses llama.cpp under the hood). llama.cpp is the engine and server you run directly when you want GBNF, JSON-schema constraints, optional llguidance, or the experimental tools/MCP flags.
3. **Check the API your agent already speaks.** Both document OpenAI-compatible `/v1/chat/completions` and an Anthropic-compatible messages API. If you rely on `tool_choice`, note that Ollama's OpenAI-compat table marks it unsupported.
4. **Keep the server on loopback** unless you have a reason to change `OLLAMA_HOST` or `--host`. Do not enable llama.cpp `--tools` or `--agent` on an untrusted host.
5. **Pin versions.** Record v0.40.16 / v1.0.0 (or newer pins), the bind address and port, and whether structured output is required (not available on Ollama Cloud, per the structured-outputs guide).
