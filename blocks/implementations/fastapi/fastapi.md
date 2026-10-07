---
id: fastapi
summary: FastAPI serves the program over HTTP, run by Uvicorn.
requires: [python, pydantic, rest-api]
extends: null
abstract: false
languages: []
dictionary: [FastAPI, fastapi, Starlette, starlette, Uvicorn, uvicorn]
governs: ["**/api/**", "**/root/**"]
---

# FastAPI

> Serves the program over HTTP, on Starlette, run by Uvicorn. pydantic parses a handler's parameters and renders its return value, and the app's `lifespan` holds what the program keeps open.

## Handlers

### dependencies-declared-in-annotated · SHOULD
A dependency and the source of a parameter — `Depends`, `Query`, `Path`, `Header`, `Body` — are declared in `Annotated[...]`, never as a default value.

| Why | Tags |
|---|---|
| the annotation holds the type and its source together, the default is a real default again, and the function can be called outside FastAPI. | [] |

### path-parameters-read-by-the-handler · SHOULD
Every parameter of a route's path is a parameter of its handler.

| Why | Tags |
|---|---|
| a path parameter the handler does not take is parsed by nobody, and the route matches values the program never checks. | [] |

### async-handlers-never-block → async-functions-never-block · SHOULD
A handler whose work blocks is a `def` handler, which FastAPI runs in its threadpool, or hands that work to Starlette's `run_in_threadpool`.

| Why | Tags |
|---|---|
| FastAPI runs an `async def` handler on the event loop that serves every request, and a `def` handler in a thread. | [] |

### lifespan-opens-and-closes → resource-released-on-every-path · MUST
What the app keeps open — clients, pools, connections — is opened and closed by the app's `lifespan`, an async context manager around its `yield`, never by `on_event` and never at import.

| Why | Tags |
|---|---|
| the code after `yield` runs however the server stops, and a resource opened at import outlives every spec that imports it. | [] |

## Failures

### framework-failures-answered-by-their-kind → failure-answered-by-its-code · MUST
A `RequestValidationError` is answered as a validation failure whose details point at each field it refused, each entry of `errors()` by its `loc`, `type` and `msg` without its `input` and `ctx`; Starlette's `HTTPException` — an unknown route, a method not allowed — is answered as the kind its status maps to.

| Why | Tags |
|---|---|
| FastAPI raises these before any handler runs, with no code of the error kit, so their answer takes its kind from their status or their fields; an entry's `input` is the value the caller sent, a password or a card number among them, and its `ctx` may quote it. | [errors, security] |

### program-raises-no-http-exception → error-carries-a-code-never-a-status · MUST
The program raises the error kit's errors, never `HTTPException`.

| Why | Tags |
|---|---|
| an `HTTPException` carries a status and no code, and ties the code that raises it to HTTP. | [errors] |

### unexpected-error-logged-once → failure-reported-once · SHOULD
The handler of an unexpected failure logs it, and a filter on the `uvicorn.error` logger drops the record of the same exception, which Starlette raises again after the handler has answered.

| Why | Tags |
|---|---|
| Starlette always raises an unhandled exception again for the server, so without the filter every such failure is logged twice. | [errors] |

## Specs

### specs-through-the-asgi-transport → server-spec-runs-in-process · MUST
A spec sends its requests through `ASGITransport(app=app)` to an app it builds with fakes, and enters the app's `lifespan` itself when the case needs it.

| Why | Tags |
|---|---|
| the transport hands each request to the app as a server would, without a socket, and the `lifespan` runs only when a case enters it. | [] |

## Requirements

| Requirement | How | Met |
|---|---|---|
| `framework-passes-every-failure-to-one-handler` | an exception handler per class on the one app — the error kit's errors, `RequestValidationError`, Starlette's `HTTPException`, which FastAPI raises for an unknown route or method, and `Exception` — receives every failure | yes |
| `framework-parses-a-request-before-its-handler` | the body, query, path and headers are parsed by the handler's annotations before it runs, and a failure is a `RequestValidationError` whose errors give the location of each field | yes |
