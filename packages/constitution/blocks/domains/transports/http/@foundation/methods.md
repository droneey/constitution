# Methods

> Governs what a method and a status mean, what a method may change, and how a repeated delete is answered.

## General

### method-used-in-its-registered-meaning · MUST

Every method is used in the meaning RFC 9110 and the IANA registry give it. A request by a safe method, such as `GET`, `HEAD` or `OPTIONS`, changes no state.

#### Why

Callers, proxies and retrying libraries act on the method alone: they repeat a `PUT` or a `DELETE` on their own, and a link, a prefetch, a crawler or a cache sends a safe method's request without anyone meaning its effect, as a forged page does with the user's cookies — RFC 9110.

#### Examples

```text title="Avoid"
GET /orders/42/cancel

HTTP/1.1 200 OK
Cache-Control: no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
POST /orders/42/cancellation

HTTP/1.1 201 Created
Location: /orders/42/cancellation
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### status-used-in-its-registered-meaning · MUST

Every status is used in the meaning RFC 9110 and the IANA registry give it. No failure travels under a success status, nor a success under a failure's. Exempt: a failure that a protocol carried over HTTP reports inside its own answer, such as a JSON-RPC result or error.

#### Why

Callers, caches and monitors act on the status alone, so a failure sent as `200` is cached, counted as a success and never retried — RFC 9110 and the IANA registry.

#### Examples

```text title="Avoid"
POST /orders

HTTP/1.1 200 OK
Content-Type: application/json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{"ok": false, "error": "Cart is empty"}
```

```text title="Prefer"
POST /orders

HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{"type": "/problems/cart-empty", "title": "Cart is empty"}
```

### repeated-delete-answers-as-the-first · MUST

Every `DELETE` of a resource that is already gone answers as the first `DELETE` of it would have answered its caller. It never answers `404`, nor `412` for a condition it carries. Exempt: a repeat that carries an idempotency key already seen, answered from that key's record before any other check.

#### Why

A caller, or the library it calls through, repeats a `DELETE` whose first answer it lost, and a `404`, or the `412` an `If-Match` with nothing left to match gets, then reads as the failure of a delete that succeeded, so it reports an error for what is done or tries again what cannot change — RFC 9110 lets a server whose change is already made answer a failed condition with success.

#### Examples

```text title="Avoid"
DELETE /carts/7/items/3

HTTP/1.1 204 No Content
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

DELETE /carts/7/items/3

HTTP/1.1 404 Not Found
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
DELETE /carts/7/items/3

HTTP/1.1 204 No Content
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

DELETE /carts/7/items/3

HTTP/1.1 204 No Content
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```
