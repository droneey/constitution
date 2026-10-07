# Inbound

> Governs what another system pushes to the program.

## Webhooks

### webhook-verified-before-it-is-acted-on · MUST
A webhook the program receives is acted on only after its signature is verified over its raw body with the sender's secret and its timestamp falls within a window the project sets.

| Why | Tags |
|---|---|
| anyone who finds the address can post to it, and a genuine delivery captured once can be replayed later. | [security] |

### webhook-delivery-processed-once → operation-idempotent-by-design · MUST
A webhook delivery is processed once per its identifier: a delivery seen before is acknowledged and not acted on again.

| Why | Tags |
|---|---|
| a sender redelivers whatever it did not see acknowledged, and an effect run for each copy repeats a payment or a message. | [data] |
