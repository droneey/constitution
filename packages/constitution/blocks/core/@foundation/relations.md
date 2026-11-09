# Relations

> Governs how a unit is built, holds state, and depends on, calls or extends another.

## Vocabulary

A **unit** is a class, a module or a package that others call or import.

A **package** is the unit a manifest declares and ships.

A **contract** is what a unit's callers may rely on, its operations and their promises, apart from any implementation of it.

A set is **open** when its members share one contract and the program treats them alike, such as vendors, subcommands or formats, and **closed** when the program's logic decides on each member apart, such as stages or outcomes; a set with one member is not yet open.

A unit's **stability** is the share of the dependency links touching it that point into it; a unit that depends on no other is fully stable.

A pipeline's **runner** is the one function that runs its steps.

## Modules

### unit-answers-to-one-stakeholder-group · SHOULD

Every class or module answers to one stakeholder group. A stakeholder group is a group of people whose needs change a unit.

#### Why

A unit that serves two stakeholder groups changes for both, and a change for one breaks the other — the single-responsibility principle.

#### Examples

```pseudo title="Avoid"
# employees/employee
class Employee  # changed by finance, operations and the database team
  function monthlyPay()
  function hoursReport()
  function save()
```

```pseudo title="Prefer"
# payroll/pay-calculator
function monthlyPay(employee)

# timesheets/hours-report
function hoursReport(employee)

# employees/employee-store
function saveEmployee(employee)
```

### module-is-deep · SHOULD

Every module offers little and hides much: few operations, each doing much its callers need not know.

#### Why

A shallow module makes its callers learn nearly as much as the work behind it — information hiding.

#### Examples

```pseudo title="Avoid"
let file = invoices.open(path)
let header = invoices.readHeader(file)
let lines = invoices.readLines(file)

invoices.close(file)
```

```pseudo title="Prefer"
let invoice = invoices.read(path)
```

### module-imports-form-no-cycle · MUST

All files and modules import one another in one direction, forming no cycle, direct or through a chain.

#### Why

A cycle ties two modules into one unit that can be neither tested nor changed apart — the acyclic dependencies principle.

#### Examples

```pseudo title="Avoid"
# billing/domain/order/entities/order.aggregate
import Invoice from "../../invoice/entities"

# billing/domain/invoice/entities/invoice.aggregate
import Order from "../../order/entities"
```

```pseudo title="Prefer"
# billing/domain/order/entities/order.aggregate
type Order = { id: OrderId, lines: List<OrderLine> }

# billing/domain/invoice/entities/invoice.aggregate
import OrderId from "../../order/value-objects"
```

### dependency-points-toward-stability · SHOULD

Every unit depends only on units no less stable than itself.

#### Why

A unit others rely on that depends on one with less reason to stay put changes whenever that one does, and carries the change to all of them — the stable dependencies principle.

#### Examples

```pseudo title="Avoid"
# money/money
import Theme from "checkout/theme"  # money, changed yearly, now moves with a weekly theme

function moneyText(amount)
  return Theme.currencyText(amount)
```

```pseudo title="Prefer"
# checkout/theme
import Money from "money/money"

function priceText(amount)
  return Money.toText(amount)
```

### unit-talks-only-to-its-neighbours · SHOULD

Every unit calls only its neighbours, never theirs. A unit's neighbours are the units it holds, creates, is handed or imports. No chain walks into another unit's internals. Exempt: walking plain, immutable data.

#### Why

A chain couples the caller to the whole path, so a change anywhere along it breaks the caller — the law of Demeter.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/check-out.use-case
function createCheckOut({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    order.customer()
      .wallet()
      .withdraw(order.total)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/check-out.use-case
function createCheckOut({ orderRepository, payments })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    payments.charge(order.customerId,
      order.total, context)
```

## Contracts

### contract-shaped-by-its-callers-role · SHOULD

Every contract offers what one role of caller needs, never the whole of what an implementation can do. Roles include reading, writing and notifying, and the callers of one role share its contract, even when each calls only part of it.

#### Why

A contract wider than its role couples every caller to operations it never uses, and one cut per caller multiplies contracts that change together — the interface segregation principle.

#### Examples

```pseudo title="Avoid"
type OrderStorePort = {
  find(id), list(page), save(order),
  remove(order), migrate(), backup()
}

# only reads, yet sees all six
function salesReport(store: OrderStorePort)
```

```pseudo title="Prefer"
type OrderQueriesPort = { list(page) }
type OrderRepositoryPort = {
  find(id), save(order), remove(order)
}
type OrderUpkeepPort = {
  migrate(), backup()
}

function salesReport(
  orders: OrderQueriesPort)
```

### implementation-keeps-the-whole-contract · MUST

Every implementation of a contract keeps all of it. No operation of it refuses as unsupported, requires more or promises less than the contract says.

#### Why

A caller written against the contract breaks on the first call that reaches an implementation keeping less of it — the Liskov substitution principle.

#### Examples

```pseudo title="Avoid"
type InvoiceRepositoryPort = { find(id), save(invoice) }

# invoices/infrastructure/archive/invoice-archive.adapter
class InvoiceArchiveAdapter implements InvoiceRepositoryPort
  function find(id)
    return restore(archiveFiles.find(id))

  function save(invoice)
    throw new NotSupportedError()
```

```pseudo title="Prefer"
type InvoiceQueriesPort = { find(id) }

# invoices/infrastructure/archive/invoice-archive.adapter
class InvoiceArchiveAdapter implements InvoiceQueriesPort
  function find(id)
    return restore(archiveFiles.find(id))
```

## Deprecation

### deprecated-form-never-used · MUST

All new code uses only forms nothing marks deprecated. It calls nothing a dependency or the program marks deprecated, and uses no form deprecated in favour of another.

#### Why

New code on a deprecated form breaks when a later release removes it, and two spellings of one thing double what a reader has to know.

#### Examples

```pseudo title="Avoid"
payments.charge(card, total)  # deprecated in payments 3.2 for createCharge
```

```pseudo title="Prefer"
payments.createCharge(card, total)
```

### retired-code-marked-deprecated · SHOULD

All code kept only for its old callers is marked deprecated where it is declared.

#### Why

Code kept for old callers without the mark draws new ones, who build on what is meant to go.

#### Examples

```pseudo title="Avoid"
# kept for the mobile app 2.x
export function price(order)
  return priceWithTax(order)
```

```pseudo title="Prefer"
# @deprecated Use priceWithTax; kept
# for the mobile app 2.x.
export function price(order)
  return priceWithTax(order)
```

### deprecation-names-its-replacement · SHOULD

Every deprecation mark names what replaces the code it marks.

#### Why

A mark that names no replacement tells a caller to leave and not where to go, so the caller stays and finds no way off it.

#### Examples

```pseudo title="Avoid"
/** @deprecated */
export function invoiceTotal(invoice)
```

```pseudo title="Prefer"
/** @deprecated use Invoice.total(invoice), which rounds per line */
export function invoiceTotal(invoice)
```

## Construction and state

### unit-usable-once-built · SHOULD

Every unit is ready to use once its constructor or factory returns, never waiting for a further call to set it up.

#### Why

A unit that needs a call after it is built fails for the first caller who does not make it, at run time and far from the step it missed.

#### Examples

```pseudo title="Avoid"
let mailer = new Mailer()
# forget one, and send fails
mailer.connect(smtpHost)
mailer.setSender(billingAddress)
mailer.send(invoiceEmail)
```

```pseudo title="Prefer"
let mailer = createMailer({
  host: smtpHost,
  sender: billingAddress
})
mailer.send(invoiceEmail)
```

### ordered-steps-held-by-their-types · SHOULD

Where steps run in a required order, each step returns what the next one takes, so the types hold the order. No caller has to know it.

#### Why

An order of calls only the documentation states fails for the first caller who does not know it, at run time and far from the step it missed.

#### Examples

```pseudo title="Avoid"
let checkout = createCheckout(cart)
checkout.reserveStock(context)
checkout.price()
checkout.submit(context)       # fails unless both ran first
```

```pseudo title="Prefer"
function reserveStock(cart: Cart, context) -> ReservedCart
function price(cart: ReservedCart) -> PricedCart
function submit(cart: PricedCart, context) -> Order

let reservedCart = reserveStock(cart, context)
let pricedCart = price(reservedCart)
let order = submit(pricedCart, context)
```

### state-never-global-and-mutable · MUST

All state that changes lives in values the program creates and passes in, never at module, static or global level. Exempt: a spec's own setup, made anew for each case, and the diagnostic handles.

#### Why

Global state couples units through an order of calls no signature shows, and leaks from one test into the next.

#### Examples

```pseudo title="Avoid"
# cart/cart
let cart = { lines: [] }

function addLine(line)
  cart.lines.add(line)
```

```pseudo title="Prefer"
# cart/cart
function createCart()
  return { lines: [] }

function addLine(cart, line)
  return cart with { lines: cart.lines + [line] }
```

## Inheritance and patterns

### behaviour-composed-not-inherited · SHOULD

Every unit shares behaviour by composing other units, never by inheriting an implementation. Exempt: a class the language or a framework requires to extend another, such as an error type or a framework's base.

#### Why

A child that inherits an implementation breaks when its parent's internals change, and the hierarchy resists every change it did not foresee — composition over inheritance.

#### Examples

```pseudo title="Avoid"
class AuditedOrderRepository
  extends OrderRepository
  let log: AuditLog

  override function save(order)
    log.write(order.id)
    super.save(order)
```

```pseudo title="Prefer"
class AuditedOrderRepository
  let store: OrderRepository
  let log: AuditLog

  function save(order)
    log.write(order.id)
    store.save(order)
```

### override-marked-where-declared · MUST

Every method that overrides one of its base is marked as an override where it is declared. Wherever the language has an override mark, it is that mark. Exempt: a constructor, and a method of the language's root type that the language calls to build or extend a class.

#### Why

Without the mark, a new method that overrides one by accident changes behaviour silently instead of failing the check.

#### Examples

```pseudo title="Avoid"
class PaymentDeclinedError
  extends AppError
  # overrides, but nothing says so
  function message()
    return "Card declined"
```

```pseudo title="Prefer"
class PaymentDeclinedError
  extends AppError
  override function message()
    return "Card declined"
```

### pattern-chosen-by-problem · SHOULD

Every problem that calls for a pattern takes the one known for it. Such pairs include the stages of a thing and a union of its stages with pure transition functions; an outside API turned into the contract the code needs and a wrapper that translates it; and a fact others react to and an event.

#### Why

An invented pattern is learned and kept by every reader, where the known one for its problem is recognised at a glance.

#### Examples

```pseudo title="Avoid"
type Order = {
  isPaid: Boolean,
  isShipped: Boolean,
  isCancelled: Boolean
}
# shipped and cancelled at once?
```

```pseudo title="Prefer"
type OrderState =
  Draft | Paid | Shipped | Cancelled

function pay(order: Draft): Paid
function ship(order: Paid): Shipped
function cancel(order: Draft | Paid): Cancelled
```

### pipeline-steps-run-by-their-runner · SHOULD

Every pipeline's steps are run in order by its runner alone, and no step calls another.

#### Why

A step that calls the next hides the pipeline's order inside its steps, so none is added, removed or tested alone — pipes and filters.

#### Examples

```pseudo title="Avoid"
# import-lines/steps/merge-lines-by-sku
function mergeLinesBySku(lines)
  let merged = groupBy(lines, "sku").map(sumQuantities)

  return applyPrices(merged)

# import-lines/steps/apply-prices
function applyPrices(lines)
  let priced = lines.map(withListPrice)

  return formatLines(priced)

# import-lines/import-lines
function importLines(lines)
  return mergeLinesBySku(lines)
```

```pseudo title="Prefer"
# import-lines/steps/merge-lines-by-sku
function mergeLinesBySku(lines)
  return groupBy(lines, "sku").map(sumQuantities)

# import-lines/steps/apply-prices
function applyPrices(lines)
  return lines.map(withListPrice)

# import-lines/import-lines
function importLines(lines)
  let merged = mergeLinesBySku(lines)
  let priced = applyPrices(merged)

  return formatLines(priced)
```

### new-kind-added-as-a-member · SHOULD

Every new kind of an open set is added as a new member with its registration. The code that handles the other members is left as it is.

#### Why

Code edited for each new member breaks the existing members whenever one is added — the open–closed principle.

#### Examples

```pseudo title="Avoid"
function exportInvoice(invoice, format)
  if format is Pdf then
    return toPdf(invoice)

  if format is Csv then
    return toCsv(invoice)

  # each new format edits this
  if format is Xml then
    return toXml(invoice)
```

```pseudo title="Prefer"
let exporters = {
  Pdf: toPdf,
  Csv: toCsv,
  Xml: toXml
}

function exportInvoice(invoice, format)
  return exporters[format](invoice)
```
