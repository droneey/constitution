# Publishing

> Governs how a message is handed to the message broker: its confirmation and its order.

## Confirmation

### publish-done-only-once-the-broker-confirms · MUST

Every publish is done only once the message broker confirms that it holds the message durably. The confirmation is such as a publisher confirm or an acknowledgement of every in-sync replica, and a publish not confirmed within its timeout fails, never passing as sent.

#### Why

A message broker that accepted a message into a buffer can lose it on a crash, and a publish counted as done before the confirmation loses it without a trace.

#### Examples

```pseudo title="Avoid"
function relay(entry, context)
  call producer.send(entry.message)
  call outbox.markPublished(entry.id, context)
```

```pseudo title="Prefer"
function relay(entry, context)
  let confirmed = producer.sendAndAwaitConfirm(entry.message, {
    timeout: 5 seconds,
  })

  if not confirmed then
    throw new PublishNotConfirmedError(entry.message.id)

  call outbox.markPublished(entry.id, context)
```

## Order

### ordered-messages-share-an-ordering-key · MUST

All messages that change one object carry that object's identifier as their ordering key.

#### Why

A message broker keeps order only within a key, and competing message consumers otherwise apply a later change before an earlier one.

#### Examples

```pseudo title="Avoid"
call broker.publish("orders.order-changed", message, {
  orderingKey: message.id,
}, context)
```

```pseudo title="Prefer"
call broker.publish("orders.order-changed", message, {
  orderingKey: message.orderId,
}, context)
```

### ordering-key-order-kept-through-retries · MUST

Every publisher's messages of one ordering key reach the message broker in the order it sent them, a retried send included. It sends each only once the message broker confirmed the one before, or through a client the message broker keeps in order across its retries.

#### Why

A publisher that sends one key's messages side by side, or the next before the last is confirmed, reorders them whenever one send is retried, and its message consumers then apply a later change before an earlier one.

#### Examples

```pseudo title="Avoid"
for message in changesOf(order) in parallel
  call publishConfirmed(message, { orderingKey: order.id }, context)
```

```pseudo title="Prefer"
for message in changesOf(order)
  call publishConfirmed(message, { orderingKey: order.id }, context)
```

### consumer-relies-on-no-order-across-keys · MUST

No message consumer relies on an order between messages of different ordering keys.

#### Why

A message broker keeps no order across keys, so a message consumer that counts on one works while one partition serves it and breaks on the first rebalance or second message consumer.

#### Examples

```pseudo title="Avoid"
function onShipmentCreated(message, context)
  let order = localOrders.find(message.orderId, context)

  call localOrders.save(attachShipment(order, message.shipmentId), context)
# assumes the order's own message, of another key, came first
```

```pseudo title="Prefer"
function onShipmentCreated(message, context)
  let order = localOrders.find(message.orderId, context)

  if order is <absent> then
    throw new OrderNotYetKnownError(message.orderId)

  call localOrders.save(attachShipment(order, message.shipmentId), context)
```
