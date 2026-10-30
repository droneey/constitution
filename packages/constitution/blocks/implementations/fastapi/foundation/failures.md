# Failures

> Governs the failures FastAPI raises, those the program raises, and their records.

## General

### framework-failures-answered-by-their-kind → failure-answered-by-its-code · MUST

A `RequestValidationError` is answered as a validation failure whose details point at each field it refused; Starlette's `HTTPException` — an unknown route, a method not allowed — is answered as the kind its status maps to.

| Why |
|---|
| FastAPI raises these before any handler runs, with no code of the error kit, so their answer takes its kind from their status or their fields. |

### program-raises-no-http-exception → error-carries-a-code-never-a-status · MUST

The program raises the error kit's errors, never `HTTPException`.

| Why |
|---|
| an `HTTPException` carries a status and no code, and ties the code that raises it to HTTP. |

### unexpected-error-logged-once → failure-logged-once · SHOULD

The handler of an unexpected failure logs it, and a filter on the `uvicorn.error` logger drops the record of the same exception, which Starlette raises again after the handler has answered.

| Why |
|---|
| Starlette always raises an unhandled exception again for the server, so without the filter every such failure is logged twice. |
