# Events

> Governs how an event that announces a stored change reaches what reacts to it, and the relay that hands it on from the event outbox.

## Vocabulary

An **event outbox** is a record of the messages a write announces, kept in the store the write changes and written in its transaction, from which a later step sends them on.

An event outbox's **relay** is what reads its entries once their transaction commits and hands each on, to what reacts within the program or to a broker.

## Hand-on

### events-reach-reactions-after-their-change-commits · MUST

Every event that announces a stored change reaches what reacts to it only after that change commits. Nothing that reacts to it runs inside the transaction that saves the change.

#### Why

Work that reacts before the commit, or inside the saving transaction, acts on a change that may still roll back, and its effect then stands for a change the store never holds — the transactional outbox.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
save: function(order, events, context)
  await client.transaction(function(tx)
    await writeOrder(tx, order)

    for event in events
      await eventPort.publish(event, context)  # reactions run before the commit
  , { signal: context.signal })
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-repository.adapter
save: function(order, events, context)
  await client.transaction(function(tx)
    await writeOrder(tx, order)
    await tx.insertAll(OutboxSchema, events.map(toOutboxRow))
  , { signal: context.signal })

# orders/infrastructure/database/outbox-relay
function relayOnce(client, eventPort, context)
  for entry in await client.committedOutboxEntries({ limit: batchSize })
    await eventPort.publish(toEvent(entry), context)
    await client.markHandedOn(entry.id)
```

### event-handed-on-from-its-outbox · MUST

Every event announcing a stored change is handed on from the event outbox, never from memory.

#### Why

An event handed on from memory after the commit is lost when the program stops between the two, while an entry the commit wrote outlives that stop — the transactional outbox.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
save: function(order, events, context)
  await client.transaction(function(tx)
    await writeOrder(tx, order)
  , { signal: context.signal })

  await broker.publishAll(events.map(toMessage))  # lost if the program stops first
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-repository.adapter
save: function(order, events, context)
  await client.transaction(function(tx)
    await writeOrder(tx, order)
    await tx.insertAll(OutboxSchema, events.map(toOutboxRow))
  , { signal: context.signal })
```

### event-handed-on-until-each-receiver-takes-it · MUST

Every event announcing a stored change is handed on, at least once, until each receiver takes it. It reaches what reacts to it within the program or, in a message, a broker, and it is never promised to arrive only once. What reacts within the program takes it by running without a failure, and a broker by confirming that it holds it. Exempt: an event held for its operator, once the retries of what reacts to it ran out or it met a failure no retry clears, which waits for the operator's command.

#### Why

An event handed on once and dropped when its receiver fails never reaches it, one promised to arrive once is handed on again after every lost acknowledgement all the same, and a relay that waits for receivers behind a broker waits for ever, since only the broker answers it — the transactional outbox.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/outbox-relay
function relayOnce(client, broker)
  for entry in await client.committedOutboxEntries({ limit: batchSize })
    await client.markHandedOn(entry.id)
    broker.publish(entry.message)  # never confirmed, never handed on again
```

```pseudo title="Prefer"
# orders/infrastructure/database/outbox-relay
function relayOnce(client, broker)
  for entry in await client.committedOutboxEntries({ limit: batchSize })
    await broker.publishConfirmed(entry.message)
    await client.markHandedOn(entry.id)
```

### receiver-of-a-stored-event-idempotent → receiver-gives-a-repeat-the-first-effect · MUST

Every receiver of an event that announces a stored change is idempotent: a second hand-on of the event repeats none of its effects.

#### Why

An event is handed on at least once, so a receiver that is not idempotent charges, sends or creates a second time when the event arrives twice — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository, ids })
  return function(input, context)
    let issued = issue(ids.next(), input.orderId, input.amountCents)  # a second OrderPlaced issues a second invoice

    await invoiceRepository.save(issued.invoice, [issued.event], context)
```

```pseudo title="Prefer"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository })
  return function(input, context)
    let invoiceId = invoiceIdForOrder(input.orderId)

    if await invoiceRepository.find(invoiceId, context) is not <absent> then
      return

    let issued = issue(invoiceId, input.orderId, input.amountCents)

    await invoiceRepository.save(issued.invoice, [issued.event], context)
```

## Relay

### outbox-relay-misses-no-committed-entry · MUST

Every event outbox's relay hands on each entry its store commits, missing none that commits after an entry read before it. It never reads past a position below which a transaction still open may yet commit an entry. It reads the entries in an order the store fixes at their commit, such as the store's log of changes, or reads a sequence handed out as each transaction began only up to the oldest transaction still open, never up to the highest number it has seen.

#### Why

A sequence handed out as a transaction begins commits out of order, so a relay that reads past the highest number it has seen skips the entry of a slower transaction that commits below it, and that event never reaches its receivers — the transactional outbox.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/outbox-relay
function readNext(client, position)
  return client.outboxEntries({ after: position, orderBy: "sequence" })  # a slower transaction may still commit below
```

```pseudo title="Prefer"
# orders/infrastructure/database/outbox-relay
function readNext(client, position)
  let horizon = await client.oldestOpenTransactionSequence()

  return client.outboxEntries({ after: position, before: horizon, orderBy: "sequence" })
```
