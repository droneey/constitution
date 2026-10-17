---
id: http-server
summary: "A program that serves HTTP: methods, origins, bodies, caching, TLS."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
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

Every answer carries its exact `Content-Type`, and an operation that answers JSON never answers `text/html`, its failures and the framework's defaults included.

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

### uploaded-file-never-rendered-from-the-programs-origin · MUST

A file a person uploaded is served from another registrable domain than the program's, or with `Content-Disposition: attachment` or `Content-Security-Policy: sandbox`; it is never opened as a page of the program's own origin.

| Why | Tags |
|---|---|
| an uploaded SVG or HTML page opened from the program's origin, or from a sibling host of its site, runs its script with every visitor's session. | [security] |

## Caching

### personal-answer-kept-out-of-shared-caches · MUST

An answer that carries a caller's own data sets `Cache-Control: private` or `no-store`, and no shared cache in front of the server — a CDN's or a proxy's — is given a rule that stores it anyway.

| Why | Tags |
|---|---|
| with no directive a shared cache may keep one caller's answer and serve it to the next. | [security, data] |

### answer-varies-by-the-headers-it-reads · MUST

An answer that depends on a request header names it in `Vary` — `Origin` wherever `Access-Control-Allow-Origin` is not `*`, `Accept-Language` and `Accept` wherever they choose the body.

| Why | Tags |
|---|---|
| a cache otherwise serves the answer made for one origin, language or type to a request for another. | [security] |

### get-answer-states-its-cache-policy · SHOULD

Every answer to a `GET` states its `Cache-Control`.

| Why | Tags |
|---|---|
| with no directive each cache decides on its own how long to keep the answer. | [performance] |

## Transport

### served-only-over-tls · MUST

Every address the program serves beyond its own machine answers only over TLS — its own, or that of a proxy in front of it — and sends `Strict-Transport-Security`; a page a browser navigates to over plain HTTP is redirected, and any other request over it is refused, never served.

| Why | Tags |
|---|---|
| a plain request can be read and changed by anyone on its path, a credential sent in it has crossed in clear before any redirect, and the header keeps the browser from ever trying one again. | [security] |

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

## Disclosure

### vulnerability-contact-served-as-security-txt → vulnerability-reported-privately · MUST

A program that serves HTTP to the public under a domain of its own serves `/.well-known/security.txt`, as RFC 9116 sets out, with the contact for a vulnerability, the policy it follows and the file's expiry.

| Why | Tags |
|---|---|
| finders and their tools look for the contact there first, and the expiry keeps a stale address from being trusted. | [security] |
