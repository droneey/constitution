# App wiring

> Governs how the root assembles the app and registers its error handlers.

## General

### app-assembled-by-the-root → composition-root-wires-everything · MUST

`root/` builds the app — its `lifespan`, middleware and error handlers — includes the routers the presentations of features and composition modules offer, and builds the dependencies its handlers take through `Depends`; a handler never builds an adapter or a client.

| Why |
|---|
| every concrete choice of the server is made in one place, and a spec builds the same app with fakes. |

### error-kit-handlers-registered-by-the-root → one-error-handler-registered-by-the-root · MUST

`root/` registers the error kit's handlers on the app, one per class they answer: the error kit's errors, `RequestValidationError`, Starlette's `HTTPException` and `Exception`.

| Why |
|---|
| FastAPI answers each class by the handler registered for it, so the one handler is that set, written in one place; Starlette's `HTTPException` is the base of FastAPI's, so its handler also receives an unknown route or method. |
