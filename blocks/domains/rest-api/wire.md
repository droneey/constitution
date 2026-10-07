# Wire

> Governs a REST operation's headers.

## Headers

### idempotency-key-carried-by-its-header → write-takes-an-idempotency-key · SHOULD
An idempotency key travels in the `Idempotency-Key` header; the key reused with another body is answered `422`, and a repeat while the first is still running `409`.

| Why | Tags |
|---|---|
| one header and two statuses let every client and proxy handle a repeat the same way. | [data] |

### rate-limited-request-answered-429 → caller-rate-limited · SHOULD
A request over the limit is answered `429` with `Retry-After`.

| Why | Tags |
|---|---|
| a caller that knows when to come back waits instead of hammering. | [] |

### retired-operation-answers-deprecation-headers → retired-operation-announced-before-removal · MUST
An operation or a field being retired answers with `Deprecation` (RFC 9745) and `Sunset` (RFC 8594), the sunset no earlier than the deprecation, and a `Link` with `rel="deprecation"` to its notice.

| Why | Tags |
|---|---|
| a caller's monitoring sees the retirement in every answer, long before the removal breaks it. | [] |
