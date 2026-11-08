# httpx2

> Governs the transport a spec drives the app through.

## General

### specs-through-the-asgi-transport → server-spec-runs-in-process · MUST

Every spec sends its requests to the app through `httpx2.ASGITransport(app=app)`, and enters the app's `lifespan` itself when the case needs it.

| Why |
|---|
| a spec over a socket needs a running server outside the case, while the transport hands each request to the app as a server would; the transport runs no `lifespan`, so a case that needs what it opens fails on a resource never opened unless it enters it. |
