# HTTP server

> Governs how a server's connections, stop and probes meet HTTP.

## Connections

### stopping-server-closes-each-connection · SHOULD

A stopping server closes each connection it keeps open. Once its stop begins, it closes each after the answer in flight on it is sent — `Connection: close` on HTTP/1.1, `GOAWAY` on HTTP/2 — and ends a WebSocket or an event stream with its protocol's close, so the client reconnects elsewhere.

| Why |
|---|
| a client on a kept connection sends its next request to a copy that is leaving, and a long-lived connection held to the end is cut by the kill with no word to reconnect. |

### server-idle-connection-outlasts-the-proxy → request-read-within-a-time-bound · MUST

A server keeps an idle connection open longer than the proxy or the load balancer in front of it keeps it.

| Why |
|---|
| a proxy that sends a request down a connection the server has just closed gets a reset, and its caller an error for a request nobody served. |

## Probes

### probe-answer-holds-only-its-status · MUST

A probe served over HTTP answers only its status. Its answer holds no version, no name of a dependency, no error.

| Why |
|---|
| a probe is reached by whoever reaches its address, and a version, a dependency's name or an error tells an attacker what to aim at. |
