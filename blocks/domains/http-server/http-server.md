---
id: http-server
summary: "A program that serves HTTP: methods, origins, bodies, caching, TLS."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---
# HTTP server

> A program that answers HTTP requests — an API, a server of tools, its pages — and what HTTP itself asks of it: methods that are safe, the origins it trusts, the type of every body, how its answers are cached, and TLS.

## Methods

### safe-method-changes-nothing · MUST
A request by a safe method of HTTP — `GET`, `HEAD`, `OPTIONS` — changes no state.

| Why | Tags |
|---|---|
| a link, a prefetch, a crawler or a cache sends such a request without anyone meaning its effect, and a forged page sends it with the user's cookies. | [security] |

### refused-method-names-the-allowed · MUST
A request by a method its resource does not take is answered `405` with `Allow` naming the methods it takes.

| Why | Tags |
|---|---|
| the caller learns what the resource accepts without reading the contract. | [] |

## Bodies

### answer-declares-its-exact-content-type · MUST
Every answer carries its exact `Content-Type`, and a server of JSON never answers `text/html`.

| Why | Tags |
|---|---|
| a client that knows the type parses the body as it was meant, and an HTML answer from an API is a page a browser may run. | [security] |

### answer-forbids-type-sniffing · MUST
Every answer carries `X-Content-Type-Options: nosniff`.

| Why | Tags |
|---|---|
| a browser that guesses the type of an answer holding a caller's text may run it as a page. | [security] |

### request-body-refused-in-an-undeclared-type · MUST
A request whose body is in a media type its operation does not declare is refused with `415` before it is read; an operation of JSON never accepts `text/plain` or a form encoding.

| Why | Tags |
|---|---|
| a page on another origin sends `text/plain` and form bodies without a preflight, so an API that reads them as JSON accepts forged writes. | [security] |

## Caching

### personal-answer-kept-out-of-shared-caches · MUST
An answer that carries a caller's own data sets `Cache-Control: private` or `no-store`.

| Why | Tags |
|---|---|
| with no directive a shared cache may keep one caller's answer and serve it to the next. | [security, data] |

### get-answer-states-its-cache-policy · SHOULD
Every answer to a `GET` states its `Cache-Control`.

| Why | Tags |
|---|---|
| with no directive each cache decides on its own how long to keep the answer. | [performance] |

### unchanged-resource-answered-304 · SHOULD
A `GET` of a resource with an `ETag` answers `304` with no body to an `If-None-Match` that matches it.

| Why | Tags |
|---|---|
| a caller that polls downloads only what changed. | [performance] |

## Transport

### served-only-over-tls · MUST
Every address the program serves beyond its own machine answers only over TLS — its own, or that of a proxy in front of it — and sends `Strict-Transport-Security`; a request over plain HTTP is redirected or refused, never served.

| Why | Tags |
|---|---|
| a plain request can be read and changed by anyone on its path, and the header keeps the browser from ever trying one again. | [security] |

### client-address-taken-from-a-trusted-proxy → outside-address-followed-only-from-an-allowlist · MUST
The address and the scheme of a client are read from `Forwarded` or `X-Forwarded-For` only when the proxy that set them is one the program names; otherwise from the connection.

| Why | Tags |
|---|---|
| a header any client can write otherwise decides its rate limit, its security record and whether it is redirected to TLS. | [security] |

### request-read-within-a-time-bound · MUST
The server bounds how long it waits for a request's headers, for its body and on an idle connection, and closes a connection past a bound.

| Why | Tags |
|---|---|
| a client that sends a byte at a time otherwise holds a connection for ever, and a few hundred of them take the server down. | [security, performance] |
