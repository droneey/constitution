---
id: api
summary: "A program that serves requests: its handlers, failures and callers."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**/api/**"]
---

# API

> A program other programs call: an HTTP API, or a server of tools that models call. How it answers a failure, what it refuses from callers it does not know and what it asks of a server framework are at the block's root; where its handlers live and the one handler that answers every failure, in `architecture/`. A rule about a status, a cookie or an origin binds what the program serves over HTTP.

> How a program that serves requests answers them and guards itself, in any architecture: a failure answered from its code, what the server refuses from callers it does not know, and what any server framework must provide.

## Failures

### failure-answered-by-its-code → failure-shown-as-what-happened-and-what-next · SHOULD
Every failure of a request is answered from what failed: an expected error with the answer its code maps to, carrying its code and details; a refusal the framework raises before the route or tool runs — a refused input, an unknown route, method or tool — as the caller's failure of that kind, a refused input with the path of each field it refused; and any other failure with a masked internal error that shows no message, class or trace. Where HTTP is the protocol of the answer — not where it only carries another protocol that answers a failure in its own form, as a server of model tools answers a tool's failure as a result of its call — the status is the one the code or the kind maps to, any other failure is a `500`, and the body is a problem of RFC 9457, `application/problem+json`, with the code as a member of its own.

| Why | Tags |
|---|---|
| a caller branches on a code that stays when the message is reworded, every failure arrives in one shape a client parses once, and an unexpected one shows nothing of how the program works. | [errors, security] |

### errors-carry-codes-not-statuses → expected-failure-is-part-of-the-contract · SHOULD
No error the code of a request raises carries a status or an answer of the protocol, whether the framework's or one of the program's own.

| Why | Tags |
|---|---|
| a status chosen where the error is raised ties that code to one protocol, and the answer is then decided in two places that drift apart. | [errors] |

## Tools for models

### model-tools-described · MUST
A server of tools that models call describes every tool — what it does and when to call it — and every parameter, in the definitions it sends.

| Why | Tags |
|---|---|
| a model knows a tool only by its description, so to the model no tool is an obvious entry. | [] |

## Specs

### server-specs-run-in-process → test-runs-in-a-sandbox · MUST
A spec of a server drives it in process, through its real middleware, parsing and handler, on a server built with fakes, and opens no port.

| Why | Tags |
|---|---|
| the request travels what a caller's does in production, and nothing leaves the process. | [testing] |

## Callers from other origins

### cross-origin-callers-from-an-allowlist → outside-address-followed-only-from-an-allowlist · MUST
Over HTTP, a request from another origin is allowed only for an origin on the program's allowlist, named exactly: the server never echoes a request's `Origin` unchecked, and never answers `Access-Control-Allow-Origin: *` beside `Access-Control-Allow-Credentials: true`.

| Why | Tags |
|---|---|
| a browser sends a user's cookies with a cross-origin request, so an origin the server allows unchecked reads its answers in that user's name. | [security] |

### state-changes-refused-from-other-origins → outside-address-followed-only-from-an-allowlist · MUST
Over HTTP, a request that changes state is refused when its `Origin` names an origin that is neither the program's own nor on its allowlist, and a `GET`, `HEAD` or `OPTIONS` request changes no state.

| Why | Tags |
|---|---|
| a browser attaches its cookies to a request any page sends, and `SameSite` still lets a sibling host of the same site through; the `Origin` check refuses what the cookie's attribute misses, and a method that changes nothing gives a forged link nothing to do. | [security] |

## Outbound requests

### outbound-addresses-from-callers-allowlisted → outside-address-followed-only-from-an-allowlist · MUST
A request the server sends to an address a caller gave — a webhook, a file to fetch, a link to preview — goes only to a host on an allowlist and follows no redirect off it, and the address it resolves to is never private, loopback or link-local.

| Why | Tags |
|---|---|
| the server reaches what its callers cannot — its own network, the cloud's metadata endpoint — and a caller who chooses the address chooses what the server reaches for them. | [security] |

## Requirements for implementation

What any server framework must provide.

### every-failure-reaches-one-handler · MUST
The framework passes every failure of a request — a route's or a tool's, a refused input, an unknown route, method or tool — to a handler the program registers once, and answers none of them in a shape of its own.

| Why | Tags |
|---|---|
| without it, some failures leave in the framework's shape, unmasked, and the one handler cannot be written. | [errors] |

### request-parsed-before-its-handler · MUST
The framework parses a request's parameters and body against a declared shape before the route or tool runs, and passes a refusal to the one handler with the path of each field it refused.

| Why | Tags |
|---|---|
| without it, each route parses its own input, and the edge the program trusts is wherever each one remembered to parse. | [security] |
