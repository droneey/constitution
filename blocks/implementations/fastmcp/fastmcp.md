---
id: fastmcp
summary: FastMCP serves the program's tools to models over MCP.
requires: [python, pydantic, api]
extends: null
abstract: false
languages: []
dictionary: [FastMCP, fastmcp, MCP]
governs: ["**/api/**", "**/root/**"]
---

# FastMCP

> Serves the program's tools, resources and prompts to models over MCP. A tool's docstring and annotations are all the model knows of it, and pydantic parses its arguments before it runs.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `every-failure-reaches-one-handler` | a middleware's `on_call_tool` sees every failure of a call — the tool's own, the `ValidationError` of its arguments and the `NotFoundError` of an unknown tool | yes |
| `request-parsed-before-its-handler` | a tool's arguments are validated against its annotations, `Field` bounds included, before it runs, and a refusal is a `ValidationError` that names each argument | yes |
