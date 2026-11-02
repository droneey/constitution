# Lifespan

> Governs the app's `lifespan`.

## General

### lifespan-opens-and-closes → resource-released-on-every-path · MUST

The app's `lifespan` opens and closes what the app keeps open. These are its clients, pools and connections; the `lifespan` is an async context manager around its `yield`, and nothing is opened by `on_event` or at import.

| Why |
|---|
| the code after `yield` runs however the server stops, and a resource opened at import outlives every spec that imports it. |
