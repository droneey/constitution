# FastAPI

## Handlers

## dependencies-declared-in-annotated · SHOULD
A dependency and the source of a parameter — `Depends`, `Query`, `Path`, `Header`, `Body` — are declared in `Annotated[...]`, never as a default value.

| Why | Check | Tags |
|---|---|---|
| the annotation holds the type and its source together, the default is a real default again, and the function can be called outside FastAPI. | tool/lint | [] |

## path-parameters-read-by-the-handler · SHOULD
Every parameter of a route's path is a parameter of its handler.

| Why | Check | Tags |
|---|---|---|
| a path parameter the handler does not take is parsed by nobody, and the route matches values the program never checks. | tool/lint | [] |

## async-handlers-never-block · SHOULD
An `async def` handler awaits all its input and output; blocking work runs in a `def` handler, which FastAPI runs in a thread, or through Starlette's `run_in_threadpool`.

| Why | Check | Tags |
|---|---|---|
| one blocking call in an async handler stalls every request the event loop serves. | review | [performance] |

## lifespan-opens-and-closes → resources-released-on-every-path
What the app keeps open — clients, pools, connections — is opened and closed by the app's `lifespan`, an async context manager around its `yield`, never by `on_event` and never at import.

| Why | Check | Tags |
|---|---|---|
| the code after `yield` runs however the server stops, and a resource opened at import outlives every spec that imports it. | review | [] |

## Failures

## program-raises-no-http-exception → framework-errors-never-raised
The program raises the error kit's errors, never `HTTPException`.

| Why | Check | Tags |
|---|---|---|
| an `HTTPException` carries a status and no code, and ties the code that raises it to HTTP. | review | [errors] |

## unexpected-error-logged-once → error-logged-once
The handler of an unexpected failure logs it, and a filter on the `uvicorn.error` logger drops the record of the same exception, which Starlette raises again after the handler has answered.

| Why | Check | Tags |
|---|---|---|
| Starlette always raises an unhandled exception again for the server, so without the filter every such failure is logged twice. | review | [errors] |

## Specs

## specs-through-the-asgi-transport → tests-run-in-a-sandbox
A spec sends its requests in process, through `ASGITransport(app=app)`, to an app it builds with fakes, and enters the app's `lifespan` itself when the case needs it; no server starts and no port opens.

| Why | Check | Tags |
|---|---|---|
| the request travels the app's middleware, parsing and error handlers as in production, and nothing leaves the process. | review | [testing] |
