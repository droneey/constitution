# Types

> Governs a value and its type.

## Vocabulary

An **entity** is a value with an identity that lives through its changes: it stays the same entity whatever its other data, and its identifier tells it apart from every other.

A value with an **invariant** is one some of whose representations are invalid.

A value's **stage** is the part of its data that decides which moves it may make next, such as placed, paid or shipped for an order; its **state** is all the data it holds.

A value is **equal by its data** when two values whose data are equal are one value to the program, such as two amounts of one sum in one currency, unlike an entity.

An **exact quantity** is money or any other quantity counted in exact decimal steps.

A **wall time** is a calendar date and a time of day with no offset, as a clock in some place shows them.

The **wall clock** is the machine's clock of the current time of day, which can be set, corrected or moved by a change of season.

A **cast** is a claim of a type or a presence that no check proved, such as an assertion, or a narrowing that checks one field and claims the whole type.

Absence is spelled **`<absent>`**{#absent}, and a value with an invariant is built by **`<Type>.<create>`**{#checked-constructor}, until a language's block names their form.

A spec is what the tests chapter defines.

## Modelling

### illegal-state-unrepresentable · MUST

Every value with distinct stages is a union keyed by its stage. It is never a bag of optional fields and flags that allows combinations no stage has, and the union takes its language's form.

#### Why

A bag of optional fields and flags lets code build a combination no stage has, which every reader guards against and some code one day produces — make illegal states unrepresentable.

#### Examples

```pseudo title="Avoid"
type Order = {
  isPaid: Boolean,
  paidAt?: Instant,
  isShipped: Boolean,
  trackingNumber?: TrackingNumber
}

# shipped yet unpaid still compiles
let order = { isPaid: false,
  isShipped: true }
```

```pseudo title="Prefer"
type Order = DraftOrder | PaidOrder
  | ShippedOrder
type DraftOrder = { stage: "draft" }
type PaidOrder = {
  stage: "paid",
  paidAt: Instant
}
type ShippedOrder = {
  stage: "shipped",
  paidAt: Instant,
  trackingNumber: TrackingNumber
}
```

### closed-set-branched-exhaustively · MUST

Every branch over a closed set names every member. Where the type checker or a check the project runs proves the branch exhaustive, no default absorbs the rest; elsewhere the default fails as a defect.

#### Why

A branch with a default takes a new member silently into a case nobody chose for it, and no check shows the places that decide on it.

#### Examples

```pseudo title="Avoid"
function label(status: OrderStatus)
  when status
    is Draft then return "Draft"
    is Paid then return "Paid"
    else return "Shipped"
# a new Cancelled reads "Shipped"
```

```pseudo title="Prefer"
function label(status: OrderStatus)
  when status
    is Draft then return "Draft"
    is Paid then return "Paid"
    is Shipped then return "Shipped"
```

### closed-set-decided-in-one-place · SHOULD

Each closed set's meaning for one concern is decided by a record keyed by member or by an exhaustive branch. The record is one the type checker proves complete, and the branch one function's, giving each member's meaning; such concerns include a label, a rule of the business and a next step.

#### Why

A record the type checker cannot prove complete, or a branch that is not exhaustive, gives a new member a meaning nobody chose, and no check shows where.

#### Examples

```pseudo title="Avoid"
# order/transitions/order.transitions
if order.status is Draft then
  throw new OrderNotRefundableError()

# order/services/refund-quote.service
if order.status is Paid
  or order.status is Shipped then
  return quoteFor(order)
```

```pseudo title="Prefer"
# order/value-objects/order-status.value-object
function isRefundable(status)
  when status
    is Draft then return false
    is Paid then return true
    is Shipped then return true

# order/transitions/order.transitions
if not isRefundable(order.status) then
  throw new OrderNotRefundableError()

# order/services/refund-quote.service
if isRefundable(order.status) then
  return quoteFor(order)
```

### closed-set-declared-as-one-enumeration · MUST

Every closed set of the program's own named values is declared as one enumeration that writes every member, never as loose constants. Exempt: another party's codes, which the data chapter governs.

#### Why

A closed set spelled as loose constants gives the type checker no set to check a branch against, so a member added later is missed by every branch that should handle it.

#### Examples

```pseudo title="Avoid"
if order.status is "shipped" then
  ...

if order.status is "shiped" then
  ...
```

```pseudo title="Prefer"
enum OrderStatus
  Draft = "draft"
  Paid = "paid"
  Shipped = "shipped"

if order.status is OrderStatus.Shipped then
  ...
```

### closed-name-reached-by-its-name · SHOULD

Every member of a closed set the program names is reached by its name, never as a literal repeated at each use.

#### Why

A literal repeated at each use is changed in some places and missed in others, where a name is followed by a search, a rename and the type checker.

#### Examples

```pseudo title="Avoid"
if order.status is "shipped" then
  return CannotCancelError({ orderId: order.id })

let label = labels["shipped"]
```

```pseudo title="Prefer"
if order.status is OrderStatus.Shipped then
  return CannotCancelError({ orderId: order.id })

let label = labels[OrderStatus.Shipped]
```

### identifier-branded-by-entity · SHOULD

Every entity's identifier has a type of its own, its entity's.

#### Why

Two identifiers of one primitive type are swapped silently, while a distinct type is rejected where another's is expected.

#### Examples

```pseudo title="Avoid"
type OrderId = String
type UserId = String

function cancelOrder(orderId: OrderId)
  ...

call cancelOrder(user.id)  # compiles
```

```pseudo title="Prefer"
type OrderId = Brand<String, "Order">
type UserId = Brand<String, "User">

function cancelOrder(orderId: OrderId)
  ...
```

### identifier-type-given-only-where-minted-or-parsed · SHOULD

Every entity's identifier type is given only by the one function that mints new ones, or where one is parsed from outside.

#### Why

An identifier type given anywhere else proves nothing of where its value came from, so a value made up in passing passes for one the program minted.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
let orderId = request.params.orderId as OrderId
call cancelOrder({ orderId }, context)
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
let input = parseCancelOrderInput(request.params)
call cancelOrder(input, context)

# orders/domain/order/value-objects/order-id.value-object
function OrderId.create(text) -> OrderId | InvalidOrderIdError
```

### entity-compared-by-its-identifier · SHOULD

All code tells two entities apart only by their identifiers, never by comparing their whole data.

#### Why

An entity's data changes through its life, so a comparison of its data counts one entity as two — the entity pattern.

#### Examples

```pseudo title="Avoid"
function isSameCustomer(a, b)
  return a equals b
```

```pseudo title="Prefer"
function isSameCustomer(a, b)
  return a.id is b.id
```

### type-has-one-home · SHOULD

Every type is declared once, beside the signature that introduces it or in the folder a layout rule gives its kind. Every other unit imports it from there or from a surface, as the layout chapter defines it, that re-exports it.

#### Why

A type declared twice drifts the first time one copy changes, and a value of one copy is then rejected, or wrongly let through, where the other is expected — a single source of truth.

#### Examples

```pseudo title="Avoid"
# orders/domain/order/entities/order.aggregate
type OrderId = Brand<String, "Order">

# invoices/domain/invoice/entities/invoice.aggregate
type OrderId = Brand<String, "Order">
```

```pseudo title="Prefer"
# kernel/value-objects/order-id.value-object
type OrderId = Brand<String, "Order">

# orders/domain/order/entities/order.aggregate
import { OrderId } from "kernel"

# invoices/domain/invoice/entities/invoice.aggregate
import { OrderId } from "kernel"
```

### declared-values-never-typed-again · MUST

Every set of values the program declares is declared once and taken from its declaration, never typed out again. A schema over one of the program's types derives its values from that type or is checked against the type it produces.

#### Why

A restated set drifts from its source the first time a member is added to one, so a value one of them takes is rejected where the other is expected, and a schema stricter or looser than its type locks out, or lets in, what the program does not mean — a single source of truth.

#### Examples

```pseudo title="Avoid"
# orders/domain/order/value-objects/order-status.value-object
enum OrderStatus { Draft, Paid, Shipped, Cancelled }

# orders/presentation/schemas/order-filter.schema
let orderFilterSchema = object({
  status: oneOf(["draft", "paid", "shipped"]),
})
```

```pseudo title="Prefer"
# orders/domain/order/value-objects/order-status.value-object
enum OrderStatus { Draft, Paid, Shipped, Cancelled }

# orders/presentation/schemas/order-filter.schema
let orderFilterSchema = object({
  status: oneOf(OrderStatus.members),
})
```

### value-subset-named-beside-its-set · MUST

Every subset of a declared set of values is a named constant beside the set.

#### Why

A subset spelled out at each use is updated in only some of them when the set changes, and its meaning is guessed again at each.

#### Examples

```pseudo title="Avoid"
# orders/domain/order/value-objects/order-status.value-object
enum OrderStatus { Placed, Paid, Shipped, Delivered }

# orders/application/use-cases/commands/cancel-order.use-case
if order.status in [OrderStatus.Shipped, OrderStatus.Delivered] then
  throw new OrderAlreadyShippedError({ orderId: order.id })
```

```pseudo title="Prefer"
# orders/domain/order/value-objects/order-status.value-object
enum OrderStatus { Placed, Paid, Shipped, Delivered }

const DISPATCHED_STATUSES = [OrderStatus.Shipped, OrderStatus.Delivered]

# orders/application/use-cases/commands/cancel-order.use-case
if order.status in DISPATCHED_STATUSES then
  throw new OrderAlreadyShippedError({ orderId: order.id })
```

### value-immutable-by-default · SHOULD

Every value is immutable by default. Changing a value makes a new one, and mutation stays local and deliberate.

#### Why

A value anyone holding it may change changes under the others who hold it, and each traces them all to know what it holds.

#### Examples

```pseudo title="Avoid"
function addLine(cart, line)
  cart.lines.push(line)

  return cart
# every holder of cart sees it change
```

```pseudo title="Prefer"
function addLine(cart, line)
  return cart with {
    lines: cart.lines + [line]
  }
```

## Type checking

### unchecked-type-never-used · MUST

Where the language has a type that switches the type checker off, all code keeps the checker on, never using that type. No value, parameter, return or type argument has it, in specs too, whether written or inferred for lack of an annotation.

#### Why

That type switches the checker off for everything it touches and spreads through every value that passes it on, so an error the checker would catch reaches run time.

#### Examples

```pseudo title="Avoid"
function refundPayment(payment: Any)
  call payments.refund(payment.id)
```

```pseudo title="Prefer"
function refundPayment(payment: Payment)
  call payments.refund(payment.id)
```

### narrowing-proves-all-it-claims · MUST

All code claims only the types and presences a check proved, and no cast stands in for a check. A narrowing that claims a type checks every property of it, as running the type's whole schema does.

#### Why

Code after a claim trusts every property it claims, so an unproven claim is a lie the type checker repeats, and the value breaks code far from the claim.

#### Examples

```pseudo title="Avoid"
function isOrder(value: Unknown): value is Order
  return "id" in value

if isOrder(body) then shipOrder(body)
```

```pseudo title="Prefer"
function isOrder(value: Unknown): value is Order
  return orderSchema.check(value)

if isOrder(body) then shipOrder(body)
```

## Invariants

### invariant-checked-at-construction · MUST

Every value with an invariant is built only through its checked constructor, so a value that exists is valid. Exempt: a value with a starting transition, built only through it, its rebuild from storage and the functions that change it, each checking every invariant of what it builds.

#### Why

A value built around its check can exist invalid, so every caller checks it again, and the one that forgets passes it on — parse, don't validate.

#### Examples

```pseudo title="Avoid"
type Quantity = Int

function addToCart(cart, count: Int)
  let quantity: Quantity = count
  ...
# each caller checks count >= 1,
# or forgets to
```

```pseudo title="Prefer"
type Quantity = Brand<Int, "Quantity">

function Quantity.create(count: Int)
  if count < 1 then
    throw new InvalidQuantityError()

  return count as Quantity
```

### invariant-value-is-plain-immutable-data · MUST

Every value with an invariant that is equal by its data is immutable, holding no state that changes. It takes its language's plain immutable record form.

#### Why

A value that can change breaks its invariant after its check — immutability.

#### Examples

```pseudo title="Avoid"
class Money
  cents: Int
  currency: Currency

  function addCents(extraCents: Int)
    this.cents = this.cents + extraCents
```

```pseudo title="Prefer"
type Money = readonly {
  cents: Int,
  currency: Currency
}

let total = Money.add(price, shipping)
```

### invariant-value-compared-by-its-data · MUST

Every value with an invariant that is equal by its data is compared by its data, never by an identity.

#### Why

A value compared by its identity counts two equal values as two, so a lookup, a set or a check of equality misses the value it already holds.

#### Examples

```pseudo title="Avoid"
let price = Money.create({ cents: 1200, currency: EUR })
let paid = Money.create({ cents: 1200, currency: EUR })

if sameReference(price, paid) then
  markPaid(invoice)
```

```pseudo title="Prefer"
let price = Money.create({ cents: 1200, currency: EUR })
let paid = Money.create({ cents: 1200, currency: EUR })

if Money.equals(price, paid) then
  markPaid(invoice)
```

### invariant-value-made-of-data-alone · MUST

Every value with an invariant that is equal by its data is made of data alone. It holds no function, handle or connection.

#### Why

A value made of more than data loses the rest when it crosses a cache, an address or storage.

#### Examples

```pseudo title="Avoid"
type Money = {
  cents: Int,
  currency: Currency,
  rates: ExchangeRateClient,
}
```

```pseudo title="Prefer"
type Money = {
  cents: Int,
  currency: Currency,
}
```

## Kinds of value

### absence-shown-by-the-type · MUST

Every value that may be absent has a type that says so.

#### Why

A value whose type hides that it may be absent is used without a check, and fails where it is absent.

#### Examples

```pseudo title="Avoid"
type User = {
  name: String,
  managerId: UserId,
}

let manager = findUser(user.managerId)  # a user with no manager fails here
```

```pseudo title="Prefer"
type User = {
  name: String,
  managerId: UserId | <absent>,
}
```

### absence-spelled-by-one-value · MUST

Every absent value is spelled by one value, the same throughout. No other value, such as an empty string, a minus one or a zero date, stands for it, and an empty collection is empty, not absent. Exempt: another spelling that an outside format or an API the code calls imposes.

#### Why

Two spellings of absence make every check ask twice, and a stand-in value passes for a real one.

#### Examples

```pseudo title="Avoid"
type Customer = {
  middleName: String | <absent>,
  loyaltyPoints: Int | <absent>,
}

let guest = Customer({ middleName: "", loyaltyPoints: -1 })
```

```pseudo title="Prefer"
type Customer = {
  middleName: String | <absent>,
  loyaltyPoints: Int | <absent>,
}

let guest = Customer({ middleName: <absent>, loyaltyPoints: <absent> })
```

### instant-is-an-exact-time · MUST

Every instant is an exact time, in UTC or carrying its offset, never a time without one.

#### Why

A time without its offset names a different moment on each machine.

#### Examples

```pseudo title="Avoid"
let paidAt = Instant.parse("2026-10-18T09:30:00")
```

```pseudo title="Prefer"
let paidAt = Instant.parse("2026-10-18T09:30:00Z")
```

### instant-never-a-date-or-a-wall-time · MUST

Every instant is a type of its own, kept apart from a calendar date and a wall time.

#### Why

A date or a wall time taken for an instant, or an instant taken for one of them, moves with the zone it is read in.

#### Examples

```pseudo title="Avoid"
type Invoice = {
  issuedAt: CalendarDate,
  dueOn: Instant,
}
```

```pseudo title="Prefer"
type Invoice = {
  issuedAt: Instant,
  dueOn: CalendarDate,
}
```

### person-set-time-kept-with-its-zone · MUST

Every time a person sets in a place is kept as its wall time with that place's IANA zone. Such times include a meeting, a departure and an opening hour.

#### Why

A future time a person sets moves with its zone's rules, which only its wall time and its zone keep.

#### Examples

```pseudo title="Avoid"
type Appointment = {
  patientId: PatientId,
  startsAt: Instant,
}
```

```pseudo title="Prefer"
type Appointment = {
  patientId: PatientId,
  startsAt: WallTime,
  zone: TimeZone,
}
```

### person-set-time-made-an-instant-only-when-used · MUST

Every time a person sets in a place becomes an instant only when it is used, never ahead of its use.

#### Why

An instant worked out ahead of its use keeps the zone's rules of the day it was worked out, so a later change to those rules moves the time the person set.

#### Examples

```pseudo title="Avoid"
function book(slot)
  return Appointment({
    startsAt: slot.startsAt,
    zone: slot.zone,
    remindAt: toInstant(slot.startsAt, slot.zone) - REMINDER_LEAD,
  })
```

```pseudo title="Prefer"
function book(slot)
  return Appointment({ startsAt: slot.startsAt, zone: slot.zone })

function reminderInstant(appointment)
  return toInstant(appointment.startsAt, appointment.zone) - REMINDER_LEAD
```

### time-never-read-in-the-machines-zone · MUST

Every time is read in a zone the code names, never in the machine's zone by default.

#### Why

A time read in the machine's zone changes its meaning with the machine the program runs on, so a deployment in another zone moves every time it reads.

#### Examples

```pseudo title="Avoid"
let today = clock.today()
let report = dailySales(orders, today)
```

```pseudo title="Prefer"
let today = clock.today(in: store.zone)
let report = dailySales(orders, today)
```

### duration-measured-on-a-monotonic-clock · MUST

Every duration the program measures is read from a monotonic clock, never from the wall clock.

#### Why

A wall clock that jumps (a correction, a change of season) corrupts every duration measured across the jump.

#### Examples

```pseudo title="Avoid"
let startedAt = wallClock.now()

call chargePayment(payment)

let elapsed = wallClock.now()
  - startedAt
# a clock correction can make it < 0
```

```pseudo title="Prefer"
let startedAt = monotonicClock.now()

call chargePayment(payment)

let elapsed = monotonicClock.now()
  - startedAt
```

### exact-quantity-never-binary-float · MUST

Every exact quantity is an integer of its smallest unit of measure or a decimal type, never binary floating point.

#### Why

Binary floating point cannot hold 0.1 exactly, and the error it adds to money is a bug no review sees.

#### Examples

```pseudo title="Avoid"
type Price = { amount: Float }

let total = 0.1 + 0.2
# 0.30000000000000004
```

```pseudo title="Prefer"
type Price = {
  cents: Int,
  currency: Currency
}

let totalCents = 10 + 20
```

### exact-quantity-carries-its-unit-in-its-type · MUST

Every exact quantity carries its currency or its unit of measure in its type, never in its name alone.

#### Why

An amount whose currency only its name gives is added to one in another currency, and the sum looks like correct code.

#### Examples

```pseudo title="Avoid"
type Invoice = {
  totalEur: Decimal,
  shippingUsd: Decimal,
}

let amountDue = invoice.totalEur + invoice.shippingUsd
```

```pseudo title="Prefer"
type Invoice = {
  total: Money,
  shipping: Money,
}

let amountDue = Money.add(invoice.total, invoice.shipping)
```

### exact-quantity-rounded-where-the-business-says · MUST

Every exact quantity is rounded only where the business says.

#### Why

A rounding at a step nobody chose moves money in a direction nobody can account for.

#### Examples

```pseudo title="Avoid"
function lineNet(line)
  return roundToCents(line.unitPrice * line.quantity, TAX_ROUNDING)

function invoiceTax(invoice)
  return roundToCents(sum(invoice.lines, lineNet) * invoice.vatRate, TAX_ROUNDING)
```

```pseudo title="Prefer"
function lineNet(line)
  return line.unitPrice * line.quantity

# Why: the tax office rounds the tax once, on the invoice's net total
function invoiceTax(invoice)
  return roundToCents(sum(invoice.lines, lineNet) * invoice.vatRate, TAX_ROUNDING)
```

### exact-quantity-rounded-by-the-business-mode · MUST

Every rounding of an exact quantity takes the mode the business names.

#### Why

A rounding mode nobody chose, such as a language's default, moves each amount in a direction the business never agreed to, and the differences add up.

#### Examples

```pseudo title="Avoid"
function invoiceTax(net, vatRate)
  return roundToCents(net * vatRate)
```

```pseudo title="Prefer"
const TAX_ROUNDING = HalfUp

function invoiceTax(net, vatRate)
  return roundToCents(net * vatRate, TAX_ROUNDING)
```
