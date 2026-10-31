# Outbound

> Governs the webhooks the program sends: their signature, their retries and an endpoint disabled.

## Signature

### sent-webhook-signed-with-a-delivery-id · MUST

A webhook the program sends is signed, with a secret per endpoint, over its delivery identifier, the time it was sent and its body, in Standard Webhooks' headers: `webhook-id` holds the identifier, the same on every retry, `webhook-timestamp` the time as whole seconds since the epoch, and `webhook-signature` the signature over `<id>.<timestamp>.<body>`, written `v1,` and the base64 of an HMAC-SHA256 or `v1a,` and the base64 of an Ed25519 signature — while a secret rotates, the old and the new signature, separated by a space. The body sent is the very bytes signed.

| Why |
|---|
| a receiver can then verify the sender, refuse a replay by its time, drop a repeat by its identifier and keep verifying through a rotation with either secret; one format spares each receiver a parser of its own, and a body written again after it was signed fails verification over a single space. |

## Retries

### failed-webhook-retried-then-held → failure-retried-only-when-transient · MUST

A webhook that fails for a transient cause is retried with a growing delay up to a limit and then held as failed, and one refused for good is held at once; an endpoint that keeps failing past a period the project sets is disabled and its owner told, and one that answers `410 Gone` is disabled at once, with no retry, and its owner told.

| Why |
|---|
| a webhook lost to a brief outage is not lost for good, one the receiver refuses is not sent again for nothing, and an endpoint gone for good — what Standard Webhooks reads a `410` to say — is not called for ever. |
