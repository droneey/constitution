# FastAPI

## app-assembled-by-the-root → one-explicit-composition-root
`root/` builds the app — its `lifespan`, middleware, error handlers and routers — and the dependencies its handlers take through `Depends`; a handler never builds an adapter or a client.

| Why | Check | Tags |
|---|---|---|
| every concrete choice of the server is made in one place, and a spec builds the same app with fakes. | review | [testing] |

## error-kit-handlers-registered-by-the-root → one-error-handler-per-transport
`root/` registers the error kit's handlers on the app: an expected error becomes its status and problem body, a `RequestValidationError` a validation failure that points at each field, an `HTTPException` of FastAPI's own the kind its status maps to, and any other failure a masked `500`.

| Why | Check | Tags |
|---|---|---|
| every failure of the transport leaves through one handler, in one shape, and no internal detail leaks past it. | review | [errors, security] |
