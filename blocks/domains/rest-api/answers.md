# Answers

> Governs a REST operation's status, body and conditions.

## Statuses

### rest-status-means-what-http-registers · MUST
A REST operation answers a status HTTP registers, for its registered meaning: a `2xx` only for a success, never a failure inside a `200` body, a `4xx` for the caller's failure and a `5xx` for the server's.

| Why | Tags |
|---|---|
| caches, proxies, retries and monitoring act on the status alone, and a failure sent as `200` is cached, counted as a success and never retried. | [errors] |

### failure-answered-as-a-problem-document → failure-answered-by-its-code · MUST
A failure of a REST operation carries the status its code or kind maps to — `500` for an internal one — and a body of RFC 9457, `application/problem+json`, whose `type` names its code and which carries the code as a member of its own; a refused input lists each field it refused by its JSON Pointer.

| Why | Tags |
|---|---|
| every failure arrives in one standard shape a client parses once, pointing at the field to fix. | [errors] |

## Concurrency

### update-guarded-by-if-match → write-on-read-data-is-conditional · MUST
A REST resource several callers may change answers with an `ETag`, and a `PUT`, `PATCH` or `DELETE` of it honours `If-Match`, answering `412` when the tag no longer matches and `428` when the request carries none.

| Why | Tags |
|---|---|
| a write made on a stale read otherwise overwrites the change between, and the tag is how HTTP carries the version read. | [data] |

## Long work

### long-operation-answered-202-with-its-status → long-operation-answered-with-a-handle · SHOULD
A long REST operation answers `202` with the `Location` of a status resource, which shows its state — running, succeeded, failed — then its result or its problem document, and carries `Retry-After` while it runs.

| Why | Tags |
|---|---|
| a request held open for long work is cut by a proxy, and its caller can neither learn the outcome nor retry safely. | [] |

## Bodies

### answer-top-level-is-an-object · MUST
A REST answer's body is a JSON object at its top level, a collection's items in one of its fields, never a bare array or value.

| Why | Tags |
|---|---|
| a bare array can never gain a cursor or a count without breaking every caller. | [] |
