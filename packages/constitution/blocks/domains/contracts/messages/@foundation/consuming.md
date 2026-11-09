# Consuming

> Governs how a message is received, parsed, processed once in effect and acknowledged.

## Processing once

### message-processed-once-per-consumer → receiver-gives-a-repeat-the-first-effect · MUST

Every message consumer acts once on each message identifier it receives, whatever another message consumer has done with that message.

#### Why

A message broker delivers at least once (after a lost acknowledgement, an expired lease, a producer's retry), so an effect run for each copy repeats a payment or a message, and a record shared between message consumers lets the first that acts silence the others — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
function onOrderPaid(message, context)
  transaction(context)
    if not processedMessages.insertUnique(message.id) then
      return

    call loyalty.addPoints(message.customerId, pointsFor(message.amount))
```

```pseudo title="Prefer"
function onOrderPaid(message, context)
  transaction(context)
    if not processedMessages.insertUnique("loyalty-points", message.id) then
      return

    call loyalty.addPoints(message.customerId, pointsFor(message.amount))
```

### stale-message-refused-by-its-version · MUST

Every message that says what an object became is applied only over an older version of that object. It carries that object's version, and its message consumer applies it only when that version is newer than the one it holds.

#### Why

Redeliveries and competing message consumers bring messages out of order, and an older state applied after a newer one undoes it.

#### Examples

```pseudo title="Avoid"
function onProductChanged(message, context)
  call productCopies.save(message.product, context)
```

```pseudo title="Prefer"
function onProductChanged(message, context)
  let held = productCopies.find(message.product.id, context)

  if held is not <absent> and held.version >= message.product.version then
    return

  call productCopies.save(message.product, context)
```

## Receiving

### message-parsed-against-its-types-schema → outside-value-untyped-until-parsed · MUST

Every message consumer parses each message by the schema that the message's own type and version declare.

#### Why

A message is outside input written by another release of another program, so one parsed by the schema of another version reads its fields wrong and fails halfway through its work — parse, don't validate.

#### Examples

```pseudo title="Avoid"
function onOrderPaid(message, context)
  let event = orderPaidV2Schema.parse(message.data)
  ...
```

```pseudo title="Prefer"
let orderPaidSchemas = {
  "com.shop.orders.order-paid.v1": orderPaidV1Schema,
  "com.shop.orders.order-paid.v2": orderPaidV2Schema,
}

function onOrderPaid(message, context)
  let schema = orderPaidSchemas[message.type]

  if schema is <absent> then
    throw new UnknownMessageTypeError(message.type)

  let event = schema.parse(message.data)
  ...
```

### messages-in-flight-bounded → kept-collection-bounded · MUST

Every message consumer holds at most a set number of messages at once. Its prefetch, its batch and its concurrency are each set explicitly, never left at the client's default, and it takes no more until one is settled.

#### Why

A client's default is often unbounded, so a backlog floods one instance's memory and starves the others, while a bound is how the queue pushes back — backpressure.

#### Examples

```pseudo title="Avoid"
call broker.subscribe("orders.order-paid", onOrderPaid)
```

```pseudo title="Prefer"
call broker.subscribe("orders.order-paid", onOrderPaid, {
  prefetch: 20,
  batchSize: 10,
  concurrency: 4,
})
```

## Acknowledgement

### message-acknowledged-after-its-work · MUST

Every message is acknowledged only once its handling has committed, never on receipt or ahead of it. Its handling has committed once the work it asks for has, or, for a message refused by a rule of the business, once its outcome is recorded or published. Acknowledging it is whatever its message broker takes as done, such as an acknowledgement its protocol defines, a deletion or a committed offset.

#### Why

A message acknowledged before its work is lost when the message consumer stops midway, and at-least-once delivery holds only while the acknowledgement comes last.

#### Examples

```pseudo title="Avoid"
function receive(message, context)
  call message.ack()
  call onOrderPaid(parseOrderPaid(message), context)
```

```pseudo title="Prefer"
function receive(message, context)
  call onOrderPaid(parseOrderPaid(message), context)
  call message.ack()
```

### taken-message-returns-when-its-lease-expires · MUST

Every message a message consumer takes returns to its message broker for a later delivery once its lease expires unsettled. Such a message broker includes a queue the program keeps in its own store.

#### Why

A message taken with no lease is stranded for good when the message consumer that took it stops before it settles it.

#### Examples

```pseudo title="Avoid"
function takeNext(jobs, workerId)
  return jobs.updateFirst(
    where: { status: "pending" },
    set: { status: "taken", takenBy: workerId },
  )
```

```pseudo title="Prefer"
let jobLease = 2 minutes

function takeNext(jobs, workerId)
  return jobs.updateFirst(
    where: { status: "pending" }
      or { status: "taken", leaseUntil: before(clock.now()) },
    set: { status: "taken", takenBy: workerId, leaseUntil: clock.now() + jobLease },
  )
```

### message-lease-outlasts-its-handler · MUST

Every message's lease, such as a visibility timeout, a lock or an acknowledgement deadline, outlasts its handler. The message is never delivered again while its first delivery is still at work: the handler runs under a timeout shorter than the lease, or extends the lease while it works.

#### Why

A lease that expires mid-work hands the message to a second message consumer, and two copies then run at once, past every check made before either committed.

#### Examples

```pseudo title="Avoid"
call broker.subscribe("invoices.render-invoice", renderInvoice, {
  ackDeadline: 30 seconds,
})  # renderInvoice runs unbounded, past the lease
```

```pseudo title="Prefer"
call broker.subscribe("invoices.render-invoice", onRenderInvoice, {
  ackDeadline: 60 seconds,
})

function onRenderInvoice(message, context)
  return withTimeout(45 seconds, () => renderInvoice(message, context))
```

### stopping-consumer-releases-what-it-holds → program-stops-cleanly · MUST

Every stopping message consumer settles each message it holds before it exits, those it prefetched included.

#### Why

A message taken and then dropped by a stopping message consumer waits out its lease before any other copy may handle it.

#### Examples

```pseudo title="Avoid"
on stop
  call subscription.close()
```

```pseudo title="Prefer"
on stop
  call subscription.pause()
  call subscription.waitUntilSettled(within: 20 seconds)

  for message in subscription.prefetched()
    call message.release()

  call subscription.close()
```

### batch-settled-message-by-message · SHOULD

Every message consumer that takes messages in a batch settles each of them on its own. One failure neither repeats the messages already done nor acknowledges the one that failed.

#### Why

A batch settled whole either redelivers its successes on one failure or drops the failure with them.

#### Examples

```pseudo title="Avoid"
function onBatch(messages, context)
  try
    for message in messages
      call handle(message, context)
    call ackAll(messages)
  catch error
    call releaseAll(messages)
```

```pseudo title="Prefer"
function onBatch(messages, context)
  for message in messages
    try
      call handle(message, context)
      call message.ack()
    catch error
      call settleFailure(message, error)
```
