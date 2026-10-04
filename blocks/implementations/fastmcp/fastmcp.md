---
id: fastmcp
summary: FastMCP serves the program's tools to models over MCP.
requires: [python, pydantic]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [FastMCP, fastmcp, MCP]
governs: []
---

# FastMCP

> Serves the program's tools, resources and prompts to models over MCP. A tool's docstring and annotations are all the model knows of it, and pydantic parses its arguments before it runs.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `untrusted-input-parsed-at-edge` | a tool's arguments are validated against its annotations, `Field` bounds included, before it runs | yes |
| `one-error-handler-per-transport` | a middleware's `on_call_tool` sees every failure of every tool | yes |
| `error-kit-carries-code-cause-and-details` | `ToolError` carries a message, but no stable code, no cause and no details, so the program raises the error kit's errors and a middleware answers them | no |
| `tests-run-in-a-sandbox` | `fastmcp.Client(server)` connects to the server in memory, with no process and no port | yes |
