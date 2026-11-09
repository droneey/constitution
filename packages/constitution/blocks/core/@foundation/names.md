# Names

> Governs a name in the code.

## Vocabulary

An **outside system** is what the program reaches beyond its own code, such as a vendor's service, a database or another engine, a transport, a format or the clock.

A **store** keeps the program's own data beyond a run, such as a database, an index or a set of files.

A **client** is the object through which code reaches an outside system, holding the connection to it.

A **subcommand**{#subcommand} is one of the actions a command-line program runs by name.

An **event** is a value that records something that happened, such as a click a handler answers or a fact one part of the program announces to another.

A function is of one kind by what it does, and each kind takes its word.

An **act** changes something, in the sense the functions chapter gives the word, and a **read** answers from what a store or an outside system holds and changes nothing: each is a verb and its object.

A parse turns outside or flatter input into a structured value and may fail: **`parse`**{#parse-word} and the value it gives.

A **checked constructor** takes a value's own representation and fails only on its invariant, in the form the types chapter gives it.

A **factory** builds a unit from what it is handed: **`create`**{#create-word} and the unit.

A **starting transition** starts a value's life: the business's verb from the glossary for that start, such as place for an order or register for a user.

A **rebuild from storage** restores a stored value from what the store keeps of it and changes nothing: **`restore`**{#restore-word}, with what it rebuilds where the language's form needs it.

A **conversion** turns one value into another and cannot fail: **`to`**{#to-word} and its target, or **`from`**{#from-word} and its source on the target type.

A function that makes a value of the parts it is handed ends in **`of`**{#of-word}.

A **derived value** is computed from a value and changes nothing, and a function that renders a value makes one: each is named by a noun for what it returns.

A **predicate** answers yes or no and is named as a boolean is.

The **empty names**{#empty-names} are `data`, `result`, `temp`, `info`, `item`, `value`, `obj`, `arr`, `stuff` and `thing`, and the **empty verbs**{#empty-verbs} are `handle`, `process`, `manage`, `do`, `run`, `execute`, `get`, `set` and `update`.

The **dating words**{#dating-words} are words such as `new`, `old`, `v2`, `legacy`, `fixed`, `improved` and `final`.

A **hollow prefix**{#hollow-prefixes} is one of `validate`, `try`, `safe` and `make`, and a **boolean prefix**{#boolean-prefixes} one of `is`, `has`, `can`, `should`, `did` and `with`, the last for an option that adds a part to what it configures.

The **error suffix** is **`Error`**{#error-suffix}.

The **construct marks**{#construct-marks} are an `I` prefix and suffixes such as `Interface`, `Type`, `Class` and `Abstract`.

A unit's **role word** is the one word that names the role the unit plays in the program, such as `Port`, `Adapter`, `Service`, `Widget`, `Fake`, `Dto`, `Config` or `Schema`; the file of its one unit spells it as its suffix, as `.port`, `.fake`, `.dto`, `.config` or `.schema`.

A **collection suffix** marks a file that collects many things of one kind, such as `.utils`, `.types`, `.constants` and `.messages`, and, of the kinds' marks foundation's `layout` chapter names, `.test`, `.suite`, `.fixtures` and `.gen`; it is no role word.

Every word named here is a default.

## Meaning

### name-reveals-intent · SHOULD

Every name says what its thing is for.

#### Why

Code is read far more often than it is written, and every reader of a name that hides its purpose looks the purpose up again, or guesses it wrong.

#### Examples

```pseudo title="Avoid"
let d = 7

if u.flg then
  sndRmd(u, d)
```

```pseudo title="Prefer"
let trialDays = 7

if user.isOnTrial then
  sendTrialReminder(user, trialDays)
```

### name-spelled-in-whole-words · SHOULD

Every name is spelled in whole words, with no abbreviation the business does not already use.

#### Why

An abbreviation the business does not use is decoded anew by each reader.

#### Examples

```pseudo title="Avoid"
let custAddr = Customer.address(cust)
let invQty = Invoice.lineCount(inv)
let dlvDt = Shipment.deliveryDate(shpmt)
```

```pseudo title="Prefer"
let customerAddress = Customer.address(customer)
let invoiceLineCount = Invoice.lineCount(invoice)
let deliveryDate = Shipment.deliveryDate(shipment)
let vatRate = TaxTable.rate(country)
```

### name-can-be-said-aloud · SHOULD

Every name can be said aloud as it is written.

#### Why

A name that cannot be said aloud is misheard in every talk about it.

#### Examples

```pseudo title="Avoid"
let order2invoice = Invoice.from(order)
let quantityXunitPrice = line.quantity * line.unitPrice
```

```pseudo title="Prefer"
let invoice = Invoice.from(order)
let lineTotal = line.quantity * line.unitPrice
```

### name-stands-out-in-a-search · SHOULD

Every name is searchable: a text search for it finds its own uses, not a crowd of other words that contain it.

#### Why

A name a search cannot single out is missed by every search, so a change to it misses some of its uses.

#### Examples

```pseudo title="Avoid"
const max = 20
function at(order, index)
let id = Order.id(order)

if Order.lineCount(order) > max then
  return TooManyLinesError({ id })
```

```pseudo title="Prefer"
const MAX_LINES_PER_ORDER = 20
function orderLineAt(order, index)
let orderId = Order.id(order)

if Order.lineCount(order) > MAX_LINES_PER_ORDER then
  return TooManyLinesError({ orderId })
```

### name-from-the-glossary · SHOULD

Every name of the business is the glossary's word, never its vendor's or its store's. An operation the business offers is named by the business's verb, never by a word of building.

#### Why

A name that differs from the word the business uses is translated at every request, and the translation is where a request is misread, while a vendor's or a store's word is renamed everywhere when they change.

#### Examples

```pseudo title="Avoid"
function updateRecord(record)  # the business says "cancel an order"
  return record with { status: Cancelled }
```

```pseudo title="Prefer"
function cancel(order)
  return order with { status: Cancelled }
```

### concept-has-one-word · SHOULD

Every concept has one word, never two.

#### Why

A reader who sees two words assumes two things, and a search for one misses the other.

#### Examples

```pseudo title="Avoid"
let user = fetchUser(userId)
let order = loadOrder(orderId)
let invoice = getInvoice(invoiceId)
```

```pseudo title="Prefer"
let user = findUser(userId)
let order = findOrder(orderId)
let invoice = findInvoice(invoiceId)
```

### word-has-one-concept · SHOULD

Every word names one concept, never two. Exempt: a word the glossary gives one meaning in each part of the program it names.

#### Why

A word read in a meaning its part does not give it misleads, and its reader acts on the wrong thing.

#### Examples

```pseudo title="Avoid"
function closeInvoice(invoice)
  return invoice with { status: Paid }

function closeOrder(order)
  return order with { status: Cancelled }
```

```pseudo title="Prefer"
function settleInvoice(invoice)
  return invoice with { status: Paid }

function cancelOrder(order)
  return order with { status: Cancelled }
```

### undoing-acts-take-an-antonym-pair · SHOULD

Every pair of acts that undo each other takes a verb and its antonym, the same pair throughout.

#### Why

A pair that is no verb and its antonym hides one half from the reader who looks for it.

#### Examples

```pseudo title="Avoid"
function addLine(cart, line)
function dropLine(cart, line)
function openSubscription(customer)
function killSubscription(subscription)
```

```pseudo title="Prefer"
function addLine(cart, line)
function removeLine(cart, line)
function startSubscription(customer)
function stopSubscription(subscription)
```

### name-never-an-empty-word · SHOULD

Every name says what its thing holds or does, never only an empty name or, for a function, an empty verb. Exempt: a value whose shape the code does not know, where the code says so, a handler named for the event it answers, and a name a contract, a framework or the language's convention imposes.

#### Why

An empty name makes the reader look up what it holds every time, and an empty verb says that a function does something, never what.

#### Examples

```pseudo title="Avoid"
let data = findCustomer(customerId)
let result = Invoice.tax(invoice)
let info = Customer.address(data)
```

```pseudo title="Prefer"
let customer = findCustomer(customerId)
let tax = Invoice.tax(invoice)
let address = Customer.address(customer)
```

### name-never-dates-its-thing · SHOULD

Every name says what its thing is, never when or how its code was written: it holds no dating word. Exempt: a version that is part of an API or a format, a word of the business, such as a new password, and a name a contract, a framework or the language's convention imposes.

#### Why

The moment a name records passes with the next change, and the name then lies.

#### Examples

```pseudo title="Avoid"
function parseInvoiceV2(text)
let oldClient = connect(address)
type ImprovedInvoice
```

```pseudo title="Prefer"
function parseInvoice(text)
let reportingClient = connect(address)
type Invoice
```

### function-named-for-what-it-does · SHOULD

Every function's name gives its kind in the word the vocabulary gives that kind, and no kind's word names another kind. The factory's word names only the building of a new valid value or unit by a factory or a checked constructor, and the word that makes a value of its parts ends no derived value's or conversion's name. Exempt: a handler named for the event it answers, and a name a contract, a framework or the language's convention imposes.

#### Why

A name that hides its kind leaves the caller to read the body before knowing whether a call acts, may fail on its input, builds, cannot fail or only answers, and two words for one kind split every search for it — command–query separation.

#### Examples

```pseudo title="Avoid"
function createOrder(customer, lines) -> OrderPlaced  # an act, named as a factory
function toEmail(text) -> Email | InvalidEmailError
function parentOf(path) -> Path
```

```pseudo title="Prefer"
function placeOrder(customer, lines) -> OrderPlaced
function parseEmail(text) -> Email | InvalidEmailError
function parent(path) -> Path
```

### function-kind-spelled-on-its-type · SHOULD

Every parse of, conversion into and derived value of a type is spelled on that type. Each takes the form its language gives a type's own functions. Exempt: a parse or a conversion from an outside system's own shape, such as a response or a row, which the code that reaches that system holds, though the text of one value, such as an amount's, is no such shape; a rendering of the value for a person, such as its text in a locale, which the code that shows it to that person holds; and a conversion between two types whose homes may not know each other, which the code that knows both holds.

#### Why

A function that builds a type or answers about it, kept apart from it, is not found where its reader looks, reads as one more helper and is soon written again beside the first, while one reached through its type reads as what it builds.

#### Examples

```pseudo title="Avoid"
type Money = { amount: Decimal, currency: Currency }

function parseMoney(text) -> Money | InvalidMoneyError
function minorUnits(money) -> Int
```

```pseudo title="Prefer"
type Money = { amount: Decimal, currency: Currency }
  function parse(text) -> Money | InvalidMoneyError
  function minorUnits(money) -> Int
```

### function-name-never-opens-with-a-hollow-prefix · SHOULD

No function's name opens with a hollow prefix. Exempt: a handler named for the event it answers, and a name a contract, a framework or the language's convention imposes.

#### Why

A hollow prefix says neither whether a call acts, may fail or builds, so its caller reads the body to learn what the name should have said — parse, don't validate.

#### Examples

```pseudo title="Avoid"
function validateCoupon(code) -> boolean
function tryChargeCard(payment)
function safeParseQuantity(text)
function makeInvoice(order)
```

```pseudo title="Prefer"
function parseCoupon(code) -> Coupon | InvalidCouponError
function chargeCard(payment) -> Charge | CardDeclinedError
function parseQuantity(text) -> Quantity | InvalidQuantityError
function issueInvoice(order) -> Invoice
```

### member-name-never-repeats-its-owner · SHOULD

Every member's name says what sets it apart, never repeating the name of the type or the object it belongs to. Exempt: a name a module exports, which keeps its object, since it is read without its module.

#### Why

The owner is written beside every use of its member, so its name said again is noise that hides the part that differs.

#### Examples

```pseudo title="Avoid"
type Order = {
  orderId: OrderId,
  orderTotal: Money,
  orderLines: List<OrderLine>
}

let total = order.orderTotal
```

```pseudo title="Prefer"
type Order = {
  id: OrderId,
  total: Money,
  lines: List<OrderLine>
}

let total = order.total
```

### literal-with-a-meaning-is-named · MUST

Every literal with a meaning is a named constant. Such literals include a limit, a threshold and a name something is looked up by, such as a setting's, a secret's or a cache entry's. Exempt: zero, one, an empty value and the literals of a test case.

#### Why

A bare literal does not say what it means, and a repeated one is changed in one place and missed in another.

#### Examples

```pseudo title="Avoid"
function addLine(cart, line)
  if cart.lineCount >= 50 then
    throw new CartFullError()

  return cart with { lines: cart.lines + [line] }
```

```pseudo title="Prefer"
const MAX_CART_LINES = 50

function addLine(cart, line)
  if cart.lineCount >= MAX_CART_LINES then
    throw new CartFullError()

  return cart with { lines: cart.lines + [line] }
```

## Form

### name-case-by-kind · SHOULD

Each kind of name takes the case its language's convention sets. The kinds are a type, a function, a variable, a constant, an enumeration and its members.

#### Why

A name in a case its convention does not set for its kind no longer tells a reader whether it is a type, a value or a constant, so each name is looked up at its declaration.

#### Examples

```pseudo title="Avoid"
type order_status = Draft | Paid

function Cancel(Order)
  let refund_amount = Order.total

  return Order with { refunded: refund_amount }
```

```pseudo title="Prefer"
type OrderStatus = Draft | Paid

function cancel(order)
  let refundAmount = order.total

  return order with { refunded: refundAmount }
```

### type-name-undecorated · MUST

Every type's name says what its thing is, never marked with a construct mark. A role word, which `role-word-ends-the-name` places, marks the thing's role, never a construct. Exempt: a name a contract, a framework or the language's convention imposes.

#### Why

The declaration already shows the kind, the mark lengthens the name at every use, and it turns false the day the construct changes while the meaning stays.

#### Examples

```pseudo title="Avoid"
interface IPaymentPort
type OrderType = { ... }
class InvoiceClass
```

```pseudo title="Prefer"
interface PaymentPort
type Order = { ... }
class Invoice
```

### role-word-ends-the-name · MUST

Every role word ends each spelling of its unit's name. It is the file's suffix, as in `order-repository.port`, the last word of the unit's type, as in `OrderRepositoryPort`, `SqlOrderRepositoryAdapter` or `OrderDto`, and, for a unit that is a folder, the last word of the folder's name, as in `patient-chart-widget/`, whose type is `PatientChartWidget`. Exempt: a type that is itself a thing of the domain, such as `Order`, `Patient`, `Money` or `OrderPlaced`, whose file alone carries the role word, as `order.aggregate` does; an error's type, whose name `error-name-ends-in-error` sets; and a name a contract, a framework or the language's convention imposes.

#### Why

A name whose last word differs between its file and its type makes its reader guess whether the two are one thing, and the role word at the place of use, in an argument, a trace or an editor's tab, is all that tells the role where no folder shows.

#### Examples

```pseudo title="Avoid"
# orders/infrastructure/database/sql-order-repository.adapter
type SqlAdapterOrderRepository implements OrderRepositoryPort

# orders/application/contracts/order-repository.port
interface PortOrderRepository
```

```pseudo title="Prefer"
# orders/infrastructure/database/sql-order-repository.adapter
type SqlOrderRepositoryAdapter implements OrderRepositoryPort

# orders/application/contracts/order-repository.port
interface OrderRepositoryPort
```

### collection-suffix-ends-only-its-files-name · MUST

Every collection suffix ends only its file's name, never the name of a type the file holds, as `OrderTypes` or `DateUtils` would. Exempt: a name a contract, a framework or the language's convention imposes.

#### Why

A collection suffix in a type's name marks one thing with the kind of file that collects many, so its reader takes the type for the collection, or looks for the file's other members in it.

#### Examples

```pseudo title="Avoid"
# orders/domain/order.types
type OrderTypes = { id: OrderId, lines: List<OrderLine> }

# shared/date.utils
object DateUtils
  function startOfMonth(date)
```

```pseudo title="Prefer"
# orders/domain/order.types
type Order = { id: OrderId, lines: List<OrderLine> }

# shared/date.utils
function startOfMonth(date)
```

### name-number-matches-its-value · SHOULD

Every name's grammatical number is the number of values it holds. A collection's name is plural and an item's singular, destructured names included, and a type's name, an enumeration's included, is singular. Exempt: the name of a type whose value is a collection.

#### Why

A name in the wrong number makes a reader take a list for one of its elements or the reverse, and a plural type's name reads as a list where it holds one value.

#### Examples

```pseudo title="Avoid"
type OrderStatuses =
  Draft | Paid | Shipped

let order = listOrders(customer)

for each orders in order
  shipOrder(orders)
```

```pseudo title="Prefer"
type OrderStatus =
  Draft | Paid | Shipped

let orders = listOrders(customer)

for each order in orders
  shipOrder(order)
```

### boolean-name-is-a-positive-predicate · SHOULD

Every boolean's name is a positive predicate, never a negated one.

#### Why

A negated name turns every check of it into a double negation, and the reader inverts it in their head at every use.

#### Examples

```pseudo title="Avoid"
let isPaid = invoice.balance is 0
let isNotOverdue = today <= invoice.dueOn

if not isNotOverdue and not isPaid then
  sendReminder(invoice)
```

```pseudo title="Prefer"
let isPaid = invoice.balance is 0
let isOverdue = today > invoice.dueOn

if isOverdue and not isPaid then
  sendReminder(invoice)
```

### boolean-name-opens-with-a-boolean-prefix · SHOULD

Every boolean's name opens with a boolean prefix. Exempt: a name a contract, a framework or the language's convention imposes.

#### Why

A condition on a name that opens with a boolean prefix reads as a question with a yes-or-no answer, or as the part it switches on, where one without it reads as a value of some other type.

#### Examples

```pseudo title="Avoid"
let paid = invoice.balance is 0
let refundable = Order.daysSincePlaced(order, today) <= REFUND_WINDOW_DAYS

if refundable and not paid then
  cancelOrder(order)
```

```pseudo title="Prefer"
let isPaid = invoice.balance is 0
let canRefund = Order.daysSincePlaced(order, today) <= REFUND_WINDOW_DAYS

if canRefund and not isPaid then
  cancelOrder(order)
```

### event-name-in-past-tense · SHOULD

Every event's name says what happened, in the past tense.

#### Why

An event named in the imperative reads as an order to act, so a reader takes a fact that already happened for a request that may still be rejected.

#### Examples

```pseudo title="Avoid"
# orders/domain/order/transitions/order.transitions
type ShipOrder = { orderId: OrderId }

function ship(order)
  return { state: order with { status: Shipped },
           event: ShipOrder(order.id) }
```

```pseudo title="Prefer"
# orders/domain/order/transitions/order.transitions
type OrderShipped = { orderId: OrderId }

function ship(order)
  return { state: order with { status: Shipped },
           event: OrderShipped(order.id) }
```

### error-name-ends-in-error · SHOULD

Every error type's name ends in the error suffix, the same for every error of the program. Exempt: a name a contract, a framework or the language's convention imposes.

#### Why

An error named like a value is taken for one where it is caught, returned or logged, and the reader opens its declaration to tell a failure from a result.

#### Examples

```pseudo title="Avoid"
type OrderNotFound
type PaymentFailedException
type InvalidEmail
```

```pseudo title="Prefer"
type OrderNotFoundError
type PaymentFailedError
type InvalidEmailError
```

### value-name-carries-its-unit · SHOULD

The name of every number whose type does not carry its unit of measure carries that unit of measure.

#### Why

A number without its unit of measure is read in the wrong one sooner or later, and the bug looks like correct code.

#### Examples

```pseudo title="Avoid"
let paymentTimeout = 30
let maxUploadSize = 10485760

chargeCard(card, paymentTimeout)
```

```pseudo title="Prefer"
let paymentTimeoutSeconds = 30
let maxUploadSizeBytes = 10485760

chargeCard(card, paymentTimeoutSeconds)
```
