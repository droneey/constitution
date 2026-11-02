# Outbound

> Governs the webhooks the program sends.

## General

### sent-webhook-carries-the-standard-headers → sent-push-signed-with-a-delivery-id · MUST

A webhook the program sends carries Standard Webhooks' headers. Its delivery identifier is in `webhook-id`, the same on every retry, the time it was sent in `webhook-timestamp` as whole seconds since the epoch, and in `webhook-signature` its signature over `<id>.<timestamp>.<body>`, written `v1,` and the base64 of an HMAC-SHA256 or `v1a,` and the base64 of an Ed25519 signature; while a secret rotates, the header lists the old and the new signature, separated by a space. The body sent is the very bytes signed.

| Why |
|---|
| a format of the sender's own makes each receiver write a parser for it, and a body written again after it was signed fails verification over a single space — Standard Webhooks. |

### endpoint-answering-gone-disabled-at-once → failed-push-retried-then-held · MUST

An endpoint that answers a webhook `410 Gone` is disabled at once, with no retry, and its owner told.

| Why |
|---|
| a `410` is the receiver saying it wants no more webhooks from this sender, as the specification reads it, so a retry after one sends what the receiver refused and keeps calling an endpoint that asked to be dropped. |
