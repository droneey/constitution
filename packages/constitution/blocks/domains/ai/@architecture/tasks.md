# Tasks

> Governs where a language model is reached: through a port of its model task.

## General

### model-reached-through-a-port-of-its-task → port-declared-by-the-layer-that-needs-it · SHOULD

Every language model is reached through a port of its model task, never through one of the model. The port is declared for one model task in the feature's own words, such as one to summarise a ticket or to classify a message, never as a general contract of prompts and completions.

| Why |
|---|
| the task outlives its language model, so a port shaped as a model's prompts and completions changes with each model and leaves every caller to write the prompt its task needs — ports and adapters. |
