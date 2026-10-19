# Tools

> Governs a tool's description, its parameters, and the client a spec calls it through.

## General

### tool-described-by-its-docstring → tool-described-for-the-model · MUST

Every tool has a docstring that says what it does and when to call it, and every parameter a description, given as `Annotated[..., Field(description=...)]`.

| Why | Tags |
|---|---|
| FastMCP sends a tool's docstring as its description and a parameter's `Field` description in its input schema. | [] |

### tool-arguments-bounded-by-their-annotations → tool-input-schema-closed · MUST

A tool's parameters are typed as narrowly as the business allows — a `Literal`, `Annotated[int, Field(ge=1, le=100)]`, a model with `extra='forbid'` — so the server refuses a wrong argument before the tool runs.

| Why | Tags |
|---|---|
| a model fills arguments by guessing; a bound in the annotation is checked at the edge, while one in the body is code each tool repeats. | [security] |

### specs-through-the-in-memory-client → server-spec-runs-in-process · MUST

A spec calls a tool through `fastmcp.Client(server)`, the in-memory transport, on a server built with fakes, and opens the client with `async with` inside the case.

| Why | Tags |
|---|---|
| the in-memory transport connects the client to the server object itself, and the session ends with the case. | [] |
