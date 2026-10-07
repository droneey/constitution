# Outbound

> Governs what the program pushes to another system.

## Webhooks

### sent-webhook-signed-with-a-delivery-id · MUST
A webhook the program sends is signed over its body with a secret per receiver, and carries a delivery identifier and the time it was sent.

| Why | Tags |
|---|---|
| a receiver can then verify the sender and drop a repeat. | [security] |

### failed-webhook-retried-then-held → failure-retried-only-when-transient · MUST
A webhook delivery that fails for a transient cause is retried with a growing delay up to a limit and then held as failed, and one refused for good is held at once.

| Why | Tags |
|---|---|
| a delivery lost to a brief outage is not lost for good, and one the receiver refuses is not sent again for nothing. | [] |
