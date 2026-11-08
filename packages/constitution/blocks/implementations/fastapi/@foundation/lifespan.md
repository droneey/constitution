# Lifespan

> Governs the app's `lifespan`.

## General

### resources-held-by-the-lifespan → resource-released-on-every-path · MUST

Every resource the app keeps open is opened and closed by the app's `lifespan`. Such resources are its clients, pools and connections; the `lifespan` is an async context manager around its `yield`, and none of them is opened as a module loads.

| Why |
|---|
| the code after `yield` runs however the server stops, and a resource opened as its module loads outlives every spec that imports it. |
