# Answers

> Governs a REST operation's failures, its conditions, its repeats and rate limits, its work that outlasts its answer, and its body.

## Failures

### failure-answered-as-a-problem-document → failure-answered-by-its-code · MUST

Every REST failure is answered as an RFC 9457 problem document, with the status its code or kind maps to. The `type` of an expected failure names its code.

#### Why

A failure in a shape of the program's own is parsed by every client its own way, while a problem document is read by every client and tool that knows the standard — RFC 9457.

#### Examples

```text title="Avoid"
HTTP/1.1 422 Unprocessable Content
Content-Type: application/json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{ "error": true, "msg": "Cart is empty" }
```

```text title="Prefer"
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "type": "https://api.shop.example.com/problems/cart.empty",
  "title": "The cart is empty",
  "status": 422,
  "detail": "Add a product to cart crt-4 before checking out.",
  "instance": "urn:occurrence:occ_2b81d0f4c7"
}
```

### defect-answered-500 → defect-answered-as-an-internal-error · MUST

Every defect of a REST request is answered `500`.

#### Why

A client, a proxy and a monitor tell a fault of the server from a failure of what it calls by the status alone, so a defect answered `502` or `503` is retried as a passing outage, or blamed on another system — RFC 9110.

#### Examples

```text title="Avoid"
HTTP/1.1 503 Service Unavailable
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "type": "about:blank",
  "title": "Service Unavailable",
  "status": 503,
  "instance": "urn:occurrence:occ_7f3a9c2e41"
}
```

```text title="Prefer"
HTTP/1.1 500 Internal Server Error
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "type": "about:blank",
  "title": "Internal Server Error",
  "status": 500,
  "instance": "urn:occurrence:occ_7f3a9c2e41"
}
```

### problem-instance-names-its-occurrence → failure-answer-names-its-occurrence · MUST

Every problem document that names its failure's occurrence names it in its `instance`.

#### Why

An occurrence named in a member of the API's own is found by no client or tool that reads problem documents, so support is quoted nothing it can search for — RFC 9457.

#### Examples

```text title="Avoid"
{
  "type": "about:blank",
  "title": "Internal Server Error",
  "status": 500,
  "traceRef": "occ_7f3a9c2e41"
}
```

```text title="Prefer"
{
  "type": "about:blank",
  "title": "Internal Server Error",
  "status": 500,
  "instance": "urn:occurrence:occ_7f3a9c2e41"
}
```

### refused-field-pointed-at-by-json-pointer → refused-input-answer-names-each-field-by-path · MUST

Every problem document of a refused JSON body names each field it refused by that field's JSON Pointer.

#### Why

A path written in a notation of the API's own is read differently by every client, so the caller cannot point its user at the field to fix — RFC 6901.

#### Examples

```text title="Avoid"
{
  "type": "https://api.shop.example.com/problems/request.invalid-input",
  "status": 422,
  "instance": "urn:occurrence:occ_5e09a1b3d8",
  "errors": [
    { "field": "lines[2].quantity", "detail": "must be at least 1" }
  ]
}
```

```text title="Prefer"
{
  "type": "https://api.shop.example.com/problems/request.invalid-input",
  "status": 422,
  "instance": "urn:occurrence:occ_5e09a1b3d8",
  "errors": [
    { "pointer": "#/lines/2/quantity", "detail": "must be at least 1" }
  ]
}
```

## Concurrency

### changeable-resource-answers-with-its-etag → write-on-read-data-is-conditional · MUST

Every REST resource several callers may change answers with an `ETag`.

#### Why

A caller with no tag of what it read has nothing to make its write conditional on, so its write lands over whatever changed since — RFC 9110.

#### Examples

```text title="Avoid"
GET /v1/orders/ord-7 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{ "id": "ord-7", "status": "open", "note": "Leave at the door" }
```

```text title="Prefer"
GET /v1/orders/ord-7 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
ETag: "v7"
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{ "id": "ord-7", "status": "open", "note": "Leave at the door" }
```

### update-guarded-by-if-match → write-on-read-data-is-conditional · MUST

Every `PUT`, `PATCH` or `DELETE` of a REST resource several callers may change honours `If-Match`. It answers `412` when the tag no longer matches. Exempt: a `DELETE` of a resource already gone, answered as its first `DELETE`, and a write its key decides before any other check: a repeat of an `Idempotency-Key` or of a creation's own identifier, answered from that key's record or refused as a reused key.

#### Why

A write made on a stale read otherwise overwrites the change between, and the tag is how HTTP carries the version read — RFC 9110.

#### Examples

```text title="Avoid"
PATCH /v1/orders/ord-7 HTTP/1.1
Content-Type: application/merge-patch+json
If-Match: "v7"

{ "note": "Ring twice" }

HTTP/1.1 200 OK
ETag: "v9"
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

the change made in v8 is overwritten
```

```text title="Prefer"
PATCH /v1/orders/ord-7 HTTP/1.1
Content-Type: application/merge-patch+json
If-Match: "v7"

{ "note": "Ring twice" }

HTTP/1.1 412 Precondition Failed
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### unconditional-update-answered-428 → write-on-read-data-is-conditional · MUST

Every `PUT`, `PATCH` or `DELETE` of an existing REST resource several callers may change is answered `428` when it carries no `If-Match`. Exempt: a write its key decides before any other check: a repeat of an `Idempotency-Key` or of a creation's own identifier, answered from that key's record or refused as a reused key.

#### Why

A write that carries no tag is made on a read nobody can check, so a server that accepts it lets a client that never read the resource overwrite another's change — RFC 6585.

#### Examples

```text title="Avoid"
PATCH /v1/orders/ord-7 HTTP/1.1
Content-Type: application/merge-patch+json

{ "note": "Ring twice" }

HTTP/1.1 200 OK
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
PATCH /v1/orders/ord-7 HTTP/1.1
Content-Type: application/merge-patch+json

{ "note": "Ring twice" }

HTTP/1.1 428 Precondition Required
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

## Repeats

### idempotency-key-carried-by-its-header · SHOULD

Every REST write's idempotency key travels in the `Idempotency-Key` header. Exempt: a creation's own identifier, which travels in its path.

#### Why

A key carried where each API chooses is handled differently by every client and proxy — the IETF's Idempotency-Key header draft.

#### Examples

```text title="Avoid"
POST /v1/orders/ord-7/payments HTTP/1.1
Content-Type: application/json

{ "amount": "48.00", "currency": "EUR", "requestKey": "pay-2026-11-08-0042" }
```

```text title="Prefer"
POST /v1/orders/ord-7/payments HTTP/1.1
Content-Type: application/json
Idempotency-Key: "pay-2026-11-08-0042"

{ "amount": "48.00", "currency": "EUR" }
```

### created-resource-identifier-carried-in-its-path · SHOULD

Every REST creation whose caller sends the identifier of what it creates carries that identifier in its path.

#### Why

An identifier carried in the body leaves the path naming a collection, so the request reads to every client and proxy as a creation that is not repeatable, and is not retried.

#### Examples

```text title="Avoid"
POST /v1/orders HTTP/1.1
Content-Type: application/json

{ "id": "ord-7", "lines": [{ "sku": "MUG-12", "quantity": 2 }] }
```

```text title="Prefer"
PUT /v1/orders/ord-7 HTTP/1.1
Content-Type: application/json

{ "lines": [{ "sku": "MUG-12", "quantity": 2 }] }
```

### reused-idempotency-key-answered-422 · SHOULD

Every REST request refused as a reused key is answered `422`, whether that key is its `Idempotency-Key` or a creation's own identifier.

#### Why

A reused key answered with a status of the API's own is handled differently by every client — the IETF's Idempotency-Key header draft.

#### Examples

```text title="Avoid"
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "type": "https://api.shop.example.com/problems/idempotency-key.reused",
  "status": 400,
  "instance": "urn:occurrence:occ_91c4e7a02f"
}
```

```text title="Prefer"
HTTP/1.1 422 Unprocessable Content
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "type": "https://api.shop.example.com/problems/idempotency-key.reused",
  "status": 422,
  "instance": "urn:occurrence:occ_91c4e7a02f"
}
```

### running-repeat-answered-409 · SHOULD

Every REST repeat that arrives while the first request of its idempotency key still runs is answered `409`.

#### Why

A repeat that arrives while the first still runs, answered with a status of the API's own, is handled differently by every client — the IETF's Idempotency-Key header draft.

#### Examples

```text title="Avoid"
POST /v1/orders/ord-7/payments HTTP/1.1
Idempotency-Key: "pay-2026-11-08-0042"

HTTP/1.1 425 Too Early
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "type": "https://api.shop.example.com/problems/idempotency-key.in-progress",
  "status": 425,
  "instance": "urn:occurrence:occ_3d7f0b9e15"
}
```

```text title="Prefer"
POST /v1/orders/ord-7/payments HTTP/1.1
Idempotency-Key: "pay-2026-11-08-0042"

HTTP/1.1 409 Conflict
Content-Type: application/problem+json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{
  "type": "https://api.shop.example.com/problems/idempotency-key.in-progress",
  "status": 409,
  "instance": "urn:occurrence:occ_3d7f0b9e15"
}
```

## Rate limits

### rate-limited-answer-says-when-to-retry → rate-refusal-says-when-to-retry · SHOULD

Every REST request refused for its rate answers with `Retry-After`.

#### Why

A client not told in the standard header when to come back guesses, and retries at once into the load that refused it — RFC 9110.

#### Examples

```text title="Avoid"
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
X-Retry-In: 30
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 30
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### published-quota-sent-in-ratelimit-fields · SHOULD

Every quota a REST server publishes is stated in `RateLimit-Policy` and `RateLimit`, the fields of the IETF's RateLimit header draft.

#### Why

Quotas stated in headers of the API's own are read by no standard client, so each caller learns its limit only by hitting it — the IETF's RateLimit header draft.

#### Examples

```text title="Avoid"
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1762617630
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
HTTP/1.1 200 OK
RateLimit-Policy: "default";q=100;w=60
RateLimit: "default";r=42;t=30
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

## Work that outlasts its answer

### long-operation-answered-202-with-its-status → long-operation-answered-with-a-handle · SHOULD

Every long REST operation answers `202` with the `Location` of a status resource. The status resource shows its state, running, succeeded or failed, then its result or its problem document.

#### Why

A long operation answered in a shape of its own leaves every client and proxy to learn where its outcome waits.

#### Examples

```text title="Avoid"
PUT /v1/order-exports/exp_4kq9 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{ "jobId": "job_311", "poll": "/v1/jobs?id=job_311" }
```

```text title="Prefer"
PUT /v1/order-exports/exp_4kq9 HTTP/1.1

HTTP/1.1 202 Accepted
Location: /v1/order-exports/exp_4kq9
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

GET /v1/order-exports/exp_4kq9 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{ "state": "succeeded", "result": { "fileUrl": "/v1/files/exp_4kq9.csv" } }
```

### running-status-carries-retry-after → long-operation-answered-with-a-handle · SHOULD

Every status resource of a long REST operation carries `Retry-After` while the operation runs.

#### Why

A status resource that sends no `Retry-After` is polled as fast as each client likes.

#### Examples

```text title="Avoid"
GET /v1/order-exports/exp_4kq9 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{ "state": "running" }
```

```text title="Prefer"
GET /v1/order-exports/exp_4kq9 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Retry-After: 5
Cache-Control: private, no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{ "state": "running" }
```

### unreadable-write-answered-202 → status-used-in-its-registered-meaning · MUST

Every REST write whose effect its caller cannot yet read answers `202`. It never answers a success that says it is done, such as `200`, `201` or `204`.

#### Why

A success that says the write is done tells its caller that what it wrote is there to read, so a caller that reads a write the program's reads have not caught up with gets a `404` and retries a write that took effect.

#### Examples

```text title="Avoid"
PUT /v1/reviews/rev-31 HTTP/1.1

HTTP/1.1 201 Created
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

the review appears once moderation has read it
```

```text title="Prefer"
PUT /v1/reviews/rev-31 HTTP/1.1

HTTP/1.1 202 Accepted
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

## Bodies

### answer-top-level-is-an-object · SHOULD

Every REST answer whose body is JSON is an object at its top level, never a bare array or value. A collection's items sit in one of its fields.

#### Why

A bare array can never gain a cursor or a count without breaking every caller.

#### Examples

```text title="Avoid"
GET /v1/orders HTTP/1.1

[
  { "id": "ord-7", "status": "open" },
  { "id": "ord-8", "status": "shipped" }
]
```

```text title="Prefer"
GET /v1/orders HTTP/1.1

{
  "items": [
    { "id": "ord-7", "status": "open" },
    { "id": "ord-8", "status": "shipped" }
  ],
  "nextCursor": "b3JkLTg"
}
```
