# Failures

> Governs how a tool's failures are raised and answered.

## General

### tool-call-failure-answered-by-its-kind → tool-failure-answered-as-an-error-result · MUST

Each failure of a tool call is answered by its kind. An error of the program's error library is answered as a tool result the language model reads as an error, with its code and details; a refused argument as such a result that names what was refused; an unknown tool as the protocol's error; and any other failure as a masked internal error, the server built with `mask_error_details=True`, which masks only the last.

| Why |
|---|
| a language model that receives an expected failure or a refused call as a protocol error cannot act on it, and an unexpected failure unmasked shows it the program's internals. |

### refused-argument-only-from-fastmcp-validation-error → failure-answered-by-its-code · MUST

Only fastmcp's `ValidationError` is answered as a refused argument. fastmcp raises it for a tool's arguments, and the answer is built from the entries of the `pydantic.ValidationError` it holds as its cause, each by its `loc`, `type` and `msg` without its `input` and `ctx`, never from its text; a `pydantic.ValidationError` the tool's own code raises — on parsing a vendor's answer, say — is masked like any other failure.

| Why |
|---|
| fastmcp passes the tool's own `pydantic.ValidationError` on unchanged, so answering it as a refused argument asks the language model to correct an argument it never got wrong, while the failure was the program's parse of an answer; the exception's text repeats each refused value, as an entry's `input` holds it and its `ctx` may quote it, and the value may be a secret the model passed on. |

### program-raises-no-tool-error → error-carries-a-code-never-a-status · MUST

The program raises the errors of its error library, never `ToolError`.

| Why |
|---|
| a `ToolError` carries a message and no code, so the language model and every caller can tell the failure apart only by its wording. |
