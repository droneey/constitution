# Reads

> Governs the store a read reaches, how far it may lag behind the commands, what answers a command, and how a projection is written, read and rebuilt.

## Vocabulary

A **projection** is a read model kept apart in a store, fed by the write side's events and rebuilt from what the write side stores.

A **projection port** is a data port, as the repositories chapter defines it, through which a feature's command writes a projection, one aggregate at a time at the version that aggregate reached: its state, as a rebuild loaded it, or an event, as a reaction, in core's composition chapter's sense, was handed it.

## Lag

### only-a-queries-ports-store-lags · MUST

Only a queries port's store may lag behind the commands. Every repository reads a store that never lags behind them, while a queries port may read one that does, as a replica or an index does.

#### Why

A repository that read a store that lags would decide a command on a state already changed, and answer a fact its command needs, such as whether a name is taken, from before the change that took it — command–query responsibility segregation.

#### Examples

```pseudo title="Avoid"
# root/orders
let orderRepository = createOrderRepository(replica)  # decides commands on a lagging copy
let orderQueries = createOrderQueries(replica)
```

```pseudo title="Prefer"
# root/orders
let orderRepository = createOrderRepository(primary)
let orderQueries = createOrderQueries(replica)
```

### command-answered-from-a-read-consistent-with-it · MUST

Every delivery unit that answers a command with what it started reads it from a store consistent with the write: it runs the command, then a query of that store. Where no such store answers, it answers that the command was accepted.

#### Why

A read from a store that lags answers that what the command started does not exist, and its caller retries a change that already landed — read-your-writes consistency.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlaceOrder(request, { placeOrder, getOrder }, context)
  let input = parsePlaceOrderInput(request.body)

  await placeOrder(input, context)

  return created(await getOrder({ orderId: input.orderId }, context))  # getOrder reads a replica that lags
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
function onPlaceOrder(request, { placeOrder }, context)
  let input = parsePlaceOrderInput(request.body)

  await placeOrder(input, context)

  return accepted({ orderId: input.orderId })
```

## Projections

### projection-written-by-its-features-reaction · SHOULD

Every projection a feature keeps is written by its own reaction to its events, a command that writes through a projection port. Exempt: the command that rebuilds it from what the write side stores.

#### Why

A projection written by the command that made the change ties the write to the reads' store, and one written by another feature's code changes whenever that feature does — command–query responsibility segregation.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ orderRepository, orderSummaryProjection })
  return function(input, context)
    let placed = place(input.orderId, input.lines)

    await orderRepository.save(placed.order, [placed.event], context)
    await orderSummaryProjection.write(placed.event, context)  # the command writes the reads' store
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ orderRepository })
  return function(input, context)
    let placed = place(input.orderId, input.lines)

    await orderRepository.save(placed.order, [placed.event], context)

# orders/application/use-cases/commands/project-placed-order.use-case
function createProjectPlacedOrder({ orderSummaryProjection })
  return function(event: OrderPlaced, context)
    await orderSummaryProjection.write(event, context)
```

### projection-read-only-by-the-read-side · MUST

Every projection is read only by the adapters of the read side's queries ports.

#### Why

A command that reads a projection decides on data that lags behind the write it is about to make — command–query responsibility segregation.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ orderRepository, orderSummaryProjection })
  return function(input, context)
    let summary = await orderSummaryProjection.find(input.customerId, context)  # lags behind the write
    let placed = place(input.orderId, input.lines, summary.openOrderCount)

    await orderRepository.save(placed.order, [placed.event], context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ orderRepository })
  return function(input, context)
    let openOrderCount = await orderRepository.countOpenFor(input.customerId, context)
    let placed = place(input.orderId, input.lines, openOrderCount)

    await orderRepository.save(placed.order, [placed.event], context)
```

### projection-write-applied-only-if-newer · MUST

Every projection write takes effect only if its aggregate version is newer than the one the projection holds of it. A write at that version or an older one does nothing.

#### Why

An event is handed on at least once, so one handed on again after its write landed, as after a lost acknowledgement, writes its change a second time, and a total it feeds counts it twice — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-summary-projection.adapter
write: function(summary, context)
  await client.upsert(OrderSummarySchema, toSummaryRow(summary),
    { signal: context.signal })  # an older or repeated write lands again
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-summary-projection.adapter
write: function(summary, context)
  await client.upsert(OrderSummarySchema, toSummaryRow(summary), {
    onlyWhere: storedVersionBelow(summary.version),
    signal: context.signal
  })
```

## Rebuilds

### projection-rebuilt-from-what-the-write-side-stores · MUST

Every projection is rebuilt from what the write side stores, by a command of its feature. The command loads each aggregate, a bounded page at a time, through its repository, and writes its state, at its version, through the projection port.

#### Why

Events are handed on and then need not be kept, so a projection that only they could rebuild is lost when its shape changes, while what the write side stores outlives every hand-on and serves an aggregate stored as its events as well.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/rebuild-order-summaries.use-case
function createRebuildOrderSummaries({ eventArchive, orderSummaryProjection })
  return function(input, context)
    for event in await eventArchive.all(context)  # events handed on need not be kept
      await orderSummaryProjection.write(event, context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/rebuild-order-summaries.use-case
function createRebuildOrderSummaries({ orderRepository, orderSummaryProjection })
  return function(input, context)
    let page = await orderRepository.page({ after: <absent>, limit: pageSize }, context)

    while page.orders is not empty
      for order in page.orders
        await orderSummaryProjection.writeState(order, context)

      page = await orderRepository.page({ after: page.last, limit: pageSize }, context)
```

### projection-rebuild-starts-from-an-empty-projection · MUST

Every projection's rebuild starts from an empty projection, never over what it already holds.

#### Why

A rebuild over a projection that holds its aggregates writes each at a version already stored, so every write does nothing and the shape the rebuild was run for never lands.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/rebuild-order-summaries.use-case
function createRebuildOrderSummaries({ orderRepository, orderSummaryProjection })
  return function(input, context)
    await writeEveryOrder(orderRepository, orderSummaryProjection, context)  # each write meets its own version and does nothing
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/rebuild-order-summaries.use-case
function createRebuildOrderSummaries({ orderRepository, orderSummaryProjection })
  return function(input, context)
    await orderSummaryProjection.clear(context)
    await writeEveryOrder(orderRepository, orderSummaryProjection, context)
```

### projection-rebuild-writes-alone-while-it-runs · MUST

Every projection's rebuild is the only writer of the projection it builds while it runs. Its reaction's events for that projection wait, in order, until it is done.

#### Why

An event written into a projection the rebuild has not yet reached finds nothing to change, and the rebuild then writes the state it loaded before that event, so the projection misses the change for good.

#### Examples

```text title="Avoid"
rebuild of order summaries
  10:00  rebuild starts
  10:02  OrderShipped of order 41 written by
         the reaction: no row yet, nothing changed
  10:05  rebuild writes order 41 as loaded
         at 10:00, still placed
```

```text title="Prefer"
rebuild of order summaries
  10:00  rebuild starts; the reaction's
         events wait in order
  10:02  OrderShipped of order 41 waits
  10:05  rebuild writes order 41 as loaded
         at 10:00, still placed
  10:20  rebuild done; OrderShipped of
         order 41 written, shipped
```

### projection-rebuilt-beside-the-live-one · MUST

Every projection rebuilt while its queries are served is rebuilt into a new store beside the live one. The live one goes on answering its queries and taking its events until the switch. Exempt: a projection whose queries are answered as unavailable while it rebuilds, which may be emptied and rebuilt in place.

#### Why

A projection emptied and rebuilt in place answers its queries with a part of its data while it fills, so a list shows half its items and a total counts half its rows, with nothing to tell the reader that the answer is partial.

#### Examples

```text title="Avoid"
rebuild of order_summaries
  1  empty order_summaries
  2  refill order_summaries     queries answered
                                from it meanwhile
```

```text title="Prefer"
rebuild of order_summaries
  1  build order_summaries_v2 beside it
  2  order_summaries goes on answering
     queries and taking events
  3  switch to order_summaries_v2
```

### projection-switched-once-caught-up · MUST

Every projection's queries switch to its rebuilt store only once that store has taken every event the live one took. The switch is one step that no query sees half made.

#### Why

A switch made before the rebuilt store caught up answers from a projection that misses the changes made while it was built, and one made query by query answers the same question from two projections at once.

#### Examples

```text title="Avoid"
order_summaries_v2
  10:20  rebuild loaded every order
  10:20  queries moved to v2, one
         query kind at a time; events
         since 10:00 still waiting
```

```text title="Prefer"
order_summaries_v2
  10:20  rebuild loaded every order
  10:24  v2 has taken every event
         the live one took
  10:24  alias order_summaries moved
         to v2 in one step
```

### rebuilt-projection-subscribes-from-the-rebuilds-start · MUST

Every projection being rebuilt takes its events from the position its event stream held as the rebuild began. It takes them through a subscription of its own, none until the rebuild is done; the stream is what hands the events on, such as the event outbox's relay or a broker, and no event waits in the program's memory.

#### Why

A subscription that starts after the rebuild began misses the events in between for good, while one that buffers them in memory loses them when the program stops mid-rebuild, and a replay from the start position is harmless, since a projection write at an old version does nothing.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-summary-rebuild
await rebuildOrderSummaries({ into: "order_summaries_v2" }, context)

relay.subscribe("order-summaries-v2", { from: await relay.position() }, writeToV2)  # misses what came during the rebuild
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-summary-rebuild
let start = await relay.position()

await rebuildOrderSummaries({ into: "order_summaries_v2" }, context)

relay.subscribe("order-summaries-v2", { from: start }, writeToV2)
```
