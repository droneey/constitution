# Evals

> Governs how a change to what a language model does travels to acceptance.

## Changes

### change-to-a-models-task-gated-by-its-evals · MUST

Every change to a model task's prompt, model tools, model snapshot or settings is accepted only once its eval passes. A version in a prompt registry is accepted when it takes the label production reads. Its eval passes when it reaches the threshold the project sets beyond its standard error and scores no worse than the accepted version by more than that noise.

| Why |
|---|
| such a change alters answers no spec covers, a reviewer can judge it only by the scores it moved, and a score from one run moves by chance. |
