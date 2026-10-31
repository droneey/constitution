# Tasks

> Governs where a model is reached: through a port of its task.

## General

### model-reached-through-a-port-of-its-task → contract-knows-no-vendor · MUST

A model is reached through a port in the application's contracts, declared for the task in the feature's own words — `classify_question`, `draft_answer` — never through a provider's client or a framework's message types inside the domain or the application.

| Why |
|---|
| the task outlives its model and its framework, and a use case built on a framework's messages changes with every release of it. |
