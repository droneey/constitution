# Tasks

> Governs where a model is reached: through a port of its task.

## General

### model-reached-through-a-port-of-its-task → contract-knows-no-vendor · MUST

A model is reached through a port the domain declares for the task in its own words — `classify_question`, `draft_answer` — never through a provider's client or a framework's message types inside the domain or a use case.

| Why |
|---|
| the task outlives its model and its framework, and a domain built on a framework's messages changes with every release of it. |
