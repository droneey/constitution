---
id: language-model
summary: A program that prompts language models and acts on their output.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# Language model

> A program that sends prompts to a language model and acts on what it returns: how a model is named and pinned, how a prompt keeps the program's instructions apart from text others wrote, how an output is parsed and when it is complete, which tools a model may call and which calls wait for a person, what a call, a run and a caller may spend, how documents are retrieved for a model and cited, and how its behaviour is measured by evals kept apart from the specs. Where a model is reached is in `architecture/`. Serving tools to models is `mcp-api`; an agent at work on the repository is core's.

## Models

### model-pinned-to-a-snapshot · MUST
A model the program calls — a fallback included — is named in its code by an identifier that pins one snapshot, never by an alias that moves, such as `-latest`, nor by a preview or experimental model in production; the model and the settings that shape its output change only with a release.

| Why | Tags |
|---|---|
| a provider moves an alias and retires a preview at short notice, so the program's answers change with no change of its own, and a model set from the environment changes outside every check. | [] |

## Requirements for implementation

### model-client-sets-bounds-and-reports-the-stop · MUST
A library that calls a model lets each call set its timeout, its maximum output tokens and its cancellation, and reports the model that answered, the tokens used and why the output stopped.

| Why | Tags |
|---|---|
| without them, no call can be held to its budget and no output can be told complete. | [errors, performance] |
