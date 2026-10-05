# FastAPI

## app-assembled-by-the-root → one-explicit-composition-root
`root/` builds the app — its `lifespan`, middleware, error handlers and routers — and the dependencies its handlers take through `Depends`; a handler never builds an adapter or a client.

| Why | Check | Tags |
|---|---|---|
| every concrete choice of the server is made in one place, and a spec builds the same app with fakes. | review | [testing] |

## error-kit-handlers-registered-by-the-root → one-error-handler-registered-by-the-root
`root/` registers the error kit's handlers on the app, one per class they answer: the error kit's errors, `RequestValidationError`, Starlette's `HTTPException` and `Exception`.

| Why | Check | Tags |
|---|---|---|
| FastAPI answers each class by the handler registered for it, so the one handler is that set, written in one place; Starlette's `HTTPException` is the base of FastAPI's, so its handler also receives an unknown route or method. | review | [errors, security] |
