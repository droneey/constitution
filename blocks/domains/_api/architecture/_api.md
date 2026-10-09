# API

> Governs the server's place in the tree and its one handler of failures.

## The delivery layer

### server-delivery-layer-is-the-api-folder → package-laid-out-by-the-tree · SHOULD
The delivery layer of a program that serves requests is `api/`: the handlers that compose several features — a route, an endpoint, a tool — and the wiring that mounts every handler on the server.

| Why | Tags |
|---|---|
| every way into the program is found from one place, and the server's wiring is not spread through the features. | [] |

## Failures

### one-error-handler-registered-by-the-root → last-resort-handler-one-per-entry · MUST
The composition root registers one handler on each server framework it mounts, and that handler answers every failure of every request the framework serves; no route or tool catches a failure to answer it itself.

| Why | Tags |
|---|---|
| every failure leaves in one shape and is masked in one place, and a failure the framework raises before any route runs is answered like the rest. | [errors, security] |
