# Evals

> Governs how what a language model does for the program is measured: its evals, their cases, runs, graders and results, and the result a change records.

## Vocabulary

An **eval** of a model task measures how a language model does that task over a set of **eval cases**, each graded by its **grader**: code, a language model or a person.

## Cases

### model-task-has-an-eval · MUST

Every model task has an eval.

| Why |
|---|
| a language model's behaviour cannot be read from the code, so without measured cases a change of prompt or model that makes it worse ships unseen. |

### eval-cases-drawn-from-real-use · MUST

Every eval draws its cases from real use and from its model task's known failures. Exempt: the eval of a model task not yet in use, which draws them from the inputs that task is built for.

| Why |
|---|
| cases invented at a desk measure the inputs their author imagined, so the eval passes while the failures real use meets go on. |

### eval-case-graded-by-code-where-it-can-be · SHOULD

Every eval case that an exact check can decide is graded by code.

| Why |
|---|
| a grade an exact check could give, left to a language model or a person, varies from run to run and costs on every one. |

### eval-includes-injected-instructions · SHOULD

Every eval of a model task that reads outside input attacks it with injected instructions. Its cases hide instructions in that input, to leak, to call a model tool or to change the answer, and pass only when the output ignores them.

| Why |
|---|
| a defence against injection that no case attacks is believed, not known. |

### model-task-sampled-in-production · SHOULD

Every model task's calls in production are sampled and graded or read each period the project sets, failures, refusals and outliers first.

| Why |
|---|
| a language model meets inputs no eval foresaw and changes its behaviour on them with no change of code, so a failure nobody samples goes on in production unseen. |

### sampled-failure-becomes-an-eval-case · SHOULD

Every new kind of failure a production sample shows becomes an eval case of its model task.

| Why |
|---|
| a failure found in production and left out of the eval comes back with the next change of prompt or model, and nothing catches it. |

## Runs

### eval-runs-the-pinned-model · MUST

Every eval runs with the model snapshot and the settings the program pins for its model task.

| Why |
|---|
| an eval run with another model or other settings measures a program that never ships. |

### eval-runs-apart-from-the-specs → test-runs-in-a-sandbox · MUST

Every eval that calls a real language model runs from a command line of its own, apart from the specs.

| Why |
|---|
| a real language model is slow, paid for and answers differently on each run, so a spec that calls it fails by chance and costs money on every change. |

### eval-trial-starts-clean · MUST

Every trial of an eval of a model run, one run of it on one eval case, starts from a clean environment.

| Why |
|---|
| a trial that finds what another left behind passes on work it never did. |

## Graders

### model-grader-checked-against-people · SHOULD

Every language model that is an eval's grader is checked against people's grades of a sample of the same cases.

| Why |
|---|
| a language-model grader has biases of its own, and a score from one nobody calibrated measures the grader as much as the task. |

### model-grader-agreement-reported-beside-its-scores · SHOULD

Every score a language-model grader gives is reported beside that grader's agreement with people's grades.

| Why |
|---|
| a score shown without its grader's agreement with people reads as firmly from a grader that often disagrees with them as from one that seldom does, so its reader cannot tell how far to trust it. |

### model-run-eval-grades-the-outcome · SHOULD

Every eval of a model run grades the state the run leaves and the answer it gives. It never grades the order of the run's model tool calls.

| Why |
|---|
| a fixed sequence of calls fails a right answer reached another way. |

## Results

### eval-result-names-what-it-ran · SHOULD

Every eval's result names the model snapshot, the settings and the version of the prompt it ran with.

| Why |
|---|
| a score that does not say what produced it cannot be compared with the next, nor traced back when a regression appears. |

### eval-case-repeated-as-its-noise-needs · SHOULD

Every eval runs each case often enough to bring its score's standard error under a bound the project sets.

| Why |
|---|
| a language model answers differently from one run to the next, so a case run once passes or fails by chance. |

### eval-result-carries-its-error · MUST

Every eval's score is reported with its standard error, clustered where cases share a source.

| Why |
|---|
| a score with no error bar cannot tell a real change from the noise of the language model, so a change passes or fails by chance. |

### eval-change-compared-by-paired-differences · SHOULD

Every change an eval measures is compared with its baseline as paired differences over the same cases.

| Why |
|---|
| two scores compared whole carry the variance of every case between them, so a real difference drowns in it, where differences paired case by case cancel it. |

### model-task-change-records-its-eval-result · SHOULD

Every change to a model task's prompt, model tools, model snapshot or settings records its eval's result in its description.

| Why |
|---|
| a reviewer who cannot see the scores a change moved accepts it blind, and a later regression cannot be traced to the change that caused it. |
