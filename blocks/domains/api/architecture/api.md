# API

> Its delivery layer is `api/`, and one handler, registered by `root/`, answers every failure of every request.

## handlers-in-the-api-folder → anatomy-top-level-by-concern
The delivery layer is `api/`: the handlers that compose several features — a route, an endpoint, a tool — and the wiring that mounts every handler on the server; a handler that serves one feature lives in that feature's `app/`.

| Why | Check | Tags |
|---|---|---|
| every way into the program is found from one place, and the server's wiring is not spread through the features. | review | [] |

## one-error-handler-registered-by-the-root → one-error-handler-per-transport
`root/` registers on the server one handler that answers every failure of every request — a route's or a tool's, a refused input, an unknown route or tool; no route or tool catches a failure to answer it itself.

| Why | Check | Tags |
|---|---|---|
| every failure leaves in one shape and is masked in one place, and a failure the framework raises before any route runs is answered like the rest. | review | [errors, security] |

## Requirements for implementation

What any server framework must provide.

## every-failure-reaches-one-handler · MUST
The framework passes every failure of a request — a route's or a tool's, a refused input, an unknown route, method or tool — to a handler the program registers once, and answers none of them in a shape of its own.

| Why | Check | Tags |
|---|---|---|
| without it, some failures leave in the framework's shape, unmasked, and the one handler cannot be written. | review | [errors] |

## request-parsed-before-its-handler · MUST
The framework parses a request's parameters and body against a declared shape before the route or tool runs, and passes a refusal to the one handler with the path of each field it refused.

| Why | Check | Tags |
|---|---|---|
| without it, each route parses its own input, and the edge the program trusts is wherever each one remembered to parse. | review | [security] |
