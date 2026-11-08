# Outbound

> Governs the webhooks the program sends: their format, their signature, their retries and the receiving endpoints they reach.

## Vocabulary

A **receiving endpoint** is an endpoint the program sends webhooks to, registered by its owner with the secret or the public key by which its webhooks are verified.

## Format

### sent-webhook-carries-the-standard-headers · MUST

Every webhook the program sends carries Standard Webhooks' headers. Its delivery identifier is in `webhook-id`, the time it was sent in `webhook-timestamp` as whole seconds since the epoch, and in `webhook-signature` its signature over `<id>.<timestamp>.<body>`, written `v1,` and the base64 of an HMAC-SHA256 or `v1a,` and the base64 of an Ed25519 signature.

#### Why

A receiver cannot verify an unsigned webhook, refuse a replay without its time or drop a repeat without its identifier, and a format of the sender's own makes each receiver write a parser for it — Standard Webhooks.

#### Examples

```text title="Avoid"
POST /hooks/orders HTTP/1.1
Host: shop.example.net
Content-Type: application/json
X-Event-Id: 8812
X-Signature: 5d41402abc4b2a76b9719d911017c592

{"type":"order.paid","orderId":"ord-7"}
```

```text title="Prefer"
POST /hooks/orders HTTP/1.1
Host: shop.example.net
Content-Type: application/json
webhook-id: msg_2KWPBgLlAfxdpx2AI54pPJ85f4W
webhook-timestamp: 1762617600
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4=

{"type":"order.paid","orderId":"ord-7"}
```

### webhook-id-kept-across-retries → idempotency-key-sent-with-every-attempt · MUST

Every retry of a webhook carries the `webhook-id` of its first attempt.

#### Why

A receiver drops a repeat only by an identifier it has seen, so a retry with a new one is acted on a second time.

#### Examples

```pseudo title="Avoid"
function deliver(webhook, endpoint)
  for attempt in 1..maxWebhookAttempts
    let headers = signedHeaders(newWebhookId(), clock.now(), webhook.body, endpoint)
    if send(endpoint.url, webhook.body, headers).succeeded then
      return
    wait retryDelay(attempt)

  call holdAsFailed(webhook)
```

```pseudo title="Prefer"
function deliver(webhook, endpoint)
  for attempt in 1..maxWebhookAttempts
    let headers = signedHeaders(webhook.id, clock.now(), webhook.body, endpoint)
    if send(endpoint.url, webhook.body, headers).succeeded then
      return
    wait retryDelay(attempt)

  call holdAsFailed(webhook)
```

### sent-body-is-the-bytes-signed · MUST

Every webhook's body is sent as the very bytes its signature was computed over.

#### Why

A body written again after it was signed, by a serialiser or a framework, fails verification over a single space or the order of its keys.

#### Examples

```pseudo title="Avoid"
let signature = sign(endpoint, webhook.id, timestamp, toJson(webhook.payload))

call http.post(endpoint.url, {
  json: webhook.payload,
  headers: standardHeaders(webhook.id, timestamp, signature),
})
```

```pseudo title="Prefer"
let body = toJson(webhook.payload)
let signature = sign(endpoint, webhook.id, timestamp, body)

call http.post(endpoint.url, {
  body: body,
  headers: standardHeaders(webhook.id, timestamp, signature),
})
```

## Secrets

### webhook-signed-with-a-secret-per-endpoint → credential-never-shared · MUST

Every receiving endpoint's webhooks are signed with a secret or a signing key of that endpoint's own.

#### Why

A secret shared between receivers lets each of them forge webhooks to the others, and one leak of a secret or a signing key forces a rotation at every receiver.

#### Examples

```pseudo title="Avoid"
function registerEndpoint(owner, url)
  return endpoints.add({ owner, url, secret: config.webhookSecret })
```

```pseudo title="Prefer"
function registerEndpoint(owner, url)
  return endpoints.add({ owner, url, secret: newWebhookSecret() })
```

### rotating-secret-signs-with-both · MUST

While a receiving endpoint's secret or signing key rotates, every webhook to it is signed with the old and the new one. Its `webhook-signature` lists both signatures, separated by a space.

#### Why

A webhook signed with only the new secret or key during a rotation fails at every receiver that still holds the old secret or public key.

#### Examples

```pseudo title="Avoid"
function signatureHeader(endpoint, id, timestamp, body)
  return "v1," + hmacBase64(endpoint.newestSecret, id + "." + timestamp + "." + body)
```

```pseudo title="Prefer"
function signatureHeader(endpoint, id, timestamp, body)
  return endpoint.activeSecrets
    .map(secret => "v1," + hmacBase64(secret, id + "." + timestamp + "." + body))
    .join(" ")
```

## Failures

### failed-webhook-held-once-its-retries-end · MUST

Every webhook whose delivery failed for good, or past its retries, is held as failed. It stays held until a replay by its receiving endpoint's owner or the program's operator, or until a retention the project sets for it ends, and is never dropped before.

#### Why

A webhook dropped once its retries end is lost to an outage of its receiver that outlasted them, with nothing left to replay.

#### Examples

```pseudo title="Avoid"
function onAttemptFailed(webhook, attempt)
  if attempt is maxWebhookAttempts then
    call log.warn("webhook dropped", { webhookId: webhook.id })
    return

  call scheduleRetry(webhook, attempt + 1)
```

```pseudo title="Prefer"
function onAttemptFailed(webhook, attempt)
  if attempt is maxWebhookAttempts then
    call failedWebhooks.hold(webhook, {
      until: clock.now() + failedWebhookRetention,
    })
    return

  call scheduleRetry(webhook, attempt + 1)
```

### failing-endpoint-disabled · SHOULD

Every receiving endpoint whose webhooks keep failing past a period the project sets is disabled.

#### Why

A receiver gone for good is otherwise called for ever, spending the sender's retries and holding back nothing but its own queue, a cost to the sender alone, which is why the specification only recommends disabling it — Standard Webhooks.

#### Examples

```pseudo title="Avoid"
function onDeliveryFailed(endpoint, webhook, attempt)
  call scheduleRetry(webhook, attempt + 1)
```

```pseudo title="Prefer"
let failingPeriodBeforeDisable = 5 days

function onDeliveryFailed(endpoint, webhook, attempt)
  if clock.now() - endpoint.failingSince > failingPeriodBeforeDisable then
    call disableEndpoint(endpoint, DisableReason.KeptFailing)
    call holdAsFailed(webhook)
    return

  call scheduleRetry(webhook, attempt + 1)
```

### endpoint-answering-gone-disabled-at-once · SHOULD

Every receiving endpoint that answers a webhook `410 Gone` is disabled at once, with no retry.

#### Why

A `410` is the receiver saying it wants no more webhooks from this sender, which Standard Webhooks says a sender should honour, so a retry after one sends what the receiver refused and keeps calling an endpoint that asked to be dropped — Standard Webhooks.

#### Examples

```pseudo title="Avoid"
when response.status
  is 2xx then call markDelivered(webhook)
  else call scheduleRetry(webhook, attempt + 1)
```

```pseudo title="Prefer"
when response.status
  is 2xx then call markDelivered(webhook)
  is 410 then
    call disableEndpoint(endpoint, DisableReason.Gone)
    call holdAsFailed(webhook)
  else call scheduleRetry(webhook, attempt + 1)
```

### disabled-endpoints-owner-told · MUST

Every receiving endpoint the program disables has its owner told that it was disabled and why.

#### Why

A receiver disabled in silence stops getting webhooks with nobody aware, so its owner learns of it from the data that never arrived.

#### Examples

```pseudo title="Avoid"
function disableEndpoint(endpoint, reason)
  call endpoints.disable(endpoint.id, reason)
```

```pseudo title="Prefer"
function disableEndpoint(endpoint, reason)
  call endpoints.disable(endpoint.id, reason)
  call mailer.send(endpoint.owner.email, endpointDisabledNotice(endpoint.url, reason))
```
