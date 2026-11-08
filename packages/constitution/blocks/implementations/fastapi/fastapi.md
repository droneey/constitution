---
id: fastapi
summary: FastAPI serves the program over HTTP, run by Uvicorn.
requires: [python, schema/pydantic, contracts/api/rest, uvicorn]
languages: []
governs: ["**/presentation/**", "**/root/**", "**/tests/**"]
---

# FastAPI

> FastAPI serves the program over HTTP, on Starlette, run by Uvicorn.

Its packages are `fastapi` and `starlette`.

pydantic parses a handler's parameters and renders its return value, and the app's `lifespan` holds what the program keeps open.
