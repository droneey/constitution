# Failures

> Governs how a tool's failures are raised and answered.

## General

### kit-error-answered-as-a-tool-result → tool-failure-answered-as-an-error-result · MUST

An error of the error kit is answered as a tool result the model reads as an error, with its code and details; a refused argument as such a result that names what was refused; an unknown tool as the protocol's error; and any other failure as a masked internal error, the server built with `mask_error_details=True`, which masks only the last.

| Why |
|---|
| the model reads an expected failure or a refused call as data it can act on, and with the mask an unexpected one shows it no internal detail. |

### refused-argument-only-from-fastmcp-validation-error → failure-answered-by-its-code · MUST

Only fastmcp's `ValidationError`, which it raises for a tool's arguments, is answered as a refused argument, from the entries of the `pydantic.ValidationError` it holds as its cause, never from its text; a `pydantic.ValidationError` the tool's own code raises — on parsing a vendor's answer, say — is masked like any other failure.

| Why |
|---|
| fastmcp passes the tool's own `pydantic.ValidationError` on unchanged, and the model can correct an argument it sent, not an answer the program failed to parse; the exception's text repeats each refused value, which may be a secret the model passed on. |

### program-raises-no-tool-error → error-carries-a-code-never-a-status · MUST

The program raises the error kit's errors, never `ToolError`.

| Why |
|---|
| a `ToolError` carries a message and no code. |
