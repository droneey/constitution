# FastAPI

### app-assembled-by-the-root → composition-root-wires-everything · MUST
`root/` builds the app — its `lifespan`, middleware and error handlers — includes the routers the application layers of features and composition modules offer, and builds the dependencies its handlers take through `Depends`; a handler never builds an adapter or a client.

| Why | Tags |
|---|---|
| every concrete choice of the server is made in one place, and a spec builds the same app with fakes. | [testing] |

### error-kit-handlers-registered-by-the-root → one-error-handler-registered-by-the-root · MUST
`root/` registers the error kit's handlers on the app, one per class they answer: the error kit's errors, `RequestValidationError`, Starlette's `HTTPException` and `Exception`.

| Why | Tags |
|---|---|
| FastAPI answers each class by the handler registered for it, so the one handler is that set, written in one place; Starlette's `HTTPException` is the base of FastAPI's, so its handler also receives an unknown route or method. | [errors, security] |

### fastapi-imported-by-delivery-units → layer-imports-dependencies-by-its-role · MUST
FastAPI's home reaches past the edge into the delivery units of `app/` and `composition/`, which declare its routers and their handlers.

| Why | Tags |
|---|---|
| a handler lives with the feature it serves, and the framework stays out of the domain and the use cases below it. | [] |
