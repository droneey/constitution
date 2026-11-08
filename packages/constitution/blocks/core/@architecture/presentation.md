# Presentation

> Governs the presentation: the units through which the program is called, what they call and what they decide.

## Vocabulary

A program's **calling framework** is whatever calls into it from outside: a framework in the usual sense, its runtime, or a standard facility such as a process's main function or a scheduler. The presentation is all through which the program is called, the driving side of ports and adapters, whose delivery and binding units are its driving adapters. The presentation holds every interface the program has, as foundation's errors chapter defines one, a schedule among them.

A **delivery unit**{#delivery-unit} is a unit its calling framework calls when something beyond the program calls it: a screen, a subcommand, a request handler, a consumer of the messages another program sends, a subscription, an operation offered to other programs as a tool they call, as another program's language model or a workflow engine does, a scheduled job, a taker of the jobs a queue holds for the program. A function the program hands an outside system to call during a call it makes is no delivery unit but a port callback, as the ports chapter defines it, and a unit that hands the program's own domain events to its reactions is no delivery unit but an edge worker, as that chapter defines it too.

A **binding unit**{#binding-unit} binds one operation to the program's calling framework: it reads what that framework hands it, calls the operation's use case, and hands the framework what the use case returned or the failure it raised.

An **interface-wide unit** binds a decision made for every operation of an interface, as the handler of last resort, an error filter or a guard that authenticates the caller does; it serves no operation and no side. A delivery unit that serves one operation is its binding unit.

The **program's presentation**{#program-presentation}, at the top of the source, holds the interface-wide units, and the delivery units and the units that render that span several features or composition modules.

## Homes

### delivery-unit-beside-what-it-serves · SHOULD

Every delivery unit lives in the presentation of the feature or the composition module whose operations it serves. It lives in the program's presentation when it spans several or its interface's block names it a page of the program.

#### Why

A delivery unit kept away from the operations it serves is changed in a second place whenever they change — the common closure principle.

#### Examples

```text title="Avoid"
src/
├── features/orders/
└── presentation/
    └── bindings/commands/
        └── cancel-order
```

```text title="Prefer"
src/
├── features/orders/presentation/
│   └── bindings/commands/
│       └── cancel-order
├── composition/checkout/presentation/
│   └── bindings/commands/
│       └── check-out
└── presentation/
    └── screens/
        └── order
```

## What it calls

### presentation-reaches-only-what-it-serves · SHOULD

Every presentation calls and renders only what it serves: a feature's, the operations and units its own feature offers; a composition module's, the operations it offers and the units of the features it composes; the program's, what the surfaces of features and composition modules offer.

#### Why

A presentation that calls or renders past what it serves is tied to features it does not serve, and changes whenever they do.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/queries/show-order
function showOrder(request, { getOrder, getInvoice }, context)
  let order = getOrder(parseGetOrderInput(request.params), context)
  let invoice = getInvoice(parseGetInvoiceInput({ orderId: order.id }), context)

  return ok({ order, invoice })
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order
function showOrder(request, { getOrder }, context)
  return ok(getOrder(parseGetOrderInput(request.params), context))

# presentation/screens/order
function showOrderPage(request, { getOrder, getInvoice }, context)
  let order = getOrder(parseGetOrderInput(request.params), context)
  let invoice = getInvoice(parseGetInvoiceInput({ orderId: order.id }), context)

  return page({ order, invoice })
```

### binding-unit-calls-only-use-cases · MUST

Every binding unit reaches its operation only through the operation's use case, never through a port of its feature. A delivery unit that serves several operations reaches each through its binding unit, or binds it itself as that binding unit would, through the operation's use case.

#### Why

A binding unit that calls a port skips the use case with its rules and steps, and ties the interface to the store or service the root chose — ports and adapters.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, orders: OrderRepositoryPort)
  let order = orders.find(request.params.orderId)

  orders.save(cancel(order))

  return ok()
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/cancel-order
function onCancel(request, cancelOrder, context)
  let input = parseCancelOrderInput(request.params)

  # Why: the error filter answers an OrderNotFoundError for every command
  call cancelOrder(input, context)

  return ok()
```

## What it decides

### delivery-unit-stays-thin · SHOULD

Every delivery unit stays thin and decides no rule of the business. It reads its input off what its calling framework hands it, calls the operations whose results it presents, and presents what they return or what reaches it through the progress reporter.

#### Why

A rule of the business decided in a delivery unit can be neither reused by another transport nor tested without it — Humble Object.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlace(request, { placeOrder, orderIds }, context)
  let input = parsePlaceOrderInput(
    { orderId: orderIds.next(), ...request.body })

  if input.total > 100
    input.discount = 10

  placeOrder(input, context)

  return created(input.orderId)
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
function onPlace(request, { placeOrder, orderIds }, context)
  let input = parsePlaceOrderInput(
    { orderId: orderIds.next(), ...request.body })

  # Why: the error filter answers a refused input or order for every command
  call placeOrder(input, context)

  return created(input.orderId)
```

### missing-refused-or-failed-answered-in-the-presentation · SHOULD

Everything the program answers when something is missing, refused or failed is decided in the presentation. No unit of another layer decides it: the deciding unit is the operation's binding unit, the delivery unit that renders its answer, or an interface-wide unit; such answers are a not-found answer, a redirect, what a refusal shows its user, a failure's message with its exit code or its response, and the answer of the handler of last resort.

#### Why

Such an answer decided elsewhere ties the business to one interface's way of answering, or sits in the root or a registration, where no case proves it — Humble Object.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order.use-case
function createGetOrder({ orderQueries })
  return function(input, context)
    let order = orderQueries.find(input.orderId, context)

    if order is <absent> then
      return notFound()

    return order
```

```pseudo title="Prefer"
# orders/application/use-cases/queries/get-order.use-case
function createGetOrder({ orderQueries })
  return function(input, context)
    let order = orderQueries.find(input.orderId, context)

    if order is <absent> then
      throw new OrderNotFoundError(input.orderId)

    return order

# orders/presentation/bindings/queries/show-order
function showOrder(request, getOrder, context)
  try
    return ok(getOrder(parseGetOrderInput(request.params), context))
  catch OrderNotFoundError
    return notFound()
```
