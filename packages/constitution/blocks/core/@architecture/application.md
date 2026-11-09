# Application

> Governs the use cases: what crosses into them, what they decide, what they return and report, and how reads and writes are cut.

## Vocabulary

A use case is an application service: one operation the feature offers.

Every operation is a command or a query, and a diagnostic it writes changes nothing, as foundation's `functions` defines these. A lint over files is a query and its fix of those files a command; a run of an outside system through port callbacks that may change anything is a command, as a language model's run whose tools write or a solver's whose port callbacks book, and one whose port callbacks only read is a query. A failure reported through the fault reporter is a diagnostic.

A use case takes its **operation input**{#operation-input}: one value of the domain model's own types — identifiers and value objects — that holds what the operation is asked to do; a reaction's, as the composition chapter defines one, is the event that set it off.

The **call context** is what the call carries beside it: who acts, its **actor**, and the call's cancellation and the time it has left.

The **unvalidated input**{#unvalidated-input} is the same operation's plain values as a caller holds them, before the parse that turns them into its operation input.

A **read model**{#read-model} is a shape a query returns that is no aggregate, entity or value object of the domain model.

A feature's **read side**{#read-side} is its queries — their use cases, what binds them, and the ports they read through with their read models —, and its **write side**{#write-side} its commands — their use cases, what binds them, and the ports through which they change the feature's data; a port through which a use case neither reads nor changes its feature's data, as a clock, a mailer, a reporter port or the event port, belongs to neither side, and the rules of the sides say which of them may take it.

A start finds its identifier taken with the **same data** when something was already started under it with the operation input the start carries, whatever moves it made since, and taken with other data when something was started under it with another.

A **clash** is a start under an identifier taken with other data, and it is not transient.

## Use cases

### operation-has-a-use-case · SHOULD

Every operation a feature offers has its use case in the application layer, however thin. A query has one too: its use case may do no more than call the port it reads through, and the steps it gains later go to it.

#### Why

An operation with no use case is reached by each interface its own way, so a step it gains later lands in one interface and is missed by the others — the service layer pattern.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
function showOrder(request, orderQueries)
  return orderQueries.find(request.params.orderId)
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order.use-case
function createGetOrder({ orderQueries })
  return function(input, context)
    return orderQueries.find(input.orderId, context)

# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  let input = parseGetOrderInput(request.params)

  return ok(getOrder(input, context))
```

### use-case-leaves-decisions-to-the-domain-model · MUST

Every use case orchestrates and the domain model decides. Every branch on an aggregate's state or a business value is a call into the domain model — a transition, a domain service, a predicate or a derived value —, and a fact only a port can answer, as whether a name is taken or an answer of another feature, the use case gets from that port first and hands to the domain model as a value. Its own branches follow only the operation's flow — whether a port found what was asked of it, who acts, which port to call, what the domain model returned —: a check that reads only who acts is its own, while one that reads the aggregate or a business value with the actor, as only the owner may cancel, is a predicate of the domain model that takes the actor.

#### Why

A rule written in a use case, or decided there on a port's answer, is skipped by the next use case that changes the same aggregate and proven only through fakes, while the domain model holds the data and the rules live nowhere — a functional core in an imperative shell.

#### Examples

```pseudo title="Avoid"
# users/application/use-cases/commands/rename-user.use-case
import UserNotFoundError from "../../../errors"

function createRenameUser({ userRepository })
  return function(input, context)
    let user = userRepository.find(input.userId, context)

    if user is <absent> then
      throw new UserNotFoundError(input.userId)

    if userRepository.isNameTaken(input.name, context) then
      throw new NameTakenError(input.name)

    call userRepository.save(rename(user, input.name), context)
```

```pseudo title="Prefer"
# users/application/use-cases/commands/rename-user.use-case
import UserNotFoundError from "../../../errors"

function createRenameUser({ userRepository })
  return function(input, context)
    let user = userRepository.find(input.userId, context)

    if user is <absent> then
      throw new UserNotFoundError(input.userId)

    let isNameTaken = userRepository.isNameTaken(input.name, context)

    call userRepository.save(rename(user, input.name, isNameTaken), context)

# users/application/errors/user-not-found.error
type UserNotFoundError = { code: "user-not-found", userId: UserId }

# users/domain/user/transitions/user.transitions
function rename(user, name, isNameTaken)
  if isNameTaken then
    throw new NameTakenError(name)

  return { ...user, name }
```

### use-case-hands-its-deadline-to-every-port-call · MUST

Every use case hands its cancellation and the time it has left to every port call it makes. It hands them in its language's form — passed with each call, or a scope that encloses every call it awaits —, whether or not the port crosses a process boundary, which the port hides from it, so that a call that crosses one meets `call-takes-the-remaining-deadline` and `outside-call-can-be-cancelled`.

#### Why

A use case cannot see which port calls cross a boundary, so one handed neither its cancellation nor its deadline keeps working behind the adapter, holding its connection, for a caller who left — deadline propagation.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order.use-case
function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is <absent> then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(cancel(order))  # no cancellation, no time left
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order.use-case
function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is <absent> then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(cancel(order), context)
```

## Input and output

### use-case-takes-only-its-operation-input · MUST

Every use case takes only its operation input and the call context, and parses nothing itself. No unvalidated input reaches it.

#### Why

A use case that parses its own input, or takes it unparsed, runs on values the domain model never checked and fills its specs with malformed input — parse, don't validate.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order.use-case
function createCancelOrder({ orderRepository })
  return function(request, context)
    let orderId = OrderId.create(request.params.id)
    let order = orderRepository.find(orderId, context)

    if order is <absent> then
      throw new OrderNotFoundError(orderId)

    call orderRepository.save(cancel(order), context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order.use-case
function parseCancelOrderInput(unvalidated)
  return { orderId: OrderId.create(unvalidated.orderId) }

function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is <absent> then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(cancel(order), context)

# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder, context)
  let input = parseCancelOrderInput({ orderId: request.params.id })

  call cancelOrder(input, context)

  return ok()
```

### use-case-handed-the-call-context-by-its-caller · MUST

Every binding or delivery unit that calls a use case hands it the call context, in its language's form.

#### Why

A use case handed no call context cannot tell who acts, so it checks no right, and cannot hand its ports a deadline its caller set — deadline propagation.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder)
  let input = parseCancelOrderInput({ orderId: request.params.id })

  call cancelOrder(input)
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder)
  let input = parseCancelOrderInput({ orderId: request.params.id })
  let context = CallContext.of({
    actor: request.user,
    signal: request.signal,
    deadline: request.deadline,
  })

  call cancelOrder(input, context)
```

### operation-input-parsed-beside-its-use-case · SHOULD

The parse of every operation's unvalidated input into its operation input sits beside its use case and is offered with it.

#### Why

A parse kept away from its use case is not found where the operation is read, and is written again by the next binding unit that cannot find it — parse, don't validate.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function parseCancelOrderInput(unvalidated)
  return { orderId: OrderId.create(unvalidated.orderId) }

# orders/application/use-cases/commands/cancel-order.use-case
function createCancelOrder({ orderRepository })
  ...
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order.use-case
function parseCancelOrderInput(unvalidated)
  return { orderId: OrderId.create(unvalidated.orderId) }

function createCancelOrder({ orderRepository })
  ...

# orders/application/use-cases/<surface>
export { createCancelOrder, parseCancelOrderInput } from "./commands/cancel-order.use-case"
```

### binding-unit-reaches-its-use-case-through-the-parse · SHOULD

Every binding or delivery unit reaches its use case through the parse of the operation's unvalidated input. Exempt: the subscription of a reaction, whose input is its event.

#### Why

A parse written in each binding or delivery unit drifts from the others and fails each caller its own way — parse, don't validate.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder, context)
  if request.params.id is empty then
    return badRequest("missing id")

  call cancelOrder({ orderId: request.params.id as OrderId }, context)
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder, context)
  let input = parseCancelOrderInput({ orderId: request.params.id })

  call cancelOrder(input, context)
```

### use-case-signature-speaks-the-business · SHOULD

Every use case's signature speaks the business: it holds no type of a framework, a transport or a store.

#### Why

A framework's type in a signature ties every caller and every spec to it, so a change of framework, transport or store reaches every operation — the dependency rule.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order.use-case
type GetOrder = function(GetOrderInput, CallContext): OrderRow
  fails with HttpError
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order.use-case
type GetOrder = function(GetOrderInput, CallContext): Order
  fails with OrderNotFoundError
```

### read-model-only-where-no-aggregate-answers · SHOULD

Every query returns an aggregate, entity or value object as it is, and a read model only where none answers. That is where its caller needs data joined across aggregates, a total, or more aggregates than one bounded page.

#### Why

A read model that wraps one aggregate copies its data and leaves its predicates behind, so its caller decides again what the aggregate already answers — you aren't gonna need it.

#### Examples

```pseudo title="Avoid"
# orders/application/contracts/order-queries.port
type OrderDetails = {
  id: OrderId,
  status: OrderStatus,
  lines: List<OrderLine>,
}

type OrderQueriesPort = {
  find: function(OrderId, CallContext): OrderDetails | <absent>
}
```

```pseudo title="Prefer"
# orders/application/contracts/order-queries.port
type OrderQueriesPort = {
  find: function(OrderId, CallContext): Order | <absent>
}
```

### query-answer-known-in-parts-returned-as-a-sequence · SHOULD

Every query whose answer comes in parts returns it as a sequence its delivery unit presents as it arrives. The findings of a lint over many files and what an outside system yields as it runs, in a run that only reads, are such answers.

#### Why

An answer held back until it is whole keeps its user waiting for what is already known, as a language model's text or a solver's improving answers are.

#### Examples

```pseudo title="Avoid"
# catalogue/application/use-cases/queries/lint-product-pages.use-case
function createLintProductPages({ productPages })
  return function(input, context): List<Finding>
    let findings = []

    for page in call productPages.list(input.folder, context)
      findings.addAll(lintPage(page))

    return findings
```

```pseudo title="Prefer"
# catalogue/application/use-cases/queries/lint-product-pages.use-case
function createLintProductPages({ productPages })
  return function(input, context): Sequence<Finding>
    for page in call productPages.list(input.folder, context)
      for finding in lintPage(page)
        yield finding
```

### use-case-fails-with-three-kinds-of-failure · MUST

Every use case fails only with an expected failure of three kinds: the domain model's, when a rule of the business refused, a predicate that takes the actor among them; the application layer's, when the operation cannot proceed or its input is invalid; and one a port it calls declares. Any other failure passes as a defect.

#### Why

A failure of no named kind leaves its caller unable to tell a refusal from an operation that cannot proceed or from a fault of a system it called, so it answers each the same wrong way.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order.use-case
type CancelOrder = function(CancelOrderInput, CallContext)
  fails with SqlError, PaymentsNotFoundError
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order.use-case
import { OrderAlreadyShippedError } from "../../../domain/order/errors"
import { OrderNotFoundError } from "../../errors"
import { RefundRefusedError } from "../../contracts/payments.port"

type CancelOrder = function(CancelOrderInput, CallContext)
  fails with OrderAlreadyShippedError, OrderNotFoundError, RefundRefusedError
```

## Commands

### command-returns-nothing · SHOULD

Every command's use case returns nothing but its expected failure, in its language's form.

#### Why

A command that returns data is half a query, which cannot be run again apart from the change — command–query separation, in its strict form, which leaves no exception for what the command created.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ cartRepository, orderRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    if cart is <absent> then
      throw new CartNotFoundError(input.cartId)

    let order = place(input.orderId, cart)
    call orderRepository.save(order, context)

    return order  # half a query
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ cartRepository, orderRepository })
  return function(input, context)
    let cart = cartRepository.find(input.cartId, context)

    if cart is <absent> then
      throw new CartNotFoundError(input.cartId)

    call orderRepository.save(place(input.orderId, cart), context)
```

### command-takes-the-identifier-of-what-it-starts · MUST

Every command's use case that starts something takes the identifier of what it starts from its caller, who makes it. The caller passes one even where an outside system mints its own.

#### Why

An identifier the caller makes lets it retry the command safely and find what the command started even when the answer to the first attempt was lost — command–query separation, in its strict form.

#### Examples

```pseudo title="Avoid"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository, invoiceIds })
  return function(input, context)
    let invoiceId = invoiceIds.next()

    call invoiceRepository.save(Invoice.issue(invoiceId, input.orderId), context)
```

```pseudo title="Prefer"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository })
  return function(input, context)
    call invoiceRepository.save(Invoice.issue(input.invoiceId, input.orderId), context)

# invoices/presentation/bindings/commands/issue-invoice
let input = parseIssueInvoiceInput({ invoiceId: invoiceIds.next(), orderId: request.body.orderId })
call issueInvoice(input, context)
```

### repeated-start-changes-nothing · MUST

Every command's use case that starts something under an identifier taken with the same data changes nothing: it raises no failure and yields no event.

#### Why

A retried start that creates a second thing, or fails where the first attempt took effect, turns every lost answer into a duplicate or a false failure — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository })
  return function(input, context)
    if call invoiceRepository.find(input.invoiceId, context) is not <absent> then
      throw new InvoiceAlreadyExistsError({ invoiceId: input.invoiceId })

    call invoiceRepository.save(Invoice.issue(input.invoiceId, input.orderId), context)
```

```pseudo title="Prefer"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository })
  return function(input, context)
    let existing = call invoiceRepository.find(input.invoiceId, context)

    if existing is <absent> then
      call invoiceRepository.save(Invoice.issue(input.invoiceId, input.orderId), context)
      return

    if not Invoice.isIssuedFor(existing, input.orderId) then
      throw new InvoiceIdClashError({ invoiceId: input.invoiceId })
```

### start-with-other-data-fails-as-a-clash · MUST

Every command's use case that starts something under an identifier taken with other data fails as a clash and changes nothing.

#### Why

A start that overwrites what another caller stored under the same identifier destroys it, and one answered as done tells its caller that what it asked for exists when something else does — the idempotent receiver.

#### Examples

```pseudo title="Avoid"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository })
  return function(input, context)
    let existing = call invoiceRepository.find(input.invoiceId, context)

    if existing is not <absent> then
      return

    call invoiceRepository.save(Invoice.issue(input.invoiceId, input.orderId), context)
```

```pseudo title="Prefer"
# invoices/application/use-cases/commands/issue-invoice.use-case
function createIssueInvoice({ invoiceRepository })
  return function(input, context)
    let existing = call invoiceRepository.find(input.invoiceId, context)

    if existing is <absent> then
      call invoiceRepository.save(Invoice.issue(input.invoiceId, input.orderId), context)
      return

    if not Invoice.isIssuedFor(existing, input.orderId) then
      throw new InvoiceIdClashError({ invoiceId: input.invoiceId })
```

### command-reports-through-a-reporter-port · SHOULD

Every command's use case reports its progress and what it did to its user through the progress reporter. One no user called, as a reaction, reports to its operator the same way; a fix's count of the files it fixed and what an outside system yields in a run that acts are such reports.

#### Why

A command returns nothing, so a report it prints or keeps to itself, as a language model's text in a run whose tools write, either decides for every interface how it is shown or never reaches its user — command–query separation.

#### Examples

```pseudo title="Avoid"
# catalogue/application/use-cases/commands/fix-product-pages.use-case
function createFixProductPages({ productPages })
  return function(input, context)
    let fixed = call productPages.fixAll(input.folder, context)

    print("Fixed " + fixed.count + " pages")
```

```pseudo title="Prefer"
# catalogue/application/use-cases/commands/fix-product-pages.use-case
function createFixProductPages({ productPages, progressReporter })
  return function(input, context)
    let fixed = call productPages.fixAll(input.folder, context)

    call progressReporter.report(context, FixedPages({ count: fixed.count }))
```

### command-report-addressed-by-its-caller · MUST

Every report a command makes through the progress reporter is addressed by the identifier its caller made or by the call context.

#### Why

A report addressed to no one reaches whoever listens, so the reports of two commands running at once mix, and each user sees the other's.

#### Examples

```pseudo title="Avoid"
# catalogue/application/use-cases/commands/import-products.use-case
for batch in batches(input.products)
  call productRepository.addAll(batch, context)
  call progressReporter.report(ImportedBatch({ count: batch.size }))
```

```pseudo title="Prefer"
# catalogue/application/use-cases/commands/import-products.use-case
for batch in batches(input.products)
  call productRepository.addAll(batch, context)
  call progressReporter.report(input.importId, ImportedBatch({ count: batch.size }))
```

## Reads and writes

### read-model-named-by-its-operation · SHOULD

Every read model is named for the operation that returns it, never for a screen.

#### Why

A read model named for a screen changes with that screen and is copied for the next.

#### Examples

```pseudo title="Avoid"
# orders/application/contracts/order-queries.port
type OrdersTableRow = {
  id: OrderId,
  placedAt: Instant,
  total: Money,
  customerName: PersonName,
}

type OrderQueriesPort = {
  list: function(UserId, Page, CallContext): List<OrdersTableRow>
}
```

```pseudo title="Prefer"
# orders/application/contracts/order-queries.port
type ListedOrder = {
  id: OrderId,
  placedAt: Instant,
  total: Money,
  customerName: PersonName,
}

type OrderQueriesPort = {
  list: function(UserId, Page, CallContext): List<ListedOrder>
}
```

### query-and-command-apart · MUST

Each side, read or write, imports only its own code, never the other's. A query's use case takes from `contracts/` the ports its side reads through and none through which the write side changes data, and a command's use case the ports it changes its feature's data through and none of the read side's; a surface that offers both sides belongs to neither, and a caller takes from it only its own side. Exempt: a port a command declares for its port callbacks to read through, and a composition command's queries of the features, as `composition-keeps-to-its-side` gives.

#### Why

A side that imports the other changes whenever it does, a query that reaches a port of the write side can change data, and a command that reads through a port of the read side decides on data that may lag — command–query responsibility segregation.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/cancel-order.use-case
import getOrder from "../queries"

function createCancelOrder({ orderRepository })
  return function(input, context)
    let order = getOrder({ orderId: input.orderId }, context)

    call orderRepository.save(cancel(order), context)
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/cancel-order.use-case
import OrderRepositoryPort from "../../contracts"

function createCancelOrder({ orderRepository: OrderRepositoryPort })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)

    if order is <absent> then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(cancel(order), context)
```

### query-takes-no-port-that-changes-anything · MUST

Every query takes only ports that change nothing, never one that changes anything. A mailer, the event port, the progress reporter and a port that writes files each change something, while a port of neither side that changes nothing, as a clock or the fault reporter, either side may take.

#### Why

A query that reaches a port that changes something can change what it only meant to read, and is no longer safe to run twice — command–query separation.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/queries/find-order.use-case
function createFindOrder({ orderQueries, auditLog })
  return function(input, context)
    call auditLog.append(OrderViewed({ orderId: input.orderId }), context)
    return call orderQueries.find(input.orderId, context)
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/find-order.use-case
function createFindOrder({ orderQueries })
  return function(input, context)
    return call orderQueries.find(input.orderId, context)
```
