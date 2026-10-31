# Cache

> Governs how an answer is cached.

## General

### answer-varies-by-the-headers-it-reads · MUST

An answer that depends on a request header names it in `Vary` — `Origin` wherever `Access-Control-Allow-Origin` is not `*`, `Accept-Language` and `Accept` wherever they choose the body.

| Why |
|---|
| a cache otherwise serves the answer made for one origin, language or type to a request for another. |

### get-answer-states-its-cache-policy · SHOULD

Every answer to a `GET` states its `Cache-Control`.

| Why |
|---|
| with no directive each cache decides on its own how long to keep the answer. |
