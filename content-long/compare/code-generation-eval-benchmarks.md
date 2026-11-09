---
id: code-generation-eval-benchmarks
type: comparison
title: Code-generation evals compared — EvalPlus, BigCodeBench and LiveCodeBench
summary: "Pick a code-generation evaluation suite by what it stress-tests: expanded unit tests, library-heavy software tasks, or continuously dated contest problems. Agentless is a SWE-bench repair baseline, not a fourth benchmark."
description: "A source-checked comparison of EvalPlus (HumanEval+/MBPP+/EvalPerf), BigCodeBench and LiveCodeBench for LLM code generation. Covers task design, scoring, contamination handling, isolation guidance and licenses. Positions Agentless as a three-phase SWE-bench repair pipeline rather than a code-generation benchmark. No model leaderboard ranking; sanitizer tested offline on EvalPlus 0.3.1 without running untrusted generated code."
author: Agentica Author
tags: [benchmarks, code-generation, evaluation, python, coding-agents]
entries: [evalplus, bigcodebench, livecodebench, agentless, swe-bench]
related: [agent-benchmarks, newer-agent-eval-sets, evaluate-an-ai-agent, run-untrusted-code-in-a-sandbox]
subjects: [evalplus, bigcodebench, livecodebench]
criteria:
  - What it evaluates
  - Task set
  - Scoring
  - Freshness and contamination
  - Running and isolation
  - License and status
rows:
  evalplus:
    What it evaluates: "Correctness of function-level Python solutions under many more tests than the original HumanEval/MBPP sets, plus optional code-efficiency evaluation (EvalPerf)"
    Task set: "HumanEval+ (164 tasks on the Hugging Face card) and MBPP+ (378 tasks after the v0.2.0 cleanup); EvalPerf is a separate efficiency suite"
    Scoring: "Execution against base and plus tests; the README highlights large score drops when plus tests are added. EvalPerf measures efficiency on performance-exercising tasks"
    Freshness and contamination: "Fixed curated suites derived from HumanEval/MBPP; not a continuously dated live contest stream"
    Running and isolation: "PyPI evalplus 0.3.1 (Python >=3.9); generation/evaluation CLIs and a documented Docker path (ganler/evalplus). Treat generated code as untrusted"
    License and status: "Apache-2.0 (package and HumanEval+ dataset card). Active PyPI release 0.3.1"
  bigcodebench:
    What it evaluates: "Practical Python programming with diverse library calls and complex instructions, closer to tool-using software tasks than toy algorithms"
    Task set: "1,140 tasks (Complete and Instruct splits); BigCodeBench-Hard is a 148-task harder subset"
    Scoring: "Execution-based evaluation after sanitization/calibration; packages report pass@k-style result files"
    Freshness and contamination: "Fixed 2024 benchmark (arxiv 2406.15877); not continuously extended by contest date"
    Running and isolation: "PyPI bigcodebench 0.2.5; README documents local backends and slower remote/e2b options, plus a Docker evaluate image. Isolate execution"
    License and status: "Apache-2.0. GitHub repository is archived (read-only); PyPI and Hugging Face dataset remain available"
  livecodebench:
    What it evaluates: "Holistic coding ability across scenarios such as code generation, code execution, test-output prediction and self-repair"
    Task set: "Continuously collected contest problems from LeetCode, AtCoder and Codeforces; documented releases grow from 400 problems (release_v1) to 1,055 (release_v6)"
    Scoring: "pass@1 and pass@5 via a modified APPS-style checker; time limits can move scores by under 0.5 points"
    Freshness and contamination: "Problems are time-stamped; filter by release version or start/end dates so evaluation can target problems released after a model's cutoff"
    Running and isolation: "Clone the repo and install with uv; runner scenarios are selected by flag. Still execute model code only in an isolated environment"
    License and status: "MIT (repository LICENSE). Actively versioned releases; pin release_version for reproducibility"
verdict: "Use EvalPlus when you care whether a solution survives many more unit tests than HumanEval/MBPP. Use BigCodeBench when you need library-heavy, instruction-rich Python tasks. Use LiveCodeBench when you need time-windowed contest problems to reduce contamination. For repository issue repair, look at SWE-bench and baselines such as Agentless—not these three suites."
sources:
  - title: EvalPlus README (raw)
    url: https://raw.githubusercontent.com/evalplus/evalplus/master/README.md
    accessed: 2026-11-09
  - title: EvalPlus LICENSE (raw)
    url: https://raw.githubusercontent.com/evalplus/evalplus/master/LICENSE
    accessed: 2026-11-09
  - title: evalplus 0.3.1 on PyPI
    url: https://pypi.org/project/evalplus/0.3.1/
    accessed: 2026-11-09
  - title: HumanEval+ dataset card
    url: https://huggingface.co/datasets/evalplus/humanevalplus
    accessed: 2026-11-09
  - title: BigCodeBench README (raw)
    url: https://raw.githubusercontent.com/bigcode-project/bigcodebench/main/README.md
    accessed: 2026-11-09
  - title: BigCodeBench LICENSE (raw)
    url: https://raw.githubusercontent.com/bigcode-project/bigcodebench/main/LICENSE
    accessed: 2026-11-09
  - title: bigcodebench 0.2.5 on PyPI
    url: https://pypi.org/project/bigcodebench/0.2.5/
    accessed: 2026-11-09
  - title: bigcode/bigcodebench on Hugging Face
    url: https://huggingface.co/datasets/bigcode/bigcodebench
    accessed: 2026-11-09
  - title: bigcode-project/bigcodebench GitHub repository metadata (archived)
    url: https://api.github.com/repos/bigcode-project/bigcodebench
    accessed: 2026-11-09
  - title: LiveCodeBench README (raw)
    url: https://raw.githubusercontent.com/LiveCodeBench/LiveCodeBench/main/README.md
    accessed: 2026-11-09
  - title: LiveCodeBench LICENSE (raw)
    url: https://raw.githubusercontent.com/LiveCodeBench/LiveCodeBench/main/LICENSE
    accessed: 2026-11-09
  - title: Agentless README (raw)
    url: https://raw.githubusercontent.com/OpenAutoCoder/Agentless/main/README.md
    accessed: 2026-11-09
  - title: Agentless LICENSE (raw)
    url: https://raw.githubusercontent.com/OpenAutoCoder/Agentless/main/LICENSE
    accessed: 2026-11-09
last_verified: 2026-11-09
published: 2026-11-09
updated: 2026-11-09
---

## Three function-level suites, not one more SWE-bench clone

[Agent benchmarks](comparison:agent-benchmarks) already covers repository-scale issue repair ([SWE-bench](entry:swe-bench)), terminals and tool-using agents. [Newer agent eval sets](comparison:newer-agent-eval-sets) covers data-science, graded terminal corpora and multi-agent conflict. This page is about **code-generation benchmarks**: give a model a prompt, get a program, run tests.

The three subjects—[EvalPlus](entry:evalplus), [BigCodeBench](entry:bigcodebench) and [LiveCodeBench](entry:livecodebench)—overlap in “Python coding” but differ in what fails a solution. The recommendations below are selection advice based on those documented differences, not a claim that one suite is universally harder.

**Agentless is not in the table.** [Agentless](entry:agentless) is a three-phase **repair baseline** for SWE-bench-style issues (localize, sample patches, validate with tests). It is a method for repository bugs, not a HumanEval-style generation suite. Confusing the two leads people to report Agentless “scores” as if they were another fixed prompt set.

## EvalPlus: more tests on familiar tasks

EvalPlus keeps the HumanEval/MBPP problem shape and attacks **underspecified tests**. Its README states HumanEval+ has **80×** more tests than HumanEval and MBPP+ has **35×** more than MBPP. The HumanEval+ Hugging Face card lists **164** examples. MBPP+ was cleaned from 399 to **378** tasks in the documented `v0.2.0` upgrade.

That makes EvalPlus the right first stop when a model already looks strong on classic pass@k numbers and you want to know whether the code is merely overfit to weak oracles. **EvalPerf** (COLM'24) is the efficiency companion: correctness is not enough if the solution is asymptotically or practically slow.

**Operational notes.** PyPI **evalplus 0.3.1** requires Python **≥3.9**. The README documents a one-command evaluate path and Docker evaluation via `ganler/evalplus`. Generated samples are untrusted: prefer containerized execution. Offline, we installed 0.3.1 outside the site checkout, downloaded the HumanEval+ release used by the package, and confirmed `sanitize()` extracts a function body from a markdown-wrapped hand sample. We did **not** run model inference, Docker evaluation or untrusted code execution.

## BigCodeBench: library calls and instructions

BigCodeBench targets **software-engineering-oriented** Python tasks with diverse function/library calls. The project announces **1,140** tasks, with **Complete** (docstring/completion) and **Instruct** (natural-language instruction) splits, and a **Hard** subset of **148** tasks.

Use it when HumanEval-style puzzles are too narrow: the failure mode you care about is composing APIs and following denser instructions, not only implementing a single algorithm.

**Operational notes.** PyPI **bigcodebench 0.2.5** remains installable. The GitHub repository is **archived (read-only)** as of this check; treat the package and Hugging Face dataset as the living distribution channels, and expect slower community fixes. The README documents sanitization/calibration artifacts and isolation options (including Docker and slower remote backends). As with EvalPlus, do not evaluate raw model output on a privileged host. We did not install BigCodeBench or run its evaluator in this draft.

## LiveCodeBench: time-windowed contest problems

LiveCodeBench continuously collects problems from **LeetCode, AtCoder and Codeforces** and versions the dataset by date window. Documented releases include **release_v1** (400 problems, May 2023–Mar 2024) through **release_v6** (1,055 problems, May 2023–Apr 2025). The runner defaults toward the latest release; pin `--release_version` for reproducibility.

Beyond code generation, the README lists scenarios for **code execution**, **test output prediction** and **self-repair**. Scoring uses **pass@1** and **pass@5** with a modified APPS-style checker; time limits can shift scores by less than half a point.

Use LiveCodeBench when contamination is the primary concern: filter by problem release date relative to a model's training cutoff. That is a different guarantee from “more unit tests on old tasks.”

**Operational notes.** Install from the GitHub repository with **uv** as documented. License is **MIT**. We did not clone the full runner or download every release shard for this page.

## Where Agentless fits

Agentless ([OpenAutoCoder/Agentless](https://github.com/OpenAutoCoder/Agentless), MIT) solves each issue with:

1. **Localization** — files → classes/functions → edit sites  
2. **Repair** — sample multiple candidate patches  
3. **Patch validation** — regression tests plus generated reproduction tests to rank patches  

It is evaluated on **SWE-bench** settings (Lite/Verified artifacts are linked from the README), not on HumanEval+. If your question is “can this system fix a real repository issue?”, start from SWE-bench and related agent baselines. If your question is “does this model emit a correct function for a prompt?”, use the three suites above.

## A safe selection sequence

1. **Name the claim.** Correctness under weak vs strong tests (EvalPlus), library-heavy tasks (BigCodeBench), or post-cutoff contest problems (LiveCodeBench).
2. **Pin versions.** Record package version, dataset release (especially LiveCodeBench), split (Complete/Instruct or Full/Hard) and decoding settings.
3. **Isolate execution.** Assume every completion is hostile. Prefer the projects' Docker paths or your own sandbox; see [Run untrusted code in a sandbox](guide:run-untrusted-code-in-a-sandbox).
4. **Keep generation separate from scoring.** Sanitize/extract code, then evaluate. A chatty markdown wrapper is not a failed algorithm until after extraction.
5. **Do not mix leaderboards.** Pass rates across these suites are not commensurate with SWE-bench resolve rates or with each other under different prompts and sandboxes.

For designing an evaluation harness more generally, see [Evaluate an AI agent](guide:evaluate-an-ai-agent).

## Verification limits

Checked on **2026-11-09** against the project READMEs and licenses, PyPI metadata for evalplus **0.3.1** and bigcodebench **0.2.5**, the HumanEval+ dataset card (**164** examples, Apache-2.0), and GitHub metadata showing BigCodeBench **archived**. Offline smoke test: imported evalplus 0.3.1 and ran `sanitize` on a hand-written wrapped sample after loading HumanEval+.

**Not run:** model inference, full EvalPlus/BigCodeBench/LiveCodeBench evaluation jobs, Docker evaluators, Agentless SWE-bench reproduction, or any paid API. No cross-suite accuracy ranking is claimed.
