# HTTP

> Governs how a server's connections, its stop and its probes meet HTTP.

## Connections

### stopping-server-closes-each-connection · MUST

Once its stop begins, every server closes each connection it keeps open after the answer in flight on it is sent. It closes an HTTP/1.1 connection by `Connection: close` and an HTTP/2 one by `GOAWAY`, and ends a WebSocket or an event stream by its protocol's close, so its caller reconnects to another instance.

| Why |
|---|
| a caller on a kept connection sends its next request to an instance that is leaving, and a long-lived connection held to the end is cut by the kill with no word to reconnect. |

### server-idle-connection-outlasts-the-proxy → request-read-within-a-time-bound · MUST

Behind a proxy or a load balancer, every server keeps idle connections open longer than what stands in front of it does.

| Why |
|---|
| a proxy that sends a request down a connection the server has just closed gets a reset, and its caller an error for a request nobody served. |

## Probes

### probe-answer-holds-only-its-status · MUST

Every probe a server serves over HTTP answers with its status code. Its body names no version, no dependency and no error.

| Why |
|---|
| a probe is reached by whoever reaches its address, and a version, a dependency's name or an error tells an attacker what to aim at. |
