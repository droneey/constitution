# Sinks

> Governs who sends an analytics event and the sinks it is sent through.

## General

### event-sent-only-by-binding-units → code-placed-by-its-reason-to-change · MUST

Only a binding unit sends an analytics event, translating what the user did and what its operation returned into events. No unit of a feature's domain, application or infrastructure sends one, nor a delivery unit that is no binding unit. Exempt: an event of the interface that no operation serves, such as a page view or a panel opened, which a unit of the program's presentation sends through the analytics port from the navigation or the interaction its framework reports.

#### Why

A feature that tracks must know the product's whole vocabulary of events, a concern of the product rather than of any feature, and changes whenever that vocabulary does; a unit that renders and sends as well must be handed the port the events go through, and can no longer be shown or tested with plain data.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ orderRepository, analytics })
  return function(input, context)
    let order = createOrder(input.lines)

    call orderRepository.save(order, [], context)
    call analytics.send(orderPlaced({ order_id: order.id }))

    return order.id
```

```pseudo title="Prefer"
# orders/application/use-cases/commands/place-order.use-case
function createPlaceOrder({ orderRepository })
  return function(input, context)
    let order = createOrder(input.lines)

    call orderRepository.save(order, [], context)

    return order.id

# orders/presentation/bindings/commands/place-order
function onPlaceOrder(request, { placeOrder, analytics }, context)
  let orderId = placeOrder(parsePlaceOrderInput(request.body), context)

  call analytics.send(orderPlaced({ order_id: orderId }))

  return created(orderId)
```

### sinks-behind-one-port → new-kind-added-as-a-member · SHOULD

Every analytics service is a sink behind the one analytics port, each sink an adapter of it.

#### Why

A service wired into the code that sends is added or removed by edits across it, and each such edit can break the services already there — the open–closed principle.

#### Examples

```pseudo title="Avoid"
# orders/presentation/bindings/commands/place-order
function onPlaceOrder(request, { placeOrder, webAnalytics, warehouse }, context)
  let orderId = placeOrder(parsePlaceOrderInput(request.body), context)

  call webAnalytics.capture(orderPlaced({ order_id: orderId }))
  call warehouse.insertEvent(orderPlaced({ order_id: orderId }))

  return created(orderId)
```

```pseudo title="Prefer"
# orders/presentation/bindings/commands/place-order
function onPlaceOrder(request, { placeOrder, analytics }, context)
  let orderId = placeOrder(parsePlaceOrderInput(request.body), context)

  call analytics.send(orderPlaced({ order_id: orderId }))

  return created(orderId)

# root/analytics
let analytics = createFanOut([
  createWebAnalyticsSink(config.webAnalytics),
  createWarehouseSink(config.warehouse)
], reportFault)
```
