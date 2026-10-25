# Failures

> Governs how a tool's failures are raised and answered.

## General

### kit-error-answered-as-a-tool-result → tool-failure-answered-as-an-error-result · MUST

An error of the error kit is answered as a tool result the model reads as an error, with its code and details, a refused argument as such a result that names what was refused, an unknown tool as the protocol's error, and any other failure as a masked internal error; the server is built with `mask_error_details=True`, which masks only the last. A refused argument is answered from the entries of the `pydantic.ValidationError` that fastmcp's `ValidationError` holds as its cause, each by its `loc`, `type` and `msg` without its `input` and `ctx`, never from the exception's text.

| Why |
|---|
| the model reads an expected failure or a refused call as data it can act on, and with the mask an unexpected one shows it no internal detail; the exception's text repeats each refused value, as an entry's `input` holds it and its `ctx` may quote it, and the value may be a secret the model passed on. |

### program-raises-no-tool-error → error-carries-a-code-never-a-status · MUST

The program raises the error kit's errors, never `ToolError`.

| Why |
|---|
| a `ToolError` carries a message and no code. |

### validation-inside-a-tool-is-internal → failure-answered-by-its-code · MUST

A `pydantic.ValidationError` the tool's own code raises — on parsing a vendor's answer, say — is masked like any other failure; only fastmcp's `ValidationError`, which it raises for the arguments, is a refused argument.

| Why |
|---|
| fastmcp passes the tool's own `pydantic.ValidationError` on unchanged, and the model can correct an argument it sent, not an answer the program failed to parse. |
