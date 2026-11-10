---
id: structured-output-libraries
type: comparison
title: "Structured-output libraries compared — Outlines, XGrammar, Guidance and llguidance"
summary: "Compare Outlines, XGrammar, Guidance and llguidance by constraint form (regex, JSON Schema, CFG), documented engine integrations, licences, current PyPI versions and official JSON Schema coverage limits. The libraries compose: Outlines and Guidance can sit on these backends."
description: "A source-checked comparison of four structured-output / constrained-decoding libraries. Covers how each constrains decoding (regex, JSON Schema, CFG), which inference engines official docs say they integrate with, licences, PyPI versions checked 2026-11-10, and documented JSON Schema feature limits (llguidance publishes a keyword-level subset; the others do not). Distinguishes user-facing APIs (Outlines, Guidance) from token-mask engines (XGrammar, llguidance) and notes that Outlines can use outlines_core, llguidance or xgrammar as a backend. Standalone CPU test compiled a small JSON Schema with llguidance 1.9.1 and outlines-core 0.2.14 on a tiny ASCII vocabulary; XGrammar, full model generation and engine defaults were not run."
author: Agentica Author
tags: [structured-generation, constrained-decoding, json-schema, grammars, python]
entries: [outlines, xgrammar, guidance, llguidance]
related: [agent-guardrail-frameworks]
subjects: [outlines, xgrammar, guidance, llguidance]
criteria:
  - Role
  - Constraint forms
  - JSON Schema coverage
  - Documented integrations
  - License and PyPI
rows:
  outlines:
    Role: "User-facing structured-generation library. For local steerable models you can select outlines_core, llguidance or xgrammar as the constraint backend."
    Constraint forms: "JSON Schema (Pydantic, dataclasses, TypedDict, GenSON, callables, JsonSchema wrappers), regex, and Lark CFGs. Defaults: outlines_core for JSON/regex; llguidance for CFGs. outlines_core does not support grammars."
    JSON Schema coverage: "Docs describe how to pass schemas and whitespace_pattern (outlines_core only; llguidance/xgrammar backends error if it is set). No official keyword-level coverage table in the output-type documentation."
    Documented integrations: "Features matrix: local LlamaCpp, MLXLM, Transformers, Transformers MultiModal, VLLMOffline; server Anthropic, Dottxt, Gemini, LM Studio, Mistral, Ollama, OpenAI, SGLang, TGI, VLLM. Type support varies (Anthropic none listed; Gemini JSON Schema partial; SGLang grammars expect EBNF)."
    License and PyPI: "Apache-2.0; PyPI outlines 1.3.3; Python >=3.10,<3.14 (checked 2026-11-10)"
  xgrammar:
    Role: "Portable constrained-decoding engine: compile a grammar, then fill token bitmasks during sampling."
    Constraint forms: "JSON Schema (builtin JSON grammar, Pydantic, or a schema string), EBNF (documented as compatible with llama.cpp GBNF), Lark, and Structural Tag for mixed reasoning and tool-calling output."
    JSON Schema coverage: "Docs cover compile_json_schema and compile_builtin_json_grammar. No official keyword-by-keyword coverage table comparable to llguidance's docs/json_schema.md was found in the project documentation."
    Documented integrations: "README lists official integration into Mirai, OpenVINO GenAI, Modular MAX, TensorRT-LLM, vLLM, SGLang and MLC-LLM (self-described as default for several—project wording). Quick Start shows a transformers logits processor. Outlines: Transformers and MLXLM, not LlamaCpp."
    License and PyPI: "Apache-2.0; PyPI xgrammar 0.2.9; Python >=3.8,<4 (checked 2026-11-10)"
  guidance:
    Role: "Python interface for steering models: interleaves prompts, control flow and constrained generation. Uses llguidance as the grammar engine since Guidance v0.2.0 (2025-01-07, per the llguidance README)."
    Constraint forms: "Regex, context-free grammars, and JSON Schema (treated as a CFG; guidance.json / gen_json with Pydantic). The README documents fast-forwarding of tokens that the grammar has already forced."
    JSON Schema coverage: "The README shows JSON generation from a Pydantic schema. Keyword-level support is documented in llguidance's JSON Schema converter, not in the Guidance README itself."
    Documented integrations: "README names Transformers, llama.cpp, OpenAI, and \"etc.\" CFG quality depends on whether the backend LLM has full Guidance support."
    License and PyPI: "MIT (LICENSE.md); PyPI guidance 0.3.1; Python >=3.10 (checked 2026-11-10)"
  llguidance:
    Role: "Low-level token-mask library used by Guidance and several inference engines."
    Constraint forms: "A documented large subset of JSON Schema, plus CFGs in a Lark variation that can embed JSON schemas and regular expressions."
    JSON Schema coverage: "Draft 2020-12 converter. Departures: fixed property order; format enforced by default; unique keys not enforced for additional/pattern properties. Remote $ref unsupported. MaskBench rates: oneOf 68%, pattern 99% (no lookarounds), format 74%. Unsupported keywords error unless x-guidance.lenient."
    Documented integrations: "README: Guidance; OpenAI Structured Output (JSON Schema only); llama.cpp PR 10224 (b4613, -DLLAMA_LLGUIDANCE=ON); Chromium window.ai; SGLang --grammar-backend llguidance; vLLM PRs 14589/14779 (v0.8.2); LLGTRT (TensorRT-LLM). Outlines can use it on Transformers, LlamaCpp and MLXLM."
    License and PyPI: "MIT (Microsoft copyright in LICENSE; microsoft/llguidance redirects to guidance-ai/llguidance); PyPI llguidance 1.9.1; Python >=3.10 (checked 2026-11-10)"
verdict: "Pick by layer, not by a generic quality ranking. Use Outlines when you want one Python API across many model clients and can live with each client's documented type limits. Use XGrammar when an engine you already run documents an XGrammar integration, or you need EBNF, Lark or Structural Tag at the engine layer. Use Guidance when you want a programming model that interleaves control flow with constraints (it sits on llguidance). Use llguidance directly when you need its documented JSON Schema subset and the engine hooks listed in its README. These pieces compose rather than replace each other."
sources:
  - title: "Outlines README (raw)"
    url: https://raw.githubusercontent.com/dottxt-ai/outlines/main/README.md
    accessed: 2026-11-10
  - title: "Outlines LICENSE (raw)"
    url: https://raw.githubusercontent.com/dottxt-ai/outlines/main/LICENSE
    accessed: 2026-11-10
  - title: "outlines 1.3.3 on PyPI"
    url: https://pypi.org/project/outlines/1.3.3/
    accessed: 2026-11-10
  - title: "Outlines output types (raw)"
    url: https://raw.githubusercontent.com/dottxt-ai/outlines/main/docs/features/core/output_types.md
    accessed: 2026-11-10
  - title: "Outlines models (raw)"
    url: https://raw.githubusercontent.com/dottxt-ai/outlines/main/docs/features/models/index.md
    accessed: 2026-11-10
  - title: "Outlines structured generation backends (raw)"
    url: https://raw.githubusercontent.com/dottxt-ai/outlines/main/docs/features/advanced/backends.md
    accessed: 2026-11-10
  - title: "Outlines SGLang model page (raw)"
    url: https://raw.githubusercontent.com/dottxt-ai/outlines/main/docs/features/models/sglang.md
    accessed: 2026-11-10
  - title: "Outlines Gemini model page (raw)"
    url: https://raw.githubusercontent.com/dottxt-ai/outlines/main/docs/features/models/gemini.md
    accessed: 2026-11-10
  - title: "XGrammar README (raw)"
    url: https://raw.githubusercontent.com/mlc-ai/xgrammar/main/README.md
    accessed: 2026-11-10
  - title: "XGrammar LICENSE (raw)"
    url: https://raw.githubusercontent.com/mlc-ai/xgrammar/main/LICENSE
    accessed: 2026-11-10
  - title: "xgrammar 0.2.9 on PyPI"
    url: https://pypi.org/project/xgrammar/0.2.9/
    accessed: 2026-11-10
  - title: "XGrammar JSON generation (raw)"
    url: https://raw.githubusercontent.com/mlc-ai/xgrammar/main/docs/defining_structures/json_generation.md
    accessed: 2026-11-10
  - title: "XGrammar EBNF grammar (raw)"
    url: https://raw.githubusercontent.com/mlc-ai/xgrammar/main/docs/defining_structures/ebnf_grammar.md
    accessed: 2026-11-10
  - title: "XGrammar engine integration (raw)"
    url: https://raw.githubusercontent.com/mlc-ai/xgrammar/main/docs/using_xgrammar/engine_integration.md
    accessed: 2026-11-10
  - title: "XGrammar Quick Start (raw)"
    url: https://raw.githubusercontent.com/mlc-ai/xgrammar/main/docs/start/quick_start.md
    accessed: 2026-11-10
  - title: "Guidance README (raw)"
    url: https://raw.githubusercontent.com/guidance-ai/guidance/main/README.md
    accessed: 2026-11-10
  - title: "Guidance LICENSE.md (raw)"
    url: https://raw.githubusercontent.com/guidance-ai/guidance/main/LICENSE.md
    accessed: 2026-11-10
  - title: "guidance 0.3.1 on PyPI"
    url: https://pypi.org/project/guidance/0.3.1/
    accessed: 2026-11-10
  - title: "llguidance README (raw)"
    url: https://raw.githubusercontent.com/guidance-ai/llguidance/main/README.md
    accessed: 2026-11-10
  - title: "llguidance LICENSE (raw)"
    url: https://raw.githubusercontent.com/guidance-ai/llguidance/main/LICENSE
    accessed: 2026-11-10
  - title: "llguidance 1.9.1 on PyPI"
    url: https://pypi.org/project/llguidance/1.9.1/
    accessed: 2026-11-10
  - title: "llguidance JSON schema converter (raw)"
    url: https://raw.githubusercontent.com/guidance-ai/llguidance/main/docs/json_schema.md
    accessed: 2026-11-10
last_verified: 2026-11-10
published: 2026-11-10
updated: 2026-11-10
---
## Two layers, four packages

[Agent guardrail frameworks](comparison:agent-guardrail-frameworks) mentions validators and structured-output checks; it does not compare the libraries that constrain *decoding*. This page covers four directory entries that do: [Outlines](entry:outlines), [XGrammar](entry:xgrammar), [Guidance](entry:guidance) and [llguidance](entry:llguidance).

They are not four interchangeable drop-in libraries. Two are **user-facing APIs**; two are **token-mask engines** that those APIs (and inference servers) can sit on:

- **Outlines** wraps many local and server model clients and accepts an output type (Python types, JSON Schema, regex, or a Lark CFG). For local “steerable” models it can delegate constraint enforcement to `outlines_core`, `llguidance` or `xgrammar`.
- **Guidance** is a Python programming model: you interleave prompts, control flow and constrained `gen` / `json` calls. Since Guidance v0.2.0 (2025-01-07), the [llguidance](entry:llguidance) README states that Guidance uses llguidance as its grammar engine.
- **XGrammar** compiles a grammar and, at each sampling step, fills a token bitmask that the engine applies to logits.
- **llguidance** does the same kind of work at a lower level: given a grammar, a tokenizer and a token prefix, it computes the set of tokens that can still lead to a valid string.

The comparison table is generated from the front matter. The notes below add only documented details, plus a small CPU-only compile test. We did not benchmark mask latency or claim a winner on speed.

## How each constrains decoding

The shared mechanism is **constrained decoding**: at each step, disallowed tokens are masked out of the distribution so the sampler cannot emit them. XGrammar’s constrained-decoding guide describes a binary mask over the vocabulary, applied by setting disallowed logits to \(-\infty\). llguidance’s README describes the same idea as computing a token mask from a context-free grammar and a tokenizer.

What you can *express* differs:

- **Outlines** output types include basic Python / `typing` types, `Literal` / `Enum` / `Choice`, JSON Schema (Pydantic, dataclasses, TypedDict, GenSON, callables, or a `JsonSchema` wrapper around a string or dict), `Regex`, and `CFG` using [Lark](https://lark-parser.readthedocs.io/en/latest/index.html). Default backends (for steerable models) are `outlines_core` for JSON Schema and regex, and `llguidance` for context-free grammars. The backends matrix marks `outlines_core` as **not** supporting grammars, and `xgrammar` as **not** supporting LlamaCpp.
- **XGrammar** documents JSON Schema (`compile_builtin_json_grammar`, `compile_json_schema` from a Pydantic model or a schema string), EBNF (its EBNF page says the syntax is compatible with the GBNF format used by llama.cpp), Lark, and Structural Tag for outputs that mix reasoning, free-form text and tool calls. A Hugging Face `transformers` path is shown in the Quick Start via `xgr.contrib.hf.LogitsProcessor`.
- **Guidance** documents regex constraints, general CFGs (“so long as the backend LLM has full support for Guidance”), and JSON Schema treated as a CFG, with a dedicated `guidance.json` / `gen_json` helper that accepts a Pydantic model. The README also documents **fast-forwarding**: tokens forced by the grammar can be inserted without a model forward pass.
- **llguidance** documents “a large subset” of JSON schemas and CFGs in a Lark variation that can embed JSON schemas and regular expressions. Python helpers include `grammar_from(...)` and `JsonCompiler.compile(...)`.

## JSON Schema coverage — only what official docs state

Only [llguidance](entry:llguidance) publishes a keyword-level coverage page (`docs/json_schema.md`). It aims at JSON Schema Draft 2020-12 semantics or an error, with documented departures:

- Object **property order is fixed** to the order in `properties` (with merge rules for `allOf` and similar).
- String **`format` is enforced by default**; unrecognized or unimplemented formats error.
- Unique keys are **not** enforced for properties arising from `additionalProperties` or `patternProperties`.
- `$ref` is supported, but **external/remote refs are unsupported**.
- Support rates among the roughly 11k [MaskBench](https://github.com/guidance-ai/jsonschemabench/tree/main/maskbench) schemas, as stated in that doc: `oneOf` 68% (converted to `anyOf` only when provably equivalent), `allOf` 98%, `patternProperties` 98% (must be disjoint), `minProperties` / `maxProperties` 90% (only when every `properties` field is `required`), `pattern` 99% (lookarounds not supported), `format` 74% with the listed formats `date-time`, `time`, `date`, `duration`, `email`, `hostname`, `ipv4`, `ipv6`, `uuid`, `uri`.
- Unsupported keywords and formats error unless the top-level `x-guidance.lenient` flag is set (which also implies `coerce_one_of`).

Those percentages are the project’s documented feature-support rates on MaskBench schemas, not model quality scores. We did not rerun MaskBench.

**Outlines** documents how to pass a schema and the `JsonSchema` options `whitespace_pattern` and `ensure_ascii`. `whitespace_pattern` “is applied by the `outlines_core` backend; the `llguidance` and `xgrammar` backends do not support it and raise an error if one is set.” The output-type docs do not include a keyword-by-keyword coverage table; they defer to each model client’s documented type support (for example Gemini accepts only Pydantic classes, dataclasses and TypedDicts as JSON Schema input).

**XGrammar** documents compiling a builtin JSON grammar or a JSON Schema (string or Pydantic). We did not find an official keyword-level coverage table in the project docs comparable to llguidance’s page, so this comparison does not invent one.

**Guidance** documents JSON generation from a schema/Pydantic model and points at the CFG mechanism; detailed keyword support is the llguidance converter’s.

## Engine integrations — as official docs state them

Do not treat any project’s “we are the default backend” wording as an independently verified fact about another engine’s current defaults. The lists below are what **each library’s own docs** say.

- **XGrammar’s README** lists official integration into Mirai (2025/12), OpenVINO GenAI (2025/09), Modular MAX (2025/02), TensorRT-LLM (2025/01), vLLM (2024/12), SGLang (2024/11) and MLC-LLM (2024/11). It also states that it is “the default structured generation backend for most LLM inference engines, including vLLM, SGLang, TensorRT-LLM, and MLC-LLM” — that sentence is the project’s own claim. The engine-integration guide points at those same four codebases as reference implementations. The Quick Start shows a `transformers` logits-processor loop (the sample targets CUDA but notes CPU as an option).
- **llguidance’s README** lists Guidance; OpenAI Structured Output (JSON Schema only); llama.cpp via PR 10224 (release b4613) and `cmake -DLLAMA_LLGUIDANCE=ON`; Chromium, for JSON Schema enforcement on `window.ai`; SGLang via `--grammar-backend llguidance` (Lark grammars should be prefixed with `%llguidance {}`); vLLM (V0 PR 14589 and V1 PR 14779, noted as v0.8.2); and LLGTRT, an OpenAI-compatible server on TensorRT-LLM. The “powers OpenAI Structured Output” wording is the project’s, citing OpenAI developer posts.
- **Outlines’ models features matrix** lists local clients (LlamaCpp, MLXLM, Transformers, Transformers MultiModal, VLLMOffline) and server clients (Anthropic, Dottxt, Gemini, LM Studio, Mistral, Ollama, OpenAI, SGLang, TGI, VLLM). Structured-type support is not uniform: Anthropic is marked unsupported for the listed structured types; Gemini JSON Schema is partial; SGLang grammar support is partial because SGLang expects **EBNF**, not the Lark format Outlines uses for `CFG`. The SGLang page says you can pass `--grammar-backend outlines` so the server uses Outlines “instead of the default engine” — it does not name that default. One inconsistency to be aware of: the features matrix marks LlamaCpp **Grammar** as unsupported, while the LlamaCpp model page shows a CFG example (in `root ::= ...` form) and the backends page says LlamaCpp can use llguidance, which does support grammars. Resolve that against the page for the Outlines version you pin; this article does not guess which row is stale.
- **Guidance’s README** names Transformers, llama.cpp, OpenAI, “etc.” We did not expand that “etc.” from repository file names.

## Licences and versions (10 November 2026)

Checked on PyPI and in each repository’s licence file:

| Package | Licence file | PyPI version | Requires Python |
|---|---|---|---|
| outlines | Apache License 2.0 | 1.3.3 | >=3.10,<3.14 |
| xgrammar | Apache License 2.0 | 0.2.9 | >=3.8,<4 |
| guidance | MIT (`LICENSE.md`) | 0.3.1 | >=3.10 |
| llguidance | MIT (Microsoft copyright in `LICENSE`) | 1.9.1 | >=3.10 |

`guidance` and `llguidance` do not set a PyPI licence classifier; the MIT text is from the repo files. The llguidance wheel metadata reports `License-Expression: MIT`. The GitHub URL `github.com/microsoft/llguidance` redirects to [guidance-ai/llguidance](https://github.com/guidance-ai/llguidance). The Index Agentica [xgrammar](entry:xgrammar) entry still records PyPI **0.2.8** (verified 2026-11-09); PyPI served **0.2.9** on 2026-11-10.

## What we ran, and what we did not

In a venv outside the site checkout, on CPU, we installed **llguidance 1.9.1** and **outlines-core 0.2.14** (no PyTorch, no model weights, no API keys). Against a 102-token handmade ASCII vocabulary and the schema `{type: object, properties: {name: string, age: integer}, required: [name, age], additionalProperties: false}`:

- `llguidance.JsonCompiler(whitespace_flexible=True).compile(...)` succeeded. An `LLMatcher` start mask allowed only `{`. After consuming `{`, the mask allowed `"` and space. Compiling a `pattern` with a look-ahead, and a schema with a remote `$ref`, failed with errors that match the JSON Schema docs (look-arounds not supported; default retriever does not fetch remote resources).
- `outlines_core.json_schema.build_regex_from_schema(...)` returned a regex that encodes the `name` then `age` property order and optional single spaces. An `Index`/`Guide` start mask likewise allowed only `{`; after `{`, `"` and space.

We did **not** install XGrammar (its PyPI package depends on `torch` and `transformers`, a larger download than this check allowed), run Outlines or Guidance against a live model, or inspect vLLM, SGLang, llama.cpp or OpenAI to verify which backend they currently default to. Library READMEs include latency figures and MaskBench plots; those are not reproduced here.

## A safe selection sequence

1. **Name the layer.** Do you need a Python API over many clients (Outlines), a programming model with control flow (Guidance), or a mask engine to embed in a server (XGrammar or llguidance)?
2. **List the constraint forms you actually need.** Regex, JSON Schema, Lark, EBNF and Structural Tag are not equally documented in every package. If you need a keyword-level JSON Schema subset in writing, start from llguidance’s coverage page.
3. **Check the client, not only the library.** Outlines’ matrix is explicit that some servers accept JSON Schema but not regex or grammars, and that SGLang wants EBNF when you pass a CFG through Outlines.
4. **Pin versions.** Record the PyPI versions above (or newer pins) and, for engine embeddings, the engine version and grammar-backend flag (`--grammar-backend`, cmake options, and so on).
5. **Put the schema in the prompt as well.** Both XGrammar’s constrained-decoding guide and Quick Start recommend describing the expected structure in the prompt, because masking only affects sampling, not the model’s prior.

If you later need to validate structured *tool calls* or other outputs after the fact, that is a different layer from constrained decoding; see [Agent guardrail frameworks](comparison:agent-guardrail-frameworks).
