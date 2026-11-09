# Accounts

> Governs how an answer shaped by its caller is cached, how a refused caller and a delete of a resource its caller may not see are answered, and whom a socket acts for.

## Caches

### personal-answer-kept-out-of-shared-caches → caller-shaped-result-never-served-from-a-cache-to-another · MUST

Every answer shaped by its caller, such as one of their own data, their rights or their tenant, sets `Cache-Control: private` or `no-store`.

#### Why

With no directive a shared cache may keep one caller's answer and serve it to the next.

#### Examples

```text title="Avoid"
GET /me/orders
Cookie: session=9f2c...

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET /me/orders
Cookie: session=9f2c...

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=60
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### shared-cache-never-told-to-store-a-personal-answer → caller-shaped-result-never-served-from-a-cache-to-another · MUST

No shared cache in front of the server is given a rule that stores an answer shaped by its caller. Such a cache is a content delivery network's or a proxy's, for one.

#### Why

A rule of the shared cache that overrides the answer's own directive keeps one caller's answer and serves it to the next.

#### Examples

```text title="Avoid"
cache rules
  /me/*        cache 5 min, ignore Cache-Control
  /catalogue/* cache 5 min
```

```text title="Prefer"
cache rules
  /me/*        bypass
  /catalogue/* cache 5 min
```

## Refusals

### unauthenticated-request-answered-401 · MUST

Where an operation needs a verified identity, every request it refuses for want of valid credentials is answered `401`. The answer carries a `WWW-Authenticate` challenge. Exempt: a page a browser navigates to, which is sent to sign in.

#### Why

A caller tells a missing sign-in from a missing right by the status alone, and a `401` without its challenge leaves it no way to sign in.

#### Examples

```text title="Avoid"
GET /api/orders
Authorization: Bearer expired...

HTTP/1.1 403 Forbidden
Cache-Control: no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET /api/orders
Authorization: Bearer expired...

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token"
Cache-Control: no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### unauthorised-request-answered-403 · MUST

Every request whose valid credentials lack the right is answered `403`. Exempt: a request naming an object the program answers to that caller as not found, and a refusal that a protocol carried over HTTP answers inside its own answer, such as a JSON-RPC result or error.

#### Why

A `401` sent to a signed-in caller only sends it to sign in again, where the right it lacks is still missing.

#### Examples

```text title="Avoid"
POST /api/refunds
Authorization: Bearer valid-clerk...

HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
POST /api/refunds
Authorization: Bearer valid-clerk...

HTTP/1.1 403 Forbidden
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{"type": "/problems/missing-right", "title": "Refunds need the refunds:write right"}
```

### hidden-resource-delete-answers-as-absent → hidden-object-answered-as-not-found · MUST

Every `DELETE` of an object hidden from its caller deletes nothing and answers as a `DELETE` of an identifier that names nothing. An object is hidden from its caller where the program answers it to that caller as not found.

#### Why

A `DELETE` of a hidden resource answered otherwise than one of an identifier that names nothing, such as success where that one answers `404`, tells its caller the resource exists.

#### Examples

```pseudo title="Avoid"
function onDeleteOrder(orderId, caller)
  let order = orders.find(orderId)

  if order is <absent> then
    return notFound()

  if order.customerId != caller.customerId then
    return forbidden()

  orders.delete(order.id)
  return noContent()
```

```pseudo title="Prefer"
function onDeleteOrder(orderId, caller)
  let order = orders.findOwnedBy(orderId, caller.customerId)

  if order is <absent> then
    return notFound()

  orders.delete(order.id)
  return noContent()
```

## Sockets

### socket-acts-for-a-person-only-on-valid-credentials → operation-access-checked-on-every-call · MUST

Every WebSocket that acts for a signed-in person acts only while that person's session is valid. It checks their credentials at the upgrade, and closes once that session ends.

#### Why

A socket outlives the request that opened it, so one checked only at its upgrade keeps acting for a person who signed out in another tab, or whose session was ended because it was stolen.

#### Examples

```pseudo title="Avoid"
server.onUpgrade("/orders/live", function(request, socket)
  let session = sessions.verify(request.cookies["session"])

  if session is <absent> then
    return socket.refuse(401)

  socket.onMessage(function(message)
    handleMessage(session.person, message)))  # acts after sign-out
```

```pseudo title="Prefer"
server.onUpgrade("/orders/live", function(request, socket)
  let session = sessions.verify(request.cookies["session"])

  if session is <absent> then
    return socket.refuse(401)

  sessions.onEnd(session.id, function()
    socket.close(1008))

  socket.onMessage(function(message)
    handleMessage(session.person, message)))
```
