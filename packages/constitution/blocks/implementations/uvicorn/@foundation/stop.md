# Stop

> Governs how the server takes its stop signal, when it closes its listener, and how long it waits for the requests in flight.

## General

### uvicorn-listener-closed-after-the-pause-by-handle-exit → server-stop-waits-out-its-pause-for-routing · MUST

Every Uvicorn server the composition root runs closes its listener only after its pause for routing has passed. The root runs a `uvicorn.Server` whose `handle_exit` sets `should_exit` once the pause has passed, never `uvicorn.run` or the `uvicorn` command, which build a server of their own. Exempt: a second stop signal, on which `handle_exit` may set `should_exit` at once.

| Why |
|---|
| Uvicorn's own `handle_exit` sets `should_exit` on the first SIGINT or SIGTERM, the server then closes its listener at once, and `uvicorn.Config` offers no wait before that close, only `timeout_graceful_shutdown` after it, so the requests its routers still send are refused (uvicorn 0.54). |

### uvicorn-wait-bounded-by-timeout-graceful-shutdown → server-stop-bound-shorter-than-the-hosts-grace · MUST

Every `uvicorn.Config` the composition root builds sets `timeout_graceful_shutdown`, never leaving it `None`.

| Why |
|---|
| the default `None` waits for the requests in flight without end, so one request or stream that never ends holds the stop until the host kills the process, and the app's `lifespan` shutdown, which runs after that wait, never runs (uvicorn 0.54). |
