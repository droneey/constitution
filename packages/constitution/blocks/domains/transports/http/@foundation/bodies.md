# Bodies

> Governs the type of every body, an uploaded file's included.

## General

### answer-declares-its-exact-content-type · MUST

Every answer with a body carries its exact `Content-Type`.

#### Why

A caller that knows the type parses the body as it was meant, while one left to guess it may take text another caller stored for a page and run it.

#### Examples

```text title="Avoid"
GET /invoices/42

HTTP/1.1 200 OK
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{"id": 42, "total": "120.00"}
```

```text title="Prefer"
GET /invoices/42

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{"id": 42, "total": "120.00"}
```

### answer-forbids-type-sniffing · MUST

Every answer carries `X-Content-Type-Options: nosniff`.

#### Why

A browser that guesses an answer's type from its content runs as a page or a script what the server declared as data.

#### Examples

```text title="Avoid"
GET /invoices/42/note

HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
```

```text title="Prefer"
GET /invoices/42/note

HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### data-operation-never-answers-a-page · MUST

Every operation that answers data, such as JSON, never answers `text/html`, its failures and the framework's default answers included.

#### Why

A page an API answers, the framework's own error page among them, runs in the program's origin with whatever text of a caller it holds.

#### Examples

```text title="Avoid"
GET /api/orders/abc

HTTP/1.1 500 Internal Server Error
Content-Type: text/html
Cache-Control: no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

<h1>Error</h1><pre>Cannot parse "abc"</pre>
```

```text title="Prefer"
GET /api/orders/abc

HTTP/1.1 400 Bad Request
Content-Type: application/problem+json
Cache-Control: no-store
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff

{"type": "/problems/invalid-order-id", "title": "Invalid order id"}
```

### request-body-refused-in-an-undeclared-type · MUST

Every request body in a media type its operation does not declare is refused with `415`, before it is read. An operation of JSON, for one, accepts neither `text/plain` nor a form encoding.

#### Why

A page on another origin sends `text/plain` and form bodies without a preflight, so an API that reads them as JSON accepts forged writes.

#### Examples

```pseudo title="Avoid"
function onCreateOrder(request)
  let body = parseJson(request.readBody())

  return created(placeOrder(parseCreateOrderInput(body)))
```

```pseudo title="Prefer"
function onCreateOrder(request)
  if mediaType(request.headers["Content-Type"]) != "application/json" then
    return unsupportedMediaType()

  let body = parseJson(request.readBody())

  return created(placeOrder(parseCreateOrderInput(body)))
```

## Uploads

### uploaded-file-never-rendered-from-the-programs-origin · MUST

No uploaded file is ever opened as a page of the program's own origin. A file a person uploaded is served from a registrable domain other than the program's, or with `Content-Disposition: attachment` or `Content-Security-Policy: sandbox`.

#### Why

An uploaded SVG image or markup page opened from the program's origin, or from a sibling host of its site, runs its script with every visitor's session.

#### Examples

```text title="Avoid"
GET https://shop.example/uploads/receipt.svg

HTTP/1.1 200 OK
Content-Type: image/svg+xml
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET https://shop.example/uploads/receipt.svg

HTTP/1.1 200 OK
Content-Type: image/svg+xml
Content-Disposition: attachment; filename="receipt.svg"
Content-Security-Policy: sandbox
Cache-Control: private, no-cache
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```
