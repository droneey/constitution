# Tools

> Governs a tool's description, its parameters, and the client a spec calls it through.

## General

### tool-described-by-its-docstring → tool-described-for-the-model · SHOULD

Every tool is described by its docstring, which says what the tool does, when to call it and what it returns.

| Why |
|---|
| FastMCP sends a tool's docstring as its description, so a tool without one reaches the language model as a name whose use it must guess. |

### parameter-described-by-its-field → tool-parameter-described-for-the-model · MUST

Every parameter of a tool is described by its `Field` description, given as `Annotated[..., Field(description=...)]`.

| Why |
|---|
| FastMCP sends a parameter's `Field` description in the tool's input schema, so a parameter without one reaches the language model as a name and a type whose format and unit it must guess. |

### tool-arguments-bounded-by-their-annotations → tool-argument-bounded-by-its-schema · MUST

Every bound of a tool's input is carried by its parameters' types. The server then refuses a wrong argument before the tool runs; a bound's type may be a `Literal`, `Annotated[int, Field(ge=1, le=100)]` or `Annotated[str, Field(max_length=200)]`.

| Why |
|---|
| a language model fills arguments by guessing, so a bound left to the body lets a wrong argument run into the tool and is code each tool repeats, while one in the annotation is checked before the tool runs — parse, don't validate. |

### specs-through-the-in-memory-client → server-spec-runs-in-process · MUST

Every spec calls a tool through the in-memory client. It is `fastmcp.Client(server)` on the server the spec builds, opened with `async with` inside the case.

| Why |
|---|
| a spec that calls the tool's function directly skips the schema, the middleware and the answer the language model receives, and a session opened outside the case outlives it; the in-memory transport connects the client to the server object itself. |
