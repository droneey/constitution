# Language model

> Governs where a model is reached and how its output meets the domain.

## Ports

### model-reached-through-a-port-of-its-task → contract-knows-no-vendor · MUST
A model is reached through a port the domain declares for the task in its own words — `classify_question`, `draft_answer` — never through a provider's client or a framework's message types inside the domain or a use case.

| Why | Tags |
|---|---|
| the task outlives its model and its framework, and a domain built on a framework's messages changes with every release of it. | [] |

## Schemas

### output-schema-derived-from-the-domain → schema-derived-from-the-domain · MUST
The schema a model's output is parsed by derives its enumerations from the domain's — a router's categories from the domain's own — and never restates them.

| Why | Tags |
|---|---|
| a category added to the domain and missed by the schema is one the model can never choose. | [data] |
