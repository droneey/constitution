# Outbound

> Governs the webhooks the program sends: their format, their signature, their retries and the receiving endpoints they reach.

## Vocabulary

A **receiving endpoint** is an endpoint the program sends webhooks to, registered by its owner with the secret or the public key by which its webhooks are verified.

## Format

### sent-webhook-carries-the-standard-headers · MUST

Every webhook the program sends carries Standard Webhooks' headers. Its delivery identifier is in `webhook-id`, the time it was sent in `webhook-timestamp` as whole seconds since the epoch, and in `webhook-signature` its signature over `<id>.<timestamp>.<body>`, written `v1,` and the base64 of an HMAC-SHA256 or `v1a,` and the base64 of an Ed25519 signature.

| Why |
|---|
| a receiver cannot verify an unsigned webhook, refuse a replay without its time or drop a repeat without its identifier, and a format of the sender's own makes each receiver write a parser for it — Standard Webhooks. |

### webhook-id-kept-across-retries → idempotency-key-sent-with-every-attempt · MUST

Every retry of a webhook carries the `webhook-id` of its first attempt.

| Why |
|---|
| a receiver drops a repeat only by an identifier it has seen, so a retry with a new one is acted on a second time. |

### sent-body-is-the-bytes-signed · MUST

Every webhook's body is sent as the very bytes its signature was computed over.

| Why |
|---|
| a body written again after it was signed, by a serialiser or a framework, fails verification over a single space or the order of its keys. |

## Secrets

### webhook-signed-with-a-secret-per-endpoint → credential-never-shared · MUST

Every receiving endpoint's webhooks are signed with a secret or a signing key of that endpoint's own.

| Why |
|---|
| a secret shared between receivers lets each of them forge webhooks to the others, and one leak of a secret or a signing key forces a rotation at every receiver. |

### rotating-secret-signs-with-both · MUST

While a receiving endpoint's secret or signing key rotates, every webhook to it is signed with the old and the new one. Its `webhook-signature` lists both signatures, separated by a space.

| Why |
|---|
| a webhook signed with only the new secret or key during a rotation fails at every receiver that still holds the old secret or public key. |

## Failures

### failed-webhook-held-once-its-retries-end · MUST

Every webhook whose delivery failed for good, or past its retries, is held as failed. It stays held until a replay by its receiving endpoint's owner or the program's operator, or until a retention the project sets for it ends, and is never dropped before.

| Why |
|---|
| a webhook dropped once its retries end is lost to an outage of its receiver that outlasted them, with nothing left to replay. |

### failing-endpoint-disabled · SHOULD

Every receiving endpoint whose webhooks keep failing past a period the project sets is disabled.

| Why |
|---|
| a receiver gone for good is otherwise called for ever, spending the sender's retries and holding back nothing but its own queue, a cost to the sender alone, which is why the specification only recommends disabling it — Standard Webhooks. |

### endpoint-answering-gone-disabled-at-once · SHOULD

Every receiving endpoint that answers a webhook `410 Gone` is disabled at once, with no retry.

| Why |
|---|
| a `410` is the receiver saying it wants no more webhooks from this sender, which Standard Webhooks says a sender should honour, so a retry after one sends what the receiver refused and keeps calling an endpoint that asked to be dropped — Standard Webhooks. |

### disabled-endpoints-owner-told · MUST

Every receiving endpoint the program disables has its owner told that it was disabled and why.

| Why |
|---|
| a receiver disabled in silence stops getting webhooks with nobody aware, so its owner learns of it from the data that never arrived. |
