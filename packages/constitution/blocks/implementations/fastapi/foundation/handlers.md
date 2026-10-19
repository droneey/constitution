# Handlers

> Governs a handler: its dependencies, its parameters, its blocking work, and the transport a spec drives it through.

## General

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

### specs-through-the-asgi-transport → server-spec-runs-in-process · MUST

A spec sends its requests through `ASGITransport(app=app)` to an app it builds with fakes, and enters the app's `lifespan` itself when the case needs it.

| Why | Tags |
|---|---|
| the transport hands each request to the app as a server would, without a socket, and the `lifespan` runs only when a case enters it. | [] |
