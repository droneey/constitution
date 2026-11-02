# Evals

> Governs how what a language model does for the program is measured: its cases, its runs, graders and results.

## Cases

### model-task-has-an-eval · MUST

Each task a language model does for the program has an eval. Its cases are drawn from real use and from known failures, each with a grader, written as code wherever an exact check can decide; it runs with the pinned model and its settings, and its result names them and the version of the prompt.

| Why |
|---|
| a language model's behaviour cannot be read from the code, so without measured cases a change of prompt or model that makes it worse ships unseen. |

### eval-includes-injected-instructions · SHOULD

The eval of a task that reads others' text attacks it with injected instructions. Its cases hide instructions in that text — to leak, to call a tool, to change the answer — and pass only when the output ignores them.

| Why |
|---|
| a defence against injection that no case attacks is believed, not known. |

### model-task-sampled-in-production · SHOULD

Each task's runs in production are sampled and read. A sample of them — failures, refusals and outliers first — is graded or read each period the project sets, and every new kind of failure becomes a case of its eval; the sample is kept apart from the telemetry, in a store of its own, under the consent and the mask its data needs.

| Why |
|---|
| a language model meets inputs no eval foresaw and changes its behaviour on them with no change of code, so a failure nobody samples goes on in production unseen. |

## Runs

### eval-runs-apart-from-the-specs → test-runs-in-a-sandbox · MUST

An eval that calls a real language model runs apart from the specs. A spec replaces the model with scripted or recorded answers, and such an eval runs by a command of its own.

| Why |
|---|
| a real language model is slow, paid for and answers differently on each run, so a spec that calls it fails by chance and costs money on every change. |

## Graders

### model-grader-checked-against-people · SHOULD

A language model that grades an eval is checked against people's grades. People grade a sample of the same cases, and the grader's agreement with them is reported beside its scores.

| Why |
|---|
| a language-model grader has biases of its own, and a score from one nobody calibrated measures the grader as much as the task. |

### agent-eval-grades-the-outcome · SHOULD

An agent's eval grades the outcome, not the path. It grades the state the agent leaves and the answer it gives, not the order of its tool calls, and starts each trial from a clean environment.

| Why |
|---|
| a fixed sequence of calls fails a right answer reached another way, and a trial that finds what another left behind passes on work it never did. |

## Results

### eval-result-carries-its-error · MUST

An eval's score carries its standard error. The eval runs each case as many times as its noise needs, reports each score with its standard error, clustered where cases share a source, and compares a change with its baseline as paired differences over the same cases.

| Why |
|---|
| a language model answers differently from one run to the next, so a score from one run passes or fails a change by chance. |
