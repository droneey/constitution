# Cache

> Governs how an answer is cached.

## General

### personal-answer-kept-out-of-shared-caches · MUST

An answer that carries a caller's own data sets `Cache-Control: private` or `no-store`, and no shared cache in front of the server — a CDN's or a proxy's — is given a rule that stores it anyway.

| Why | Tags |
|---|---|
| with no directive a shared cache may keep one caller's answer and serve it to the next. | [security, data] |

### answer-varies-by-the-headers-it-reads · MUST

An answer that depends on a request header names it in `Vary` — `Origin` wherever `Access-Control-Allow-Origin` is not `*`, `Accept-Language` and `Accept` wherever they choose the body.

| Why | Tags |
|---|---|
| a cache otherwise serves the answer made for one origin, language or type to a request for another. | [security] |

### get-answer-states-its-cache-policy · SHOULD

Every answer to a `GET` states its `Cache-Control`.

| Why | Tags |
|---|---|
| with no directive each cache decides on its own how long to keep the answer. | [performance] |
