# Answers

> Governs a REST operation's method and status, its conditions, its repeats and rate limits, its long work and its body.

## Statuses

### rest-method-and-status-mean-what-http-registers · MUST

Methods and statuses mean what HTTP registers; a `DELETE` of something already gone answers `204`, as the first one did, so a repeat after a lost answer reads as done.

| Why |
|---|
| clients, proxies, caches and retrying libraries act on the method and the status alone: they repeat a `PUT` or a `DELETE` on their own, and a failure sent as `200` is cached, counted as a success and never retried. |

### failure-answered-as-a-problem-document → failure-answered-by-its-code · MUST

A failure of a REST operation carries the status its code or kind maps to — `500` for an internal one — and a problem details body of RFC 9457, whose `type` names its code and which carries the code as a member of its own and, where it names its occurrence, names it in its `instance`; a refused input lists each field it refused by its JSON Pointer.

| Why |
|---|
| every failure arrives in one standard shape a client parses once, pointing at the field to fix. |

## Concurrency

### update-guarded-by-if-match → write-on-read-data-is-conditional · MUST

A REST resource several callers may change answers with an `ETag`, and a `PUT`, `PATCH` or `DELETE` of it honours `If-Match`, answering `412` when the tag no longer matches and `428` when the request carries none.

| Why |
|---|
| a write made on a stale read otherwise overwrites the change between, and the tag is how HTTP carries the version read. |

## Repeats

### idempotency-key-carried-by-its-header → write-takes-an-idempotency-key · SHOULD

A key the server keeps travels in the `Idempotency-Key` header, and a creation's own identifier in its path, `PUT /orders/{orderId}`; a repeat with a key already seen is answered from its record before any precondition is evaluated, and the key reused with another body, or a repeat while the first is still running, is answered `409`.

| Why |
|---|
| one header and two statuses let every client and proxy handle a repeat the same way. |

## Rate limits

### rate-limited-answer-says-when-to-retry → caller-rate-limited · SHOULD

A request refused for its rate answers with `Retry-After`; a server that publishes its quotas states them in `RateLimit-Policy` and `RateLimit`.

| Why |
|---|
| a client told when to come back waits that long instead of guessing, and its retry waits for the delay the server asked rather than adding to the load that refused it. |

## Long work

### long-operation-answered-202-with-its-status → long-operation-answered-with-a-handle · SHOULD

A long REST operation answers `202` with the `Location` of a status resource, which shows its state — running, succeeded, failed — then its result or its problem document, and carries `Retry-After` while it runs.

| Why |
|---|
| a request held open for long work is cut by a proxy, and its caller can neither learn the outcome nor retry safely. |

## Bodies

### answer-top-level-is-an-object · MUST

A REST answer's body is a JSON object at its top level, a collection's items in one of its fields, never a bare array or value.

| Why |
|---|
| a bare array can never gain a cursor or a count without breaking every caller. |
