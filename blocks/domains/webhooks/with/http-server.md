# Webhooks over HTTP

> Governs the webhooks another system posts to the program.

## Receiving

### webhook-verified-before-it-is-acted-on · MUST
A webhook the program receives is acted on only once one of the signatures it carries verifies, compared in constant time, with the sender's secret or public key, over its raw body: the bytes as the server received them, never a form a framework parsed and wrote again. Where the sender signs a timestamp, the signature covers it and the timestamp falls within a window the project sets. In Standard Webhooks' format, the signed content is `webhook-id`, `webhook-timestamp` and the raw body joined by full stops, checked against each signature `webhook-signature` lists. From a sender that signs nothing, the program acts only on what it reads back from the sender itself.

| Why | Tags |
|---|---|
| anyone who finds the address can post to it, a body parsed and written again differs from the bytes signed by a space or the order of its keys, a delivery whose timestamp the signature does not cover is replayed with a fresh one, a sender rotating its secret signs with both for a while, a comparison that stops at the first wrong byte tells an attacker how much they guessed, and what the program reads back from the sender is the sender's word. | [security] |

### webhook-delivery-processed-once → operation-idempotent-by-design · MUST
A webhook delivery is processed once: a delivery seen before — known by an identifier the signature covers, `webhook-id` in Standard Webhooks' format, or by the signature itself where the sender signs no timestamp — is acknowledged and not acted on again, and what was seen is kept for as long as the sender may redeliver, then dropped.

| Why | Tags |
|---|---|
| a sender redelivers whatever it did not see acknowledged, and an effect run for each copy repeats a payment or a message. | [data] |

### webhook-acknowledged-once-recorded · SHOULD
A webhook is acknowledged once it is verified and durably recorded, and processed after that, never while its sender waits.

| Why | Tags |
|---|---|
| a sender gives up within seconds and sends again, so processing before the answer turns every slow delivery into a storm of repeats. | [performance] |
