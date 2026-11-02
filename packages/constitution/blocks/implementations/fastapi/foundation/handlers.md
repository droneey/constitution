# Handlers

> Governs a handler: its dependencies, its parameters, and the transport a spec drives it through.

## General

### dependencies-declared-in-annotated · SHOULD

A dependency and the source of a parameter are declared in `Annotated[...]`, never as a default value. Their markers, such as `Depends`, `Query`, `Path`, `Header` and `Body`, sit inside the annotation.

| Why |
|---|
| a source declared as a default value takes the place of the parameter's real default, and the function called outside FastAPI receives the `Depends` or `Query` object instead of a value. |

### path-parameters-read-by-the-handler · SHOULD

Every parameter of a route's path is a parameter of its handler.

| Why |
|---|
| a path parameter the handler does not take is parsed by nobody, and the route matches values the program never checks. |

### specs-through-the-asgi-transport → server-spec-runs-in-process · MUST

A spec sends its requests through `ASGITransport(app=app)`. The app is one it builds with fakes, and the spec enters the app's `lifespan` itself when the case needs it.

| Why |
|---|
| a spec over a socket needs a running server outside the case, while the transport hands each request to the app as a server would; the `lifespan` runs only when a case enters it, so a case that needs what it opens fails on a resource never opened unless it enters it. |
