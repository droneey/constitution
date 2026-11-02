# Outbound

> Governs what the program pushes to another system.

## Pushes

### sent-push-signed-with-a-delivery-id · MUST

A push the program sends is signed over its delivery identifier, its time and its content. It is signed with a secret per receiver, carries the identifier, the time it was sent and the signature where the receiver takes them, and while a secret rotates is signed with both the old and the new.

| Why |
|---|
| a receiver cannot verify an unsigned push, refuse a replay without its time or drop a repeat without its identifier, and one signed with only the new secret during a rotation fails at every receiver that still holds the old. |

### failed-push-retried-then-held → failure-retried-only-when-transient · MUST

A failed push is retried, then held, and a receiver that is gone or keeps failing is disabled. One that fails for a transient cause is retried with a growing delay up to a limit and then held as failed, and one refused for good is held at once; a receiver that keeps failing past a period the project sets, or says it is gone for good, is disabled and its owner told.

| Why |
|---|
| a push dropped on its first failure is lost to a brief outage, one retried after a refusal is sent again for nothing, and a receiver gone for good is otherwise called for ever. |
