# Lifespan

> Governs the app's `lifespan`.

## General

### lifespan-opens-and-closes → resource-released-on-every-path · MUST

What the app keeps open — clients, pools, connections — is opened and closed by the app's `lifespan`, an async context manager around its `yield`, never by `on_event` and never at import.

| Why | Tags |
|---|---|
| the code after `yield` runs however the server stops, and a resource opened at import outlives every spec that imports it. | [] |
