# Inbound

> Governs what another system pushes to the program.

## Webhooks

### webhook-verified-before-it-is-acted-on · MUST
A webhook the program receives is acted on only after its signature is verified, with the sender's secret or public key, over its raw body and its timestamp, and the timestamp falls within a window the project sets; from a sender that signs nothing, the program acts only on what it reads back from the sender itself.

| Why | Tags |
|---|---|
| anyone who finds the address can post to it, a delivery whose timestamp the signature does not cover is replayed with a fresh one, and what the program reads back from the sender is the sender's word. | [security] |

### webhook-delivery-processed-once → operation-idempotent-by-design · MUST
A webhook delivery is processed once per its identifier: a delivery seen before is acknowledged and not acted on again.

| Why | Tags |
|---|---|
| a sender redelivers whatever it did not see acknowledged, and an effect run for each copy repeats a payment or a message. | [data] |

### webhook-acknowledged-once-recorded · SHOULD
A webhook is acknowledged once it is verified and durably recorded, and processed after that, never while its sender waits.

| Why | Tags |
|---|---|
| a sender gives up within seconds and sends again, so processing before the answer turns every slow delivery into a storm of repeats. | [performance] |
