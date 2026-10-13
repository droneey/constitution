# Wire

> Governs a REST operation's headers.

## Headers

### idempotency-key-carried-by-its-header → write-takes-an-idempotency-key · SHOULD
An idempotency key travels in the `Idempotency-Key` header, and a repeat with a key already seen is answered from its record before any precondition is evaluated; the key reused with another body is answered `422`, and a repeat while the first is still running `409`.

| Why | Tags |
|---|---|
| one header and two statuses let every client and proxy handle a repeat the same way. | [data] |

### retired-operation-answers-deprecation-headers → retired-operation-announced-before-removal · MUST
A retirement is announced where its caller reads it: an operation by headers — `Deprecation` (RFC 9745) and `Sunset` (RFC 8594), the sunset no earlier than the deprecation, and a `Link` with `rel="deprecation"` to its notice; a field by `deprecated` in the OpenAPI document, naming its replacement and its removal date.

| Why | Tags |
|---|---|
| a caller's monitoring sees an operation's retirement in every answer, long before the removal breaks it, and a field has no header of its own, so the contract is where a caller and a generated client learn it is going. | [] |
