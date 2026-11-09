# Access

> Governs what a caller may do and see.

## Decisions

### access-denied-unless-granted · MUST

Every access no rule grants is denied.

#### Why

Access open by default is open wherever someone forgot a rule — fail-safe defaults.

#### Examples

```pseudo title="Avoid"
let denied = {
  Viewer: [RefundOrder, CancelOrder]
}

function mayPerform(actor, action)
  return not (denied[actor.role] or []).includes(action)   # a new role or action is allowed
```

```pseudo title="Prefer"
let granted = {
  Viewer: [ViewOrder],
  Clerk: [ViewOrder, RefundOrder, CancelOrder]
}

function mayPerform(actor, action)
  return (granted[actor.role] or []).includes(action)
```

### operation-access-checked-on-every-call · MUST

Every operation checks its caller's rights itself, on every call, whichever way the call arrives. Hiding an operation from a caller who lacks the right never stands in for the check.

#### Why

A caller who finds the address of an operation the interface hides calls it directly, and a check left to one way in is skipped by every other — complete mediation.

#### Examples

```pseudo title="Avoid"
# orders/presentation/components/order-actions
if mayPerform(actor, RefundOrder) then
  show RefundButton

# orders/application/use-cases/commands/refund-order.use-case
function createRefundOrder({ orderRepository })
  return function(input, context)
    let order = orderRepository.find(input.orderId, context)   # any caller who finds the route refunds

    if order is <absent> then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(refund(order), context)
```

```pseudo title="Prefer"
# orders/presentation/components/order-actions
if mayPerform(actor, RefundOrder) then
  show RefundButton

# orders/application/use-cases/commands/refund-order.use-case
function createRefundOrder({ orderRepository, accessPolicy })
  return function(input, context)
    accessPolicy.require(context.actor, RefundOrder)

    let order = orderRepository.find(input.orderId, context)

    if order is <absent> then
      throw new OrderNotFoundError(input.orderId)

    call orderRepository.save(refund(order), context)
```

### way-in-adds-no-rights-check · SHOULD

No way into an operation adds a rights check of its own beside the operation's.

#### Why

A check a way in adds beside the operation's is a second copy of the rule, which drifts from it, and reads as the one check to whoever reviews that way in.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/refund-order
function onRefundOrder(request, refundOrder, context)
  if context.actor.role is not Clerk then   # a second copy of the use case's rule
    return forbidden()

  call refundOrder(parseRefundOrderInput(request.params), context)

  return ok()
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/refund-order
function onRefundOrder(request, refundOrder, context)
  call refundOrder(parseRefundOrderInput(request.params), context)

  return ok()

# orders/application/use-cases/commands/refund-order.use-case
function createRefundOrder({ orderRepository, accessPolicy })
  return function(input, context)
    accessPolicy.require(context.actor, RefundOrder)
    ...
```

## Objects and tenants

### object-access-checked-against-the-caller · MUST

Every access to an object a request names by its identifier is checked against the caller on every request. Such an object is an order or a patient's record, for one, and being signed in grants no object.

#### Why

A caller who changes the identifier in a request otherwise reads or changes someone else's object — the OWASP API Security Top 10.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order.use-case
function createGetOrder({ orderQueries })
  return function(input, context)
    let order = orderQueries.find(input.orderId, context)

    if order is <absent> then   # any signed-in customer reads any order
      throw new OrderNotFoundError(input.orderId)

    return order
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order.use-case
function createGetOrder({ orderQueries })
  return function(input, context)
    let order = orderQueries.find(input.orderId, context)

    if order is <absent> or order.customerId is not context.actor.customerId then
      throw new OrderNotFoundError(input.orderId)

    return order
```

### hidden-object-answered-as-not-found · MUST

Every object its caller may not see is answered exactly as an object that does not exist. A refusal of access answers only an operation the caller may not perform on an object it may see, or one that names no object. Exempt: a program that declares it refuses alike every identifier its caller has no right to, checking the right before the lookup.

#### Why

A refusal given only to objects that exist confirms that the object exists, and either answer given alike to all hides it.

#### Examples

```pseudo title="Avoid"
# invoices/application/use-cases/queries/get-invoice.use-case
function createGetInvoice({ invoiceQueries })
  return function(input, context)
    let invoice = invoiceQueries.find(input.invoiceId, context)

    if invoice is <absent> then
      throw new InvoiceNotFoundError(input.invoiceId)

    if invoice.accountId is not context.actor.accountId then
      throw new AccessDeniedError(input.invoiceId)   # confirms the invoice exists

    return invoice
```

```pseudo title="Prefer"
# invoices/application/use-cases/queries/get-invoice.use-case
function createGetInvoice({ invoiceQueries })
  return function(input, context)
    let invoice = invoiceQueries.find(input.invoiceId, context)

    if invoice is <absent> or invoice.accountId is not context.actor.accountId then
      throw new InvoiceNotFoundError(input.invoiceId)

    return invoice
```

### tenant-data-scoped-to-the-callers-tenant · MUST

Where the program serves several tenants, every read and every write of a tenant's data is scoped to the caller's tenant. The scope is set where the read or the write is made, so none reaches another tenant's data.

#### Why

One read that forgets the scope shows one customer's data to another.

#### Examples

```pseudo title="Avoid"
# invoices/infrastructure/database/invoice-queries.adapter
function listOverdue(today, context)
  return database.invoices.where(invoice ->
    invoice.dueAt < today)   # every tenant's invoices
```

```pseudo title="Prefer"
# invoices/infrastructure/database/invoice-queries.adapter
function listOverdue(today, context)
  return database.invoices.where(invoice ->
    invoice.tenantId is context.actor.tenantId
    and invoice.dueAt < today)
```

### answer-fields-filtered-by-the-callers-rights · MUST

Every answer carries only the fields of an object its caller may see.

#### Why

A caller allowed to see an object is not allowed every field of it, and one field too many leaks what the object hides.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order.use-case
function toOrderView(order, actor)
  return {
    id: order.id,
    lines: order.lines,
    total: order.total,
    costPrice: order.costPrice   # reaches every customer
  }
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order.use-case
function toOrderView(order, actor)
  let view = { id: order.id, lines: order.lines, total: order.total }

  if mayPerform(actor, ViewMargins) then
    return { ...view, costPrice: order.costPrice }

  return view
```

### written-fields-limited-by-the-callers-rights · MUST

Every write changes only the fields of an object its caller may change.

#### Why

A caller allowed to change an object is not allowed every field of it, and one field too many lets it raise its own rights or change what others own.

#### Examples

```pseudo title="Avoid"
# accounts/domain/account/transitions/account.transitions
type ProfileChanges = {
  displayName?: DisplayName,
  locale?: Locale,
  role?: Role,   # the person raises their own role
  plan?: Plan
}

function changeProfile(account, changes: ProfileChanges)
  return { ...account, ...changes }
```

```pseudo title="Prefer"
# accounts/domain/account/transitions/account.transitions
type ProfileChanges = {
  displayName?: DisplayName,
  locale?: Locale
}

function changeProfile(account, changes: ProfileChanges)
  return { ...account, ...changes }
```

## Caches

### caller-shaped-result-never-served-from-a-cache-to-another · MUST

No result shaped by its caller is ever served from a cache to another caller. That holds for a result its caller's rights or tenant decide, which the cache keeps for that caller alone or keys by all that shaped it.

#### Why

A result drawn from one caller's rights and served from a cache to the next hands over what the second could never read, with no check of access ever run.

#### Examples

```pseudo title="Avoid"
# reports/application/use-cases/queries/get-sales-summary.use-case
function createGetSalesSummary({ salesQueries, cache })
  return function(input, context)
    return cache.getOrLoad(["sales-summary", input.month], () ->
      salesQueries.summarize(input.month, context))   # the first caller's tenant and rights, for all
```

```pseudo title="Prefer"
# reports/application/use-cases/queries/get-sales-summary.use-case
function createGetSalesSummary({ salesQueries, cache })
  return function(input, context)
    let actor = context.actor
    let key = ["sales-summary", actor.tenantId, actor.role, input.month]

    return cache.getOrLoad(key, () ->
      salesQueries.summarize(input.month, context))
```

## Proof

### operation-access-proven-by-a-case → declared-failure-has-a-case · MUST

Every operation an outside caller reaches has a case that calls it as a caller its access refuses. Such an operation is a route, an endpoint, a subcommand or a tool. Exempt: an operation open to every caller, declared so where the operation is defined.

#### Why

An operation that forgot its rule reads like every other in review, and without a case that calls it as a refused caller it ships open.

#### Examples

```pseudo title="Avoid"
suite "POST /orders/:id/refund"
  test "should refund a paid order"
  test "should fail when the order has shipped"
```

```pseudo title="Prefer"
suite "POST /orders/:id/refund"
  test "should refund a paid order"
  test "should fail when the order has shipped"
  test "should refuse when the caller is a customer"
  test "should refuse when the caller is not signed in"
```
