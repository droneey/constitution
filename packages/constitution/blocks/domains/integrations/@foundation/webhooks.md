# Webhooks

> Governs the webhooks another system posts to the program.

## Verifying

### webhook-verified-before-it-is-acted-on · MUST

Every webhook from a sender that signs is acted on only once one of its signatures verifies. It verifies with the sender's secret or public key, and in Standard Webhooks' format the signed content is `webhook-id`, `webhook-timestamp` and the raw body joined by full stops, checked against each signature `webhook-signature` lists.

#### Why

Anyone who finds the address can post to it, and a sender rotating its secret signs with both for a while, so a check against only one signature refuses genuine deliveries.

#### Examples

```pseudo title="Avoid"
# payments/presentation/bindings/commands/on-provider-webhook
function onProviderWebhook(request, recordProviderEvent, context)
  let event = parseProviderEvent(request.rawBody)  # anyone who finds the address is believed

  await recordProviderEvent({ deliveryId: request.headers["webhook-id"], event }, context)

  return noContent()
```

```pseudo title="Prefer"
# payments/presentation/bindings/commands/on-provider-webhook
function onProviderWebhook(request, recordProviderEvent, context)
  let delivery = verifyWebhook(request.headers, request.rawBody, { secrets: webhookSecrets, window: webhookWindow, now: clock.now() })

  if delivery is Unverified then
    return unauthorized()

  await recordProviderEvent({ deliveryId: delivery.id, event: parseProviderEvent(delivery.body) }, context)

  return noContent()
```

### webhook-signature-checked-over-the-raw-body · MUST

Every webhook's signature is checked over its raw body: the bytes as the server received them, never a form a framework parsed and wrote again.

#### Why

A body parsed and written again differs from the bytes signed by a space or the order of its keys, so the genuine delivery fails its check.

#### Examples

```pseudo title="Avoid"
# payments/presentation/bindings/commands/on-provider-webhook
let delivery = verifyWebhook(request.headers, stringify(request.json), { secrets: webhookSecrets, window: webhookWindow, now: clock.now() })  # bytes the framework wrote again
```

```pseudo title="Prefer"
# payments/presentation/bindings/commands/on-provider-webhook
let delivery = verifyWebhook(request.headers, request.rawBody, { secrets: webhookSecrets, window: webhookWindow, now: clock.now() })
```

### webhook-timestamp-within-a-window · MUST

Where its sender signs a timestamp, every webhook is accepted only while that timestamp lies within a window the project sets. The window is checked as the webhook is received, so a webhook recorded in time is processed later all the same.

#### Why

A delivery whose timestamp the signature does not cover, or whose age no window bounds, is replayed by whoever captured it.

#### Examples

```pseudo title="Avoid"
# libs/standard-webhooks/verify-webhook
function verifyWebhook(headers, rawBody, { secrets })
  if not signatureMatches(headers, rawBody, secrets) then
    return Unverified

  return Verified({ id: headers["webhook-id"], body: rawBody })  # a captured delivery replays for ever
```

```pseudo title="Prefer"
# libs/standard-webhooks/verify-webhook
function verifyWebhook(headers, rawBody, { secrets, window, now })
  if not signatureMatches(headers, rawBody, secrets) then
    return Unverified

  if distance(parseInstant(headers["webhook-timestamp"]), now) > window then
    return Unverified

  return Verified({ id: headers["webhook-id"], body: rawBody })
```

### unsigned-webhook-acted-on-only-by-a-read-back · MUST

Every webhook from a sender that signs nothing is acted on only through what the program reads back from the sender. The program never acts on the webhook's content.

#### Why

Anyone who finds the address can post to it, and only what the program reads back from the sender is the sender's word.

#### Examples

```pseudo title="Avoid"
# shipping/application/use-cases/commands/record-shipment-status.use-case
function createRecordShipmentStatus({ shipmentRepository })
  return function(input, context)
    let shipment = await shipmentRepository.find(input.shipmentId, context)
    let tracked = track(shipment, input.status)  # the status is the poster's word

    await shipmentRepository.save(tracked.shipment, [tracked.event], context)
```

```pseudo title="Prefer"
# shipping/application/use-cases/commands/sync-shipment.use-case
function createSyncShipment({ shipmentRepository, carrier })
  return function(input, context)
    let shipment = await shipmentRepository.find(input.shipmentId, context)
    let status = await carrier.findStatus(shipment.carrierShipmentId, context)
    let tracked = track(shipment, status)

    await shipmentRepository.save(tracked.shipment, [tracked.event], context)
```

## Processing

### webhook-delivery-processed-once → receiver-gives-a-repeat-the-first-effect · MUST

Every webhook delivery is acted on once, known by an identifier its signature covers or its read-back returns. Such identifiers include `webhook-id` in Standard Webhooks' format, an event's identifier in the signed body, the signature itself where the sender signs no timestamp, and what the read-back of an unsigned webhook returns.

#### Why

A sender redelivers whatever it did not see acknowledged, and an effect run for each copy repeats a payment or a message — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# payments/application/use-cases/commands/record-provider-event.use-case
function createRecordProviderEvent({ providerInbox })
  return function(input, context)
    await providerInbox.add(input.event, context)  # each redelivery processed again
```

```pseudo title="Prefer"
# payments/application/use-cases/commands/record-provider-event.use-case
function createRecordProviderEvent({ providerInbox })
  return function(input, context)
    await providerInbox.addOnce(input.deliveryId, input.event, context)
```

### webhook-acknowledged-once-recorded · MUST

Every webhook is acknowledged only once it is verified and durably recorded.

#### Why

A webhook acknowledged before it is recorded is lost when the program stops in between, and its sender, which saw the acknowledgement, never sends it again.

#### Examples

```pseudo title="Avoid"
# payments/presentation/bindings/commands/on-provider-webhook
function onProviderWebhook(request, recordProviderEvent, context)
  let delivery = verifyWebhook(request.headers, request.rawBody, { secrets: webhookSecrets, window: webhookWindow, now: clock.now() })

  if delivery is Unverified then
    return unauthorized()

  runLater(function() recordProviderEvent(toInput(delivery), context))  # acknowledged before it is kept

  return noContent()
```

```pseudo title="Prefer"
# payments/presentation/bindings/commands/on-provider-webhook
function onProviderWebhook(request, recordProviderEvent, context)
  let delivery = verifyWebhook(request.headers, request.rawBody, { secrets: webhookSecrets, window: webhookWindow, now: clock.now() })

  if delivery is Unverified then
    return unauthorized()

  await recordProviderEvent(toInput(delivery), context)

  return noContent()
```

### webhook-processed-after-its-acknowledgement · SHOULD

Every webhook is processed after its acknowledgement, never while its sender waits.

#### Why

A sender gives up within seconds and sends again, so processing before the answer turns every slow delivery into a storm of repeats.

#### Examples

```pseudo title="Avoid"
# payments/presentation/bindings/commands/on-provider-webhook
function onProviderWebhook(request, settleCharge, context)
  let delivery = verifyWebhook(request.headers, request.rawBody, { secrets: webhookSecrets, window: webhookWindow, now: clock.now() })

  if delivery is Unverified then
    return unauthorized()

  await settleCharge(toInput(delivery), context)  # the sender waits for the whole settlement

  return noContent()
```

```pseudo title="Prefer"
# payments/presentation/bindings/commands/on-provider-webhook
function onProviderWebhook(request, recordProviderEvent, context)
  let delivery = verifyWebhook(request.headers, request.rawBody, { secrets: webhookSecrets, window: webhookWindow, now: clock.now() })

  if delivery is Unverified then
    return unauthorized()

  await recordProviderEvent(toInput(delivery), context)

  return noContent()

# payments/presentation/jobs/settle-recorded-charges
schedule("settle-recorded-charges", { every: seconds(10), missed: skip, overlapping: skip },
  function(tick, context)
    await settleRecordedCharges({}, context))
```
