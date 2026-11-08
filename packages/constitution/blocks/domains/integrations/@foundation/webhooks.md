# Webhooks

> Governs the webhooks another system posts to the program.

## Verifying

### webhook-verified-before-it-is-acted-on · MUST

Every webhook from a sender that signs is acted on only once one of its signatures verifies. It verifies with the sender's secret or public key, and in Standard Webhooks' format the signed content is `webhook-id`, `webhook-timestamp` and the raw body joined by full stops, checked against each signature `webhook-signature` lists.

| Why |
|---|
| anyone who finds the address can post to it, and a sender rotating its secret signs with both for a while, so a check against only one signature refuses genuine deliveries. |

### webhook-signature-checked-over-the-raw-body · MUST

Every webhook's signature is checked over its raw body: the bytes as the server received them, never a form a framework parsed and wrote again.

| Why |
|---|
| a body parsed and written again differs from the bytes signed by a space or the order of its keys, so the genuine delivery fails its check. |

### webhook-timestamp-within-a-window · MUST

Where its sender signs a timestamp, every webhook is accepted only while that timestamp lies within a window the project sets. The window is checked as the webhook is received, so a webhook recorded in time is processed later all the same.

| Why |
|---|
| a delivery whose timestamp the signature does not cover, or whose age no window bounds, is replayed by whoever captured it. |

### unsigned-webhook-acted-on-only-by-a-read-back · MUST

Every webhook from a sender that signs nothing is acted on only through what the program reads back from the sender. The program never acts on the webhook's content.

| Why |
|---|
| anyone who finds the address can post to it, and only what the program reads back from the sender is the sender's word. |

## Processing

### webhook-delivery-processed-once → receiver-gives-a-repeat-the-first-effect · MUST

Every webhook delivery is acted on once, known by an identifier its signature covers or its read-back returns. Such identifiers include `webhook-id` in Standard Webhooks' format, an event's identifier in the signed body, the signature itself where the sender signs no timestamp, and what the read-back of an unsigned webhook returns.

| Why |
|---|
| a sender redelivers whatever it did not see acknowledged, and an effect run for each copy repeats a payment or a message — the idempotent receiver. |

### webhook-acknowledged-once-recorded · MUST

Every webhook is acknowledged only once it is verified and durably recorded.

| Why |
|---|
| a webhook acknowledged before it is recorded is lost when the program stops in between, and its sender, which saw the acknowledgement, never sends it again. |

### webhook-processed-after-its-acknowledgement · SHOULD

Every webhook is processed after its acknowledgement, never while its sender waits.

| Why |
|---|
| a sender gives up within seconds and sends again, so processing before the answer turns every slow delivery into a storm of repeats. |
