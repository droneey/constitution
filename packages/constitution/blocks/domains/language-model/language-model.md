---
id: language-model
summary: A program that prompts language models and acts on their output.
requires: []
extends: null
abstract: false
languages: []
governs: ["**"]
---

# Language model

> A program that sends prompts to a language model and acts on what it returns: how a model is named and pinned, how a prompt keeps the program's instructions apart from text others wrote, how an output is parsed and when it is complete, which tools a model may call and which calls wait for a person, what a call, a run and a caller may spend, how documents are retrieved for a model and cited, how its behaviour is measured by evals kept apart from the specs, and where a model is reached.

Serving tools to models is `mcp-api`; an agent at work on the repository is core's.
