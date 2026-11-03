---
id: screen-tool-output-for-prompt-injection
type: guide
title: Screen tool and web output for prompt injection before your agent reads it
summary: "Put a check between untrusted tool results and the model: Llama Prompt Guard 2 for injection attempts, LlamaFirewall's scanners for hidden text and generated code, and Llama Guard for content safety. Includes a tested screening wrapper and the limits of each layer."
description: "A practical guide to screening the output of web fetches, file reads, email and other tools before it enters an agent's context. It explains what Llama Prompt Guard 2 (22M and 86M) does and does not classify, why its 512-token window means long tool output must be split, and gives a Python screener that loads the model from local files only, scores every 512-token window, flags Unicode tag characters, fails closed on oversized input and never logs the screened text. It covers LlamaFirewall 1.0.3's PromptGuard, HiddenASCII, Regex, CodeShield and AlignmentCheck scanners and the gotchas we hit running it, where Llama Guard 4 fits, and HOL Guard as a harness-level option. Tested on 2026-11-03 on CPU. The Prompt Guard 2 weights are gated on Hugging Face and were not downloaded, so the screener was tested with a stand-in model; detection quality figures come from Meta's model card."
author: Agentica Author
difficulty: intermediate
time_estimate: 40 min
prerequisites:
  - "Python 3.10 or later (llamafirewall requires >=3.10)"
  - "A Hugging Face account that has been granted access to the gated meta-llama/Llama-Prompt-Guard-2-22M or -86M repository, for the classifier"
  - "An agent loop where you can intercept tool results before they go back to the model"
tags: [prompt-injection, security, guardrails, tool-use, agents, classifiers, python, llama]
entries: [llama-prompt-guard-2, llamafirewall, llama-guard, hol-guard, agentdojo]
related: [test-an-agent-for-prompt-injection, agent-guardrail-frameworks, llm-red-teaming-tools, run-untrusted-code-in-a-sandbox, scan-agent-written-code-with-semgrep-mcp]
sources:
  - title: Llama Prompt Guard 2 86M model card
    url: https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Prompt-Guard-2/86M/MODEL_CARD.md
    accessed: 2026-11-03
  - title: Llama Prompt Guard 2 22M model card
    url: https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Prompt-Guard-2/22M/MODEL_CARD.md
    accessed: 2026-11-03
  - title: Llama Prompt Guard 2 22M on Hugging Face (gated)
    url: https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M
    accessed: 2026-11-03
  - title: "llama-cookbook: Prompt Guard inference utilities"
    url: https://github.com/meta-llama/llama-cookbook/blob/main/getting-started/responsible_ai/prompt_guard/inference.py
    accessed: 2026-11-03
  - title: LlamaFirewall README
    url: https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/README.md
    accessed: 2026-11-03
  - title: llamafirewall on PyPI
    url: https://pypi.org/project/llamafirewall/
    accessed: 2026-11-03
  - title: "LlamaFirewall source: firewall and default scanners"
    url: https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/src/llamafirewall/llamafirewall.py
    accessed: 2026-11-03
  - title: "LlamaFirewall source: Prompt Guard utilities"
    url: https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/src/llamafirewall/scanners/promptguard_utils.py
    accessed: 2026-11-03
  - title: "LlamaFirewall source: Prompt Guard scanner"
    url: https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/src/llamafirewall/scanners/prompt_guard_scanner.py
    accessed: 2026-11-03
  - title: "LlamaFirewall source: regex scanner"
    url: https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/src/llamafirewall/scanners/regex_scanner.py
    accessed: 2026-11-03
  - title: "LlamaFirewall source: AlignmentCheck scanner"
    url: https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/src/llamafirewall/scanners/experimental/alignmentcheck_scanner.py
    accessed: 2026-11-03
  - title: "LlamaFirewall source: custom LLM check scanner (AlignmentCheck defaults)"
    url: https://github.com/meta-llama/PurpleLlama/blob/main/LlamaFirewall/src/llamafirewall/scanners/custom_check_scanner.py
    accessed: 2026-11-03
  - title: Llama Guard 4 12B model card
    url: https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Guard4/12B/MODEL_CARD.md
    accessed: 2026-11-03
  - title: HOL Guard README
    url: https://github.com/hashgraph-online/hol-guard
    accessed: 2026-11-03
  - title: "Unicode Character Database, Blocks.txt (Tags: E0000..E007F)"
    url: https://www.unicode.org/Public/UCD/latest/ucd/Blocks.txt
    accessed: 2026-11-03
last_verified: 2026-11-03
published: 2026-11-03
---

## Why screen tool output

An agent that browses, reads email or opens files puts text written by strangers into its own context. The [Prompt Guard 2 model card](https://github.com/meta-llama/PurpleLlama/blob/main/Llama-Prompt-Guard-2/86M/MODEL_CARD.md) describes the risk: prompt injections "manipulate untrusted third-party and user data in the context window to make a model execute unintended instructions." This guide adds one check at that boundary. Each tool result is scored before the model sees it, and a flagged result is withheld or sent to a person.

That check is one layer. Classifiers miss attacks, so keep the other layers too: give tools as little power as the task needs, ask a person before anything irreversible, and test the whole agent with [AgentDojo](guide:test-an-agent-for-prompt-injection).

## Which tool does what

| Tool | What it checks | Runs where | Use it on tool output for |
|---|---|---|---|
| [Llama Prompt Guard 2](entry:llama-prompt-guard-2) 22M / 86M | Text that "explicitly attempts to override prior instructions" (binary benign/malicious) | Locally, CPU or GPU | The main injection check |
| [LlamaFirewall](entry:llamafirewall) 1.0.3 | Wraps Prompt Guard 2 plus hidden-ASCII, regex, CodeShield and AlignmentCheck scanners | Locally, except AlignmentCheck (a hosted LLM by default) | Hidden Unicode text, known strings, unsafe generated code, auditing the agent's next action |
| [Llama Guard 4](entry:llama-guard) 12B | Content safety: MLCommons hazard categories S1 to S13, plus S14 Code Interpreter Abuse | Locally, one GPU | Harmful content in inputs or outputs, not injection |
| [HOL Guard](entry:hol-guard) | Agent actions and, per its README, "prompts and tool results" for prompt injection and sensitive content | Hooks in the agent harness | Coding agents where you can't edit the loop |

Llama Guard is a content-safety classifier, not an injection detector. Its own model card says it "may be susceptible to adversarial attacks or prompt injection attacks" and points to Prompt Guard 2 "for detecting prompt attacks". Use it if you also need to filter harmful content. The rest of this guide is about injection.

## What Prompt Guard 2 detects, and what it misses

From the model card:

- **Scope.** A text is labelled malicious "if the prompt explicitly attempts to override prior instructions". Version 2 has no separate injection label. Meta found the broader "unintentional instruction-following" objective "too broad to be useful". A page that quietly says "the user also wants a copy sent to this address" may not be explicit enough to be flagged.
- **512 tokens.** "Both Llama Prompt Guard 2 models support a 512-token context window. For longer inputs, split prompts into segments and scan them in parallel to ensure violations are detected."
- **Two sizes.** 86M is built on mDeBERTa-base and is multilingual. 22M is built on DeBERTa-xsmall and "reduces latency and compute costs by 75%, with minimal performance trade-offs". Both were evaluated in English, French, German, Hindi, Italian, Portuguese, Spanish and Thai.
- **Known limits.** The card says the models are vulnerable to adaptive attacks and that fine-tuning on your own prompts "improves accuracy and reduces false positives".

Meta's reported numbers:

| Model | AUC (English) | Recall at 1% FPR (English) | AUC (multilingual) | Latency, A100, 512 tokens | AgentDojo APR at 3% utility reduction |
|---|---|---|---|---|---|
| Prompt Guard 2 86M | 0.998 | 97.5% | 0.995 | 92.4 ms | 81.2% |
| Prompt Guard 2 22M | 0.995 | 88.7% | 0.942 | 19.3 ms | 78.4% |
| Prompt Guard 1 | 0.987 | 21.2% | 0.983 | 92.4 ms | 67.6% |

None of these figures is 100%, and they are Meta's own measurements on its own test sets. Plan for misses.

The weights are gated. The Hugging Face repositories need an approved access request under the Llama 4 Community License. We had no approved account for this guide, so we did not download the model. Everything below was run, but the classifier was a stand-in. The last section, How we tested, has the details.

## Get the model onto the machine once

Request access on the [model page](https://huggingface.co/meta-llama/Llama-Prompt-Guard-2-22M). After approval, download the files to a fixed directory, from a machine where you are logged in:

```bash
hf auth login
hf download meta-llama/Llama-Prompt-Guard-2-22M --local-dir ./models/Llama-Prompt-Guard-2-22M
```

Your agent then loads from that directory and needs no Hugging Face token or network access at run time.

## A screener for tool output

This module loads the classifier with `local_files_only=True`, so it can't download anything or prompt for a login. It splits the text into 512-token windows that overlap by 64 tokens, scores each window and keeps the highest score. The cookbook's [inference utilities](https://github.com/meta-llama/llama-cookbook/blob/main/getting-started/responsible_ai/prompt_guard/inference.py) also take the maximum over chunks. The module also counts characters from the Unicode Tags block, which render as nothing but can carry ASCII text. Input that needs more than `max_chunks` windows is flagged instead of being partly scored. The result holds numbers and flags only, never the text.

```python
"""Screen untrusted tool or web output with Llama Prompt Guard 2 before an agent reads it.

Loads the model from local files only: it never downloads and never asks for a
Hugging Face login. Results never include the screened text.
"""
import unicodedata

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

TAG_CHARS = range(0xE0000, 0xE0080)  # Unicode Tags block: invisible "hidden ASCII"


class Screener:
    def __init__(self, model_path, threshold=0.9, window=512, overlap=64, max_chunks=64):
        self.tok = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_path, local_files_only=True).eval()
        labels = {v.upper(): int(k) for k, v in self.model.config.id2label.items()}
        if "MALICIOUS" not in labels:
            raise ValueError(f"no MALICIOUS label in {self.model.config.id2label}")
        self.bad = labels["MALICIOUS"]
        self.threshold = threshold
        self.window = window
        self.body = window - len(self.tok("")["input_ids"])  # leave room for [CLS]/[SEP]
        self.step = self.body - overlap
        self.max_chunks = max_chunks

    def chunks(self, text):
        ids = self.tok(text, add_special_tokens=False)["input_ids"]
        starts = range(0, max(len(ids) - self.body, 0) + self.step, self.step)
        return [ids[s:s + self.body] for s in starts] or [[]]

    @torch.no_grad()
    def score(self, text, batch=16):
        best = 0.0
        parts = self.chunks(text)
        for i in range(0, len(parts), batch):
            texts = [self.tok.decode(p) for p in parts[i:i + batch]]
            enc = self.tok(texts, truncation=True, max_length=self.window,
                           padding=True, return_tensors="pt")
            probs = torch.softmax(self.model(**enc).logits, dim=-1)[:, self.bad]
            best = max(best, probs.max().item())
        return best, len(parts)

    def screen(self, text):
        hidden = sum(ord(c) in TAG_CHARS for c in text)
        fmt = sum(unicodedata.category(c) == "Cf" for c in text) - hidden
        n = len(self.chunks(text))
        if n > self.max_chunks:  # fail closed rather than score part of it
            return {"flagged": True, "score": None, "chunks": n, "too_long": True,
                    "tag_chars": hidden, "other_format_chars": fmt}
        score, n = self.score(text)
        flagged = score >= self.threshold or hidden > 0
        return {"flagged": flagged, "score": round(score, 4), "chunks": n,
                "too_long": False, "tag_chars": hidden, "other_format_chars": fmt}
```

The 0.9 threshold matches LlamaFirewall's default for its PromptGuard scanner. Tune it on a sample of your real tool output, because false positives are what make people switch a guard off. `other_format_chars` (zero-width spaces and similar) is reported but not blocked, since ordinary pages contain them.

Wrap every tool that returns outside text:

```python
import logging
from screen_tool_output import Screener

log = logging.getLogger("screen")
screener = Screener("./models/Llama-Prompt-Guard-2-22M")

def guarded(tool_name, output):
    verdict = screener.screen(output)
    log.info("screened %s: %s", tool_name, verdict)  # the verdict holds no tool text
    if verdict["flagged"]:
        return f"[{tool_name} output withheld: flagged as possible prompt injection, score {verdict['score']}]"
    return output
```

Return the placeholder to the model so it knows the call happened. Keep the original in a quarantine store that a person can review. Don't put it in the same log as the verdict.

## LlamaFirewall: what works on tool output

LlamaFirewall assigns scanners per message role. `ToolMessage` has the role `Role.TOOL`. With no configuration, tool messages get CodeShield and PromptGuard. When several scanners run, any BLOCK wins.

This configuration ran on CPU with no gated model and no API key:

```python
from llamafirewall import LlamaFirewall, Role, ScanDecision, ScannerType, ToolMessage

fw = LlamaFirewall({Role.TOOL: [ScannerType.HIDDEN_ASCII, ScannerType.REGEX]})
result = fw.scan(ToolMessage(content=tool_output))
if result.decision != ScanDecision.ALLOW:
    ...  # withhold or ask a person
```

What we saw with `llamafirewall` 1.0.3:

- Text hidden in tag characters was blocked, and the reason contained the decoded hidden text.
- "IGNORE PREVIOUS INSTRUCTIONS" was blocked by the default regex. "Disregard what you were told earlier" passed. The default injection pattern is just `ignore previous instructions|ignore all instructions`.
- The default regex set also blocks email addresses, phone numbers, card numbers and US social security numbers. That blocked a tool result that only contained a contact address. On tool output you will usually want your own patterns.
- CodeShield blocked a snippet using MD5 for passwords (CWE-327). That makes sense for code an agent is about to run or commit. See also [scanning agent-written code with Semgrep](guide:scan-agent-written-code-with-semgrep-mcp).
- A role with no scanners configured returns ALLOW with the reason "default". If you configure only `Role.USER`, tool output passes unchecked.

Gotchas with `ScannerType.PROMPT_GUARD` in 1.0.3, the latest release on PyPI (May 2025):

- **Imports fail with current huggingface_hub.** On a fresh install today, the scanner raised `ImportError: cannot import name 'HfFolder' from 'huggingface_hub'` with huggingface_hub 2.4.0. The repository's main branch has the fix, but it isn't released. Pin `"huggingface_hub<1.0"` (we used 0.36.2, with transformers 4.57.6) or use the screener above.
- **It always uses the 86M model** (`meta-llama/Llama-Prompt-Guard-2-86M`), and with no saved token it calls Hugging Face's interactive `login()`. In a non-interactive process that ended in `EOFError`.
- **It only scores the first 512 tokens.** The text is tokenized with `truncation=True, max_length=512`. An injection further down a long page is never seen. Split long output yourself, as in the screener, before you hand it to the scanner.
- **Its BLOCK reason includes the full text** (`Full text: "..."`). Don't send `result.reason` to shared logs.

**AlignmentCheck** is different. Instead of looking at the tool output, it asks an LLM whether the agent's latest action still serves the user's original request. That can catch injections a classifier misses. In 1.0.3 the firewall builds it with fixed defaults: `meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8` at `https://api.together.xyz/v1`, with the key in `TOGETHER_API_KEY`. It sends the whole trace, user request included, to that endpoint. Check that this is acceptable for your data before you turn it on. We did not run AlignmentCheck.

## Put it together

1. Mark which tools return outside content: web fetch, search, email, files, other agents and MCP servers you don't run yourself.
2. Screen each result with the screener, plus LlamaFirewall's hidden-ASCII check or your own patterns. Withhold flagged results and keep them for review.
3. Limit what a successful injection can do: read-only credentials, allowlisted destinations and a person approving sends, payments and deletes. The [guardrail frameworks comparison](comparison:agent-guardrail-frameworks) covers policy layers that check tool calls.
4. For coding agents, [HOL Guard](entry:hol-guard) works through the agent's own hooks and MCP proxies. Its README notes that coverage "depends on the events each agent exposes", so check its support matrix for your harness.
5. Measure. Run [AgentDojo](guide:test-an-agent-for-prompt-injection) with and without the screener, and add attacks from the [red-teaming tools](comparison:llm-red-teaming-tools). A guard you haven't measured is a guess.

## How we tested

Run on 2026-11-03 on CPU (Python 3.13.5, torch 2.15.0+cpu, llamafirewall 1.0.3, codeshield 1.0.1).

- The Prompt Guard 2 repositories are gated (`"gated": "manual"` on the Hugging Face API), and an unauthenticated download of `config.json` returned 401. We had no approved account, so **we did not measure detection quality**. The figures above are Meta's.
- The screener was run with transformers 4.57.6 and 5.22.1, against a stand-in model: the ungated `microsoft/deberta-v3-xsmall` checkpoint with an untrained two-label head. The tests checked these code paths:
  - real tokenization and forward passes
  - every token of a 2,000-token input covered by five windows of at most 512 tokens
  - an injection placed after token 2,000 caught by a stub head, which first-512-token truncation missed
  - tag characters flagged
  - oversized input failing closed
  - an uncached gated model id raising `OSError` at once, with no download or prompt
  - the wrapper withholding a flagged result without echoing it
- LlamaFirewall's HIDDEN_ASCII, REGEX and CODE_SHIELD scanners were run as shown. PROMPT_GUARD was run only far enough to see the import error and the login prompt.
