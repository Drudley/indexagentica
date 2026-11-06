---
id: newer-agent-eval-sets
type: comparison
title: Newer agent eval sets for data, terminals and multi-agent conflict
summary: "AgenticDataBench, TermGrade and CLASHarness compared: what each measures, task counts, how scoring works, how to run them, and licenses. Cross-links the broader agent-benchmarks comparison."
description: "A focused comparison of three late-2026 evaluation resources that are not yet rows in agent-benchmarks: AgenticDataBench (344 data-science tasks over 97 datasets with 433 skill labels), TermGrade (1,004 pytest-verified Linux terminal environments plus 36,144 graded trajectories), and CLASHarness (600 verifiable multi-agent computer-use conflict episodes). Numbers and licenses are taken from each project's paper, site, GitHub README and Hugging Face cards, checked on 2026-11-06."
author: Agentica Author
tags: [benchmarks, evaluation, data-agents, terminal-agents, multi-agent, computer-use]
entries: [agenticdatabench, termgrade, clasharness]
related: [agent-benchmarks, evaluate-an-ai-agent]
subjects: [agenticdatabench, termgrade, clasharness]
criteria:
  - Measures
  - Tasks
  - Verifier
  - How to run
  - License
  - Extra releases
rows:
  agenticdatabench:
    Measures: "LLM data agents on realistic data-science workflows across 15 domains (including B2B fintech), with skill-level scores"
    Tasks: "344 tasks over 97 real datasets covering 433 skills; 98 tasks withheld as a private test set (246 public in the open testbed)"
    Verifier: "Per-task evaluation function against a gold file (for example compare_csv on named columns); leaderboard submissions by email"
    How to run: "Clone AgenticDataBench/AgenticDataBench; datasets on Hugging Face shawnzzzh/AgenticDataBench; open testbed under testbed/; baselines use harnesses such as smolagents, DA-Agent, Claude Code and Codex"
    License: "Code Apache-2.0; Hugging Face dataset card apache-2.0"
    Extra releases: "Skill-cluster tooling and an LLM task generator in-repo; paper arXiv 2607.01647"
  termgrade:
    Measures: "Executable Linux terminal agents; each task carries a measured pass rate per model rather than a hand-chosen difficulty label"
    Tasks: "1,004 environments (container + instruction + pytest verifier), kept only if the reference solution passes"
    Verifier: "pytest via tests/test.sh inside the container; the image ships without tests so the agent cannot read them; suite is copied in at scoring time"
    How to run: "Hugging Face ai-and/termgrade-environments; build base image dsbase-venv312:local, then each task Dockerfile; grade with Terminus-2 via Harbor (as used for the release)"
    License: "Apache-2.0 (environments and trajectories cards)"
    Extra releases: "36,144 graded trajectories (21,910 passes as SFT, 14,234 failures kept); gemma-4-31B-it LoRA/merged checkpoint; +3.1 on Terminal-Bench 2.1 in their RL report"
  clasharness:
    Measures: "Multi-agent conflict resolution in computer-use settings: stale sub-agent reports, contradictory instructions, shared locks, cross-modal mismatches"
    Tasks: "600 evaluation episodes (10 rounds × 60 packages from 20 conflict seeds); difficulty bands 236 / 224 / 140"
    Verifier: "Verifiable by construction: ground truth pre-committed, reference trajectory executed, hybrid code and semantic graders compiled from observable side effects"
    How to run: "Python 3.11+; pip install -e '.[dev]' from google-research/CLASHarness; download tasks-v8 / splits-v8 from Hugging Face yuxianglai117/CLASHarness; evaluate with --split total"
    License: "Code Apache-2.0; dataset CC-BY-4.0"
    Extra releases: "Generation harness and conflict plugins; recorded trajectories for 15 frontier models; paper arXiv 2610.19128"
verdict: "Use AgenticDataBench when you need skill-level scores on data-science agents, TermGrade when you need pytest-verified terminal tasks with full pass and fail trajectories, and CLASHarness when the failure mode you care about is multi-agent conflict under computer use. For SWE-bench, Terminal-Bench, GAIA and similar older suites, start from the agent-benchmarks comparison."
sources:
  - title: AgenticDataBench site
    url: https://agenticdatabench.github.io/
    accessed: 2026-11-06
  - title: AgenticDataBench GitHub README
    url: https://github.com/AgenticDataBench/AgenticDataBench
    accessed: 2026-11-06
  - title: "AgenticDataBench paper (arXiv 2607.01647)"
    url: https://arxiv.org/abs/2607.01647
    accessed: 2026-11-06
  - title: AgenticDataBench on Hugging Face
    url: https://huggingface.co/datasets/shawnzzzh/AgenticDataBench
    accessed: 2026-11-06
  - title: "TermGrade announcement (ai&)"
    url: https://www.aiand.com/newsroom/termgrade
    accessed: 2026-11-06
  - title: termgrade-environments on Hugging Face
    url: https://huggingface.co/datasets/ai-and/termgrade-environments
    accessed: 2026-11-06
  - title: termgrade-trajectories on Hugging Face
    url: https://huggingface.co/datasets/ai-and/termgrade-trajectories
    accessed: 2026-11-06
  - title: CLASHarness GitHub README
    url: https://github.com/google-research/CLASHarness
    accessed: 2026-11-06
  - title: "CLASHarness paper (arXiv 2610.19128)"
    url: https://arxiv.org/abs/2610.19128
    accessed: 2026-11-06
  - title: CLASHarness on Hugging Face
    url: https://huggingface.co/datasets/yuxianglai117/CLASHarness
    accessed: 2026-11-06
last_verified: 2026-11-06
published: 2026-11-06
updated: 2026-11-06
---

## Why these three

The [agent benchmarks comparison](comparison:agent-benchmarks) covers established suites such as SWE-bench and Terminal-Bench. These three arrived later and fill gaps that comparison does not yet list:

- **Data-science agents** that have to explore messy tables, not only write code against a fixed repo
- **Terminal agents** graded with real pytest verifiers and released with every failing trajectory
- **Multi-agent computer-use conflict**, where the hard part is fixing shared state, not only spotting a contradiction

They are different jobs. The table above is for picking which corpus to run, not for ranking models across them.

## AgenticDataBench

Paper arXiv 2607.01647 (Tsinghua University and Ant Digital Technologies). The abstract and body state **97 real datasets** across **15 domains**, **344** tasks covering **433** skills. The public GitHub README withholds **98** tasks for leaderboard integrity; the open `testbed/tasks/dev.jsonl` we fetched held **246** lines (344 − 98). Site metadata also says "344 tasks across 15 domains".

Each public task carries a question, data sources, skill labels, a gold file and an `eval_func` (for example `compare_csv(...)`). Scoring is therefore programmatic against gold, not an LLM judge. Leaderboard results are emailed to the address on the project site. Code is Apache-2.0; the Hugging Face dataset card is `apache-2.0`.

We did not re-run agents. The paper reports baselines on smolagents, DA-Agent, Claude Code and Codex with several frontier models.

## TermGrade

Released by ai& on 2026-10-08. **1,004** environments, each a container, an instruction and a **pytest** verifier, kept only when the reference solution passes. Six models were graded with the Terminus-2 scaffold via Harbor, producing **36,144** trajectories: **21,910** passes (usable as SFT) and **14,234** failures kept in full with per-test verdicts. Both Hugging Face cards are Apache-2.0.

Their RL write-up reports **+3.1** on Terminal-Bench 2.1 for a gemma-4-31B-it run trained on mid-pass-rate tasks. That figure is theirs; we did not reproduce it. The environments README shows an offline loop: build the base image, build a task image, run `solution/solve.sh`, copy tests in, run `tests/test.sh`, read `/logs/verifier/reward.txt`.

## CLASHarness

Google Research, paper arXiv 2610.19128. **600** multi-round episodes in stateful computer-use environments with mock sub-agents, approvals, locks and background daemons. Tasks are **verifiable by construction**: ground truth is pre-committed, a reference trajectory is executed, and hybrid code/semantic graders are compiled from side effects. Difficulty bands across the 600 episodes are **236 / 224 / 140**. Code is Apache-2.0; the Hugging Face dataset is CC-BY-4.0.

The README's reported panel of 15 frontier models finds that fixing state is harder than spotting conflicts, with high failure rates on closing actions such as releasing locks (they cite **58%–72%** failure on one closing-handover category). Treat those model scores as the authors' panel, not a re-run.

Quick start: Python 3.11+, `pip install -e ".[dev]"`, download `tasks-v8` / `splits-v8` from Hugging Face, evaluate with `--split total`.

## How this fits the rest of the site

- Broader suite landscape: [Agent benchmarks](comparison:agent-benchmarks)
- Building an eval harness in general: [Evaluate an AI agent](guide:evaluate-an-ai-agent)

## What we verified

Checked on 2026-11-06 against each project's primary sources listed above, including the AgenticDataBench PDF, the public `dev.jsonl` task count, TermGrade and CLASHarness READMEs and Hugging Face cards. We did not download full datasets end-to-end or run any agent. An "AgenticDataBench v1.1" label appears in some secondary write-ups; we did not find a clear v1.1 tag in the paper or README, so this page does not claim a version string.
