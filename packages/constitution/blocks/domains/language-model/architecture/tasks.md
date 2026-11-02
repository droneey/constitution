# Tasks

> Governs where a language model is reached: through a port of its task.

## General

### model-reached-through-a-port-of-its-task → port-knows-no-vendor · MUST

A language model is reached through a port of its task, never through one of the model. The port is declared for one task in the feature's own words — to summarise a ticket, to classify a message —, never as a general contract of prompts and completions.

| Why |
|---|
| the task outlives its language model, so a port shaped as a model's prompts and completions changes with each model and leaves every caller to write the prompt its task needs — ports and adapters. |
