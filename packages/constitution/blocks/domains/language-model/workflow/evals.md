# Evals

> Governs how a change to what a model does travels to a release.

## Changes

### change-to-a-models-task-gated-by-its-evals · MUST

A change to a task's prompt, tools, model or settings is merged only once that task's eval reaches the threshold the project sets beyond its standard error and scores no worse than the main line by more than that noise, with its result recorded on the change.

| Why | Tags |
|---|---|
| such a change alters answers no spec covers, a reviewer can judge it only by the scores it moved, and a score from one run moves by chance. | [testing] |
