# API

> Its delivery layer is `api/`, and on each server framework the root mounts one handler, registered by `root/`, answers every failure of every request.

## handlers-in-the-api-folder → anatomy-top-level-by-concern
The delivery layer is `api/`: the handlers that compose several features — a route, an endpoint, a tool — and the wiring that mounts every handler on the server; a handler that serves one feature lives in that feature's `app/`.

| Why | Check | Tags |
|---|---|---|
| every way into the program is found from one place, and the server's wiring is not spread through the features. | review | [] |

## one-error-handler-registered-by-the-root → one-error-handler-per-transport
`root/` registers one handler on each server framework it mounts, and that handler answers every failure of every request the framework serves — a route's or a tool's, a refused input, an unknown route or tool; no route or tool catches a failure to answer it itself.

| Why | Check | Tags |
|---|---|---|
| every failure leaves in one shape and is masked in one place, and a failure the framework raises before any route runs is answered like the rest. | review | [errors, security] |
