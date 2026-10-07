# Outbound

> Governs what the program pushes to another system.

## Webhooks

### sent-webhook-signed-and-retried · MUST
A webhook the program sends is signed over its body with a secret per receiver, carries a delivery identifier and its time, and is retried with a growing delay up to a limit, then held as failed.

| Why | Tags |
|---|---|
| a receiver can then verify the sender and drop a repeat, and a delivery lost to a brief outage is not lost for good. | [security] |
