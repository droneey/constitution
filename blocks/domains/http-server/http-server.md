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

## Transport

### served-only-over-tls · MUST
Every address the program serves beyond its own machine answers only over TLS — its own, or that of a proxy in front of it — and sends `Strict-Transport-Security`; a request over plain HTTP is redirected or refused, never served.

| Why | Tags |
|---|---|
| a plain request can be read and changed by anyone on its path, and the header keeps the browser from ever trying one again. | [security] |
