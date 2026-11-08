# Failures

> Governs the failures FastAPI raises and those the program raises.

## General

### fastapi-refusals-answered-from-their-status-or-entries → framework-refusal-answered-as-the-callers-failure · MUST

Every refusal FastAPI raises before a handler runs is answered as the caller's failure of its kind, by the program's own handler. A `RequestValidationError` is answered as a validation failure with one detail per entry of its `errors()`, by the entry's `loc` and `type` alone, as `validation-errors-become-error-details` reads a parse; Starlette's `HTTPException`, an unknown route or a method not allowed, is answered as the kind its status maps to.

| Why |
|---|
| FastAPI raises these before any handler runs, with no code of the program's error library, so an answer not built from their status or their entries reaches the caller in the framework's shape; FastAPI's default answer to a `RequestValidationError` carries each entry's `msg` and `input`, and pydantic's `msg` can quote the value it refused, so only `loc` and `type`, the field's path and a stable code, leave the program. |

### program-raises-no-http-exception → error-carries-a-code-never-a-status · MUST

The program raises the errors of its error library, never `HTTPException`.

| Why |
|---|
| an `HTTPException` carries a status and no code, so a caller cannot branch on it, and it ties the code that raises it to HTTP. |
