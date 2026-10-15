# Standard Webhooks over HTTP

> Governs a webhook in Standard Webhooks' format that the program receives.

### received-webhook-verified-from-the-standard-headers → webhook-verified-before-it-is-acted-on · MUST
A webhook in Standard Webhooks' format is verified from its headers: the signature computed over `webhook-id`, `webhook-timestamp` and the raw body, joined by full stops, is compared in constant time with each signature `webhook-signature` lists, and one match passes it; its `webhook-timestamp` falls within the project's window.

| Why | Tags |
|---|---|
| the header lists a signature per secret while the sender rotates, so a receiver that demands the first, or all, refuses a genuine delivery, and a comparison that stops at the first wrong byte tells an attacker how much they guessed. | [security] |

### received-webhook-known-by-its-webhook-id → webhook-delivery-processed-once · MUST
A delivery in Standard Webhooks' format is known as one seen before by its `webhook-id`.

| Why | Tags |
|---|---|
| the specification keeps the identifier the same on every retry and has it signed, so it marks a repeat that the body alone might not. | [data] |
