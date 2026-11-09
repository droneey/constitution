# Composition

> Governs how features relate — how one asks another feature, when a type or a port lifts because several share it, how one reacts to another — and how composition combines them.

## Vocabulary

A feature **asks another feature** when a rule it can state in its own words, or a read it serves, needs that feature's answer, and that answer may lag behind that feature's latest change.

The business **combines** features when a fact, a total or a decision belongs to no one feature's language — joined, sorted or paged across them, decided across them —, when writes to several features run in sequence, or when an answer has to hold at the moment of a change.

A **reaction** is a use case set off by a domain event, whose operation input is that event: a composition module's reaction to a feature's event or to its own saga's, or a feature's reaction to its own.

A sequence of writes to several features is a **saga** when a step can fail after an earlier one has landed, so that the earlier steps need a compensation; its steps are those writes, its compensations apart, and none of them is a pipeline's step, as foundation's `relations` names those.

A **compensation** is the operation that undoes what a step wrote, as a refund undoes a charge or freeing a seat undoes its hold.

A step's or a compensation's **participant** is the command of a feature its call runs, as a payment feature's charge or refund is.

A saga's **pivot** is the step after which it no longer rewinds, as a successful charge or a confirmed booking is; every step before the pivot, or every step where there is none, is **compensable**, a step after it is **retryable**, as sending a receipt is, and the pivot itself is neither. A saga's deadline is the instant by which its pivot is to land, and a saga with no pivot has none. Its operator is the program's, as foundation's `code` defines the operator.

A saga makes a call **due** by an event of its aggregate that a reaction answers with that call: a call of a step or of a compensation, or another attempt at one.

Each step and each compensation of a saga is in one **phase** at a time, which its saga records.

A step or a compensation is **planned** until it is first made due.

A step or a compensation is **pending** from the moment it is made due until another phase is recorded, waiting after a failed attempt for the next one at the time its saga recorded.

A step or a compensation has **landed** once its call raised no failure, so that its write took effect, a repeat and another call that changed nothing included; a call whose answer says its outcome comes later has not landed until that outcome is recorded as a landing.

A **call refusal** is a call's failure with an expected failure that is no failed attempt, of whichever of the three kinds a use case fails with, as a declined card or a start under an identifier taken with other data is; a failure of none of those kinds is no call refusal but a defect.

A call's **failed attempt** is its transient failure, as foundation's errors chapter defines one, such as a timeout or a write lost to a concurrent one, a call that had no answer included.

Each outcome of a call is of one **kind of outcome**: a landing, a call refusal or a failed attempt.

A pivot or a compensable step is a **refused step** once its call met a call refusal.

A step or a compensation is **spent** once no retry of it is left: once it has met as many failed attempts as the limit its saga sets for its retries allows or, for a retryable step or a compensation, at its first call refusal, which no retry clears. A reaction, a saga's among them, is spent the same way, as its edge worker counts its retries, or at its first call refusal or defect.

The operator **revives** a spent step, compensation or reaction by letting it run again: a step or a compensation by a command of its composition module that makes it due again, a reaction by handing its event on again.

A step or a compensation is **given up** once its operator gave it up.

A compensable step is **compensated** once its compensation landed.

A step has an **unknown outcome** from the moment a call of it fails with no answer, as a charge or a booking whose answer timed out does, or it is given up while pending, until a later call of it lands or is refused.

A compensable step **may have landed** once it has landed or its outcome is unknown.

A **settled call** is one whose saga recorded an outcome of it, or whose step or compensation left the pending phase.

An outcome of a settled call is a **late outcome** when its saga recorded no outcome of that same call, or one of another kind of outcome, and a **repeated outcome** when it is of the kind recorded for that call.

A saga is **deadline-stopped** while its deadline has passed and its pivot has not landed.

A saga is **cut short** once its pivot or a compensable step is refused or given up, or once it is deadline-stopped with none of its steps pending or spent.

A saga **rewinds** when it makes a compensation due.

A saga is **completed** once each of its steps has landed or is a retryable step given up, and **rewound** once it is cut short and each compensable step that may have landed is compensated or its compensation given up; a saga completed or rewound is **finished**.

A **durable-execution engine** runs a saga's code as written and keeps, in a store of its own, its state, the attempts it made and the compensations it registered, so the saga goes on from where it stopped after its program stops.

## Asking

### feature-asks-another-through-its-own-port · SHOULD

Every feature asks another feature through a port of its own. It words the port in its own terms — its parameters, its results and the failures it acts on — and receives an input built for it.

#### Why

A feature that holds another's types or failures breaks whenever the other changes its model, and can no longer change apart from it — an anti-corruption layer.

#### Examples

```pseudo title="Avoid"
# shipping/application/use-cases/commands/ship-order.use-case
import { getInvoice } from "features/billing"

function createShipOrder({ shipmentRepository })
  return function(input, context)
    let shipment = shipmentRepository.find(input.orderId, context)
    let invoice = getInvoice({ orderId: input.orderId }, context)

    call shipmentRepository.save(dispatch(shipment, invoice.status), context)
```

```pseudo title="Prefer"
# shipping/application/contracts/payment-check.port
type PaymentCheckPort = {
  isPaid: function(OrderId, CallContext): Boolean
}

# shipping/application/use-cases/commands/ship-order.use-case
function createShipOrder({ shipmentRepository, paymentCheck })
  return function(input, context)
    let shipment = shipmentRepository.find(input.orderId, context)
    let isPaid = paymentCheck.isPaid(input.orderId, context)

    call shipmentRepository.save(dispatch(shipment, isPaid), context)
```

### ask-answered-by-a-query-of-the-other-feature · MUST

Every port by which a feature asks another feature is implemented in composition by a query of that feature, through its surface. The adapter may answer from data that lags, and the asker's rule accepts that.

#### Why

An ask answered by a command of the other feature changes what the asker only meant to read, and one answered past the other's surface ties composition to its internals — an anti-corruption layer.

#### Examples

```pseudo title="Avoid"
# composition/order-shipping/infrastructure/billing/payment-check.adapter
import { invoiceRepository } from "features/billing/infrastructure/database"

function isPaid(orderId, context)
  let invoice = call invoiceRepository.findByOrder(orderId, context)
  return invoice.status is Paid
```

```pseudo title="Prefer"
# composition/order-shipping/infrastructure/billing/payment-check.adapter
import { findInvoiceForOrder, Invoice } from "features/billing"

function isPaid(orderId, context)
  let invoice = call findInvoiceForOrder({ orderId }, context)
  return invoice is not <absent> and Invoice.isPaid(invoice)
```

## Sharing

### type-lifts-when-features-share-its-meaning · SHOULD

Every value object lifts to the kernel only when two or more features use it with one meaning. An enumeration or an identifier is such a value object, and a constant with a business meaning lifts the same way. The meaning is the one the glossary gives its word in each, and until then the value object belongs to the feature that holds it; a feature that reads a type differently keeps a narrow view of its own, into which composition translates the other's.

#### Why

A value object lifted before two features share its meaning guesses at a sharing that may never come, and one shared by features that read it differently has to satisfy them all and stops them changing apart — shared kernel.

#### Examples

```text title="Avoid"
src/kernel/value-objects/
├── customer-id.value-object
└── parcel-size.value-object      only shipping uses it
```

```text title="Prefer"
src/kernel/value-objects/
└── customer-id.value-object
src/features/shipping/domain/parcel/value-objects/
└── parcel-size.value-object
```

### entity-never-lifts-to-the-kernel · MUST

No entity lifts to the kernel, since one feature owns its life. A feature that needs another's entity keeps a narrow view of its own — a type of its own or a reference by identifier — into which composition translates the other's.

#### Why

An entity in the kernel lets every feature change what one feature owns, so its life follows no one feature's rules — shared kernel.

#### Examples

```text title="Avoid"
src/kernel/
└── entities/
    └── customer.aggregate        used by orders, billing and support
```

```text title="Prefer"
src/features/customers/domain/customer/entities/
└── customer.aggregate
src/features/billing/domain/payer/value-objects/
└── payer.value-object            billing's view: customerId, billing address
src/features/support/domain/ticket/value-objects/
└── requester.value-object        support's view: customerId, display name
```

### rule-of-the-business-never-lifts-to-the-kernel · SHOULD

No domain service, and no expected failure a rule of the business raises, lifts to the kernel. A rule several features need stays in the feature whose language owns it, which the others ask through ports of their own, or, where it spans them, lives in the domain model of the composition module that combines them. Exempt: a value object's checks and the failures they raise, which lift with it.

#### Why

A rule in the kernel changes every feature at once while no one feature's language decides it, and its failure lifted alone leaves the kernel naming a refusal of a rule it does not hold — shared kernel.

#### Examples

```text title="Avoid"
src/kernel/
├── services/
│   └── loyalty-discount.service      used by checkout and invoices
└── errors/
    └── discount-not-allowed.error
```

```text title="Prefer"
src/features/loyalty/domain/membership/
├── services/
│   └── loyalty-discount.service
└── errors/
    └── discount-not-allowed.error
src/features/invoices/application/contracts/
└── loyalty-discount.port             answered by loyalty in composition
```

### port-lifts-on-its-second-feature · SHOULD

Every port to an outside system lifts to the kernel's `contracts/` on its second feature, never sideways into a feature. It stays with the feature that needs it until a second feature needs it in the same words, as a clock's or a mailer's does, and one each feature words its own way stays in each.

#### Why

A port owned by one feature and used by another couples the second to the first, and one lifted before a second feature needs it in the same words guesses at a sharing that may never come.

#### Examples

```text title="Avoid"
src/
├── features/
│   ├── billing/   imports orders' port
│   └── orders/
│       └── application/contracts/
│           └── clock.port
└── kernel/
```

```text title="Prefer"
src/
├── features/
│   ├── billing/   imports the kernel's
│   └── orders/    imports the kernel's
└── kernel/
    └── contracts/
        └── clock.port
```

## Combining

### composition-holds-what-the-business-combines · MUST

Everything the business combines across features is an operation of a composition module from its first use. Its use case calls each feature's operations, and showing or handing on several features' answers together combines nothing of the business.

#### Why

A rule across features written in one screen is copied by every other interface that needs it and drifts between them.

#### Examples

```pseudo title="Avoid"
# presentation/account-summary
function AccountSummary({ customerId, listOrders, listRefunds }, context)
  let orders = listOrders({ customerId }, context)
  let refunds = listRefunds({ customerId }, context)
  let balance = sum(orders.totals) - sum(refunds.amounts)

  return Summary(balance)
```

```pseudo title="Prefer"
# composition/accounts/application/use-cases/queries/get-balance.use-case
import ListOrders from "features/orders"
import ListRefunds from "features/refunds"

function createGetBalance({ listOrders: ListOrders, listRefunds: ListRefunds })
  return function(input, context)
    let orders = listOrders({ customerId: input.customerId }, context)
    let refunds = listRefunds({ customerId: input.customerId }, context)

    return balance(orders, refunds)

# composition/accounts/presentation/bindings/queries/show-balance
import parseGetBalanceInput from "../../../application/use-cases"

function showBalance(customerId, getBalance, context)
  return getBalance(parseGetBalanceInput({ customerId }), context)

# presentation/account-summary
function AccountSummary(balance)
  return Summary(balance)
```

### composition-translates-through-total-tables · MUST

Every composition module translates between the features' vocabularies only through total tables it owns. One feature's status into another's and a failure of a feature it acts on into one of its own are such tables.

#### Why

A translation that is not total takes a value a feature adds into a case nobody chose.

#### Examples

```pseudo title="Avoid"
# composition/order-tracking/infrastructure/shipping/tracking.adapter
function toTrackingStatus(status: ShipmentStatus)
  switch status
    case InTransit: return TrackingStatus.OnItsWay
    case Delivered: return TrackingStatus.Arrived
    default: return TrackingStatus.Preparing
```

```pseudo title="Prefer"
# composition/order-tracking/infrastructure/shipping/tracking.adapter
let trackingStatusByShipmentStatus: Table<ShipmentStatus, TrackingStatus> = {
  Labelled: TrackingStatus.Preparing,
  InTransit: TrackingStatus.OnItsWay,
  Delivered: TrackingStatus.Arrived,
  Lost: TrackingStatus.Delayed,
}

function toTrackingStatus(status: ShipmentStatus)
  return trackingStatusByShipmentStatus[status]
```

### translation-table-kept-beside-its-translator · SHOULD

Every table by which composition translates is kept in the composition module beside the unit that translates, never in a feature. That unit is the adapter that answers an ask or the use case that calls the features.

#### Why

A translation kept in one of the features makes it know the other, and one kept away from the unit that uses it changes apart from it.

#### Examples

```text title="Avoid"
src/features/orders/domain/order/constants/
└── tracking-status-by-shipment-status.constants
src/composition/order-tracking/infrastructure/shipping/
└── tracking.adapter
```

```text title="Prefer"
src/composition/order-tracking/infrastructure/shipping/
├── tracking.adapter
└── tracking-status-by-shipment-status.constants
```

### composition-domain-holds-only-what-spans-its-features · MUST

Every composition module's domain model holds only a rule or a saga's state that spans the features it composes. A composition module may have none.

#### Why

A rule of one feature kept in composition is skipped by that feature's own use cases, and grows a second model of the feature beside its own.

#### Examples

```text title="Avoid"
src/composition/checkout/domain/
├── checkout-saga/
└── order/
    └── services/
        └── order-cancellation.service    a rule of orders alone
```

```text title="Prefer"
src/composition/checkout/domain/
└── checkout-saga/
src/features/orders/domain/order/
└── transitions/
    └── order.transitions                 cancel lives here
```

### composition-keeps-to-its-side · MUST

Every use case of a composition module keeps to its side. A query calls only the queries of the features it composes, and a command calls their commands and the queries it needs, whose answers may lag. Exempt: a composition query, which may also read its own saga's state through a port of its composition module's own read side.

#### Why

A composition query that calls a command can change what it only meant to read — command–query responsibility segregation.

#### Examples

```pseudo title="Avoid"
# composition/accounts/application/use-cases/queries/get-balance.use-case
function createGetBalance({ listOrders, listRefunds, recordBalanceViewed })
  return function(input, context)
    call recordBalanceViewed({ customerId: input.customerId }, context)
    let orders = call listOrders({ customerId: input.customerId }, context)
    let refunds = call listRefunds({ customerId: input.customerId }, context)

    return Balance.of(orders, refunds)
```

```pseudo title="Prefer"
# composition/accounts/application/use-cases/queries/get-balance.use-case
function createGetBalance({ listOrders, listRefunds })
  return function(input, context)
    let orders = call listOrders({ customerId: input.customerId }, context)
    let refunds = call listRefunds({ customerId: input.customerId }, context)

    return Balance.of(orders, refunds)
```

### rule-that-holds-at-the-change-decided-by-its-feature · MUST

Every rule that has to hold at the moment of a change is decided by one command: that of the feature making the change. A composition command never decides it on the lagging queries it read.

#### Why

A rule decided on a lagging read across features lets a change through that the feature making it would refuse — command–query responsibility segregation.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/reserve-for-order.use-case
let stock = call findStock({ sku: input.sku }, context)

if stock.available < input.quantity then
  throw new OutOfStockError({ sku: input.sku })

call reserveStock({ reservationId: input.reservationId, sku: input.sku, quantity: input.quantity }, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/reserve-for-order.use-case
call reserveStock({ reservationId: input.reservationId, sku: input.sku, quantity: input.quantity }, context)

# inventory/domain/stock/transitions/stock.transitions
function reserve(stock, { reservationId, quantity })
  if stock.available < quantity then
    throw new OutOfStockError({ sku: stock.sku })
  ...
```

## Sagas

### saga-state-kept-in-the-programs-store · MUST

Every saga's state outlives its program's stop, never kept in memory alone.

#### Why

A saga whose state lives only in memory stops half done with its program, with no record of which steps landed or how to undo them — the saga pattern, and a process manager.

#### Examples

```pseudo title="Avoid"
# composition/checkout/infrastructure/memory/checkout-saga-repository.adapter
let sagas = new Map()

function save(saga, events, context)
  sagas.set(saga.id, saga)
```

```pseudo title="Prefer"
# composition/checkout/infrastructure/database/checkout-saga-repository.adapter
function save(saga, events, context)
  call client.transaction(function(tx)
    call tx.upsert(CheckoutSagaSchema, toRow(saga))
    call tx.insertAll(OutboxSchema, events.map(toOutboxRow))
  , context)
```

### saga-state-held-by-an-aggregate-of-its-module · MUST

Every saga's state is the state of an aggregate in its composition module's domain model. It holds the phase of each step and compensation, whether its outcome is unknown, the attempts made, each with the kind of outcome recorded for it, the time of the next, and the saga's deadline. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

A saga's state kept beside its aggregate changes through no transition, so no precondition guards its record and no event of that record makes its next call due — a process manager.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
call charge({ paymentKey: input.chargeKey, amount: input.total }, context)
call sagaTable.update(input.checkoutId, { chargeStatus: "done" }, context)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/entities/checkout-saga.aggregate
type CheckoutSaga = {
  id: CheckoutId,
  reserveStock: StepRecord,
  charge: StepRecord,
  sendReceipt: StepRecord,
  releaseStock: StepRecord,
  deadline: Instant,
  version: AggregateVersion,
}

type StepRecord = {
  phase: Phase,
  isOutcomeUnknown: Boolean,
  attempts: List<Attempt>,
  nextAttemptAt: Instant | <absent>,
}
```

### saga-advances-by-reactions · MUST

Every saga calls its participants only from reactions to its own events, each making the one call its event made due. The command that starts it, its schedule and its operator never call a participant. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

A saga driven by one long call stops with the program that ran it and is resumed by nothing, while one moved by reactions to its own events picks up from its saved state at the next of them — a process manager.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/start-checkout.use-case
call reserveStock({ reservationId: input.reservationId, lines: input.lines }, context)
call charge({ paymentKey: input.paymentKey, amount: input.total }, context)
call sendReceipt({ receiptId: input.receiptId, orderId: input.orderId }, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/start-checkout.use-case
let { saga, events } = CheckoutSaga.start(input)
call checkoutSagaRepository.save(saga, events, context)

# composition/checkout/application/use-cases/commands/reserve-stock-for-checkout.use-case
function createReserveStockForCheckout({ reserveStock, checkoutSagaRepository, clock })
  return function(event: StockReservationDue, context)
    let saga = call checkoutSagaRepository.find(event.checkoutId, context)
    let outcome = call attempt(reserveStock,
      { reservationId: event.reservationId, lines: event.lines }, context)
    let recorded = CheckoutSaga.recordStockOutcome(saga, event.attempt, outcome, clock.now())

    call checkoutSagaRepository.save(recorded.saga, recorded.events, context)
```

### saga-call-made-due-by-its-transitions-event · MUST

Every transition of a saga's aggregate after which a call is to run makes that call due by the event it yields. Such transitions are its start, the record of an outcome, those its schedule makes, its stop among them, and its operator's revival and give-up. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

A saga that waits for a participant's event to go on stalls on a repeat or on a call that changed nothing, which yield none, while the event of its own record is kept with that record and makes no call due before it — a process manager.

#### Examples

```pseudo title="Avoid"
# composition/checkout/presentation/bindings/commands/charge-for-checkout
subscribe(StockReserved, function(event, context)
  call chargeForCheckout(parseChargeForCheckoutInput(event), context))
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordStockReserved(saga, now)
  let reserved = landStep(saga, ReserveStock)

  return {
    saga: makeDue(reserved, Charge, now),
    event: ChargeDue({ checkoutId: saga.id, attempt: 1 }),
  }
```

### step-outcome-recorded-by-the-reaction-that-called-it · MUST

Every outcome of a saga's call is recorded in its aggregate, for that call, by the reaction that made it, never raised. It is recorded in the composition module's own values as its kind of outcome, with the phase it moves its step or compensation into, spent where it spends it, and the time of the next attempt after a failed attempt that spends nothing; it is marked unknown where the call had no answer, and no participant's event records it. Exempt: a defect, which passes the reaction unrecorded, as `defect-of-a-saga-call-left-to-its-edge-worker` gives, a late or repeated outcome, which changes nothing, as `late-outcome-changes-nothing` gives, every outcome of a call whose answer says its outside system gives the outcome later, as `later-outcome-recorded-by-a-composition-command` gives, and a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

An outcome the reaction raises or only logs leaves the saga waiting for a step that will never be recorded, and one a participant's event records is never recorded when the call yields none — the saga pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
return function(event: ChargeDue, context)
  call charge({ paymentKey: event.paymentKey, amount: event.total }, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
return function(event: ChargeDue, context)
  let saga = call checkoutSagaRepository.find(event.checkoutId, context)
  let outcome = call attempt(charge, { paymentKey: event.paymentKey, amount: event.total }, context)
  let recorded = CheckoutSaga.recordChargeOutcome(saga, event.attempt, outcome, clock.now())

  call checkoutSagaRepository.save(recorded.saga, recorded.events, context)

function attempt(command, input, context)
  try
    call command(input, context)
    return Outcome.Landed
  catch error as CardDeclinedError
    return Outcome.Refused({ code: error.code })
  catch error as TransientError
    return Outcome.FailedAttempt({ isAnswerMissing: error is TimeoutError })
```

### later-outcome-recorded-by-a-composition-command · MUST

Wherever a saga's call answers that its outcome comes later, a command of its composition module records every such outcome. It records it in the saga's aggregate once it arrives, in a message of its own or in answer to a read of it, as its kind of outcome, with the phase it moves its step or compensation into, spent where it spends it, and the time of the next attempt after a failed attempt that spends nothing. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

An outcome that comes later and that nothing records leaves the saga waiting for a step that has long landed or failed, and one recorded by a unit outside the composition module, or without its kind and its phase, leaves the saga's record to code that knows nothing of its steps — the saga pattern.

#### Examples

```pseudo title="Avoid"
# payments/presentation/bindings/commands/on-provider-notice
function onProviderNotice(request, context)
  let notice = parseProviderNotice(request.body)
  call sagaTable.update(notice.checkoutId, { chargePhase: "landed" }, context)
```

```pseudo title="Prefer"
# composition/checkout/presentation/bindings/commands/record-charge-notice
function onChargeSettled(event: ChargeSettled, recordChargeNotice, context)
  let input = parseRecordChargeNoticeInput(event)
  call recordChargeNotice(input, context)

# composition/checkout/application/use-cases/commands/record-charge-notice.use-case
return function(input, context)
  let saga = call checkoutSagaRepository.find(input.checkoutId, context)
  let recorded = CheckoutSaga.recordChargeOutcome(saga, input.attempt, input.outcome, clock.now())

  call checkoutSagaRepository.save(recorded.saga, recorded.events, context)
```

### defect-of-a-saga-call-left-to-its-edge-worker · MUST

Every defect of a saga's call passes its reaction unrecorded; its step or compensation stays pending while its edge worker holds the event. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

A reaction that catches a defect to record it handles a failure it does not understand and claims to know what became of the call, while a defect let pass leaves the step pending and its event held for the operator, who alone can fix what no retry clears.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
function attempt(command, input, context)
  try
    call command(input, context)
    return Outcome.Landed
  catch error
    return Outcome.Refused({ code: "unexpected" })
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
function attempt(command, input, context)
  try
    call command(input, context)
    return Outcome.Landed
  catch error as CardDeclinedError
    return Outcome.Refused({ code: error.code })
  catch error as TransientError
    return Outcome.FailedAttempt({ isAnswerMissing: error is TimeoutError })
```

### saga-resumed-by-a-schedule · MUST

Every unfinished saga is moved on a schedule when its next attempt's time comes or its deadline passes. Its deadline moves it only while its pivot has not landed and it is not cut short, and a scheduled delivery unit of its composition module calls the command that records the move by a transition. Exempt: a saga a durable-execution engine runs, which keeps its state and its compensations itself.

#### Why

A saga whose step waits for another attempt, or whose pivot never lands, stays half done unless something wakes it on a schedule, while a saga finished or already rewinding has nothing left for its schedule to move — a process manager.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
if outcome is FailedAttempt then
  sleep(backoff(event.attempt))
  call chargeForCheckout(event with { attempt: event.attempt + 1 }, context)
```

```pseudo title="Prefer"
# composition/checkout/presentation/bindings/commands/resume-due-checkouts
schedule("resume-checkouts", { every: RESUME_INTERVAL, overlapping: skip },
  function(tick, context)
    call resumeDueCheckouts(parseResumeDueCheckoutsInput({ now: tick }), context))

# composition/checkout/application/use-cases/commands/resume-due-checkouts.use-case
for saga in call checkoutSagaRepository.listDue(input.now, { limit: BATCH_SIZE }, context)
  let resumed = CheckoutSaga.resume(saga, input.now)
  call checkoutSagaRepository.save(resumed.saga, resumed.events, context)
```

### finished-saga-left-as-it-is-by-its-schedule · MUST

Every finished saga its schedule's command meets is left as it is: the command yields no event and raises no failure.

#### Why

The schedule finds its sagas through a read that may lag, so its command meets sagas that finished since, and a failure raised for each is a false alarm on every run that teaches the operator to pass over the schedule's real ones.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function resume(saga, now)
  if CheckoutSaga.isFinished(saga) then
    throw new CheckoutAlreadyFinishedError({ checkoutId: saga.id })

  return makeNextAttemptDue(saga, now)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function resume(saga, now)
  if CheckoutSaga.isFinished(saga) then
    return { saga, events: [] }

  return makeNextAttemptDue(saga, now)
```

### stopped-saga-makes-no-planned-step-due · MUST

Every deadline-stopped saga makes no planned step due. It still makes due another attempt at a step already pending and a step its operator revives, beside the compensations it makes due once cut short.

#### Why

A saga that goes on past its deadline makes the business wait for an outcome it no longer wants, while a step already pending still runs to an outcome and a spent one still awaits its operator, so a call that may have landed is never cut off unrecorded — a process manager.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordStockReserved(saga, now)
  let reserved = landStep(saga, ReserveStock)
  return makeDue(reserved, Charge, now)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordStockReserved(saga, now)
  let reserved = landStep(saga, ReserveStock)

  if CheckoutSaga.isDeadlineStopped(reserved, now) then
    return rewindIfCutShort(reserved, now)

  return makeDue(reserved, Charge, now)
```

### saga-rewinds-only-once-cut-short · MUST

Every saga rewinds only once it is cut short. It never rewinds on a failure it may still retry, nor on one whose retries are spent.

#### Why

A rewind on a failure a retry may still clear undoes steps a second attempt would have completed, and one on spent retries undoes steps its operator could still have completed by reviving the spent one — the saga pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeFailedAttempt(saga, now)
  return makeDue(saga, ReleaseStock, now)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeFailedAttempt(saga, now)
  if CheckoutSaga.hasRetryLeft(saga, Charge) then
    return makeDue(saga, Charge, now + backoff(saga.charge.attempts.size))

  return spend(saga, Charge)

function recordChargeRefused(saga, now)
  return makeDue(refuse(saga, Charge), ReleaseStock, now)
```

### cut-short-saga-makes-only-compensations-due · MUST

Every saga cut short makes only its compensations due, never a step.

#### Why

A saga that makes a step due once cut short runs forward what it is undoing, as a seat held again for an order whose charge was declined — the saga pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeRefused(saga, now)
  let refused = refuse(saga, Charge)
  return makeDue(makeDue(refused, ReleaseStock, now), SendReceipt, now)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeRefused(saga, now)
  let refused = refuse(saga, Charge)
  return makeDue(refused, ReleaseStock, now)
```

### cut-short-saga-compensates-every-step-that-may-have-landed · MUST

Every saga cut short compensates each of its compensable steps that may have landed.

#### Why

A saga that undoes only some of its landed steps when it is cut short leaves a seat held or an amount charged for an order that will never be placed, and one that skips a step of unknown outcome leaves it so whenever its lost answer had landed — the saga pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function stepsToCompensate(saga)
  return COMPENSABLE_STEPS.filter(step -> saga[step].phase is Landed)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function stepsToCompensate(saga)
  return COMPENSABLE_STEPS.filter(step ->
    saga[step].phase is Landed or saga[step].isOutcomeUnknown)
```

### saga-compensates-only-compensable-steps-that-may-have-landed · MUST

Every saga compensates only its compensable steps that may have landed. It never compensates its pivot, one given up with its outcome unknown included, a retryable step, a refused step or a step still planned.

#### Why

A saga that undoes its pivot or a step after it undoes what the business already counts as done, a pivot whose answer was lost among them, and one that undoes a step refused or never called undoes what another call did — the saga pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function stepsToCompensate(saga)
  return ALL_STEPS.filter(step -> saga[step].phase is not Planned)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function stepsToCompensate(saga)
  return COMPENSABLE_STEPS.filter(step ->
    saga[step].phase is Landed or saga[step].isOutcomeUnknown)
```

### retryable-step-run-until-it-lands · MUST

Every saga whose pivot landed runs each retryable step until it lands or its operator gives it up; it never gives one up itself.

#### Why

A saga that gives up a retryable step leaves undone what the business counts as owed once the pivot landed, as a receipt for a charge that went through or the keys for a lease that was signed — the saga pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordReceiptFailedAttempt(saga, now)
  if not CheckoutSaga.hasRetryLeft(saga, SendReceipt) then
    return giveUp(saga, SendReceipt)

  return makeDue(saga, SendReceipt, now + backoff(saga.sendReceipt.attempts.size))
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordReceiptFailedAttempt(saga, now)
  if not CheckoutSaga.hasRetryLeft(saga, SendReceipt) then
    return spend(saga, SendReceipt)

  return makeDue(saga, SendReceipt, now + backoff(saga.sendReceipt.attempts.size))
```

### saga-alone-retries-its-steps · MUST

Every step and compensation of a saga is retried by the saga alone. Neither the participant nor the adapter beneath it retries it again, and a write the participant loses to a concurrent one reaches the saga as a failed attempt. Exempt: an edge worker handing a saga's reaction its event again after a failure of the reaction's own that a later run may not meet again, which repeats the same attempt, as `saga-event-makes-one-attempt` gives.

#### Why

A retry beneath the saga multiplies the saga's own attempts and hides from its state how often a step was tried, so its limit no longer holds, while a repeated attempt retries only the reaction's own failure, which the reaction never shares with its step.

#### Examples

```pseudo title="Avoid"
# payments/infrastructure/payment-provider/payment.adapter
function charge(payment, context)
  retry up to 3 times on transient failure
    call client.charge(toCharge(payment), context)
```

```pseudo title="Prefer"
# payments/infrastructure/payment-provider/payment.adapter
function charge(payment, context)
  call client.charge(toCharge(payment), context)

# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeFailedAttempt(saga, now)
  if CheckoutSaga.hasRetryLeft(saga, Charge) then
    return makeDue(saga, Charge, now + backoff(saga.charge.attempts.size))

  return spend(saga, Charge)
```

### saga-event-makes-one-attempt · MUST

Every event by which a saga makes a call due makes one attempt at that call: the same event handed on again repeats that attempt and counts as no other.

#### Why

An event handed on again after a lost acknowledgement or the reaction's own failure, counted as a new attempt, spends the limit the saga sets on attempts no participant needed, so a step is spent before it was tried as often as its limit allows.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeOutcome(saga, outcome, now)
  let attempt = saga.charge.attempts.size + 1
  return addAttempt(saga, Charge, attempt, outcome, now)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeOutcome(saga, attempt, outcome, now)
  if CheckoutSaga.hasAttempt(saga, Charge, attempt) then
    return { saga, events: [] }

  return addAttempt(saga, Charge, attempt, outcome, now)
```

### unknown-outcome-resolved-by-a-retry-under-its-identifiers · MUST

Every saga resolves a step of unknown outcome by retrying it under the identifiers it derived for that step. It neither asks the participant apart nor mints a new identifier, and the participant meets the retry as a repeat, which changes nothing once the first call took effect, as `repeated-start-changes-nothing` gives for a start and `repeated-move-changes-nothing` for an aggregate move.

#### Why

A retry under a new identifier charges or books a second time when the first attempt landed, and a separate question to the participant adds a second path that can disagree with the retry — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
return function(event: ChargeDue, context)
  if event.isOutcomeUnknown then
    let found = call findCharge({ paymentKey: event.paymentKey }, context)
    if found is not <absent> then
      return call recordChargeLanded(event, context)

  call charge({ paymentKey: createIdempotencyKey(), amount: event.total }, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
return function(event: ChargeDue, context)
  let outcome = call attempt(charge, { paymentKey: event.paymentKey, amount: event.total }, context)
  call recordChargeOutcome(event, outcome, context)
```

### lagging-absence-met-by-a-reaction-is-transient · MUST

Every absence a reaction meets in a read that may lag is a transient failure, never a call refusal. A saga's reaction records it as a failed attempt.

#### Why

A read that lags may not yet show what an earlier change wrote, so an absence taken as a refusal spends a reaction, or cuts short a saga, that a later attempt would have completed.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/send-receipt-for-checkout.use-case
let order = call findOrder({ orderId: event.orderId }, context)

if order is <absent> then
  return call recordReceiptOutcome(event, Outcome.Refused({ code: "order-not-found" }), context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/send-receipt-for-checkout.use-case
let order = call findOrder({ orderId: event.orderId }, context)

if order is <absent> then
  return call recordReceiptOutcome(event, Outcome.FailedAttempt({ isAnswerMissing: false }), context)
```

### spent-step-held-for-its-operator · MUST

Every spent step, compensation or reaction is held until its operator revives it or gives it up, never dropped or retried meanwhile. A saga holds a spent step or compensation in its state until its operator's command of the composition module revives it, its attempts counted afresh, or gives it up, as that command also gives up a pending step or compensation whose event its edge worker holds; a reaction is held as its event still unhandled — kept by its edge worker where the program stores the change, and otherwise carried whole in the fault reporter's report of it — until its operator hands it on again or gives it up.

#### Why

A step dropped once its retries ran out leaves the saga or the reaction looking finished while part of it never happened, and one retried on its own repeats a failure no retry clears, since only an operator can decide what retries could not.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function spend(saga, step)
  return giveUp(saga, step)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function spend(saga, step)
  return withPhase(saga, step, Spent)

function revive(saga, step, now)
  if saga[step].phase is not Spent then
    throw new StepNotSpentError({ checkoutId: saga.id, step })

  return makeDue(resetAttempts(saga, step), step, now)
```

### pending-step-given-up-with-its-held-event · MUST

Every give-up of a pending step or compensation whose event its edge worker holds also gives up that event: its operator's one command gives up both the step and the event.

#### Why

The held event holds back every later event of its saga, the give-up's own among them, so a give-up that leaves it held never makes due the compensations it calls for.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/give-up-step.use-case
return function(input, context)
  let saga = call checkoutSagaRepository.find(input.checkoutId, context)
  let given = CheckoutSaga.giveUp(saga, input.step)

  call checkoutSagaRepository.save(given.saga, given.events, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/give-up-step.use-case
return function(input, context)
  let saga = call checkoutSagaRepository.find(input.checkoutId, context)
  let given = CheckoutSaga.giveUp(saga, input.step)

  call checkoutSagaRepository.saveGivingUpHeld(given.saga, given.events, {
    heldEventOf: { checkoutId: input.checkoutId, step: input.step },
  }, context)
```

### spent-step-reported-through-the-fault-reporter · MUST

Every saga step, compensation or reaction whose retries are spent is reported to the operator through the fault reporter. It is reported by the unit that finds it spent: for a saga's step or compensation, the reaction whose record spends it; for a reaction, the edge worker that holds its event or, for an unstored change, the use case that hands its event on.

#### Why

A held step no one is told of waits for ever, since only an operator can decide what retries could not.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
let recorded = CheckoutSaga.recordChargeOutcome(saga, event.attempt, outcome, clock.now())
call checkoutSagaRepository.save(recorded.saga, recorded.events, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/charge-for-checkout.use-case
let recorded = CheckoutSaga.recordChargeOutcome(saga, event.attempt, outcome, clock.now())
call checkoutSagaRepository.save(recorded.saga, recorded.events, context)

if CheckoutSaga.isSpent(recorded.saga, Charge) then
  faultReporter.report(StepSpent({ checkoutId: saga.id, step: Charge, lastOutcome: outcome }))
```

### late-outcome-changes-nothing · MUST

Every late or repeated outcome leaves its saga's state as it is, yields no event and raises no failure. It never spends its reaction or holds back the events behind it.

#### Why

A late outcome taken as news undoes a decision its saga already acted on, as a charge or a booking recorded as landed after its step was given up and compensated, a repeated one taken as news makes the next call due a second time, and either raised as a failure holds every later event of its saga for an operator.

#### Examples

```pseudo title="Avoid"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeOutcome(saga, attempt, outcome, now)
  return settleCharge(saga, attempt, outcome, now)
```

```pseudo title="Prefer"
# composition/checkout/domain/checkout-saga/transitions/checkout-saga.transitions
function recordChargeOutcome(saga, attempt, outcome, now)
  if CheckoutSaga.isSettled(saga, Charge, attempt) then
    return { saga, events: [] }

  return settleCharge(saga, attempt, outcome, now)
```

### late-outcome-reported-through-the-fault-reporter · MUST

Every late outcome is reported to the operator through the fault reporter. A landing of a pivot its operator gave up is such an outcome.

#### Why

A late landing passed over in silence leaves standing what the saga's decision never foresaw, as a charge that went through or a seat booked after its step was given up, which only an operator can set right.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/record-charge-notice.use-case
if CheckoutSaga.isLateOutcome(saga, Charge, input.attempt, input.outcome) then
  return
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/record-charge-notice.use-case
if CheckoutSaga.isLateOutcome(saga, Charge, input.attempt, input.outcome) then
  faultReporter.report(LateOutcome({
    checkoutId: saga.id,
    step: Charge,
    recorded: saga.charge.phase,
    arrived: input.outcome,
  }))
  return
```

### repeated-outcome-never-reported · MUST

No repeated outcome is reported to the operator through the fault reporter.

#### Why

A repeated outcome comes back whenever an acknowledgement is lost after its record, so a report of it is a false alarm each time, and an operator taught to pass over such alarms misses the late outcome that needs them.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/record-charge-notice.use-case
if CheckoutSaga.isSettled(saga, Charge, input.attempt) then
  faultReporter.report(LateOutcome({ checkoutId: saga.id, step: Charge, arrived: input.outcome }))
  return
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/record-charge-notice.use-case
if CheckoutSaga.isRepeatedOutcome(saga, Charge, input.attempt, input.outcome) then
  return

if CheckoutSaga.isLateOutcome(saga, Charge, input.attempt, input.outcome) then
  faultReporter.report(LateOutcome({ checkoutId: saga.id, step: Charge, arrived: input.outcome }))
  return
```

### compensation-is-a-command-of-the-feature-it-undoes · MUST

Every compensation is a command of the feature whose step it undoes.

#### Why

An undo written in the composition module reaches past the feature's use cases and transitions, so the feature's rules no longer hold for it — the compensating transaction pattern.

#### Examples

```pseudo title="Avoid"
# composition/checkout/application/use-cases/commands/release-stock-for-checkout.use-case
return function(event: StockReleaseDue, context)
  call stockTable.increment(event.sku, event.quantity, context)
```

```pseudo title="Prefer"
# composition/checkout/application/use-cases/commands/release-stock-for-checkout.use-case
import { releaseStock } from "features/inventory"

return function(event: StockReleaseDue, context)
  let outcome = call attempt(releaseStock, { reservationId: event.reservationId }, context)
  call recordReleaseOutcome(event, outcome, context)
```

### compensations-run-from-the-latest-step-back · MUST

Every saga makes its compensations due in the reverse order of the steps they undo, the latest step's first.

#### Why

Compensations run out of order undo a step while a later one that relies on it still stands, as a seat freed for another buyer while the charge for it stands — the compensating transaction pattern.

#### Examples

```pseudo title="Avoid"
# composition/booking/domain/trip-saga/transitions/trip-saga.transitions
const COMPENSATIONS = [CancelFlight, CancelHotel, CancelCar]
```

```pseudo title="Prefer"
# composition/booking/domain/trip-saga/transitions/trip-saga.transitions
const STEPS = [BookFlight, BookHotel, BookCar]
const COMPENSATIONS = [CancelCar, CancelHotel, CancelFlight]
```

### compensations-run-one-at-a-time · MUST

Every saga runs its compensations one at a time: it makes each due only once the one made due before it has landed or is given up.

#### Why

Compensations run together undo an earlier step while the compensation of a later one may still fail, leaving that later step standing on what was undone — the compensating transaction pattern.

#### Examples

```pseudo title="Avoid"
# composition/booking/domain/trip-saga/transitions/trip-saga.transitions
function rewind(saga, now)
  return COMPENSATIONS
    .filter(compensation -> TripSaga.isOwed(saga, compensation))
    .reduce((rewound, compensation) -> makeDue(rewound, compensation, now), saga)
```

```pseudo title="Prefer"
# composition/booking/domain/trip-saga/transitions/trip-saga.transitions
function rewind(saga, now)
  let next = COMPENSATIONS.find(compensation -> TripSaga.isOwed(saga, compensation))

  if next is <absent> then
    return markRewound(saga)

  return makeDue(saga, next, now)
```

### compensation-safe-to-run-again · MUST

Every compensation is safe to run again: a second run after a lost answer undoes nothing twice. It is the case of `operation-idempotent-by-design` that a saga cannot leave.

#### Why

A compensation that is not safe to run again undoes twice when a retry follows a lost answer — the compensating transaction pattern.

#### Examples

```pseudo title="Avoid"
# inventory/domain/stock/transitions/stock.transitions
function release(stock, { reservationId })
  let reservation = stock.reservations[reservationId]
  return { ...stock, available: stock.available + reservation.quantity }
```

```pseudo title="Prefer"
# inventory/domain/stock/transitions/stock.transitions
function release(stock, { reservationId })
  let reservation = stock.reservations[reservationId]

  if reservation.isReleased then
    return stock

  return {
    ...stock,
    available: stock.available + reservation.quantity,
    reservations: { ...stock.reservations, [reservationId]: { ...reservation, isReleased: true } },
  }
```

### compensation-of-an-unlanded-step-changes-nothing · MUST

Every compensation run for a step that never landed changes nothing and raises no failure, so it lands.

#### Why

A saga compensates a step of unknown outcome whether or not its lost answer had landed, so a compensation that fails where there is nothing to undo holds the rewind for an operator over a step that never happened.

#### Examples

```pseudo title="Avoid"
# inventory/domain/stock/transitions/stock.transitions
function release(stock, { reservationId })
  let reservation = stock.reservations[reservationId]

  if reservation is <absent> then
    throw new ReservationNotFoundError({ reservationId })
  ...
```

```pseudo title="Prefer"
# inventory/domain/stock/transitions/stock.transitions
function release(stock, { reservationId })
  let reservation = stock.reservations[reservationId]

  if reservation is <absent> then
    return stock
  ...
```

## Reacting

### feature-reacts-to-another-only-through-composition · SHOULD

Every feature reacts to another feature's events only through composition, and never subscribes to them. The reaction is a use case of a composition module, which reaches the one feature's events and calls the other's operation through their surfaces; a feature's reaction to its own event stays in the feature.

#### Why

A feature that subscribes to another depends on it as much as on an import, and a chain of reactions spread through the features is one no reader can follow from one place — orchestration, in the stricter form that lets no feature subscribe to another's events.

#### Examples

```pseudo title="Avoid"
# shipping/application/use-cases/commands/ship-paid-order.use-case
function createShipPaidOrder({ shipmentRepository })
  return function(event: { orderId: OrderId }, context)
    let shipment = Shipment.schedule(ShipmentId.fromOrder(event.orderId), event.orderId)

    call shipmentRepository.save(shipment, context)

# root/subscriptions
dispatcher.subscribe(OrderPaid, shipPaidOrder)
```

```pseudo title="Prefer"
# composition/paid-order-shipping/application/use-cases/commands/ship-paid-order.use-case
import { OrderPaid } from "features/billing"
import { ScheduleShipment } from "features/shipping"

function createShipPaidOrder({ scheduleShipment }: { scheduleShipment: ScheduleShipment })
  return function(event: OrderPaid, context)
    let input = { shipmentId: ShipmentId.fromOrder(event.orderId), orderId: event.orderId }

    call scheduleShipment(input, context)

# root/subscriptions
dispatcher.subscribe(OrderPaid, shipPaidOrder)
```

### reaction-derives-every-identifier-from-its-event · MUST

Every identifier a reaction passes on is the event's or derived from it, never minted anew.

#### Why

A reaction that mints identifiers of its own starts something new on each delivery of one event.

#### Examples

```pseudo title="Avoid"
# composition/order-shipping/application/use-cases/commands/ship-paid-order.use-case
return function(event: OrderPaid, context)
  let shipmentId = ShipmentId.create(randomUuid())
  call scheduleShipment({ shipmentId, orderId: event.orderId }, context)
```

```pseudo title="Prefer"
# composition/order-shipping/application/use-cases/commands/ship-paid-order.use-case
return function(event: OrderPaid, context)
  let shipmentId = ShipmentId.fromOrder(event.orderId)
  call scheduleShipment({ shipmentId, orderId: event.orderId }, context)
```

### reaction-safe-to-run-again · MUST

Every reaction is safe to run again: a second delivery of its event repeats none of its effects. A composition module's reaction and a feature's reaction to its own event are held alike. It is the case of `operation-idempotent-by-design` that an event handed on at least once cannot leave.

#### Why

An event is handed on at least once, so a reaction that is not safe to run again charges, sends or creates a second time when its event arrives twice — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# loyalty/application/use-cases/commands/award-points-for-order.use-case
return function(event: OrderPaid, context)
  let account = call loyaltyRepository.find(event.customerId, context)
  let awarded = LoyaltyAccount.add(account, Points.of(event.total))

  call loyaltyRepository.save(awarded, context)
```

```pseudo title="Prefer"
# loyalty/application/use-cases/commands/award-points-for-order.use-case
return function(event: OrderPaid, context)
  let account = call loyaltyRepository.find(event.customerId, context)
  let awarded = LoyaltyAccount.award(account, { awardId: AwardId.fromOrder(event.orderId), points: Points.of(event.total) })

  call loyaltyRepository.save(awarded, context)
```
