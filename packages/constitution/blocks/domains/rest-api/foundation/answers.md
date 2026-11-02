# Answers

> Governs a REST operation's failures, its conditions, its repeats and rate limits, its long work and its body.

## Failures

### failure-answered-as-a-problem-document → failure-answered-by-its-code · MUST

A failure of a REST operation is answered as a problem document. It carries the status its code or kind maps to — `500` for an internal one — and a problem details body of RFC 9457, whose `type` names its code and which carries the code as a member of its own and, where it names its occurrence, names it in its `instance`; a refused input lists each field it refused by its JSON Pointer.

| Why |
|---|
| a failure in a shape of the program's own is parsed by every client its own way, and one that does not point at the field leaves the caller guessing what to fix — RFC 9457. |

## Concurrency

### update-guarded-by-if-match → write-on-read-data-is-conditional · MUST

A write to a REST resource several callers may change is guarded by `If-Match`. The resource answers with an `ETag`, and a `PUT`, `PATCH` or `DELETE` of it honours `If-Match`, answering `412` when the tag no longer matches and `428` when the request carries none.

| Why |
|---|
| a write made on a stale read otherwise overwrites the change between, and the tag is how HTTP carries the version read — RFC 9110 and RFC 6585. |

## Repeats

### idempotency-key-carried-by-its-header → write-takes-an-idempotency-key · SHOULD

A REST write's idempotency key travels in the `Idempotency-Key` header, and a repeat is answered from the key's record. A creation's own identifier travels in its path; a repeat with a key already seen is answered from its record, the key reused with another body is answered `422`, and a repeat while the first is still running `409`.

| Why |
|---|
| a key carried where each API chooses, or a repeat answered with statuses of its own, is handled differently by every client and proxy, and one that misses the key performs the write again — the IETF's Idempotency-Key header draft. |

## Rate limits

### rate-limited-answer-says-when-to-retry → caller-rate-limited · SHOULD

A request refused for its rate answers with `Retry-After`, and published quotas travel in the IETF's rate-limit fields. A server that publishes its quotas states them in `RateLimit-Policy` and `RateLimit`, the fields of the IETF's RateLimit header draft.

| Why |
|---|
| a client not told when to come back guesses, and retries at once into the load that refused it, and quotas stated in headers of the API's own are read by no standard client — RFC 9110 and the IETF's RateLimit header draft. |

## Long work

### long-operation-answered-202-with-its-status → long-operation-answered-with-a-handle · SHOULD

A long REST operation answers `202` with the `Location` of a status resource. The status resource shows its state — running, succeeded, failed — then its result or its problem document, and carries `Retry-After` while it runs.

| Why |
|---|
| a long operation answered in a shape of its own leaves every client and proxy to learn where its outcome waits, and one that sends no `Retry-After` is polled as fast as each client likes. |

## Bodies

### answer-top-level-is-an-object · MUST

A REST answer's body is a JSON object at its top level, a collection's items in one of its fields, never a bare array or value.

| Why |
|---|
| a bare array can never gain a cursor or a count without breaking every caller. |
