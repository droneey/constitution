# Transport

> Governs TLS, the caller's address behind a proxy, and how long a request and a connection may last.

## General

### served-only-over-tls → network-connection-encrypted · MUST

Every request its caller sent over plain HTTP, on a connection other than a local connection, is refused, never served or redirected. The refusal is the program's own or that of a proxy its host runs for it. Exempt: a page a browser navigates to, and a certificate authority's `http-01` challenge request, each of which is redirected to the same address over TLS.

| Why |
|---|
| a credential or a body sent in a plain request has already crossed in clear, so a redirect teaches its caller that the plain address works, while a browser that opens the plain address of a page first, and a certificate authority that asks for its challenge there first, are brought to TLS only by the redirect — RFC 8555 asks the authority to follow it. |

### tls-answer-sets-strict-transport-security → network-connection-encrypted · MUST

Every answer to a request that came over TLS carries `Strict-Transport-Security`. That TLS, and the header, are the program's own or those of a proxy its host runs for it.

| Why |
|---|
| without the header a browser tries the plain address again on its next visit, where whoever sits on its path answers first — RFC 6797. |

### client-address-taken-from-a-trusted-proxy · MUST

Every caller's address and scheme are taken from forwarding headers only when a proxy the program names set them. They are read from `Forwarded`, or from `X-Forwarded-For` and `X-Forwarded-Proto`, only then, and otherwise from the connection.

| Why |
|---|
| a header any caller can write otherwise decides its rate limit, the address the program records for it and whether it is redirected to TLS. |

## Connections

### request-read-within-a-time-bound · MUST

The server reads every request within a time bound, and closes a connection past it. It bounds how long it waits for a request's headers, for its body and on an idle connection.

| Why |
|---|
| a caller that sends a byte at a time otherwise holds a connection for ever, and a few hundred of them take the server down. |

### long-lived-connection-bounded · MUST

Every long-lived connection, such as a WebSocket or an event stream, is closed after an idle time the project sets. A connection its caller writes to, such as a WebSocket, is idle while no frame arrives from its caller, and one the program only writes to, such as an event stream, while it sends no event.

| Why |
|---|
| connections a caller left open hold the server's memory and its sockets until it falls. |
