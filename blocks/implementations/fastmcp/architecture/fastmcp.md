# FastMCP

## tool-arguments-bounded-by-their-annotations → untrusted-input-parsed-at-edge
A tool's parameters are typed as narrowly as the business allows — a `Literal`, `Annotated[int, Field(ge=1, le=100)]`, a model with `extra='forbid'` — so the server refuses a wrong argument before the tool runs.

| Why | Check | Tags |
|---|---|---|
| a model fills arguments by guessing; a bound in the annotation is checked at the edge, while one in the body is code each tool repeats. | review | [security] |

## tool-failures-answered-by-one-middleware → one-error-handler-per-transport
One middleware, which `root/` adds to the server, answers every failure of a tool: an error of the error kit becomes a result the model reads as an error, with its code and details, and any other failure a masked internal error; the server is built with `mask_error_details=True`.

| Why | Check | Tags |
|---|---|---|
| the model reads an expected failure as data it can act on, and an unexpected one shows it no internal detail. | review | [errors, security] |
