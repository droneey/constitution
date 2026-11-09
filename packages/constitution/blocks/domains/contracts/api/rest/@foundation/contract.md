# Contract

> Governs the OpenAPI document, the version, and how an operation or a field is retired.

## General

### contract-published-as-openapi → contract-published-machine-readable · MUST

Every REST API publishes its contract as an OpenAPI document of version 3.1 or later.

#### Why

A contract in a format no standard tool reads gets no generated client and no check, so each caller writes its client by hand and drifts from the server unseen, and a version before 3.1 holds no full JSON Schema.

#### Examples

```text title="Avoid"
swagger: "2.0"
info:
  title: Orders API
  version: 4.2.0
```

```text title="Prefer"
openapi: 3.1.1
info:
  title: Orders API
  version: 4.2.0
```

### answer-enumeration-a-string-of-known-values → enumeration-in-a-shared-format-declared-extensible · MUST

Every enumeration in a REST answer is declared in the OpenAPI document as a string that lists its known values. It lists them in its `examples`, or in an `anyOf` of a closed `enum` of them and a plain string, never in a closed `enum` alone. Exempt: a set complete by its meaning, such as a sort direction, which stays a closed `enum`.

#### Why

A generator and a validator read a JSON Schema `enum` as closed, so the first value added fails every client built before it, and a list of known values each team writes its own way is read by each generator its own way — Zalando's API guidelines.

#### Examples

```text title="Avoid"
OrderStatus:
  type: string
  enum: [open, paid, shipped, cancelled]
```

```text title="Prefer"
OrderStatus:
  type: string
  description: Clients expect values not listed here.
  examples: [open, paid, shipped, cancelled]
```

### version-named-once-by-its-major · SHOULD

Every REST API names its major version once, at the head of every path, from its first release. No header, parameter or other part of a request names it.

#### Why

A version named in a header or a parameter is invisible in logs, cache keys, routes and links, so a cache serves one version's answer for another.

#### Examples

```text title="Avoid"
GET /orders/ord-7 HTTP/1.1
Api-Version: 2
```

```text title="Prefer"
GET /v2/orders/ord-7 HTTP/1.1
```

### major-version-raised-only-by-a-breaking-change · SHOULD

Every new major version of a REST API comes only with a breaking change.

#### Why

Versions cut for changes that break nothing multiply what every caller must choose between.

#### Examples

```text title="Avoid"
/v2   orders
/v3   orders, plus an optional "giftNote"
```

```text title="Prefer"
/v2   orders, plus an optional "giftNote"
/v3   orders, "total" split into "net" and "tax"
```

## Retirement

### retired-field-marked-deprecated-in-the-openapi-document → retired-operation-announced-before-removal · MUST

Every field a REST API retires is marked `deprecated` in its OpenAPI document, naming its replacement and its removal date.

#### Why

A field has no header of its own, so one retired without the mark in the contract disappears from under a caller and a generated client that never learned it was going.

#### Examples

```text title="Avoid"
Order:
  properties:
    total:
      type: string
    amount:
      type: string
```

```text title="Prefer"
Order:
  properties:
    total:
      type: string
      deprecated: true
      description: Retired; read amount. Removed on 2027-06-01.
    amount:
      type: string
```

### retired-operation-answers-deprecation-headers → retired-operation-announced-before-removal · MUST

Every REST operation being retired answers with `Deprecation` (RFC 9745) and `Sunset` (RFC 8594), its sunset no earlier than its deprecation.

#### Why

A retirement announced only in documents is missed by a caller's monitoring, which first learns of it from the removal that breaks it — RFC 9745 and RFC 8594.

#### Examples

```text title="Avoid"
GET /v1/orders/ord-7 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET /v1/orders/ord-7 HTTP/1.1

HTTP/1.1 200 OK
Content-Type: application/json
Deprecation: @1777593600
Sunset: Tue, 01 Jun 2027 00:00:00 GMT
Link: <https://api.shop.example.com/notices/orders-v1>; rel="deprecation"; type="text/html"
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### retired-operation-links-its-notice · SHOULD

Every REST operation being retired answers with a `Link` of `rel="deprecation"` to its notice.

#### Why

A caller whose monitoring finds the headers learns no reason, replacement or plan without the notice they point to — RFC 9745.

#### Examples

```text title="Avoid"
HTTP/1.1 200 OK
Deprecation: @1777593600
Sunset: Tue, 01 Jun 2027 00:00:00 GMT
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
HTTP/1.1 200 OK
Deprecation: @1777593600
Sunset: Tue, 01 Jun 2027 00:00:00 GMT
Link: <https://api.shop.example.com/notices/orders-v1>; rel="deprecation"; type="text/html"
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```
