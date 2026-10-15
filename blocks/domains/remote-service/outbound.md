# Outbound

> Governs what the program pushes to another system.

## Pushes

### sent-push-signed-with-a-delivery-id · MUST
A push the program sends is signed, with a secret per receiver, over its delivery identifier, the time it was sent and its content, and carries the identifier, the time and the signature where the receiver takes them; while a secret rotates, it is signed with both the old and the new.

| Why | Tags |
|---|---|
| a receiver can then verify the sender, refuse a replay by its time and drop a repeat by its identifier, and a receiver that holds either secret keeps verifying through a rotation. | [security] |

### failed-push-retried-then-held → failure-retried-only-when-transient · MUST
A push that fails for a transient cause is retried with a growing delay up to a limit and then held as failed, and one refused for good is held at once; a receiver that keeps failing past a period the project sets, or says it is gone for good, is disabled and its owner told.

| Why | Tags |
|---|---|
| a push lost to a brief outage is not lost for good, one the receiver refuses is not sent again for nothing, and a receiver gone for good is not called for ever. | [] |
