# Lifecycle

> Governs when a provider releases what it keeps open as the program stops.

## General

### nest-pool-closed-on-application-shutdown → stateful-resource-released-by-the-programs-stop · MUST

Every provider that keeps a pool or a client open closes it in `onApplicationShutdown`, never in `onModuleDestroy` or `beforeApplicationShutdown`.

| Why |
|---|
| Nest runs `onModuleDestroy` and `beforeApplicationShutdown` before it closes its connections, so a pool closed there fails the requests still in flight, while `onApplicationShutdown` runs after (NestJS, lifecycle events). |
