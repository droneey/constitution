# Wire

> Governs a REST operation's headers.

## Headers

### idempotency-key-carried-by-its-header → write-takes-an-idempotency-key · SHOULD

A key the server keeps travels in the `Idempotency-Key` header, and a creation's own identifier in its path, `PUT /orders/{orderId}`; a repeat with a key already seen is answered from its record before any precondition is evaluated, and the key reused with another body, or a repeat while the first is still running, is answered `409`.

| Why | Tags |
|---|---|
| one header and two statuses let every client and proxy handle a repeat the same way. | [data] |

### rate-limited-answer-says-when-to-retry → caller-rate-limited · SHOULD

A request refused for its rate answers with `Retry-After`; a server that publishes its quotas states them in `RateLimit-Policy` and `RateLimit`.

| Why | Tags |
|---|---|
| a client told when to come back waits that long instead of guessing, and its retry waits for the delay the server asked rather than adding to the load that refused it. | [performance] |

### retired-operation-answers-deprecation-headers → retired-operation-announced-before-removal · MUST

An operation being retired answers with `Deprecation` (RFC 9745) and `Sunset` (RFC 8594), the sunset no earlier than the deprecation, and a `Link` with `rel="deprecation"` to its notice.

| Why | Tags |
|---|---|
| a caller's monitoring sees the retirement in every answer, long before the removal breaks it. | [] |
