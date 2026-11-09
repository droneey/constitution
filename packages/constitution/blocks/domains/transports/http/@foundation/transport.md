# Transport

> Governs TLS, the caller's address behind a proxy, and how long a request and a connection may last.

## General

### served-only-over-tls → network-connection-encrypted · MUST

Every request its caller sent over plain HTTP, on a connection other than a local connection, is refused, never served or redirected. The refusal is the program's own or that of a proxy its host runs for it. Exempt: a page a browser navigates to, and a certificate authority's `http-01` challenge request, each of which is redirected to the same address over TLS.

#### Why

A credential or a body sent in a plain request has already crossed in clear, so a redirect teaches its caller that the plain address works, while a browser that opens the plain address of a page first, and a certificate authority that asks for its challenge there first, are brought to TLS only by the redirect — RFC 8555 asks the authority to follow it.

#### Examples

```text title="Avoid"
POST http://api.shop.example/orders
Authorization: Bearer 6f1c...

HTTP/1.1 301 Moved Permanently
Location: https://api.shop.example/orders
X-Content-Type-Options: nosniff
```

```text title="Prefer"
POST http://api.shop.example/orders
Authorization: Bearer 6f1c...

HTTP/1.1 403 Forbidden
Content-Type: application/problem+json
X-Content-Type-Options: nosniff

{"title": "Use https://api.shop.example"}
```

### tls-answer-sets-strict-transport-security → network-connection-encrypted · MUST

Every answer to a request that came over TLS carries `Strict-Transport-Security`. That TLS, and the header, are the program's own or those of a proxy its host runs for it.

#### Why

Without the header a browser tries the plain address again on its next visit, where whoever sits on its path answers first — RFC 6797.

#### Examples

```text title="Avoid"
GET https://shop.example/cart

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: private, no-store
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET https://shop.example/cart

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: private, no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### client-address-taken-from-a-trusted-proxy · MUST

Every caller's address and scheme are taken from forwarding headers only when a proxy the program names set them. They are read from `Forwarded`, or from `X-Forwarded-For` and `X-Forwarded-Proto`, only then, and otherwise from the connection.

#### Why

A header any caller can write otherwise decides its rate limit, the address the program records for it and whether it is redirected to TLS.

#### Examples

```pseudo title="Avoid"
function clientAddress(request)
  return request.headers["X-Forwarded-For"].split(",")[0]
    ?? request.connection.remoteAddress
```

```pseudo title="Prefer"
function clientAddress(request)
  if not config.trustedProxies.has(request.connection.remoteAddress) then
    return request.connection.remoteAddress

  return lastUntrustedHop(request.headers["X-Forwarded-For"], config.trustedProxies)
```

## Connections

### request-read-within-a-time-bound · MUST

The server reads every request within a time bound, and closes a connection past it. It bounds how long it waits for a request's headers, for its body and on an idle connection.

#### Why

A caller that sends a byte at a time otherwise holds a connection for ever, and a few hundred of them take the server down.

#### Examples

```pseudo title="Avoid"
let server = new HttpServer({
  handler: routes,
})
```

```pseudo title="Prefer"
let server = new HttpServer({
  handler: routes,
  headersTimeout: 10 seconds,
  bodyTimeout: 30 seconds,
  idleTimeout: 60 seconds,
})
```

### long-lived-connection-bounded · MUST

Every long-lived connection, such as a WebSocket or an event stream, is closed after an idle time the project sets. A connection its caller writes to, such as a WebSocket, is idle while no frame arrives from its caller, and one the program only writes to, such as an event stream, while it sends no event.

#### Why

Connections a caller left open hold the server's memory and its sockets until it falls.

#### Examples

```pseudo title="Avoid"
server.onUpgrade("/orders/live", function(request, socket)
  socket.onMessage(handleMessage))
```

```pseudo title="Prefer"
server.onUpgrade("/orders/live", function(request, socket)
  let idle = new IdleTimer(config.liveIdleTimeout, function()
    socket.close(1001))

  socket.onMessage(function(message)
    idle.reset()
    handleMessage(message)))
```
