# Lifecycle

> Governs how a Nest program releases what it keeps open when it stops.

## Shutdown

### nest-shutdown-hooks-enabled → resource-released-on-every-path · MUST

The root calls `app.enableShutdownHooks()`, and a provider that keeps a pool or a client open closes it in `onModuleDestroy` or `beforeApplicationShutdown`.

| Why |
|---|
| Nest runs no lifecycle hook on `SIGTERM` until shutdown hooks are enabled, so a stopped process leaves its pools and work in flight unclosed. |
