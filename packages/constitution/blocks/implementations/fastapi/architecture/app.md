# App

> Governs how the root assembles the app and registers its error handlers.

## General

### app-assembled-by-the-root → composition-root-assembles-the-program · MUST

`root/` assembles the FastAPI app. It builds the app from its `lifespan`, middleware and error handlers, each taken from the unit that owns it, includes the routers the presentations of features, of composition modules and of the program offer — each built by a function its presentation offers, which declares its routes from the context the root hands it, never a router decorated when its module loads —, and builds the dependencies its handlers take through `Depends`; a handler never builds an adapter or a client.

| Why |
|---|
| an app assembled in several places hides its concrete choices among them, a router its module decorates on import registers itself where the root lists nothing, and a handler that builds its own adapter or client cannot be handed a fake, so a spec cannot build the same app with fakes. |

### error-handlers-registered-by-the-root → one-error-handler-registered-by-the-root · MUST

`root/` registers the program's handlers of errors on the app, one per class they answer. The classes are the errors of the program's error library, `RequestValidationError`, Starlette's `HTTPException` and `Exception`.

| Why |
|---|
| FastAPI answers each class by the handler registered for it, so a class left out is answered in the framework's own shape, and the set written in one place is the one handler; a handler on FastAPI's `HTTPException` alone misses an unknown route or method, which Starlette's base class carries. |
