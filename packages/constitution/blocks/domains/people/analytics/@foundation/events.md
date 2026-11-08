# Events

> Governs an analytics event: its plan, its name, when it is sent, the personal data and the address it is kept without, where it goes and how a fault of one destination is contained.

## Vocabulary

An **analytics event** is a record of something done with the product, sent to an analytics service.

The **tracking plan** declares every analytics event the product sends, with its typed parameters and its meaning.

## Plan

### tracking-plan-is-the-one-vocabulary → fact-has-one-source · MUST

Every analytics event is declared in the tracking plan alone.

#### Why

An event declared in two places drifts, so the plan and the code each count a different set — a single source of truth.

#### Examples

```pseudo title="Avoid"
# tracking-plan
event order_placed { order_id: Identifier, payment_method: PaymentMethod }

# orders/presentation/bindings/commands/place-order
type OrderPlaced = { name: "order_placed", order_id: String, payment: String }  # a second declaration
```

```pseudo title="Prefer"
# tracking-plan
event order_placed { order_id: Identifier, payment_method: PaymentMethod }

# orders/presentation/bindings/commands/place-order
import orderPlaced from "tracking-plan"

function onPlaceOrder(request, { placeOrder, analytics }, context)
  let input = parsePlaceOrderInput(request.body)
  let orderId = placeOrder(input, context)

  call analytics.send(orderPlaced({ order_id: orderId, payment_method: input.paymentMethod }))

  return created(orderId)
```

### code-sends-only-planned-events · MUST

Every analytics event the code sends is one the tracking plan declares.

#### Why

A mistyped name sent past the plan lands in a row nobody reads, so the event it meant reads zero in every report.

#### Examples

```pseudo title="Avoid"
# kernel/contracts/analytics.port
type AnalyticsPort = {
  send: function(name: String, parameters: Map<String, Value>)
}

# orders/presentation/bindings/commands/place-order
call analytics.send("order_placd", { order_id: orderId })  # in no plan
```

```pseudo title="Prefer"
# kernel/contracts/analytics.port
import AnalyticsEvent from "tracking-plan"

type AnalyticsPort = {
  send: function(event: AnalyticsEvent)
}

# orders/presentation/bindings/commands/place-order
call analytics.send(orderPlaced({ order_id: orderId }))
```

### event-text-parameter-from-a-closed-set · MUST

Every text parameter of an analytics event that is no identifier takes its value from a set the tracking plan declares. It never takes a free value.

#### Why

A free value splits one answer into many rows, so no report can count it as one.

#### Examples

```pseudo title="Avoid"
# tracking-plan
event checkout_abandoned {
  cart_id: Identifier,
  reason: String  # whatever the person typed
}
```

```pseudo title="Prefer"
# tracking-plan
type AbandonReason = "price" | "shipping_cost" | "payment_refused" | "other"

event checkout_abandoned {
  cart_id: Identifier,
  reason: AbandonReason
}
```

## Names

### event-names-object-action → event-name-in-past-tense · SHOULD

Every analytics event is named by its object and the action done to it.

#### Why

Names built each their own way make the vocabulary unpredictable, so one action is tracked under two names and a report reads only one of them.

#### Examples

```pseudo title="Avoid"
# tracking-plan
event clicked_buy { cart_id: Identifier }
event new_order { order_id: Identifier }
event refund { order_id: Identifier }
```

```pseudo title="Prefer"
# tracking-plan
event checkout_started { cart_id: Identifier }
event order_placed { order_id: Identifier }
event refund_requested { order_id: Identifier }
```

### event-parameters-named-in-its-case · SHOULD

Every parameter of an analytics event is named in the case of its event's name.

#### Why

A parameter named in another case than its event is mistyped by every reader who guesses it from the name, and reads empty in the report.

#### Examples

```pseudo title="Avoid"
# tracking-plan
event order_placed {
  orderId: Identifier,
  paymentMethod: PaymentMethod
}
```

```pseudo title="Prefer"
# tracking-plan
event order_placed {
  order_id: Identifier,
  payment_method: PaymentMethod
}
```

### event-never-renamed · MUST

No analytics event, once sent, is renamed.

#### Why

A renamed event breaks every report that spans the change.

#### Examples

```pseudo title="Avoid"
# tracking-plan
event order_submitted { order_id: Identifier }  # sent until today as order_placed
  meaning: "a person submitted an order"
```

```pseudo title="Prefer"
# tracking-plan
event order_placed { order_id: Identifier }
  meaning: "a person submitted an order"
```

### event-meaning-changed-only-by-a-new-event · MUST

Every change of an analytics event's meaning makes a new event, and the old one is retired. That holds for a change that leaves its name and parameters as they are.

#### Why

An event redefined under its old name breaks every report that spans the change, which goes on adding two meanings as one.

#### Examples

```pseudo title="Avoid"
# tracking-plan
event order_placed { order_id: Identifier }
  meaning: "a person's payment for an order was captured"  # until today: "submitted"
```

```pseudo title="Prefer"
# tracking-plan
event order_placed { order_id: Identifier }
  meaning: "a person submitted an order"
  retired: 2026-11-08

event order_paid { order_id: Identifier }
  meaning: "a person's payment for an order was captured"
```

## Sending

### event-sent-once-per-occurrence → operation-idempotent-by-design · MUST

Every analytics event is sent once per occurrence of what it records. A screen that redraws, a request that retries or a handler that runs twice sends it no second time.

#### Why

An event sent twice doubles its measure, and nobody can tell afterwards which half is real.

#### Examples

```pseudo title="Avoid"
# payments/presentation/bindings/events/payment-captured
function onPaymentCaptured(message, { recordPayment, analytics }, context)
  call recordPayment(parseRecordPaymentInput(message), context)
  call analytics.send(paymentCaptured({ order_id: message.orderId }))
# the provider delivers a message more than once
```

```pseudo title="Prefer"
# payments/presentation/bindings/events/payment-captured
function onPaymentCaptured(message, { recordPayment, analytics }, context)
  let outcome = recordPayment(parseRecordPaymentInput(message), context)

  if outcome is Recorded then
    call analytics.send(paymentCaptured({ order_id: message.orderId }))
```

### critical-scenario-outcome-has-an-event · SHOULD

Every outcome of each critical scenario of `PROJECT.md` has an analytics event: succeeded, abandoned, or blocked and why.

#### Why

The measures that matter are the ones the product exists for, and one nobody tracks is a decision made without its data.

#### Examples

```pseudo title="Avoid"
# tracking-plan/check-out
event order_placed { order_id: Identifier }
```

```pseudo title="Prefer"
# tracking-plan/check-out
type CheckoutStep = "address" | "shipping" | "payment"
type BlockReason = "payment_refused" | "out_of_stock" | "address_unserved"

event order_placed { order_id: Identifier }
event checkout_abandoned { cart_id: Identifier, step: CheckoutStep }
event checkout_blocked { cart_id: Identifier, reason: BlockReason }
```

## Personal data

### event-names-no-person → personal-data-kept-out-of-output · MUST

No analytics event carries personal data or content a person wrote. Such data includes a name, an email, a phone number, an address and any other identifier of a person, an account's identifier or a hash of it among them. Exempt: the analytics library's own pseudonymous identifier, and an account's identifier that the inventory lists for analytics, sent once its person gave processing consent.

#### Why

Analytics services are third parties, so personal data an event carries leaves the product's control, where no erasure the product makes reaches it, and an account's identifier joins each person's use there to the product's own records, a join only its listing and its person's processing consent let it make — data minimisation.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
call analytics.send(orderPlaced({
  order_id: orderId,
  customer: hash(customer.email)  # a hash still names the person
}))
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
call analytics.send(orderPlaced({
  order_id: orderId,
  payment_method: input.paymentMethod
}))
```

### event-stored-without-its-ip-address · MUST

Every analytics event is stored by its analytics service with the IP address it came from truncated or dropped.

#### Why

A service that keeps the address each event comes from identifies its person by it, so personal data leaks on the first event — privacy by default.

#### Examples

```pseudo title="Avoid"
# infrastructure/web-analytics/analytics-sink.adapter
function createWebAnalyticsSink(config)
  let client = createClient({ project: config.project })  # stores each request's address

  return { send: function(event) client.capture(event.name, event.parameters) }
```

```pseudo title="Prefer"
# infrastructure/web-analytics/analytics-sink.adapter
function createWebAnalyticsSink(config)
  let client = createClient({ project: config.project, storeIpAddress: false })

  return { send: function(event) client.capture(event.name, event.parameters) }
```

## Destinations

### environment-sends-to-its-own-destination · MUST

Every deployment environment sends its analytics events to its own destination or to none.

#### Why

One test run sent to production's reports is a spike nobody can take back out.

#### Examples

```pseudo title="Avoid"
# root/analytics
function createAnalyticsSinks(config)
  return [createWebAnalyticsSink({ project: "shop-production" })]  # staging and tests too
```

```pseudo title="Prefer"
# root/analytics
function createAnalyticsSinks(config)
  if config.analyticsProject is <absent> then
    return []

  return [createWebAnalyticsSink({ project: config.analyticsProject })]

# config/environments
production: { analyticsProject: "shop-production" }
staging:    { analyticsProject: "shop-staging" }
test:       { analyticsProject: <absent> }
```

## Faults

### analytics-fault-isolated → optional-part-isolated-from-its-faults · MUST

Every analytics destination is isolated from the others' faults. One that fails, or whose sending code fails, never stops the events sent to the rest.

#### Why

One broken service would otherwise blind every report, not only its own — the bulkhead pattern.

#### Examples

```pseudo title="Avoid"
# infrastructure/analytics/fan-out.adapter
function createFanOut(sinks)
  return { send: function(event)
    for each sink in sinks
      call sink.send(event)  # one failure skips the sinks after it
  }
```

```pseudo title="Prefer"
# infrastructure/analytics/fan-out.adapter
function createFanOut(sinks, reportFault)
  return { send: function(event)
    for each sink in sinks
      try
        call sink.send(event)
      catch error
        reportFault(error, { sink: sink.name })
  }
```
