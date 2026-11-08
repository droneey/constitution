# Answers

> Governs a REST operation's failures, its conditions, its repeats and rate limits, its work that outlasts its answer, and its body.

## Failures

### failure-answered-as-a-problem-document → failure-answered-by-its-code · MUST

Every REST failure is answered as an RFC 9457 problem document, with the status its code or kind maps to. The `type` of an expected failure names its code.

| Why |
|---|
| a failure in a shape of the program's own is parsed by every client its own way, while a problem document is read by every client and tool that knows the standard — RFC 9457. |

### defect-answered-500 → defect-answered-as-an-internal-error · MUST

Every defect of a REST request is answered `500`.

| Why |
|---|
| a client, a proxy and a monitor tell a fault of the server from a failure of what it calls by the status alone, so a defect answered `502` or `503` is retried as a passing outage, or blamed on another system — RFC 9110. |

### problem-instance-names-its-occurrence → failure-answer-names-its-occurrence · MUST

Every problem document that names its failure's occurrence names it in its `instance`.

| Why |
|---|
| an occurrence named in a member of the API's own is found by no client or tool that reads problem documents, so support is quoted nothing it can search for — RFC 9457. |

### refused-field-pointed-at-by-json-pointer → refused-input-answer-names-each-field-by-path · MUST

Every problem document of a refused JSON body names each field it refused by that field's JSON Pointer.

| Why |
|---|
| a path written in a notation of the API's own is read differently by every client, so the caller cannot point its user at the field to fix — RFC 6901. |

## Concurrency

### changeable-resource-answers-with-its-etag → write-on-read-data-is-conditional · MUST

Every REST resource several callers may change answers with an `ETag`.

| Why |
|---|
| a caller with no tag of what it read has nothing to make its write conditional on, so its write lands over whatever changed since — RFC 9110. |

### update-guarded-by-if-match → write-on-read-data-is-conditional · MUST

Every `PUT`, `PATCH` or `DELETE` of a REST resource several callers may change honours `If-Match`. It answers `412` when the tag no longer matches. Exempt: a `DELETE` of a resource already gone, answered as its first `DELETE`, and a write its key decides before any other check: a repeat of an `Idempotency-Key` or of a creation's own identifier, answered from that key's record or refused as a reused key.

| Why |
|---|
| a write made on a stale read otherwise overwrites the change between, and the tag is how HTTP carries the version read — RFC 9110. |

### unconditional-update-answered-428 → write-on-read-data-is-conditional · MUST

Every `PUT`, `PATCH` or `DELETE` of an existing REST resource several callers may change is answered `428` when it carries no `If-Match`. Exempt: a write its key decides before any other check: a repeat of an `Idempotency-Key` or of a creation's own identifier, answered from that key's record or refused as a reused key.

| Why |
|---|
| a write that carries no tag is made on a read nobody can check, so a server that accepts it lets a client that never read the resource overwrite another's change — RFC 6585. |

## Repeats

### idempotency-key-carried-by-its-header · SHOULD

Every REST write's idempotency key travels in the `Idempotency-Key` header. Exempt: a creation's own identifier, which travels in its path.

| Why |
|---|
| a key carried where each API chooses is handled differently by every client and proxy — the IETF's Idempotency-Key header draft. |

### created-resource-identifier-carried-in-its-path · SHOULD

Every REST creation whose caller makes the identifier of what it creates carries that identifier in its path.

| Why |
|---|
| an identifier carried in the body leaves the path naming a collection, so the request reads to every client and proxy as a creation that is not repeatable, and is not retried. |

### reused-idempotency-key-answered-422 · SHOULD

Every REST request refused as a reused key is answered `422`, whether that key is its `Idempotency-Key` or a creation's own identifier.

| Why |
|---|
| a reused key answered with a status of the API's own is handled differently by every client — the IETF's Idempotency-Key header draft. |

### running-repeat-answered-409 · SHOULD

Every REST repeat that arrives while the first request of its idempotency key still runs is answered `409`.

| Why |
|---|
| a repeat that arrives while the first still runs, answered with a status of the API's own, is handled differently by every client — the IETF's Idempotency-Key header draft. |

## Rate limits

### rate-limited-answer-says-when-to-retry → rate-refusal-says-when-to-retry · SHOULD

Every REST request refused for its rate answers with `Retry-After`.

| Why |
|---|
| a client not told in the standard header when to come back guesses, and retries at once into the load that refused it — RFC 9110. |

### published-quota-sent-in-ratelimit-fields · SHOULD

Every quota a REST server publishes is stated in `RateLimit-Policy` and `RateLimit`, the fields of the IETF's RateLimit header draft.

| Why |
|---|
| quotas stated in headers of the API's own are read by no standard client, so each caller learns its limit only by hitting it — the IETF's RateLimit header draft. |

## Work that outlasts its answer

### long-operation-answered-202-with-its-status → long-operation-answered-with-a-handle · SHOULD

Every long REST operation answers `202` with the `Location` of a status resource. The status resource shows its state, running, succeeded or failed, then its result or its problem document.

| Why |
|---|
| a long operation answered in a shape of its own leaves every client and proxy to learn where its outcome waits. |

### running-status-carries-retry-after → long-operation-answered-with-a-handle · SHOULD

Every status resource of a long REST operation carries `Retry-After` while the operation runs.

| Why |
|---|
| a status resource that sends no `Retry-After` is polled as fast as each client likes. |

### unreadable-write-answered-202 → status-used-in-its-registered-meaning · MUST

Every REST write whose effect its caller cannot yet read answers `202`. It never answers a success that says it is done, such as `200`, `201` or `204`.

| Why |
|---|
| a success that says the write is done tells its caller that what it wrote is there to read, so a caller that reads a write the program's reads have not caught up with gets a `404` and retries a write that took effect. |

## Bodies

### answer-top-level-is-an-object · SHOULD

Every REST answer whose body is JSON is an object at its top level, never a bare array or value. A collection's items sit in one of its fields.

| Why |
|---|
| a bare array can never gain a cursor or a count without breaking every caller. |
