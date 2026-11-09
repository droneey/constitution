# Ports

> Governs a port and the adapter that implements it, and how domain events travel through the event port.

## Vocabulary

A **port** is the contract an inner layer declares for what it needs of the world outside it, and every member of `contracts/` is one; what it reaches beyond the program is an outside system, as foundation's `names` defines it.

A **reporter port** carries what a use case reports along the way that neither its result nor its failure carries: the **progress reporter** a command's progress and report to its user or its operator, the **fault reporter** to the operator what the program goes on past: a failure an optional part contained, a step, a compensation or a reaction that is spent, and a late outcome, as the composition chapter defines these.

The **event port** is the port through which domain events are handed on, after their change, to the reactions and the programs that read them; one event port serves every feature.

The **dispatcher** is the unit of the event port's adapter module that, within the program, calls for each event every subscription registered with it for the event's kind.

A **port of a binding unit's own concern** is one a binding unit needs for what it does around the use case, whatever the business, such as the progress reporter, which shows a command's progress in its interface's way, the source of the identifier it makes for a command, and the sink of the events that record how its interface is used.

A **port callback** is a function a use case hands a port for its adapter, or the outside system behind it, to call during that call, as a handler a streaming parser calls for each record is, or a tool a language model calls while the program runs it.

An **adapter** implements one port over one outside system or, in composition, through another feature.

A port owner's adapters over one system, with what they share of it, make its **adapter module**, named after the system, or after the feature it answers a port through; they reach the system through its client.

An **edge worker** is a unit at the edge that the composition root starts and that implements no port, as a unit that hands on the events of stored changes is. Every unit at the edge that hands the program's own domain events of stored changes to their reactions is one, whatever it takes them from, such as a queue only the program reads; a use case that hands on the events of its unstored changes is none, and a consumer of the messages another program sends is no edge worker but a delivery unit, as the presentation chapter defines it.

The outside system's own shape — a response, a row, a message, a file format — is a **wire model**.

An adapter that translates another bounded context's model — an outside system's, or another feature's — into its port owner's terms is an **anti-corruption layer**{#anti-corruption-layer}.

What another program reads of a domain event is an **integration event**{#integration-event}, a wire model of its own.

## Declarations

### port-declared-by-the-layer-that-needs-it · SHOULD

Every port is declared by the inner layer that needs it, in that layer's words, and implemented by the outer one; both depend on the port. Exempt: a port of a binding unit's own concern, since no presentation declares a port, and the event port, which every feature hands its events through, both of which the kernel's `contracts/` declares.

#### Why

A port declared by its implementation binds the business rules to that vendor or engine, so replacing it reaches into them — the dependency inversion principle.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/payment-provider/payment-provider.port
type PaymentProviderPort = {
  createCharge: function(request: ChargeRequest, context: CallContext): ChargeResponse
}

# orders/application/use-cases/commands/pay-order.use-case
import { PaymentProviderPort } from "../../../infrastructure/payment-provider"
```

```pseudo title="Prefer"
# orders/application/contracts/payment.port
type PaymentPort = {
  charge: function(amount: Money, context: CallContext): PaymentReference
}

# orders/infrastructure/payment-provider/payment.adapter
import { PaymentPort } from "../../application/contracts"

function createPaymentAdapter({ client }): PaymentPort
  ...
```

### port-justified-where-the-program-meets-the-outside · SHOULD

Every port to an outside system is justified alone by the place where the program meets that system. With one adapter it is complete, not premature.

#### Why

A call to an outside system made without a port lets that system's shape into the code that makes it, so every change of that system reaches the code, whether or not a second implementation ever arrives — ports and adapters.

#### Examples

```pseudo title="Avoid"
# carts/application/use-cases/commands/expire-cart.use-case
# no port: there is only one clock
function createExpireCart({ cartRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    call cartRepository.save(expire(cart, systemTime()), context)
```

```pseudo title="Prefer"
# carts/application/contracts/clock.port
type ClockPort = { now: function(): Instant }

# carts/application/use-cases/commands/expire-cart.use-case
function createExpireCart({ cartRepository, clock })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    call cartRepository.save(expire(cart, clock.now()), context)
```

### port-knows-no-vendor · MUST

Every port, with its parameters and its results, speaks only the program's own types and knows no vendor. Those are the domain model's and the kernel's types, the read models declared beside the ports that return them and values of the standard library that hold no effect; none imports a vendor, an adapter, another feature or another port's internals.

#### Why

A port that knows a vendor ties every implementation, and the layer that declares it, to that vendor — the dependency inversion principle.

#### Examples

```pseudo title="Avoid"
# orders/application/contracts/payment.port
import { ProviderCharge } from "card-provider-sdk"

type PaymentPort = {
  charge: function(amount: Money, context: CallContext): ProviderCharge
}
```

```pseudo title="Prefer"
# orders/application/contracts/payment.port
import PaymentReference from "../../domain/payment/value-objects"

type PaymentPort = {
  charge: function(amount: Money, context: CallContext): PaymentReference
}
```

## Port callbacks

### callback-reaches-only-what-its-use-case-reaches · MUST

Every port callback reaches only what the use case that hands it may reach, keeping to that use case's side. One an outside system calls reaches another feature's data only through a port by which its feature asks another feature.

#### Why

A port callback that reaches past what its use case may reach opens, to whatever calls it, a door past the use case's side and the features' surfaces that no rule of the program guards, as a tool handed to a language model or a check a solver runs on each candidate would — ports and adapters.

#### Examples

```pseudo title="Avoid"
# support/application/use-cases/commands/answer-question/callbacks/order-status
import orderRepository from "features/orders/infrastructure/database"

function orderStatus({ orderId }, context)
  return call orderRepository.find(orderId, context).status
```

```pseudo title="Prefer"
# support/application/use-cases/commands/answer-question/callbacks/order-status
function createOrderStatus({ orderLookup })
  return function({ orderId }, context)
    return call orderLookup.statusOf(orderId, context)
```

### callback-reads-its-features-data-through-a-read-side-port · SHOULD

Every port callback an outside system calls reads its feature's own data only through a read side's port, never a write side's. That port is its query's own or, in a command, one the command declares for its port callbacks.

#### Why

A port of the write side answers only the facts its commands need, so a port callback that reads through one grows it an operation for every question an outside system may ask, and ties those reads to the commands' store — command–query responsibility segregation.

#### Examples

```pseudo title="Avoid"
# support/application/use-cases/commands/answer-question/callbacks/past-tickets
function createPastTickets({ ticketRepository })
  return function({ customerId }, context)
    return call ticketRepository.findAllByCustomer(customerId, context)
```

```pseudo title="Prefer"
# support/application/use-cases/commands/answer-question/callbacks/past-tickets
function createPastTickets({ ticketHistory })
  return function({ customerId }, context)
    return call ticketHistory.listForCustomer(customerId, { limit: TICKET_HISTORY_LIMIT }, context)
```

## Adapters

### outside-shape-mapped-in-the-adapter · MUST

Every adapter maps its outside system's shapes to its port's, in both directions. A wire model is mapped with its spellings of absence and never travels inward; the failures cross the port as `port-failure-declared-or-a-defect` gives.

#### Why

A vendor's shape inside the domain model turns every change of the vendor into a change of the business rules — ports and adapters, and an anti-corruption layer.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
function find(orderId, context)
  let row = query(selectOrder, orderId, { signal: context.signal })

  return row  # total_cents and a note of "" or null go inward
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-repository.adapter
function find(orderId, context)
  let row = query(selectOrder, orderId, { signal: context.signal })

  if row is <absent> then
    return <absent>

  return restore(parseOrderRow(row))

function parseOrderRow(row)
  let parsed = parse(OrderRow, row)

  return {
    id: OrderId.create(parsed.id),
    total: Money.fromCents(parsed.total_cents),
    note: parsed.note or <absent>
  }
```

### port-failure-declared-or-a-defect · MUST

Every failure crossing a port, a port callback's among them, is one the port declares or a defect of the program's own. No failure is of the dependency's own type.

#### Why

A caller of a port acts on the port's failures alone, so a failure the port never declared reaches it as a case none of its callers wrote, and a vendor's failure type that passes as a defect ties every layer it crosses to that vendor — ports and adapters.

#### Examples

```pseudo title="Avoid"
# payments/infrastructure/payment-provider/payment.adapter
function charge(payment, context)
  return call client.charge(toCharge(payment), context)
```

```pseudo title="Prefer"
# payments/application/contracts/payment.port
type PaymentPort = {
  charge: function(payment, context): Charge | PaymentDeclinedError
}

# payments/infrastructure/payment-provider/payment.adapter
function charge(payment, context)
  try
    return call client.charge(toCharge(payment), context)
  catch error
    if error.type is "card_error" then
      throw new PaymentDeclinedError({ cause: error })

    throw new PaymentProviderDefect({ cause: error })
```

### adapter-decides-no-rule-of-the-business · SHOULD

Every adapter carries out each call of its port and decides no rule of the business. The criterion of a read — whose records, which statuses — reaches it from the use case as parameters, and a criterion the domain model also decides on reaches it as the domain model's own value.

#### Why

A criterion of the business written in an adapter is proven by no spec of the domain model and forgotten by the next adapter of the same port — ports and adapters.

#### Examples

```pseudo title="Avoid"
# invoices/infrastructure/database/invoice-repository.adapter
function listOverdue(today, context)
  return call query("""
    select * from invoices
    where due_on < $1 - interval '30 days' and status <> 'disputed'
    limit $2""", [today, PAGE_SIZE], context)
```

```pseudo title="Prefer"
# invoices/infrastructure/database/invoice-repository.adapter
function listDueBefore({ dueBefore, statuses }, context)
  return call query("""
    select * from invoices
    where due_on < $1 and status = any($2)
    limit $3""", [dueBefore, statuses.map(toStatusCode), PAGE_SIZE], context)

# invoices/application/use-cases/commands/send-reminders.use-case
let invoices = call invoiceRepository.listDueBefore({
  dueBefore: Invoice.overdueCutoff(today),
  statuses: REMINDABLE_STATUSES,
}, context)
```

### adapter-module-one-per-system-and-owner · SHOULD

Every port owner has one adapter module per outside system, beside it. The adapter module holds an adapter for each of its ports that system serves and the schema, mapping and failures they share. An adapter that answers a feature's port through another feature lives in the composition module that joins them, and an edge worker in the adapter module of the system it serves.

#### Why

An outside system's knowledge, its client, its errors and its wire shapes, spread over several adapter modules is fixed in each when the system changes, and the copies drift.

#### Examples

```text title="Avoid"
orders/infrastructure/
├── find-order-database/
├── list-orders-database/
├── save-order-database/
└── charge-payment-provider/
```

```text title="Prefer"
orders/infrastructure/
├── database/
│   ├── dtos/
│   ├── order-queries.adapter
│   ├── order-repository.adapter
│   └── <surface>
└── payment-provider/
    ├── dtos/
    ├── payment.adapter
    └── <surface>
```

### adapter-builds-no-client-as-its-module-loads · MUST

Every adapter's file reaches nothing outside the program as it loads: it builds no client and opens no connection.

#### Why

An adapter that connects as it loads reaches its system in every spec and tool that imports it.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/order-repository.adapter
# built when the module loads
let client = new DatabaseClient(databaseUrl)

let orderRepository = {
  find: function(orderId, context)
    return restore(parseOrderRow(
      client.get(orderId, { signal: context.signal })))
}
```

```pseudo title="Prefer"
# orders/infrastructure/database/order-repository.adapter
function createOrderRepository(client)
  return {
    find: function(orderId, context)
      return restore(parseOrderRow(
        client.get(orderId, { signal: context.signal })))
  }

# root/orders
let client = new DatabaseClient(config.databaseUrl)

stop.release(client)

let repository = createOrderRepository(client)
```

## Events

### yielded-event-handed-on-after-its-change · MUST

Every domain event of a stored change is handed on only once the write that keeps the change commits.

#### Why

An event handed on before its change is kept announces what may never happen — the domain event pattern.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order.use-case
let { order, events } = Order.place(input.orderId, input.lines)

call orderRepository.save(order, events, context)

# orders/infrastructure/database/outbox-relay
for entry in call client.outboxEntries({ isolation: ReadUncommitted, limit: BATCH_SIZE })
  call eventPort.handOn(toEvent(entry), context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order.use-case
let { order, events } = Order.place(input.orderId, input.lines)

call orderRepository.save(order, events, context)

# orders/infrastructure/database/outbox-relay
for entry in call client.committedOutboxEntries({ limit: BATCH_SIZE })
  call eventPort.handOn(toEvent(entry), context)
```

### unstored-changes-event-handed-on-after-its-use-case · MUST

Every domain event of an unstored change is handed on only once the use case that yielded it has made its change.

#### Why

An event handed on while its use case is still at work announces a change that use case may yet fail to make — the domain event pattern.

#### Examples

```pseudo title="Avoid"
# rentals/application/use-cases/commands/take-deposit.use-case
let { deposit, events } = Deposit.take(input.rentalId, input.amount)

call eventPort.handOn(events, context)
call payments.capture(deposit.amount, { key: deposit.paymentKey }, context)
```

```pseudo title="Prefer"
# rentals/application/use-cases/commands/take-deposit.use-case
let { deposit, events } = Deposit.take(input.rentalId, input.amount)

call payments.capture(deposit.amount, { key: deposit.paymentKey }, context)
call eventPort.handOn(events, context)
```

### stored-changes-events-handed-on-by-an-edge-worker · MUST

Every domain event of a stored change is handed to the event port only by an edge worker. The worker takes it from the write that kept it with the change.

#### Why

An event the use case hands on apart from the write that kept it is lost, or announced for a change never kept, when the program stops between the two — the transactional outbox.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order.use-case
let { order, events } = Order.cancel(found, input.reason)

call orderRepository.save(order, context)
call eventPort.handOn(events, context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order.use-case
let { order, events } = Order.cancel(found, input.reason)

call orderRepository.save(order, events, context)

# orders/infrastructure/database/outbox-relay
for entry in call client.committedOutboxEntries({ limit: BATCH_SIZE })
  call eventPort.handOn(toEvent(entry), context)
  call client.markHandedOn(entry.id)
```

### unstored-changes-events-handed-on-by-their-use-case · MUST

Every domain event of an unstored change is handed to the event port only by the use case that yielded it.

#### Why

An event no one unit is charged with handing on reaches no reaction, or reaches each twice when two units both hand it on, and one handed on by the unit that bound the operation is lost by every other binding of it.

#### Examples

```pseudo title="Avoid"
# rentals/application/use-cases/commands/take-deposit.use-case
let { deposit, events } = Deposit.take(input.rentalId, input.amount)

call payments.capture(deposit.amount, { key: deposit.paymentKey }, context)
context.collected.add(events)

# rentals/presentation/bindings/commands/take-deposit
let collected = createEventCollector()

call takeDeposit(input, { ...context, collected })
call eventPort.handOn(collected.drain(), context)
```

```pseudo title="Prefer"
# rentals/application/use-cases/commands/take-deposit.use-case
let { deposit, events } = Deposit.take(input.rentalId, input.amount)

call payments.capture(deposit.amount, { key: deposit.paymentKey }, context)
call eventPort.handOn(events, context)

# rentals/presentation/bindings/commands/take-deposit
call takeDeposit(input, context)
```

### yielded-event-handed-on-at-least-once · MUST

Every domain event is handed on at least once and never dropped: the unit that hands it on stops only once every reaction to it has run, raising no failure, or holds it for its operator, as `spent-step-held-for-its-operator` gives.

#### Why

An event dropped leaves every reaction to it undone, a saga's among them, whose next call that event was to make — the transactional outbox.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/outbox-relay
for entry in call client.committedOutboxEntries({ limit: BATCH_SIZE })
  try
    call eventPort.handOn(toEvent(entry), context)
  catch error
    reportFault(error)

  call client.markHandedOn(entry.id)
```

```pseudo title="Prefer"
# orders/infrastructure/database/outbox-relay
for entry in call client.committedOutboxEntries({ limit: BATCH_SIZE })
  try
    call eventPort.handOn(toEvent(entry), context)
    call client.markHandedOn(entry.id)
  catch error
    call holdOrRetry(entry, error, context)
```

### event-handed-on-again-only-on-a-transient-failure · MUST

Every edge worker hands an event on again only to a reaction whose failure is transient: one that lost a race or gave no answer included. It does so only within a limit of its retries, as `failure-retried-only-when-transient` gives.

#### Why

An event handed on again after a call refusal or a defect repeats a failure no retry clears, while a reaction cut off by its program's stop before it answered has not run, and its event is still owed, and a saga's reaction raises none of its step's failures, so this retry never stacks on its saga's — the transactional outbox.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/outbox-relay
function onReactionFailed(entry, reaction, error, context)
  call client.scheduleRetry(entry.id, reaction, backoff(entry.attempts))
```

```pseudo title="Prefer"
# orders/infrastructure/database/outbox-relay
function onReactionFailed(entry, reaction, error, context)
  if isTransient(error) and entry.attempts < MAX_ATTEMPTS then
    call client.scheduleRetry(entry.id, reaction, backoff(entry.attempts))
    return

  call holdForOperator(entry, reaction, error, context)
```

### aggregates-events-reach-each-reaction-in-order · MUST

Every aggregate's events reach each reaction in the order its transitions yielded them. An event reaches a reaction only once every earlier event of the same aggregate has run for it, so one held for its operator holds back those after it.

#### Why

A reaction that takes a later event first acts on a state the aggregate has already left, as a read model that shows a cancelled order as placed again or a returned book as still on loan — the transactional outbox, relayed in order.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/outbox-relay
let entries = call client.committedOutboxEntries({ limit: BATCH_SIZE })

runConcurrently(entries, MAX_CONCURRENT, function(entry)
  call eventPort.handOn(toEvent(entry), context)
)
```

```pseudo title="Prefer"
# orders/infrastructure/database/outbox-relay
let entries = call client.committedOutboxEntries({
  limit: BATCH_SIZE,
  orderBy: [aggregateId, sequence],
  skipAggregatesWithHeldEntries: true,
})

runConcurrently(groupBy(entries, aggregateId), MAX_CONCURRENT, function(aggregateEntries)
  for entry in aggregateEntries
    call eventPort.handOn(toEvent(entry), context)
)
```

### event-handed-to-the-dispatcher-within-the-program · SHOULD

Within the program, the event port's adapter module hands each event, as it is, to the dispatcher. It maps to its integration event only an event that leaves the program.

#### Why

An event sent within the program through a transport other programs read, or mapped as though it left, ties every reaction to that transport's shape and delay, and turns the domain model's own events into a contract no other program asked for.

#### Examples

```pseudo title="Avoid"
# infrastructure/events/event-port.adapter
function handOn(event, context)
  call broker.publish("orders", toOrderMessage(event), context)

# root/reactions
broker.subscribe("orders", function(message) reserveStock(fromOrderMessage(message)))
```

```pseudo title="Prefer"
# infrastructure/events/event-port.adapter
function handOn(event, context)
  call dispatcher.dispatch(event, context)

  if event.kind in EVENTS_THAT_LEAVE then
    call broker.publish("orders", toOrderMessage(event), context)
```

### integration-event-mapped-by-its-publishing-adapter · MUST

Every integration event is mapped from its domain event by the adapter that publishes it. No domain event leaves the program as it is.

#### Why

A domain event sent as it is makes the domain model a contract other programs read, so every change of the model breaks them — a published language.

#### Examples

```pseudo title="Avoid"
# infrastructure/broker/order-events.adapter
function publish(event, context)
  call broker.publish("orders", event, context)
```

```pseudo title="Prefer"
# infrastructure/broker/order-events.adapter
function publish(event: OrderPlaced, context)
  call broker.publish("orders", toOrderPlacedMessage(event), context)

function toOrderPlacedMessage(event)
  return {
    type: "order.placed.v1",
    orderId: String(event.orderId),
    total: { amount: Decimal.toString(event.total.amount), currency: event.total.currency },
  }
```
