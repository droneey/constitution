# Tools

> Governs a tool's description, its parameters, and the client a spec calls it through.

## General

### tool-described-by-its-docstring → tool-described-for-the-model · MUST

Every tool is described by its docstring, and every parameter by its `Field` description. The docstring says what the tool does and when to call it, and a parameter's description is given as `Annotated[..., Field(description=...)]`.

| Why |
|---|
| FastMCP sends a tool's docstring as its description and a parameter's `Field` description in its input schema, so a tool without them reaches the language model as a name whose use it must guess. |

### tool-arguments-bounded-by-their-annotations → tool-input-schema-closed · MUST

A tool's parameters carry in their types every bound its input has — a set of values, a range, a closed shape —, so the server refuses a wrong argument before the tool runs. The type may be a `Literal`, `Annotated[int, Field(ge=1, le=100)]` or a pydantic model with `extra='forbid'`.

| Why |
|---|
| a language model fills arguments by guessing, so a bound left to the body lets a wrong argument run into the tool and is code each tool repeats, while one in the annotation is checked at the edge — parse, don't validate. |

### specs-through-the-in-memory-client → server-spec-runs-in-process · MUST

A spec calls a tool through the in-memory client. It is `fastmcp.Client(server)` on a server built with fakes, opened with `async with` inside the case.

| Why |
|---|
| a spec that calls the tool's function directly skips the schema, the middleware and the answer the language model receives, and a session opened outside the case outlives it; the in-memory transport connects the client to the server object itself. |
