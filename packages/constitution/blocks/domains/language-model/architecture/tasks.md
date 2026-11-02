# Tasks

> Governs where a language model is reached: through a port of its task.

## General

### model-reached-through-a-port-of-its-task → port-knows-no-vendor · MUST

A language model is reached through a port of its task. The port is declared for the task in the feature's own words; a model is never reached through a provider's client or a framework's message types inside the domain or the application layer.

| Why |
|---|
| the task outlives its language model and its framework, and a use case built on a framework's messages changes with every release of it — ports and adapters. |
