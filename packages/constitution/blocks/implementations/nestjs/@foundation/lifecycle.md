# Lifecycle

> Governs how a Nest program hears its stop signal and waits out its pause for routing.

## Shutdown

### nest-shutdown-hooks-enabled → program-stops-cleanly · MUST

Every Nest program enables its shutdown hooks, by `app.enableShutdownHooks()`.

| Why |
|---|
| Nest runs no lifecycle hook on `SIGTERM` until shutdown hooks are enabled, so a stopped process leaves its pools and work in flight unclosed. |

### nest-pause-for-routing-awaited-before-shutdown → server-stop-waits-out-its-pause-for-routing · MUST

Every Nest server waits out its pause for routing in a `beforeApplicationShutdown` hook, which Nest awaits before it closes its connections.

| Why |
|---|
| Nest closes its connections once its `beforeApplicationShutdown` hooks complete, so a server that awaits no pause there refuses the requests its routers still send it (NestJS, lifecycle events). |
