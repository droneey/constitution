# Transport

> Governs TLS, the client's address behind a proxy, and the time a request may take.

## General

### served-only-over-tls · MUST

Every address the program serves beyond its own machine answers only over TLS — its own, or that of a proxy in front of it — and sends `Strict-Transport-Security`; a page a browser navigates to over plain HTTP is redirected, and any other request over it is refused, never served.

| Why |
|---|
| a plain request can be read and changed by anyone on its path, a credential sent in it has crossed in clear before any redirect, and the header keeps the browser from ever trying one again. |

### client-address-taken-from-a-trusted-proxy → outside-address-followed-only-from-an-allowlist · MUST

The address and the scheme of a client are read from `Forwarded` or `X-Forwarded-For` only when the proxy that set them is one the program names; otherwise from the connection.

| Why |
|---|
| a header any client can write otherwise decides its rate limit, its security record and whether it is redirected to TLS. |

### request-read-within-a-time-bound · MUST

The server bounds how long it waits for a request's headers, for its body and on an idle connection, and closes a connection past a bound.

| Why |
|---|
| a client that sends a byte at a time otherwise holds a connection for ever, and a few hundred of them take the server down. |
