# Stop

> Governs how the server takes its stop signal, when it closes its listener, and how long it waits for the requests in flight.

## General

### uvicorn-listener-closed-after-the-pause-by-handle-exit → server-stop-waits-out-its-pause-for-routing · MUST

Every Uvicorn server the composition root runs closes its listener only after its pause for routing has passed. The root runs a `uvicorn.Server` whose `handle_exit` sets `should_exit` once the pause has passed, never `uvicorn.run` or the `uvicorn` command, which build a server of their own. Exempt: a second stop signal, on which `handle_exit` may set `should_exit` at once.

#### Why

Uvicorn's own `handle_exit` sets `should_exit` on the first SIGINT or SIGTERM, the server then closes its listener at once, and `uvicorn.Config` offers no wait before that close, only `timeout_graceful_shutdown` after it, so the requests its routers still send are refused (uvicorn 0.54).

#### Examples

```py title="Avoid"
# src/shop/root/serve.py
def serve(app: ASGIApp, settings: Settings) -> None:
    uvicorn.run(app, host=settings.host, port=settings.port)
```

```py title="Prefer"
# src/shop/root/serve.py
class PausingServer(uvicorn.Server):
    def __init__(self, config: uvicorn.Config, routing_pause: timedelta) -> None:
        super().__init__(config)
        self._routing_pause = routing_pause
        self._is_stopping = False

    def handle_exit(self, sig: int, frame: FrameType | None) -> None:
        if self._is_stopping:
            self.should_exit = True
            return
        self._is_stopping = True
        asyncio.get_running_loop().call_later(self._routing_pause.total_seconds(), self._exit)

    def _exit(self) -> None:
        self.should_exit = True
```

### uvicorn-wait-bounded-by-timeout-graceful-shutdown → server-stop-bound-shorter-than-the-hosts-grace · MUST

Every `uvicorn.Config` the composition root builds sets `timeout_graceful_shutdown`, never leaving it `None`.

#### Why

The default `None` waits for the requests in flight without end, so one request or stream that never ends holds the stop until the host kills the process, and the app's `lifespan` shutdown, which runs after that wait, never runs (uvicorn 0.54).

#### Examples

```py title="Avoid"
config = uvicorn.Config(app, host=settings.host, port=settings.port, log_config=None)
```

```py title="Prefer"
config = uvicorn.Config(
    app,
    host=settings.host,
    port=settings.port,
    log_config=None,
    timeout_graceful_shutdown=settings.graceful_shutdown_seconds,
)
```
