# Messaging

> Governs the liveness of a server that consumes messages, and when it takes them.

## Consuming

### consumer-liveness-reports-its-loop · MUST

The liveness check of a server that consumes reports whether its consuming loop still turns — it took, settled or waited for a message, or retried its connection to the broker, within a bound the project sets — never only whether the process answers.

| Why | Tags |
|---|---|
| a consumer whose loop hangs still answers a probe of the process, and holds its messages unsettled while its host sees nothing wrong. | [errors] |

### consumer-takes-messages-only-while-ready · SHOULD

A server's consumer subscribes to its queues only once the server is ready, and pauses while its readiness fails.

| Why | Tags |
|---|---|
| a message taken before the store is reached, or while it cannot be reached, fails for no fault of its own and returns as a redelivery that counts against its attempts. | [errors] |
