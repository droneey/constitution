# Evals

> Governs how a change to what a language model does travels to acceptance.

## Changes

### change-to-a-models-task-gated-by-its-evals · MUST

Every change to a model task's prompt, model tools, model snapshot or settings is accepted only once its eval passes. A version in a prompt registry is accepted when it takes the label production reads. Its eval passes when it reaches the threshold the project sets beyond its standard error and scores no worse than the accepted version by more than that noise.

#### Why

Such a change alters answers no spec covers, a reviewer can judge it only by the scores it moved, and a score from one run moves by chance.

#### Examples

```text title="Avoid"
$ prompts label triage-ticket v14 --as production
production -> v14
```

```text title="Prefer"
$ eval triage-ticket --prompt v14
threshold          0.85
v14                0.91 ± 0.02   passes
v13 (accepted)     0.90 ± 0.02   no worse

$ prompts label triage-ticket v14 --as production
production -> v14
```
