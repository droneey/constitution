# Language model

> Governs how a change to what a model does travels to a release.

## Changes

### change-to-a-models-task-gated-by-its-evals · MUST
A change to a task's prompt, tools, model or settings is merged only once that task's eval passes at the threshold the project sets, with its result recorded on the change.

| Why | Tags |
|---|---|
| such a change alters answers no spec covers, and a reviewer can judge it only by the scores it moved. | [testing] |
