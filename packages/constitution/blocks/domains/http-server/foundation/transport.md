# Transport

> Governs TLS, the client's address behind a proxy, and how long a request and a connection may last.

## General

### served-only-over-tls · MUST

The program answers only over TLS beyond its own machine. That holds for every address it serves there, over its own TLS or that of a proxy in front of it, with `Strict-Transport-Security` sent; a page a browser navigates to over plain HTTP is redirected, and any other request over it is refused, never served.

| Why |
|---|
| a plain request can be read and changed by anyone on its path, a credential sent in it has crossed in clear before any redirect, and the header keeps the browser from ever trying one again — RFC 6797. |

### client-address-taken-from-a-trusted-proxy → outside-address-followed-only-from-an-allowlist · MUST

A client's address and scheme are taken from forwarding headers only when a trusted proxy set them. They are read from `Forwarded` or `X-Forwarded-For` only when the proxy that set them is one the program names; otherwise from the connection.

| Why |
|---|
| a header any client can write otherwise decides its rate limit, its security record and whether it is redirected to TLS. |

## Connections

### request-read-within-a-time-bound · MUST

The server reads a request within a time bound. It bounds how long it waits for a request's headers, for its body and on an idle connection, and closes a connection past a bound.

| Why |
|---|
| a client that sends a byte at a time otherwise holds a connection for ever, and a few hundred of them take the server down. |

### long-lived-connection-bounded → growing-collection-bounded · MUST

A long-lived connection is bounded in its idle time and its buffer. Such a connection — a WebSocket, an event stream — is closed after an idle time the project sets, and the messages it buffers for a slow reader are bounded.

| Why |
|---|
| connections a client left open and buffers a slow reader never drains hold the server's memory until it falls. |
