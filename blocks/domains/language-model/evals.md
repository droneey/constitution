# Evals

> Governs how what a model does for the program is measured: its cases, graders and results.

## Cases

### model-task-has-an-eval · MUST
Each task a model does for the program has an eval — cases drawn from real use and from known failures, each with a grader, written as code wherever an exact check can decide — run with the pinned model and its settings, its result naming them and the version of the prompt.

| Why | Tags |
|---|---|
| a model's behaviour cannot be read from the code, so only measured cases show whether a change of prompt or model made it better or worse. | [testing] |

### eval-includes-injected-instructions · SHOULD
The eval of a task that reads text others wrote has cases that hide instructions in that text — to leak, to call a tool, to change the answer — and passes them only when the output ignores them.

| Why | Tags |
|---|---|
| a defence against injection that no case attacks is believed, not known. | [security, testing] |

## Graders

### model-grader-checked-against-people · SHOULD
A model that grades an eval is checked against grades people gave to a sample of the same cases, and its agreement with them is reported beside its scores.

| Why | Tags |
|---|---|
| a model grader has biases of its own, and a score from one nobody calibrated measures the grader as much as the task. | [testing] |
