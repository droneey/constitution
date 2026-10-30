---
id: fastapi
summary: FastAPI serves the program over HTTP, run by Uvicorn.
requires: [python, pydantic, rest-api]
extends: null
abstract: false
languages: []
governs: ["**/presentation/**", "**/root/**"]
---

# FastAPI

> **FastAPI** serves the program over HTTP, on **Starlette**, run by **Uvicorn**.

Their packages are **`fastapi`**, **`starlette`** and **`uvicorn`**.

pydantic parses a handler's parameters and renders its return value, and the app's `lifespan` holds what the program keeps open.

## Requirements

| Requirement | How | Met |
|---|---|---|
| `framework-passes-every-failure-to-one-handler` | an exception handler per class on the one app receives every failure (`error-kit-handlers-registered-by-the-root`) | yes |
| `framework-parses-a-request-before-its-handler` | the body, query, path and headers are parsed by the handler's annotations before it runs, and a failure is a `RequestValidationError` whose errors give the location of each field | yes |
