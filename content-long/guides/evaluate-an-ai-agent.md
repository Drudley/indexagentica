---
id: evaluate-an-ai-agent
type: guide
title: Evaluate an AI agent with open-source eval and observability tools
summary: "A hands-on loop for agent quality: instrument with OpenTelemetry, collect traces, turn real traces into a dataset, write code, LLM-as-judge and human evaluators, run offline experiments, then monitor production and gate pull requests in CI."
description: "A practical walkthrough of the full evaluation loop for an AI agent, using code from the official docs of Langfuse, Opik and Laminar, with Braintrust where it fits. It covers tracing over OpenTelemetry, building a dataset from production traces, three kinds of evaluators, offline experiments, online scoring and a regression gate in GitHub Actions. Snippets were checked against vendor docs on 2026-10-14. To choose a platform, see the comparison of observability and eval platforms."
author: Agentica Author
difficulty: intermediate
time_estimate: 45 min
prerequisites:
  - An agent you can call as a function (any framework)
  - Python 3.10+ (examples are Python; every tool also has a TypeScript SDK)
  - An account or self-hosted instance of the platform you pick, and its API keys
tags: [evals, observability, tracing, opentelemetry, ci, llm-as-judge]
entries: [langfuse, opik, laminar, braintrust, otel-genai-semconv, openllmetry, langfuse-mcp, opik-mcp, laminar-mcp, braintrust-mcp, arize-phoenix, promptfoo, deepeval, inspect-ai]
sources:
  - {title: Langfuse observability get started, url: "https://langfuse.com/docs/observability/get-started", accessed: 2026-10-14}
  - {title: Langfuse OpenTelemetry integration, url: "https://langfuse.com/integrations/native/opentelemetry", accessed: 2026-10-14}
  - {title: Langfuse datasets, url: "https://langfuse.com/docs/evaluation/experiments/datasets", accessed: 2026-10-14}
  - {title: Langfuse evaluation overview, url: "https://langfuse.com/docs/evaluation/overview", accessed: 2026-10-14}
  - {title: Langfuse experiments in CI/CD, url: "https://langfuse.com/docs/evaluation/experiments/experiments-ci-cd", accessed: 2026-10-14}
  - {title: Opik evaluation getting started, url: "https://www.comet.com/docs/opik/evaluation/getting-started", accessed: 2026-10-14}
  - {title: Opik custom metric, url: "https://www.comet.com/docs/opik/evaluation/metrics/custom_metric", accessed: 2026-10-14}
  - {title: Opik G-Eval, url: "https://www.comet.com/docs/opik/evaluation/metrics/g_eval", accessed: 2026-10-14}
  - {title: Opik evaluate agents, url: "https://www.comet.com/docs/opik/evaluation/evaluate_agents", accessed: 2026-10-14}
  - {title: Opik annotation queues, url: "https://www.comet.com/docs/opik/evaluation/advanced/annotation_queues", accessed: 2026-10-14}
  - {title: Opik test suites, url: "https://www.comet.com/docs/opik/evaluation/advanced/building-test-suites", accessed: 2026-10-14}
  - {title: Opik online evaluation rules, url: "https://www.comet.com/docs/opik/production/online-evaluation/rules", accessed: 2026-10-14}
  - {title: Opik OpenTelemetry integration, url: "https://www.comet.com/docs/opik/integrations/opentelemetry", accessed: 2026-10-14}
  - {title: Laminar OpenAI integration, url: "https://laminar.sh/docs/integrations/openai", accessed: 2026-10-14}
  - {title: Laminar observe decorator, url: "https://laminar.sh/docs/tracing/structure/observe-decorator", accessed: 2026-10-14}
  - {title: Laminar OpenTelemetry, url: "https://laminar.sh/docs/tracing/otel", accessed: 2026-10-14}
  - {title: Laminar adding data to datasets, url: "https://laminar.sh/docs/datasets/adding-data", accessed: 2026-10-14}
  - {title: Laminar labeling queues, url: "https://laminar.sh/docs/queues/quickstart", accessed: 2026-10-14}
  - {title: Laminar evaluations quickstart, url: "https://laminar.sh/docs/evaluations/quickstart", accessed: 2026-10-14}
  - {title: Braintrust OpenTelemetry, url: "https://www.braintrust.dev/docs/integrations/sdk-integrations/opentelemetry/send-traces-and-logs", accessed: 2026-10-14}
related: [llm-red-teaming-tools, agent-observability-platforms, coding-agent-harnesses, research-agent, agent-benchmarks, data-analysis-agent, test-your-mcp-server]
last_verified: 2026-10-14
published: 2026-10-14
---

## The loop

Evaluating an agent is a cycle, not a one-off benchmark:

1. **Trace** every run, so you can see each model call, tool call and step.
2. **Collect** real traces from development and production.
3. **Curate** the interesting traces (failures, edge cases, typical requests) into a dataset with expected outputs.
4. **Score** with evaluators: deterministic code checks, LLM-as-judge and human review.
5. **Experiment** offline: run a candidate version against the dataset and compare scores.
6. **Monitor** production with online evaluators, and **gate** pull requests in CI.

The examples use [Langfuse](entry:langfuse), [Opik](entry:opik) and [Laminar](entry:laminar), all open source and self-hostable, plus [Braintrust](entry:braintrust) for OpenTelemetry. Pick one platform and follow its column through every step. Mixing platforms only makes sense at the tracing layer. To choose between them, see [Observability and eval platforms for AI agents](comparison:agent-observability-platforms).

## 1. Instrument with OpenTelemetry

All four platforms accept OTLP. Instrumenting with OpenTelemetry (with the [GenAI semantic conventions](entry:otel-genai-semconv) or [OpenLLMetry](entry:openllmetry)) keeps you portable. Each vendor also ships a thin SDK that sets OTel up for you.

**Langfuse, plain OTLP.** Point any OTel exporter at the Langfuse endpoint. `AUTH_STRING` is base64 of `public_key:secret_key`.

```bash
OTEL_EXPORTER_OTLP_ENDPOINT="https://cloud.langfuse.com/api/public/otel" # EU region
# Self-hosted (>= v3.22.0): http://localhost:3000/api/public/otel
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic ${AUTH_STRING},x-langfuse-ingestion-version=4"
```

**Langfuse SDK.** The SDK is built on OTel. Nest spans and generations around your agent's steps:

```python
from langfuse import get_client

langfuse = get_client()

with langfuse.start_as_current_observation(as_type="span", name="process-request") as span:
    span.update(output="Processing complete")
    with langfuse.start_as_current_observation(as_type="generation", name="llm-response", model="gpt-3.5-turbo") as generation:
        generation.update(output="Generated response")

langfuse.flush()  # in short-lived processes
```

**Laminar.** One call instruments supported LLM clients. `@observe()` turns your own functions into spans:

```python
from lmnr import Laminar, observe
Laminar.initialize()  # reads LMNR_PROJECT_API_KEY

@observe()
def answer_question(question: str) -> str:
    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": question}],
    )
    return response.choices[0].message.content
```

For raw OTel, Laminar's docs use the gRPC exporter at `https://api.lmnr.ai:8443/v1/traces` with a lowercase `authorization: Bearer <project key>` header.

**Braintrust.** Add its span processor to your existing tracer provider (`pip install "braintrust[otel]"`, then set `BRAINTRUST_API_KEY` and `BRAINTRUST_PARENT=project_name:my-otel-project`):

```python
from braintrust.otel import BraintrustSpanProcessor
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider

provider = TracerProvider()
trace.set_tracer_provider(provider)
provider.add_span_processor(BraintrustSpanProcessor())
```

**Opik.** Wrap the client, for example `track_openai(OpenAI())` from `opik.integrations.openai`. Opik also accepts OpenTelemetry.

Make sure a trace captures the agent's input, final output, every tool call with its arguments, and the user or session id. Those fields are what you will filter and score on later.

## 2. Build a dataset from real traces

Synthetic prompts miss the failures your users actually hit. Start from production traces: filter for low user feedback, errors or long runs, then save the trace input with a corrected expected output.

**Langfuse** links each dataset item back to its source trace:

```python
langfuse.create_dataset(name="support-agent-regression-set")

langfuse.create_dataset_item(
    dataset_name="support-agent-regression-set",
    input={"text": "hello world"},
    expected_output={"text": "hello world"},
    source_trace_id="<trace_id>",
    source_observation_id="<observation_id>",  # optional
)
```

**Opik** can search traces with a filter and push them into an annotation queue. Reviewers can then label them before you insert items into a dataset:

```python
import opik
client = opik.Opik()

queue = client.get_traces_annotation_queue("queue-id")
traces = client.search_traces(
    project_name="my-project",
    filter_string='feedback_scores.user_frustration > 0.5',
)
queue.add_traces(traces)

dataset = client.get_or_create_dataset(name="my-eval-dataset")
dataset.insert([{"input": "What is 2+2?", "expected_output": "4"}])
```

**Laminar** works mostly in the UI. Select a span and choose *Add to dataset*: the span input becomes the datapoint's `data` and the output becomes its `target`. You can also import CSV, JSON or JSONL files. A labeling queue lets humans edit and approve targets before pushing them to a dataset.

Keep the dataset small and sharp at first, a few dozen cases that each test one behaviour. Give every case a stable id in its metadata, so a CI gate can tell which case regressed.

## 3. Write evaluators

Use the cheapest evaluator that can catch the failure.

**Code checks** cover exact matches, schema validity, the right tool being called, or length limits. They are deterministic and free. In Opik, a custom metric that checks the agent's first tool call against the expected one:

```python
from opik.evaluation.metrics import base_metric, score_result

class ToolSelectionQuality(base_metric.BaseMetric):
    def __init__(self, name: str = "tool_selection_quality"):
        self.name = name

    def score(self, tool_calls, expected_tool_calls, **kwargs):
        actual = tool_calls[0]["function_name"]
        expected = expected_tool_calls[0]["function_name"]
        return score_result.ScoreResult(
            name=self.name,
            value=1 if actual == expected else 0,
            reason=f"Expected {expected}, got {actual}",
        )
```

In Laminar, an evaluator is just a function that returns a number:

```python
def accuracy(output: str, target: str) -> int:
    return 1 if target.lower() in output.lower() else 0
```

**LLM-as-judge** grades what code can't, such as faithfulness, tone or whether the question was actually answered. Opik's G-Eval takes a task introduction and criteria:

```python
from opik.evaluation.metrics import GEval

metric = GEval(
    task_introduction="You are an expert judge tasked with evaluating the faithfulness of an AI-generated answer to the given context.",
    evaluation_criteria="In the provided text the OUTPUT must not introduce new information beyond what's provided in the CONTEXT.",
)
```

Opik test suites can also take plain-language assertions, with a pass threshold over repeated runs, which smooths out judge noise:

```python
suite = opik_client.get_or_create_test_suite(
    name="my-agent-tests",
    project_name="my-agent",
    global_assertions=["The response directly addresses the user's question"],
    global_execution_policy={"runs_per_item": 2, "pass_threshold": 2},
)
result = opik.run_tests(test_suite=suite, task=task)
```

Langfuse also offers managed LLM-as-a-judge evaluators that you configure in the UI.

**Human review** calibrates the judges. Langfuse and Opik have annotation queues, and Laminar has labeling queues. Periodically send a sample of judged traces to humans and compare their verdicts with the judge's. Langfuse's score analytics reports human-versus-AI agreement directly.

## 4. Run offline experiments

An experiment runs one version of your agent over the whole dataset and records a score per item, so you can compare versions side by side.

**Opik:**

```python
from opik.evaluation import evaluate
from opik.evaluation.metrics import Hallucination

def task(item):
    return {"output": call_agent(item["input"])}

evaluate(
    dataset=dataset,
    task=task,
    scoring_metrics=[Hallucination()],
    experiment_name="my-experiment-v1",
)
```

**Laminar:** `evaluate()` initializes tracing itself, so each datapoint gets a full trace next to its scores:

```python
from lmnr import evaluate

evaluate(
    data=[{"data": {"country": "France"}, "target": "Paris"}],
    executor=capital_of_country,
    evaluators={"accuracy": accuracy},
    name="Capitals v1",
    group_name="capitals",
)
```

Put the files under `evals/` and run them with `lmnr eval`, which picks up every `eval_*.py` or `*_eval.py` file.

Change one thing per experiment (prompt, model, tool description) and name runs after that change. Then the comparison view tells you what caused the difference.

## 5. Monitor online and gate in CI

**Online scoring.** Run LLM-as-judge on live traffic at a sampling rate you can afford. In Opik, online evaluation rules are set up per project in the UI or the REST API, with a sampling percentage. Langfuse runs the same managed evaluators on incoming traces. Alert on falling scores and feed bad traces back into step 2.

**Regression gate.** Langfuse publishes a GitHub Action that runs an experiment script on every pull request, comments the scores on the PR, and fails the job when the script raises `RegressionError`:

```yaml
# .github/workflows/eval.yml
on: pull_request
permissions: {contents: read, pull-requests: write}
jobs:
  experiment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-python@v6
        with: {python-version: "3.14"}
      - uses: langfuse/experiment-action@<release tag>
        with:
          langfuse_public_key: ${{ secrets.LANGFUSE_PUBLIC_KEY }}
          langfuse_secret_key: ${{ secrets.LANGFUSE_SECRET_KEY }}
          langfuse_base_url: https://cloud.langfuse.com
          experiment_path: experiments/support-agent-gate
          dataset_name: support-agent-regression-set
          github_token: ${{ github.token }}
```

```python
# experiments/support-agent-gate.py
from langfuse import Evaluation, RegressionError, RunnerContext

THRESHOLD = 0.95

def experiment(context: RunnerContext):
    result = context.run_experiment(
        name="PR gate: support agent",
        task=answer_support_question,
        evaluators=[exact_match],
        run_evaluators=[avg_accuracy],
    )
    accuracy = next((e.value for e in result.run_evaluations if e.name == "avg_accuracy"), None)
    if not isinstance(accuracy, (int, float)) or accuracy < THRESHOLD:
        raise RegressionError(result=result, metric="avg_accuracy",
                              value=float(accuracy or 0.0), threshold=THRESHOLD)
    return result

def answer_support_question(item, **kwargs):
    return my_agent(item.input["question"])  # your agent

def exact_match(*, output, expected_output, **kwargs):
    passed = output.strip() == (expected_output or "").strip()
    return Evaluation(name="exact_match", value=1.0 if passed else 0.0)

def avg_accuracy(*, item_results, **kwargs):
    scores = [e.value for i in item_results for e in i.evaluations if e.name == "exact_match"]
    return Evaluation(name="avg_accuracy", value=sum(scores) / len(scores) if scores else 0.0)
```

Langfuse's docs recommend two gate policies: required cases must always pass, and cases that passed in an approved baseline must not start failing. They also say missing cases, task errors and invalid evaluator results should fail the gate rather than be skipped. Without the action, the same check works as a plain pytest or Vitest test around `langfuse.run_experiment(...)`, or around Opik's `run_tests` with `pass_rate`.

## Pitfalls

- **Judge drift.** Pin the judge model and prompt version, and store the evaluator version in experiment metadata.
- **Leaky datasets.** Don't tune prompts on the same cases that gate CI. Keep a held-out set.
- **Non-determinism.** Run flaky cases several times and use a pass threshold, not a single sample.
- **Cost.** Online judges on 100% of traffic get expensive. Sample, and score cheaply with code checks first.

## Going further

Each platform also exposes its traces to coding agents over MCP: [Langfuse MCP](entry:langfuse-mcp), [Opik MCP](entry:opik-mcp), [Laminar MCP](entry:laminar-mcp) and [Braintrust MCP](entry:braintrust-mcp). An agent can then pull failing traces and propose dataset items. For local, framework-style test runners without a platform, look at [promptfoo](entry:promptfoo), [DeepEval](entry:deepeval) or [Inspect](entry:inspect-ai).
