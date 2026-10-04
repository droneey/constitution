---
id: fastapi
summary: FastAPI serves the program over HTTP, run by Uvicorn.
requires: [python, pydantic]
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: [FastAPI, fastapi, Starlette, starlette, Uvicorn, uvicorn]
governs: []
---

# FastAPI

> Serves the program over HTTP, on Starlette, run by Uvicorn. pydantic parses a handler's parameters and renders its return value, and the app's `lifespan` holds what the program keeps open.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `untrusted-input-parsed-at-edge` | the body, query, path and headers are parsed by the handler's annotations before it runs, and a failure is a `RequestValidationError` | yes |
| `one-error-handler-per-transport` | an exception handler per error class on the one app, `RequestValidationError` and `HTTPException` included | yes |
| `error-kit-carries-code-cause-and-details` | `HTTPException` carries a status and a detail, but no stable code and no cause, so the program raises the error kit's errors and the handlers answer them | no |
| `resources-released-on-every-path` | the `lifespan` context manager opens what the app holds before the first request and closes it after the last | yes |
