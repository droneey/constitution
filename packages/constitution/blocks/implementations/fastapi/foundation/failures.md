# Failures

> Governs the failures FastAPI raises, those the program raises, and their records.

## General

### framework-failures-answered-by-their-kind → failure-answered-by-its-code · MUST

FastAPI's own failures are answered by their kind. A `RequestValidationError` is answered as a validation failure whose details point at each field it refused, each entry of `errors()` by its `loc`, `type` and `msg` without its `input` and `ctx`; Starlette's `HTTPException` — an unknown route, a method not allowed — is answered as the kind its status maps to.

| Why |
|---|
| FastAPI raises these before any handler runs, with no code of the program's error library, so an answer not taken from their status or their fields reaches the caller in the framework's shape; an entry's `input` is the value the caller sent, a password or a card number among them, its `ctx` may quote it, and as FastAPI raises the error, the program cannot ask pydantic's `errors()` to leave them out. |

### program-raises-no-http-exception → error-carries-a-code-never-a-status · MUST

The program raises the errors of its error library, never `HTTPException`.

| Why |
|---|
| an `HTTPException` carries a status and no code, so a caller cannot branch on it, and it ties the code that raises it to HTTP. |

### unexpected-error-logged-once → failure-logged-once · SHOULD

An unexpected failure is logged once, by its handler. A filter on the `uvicorn.error` logger drops the record of the same exception, which Starlette raises again after the handler has answered.

| Why |
|---|
| Starlette always raises an unhandled exception again for the server, so without the filter every such failure is logged twice. |
