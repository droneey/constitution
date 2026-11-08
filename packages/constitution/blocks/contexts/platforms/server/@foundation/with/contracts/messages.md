# Messages

> Governs the liveness of a server that consumes messages, and when its message consumers take them.

## Consuming

### consumer-liveness-reports-its-loop · MUST

Every liveness check of a server that consumes messages reports whether its message consumer's loop still turns. It never reports only whether the process answers, and the loop turns when it took, settled or waited for a message, or retried its connection to the message broker, or stood paused as `consumer-takes-messages-only-while-ready` gives, within a bound the project sets.

| Why |
|---|
| a message consumer whose loop hangs still answers a probe of the process, and holds its messages unsettled while its host sees nothing wrong. |

### consumer-takes-messages-only-while-ready · MUST

Every message consumer of a server takes messages only while the server can serve. It follows the server's readiness check where the server has one, subscribes to its message channels once the server can serve and pauses while it cannot, a paused message consumer counting as out of routing.

| Why |
|---|
| a message taken before the store is reached, or while it cannot be reached, fails for no fault of its own and returns as a redelivery that counts against its attempts. |
