---
id: webhooks
summary: Webhooks the program sends and receives, and their format.
requires: [remote-service]
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---
# Webhooks

> HTTP requests one system posts to another when something happens there. Its rules bind the webhooks the program sends, in Standard Webhooks' format — their headers, their signed content, an endpoint disabled — and, in `with/http-server.md`, those it receives from any sender: verified, processed once and acknowledged once recorded; a program that only sends serves no HTTP.

## Sending

### sent-webhook-carries-the-standard-headers → sent-push-signed-with-a-delivery-id · MUST
A webhook the program sends carries its delivery identifier in `webhook-id`, the same on every retry, the time it was sent in `webhook-timestamp` as whole seconds since the epoch, and in `webhook-signature` its signature over `<id>.<timestamp>.<body>`, written `v1,` and the base64 of an HMAC-SHA256 or `v1a,` and the base64 of an Ed25519 signature; while a secret rotates, the header lists the old and the new signature, separated by a space. The body sent is the very bytes signed.

| Why | Tags |
|---|---|
| one format spares each receiver a parser of its own, and the specification's libraries verify it as written; a body written again after it was signed fails verification over a single space. | [security] |

### endpoint-answering-gone-disabled-at-once → failed-push-retried-then-held · MUST
An endpoint that answers a webhook `410 Gone` is disabled at once, with no retry, and its owner told.

| Why | Tags |
|---|---|
| the specification reads `410` as the receiver saying it wants no more webhooks from this sender, and asks the sender to disable the endpoint. | [] |
