# Evals

> Governs how a change to what a language model does travels to a release.

## Changes

### change-to-a-models-task-gated-by-its-evals · MUST

A change to a language model's task is merged only once its eval passes. The change is one to the task's prompt, tools, model or settings; its eval passes when it reaches the threshold the project sets beyond its standard error and scores no worse than the main line by more than that noise, and its result is recorded on the change.

| Why |
|---|
| such a change alters answers no spec covers, a reviewer can judge it only by the scores it moved, and a score from one run moves by chance. |
