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

### tool-described-for-the-model → model-tools-described
Every tool has a docstring that says what it does and when to call it, and every parameter a description, given as `Annotated[..., Field(description=...)]`.

| Why | Tags |
|---|---|
| FastMCP sends a tool's docstring as its description and a parameter's `Field` description in its input schema. | [] |

### tool-failure-answered-as-an-error-result → failure-answered-by-its-code
An error of the error kit is answered as a tool result the model reads as an error, with its code and details, a refused argument or an unknown tool as such a result that names what was refused, and any other failure as a masked internal error; the server is built with `mask_error_details=True`, which masks only the last. A refused argument is answered from the entries of the `pydantic.ValidationError` that fastmcp's `ValidationError` holds as its cause, each by its `loc`, `type` and `msg` without its `input` and `ctx`, never from the exception's text.

| Why | Tags |
|---|---|
| the model reads an expected failure or a refused call as data it can act on, and with the mask an unexpected one shows it no internal detail; the exception's text repeats each refused value, as an entry's `input` holds it and its `ctx` may quote it, and the value may be a secret the model passed on. | [errors, security] |

### program-raises-no-tool-error → errors-carry-codes-not-statuses
The program raises the error kit's errors, never `ToolError`.

| Why | Tags |
|---|---|
| a `ToolError` carries a message and no code. | [errors] |

### tool-arguments-bounded-by-their-annotations → outside-value-untyped-until-parsed
A tool's parameters are typed as narrowly as the business allows — a `Literal`, `Annotated[int, Field(ge=1, le=100)]`, a model with `extra='forbid'` — so the server refuses a wrong argument before the tool runs.

| Why | Tags |
|---|---|
| a model fills arguments by guessing; a bound in the annotation is checked at the edge, while one in the body is code each tool repeats. | [security] |

### validation-inside-a-tool-is-internal → failure-answered-by-its-code
A `pydantic.ValidationError` the tool's own code raises — on parsing a vendor's answer, say — is masked like any other failure; only fastmcp's `ValidationError`, which it raises for the arguments, is a refused argument.

| Why | Tags |
|---|---|
| fastmcp passes the tool's own `pydantic.ValidationError` on unchanged, and the model can correct an argument it sent, not an answer the program failed to parse. | [] |

### specs-through-the-in-memory-client → server-specs-run-in-process
A spec calls a tool through `fastmcp.Client(server)`, the in-memory transport, on a server built with fakes, and opens the client with `async with` inside the case.

| Why | Tags |
|---|---|
| the in-memory transport connects the client to the server object itself, and the session ends with the case. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `every-failure-reaches-one-handler` | a middleware's `on_call_tool` sees every failure of a call — the tool's own, the `ValidationError` of its arguments and the `NotFoundError` of an unknown tool | yes |
| `request-parsed-before-its-handler` | a tool's arguments are validated against its annotations, `Field` bounds included, before it runs, and a refusal is a `ValidationError` that names each argument | yes |
