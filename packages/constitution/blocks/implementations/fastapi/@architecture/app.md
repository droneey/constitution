# App

> Governs how the root assembles the app, includes its routers and registers its error handlers.

## General

### app-assembled-by-the-root → composition-root-assembles-the-program · MUST

Only the composition root assembles the FastAPI app. It builds the app from its `lifespan`, middleware and error handlers, each taken from the unit that owns it, and builds the dependencies its handlers take through `Depends`.

| Why |
|---|
| an app assembled in several places hides its concrete choices among them, so a spec cannot build the same app with fakes. |

### routers-built-by-a-function-the-root-calls → delivery-unit-registered-by-the-root · MUST

Every router the composition root includes is built by a function its presentation offers. Each presentation of a feature, of a composition module or of the program offers a function that declares its routes from the context the root hands it, and no router is decorated as its module loads.

| Why |
|---|
| a router its module decorates on import registers itself where the root lists nothing, and closes over whatever its module built, so a spec cannot build the app with fakes. |

### exception-handler-per-class-shares-one-mapping → one-error-handler-registered-by-the-root · MUST

The composition root registers one error handler per class on the app, all answering through one shared mapping. Together they are the one error handler, and the classes are the base error of the program's error library, `RequestValidationError`, Starlette's `HTTPException` and `Exception`.

| Why |
|---|
| FastAPI answers each class by the handler registered for it, so a class left out is answered in the framework's own shape, and handlers that each map their failures their own way answer one failure in two shapes; a handler on FastAPI's `HTTPException` alone misses an unknown route or method, which Starlette's base class carries. |
