# FastMCP

## tool-described-for-the-model → docs-only-for-non-obvious-public-entry · MUST
Every tool has a docstring that says what it does and when to call it, and every parameter a description, given as `Annotated[..., Field(description=...)]`.

| Why | Check | Tags |
|---|---|---|
| a model knows a tool only by its description, so to the model no tool is an obvious entry. | review | [] |

## program-raises-no-tool-error → framework-errors-never-raised
The program raises the error kit's errors, never `ToolError`.

| Why | Check | Tags |
|---|---|---|
| a `ToolError` carries a message and no code. | review | [errors] |

## tool-arguments-bounded-by-their-annotations → outside-values-untyped-until-parsed
A tool's parameters are typed as narrowly as the business allows — a `Literal`, `Annotated[int, Field(ge=1, le=100)]`, a model with `extra='forbid'` — so the server refuses a wrong argument before the tool runs.

| Why | Check | Tags |
|---|---|---|
| a model fills arguments by guessing; a bound in the annotation is checked at the edge, while one in the body is code each tool repeats. | review | [security] |

## validation-inside-a-tool-is-internal · SHOULD
A validation error that a tool's own code raises — on parsing a vendor's answer, say — is an unexpected failure and is masked; only a failure of the tool's arguments is the caller's.

| Why | Check | Tags |
|---|---|---|
| the model can correct an argument it sent, not an answer the program failed to parse, and the error would show it the program's internals. | review | [errors, security] |

## specs-through-the-in-memory-client → tests-run-in-a-sandbox
A spec calls a tool through `fastmcp.Client(server)`, the in-memory transport, on a server built with fakes, and opens the client with `async with` inside the case.

| Why | Check | Tags |
|---|---|---|
| the call travels the server's middleware, validation and serialisation as in production, nothing leaves the process, and the session ends with the case. | review | [testing] |
