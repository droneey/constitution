# Cache

> Governs how an answer is cached.

## General

### answer-varies-by-the-headers-it-reads · MUST

Every answer names in `Vary` every request header it depends on. Among them are `Origin` wherever `Access-Control-Allow-Origin` is not `*`, and `Accept-Language` and `Accept` wherever they choose the body.

#### Why

A cache otherwise serves the answer made for one origin, language or type to a request for another.

#### Examples

```text title="Avoid"
GET /catalogue
Accept-Language: uk

HTTP/1.1 200 OK
Content-Language: uk
Cache-Control: public, max-age=300
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET /catalogue
Accept-Language: uk

HTTP/1.1 200 OK
Content-Language: uk
Cache-Control: public, max-age=300
Vary: Accept-Language
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

### get-answer-states-its-cache-policy · SHOULD

Every answer to a `GET` states its `Cache-Control`.

#### Why

With no directive each cache decides on its own how long to keep the answer, so a caller is served a stale one, or a fresh one is fetched again on every request.

#### Examples

```text title="Avoid"
GET /catalogue/products/42

HTTP/1.1 200 OK
Content-Type: application/json
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```

```text title="Prefer"
GET /catalogue/products/42

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=60
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
```
